"use client";

import type { ReactNode } from "react";
import { Button } from "@puckeditor/core";

type PageType = "location" | "city";

type Location = {
  _id: string;
  name: string;
  address: { region: string; city: string; line1: string };
  slug: { region: string; city: string; line1: string };
};

type CitySummary = {
  region: string;
  city: string;
  slug: { region: string; city: string };
};

const getCityKey = (city: CitySummary) =>
  `${city.slug.region}:${city.slug.city}`;

/* ------------------------------------------------------------------ */
/*  Shared select styles                                               */
/* ------------------------------------------------------------------ */

const selectBase: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: "14px",
  border: "1px solid var(--puck-color-grey-09)",
  borderRadius: "4px",
  backgroundColor: "var(--puck-color-white)",
  color: "var(--puck-color-grey-03)",
  cursor: "pointer",
  fontFamily: "inherit",
};

/* ------------------------------------------------------------------ */
/*  PuckHeader — context bar rendered above Puck's built-in header     */
/* ------------------------------------------------------------------ */

export interface PuckHeaderProps {
  /** Puck's default <header> element (pass `children` from the override) */
  puckHeader: ReactNode;

  pageType: PageType;
  onSwitchPageType: (type: PageType) => void;

  locations: Location[];
  cities: CitySummary[];

  selectedLocationId?: string;
  onSelectLocation: (id: string) => void;

  selectedCityKey: string;
  onSelectCity: (key: string) => void;

  previewPath: string | null;
  hasLocalChanges: boolean;
}

export function PuckHeader({
  puckHeader,
  pageType,
  onSwitchPageType,
  locations,
  cities,
  selectedLocationId,
  onSelectLocation,
  selectedCityKey,
  onSelectCity,
  previewPath,
  hasLocalChanges,
}: PuckHeaderProps) {
  const itemCount = pageType === "location" ? locations.length : cities.length;
  const itemLabel = pageType === "location" ? "Location Pages" : "City Pages";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* -------- Row 1: context / navigation bar -------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          borderBottom: "1px solid var(--puck-color-grey-09)",
          background: "var(--puck-color-white)",
          gap: "12px",
          minHeight: "44px",
          flexWrap: "wrap",
        }}
      >
        {/* Left group: page type · count · entity picker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: 0,
            flexWrap: "wrap",
          }}
        >
          <select
            value={pageType}
            onChange={(e) => onSwitchPageType(e.target.value as PageType)}
            style={{ ...selectBase, fontWeight: 500 }}
          >
            <option value="location">Store Pages</option>
            <option value="city">City Pages</option>
          </select>

          <span
            style={{
              fontSize: "13px",
              color: "var(--puck-color-grey-05)",
              whiteSpace: "nowrap",
            }}
          >
            {itemCount} {itemLabel}
          </span>

          {pageType === "location" ? (
            <select
              value={selectedLocationId ?? ""}
              onChange={(e) => onSelectLocation(e.target.value)}
              disabled={locations.length === 0}
              style={{ ...selectBase, maxWidth: "260px" }}
            >
              {locations.length === 0 ? (
                <option value="">No locations</option>
              ) : (
                locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))
              )}
            </select>
          ) : (
            <select
              value={selectedCityKey}
              onChange={(e) => onSelectCity(e.target.value)}
              disabled={cities.length === 0}
              style={{ ...selectBase, maxWidth: "260px" }}
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
          )}
        </div>

        {/* Right group: saved indicator · preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: hasLocalChanges
                ? "var(--puck-color-grey-03)"
                : "var(--puck-color-grey-05)",
              whiteSpace: "nowrap",
            }}
          >
            {hasLocalChanges ? "Unsaved changes" : "Saved"}
          </span>

          {previewPath && (
            <Button href={previewPath} newTab variant="secondary">
              Preview Changes
            </Button>
          )}
        </div>
      </div>

      {/* -------- Row 2: Puck's default header (toggles, title, actions) -------- */}
      {puckHeader}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PuckHeaderActions — right-side actions in Puck's built-in header   */
/* ------------------------------------------------------------------ */

export interface PuckHeaderActionsProps {
  hasLocalChanges: boolean;
  onClearLocalChanges: () => void;
  children: ReactNode;
}

export function PuckHeaderActions({
  hasLocalChanges,
  onClearLocalChanges,
  children,
}: PuckHeaderActionsProps) {
  return (
    <>
      <Button
        variant="secondary"
        onClick={onClearLocalChanges}
        disabled={!hasLocalChanges}
      >
        Discard Changes
      </Button>
      {children}
    </>
  );
}
