import { Suspense } from "react"
import Chat from "@/app/projects/[slug]/[branch]/chat"
import Preview from "@/app/projects/[slug]/[branch]/preview"
import { PageHeader } from "@/components/page-header"

export default async function ProjectBranchPage({
  params,
}: {
  params: Promise<{ slug: string; branch: string }>
}) {
  const { slug, branch } = await params

  return (
    <>
      <PageHeader
        currentBreadcrumb={{ label: `${slug} - ${branch}` }}
        parentBreadcrumb={{ label: "Projects", href: "/projects" }}
      />
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
  return <div className="w-full flex-1 animate-pulse rounded-md bg-muted" />
}
