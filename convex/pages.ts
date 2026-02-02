import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByPath = query({
  args: { path: v.string() },
  handler: async (ctx, { path }) => {
    return await ctx.db
      .query("pages")
      .withIndex("by_path", (q) => q.eq("path", path))
      .unique();
  },
});

export const publish = mutation({
  args: { path: v.string(), data: v.any() },
  handler: async (ctx, { path, data }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("pages")
      .withIndex("by_path", (q) => q.eq("path", path))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        draftData: data,
        publishedData: data,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("pages", {
      path,
      draftData: data,
      publishedData: data,
      createdAt: now,
      updatedAt: now,
    });
  },
});
