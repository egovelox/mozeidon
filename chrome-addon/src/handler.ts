import { Command, CommandName } from "./models/command"
import { Port } from "./models/port"
import { getBookmarks } from "./services/bookmarks"
import { writeBookmark } from "./services/bookmarks-writer"
import { getHistory } from "./services/history"
import {
  closeTabs,
  getRecentlyClosedTabs,
  getTabs,
  newTab,
  switchToTab,
} from "./services/tabs"

export async function handler(port: Port, cmd: Command) {
  switch (cmd.command) {
    case CommandName.GET_TABS:
      return getTabs(port, cmd)
    case CommandName.GET_RECENTLY_CLOSED_TABS:
      return getRecentlyClosedTabs(port, cmd)
    case CommandName.SWITCH_TAB:
      return switchToTab(port, cmd)
    case CommandName.CLOSE_TABS:
      return closeTabs(port, cmd)
    case CommandName.NEW_TAB:
      return await newTab(port, cmd)
    case CommandName.GET_BOOKMARKS:
      return getBookmarks(port, cmd)
    case CommandName.WRITE_BOOKMARK:
      await writeBookmark(port, cmd)
      return
    case CommandName.GET_HISTORY_ITEMS:
      return getHistory(port, cmd)
  }
}
