"use client"

import { useUser } from "@clerk/nextjs"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@workspace/ui/components/sidebar"
import { type Preloaded, usePreloadedQuery } from "convex/react"
import { SendIcon } from "lucide-react"
import type * as React from "react"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import type { api } from "@/lib/convex/_generated/api"

const data = {
  navSecondary: [
    {
      title: "Feedback & Questions",
      url: "https://x.com/sgalanb",
      icon: <SendIcon />,
    },
  ],
}

export function AppSidebar({
  preloadedProjects,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  preloadedProjects: Preloaded<typeof api.projects.getProjects>
}) {
  const { user } = useUser()
  const projects = usePreloadedQuery(preloadedProjects)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        <NavProjects projects={projects} userId={user?.id} />
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.fullName ?? "",
            email: user?.emailAddresses[0].emailAddress ?? "",
            avatar: user?.imageUrl ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
