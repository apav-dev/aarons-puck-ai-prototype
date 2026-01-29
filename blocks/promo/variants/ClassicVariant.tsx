/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { PromoInfo } from "../PromoInfo";
import { PromoButton } from "../types";

const getClassName = getClassNameFactory("PromoSection", styles);

type ClassicVariantProps = {
  title: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  description: string;
  ctaButton: PromoButton;
  imageUrl: string;
  isEditing: boolean;
};

export const ClassicVariant = ({
  title,
  subheading,
  subheadingPosition = "above",
  headingAlign = "left",
  description,
  ctaButton,
  imageUrl,
  isEditing,
}: ClassicVariantProps) => {
  return (
    <div className={getClassName("classic")}>
      <div className={getClassName("classicInner")}>
        <div className={getClassName("classicImageWrapper")}>
          <img
            src={imageUrl}
            alt={title}
            className={getClassName("classicImage")}
          />
        </div>
        <div className={getClassName("classicContent")}>
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
      </div>
    </div>
  );
};
