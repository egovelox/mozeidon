import { MozeidonBookmark, MozeidonTab, SearchResult2, Tab, TabState } from "../interfaces";
import { useState, useEffect, Dispatch, SetStateAction, ReactNode } from "react";
import { TABS_FALLBACK, TAB_TYPE } from "../constants";
import { getPreferenceValues } from "@raycast/api";
import { execSync, spawn } from "child_process";
import * as readline from "node:readline";

let tabState: TabState = { type: TAB_TYPE.OPEN_TABS, tabs: [] };

export function useTabSearch(query = ""): [
  SearchResult2<TabState>, 
  (chosenType?: TAB_TYPE) => Promise<void>,
  Dispatch<SetStateAction<TabState>>
] {

  const [data, setData] = useState<TabState>(tabState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorView, _] = useState<ReactNode | undefined>();

  const queryParts = query.toLowerCase().split(/\s+/);

  async function changeTabType(chosenType?: TAB_TYPE) {
    switch (chosenType) {
      case TAB_TYPE.OPEN_TABS:
        tabState = fetchOpenTabs()
        setData(tabState);
        break;
      case TAB_TYPE.RECENTLY_CLOSED:
        tabState = fetchRecentlyClosedTabs()
        setData(tabState);
        break;
      case TAB_TYPE.BOOKMARKS:
        setIsLoading(true)
        tabState = { type: TAB_TYPE.BOOKMARKS, tabs: [] }
        for await (const chunk of getBookmarksChunks()) {
          tabState.tabs.push(...chunk)
          // copy the tabState
          setData({ ...tabState });
        }
        setIsLoading(false)
        break;
    }
  }

  useEffect(() => {
    const tabs = tabState.tabs
     .map((tab): [Tab, string] => [tab, `${tab.title.toLowerCase()} ${tab.urlWithoutScheme().toLowerCase()} ${tab.domain.toLowerCase()}`])
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
        new Tab(mozTab.id.toString(), mozTab.pinned, mozTab.windowId, mozTab.title, mozTab.url, mozTab.domain, mozTab.active)
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
        new Tab(mozTab.id.toString(), mozTab.pinned, mozTab.windowId, mozTab.title, mozTab.url, mozTab.domain, mozTab.active)
    ),
  };
}

export async function* getBookmarksChunks() {
  //await checkAppInstalled()
  const command = spawn(
    `${getPreferenceValues().mozicli} bookmarks --json`,
    { shell: true }
  );
  const chunks = readline.createInterface({ input: command.stdout });
  for await (const chunk of chunks) {
    const { data: parsedBookmarks }: { data: MozeidonBookmark[] } = JSON.parse(chunk);
    console.log("fetching bookmark chunk")
    yield parsedBookmarks.map(
      (mozBookmark) => 
        new Tab(mozBookmark.id, false, 0, mozBookmark.title, mozBookmark.url, mozBookmark.parent, false)
    )
  }
}


