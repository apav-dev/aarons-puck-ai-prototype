import { mutation } from "./_generated/server";
import { v } from "convex/values";

const slugifySegment = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const sampleLocations = [
  {
    name: "Galaxy Grill Downtown",
    address: { region: "CA", city: "San Francisco", line1: "123 Market St" },
  },
  {
    name: "Galaxy Grill Mission",
    address: { region: "CA", city: "San Francisco", line1: "482 Valencia St" },
  },
  {
    name: "Galaxy Grill Oakland",
    address: { region: "CA", city: "Oakland", line1: "780 Broadway" },
  },
  {
    name: "Galaxy Grill San Jose",
    address: { region: "CA", city: "San Jose", line1: "220 Santana Row" },
  },
  {
    name: "Galaxy Grill Sacramento",
    address: { region: "CA", city: "Sacramento", line1: "15 Capitol Mall" },
  },
  {
    name: "Galaxy Grill Seattle",
    address: { region: "WA", city: "Seattle", line1: "611 Pine St" },
  },
  {
    name: "Galaxy Grill Bellevue",
    address: { region: "WA", city: "Bellevue", line1: "300 Lincoln Sq" },
  },
  {
    name: "Galaxy Grill Portland",
    address: { region: "OR", city: "Portland", line1: "1001 NW Couch St" },
  },
  {
    name: "Galaxy Grill Denver",
    address: { region: "CO", city: "Denver", line1: "1550 Wewatta St" },
  },
  {
    name: "Galaxy Grill Austin",
    address: { region: "TX", city: "Austin", line1: "500 W 2nd St" },
  },
];

export const seedSampleLocations = mutation({
  args: {
    pageGroupSlug: v.optional(v.string()),
  },
  handler: async (ctx, { pageGroupSlug }) => {
    const slug = pageGroupSlug ?? "location";
    const existingLocations = await ctx.db
      .query("locations")
      .withIndex("by_page_group_slug", (q) => q.eq("pageGroupSlug", slug))
      .take(1);

    if (existingLocations.length > 0) {
      return { inserted: 0, skipped: true };
    }

    const now = Date.now();
    const pageGroup = await ctx.db
      .query("pageGroups")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!pageGroup) {
      await ctx.db.insert("pageGroups", {
        slug,
        createdAt: now,
        updatedAt: now,
      });
    }

    const cityPageGroup = await ctx.db
      .query("pageGroups")
      .withIndex("by_slug", (q) => q.eq("slug", "city"))
      .unique();

    if (!cityPageGroup) {
      await ctx.db.insert("pageGroups", {
        slug: "city",
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const location of sampleLocations) {
      await ctx.db.insert("locations", {
        pageGroupSlug: slug,
        name: location.name,
        address: location.address,
        slug: {
          region: slugifySegment(location.address.region),
          city: slugifySegment(location.address.city),
          line1: slugifySegment(location.address.line1),
        },
        createdAt: now,
        updatedAt: now,
      });
    }

    return { inserted: sampleLocations.length, skipped: false };
  },
});
