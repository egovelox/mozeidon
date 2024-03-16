import { BOOKMARK_TYPE, MAX_BOOKMARK_COUNT, ROOT_BOOKMARK_ID } from "../constants";
import { log } from "../logger";
import { Command } from "../models/command"
import { Port } from "src/models/port"
import { Response } from "../models/response";

const inMemoryBookmarkMap = new Map<string, browser.bookmarks.BookmarkTreeNode>


export function getBookmarks(port: Port, { command: _cmd }: Command) {

  browser.bookmarks.getRecent(MAX_BOOKMARK_COUNT)
  .then(async (bookmarks) => {
    const startTime = Date.now()
    const chunkSize = 3000;
    const chunks = [];

    // chunk bookmarks
    for (let i = 0; i < bookmarks.length; i += chunkSize) {
      const chunk = bookmarks.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    // no parallelism, maintain order of bookmarks
    for (const chunk of chunks) {
      const bms = await processChunk(chunk)
      port.postMessage(Response.data(bms))
      //await new Promise(res => setTimeout(res, 100))
    }

    const endTime = Date.now()
    log(`sending back bookmarks in ${endTime - startTime} ms`)
    // pause 100ms, or this end message may be received before the last chunk
    await new Promise(res => setTimeout(res, 100))
    port.postMessage(Response.end());
  })
}


export async function processChunk(items: browser.bookmarks.BookmarkTreeNode[]) {
  const bms  = []
  for (const p of (
    await getBmParentTitles(
      items.filter(item => item.url && item.type === BOOKMARK_TYPE)
    )
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
  bookmarks: browser.bookmarks.BookmarkTreeNode[] = []
  parentPath: string[] = []
  constructor(bm: browser.bookmarks.BookmarkTreeNode) {
    this.bookmarks.push(bm)
  }
  addNew(bm: browser.bookmarks.BookmarkTreeNode) {
    this.bookmarks.push(bm)
  }
  setOk() {
    this.ok = true
    return this
  }
  addParent(title: string) {
    this.parentPath.push(title)
  }
}


type CompletedBookmarks = (browser.bookmarks.BookmarkTreeNode & { parentPath: string })[]
async function getBmParentTitles(bms: browser.bookmarks.BookmarkTreeNode[]) {
  const bookmarks: CompletedBookmarks = []

  // 1. first divide betweem complete and uncomplete bookmarks
  // complete means the bookmark has no folder, 
  const reducer = (
    result: { complete: CompletedBookmarks, uncomplete: browser.bookmarks.BookmarkTreeNode[]}, 
    current: browser.bookmarks.BookmarkTreeNode
  ) => {
    if (current.parentId !== ROOT_BOOKMARK_ID) {
      result.uncomplete.push(current)
    } else {
      result.complete.push({ ...current, parentPath: "" })
    }
    return result
  }

  const { complete, uncomplete } = 
    bms.reduce(reducer, { complete: [], uncomplete: [] });

  // 2. for uncomplete bookmarks : group them together if they share the same parent bookmark
  let parentIdsMap: Map<string,BookmarksGroup> = uncomplete.reduce((bms, bm) => { 
    if (bm.parentId) { 
      const b = bms.get(bm.parentId)
      if (b) {
        b.addNew(bm)
      } else {
        bms.set(bm.parentId, new BookmarksGroup(bm))
      }
    }
    return bms
  }, new Map<string,BookmarksGroup>())


  // 3. for each group, find the parent-path, using a in-memory Bookmark Map
  for (const [ key, v ] of parentIdsMap) {
    let parentId = key
    while(!v.ok) {
      let parent: browser.bookmarks.BookmarkTreeNode | undefined = inMemoryBookmarkMap.get(parentId);
      if (!parent) {
        const parents = await browser.bookmarks.get(parentId)
        parent = parents[0]
        inMemoryBookmarkMap.set(parent.id, parent)
      }
      if(
        parent && 
        (
          parent.parentId === undefined || 
          parent.parentId === ROOT_BOOKMARK_ID || 
          parent.title === ""
        )
      ) {
        v.setOk().addParent(parent.title)
      } else {
        v.addParent(parent.title)
        // todo warning !
        parentId = parent.parentId!
      }

    }
    for (const bookmark of v.bookmarks) {
      bookmarks.push({...bookmark, parentPath: v.parentPath.filter(path => path).join("/")})
    }
    parentIdsMap.delete(key)
  }

  // 4. add already complete bookmarks
  bookmarks.push(...complete)

  // 5. ensure all bookmarks are sorted with first lastAdded
  const sortPredicate = (a: number, b: number) => a > b ? -1 : 1
  bookmarks.sort((a,b) => sortPredicate(a.dateAdded || 0 , b.dateAdded || 0 ))

  return bookmarks
}
