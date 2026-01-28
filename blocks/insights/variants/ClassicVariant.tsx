/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { InsightVariantProps } from "../types";

const getClassName = getClassNameFactory("InsightsSection", styles);

export const ClassicVariant = ({
  insights,
  showCategory,
  showDate,
  showDescription,
  showReadMore,
  isEditing,
}: InsightVariantProps) => {
  return (
    <div className={getClassName("grid")}>
      {insights.map((insight, index) => (
        <article key={index} className={getClassName("card")}>
          <div className={getClassName("imageWrapper")}>
            <img
              src={insight.imageUrl}
              alt={insight.title}
              className={getClassName("image")}
            />
          </div>
          <div className={getClassName("cardContent")}>
            {(showCategory || showDate) && (
              <div className={getClassName("metadata")}>
                {showCategory && (
                  <span className={getClassName("category")}>
                    {insight.category}
                  </span>
                )}
                {showCategory && showDate && (
                  <span className={getClassName("separator")}>|</span>
                )}
                {showDate && (
                  <span className={getClassName("date")}>{insight.date}</span>
                )}
              </div>
            )}
            <h3 className={getClassName("title")}>{insight.title}</h3>
            {showDescription && (
              <p className={getClassName("description")}>
                {insight.description}
              </p>
            )}
            {showReadMore && (
              <a
                href={insight.link}
                className={getClassName("readMore")}
                tabIndex={isEditing ? -1 : undefined}
              >
                {insight.linkText || "Read more"}
                <svg
                  className={getClassName("arrow")}
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
