import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Data } from "@puckeditor/core";
import { Client } from "../../../[...puckPath]/client";
import { getSupabaseClient } from "../../../../lib/supabase";
import { resolvePerLocationData } from "../../../../lib/resolve-per-location";

type Location = {
  id: string;
  name: string;
  address: {
    region: string;
    city: string;
    line1: string;
  };
  slug: {
    region: string;
    city: string;
    line1: string;
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string; city: string; line1: string }>;
}): Promise<Metadata> {
  const { region, city, line1 } = await params;
  const supabase = getSupabaseClient();
  const { data: locationRow } = await supabase
    .from("locations")
    .select("*")
    .eq("slug->>region", region)
    .eq("slug->>city", city)
    .eq("slug->>line1", line1)
    .maybeSingle();

  return {
    title: locationRow?.name,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ region: string; city: string; line1: string }>;
}) {
  const { region, city, line1 } = await params;
  const supabase = getSupabaseClient();

  const { data: locationRow } = await supabase
    .from("locations")
    .select("*")
    .eq("slug->>region", region)
    .eq("slug->>city", city)
    .eq("slug->>line1", line1)
    .maybeSingle();

  if (!locationRow) {
    return notFound();
  }

  const location: Location = {
    id: locationRow.id,
    name: locationRow.name,
    address: locationRow.address as Location["address"],
    slug: locationRow.slug as Location["slug"],
  };

  const { data: pageGroup } = await supabase
    .from("page_groups")
    .select("published_data")
    .eq("slug", "location")
    .maybeSingle();

  const rawData = (pageGroup?.published_data as Data | null | undefined) ?? null;

  if (!rawData) {
    return notFound();
  }

  // Resolve per-location content overrides server-side.
  // Puck's <Render> does not call resolveData, so we must resolve here.
  const data = await resolvePerLocationData(rawData, location.id);

  return <Client data={data} metadata={{ location }} />;
}

export const dynamic = "force-static";
