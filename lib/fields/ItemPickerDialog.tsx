"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  RefreshCw,
  SlidersHorizontal,
  Globe,
  MapPin,
  GripVertical,
  Search,
  Plus,
  X,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFieldContext } from "./FieldContext";
import ConfirmDialog from "./ConfirmDialog";
import type {
  ContentModeFieldConfig,
  ContentOption,
  ContentOverride,
  ContentSourceValue,
} from "./content-mode-types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const getNextValue = (
  value: ContentSourceValue | undefined,
  patch: Partial<ContentSourceValue>,
): ContentSourceValue => ({
  source: value?.source ?? "static",
  ...value,
  ...patch,
});

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

/* ------------------------------------------------------------------ */
/*  Sortable selected-item card                                        */
/* ------------------------------------------------------------------ */

function SortableSelectedItem({
  option,
  onRemove,
}: {
  option: ContentOption;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-2"
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {option.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={option.imageUrl}
          alt={option.label}
          className="h-9 w-9 shrink-0 rounded object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-gray-900">
          {option.label}
        </div>
        {option.price != null && (
          <div className="text-xs text-gray-500">
            ${option.price.toFixed(2)}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main dialog                                                        */
/* ------------------------------------------------------------------ */

export const ItemPickerDialog = ({
  open,
  onOpenChange,
  field,
  value,
  onChange,
}: ItemPickerDialogProps) => {
  const { supabaseClient, allLocations } = useFieldContext();

  /* ---- state ---- */
  const [options, setOptions] = useState<ContentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
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

  /* ---- dnd sensors ---- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /* ---- derived ---- */
  const allLocationIds = useMemo(
    () => allLocations.map((l) => l.id),
    [allLocations],
  );

  const activeOverride = useMemo(
    () => overrides.find((o) => o.id === activeOverrideId) ?? null,
    [activeOverrideId, overrides],
  );

  const customOverrides = useMemo(
    () => overrides.filter((o) => !o.isDefault),
    [overrides],
  );

  const claimedLocationIds = useMemo(
    () =>
      overrides
        .filter((o) => !o.isDefault && o.id !== activeOverrideId)
        .flatMap((o) => o.locationIds),
    [activeOverrideId, overrides],
  );

  const regions = useMemo(() => {
    const list = allLocations
      .map((l) => l.address?.region ?? l.slug?.region ?? "")
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [allLocations]);

  const filteredLocations = useMemo(() => {
    const term = locationSearch.trim().toLowerCase();
    return allLocations.filter((l) => {
      const name = l.name?.toLowerCase() ?? "";
      const city = l.address?.city?.toLowerCase() ?? "";
      const region = l.address?.region ?? l.slug?.region ?? "";
      const matchesTerm = !term || name.includes(term) || city.includes(term);
      const matchesRegion = !regionFilter || regionFilter === region;
      return matchesTerm && matchesRegion;
    });
  }, [allLocations, locationSearch, regionFilter]);

  const categories = useMemo(() => {
    const cats = options
      .map((o) => o.category)
      .filter((c): c is string => Boolean(c));
    return Array.from(new Set(cats));
  }, [options]);

  const filteredOptions = useMemo(() => {
    let result = options;
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (o) =>
          o.label.toLowerCase().includes(term) ||
          (o.description?.toLowerCase().includes(term) ?? false),
      );
    }
    if (categoryFilter) {
      result = result.filter((o) => o.category === categoryFilter);
    }
    return result;
  }, [options, search, categoryFilter]);

  const currentItemIds = useMemo(() => {
    if (mode === "synced") {
      return field.selectionMode === "multiple"
        ? selectedIds
        : selectedId
          ? [selectedId]
          : [];
    }
    return activeOverride?.itemIds ?? [];
  }, [activeOverride?.itemIds, field.selectionMode, mode, selectedId, selectedIds]);

  const selectedOptions = useMemo(() => {
    if (field.selectionMode === "multiple") {
      return currentItemIds
        .map((id) => options.find((o) => o.id === id))
        .filter(Boolean) as ContentOption[];
    }
    if (!currentItemIds[0]) return [];
    const opt = options.find((o) => o.id === currentItemIds[0]);
    return opt ? [opt] : [];
  }, [currentItemIds, field.selectionMode, options]);

  /* ---- effects ---- */

  // Reset local state when dialog opens
  useEffect(() => {
    if (!open) return;
    setSearch("");
    setCategoryFilter(null);
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

  // Fetch options from Supabase
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

        const validIds = new Set(next.map((opt) => opt.id));
        const prune = (ids: string[]) => ids.filter((id) => validIds.has(id));

        setSelectedIds((prev) => {
          const pruned = prune(prev);
          return pruned.length === prev.length ? prev : pruned;
        });
        setSelectedId((prev) => (validIds.has(prev) ? prev : ""));

        if (!hasSyncedFromDB.current) {
          hasSyncedFromDB.current = true;

          const { data: junctionRows } = await supabaseClient
            .from(field.junctionTable)
            .select("*");

          if (!active) return;

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
              const repLocId = override.locationIds[0];
              const dbItems = repLocId
                ? (locationToItems.get(repLocId) ?? []).filter((id) =>
                    validIds.has(id),
                  )
                : [];
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
          setError(e instanceof Error ? e.message : "Failed to load items.");
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

  /* ---- actions ---- */

  const updateOverrides = (nextOverrides: ContentOverride[]) => {
    const defaultOverride = nextOverrides.find((o) => o.isDefault);
    if (!defaultOverride) {
      setOverrides(nextOverrides);
      return;
    }
    const claimed = nextOverrides
      .filter((o) => !o.isDefault)
      .flatMap((o) => o.locationIds);
    const nextDefault = {
      ...defaultOverride,
      locationIds: allLocationIds.filter((id) => !claimed.includes(id)),
    };
    setOverrides(
      nextOverrides.map((o) => (o.isDefault ? nextDefault : o)),
    );
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
      overrides.map((o) =>
        o.id === activeOverride.id
          ? {
              ...o,
              itemIds:
                field.selectionMode === "multiple"
                  ? next
                  : next[0]
                    ? [next[0]]
                    : [],
            }
          : o,
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
        title: "Enable per-location customization?",
        message:
          "This lets you show different products at different locations. The current selection becomes the default for all locations. You can then add overrides for specific locations.",
        bullets: [
          "Create overrides to give certain locations a different product list",
          "Locations without an override keep the default selection",
          "You can return to synced mode at any time",
        ],
        confirmLabel: "Enable customization",
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
          `${customOverrides.length} override${customOverrides.length === 1 ? "" : "s"} will be deleted`,
          "Every location will use the default list",
          "This cannot be undone",
        ],
        confirmLabel: "Sync all locations",
        confirmDanger: true,
        onConfirm: () => {
          setConfirmState(null);
          setMode("synced");
          const fallback = overrides.find((o) => o.isDefault);
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
    const fallback = overrides.find((o) => o.isDefault);
    const items = fallback?.itemIds ?? [];
    setSelectedIds(items);
    setSelectedId(items[0] ?? "");
    setOverrides([]);
    setActiveOverrideId("default");
  };

  const addOverride = () => {
    const id = `override_${Date.now()}`;
    const defaultOverride = overrides.find((o) => o.isDefault);
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
    const target = overrides.find((o) => o.id === id);
    if (!target || target.isDefault) return;
    setConfirmState({
      title: "Remove this override?",
      message: `"${target.label}" covers ${target.locationIds.length} location${target.locationIds.length === 1 ? "" : "s"}. Those locations will revert to the default list.`,
      confirmLabel: "Remove override",
      confirmDanger: true,
      onConfirm: () => {
        setConfirmState(null);
        const next = overrides.filter((o) => o.id !== id);
        updateOverrides(next);
        setActiveOverrideId(
          next.find((o) => o.isDefault)?.id ?? "default",
        );
      },
    });
  };

  const toggleLocationInOverride = (locationId: string) => {
    if (!activeOverride || activeOverride.isDefault) return;
    updateOverrides(
      overrides.map((o) => {
        if (o.id !== activeOverride.id) return o;
        const has = o.locationIds.includes(locationId);
        return {
          ...o,
          locationIds: has
            ? o.locationIds.filter((id) => id !== locationId)
            : [...o.locationIds, locationId],
        };
      }),
    );
  };

  const toggleAllFilteredLocations = () => {
    if (!activeOverride || activeOverride.isDefault) return;
    const available = filteredLocations.filter(
      (l) => !claimedLocationIds.includes(l.id),
    );
    const availableIds = available.map((l) => l.id);
    const allIn = availableIds.every((id) =>
      activeOverride.locationIds.includes(id),
    );
    updateOverrides(
      overrides.map((o) => {
        if (o.id !== activeOverride.id) return o;
        return {
          ...o,
          locationIds: allIn
            ? o.locationIds.filter((id) => !availableIds.includes(id))
            : Array.from(new Set([...o.locationIds, ...availableIds])),
        };
      }),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = currentItemIds.indexOf(String(active.id));
    const newIndex = currentItemIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    updateCurrentItems(arrayMove(currentItemIds, oldIndex, newIndex));
  };

  /* ---- save ---- */

  const runSave = async (nextOverrides: ContentOverride[]) => {
    const validItemIds = new Set(options.map((opt) => opt.id));
    const cleanedOverrides = nextOverrides.map((o) => ({
      ...o,
      itemIds: o.itemIds.filter((id) => validItemIds.has(id)),
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

    const rows = cleanedOverrides.flatMap((o) =>
      o.locationIds.flatMap((locId) =>
        o.itemIds.map((itemId) => ({
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
      ).map((o) => ({
        ...o,
        itemIds: pruneIds(o.itemIds),
      }));
      const defaultOverride = ensuredOverrides.find((o) => o.isDefault);
      const custom = ensuredOverrides.filter((o) => !o.isDefault);

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
          message: `You have ${custom.length} override${custom.length === 1 ? "" : "s"} affecting ${custom.reduce((sum, o) => sum + o.locationIds.length, 0)} location${custom.reduce((sum, o) => sum + o.locationIds.length, 0) === 1 ? "" : "s"}. The remaining ${defaultCount} location${defaultCount === 1 ? "" : "s"} will use the default list.`,
          bullets: [
            ...custom.map(
              (o) =>
                `"${o.label}": ${o.itemIds.length} ${field.entityLabel.toLowerCase()} → ${o.locationIds.length} location${o.locationIds.length === 1 ? "" : "s"}`,
            ),
            `Default: ${defaultOverride?.itemIds.length ?? 0} ${field.entityLabel.toLowerCase()} → ${defaultCount} location${defaultCount === 1 ? "" : "s"}`,
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

  /* ---- footer status text ---- */
  const footerStatus = useMemo(() => {
    if (mode === "synced") {
      return `${currentItemIds.length} ${field.entityLabel.toLowerCase()} → all ${allLocations.length} locations`;
    }
    if (activeOverride) {
      return `${activeOverride.itemIds.length} ${field.entityLabel.toLowerCase()} → ${activeOverride.locationIds.length} locations`;
    }
    return "";
  }, [mode, currentItemIds.length, field.entityLabel, allLocations.length, activeOverride]);

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col gap-0 p-0"
        style={{ width: "min(1040px, calc(100vw - 48px))", maxHeight: "calc(100vh - 48px)" }}
      >
        {/* -------- Header -------- */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Choose {field.entityLabel}
          </DialogTitle>
          {field.label && (
            <span className="text-sm text-gray-400">{field.label}</span>
          )}
        </div>

        {/* -------- Mode toggle -------- */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-3">
          <button
            type="button"
            onClick={() => updateMode("synced")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              mode === "synced"
                ? "border-indigo-500 bg-white text-indigo-700 shadow-sm"
                : "border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Synced
          </button>
          <button
            type="button"
            onClick={() => updateMode("perLocation")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              mode === "perLocation"
                ? "border-indigo-500 bg-white text-indigo-700 shadow-sm"
                : "border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Per-location
          </button>
          <span className="text-sm text-gray-400">
            {mode === "synced"
              ? `Same ${field.entityLabel.toLowerCase()} on all ${allLocations.length} locations`
              : `${customOverrides.length} override${customOverrides.length === 1 ? "" : "s"} active`}
          </span>
        </div>

        {/* -------- Override tabs (per-location) -------- */}
        {mode === "perLocation" && (
          <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-3">
            {overrides.map((override) => {
              const isActive = override.id === activeOverrideId;
              return (
                <button
                  key={override.id}
                  type="button"
                  onClick={() => {
                    setActiveOverrideId(override.id);
                    setShowLocationPicker(!override.isDefault);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {override.isDefault ? (
                    <Globe className="h-3.5 w-3.5" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                  {override.label}
                  <span
                    className={cn(
                      "ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                      isActive
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-200 text-gray-600",
                    )}
                  >
                    {override.locationIds.length}
                  </span>
                  {!override.isDefault && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOverride(override.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          deleteOverride(override.id);
                        }
                      }}
                      className="ml-0.5 rounded p-0.5 text-gray-400 hover:bg-indigo-100 hover:text-indigo-600"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={addOverride}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Override
            </button>
          </div>
        )}

        {/* -------- Location picker (per-location, non-default override) -------- */}
        {mode === "perLocation" &&
          activeOverride &&
          !activeOverride.isDefault && (
            <div className="border-b border-gray-200">
              {/* Search & filters row */}
              <div className="flex flex-wrap items-center gap-2 px-6 py-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search locations..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="h-8 pl-8 text-sm"
                  />
                </div>
                {regions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() =>
                      setRegionFilter((prev) => (prev === region ? null : region))
                    }
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                      regionFilter === region
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    {region}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowLocationPicker((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  {showLocationPicker ? "Collapse" : "Expand"}
                  <ChevronUp
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      !showLocationPicker && "rotate-180",
                    )}
                  />
                </button>
              </div>

              {/* Location list */}
              {showLocationPicker && (
                <div className="max-h-[200px] overflow-y-auto border-t border-gray-100 px-6">
                  {/* Select all */}
                  <label className="flex cursor-pointer items-center gap-3 border-b border-gray-100 py-2.5">
                    <Checkbox
                      checked={
                        filteredLocations
                          .filter((l) => !claimedLocationIds.includes(l.id))
                          .every((l) => activeOverride.locationIds.includes(l.id)) &&
                        filteredLocations.filter(
                          (l) => !claimedLocationIds.includes(l.id),
                        ).length > 0
                      }
                      onCheckedChange={() => toggleAllFilteredLocations()}
                      className="data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600"
                    />
                    <span className="text-sm text-gray-700">
                      All available ({filteredLocations.length})
                    </span>
                  </label>

                  {filteredLocations.map((location) => {
                    const claimed = claimedLocationIds.includes(location.id);
                    const checked = activeOverride.locationIds.includes(location.id);
                    return (
                      <label
                        key={location.id}
                        className={cn(
                          "flex items-center gap-3 border-b border-gray-100 py-2.5",
                          claimed
                            ? "cursor-default opacity-50"
                            : "cursor-pointer",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={claimed}
                          onCheckedChange={() =>
                            !claimed && toggleLocationInOverride(location.id)
                          }
                          className="data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600"
                        />
                        <span className="flex-1 text-sm text-gray-800">
                          {location.name ?? "Unnamed location"}
                        </span>
                        {claimed && (
                          <span className="text-xs text-amber-600">
                            in another override
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {location.address?.city
                            ? `${location.address.city}, ${location.address.region ?? ""}`
                            : ""}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        {/* ================================================================ */}
        {/*  Main two-column area                                            */}
        {/* ================================================================ */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* -------- Left: Selected column -------- */}
          {field.selectionMode === "multiple" && (
            <div className="flex w-[240px] shrink-0 flex-col border-r border-gray-200">
              {/* Selected header */}
              <div className="flex items-center gap-2 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Selected
                </span>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-xs font-semibold text-white">
                  {currentItemIds.length}
                </span>
              </div>

              {/* Sortable list */}
              <ScrollArea className="flex-1 px-3 pb-3">
                {selectedOptions.length === 0 ? (
                  <div className="px-2 py-8 text-center text-xs text-gray-400">
                    No items selected
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={currentItemIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-1.5">
                        {selectedOptions.map((option) => (
                          <SortableSelectedItem
                            key={option.id}
                            option={option}
                            onRemove={() =>
                              updateCurrentItems(
                                currentItemIds.filter((id) => id !== option.id),
                              )
                            }
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </ScrollArea>
            </div>
          )}

          {/* -------- Right: Product browser -------- */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Search & filter bar */}
            <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={`Search ${field.entityLabel.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-8 text-sm"
                />
              </div>
              {categories.length > 0 && (
                <select
                  value={categoryFilter ?? ""}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value || null)
                  }
                  className="h-9 rounded-md border border-input bg-white px-3 text-sm text-gray-700 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">All</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
              <Button variant="outline" size="sm" className="shrink-0 gap-1">
                <Plus className="h-3.5 w-3.5" />
                New
              </Button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Product list */}
            <ScrollArea className="flex-1">
              <div className="divide-y divide-gray-100">
                {loading && (
                  <div className="px-4 py-12 text-center text-sm text-gray-400">
                    Loading...
                  </div>
                )}

                {!loading &&
                  filteredOptions.map((option) => {
                    const isSelected = currentItemIds.includes(option.id);
                    return (
                      <div
                        key={option.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (field.selectionMode === "multiple") {
                            toggleMultiSelection(option.id);
                          } else {
                            updateCurrentItems([option.id]);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" && e.key !== " ") return;
                          e.preventDefault();
                          if (field.selectionMode === "multiple") {
                            toggleMultiSelection(option.id);
                          } else {
                            updateCurrentItems([option.id]);
                          }
                        }}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
                          isSelected && "bg-indigo-50/60",
                        )}
                      >
                        {/* Checkbox / Radio */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          {field.selectionMode === "multiple" ? (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleMultiSelection(option.id)
                              }
                              className="data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600"
                            />
                          ) : (
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => updateCurrentItems([option.id])}
                              className="h-4 w-4 accent-indigo-600"
                            />
                          )}
                        </div>

                        {/* Image */}
                        {option.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={option.imageUrl}
                            alt={option.label}
                            className="h-10 w-10 shrink-0 rounded object-cover"
                          />
                        )}

                        {/* Name & description */}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {option.label}
                          </div>
                          {option.description && (
                            <div className="truncate text-xs text-gray-500">
                              {option.description}
                            </div>
                          )}
                        </div>

                        {/* Category badge */}
                        {option.category && (
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-gray-100 text-xs font-medium text-gray-600"
                          >
                            {option.category}
                          </Badge>
                        )}

                        {/* Price */}
                        {option.price != null && (
                          <span className="shrink-0 text-sm font-medium text-gray-700">
                            ${option.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    );
                  })}

                {!loading && filteredOptions.length === 0 && (
                  <div className="px-4 py-12 text-center text-sm text-gray-400">
                    No matching {field.entityLabel.toLowerCase()}.
                  </div>
                )}
              </div>

              {/* Item count */}
              {!loading && (
                <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
                  {options.length} {field.entityLabel.toLowerCase()}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* -------- Footer -------- */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {mode === "synced" ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}
            {mode === "perLocation" && activeOverride && !activeOverride.isDefault ? (
              <span>
                Editing:{" "}
                <span className="font-semibold text-gray-800">
                  {activeOverride.label}
                </span>{" "}
                &middot; {footerStatus}
              </span>
            ) : (
              <span>{footerStatus}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* -------- Confirm dialog -------- */}
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
