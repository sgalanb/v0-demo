import { type Infer, v } from "convex/values"
import { mutation, query } from "@/lib/convex/_generated/server"
import type { projectsTable } from "@/lib/convex/schema"

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

    await ctx.db.insert("projects", {
      name: args.name,
      ownerId: args.ownerId,
      slug,
    })

    return {
      name: args.name,
      slug,
      ownerId: args.ownerId,
    } satisfies Infer<typeof projectsTable>
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

export const getProjectBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()
    return project
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
