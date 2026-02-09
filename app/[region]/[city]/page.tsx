import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Data } from "@puckeditor/core";
import { Client } from "../../[...puckPath]/client";
import { getSupabaseClient } from "../../../lib/supabase";

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
  params: Promise<{ region: string; city: string }>;
}): Promise<Metadata> {
  const { region, city } = await params;
  const supabase = getSupabaseClient();
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("slug->>region", region)
    .eq("slug->>city", city);

  if (!locations || locations.length === 0) {
    return { title: "City directory" };
  }

  return {
    title: (locations[0].address as { city?: string })?.city,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ region: string; city: string }>;
}) {
  const { region, city } = await params;
  const supabase = getSupabaseClient();

  const { data: locationRows } = await supabase
    .from("locations")
    .select("*")
    .eq("slug->>region", region)
    .eq("slug->>city", city);

  if (!locationRows || locationRows.length === 0) {
    return notFound();
  }

  const locations: Location[] = locationRows.map((row) => ({
    id: row.id,
    name: row.name,
    address: row.address as Location["address"],
    slug: row.slug as Location["slug"],
  }));

  const { data: pageGroup } = await supabase
    .from("page_groups")
    .select("published_data")
    .eq("slug", "city")
    .maybeSingle();

  const data = (pageGroup?.published_data as Data | null | undefined) ?? null;

  if (!data) {
    return notFound();
  }

  const cityMetadata = {
    city: {
      region: locations[0].address.region,
      city: locations[0].address.city,
      slug: { region, city },
    },
    locations,
  };

  return <Client data={data} metadata={cityMetadata} />;
}

export const dynamic = "force-static";
