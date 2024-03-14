import { List } from "@raycast/api";
import { ReactElement, useState } from "react";
import { FirefoxListEntries, TabTypeDropdown } from "./components";
import { TAB_TYPE } from "./constants";
import { useTabSearch } from "./hooks/useTabSearch";

export default function Command(): ReactElement {
  const [searchText, setSearchText] = useState<string>("");
  const [{ data: { tabs, type }, isLoading }, changeTabType, setData ] = useTabSearch(searchText);

  const counter = `${tabs.length} ${type}`;
  return (
    <List
      isLoading={isLoading}
      throttle={true}
      onSearchTextChange={setSearchText}
      navigationTitle={counter}
      searchBarAccessory={TabTypeDropdown({
        tabTypes: [
          { id: "1", name: TAB_TYPE.OPEN_TABS },
          { id: "2", name: TAB_TYPE.RECENTLY_CLOSED },
        ],
        onTabTypeChange: (value) => changeTabType(value as TAB_TYPE),
      })}
    >
      <List.Section title={counter}>
        {tabs.map((tab) => (
          <FirefoxListEntries.OpenTabListEntry
            tab={tab}
            key={tab.id.toString()}
            onCloseTab={
              type === TAB_TYPE.OPEN_TABS
                ? () =>
                    setData({
                      type: TAB_TYPE.OPEN_TABS,
                      tabs: tabs.filter((t) => `${t.windowId}${t.id}` !== `${tab.windowId}${tab.id}`),
                    })
                : undefined
            }
          />
        ))}
      </List.Section>
      <List.Section title="New Tab">
        <FirefoxListEntries.NewTabEntry searchText={searchText} />
      </List.Section>
    </List>
  );
}
