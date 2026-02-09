import { Data } from "@puckeditor/core";
import { getSupabaseClient } from "./supabase";

export const getPage = async (
  path: string,
  mode: "draft" | "published" = "published"
) => {
  const supabase = getSupabaseClient();
  const { data: record } = await supabase
    .from("pages")
    .select("draft_data, published_data")
    .eq("path", path)
    .maybeSingle();

  if (!record) {
    return null;
  }

  const draftData = record.draft_data as Data | null | undefined;
  const publishedData = record.published_data as Data | null | undefined;

  if (mode === "draft") {
    return draftData ?? publishedData ?? null;
  }

  return publishedData ?? draftData ?? null;
};
