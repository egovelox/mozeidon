import { runtime } from "webextension-polyfill"

export const BROWSER_FAMILY = getBrowserFamily()
export const ROOT_BOOKMARK_ID = getRootBookmarkId(BROWSER_FAMILY)
export const BOOKMARK_TYPE = "bookmark"
export const MAX_BOOKMARK_COUNT = 100000
export const MAX_HISTORY_ITEMS_COUNT = 100000

function getBrowserFamily() {
  const { manifest_version } = runtime.getManifest()

  switch (manifest_version) {
    case 2:
      return "firefox-family" as const
    case 3:
      return "chromium-family" as const
    default:
      return "firefox-family" as const
  }
}

function getRootBookmarkId(browser: "firefox-family" | "chromium-family") {
  switch (browser) {
    case "firefox-family":
      return "toolbar_____"
    case "chromium-family":
      return "1"
  }
}
