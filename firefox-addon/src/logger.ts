import { DEBUG } from "./config"

export function log(...args: any[]) {
  if (DEBUG) {
    console.log.apply(console, args)
  }
}
