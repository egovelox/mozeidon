export enum CommandName {
  CLOSE_TABS = "close-tabs",
  GET_BOOKMARKS = "get-bookmarks",
  WRITE_BOOKMARK = "write-bookmark",
  GET_HISTORY_ITEMS = "get-history-items",
  DELETE_HISTORY_ITEMS = "delete-history-items",
  GET_RECENTLY_CLOSED_TABS = "get-recently-closed-tabs",
  GET_TABS = "get-tabs",
  NEW_TAB = "new-tab",
  SWITCH_TAB = "switch-tab",
  UPDATE_TAB = "update-tab",
  DUPLICATE_TAB = "duplicate-tab",
  GET_GROUPS = "get-groups",
}
export type Command = {
  command: CommandName
  args?: string
}
