import { Command } from "../models/command"
import { Port } from "../models/port"
import { log } from "../logger"
import { Response } from "../models/response"
import { MAX_HISTORY_ITEMS_COUNT } from "../constants"
import { delay } from "../utils"

export function getHistory(port: Port, { args }: Command) {
  if (!args) {
    log("missing args in get-history")
    return port.postMessage(Response.end())
  }

  const receivedParams = args.split(":")
  if (receivedParams.length < 2) {
    log(
      `invalid args in get-history: received ${args}, expected a string combining two integers like "0:0"`
    )
    return port.postMessage(Response.end())
  }

  const maxInput = parseInt(receivedParams[0])
  const chunkSizeInput = parseInt(receivedParams[1])

  log(`chunkSize ${chunkSizeInput}`)
  log(`maxInput ${maxInput}`)

  browser.history
    .search({
      text: "",
      startTime: 0,
      maxResults: maxInput ? maxInput : MAX_HISTORY_ITEMS_COUNT,
    })
    .then(async (historyItems) => {
      log(
        `got ${historyItems.length} history items \n ${JSON.stringify(historyItems)}`
      )
      const startTime = Date.now()
      const chunkSize = chunkSizeInput
        ? chunkSizeInput
        : MAX_HISTORY_ITEMS_COUNT
      const chunks = []

      // chunk historyItems
      for (let i = 0; i < historyItems.length; i += chunkSize) {
        const chunk = historyItems.slice(i, i + chunkSize)
        chunks.push(chunk)
      }

      // no parallelism, maintain order of historyItems
      for (const chunk of chunks) {
        const items = chunk.map((item) => ({
          id: item.id,
          title: item.title ?? "missing title",
          url: item.url ?? "https://developer.mozilla.org",
          tc: item.typedCount ?? 0,
          vc: item.visitCount ?? 0,
          t: item.lastVisitTime ?? 0,
        }))
        //.slice(0, maxInput)

        port.postMessage(Response.data(items))
      }
      const endTime = Date.now()
      log(`sending back historyItems in ${endTime - startTime} ms`)
      // pause 100ms, or this end message may be received before the last chunk
      await delay(100)
      return port.postMessage(Response.end())
    })
}
