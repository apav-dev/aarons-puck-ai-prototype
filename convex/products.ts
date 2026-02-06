import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("products")) },
  handler: async (ctx, { ids }) => {
    const records = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return records.filter(Boolean);
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", category))
      .collect();
  },
});

// ── Mutations ────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    image: v.optional(v.string()),
    name: v.string(),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("products", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Product not found");

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
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    // Remove all relationships first
    const locationLinks = await ctx.db
      .query("locationProducts")
      .withIndex("by_product", (q) => q.eq("productId", id))
      .collect();
    for (const link of locationLinks) {
      await ctx.db.delete(link._id);
    }

    const articleLinks = await ctx.db
      .query("articleProducts")
      .withIndex("by_product", (q) => q.eq("productId", id))
      .collect();
    for (const link of articleLinks) {
      await ctx.db.delete(link._id);
    }

    const promoLinks = await ctx.db
      .query("productPromotions")
      .withIndex("by_product", (q) => q.eq("productId", id))
      .collect();
    for (const link of promoLinks) {
      await ctx.db.delete(link._id);
    }

    await ctx.db.delete(id);
  },
});
