/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { PromoInfo } from "../PromoInfo";
import { PromoButton } from "../types";

const getClassName = getClassNameFactory("PromoSection", styles);

type ImmersiveVariantProps = {
  title: string;
  description: string;
  ctaButton: PromoButton;
  imageUrl: string;
  isEditing: boolean;
  /** Image is rendered as Section background (full-bleed); only content layout here. */
  imageAsBackground?: boolean;
};

export const ImmersiveVariant = ({
  title,
  description,
  ctaButton,
  imageUrl,
  isEditing,
  imageAsBackground,
}: ImmersiveVariantProps) => {
  const content = (
    <div className={getClassName("immersiveContent")}>
      <PromoInfo
        title={title}
        description={description}
        ctaButton={ctaButton}
        isEditing={isEditing}
      />
    </div>
  );

  if (imageAsBackground) {
    return <div className={getClassName("immersiveInner")}>{content}</div>;
  }

  return (
    <div className={getClassName("immersive")}>
      <div className={getClassName("immersiveInner")}>
        <div className={getClassName("immersiveImageWrapper")}>
          <div className={getClassName("immersiveOverlay")} />
          <img
            src={imageUrl}
            alt={title}
            className={getClassName("immersiveImage")}
          />
        </div>
        {content}
      </div>
    </div>
  );
};
