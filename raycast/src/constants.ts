import { getPreferenceValues } from "@raycast/api";

export const MOZEIDON = getPreferenceValues().mozeidon
export const SEARCH_ENGINE = getPreferenceValues().searchEngine
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
