import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getConvexClient, mutationRef, queryRef } from "../../../../../lib/convex";

type Location = {
  slug: {
    region: string;
    city: string;
    line1: string;
  };
};

export async function POST(request: Request) {
  const { data } = await request.json();
  const client = getConvexClient();

  await client.mutation(mutationRef("pageGroups:publish"), {
    slug: "location",
    data,
  });

  const locations = (await client.query(queryRef("locations:listForGroup"), {
    pageGroupSlug: "location",
  })) as Location[] | null;

  for (const location of locations ?? []) {
    const path = `/${location.slug.region}/${location.slug.city}/${location.slug.line1}`;
    revalidatePath(path);
  }

  return NextResponse.json({
    status: "ok",
    revalidated: locations?.length ?? 0,
  });
}
