"use client"

import { Button } from "@workspace/ui/components/button"
import { useActionState } from "react"
import { createNextjsTemplateRepo } from "./dev-helpers-actions"

interface ActionState {
  message: string
  remoteUrl?: string
  repoId?: string
  status: "idle" | "success" | "error"
}

const initialState: ActionState = {
  status: "idle",
  message: "",
}

async function handleCreateRepo(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const repoId = formData.get("repoId") as string

  if (!repoId) {
    return { status: "error", message: "Repo ID is required" }
  }

  try {
    const result = await createNextjsTemplateRepo(repoId)
    return {
      status: "success",
      message: `Repo "${result.repoId}" created with remote URL ${result.remoteUrl}`,
      repoId: result.repoId,
      remoteUrl: result.remoteUrl,
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export default function DevHelpers() {
  const [state, formAction, isPending] = useActionState(
    handleCreateRepo,
    initialState,
  )

  return (
    <div className="flex flex-col gap-4">
      <h1>Dev Helpers</h1>
      <div className="flex flex-col gap-8">
        <form action={formAction} className="flex flex-col gap-2">
          <span>Create a repo in Code Storage</span>
          <input
            className="rounded border border-v0-alpha-400 bg-v0-background-300 px-3 py-2 text-sm"
            defaultValue="nextjs-base-template"
            name="repoId"
            placeholder="Repo ID"
            type="text"
          />
          <Button disabled={isPending} type="submit">
            {isPending ? "Creating..." : "Create Repo"}
          </Button>
          {state.status === "success" && (
            <p className="text-green-600 text-sm">{state.message}</p>
          )}
          {state.status === "error" && (
            <p className="text-red-600 text-sm">{state.message}</p>
          )}
        </form>
      </div>
    </div>
  )
}
