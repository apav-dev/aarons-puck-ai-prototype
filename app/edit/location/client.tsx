"use client";

import { useMemo, useState } from "react";
import { Data, Puck, Button } from "@puckeditor/core";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import headingAnalyzer from "@puckeditor/plugin-heading-analyzer";
import "@puckeditor/core/puck.css";
import "@puckeditor/plugin-ai/styles.css";
import "@puckeditor/plugin-heading-analyzer/dist/index.css";
import config from "../../../puck.config";
import themePlugin from "../../../theme-plugin/ThemePlugin";

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

const aiPlugin = createAiPlugin();

export function Client({
  data,
  locations,
}: {
  data: Partial<Data>;
  locations: Location[];
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    locations[0]?._id
  );

  const selectedLocation = useMemo(() => {
    return locations.find((location) => location._id === selectedId);
  }, [locations, selectedId]);

  return (
    <Puck
      config={config}
      data={data}
      metadata={{ location: selectedLocation }}
      plugins={[aiPlugin, headingAnalyzer, themePlugin]}
      overrides={{
        headerActions: ({ children }) => {
          const previewPath = selectedLocation
            ? `/${selectedLocation.slug.region}/${selectedLocation.slug.city}/${selectedLocation.slug.line1}`
            : null;
          return (
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
                value={selectedId ?? ""}
                onChange={(event) => setSelectedId(event.target.value)}
                disabled={locations.length === 0}
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
        await fetch("/api/page-groups/location/publish", {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: nextData }),
        });
      }}
    />
  );
}
