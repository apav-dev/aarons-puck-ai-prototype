import { NextResponse } from "next/server";
import { getConvexClient, mutationRef } from "../../../../lib/convex";

export async function POST() {
  const client = getConvexClient();
  const result = await client.mutation(mutationRef("seed:seedSampleLocations"), {
    pageGroupSlug: "location",
  });

  return NextResponse.json(result);
}
