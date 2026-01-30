import React, { CSSProperties } from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import classnames from "classnames";

const getClassName = getClassNameFactory("Button", styles);

export type ButtonProps = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: string;
  paddingX?: string;
  paddingY?: string;
  fontSize?: string;
  fontWeight?: "400" | "500" | "600" | "700";
  width?: "auto" | "full";
  hoverEffect?: "darken" | "lighten" | "scale" | "none";
  icon?: string;
  iconPosition?: "left" | "right";
};

export const Button: PuckComponent<ButtonProps> = ({
  label,
  href,
  variant = "primary",
  size = "medium",
  backgroundColor,
  textColor,
  borderColor,
  borderRadius = "4px",
  paddingX,
  paddingY,
  fontSize,
  fontWeight = "600",
  width = "auto",
  hoverEffect = "darken",
  icon,
  iconPosition = "left",
}) => {
  const themePrimary = "var(--page-color-primary, #000000)";
  const themeSecondary = "var(--page-color-secondary, #000000)";
  const themeQuaternary = "var(--page-color-quaternary, #f5f5f5)";

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingX: paddingX || "12px",
          paddingY: paddingY || "8px",
          fontSize: fontSize || "14px",
        };
      case "large":
        return {
          paddingX: paddingX || "32px",
          paddingY: paddingY || "16px",
          fontSize: fontSize || "18px",
        };
      default:
        return {
          paddingX: paddingX || "24px",
          paddingY: paddingY || "12px",
          fontSize: fontSize || "16px",
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: backgroundColor || themePrimary,
          color: textColor || "#ffffff",
          borderColor: borderColor || backgroundColor || themePrimary,
          borderWidth: "1px",
        };
      case "secondary":
        return {
          backgroundColor: backgroundColor || themeQuaternary,
          color: textColor || themeSecondary,
          borderColor: borderColor || backgroundColor || themeQuaternary,
          borderWidth: "1px",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: textColor || borderColor || themePrimary,
          borderColor: borderColor || themePrimary,
          borderWidth: "1px",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: textColor || themeSecondary,
          borderColor: "transparent",
          borderWidth: "0",
        };
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();

  const buttonStyle: CSSProperties = {
    display: "inline-block",
    padding: `${sizeStyles.paddingY} ${sizeStyles.paddingX}`,
    fontSize: sizeStyles.fontSize,
    fontWeight,
    backgroundColor: variantStyles.backgroundColor,
    color: variantStyles.color,
    borderColor: variantStyles.borderColor,
    borderWidth: variantStyles.borderWidth,
    borderStyle: "solid",
    borderRadius,
    textDecoration: "none",
    width: width === "full" ? "100%" : "auto",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  return (
    <a
      href={href}
      className={classnames(
        getClassName(),
        getClassName(`variant-${variant}`),
        getClassName(`size-${size}`),
        hoverEffect !== "none" && getClassName(`hover-${hoverEffect}`),
        width === "full" && getClassName("full-width")
      )}
      style={buttonStyle}
    >
      {icon && iconPosition === "left" && (
        <span className={getClassName("icon")} style={{ marginRight: "8px" }}>
          {icon}
        </span>
      )}
      {label}
      {icon && iconPosition === "right" && (
        <span className={getClassName("icon")} style={{ marginLeft: "8px" }}>
          {icon}
        </span>
      )}
    </a>
  );
};

