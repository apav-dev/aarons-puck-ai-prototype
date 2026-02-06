import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("promotions").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("promotions") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("promotions")) },
  handler: async (ctx, { ids }) => {
    const records = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return records.filter(Boolean);
  },
});

// ── Mutations ────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("promotions", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("promotions"),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Promotion not found");

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
  args: { id: v.id("promotions") },
  handler: async (ctx, { id }) => {
    // Remove all relationships first
    const locationLinks = await ctx.db
      .query("locationPromotions")
      .withIndex("by_promotion", (q) => q.eq("promotionId", id))
      .collect();
    for (const link of locationLinks) {
      await ctx.db.delete(link._id);
    }

    const articleLinks = await ctx.db
      .query("articlePromotions")
      .withIndex("by_promotion", (q) => q.eq("promotionId", id))
      .collect();
    for (const link of articleLinks) {
      await ctx.db.delete(link._id);
    }

    const productLinks = await ctx.db
      .query("productPromotions")
      .withIndex("by_promotion", (q) => q.eq("promotionId", id))
      .collect();
    for (const link of productLinks) {
      await ctx.db.delete(link._id);
    }

    await ctx.db.delete(id);
  },
});
