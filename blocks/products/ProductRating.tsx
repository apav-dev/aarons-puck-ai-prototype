import React from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import classnames from "classnames";

const getClassName = getClassNameFactory("ProductsSection", styles);

type ProductRatingProps = {
  rating: number;
  reviewCount?: number;
  /** Optional wrapper class for variant-specific alignment (e.g. centered) */
  wrapperClassName?: string;
};

export const ProductRating = ({
  rating,
  reviewCount,
  wrapperClassName,
}: ProductRatingProps) => {
  return (
    <div
      className={classnames(getClassName("rating"), wrapperClassName)}
      role="img"
      aria-label={`${rating} out of 5 stars${reviewCount !== undefined ? `, ${reviewCount} reviews` : ""}`}
    >
      <p className={getClassName("ratingSrOnly")}>
        {rating} out of 5 stars
      </p>
      <div className={getClassName("ratingStars")} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon
            key={i}
            aria-hidden="true"
            className={classnames(
              getClassName("ratingStar"),
              rating > i ? getClassName("ratingStar--filled") : getClassName("ratingStar--empty")
            )}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <p className={getClassName("ratingReviewCount")} aria-hidden="true">
          {reviewCount} reviews
        </p>
      )}
    </div>
  );
};
