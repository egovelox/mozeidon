import * as readline from "node:readline";
import { runAppleScript } from "run-applescript";
import { MozeidonBookmark, MozeidonTab, Tab, TabState } from "../interfaces";
import { execSync, spawn } from "child_process";
import { MOZEIDON, TABS_FALLBACK, TAB_TYPE } from "../constants";

export async function openNewTab(queryText: string | null | undefined): Promise<void> {
  //await checkAppInstalled()
  execSync(`${MOZEIDON} tabs new -- ${queryText}`);
  await openFirefox()
}

export async function switchTab(tab: Tab): Promise<void> {
  //await checkAppInstalled()
  execSync(`${MOZEIDON} tabs switch ${tab.windowId}:${tab.id}`);
  await openFirefox()
}

export async function closeTab(tab: Tab): Promise<void> {
  //await checkAppInstalled()
  execSync(`${MOZEIDON} tabs close ${tab.windowId}:${tab.id}`);
}

export function fetchOpenTabs(): TabState {
  console.log("...fetching open tabs");
  const data = execSync(`${MOZEIDON} tabs --json`);
  const parsedTabs: { data: MozeidonTab[] } = JSON.parse(data.toString() || TABS_FALLBACK);
  return {
    type: TAB_TYPE.OPENED_TABS,
    tabs: parsedTabs.data.map(
      (mozTab) =>
        new Tab(mozTab.id.toString(), mozTab.pinned, mozTab.windowId, mozTab.title, mozTab.url, mozTab.domain, mozTab.active)
    ),
  };
}

export function fetchRecentlyClosedTabs(): TabState {
  console.log("...fetching recently closed tabs");
  const data = execSync(`${MOZEIDON} tabs --json --closed`);
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
    `${MOZEIDON} bookmarks --json`,
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

async function openFirefox() {
  return runAppleScript(`
    tell application "Firefox"
      activate
    end tell
  `);
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
