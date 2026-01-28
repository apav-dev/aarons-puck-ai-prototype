export type PromoVariant = "compact" | "classic" | "immersive" | "spotlight";

export type PromoButton = {
  label: string;
  href: string;
};

export type PromoSectionProps = {
  variant: PromoVariant;
  title: string;
  description: string;
  ctaButton: PromoButton;
  imageUrl: string;
};
