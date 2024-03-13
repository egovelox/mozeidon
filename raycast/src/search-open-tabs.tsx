import { List, getPreferenceValues } from "@raycast/api";
import { ReactElement, useState } from "react";
import { FirefoxActions, FirefoxListEntries, UnknownError } from "./components";
import { MozeidonTab, Tab } from "./interfaces";
import { execSync } from "child_process";
import { TAB_TYPES, TABS_FALLBACK } from "./constants";


const initialTabs = fetchOpenTabs()

type TabType = typeof TAB_TYPES[number]
type DropDownItem = { id: string; name: TabType };
type TabState = { type: TabType, tabs: Tab[] }

function TabTypeDropdown(props: { tabTypes: DropDownItem[]; onTabTypeChange: (newValue: string) => void }) {
  const { tabTypes, onTabTypeChange } = props;
  return (
    <List.Dropdown
      tooltip="Choose a tab type"
      placeholder="Choose a tab type..."
      storeValue={true}
      onChange={(newValue) => {
        onTabTypeChange(newValue);
      }}
    >
      <List.Dropdown.Section title="Tab types">
        {tabTypes.map((tabType) => (
          <List.Dropdown.Item key={tabType.id} title={tabType.name} value={tabType.name} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}

export default function Command(): ReactElement {
  const [searchText, setSearchText] = useState<string>();
  const [{tabs, type}, setTabs] = useState<TabState>(initialTabs);

  if (!tabs.length) {
    return UnknownError({ message: "no tabs" })
  }

  function fetcher(type: TabType) {
    switch (type) {
      case "open tabs":
        setTabs(fetchOpenTabs())
        break
      case "recently closed": 
        setTabs(fetchRecentlyClosedTabs())
        break
    }
  }

  const counter = `${tabs.length} ${type}`
  return (
    <List
      onSearchTextChange={setSearchText}
      navigationTitle={counter}
      throttle={true}
      filtering={{keepSectionOrder: true}}
      actions={FirefoxActions.NewTab({ query: searchText })}
      searchBarAccessory={
        TabTypeDropdown({
          tabTypes: [
            { id: "1", name: TAB_TYPES[0] }, 
            { id: "2", name: TAB_TYPES[1] }
          ], 
          onTabTypeChange: (value) => fetcher(value as TabType)
        })
      }
    >
      <List.Section title={counter}>
        {tabs.map((tab) => (
          <FirefoxListEntries.OpenTabListEntry 
            tab={tab}
            key={tab.id}
            onCloseTab={type === TAB_TYPES[0] ? () => setTabs({
              type: TAB_TYPES[0],
              tabs: tabs.filter(
              t => `${t.windowId}${t.id}` !== `${tab.windowId}${tab.id}`
            )}) : undefined }
          />
      ))}
      </List.Section>
      <List.Section title="New Tab">
        <FirefoxListEntries.NewTabEntry searchText={searchText} />
      </List.Section>
    </List>
  )
}

function tabSearchFilter(tabs: Tab[]) {
  return (searchText: string) => tabs.filter(tab =>
    `${tab.title}${tab.domain}${tab.url}`.toLowerCase().includes(searchText?.toLowerCase() || "")
  )
}

function fetchOpenTabs(): TabState {
  console.log("...fetching open tabs")
  const data = execSync(`${getPreferenceValues().mozicli} tabs --json`)
  const parsedTabs: { data: MozeidonTab[] } = JSON.parse(data.toString() || TABS_FALLBACK)
  return {
    type: TAB_TYPES[0],
    tabs: parsedTabs.data.map(mozTab => new Tab(
      mozTab.id,
      mozTab.windowId,
      mozTab.title,
      mozTab.url,
      mozTab.domain,
      mozTab.active
    ))
  }
}

function fetchRecentlyClosedTabs(): TabState {
  console.log("...fetching recently closed tabs")
  const data = execSync(`${getPreferenceValues().mozicli} tabs --json --closed`)
  const parsedTabs: { data: MozeidonTab[] } = JSON.parse(data.toString() || TABS_FALLBACK)
  return {
      type: TAB_TYPES[1],
      tabs: parsedTabs.data.map(mozTab => new Tab(
        mozTab.id,
        mozTab.windowId,
        mozTab.title,
        mozTab.url,
        mozTab.domain,
        mozTab.active
      ))
    }
}
