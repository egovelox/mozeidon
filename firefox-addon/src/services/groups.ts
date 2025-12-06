import { Port } from "../models/port"
import { Command } from "../models/command"
import { log } from "../logger"
import { Response } from "../models/response"
import { delay } from "../utils"
import { GroupColor } from "../models/group-colors"

type Group = {
  id: string
  collapsed: boolean
  color: string
  windowId: number
  title: string
}
export function getGroups(port: Port, { command: _cmd }: Command) {
  (browser as any).tabGroups.query({}).then(async (groups: Group[]) => {
    log("Sending back ", groups.length, " groups")
    log("Sending back groups: ", JSON.stringify(groups))
    port.postMessage(Response.data(groups))
    // pause 10ms, or this end message may be received before the message above
    await delay(10)
    return port.postMessage(Response.end())
  })
}

export function updateGroup(port: Port, { args }: Command) {
  if (!args) {
    log("invalid args, received: ", args)
    return port.postMessage(Response.end())
  }
  const userArgs = args.split(":")
  const groupId = Number.parseInt(userArgs[0])
  const title = userArgs[1]
  const color = userArgs[2] as GroupColor
  const userProvidedCollapsed = userArgs[3]
  const collapsed = userProvidedCollapsed === "none"
    ? undefined
    : userProvidedCollapsed === "true"
    ? true
    : false;

  (browser as any).tabGroups.update(
    groupId,
    {
      collapsed: collapsed,
      color: color ? color : undefined,
      title: title ? title : undefined
    }
  ).then(async (group: unknown) => {
    log("Updated group ", JSON.stringify(group))
    return port.postMessage(Response.end())
  })
}

export function moveGroup(port: Port, { args }: Command) {
  log("move group", args)
  if (!args) {
    log("invalid args, received: ", args)
    return port.postMessage(Response.end())
  }
  const userArgs = args.split(":")
  const groupId = Number.parseInt(userArgs[0])
  const firstTabIndex = Number.parseInt(userArgs[1]);

  (browser as any).tabGroups.move(groupId, {index: firstTabIndex})
    .then(async (group: unknown) => {
    log("Moved group ", JSON.stringify(group))
    return port.postMessage(Response.end())
  })
}
