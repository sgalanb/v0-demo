"use client"

import { useChat } from "@ai-sdk/react"
import { WorkflowChatTransport } from "@workflow/ai"
import type { ChatStatus, UIMessage } from "ai"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

function getStorageKey(slug: string, branch: string) {
  return `v0-demo-chat-run-id-${slug}-${branch}`
}

interface UserMessageData {
  type: "user-message"
  id: string
  content: string
  timestamp: number
}

function isUserMessageMarker(
  part: unknown,
): part is { type: "data-workflow"; data: UserMessageData } {
  if (typeof part !== "object" || part === null) return false
  const p = part as Record<string, unknown>
  if (p.type !== "data-workflow" || !("data" in p)) return false
  const data = p.data as Record<string, unknown>
  return data?.type === "user-message"
}

export interface UseMultiTurnChatOptions {
  slug: string
  branch: string
  onError?: (error: Error) => void
}

export interface UseMultiTurnChatReturn {
  messages: UIMessage[]
  status: ChatStatus
  error: Error | undefined
  runId: string | null
  pendingMessage: string | null
  sendMessage: (text: string) => Promise<void>
  stop: () => void
  endSession: () => Promise<void>
}

export function useMultiTurnChat({
  slug,
  branch,
  onError,
}: UseMultiTurnChatOptions): UseMultiTurnChatReturn {
  const storageKey = getStorageKey(slug, branch)

  const [runId, setRunId] = useState<string | null>(null)
  const [shouldResume, setShouldResume] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const sentMessagesRef = useRef<Set<string>>(new Set())
  const seenFromStreamRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRunId = localStorage.getItem(storageKey)
      if (storedRunId) {
        setRunId(storedRunId)
        setShouldResume(true)
      }
    }
  }, [storageKey])

  const transport = useMemo(
    () =>
      new WorkflowChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ api, messages, ...rest }) => ({
          ...rest,
          api,
          body: { messages, slug, branch },
        }),
        onChatSendMessage: (response) => {
          const workflowRunId = response.headers.get("x-workflow-run-id")
          if (workflowRunId) {
            setRunId(workflowRunId)
            localStorage.setItem(storageKey, workflowRunId)
          }
        },
        onChatEnd: () => {
          setRunId(null)
          localStorage.removeItem(storageKey)
          sentMessagesRef.current.clear()
          seenFromStreamRef.current.clear()
          setPendingMessage(null)
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        prepareReconnectToStreamRequest: ({ api, ...rest }) => {
          const storedRunId = localStorage.getItem(storageKey)
          if (!storedRunId) throw new Error("No active workflow run")
          return {
            ...rest,
            api: `/api/chat/${encodeURIComponent(storedRunId)}/stream`,
          }
        },
      }),
    [slug, branch, storageKey],
  )

  const {
    messages: rawMessages,
    sendMessage: baseSendMessage,
    status,
    error,
    stop,
    setMessages,
  } = useChat({
    resume: shouldResume,
    onError: (err) => {
      setPendingMessage(null)
      onError?.(err)
    },
    transport,
  })

  // Process messages: extract user messages from stream markers, deduplicate
  const messages = useMemo(() => {
    const result: UIMessage[] = []
    const seenMessageIds = new Set<string>()
    const seenObservabilityEvents = new Set<string>()

    for (const msg of rawMessages) {
      // Skip user messages from useChat — we reconstruct them from stream markers
      if (msg.role === "user") continue

      if (msg.role === "assistant") {
        let currentAssistantParts: typeof msg.parts = []
        let partIndex = 0

        for (const part of msg.parts) {
          if (isUserMessageMarker(part)) {
            const data = part.data
            if (seenMessageIds.has(data.id)) continue
            seenMessageIds.add(data.id)

            // Flush accumulated assistant parts
            if (currentAssistantParts.length > 0) {
              result.push({
                ...msg,
                id: `${msg.id}-part-${partIndex++}`,
                parts: currentAssistantParts,
              })
              currentAssistantParts = []
            }

            seenFromStreamRef.current.add(data.content)
            if (pendingMessage === data.content) {
              setPendingMessage(null)
            }

            result.push({
              id: data.id,
              role: "user",
              parts: [{ type: "text", text: data.content }],
            } as UIMessage)
            continue
          }

          // Deduplicate observability events
          if (
            typeof part === "object" &&
            part !== null &&
            "type" in part &&
            part.type === "data-workflow" &&
            "data" in part
          ) {
            const eventKey = JSON.stringify(part.data)
            if (seenObservabilityEvents.has(eventKey)) continue
            seenObservabilityEvents.add(eventKey)
          }

          currentAssistantParts.push(part)
        }

        if (currentAssistantParts.length > 0) {
          result.push({
            ...msg,
            id: partIndex > 0 ? `${msg.id}-part-${partIndex}` : msg.id,
            parts: currentAssistantParts,
          })
        }
      }
    }

    return result
  }, [rawMessages, pendingMessage])

  const sendFollowUp = useCallback(
    async (text: string) => {
      if (!runId) throw new Error("No active session")

      const sendKey = `${runId}-${text}-${Date.now()}`
      if (sentMessagesRef.current.has(sendKey)) return
      sentMessagesRef.current.add(sendKey)

      const response = await fetch(`/api/chat/${encodeURIComponent(runId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok) {
        sentMessagesRef.current.delete(sendKey)
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to send follow-up")
      }
    },
    [runId],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      setPendingMessage(text)
      try {
        if (runId) {
          await sendFollowUp(text)
        } else {
          await baseSendMessage({ text })
        }
      } catch (err) {
        setPendingMessage(null)
        throw err
      }
    },
    [runId, baseSendMessage, sendFollowUp],
  )

  const endSession = useCallback(async () => {
    setRunId(null)
    setShouldResume(false)
    localStorage.removeItem(storageKey)
    sentMessagesRef.current.clear()
    seenFromStreamRef.current.clear()
    setPendingMessage(null)
    setMessages([])
    stop()
  }, [storageKey, setMessages, stop])

  return {
    messages,
    status,
    error,
    runId,
    pendingMessage,
    sendMessage,
    stop,
    endSession,
  }
}
