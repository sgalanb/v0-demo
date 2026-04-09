import { fetchQuery } from "convex/nextjs"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { getBranches } from "@/lib/code-storage/actions"
import { api } from "@/lib/convex/_generated/api"
import ProjectContent from "./content"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const project = await fetchQuery(api.projects.getProjectBySlug, {
    slug,
  })

  if (!project) {
    notFound()
  }

  const branches = await getBranches(project.slug)

  return (
    <>
      <PageHeader
        currentBreadcrumb={{ label: `${project.name ?? slug}` }}
        parentBreadcrumb={{ label: "Projects" }}
      />
      {branches && <ProjectContent branches={branches} slug={slug} />}{" "}
    </>
  )
}
