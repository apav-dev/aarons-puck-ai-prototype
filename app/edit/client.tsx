"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Data, Puck } from "@puckeditor/core";
import { PuckHeader, PuckHeaderActions } from "./PuckHeader";
import { useRouter, useSearchParams } from "next/navigation";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import headingAnalyzer from "@puckeditor/plugin-heading-analyzer";
import "./puck-layer.css";
import { cityPagesConfig, fullPagesConfig } from "../../puck.config";
import themePlugin from "../../theme-plugin/ThemePlugin";
import { ConvexFieldProvider } from "../../lib/fields/ConvexFieldContext";

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

type CitySummary = {
  region: string;
  city: string;
  slug: {
    region: string;
    city: string;
  };
};

type PageType = "location" | "city";

const aiPlugin = createAiPlugin();

const getCityKey = (city: CitySummary) =>
  `${city.slug.region}:${city.slug.city}`;

const getDraftStorageKey = (pageType: PageType) =>
  `puck:edit:draft:${pageType}`;
const themeStorageKey = "puck:edit:theme";

const readStorageJson = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeStorageJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const removeStorageKey = (key: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
};

const applyThemeDraft = (
  baseData: Partial<Data>,
  themeDraft: unknown | null
): Partial<Data> => {
  if (!themeDraft) return baseData;
  const currentTheme = (baseData?.root?.props as { theme?: unknown } | undefined)
    ?.theme;
  if (currentTheme === themeDraft) return baseData;
  return {
    ...baseData,
    root: {
      ...(baseData.root ?? {}),
      props: {
        ...(baseData.root?.props ?? {}),
        theme: themeDraft,
      } as Record<string, unknown>,
    },
  };
};

export function Client({
  pageType,
  data,
  locations,
  cities,
}: {
  pageType: PageType;
  data: Partial<Data>;
  locations: Location[];
  cities: CitySummary[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionDrafts = useRef<Record<PageType, Partial<Data> | null>>({
    location: null,
    city: null,
  });
  const sessionTheme = useRef<unknown | null>(null);
  const [localData, setLocalData] = useState<Partial<Data> | null>(null);
  const [localTheme, setLocalTheme] = useState<unknown | null>(null);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [puckKey, setPuckKey] = useState(0);
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>(
    locations[0]?._id
  );
  const [selectedCityKey, setSelectedCityKey] = useState<string>(() =>
    cities[0] ? getCityKey(cities[0]) : ""
  );

  useEffect(() => {
    if (!selectedLocationId && locations[0]?._id) {
      setSelectedLocationId(locations[0]._id);
    }
  }, [locations, selectedLocationId]);

  useEffect(() => {
    if (!selectedCityKey && cities[0]) {
      setSelectedCityKey(getCityKey(cities[0]));
    }
  }, [cities, selectedCityKey]);

  useEffect(() => {
    const storageKey = getDraftStorageKey(pageType);
    const storedDraft = readStorageJson<Partial<Data>>(storageKey);
    const storedTheme = readStorageJson<unknown>(themeStorageKey);
    const fallbackDraft = sessionDrafts.current[pageType];
    const fallbackTheme = sessionTheme.current;

    if (storedDraft) {
      sessionDrafts.current[pageType] = storedDraft;
    }
    if (storedTheme) {
      sessionTheme.current = storedTheme;
    }

    setLocalData(storedDraft ?? fallbackDraft ?? data);
    setLocalTheme(storedTheme ?? fallbackTheme ?? null);
    setHasLocalChanges(Boolean(storedDraft || storedTheme));
    setPuckKey((prev) => prev + 1);
  }, [data, pageType]);

  const selectedLocation = useMemo(() => {
    return locations.find((location) => location._id === selectedLocationId);
  }, [locations, selectedLocationId]);

  const selectedCity = useMemo(() => {
    return cities.find((city) => getCityKey(city) === selectedCityKey);
  }, [cities, selectedCityKey]);

  const cityLocations = useMemo(() => {
    if (!selectedCity) return [];
    return locations.filter(
      (location) =>
        location.slug.region === selectedCity.slug.region &&
        location.slug.city === selectedCity.slug.city
    );
  }, [locations, selectedCity]);

  const previewPath =
    pageType === "location"
      ? selectedLocation
        ? `/${selectedLocation.slug.region}/${selectedLocation.slug.city}/${selectedLocation.slug.line1}`
        : null
      : selectedCity
        ? `/${selectedCity.slug.region}/${selectedCity.slug.city}`
        : null;

  const resolvedData = useMemo(() => {
    const base = localData ?? data;
    return applyThemeDraft(base, localTheme);
  }, [data, localData, localTheme]);

  const switchPageType = (nextType: PageType) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (nextType === "location") {
      params.delete("pageType");
    } else {
      params.set("pageType", nextType);
    }
    const nextQuery = params.toString();
    router.replace(nextQuery ? `/edit?${nextQuery}` : "/edit");
  };

  const clearLocalChanges = () => {
    const storageKey = getDraftStorageKey(pageType);
    removeStorageKey(storageKey);
    removeStorageKey(themeStorageKey);
    sessionDrafts.current[pageType] = null;
    sessionTheme.current = null;
    setLocalData(data);
    setLocalTheme(null);
    setHasLocalChanges(false);
    setPuckKey((prev) => prev + 1);
  };

  return (
    <ConvexFieldProvider
      location={pageType === "location" ? selectedLocation ?? null : null}
    >
      <Puck
        key={`${pageType}-${puckKey}`}
        config={pageType === "city" ? cityPagesConfig : fullPagesConfig}
        data={resolvedData}
        metadata={
          pageType === "city"
            ? { city: selectedCity, locations: cityLocations }
            : { location: selectedLocation }
        }
        plugins={[aiPlugin, headingAnalyzer, themePlugin]}
        overrides={{
          header: ({ children }) => (
            <PuckHeader
              puckHeader={children}
              pageType={pageType}
              onSwitchPageType={switchPageType}
              locations={locations}
              cities={cities}
              selectedLocationId={selectedLocationId}
              onSelectLocation={setSelectedLocationId}
              selectedCityKey={selectedCityKey}
              onSelectCity={setSelectedCityKey}
              previewPath={previewPath}
              hasLocalChanges={hasLocalChanges}
            />
          ),
          headerActions: ({ children }) => (
            <PuckHeaderActions
              hasLocalChanges={hasLocalChanges}
              onClearLocalChanges={clearLocalChanges}
            >
              {children}
            </PuckHeaderActions>
          ),
        }}
        onChange={(nextData) => {
          const storageKey = getDraftStorageKey(pageType);
          sessionDrafts.current[pageType] = nextData;
          writeStorageJson(storageKey, nextData);
          const nextTheme = nextData?.root?.props?.theme;
          if (nextTheme) {
            sessionTheme.current = nextTheme;
            writeStorageJson(themeStorageKey, nextTheme);
          }
          setHasLocalChanges(true);
        }}
        onPublish={async (nextData) => {
          const endpoint =
            pageType === "city"
              ? "/api/page-groups/city/publish"
              : "/api/page-groups/location/publish";
          await fetch(endpoint, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: nextData }),
          });
          const storageKey = getDraftStorageKey(pageType);
          removeStorageKey(storageKey);
          sessionDrafts.current[pageType] = nextData;
          setLocalData(nextData);
          setHasLocalChanges(Boolean(readStorageJson(themeStorageKey)));
        }}
      />
    </ConvexFieldProvider>
  );
}
