import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../lib/supabase";

const slugifySegment = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const sampleLocations = [
  { name: "Galaxy Grill Downtown", address: { region: "CA", city: "San Francisco", line1: "123 Market St" } },
  { name: "Galaxy Grill Mission", address: { region: "CA", city: "San Francisco", line1: "482 Valencia St" } },
  { name: "Galaxy Grill Oakland", address: { region: "CA", city: "Oakland", line1: "780 Broadway" } },
  { name: "Galaxy Grill San Jose", address: { region: "CA", city: "San Jose", line1: "220 Santana Row" } },
  { name: "Galaxy Grill Sacramento", address: { region: "CA", city: "Sacramento", line1: "15 Capitol Mall" } },
  { name: "Galaxy Grill Seattle", address: { region: "WA", city: "Seattle", line1: "611 Pine St" } },
  { name: "Galaxy Grill Bellevue", address: { region: "WA", city: "Bellevue", line1: "300 Lincoln Sq" } },
  { name: "Galaxy Grill Portland", address: { region: "OR", city: "Portland", line1: "1001 NW Couch St" } },
  { name: "Galaxy Grill Denver", address: { region: "CO", city: "Denver", line1: "1550 Wewatta St" } },
  { name: "Galaxy Grill Austin", address: { region: "TX", city: "Austin", line1: "500 W 2nd St" } },
];

export async function POST() {
  const supabase = getSupabaseClient();

  const { data: existing } = await supabase
    .from("locations")
    .select("id")
    .eq("page_group_slug", "location")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ inserted: 0, skipped: true });
  }

  const { error: pgLocation } = await supabase.from("page_groups").upsert(
    { slug: "location", updated_at: new Date().toISOString() },
    { onConflict: "slug" }
  );
  if (pgLocation) {
    return NextResponse.json({ error: pgLocation.message }, { status: 500 });
  }

  const { error: pgCity } = await supabase.from("page_groups").upsert(
    { slug: "city", updated_at: new Date().toISOString() },
    { onConflict: "slug" }
  );
  if (pgCity) {
    return NextResponse.json({ error: pgCity.message }, { status: 500 });
  }

  const rows = sampleLocations.map((loc) => ({
    page_group_slug: "location",
    name: loc.name,
    address: loc.address,
    slug: {
      region: slugifySegment(loc.address.region),
      city: slugifySegment(loc.address.city),
      line1: slugifySegment(loc.address.line1),
    },
  }));

  const { error: insertError } = await supabase.from("locations").insert(rows);
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: sampleLocations.length, skipped: false });
}
