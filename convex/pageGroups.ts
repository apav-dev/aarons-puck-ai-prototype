import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("pageGroups")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const publish = mutation({
  args: { slug: v.string(), data: v.any() },
  handler: async (ctx, { slug, data }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("pageGroups")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        draftData: data,
        publishedData: data,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("pageGroups", {
      slug,
      draftData: data,
      publishedData: data,
      createdAt: now,
      updatedAt: now,
    });
  },
});
