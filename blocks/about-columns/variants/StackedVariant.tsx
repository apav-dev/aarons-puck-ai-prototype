import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { AboutColumnsVariantProps } from "../types";

const getClassName = getClassNameFactory("AboutColumnsSection", styles);

export const StackedVariant = ({
  columns,
  desktopColumns,
  isEditing,
}: AboutColumnsVariantProps) => {
  return (
    <div
      className={getClassName("stackedContainer")}
      data-columns={desktopColumns}
    >
      {columns.map((column, index) => (
        <React.Fragment key={index}>
          <div className={getClassName("stackedColumn")}>
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
          {index < columns.length - 1 && (
            <div className={getClassName("divider")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
