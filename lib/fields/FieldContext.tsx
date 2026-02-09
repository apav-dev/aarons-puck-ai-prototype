"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase-field-helpers";

export type FieldLocation = {
  id: string;
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

type FieldContextValue = {
  location: FieldLocation | null;
  allLocations: FieldLocation[];
  supabaseClient: SupabaseClient;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export const FieldProvider = ({
  location,
  allLocations,
  children,
}: {
  location: FieldLocation | null;
  allLocations: FieldLocation[];
  children: ReactNode;
}) => {
  const supabaseClient = useMemo(() => getSupabaseBrowserClient(), []);

  return (
    <FieldContext.Provider
      value={{ location, allLocations, supabaseClient }}
    >
      {children}
    </FieldContext.Provider>
  );
};

export const useFieldContext = () => {
  const context = useContext(FieldContext);
  if (!context) {
    throw new Error("FieldContext is missing. Wrap with FieldProvider.");
  }
  return context;
};
