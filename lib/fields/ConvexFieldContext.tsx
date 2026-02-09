"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { ConvexHttpClient } from "convex/browser";
import { getConvexBrowserClient } from "./convex-field-helpers";

export type ConvexFieldLocation = {
  _id: string;
  name?: string;
  address?: {
    region: string;
    city: string;
    line1: string;
  };
  slug?: {
    region: string;
    city: string;
    line1: string;
  };
};

type ConvexFieldContextValue = {
  location: ConvexFieldLocation | null;
  allLocations: ConvexFieldLocation[];
  convexClient: ConvexHttpClient;
};

const ConvexFieldContext = createContext<ConvexFieldContextValue | null>(null);

export const ConvexFieldProvider = ({
  location,
  allLocations,
  children,
}: {
  location: ConvexFieldLocation | null;
  allLocations: ConvexFieldLocation[];
  children: ReactNode;
}) => {
  const convexClient = useMemo(() => getConvexBrowserClient(), []);

  return (
    <ConvexFieldContext.Provider
      value={{ location, allLocations, convexClient }}
    >
      {children}
    </ConvexFieldContext.Provider>
  );
};

export const useConvexFieldContext = () => {
  const context = useContext(ConvexFieldContext);
  if (!context) {
    throw new Error("ConvexFieldContext is missing. Wrap with provider.");
  }
  return context;
};
