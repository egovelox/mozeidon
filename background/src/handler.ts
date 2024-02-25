import { Command } from "./models/command";
import { Port } from "./models/port";
import { getRecentBookmarks } from "./services/bookmarks";
import { closeTabs, getTabs, switchToTab } from "./services/tabs";

export function handler(port: Port, cmd: Command) {

  switch (cmd.command) {
    case "match-tabs":
      return getTabs(port, cmd)
    case "switch-tab":
      return switchToTab(port, cmd)
    case "close-tabs":
      return closeTabs(port, cmd)
    case "bookmarks":
      return getRecentBookmarks(port, cmd)
    default:
      console.error("Cannot handle unknown command: ", cmd.command)
  }

}

