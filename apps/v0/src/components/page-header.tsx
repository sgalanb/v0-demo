import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

interface PageHeaderProps {
	currentBreadcrumb?: {
		label: string
	}
	parentBreadcrumb?: {
		label: string
		href?: string
	}
}

export function PageHeader({
	parentBreadcrumb,
	currentBreadcrumb,
}: PageHeaderProps) {
	const hasBreadcrumbs = parentBreadcrumb ?? currentBreadcrumb

	return (
		<header className="flex h-16 shrink-0 items-center gap-2">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				{hasBreadcrumbs && (
					<>
						<Separator
							className="mr-2 data-vertical:h-4 data-vertical:self-auto"
							orientation="vertical"
						/>
						<Breadcrumb>
							<BreadcrumbList>
								{parentBreadcrumb && (
									<>
										<BreadcrumbItem className="hidden md:block">
											{parentBreadcrumb.href ? (
												<BreadcrumbLink href={parentBreadcrumb.href}>
													{parentBreadcrumb.label}
												</BreadcrumbLink>
											) : (
												<BreadcrumbPage>
													{parentBreadcrumb.label}
												</BreadcrumbPage>
											)}
										</BreadcrumbItem>
										{currentBreadcrumb && (
											<BreadcrumbSeparator className="hidden md:block" />
										)}
									</>
								)}
								{currentBreadcrumb && (
									<BreadcrumbItem>
										<BreadcrumbPage>{currentBreadcrumb.label}</BreadcrumbPage>
									</BreadcrumbItem>
								)}
							</BreadcrumbList>
						</Breadcrumb>
					</>
				)}
			</div>
		</header>
	)
}
