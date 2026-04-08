"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { useMutation } from "convex/react"
import {
  Loader2Icon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createRepoFromTemplate, deleteRepo } from "@/lib/code-storage/actions"
import { api } from "@/lib/convex/_generated/api"
import type { Doc } from "@/lib/convex/_generated/dataModel"

export function NavProjects({
  projects,
  userId,
}: {
  projects: Doc<"projects">[]
  userId?: string // technically optional, but we know it's always set
}) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const createProject = useMutation(api.projects.createProject)
  const deleteProject = useMutation(api.projects.deleteProject)

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState<boolean>(false)
  const [newProjectName, setNewProjectName] = useState<string>("")
  const [isCreateProjectLoading, setIsCreateProjectLoading] =
    useState<boolean>(false)

  const handleCreateProject = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsCreateProjectLoading(true)
      if (userId) {
        const project = await createProject({
          name: newProjectName,
          ownerId: userId,
        })
        await createRepoFromTemplate({
          templateRepoId: "nextjs-template",
          newRepoId: project.slug,
        })
        router.push(`/projects/${project.slug}`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreateProjectLoading(false)
      setIsCreateProjectOpen(false)
      setNewProjectName("")
    }
  }

  const handleDeleteProject = async (project: Doc<"projects">) => {
    try {
      await deleteProject({ id: project._id })

      await deleteRepo(project.slug)

      if (window.location.pathname === `/projects/${project.slug}`) {
        router.push("/")
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.slug}>
            <SidebarMenuButton render={<a href={`/projects/${item.slug}`} />}>
              {/* {item.icon} */}
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction
                    className="aria-expanded:bg-muted"
                    showOnHover
                  />
                }
              >
                <MoreHorizontalIcon />
                <span className="sr-only">More</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isMobile ? "end" : "start"}
                className="w-48"
                side={isMobile ? "bottom" : "right"}
              >
                {/* <DropdownMenuItem>
                  <FolderIcon className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShareIcon className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator /> */}
                <DropdownMenuItem onClick={() => handleDeleteProject(item)}>
                  <Trash2Icon className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <Dialog
            onOpenChange={(open) => {
              setIsCreateProjectOpen(open)
              if (!open) {
                setNewProjectName("")
              }
            }}
            open={isCreateProjectOpen}
          >
            <DialogTrigger render={<SidebarMenuButton />}>
              <PlusIcon />
              <span>New Project</span>
            </DialogTrigger>
            <DialogContent>
              <form className="contents" onSubmit={handleCreateProject}>
                <DialogHeader>
                  <DialogTitle>Create a New Project</DialogTitle>
                  <DialogDescription>
                    For now this is the only way to start a new project.
                  </DialogDescription>
                </DialogHeader>

                <FieldGroup>
                  <Field>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      onChange={(e) => setNewProjectName(e.target.value)}
                      value={newProjectName}
                    />
                  </Field>
                </FieldGroup>

                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline">Cancel</Button>}
                  />
                  <Button disabled={isCreateProjectLoading} type="submit">
                    {isCreateProjectLoading && (
                      <Loader2Icon className="absolute animate-spin" />
                    )}
                    <span className={isCreateProjectLoading ? "opacity-0" : ""}>
                      Create Project
                    </span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
