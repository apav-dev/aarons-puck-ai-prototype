/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from "react";
import { ComponentConfig } from "@measured/puck";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { getGoogleFontsUrl } from "../../lib/google-fonts";

const getClassName = getClassNameFactory("ProductsSection", styles);

export type ProductItem = {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  link: string;
};

export type ProductsSectionProps = {
  heading: string;
  products: ProductItem[];
  padding: string;
  headingFont?: string;
  bodyFont?: string;
};

export const ProductsSection: PuckComponent<ProductsSectionProps> = ({
  heading,
  products,
  padding,
  headingFont,
  bodyFont,
  puck,
}) => {
  // Prepare font styles
  const headingStyle = headingFont
    ? { fontFamily: `"${headingFont}", sans-serif` }
    : undefined;
  const bodyStyle = bodyFont
    ? { fontFamily: `"${bodyFont}", sans-serif` }
    : undefined;

  // Load Google Fonts into document head
  useEffect(() => {
    if (headingFont) {
      const linkId = `font-heading-${headingFont}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = getGoogleFontsUrl(headingFont);
        document.head.appendChild(link);
      }
    }
    if (bodyFont && bodyFont !== headingFont) {
      const linkId = `font-body-${bodyFont}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = getGoogleFontsUrl(bodyFont);
        document.head.appendChild(link);
      }
    }
  }, [headingFont, bodyFont]);

  return (
    <Section
      className={getClassName()}
      style={{ paddingTop: padding, paddingBottom: padding }}
    >
      <h2 className={getClassName("heading")} style={headingStyle}>
        {heading}
      </h2>
      <div className={getClassName("grid")}>
        {products.map((product, index) => (
          <div key={index} className={getClassName("card")}>
            <div className={getClassName("imageWrapper")}>
              <img
                src={product.imageUrl}
                alt={product.title}
                className={getClassName("image")}
              />
            </div>
            <div className={getClassName("cardContent")}>
              <h3 className={getClassName("productTitle")} style={headingStyle}>
                {product.title}
              </h3>
              <div className={getClassName("categoryTag")} style={bodyStyle}>
                {product.category}
              </div>
              <p className={getClassName("description")} style={bodyStyle}>
                {product.description}
              </p>
              <a
                href={product.link}
                className={getClassName("learnMoreButton")}
                style={bodyStyle}
                tabIndex={puck.isEditing ? -1 : undefined}
              >
                Learn More
              </a>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export const ProductsSectionConfig: ComponentConfig<ProductsSectionProps> = {
  fields: {
    heading: {
      type: "text",
      label: "Heading",
    },
    products: {
      type: "array",
      label: "Products",
      min: 1,
      max: 6,
      getItemSummary: (item) => item.title || "Product",
      arrayFields: {
        title: { type: "text", label: "Title" },
        category: { type: "text", label: "Category" },
        description: { type: "textarea", label: "Description" },
        imageUrl: {
          type: "text",
          label: "Image URL",
          ai: {
            instructions:
              "Always use an image URL provided by the getImage tool. Use the business name as the brand, 'ProductsSection' as the component, and the product title or category as additional context.",
          },
        },
        link: { type: "text", label: "Link" },
      },
      defaultItemProps: {
        title: "Product Title",
        category: "Category, Pricing, etc",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        imageUrl:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
        link: "#",
      },
    },
    padding: {
      type: "text",
      label: "Padding",
    },
    headingFont: {
      type: "text",
      label: "Heading Font",
      ai: {
        instructions:
          "Always use the getFontFamily tool. Use the business name as the brand, 'heading' as the fontType, and any available entity type context.",
      },
    },
    bodyFont: {
      type: "text",
      label: "Body Font",
      ai: {
        instructions:
          "Always use the getFontFamily tool. Use the business name as the brand, 'body' as the fontType, and any available entity type context.",
      },
    },
  },
  defaultProps: {
    heading: "Featured Products at Business Geomodifier",
    products: [
      {
        title: "Product Title",
        category: "Category, Pricing, etc",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        imageUrl:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
        link: "#",
      },
      {
        title: "Product Title",
        category: "Category, Pricing, etc",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        imageUrl:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
        link: "#",
      },
      {
        title: "Product Title",
        category: "Category, Pricing, etc",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        imageUrl:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
        link: "#",
      },
    ],
    padding: "64px",
  },
  render: ProductsSection,
};

export default ProductsSection;
