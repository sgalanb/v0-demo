import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const projectsTable = v.object({
  name: v.string(),
  slug: v.string(),
  ownerId: v.string(),
})

export default defineSchema({
  projects: defineTable(projectsTable)
    .index("by_owner_id", ["ownerId"])
    .index("by_slug", ["slug"]),
})
