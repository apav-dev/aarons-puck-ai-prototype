/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { ProductItem } from "../types";
import { ProductRating } from "../ProductRating";

const getClassName = getClassNameFactory("ProductsSection", styles);

type GridVariantProps = {
  products: ProductItem[];
  showDescription: boolean;
  showCategory: boolean;
  showPrice: boolean;
  showRating: boolean;
  isEditing: boolean;
};

export const GridVariant = ({
  products,
  showDescription,
  showCategory,
  showPrice,
  showRating,
  isEditing,
}: GridVariantProps) => {
  return (
    <div className={getClassName("gridContainer")}>
      <div className={getClassName("gridGrid")}>
        {products.map((product, index) => (
          <div key={index} className={getClassName("gridItem")}>
            <img
              src={product.imageUrl}
              alt={product.title}
              className={getClassName("gridImage")}
            />
            <div className={getClassName("gridContent")}>
              <h3 className={getClassName("gridTitle")}>
                <a href={product.link} tabIndex={isEditing ? -1 : undefined}>
                  <span
                    aria-hidden="true"
                    className={getClassName("gridLinkOverlay")}
                  />
                  {product.title}
                </a>
              </h3>
              {showCategory && product.category && (
                <p className={getClassName("gridCategory")}>
                  {product.category}
                </p>
              )}
              {showDescription && product.description && (
                <p className={getClassName("gridDescription")}>
                  {product.description}
                </p>
              )}
              {showRating && product.rating !== undefined && (
                <ProductRating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  wrapperClassName={getClassName("gridRating")}
                />
              )}
              {showPrice && product.price && (
                <p className={getClassName("gridPrice")}>{product.price}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
