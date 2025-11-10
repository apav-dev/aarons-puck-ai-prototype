import type { Config } from "@measured/puck";
import { Header, HeaderProps } from "./blocks/header";
import { Hero, HeroProps } from "./blocks/hero";
import { CoreInfoSection, CoreInfoSectionProps } from "./blocks/core-info";
import { PromoSection, PromoSectionProps } from "./blocks/promo";
import { ProductsSection, ProductsSectionProps } from "./blocks/products";
import { FAQsSection, FAQsSectionProps } from "./blocks/faqs";
import { InsightsSection, InsightsSectionProps } from "./blocks/insights";
import { EventsSection, EventsSectionProps } from "./blocks/events";
import { TeamSection, TeamSectionProps } from "./blocks/team";

type Props = {
  Header: HeaderProps;
  Hero: HeroProps;
  CoreInfoSection: CoreInfoSectionProps;
  PromoSection: PromoSectionProps;
  ProductsSection: ProductsSectionProps;
  FAQsSection: FAQsSectionProps;
  // InsightsSection: InsightsSectionProps;
  // EventsSection: EventsSectionProps;
  // TeamSection: TeamSectionProps;
};

export const config: Config<Props> = {
  components: {
    Header: Header,
    Hero: Hero,
    CoreInfoSection: CoreInfoSection,
    PromoSection: PromoSection,
    ProductsSection: ProductsSection,
    FAQsSection: FAQsSection,
    // InsightsSection: InsightsSection,
    // EventsSection: EventsSection,
    // TeamSection: TeamSection,
  },
};

export default config;
