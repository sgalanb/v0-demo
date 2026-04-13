import { PreviewIFrame } from "@/app/projects/[slug]/[branch]/preview-iframe"
import { getRepoUrl } from "@/lib/code-storage/actions"
import { APIError, Sandbox } from "@vercel/sandbox"

// version sandboxes in case we need to change things in the future
export const CURRENT_SANDBOX_VERSION = "v1"
// explicit env to avoid duplicates across environments
export const CURRENT_ENVIRONMENT =
  process.env.CURRENT_ENV === "development" ? "dev" : "prod"

export function getSandboxName(slug: string, branch: string) {
  return `${CURRENT_ENVIRONMENT}-${CURRENT_SANDBOX_VERSION}-${slug}-${branch}`
}

async function tryGetSandbox(name: string): Promise<Sandbox | null> {
  try {
    return await Sandbox.get({ name })
  } catch (error) {
    if (error instanceof APIError && error.response.status === 404) {
      return null
    }
    throw error
  }
}

export default async function Preview({
  slug,
  branch,
}: {
  slug: string
  branch: string
}) {
  const name = getSandboxName(slug, branch)

  // Try to resume an existing persistent sandbox first
  const existingSandbox = await tryGetSandbox(name)

  if (existingSandbox) {
    await existingSandbox.runCommand({
      cmd: "pnpm",
      args: ["run", "dev"],
      detached: true,
      env: { WATCHPACK_POLLING: "true" },
    })

    return <PreviewIFrame name={name} src={existingSandbox.domain(3000)} />
  }

  const repoUrl = await getRepoUrl(slug)

  if (!repoUrl) {
    throw new Error(`Repository not found: ${slug}`)
  }

  const newSandbox = await Sandbox.create({
    name,
    source: {
      type: "git",
      url: repoUrl,
    },
    snapshotExpiration: 0, // no expiration
    timeout: 5 * 60 * 1000, // 5 minutes
    ports: [3000],
    resources: {
      vcpus: 4,
    },
  })

  // install pnpm
  await newSandbox.runCommand({
    cmd: "npm",
    args: ["install", "-g", "pnpm"],
  })

  // install dependencies
  await newSandbox.runCommand({
    cmd: "pnpm",
    args: ["install"],
  })

  // run dev server
  await newSandbox.runCommand({
    cmd: "pnpm",
    args: ["run", "dev"],
    // run in the background so this call returns once it's spawned
    detached: true,
  })

  return <PreviewIFrame name={name} src={newSandbox.domain(3000)} />
}
