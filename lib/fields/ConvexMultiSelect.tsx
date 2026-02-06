"use client";

import { useEffect, useMemo, useState } from "react";
import { FieldLabel } from "@puckeditor/core";
import {
  ConvexFieldMode,
  ConvexMultiValue,
  mutationRef,
  queryRef,
} from "./convex-field-helpers";
import { useConvexFieldContext } from "./ConvexFieldContext";
import { ConvexOption } from "./ConvexSingleSelect";

export type ConvexMultiSelectField = {
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
  field: ConvexMultiSelectField;
  value: ConvexMultiValue | undefined;
  onChange: (value: ConvexMultiValue) => void;
};

const getNextValue = (
  value: ConvexMultiValue | undefined,
  patch: Partial<ConvexMultiValue>
): ConvexMultiValue => {
  return {
    mode: value?.mode ?? "all",
    ...value,
    ...patch,
  };
};

const moveItem = (items: string[], from: number, to: number) => {
  if (from === to || from < 0 || to < 0 || from >= items.length) return items;
  const next = [...items];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
};

const arraysEqual = (left: string[], right: string[]) => {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) return false;
  }
  return true;
};

export const ConvexMultiSelect = ({
  field,
  value,
  onChange,
}: RenderParams) => {
  const { convexClient, location } = useConvexFieldContext();
  const [options, setOptions] = useState<ConvexOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSelection, setLocationSelection] = useState<string[]>([]);
  const [pendingAddId, setPendingAddId] = useState("");

  const mode: ConvexFieldMode = value?.mode ?? "all";
  const selectedIds = value?.selectedIds ?? [];
  const locationId = location?._id ?? "";
  const perLocationSelectedIds = value?.perLocationSelectedIds ?? {};
  const perLocationKey = useMemo(() => {
    if (!locationId) return "";
    return JSON.stringify(perLocationSelectedIds[locationId] ?? []);
  }, [locationId, perLocationSelectedIds]);

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
      setLocationSelection([]);
      return;
    }
    convexClient
      .query(queryRef(field.currentForLocationQueryName), { locationId })
      .then((items) => {
        if (!active) return;
        const next = Array.isArray(items)
          ? items.map((item) =>
              field.mapItemToOption(item as Record<string, unknown>)
            )
          : [];
        const idsFromRelationship = next.map((option) => option.id);
        const storedOrder = perLocationSelectedIds[locationId] ?? [];
        const ordered = [
          ...storedOrder.filter((id) => idsFromRelationship.includes(id)),
          ...idsFromRelationship.filter((id) => !storedOrder.includes(id)),
        ];
        setLocationSelection((current) =>
          arraysEqual(current, ordered) ? current : ordered
        );
      })
      .catch(() => {
        if (!active) return;
        setLocationSelection([]);
      });

    return () => {
      active = false;
    };
  }, [
    convexClient,
    field.currentForLocationQueryName,
    locationId,
    mode,
    perLocationKey,
    value?.refresh,
  ]);

  const selectedIdsForMode =
    mode === "perLocation" ? locationSelection : selectedIds;

  const selectedOptions = useMemo(() => {
    return selectedIdsForMode
      .map((id) => options.find((option) => option.id === id))
      .filter(Boolean) as ConvexOption[];
  }, [options, selectedIdsForMode]);

  const updateMode = (nextMode: ConvexFieldMode) => {
    onChange(
      getNextValue(value, {
        mode: nextMode,
        refresh: Date.now(),
      })
    );
  };

  const updateAllSelection = (nextIds: string[]) => {
    onChange(
      getNextValue(value, {
        selectedIds: nextIds,
        refresh: Date.now(),
      })
    );
  };

  const updatePerLocationSelection = async (nextIds: string[]) => {
    if (!locationId) return;
    const currentIds = locationSelection;
    const toRemove = currentIds.filter((id) => !nextIds.includes(id));
    const toAdd = nextIds.filter((id) => !currentIds.includes(id));

    for (const id of toRemove) {
      await convexClient.mutation(mutationRef(field.unlinkMutationName), {
        [field.locationIdArg]: locationId,
        [field.itemIdArg]: id,
      });
    }

    for (const id of toAdd) {
      await convexClient.mutation(mutationRef(field.linkMutationName), {
        [field.locationIdArg]: locationId,
        [field.itemIdArg]: id,
      });
    }

    setLocationSelection(nextIds);
    onChange(
      getNextValue(value, {
        perLocationSelectedIds: {
          ...perLocationSelectedIds,
          [locationId]: nextIds,
        },
        refresh: Date.now(),
      })
    );
  };

  const removeItem = (id: string) => {
    const next = selectedIdsForMode.filter((item) => item !== id);
    if (mode === "perLocation") {
      updatePerLocationSelection(next);
    } else {
      updateAllSelection(next);
    }
  };

  const addItem = (id: string) => {
    if (!id || selectedIdsForMode.includes(id)) return;
    const next = [...selectedIdsForMode, id];
    if (mode === "perLocation") {
      updatePerLocationSelection(next);
    } else {
      updateAllSelection(next);
    }
  };

  const moveSelected = (index: number, direction: -1 | 1) => {
    const next = moveItem(selectedIdsForMode, index, index + direction);
    if (mode === "perLocation") {
      updatePerLocationSelection(next);
    } else {
      updateAllSelection(next);
    }
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

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            value={pendingAddId}
            onChange={(event) => setPendingAddId(event.target.value)}
            disabled={loading || (mode === "perLocation" && !locationId)}
            style={{
              flex: 1,
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
          <button
            type="button"
            onClick={() => {
              addItem(pendingAddId);
              setPendingAddId("");
            }}
            disabled={!pendingAddId}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--puck-color-grey-09)",
              background: "white",
              cursor: pendingAddId ? "pointer" : "not-allowed",
            }}
          >
            Add
          </button>
        </div>
        {error && (
          <div style={{ fontSize: "12px", color: "var(--puck-color-red-05)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {selectedOptions.length === 0 && (
            <div style={{ fontSize: "12px", color: "var(--puck-color-grey-05)" }}>
              No {field.entityLabel.toLowerCase()} selected.
            </div>
          )}
          {selectedOptions.map((option, index) => (
            <div
              key={option.id}
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
              {option.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={option.imageUrl}
                  alt={option.label}
                  style={{
                    width: "36px",
                    height: "36px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              )}
              <div style={{ flex: 1, fontSize: "13px", fontWeight: 500 }}>
                {option.label}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => moveSelected(index, -1)}
                  disabled={index === 0}
                  style={{
                    padding: "4px 6px",
                    borderRadius: "4px",
                    border: "1px solid var(--puck-color-grey-09)",
                    background: "white",
                    cursor: index === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveSelected(index, 1)}
                  disabled={index === selectedOptions.length - 1}
                  style={{
                    padding: "4px 6px",
                    borderRadius: "4px",
                    border: "1px solid var(--puck-color-grey-09)",
                    background: "white",
                    cursor:
                      index === selectedOptions.length - 1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(option.id)}
                  style={{
                    padding: "4px 6px",
                    borderRadius: "4px",
                    border: "1px solid var(--puck-color-grey-09)",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FieldLabel>
  );
};

export default ConvexMultiSelect;
