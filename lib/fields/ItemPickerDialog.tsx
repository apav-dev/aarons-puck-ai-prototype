"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConvexFieldContext } from "./ConvexFieldContext";
import { mutationRef, queryRef } from "./convex-field-helpers";
import type {
  ContentModeFieldConfig,
  ContentOption,
  ContentSourceValue,
} from "./content-mode-types";

type ItemPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: ContentModeFieldConfig;
  value: ContentSourceValue | undefined;
  onChange: (value: ContentSourceValue) => void;
};

const getNextValue = (
  value: ContentSourceValue | undefined,
  patch: Partial<ContentSourceValue>
): ContentSourceValue => {
  return {
    source: value?.source ?? "static",
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

export const ItemPickerDialog = ({
  open,
  onOpenChange,
  field,
  value,
  onChange,
}: ItemPickerDialogProps) => {
  const { convexClient, location } = useConvexFieldContext();
  const [options, setOptions] = useState<ContentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeMode, setActiveMode] = useState<"all" | "perLocation">(
    value?.dynamicMode ?? "all"
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [initialLocationIds, setInitialLocationIds] = useState<string[]>([]);
  const [initialLocationId, setInitialLocationId] = useState<string>("");

  const locationId = location?._id ?? "";
  const listArgsKey = useMemo(
    () => JSON.stringify(field.listArgs ?? {}),
    [field.listArgs]
  );

  useEffect(() => {
    if (!open) return;
    setActiveMode(value?.dynamicMode ?? "all");
    setSearch("");
  }, [open, value?.dynamicMode]);

  useEffect(() => {
    let active = true;
    if (!open) return;
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
  }, [convexClient, field.listQueryName, listArgsKey, open]);

  useEffect(() => {
    let active = true;
    if (!open) return;

    const isMulti = field.selectionMode === "multiple";
    if (activeMode === "all") {
      if (isMulti) {
        setSelectedIds(value?.selectedIds ?? []);
      } else {
        setSelectedId(value?.selectedId ?? "");
      }
      setInitialLocationIds([]);
      setInitialLocationId("");
      return;
    }

    if (!locationId) {
      if (isMulti) {
        setSelectedIds([]);
      } else {
        setSelectedId("");
      }
      setInitialLocationIds([]);
      setInitialLocationId("");
      return;
    }

    convexClient
      .query(queryRef(field.currentForLocationQueryName), { locationId })
      .then((items) => {
        if (!active) return;
        const mapped = Array.isArray(items)
          ? items.map((item) =>
              field.mapItemToOption(item as Record<string, unknown>)
            )
          : [];
        const idsFromRelationship = mapped.map((option) => option.id);

        if (isMulti) {
          const storedOrder = value?.perLocationSelectedIds?.[locationId] ?? [];
          const ordered = [
            ...storedOrder.filter((id) => idsFromRelationship.includes(id)),
            ...idsFromRelationship.filter((id) => !storedOrder.includes(id)),
          ];
          setSelectedIds(ordered);
          setInitialLocationIds(ordered);
          setInitialLocationId("");
        } else {
          const currentId = idsFromRelationship[0] ?? "";
          setSelectedId(currentId);
          setInitialLocationId(currentId);
          setInitialLocationIds([]);
        }
      })
      .catch(() => {
        if (!active) return;
        if (isMulti) {
          setSelectedIds([]);
          setInitialLocationIds([]);
        } else {
          setSelectedId("");
          setInitialLocationId("");
        }
      });

    return () => {
      active = false;
    };
  }, [
    activeMode,
    convexClient,
    field.currentForLocationQueryName,
    field.selectionMode,
    locationId,
    open,
    value?.perLocationSelectedIds,
    value?.refresh,
    value?.selectedId,
    value?.selectedIds,
  ]);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(term)
    );
  }, [options, search]);

  const selectedOptions = useMemo(() => {
    if (field.selectionMode === "multiple") {
      return selectedIds
        .map((id) => options.find((option) => option.id === id))
        .filter(Boolean) as ContentOption[];
    }
    if (!selectedId) return [];
    const option = options.find((opt) => opt.id === selectedId);
    return option ? [option] : [];
  }, [field.selectionMode, options, selectedId, selectedIds]);

  const updateActiveMode = (mode: "all" | "perLocation") => {
    if (mode === "perLocation" && !locationId) return;
    setActiveMode(mode);
  };

  const toggleMultiSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (activeMode === "perLocation" && locationId) {
        if (field.selectionMode === "multiple") {
          const toRemove = initialLocationIds.filter(
            (id) => !selectedIds.includes(id)
          );
          const toAdd = selectedIds.filter(
            (id) => !initialLocationIds.includes(id)
          );

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

          onChange(
            getNextValue(value, {
              source: "dynamic",
              dynamicMode: "perLocation",
              perLocationSelectedIds: {
                ...(value?.perLocationSelectedIds ?? {}),
                [locationId]: selectedIds,
              },
              refresh: Date.now(),
            })
          );
        } else {
          const nextId = selectedId || "";
          if (initialLocationId && initialLocationId !== nextId) {
            await convexClient.mutation(mutationRef(field.unlinkMutationName), {
              [field.locationIdArg]: locationId,
              [field.itemIdArg]: initialLocationId,
            });
          }
          if (nextId && nextId !== initialLocationId) {
            await convexClient.mutation(mutationRef(field.linkMutationName), {
              [field.locationIdArg]: locationId,
              [field.itemIdArg]: nextId,
            });
          }
          onChange(
            getNextValue(value, {
              source: "dynamic",
              dynamicMode: "perLocation",
              perLocationSelectedId: {
                ...(value?.perLocationSelectedId ?? {}),
                [locationId]: nextId || null,
              },
              refresh: Date.now(),
            })
          );
        }
      } else {
        onChange(
          getNextValue(value, {
            source: "dynamic",
            dynamicMode: "all",
            selectedIds:
              field.selectionMode === "multiple" ? selectedIds : undefined,
            selectedId:
              field.selectionMode === "single" ? selectedId || undefined : undefined,
            refresh: Date.now(),
          })
        );
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const selectionLabel =
    field.selectionMode === "multiple"
      ? `${selectedOptions.length} selected`
      : selectedId
        ? "1 selected"
        : "0 selected";

  const isPerLocationDisabled = !locationId;
  const buttonBaseStyles = {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid var(--puck-color-grey-09)",
    background: "white",
    color: "var(--puck-color-grey-02)",
    cursor: "pointer",
  } as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ width: "min(900px, calc(100vw - 48px))" }}>
        <DialogHeader>
          <DialogTitle>Choose {field.entityLabel}</DialogTitle>
        </DialogHeader>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => updateActiveMode("all")}
            style={{
              ...buttonBaseStyles,
              background:
                activeMode === "all" ? "var(--puck-color-blue-06)" : "white",
              color: activeMode === "all" ? "white" : "var(--puck-color-grey-02)",
            }}
          >
            All pages
          </button>
          <button
            type="button"
            onClick={() => updateActiveMode("perLocation")}
            disabled={isPerLocationDisabled}
            style={{
              ...buttonBaseStyles,
              background:
                activeMode === "perLocation"
                  ? "var(--puck-color-blue-06)"
                  : "white",
              color:
                activeMode === "perLocation"
                  ? "white"
                  : "var(--puck-color-grey-02)",
              cursor: isPerLocationDisabled ? "not-allowed" : "pointer",
              opacity: isPerLocationDisabled ? 0.6 : 1,
            }}
          >
            This location only
          </button>
          {isPerLocationDisabled && (
            <span style={{ fontSize: "12px", color: "var(--puck-color-grey-05)" }}>
              Select a preview location to assign {field.entityLabel.toLowerCase()}
              .
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="text"
            placeholder={`Search ${field.entityLabel.toLowerCase()}`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid var(--puck-color-grey-09)",
              backgroundColor: "white",
              color: "var(--puck-color-grey-02)",
            }}
          />
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "999px",
              background: "var(--puck-color-grey-11)",
              fontSize: "12px",
              color: "var(--puck-color-grey-02)",
            }}
          >
            {selectionLabel}
          </span>
        </div>

        <div
          style={{
            height: "1px",
            background: "var(--puck-color-grey-10)",
            width: "100%",
          }}
        />

        {field.selectionMode === "multiple" && selectedOptions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--puck-color-grey-05)",
              }}
            >
              Selected order
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {selectedOptions.map((option, index) => (
                <div
                  key={option.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
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
                        width: "32px",
                        height: "32px",
                        borderRadius: "4px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>
                    {option.label}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        setSelectedIds((current) =>
                          moveItem(current, index, index - 1)
                        )
                      }
                      style={{
                        ...buttonBaseStyles,
                        padding: "4px 6px",
                        cursor: index === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      ^
                    </button>
                    <button
                      type="button"
                      disabled={index === selectedOptions.length - 1}
                      onClick={() =>
                        setSelectedIds((current) =>
                          moveItem(current, index, index + 1)
                        )
                      }
                      style={{
                        ...buttonBaseStyles,
                        padding: "4px 6px",
                        cursor:
                          index === selectedOptions.length - 1
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      v
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIds((current) =>
                          current.filter((id) => id !== option.id)
                        )
                      }
                      style={{
                        ...buttonBaseStyles,
                        padding: "4px 6px",
                      }}
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                height: "1px",
                background: "var(--puck-color-grey-10)",
                width: "100%",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--puck-color-grey-05)",
            }}
          >
            {loading ? "Loading..." : "Available options"}
          </div>
          {error && (
            <div style={{ fontSize: "13px", color: "var(--puck-color-red-05)" }}>
              {error}
            </div>
          )}
          <div
            style={{
              border: "1px solid var(--puck-color-grey-10)",
              borderRadius: "6px",
              maxHeight: "320px",
              overflowY: "auto",
            }}
          >
            <div>
              {filteredOptions.map((option) => {
                const isSelected =
                  field.selectionMode === "multiple"
                    ? selectedIds.includes(option.id)
                    : selectedId === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      if (field.selectionMode === "multiple") {
                        toggleMultiSelection(option.id);
                      } else {
                        setSelectedId(option.id);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      if (field.selectionMode === "multiple") {
                        toggleMultiSelection(option.id);
                      } else {
                        setSelectedId(option.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      borderBottom: "1px solid var(--puck-color-grey-11)",
                      background: isSelected
                        ? "var(--puck-color-grey-12)"
                        : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {field.selectionMode === "multiple" ? (
                      <div
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleMultiSelection(option.id)}
                          style={{ width: "16px", height: "16px" }}
                        />
                      </div>
                    ) : (
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedId(option.id)}
                        style={{ width: "16px", height: "16px" }}
                      />
                    )}
                    {option.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={option.imageUrl}
                        alt={option.label}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "4px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600 }}>
                        {option.label}
                      </div>
                    </div>
                    {isSelected && (
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "999px",
                          background: "var(--puck-color-grey-11)",
                          fontSize: "12px",
                          color: "var(--puck-color-grey-02)",
                        }}
                      >
                        Selected
                      </span>
                    )}
                  </div>
                );
              })}
              {!loading && filteredOptions.length === 0 && (
                <div
                  style={{
                    padding: "24px",
                    fontSize: "13px",
                    color: "var(--puck-color-grey-05)",
                  }}
                >
                  No matching {field.entityLabel.toLowerCase()}.
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              style={buttonBaseStyles}
            >
            Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              style={{
                ...buttonBaseStyles,
                background: "var(--puck-color-blue-06)",
                color: "white",
                cursor: saving || loading ? "not-allowed" : "pointer",
                opacity: saving || loading ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemPickerDialog;
