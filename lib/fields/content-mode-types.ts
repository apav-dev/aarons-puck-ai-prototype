export type ContentSelectionMode = "single" | "multiple";

export type ContentOption = {
  id: string;
  label: string;
  imageUrl?: string;
  raw?: Record<string, unknown>;
};

export type ContentSourceValue = {
  source: "static" | "dynamic";
  dynamicMode?: "all" | "perLocation";
  selectedIds?: string[];
  selectedId?: string;
  perLocationSelectedIds?: Record<string, string[]>;
  perLocationSelectedId?: Record<string, string | null>;
  refresh?: number;
};

export type ContentModeFieldConfig = {
  type: "custom";
  label?: string;
  entityLabel: string;
  selectionMode: ContentSelectionMode;
  listQueryName: string;
  listArgs?: Record<string, unknown>;
  mapItemToOption: (item: Record<string, unknown>) => ContentOption;
  currentForLocationQueryName: string;
  linkMutationName: string;
  unlinkMutationName: string;
  locationIdArg: string;
  itemIdArg: string;
};
