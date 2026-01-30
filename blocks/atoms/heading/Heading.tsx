import React, { useEffect, CSSProperties } from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { getGoogleFontsUrl } from "../../../lib/google-fonts";

const getClassName = getClassNameFactory("Heading", styles);

export type HeadingProps = {
  text: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  fontSize?: string;
  fontWeight?: "300" | "400" | "500" | "600" | "700" | "800" | "900";
  fontFamily?: string;
  color?: string;
  textAlign?: "left" | "center" | "right";
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  marginTop?: string;
  marginBottom?: string;
};

export const Heading: PuckComponent<HeadingProps> = ({
  text,
  subheading,
  subheadingPosition = "above",
  level = "h2",
  fontSize,
  fontWeight = "700",
  fontFamily,
  color,
  textAlign = "left",
  lineHeight,
  letterSpacing,
  textTransform = "none",
  marginTop,
  marginBottom,
}) => {
  const headingStyle: CSSProperties = {
    fontSize,
    fontWeight,
    fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
    color,
    textAlign: textAlign as CSSProperties["textAlign"],
    lineHeight,
    letterSpacing,
    textTransform: textTransform as CSSProperties["textTransform"],
    marginTop,
    marginBottom,
  };

  useEffect(() => {
    if (fontFamily) {
      const linkId = `font-heading-${fontFamily}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = getGoogleFontsUrl(fontFamily);
        document.head.appendChild(link);
      }
    }
  }, [fontFamily]);

  const headingElement = React.createElement(
    level,
    { className: getClassName(), style: headingStyle },
    text,
  );

  if (!subheading) {
    return headingElement;
  }

  const subheadingStyle: CSSProperties = {};
  if (textAlign)
    subheadingStyle.textAlign = textAlign as CSSProperties["textAlign"];
  if (color) subheadingStyle.color = color;
  const subheadingEl = (
    <p className={getClassName("subheading")} style={subheadingStyle}>
      {subheading}
    </p>
  );

  return (
    <div className={getClassName("wrapper")}>
      {subheadingPosition === "above" && subheadingEl}
      {headingElement}
      {subheadingPosition === "below" && subheadingEl}
    </div>
  );
};

export const HeadingConfig: ComponentConfig<HeadingProps> = {
  fields: {
    text: {
      type: "text",
      label: "Text",
      ai: {
        instructions:
          "The heading text content. Keep headings concise and descriptive. Use clear, action-oriented language when appropriate.",
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
    level: {
      type: "select",
      label: "Heading Level",
      options: [
        { label: "H1", value: "h1" },
        { label: "H2", value: "h2" },
        { label: "H3", value: "h3" },
        { label: "H4", value: "h4" },
        { label: "H5", value: "h5" },
        { label: "H6", value: "h6" },
      ],
      ai: {
        instructions:
          "Semantic HTML heading level. Use h1 for the main page title (only one per page), h2 for major section headings, h3 for subsections, h4-h6 for nested content. Proper heading hierarchy improves SEO and accessibility. Default is h2 for section headings.",
      },
    },
    fontSize: {
      type: "text",
      label: "Font Size",
      ai: {
        instructions:
          "Font size for the heading. Use CSS values like '32px', '2rem', '2.5rem'. Common sizes: h1: '48px' or '3rem', h2: '32px' or '2rem', h3: '24px' or '1.5rem', h4: '20px' or '1.25rem'. Leave empty to use browser defaults for the heading level.",
      },
    },
    fontWeight: {
      type: "select",
      label: "Font Weight",
      options: [
        { label: "Light (300)", value: "300" },
        { label: "Regular (400)", value: "400" },
        { label: "Medium (500)", value: "500" },
        { label: "Semi Bold (600)", value: "600" },
        { label: "Bold (700)", value: "700" },
        { label: "Extra Bold (800)", value: "800" },
        { label: "Black (900)", value: "900" },
      ],
      ai: {
        instructions:
          "Font weight/thickness. Use 400-500 for regular text, 600-700 for emphasis (default), 800-900 for strong emphasis. Heavier weights draw more attention but use sparingly.",
      },
    },
    fontFamily: {
      type: "text",
      label: "Font Family",
      ai: {
        instructions:
          "Google Font name. Always use the getFontFamily tool. Use the business name as the brand, 'heading' as the fontType, and any available entity type context. Leave empty to use default system font.",
      },
    },
    color: {
      type: "text",
      label: "Color",
      ai: {
        instructions:
          "Text color. Use hex codes (#000000), rgb/rgba values, or CSS color names. Ensure sufficient contrast with background for accessibility (WCAG AA: 4.5:1 for normal text, 3:1 for large text).",
      },
    },
    textAlign: {
      type: "select",
      label: "Text Align",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      ai: {
        instructions:
          "Text alignment. 'left' for standard reading flow, 'center' for emphasis or hero sections, 'right' for special layouts. Center alignment works well for hero headings and section titles.",
      },
    },
    lineHeight: {
      type: "text",
      label: "Line Height",
      ai: {
        instructions:
          "Line spacing. Use CSS values like '1.2' for tight spacing, '1.5' for normal, '1.8' for loose. Common: '1.2' for large headings, '1.4-1.5' for smaller headings. Leave empty to use browser defaults.",
      },
    },
    letterSpacing: {
      type: "text",
      label: "Letter Spacing",
      ai: {
        instructions:
          "Spacing between letters. Use CSS values like '-0.02em' for tighter spacing, '0.05em' for wider. Negative values create tighter, modern look. Positive values create more open, readable look. Leave empty for default.",
      },
    },
    textTransform: {
      type: "select",
      label: "Text Transform",
      options: [
        { label: "None", value: "none" },
        { label: "Uppercase", value: "uppercase" },
        { label: "Lowercase", value: "lowercase" },
        { label: "Capitalize", value: "capitalize" },
      ],
      ai: {
        instructions:
          "Text transformation. 'none' for normal case, 'uppercase' for all caps (use sparingly, can feel aggressive), 'lowercase' for all lowercase, 'capitalize' for title case. Uppercase works for labels and small headings but avoid for long text.",
      },
    },
    marginTop: {
      type: "text",
      label: "Margin Top",
      ai: {
        instructions:
          "Top margin spacing. Use CSS values like '0', '16px', '24px', '32px'. Use to create consistent spacing above headings. Leave empty to use browser defaults.",
      },
    },
    marginBottom: {
      type: "text",
      label: "Margin Bottom",
      ai: {
        instructions:
          "Bottom margin spacing. Use CSS values like '0', '8px', '16px', '24px'. Common: '16px' for tight spacing, '24px' for normal, '32px' for loose. Leave empty to use browser defaults.",
      },
    },
  },
  defaultProps: {
    text: "",
    level: "h2",
    fontWeight: "700",
    textAlign: "left",
    textTransform: "none",
    subheadingPosition: "above",
  },
  render: Heading,
};

export default Heading;
