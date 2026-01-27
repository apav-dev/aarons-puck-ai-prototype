import React, { CSSProperties } from "react";
import { ComponentConfig, PuckComponent, Slot } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import classnames from "classnames";

const getClassName = getClassNameFactory("Card", styles);

export type CardProps = {
  content?: Slot;
  padding?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundPosition?: "center" | "top" | "bottom" | "left" | "right";
  backgroundSize?: "cover" | "contain" | "auto";
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  boxShadow?: string;
  width?: string;
  minHeight?: string;
  hoverEffect?: "none" | "lift" | "scale" | "shadow";
  overlay?: boolean;
  overlayOpacity?: number;
};

export const Card: PuckComponent<CardProps> = ({
  content: Content,
  padding = "24px",
  backgroundColor,
  backgroundImage,
  backgroundPosition = "center",
  backgroundSize = "cover",
  borderRadius = "8px",
  borderWidth,
  borderColor,
  boxShadow,
  width,
  minHeight,
  hoverEffect = "none",
  overlay = false,
  overlayOpacity = 0.5,
}) => {
  if (!Content) {
    return null;
  }

  const cardStyle: CSSProperties = {
    padding,
    backgroundColor: backgroundColor || (backgroundImage ? "transparent" : "#ffffff"),
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundPosition,
    backgroundSize,
    backgroundRepeat: "no-repeat",
    borderRadius,
    borderWidth: borderWidth ? `${borderWidth}` : undefined,
    borderStyle: borderWidth ? "solid" : undefined,
    borderColor,
    boxShadow,
    width,
    minHeight,
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div
      className={classnames(
        getClassName(),
        hoverEffect !== "none" && getClassName(`hover-${hoverEffect}`)
      )}
      style={cardStyle}
    >
      {overlay && backgroundImage && (
        <div
          className={getClassName("overlay")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
            zIndex: 1,
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          zIndex: overlay && backgroundImage ? 2 : 1,
        }}
      >
        <Content />
      </div>
    </div>
  );
};

export const CardConfig: ComponentConfig<CardProps> = {
  fields: {
    content: {
      type: "slot",
    },
    padding: {
      type: "text",
      label: "Padding",
      ai: {
        instructions:
          "Internal spacing inside the card. Use CSS values like '16px', '24px', '32px' for uniform padding, or '16px 24px' (vertical horizontal). Common values: '16px' for compact cards, '24px' for normal, '32px' or '48px' for spacious cards.",
      },
    },
    backgroundColor: {
      type: "text",
      label: "Background Color",
      ai: {
        instructions:
          "Background color for the card. Use hex codes (#ffffff), rgb/rgba values, or CSS color names. If backgroundImage is set, this is ignored unless overlay is disabled. Defaults to white if neither backgroundImage nor backgroundColor is set.",
      },
    },
    backgroundImage: {
      type: "text",
      label: "Background Image URL",
      ai: {
        instructions:
          "Background image URL for the card. Use getImage tool to get appropriate images. When using background images, consider enabling overlay for better text readability. The image will be positioned and sized according to backgroundPosition and backgroundSize settings.",
      },
    },
    backgroundPosition: {
      type: "select",
      label: "Background Position",
      options: [
        { label: "Center", value: "center" },
        { label: "Top", value: "top" },
        { label: "Bottom", value: "bottom" },
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
      ai: {
        instructions:
          "Position of the background image within the card. 'center' centers the image (good for portraits), 'top' shows top portion (good for landscapes), 'bottom' shows bottom portion. Use when backgroundImage is set.",
      },
    },
    backgroundSize: {
      type: "select",
      label: "Background Size",
      options: [
        { label: "Cover", value: "cover" },
        { label: "Contain", value: "contain" },
        { label: "Auto", value: "auto" },
      ],
      ai: {
        instructions:
          "How the background image is sized. 'cover' fills the entire card (may crop image), 'contain' shows entire image (may leave empty space), 'auto' uses image's natural size. 'cover' is most common for card backgrounds.",
      },
    },
    borderRadius: {
      type: "text",
      label: "Border Radius",
      ai: {
        instructions:
          "Rounded corners for the card. Use CSS values like '4px' for subtle rounding, '8px' for moderate (default), '16px' for pronounced, or '50%' for circular cards. Common: '8px' for standard cards, '12px' or '16px' for modern look.",
      },
    },
    borderWidth: {
      type: "text",
      label: "Border Width",
      ai: {
        instructions:
          "Border thickness. Use CSS values like '1px', '2px'. Leave empty for no border. Requires borderColor to be visible. Common: '1px' for subtle borders.",
      },
    },
    borderColor: {
      type: "text",
      label: "Border Color",
      ai: {
        instructions:
          "Border color. Use hex codes, rgb/rgba values, or CSS color names. Common: light grays like '#e5e5e5' or '#f0f0f0' for subtle borders. Requires borderWidth to be visible.",
      },
    },
    boxShadow: {
      type: "text",
      label: "Box Shadow",
      ai: {
        instructions:
          "Shadow effect for depth. Use CSS shadow syntax like '0 2px 4px rgba(0,0,0,0.1)' for subtle shadows, '0 4px 8px rgba(0,0,0,0.15)' for medium depth, '0 8px 16px rgba(0,0,0,0.2)' for strong shadows. Leave empty for no shadow.",
      },
    },
    width: {
      type: "text",
      label: "Width",
      ai: {
        instructions:
          "Card width. Use CSS values like '100%' for full width, '300px' for fixed width, or leave empty for auto width based on container. In grids, cards typically fill their grid cell.",
      },
    },
    minHeight: {
      type: "text",
      label: "Min Height",
      ai: {
        instructions:
          "Minimum height of the card. Use CSS values like '200px', '300px', '50vh'. Useful for ensuring cards in a grid have consistent heights or for cards with background images that need minimum space.",
      },
    },
    hoverEffect: {
      type: "select",
      label: "Hover Effect",
      options: [
        { label: "None", value: "none" },
        { label: "Lift", value: "lift" },
        { label: "Scale", value: "scale" },
        { label: "Shadow", value: "shadow" },
      ],
      ai: {
        instructions:
          "Interactive hover effect for the card. 'none' for no effect, 'lift' raises the card slightly, 'scale' slightly enlarges the card, 'shadow' increases shadow depth. Use for clickable/interactive cards to provide visual feedback.",
      },
    },
    overlay: {
      type: "radio",
      label: "Dark Overlay",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
      ai: {
        instructions:
          "Add a dark overlay on top of background images. Essential for text readability when using background images. Enable overlay when card content includes text over a background image. Adjust overlayOpacity to control darkness.",
      },
    },
    overlayOpacity: {
      type: "number",
      label: "Overlay Opacity",
      min: 0,
      max: 1,
      step: 0.1,
      ai: {
        instructions:
          "Transparency of the dark overlay (0-1). 0 is fully transparent, 1 is fully opaque. Common values: 0.3-0.4 for subtle overlay, 0.5-0.6 for moderate (default), 0.7-0.8 for strong overlay. Higher opacity improves text readability but darkens the image more.",
      },
    },
  },
  defaultProps: {
    padding: "24px",
    borderRadius: "8px",
    backgroundPosition: "center",
    backgroundSize: "cover",
    hoverEffect: "none",
    overlay: false,
    overlayOpacity: 0.5,
  },
  render: Card,
};

export default Card;

