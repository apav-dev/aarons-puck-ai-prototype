import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("articles").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("articles") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_category", (q) => q.eq("category", category))
      .collect();
  },
});

// ── Mutations ────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    image: v.optional(v.string()),
    title: v.string(),
    category: v.optional(v.string()),
    datePosted: v.number(),
    content: v.optional(v.string()),
    contentSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("articles", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("articles"),
    image: v.optional(v.string()),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    datePosted: v.optional(v.number()),
    content: v.optional(v.string()),
    contentSummary: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Article not found");

    // Filter out undefined values so we only patch provided fields
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    updates.updatedAt = Date.now();

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, { id }) => {
    // Remove all relationships first
    const locationLinks = await ctx.db
      .query("locationArticles")
      .withIndex("by_article", (q) => q.eq("articleId", id))
      .collect();
    for (const link of locationLinks) {
      await ctx.db.delete(link._id);
    }

    const productLinks = await ctx.db
      .query("articleProducts")
      .withIndex("by_article", (q) => q.eq("articleId", id))
      .collect();
    for (const link of productLinks) {
      await ctx.db.delete(link._id);
    }

    const promoLinks = await ctx.db
      .query("articlePromotions")
      .withIndex("by_article", (q) => q.eq("articleId", id))
      .collect();
    for (const link of promoLinks) {
      await ctx.db.delete(link._id);
    }

    await ctx.db.delete(id);
  },
});
