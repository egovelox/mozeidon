import { log } from "../logger";
import { Command } from "src/models/command"
import { Port } from "src/models/port"

export function getRecentBookmarks(port: Port, { command: _cmd }: Command) {

  browser.bookmarks.getRecent(50000)
  .then(async (bookmarks) => {
    const startTime = Date.now()
    const chunkSize = 200;
    const chunks = [];

    // chunk bookmarks
    for (let i = 0; i < bookmarks.length; i += chunkSize) {
      const chunk = bookmarks.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    // no parallelism, maintain order of bookmarks
    for (const chunk of chunks) {
      const bms = await processChunk(chunk)
      port.postMessage({data: bms})
    }

    const endTime = Date.now()
    log(`sending back bookmarks in ${endTime - startTime} ms`)
    // pause 100ms, or this end message may be received before the last chunk
    await new Promise(res => setTimeout(res, 100))
    port.postMessage({data:"end"});
  })
}

async function processChunk(items: browser.bookmarks.BookmarkTreeNode[]) {
  const bms = []
  for (const item of items) {
    if (!item.url || item.type !== 'bookmark') continue

    const parentTitles = await getBmParentTitles(item)

    bms.push({
      id: item.id,
      title: item.title,
      url: item.url,
      parent: parentTitles.join(","),
    })
  }
  return bms
}

async function getBmParentTitles(bm: browser.bookmarks.BookmarkTreeNode) {
  let shouldGetParent = bm.parentId !== "toolbar_____"
  let current = bm

  let parentTitles = []

  while (shouldGetParent) {

    if (current.parentId) {

      let parentBm = await browser.bookmarks.get(current.parentId)

      if (parentBm.length && parentBm[0].title) {
        parentTitles.push(parentBm[0].title)
        current = parentBm[0]
        shouldGetParent = parentBm[0].parentId !== "toolbar_____"
      } else shouldGetParent = false

    } else break
  }

  return parentTitles
}

