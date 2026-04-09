import { fetchQuery } from "convex/nextjs"
import { Loader2Icon } from "lucide-react"
import { Suspense } from "react"
import Chat from "@/app/projects/[slug]/[branch]/chat"
import CommitButton from "@/app/projects/[slug]/[branch]/commit-button"
import { CopyUrlButton } from "@/app/projects/[slug]/[branch]/copy-url-button"
import Preview from "@/app/projects/[slug]/[branch]/preview"
import { PageHeader } from "@/components/page-header"
import { getRepoUrl } from "@/lib/code-storage/actions"
import { api } from "@/lib/convex/_generated/api"

export default async function ProjectBranchPage({
  params,
}: {
  params: Promise<{ slug: string; branch: string }>
}) {
  const { slug, branch } = await params

  const project = await fetchQuery(api.projects.getProjectBySlug, {
    slug,
  })

  const repoUrl = await getRepoUrl(slug)

  if (!repoUrl) {
    throw new Error(`Repository not found: ${slug}`)
  }

  return (
    <>
      <div className="flex h-16 w-full items-center justify-between px-4">
        <div className="flex items-center">
          <PageHeader
            branchBreadcrumb={{
              label: branch,
              href: `/projects/${slug}/${branch}`,
            }}
            currentBreadcrumb={{
              label: `${project.name ?? slug}`,
              href: `/projects/${slug}`,
            }}
            parentBreadcrumb={{ label: "Projects" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <CopyUrlButton url={repoUrl} />
          <CommitButton branch={branch} slug={slug} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 gap-4 px-4">
        <Suspense fallback={<PreviewFallback />}>
          <Preview branch={branch} slug={slug} />
        </Suspense>

        <Chat branch={branch} slug={slug} />
      </div>
    </>
  )
}

function PreviewFallback() {
  return (
    <div className="mb-4 flex w-full flex-1 flex-col">
      <div className="flex w-full flex-1 items-center justify-center text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <Loader2Icon className="animate-spin" />
          <span>Loading preview</span>
        </div>
      </div>
    </div>
  )
}
