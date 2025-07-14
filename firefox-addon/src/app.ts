import { ADDON_NAME } from "./config"
import { handler } from "./handler"
import { log } from "./logger"
import { Payload } from "./models/payload"
import { Port } from "./models/port"
import { delay } from "./utils"

log(`Starting ${ADDON_NAME} add-on`)
let port = browser.runtime.connectNative(ADDON_NAME)
log(`[${ADDON_NAME}] Connected with native application`, port)
listen(port)

function listen(port: Port) {
  port.onMessage.addListener((payload: Payload) => {
    log(
      `[${ADDON_NAME}] Got message from native application: ${JSON.stringify(payload)}`
    )

    const { payload: command } = payload
    handler(port, command)
  })

  port.onDisconnect.addListener(async (port) => {
    log(`[${ADDON_NAME}] Disconnected with native application`)
    log(`[${ADDON_NAME}] Broken port ?`, port)

    const delayMs = 1000
    log(`[${ADDON_NAME}] Waiting ${delayMs}ms before retry...`)
    await delay(delayMs)
    log(`[${ADDON_NAME}] Waited ${delayMs}ms...`)
    log(`[${ADDON_NAME}] Trying to reconnect to native application...`)
    port = browser.runtime.connectNative(ADDON_NAME)
    log(`[${ADDON_NAME}] Connected with native application`, port)
    listen(port)
  })
}
