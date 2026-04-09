import DevHelpers from "@/components/dev-helpers"
import { PageHeader } from "@/components/page-header"

export default async function ProjectPage() {
  return (
    <>
      <PageHeader
        currentBreadcrumb={{ label: "Dev Helpers" }}
        parentBreadcrumb={{ label: "Home", href: "/" }}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DevHelpers />
      </div>
    </>
  )
}
