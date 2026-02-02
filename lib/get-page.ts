import { Data } from "@puckeditor/core";
import { getConvexClient, queryRef } from "./convex";

type PageRecord = {
  draftData?: Data;
  publishedData?: Data;
};

export const getPage = async (
  path: string,
  mode: "draft" | "published" = "published"
) => {
  const client = getConvexClient();
  const record = (await client.query(queryRef("pages:getByPath"), {
    path,
  })) as PageRecord | null;

  if (!record) {
    return null;
  }

  if (mode === "draft") {
    return record.draftData ?? record.publishedData ?? null;
  }

  return record.publishedData ?? record.draftData ?? null;
};
