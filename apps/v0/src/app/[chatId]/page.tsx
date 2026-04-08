import { PageHeader } from "@/components/page-header"

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ chatId: string }>
}) {
	const { chatId } = await params
	return (
		<>
			<PageHeader
				currentBreadcrumb={{ label: `Chat ${chatId}` }}
				parentBreadcrumb={{ label: "Project", href: "/project-url" }}
			/>
			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				<div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
			</div>
		</>
	)
}
