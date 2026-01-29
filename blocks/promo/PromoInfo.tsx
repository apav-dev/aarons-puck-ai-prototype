import React from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import classnames from "classnames";
import { PromoButton } from "./types";

const getClassName = getClassNameFactory("PromoSection", styles);

type PromoInfoProps = {
  title: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  description: string;
  ctaButton: PromoButton;
  isEditing: boolean;
};

export const PromoInfo = ({
  title,
  subheading,
  subheadingPosition = "above",
  headingAlign = "left",
  description,
  ctaButton,
  isEditing,
}: PromoInfoProps) => {
  const headingBlockClass =
    headingAlign === "center" ? getClassName("headingBlock--center") : "";
  return (
    <div className={getClassName("info")}>
      <div
        className={classnames(getClassName("headingBlock"), headingBlockClass)}
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
      <div className={getClassName("actions")}>
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
