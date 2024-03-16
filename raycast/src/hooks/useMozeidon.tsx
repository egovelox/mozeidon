import { SearchResult, Tab, TabState } from "../interfaces";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { TAB_TYPE } from "../constants";
import { fetchOpenTabs, fetchRecentlyClosedTabs, getBookmarksChunks } from "../actions";

/*
 * use TAB.TYPE.NONE as initial state
 * to ensure that the dropdown `storeValue` is correctly working.
 * See `storeValue` in `src/components/TabTypeDropDown.tsx`
*/
let tabState: TabState = { type: TAB_TYPE.NONE, tabs: [] };

export function useMozeidon(query = ""): [
  SearchResult<TabState>, 
  (chosenType?: TAB_TYPE) => Promise<void>,
  Dispatch<SetStateAction<TabState>>
] {

  const [data, setData] = useState<TabState>(tabState);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const queryParts = query.toLowerCase().split(/\s+/);

  async function changeTabType(chosenType?: TAB_TYPE) {
    if (isLoading) return
    switch (chosenType) {
      case TAB_TYPE.OPENED_TABS:
        tabState = fetchOpenTabs()
        setData(tabState);
        break;
      case TAB_TYPE.RECENTLY_CLOSED:
        tabState = fetchRecentlyClosedTabs()
        setData(tabState);
        break;
      case TAB_TYPE.BOOKMARKS:
        // do not fetch if already fetched
        // this is the way to ensure that the isLoading + storeValue logic is working
        if (tabState.type === TAB_TYPE.BOOKMARKS) break
        setIsLoading(true)
        tabState = { type: TAB_TYPE.BOOKMARKS, tabs: [] }
        for await (const chunk of getBookmarksChunks()) {
          tabState.tabs.push(...chunk)
          // copy a new tabState
          // to make the reactive component using this hook
          // progressively load bookmarks chunk by chunk.
          setData({ ...tabState });
        }
        setIsLoading(false)
        break;
      default: break;
    }
  }

  useEffect(() => {
    setIsLoading(true)
    const tabs = tabState.tabs
     .map((tab): [Tab, string] => [tab, `${tab.title.toLowerCase()} ${tab.urlWithoutScheme().toLowerCase()} ${tab.domain.toLowerCase()}`])
     .filter(([, searchable]) => queryParts.reduce((isMatch, part) => isMatch && searchable.includes(part), true))
     .map(([tab]) => tab)

    setData({type: data.type, tabs})
    setIsLoading(false)
  }, [query])

  return [{ data, isLoading }, changeTabType, setData];
}
