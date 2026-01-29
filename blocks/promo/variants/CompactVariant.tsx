/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { PromoButton } from "../types";

const getClassName = getClassNameFactory("PromoSection", styles);

type CompactVariantProps = {
  title: string;
  description: string;
  ctaButton: PromoButton;
  imageUrl: string;
  isEditing: boolean;
};

export const CompactVariant = ({
  title,
  description,
  ctaButton,
  imageUrl,
  isEditing,
}: CompactVariantProps) => {
  return (
    <div className={getClassName("inner")}>
      <div className={getClassName("imageWrapper")}>
        <img src={imageUrl} alt={title} className={getClassName("image")} />
      </div>

      <div className={getClassName("content")}>
        <h2 className={getClassName("title")}>{title}</h2>
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
