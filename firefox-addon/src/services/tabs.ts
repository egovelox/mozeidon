import { Port } from "../models/port"
import { Command } from "../models/command"
import { log } from "../logger"
import { Response } from "../models/response"
import { delay } from "../utils"
import { GroupColor } from "../models/group-colors"
import browser from "webextension-polyfill"

export async function newGroupTab(port: Port, { args }: Command) {
  // create a new group from a given tab
  const startTime = Date.now()
  if (!args) {
    log("missing args in new group tab")
    return port.postMessage(Response.end())
  }
  try {
    const userArgs = args.split(":")
    if (userArgs.length !== 4) {
      log("missing some args in new group tab")
      return port.postMessage(Response.end())
    }
    log(`Starting newGroupTab with args ${userArgs}`)
    const tabId = Number(userArgs[0])
    const windowId = userArgs[1] !== "-1" ? Number(userArgs[1]) : undefined
    const groupTitle = userArgs[2]
    const groupColor = userArgs[3]
    
    const groupId = await browser.tabs.group({createProperties: {windowId}, tabIds: [tabId] })
    if (groupTitle !== "" || groupColor !== "") {
      await browser.tabGroups.update(
        groupId, 
        {title: groupTitle || undefined, color: (groupColor || undefined) as GroupColor | undefined}
      )
    }
    log(`Sending back a new groupId ${groupId} for tab ${windowId}:${tabId}`)
    port.postMessage(Response.data(`${groupId}`))
    const endTime = Date.now()
    log(`ending newGroupTab in ${endTime - startTime} ms`)
    // pause 10ms, or this end message may be received before the message above
    await delay(10)
    return port.postMessage(Response.end())
  } catch(e) {
    const endTime = Date.now()
    port.postMessage(Response.data(`[Error] ${e.message ?? e.toString()}`))
    log(`ending newGroupTab in ${endTime - startTime} ms`)
    await delay(10)
    return port.postMessage(Response.end())
  }
}

export async function newTab(port: Port, { args }: Command) {
  if (!args) {
    log("open empty tab")
    await browser.tabs.create({})
    return port.postMessage(Response.end())
  }

  try {
    const url = new URL(args)
    log("open tab at url: ", url)
    await browser.tabs.create({ url: url.toString() })
  } catch (_) {
    // if not an url, use google
    const url = `https://www.google.com/search?q=${encodeURIComponent(args)}`
    log("open google tab")
    await browser.tabs.create({ url })
  }
  return port.postMessage(Response.end())
}

export async function duplicateTab(port: Port, { args }: Command) {
  if (!args) {
    log("missing args in duplicate-tab")
    return port.postMessage(Response.end())
  }

  let windowId: number | undefined = undefined
  let tabIndex: number | undefined = undefined
  let isTabPinned: boolean | undefined = undefined

  try {
    const userArgs = args.split(":")
    const tabId = Number(userArgs[0])
    windowId = userArgs[1] !== "-1" ? Number(userArgs[1]) : undefined
    const tab = await browser.tabs.get(tabId)
    tabIndex = tab.index
    isTabPinned = tab.pinned
    log("duplicating tab: ", JSON.stringify(tab))
    const newTab = await browser.tabs.create({
      active: false,
      windowId: windowId,
      url: tab.url,
      pinned: tab.pinned,
      index: tab.index + 1
    })
    log("duplicated tab: ", JSON.stringify(newTab))
    const response = [{
      id: newTab.id,
      windowId: newTab.windowId,
      title: tab.title,
      pinned: newTab.pinned,
      url: tab.url,
      active: newTab.active,
      domain: tab.url ? new URL(tab.url).hostname : "",
      // we created the tab with active: false, to this tab was not accessed yet
      lastAccessed: tab.lastAccessed ? Math.round(tab.lastAccessed) : 0,
      index: newTab.index ?? 0,
      groupId: (newTab as any).groupId ?? -1,
    }]
    port.postMessage(Response.data(response))
  } catch (e) {
    log("error while duplicating tab", JSON.stringify(e))
    const tab = await browser.tabs.create({
      active: false,
      windowId,
      index: tabIndex !== undefined ? tabIndex + 1 : undefined,
      pinned: isTabPinned,
    })
    log("defaults to creating a new empty tab")
    const response = [{
      id: tab.id,
      windowId: tab.windowId,
      title: tab.title,
      pinned: tab.pinned,
      url: tab.url,
      active: tab.active,
      domain: tab.url ? new URL(tab.url).hostname : "",
      // we created the tab with active: false, to this tab was not accessed yet
      lastAccessed: tab.lastAccessed ? Math.round(tab.lastAccessed) : 0,
      index: tab.index ?? 0,
      groupId: (tab as any).groupId ?? -1,
    }]
    port.postMessage(Response.data(response))
  }
  // pause 10ms, or this end message may be received before the message above
  await delay(10)
  return port.postMessage(Response.end())
}

