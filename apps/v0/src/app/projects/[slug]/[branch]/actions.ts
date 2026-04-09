"use server"

import { Sandbox } from "@vercel/sandbox"

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes

export async function heartbeatSandbox(name: string) {
  const sandbox = await Sandbox.get({ name })
  await sandbox.extendTimeout(HEARTBEAT_INTERVAL_MS)
}
