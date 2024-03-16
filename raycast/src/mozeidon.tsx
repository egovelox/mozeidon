import { List } from "@raycast/api";
import { ReactElement, useState } from "react";
import { TabList, TabTypeDropdown } from "./components";
import { TAB_TYPE } from "./constants";
import { useMozeidon } from "./hooks/useMozeidon";

export default function Command(): ReactElement {
  const [searchText, setSearchText] = useState<string>("");
  const [
    {
      data: { tabs, type },
      isLoading,
    },
    changeTabType,
    setData,
  ] = useMozeidon(searchText);

  const title = `${tabs.length} ${type}`;
  return (
    <List
      isLoading={isLoading}
      throttle={true}
      onSearchTextChange={setSearchText}
      navigationTitle={title}
      searchBarAccessory={TabTypeDropdown({
        tabTypes: [
          // prevent user from changing dropdown item while bookmarks are loading
          !isLoading ? { id: "1", name: TAB_TYPE.OPENED_TABS } : undefined,
          !isLoading ? { id: "2", name: TAB_TYPE.RECENTLY_CLOSED } : undefined,
          { id: "3", name: TAB_TYPE.BOOKMARKS },
        ],
        onTabTypeChange: async (value) => {
          console.log("change", value);
          await changeTabType(value as TAB_TYPE);
        },
      })}
    >
      <List.Section title={title}>
        {tabs.map((tab) => (
          <TabList.TabItem
            isLoading={isLoading}
            type={type}
            tab={tab}
            key={tab.id.toString()}
            onCloseTab={
              type === TAB_TYPE.OPENED_TABS
                ? () =>
                    // when an opened-tab is closed by the user, remove it from the state.
                    setData({
                      type: TAB_TYPE.OPENED_TABS,
                      tabs: tabs.filter((t) => `${t.windowId}${t.id}` !== `${tab.windowId}${tab.id}`),
                    })
                : undefined
            }
          />
        ))}
      </List.Section>
      <List.Section title="New Tab">
        <TabList.NewTabItem searchText={searchText} />
      </List.Section>
    </List>
  );
}
