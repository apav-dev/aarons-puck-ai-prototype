import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════════════
// Location ↔ Article
// ═══════════════════════════════════════════════════════════════════════

export const linkLocationArticle = mutation({
  args: {
    locationId: v.id("locations"),
    articleId: v.id("articles"),
  },
  handler: async (ctx, { locationId, articleId }) => {
    // Prevent duplicates
    const existing = await ctx.db
      .query("locationArticles")
      .withIndex("by_pair", (q) =>
        q.eq("locationId", locationId).eq("articleId", articleId)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("locationArticles", {
      locationId,
      articleId,
      createdAt: Date.now(),
    });
  },
});

export const unlinkLocationArticle = mutation({
  args: {
    locationId: v.id("locations"),
    articleId: v.id("articles"),
  },
  handler: async (ctx, { locationId, articleId }) => {
    const link = await ctx.db
      .query("locationArticles")
      .withIndex("by_pair", (q) =>
        q.eq("locationId", locationId).eq("articleId", articleId)
      )
      .first();
    if (link) await ctx.db.delete(link._id);
  },
});

export const syncLocationArticleOverrides = mutation({
  args: {
    overrides: v.array(
      v.object({
        locationIds: v.array(v.id("locations")),
        articleIds: v.array(v.id("articles")),
      })
    ),
  },
  handler: async (ctx, { overrides }) => {
    const locationIdSet = new Set<string>();
    for (const override of overrides) {
      for (const locationId of override.locationIds) {
        locationIdSet.add(locationId);
      }
    }

    for (const locationId of locationIdSet) {
      const links = await ctx.db
        .query("locationArticles")
        .withIndex("by_location", (q) => q.eq("locationId", locationId))
        .collect();
      for (const link of links) {
        await ctx.db.delete(link._id);
      }
    }

    for (const override of overrides) {
      const seenPairs = new Set<string>();
      for (const locationId of override.locationIds) {
        for (const articleId of override.articleIds) {
          const key = `${locationId}:${articleId}`;
          if (seenPairs.has(key)) continue;
          seenPairs.add(key);
          await ctx.db.insert("locationArticles", {
            locationId,
            articleId,
            createdAt: Date.now(),
          });
        }
      }
    }
  },
});

export const removeLocationArticleById = mutation({
  args: { id: v.id("locationArticles") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const articlesForLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, { locationId }) => {
    const links = await ctx.db
      .query("locationArticles")
      .withIndex("by_location", (q) => q.eq("locationId", locationId))
      .collect();
    const articles = await Promise.all(
      links.map(async (link) => {
        const article = await ctx.db.get(link.articleId);
        return article ? { ...article, _linkId: link._id } : null;
      })
    );
    return articles.filter(Boolean);
  },
});

export const locationsForArticle = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, { articleId }) => {
    const links = await ctx.db
      .query("locationArticles")
      .withIndex("by_article", (q) => q.eq("articleId", articleId))
      .collect();
    const locations = await Promise.all(
      links.map(async (link) => {
        const location = await ctx.db.get(link.locationId);
        return location ? { ...location, _linkId: link._id } : null;
      })
    );
    return locations.filter(Boolean);
  },
});

// ═══════════════════════════════════════════════════════════════════════
// Location ↔ Product
// ═══════════════════════════════════════════════════════════════════════

export const linkLocationProduct = mutation({
  args: {
    locationId: v.id("locations"),
    productId: v.id("products"),
  },
  handler: async (ctx, { locationId, productId }) => {
    const existing = await ctx.db
      .query("locationProducts")
      .withIndex("by_pair", (q) =>
        q.eq("locationId", locationId).eq("productId", productId)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("locationProducts", {
      locationId,
      productId,
      createdAt: Date.now(),
    });
  },
});

export const unlinkLocationProduct = mutation({
  args: {
    locationId: v.id("locations"),
    productId: v.id("products"),
  },
  handler: async (ctx, { locationId, productId }) => {
    const link = await ctx.db
      .query("locationProducts")
      .withIndex("by_pair", (q) =>
        q.eq("locationId", locationId).eq("productId", productId)
      )
      .first();
    if (link) await ctx.db.delete(link._id);
  },
});

export const syncLocationProductOverrides = mutation({
  args: {
    overrides: v.array(
      v.object({
        locationIds: v.array(v.id("locations")),
        productIds: v.array(v.id("products")),
      })
    ),
  },
  handler: async (ctx, { overrides }) => {
    const locationIdSet = new Set<string>();
    for (const override of overrides) {
      for (const locationId of override.locationIds) {
        locationIdSet.add(locationId);
      }
    }

    for (const locationId of locationIdSet) {
      const links = await ctx.db
        .query("locationProducts")
        .withIndex("by_location", (q) => q.eq("locationId", locationId))
        .collect();
      for (const link of links) {
        await ctx.db.delete(link._id);
      }
    }

    for (const override of overrides) {
      const seenPairs = new Set<string>();
      for (const locationId of override.locationIds) {
        for (const productId of override.productIds) {
          const key = `${locationId}:${productId}`;
          if (seenPairs.has(key)) continue;
          seenPairs.add(key);
          await ctx.db.insert("locationProducts", {
            locationId,
            productId,
            createdAt: Date.now(),
          });
        }
      }
    }
  },
});

export const removeLocationProductById = mutation({
  args: { id: v.id("locationProducts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const productsForLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, { locationId }) => {
    const links = await ctx.db
      .query("locationProducts")
      .withIndex("by_location", (q) => q.eq("locationId", locationId))
      .collect();
    const products = await Promise.all(
      links.map(async (link) => {
        const product = await ctx.db.get(link.productId);
        return product ? { ...product, _linkId: link._id } : null;
      })
    );
    return products.filter(Boolean);
  },
});

export const locationsForProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const links = await ctx.db
      .query("locationProducts")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    const locations = await Promise.all(
      links.map(async (link) => {
        const location = await ctx.db.get(link.locationId);
        return location ? { ...location, _linkId: link._id } : null;
      })
    );
    return locations.filter(Boolean);
  },
});

