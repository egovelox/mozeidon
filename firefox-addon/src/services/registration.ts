import { RegistrationInfo, StoredProfile } from "../models/registration"
import { Port } from "../models/port"
import browser from "webextension-polyfill"
import { Response } from "../models/response"
import { PROFILE_STORAGE_KEY } from "../constants"
import { log } from "../logger"

export async function register(port: Port): Promise<RegistrationInfo> {
  const browserInfo = await BrowserDetector.getBrowserInfo()
  const browserName = browserInfo.browser
  const profile = await getOrCreateProfile({
    browserName,
  })
  const registration: RegistrationInfo = {
    browserName,
    browserEngine: browserInfo.engine,
    browserVersion: browserInfo.version,
    profileId: profile.id,
    profileName: profile.name,
    profileAlias: profile.alias,
    profileCommandAlias: profile.commandAlias,
    profileRank: profile.rank,
    registeredAt: new Date(Date.now()).toISOString(),
    userAgent: navigator.userAgent,
  }
  port.postMessage(Response.data(registration))
  return registration
}

async function getOrCreateProfile({
  browserName,
}: {
  browserName: string
}): Promise<StoredProfile> {
  // Storage is isolated per profile
  const stored = await browser.storage.local.get(PROFILE_STORAGE_KEY)

  if (stored.mozeidon_profile_id) {
    return stored as StoredProfile
  }

  // First time in this profile - generate new UUID
  const newProfileId = crypto.randomUUID()
  const profile: StoredProfile = {
    id: newProfileId,
    name: browserName,
    alias: "",
    rank: 1,
    commandAlias: "",
  }
  await browser.storage.local.set({
    [PROFILE_STORAGE_KEY]: profile,
  })

  return profile
}

type BrowserInfo = {
  engine: "gecko" | "chromium" | "unknown"
  browser: string
  version: string
}

type ChromiumBrowserDetection = {
  name: string // user-facing browser name
  global?: string // global object to check on window
  uaSubstring?: string // UA substring fallback
}

class BrowserDetector {
  public info: BrowserInfo

  /** Supported Chromium-based browsers */
  private chromiumBrowsers: ChromiumBrowserDetection[] = [
    { name: "brave", global: "brave" },
    { name: "edge", uaSubstring: "Edg" },
    { name: "opera", global: "opr" },
    { name: "vivaldi", global: "vivaldi" },
    { name: "arc", uaSubstring: "Arc" },
    { name: "chrome" }, // default fallback
  ]

  private constructor() {
    this.info = {
      engine: "unknown",
      browser: "unknown",
      version: "unknown",
    }
  }

  public static async getBrowserInfo() {
    return new BrowserDetector().detect()
  }

  /** Detect engine, browser, and version */
  private async detect(): Promise<BrowserInfo> {
    // 1.Gecko / Firefox family
    if (
      typeof browser !== "undefined" &&
      browser.runtime &&
      browser.runtime.getBrowserInfo
    ) {
      this.info.engine = "gecko"

      try {
        const uaData = (navigator as any).userAgentData
        if (uaData && Array.isArray(uaData.brands)) {
          const brand = uaData.brands.find(
            (b: any) =>
              b.brand.toLowerCase() !== "firefox" &&
              !this.isGreaseString(b.brand)
          )
          if (brand) {
            this.info.browser = brand.brand
            this.info.version = brand.version || "unknown"
            return this.info
          }
        }
      } catch (err) {
        console.warn("Failed to read navigator.userAgentData for Gecko:", err)
      }

      try {
        const bf = await browser.runtime.getBrowserInfo()
        this.info.browser = bf.name || "firefox"
        this.info.version = bf.version || "unknown"
      } catch (err) {
        console.warn("Failed to get Gecko browser info:", err)
        this.info.browser = "firefox"
        this.info.version = "unknown"
      }
      return this.info
    }

    // 2.Chromium family
    this.info.engine = "chromium"

    // Try navigator.userAgentData first
    try {
      const uaData = (navigator as any).userAgentData
      if (uaData && Array.isArray(uaData.brands)) {
        const brand = uaData.brands.find(
          (b: any) => b.brand !== "Chromium" && !this.isGreaseString(b.brand)
        )
        if (brand) {
          this.info.browser = brand.brand || "chrome"
          this.info.version = brand.version || this.getVersionFromUA()
          return this.info
        }
      }
    } catch (err) {
      console.warn("Failed to read navigator.userAgentData:", err)
    }

    // 3.Fallback: check globals and UA substrings
    for (const b of this.chromiumBrowsers) {
      try {
        if (b.global && (window as any)[b.global] !== undefined) {
          this.info.browser = b.name
          this.info.version = this.getVersionFromUA()
          return this.info
        }
        if (b.uaSubstring && navigator.userAgent.includes(b.uaSubstring)) {
          this.info.browser = b.name
          this.info.version = this.getVersionFromUA()
          return this.info
        }
      } catch {
        // ignore errors, continue fallback
      }
    }

    this.info.browser = "chrome"
    this.info.version = this.getVersionFromUA()
    return this.info
  }

  /** Extract version from userAgent string safely */
  private getVersionFromUA(): string {
    try {
      const ua = navigator.userAgent || ""
      const match = ua.match(/(Chrome|Edg|Opera|Vivaldi|Arc)\/(\d+(\.\d+)+)/)
      if (match && match[2]) return match[2]
    } catch (err) {
      log("UA parsing failed:", err)
    }
    return "unknown"
  }

  private isGreaseString(brand: string): boolean {
    return (
      brand.startsWith("Not") ||
      brand.startsWith(" Not") ||
      brand.includes("(") ||
      brand.includes(";")
    )
  }
}
