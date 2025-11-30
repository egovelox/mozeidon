import { Port } from "../models/port"
import { Command } from "../models/command"
import { log } from "../logger"
import { Response } from "../models/response"
import { delay } from "../utils"
import { GroupColor } from "../models/group-colors"

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
    
    const groupId = await chrome.tabs.group({createProperties: {windowId}, tabIds: [tabId] })
    if (groupTitle !== "" || groupColor !== "") {
      await chrome.tabGroups.update(
        groupId, 
        {title: groupTitle || undefined, color: (groupColor || undefined) as GroupColor | undefined}
      )
    }
    log(`Sending back a new group Id ${groupId} for tab ${windowId}:${tabId}`)
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
    await chrome.tabs.create({})
    return port.postMessage(Response.end())
  }

  try {
    const url = new URL(args)
    log("open tab at url: ", url)
    await chrome.tabs.create({ url: url.toString() })
  } catch (_) {
    // if not an url, use google
    const url = `https://www.google.com/search?q=${encodeURIComponent(args)}`
    log("open google tab")
    await chrome.tabs.create({ url })
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
    const tab = await chrome.tabs.get(tabId)
    tabIndex = tab.index
    isTabPinned = tab.pinned
    log("duplicating tab: ", JSON.stringify(tab))
    const newTab = await chrome.tabs.create({
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
      // we need integer, but chrome lastAccessed has microseconds ( firefox does not )
      // we created the tab with active: false, to this tab was not accessed yet
      lastAccessed: 0,
      index: newTab.index ?? 0,
      groupId: newTab.groupId ?? -1,
    }]
    port.postMessage(Response.data(response))
  } catch (e) {
    log("error while duplicating tab", JSON.stringify(e))
    const tab = await chrome.tabs.create({ 
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
      lastAccessed: 0,
      index: tab.index ?? 0,
      groupId: tab.groupId ?? -1,
    }]
    port.postMessage(Response.data(response))
  }
  // pause 10ms, or this end message may be received before the message above
  await delay(10)
  return port.postMessage(Response.end())
}

export function getRecentlyClosedTabs(port: Port, { command: _cmd }: Command) {
  chrome.sessions
    .getRecentlyClosed()
    .then(async (sessions: chrome.sessions.Session[]) => {
      const sessionTabs = sessions
        .sort((s1, s2) => s2.lastModified - s1.lastModified)
        .filter((session) => session.tab)
        .map((i) => i.tab)
        .filter((t): t is chrome.tabs.Tab => !!t)

      log("Sending back ", sessionTabs.length, " recently closed tabs")
      const tabs = sessionTabs.map((tab) => ({
        // we need integer, but chrome lastAccessed has microseconds ( firefox does not )
        id: tab.lastAccessed ? Math.round(tab.lastAccessed) : Math.floor(Math.random() * 1000),
        windowId: tab.windowId,
        groupId: tab.groupId ?? -1,
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
  chrome.tabs.query({}).then(async (chromeTabs) => {
    let returnedTabs = chromeTabs.slice()

    // if requested in args, the first 10 items are the 10 latest accessed tabs.
    if (args === "latest-10-first") {
      chromeTabs.sort((a, b) => b.lastAccessed! - a.lastAccessed!)
      const firstOrderedTabs = chromeTabs.slice(0, 10)
      returnedTabs = [
        ...firstOrderedTabs,
        ...returnedTabs.filter((t) => !firstOrderedTabs.includes(t)),
      ]
    }
    log("Sending back ", returnedTabs.length, " tabs")
    const tabs = returnedTabs.map((tab) => ({
      id: tab.id,
      windowId: tab.windowId,
      groupId: tab.groupId ?? -1,
      title: tab.title,
      pinned: tab.pinned,
      url: tab.url,
      active: tab.active,
      domain: tab.url ? new URL(tab.url).hostname : "",
      // we need integer, but chrome lastAccessed has microseconds ( firefox does not )
      lastAccessed: tab.lastAccessed ? Math.round(tab.lastAccessed) : 0,
      index: tab.index,
    }))
    port.postMessage(Response.data(tabs))
    // pause 40ms, or this end message may be received before the message above
    await delay(40)
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

  chrome.tabs.query({ windowId }).then((tabs) => {
    for (let tab of tabs) {
      if (tab.id === tabId) {
        log("found tab to switch to", tab)
        chrome.tabs.update(tab.id!, { active: true })
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

  chrome.tabs.query({}).then((tabs) => {
    for (let tab of tabs) {
      if (!tab.id) continue
      if (tabIds.some((id) => `${tab.windowId}:${tab.id}` === id)) {
        log("found tab to close", tab)
        tabToCloseIds.push(tab.id)
      }
    }

    log("closing tabs", tabToCloseIds)
    chrome.tabs.remove(tabToCloseIds)
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
  const userProvidedPin = userArgs[4]
  const shouldBeUngrouped = userArgs[5]

  // first check if tab should be pinned or unpinned
  if (userProvidedPin === 'true') {
    await chrome.tabs.update(tabId, { pinned: true })
    log("successfully pinned tab ", tabId)
  }
  if (userProvidedPin === 'false') {
    await chrome.tabs.update(tabId, { pinned: false })
    log("successfully unpinned tab ", tabId)
  }

  // -2 is default for groupId, meaning the user did not requested to update the group-id
  if (groupId !== -2) {
    if (groupId === -1) {
      await chrome.tabs.ungroup([tabId])
    } else {
      await chrome.tabs.group({tabIds: [tabId], groupId})
    }
  }

  // -2 is default for tabIndex, meaning the user did not requested to update the index
  if (tabIndex !== -2) {
    const movedTabResponse = await chrome.tabs.move(tabId, {index: tabIndex, windowId: windowId })
    log(`successfully moved tab ${windowId}:${tabId} to index ${tabIndex}`)
    if (shouldBeUngrouped === 'true') {
      let movedTab: chrome.tabs.Tab
      if (Array.isArray(movedTabResponse)) {
        movedTab = movedTabResponse[0]
        if (movedTab)
        await chrome.tabs.ungroup(movedTab.id as number)
      } else {
        movedTab = movedTabResponse
        await chrome.tabs.ungroup(movedTab.id as number)
      }
    }
  }

  return port.postMessage(Response.end())
}
