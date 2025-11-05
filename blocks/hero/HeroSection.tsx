/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from "react";
import { ComponentConfig } from "@measured/puck";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { getGoogleFontsUrl } from "../../lib/google-fonts";
import classnames from "classnames";

const getClassName = getClassNameFactory("HeroSection", styles);

export type HeroSectionProps = {
  businessNameLabel: string;
  businessName: string;
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
  padding: string;
  headingFont?: string;
  bodyFont?: string;
};

export const HeroSection: PuckComponent<HeroSectionProps> = ({
  businessNameLabel,
  businessName,
  statusText,
  rating,
  reviewCount,
  primaryButton,
  secondaryButton,
  imageUrl,
  padding,
  headingFont,
  bodyFont,
  puck,
}) => {
  // Generate star rating display
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Prepare font styles
  const headingStyle = headingFont
    ? { fontFamily: `"${headingFont}", sans-serif` }
    : undefined;
  const bodyStyle = bodyFont
    ? { fontFamily: `"${bodyFont}", sans-serif` }
    : undefined;

  // Load Google Fonts into document head
  useEffect(() => {
    if (headingFont) {
      const linkId = `font-heading-${headingFont}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = getGoogleFontsUrl(headingFont);
        document.head.appendChild(link);
      }
    }
    if (bodyFont && bodyFont !== headingFont) {
      const linkId = `font-body-${bodyFont}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = getGoogleFontsUrl(bodyFont);
        document.head.appendChild(link);
      }
    }
  }, [headingFont, bodyFont]);

  return (
    <Section
      className={getClassName()}
      style={{ paddingTop: padding, paddingBottom: padding }}
    >
      <div className={getClassName("inner")}>
        <div className={getClassName("content")}>
          <div className={getClassName("label")} style={bodyStyle}>
            {businessNameLabel}
          </div>
          <h1 className={getClassName("title")} style={headingStyle}>
            {businessName}
          </h1>
          <div className={getClassName("status")} style={bodyStyle}>
            {statusText}
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
                      <stop
                        offset="50%"
                        stopColor="transparent"
                        stopOpacity="0"
                      />
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
            <span className={getClassName("reviewCount")} style={bodyStyle}>
              ({reviewCount} reviews)
            </span>
          </div>

          <div className={getClassName("actions")}>
            <a
              href={primaryButton.href}
              className={getClassName("primaryButton")}
              style={bodyStyle}
              tabIndex={puck.isEditing ? -1 : undefined}
            >
              {primaryButton.label}
            </a>
            <a
              href={secondaryButton.href}
              className={getClassName("secondaryButton")}
              style={bodyStyle}
              tabIndex={puck.isEditing ? -1 : undefined}
            >
              {secondaryButton.label}
            </a>
          </div>
        </div>

        <div className={getClassName("imageWrapper")}>
          <img
            src={imageUrl}
            alt={businessName}
            className={getClassName("image")}
          />
        </div>
      </div>
    </Section>
  );
};

export const HeroSectionConfig: ComponentConfig<HeroSectionProps> = {
  fields: {
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
      },
    },
    padding: {
      type: "text",
      label: "Padding",
    },
    headingFont: {
      type: "text",
      label: "Heading Font",
      ai: {
        instructions:
          "Always use the getFontFamily tool. Use the business name from the businessName field as the brand, 'heading' as the fontType, and any available entity type context.",
      },
    },
    bodyFont: {
      type: "text",
      label: "Body Font",
      ai: {
        instructions:
          "Always use the getFontFamily tool. Use the business name from the businessName field as the brand, 'body' as the fontType, and any available entity type context.",
      },
    },
  },
  ai: {
    instructions:
      "Create a hero section for a brick-and-mortar store landing page. Always place this section at the top of the page. The image should be a stock image of a storefront.",
  },
  defaultProps: {
    businessNameLabel: "Business Name",
    businessName: "Geomodifier",
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
    padding: "64px",
  },
  render: HeroSection,
};

export default HeroSection;
