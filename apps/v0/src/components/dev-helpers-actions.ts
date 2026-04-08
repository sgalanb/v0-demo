"use server"

import { codeStorage } from "@/lib/code-storage/client"

export async function createNextjsTemplateRepo(repoId: string): Promise<{
  repoId: string
  remoteUrl: string
}> {
  const repo = await codeStorage.createRepo({ id: repoId })

  const remoteUrl = await repo.getRemoteURL({
    permissions: ["git:read", "git:write"],
  })

  return {
    repoId: repo.id,
    remoteUrl,
  }
}
