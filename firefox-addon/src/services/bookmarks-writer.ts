import * as v from "valibot"
import { log } from "../logger"
import { ROOT_BOOKMARK_ID } from "../constants"
import { delay, isDefined } from "../utils"
import { Response } from "../models/response"
import { Command } from "../models/command"
import { Port } from "../models/port"
import {
  WriteBookmarkRequestSchema,
  WriteBookmarkRequestType,
  ValidatedBookmarkCreateRequest,
  ValidatedBookmarkDeleteRequest,
  ValidatedBookmarkUpdateRequest,
} from "../models/write-bookmark"

export async function writeBookmark(port: Port, { args }: Command) {
  const startTime = Date.now()
  try {
    const validatedInput = validateBookmarkWriteRequest(args)
    if (!validatedInput) {
      return port.postMessage(Response.end())
    }
    switch (validatedInput.type) {
      case WriteBookmarkRequestType.Delete:
        await deleteBookmark(validatedInput)
        break
      case WriteBookmarkRequestType.Create:
        await createBookmark(validatedInput)
        break
      case WriteBookmarkRequestType.Update:
        await updateBookmark(validatedInput)
        break
    }
    const endTime = Date.now()
    log(`ending writeBookmark in ${endTime - startTime} ms`)
    port.postMessage(Response.end())
  } catch (e) {
    const endTime = Date.now()
    log(`error in writeBookmark in ${endTime - startTime} ms`, e)
    port.postMessage(Response.data(`[Error] ${e.message ?? e.toString()}`))
    // pause 10ms, or this end message may be received before the message above
    await delay(10)
    port.postMessage(Response.end())
  }
}

function validateBookmarkWriteRequest(
  input?: string
):
  | ValidatedBookmarkCreateRequest
  | ValidatedBookmarkUpdateRequest
  | ValidatedBookmarkDeleteRequest
  | undefined {
  if (!input) {
    log("missing args in write-bookmark")
    return
  }
  try {
    const fromJson = JSON.parse(input)
    const { bookmark, newBookmark } = v.parse(
      WriteBookmarkRequestSchema,
      fromJson
    )

    if (bookmark && newBookmark) {
      log(
        "invalid args in write-bookmark: bookmark and newBookmark cannot be both defined"
      )
      throw new Error("bookmark and newBookmark cannot be both defined")
    }

    /* handle delete or update for an existing bookmark */
    if (bookmark) {
      const { url, title, folderPath } = bookmark
      if (!isDefined(url) && !isDefined(title) && !isDefined(folderPath)) {
        log("received args in write-bookmark: delete", bookmark)
        return {
          type: WriteBookmarkRequestType.Delete,
          id: bookmark.id,
        }
      }
      log("received args in write-bookmark: update", bookmark)
      return {
        type: WriteBookmarkRequestType.Update,
        ...bookmark,
      }
    }

    /* handle create for an new bookmark */
    if (newBookmark) {
      log("received args in write-bookmark: create", newBookmark)
      return {
        type: WriteBookmarkRequestType.Create,
        folderPath: newBookmark.folderPath,
        url: newBookmark.url,
        title: newBookmark.title,
      }
    }

    log(
      "invalid args in write-bookmark: bookmark or newBookmark must be defined"
    )
    throw new Error("bookmark and newBookmark cannot be both undefined")
  } catch (e) {
    log(
      "invalid args in write-bookmark: cannot parse or validate JSON",
      e.toString()
    )
    throw e
  }
}

async function deleteBookmark(params: ValidatedBookmarkDeleteRequest) {
  const [bookmark] = await browser.bookmarks.get(params.id)
  await browser.bookmarks.remove(params.id)
  await deleteEmptyFolders(bookmark.parentId)
}

async function createBookmark(params: ValidatedBookmarkCreateRequest) {
  const { folderPath, title, url } = params

  if (!folderPath) {
    /* create a bookmark in the browser default location ( e.g Other Bookmarks in firefox ) */
    return await browser.bookmarks.create({ title, url })
  }

  /* remove the first slash before splitting, and then remove the last slash */
  const folders = folderPath.replace("/", "").split("/").slice(0, -1)
  const { targetFolder, targetId, toBeCreatedFolders } =
    await findTargetFolder(folders)

  /*
   * when targetFolder is not found,
   * we must create a bookmark at the root
   * ( where parentId = ROOT_BOOKMARK_ID )
   */
  if (!targetFolder) {
    log(
      "no targetFolder found: creating bookmark (maybe with bookmark path) from parent: ",
      targetId,
      toBeCreatedFolders
    )
    /*
     * create all necessary folders
     */
    let parentIdFolder = targetId // should be equal to ROOT_BOOKMARK_ID
    for (const toBeCreatedFolder of toBeCreatedFolders) {
      const res = await browser.bookmarks.create({
        parentId: parentIdFolder,
        title: toBeCreatedFolder,
      })
      parentIdFolder = res.id
    }
    /*
     * create the bookmark in the target-folder
     */
    const created = await browser.bookmarks.create({
      parentId: parentIdFolder,
      title,
      url,
    })
    log("created bookmark from parent: ", targetId, created)
    return created
  }

  /*
   * create all necessary folders
   */
  let parentIdFolder = targetFolder.id
  for (const toBeCreatedFolder of toBeCreatedFolders) {
    const res = await browser.bookmarks.create({
      parentId: parentIdFolder,
      title: toBeCreatedFolder,
    })
    parentIdFolder = res.id
  }

  /*
   * create the bookmark in the target-folder
   */
  return await browser.bookmarks.create({
    parentId: parentIdFolder,
    title,
    url,
  })
}

