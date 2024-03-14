import { Action, ActionPanel, closeMainWindow, Icon, PopToRootType, showToast, Toast } from "@raycast/api";
import { closeTab, openHistoryTab, openNewTab, switchTab } from "../actions";
import { HistoryEntry, Tab } from "../interfaces";

export class FirefoxActions {
  public static NewTab = NewTabAction;
  public static HistoryItem = HistoryItemAction;
  public static OpenTabListItem = OpenTabListItemAction;
}

function NewTabAction({ query }: { query?: string }) {
  return (
    <ActionPanel title="New Tab">
      <OpenNewTabAction query={query || ""} />
      <Action onAction={() => openNewTab(query)} title={query ? `Search "${query}"` : "Open Empty Tab"} />
    </ActionPanel>
  );
}

function HistoryItemAction({ entry: { title, url } }: { entry: HistoryEntry }) {
  return (
    <ActionPanel title={title}>
      <MozillaFirefoxHistoryTab url={url} />
      <Action.OpenInBrowser title="Open in Default Browser" url={url} shortcut={{ modifiers: ["opt"], key: "enter" }} />
      <Action.CopyToClipboard title="Copy URL" content={url} shortcut={{ modifiers: ["cmd", "shift"], key: "c" }} />
    </ActionPanel>
  );
}

function OpenTabListItemAction(props: { tab: Tab; onCloseTab: (() => void) | undefined }) {
  return (
    <ActionPanel title={props.tab.title}>
      <GoToOpenTabAction tab={props.tab} />
      {props.onCloseTab ? <CloseTabAction tab={props.tab} onCloseTab={props.onCloseTab} /> : undefined}
      <Action.CopyToClipboard title="Copy URL" content={props.tab.url} />
    </ActionPanel>
  );
}

function CloseTabAction(props: { tab: Tab; onCloseTab: () => void }) {
  async function handleAction() {
    closeTab(props.tab);
    props.onCloseTab();
    await showToast({ title: "", message: `Closed tab with id ${props.tab.id}`, style: Toast.Style.Success });
  }
  return <Action title='Close tab' icon={{ source: Icon.XMarkCircle }} onAction={handleAction} />;
}

function GoToOpenTabAction(props: { tab: Tab }) {
  async function handleAction() {
    await switchTab(props.tab);
    await closeMainWindow({ clearRootSearch: true, popToRootType: PopToRootType.Immediate });
  }
  return <Action title="Open Tab" icon={{ source: Icon.Eye }} onAction={handleAction} />;
}

function OpenNewTabAction(props: { query: string }) {
  async function handleAction() {
    await openNewTab(props.query);
    await closeMainWindow({ clearRootSearch: true, popToRootType: PopToRootType.Immediate });
  }
  return <Action onAction={handleAction} title={props.query ? `Search "${props.query}"` : "Open Empty Tab"} />;
}

function MozillaFirefoxHistoryTab({ url }: { url: string }) {
  async function handleAction() {
    await openHistoryTab(url);
    await closeMainWindow();
  }
  return <Action title="Open in Firefox" icon={{ source: Icon.Eye }} onAction={handleAction} />;
}
