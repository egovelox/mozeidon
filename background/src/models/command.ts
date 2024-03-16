export enum CommandName {
  GET_TABS = "get-tabs",
  GET_RECENTLY_CLOSED_TABS = "get-recently-closed-tabs",
  GET_BOOKMARKS = "get-bookmarks",
  CLOSE_TABS = "close-tabs",
  NEW_TAB = "new-tab",
  SWITCH_TAB = "switch-tab",
}
export type Command = { 
    command: CommandName
    args?: string
} 
