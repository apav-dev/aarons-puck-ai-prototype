/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from "react";
import { ComponentConfig } from "@measured/puck";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { getGoogleFontsUrl } from "../../lib/google-fonts";
import { isLightColor } from "../../lib/color-utils";

const getClassName = getClassNameFactory("PromoSection", styles);

export type PromoSectionProps = {
  title: string;
  description: string;
  ctaButton: {
    label: string;
    href: string;
  };
  imageUrl: string;
  padding: string;
  headingFont?: string;
  bodyFont?: string;
  colors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
};

export const PromoSection: PuckComponent<PromoSectionProps> = ({
  title,
  description,
  ctaButton,
  imageUrl,
  padding,
  headingFont,
  bodyFont,
  colors,
  puck,
}) => {
  // Prepare font styles
  const headingStyle = headingFont
    ? { fontFamily: `"${headingFont}", sans-serif` }
    : undefined;
  const bodyStyle = bodyFont
    ? { fontFamily: `"${bodyFont}", sans-serif` }
    : undefined;

  // Prepare color styles
  const primaryTextColor = colors?.primary
    ? isLightColor(colors.primary)
      ? colors.text
      : "#ffffff"
    : undefined;
  const sectionStyle = colors
    ? { backgroundColor: colors.background }
    : undefined;
  const textColorStyle = colors ? { color: colors.text } : undefined;
  const primaryButtonStyle = colors
    ? {
        backgroundColor: colors.primary,
        color: primaryTextColor,
      }
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
      style={{
        paddingTop: padding,
        paddingBottom: padding,
        ...sectionStyle,
      }}
    >
      <div className={getClassName("inner")}>
        <div className={getClassName("imageWrapper")}>
          <img src={imageUrl} alt={title} className={getClassName("image")} />
        </div>

        <div className={getClassName("content")}>
          <h2
            className={getClassName("title")}
            style={{ ...headingStyle, ...textColorStyle }}
          >
            {title}
          </h2>
          <p
            className={getClassName("description")}
            style={{ ...bodyStyle, ...textColorStyle }}
          >
            {description}
          </p>

          <a
            href={ctaButton.href}
            className={getClassName("ctaButton")}
            style={primaryButtonStyle}
            tabIndex={puck.isEditing ? -1 : undefined}
          >
            {ctaButton.label}
          </a>
        </div>
      </div>
    </Section>
  );
};

export const PromoSectionConfig: ComponentConfig<PromoSectionProps> = {
  fields: {
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
    padding: {
      type: "text",
      label: "Padding",
    },
    headingFont: {
      type: "text",
      label: "Heading Font",
      ai: {
        instructions:
          "Always use the getFontFamily tool. Use the business name as the brand, 'heading' as the fontType, and any available entity type context.",
        stream: false,
      },
    },
    bodyFont: {
      type: "text",
      label: "Body Font",
      ai: {
        instructions:
          "Always use the getFontFamily tool. Use the business name as the brand, 'body' as the fontType, and any available entity type context.",
        stream: false,
      },
    },
    colors: {
      type: "object",
      label: "Brand Colors",
      objectFields: {
        primary: { type: "text", label: "Primary Color" },
        secondary: { type: "text", label: "Secondary Color" },
        background: { type: "text", label: "Background Color" },
        text: { type: "text", label: "Text Color" },
      },
      ai: {
        instructions:
          "Always use the getBrandColors tool. Use the business name as the brand and any available entity type context. Ensure colors maintain accessibility with proper contrast ratios.",
        stream: false,
      },
    },
  },
  defaultProps: {
    title: "Featured Promotion",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters",
    ctaButton: {
      label: "Learn More",
      href: "#",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    padding: "64px",
  },
  render: PromoSection,
};

export default PromoSection;
