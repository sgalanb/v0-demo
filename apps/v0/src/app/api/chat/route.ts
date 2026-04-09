import { createUIMessageStreamResponse, type UIMessage } from "ai"
import { start } from "workflow/api"
import { chat } from "@/workflows/chat"

export async function POST(req: Request) {
	const {
		messages,
		slug,
		branch,
	}: { messages: UIMessage[]; slug: string; branch: string } = await req.json()

	const run = await start(chat, [messages, Date.now(), { slug, branch }])

	return createUIMessageStreamResponse({
		stream: run.readable,
		headers: {
			"x-workflow-run-id": run.runId,
		},
	})
}
