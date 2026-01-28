/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { PromoInfo } from "../PromoInfo";
import { PromoButton } from "../types";

const getClassName = getClassNameFactory("PromoSection", styles);

type SpotlightVariantProps = {
  title: string;
  description: string;
  ctaButton: PromoButton;
  imageUrl: string;
  isEditing: boolean;
};

export const SpotlightVariant = ({
  title,
  description,
  ctaButton,
  imageUrl,
  isEditing,
}: SpotlightVariantProps) => {
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
        <div className={getClassName("spotlightCard")}>
          <PromoInfo
            title={title}
            description={description}
            ctaButton={ctaButton}
            isEditing={isEditing}
          />
        </div>
      </div>
    </div>
  );
};
