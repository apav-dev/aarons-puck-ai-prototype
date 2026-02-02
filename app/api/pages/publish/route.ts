import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getConvexClient, mutationRef } from "../../../../lib/convex";

export async function POST(request: Request) {
  const { data, path } = await request.json();
  const client = getConvexClient();

  await client.mutation(mutationRef("pages:publish"), {
    path,
    data,
  });

  revalidatePath(path);

  return NextResponse.json({ status: "ok" });
}
