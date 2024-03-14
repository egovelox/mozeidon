import { Icon, List, getPreferenceValues } from "@raycast/api";
import { FirefoxActions } from "./index";
import { HistoryEntry, Tab } from "../interfaces";
import { getFavicon } from "@raycast/utils";

export class FirefoxListEntries {
  public static NewTabEntry = NewTabEntry;
  public static HistoryEntry = HistoryListEntry;
  public static OpenTabListEntry = OpenTabListEntry;
}

type NewTabEntryProps = { searchText?: string };
function NewTabEntry({ searchText }: NewTabEntryProps) {
  const searchEngine = getPreferenceValues().searchEngine ?? "google";
  return (
    <List.Item
      title={!searchText ? "Open Empty Tab" : `Search ${searchEngine} "${searchText}"`}
      icon={{ source: !searchText ? Icon.Plus : Icon.MagnifyingGlass }}
      actions={<FirefoxActions.NewTab query={searchText} />}
    />
  );
}

type OpenTabListEntryProps = { tab: Tab; onCloseTab: (() => void) | undefined };
function OpenTabListEntry({ tab, onCloseTab }: OpenTabListEntryProps) {
  return (
    <List.Item
      id={tab.id.toString()}
      title={tab.title}
      subtitle={`${(tab.pinned ? "📌 " : "") + tab.domain}`}
      keywords={[tab.urlWithoutScheme()]}
      actions={<FirefoxActions.OpenTabListItem tab={tab} onCloseTab={onCloseTab} />}
      icon={tab.googleFavicon()}
    />
  );
}

type HistoryListEntryProps = { entry: HistoryEntry };
function HistoryListEntry({ entry: { url, title, id, lastVisited } }: HistoryListEntryProps) {
  return (
    <List.Item
      id={id.toString()}
      title={title || ""}
      subtitle={url}
      icon={getFavicon(url)}
      actions={<FirefoxActions.HistoryItem entry={{ url, title, id, lastVisited }} />}
    />
  );
}
