import { Port } from "../models/port"
import { Command } from "../models/command"
import { log } from "../logger"
import { Response } from "../models/response"
import { delay, handleError } from "../utils"
import browser from "webextension-polyfill"

export async function getWindows(port: Port, {}: Command) {
  try {
    log(`Starting getWindows`)
    // TODO : filtering certain window types ?
    const windowsPromise = browser.windows.getAll()
    const lastFocusedPromise = browser.windows.getLastFocused()
    const [windows, lastFocused] = await Promise.all([
      windowsPromise,
      lastFocusedPromise,
    ])
    log("Sending back ", windows.length, " windows")

    const returnedWindows = windows.map((window) => ({
      id: window.id,
      isLastFocused: window.id === lastFocused.id,
    }))

    port.postMessage(Response.data(returnedWindows))
    // pause 5ms, or this end message may be received before the message above
    await delay(5)
    return port.postMessage(Response.end())
  } catch (e) {
    return handleError(e, port)
  }
}
