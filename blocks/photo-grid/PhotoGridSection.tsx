/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from "react";
import { ComponentConfig } from "@measured/puck";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { getGoogleFontsUrl } from "../../lib/google-fonts";

const getClassName = getClassNameFactory("PhotoGridSection", styles);

export type PhotoGridItem = {
  imageUrl: string;
  overlayText: string;
  label: string;
};

export type PhotoGridSectionProps = {
  heading: string;
  items: PhotoGridItem[];
  padding: string;
  columns?: number;
  headingFont?: string;
  bodyFont?: string;
  colors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
};

export const PhotoGridSection: PuckComponent<PhotoGridSectionProps> = ({
  heading,
  items,
  padding,
  columns = 4,
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
  const sectionStyle = colors
    ? { backgroundColor: colors.background }
    : undefined;
  const textColorStyle = colors ? { color: colors.text } : undefined;

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
      <h2
        className={getClassName("heading")}
        style={{ ...headingStyle, ...textColorStyle }}
      >
        {heading}
      </h2>
      <div
        className={getClassName("grid")}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {items.map((item, index) => (
          <div key={index} className={getClassName("item")}>
            <div className={getClassName("imageWrapper")}>
              <img
                src={item.imageUrl}
                alt={item.label}
                className={getClassName("image")}
              />
              {item.overlayText && (
                <div className={getClassName("overlay")}>
                  <span
                    className={getClassName("overlayText")}
                    style={{ ...headingStyle }}
                  >
                    {item.overlayText}
                  </span>
                </div>
              )}
            </div>
            {item.label && (
              <div
                className={getClassName("label")}
                style={{ ...bodyStyle, ...textColorStyle }}
              >
                {item.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
};

export const PhotoGridSectionConfig: ComponentConfig<PhotoGridSectionProps> = {
  fields: {
    heading: {
      type: "text",
      label: "Heading",
    },
    items: {
      type: "array",
      label: "Items",
      min: 1,
      getItemSummary: (item) => item.label || "Item",
      arrayFields: {
        imageUrl: {
          type: "text",
          label: "Image URL",
          ai: {
            instructions:
              "Always use an image URL provided by the getImage tool. Use the business name as the brand, 'PhotoGridSection' as the component, and the item label as additional context.",
            stream: false,
          },
        },
        overlayText: {
          type: "text",
          label: "Overlay Text",
        },
        label: {
          type: "text",
          label: "Label",
        },
      },
      defaultItemProps: {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
    },
    columns: {
      type: "number",
      label: "Columns",
      min: 1,
      max: 6,
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
    heading: "Find the best coverage for you",
    items: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
    ],
    columns: 4,
    padding: "64px",
  },
  render: PhotoGridSection,
};

export default PhotoGridSection;

