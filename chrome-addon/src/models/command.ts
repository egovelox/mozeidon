export enum CommandName {
  CLOSE_TABS = "close-tabs",
  GET_BOOKMARKS = "get-bookmarks",
  WRITE_BOOKMARK = "write-bookmark",
  GET_HISTORY_ITEMS = "get-history-items",
  GET_RECENTLY_CLOSED_TABS = "get-recently-closed-tabs",
  GET_TABS = "get-tabs",
  NEW_TAB = "new-tab",
  SWITCH_TAB = "switch-tab",
}
export type Command = {
  command: CommandName
  args?: string
}
