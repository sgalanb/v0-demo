import { GitStorage } from "@pierre/storage"

export const codeStorage = new GitStorage({
	name: process.env.CODE_STORAGE_ORG_NAME ?? "",
	key: process.env.CODE_STORAGE_API_KEY ?? "",
})
