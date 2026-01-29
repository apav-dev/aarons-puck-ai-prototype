export type InsightItem = {
  title: string;
  category: string;
  date: string;
  description: string;
  imageUrl: string;
  link: string;
  linkText?: string;
};

export type InsightVariant = "classic" | "editorial" | "immersive";

export type InsightsSectionProps = {
  heading: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  insights: InsightItem[];
  variant: InsightVariant;
  seeAllButton: {
    label: string;
    href: string;
  };
  // Visibility options
  showCategory: boolean;
  showDate: boolean;
  showDescription: boolean;
  showReadMore: boolean;
};

// Shared props passed to variant components
export type InsightVariantProps = {
  insights: InsightItem[];
  showCategory: boolean;
  showDate: boolean;
  showDescription: boolean;
  showReadMore: boolean;
  isEditing: boolean;
};
