import { Metadata } from "next";
import { Data } from "@puckeditor/core";
import { Client } from "./client";
import { getConvexClient, queryRef } from "../../../lib/convex";

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

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Puck: /edit/location" };
}

export default async function Page() {
  const client = getConvexClient();
  const pageGroup = (await client.query(queryRef("pageGroups:getBySlug"), {
    slug: "location",
  })) as { draftData?: Data; publishedData?: Data } | null;

  const locations = (await client.query(queryRef("locations:listForGroup"), {
    pageGroupSlug: "location",
  })) as Location[] | null;

  const data =
    pageGroup?.draftData ??
    pageGroup?.publishedData ??
    ({ content: [], root: { props: {} }, zones: {} } as Data);

  return <Client data={data} locations={locations ?? []} />;
}

export const dynamic = "force-dynamic";
