"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { GitCommitIcon, Loader2Icon } from "lucide-react"
import { useState } from "react"
import { commitChanges } from "@/app/projects/[slug]/[branch]/actions"

export default function CommitButton({
  slug,
  branch,
}: {
  slug: string
  branch: string
}) {
  const [isCommitOpen, setIsCommitOpen] = useState<boolean>(false)
  const [commitMessage, setCommitMessage] = useState<string>("")
  const [isCommitLoading, setIsCommitLoading] = useState<boolean>(false)

  const handleCommit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsCommitLoading(true)
      await commitChanges({
        message: commitMessage,
        slug,
        branch,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsCommitLoading(false)
      setIsCommitOpen(false)
      setCommitMessage("")
    }
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsCommitOpen(open)
        if (!open) {
          setCommitMessage("")
        }
      }}
      open={isCommitOpen}
    >
      <DialogTrigger render={<Button />}>
        <GitCommitIcon />
        <span>Commit Changes</span>
      </DialogTrigger>
      <DialogContent>
        <form className="contents" onSubmit={handleCommit}>
          <DialogHeader>
            <DialogTitle>Commit Changes</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                name="message"
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="improve footer"
                value={commitMessage}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button disabled={isCommitLoading} type="submit">
              {isCommitLoading && (
                <Loader2Icon className="absolute animate-spin" />
              )}
              <span className={isCommitLoading ? "opacity-0" : ""}>
                Commit Changes
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
