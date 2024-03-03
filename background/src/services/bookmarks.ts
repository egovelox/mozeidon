import { Command } from "src/models/command"
import { Port } from "src/models/port"
//import MiniSearch from "minisearch"

export function getRecentBookmarks(port: Port, { command: _cmd }: Command) {

  browser.bookmarks.getRecent(10000)
  .then(async (items) => {
    const start = Date.now()
    const chunkSize = 300;
    const chunks = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      chunks.push(processChunk(chunk));
    }

    let bms: {}[] = []
    const processed = await Promise.all(chunks)
    processed.forEach(res => { bms = bms.concat(res) })

    const end = Date.now()
    console.log(`sending back ${bms.length} bookmarks in ${end- start}`)
    port.postMessage({ data: bms });
  })
}

async function processChunk(items: browser.bookmarks.BookmarkTreeNode[]) {
  const bms = []
  for (const item of items) {
    if (!item.url || item.type !== 'bookmark') continue

    const parentTitles = await getBmParentTitles(item)

    bms.push({
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

