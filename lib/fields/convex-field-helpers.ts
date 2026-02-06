import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

export type ConvexFieldMode = "all" | "perLocation";

export type ConvexSingleValue = {
  mode: ConvexFieldMode;
  selectedId?: string;
  refresh?: number;
};

export type ConvexMultiValue = {
  mode: ConvexFieldMode;
  selectedIds?: string[];
  perLocationSelectedIds?: Record<string, string[]>;
  refresh?: number;
};

let browserClient: ConvexHttpClient | null = null;

const getConvexUrl = () => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL. Add it to your environment."
    );
  }
  return url;
};

export const getConvexBrowserClient = () => {
  if (!browserClient) {
    browserClient = new ConvexHttpClient(getConvexUrl());
  }
  return browserClient;
};

export const queryRef = (name: string) => {
  return makeFunctionReference<"query", Record<string, unknown>, unknown>(name);
};

export const mutationRef = (name: string) => {
  return makeFunctionReference<"mutation", Record<string, unknown>, unknown>(
    name
  );
};
