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

const getClassName = getClassNameFactory("PromoSection", styles);

export type { PromoSectionProps } from "./types";

export const PromoSection: PuckComponent<PromoSectionProps> = ({
  variant,
  title,
  description,
  ctaButton,
  imageUrl,
  puck,
}) => {
  const renderVariant = () => {
    const infoProps = {
      title,
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
    variant: "compact",
    title: "Featured Promotion",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters",
    ctaButton: {
      label: "Learn More",
      href: "#",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
  },
  render: PromoSection,
};

export default PromoSection;
