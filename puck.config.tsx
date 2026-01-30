import type { Config } from "@puckeditor/core";
import { Hero, HeroProps } from "./blocks/hero";
import {
  FinancialServicesHero,
  FinancialServicesHeroProps,
} from "./blocks/financial-services-hero";
import { CoreInfoSection, CoreInfoSectionProps } from "./blocks/core-info";
import { PromoSection, PromoSectionProps } from "./blocks/promo";
import { ProductsSection, ProductsSectionProps } from "./blocks/products";
import { FAQsSection, FAQsSectionProps } from "./blocks/faqs";
import { InsightsSection, InsightsSectionProps } from "./blocks/insights";
import { TeamSection, TeamSectionProps } from "./blocks/team";
import { PhotoGridSection, PhotoGridSectionProps } from "./blocks/photo-grid";
import { AboutColumnsSection, AboutColumnsSectionProps } from "./blocks/about-columns";
import {
  ProfessionalAboutSection,
  ProfessionalAboutSectionProps,
} from "./blocks/professional-about";
import { Heading, HeadingProps } from "./blocks/atoms/heading";
import { Text, TextProps } from "./blocks/atoms/text";
import { Button, ButtonProps } from "./blocks/atoms/button";
import { Image, ImageProps } from "./blocks/atoms/image";
import { Spacer, SpacerProps } from "./blocks/atoms/spacer";
import { Flex, FlexProps } from "./blocks/atoms/flex";
import { Grid, GridProps } from "./blocks/atoms/grid";
import { NavHeader, NavHeaderProps } from "./blocks/nav-header";

// Page Sections Props Type
type PageSectionsProps = {
  Header: NavHeaderProps;
  Hero: HeroProps;
  FinancialServicesHero: FinancialServicesHeroProps;
  CoreInfoSection: CoreInfoSectionProps;
  PromoSection: PromoSectionProps;
  ProductsSection: ProductsSectionProps;
  FAQsSection: FAQsSectionProps;
  InsightsSection: InsightsSectionProps;
  TeamSection: TeamSectionProps;
  PhotoGridSection: PhotoGridSectionProps;
  AboutColumnsSection: AboutColumnsSectionProps;
  ProfessionalAboutSection: ProfessionalAboutSectionProps;
};

// Atoms Props Type
type AtomsProps = {
  Flex: FlexProps;
  Grid: GridProps;
  // Card: CardProps;
  Heading: HeadingProps;
  Text: TextProps;
  Button: ButtonProps;
  Image: ImageProps;
  Spacer: SpacerProps;
};

// Combined Props Type
type Props = PageSectionsProps & AtomsProps;

// Full Pages Config: Only Page Sections
const fullPagesConfig: Config<PageSectionsProps> = {
  components: {
    Header: NavHeader,
    Hero: Hero,
    FinancialServicesHero: FinancialServicesHero,
    CoreInfoSection: CoreInfoSection,
    PromoSection: PromoSection,
    ProductsSection: ProductsSection,
    FAQsSection: FAQsSection,
    InsightsSection: InsightsSection,
    TeamSection: TeamSection,
    PhotoGridSection: PhotoGridSection,
    AboutColumnsSection: AboutColumnsSection,
    ProfessionalAboutSection: ProfessionalAboutSection,
  },
};

// Atoms Config: Only Atomic Components
const atomsConfig: Config<AtomsProps> = {
  components: {
    Flex: Flex,
    Grid: Grid,
    // Card: Card,
    Heading: Heading,
    Text: Text,
    Button: Button,
    Image: Image,
    Spacer: Spacer,
  },
};

// Get the current mode from environment variable
// NEXT_PUBLIC_ prefix is required for client-side access in Next.js
// Falls back to PUCK_AI_MODE for server-side only scenarios
const getMode = () => {
  return (
    process.env.NEXT_PUBLIC_PUCK_AI_MODE ||
    process.env.PUCK_AI_MODE ||
    "fullPages"
  );
};

// Export the appropriate config based on mode
// Image mode uses atomsConfig since it builds with atomic components
const getConfig = (): Config<PageSectionsProps | AtomsProps> => {
  const mode = getMode();
  return mode === "atoms" || mode === "image" ? atomsConfig : fullPagesConfig;
};

export const config = getConfig();

export default config;
