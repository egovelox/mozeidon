import { Command } from "./models/command";
import { Port } from "./models/port";
import { getRecentBookmarks } from "./services/bookmarks";
import { closeTabs, getRecentlyClosedTabs, getTabs, newTab, switchToTab } from "./services/tabs";

export async function handler(port: Port, cmd: Command) {

  switch (cmd.command) {
    case "get-tabs":
      return getTabs(port, cmd)
    case "get-recently-closed-tabs":
      return getRecentlyClosedTabs(port, cmd)
    case "switch-tab":
      return switchToTab(port, cmd)
    case "close-tabs":
      return closeTabs(port, cmd)
    case "new-tab":
      return await newTab(port, cmd)
    case "get-bookmarks":
      return getRecentBookmarks(port, cmd)
    default:
      console.error("Cannot handle unknown command: ", cmd.command)
  }

}