export function getRecentlyClosedTabs(port: Port, { command: _cmd }: Command) {
  browser.sessions
    .getRecentlyClosed()
    .then(async (sessions) => {
      const sessionTabs = sessions
        .sort((s1, s2) => s2.lastModified - s1.lastModified)
        .filter((session) => session.tab)
        .map((i) => i.tab)
        .filter((t): t is browser.Tabs.Tab => !!t)

      log("Sending back ", sessionTabs.length, " recently closed tabs")
      const tabs = sessionTabs.map((tab) => ({
        id: tab.lastAccessed ? Math.round(tab.lastAccessed) : Math.floor(Math.random() * 1000),
        groupId: (tab as any).groupId ?? -1,
        windowId: tab.windowId,
        title: tab.title,
        pinned: tab.pinned,
        url: tab.url,
        active: tab.active,
        domain: tab.url ? new URL(tab.url).hostname : "",
        lastAccessed: tab.lastAccessed ? Math.round(tab.lastAccessed) : 0,
        index: tab.index ?? 0,
      }))
      port.postMessage(Response.data(tabs))
      // pause 100ms, or this end message may be received before the message above
      await delay(100)
      return port.postMessage(Response.end())
    })
}

export function getTabs(port: Port, { command: _cmd, args }: Command) {
  browser.tabs.query({}).then(async (browserTabs) => {
    let returnedTabs = browserTabs.slice()

    // if requested in args, the first 10 items are the 10 latest accessed tabs.
    if (args === "latest-10-first") {
      browserTabs.sort((a, b) => b.lastAccessed! - a.lastAccessed!)
      const firstOrderedTabs = browserTabs.slice(0, 10)
      returnedTabs = [
        ...firstOrderedTabs,
        ...returnedTabs.filter((t) => !firstOrderedTabs.includes(t)),
      ]
    }

    log("Sending back ", returnedTabs.length, " tabs")
    const tabs = returnedTabs.map((tab) => ({
      id: tab.id,
      groupId: (tab as any).groupId ?? -1,
      windowId: tab.windowId,
      title: tab.title,
      pinned: tab.pinned,
      url: tab.url,
      active: tab.active,
      domain: tab.url ? new URL(tab.url).hostname : "",
      lastAccessed: tab.lastAccessed ? Math.round(tab.lastAccessed) : 0,
      index: tab.index,
    }))
    port.postMessage(Response.data(tabs))
    // pause 10ms, or this end message may be received before the message above
    await delay(10)
    return port.postMessage(Response.end())
  })
}

export function switchToTab(port: Port, { args }: Command) {
  if (!args) {
    log("invalid args, received: ", args)
    return port.postMessage(Response.end())
  }

  let windowId: number, tabId: number
  const ids = args.split(":")
  if (ids.length !== 2) {
    log("invalid args, cannot find both window and tab ids. Received: ", args)
    return port.postMessage(Response.end())
  }

  try {
    windowId = Number.parseInt(ids[0])
    tabId = Number.parseInt(ids[1])
  } catch (e) {
    log("invalid args, cannot parse both window and tab ids as int", args)
    return port.postMessage(Response.end())
  }

  browser.tabs.query({ windowId }).then((tabItems) => {
    for (let tab of tabItems) {
      if (tab.id === tabId) {
        log("found tab to switch to", tab)
        browser.tabs.update(tab.id!, { active: true })
        break
      }
    }
  })

  return port.postMessage(Response.end())
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
  const tabIds = args.split(",")

  browser.tabs.query({}).then((tabItems) => {
    for (let tab of tabItems) {
      if (!tab.id) continue
      if (tabIds.some((id) => `${tab.windowId}:${tab.id}` === id)) {
        log("found tab to close", tab)
        tabToCloseIds.push(tab.id)
      }
    }

    log("closing tabs", tabToCloseIds)
    browser.tabs.remove(tabToCloseIds)
  })

  return port.postMessage(Response.end())
}

export async function updateTabs(port: Port, { args }: Command) {
  if (!args) {
    log("invalid args, received: ", args)
    return port.postMessage(Response.end())
  }
  const userArgs = args.split(":")
  const tabId = Number.parseInt(userArgs[0])
  const windowId = Number.parseInt(userArgs[1])
  const tabIndex = Number.parseInt(userArgs[2])
  const groupId = Number.parseInt(userArgs[3])
  const shouldPin = userArgs[4]
  const shouldBeUngrouped = userArgs[5]

  // first check if tab should be pinned or unpinned
  if (shouldPin === 'true') {
    await browser.tabs.update(tabId, { pinned: true })
    log("successfully pinned tab ", tabId)
  }
  if (shouldPin === 'false') {
    await browser.tabs.update(tabId, { pinned: false })
    log("successfully unpinned tab ", tabId)
  }

  // -2 is default for groupId, meaning the user did not requested to update the group-id
  if (groupId !== -2) {
    if (groupId === -1) {
      browser.tabs.ungroup([tabId])
    } else {
      await browser.tabs.group({tabIds: [tabId], groupId})
    }
  }

  // -2 is default for tabIndex, meaning the user did not requested to update the index
  if (tabIndex !== -2) {
    const movedTabResponse = await browser.tabs.move(tabId, {index: tabIndex, windowId: windowId })
    log(`successfully moved tab ${windowId}:${tabId} to index ${tabIndex}`)
    if (shouldBeUngrouped === 'true') {
      if (Array.isArray(movedTabResponse)) {
        if (movedTabResponse[0] && movedTabResponse[0].id !== undefined) {
          browser.tabs.ungroup(movedTabResponse[0].id)
        }
      } else {
        if (movedTabResponse.id !== undefined) {
          browser.tabs.ungroup(movedTabResponse.id)
        }
      }
    }
  }

  return port.postMessage(Response.end())
}
