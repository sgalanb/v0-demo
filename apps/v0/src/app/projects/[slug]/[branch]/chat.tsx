"use client"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai/message"
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai/tool"
import { useMultiTurnChat } from "@/hooks/use-multi-turn-chat"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { isToolUIPart, type UIMessage } from "ai"
import { ArrowUpIcon, LoaderIcon } from "lucide-react"
import { useRef, useState } from "react"

const models = [
  { value: "claude-mythos", label: "Claude Mythos" },
  { value: "claude-sonnet-4.6", label: "Claude Sonnet 4" },
  { value: "claude-opus-4.6", label: "Claude Opus 4" },
  { value: "claude-haiku-4.5", label: "Claude Haiku 4" },
]

export default function Chat({
  slug,
  branch,
}: {
  slug: string
  branch: string
}) {
  const [model, setModel] = useState<string | null>(models[0]?.value ?? null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, pendingMessage, sendMessage, status } = useMultiTurnChat({
    slug,
    branch,
  })

  const isWaitingForResponse = pendingMessage !== null || status === "submitted"

  async function handleSubmit() {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }
    const text = textarea.value.trim()
    if (!text) {
      return
    }

    textarea.value = ""
    textarea.style.height = "auto"

    await sendMessage(text)
  }

  function adjustHeight() {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }
    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  return (
    <div className="flex min-h-0 w-full max-w-sm flex-col overflow-hidden">
      <Conversation className="min-h-0 flex-1">
        {messages.length === 0 && !pendingMessage ? (
          <ConversationEmptyState
            description="Ask anything about your project"
            title="Start a conversation"
          />
        ) : (
          <ConversationContent>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {pendingMessage && (
              <Message from="user">
                <MessageContent>
                  <MessageResponse>{pendingMessage}</MessageResponse>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
        )}
        <ConversationScrollButton />
      </Conversation>

      <div className="mb-4 flex flex-col overflow-hidden rounded-xl border bg-background">
        <textarea
          className="max-h-[156px] min-h-[96px] w-full resize-none bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground"
          onChange={adjustHeight}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Ask v0-demo…"
          ref={textareaRef}
        />
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: focus-forwarding UX */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: focus-forwarding UX */}
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: focus-forwarding UX */}
        <div
          className="flex cursor-text items-center justify-between px-3 pb-3"
          onClick={(e) => {
            const target = e.target as HTMLElement
            if (target.closest("button")) {
              return
            }
            textareaRef.current?.focus()
          }}
        >
          <Select onValueChange={setModel} value={model}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="rounded-full"
            disabled={isWaitingForResponse}
            onClick={handleSubmit}
            size="icon-sm"
          >
            {isWaitingForResponse ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ChatMessage({ message }: { message: UIMessage }) {
  return (
    <Message from={message.role}>
      <MessageContent>
        {message.parts.map((part, i) => {
          const key = `${message.id}-${i}`

          if (part.type === "text") {
            return <MessageResponse key={key}>{part.text}</MessageResponse>
          }

          if (isToolUIPart(part)) {
            const toolName =
              part.type === "dynamic-tool"
                ? part.toolName
                : part.type.replace("tool-", "")
            return (
              <Tool key={key}>
                <ToolHeader
                  state={part.state}
                  toolName={toolName}
                  type="dynamic-tool"
                />
                <ToolContent>
                  <ToolInput input={part.input} />
                  {"output" in part && (
                    <ToolOutput
                      errorText={
                        "errorText" in part ? part.errorText : undefined
                      }
                      output={"output" in part ? part.output : undefined}
                    />
                  )}
                </ToolContent>
              </Tool>
            )
          }

          return null
        })}
      </MessageContent>
    </Message>
  )
}
