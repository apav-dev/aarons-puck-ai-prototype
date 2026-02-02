import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Data } from "@puckeditor/core";
import { Client } from "../../../[...puckPath]/client";
import { getConvexClient, queryRef } from "../../../../lib/convex";

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
  params: Promise<{ region: string; city: string; line1: string }>;
}): Promise<Metadata> {
  const { region, city, line1 } = await params;
  const client = getConvexClient();
  const location = (await client.query(queryRef("locations:getBySlugs"), {
    regionSlug: region,
    citySlug: city,
    line1Slug: line1,
  })) as Location | null;

  return {
    title: location?.name,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ region: string; city: string; line1: string }>;
}) {
  const { region, city, line1 } = await params;
  const client = getConvexClient();

  const location = (await client.query(queryRef("locations:getBySlugs"), {
    regionSlug: region,
    citySlug: city,
    line1Slug: line1,
  })) as Location | null;

  if (!location) {
    return notFound();
  }

  const pageGroup = (await client.query(queryRef("pageGroups:getBySlug"), {
    slug: "location",
  })) as { publishedData?: Data } | null;

  const data = pageGroup?.publishedData;

  if (!data) {
    return notFound();
  }

  return <Client data={data} metadata={{ location }} />;
}

export const dynamic = "force-static";
