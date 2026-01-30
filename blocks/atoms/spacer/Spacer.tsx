import React, { CSSProperties } from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("Spacer", styles);

export type SpacerProps = {
  height?: string;
  width?: string;
};

export const Spacer: PuckComponent<SpacerProps> = ({
  height = "32px",
  width,
}) => {
  const spacerStyle: CSSProperties = {
    height: height || undefined,
    width: width || undefined,
    flexShrink: 0,
  };

  return <div className={getClassName()} style={spacerStyle} />;
};

export const SpacerConfig: ComponentConfig<SpacerProps> = {
  fields: {
    height: {
      type: "text",
      label: "Height",
      ai: {
        instructions:
          "Vertical spacing height. Use CSS values like '16px', '24px', '32px', '48px', '64px', '1rem', '2rem', '4rem'. Common: '16px' for small gaps, '32px' for medium (default), '48px' or '64px' for large gaps between sections. Use Spacer when Container/Grid gap isn't appropriate or when you need spacing between specific elements.",
      },
    },
    width: {
      type: "text",
      label: "Width",
      ai: {
        instructions:
          "Horizontal spacing width. Use CSS values like '16px', '24px', '32px'. Useful in horizontal flex layouts (Container with row direction) to create spacing between items. Leave empty for vertical-only spacing (most common use case).",
      },
    },
  },
  defaultProps: {
    height: "32px",
  },
  render: Spacer,
};

export default Spacer;








