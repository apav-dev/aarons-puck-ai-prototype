import React, { CSSProperties } from "react";
import { ComponentConfig, PuckComponent, Slot } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("Container", styles);

export type ContainerProps = {
  content?: Slot;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
  gap?: string;
  padding?: string;
  backgroundColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  boxShadow?: string;
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  wrap?: "wrap" | "nowrap";
};

export const Container: PuckComponent<ContainerProps> = ({
  content: Content,
  direction = "row",
  justifyContent = "flex-start",
  alignItems = "stretch",
  gap,
  padding,
  backgroundColor,
  borderRadius,
  borderWidth,
  borderColor,
  boxShadow,
  width,
  maxWidth,
  minHeight,
  wrap = "nowrap",
}) => {
  if (!Content) {
    return null;
  }

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: direction as CSSProperties["flexDirection"],
    flexWrap: wrap as CSSProperties["flexWrap"],
    justifyContent,
    alignItems,
    ...(gap && { gap }),
    ...(padding && { padding }),
    ...(backgroundColor && { backgroundColor }),
    ...(borderRadius && { borderRadius }),
    ...(borderWidth && {
      borderWidth: `${borderWidth}`,
      borderStyle: "solid",
    }),
    ...(borderColor && { borderColor }),
    ...(boxShadow && { boxShadow }),
    ...(width && { width }),
    ...(maxWidth && { maxWidth }),
    ...(minHeight && { minHeight }),
  };

  return (
    <div style={containerStyle}>
      <Content />
    </div>
  );
};

export const ContainerConfig: ComponentConfig<ContainerProps> = {
  fields: {
    content: {
      type: "slot",
    },
    direction: {
      type: "select",
      label: "Direction",
      options: [
        { label: "Row", value: "row" },
        { label: "Column", value: "column" },
        { label: "Row Reverse", value: "row-reverse" },
        { label: "Column Reverse", value: "column-reverse" },
      ],
      ai: {
        instructions:
          "Use 'row' direction for horizontal layouts like button groups, navigation bars, or side-by-side content. Use 'column' for vertical stacking of content like forms, lists, or stacked cards. Row-reverse and column-reverse reverse the visual order while maintaining source order.",
      },
    },
    justifyContent: {
      type: "select",
      label: "Justify Content",
      options: [
        { label: "Flex Start", value: "flex-start" },
        { label: "Center", value: "center" },
        { label: "Flex End", value: "flex-end" },
        { label: "Space Between", value: "space-between" },
        { label: "Space Around", value: "space-around" },
        { label: "Space Evenly", value: "space-evenly" },
      ],
      ai: {
        instructions:
          "Controls horizontal alignment in row direction, vertical alignment in column direction. 'flex-start' aligns to start, 'center' centers items, 'flex-end' aligns to end. 'space-between' distributes items with space between them, 'space-around' adds equal space around each item, 'space-evenly' distributes space evenly including edges.",
      },
    },
    alignItems: {
      type: "select",
      label: "Align Items",
      options: [
        { label: "Flex Start", value: "flex-start" },
        { label: "Center", value: "center" },
        { label: "Flex End", value: "flex-end" },
        { label: "Stretch", value: "stretch" },
        { label: "Baseline", value: "baseline" },
      ],
      ai: {
        instructions:
          "Controls vertical alignment in row direction, horizontal alignment in column direction. 'stretch' makes all items fill the cross-axis (default). 'center' centers items. 'baseline' aligns items to their text baseline, useful for text-heavy layouts.",
      },
    },
    gap: {
      type: "text",
      label: "Gap",
      ai: {
        instructions:
          "Spacing between child elements. Use CSS values like '16px', '1rem', '24px'. Common values: '8px' for tight spacing, '16px' for normal spacing, '24px' or '32px' for loose spacing. This creates consistent spacing without needing margins on individual children.",
      },
    },
    padding: {
      type: "text",
      label: "Padding",
      ai: {
        instructions:
          "Internal spacing inside the container. Use CSS values like '16px', '24px 32px' (vertical horizontal), or '16px 24px 32px 16px' (top right bottom left). Common values: '16px' for compact, '24px' for normal, '32px' or '48px' for spacious containers.",
      },
    },
    backgroundColor: {
      type: "text",
      label: "Background Color",
      ai: {
        instructions:
          "Background color for the container. Use hex codes (#ffffff), rgb/rgba values, or CSS color names. Leave empty for transparent background.",
      },
    },
    borderRadius: {
      type: "text",
      label: "Border Radius",
      ai: {
        instructions:
          "Rounded corners. Use CSS values like '4px' for subtle rounding, '8px' for moderate, '16px' for pronounced, or '50%' for circular containers. Leave empty for sharp corners.",
      },
    },
    borderWidth: {
      type: "text",
      label: "Border Width",
      ai: {
        instructions:
          "Border thickness. Use CSS values like '1px', '2px', '3px'. Leave empty for no border. Requires borderColor to be visible.",
      },
    },
    borderColor: {
      type: "text",
      label: "Border Color",
      ai: {
        instructions:
          "Border color. Use hex codes, rgb/rgba values, or CSS color names. Requires borderWidth to be visible.",
      },
    },
    boxShadow: {
      type: "text",
      label: "Box Shadow",
      ai: {
        instructions:
          "Shadow effect. Use CSS shadow syntax like '0 2px 4px rgba(0,0,0,0.1)' for subtle shadows, '0 4px 8px rgba(0,0,0,0.15)' for medium, '0 8px 16px rgba(0,0,0,0.2)' for strong shadows. Leave empty for no shadow.",
      },
    },
    width: {
      type: "text",
      label: "Width",
      ai: {
        instructions:
          "Container width. Use CSS values like '100%' for full width, '50%' for half, '800px' for fixed width, or 'auto' for content-based width. Leave empty to use default behavior.",
      },
    },
    maxWidth: {
      type: "text",
      label: "Max Width",
      ai: {
        instructions:
          "Maximum container width. Useful for constraining wide containers. Common values: '1200px', '1280px' for content containers, '800px' for narrower content. Leave empty for no maximum.",
      },
    },
    minHeight: {
      type: "text",
      label: "Min Height",
      ai: {
        instructions:
          "Minimum height of the container. Use CSS values like '200px', '50vh' (50% of viewport height). Useful for ensuring containers don't collapse when empty or have minimal content.",
      },
    },
    wrap: {
      type: "select",
      label: "Wrap",
      options: [
        { label: "Wrap", value: "wrap" },
        { label: "No Wrap", value: "nowrap" },
      ],
      ai: {
        instructions:
          "Whether items should wrap to the next line when they don't fit. 'wrap' allows items to wrap (useful for responsive layouts), 'nowrap' keeps all items on one line (may cause overflow).",
      },
    },
  },
  defaultProps: {
    direction: "row",
    justifyContent: "flex-start",
    alignItems: "stretch",
    wrap: "nowrap",
  },
  render: Container,
};

export default Container;
