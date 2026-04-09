import { Sandbox } from "@vercel/sandbox"
import { z } from "zod"

const CURRENT_SANDBOX_VERSION = "v1"
const CURRENT_ENVIRONMENT =
  process.env.CURRENT_ENV === "development" ? "dev" : "prod"

function getSandboxName(slug: string, branch: string) {
  return `${CURRENT_ENVIRONMENT}-${CURRENT_SANDBOX_VERSION}-${slug}-${branch}`
}

const MAX_OUTPUT_LENGTH = 30_000

function truncate(str: string): string {
  if (str.length > MAX_OUTPUT_LENGTH) {
    // biome-ignore lint/style/useTemplate: biome
    return str.slice(0, MAX_OUTPUT_LENGTH) + "\n... (output truncated)"
  }
  return str
}

export async function createSandboxTools(project: {
  slug: string
  branch: string
}) {
  const sandbox = await Sandbox.get({
    name: getSandboxName(project.slug, project.branch),
  })

  return {
    bash: {
      description:
        "Execute a bash command in the sandbox. Use this for reading files, writing files, installing packages, searching code, and any other shell operation.",
      inputSchema: z.object({
        command: z
          .string()
          .describe("The bash command to execute (e.g., cat src/app/page.tsx)"),
      }),
      execute: async ({ command }: { command: string }) => {
        const result = await sandbox.runCommand("bash", ["-c", command])
        const [stdout, stderr] = await Promise.all([
          result.stdout(),
          result.stderr(),
        ])
        return {
          exitCode: result.exitCode,
          stdout: truncate(stdout),
          stderr: truncate(stderr),
        }
      },
    },
  }
}
