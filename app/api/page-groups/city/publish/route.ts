import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getConvexClient, mutationRef, queryRef } from "../../../../../lib/convex";

type CitySummary = {
  slug: {
    region: string;
    city: string;
  };
};

export async function POST(request: Request) {
  const { data } = await request.json();
  const client = getConvexClient();

  await client.mutation(mutationRef("pageGroups:publish"), {
    slug: "city",
    data,
  });

  const cities = (await client.query(queryRef("locations:listCities"), {
    pageGroupSlug: "location",
  })) as CitySummary[] | null;

  for (const city of cities ?? []) {
    const path = `/${city.slug.region}/${city.slug.city}`;
    revalidatePath(path);
  }

  return NextResponse.json({
    status: "ok",
    revalidated: cities?.length ?? 0,
  });
}
