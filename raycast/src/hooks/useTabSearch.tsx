import { MozeidonTab, SearchResult2, Tab, TabState } from "../interfaces";
import { useState, useEffect, Dispatch, SetStateAction, ReactNode } from "react";
import { TABS_FALLBACK, TAB_TYPE } from "../constants";
import { getPreferenceValues } from "@raycast/api";
import { execSync } from "child_process";

let initialState: TabState = { type: TAB_TYPE.OPEN_TABS, tabs: [] }

export function useTabSearch(query = ""): [
  SearchResult2<TabState>, 
  (chosenType?: TAB_TYPE) => void,
  Dispatch<SetStateAction<TabState>>
] {

  const [data, setData] = useState<TabState>(initialState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorView, _] = useState<ReactNode | undefined>();

  const queryParts = query.toLowerCase().split(/\s+/);

  function changeTabType(chosenType?: TAB_TYPE) {
    switch (chosenType) {
      case TAB_TYPE.OPEN_TABS:
        initialState = fetchOpenTabs()
        setData(initialState);
        break;
      case TAB_TYPE.RECENTLY_CLOSED:
        initialState = fetchRecentlyClosedTabs()
        setData(initialState);
        break;
    }
  }

  useEffect(() => {
    const tabs = initialState.tabs
     .map((tab): [Tab, string] => [tab, `${tab.title.toLowerCase()} ${tab.urlWithoutScheme().toLowerCase()}`])
     .filter(([, searchable]) => queryParts.reduce((isMatch, part) => isMatch && searchable.includes(part), true))
     .map(([tab]) => tab)

    setData({type: data.type, tabs})
    setIsLoading(false)
  }, [query])

  return [{ data, isLoading, errorView }, changeTabType, setData];
}

export function fetchOpenTabs(): TabState {
  console.log("...fetching open tabs");
  const data = execSync(`${getPreferenceValues().mozicli} tabs --json`);
  const parsedTabs: { data: MozeidonTab[] } = JSON.parse(data.toString() || TABS_FALLBACK);
  return {
    type: TAB_TYPE.OPEN_TABS,
    tabs: parsedTabs.data.map(
      (mozTab) =>
        new Tab(mozTab.id, mozTab.pinned, mozTab.windowId, mozTab.title, mozTab.url, mozTab.domain, mozTab.active)
    ),
  };
}

export function fetchRecentlyClosedTabs(): TabState {
  console.log("...fetching recently closed tabs");
  const data = execSync(`${getPreferenceValues().mozicli} tabs --json --closed`);
  const parsedTabs: { data: MozeidonTab[] } = JSON.parse(data.toString() || TABS_FALLBACK);
  return {
    type: TAB_TYPE.RECENTLY_CLOSED,
    tabs: parsedTabs.data.map(
      (mozTab) =>
        new Tab(mozTab.id, mozTab.pinned, mozTab.windowId, mozTab.title, mozTab.url, mozTab.domain, mozTab.active)
    ),
  };
}
