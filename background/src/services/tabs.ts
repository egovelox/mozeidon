import { Port } from "src/models/port"
import MiniSearch from "minisearch"
import { Command } from "src/models/command"

export async function openTab(port: Port, { args }: Command) {
  await browser.tabs.create({ url: `https://www.google.com/search?q=${args}` })
  port.postMessage({ data: null });
}
export function getTabs(port: Port, { command: cmd }: Command) {
  browser.tabs.query({ currentWindow: true })
  .then((tabs) => {
    let returnedTabs = tabs.slice()

    tabs.sort((a,b) => b.lastAccessed! - a.lastAccessed!)
    const firstOrderedTabs = tabs.slice(0,5)

    // returnedTabs first 5 items are the 5 latest accessed tabs.
    returnedTabs = [...firstOrderedTabs, ...returnedTabs.filter(t => !firstOrderedTabs.includes(t))]

    let miniSearch = new MiniSearch({
      fields: ['title', 'url'], // fields to index for full-text search
      storeFields: ['title', 'url', 'id', 'pinned'], // fields to return with search results
      searchOptions: {
      boost: { title: 2 },
      fuzzy: 0.2
    }
    })
    miniSearch.addAll(returnedTabs)
    const res = miniSearch.search(cmd, { fuzzy: 0.2 })
    console.log("tabs", returnedTabs)
    console.log("matching tabs", res)
    const message = { 
      data: returnedTabs.map(
        tab => ({
          id: tab.id,
          title: tab.title,
          pinned: tab.pinned,
          domain: tab.url
            ? new URL(tab.url).hostname.replace("www.", "")
            : ''
        })
      )
    }
    port.postMessage(message);
  })
}

export function switchToTab(port: Port, { args }: Command) {
  browser.tabs.query({ currentWindow: true })
  .then((tabs) => {

    for (let tab of tabs) {
      if (tab.id == args) {
        console.log("found tab", tab)
        browser.tabs.update(tab.id!, {active: true});
        break
      }
    }
  });

  port.postMessage({ data: null });
}

export function closeTabs(port: Port, { args }: Command) {
  browser.tabs.query({ currentWindow: true })
  .then((tabs) => {

    const tabToCloseIds: number[] = []
    const tabIds = args!.split(',')

    for (let tab of tabs) {

      if (!tab.id) continue
      if ( tabIds.some(id => `${tab.id}` === id) ) {
        console.log("found tab to close", tab)
        tabToCloseIds.push(tab.id)
      }
    }

    browser.tabs.remove(tabToCloseIds)
  });

  port.postMessage({ data: null });
}
