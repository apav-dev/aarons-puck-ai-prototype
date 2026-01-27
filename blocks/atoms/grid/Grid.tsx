import React, { CSSProperties } from "react";
import { ComponentConfig, PuckComponent, Slot } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("Grid", styles);

export type GridProps = {
  content?: Slot;
  columns?: number;
  columnGap?: string;
  rowGap?: string;
  padding?: string;
  backgroundColor?: string;
  borderRadius?: string;
  minColumnWidth?: string;
  width?: string;
  maxWidth?: string;
  alignItems?: "start" | "center" | "end" | "stretch";
  justifyItems?: "start" | "center" | "end" | "stretch";
};

export const Grid: PuckComponent<GridProps> = ({
  content: Content,
  columns = 3,
  columnGap,
  rowGap,
  padding,
  backgroundColor,
  borderRadius,
  minColumnWidth,
  width,
  maxWidth,
  alignItems = "stretch",
  justifyItems = "stretch",
}) => {
  if (!Content) {
    return null;
  }

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: minColumnWidth
      ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`
      : `repeat(${columns}, 1fr)`,
    columnGap: columnGap || rowGap || "16px",
    rowGap: rowGap || columnGap || "16px",
    padding,
    backgroundColor,
    borderRadius,
    width,
    maxWidth,
    alignItems,
    justifyItems,
  };

  return (
    <div className={getClassName()} style={gridStyle}>
      <Content />
    </div>
  );
};

export const GridConfig: ComponentConfig<GridProps> = {
  fields: {
    content: {
      type: "slot",
    },
    columns: {
      type: "number",
      label: "Columns",
      min: 1,
      max: 12,
      ai: {
        instructions:
          "Number of columns in the grid. Use 2-4 columns for most card layouts, 3-4 for service grids, 1-2 for mobile-first responsive designs. Ignored if minColumnWidth is set (uses auto-fit instead).",
      },
    },
    minColumnWidth: {
      type: "text",
      label: "Min Column Width (Auto-fit)",
      ai: {
        instructions:
          "Minimum width for each column. When set, creates a responsive auto-fit grid that automatically adjusts column count based on available space. Use values like '250px', '300px', 'min(300px, 100%)'. Leave empty to use fixed columns instead. This is ideal for responsive layouts that adapt to screen size.",
      },
    },
    columnGap: {
      type: "text",
      label: "Column Gap",
      ai: {
        instructions:
          "Horizontal spacing between columns. Use CSS values like '16px', '24px', '32px'. If rowGap is not set, this value applies to both horizontal and vertical spacing.",
      },
    },
    rowGap: {
      type: "text",
      label: "Row Gap",
      ai: {
        instructions:
          "Vertical spacing between rows. Use CSS values like '16px', '24px', '32px'. If columnGap is not set, this value applies to both horizontal and vertical spacing.",
      },
    },
    padding: {
      type: "text",
      label: "Padding",
      ai: {
        instructions:
          "Internal spacing inside the grid container. Use CSS values like '16px', '24px 32px' (vertical horizontal), or '16px 24px 32px 16px' (top right bottom left). Common values: '16px' for compact, '24px' for normal, '32px' or '48px' for spacious grids.",
      },
    },
    backgroundColor: {
      type: "text",
      label: "Background Color",
      ai: {
        instructions:
          "Background color for the grid container. Use hex codes (#ffffff), rgb/rgba values, or CSS color names. Leave empty for transparent background.",
      },
    },
    borderRadius: {
      type: "text",
      label: "Border Radius",
      ai: {
        instructions:
          "Rounded corners for the grid container. Use CSS values like '4px' for subtle rounding, '8px' for moderate, '16px' for pronounced. Leave empty for sharp corners.",
      },
    },
    width: {
      type: "text",
      label: "Width",
      ai: {
        instructions:
          "Grid container width. Use CSS values like '100%' for full width, '50%' for half, '800px' for fixed width, or 'auto' for content-based width. Leave empty to use default behavior.",
      },
    },
    maxWidth: {
      type: "text",
      label: "Max Width",
      ai: {
        instructions:
          "Maximum grid container width. Useful for constraining wide grids. Common values: '1200px', '1280px' for content grids, '800px' for narrower content. Leave empty for no maximum.",
      },
    },
    alignItems: {
      type: "select",
      label: "Align Items",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
        { label: "Stretch", value: "stretch" },
      ],
      ai: {
        instructions:
          "Vertical alignment of grid items within their cells. 'stretch' makes items fill the cell height (default), 'start' aligns to top, 'center' centers vertically, 'end' aligns to bottom.",
      },
    },
    justifyItems: {
      type: "select",
      label: "Justify Items",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
        { label: "Stretch", value: "stretch" },
      ],
      ai: {
        instructions:
          "Horizontal alignment of grid items within their cells. 'stretch' makes items fill the cell width (default), 'start' aligns to left, 'center' centers horizontally, 'end' aligns to right.",
      },
    },
  },
  defaultProps: {
    columns: 3,
    alignItems: "stretch",
    justifyItems: "stretch",
  },
  render: Grid,
};

export default Grid;
