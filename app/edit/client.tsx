"use client";

import { useEffect, useMemo, useState } from "react";
import { Data, Puck, Button } from "@puckeditor/core";
import { useRouter, useSearchParams } from "next/navigation";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import headingAnalyzer from "@puckeditor/plugin-heading-analyzer";
import "@puckeditor/core/puck.css";
import "@puckeditor/plugin-ai/styles.css";
import "@puckeditor/plugin-heading-analyzer/dist/index.css";
import { cityPagesConfig, fullPagesConfig } from "../../puck.config";
import themePlugin from "../../theme-plugin/ThemePlugin";

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

  return (
    <Puck
      key={pageType}
      config={pageType === "city" ? cityPagesConfig : fullPagesConfig}
      data={data}
      metadata={
        pageType === "city"
          ? { city: selectedCity, locations: cityLocations }
          : { location: selectedLocation }
      }
      plugins={[aiPlugin, headingAnalyzer, themePlugin]}
      overrides={{
        headerActions: ({ children }) => {
          return (
            <>
              <label
                htmlFor="page-type-select"
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--puck-color-grey-03)",
                  whiteSpace: "nowrap",
                }}
              >
                Page type
              </label>
              <select
                id="page-type-select"
                value={pageType}
                onChange={(event) =>
                  switchPageType(event.target.value as PageType)
                }
                style={{
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: "1px solid var(--puck-color-grey-09)",
                  borderRadius: "4px",
                  backgroundColor: "var(--puck-color-white)",
                  color: "var(--puck-color-grey-03)",
                  cursor: "pointer",
                  minWidth: "160px",
                  fontFamily: "inherit",
                }}
              >
                <option value="location">Location page</option>
                <option value="city">City directory</option>
              </select>
              {pageType === "location" ? (
                <>
                  <label
                    htmlFor="location-select"
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--puck-color-grey-03)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Preview location
                  </label>
                  <select
                    id="location-select"
                    value={selectedLocationId ?? ""}
                    onChange={(event) => setSelectedLocationId(event.target.value)}
                    disabled={locations.length === 0}
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      border: "1px solid var(--puck-color-grey-09)",
                      borderRadius: "4px",
                      backgroundColor: "var(--puck-color-white)",
                      color: "var(--puck-color-grey-03)",
                      cursor: "pointer",
                      minWidth: "220px",
                      fontFamily: "inherit",
                    }}
                  >
                    {locations.length === 0 ? (
                      <option value="">No locations</option>
                    ) : (
                      locations.map((location) => (
                        <option key={location._id} value={location._id}>
                          {location.name} — {location.address.line1},{" "}
                          {location.address.city}
                        </option>
                      ))
                    )}
                  </select>
                </>
              ) : (
                <>
                  <label
                    htmlFor="city-select"
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--puck-color-grey-03)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Preview city
                  </label>
                  <select
                    id="city-select"
                    value={selectedCityKey}
                    onChange={(event) => setSelectedCityKey(event.target.value)}
                    disabled={cities.length === 0}
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      border: "1px solid var(--puck-color-grey-09)",
                      borderRadius: "4px",
                      backgroundColor: "var(--puck-color-white)",
                      color: "var(--puck-color-grey-03)",
                      cursor: "pointer",
                      minWidth: "200px",
                      fontFamily: "inherit",
                    }}
                  >
                    {cities.length === 0 ? (
                      <option value="">No cities</option>
                    ) : (
                      cities.map((city) => (
                        <option key={getCityKey(city)} value={getCityKey(city)}>
                          {city.city}, {city.region}
                        </option>
                      ))
                    )}
                  </select>
                </>
              )}
              {previewPath && (
                <Button href={previewPath} newTab={true} variant="secondary">
                  Open Preview
                </Button>
              )}
              {children}
            </>
          );
        },
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
      }}
    />
  );
}
