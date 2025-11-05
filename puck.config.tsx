import type { Config } from "@measured/puck";
import { Hero, HeroProps } from "./blocks/hero";
import { CoreInfoSection, CoreInfoSectionProps } from "./blocks/core-info";
import { PromoSection, PromoSectionProps } from "./blocks/promo";
import { ProductsSection, ProductsSectionProps } from "./blocks/products";

type Props = {
  Hero: HeroProps;
  CoreInfoSection: CoreInfoSectionProps;
  PromoSection: PromoSectionProps;
  ProductsSection: ProductsSectionProps;
};

export const config: Config<Props> = {
  components: {
    Hero: Hero,
    CoreInfoSection: CoreInfoSection,
    PromoSection: PromoSection,
    ProductsSection: ProductsSection,
  },
};

export default config;
