import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "../../../../../lib/supabase";

export async function POST(request: Request) {
  const { data } = await request.json();
  const supabase = getSupabaseClient();

  await supabase.from("page_groups").upsert(
    {
      slug: "location",
      draft_data: data,
      published_data: data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );

  const { data: locations } = await supabase
    .from("locations")
    .select("slug")
    .eq("page_group_slug", "location");

  for (const location of locations ?? []) {
    const slug = location.slug as { region: string; city: string; line1: string };
    const path = `/${slug.region}/${slug.city}/${slug.line1}`;
    revalidatePath(path);
  }

  return NextResponse.json({
    status: "ok",
    revalidated: locations?.length ?? 0,
  });
}
