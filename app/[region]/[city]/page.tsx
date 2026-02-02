import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Data } from "@puckeditor/core";
import { Client } from "../../[...puckPath]/client";
import { getConvexClient, queryRef } from "../../../lib/convex";

type Location = {
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
  const client = getConvexClient();
  const locations = (await client.query(queryRef("locations:listByCitySlugs"), {
    regionSlug: region,
    citySlug: city,
  })) as Location[] | null;

  if (!locations || locations.length === 0) {
    return { title: "City directory" };
  }

  return {
    title: locations[0].address.city,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ region: string; city: string }>;
}) {
  const { region, city } = await params;
  const client = getConvexClient();

  const locations = (await client.query(queryRef("locations:listByCitySlugs"), {
    regionSlug: region,
    citySlug: city,
  })) as Location[] | null;

  if (!locations || locations.length === 0) {
    return notFound();
  }

  const pageGroup = (await client.query(queryRef("pageGroups:getBySlug"), {
    slug: "city",
  })) as { publishedData?: Data } | null;

  const data = pageGroup?.publishedData;

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
