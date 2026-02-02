import { query } from "./_generated/server";
import { v } from "convex/values";

export const listForGroup = query({
  args: { pageGroupSlug: v.string() },
  handler: async (ctx, { pageGroupSlug }) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_page_group_slug", (q) => q.eq("pageGroupSlug", pageGroupSlug))
      .collect();
  },
});

export const getBySlugs = query({
  args: {
    regionSlug: v.string(),
    citySlug: v.string(),
    line1Slug: v.string(),
  },
  handler: async (ctx, { regionSlug, citySlug, line1Slug }) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_slug", (q) =>
        q
          .eq("slug.region", regionSlug)
          .eq("slug.city", citySlug)
          .eq("slug.line1", line1Slug)
      )
      .first();
  },
});
