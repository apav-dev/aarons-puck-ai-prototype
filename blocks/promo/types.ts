export type PromoVariant = "compact" | "classic" | "immersive" | "spotlight";

export type PromoButton = {
  label: string;
  href: string;
};

export type PromoSectionProps = {
  variant: PromoVariant;
  title: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  description: string;
  ctaButton: PromoButton;
  imageUrl: string;
};
