/**
 * Server-side resolver for per-location content overrides.
 *
 * Puck's <Render> component does NOT call `resolveData` — that only runs
 * inside the <Puck> editor. On published pages we therefore need to resolve
 * per-location (and synced-dynamic) content overrides before handing the
 * data to <Render>.
 *
 * IMPORTANT: For perLocation mode, the junction table (e.g. `location_products`)
 * is the single source of truth — NOT the `contentSource.overrides` stored in
 * the page JSON. The overrides in the JSON are editor-UI metadata only and can
 * become stale relative to the junction table.
 */

import type { Data } from "@puckeditor/core";
import { getSupabaseClient } from "./supabase";
import type { ContentSourceValue } from "./fields/content-mode-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const filterValidUuids = (ids: string[]) => ids.filter((id) => UUID_RE.test(id));

type ComponentItem = {
  type: string;
  props: Record<string, unknown>;
  [key: string]: unknown;
};

// ---------------------------------------------------------------------------
// ProductsSection resolver
// ---------------------------------------------------------------------------

async function resolveProducts(
  props: Record<string, unknown>,
  locationId: string
): Promise<Record<string, unknown>> {
  const source = props.contentSource as ContentSourceValue | undefined;
  if (!source || source.source !== "dynamic") return props;

  const supabase = getSupabaseClient();
  const mode = source.dynamicMode === "perLocation" ? "perLocation" : "synced";

  // ---- synced mode ----
  if (mode === "synced") {
    const ids = filterValidUuids(source.selectedIds ?? []);
    if (!ids.length) return props;
    const { data } = await supabase.from("products").select("*").in("id", ids);
    const rows = (data ?? []) as Record<string, unknown>[];
    if (!rows.length) return props;
    // Preserve the user-chosen order
    const ordered = [
      ...ids.map((id) => rows.find((r) => String(r.id) === id)).filter(Boolean),
      ...rows.filter((r) => !ids.includes(String(r.id))),
    ] as Record<string, unknown>[];
    return { ...props, products: mapProducts(ordered) };
  }

  // ---- perLocation mode ----
  // Always use the junction table as the single source of truth.
  const { data: linkRows } = await supabase
    .from("location_products")
    .select("*, products(*)")
    .eq("location_id", locationId);

  const records = (
    (linkRows ?? []) as { products: Record<string, unknown> }[]
  )
    .map((row) => row.products)
    .filter(Boolean) as Record<string, unknown>[];

  if (!records.length) return props;
  return { ...props, products: mapProducts(records) };
}

function mapProducts(records: Record<string, unknown>[]) {
  return records.map((product) => ({
    title: String(product.name ?? "Product"),
    category: String(product.category ?? ""),
    description: String(product.description ?? ""),
    imageUrl: String(product.image ?? ""),
    link: "#",
    price:
      product.price == null ? undefined : `$${String(product.price)}`,
  }));
}

// ---------------------------------------------------------------------------
// PromoSection resolver
// ---------------------------------------------------------------------------

async function resolvePromo(
  props: Record<string, unknown>,
  locationId: string
): Promise<Record<string, unknown>> {
  const source = props.contentSource as ContentSourceValue | undefined;
  if (!source || source.source !== "dynamic") return props;

  const supabase = getSupabaseClient();
  const mode = source.dynamicMode === "perLocation" ? "perLocation" : "synced";

  let promotion: Record<string, unknown> | null = null;

  // ---- synced mode ----
  if (mode === "synced") {
    const selectedId = source.selectedId;
    if (!selectedId || !UUID_RE.test(selectedId)) return props;
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .eq("id", selectedId)
      .maybeSingle();
    promotion = data as Record<string, unknown> | null;
  } else {
    // ---- perLocation mode ----
    // Always use the junction table as the single source of truth.
    const { data: linkRows } = await supabase
      .from("location_promotions")
      .select("*, promotions(*)")
      .eq("location_id", locationId);
    const promotions = (
      (linkRows ?? []) as { promotions: Record<string, unknown> }[]
    )
      .map((row) => row.promotions)
      .filter(Boolean) as Record<string, unknown>[];
    promotion = promotions[0] ?? null;
  }

  if (!promotion) return props;

  return {
    ...props,
    title: String(promotion.name ?? props.title),
    description: String(promotion.description ?? props.description ?? ""),
    imageUrl: String(promotion.image ?? props.imageUrl ?? ""),
  };
}

// ---------------------------------------------------------------------------
// Component dispatch table
// ---------------------------------------------------------------------------

const resolvers: Record<
  string,
  (
    props: Record<string, unknown>,
    locationId: string
  ) => Promise<Record<string, unknown>>
> = {
  ProductsSection: resolveProducts,
  PromoSection: resolvePromo,
};

async function resolveComponent(
  item: ComponentItem,
  locationId: string
): Promise<ComponentItem> {
  const resolver = resolvers[item.type];
  if (!resolver) return item;

  const resolvedProps = await resolver(item.props, locationId);
  if (resolvedProps === item.props) return item;
  return { ...item, props: resolvedProps };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Walk every component in `data` and resolve per-location (or synced-dynamic)
 * content overrides for the given location.
 *
 * Returns a new Data object (the original is not mutated).
 */
export async function resolvePerLocationData(
  data: Data,
  locationId: string
): Promise<Data> {
  // Deep-clone so we never mutate the input
  const resolved: Data = JSON.parse(JSON.stringify(data));

  // Resolve components in the default content zone
  if (resolved.content) {
    resolved.content = await Promise.all(
      resolved.content.map((item) =>
        resolveComponent(item as ComponentItem, locationId)
      )
    );
  }

  // Resolve components in named zones (e.g. Flex zones, Grid zones, etc.)
  if (resolved.zones) {
    for (const zoneName of Object.keys(resolved.zones)) {
      resolved.zones[zoneName] = await Promise.all(
        resolved.zones[zoneName].map((item) =>
          resolveComponent(item as ComponentItem, locationId)
        )
      );
    }
  }

  return resolved;
}
