"use client";

import { useMemo, useState } from "react";
import { FieldLabel } from "@puckeditor/core";
import { useConvexFieldContext } from "./ConvexFieldContext";
import ItemPickerDialog from "./ItemPickerDialog";
import ConfirmDialog from "./ConfirmDialog";
import type {
  ContentModeFieldConfig,
  ContentSourceValue,
} from "./content-mode-types";

type RenderParams = {
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

export const ContentModeField = ({ field, value, onChange }: RenderParams) => {
  const { location } = useConvexFieldContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<
    | null
    | {
        title: string;
        message: string;
        bullets?: string[];
        confirmLabel: string;
        confirmDanger?: boolean;
        onConfirm: () => void;
      }
  >(null);

  const source = value?.source ?? "static";
  const dynamicMode = value?.dynamicMode ?? "synced";
  const locationId = location?._id ?? "";
  const isDynamic = source === "dynamic";

  const overrides = value?.overrides ?? [];
  const customOverrides = overrides.filter((override) => !override.isDefault);
  const defaultOverride = overrides.find((override) => override.isDefault);
  const defaultOverrideItems = defaultOverride?.itemIds ?? [];

  const selectedCount = useMemo(() => {
    if (!isDynamic) return 0;
    if (dynamicMode === "synced") {
      return field.selectionMode === "multiple"
        ? value?.selectedIds?.length ?? 0
        : value?.selectedId
          ? 1
          : 0;
    }
    if (!overrides.length) return 0;
    if (field.selectionMode === "multiple") {
      return defaultOverrideItems.length;
    }
    return defaultOverrideItems[0] ? 1 : 0;
  }, [
    dynamicMode,
    field.selectionMode,
    isDynamic,
    overrides.length,
    defaultOverrideItems,
    value?.selectedId,
    value?.selectedIds,
  ]);

  const updateSource = (nextDynamic: boolean) => {
    onChange(
      getNextValue(value, {
        source: nextDynamic ? "dynamic" : "static",
        dynamicMode: value?.dynamicMode ?? "synced",
      })
    );
  };

  const applySyncedMode = () => {
    const nextSelectedIds =
      field.selectionMode === "multiple"
        ? defaultOverrideItems
        : value?.selectedIds;
    const nextSelectedId =
      field.selectionMode === "single"
        ? defaultOverrideItems[0] ?? value?.selectedId
        : value?.selectedId;
    onChange(
      getNextValue(value, {
        source: "dynamic",
        dynamicMode: "synced",
        overrides: undefined,
        selectedIds: field.selectionMode === "multiple" ? nextSelectedIds : undefined,
        selectedId: field.selectionMode === "single" ? nextSelectedId : undefined,
      })
    );
  };

  const updateDynamicMode = (nextMode: "synced" | "perLocation") => {
    if (nextMode === dynamicMode) return;
    if (nextMode === "perLocation") {
      setConfirmState({
        title: "Enable per-location overrides?",
        message:
          "Switching to per-location lets you customize by location. The current selection becomes the default for all locations.",
        bullets: [
          "Create overrides to assign specific locations",
          "Locations without overrides keep the default list",
          "You can switch back to Synced anytime",
        ],
        confirmLabel: "Enable per-location",
        onConfirm: () => {
          setConfirmState(null);
          onChange(
            getNextValue(value, {
              source: "dynamic",
              dynamicMode: "perLocation",
            })
          );
          setDialogOpen(true);
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
          applySyncedMode();
        },
      });
      return;
    }

    applySyncedMode();
  };

  return (
    <FieldLabel label={field.label ?? field.entityLabel}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => updateSource(false)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid var(--puck-color-grey-09, #dcdcdc)",
              background: !isDynamic ? "var(--puck-color-blue-06, #2563eb)" : "white",
              color: !isDynamic ? "white" : "var(--puck-color-grey-02, #292929)",
              cursor: "pointer",
            }}
          >
            Static
          </button>
          <button
            type="button"
            onClick={() => updateSource(true)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid var(--puck-color-grey-09, #dcdcdc)",
              background: isDynamic ? "var(--puck-color-blue-06, #2563eb)" : "white",
              color: isDynamic ? "white" : "var(--puck-color-grey-02, #292929)",
              cursor: "pointer",
            }}
          >
            Dynamic
          </button>
          {isDynamic && (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid var(--puck-color-grey-09)",
                background: "white",
                cursor: "pointer",
              }}
            >
              Choose {field.entityLabel}
            </button>
          )}
        </div>

        {isDynamic ? (
          <div style={{ fontSize: "12px", color: "var(--puck-color-grey-05)" }}>
            {dynamicMode === "synced" ? (
              <>
                {selectedCount} {field.entityLabel.toLowerCase()} synced to all
                locations.
              </>
            ) : (
              <>
                {customOverrides.length} override
                {customOverrides.length === 1 ? "" : "s"} active.
              </>
            )}
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: "var(--puck-color-grey-05)" }}>
            Static content is saved directly in the page JSON.
          </div>
        )}
      </div>

      {isDynamic && (
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={() => updateDynamicMode("synced")}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid var(--puck-color-grey-09, #dcdcdc)",
              background:
                dynamicMode === "synced"
                  ? "var(--puck-color-blue-06, #2563eb)"
                  : "white",
              color:
                dynamicMode === "synced"
                  ? "white"
                  : "var(--puck-color-grey-02, #292929)",
              cursor: "pointer",
            }}
          >
            Synced
          </button>
          <button
            type="button"
            onClick={() => updateDynamicMode("perLocation")}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid var(--puck-color-grey-09, #dcdcdc)",
              background:
                dynamicMode === "perLocation"
                  ? "var(--puck-color-blue-06, #2563eb)"
                  : "white",
              color:
                dynamicMode === "perLocation"
                  ? "white"
                  : "var(--puck-color-grey-02, #292929)",
              cursor: "pointer",
            }}
          >
            Per-location
          </button>
        </div>
      )}

      <ItemPickerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        field={field}
        value={value}
        onChange={onChange}
      />

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
    </FieldLabel>
  );
};

export default ContentModeField;
