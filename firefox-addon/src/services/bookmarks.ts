import {
  BOOKMARK_TYPE,
  MAX_BOOKMARK_COUNT,
  ROOT_BOOKMARK_ID,
} from "../constants"
import { log } from "../logger"
import { Command } from "../models/command"
import { Port } from "../models/port"
import { Response } from "../models/response"
import { delay, isDefined } from "../utils"
import md5 from "md5"
import { bookmarks, Bookmarks } from "webextension-polyfill"

const inMemoryBookmarkMap = new Map<
  string,
  Bookmarks.BookmarkTreeNode
>()

export function getBookmarks(port: Port, { args }: Command) {
  const startTime = Date.now()
  if (!args) {
    log("missing args in get-bookmarks")
    return port.postMessage(Response.end())
  }

  const receivedParams = args.split(":")

  if (receivedParams.length < 2) {
    log(
      `invalid args in get-bookmarks: received ${args}, expected a string combining two integers like "0:0"`
    )
    return port.postMessage(Response.end())
  }

  const maxInput = parseInt(receivedParams[0])
  const chunkSizeInput = parseInt(receivedParams[1])
  const receivedHashMD5 = receivedParams[2] ?? ""

  bookmarks
    .getRecent(maxInput ? maxInput : MAX_BOOKMARK_COUNT)
    .then(async (bookmarks) => {

      const chunkSize = chunkSizeInput ? chunkSizeInput : MAX_BOOKMARK_COUNT
      const chunks = []

      // chunk bookmarks
      for (let i = 0; i < bookmarks.length; i += chunkSize) {
        const chunk = bookmarks.slice(i, i + chunkSize)
        chunks.push(chunk)
      }

      const bookmarksProcessedChunks = []
      // no parallelism, maintain order of bookmarks
      for (const chunk of chunks) {
        const bms = await processChunk(chunk)
        if (receivedHashMD5) {
          bookmarksProcessedChunks.push(bms)
        } else {
          port.postMessage(Response.data(bms))
        }
      }

      if (receivedHashMD5) {
        // if the received hash is valid, return a simple string "bookmarks_synchronized"
          log(md5(JSON.stringify(bookmarksProcessedChunks.flat())))
          log("hash received", receivedHashMD5)
        if (receivedHashMD5 === md5(JSON.stringify(bookmarksProcessedChunks.flat()))) {
          port.postMessage(Response.data("bookmarks_synchronized"))
          await delay(10)
          const endTime = Date.now()
          log(`sending back bookmarks_synchronized in ${endTime - startTime} ms`)
          return port.postMessage(Response.end())
        } else {
          for (const bms of bookmarksProcessedChunks) {
            // we add a delay to ensure same behaviour as before
            // TODO : check if we can remove this delay
            await delay(1)
            port.postMessage(Response.data(bms))
          }
        }
      }

      const endTime = Date.now()
      log(`sending back bookmarks in ${endTime - startTime} ms`)
      // pause 100ms, or this end message may be received before the last chunk
      await delay(100)
      return port.postMessage(Response.end())
    })
}

async function processChunk(items: Bookmarks.BookmarkTreeNode[]) {
  const bms = []
  for (const p of await getBmParentTitles(
    items.filter((item) => isDefined(item.url) && item.type === BOOKMARK_TYPE)
  )) {
    bms.push({
      id: p.id,
      title: p.title,
      url: p.url,
      parent: p.parentPath,
    })
  }
  return bms
}

class BookmarksGroup {
  ok: boolean = false
  bookmarks: Bookmarks.BookmarkTreeNode[] = []
  parentPath: string[] = []
  constructor(bm: Bookmarks.BookmarkTreeNode) {
    this.bookmarks.push(bm)
  }
  addNew(bm: Bookmarks.BookmarkTreeNode) {
    this.bookmarks.push(bm)
  }
  setOk() {
    this.ok = true
    return this
  }
  addParent(title: string) {
    this.parentPath = [title, ...this.parentPath]
  }
}

type CompletedBookmarks = (Bookmarks.BookmarkTreeNode & {
  parentPath: string
})[]
async function getBmParentTitles(bms: Bookmarks.BookmarkTreeNode[]) {
  const bookmarkItems: CompletedBookmarks = []

  // 1. first divide betweem complete and uncomplete bookmarks
  // complete means the bookmark has no folder,
  const reducer = (
    result: {
      complete: CompletedBookmarks
      uncomplete: Bookmarks.BookmarkTreeNode[]
    },
    current: Bookmarks.BookmarkTreeNode
  ) => {
    if (current.parentId !== ROOT_BOOKMARK_ID) {
      result.uncomplete.push(current)
    } else {
      /*
       * a complete bookmark has no folder,
       * it's in the bookmark toolbar :
       * we place it at the root path '/'
       */
      result.complete.push({ ...current, parentPath: "/" })
    }
    return result
  }

  const { complete, uncomplete } = bms.reduce(reducer, {
    complete: [],
    uncomplete: [],
  })

  // 2. for uncomplete bookmarks : group them together if they share the same parent bookmark
  let parentIdsMap: Map<string, BookmarksGroup> = uncomplete.reduce(
    (bms, bm) => {
      if (bm.parentId) {
        const b = bms.get(bm.parentId)
        if (b) {
          b.addNew(bm)
        } else {
          bms.set(bm.parentId, new BookmarksGroup(bm))
        }
      }
      return bms
    },
    new Map<string, BookmarksGroup>()
  )

  // 3. for each group, find the parent-path, using a in-memory Bookmark Map
  for (const [key, v] of parentIdsMap) {
    let parentId = key
    while (!v.ok) {
      let parent: Bookmarks.BookmarkTreeNode | undefined =
        inMemoryBookmarkMap.get(parentId)
      if (!parent) {
        const parents = await bookmarks.get(parentId)
        parent = parents[0]
        inMemoryBookmarkMap.set(parent.id, parent)
      }
      if (
        parent &&
        (parent.parentId === undefined || parent.parentId === ROOT_BOOKMARK_ID)
        // || parent.title === ""
      ) {
        v.setOk().addParent(parent.title)
      } else {
        v.addParent(parent.title)
        // todo warning !
        parentId = parent.parentId!
      }
    }
    for (const bookmark of v.bookmarks) {
      bookmarkItems.push({ ...bookmark, parentPath: `/${v.parentPath.join("/")}/` })
    }
    parentIdsMap.delete(key)
  }

  // 4. add already complete bookmarks
  bookmarkItems.push(...complete)

  // 5. ensure all bookmarks are sorted with first lastAdded
  const sortPredicate = (a: number, b: number) => (a > b ? -1 : 1)
  bookmarkItems.sort((a, b) => sortPredicate(a.dateAdded || 0, b.dateAdded || 0))

  return bookmarkItems
}
