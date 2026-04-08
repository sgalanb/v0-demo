import { codeStorage } from "@/lib/code-storage/client"

export async function createRepo({
  id,
  defaultBranch,
}: {
  id?: string
  githubOwner: string
  githubRepo: string
  defaultBranch?: string
}) {
  const repo = await codeStorage.createRepo({
    id,
    defaultBranch,
  })
  await repo.pullUpstream()
  return repo
}
