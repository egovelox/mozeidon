import { log } from "./logger"
import { Command, CommandName } from "./models/command"
import { Port } from "./models/port"
import { Response } from "./models/response"
import { getBookmarks } from "./services/bookmarks"
import { writeBookmark } from "./services/bookmarks-writer"
import { getGroups, moveGroup, updateGroup } from "./services/groups"
import { deleteHistory, getHistory } from "./services/history"
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

export async function handler(port: Port, cmd: Command) {
  switch (cmd.command) {
    case CommandName.GET_TABS:
      return getTabs(port, cmd)
    case CommandName.GET_RECENTLY_CLOSED_TABS:
      return getRecentlyClosedTabs(port, cmd)
    case CommandName.SWITCH_TAB:
      return switchToTab(port, cmd)
    case CommandName.UPDATE_TAB:
      return await updateTabs(port, cmd)
    case CommandName.CLOSE_TABS:
      return closeTabs(port, cmd)
    case CommandName.NEW_TAB:
      return await newTab(port, cmd)
    case CommandName.DUPLICATE_TAB:
      return await duplicateTab(port, cmd)
    case CommandName.GET_BOOKMARKS:
      return getBookmarks(port, cmd)
    case CommandName.WRITE_BOOKMARK:
      await writeBookmark(port, cmd)
      return
    case CommandName.GET_HISTORY_ITEMS:
      return getHistory(port, cmd)
    case CommandName.DELETE_HISTORY_ITEMS:
      return deleteHistory(port, cmd)
    case CommandName.GET_GROUPS:
      return getGroups(port, cmd)
    case CommandName.UPDATE_GROUP:
      return updateGroup(port, cmd)
    case CommandName.MOVE_GROUP:
      return moveGroup(port, cmd)
    case CommandName.NEW_GROUP_TAB:
      return await newGroupTab(port, cmd)
    default:
      log("unknown command received in handler")
      return port.postMessage(Response.end())
  }
}
