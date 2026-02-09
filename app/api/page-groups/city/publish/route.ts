import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "../../../../../lib/supabase";

export async function POST(request: Request) {
  const { data } = await request.json();
  const supabase = getSupabaseClient();

  await supabase.from("page_groups").upsert(
    {
      slug: "city",
      draft_data: data,
      published_data: data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );

  const { data: locationRows } = await supabase
    .from("locations")
    .select("slug")
    .eq("page_group_slug", "location");

  const citiesMap = new Map<string, { region: string; city: string }>();
  for (const row of locationRows ?? []) {
    const slug = row.slug as { region: string; city: string };
    const key = `${slug.region}:${slug.city}`;
    if (!citiesMap.has(key)) {
      citiesMap.set(key, slug);
    }
  }
  const cities = Array.from(citiesMap.values());

  for (const city of cities) {
    const path = `/${city.region}/${city.city}`;
    revalidatePath(path);
  }

  return NextResponse.json({
    status: "ok",
    revalidated: cities.length,
  });
}
