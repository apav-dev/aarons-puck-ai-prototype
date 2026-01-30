/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import classnames from "classnames";

const getClassName = getClassNameFactory("HeroSection", styles);

export type HeroSectionProps = {
  variant?: "Classic" | "Spotlight" | "Immersive";
  businessNameLabel: string;
  businessName: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  statusText: string;
  rating: number;
  reviewCount: number;
  primaryButton: {
    label: string;
    href: string;
  };
  secondaryButton: {
    label: string;
    href: string;
  };
  imageUrl: string;
};

export const HeroSection: PuckComponent<HeroSectionProps> = ({
  variant = "Classic",
  businessNameLabel,
  businessName,
  subheading,
  subheadingPosition = "above",
  headingAlign = "left",
  statusText,
  rating,
  reviewCount,
  primaryButton,
  secondaryButton,
  imageUrl,
  puck,
}) => {
  // Generate star rating display
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const isSpotlight = variant === "Spotlight";
  const isImmersive = variant === "Immersive";
  const variantKey = variant.toLowerCase() as
    | "classic"
    | "spotlight"
    | "immersive";

  const headingBlockAlign =
    headingAlign === "center" ? getClassName("headingBlock--center") : "";
  const contentElement = (
    <div className={getClassName("content")}>
      <div
        className={classnames(getClassName("headingBlock"), headingBlockAlign)}
      >
        <div className={getClassName("label")}>{businessNameLabel}</div>
        {subheading && subheadingPosition === "above" && (
          <p className={getClassName("subheading")}>{subheading}</p>
        )}
        <h1 className={getClassName("title")}>{businessName}</h1>
        {subheading && subheadingPosition === "below" && (
          <p className={getClassName("subheading")}>{subheading}</p>
        )}
        <div className={getClassName("status")}>{statusText}</div>
      </div>

      <div className={getClassName("rating")}>
        <span className={getClassName("ratingValue")}>{rating}</span>
        <div className={getClassName("stars")}>
          {Array.from({ length: fullStars }).map((_, i) => (
            <svg
              key={`full-${i}`}
              className={getClassName("star")}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
          {hasHalfStar && (
            <svg
              className={getClassName("star")}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <defs>
                <linearGradient
                  id={`half-${rating}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#half-${rating})`}
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          )}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <svg
              key={`empty-${i}`}
              className={classnames(getClassName("star"), "empty")}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <span className={getClassName("reviewCount")}>
          ({reviewCount} reviews)
        </span>
      </div>

      <div className={getClassName("actions")}>
        <a
          href={primaryButton.href}
          className={getClassName("primaryButton")}
          tabIndex={puck.isEditing ? -1 : undefined}
        >
          {primaryButton.label}
        </a>
        <a
          href={secondaryButton.href}
          className={getClassName("secondaryButton")}
          tabIndex={puck.isEditing ? -1 : undefined}
        >
          {secondaryButton.label}
        </a>
      </div>
    </div>
  );

  if (isSpotlight) {
    const spotlightBackground = (
      <div className={getClassName("spotlightImageWrapper")}>
        <img
          src={imageUrl}
          alt={businessName}
          className={getClassName("spotlightImage")}
        />
      </div>
    );
    return (
      <Section
        className={getClassName({ [variantKey]: true })}
        background={spotlightBackground}
      >
        <div className={getClassName("spotlightInner")}>
          <div className={getClassName("spotlightCard")}>{contentElement}</div>
        </div>
      </Section>
    );
  }

  if (isImmersive) {
    const immersiveBackground = (
      <div className={getClassName("immersiveImageWrapper")}>
        <div className={getClassName("immersiveOverlay")} />
        <img
          src={imageUrl}
          alt={businessName}
          className={getClassName("immersiveImage")}
        />
      </div>
    );
    return (
      <Section
        className={getClassName({ [variantKey]: true })}
        background={immersiveBackground}
      >
        <div className={getClassName("immersiveInner")}>
          <div className={getClassName("immersiveContent")}>
            {contentElement}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section className={getClassName({ [variantKey]: true })}>
      <div className={getClassName("inner")}>
        <div className={getClassName("imageWrapper")}>
          <img
            src={imageUrl}
            alt={businessName}
            className={getClassName("image")}
          />
        </div>
        {contentElement}
      </div>
    </Section>
  );
};

export const HeroSectionConfig: ComponentConfig<HeroSectionProps> = {
  fields: {
    variant: {
      type: "select",
      label: "Variant",
      options: [
        { label: "Classic", value: "Classic" },
        { label: "Spotlight", value: "Spotlight" },
        { label: "Immersive", value: "Immersive" },
      ],
      ai: {
        instructions: `Choose the hero section variant that best matches the business type and desired visual impact:

**Classic**: Traditional side-by-side layout with content on one side and image on the other. Best for:
- Professional services (law firms, accounting, consulting)
- Retail stores with clear product displays
- Businesses prioritizing clarity and readability
- When you want balanced visual weight between text and image
- Standard, professional presentations

**Spotlight**: Full-width background image with a white information card overlaid on the left. Best for:
- Restaurants and cafes (showcases food/atmosphere)
- Hotels and hospitality (highlights location/amenities)
- Retail stores with impressive storefronts or products
- Businesses wanting to showcase a specific location or product visually
- When the background image is a key selling point
- More modern, visually striking presentation

**Immersive**: Full-width background image with dark overlay, text directly on the image (no white card). Best for:
- Adventure/outdoor businesses (tours, activities, experiences)
- Luxury brands and high-end services
- Creative agencies and design studios
- Businesses with dramatic, atmospheric imagery
- When you want maximum visual impact and emotional connection
- Most dramatic and immersive presentation

Consider the business type, available imagery quality, and desired emotional tone when selecting the variant.`,
        stream: false,
      },
    },
    businessNameLabel: {
      type: "text",
      label: "Business Name Label",
    },
    businessName: {
      type: "text",
      label: "Business Name",
      ai: {
        instructions:
          "The name of the business. This is typically the name of the business.",
      },
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
    statusText: {
      type: "text",
      label: "Status Text",
    },
    rating: {
      type: "number",
      label: "Rating",
      min: 0,
      max: 5,
      step: 0.1,
    },
    reviewCount: {
      type: "number",
      label: "Review Count",
      min: 0,
    },
    primaryButton: {
      type: "object",
      label: "Primary Button",
      objectFields: {
        label: { type: "text" },
        href: { type: "text" },
      },
    },
    secondaryButton: {
      type: "object",
      label: "Secondary Button",
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
          "Always use an image URL provided by the getImage tool. Use the business name from the businessName field as the brand, 'Hero' as the component, and the entity type if available.",
        stream: false,
      },
    },
  },
  ai: {
    instructions: "This section should go below the header section.",
  },
  defaultProps: {
    variant: "Classic",
    businessNameLabel: "Business Name",
    businessName: "Geomodifier",
    subheadingPosition: "above",
    headingAlign: "left",
    statusText: "Open Now • Closes at 5:00 PM",
    rating: 4.5,
    reviewCount: 21,
    primaryButton: {
      label: "Call to Action",
      href: "#",
    },
    secondaryButton: {
      label: "Call to Action",
      href: "#",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
  },

  render: HeroSection,
};

export default HeroSection;
