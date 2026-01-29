/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { PromoInfo } from "../PromoInfo";
import { PromoButton } from "../types";

const getClassName = getClassNameFactory("PromoSection", styles);

type SpotlightVariantProps = {
  title: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  description: string;
  ctaButton: PromoButton;
  imageUrl: string;
  isEditing: boolean;
  /** Image is rendered as Section background (full-bleed); only card layout here. */
  imageAsBackground?: boolean;
};

export const SpotlightVariant = ({
  title,
  subheading,
  subheadingPosition = "above",
  headingAlign = "left",
  description,
  ctaButton,
  imageUrl,
  isEditing,
  imageAsBackground,
}: SpotlightVariantProps) => {
  const card = (
    <div className={getClassName("spotlightCard")}>
      <PromoInfo
        title={title}
        subheading={subheading}
        subheadingPosition={subheadingPosition}
        headingAlign={headingAlign}
        description={description}
        ctaButton={ctaButton}
        isEditing={isEditing}
      />
    </div>
  );

  if (imageAsBackground) {
    return <div className={getClassName("spotlightInner")}>{card}</div>;
  }

  return (
    <div className={getClassName("spotlight")}>
      <div className={getClassName("spotlightInner")}>
        <div className={getClassName("spotlightImageWrapper")}>
          <img
            src={imageUrl}
            alt={title}
            className={getClassName("spotlightImage")}
          />
        </div>
        {card}
      </div>
    </div>
  );
};
