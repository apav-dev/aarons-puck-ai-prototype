export type PromoVariant = "compact" | "classic" | "immersive" | "spotlight";

export type PromoButton = {
  label: string;
  href: string;
};

export type PromoSectionProps = {
  variant: PromoVariant;
  convexPromotion?: import("../../lib/fields/convex-field-helpers").ConvexSingleValue;
  title: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  description: string;
  ctaButton: PromoButton;
  imageUrl: string;
};
