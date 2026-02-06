"use client";

import { useEffect, useMemo, useState } from "react";
import { FieldLabel } from "@puckeditor/core";
import {
  ConvexFieldMode,
  ConvexSingleValue,
  mutationRef,
  queryRef,
} from "./convex-field-helpers";
import { useConvexFieldContext } from "./ConvexFieldContext";

export type ConvexOption = {
  id: string;
  label: string;
  imageUrl?: string;
  raw?: Record<string, unknown>;
};

export type ConvexSingleSelectField = {
  type: "custom";
  label?: string;
  entityLabel: string;
  listQueryName: string;
  listArgs?: Record<string, unknown>;
  mapItemToOption: (item: Record<string, unknown>) => ConvexOption;
  currentForLocationQueryName: string;
  linkMutationName: string;
  unlinkMutationName: string;
  locationIdArg: string;
  itemIdArg: string;
};

type RenderParams = {
  field: ConvexSingleSelectField;
  value: ConvexSingleValue | undefined;
  onChange: (value: ConvexSingleValue) => void;
};

const getNextValue = (
  value: ConvexSingleValue | undefined,
  patch: Partial<ConvexSingleValue>
): ConvexSingleValue => {
  return {
    mode: value?.mode ?? "all",
    ...value,
    ...patch,
  };
};

export const ConvexSingleSelect = ({
  field,
  value,
  onChange,
}: RenderParams) => {
  const { convexClient, location } = useConvexFieldContext();
  const [options, setOptions] = useState<ConvexOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSelection, setLocationSelection] = useState<string | null>(null);

  const mode: ConvexFieldMode = value?.mode ?? "all";
  const selectedId = value?.selectedId ?? "";
  const locationId = location?._id ?? "";

  const listArgsKey = useMemo(
    () => JSON.stringify(field.listArgs ?? {}),
    [field.listArgs]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    convexClient
      .query(queryRef(field.listQueryName), field.listArgs ?? {})
      .then((items) => {
        if (!active) return;
        const next = Array.isArray(items)
          ? items.map((item) =>
              field.mapItemToOption(item as Record<string, unknown>)
            )
          : [];
        setOptions(next);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load items.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [convexClient, field.listQueryName, listArgsKey]);

  useEffect(() => {
    let active = true;
    if (mode !== "perLocation" || !locationId) {
      setLocationSelection(null);
      return;
    }
    convexClient
      .query(queryRef(field.currentForLocationQueryName), { locationId })
      .then((items) => {
        if (!active) return;
        const first = Array.isArray(items) ? items[0] : null;
        const option = first
          ? field.mapItemToOption(first as Record<string, unknown>)
          : null;
        setLocationSelection(option?.id ?? null);
      })
      .catch(() => {
        if (!active) return;
        setLocationSelection(null);
      });

    return () => {
      active = false;
    };
  }, [
    convexClient,
    field.currentForLocationQueryName,
    locationId,
    mode,
    value?.refresh,
  ]);

  const selectedOption = useMemo(() => {
    const id = mode === "perLocation" ? locationSelection : selectedId;
    return options.find((option) => option.id === id) ?? null;
  }, [mode, locationSelection, options, selectedId]);

  const updateMode = (nextMode: ConvexFieldMode) => {
    onChange(
      getNextValue(value, {
        mode: nextMode,
        refresh: Date.now(),
      })
    );
  };

  const updateAllSelection = (nextId: string) => {
    onChange(
      getNextValue(value, {
        selectedId: nextId || undefined,
        refresh: Date.now(),
      })
    );
  };

  const updatePerLocationSelection = async (nextId: string) => {
    if (!locationId) return;
    const currentId = locationSelection;

    if (currentId) {
      await convexClient.mutation(mutationRef(field.unlinkMutationName), {
        [field.locationIdArg]: locationId,
        [field.itemIdArg]: currentId,
      });
    }

    if (nextId) {
      await convexClient.mutation(mutationRef(field.linkMutationName), {
        [field.locationIdArg]: locationId,
        [field.itemIdArg]: nextId,
      });
    }

    setLocationSelection(nextId || null);
    onChange(
      getNextValue(value, {
        refresh: Date.now(),
      })
    );
  };

  const isPerLocationDisabled = !locationId;

  return (
    <FieldLabel label={field.label ?? field.entityLabel}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => updateMode("all")}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid var(--puck-color-grey-09)",
              background: mode === "all" ? "var(--puck-color-blue-06)" : "white",
              color: mode === "all" ? "white" : "var(--puck-color-grey-02)",
              cursor: "pointer",
            }}
          >
            All pages
          </button>
          <button
            type="button"
            onClick={() => updateMode("perLocation")}
            disabled={isPerLocationDisabled}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid var(--puck-color-grey-09)",
              background:
                mode === "perLocation"
                  ? "var(--puck-color-blue-06)"
                  : "white",
              color:
                mode === "perLocation" ? "white" : "var(--puck-color-grey-02)",
              cursor: isPerLocationDisabled ? "not-allowed" : "pointer",
              opacity: isPerLocationDisabled ? 0.6 : 1,
            }}
          >
            This location only
          </button>
        </div>

        {isPerLocationDisabled && (
          <div style={{ fontSize: "12px", color: "var(--puck-color-grey-05)" }}>
            Select a preview location to assign {field.entityLabel.toLowerCase()}
            .
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <select
            value={mode === "perLocation" ? locationSelection ?? "" : selectedId}
            onChange={(event) => {
              if (mode === "perLocation") {
                updatePerLocationSelection(event.target.value);
              } else {
                updateAllSelection(event.target.value);
              }
            }}
            disabled={loading || (mode === "perLocation" && !locationId)}
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid var(--puck-color-grey-09)",
              backgroundColor: "white",
              color: "var(--puck-color-grey-02)",
            }}
          >
            <option value="">
              {loading
                ? "Loading..."
                : `Select ${field.entityLabel.toLowerCase()}`}
            </option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <div style={{ fontSize: "12px", color: "var(--puck-color-red-05)" }}>
              {error}
            </div>
          )}
          {selectedOption && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid var(--puck-color-grey-10)",
                background: "var(--puck-color-grey-12)",
              }}
            >
              {selectedOption.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedOption.imageUrl}
                  alt={selectedOption.label}
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              )}
              <div style={{ fontSize: "13px", fontWeight: 500 }}>
                {selectedOption.label}
              </div>
            </div>
          )}
        </div>
      </div>
    </FieldLabel>
  );
};

export default ConvexSingleSelect;
