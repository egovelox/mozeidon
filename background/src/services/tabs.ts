import { Port } from "src/models/port"
import { Command } from "../models/command"
import { log } from "../logger"
import { Response } from "../models/response"

export async function newTab(port: Port, { args }: Command) {
  if (!args) { 
    log("open empty tab")
    await browser.tabs.create({})
    return port.postMessage(Response.end()) 
  }

  try {
    const url = new URL(args)
    log("open tab: ", url)
    await browser.tabs.create({ url: url.toString() })
  } catch(_) {
    // if not an url, use google
    const url = `https://www.google.com/search?q=${encodeURIComponent(args)}`
    log("open google tab")
    await browser.tabs.create({ url })
  }
  port.postMessage(Response.end());
}

export function getRecentlyClosedTabs(port: Port, { command: _cmd }: Command) {
  browser.sessions.getRecentlyClosed()
    .then(async (sessions: browser.sessions.Session[]) => {
      const sessionTabs = 
        sessions
        .sort((s1, s2) => s2.lastModified - s1.lastModified)
        .filter((session) => session.tab)
        .map(i => i.tab)
        .filter((t): t is browser.tabs.Tab => !!t)

      log("Sending back ", sessionTabs.length, " recently closed tabs")
      const tabs = sessionTabs.map(
          tab => ({
            id: tab.lastAccessed ?? Math.floor(Math.random() * 1000),
            windowId: tab.windowId,
            title: tab.title,
            pinned: tab.pinned,
            url: tab.url,
            active: tab.active,
            domain: tab.url
              ? new URL(tab.url).hostname.replace("www.", "")
              : ''
          })
        )
      port.postMessage(Response.data(tabs));
      // pause 100ms, or this end message may be received before the message above
      await new Promise(res => setTimeout(res,100))
      port.postMessage(Response.end());
    })
}


export function getTabs(port: Port, { command: _cmd }: Command) {
  browser.tabs.query({})
  .then(async (browserTabs) => {
    let returnedTabs = browserTabs.slice()

    browserTabs.sort((a,b) => b.lastAccessed! - a.lastAccessed!)
    const firstOrderedTabs = browserTabs.slice(0,10)

    // returnedTabs first 10 items are the 10 latest accessed tabs.
    returnedTabs = [...firstOrderedTabs, ...returnedTabs.filter(t => !firstOrderedTabs.includes(t))]

    log("Sending back ", returnedTabs.length, " tabs")
    const tabs = returnedTabs.map(
        tab => ({
          id: tab.id,
          windowId: tab.windowId,
          title: tab.title,
          pinned: tab.pinned,
          url: tab.url,
          active: tab.active,
          domain: tab.url
            ? new URL(tab.url).hostname.replace("www.", "")
            : ''
        })
      )
    port.postMessage(Response.data(tabs));
    // pause 100ms, or this end message may be received before the message above
    await new Promise(res => setTimeout(res,100))
    port.postMessage(Response.end());
  })
}

export function switchToTab(port: Port, { args }: Command) {
  if (!args) { 
    log("invalid args, received: ", args)
    return port.postMessage(Response.end()) 
  }

  let windowId:number, tabId: number;
  const ids = args.split(":")
  if (ids.length !== 2) {
    log("invalid args, cannot find both window and tab ids. Received: ", args)
    return port.postMessage(Response.end())
  }
  try {
    windowId = Number.parseInt(ids[0])
    tabId = Number.parseInt(ids[1])
  } catch(e) {
    log("invalid args, cannot parth both window and tab ids as int", args)
    return port.postMessage(Response.end())
  }

  browser.tabs.query({ windowId })
  .then((tabs) => {

    for (let tab of tabs) {
      if (tab.id == tabId) {
        log("found tab to switch to", tab)
        browser.tabs.update(tab.id!, {active: true});
        break
      }
    }
  });

  port.postMessage(Response.end());
}

export function closeTabs(port: Port, { args }: Command) {
  if (!args) { 
    log("invalid args, received: ", args)
    return port.postMessage(Response.end()) 
  }

  const tabToCloseIds: number[] = []

  /* 
   * array of strings, each one should have following format: 
   * `{windowId}:{tabId}` 
  */
  const tabIds = args.split(',')

  browser.tabs.query({})
  .then((tabs) => {
    for (let tab of tabs) {
      if (!tab.id) continue
      if ( tabIds.some(id => `${tab.windowId}:${tab.id}` === id) ) {
        log("found tab to close", tab)
        tabToCloseIds.push(tab.id)
      }
    }

    log("closing tabs", tabToCloseIds)
    browser.tabs.remove(tabToCloseIds)
  });

  port.postMessage(Response.end());
}
