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

export const listByCitySlugs = query({
  args: {
    regionSlug: v.string(),
    citySlug: v.string(),
  },
  handler: async (ctx, { regionSlug, citySlug }) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_city", (q) =>
        q.eq("slug.region", regionSlug).eq("slug.city", citySlug)
      )
      .collect();
  },
});

export const listCities = query({
  args: { pageGroupSlug: v.string() },
  handler: async (ctx, { pageGroupSlug }) => {
    const locations = await ctx.db
      .query("locations")
      .withIndex("by_page_group_slug", (q) => q.eq("pageGroupSlug", pageGroupSlug))
      .collect();

    const unique = new Map<
      string,
      { region: string; city: string; slug: { region: string; city: string } }
    >();

    for (const location of locations) {
      const key = `${location.slug.region}:${location.slug.city}`;
      if (!unique.has(key)) {
        unique.set(key, {
          region: location.address.region,
          city: location.address.city,
          slug: {
            region: location.slug.region,
            city: location.slug.city,
          },
        });
      }
    }

    return Array.from(unique.values());
  },
});
