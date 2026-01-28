/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { InsightVariantProps } from "../types";

const getClassName = getClassNameFactory("InsightsSection", styles);

// Helper to parse date and extract month/day/year
const parseDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    // If parsing fails, try to extract manually
    const parts = dateStr.match(/(\w+)\s+(\d+),?\s*(\d{4})/);
    if (parts) {
      return {
        month: parts[1].substring(0, 3).toUpperCase(),
        day: parts[2],
        year: parts[3],
      };
    }
    return { month: "JAN", day: "1", year: "2024" };
  }
  return {
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate().toString(),
    year: date.getFullYear().toString(),
  };
};

export const EditorialVariant = ({
  insights,
  showCategory,
  showDate,
  showDescription,
  showReadMore,
  isEditing,
}: InsightVariantProps) => {
  return (
    <div className={getClassName("editorialGrid")}>
      {insights.map((insight, index) => {
        const parsedDate = parseDate(insight.date);
        return (
          <article key={index} className={getClassName("editorialCard")}>
            <div className={getClassName("editorialImageContainer")}>
              {showDate && (
                <div className={getClassName("editorialDateBadge")}>
                  <span className={getClassName("editorialDateMonth")}>
                    {parsedDate.month}
                  </span>
                  <span className={getClassName("editorialDateDay")}>
                    {parsedDate.day}
                  </span>
                  <span className={getClassName("editorialDateYear")}>
                    {parsedDate.year}
                  </span>
                </div>
              )}
              <div className={getClassName("editorialImageWrapper")}>
                <img
                  src={insight.imageUrl}
                  alt={insight.title}
                  className={getClassName("editorialImage")}
                />
              </div>
            </div>
            <div className={getClassName("editorialContent")}>
              {showCategory && (
                <span className={getClassName("editorialCategory")}>
                  {insight.category}
                </span>
              )}
              <h3 className={getClassName("editorialTitle")}>
                {insight.title}
              </h3>
              {showDescription && (
                <p className={getClassName("editorialDescription")}>
                  {insight.description}
                </p>
              )}
              {showReadMore && (
                <a
                  href={insight.link}
                  className={getClassName("editorialButton")}
                  tabIndex={isEditing ? -1 : undefined}
                >
                  {insight.linkText || "READ BLOG"}
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
