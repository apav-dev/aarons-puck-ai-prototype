import React, { useEffect, CSSProperties, JSX } from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { getGoogleFontsUrl } from "../../../lib/google-fonts";

const getClassName = getClassNameFactory("Text", styles);

export type TextProps = {
  content: string;
  fontSize?: string;
  fontWeight?: "300" | "400" | "500" | "600" | "700";
  fontFamily?: string;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  lineHeight?: string;
  letterSpacing?: string;
  marginTop?: string;
  marginBottom?: string;
  maxWidth?: string;
  opacity?: number;
};

export const Text: PuckComponent<TextProps> = ({
  content = "",
  fontSize,
  fontWeight = "400",
  fontFamily,
  color,
  textAlign = "left",
  lineHeight,
  letterSpacing,
  marginTop,
  marginBottom,
  maxWidth,
  opacity,
}) => {
  const textStyle: CSSProperties = {
    fontSize,
    fontWeight,
    fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
    color,
    textAlign,
    lineHeight,
    letterSpacing,
    marginTop,
    marginBottom,
    maxWidth,
    opacity,
  };

  useEffect(() => {
    if (fontFamily) {
      const linkId = `font-text-${fontFamily}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = getGoogleFontsUrl(fontFamily);
        document.head.appendChild(link);
      }
    }
  }, [fontFamily]);

  // Simple markdown parsing for bold and italic
  const parseMarkdown = (text: string) => {
    if (!text) return [""];

    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (lastIndex < match.index) {
        parts.push(text.substring(lastIndex, match.index));
      }
      if (match[1].startsWith("**")) {
        parts.push(<strong key={match.index}>{match[2]}</strong>);
      } else {
        parts.push(<em key={match.index}>{match[3]}</em>);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <p className={getClassName()} style={textStyle}>
      {parseMarkdown(content)}
    </p>
  );
};

export const TextConfig: ComponentConfig<TextProps> = {
  fields: {
    content: {
      type: "textarea",
      label: "Content",
      ai: {
        instructions:
          "Text content. Supports basic markdown: **bold** for bold text, *italic* for italic text. Keep paragraphs concise for readability. Break into multiple Text components for separate paragraphs.",
      },
    },
    fontSize: {
      type: "text",
      label: "Font Size",
      ai: {
        instructions:
          "Font size. Use CSS values like '16px', '1rem' for body text, '14px' for smaller text, '18px' for larger text. Common: '16px' for standard body text, '14px' for captions, '18px' for emphasis. Leave empty to use browser defaults.",
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
      ],
      ai: {
        instructions:
          "Font weight. Use 400 for normal body text (default), 300 for light text, 500-600 for medium emphasis, 700 for strong emphasis. Avoid heavy weights for long paragraphs.",
      },
    },
    fontFamily: {
      type: "text",
      label: "Font Family",
      ai: {
        instructions:
          "Google Font name. Always use the getFontFamily tool. Use the business name as the brand, 'body' as the fontType, and any available entity type context. Leave empty to use default system font.",
      },
    },
    color: {
      type: "text",
      label: "Color",
      ai: {
        instructions:
          "Text color. Use hex codes (#000000), rgb/rgba values, or CSS color names. Ensure sufficient contrast with background for accessibility (WCAG AA: 4.5:1 for normal text). Dark grays like #333333 or #555555 work well for body text.",
      },
    },
    textAlign: {
      type: "select",
      label: "Text Align",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
        { label: "Justify", value: "justify" },
      ],
      ai: {
        instructions:
          "Text alignment. 'left' for standard reading flow (most common), 'center' for emphasis, 'right' for special layouts, 'justify' for formal documents (can create awkward spacing). Left alignment is best for readability.",
      },
    },
    lineHeight: {
      type: "text",
      label: "Line Height",
      ai: {
        instructions:
          "Line spacing for readability. Use CSS values like '1.4', '1.5', '1.6', '24px'. Common: '1.5' or '1.6' for optimal readability (default), '1.4' for tighter spacing, '1.8' for loose spacing. Higher line heights improve readability for body text.",
      },
    },
    letterSpacing: {
      type: "text",
      label: "Letter Spacing",
      ai: {
        instructions:
          "Spacing between letters. Use CSS values like '0', '0.01em', '0.02em'. Usually leave as default (0) for body text. Slight positive values (0.01-0.02em) can improve readability for uppercase text or small fonts.",
      },
    },
    marginTop: {
      type: "text",
      label: "Margin Top",
      ai: {
        instructions:
          "Top margin spacing. Use CSS values like '0', '8px', '16px', '24px'. Use to create consistent spacing above text blocks. Common: '16px' or '24px' for spacing between paragraphs.",
      },
    },
    marginBottom: {
      type: "text",
      label: "Margin Bottom",
      ai: {
        instructions:
          "Bottom margin spacing. Use CSS values like '0', '8px', '16px', '24px'. Common: '16px' or '24px' for spacing between paragraphs. Leave empty to use browser defaults.",
      },
    },
    maxWidth: {
      type: "text",
      label: "Max Width",
      ai: {
        instructions:
          "Maximum width for optimal readability. Use CSS values like '65ch' (optimal for readability), '600px', '700px', '80%'. Research shows 45-75 characters per line is optimal. '65ch' is a common choice for readable text blocks. Leave empty for full width.",
      },
    },
    opacity: {
      type: "number",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.1,
      ai: {
        instructions:
          "Text opacity (0-1). Use 1 for normal text (default), 0.7-0.8 for secondary text, 0.5-0.6 for tertiary text. Lower opacity creates visual hierarchy but ensure sufficient contrast for accessibility. Use opacity to de-emphasize supporting text.",
      },
    },
  },
  defaultProps: {
    content: "",
    fontWeight: "400",
    textAlign: "left",
  },
  render: Text,
};

export default Text;
