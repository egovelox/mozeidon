import { Port } from "../models/port"
import { Command } from "../models/command"
import { log } from "../logger"
import { Response } from "../models/response"
import { delay } from "../utils"

export function getGroups(port: Port, { command: _cmd }: Command) {
  chrome.tabGroups.query({}).then(async (groups) => {
    log("Sending back ", groups.length, " groups")
    port.postMessage(Response.data(groups))
    // pause 40ms, or this end message may be received before the message above
    await delay(40)
    return port.postMessage(Response.end())
  })
}

