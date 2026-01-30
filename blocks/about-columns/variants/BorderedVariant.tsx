import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { AboutColumnsVariantProps } from "../types";

const getClassName = getClassNameFactory("AboutColumnsSection", styles);

export const BorderedVariant = ({
  columns,
  desktopColumns,
  isEditing,
}: AboutColumnsVariantProps) => {
  const gridClass = `${getClassName("grid")} ${getClassName(`grid--${desktopColumns}col`)}`;

  return (
    <div className={gridClass}>
      {columns.map((column, index) => (
        <div key={index} className={getClassName("borderedColumn")}>
          <h3 className={getClassName("columnTitle")}>{column.title}</h3>
          <div className={getClassName("columnContent")}>
            {column.content
              .split("\n")
              .filter((p) => p.trim())
              .map((paragraph, pIndex) => (
                <p key={pIndex} className={getClassName("columnParagraph")}>
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
