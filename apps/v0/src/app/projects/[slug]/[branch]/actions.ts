"use server"

import { Sandbox } from "@vercel/sandbox"
import { getSandboxName } from "@/app/projects/[slug]/[branch]/preview"

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes

export async function heartbeatSandbox(name: string) {
  const sandbox = await Sandbox.get({ name })
  await sandbox.extendTimeout(HEARTBEAT_INTERVAL_MS)
}

export async function commitChanges({
  message,
  slug,
  branch,
}: {
  message: string
  slug: string
  branch: string
}) {
  const sandbox = await Sandbox.get({ name: getSandboxName(slug, branch) })

  await sandbox.runCommand({
    cmd: "git",
    args: ["config", "user.email", "v0-demo@santigalan.com"],
  })

  await sandbox.runCommand({
    cmd: "git",
    args: ["config", "user.name", "v0-demo"],
  })

  await sandbox.runCommand({
    cmd: "git",
    args: ["add", "."],
  })

  await sandbox.runCommand({
    cmd: "git",
    args: ["commit", "-m", message],
  })

  await sandbox.runCommand({
    cmd: "git",
    args: ["push"],
  })
}

export async function revertChanges({
  slug,
  branch,
}: {
  slug: string
  branch: string
}) {
  const sandbox = await Sandbox.get({ name: getSandboxName(slug, branch) })

  await sandbox.runCommand({
    cmd: "git",
    args: ["restore", "."],
  })
}
