import { Port } from "src/models/port"
import { Command } from "src/models/command"
import { log } from "../logger"

export async function openTab(port: Port, { args }: Command) {
  try {
    const url = new URL(args!)
    log("open tab")
    await browser.tabs.create({ url: url.toString() })
  } catch(_) {
    // if not an url, use google
    log("open google tab")
    await browser.tabs.create({ url: `https://www.google.com/search?q=${args}` })
  }
  port.postMessage({data:"end"});
}

export function getTabs(port: Port, { command: _cmd }: Command) {
  browser.tabs.query({ currentWindow: true })
  .then(async (tabs) => {
    let returnedTabs = tabs.slice()

    tabs.sort((a,b) => b.lastAccessed! - a.lastAccessed!)
    const firstOrderedTabs = tabs.slice(0,10)

    // returnedTabs first 10 items are the 10 latest accessed tabs.
    returnedTabs = [...firstOrderedTabs, ...returnedTabs.filter(t => !firstOrderedTabs.includes(t))]

    log("Sending back ", returnedTabs.length, " tabs")
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
    // pause 100ms, or this end message may be received before the message above
    await new Promise(res => setTimeout(res,100))
    port.postMessage({data:"end"});
  })
}

export function switchToTab(port: Port, { args }: Command) {
  browser.tabs.query({ currentWindow: true })
  .then((tabs) => {

    for (let tab of tabs) {
      if (tab.id == args) {
        console.log("found tab to switch to", tab)
        browser.tabs.update(tab.id!, {active: true});
        break
      }
    }
  });

  port.postMessage({data:"end"});
}

export function closeTabs(port: Port, { args }: Command) {
  browser.tabs.query({ currentWindow: true })
  .then((tabs) => {

    const tabToCloseIds: number[] = []
    const tabIds = args!.split(',')

    for (let tab of tabs) {

      if (!tab.id) continue
      if ( tabIds.some(id => `${tab.id}` === id) ) {
        log("found tab to close", tab)
        tabToCloseIds.push(tab.id)
      }
    }

    log("closing tabs", tabToCloseIds)
    browser.tabs.remove(tabToCloseIds)
  });

  port.postMessage({data:"end"});
}
