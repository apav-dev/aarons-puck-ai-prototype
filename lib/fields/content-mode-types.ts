import type { CustomField } from "@puckeditor/core";

export type ContentSelectionMode = "single" | "multiple";

export type ContentOption = {
  id: string;
  label: string;
  imageUrl?: string;
  raw?: Record<string, unknown>;
};

export type ContentOverride = {
  id: string;
  label: string;
  isDefault: boolean;
  locationIds: string[];
  itemIds: string[];
};

export type ContentSourceValue = {
  source: "static" | "dynamic";
  dynamicMode?: "synced" | "perLocation";
  selectedIds?: string[];
  selectedId?: string;
  overrides?: ContentOverride[];
  perLocationSelectedIds?: Record<string, string[]>;
  perLocationSelectedId?: Record<string, string | null>;
  refresh?: number;
};

export type ContentModeFieldConfig = CustomField<ContentSourceValue> & {
  type: "custom";
  label?: string;
  entityLabel: string;
  selectionMode: ContentSelectionMode;
  entityTable: string;
  junctionTable: string;
  entityIdColumn: string;
  locationIdColumn: string;
  mapItemToOption: (item: Record<string, unknown>) => ContentOption;
};
