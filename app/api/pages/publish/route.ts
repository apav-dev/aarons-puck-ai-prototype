import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const { data, path } = await request.json();
  const supabase = getSupabaseClient();

  await supabase.from("pages").upsert(
    {
      path,
      draft_data: data,
      published_data: data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "path" }
  );

  revalidatePath(path);

  return NextResponse.json({ status: "ok" });
}