async function updateBookmark(params: ValidatedBookmarkUpdateRequest) {
  const { id, folderPath, title, url } = params
  /*
   * first get the bookmark parentId, needed to deleteEmptyFolders
   */
  const [{ parentId }] = await browser.bookmarks.get(id)

  /*
   * when folderPath is not provided,
   * just update title or url
   * ( here both cannot be undefined, or it would be a delete )
   */
  if (folderPath === undefined) {
    return await browser.bookmarks.update(id, { title, url })
  }

  /* remove the first slash before splitting, and then remove the last slash */
  const folders = folderPath.replace("/", "").split("/").slice(0, -1)
  const { targetFolder, targetId, toBeCreatedFolders } =
    await findTargetFolder(folders)

  /*
   * when targetFolder is not found,
   * we must move the bookmark at the root
   * ( where targetId = ROOT_BOOKMARK_ID )
   */
  if (!targetFolder) {
    log(
      "no targetFolder found: updating bookmark (maybe with bookmark path creation) from parent: ",
      targetId,
      toBeCreatedFolders
    )
    await browser.bookmarks.update(id, { title, url })
    /*
     * create all necessary folders
     */
    let parentIdFolder = targetId // should be equal to ROOT_BOOKMARK_ID
    for (const toBeCreatedFolder of toBeCreatedFolders) {
      const res = await browser.bookmarks.create({
        parentId: parentIdFolder,
        title: toBeCreatedFolder,
      })
      parentIdFolder = res.id
    }
    /*
     * create the bookmark in the target-folder
     */
    const updated = await browser.bookmarks.move(id, {
      parentId: parentIdFolder,
    })
    log("updated bookmark from parent: ", targetId, updated)
    return await deleteEmptyFolders(parentId)
  }

  /*
   * or else, create all necessary folders
   */
  let parentIdFolder = targetFolder.id
  for (const toBeCreatedFolder of toBeCreatedFolders) {
    const newFolder = await browser.bookmarks.create({
      parentId: parentIdFolder,
      title: toBeCreatedFolder,
    })
    parentIdFolder = newFolder.id
  }

  /*
   * then update title and/or url if any,
   * then move the bookmark in the target-folder,
   * finally delete empty folders
   */
  if (isDefined(title) || isDefined(url)) {
    await browser.bookmarks.update(id, { title, url })
  }
  await browser.bookmarks.move(id, { parentId: parentIdFolder })
  return await deleteEmptyFolders(parentId)
}

async function deleteEmptyFolders(removedBookmarkParentId: string | undefined) {
  if (removedBookmarkParentId === undefined) {
    return
  }
  const [parent] = await browser.bookmarks.get(removedBookmarkParentId)
  const children = await browser.bookmarks.getChildren(removedBookmarkParentId)
  /* return if any child exists */
  if (
    children.filter((child) => child.type !== "separator").length !== 0 ||
    parent.id === ROOT_BOOKMARK_ID
  ) {
    return
  }
  /* else remove this empty folder */
  await browser.bookmarks.remove(removedBookmarkParentId)
  /* at last, go recursively on the parent of this deleted folder */
  await deleteEmptyFolders(parent.parentId)
}

async function findTargetFolder(folders: string[]): Promise<{
  targetId: string
  targetFolder: browser.bookmarks.BookmarkTreeNode | undefined
  toBeCreatedFolders: string[]
}> {
  log("findTargetFolder for folders: ", folders)
  let targetId = ROOT_BOOKMARK_ID
  let targetFolder = undefined
  // Infos/music
  // search for folder Infos
  for (const [index, folder] of folders.entries()) {
    let folderFound = false
    const matches = await browser.bookmarks.search({ title: folder })
    log(`got matches for ${folder} :`, matches)
    // search among matches for folder Infos
    for (const match of matches) {
      if (match.type === "folder" && match.parentId === targetId) {
        log("Among matches, found exact match", match.id, match.title)
        folderFound = true
        targetId = match.id
        targetFolder = match
        break
      }
    }
    if (!folderFound) {
      log(
        "Return with folderFound false :",
        targetId,
        targetFolder,
        folders.slice(index)
      )
      return {
        targetId,
        targetFolder,
        toBeCreatedFolders: folders.slice(index),
      }
    }
  }
  log("Return with folderFound true :", targetId, targetFolder, [])
  return { targetId, targetFolder, toBeCreatedFolders: [] }
}