// ═══════════════════════════════════════════════════════════════════════
// Location ↔ Promotion
// ═══════════════════════════════════════════════════════════════════════

export const linkLocationPromotion = mutation({
  args: {
    locationId: v.id("locations"),
    promotionId: v.id("promotions"),
  },
  handler: async (ctx, { locationId, promotionId }) => {
    const existing = await ctx.db
      .query("locationPromotions")
      .withIndex("by_pair", (q) =>
        q.eq("locationId", locationId).eq("promotionId", promotionId)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("locationPromotions", {
      locationId,
      promotionId,
      createdAt: Date.now(),
    });
  },
});

export const unlinkLocationPromotion = mutation({
  args: {
    locationId: v.id("locations"),
    promotionId: v.id("promotions"),
  },
  handler: async (ctx, { locationId, promotionId }) => {
    const link = await ctx.db
      .query("locationPromotions")
      .withIndex("by_pair", (q) =>
        q.eq("locationId", locationId).eq("promotionId", promotionId)
      )
      .first();
    if (link) await ctx.db.delete(link._id);
  },
});

export const syncLocationPromotionOverrides = mutation({
  args: {
    overrides: v.array(
      v.object({
        locationIds: v.array(v.id("locations")),
        promotionIds: v.array(v.id("promotions")),
      })
    ),
  },
  handler: async (ctx, { overrides }) => {
    const locationIdSet = new Set<string>();
    for (const override of overrides) {
      for (const locationId of override.locationIds) {
        locationIdSet.add(locationId);
      }
    }

    for (const locationId of locationIdSet) {
      const links = await ctx.db
        .query("locationPromotions")
        .withIndex("by_location", (q) => q.eq("locationId", locationId))
        .collect();
      for (const link of links) {
        await ctx.db.delete(link._id);
      }
    }

    for (const override of overrides) {
      const seenPairs = new Set<string>();
      for (const locationId of override.locationIds) {
        for (const promotionId of override.promotionIds) {
          const key = `${locationId}:${promotionId}`;
          if (seenPairs.has(key)) continue;
          seenPairs.add(key);
          await ctx.db.insert("locationPromotions", {
            locationId,
            promotionId,
            createdAt: Date.now(),
          });
        }
      }
    }
  },
});

export const removeLocationPromotionById = mutation({
  args: { id: v.id("locationPromotions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const promotionsForLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, { locationId }) => {
    const links = await ctx.db
      .query("locationPromotions")
      .withIndex("by_location", (q) => q.eq("locationId", locationId))
      .collect();
    const promotions = await Promise.all(
      links.map(async (link) => {
        const promotion = await ctx.db.get(link.promotionId);
        return promotion ? { ...promotion, _linkId: link._id } : null;
      })
    );
    return promotions.filter(Boolean);
  },
});

export const locationsForPromotion = query({
  args: { promotionId: v.id("promotions") },
  handler: async (ctx, { promotionId }) => {
    const links = await ctx.db
      .query("locationPromotions")
      .withIndex("by_promotion", (q) => q.eq("promotionId", promotionId))
      .collect();
    const locations = await Promise.all(
      links.map(async (link) => {
        const location = await ctx.db.get(link.locationId);
        return location ? { ...location, _linkId: link._id } : null;
      })
    );
    return locations.filter(Boolean);
  },
});

// ═══════════════════════════════════════════════════════════════════════
// Article ↔ Product
// ═══════════════════════════════════════════════════════════════════════

export const linkArticleProduct = mutation({
  args: {
    articleId: v.id("articles"),
    productId: v.id("products"),
  },
  handler: async (ctx, { articleId, productId }) => {
    const existing = await ctx.db
      .query("articleProducts")
      .withIndex("by_pair", (q) =>
        q.eq("articleId", articleId).eq("productId", productId)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("articleProducts", {
      articleId,
      productId,
      createdAt: Date.now(),
    });
  },
});

export const unlinkArticleProduct = mutation({
  args: {
    articleId: v.id("articles"),
    productId: v.id("products"),
  },
  handler: async (ctx, { articleId, productId }) => {
    const link = await ctx.db
      .query("articleProducts")
      .withIndex("by_pair", (q) =>
        q.eq("articleId", articleId).eq("productId", productId)
      )
      .first();
    if (link) await ctx.db.delete(link._id);
  },
});

export const removeArticleProductById = mutation({
  args: { id: v.id("articleProducts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const productsForArticle = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, { articleId }) => {
    const links = await ctx.db
      .query("articleProducts")
      .withIndex("by_article", (q) => q.eq("articleId", articleId))
      .collect();
    const products = await Promise.all(
      links.map(async (link) => {
        const product = await ctx.db.get(link.productId);
        return product ? { ...product, _linkId: link._id } : null;
      })
    );
    return products.filter(Boolean);
  },
});

export const articlesForProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const links = await ctx.db
      .query("articleProducts")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    const articles = await Promise.all(
      links.map(async (link) => {
        const article = await ctx.db.get(link.articleId);
        return article ? { ...article, _linkId: link._id } : null;
      })
    );
    return articles.filter(Boolean);
  },
});

// ═══════════════════════════════════════════════════════════════════════
// Article ↔ Promotion
// ═══════════════════════════════════════════════════════════════════════

export const linkArticlePromotion = mutation({
  args: {
    articleId: v.id("articles"),
    promotionId: v.id("promotions"),
  },
  handler: async (ctx, { articleId, promotionId }) => {
    const existing = await ctx.db
      .query("articlePromotions")
      .withIndex("by_pair", (q) =>
        q.eq("articleId", articleId).eq("promotionId", promotionId)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("articlePromotions", {
      articleId,
      promotionId,
      createdAt: Date.now(),
    });
  },
});

export const unlinkArticlePromotion = mutation({
  args: {
    articleId: v.id("articles"),
    promotionId: v.id("promotions"),
  },
  handler: async (ctx, { articleId, promotionId }) => {
    const link = await ctx.db
      .query("articlePromotions")
      .withIndex("by_pair", (q) =>
        q.eq("articleId", articleId).eq("promotionId", promotionId)
      )
      .first();
    if (link) await ctx.db.delete(link._id);
  },
});

export const removeArticlePromotionById = mutation({
  args: { id: v.id("articlePromotions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const promotionsForArticle = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, { articleId }) => {
    const links = await ctx.db
      .query("articlePromotions")
      .withIndex("by_article", (q) => q.eq("articleId", articleId))
      .collect();
    const promotions = await Promise.all(
      links.map(async (link) => {
        const promotion = await ctx.db.get(link.promotionId);
        return promotion ? { ...promotion, _linkId: link._id } : null;
      })
    );
    return promotions.filter(Boolean);
  },
});

export const articlesForPromotion = query({
  args: { promotionId: v.id("promotions") },
  handler: async (ctx, { promotionId }) => {
    const links = await ctx.db
      .query("articlePromotions")
      .withIndex("by_promotion", (q) => q.eq("promotionId", promotionId))
      .collect();
    const articles = await Promise.all(
      links.map(async (link) => {
        const article = await ctx.db.get(link.articleId);
        return article ? { ...article, _linkId: link._id } : null;
      })
    );
    return articles.filter(Boolean);
  },
});

// ═══════════════════════════════════════════════════════════════════════
// Product ↔ Promotion
// ═══════════════════════════════════════════════════════════════════════

export const linkProductPromotion = mutation({
  args: {
    productId: v.id("products"),
    promotionId: v.id("promotions"),
  },
  handler: async (ctx, { productId, promotionId }) => {
    const existing = await ctx.db
      .query("productPromotions")
      .withIndex("by_pair", (q) =>
        q.eq("productId", productId).eq("promotionId", promotionId)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("productPromotions", {
      productId,
      promotionId,
      createdAt: Date.now(),
    });
  },
});

export const unlinkProductPromotion = mutation({
  args: {
    productId: v.id("products"),
    promotionId: v.id("promotions"),
  },
  handler: async (ctx, { productId, promotionId }) => {
    const link = await ctx.db
      .query("productPromotions")
      .withIndex("by_pair", (q) =>
        q.eq("productId", productId).eq("promotionId", promotionId)
      )
      .first();
    if (link) await ctx.db.delete(link._id);
  },
});

export const removeProductPromotionById = mutation({
  args: { id: v.id("productPromotions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const promotionsForProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const links = await ctx.db
      .query("productPromotions")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    const promotions = await Promise.all(
      links.map(async (link) => {
        const promotion = await ctx.db.get(link.promotionId);
        return promotion ? { ...promotion, _linkId: link._id } : null;
      })
    );
    return promotions.filter(Boolean);
  },
});

export const productsForPromotion = query({
  args: { promotionId: v.id("promotions") },
  handler: async (ctx, { promotionId }) => {
    const links = await ctx.db
      .query("productPromotions")
      .withIndex("by_promotion", (q) => q.eq("promotionId", promotionId))
      .collect();
    const products = await Promise.all(
      links.map(async (link) => {
        const product = await ctx.db.get(link.productId);
        return product ? { ...product, _linkId: link._id } : null;
      })
    );
    return products.filter(Boolean);
  },
});
