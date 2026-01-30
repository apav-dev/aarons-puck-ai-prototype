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

type CardsVariantProps = {
  products: ProductItem[];
  showDescription: boolean;
  showCategory: boolean;
  showPrice: boolean;
  showRating: boolean;
  showCTA: boolean;
  imageAspectRatio: ImageAspectRatio;
  pricePosition: PricePosition;
  textAlign: TextAlign;
  isEditing: boolean;
};

export const CardsVariant = ({
  products,
  showDescription,
  showCategory,
  showPrice,
  showRating,
  showCTA,
  imageAspectRatio,
  pricePosition,
  textAlign,
  isEditing,
}: CardsVariantProps) => {
  const getAspectRatioClass = () => {
    switch (imageAspectRatio) {
      case "square":
        return getClassName("cardsImage--square");
      case "portrait":
        return getClassName("cardsImage--portrait");
      case "landscape":
        return getClassName("cardsImage--landscape");
      default:
        return getClassName("cardsImage--portrait");
    }
  };

  const textAlignClass =
    textAlign === "center" ? getClassName("cardsContent--center") : "";

  return (
    <div className={getClassName("cardsGrid")}>
      {products.map((product, index) => (
        <div
          key={index}
          className={classnames(getClassName("cardsCard"), textAlignClass)}
        >
          <div className={getClassName("cardsImageWrapper")}>
            <img
              src={product.imageUrl}
              alt={product.title}
              className={classnames(
                getClassName("cardsImage"),
                getAspectRatioClass(),
              )}
            />
          </div>
          <div className={getClassName("cardsContent")}>
            <h3 className={getClassName("cardsTitle")}>
              <a href={product.link} tabIndex={isEditing ? -1 : undefined}>
                <span
                  aria-hidden="true"
                  className={getClassName("cardsLinkOverlay")}
                />
                {product.title}
              </a>
            </h3>
            {showDescription && product.description && (
              <p className={getClassName("cardsDescription")}>
                {product.description}
              </p>
            )}
            {showRating && product.rating !== undefined && (
              <div className={getClassName("cardsRating")}>
                <ProductRating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                />
              </div>
            )}
            <div className={getClassName("cardsFooter")}>
              {showCategory && product.category && (
                <p className={getClassName("cardsCategory")}>
                  {product.category}
                </p>
              )}
              {showPrice && product.price && (
                <p
                  className={classnames(
                    getClassName("cardsPrice"),
                    pricePosition === "inline" &&
                      getClassName("cardsPrice--inline"),
                  )}
                >
                  {product.price}
                </p>
              )}
            </div>
            {showCTA && (
              <a
                href={product.link}
                className={getClassName("cardsCTA")}
                tabIndex={isEditing ? -1 : undefined}
              >
                Learn More
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
