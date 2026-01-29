/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import classnames from "classnames";
import { PromoButton } from "../types";

const getClassName = getClassNameFactory("PromoSection", styles);

type CompactVariantProps = {
  title: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  description: string;
  ctaButton: PromoButton;
  imageUrl: string;
  isEditing: boolean;
};

export const CompactVariant = ({
  title,
  subheading,
  subheadingPosition = "above",
  headingAlign = "left",
  description,
  ctaButton,
  imageUrl,
  isEditing,
}: CompactVariantProps) => {
  const headingBlockClass =
    headingAlign === "center" ? getClassName("headingBlock--center") : "";
  return (
    <div className={getClassName("inner")}>
      <div className={getClassName("imageWrapper")}>
        <img src={imageUrl} alt={title} className={getClassName("image")} />
      </div>

      <div className={getClassName("content")}>
        <div
          className={classnames(
            getClassName("headingBlock"),
            headingBlockClass,
          )}
        >
          {subheading && subheadingPosition === "above" && (
            <p className={getClassName("subheading")}>{subheading}</p>
          )}
          <h2 className={getClassName("title")}>{title}</h2>
          {subheading && subheadingPosition === "below" && (
            <p className={getClassName("subheading")}>{subheading}</p>
          )}
        </div>
        <p className={getClassName("description")}>{description}</p>

        <a
          href={ctaButton.href}
          className={getClassName("ctaButton")}
          tabIndex={isEditing ? -1 : undefined}
        >
          {ctaButton.label}
        </a>
      </div>
    </div>
  );
};