export const ButtonConfig: ComponentConfig<ButtonProps> = {
  fields: {
    label: {
      type: "text",
      label: "Label",
      ai: {
        instructions:
          "Button text. Use clear, action-oriented language like 'Learn More', 'Get Started', 'Sign Up', 'Contact Us'. Keep concise (1-3 words typically).",
      },
    },
    href: {
      type: "text",
      label: "Link URL",
      ai: {
        instructions:
          "Destination URL when button is clicked. Use full URLs like 'https://example.com' or relative paths like '/about', '/contact'. Use '#' for placeholder links.",
      },
    },
    variant: {
      type: "select",
      label: "Variant",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Outline", value: "outline" },
        { label: "Ghost", value: "ghost" },
      ],
      ai: {
        instructions:
          "Button style variant. 'primary' for main call-to-action (typically dark/colored background), 'secondary' for alternative actions (lighter background), 'outline' for subtle actions (transparent with border), 'ghost' for minimal actions (no background or border). Use primary for the most important action on the page.",
      },
    },
    size: {
      type: "select",
      label: "Size",
      options: [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
      ],
      ai: {
        instructions:
          "Button size. 'small' for compact spaces or secondary actions, 'medium' for standard buttons (default), 'large' for prominent call-to-action buttons. Larger buttons draw more attention.",
      },
    },
    backgroundColor: {
      type: "text",
      label: "Background Color",
      ai: {
        instructions:
          "Background color. Overrides variant default. Use hex codes, rgb/rgba values, or CSS color names. For primary buttons, use brand colors. Ensure sufficient contrast with textColor for accessibility.",
      },
    },
    textColor: {
      type: "text",
      label: "Text Color",
      ai: {
        instructions:
          "Text color. Overrides variant default. Use hex codes, rgb/rgba values, or CSS color names. Ensure sufficient contrast with backgroundColor (WCAG AA: 4.5:1 for normal text). White (#ffffff) on dark backgrounds, dark colors on light backgrounds.",
      },
    },
    borderColor: {
      type: "text",
      label: "Border Color",
      ai: {
        instructions:
          "Border color. Overrides variant default. Use hex codes, rgb/rgba values, or CSS color names. Important for outline variant. Should match or complement backgroundColor/textColor.",
      },
    },
    borderRadius: {
      type: "text",
      label: "Border Radius",
      ai: {
        instructions:
          "Rounded corners. Use CSS values like '4px' for subtle rounding (default), '8px' for moderate, '24px' or '999px' for pill-shaped buttons. More rounded = more modern/friendly, less rounded = more professional.",
      },
    },
    paddingX: {
      type: "text",
      label: "Horizontal Padding",
      ai: {
        instructions:
          "Left and right padding. Overrides size default. Use CSS values like '16px', '24px', '32px'. More padding = wider button. Common: '16px' for compact, '24px' for standard, '32px' for spacious.",
      },
    },
    paddingY: {
      type: "text",
      label: "Vertical Padding",
      ai: {
        instructions:
          "Top and bottom padding. Overrides size default. Use CSS values like '8px', '12px', '16px'. More padding = taller button. Common: '8px' for compact, '12px' for standard, '16px' for spacious.",
      },
    },
    fontSize: {
      type: "text",
      label: "Font Size",
      ai: {
        instructions:
          "Font size. Overrides size default. Use CSS values like '14px', '16px', '18px'. Common: '14px' for small buttons, '16px' for medium, '18px' for large buttons.",
      },
    },
    fontWeight: {
      type: "select",
      label: "Font Weight",
      options: [
        { label: "Regular (400)", value: "400" },
        { label: "Medium (500)", value: "500" },
        { label: "Semi Bold (600)", value: "600" },
        { label: "Bold (700)", value: "700" },
      ],
      ai: {
        instructions:
          "Font weight. Use 600-700 for buttons (default 600) to make them stand out. Heavier weights draw more attention but can feel aggressive if overused.",
      },
    },
    width: {
      type: "select",
      label: "Width",
      options: [
        { label: "Auto", value: "auto" },
        { label: "Full Width", value: "full" },
      ],
      ai: {
        instructions:
          "Button width. 'auto' sizes to content (default), 'full' makes button fill container width. Use full width for mobile layouts or when button is the primary action in a container.",
      },
    },
    hoverEffect: {
      type: "select",
      label: "Hover Effect",
      options: [
        { label: "Darken", value: "darken" },
        { label: "Lighten", value: "lighten" },
        { label: "Scale", value: "scale" },
        { label: "None", value: "none" },
      ],
      ai: {
        instructions:
          "Interactive hover effect. 'darken' slightly darkens background (default), 'lighten' slightly lightens background, 'scale' slightly enlarges button, 'none' for no effect. Hover effects provide visual feedback for interactivity.",
      },
    },
    icon: {
      type: "text",
      label: "Icon (Text/Emoji)",
      ai: {
        instructions:
          "Optional icon or emoji to display with button text. Use emoji like '→', '✓', '★', or text symbols. Leave empty for no icon.",
      },
    },
    iconPosition: {
      type: "select",
      label: "Icon Position",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
      ai: {
        instructions:
          "Position of icon relative to text. 'left' places icon before text (common for arrows →), 'right' places icon after text. Only applies when icon is provided.",
      },
    },
  },
  defaultProps: {
    label: "",
    href: "",
    variant: "primary",
    size: "medium",
    borderRadius: "4px",
    fontWeight: "600",
    width: "auto",
    hoverEffect: "darken",
    iconPosition: "left",
  },
  render: Button,
};

export default Button;








