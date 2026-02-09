"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFieldContext } from "./FieldContext";
import ConfirmDialog from "./ConfirmDialog";
import type {
  ContentModeFieldConfig,
  ContentOption,
  ContentOverride,
  ContentSourceValue,
} from "./content-mode-types";

type ItemPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: ContentModeFieldConfig;
  value: ContentSourceValue | undefined;
  onChange: (value: ContentSourceValue) => void;
};

type ConfirmState = {
  title: string;
  message: string;
  bullets?: string[];
  confirmLabel: string;
  confirmDanger?: boolean;
  onConfirm: () => void;
};

const getNextValue = (
  value: ContentSourceValue | undefined,
  patch: Partial<ContentSourceValue>,
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

const createDefaultOverride = (
  itemIds: string[],
  locationIds: string[],
): ContentOverride => ({
  id: "default",
  label: "Default",
  isDefault: true,
  locationIds,
  itemIds,
});

export const ItemPickerDialog = ({
  open,
  onOpenChange,
  field,
  value,
  onChange,
}: ItemPickerDialogProps) => {
  const { supabaseClient, allLocations } = useFieldContext();
  const [options, setOptions] = useState<ContentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"synced" | "perLocation">("synced");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [overrides, setOverrides] = useState<ContentOverride[]>([]);
  const [activeOverrideId, setActiveOverrideId] = useState<string>("default");
  const [locationSearch, setLocationSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const hasSyncedFromDB = useRef(false);

  const allLocationIds = useMemo(
    () => allLocations.map((location) => location.id),
    [allLocations],
  );

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setLocationSearch("");
    setRegionFilter(null);

    const dynamicMode =
      value?.dynamicMode === "perLocation" ? "perLocation" : "synced";

    if (dynamicMode === "synced") {
      setMode("synced");
      if (field.selectionMode === "multiple") {
        setSelectedIds(value?.selectedIds ?? []);
      } else {
        setSelectedId(value?.selectedId ?? "");
      }
      setOverrides([]);
      setActiveOverrideId("default");
      return;
    }

    setMode("perLocation");
    const existingOverrides = value?.overrides ?? [];
    if (existingOverrides.length > 0) {
      setOverrides(existingOverrides);
      setActiveOverrideId(existingOverrides[0]?.id ?? "default");
      return;
    }

    const legacyItems =
      field.selectionMode === "multiple"
        ? (value?.perLocationSelectedIds?.[allLocationIds[0] ?? ""] ?? [])
        : value?.perLocationSelectedId?.[allLocationIds[0] ?? ""]
          ? [value?.perLocationSelectedId?.[allLocationIds[0] ?? ""] ?? ""]
          : [];

    const fallbackDefault = createDefaultOverride(legacyItems, allLocationIds);
    setOverrides([fallbackDefault]);
    setActiveOverrideId("default");
  }, [
    allLocationIds,
    field.selectionMode,
    open,
    value?.dynamicMode,
    value?.overrides,
    value?.perLocationSelectedId,
    value?.perLocationSelectedIds,
    value?.selectedId,
    value?.selectedIds,
  ]);

  useEffect(() => {
    let active = true;
    if (!open) {
      hasSyncedFromDB.current = false;
      return;
    }
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        // 1. Fetch all entity options
        const { data: items, error: err } = await supabaseClient
          .from(field.entityTable)
          .select("*");

        if (!active) return;
        if (err) {
          setError(err.message ?? "Failed to load items.");
          return;
        }

        const next = Array.isArray(items)
          ? items.map((item) =>
              field.mapItemToOption(item as Record<string, unknown>),
            )
          : [];
        setOptions(next);

        // Prune any stale IDs that don't match fetched options (e.g. old
        // Convex IDs left over from a migration).
        const validIds = new Set(next.map((opt) => opt.id));
        const prune = (ids: string[]) => ids.filter((id) => validIds.has(id));

        setSelectedIds((prev) => {
          const pruned = prune(prev);
          return pruned.length === prev.length ? prev : pruned;
        });
        setSelectedId((prev) => (validIds.has(prev) ? prev : ""));

        // 2. For per-location mode, sync override itemIds from the junction
        //    table so the dialog always reflects the actual DB state (the
        //    overrides baked into the page JSON can become stale).
        if (!hasSyncedFromDB.current) {
          hasSyncedFromDB.current = true;

          const { data: junctionRows } = await supabaseClient
            .from(field.junctionTable)
            .select("*");

          if (!active) return;

          // Build a map: locationId → [entityIds]
          const locationToItems = new Map<string, string[]>();
          for (const row of (junctionRows ?? []) as Record<string, unknown>[]) {
            const locId = String(row[field.locationIdColumn]);
            const itemId = String(row[field.entityIdColumn]);
            if (!locationToItems.has(locId)) {
              locationToItems.set(locId, []);
            }
            locationToItems.get(locId)!.push(itemId);
          }

          setOverrides((prev) => {
            let changed = false;
            const synced = prev.map((override) => {
              // Pick the first location in this override to look up its items
              const repLocId = override.locationIds[0];
              const dbItems = repLocId
                ? (locationToItems.get(repLocId) ?? []).filter((id) =>
                    validIds.has(id),
                  )
                : [];

              // Use DB items if available, otherwise prune existing items
              const finalItems =
                dbItems.length > 0 ? dbItems : prune(override.itemIds);

              if (
                finalItems.length !== override.itemIds.length ||
                finalItems.some((id, i) => id !== override.itemIds[i])
              ) {
                changed = true;
                return { ...override, itemIds: finalItems };
              }
              return override;
            });
            return changed ? synced : prev;
          });
        } else {
          // Not first load — just prune stale IDs
          setOverrides((prev) => {
            let changed = false;
            const pruned = prev.map((override) => {
              const cleanItems = prune(override.itemIds);
              if (cleanItems.length !== override.itemIds.length) {
                changed = true;
                return { ...override, itemIds: cleanItems };
              }
              return override;
            });
            return changed ? pruned : prev;
          });
        }
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error ? e.message : "Failed to load items.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [supabaseClient, field, open]);

  const activeOverride = useMemo(
    () =>
      overrides.find((override) => override.id === activeOverrideId) ?? null,
    [activeOverrideId, overrides],
  );

  const customOverrides = useMemo(
    () => overrides.filter((override) => !override.isDefault),
    [overrides],
  );

  const claimedLocationIds = useMemo(() => {
    return overrides
      .filter(
        (override) => !override.isDefault && override.id !== activeOverrideId,
      )
      .flatMap((override) => override.locationIds);
  }, [activeOverrideId, overrides]);

  const regions = useMemo(() => {
    const list = allLocations
      .map(
        (location) => location.address?.region ?? location.slug?.region ?? "",
      )
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [allLocations]);

  const filteredLocations = useMemo(() => {
    const term = locationSearch.trim().toLowerCase();
    return allLocations.filter((location) => {
      const name = location.name?.toLowerCase() ?? "";
      const city = location.address?.city?.toLowerCase() ?? "";
      const region = location.address?.region ?? location.slug?.region ?? "";
      const matchesTerm = !term || name.includes(term) || city.includes(term);
      const matchesRegion = !regionFilter || regionFilter === region;
      return matchesTerm && matchesRegion;
    });
  }, [allLocations, locationSearch, regionFilter]);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(term),
    );
  }, [options, search]);

  const currentItemIds = useMemo(() => {
    if (mode === "synced") {
      return field.selectionMode === "multiple"
        ? selectedIds
        : selectedId
          ? [selectedId]
          : [];
    }
    return activeOverride?.itemIds ?? [];
  }, [
    activeOverride?.itemIds,
    field.selectionMode,
    mode,
    selectedId,
    selectedIds,
  ]);

  const selectedOptions = useMemo(() => {
    if (field.selectionMode === "multiple") {
      return currentItemIds
        .map((id) => options.find((option) => option.id === id))
        .filter(Boolean) as ContentOption[];
    }
    if (!currentItemIds[0]) return [];
    const option = options.find((opt) => opt.id === currentItemIds[0]);
    return option ? [option] : [];
  }, [currentItemIds, field.selectionMode, options]);

  const selectionLabel =
    field.selectionMode === "multiple"
      ? `${currentItemIds.length} selected`
      : currentItemIds[0]
        ? "1 selected"
        : "0 selected";

  const buttonBaseStyles = {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid var(--puck-color-grey-09, #dcdcdc)",
    background: "white",
    color: "var(--puck-color-grey-02, #292929)",
    cursor: "pointer",
  } as const;

  const updateOverrides = (nextOverrides: ContentOverride[]) => {
    const defaultOverride = nextOverrides.find(
      (override) => override.isDefault,
    );
    if (!defaultOverride) {
      setOverrides(nextOverrides);
      return;
    }
    const claimed = nextOverrides
      .filter((override) => !override.isDefault)
      .flatMap((override) => override.locationIds);
    const nextDefault = {
      ...defaultOverride,
      locationIds: allLocationIds.filter((id) => !claimed.includes(id)),
    };
    const updated = nextOverrides.map((override) =>
      override.isDefault ? nextDefault : override,
    );
    setOverrides(updated);
  };

  const updateCurrentItems = (next: string[]) => {
    if (mode === "synced") {
      if (field.selectionMode === "multiple") {
        setSelectedIds(next);
      } else {
        setSelectedId(next[0] ?? "");
      }
      return;
    }
    if (!activeOverride) return;
    updateOverrides(
      overrides.map((override) =>
        override.id === activeOverride.id
          ? {
              ...override,
              itemIds:
                field.selectionMode === "multiple"
                  ? next
                  : next[0]
                    ? [next[0]]
                    : [],
            }
          : override,
      ),
    );
  };

  const toggleMultiSelection = (id: string) => {
    updateCurrentItems(
      currentItemIds.includes(id)
        ? currentItemIds.filter((item) => item !== id)
        : [...currentItemIds, id],
    );
  };

  const updateMode = (nextMode: "synced" | "perLocation") => {
    if (nextMode === mode) return;
    if (nextMode === "perLocation") {
      setConfirmState({
        title: "Enable per-location overrides?",
        message:
          "Switching to per-location lets you customize by location. The current selection becomes the default.",
        bullets: [
          "Create overrides to assign specific locations",
          "Locations without overrides keep the default list",
          "You can switch back to Synced anytime",
        ],
        confirmLabel: "Enable per-location",
        onConfirm: () => {
          setConfirmState(null);
          const defaultOverride = createDefaultOverride(
            field.selectionMode === "multiple"
              ? selectedIds
              : selectedId
                ? [selectedId]
                : [],
            allLocationIds,
          );
          setOverrides([defaultOverride]);
          setActiveOverrideId(defaultOverride.id);
          setMode("perLocation");
          setShowLocationPicker(false);
        },
      });
      return;
    }

    if (customOverrides.length > 0) {
      setConfirmState({
        title: "Sync all locations?",
        message:
          "This will remove all custom overrides and apply one list to every location.",
        bullets: [
          `${customOverrides.length} override${
            customOverrides.length === 1 ? "" : "s"
          } will be deleted`,
          "Every location will use the default list",
          "This cannot be undone",
        ],
        confirmLabel: "Sync all locations",
        confirmDanger: true,
        onConfirm: () => {
          setConfirmState(null);
          setMode("synced");
          const fallback = overrides.find((override) => override.isDefault);
          const items = fallback?.itemIds ?? [];
          setSelectedIds(items);
          setSelectedId(items[0] ?? "");
          setOverrides([]);
          setActiveOverrideId("default");
        },
      });
      return;
    }

    setMode("synced");
    const fallback = overrides.find((override) => override.isDefault);
    const items = fallback?.itemIds ?? [];
    setSelectedIds(items);
    setSelectedId(items[0] ?? "");
    setOverrides([]);
    setActiveOverrideId("default");
  };

  const addOverride = () => {
    const id = `override_${Date.now()}`;
    const defaultOverride = overrides.find((override) => override.isDefault);
    const newOverride: ContentOverride = {
      id,
      label: `Override ${customOverrides.length + 1}`,
      isDefault: false,
      locationIds: [],
      itemIds: defaultOverride?.itemIds ?? [],
    };
    updateOverrides([...overrides, newOverride]);
    setActiveOverrideId(id);
    setShowLocationPicker(true);
  };

  const deleteOverride = (id: string) => {
    const target = overrides.find((override) => override.id === id);
    if (!target || target.isDefault) return;
    setConfirmState({
      title: "Remove this override?",
      message: `"${target.label}" covers ${target.locationIds.length} location${
        target.locationIds.length === 1 ? "" : "s"
      }. Those locations will revert to the default list.`,
      confirmLabel: "Remove override",
      confirmDanger: true,
      onConfirm: () => {
        setConfirmState(null);
        const next = overrides.filter((override) => override.id !== id);
        updateOverrides(next);
        setActiveOverrideId(
          next.find((override) => override.isDefault)?.id ?? "default",
        );
      },
    });
  };

  const toggleLocationInOverride = (locationId: string) => {
    if (!activeOverride || activeOverride.isDefault) return;
    updateOverrides(
      overrides.map((override) => {
        if (override.id !== activeOverride.id) return override;
        const has = override.locationIds.includes(locationId);
        return {
          ...override,
          locationIds: has
            ? override.locationIds.filter((id) => id !== locationId)
            : [...override.locationIds, locationId],
        };
      }),
    );
  };

  const toggleAllFilteredLocations = () => {
    if (!activeOverride || activeOverride.isDefault) return;
    const available = filteredLocations.filter(
      (location) => !claimedLocationIds.includes(location.id),
    );
    const availableIds = available.map((location) => location.id);
    const allIn = availableIds.every((id) =>
      activeOverride.locationIds.includes(id),
    );
    updateOverrides(
      overrides.map((override) => {
        if (override.id !== activeOverride.id) return override;
        return {
          ...override,
          locationIds: allIn
            ? override.locationIds.filter((id) => !availableIds.includes(id))
            : Array.from(new Set([...override.locationIds, ...availableIds])),
        };
      }),
    );
  };

  const runSave = async (nextOverrides: ContentOverride[]) => {
    // Only include IDs that exist in the fetched options list. This guards
    // against stale IDs (e.g. leftover Convex IDs) being sent to Supabase.
    const validItemIds = new Set(options.map((opt) => opt.id));
    const cleanedOverrides = nextOverrides.map((override) => ({
      ...override,
      itemIds: override.itemIds.filter((id) => validItemIds.has(id)),
    }));

    const affectedLocationIds = Array.from(
      new Set(cleanedOverrides.flatMap((o) => o.locationIds)),
    );
    if (affectedLocationIds.length === 0) return;

    const { locationIdColumn, entityIdColumn, junctionTable } = field;

    const { error: deleteError } = await supabaseClient
      .from(junctionTable)
      .delete()
      .in(locationIdColumn, affectedLocationIds);
    if (deleteError) throw deleteError;

    const rows = cleanedOverrides.flatMap((override) =>
      override.locationIds.flatMap((locId) =>
        override.itemIds.map((itemId) => ({
          [locationIdColumn]: locId,
          [entityIdColumn]: itemId,
        })),
      ),
    );
    if (rows.length > 0) {
      const { error: insertError } = await supabaseClient
        .from(junctionTable)
        .insert(rows);
      if (insertError) throw insertError;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Filter IDs to only those present in the fetched options so stale
      // references (e.g. old Convex IDs) never reach the database or get
      // persisted back into page data.
      const validItemIds = new Set(options.map((opt) => opt.id));
      const pruneIds = (ids: string[]) =>
        ids.filter((id) => validItemIds.has(id));

      if (mode === "synced") {
        const itemIds = pruneIds(
          field.selectionMode === "multiple"
            ? selectedIds
            : selectedId
              ? [selectedId]
              : [],
        );
        const syncedOverrides = [
          createDefaultOverride(itemIds, allLocationIds),
        ];
        await runSave(syncedOverrides);
        onChange(
          getNextValue(value, {
            source: "dynamic",
            dynamicMode: "synced",
            selectedIds:
              field.selectionMode === "multiple" ? itemIds : undefined,
            selectedId:
              field.selectionMode === "single"
                ? (itemIds[0] ?? undefined)
                : undefined,
            overrides: undefined,
            refresh: Date.now(),
          }),
        );
        onOpenChange(false);
        return;
      }

      const ensuredOverrides = (
        overrides.length > 0
          ? overrides
          : [createDefaultOverride([], allLocationIds)]
      ).map((override) => ({
        ...override,
        itemIds: pruneIds(override.itemIds),
      }));
      const defaultOverride = ensuredOverrides.find(
        (override) => override.isDefault,
      );
      const custom = ensuredOverrides.filter((override) => !override.isDefault);

      const finalizeSave = async () => {
        await runSave(ensuredOverrides);
        onChange(
          getNextValue(value, {
            source: "dynamic",
            dynamicMode: "perLocation",
            overrides: ensuredOverrides,
            selectedIds: undefined,
            selectedId: undefined,
            refresh: Date.now(),
          }),
        );
        onOpenChange(false);
      };

      if (custom.length > 0) {
        const defaultCount = defaultOverride?.locationIds.length ?? 0;
        setConfirmState({
          title: "Save all changes?",
          message: `You have ${custom.length} override${
            custom.length === 1 ? "" : "s"
          } affecting ${custom.reduce(
            (sum, override) => sum + override.locationIds.length,
            0,
          )} location${
            custom.reduce(
              (sum, override) => sum + override.locationIds.length,
              0,
            ) === 1
              ? ""
              : "s"
          }. The remaining ${defaultCount} location${
            defaultCount === 1 ? "" : "s"
          } will use the default list.`,
          bullets: [
            ...custom.map(
              (override) =>
                `"${override.label}": ${override.itemIds.length} ${field.entityLabel.toLowerCase()} → ${override.locationIds.length} location${
                  override.locationIds.length === 1 ? "" : "s"
                }`,
            ),
            `Default: ${defaultOverride?.itemIds.length ?? 0} ${field.entityLabel.toLowerCase()} → ${defaultCount} location${
              defaultCount === 1 ? "" : "s"
            }`,
          ],
          confirmLabel: "Save changes",
          onConfirm: () => {
            setConfirmState(null);
            finalizeSave().catch((err) => {
              setError(
                err instanceof Error ? err.message : "Failed to save changes.",
              );
            });
          },
        });
        setSaving(false);
        return;
      }

      await finalizeSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ width: "min(1000px, calc(100vw - 48px))" }}>
        <DialogHeader>
          <DialogTitle>Choose {field.entityLabel}</DialogTitle>
        </DialogHeader>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => updateMode("synced")}
            style={{
              ...buttonBaseStyles,
              background:
                mode === "synced"
                  ? "var(--puck-color-blue-06, #2563eb)"
                  : "white",
              color: mode === "synced" ? "white" : "var(--puck-color-grey-02)",
            }}
          >
            Synced
          </button>
          <button
            type="button"
            onClick={() => updateMode("perLocation")}
            style={{
              ...buttonBaseStyles,
              background:
                mode === "perLocation"
                  ? "var(--puck-color-blue-06, #2563eb)"
                  : "white",
              color:
                mode === "perLocation" ? "white" : "var(--puck-color-grey-02)",
            }}
          >
            Per-location
          </button>
          <span
            style={{ fontSize: "12px", color: "var(--puck-color-grey-05)" }}
          >
            {mode === "synced"
              ? `Same ${field.entityLabel.toLowerCase()} on all locations`
              : `${customOverrides.length} override${
                  customOverrides.length === 1 ? "" : "s"
                } active`}
          </span>
        </div>

        {mode === "perLocation" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {overrides.map((override) => {
              const isActive = override.id === activeOverrideId;
              return (
                <div
                  key={override.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveOverrideId(override.id);
                    setShowLocationPicker(!override.isDefault);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveOverrideId(override.id);
                      setShowLocationPicker(!override.isDefault);
                    }
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${
                      isActive
                        ? "var(--puck-color-blue-06, #2563eb)"
                        : "var(--puck-color-grey-09, #dcdcdc)"
                    }`,
                    background: isActive ? "rgba(37, 99, 235, 0.1)" : "white",
                    color: isActive
                      ? "var(--puck-color-blue-06, #2563eb)"
                      : "var(--puck-color-grey-02, #292929)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <span>{override.isDefault ? "🌐" : "📍"}</span>
                  <span>{override.label}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      borderRadius: "999px",
                      background: isActive
                        ? "rgba(37, 99, 235, 0.15)"
                        : "var(--puck-color-grey-11)",
                    }}
                  >
                    {override.locationIds.length}
                  </span>
                  {!override.isDefault && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteOverride(override.id);
                      }}
                      style={{
                        ...buttonBaseStyles,
                        padding: "0 6px",
                        border: "none",
                        background: "transparent",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={addOverride}
              style={{
                ...buttonBaseStyles,
                borderStyle: "dashed",
                color: "var(--puck-color-blue-06, #2563eb)",
              }}
            >
              + Override
            </button>
          </div>
        )}

        {mode === "perLocation" &&
          activeOverride &&
          !activeOverride.isDefault && (
            <div
              style={{
                border: "1px solid var(--puck-color-grey-10)",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  padding: "8px 10px",
                  borderBottom: "1px solid var(--puck-color-grey-10)",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={locationSearch}
                  onChange={(event) => setLocationSearch(event.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "120px",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--puck-color-grey-09)",
                  }}
                />
                {regions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() =>
                      setRegionFilter((prev) =>
                        prev === region ? null : region,
                      )
                    }
                    style={{
                      ...buttonBaseStyles,
                      padding: "4px 8px",
                      background:
                        regionFilter === region
                          ? "var(--puck-color-blue-06, #2563eb)"
                          : "white",
                      color:
                        regionFilter === region
                          ? "white"
                          : "var(--puck-color-grey-02)",
                    }}
                  >
                    {region}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowLocationPicker((prev) => !prev)}
                  style={{ ...buttonBaseStyles, padding: "4px 8px" }}
                >
                  {showLocationPicker ? "Collapse" : "Expand"}
                </button>
              </div>
              {showLocationPicker && (
                <>
                  <button
                    type="button"
                    onClick={toggleAllFilteredLocations}
                    style={{
                      ...buttonBaseStyles,
                      width: "100%",
                      borderTop: "none",
                      borderRadius: "0",
                    }}
                  >
                    Select all available ({filteredLocations.length})
                  </button>
                  <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                    {filteredLocations.map((location) => {
                      const claimed = claimedLocationIds.includes(location.id);
                      const checked = activeOverride.locationIds.includes(
                        location.id,
                      );
                      return (
                        <div
                          key={location.id}
                          onClick={() =>
                            !claimed
                              ? toggleLocationInOverride(location.id)
                              : null
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 10px",
                            cursor: claimed ? "default" : "pointer",
                            opacity: claimed ? 0.5 : 1,
                            borderBottom: "1px solid var(--puck-color-grey-11)",
                          }}
                        >
                          <input type="checkbox" readOnly checked={checked} />
                          <span>{location.name ?? "Unnamed location"}</span>
                          {claimed && (
                            <span
                              style={{ fontSize: "11px", color: "#b45309" }}
                            >
                              in another override
                            </span>
                          )}
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: "11px",
                              color: "var(--puck-color-grey-05)",
                            }}
                          >
                            {location.address?.city ?? ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
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
                        updateCurrentItems(
                          moveItem(currentItemIds, index, index - 1),
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
                        updateCurrentItems(
                          moveItem(currentItemIds, index, index + 1),
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
                        updateCurrentItems(
                          currentItemIds.filter((id) => id !== option.id),
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
            <div
              style={{ fontSize: "13px", color: "var(--puck-color-red-05)" }}
            >
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
                const isSelected = currentItemIds.includes(option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      if (field.selectionMode === "multiple") {
                        toggleMultiSelection(option.id);
                      } else {
                        updateCurrentItems([option.id]);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      if (field.selectionMode === "multiple") {
                        toggleMultiSelection(option.id);
                      } else {
                        updateCurrentItems([option.id]);
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
                        onChange={() => updateCurrentItems([option.id])}
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
          <div
            style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
          >
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

      {confirmState && (
        <ConfirmDialog
          open
          title={confirmState.title}
          message={confirmState.message}
          bullets={confirmState.bullets}
          confirmLabel={confirmState.confirmLabel}
          confirmDanger={confirmState.confirmDanger}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </Dialog>
  );
};

export default ItemPickerDialog;
