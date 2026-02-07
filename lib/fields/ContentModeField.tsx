"use client";

import { useMemo, useState } from "react";
import { FieldLabel } from "@puckeditor/core";
import { useConvexFieldContext } from "./ConvexFieldContext";
import ItemPickerDialog from "./ItemPickerDialog";
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

  const source = value?.source ?? "static";
  const dynamicMode = value?.dynamicMode ?? "all";
  const locationId = location?._id ?? "";
  const isDynamic = source === "dynamic";

  const selectedCount = useMemo(() => {
    if (!isDynamic) return 0;
    if (dynamicMode === "all") {
      return field.selectionMode === "multiple"
        ? value?.selectedIds?.length ?? 0
        : value?.selectedId
          ? 1
          : 0;
    }
    if (!locationId) return 0;
    if (field.selectionMode === "multiple") {
      return value?.perLocationSelectedIds?.[locationId]?.length ?? 0;
    }
    return value?.perLocationSelectedId?.[locationId] ? 1 : 0;
  }, [
    dynamicMode,
    field.selectionMode,
    isDynamic,
    locationId,
    value?.perLocationSelectedId,
    value?.perLocationSelectedIds,
    value?.selectedId,
    value?.selectedIds,
  ]);

  const updateSource = (nextDynamic: boolean) => {
    onChange(
      getNextValue(value, {
        source: nextDynamic ? "dynamic" : "static",
        dynamicMode: value?.dynamicMode ?? "all",
      })
    );
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
              border: "1px solid var(--puck-color-grey-09)",
              background: !isDynamic ? "var(--puck-color-blue-06)" : "white",
              color: !isDynamic ? "white" : "var(--puck-color-grey-02)",
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
              border: "1px solid var(--puck-color-grey-09)",
              background: isDynamic ? "var(--puck-color-blue-06)" : "white",
              color: isDynamic ? "white" : "var(--puck-color-grey-02)",
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
            {selectedCount} {field.entityLabel.toLowerCase()} selected.
            {dynamicMode === "perLocation" && !locationId && (
              <span> Choose a preview location to enable selection.</span>
            )}
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: "var(--puck-color-grey-05)" }}>
            Static content is saved directly in the page JSON.
          </div>
        )}
      </div>

      <ItemPickerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        field={field}
        value={value}
        onChange={onChange}
      />
    </FieldLabel>
  );
};

export default ContentModeField;
