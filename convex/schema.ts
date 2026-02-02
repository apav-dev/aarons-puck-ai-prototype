import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pageGroups: defineTable({
    slug: v.string(),
    draftData: v.optional(v.any()),
    publishedData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),
  locations: defineTable({
    pageGroupSlug: v.string(),
    name: v.string(),
    address: v.object({
      region: v.string(),
      city: v.string(),
      line1: v.string(),
      line2: v.optional(v.string()),
      postalCode: v.optional(v.string()),
    }),
    slug: v.object({
      region: v.string(),
      city: v.string(),
      line1: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_page_group_slug", ["pageGroupSlug"])
    .index("by_slug", ["slug.region", "slug.city", "slug.line1"]),
  pages: defineTable({
    path: v.string(),
    draftData: v.optional(v.any()),
    publishedData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_path", ["path"]),
});
