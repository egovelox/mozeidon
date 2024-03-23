import * as readline from "node:readline";
import { MozeidonBookmark, MozeidonTab, Tab, TabState } from "../interfaces";
import { execSync, spawn } from "child_process";
import { FIREFOX_OPEN_COMMAND, MOZEIDON, SEARCH_ENGINE, SEARCH_ENGINES, TABS_FALLBACK, TAB_TYPE } from "../constants";

export function openNewTab(queryText: string | null | undefined): void {
  // default empty query for empty tab
  let query = "";

  if (queryText) {
    try {
      query = ` -- "${new URL(queryText).toString()}"`;

      // not an url, then it should open a search-engine request
    } catch (_) {
      const encodedQuery = encodeURIComponent(queryText);
      query = ` -- "${SEARCH_ENGINES[SEARCH_ENGINE]}${encodedQuery}"`;
    }
  }

  execSync(`${MOZEIDON} tabs new${query}`);
  openFirefox();
}

export function switchTab(tab: Tab): void {
  execSync(`${MOZEIDON} tabs switch ${tab.windowId}:${tab.id}`);
  openFirefox();
}

export function closeTab(tab: Tab): void {
  //await checkAppInstalled()
  execSync(`${MOZEIDON} tabs close ${tab.windowId}:${tab.id}`);
}

export function fetchOpenTabs(): TabState {
  const data = execSync(`${MOZEIDON} tabs`);
  const parsedTabs: { data: MozeidonTab[] } = JSON.parse(data.toString() || TABS_FALLBACK);
  return {
    type: TAB_TYPE.OPENED_TABS,
    tabs: parsedTabs.data.map(
      (mozTab) =>
        new Tab(
          mozTab.id.toString(),
          mozTab.pinned,
          mozTab.windowId,
          mozTab.title,
          mozTab.url,
          mozTab.domain,
          mozTab.active
        )
    ),
  };
}

export function fetchRecentlyClosedTabs(): TabState {
  const data = execSync(`${MOZEIDON} tabs --closed`);
  const parsedTabs: { data: MozeidonTab[] } = JSON.parse(data.toString() || TABS_FALLBACK);
  return {
    type: TAB_TYPE.RECENTLY_CLOSED,
    tabs: parsedTabs.data.map(
      (mozTab) =>
        new Tab(
          mozTab.id.toString(),
          mozTab.pinned,
          mozTab.windowId,
          mozTab.title,
          mozTab.url,
          mozTab.domain,
          mozTab.active
        )
    ),
  };
}

export async function* getBookmarksChunks() {
  const command = spawn(`${MOZEIDON} bookmarks -c 1000`, { shell: true });
  const chunks = readline.createInterface({ input: command.stdout });
  for await (const chunk of chunks) {
    const { data: parsedBookmarks }: { data: MozeidonBookmark[] } = JSON.parse(chunk);
    yield parsedBookmarks.map(
      (mozBookmark) => new Tab(mozBookmark.id, false, 0, mozBookmark.title, mozBookmark.url, mozBookmark.parent, false)
    );
  }
}

function openFirefox() {
  execSync(FIREFOX_OPEN_COMMAND);
}

/*
import { NOT_INSTALLED_MESSAGE } from "../constants";
const checkAppInstalled = async () => {
  const appInstalled = await runAppleScript(`
set isInstalled to false
try
    do shell script "osascript -e 'exists application \\"Firefox\\"'"
    set isInstalled to true
end try

return isInstalled`);
  if (appInstalled === "false") {
    throw new Error(NOT_INSTALLED_MESSAGE);
  }
};
*/
