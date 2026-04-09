"use server"

import { codeStorage } from "@/lib/code-storage/client"

// version repos in case we need to change things in the future
const CURRENT_REPO_VERSION = "v1"
// explicit env to avoid duplicates across environments
const CURRENT_ENVIRONMENT =
  process.env.CURRENT_ENV === "development" ? "dev" : "prod"

export async function createRepo({
  id,
  defaultBranch,
}: {
  id?: string
  githubOwner: string
  githubRepo: string
  defaultBranch?: string
}) {
  await codeStorage.createRepo({
    id,
    defaultBranch,
  })
}

export async function createRepoFromTemplate({
  templateRepoId,
  newRepoId,
}: {
  templateRepoId: string
  newRepoId: string
}) {
  const newRepo = await codeStorage.createRepo({
    id: `${CURRENT_ENVIRONMENT}-${CURRENT_REPO_VERSION}-${newRepoId}`,
    baseRepo: { id: templateRepoId },
  })

  // make an empty commit to be able to pull the main branch
  // maybe a code storage bug?
  await newRepo
    .createCommit({
      targetBranch: "main",
      commitMessage: "enable main branch",
      author: { name: "v0", email: "v0@vercel.com" },
    })
    .addFileFromString("CLAUDE.md", "AGENTS.md")
    .send()
}

export async function getRepo(repoId: string) {
  const repo = await codeStorage.findOne({
    id: `${CURRENT_ENVIRONMENT}-${CURRENT_REPO_VERSION}-${repoId}`,
  })
  return repo
}

export async function deleteRepo(repoId: string) {
  await codeStorage.deleteRepo({
    id: `${CURRENT_ENVIRONMENT}-${CURRENT_REPO_VERSION}-${repoId}`,
  })
}

export async function createBranch({
  repoId,
  branchName,
}: {
  repoId: string
  branchName: string
}) {
  const repo = await codeStorage.findOne({
    id: `${CURRENT_ENVIRONMENT}-${CURRENT_REPO_VERSION}-${repoId}`,
  })

  if (!repo) {
    throw new Error("Repo not found")
  }

  await repo.createBranch({
    baseBranch: "main",
    targetBranch: branchName,
  })
}

export async function getBranches(repoId: string) {
  const repo = await getRepo(repoId)
  return repo
    ?.listBranches({
      limit: 50,
    })
    .then((res) => {
      return res.branches
    })
}

export async function getRepoUrl(repoId: string) {
  const repo = await getRepo(repoId)
  return await repo?.getRemoteURL({
    permissions: ["git:read", "git:write"],
    ttl: 157_784_760, // 5 years in seconds
  })
}
