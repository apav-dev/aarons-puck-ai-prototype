export type ColorSwatch = {
  name: string;
  colorBg: string;
};

export type ProductItem = {
  title: string;
  category: string; // Also serves as color/options
  description: string;
  imageUrl: string;
  link: string;
  price?: string;
  rating?: number; // 1-5 stars
  reviewCount?: number;
  colorSwatches?: ColorSwatch[];
};

export type ProductVariant = "simple" | "cards" | "grid" | "overlay";
export type ImageAspectRatio = "square" | "portrait" | "landscape";
export type PricePosition = "inline" | "below";
export type TextAlign = "left" | "center";

export type ProductsSectionProps = {
  heading: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  convexProducts?: import("../../lib/fields/convex-field-helpers").ConvexMultiValue;
  products: ProductItem[];
  variant: ProductVariant;
  // Visibility options
  showDescription: boolean;
  showCategory: boolean;
  showPrice: boolean;
  showRating: boolean;
  showCTA: boolean;
  showColorSwatches: boolean;
  // Styling options
  imageAspectRatio: ImageAspectRatio;
  pricePosition: PricePosition;
  textAlign: TextAlign;
  // Section-level CTA
  sectionCTAText?: string;
  sectionCTALink?: string;
};
