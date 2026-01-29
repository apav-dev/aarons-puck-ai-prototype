import React from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { PromoButton } from "./types";

const getClassName = getClassNameFactory("PromoSection", styles);

type PromoInfoProps = {
  title: string;
  description: string;
  ctaButton: PromoButton;
  isEditing: boolean;
};

export const PromoInfo = ({
  title,
  description,
  ctaButton,
  isEditing,
}: PromoInfoProps) => {
  return (
    <div className={getClassName("info")}>
      <h2 className={getClassName("title")}>{title}</h2>
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
