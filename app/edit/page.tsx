import { Metadata } from "next";
import { Data } from "@puckeditor/core";
import { Client } from "./client";
import { getConvexClient, queryRef } from "../../lib/convex";

type PageGroupRecord = { draftData?: Data; publishedData?: Data } | null;

type Location = {
  _id: string;
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
  const client = getConvexClient();

  const pageGroup = (await client.query(queryRef("pageGroups:getBySlug"), {
    slug: pageType,
  })) as PageGroupRecord;

  const locations = (await client.query(queryRef("locations:listForGroup"), {
    pageGroupSlug: "location",
  })) as Location[] | null;

  const cities = (await client.query(queryRef("locations:listCities"), {
    pageGroupSlug: "location",
  })) as CitySummary[] | null;

  const data =
    pageGroup?.draftData ??
    pageGroup?.publishedData ??
    ({ content: [], root: { props: {} }, zones: {} } as Data);

  return (
    <Client
      pageType={pageType}
      data={data}
      locations={locations ?? []}
      cities={cities ?? []}
    />
  );
}

export const dynamic = "force-dynamic";
