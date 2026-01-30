/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import classnames from "classnames";
import {
  ProductItem,
  ImageAspectRatio,
  PricePosition,
  TextAlign,
} from "../types";
import { ProductRating } from "../ProductRating";

const getClassName = getClassNameFactory("ProductsSection", styles);

type SimpleVariantProps = {
  products: ProductItem[];
  showDescription: boolean;
  showCategory: boolean;
  showPrice: boolean;
  showRating: boolean;
  showColorSwatches: boolean;
  imageAspectRatio: ImageAspectRatio;
  pricePosition: PricePosition;
  textAlign: TextAlign;
  isEditing: boolean;
};

export const SimpleVariant = ({
  products,
  showDescription,
  showCategory,
  showPrice,
  showRating,
  showColorSwatches,
  imageAspectRatio,
  pricePosition,
  textAlign,
  isEditing,
}: SimpleVariantProps) => {
  const getAspectRatioClass = () => {
    switch (imageAspectRatio) {
      case "square":
        return getClassName("simpleImage--square");
      case "portrait":
        return getClassName("simpleImage--portrait");
      case "landscape":
        return getClassName("simpleImage--landscape");
      default:
        return getClassName("simpleImage--square");
    }
  };

  const textAlignClass =
    textAlign === "center" ? getClassName("simpleContent--center") : "";

  return (
    <div className={getClassName("simpleGrid")}>
      {products.map((product, index) => (
        <a
          key={index}
          href={product.link}
          className={classnames(getClassName("simpleCard"), textAlignClass)}
          tabIndex={isEditing ? -1 : undefined}
        >
          <div className={getClassName("simpleImageWrapper")}>
            <img
              src={product.imageUrl}
              alt={product.title}
              className={classnames(
                getClassName("simpleImage"),
                getAspectRatioClass(),
              )}
            />
          </div>
          <div className={getClassName("simpleContent")}>
            <h3 className={getClassName("simpleTitle")}>{product.title}</h3>
            {showCategory && product.category && (
              <p className={getClassName("simpleCategory")}>
                {product.category}
              </p>
            )}
            {showDescription && product.description && (
              <p className={getClassName("simpleDescription")}>
                {product.description}
              </p>
            )}
            {showRating &&
              product.rating !== undefined && (
                <ProductRating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  wrapperClassName={
                    textAlign === "center"
                      ? getClassName("simpleRating--center")
                      : undefined
                  }
                />
              )}
            {showPrice && product.price && (
              <p
                className={classnames(
                  getClassName("simplePrice"),
                  pricePosition === "inline" &&
                    getClassName("simplePrice--inline"),
                )}
              >
                {product.price}
              </p>
            )}
            {showColorSwatches &&
              product.colorSwatches &&
              product.colorSwatches.length > 0 && (
                <div className={getClassName("simpleColorSwatches")}>
                  {product.colorSwatches.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className={getClassName("simpleColorSwatch")}
                      style={{ backgroundColor: color.colorBg }}
                      aria-label={color.name}
                    />
                  ))}
                </div>
              )}
          </div>
        </a>
      ))}
    </div>
  );
};
