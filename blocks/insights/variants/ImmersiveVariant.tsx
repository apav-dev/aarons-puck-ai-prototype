/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { InsightVariantProps } from "../types";

const getClassName = getClassNameFactory("InsightsSection", styles);

export const ImmersiveVariant = ({
  insights,
  showCategory,
  showDate,
  showDescription,
  showReadMore,
  isEditing,
}: InsightVariantProps) => {
  return (
    <div className={getClassName("immersiveGrid")}>
      {insights.map((insight, index) => (
        <article key={index} className={getClassName("immersiveCard")}>
          <div className={getClassName("immersiveImageWrapper")}>
            <img
              src={insight.imageUrl}
              alt={insight.title}
              className={getClassName("immersiveImage")}
            />
            <div className={getClassName("immersiveOverlay")} />
          </div>
          <div className={getClassName("immersiveContent")}>
            {(showCategory || showDate) && (
              <div className={getClassName("immersiveMetadata")}>
                {showDate && (
                  <span className={getClassName("immersiveDate")}>
                    {insight.date}
                  </span>
                )}
                {showCategory && showDate && (
                  <span className={getClassName("immersiveSeparator")}>•</span>
                )}
                {showCategory && (
                  <span className={getClassName("immersiveCategory")}>
                    {insight.category}
                  </span>
                )}
              </div>
            )}
            <h3 className={getClassName("immersiveTitle")}>{insight.title}</h3>
            {showDescription && (
              <p className={getClassName("immersiveDescription")}>
                {insight.description}
              </p>
            )}
            {showReadMore && (
              <a
                href={insight.link}
                className={getClassName("immersiveReadMore")}
                tabIndex={isEditing ? -1 : undefined}
              >
                {insight.linkText || "Read more"}
                <svg
                  className={getClassName("immersiveArrow")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};
