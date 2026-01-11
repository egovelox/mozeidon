import { Port } from "../models/port"
import { Command } from "../models/command"
import { log } from "../logger"
import { Response } from "../models/response"
import { delay, handleError } from "../utils"
import browser from "webextension-polyfill"
import { StoredProfile } from "src/models/registration"
import {
  MOZEIDON_ARGS_SEPARATOR,
  NO_VALUE,
  PROFILE_STORAGE_KEY,
} from "../constants"

export async function updateProfiles(port: Port, { args }: Command) {
  try {
    if (!args) {
      log("invalid args, received: ", args)
      return port.postMessage(Response.end())
    }
    const userArgs = args.split(MOZEIDON_ARGS_SEPARATOR)
    const profileRank = Number.parseInt(userArgs[0])
    const profileAlias = userArgs[1]
    const profileCommandAlias = userArgs[2]

    let storedProfile = (await browser.storage.local.get(
      PROFILE_STORAGE_KEY
    )) as { [PROFILE_STORAGE_KEY]: StoredProfile }
    log("successfully got stored profile")

    const { mozeidon_profile: profile } = storedProfile

    // -200 is the default, meaning the user did not send a value
    if (profileRank !== -200) {
      profile.rank = profileRank
    }
    // NO_VALUE is the default, meaning the user did not send a value
    if (profileAlias !== NO_VALUE) {
      profile.alias = profileAlias
    }
    if (profileCommandAlias !== NO_VALUE) {
      profile.commandAlias = profileCommandAlias
    }
    await browser.storage.local.set({
      [PROFILE_STORAGE_KEY]: profile,
    })

    port.postMessage(Response.data(profile))

    // pause 10ms, or this end message may be received before the message above
    await delay(10)
    log("successfully updated profile", JSON.stringify(profile))
    return port.postMessage(Response.end())
  } catch (e) {
    return handleError(e, port)
  }
}
