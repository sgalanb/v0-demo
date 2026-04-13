"use client"

import { createBranch } from "@/lib/code-storage/actions"
import { formatRelativeTime } from "@/utils"
import type { BranchInfo } from "@pierre/storage"
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
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ProjectContent({
  slug,
  branches,
}: {
  slug: string
  branches: BranchInfo[]
}) {
  const router = useRouter()
  const [isNewBranchDialogOpen, setIsNewBranchDialogOpen] =
    useState<boolean>(false)
  const [newBranchName, setNewBranchName] = useState<string>("")
  const [isCreateBranchLoading, setIsCreateBranchLoading] =
    useState<boolean>(false)

  const handleCreateBranch = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsCreateBranchLoading(true)
      await createBranch({ repoId: slug, branchName: newBranchName })
      router.push(`/projects/${slug}/${newBranchName}`)
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreateBranchLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex w-full justify-between">
        <h1 className="font-semibold text-2xl">Branches</h1>
        <Dialog
          onOpenChange={(open) => {
            setIsNewBranchDialogOpen(open)
            if (!open) {
              setNewBranchName("")
            }
          }}
          open={isNewBranchDialogOpen}
        >
          <DialogTrigger
            render={
              <Button variant="outline">
                <PlusIcon className="size-4" />
                New Branch
              </Button>
            }
          />
          <DialogContent>
            <form className="contents" onSubmit={handleCreateBranch}>
              <DialogHeader>
                <DialogTitle>Create a New Branch</DialogTitle>
                <DialogDescription>
                  Make changes without affecting production.
                </DialogDescription>
              </DialogHeader>

              <FieldGroup>
                <Field>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="new-onboarding"
                    value={newBranchName}
                  />
                </Field>
              </FieldGroup>

              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline">Cancel</Button>}
                />
                <Button disabled={isCreateBranchLoading} type="submit">
                  {isCreateBranchLoading && (
                    <Loader2Icon className="absolute animate-spin" />
                  )}
                  <span className={isCreateBranchLoading ? "opacity-0" : ""}>
                    Create Branch
                  </span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full items-center gap-1 rounded-sm font-medium text-[13px] text-v0-gray-700 transition-all hover:text-v0-gray-900 focus-visible:text-v0-gray-900 focus-visible:ring-2 focus-visible:ring-v0-caveat-focus-ring-tab">
              Name
            </TableHead>
            <TableHead className="w-[100px] items-center gap-1 rounded-sm text-right font-medium text-[13px] text-v0-gray-700 transition-all hover:text-v0-gray-900 focus-visible:text-v0-gray-900 focus-visible:ring-2 focus-visible:ring-v0-caveat-focus-ring-tab">
              Created
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches
            ?.slice()
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            )
            .map((branch) => (
              <TableRow key={branch.name}>
                <TableCell
                  className="font-medium hover:cursor-pointer hover:underline"
                  onClick={() => {
                    router.push(`/projects/${slug}/${branch.name}`)
                  }}
                >
                  {branch.name}
                </TableCell>
                <TableCell className="text-right">
                  {formatRelativeTime(new Date(branch.createdAt))}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
