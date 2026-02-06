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
    .index("by_slug", ["slug.region", "slug.city", "slug.line1"])
    .index("by_city", ["slug.region", "slug.city"]),

  pages: defineTable({
    path: v.string(),
    draftData: v.optional(v.any()),
    publishedData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_path", ["path"]),

  // ── New entity tables ──────────────────────────────────────────────

  articles: defineTable({
    image: v.optional(v.string()),
    title: v.string(),
    category: v.optional(v.string()),
    datePosted: v.number(),
    content: v.optional(v.string()),
    contentSummary: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_datePosted", ["datePosted"]),

  products: defineTable({
    image: v.optional(v.string()),
    name: v.string(),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_name", ["name"]),

  promotions: defineTable({
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // ── Junction / relationship tables ─────────────────────────────────
  // Each junction table has indexes on both foreign keys so queries
  // can be performed efficiently from either side of the relationship.

  locationArticles: defineTable({
    locationId: v.id("locations"),
    articleId: v.id("articles"),
    createdAt: v.number(),
  })
    .index("by_location", ["locationId"])
    .index("by_article", ["articleId"])
    .index("by_pair", ["locationId", "articleId"]),

  locationProducts: defineTable({
    locationId: v.id("locations"),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("by_location", ["locationId"])
    .index("by_product", ["productId"])
    .index("by_pair", ["locationId", "productId"]),

  locationPromotions: defineTable({
    locationId: v.id("locations"),
    promotionId: v.id("promotions"),
    createdAt: v.number(),
  })
    .index("by_location", ["locationId"])
    .index("by_promotion", ["promotionId"])
    .index("by_pair", ["locationId", "promotionId"]),

  articleProducts: defineTable({
    articleId: v.id("articles"),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_product", ["productId"])
    .index("by_pair", ["articleId", "productId"]),

  articlePromotions: defineTable({
    articleId: v.id("articles"),
    promotionId: v.id("promotions"),
    createdAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_promotion", ["promotionId"])
    .index("by_pair", ["articleId", "promotionId"]),

  productPromotions: defineTable({
    productId: v.id("products"),
    promotionId: v.id("promotions"),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_promotion", ["promotionId"])
    .index("by_pair", ["productId", "promotionId"]),
});
