import { v } from "convex/values"
import { mutation, query } from "@/convex/_generated/server"

export const createProject = mutation({
  args: {
    name: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const baseSlug = args.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    let slug = baseSlug
    let suffix = 1
    while (
      await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique()
    ) {
      slug = `${baseSlug}-${suffix}`
      suffix++
    }

    const project = await ctx.db.insert("projects", {
      name: args.name,
      ownerId: args.ownerId,
      slug,
    })
    return project
  },
})

export const getProjects = query({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", args.ownerId))
      .collect()
    return projects
  },
})

export const deleteProject = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return true
  },
})
