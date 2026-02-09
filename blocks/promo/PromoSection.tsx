/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import { Section } from "../../components/Section/index";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { PromoSectionProps } from "./types";
import { CompactVariant } from "./variants/CompactVariant";
import { ClassicVariant } from "./variants/ClassicVariant";
import { ImmersiveVariant } from "./variants/ImmersiveVariant";
import { SpotlightVariant } from "./variants/SpotlightVariant";
import ContentModeField from "../../lib/fields/ContentModeField";
import { getSupabaseClient } from "../../lib/supabase";
import {
  ContentModeFieldConfig,
  ContentOption,
  ContentSourceValue,
} from "../../lib/fields/content-mode-types";

const getClassName = getClassNameFactory("PromoSection", styles);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUuid = (id: string) => UUID_RE.test(id);

export type { PromoSectionProps } from "./types";

export const PromoSection: PuckComponent<PromoSectionProps> = ({
  variant,
  title,
  subheading,
  subheadingPosition = "above",
  headingAlign = "left",
  description,
  ctaButton,
  imageUrl,
  puck,
}) => {
  const renderVariant = () => {
    const infoProps = {
      title,
      subheading,
      subheadingPosition,
      headingAlign,
      description,
      ctaButton,
      imageUrl,
      isEditing: puck.isEditing,
    };

    switch (variant) {
      case "classic":
        return <ClassicVariant {...infoProps} />;
      case "spotlight":
        return <SpotlightVariant {...infoProps} imageAsBackground />;
      case "immersive":
        return <ImmersiveVariant {...infoProps} imageAsBackground />;
      case "compact":
      default:
        return (
          <CompactVariant
            title={title}
            subheading={subheading}
            subheadingPosition={subheadingPosition}
            headingAlign={headingAlign}
            description={description}
            ctaButton={ctaButton}
            imageUrl={imageUrl}
            isEditing={puck.isEditing}
          />
        );
    }
  };

  const isSpotlight = variant === "spotlight";
  const isImmersive = variant === "immersive";
  const spotlightBackground = isSpotlight ? (
    <div className={getClassName("spotlightImageWrapper")}>
      <img
        src={imageUrl}
        alt={title}
        className={getClassName("spotlightImage")}
      />
    </div>
  ) : undefined;
  const immersiveBackground = isImmersive ? (
    <div className={getClassName("immersiveImageWrapper")}>
      <div className={getClassName("immersiveOverlay")} />
      <img
        src={imageUrl}
        alt={title}
        className={getClassName("immersiveImage")}
      />
    </div>
  ) : undefined;

  return (
    <Section
      className={getClassName({ [variant]: true })}
      background={spotlightBackground ?? immersiveBackground}
    >
      {renderVariant()}
    </Section>
  );
};

export const PromoSectionConfig: ComponentConfig<PromoSectionProps> = {
  fields: {
    contentSource: {
      type: "custom",
      label: "Promotion",
      entityLabel: "Promotion",
      selectionMode: "single",
      entityTable: "promotions",
      junctionTable: "location_promotions",
      entityIdColumn: "promotion_id",
      locationIdColumn: "location_id",
      mapItemToOption: (item: Record<string, unknown>): ContentOption => ({
        id: String(item.id ?? item._id),
        label: String(item.name ?? "Untitled promotion"),
        imageUrl: item.image ? String(item.image) : undefined,
        raw: item,
      }),
      render: (params) => (
        <ContentModeField
          field={params.field as unknown as ContentModeFieldConfig}
          value={params.value as ContentSourceValue}
          onChange={params.onChange as (value: ContentSourceValue) => void}
        />
      ),
    } as ContentModeFieldConfig,
    variant: {
      type: "radio",
      label: "Variant",
      options: [
        { label: "Compact", value: "compact" },
        { label: "Classic", value: "classic" },
        { label: "Immersive", value: "immersive" },
        { label: "Spotlight", value: "spotlight" },
      ],
    },
    title: {
      type: "text",
      label: "Title",
    },
    subheading: {
      type: "text",
      label: "Subheading",
    },
    subheadingPosition: {
      type: "radio",
      label: "Subheading position",
      options: [
        { label: "Above heading", value: "above" },
        { label: "Below heading", value: "below" },
      ],
    },
    headingAlign: {
      type: "radio",
      label: "Heading alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
    },
    description: {
      type: "textarea",
      label: "Description",
    },
    ctaButton: {
      type: "object",
      label: "CTA Button",
      objectFields: {
        label: { type: "text" },
        href: { type: "text" },
      },
    },
    imageUrl: {
      type: "text",
      label: "Image URL",
      ai: {
        instructions:
          "Always use an image URL provided by the getImage tool. Use the business name as the brand, 'PromoSection' as the component, and any relevant context from the title or description.",
        stream: false,
      },
    },
  },
  defaultProps: {
    contentSource: { source: "static", dynamicMode: "synced" },
    variant: "compact",
    title: "Featured Promotion",
    subheadingPosition: "above",
    headingAlign: "left",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters",
    ctaButton: {
      label: "Learn More",
      href: "#",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
  },
  resolveData: async ({ props }, { metadata }) => {
    const source = props.contentSource;
    if (!source || source.source === "static") {
      return {
        props,
        readOnly: { title: false, description: false, imageUrl: false },
      };
    }
    const supabase = getSupabaseClient();
    let promotion: Record<string, unknown> | null = null;
    const mode =
      source.dynamicMode === "perLocation" ? "perLocation" : "synced";

    if (mode === "synced" && source.selectedId && isValidUuid(source.selectedId)) {
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", source.selectedId)
        .maybeSingle();
      promotion = data as Record<string, unknown> | null;
    }

    if (mode === "perLocation") {
      const locationId = metadata?.location?.id;
      if (locationId) {
        // Always use the junction table as the single source of truth for
        // per-location promotions. The override.itemIds stored in the page
        // JSON are editor-UI metadata and can become stale.
        const { data: linkRows } = await supabase
          .from("location_promotions")
          .select("*, promotions(*)")
          .eq("location_id", locationId);
        const promotions = ((linkRows ?? []) as { promotions: Record<string, unknown> }[]).map(
          (row) => row.promotions
        ).filter(Boolean) as Record<string, unknown>[];
        promotion = promotions[0] ?? null;
      }
    }

    if (!promotion) {
      return {
        props,
        readOnly: { title: false, description: false, imageUrl: false },
      };
    }

    return {
      props: {
        ...props,
        title: String(promotion.name ?? props.title),
        description: String(promotion.description ?? props.description ?? ""),
        imageUrl: String(promotion.image ?? props.imageUrl ?? ""),
      },
      readOnly: { title: true, description: true, imageUrl: true },
    };
  },
  resolveFields: (data) => {
    const { contentSource } = data.props;
    const baseFields = PromoSectionConfig.fields;
    const filteredFields: typeof baseFields = { ...baseFields };

    if (contentSource?.source === "dynamic") {
      delete filteredFields.title;
      delete filteredFields.description;
      delete filteredFields.imageUrl;
    }

    return filteredFields;
  },
  render: PromoSection,
};

export default PromoSection;
