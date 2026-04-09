import { Suspense } from "react"
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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<PreviewFallback />}>
          <Preview branch={branch} slug={slug} />
        </Suspense>
      </div>
    </>
  )
}

function PreviewFallback() {
  return <div className="w-full flex-1 animate-pulse rounded-md bg-muted" />
}
