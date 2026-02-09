import { Metadata } from "next";
import { Data } from "@puckeditor/core";
import { Client } from "./client";
import { getSupabaseClient } from "../../lib/supabase";

type PageGroupRow = {
  draft_data?: Data | null;
  published_data?: Data | null;
} | null;

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

type CitySummary = {
  region: string;
  city: string;
  slug: {
    region: string;
    city: string;
  };
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Puck: /edit" };
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ pageType?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageType =
    resolvedSearchParams?.pageType === "city" ? "city" : "location";
  const supabase = getSupabaseClient();

  const { data: pageGroup } = await supabase
    .from("page_groups")
    .select("draft_data, published_data")
    .eq("slug", pageType)
    .maybeSingle();

  const { data: locationsRows } = await supabase
    .from("locations")
    .select("*")
    .eq("page_group_slug", "location");

  const locations: Location[] = (locationsRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    address: row.address as Location["address"],
    slug: row.slug as Location["slug"],
  }));

  const citiesMap = new Map<string, CitySummary>();
  for (const loc of locations) {
    const key = `${loc.slug.region}:${loc.slug.city}`;
    if (!citiesMap.has(key)) {
      citiesMap.set(key, {
        region: loc.address.region,
        city: loc.address.city,
        slug: { region: loc.slug.region, city: loc.slug.city },
      });
    }
  }
  const cities = Array.from(citiesMap.values());

  const data =
    (pageGroup as PageGroupRow)?.draft_data ??
    (pageGroup as PageGroupRow)?.published_data ??
    ({ content: [], root: { props: {} }, zones: {} } as Data);

  return (
    <Client
      pageType={pageType}
      data={data}
      locations={locations}
      cities={cities}
    />
  );
}

export const dynamic = "force-dynamic";
