import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const getConvexUrl = () => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL. Add it to your environment."
    );
  }
  return url;
};

export const getConvexClient = () => {
  return new ConvexHttpClient(getConvexUrl());
};

export const queryRef = (name: string) => {
  return makeFunctionReference<"query", Record<string, unknown>, unknown>(name);
};

export const mutationRef = (name: string) => {
  return makeFunctionReference<"mutation", Record<string, unknown>, unknown>(
    name
  );
};
