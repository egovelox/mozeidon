import { Command } from "src/models/command"
import { Port } from "src/models/port"

export function getRecentBookmarks(port: Port, { command: cmd }: Command) {
    const sp = cmd.split('*_f_t_b_*')
    const count = sp.length > 1 ? Number.parseInt(sp[1]!) : 20

    // note: it will break if count > 36 
    // (have to fix node-ipc code, in order to support larger data)
    // but no more with golang : tested with 500 !
    browser.bookmarks.getRecent(count)
    .then(async (items) => {
      const bms = []
      for (const item of items) {
        if (!item.url || item.type !== 'bookmark') continue

        const parentTitles = await getBmParentTitles(item)

        bms.push({
          d: item.dateAdded,
          t: item.title,
          u: item.url,
          p: parentTitles.join(","),
        })
      }

      console.log(bms)
      port.postMessage({ data: bms });
    })
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

