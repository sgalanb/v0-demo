import { chatMessageHook } from "@/workflows/chat/utils"

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: runId } = await params
	const { message }: { message: string } = await req.json()

	await chatMessageHook.resume(runId, { message })

	return Response.json({ success: true })
}
