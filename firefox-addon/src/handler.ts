import { Command, CommandName } from "./models/command"
import { Port } from "./models/port"
import { getBookmarks } from "./services/bookmarks"
import { writeBookmark } from "./services/bookmarks-writer"
import { getHistory, deleteHistory } from "./services/history"
import { log } from "./logger"
import { Response } from "./models/response"
import {
  closeTabs,
  duplicateTab,
  getRecentlyClosedTabs,
  getTabs,
  newGroupTab,
  newTab,
  switchToTab,
  updateTabs,
} from "./services/tabs"
import { getGroups, moveGroup, updateGroup } from "./services/groups"

export async function handler(port: Port, cmd: Command) {
  switch (cmd.command) {
    case CommandName.GET_TABS:
      return await getTabs(port, cmd)
    case CommandName.GET_RECENTLY_CLOSED_TABS:
      return await getRecentlyClosedTabs(port, cmd)
    case CommandName.SWITCH_TAB:
      return await switchToTab(port, cmd)
    case CommandName.UPDATE_TAB:
      return await updateTabs(port, cmd)
    case CommandName.CLOSE_TABS:
      return await closeTabs(port, cmd)
    case CommandName.NEW_TAB:
      return await newTab(port, cmd)
    case CommandName.DUPLICATE_TAB:
      return await duplicateTab(port, cmd)
    case CommandName.GET_BOOKMARKS:
      return await getBookmarks(port, cmd)
    case CommandName.WRITE_BOOKMARK:
      return await writeBookmark(port, cmd)
    case CommandName.GET_HISTORY_ITEMS:
      return await getHistory(port, cmd)
    case CommandName.DELETE_HISTORY_ITEMS:
      return await deleteHistory(port, cmd)
    case CommandName.GET_GROUPS:
      return await getGroups(port, cmd)
    case CommandName.UPDATE_GROUP:
      return await updateGroup(port, cmd)
    case CommandName.MOVE_GROUP:
      return await moveGroup(port, cmd)
    case CommandName.NEW_GROUP_TAB:
      return await newGroupTab(port, cmd)
    default:
      log("unknown command received in handler")
      return port.postMessage(Response.end())
  }
}
