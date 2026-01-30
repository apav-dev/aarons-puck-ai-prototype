/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { ProductItem } from "../types";
import { ProductRating } from "../ProductRating";

const getClassName = getClassNameFactory("ProductsSection", styles);

type OverlayVariantProps = {
  products: ProductItem[];
  showDescription: boolean;
  showCategory: boolean;
  showPrice: boolean;
  showRating: boolean;
  showCTA: boolean;
  isEditing: boolean;
};

export const OverlayVariant = ({
  products,
  showDescription,
  showCategory,
  showPrice,
  showRating,
  showCTA,
  isEditing,
}: OverlayVariantProps) => {
  return (
    <div className={getClassName("overlayGrid")}>
      {products.map((product, index) => (
        <div key={index} className={getClassName("overlayItem")}>
          <div className={getClassName("overlayImageWrapper")}>
            <img
              src={product.imageUrl}
              alt={product.title}
              className={getClassName("overlayImage")}
            />
            {showPrice && product.price && (
              <div className={getClassName("overlayPriceContainer")}>
                <div className={getClassName("overlayGradient")} />
                <p className={getClassName("overlayPrice")}>{product.price}</p>
              </div>
            )}
          </div>
          <div className={getClassName("overlayContent")}>
            <h3 className={getClassName("overlayTitle")}>{product.title}</h3>
            {showCategory && product.category && (
              <p className={getClassName("overlayCategory")}>
                {product.category}
              </p>
            )}
            {showDescription && product.description && (
              <p className={getClassName("overlayDescription")}>
                {product.description}
              </p>
            )}
            {showRating && product.rating !== undefined && (
              <div className={getClassName("overlayRating")}>
                <ProductRating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                />
              </div>
            )}
          </div>
          {showCTA && (
            <div className={getClassName("overlayCTAWrapper")}>
              <a
                href={product.link}
                className={getClassName("overlayCTA")}
                tabIndex={isEditing ? -1 : undefined}
              >
                Add to bag
                <span className={getClassName("overlayCTASrOnly")}>
                  , {product.title}
                </span>
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
