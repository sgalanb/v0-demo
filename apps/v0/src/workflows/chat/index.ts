import { DurableAgent } from "@workflow/ai/agent"
import {
  convertToModelMessages,
  type ModelMessage,
  type UIMessage,
  type UIMessageChunk,
} from "ai"
import { getWorkflowMetadata, getWritable } from "workflow"
import { createSandboxTools } from "@/workflows/chat/tools"
import { chatMessageHook, getSystemPrompt } from "@/workflows/chat/utils"
import {
  writeRequestReceived,
  writeTurnEnd,
  writeUserMessageMarker,
} from "./writer"

/**
 * Multi-turn chat workflow.
 *
 * A single workflow handles the entire conversation session across multiple turns.
 * The workflow owns the conversation state, and follow-up messages are injected via hooks.
 */
export async function chat(
  initialMessages: UIMessage[],
  requestReceivedAt: number,
  project: { slug: string; branch: string }
) {
  "use workflow"

  const { workflowRunId: runId, workflowStartedAt } = getWorkflowMetadata()
  const writable = getWritable<UIMessageChunk>()
  const workflowStartTime = workflowStartedAt.getTime()

  await writeRequestReceived(writable, requestReceivedAt)

  // Convert UI messages to model messages for the agent
  const messages: ModelMessage[] = await convertToModelMessages(initialMessages)

  // Write markers for initial user messages (for replay purposes)
  let isFirstUserMessage = true
  for (const msg of initialMessages) {
    if (msg.role === "user") {
      const textContent = msg.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("")
      if (textContent) {
        await writeUserMessageMarker(writable, textContent, msg.id, {
          turnNumber: 1,
          turnStartedAt: workflowStartTime,
          workflowRunId: runId,
          workflowStartedAt: workflowStartTime,
          isFirstTurn: isFirstUserMessage,
        })
        isFirstUserMessage = false
      }
    }
  }

  const tools = await createSandboxTools(project)

  const agent = new DurableAgent({
    model: "anthropic/claude-haiku-4.5",
    system: getSystemPrompt(project),
    tools,
  })

  const hook = chatMessageHook.create({ token: runId })

  let turnNumber = 0
  let totalStepCount = 0

  // Main conversation loop
  while (true) {
    turnNumber++
    const turnStartTime = Date.now()

    const result = await agent.stream({
      messages,
      writable,
      preventClose: true,
      sendStart: turnNumber === 1,
      sendFinish: false,
    })

    const stepsForTurn = result.steps.map((step, index) => ({
      stepNumber: totalStepCount + index + 1,
      toolCalls: step.toolCalls?.map((tc) => tc.toolName) || [],
      finishReason: step.finishReason || "unknown",
      tokenUsage: step.usage,
    }))

    totalStepCount = await writeTurnEnd(
      writable,
      turnNumber,
      Date.now() - turnStartTime,
      stepsForTurn,
      totalStepCount
    )

    messages.push(...result.messages)

    // Wait for the next user message via the hook
    const { message: followUp } = await hook

    const nextTurnNumber = turnNumber + 1
    const followUpId = `user-${runId}-${nextTurnNumber}`

    await writeUserMessageMarker(writable, followUp, followUpId, {
      turnNumber: nextTurnNumber,
      turnStartedAt: Date.now(),
      workflowRunId: runId,
      workflowStartedAt: workflowStartTime,
      isFirstTurn: false,
    })

    messages.push({ role: "user", content: followUp })
  }
}
