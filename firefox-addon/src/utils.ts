import { log } from "./logger"
import { Port } from "./models/port"
import { Response } from "./models/response"

export async function delay(milliSeconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliSeconds))
}

export function isDefined(input: unknown): boolean {
  return input !== undefined
}

export async function handleError(e: unknown, port: Port) {
  log(`handleError ${JSON.stringify(e)}`)

  let errorMessage = "[Error] Unknown error"

  if (e instanceof Error) {
    errorMessage = `[Error] ${e.message}`
  } else if (typeof e === "string") {
    errorMessage = `[Error] ${e}`
  } else if (e && typeof e === "object") {
    // Try to extract message from error-like objects
    const err = e as any
    if (err.message) {
      errorMessage = `[Error] ${err.message}`
    } else {
      errorMessage = `[Error] ${JSON.stringify(e)}`
    }
  }

  port.postMessage(Response.data(errorMessage))
  await delay(10)
  return port.postMessage(Response.end())
}
