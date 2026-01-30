/* eslint-disable @next/next/no-img-element */
import React, { CSSProperties } from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import classnames from "classnames";

const getClassName = getClassNameFactory("Image", styles);

export type ImageProps = {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  boxShadow?: string;
  opacity?: number;
  aspectRatio?: string;
  hoverEffect?: "zoom" | "opacity" | "none";
};

export const Image: PuckComponent<ImageProps> = ({
  src,
  alt,
  width,
  height,
  objectFit = "cover",
  borderRadius,
  borderWidth,
  borderColor,
  boxShadow,
  opacity = 1,
  aspectRatio,
  hoverEffect = "none",
}) => {
  const imageStyle: CSSProperties = {
    width: width || "100%",
    height: height || (aspectRatio ? "auto" : undefined),
    objectFit: objectFit as CSSProperties["objectFit"],
    borderRadius,
    borderWidth: borderWidth ? `${borderWidth}` : undefined,
    borderStyle: borderWidth ? "solid" : undefined,
    borderColor,
    boxShadow,
    opacity,
    aspectRatio: aspectRatio ? aspectRatio.replace("/", " / ") : undefined,
  };

  const containerStyle: CSSProperties = {
    width: width || "100%",
    aspectRatio: aspectRatio ? aspectRatio.replace("/", " / ") : undefined,
    overflow: "hidden",
    borderRadius,
  };

  return (
    <div
      className={classnames(
        getClassName("container"),
        hoverEffect !== "none" && getClassName(`hover-${hoverEffect}`)
      )}
      style={containerStyle}
    >
      <img className={getClassName()} src={src} alt={alt} style={imageStyle} />
    </div>
  );
};

export const ImageConfig: ComponentConfig<ImageProps> = {
  fields: {
    src: {
      type: "text",
      label: "Image URL",
      ai: {
        instructions: "Image source URL",
      },
    },
    alt: {
      type: "text",
      label: "Alt Text",
      ai: {
        instructions:
          "Alternative text for accessibility. Describe what the image shows or its purpose. Required for accessibility and SEO. Be descriptive but concise, e.g., 'Person using mobile banking app' not just 'Image'.",
      },
    },
    width: {
      type: "text",
      label: "Width",
      ai: {
        instructions:
          "Image width. Use CSS values like '100%' for full width, '300px' for fixed width, '50%' for half width. Leave empty for '100%' default. In containers, '100%' makes image fill available space.",
      },
    },
    height: {
      type: "text",
      label: "Height",
      ai: {
        instructions:
          "Image height. Use CSS values like '300px', '50vh'. Leave empty to use aspectRatio or natural image height. If aspectRatio is set, height is calculated automatically.",
      },
    },
    objectFit: {
      type: "select",
      label: "Object Fit",
      options: [
        { label: "Cover", value: "cover" },
        { label: "Contain", value: "contain" },
        { label: "Fill", value: "fill" },
        { label: "None", value: "none" },
      ],
      ai: {
        instructions:
          "How image fits within its container. 'cover' fills container, may crop image (most common for hero/card backgrounds). 'contain' shows entire image, may leave empty space. 'fill' stretches image to fill (may distort). 'none' uses natural size. Use 'cover' for background images, 'contain' for product images.",
      },
    },
    borderRadius: {
      type: "text",
      label: "Border Radius",
      ai: {
        instructions:
          "Rounded corners. Use CSS values like '4px' for subtle rounding, '8px' for moderate, '16px' for pronounced, '50%' for circular images. Common: '8px' for standard images, '12px' or '16px' for modern look.",
      },
    },
    borderWidth: {
      type: "text",
      label: "Border Width",
      ai: {
        instructions:
          "Border thickness. Use CSS values like '1px', '2px', '3px'. Leave empty for no border. Requires borderColor to be visible. Common: '1px' for subtle borders.",
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
    opacity: {
      type: "number",
      label: "Opacity",
      min: 0,
      max: 1,
      step: 0.1,
      ai: {
        instructions:
          "Image opacity (0-1). Use 1 for normal images (default), 0.5-0.7 for overlay effects or watermarks. Lower opacity can create subtle background effects but ensure content remains visible.",
      },
    },
    aspectRatio: {
      type: "text",
      label: "Aspect Ratio",
      ai: {
        instructions:
          "Maintains consistent image proportions. Use format 'width/height' like '16/9' (widescreen), '4/3' (standard), '1/1' (square), '3/2' (photo). Common: '16/9' for hero images, '1/1' for avatars/products, '4/3' for cards. When set, height is calculated automatically. Leave empty to use natural image dimensions.",
      },
    },
    hoverEffect: {
      type: "select",
      label: "Hover Effect",
      options: [
        { label: "Zoom", value: "zoom" },
        { label: "Opacity", value: "opacity" },
        { label: "None", value: "none" },
      ],
      ai: {
        instructions:
          "Interactive hover effect. 'zoom' slightly enlarges image, 'opacity' reduces opacity, 'none' for no effect. Use for clickable images or galleries to provide visual feedback.",
      },
    },
  },
  defaultProps: {
    src: "",
    alt: "",
    objectFit: "cover",
    opacity: 1,
    hoverEffect: "none",
  },
  render: Image,
};

export default Image;






