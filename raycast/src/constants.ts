import { getPreferenceValues } from "@raycast/api";

const preferences = getPreferenceValues<Preferences.Mozeidon>()
export const MOZEIDON = preferences.mozeidon
export const SEARCH_ENGINE = preferences.searchEngine
export const FIREFOX_OPEN_COMMAND = preferences.firefox
export const TABS_FALLBACK = `{"data":[]}`;
export enum TAB_TYPE {
  OPENED_TABS = "Opened Tabs",
  RECENTLY_CLOSED = "Recently Closed",
  BOOKMARKS = "Bookmarks",
  // only for initial state
  NONE = "",
}
export const SEARCH_ENGINES: { [key: string]: string } = {
  google: `https://google.com/search?q=`,
  bing: `https://www.bing.com/search?q=`,
  baidu: `https://www.baidu.com/s?wd=`,
  brave: `https://search.brave.com/search?q=`,
  duckduckgo: `https://duckduckgo.com/?q=`,
};
