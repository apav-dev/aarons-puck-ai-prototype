export type ColumnItem = {
  title: string;
  content: string;
};

export type AboutColumnsVariant = "classic" | "cards" | "stacked" | "bordered";

export type AboutColumnsSectionProps = {
  tagline?: string;
  heading: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  desktopColumns: 2 | 3;
  columns: ColumnItem[];
  variant: AboutColumnsVariant;
};

// Shared props passed to variant components
export type AboutColumnsVariantProps = {
  columns: ColumnItem[];
  desktopColumns: 2 | 3;
  isEditing: boolean;
};
