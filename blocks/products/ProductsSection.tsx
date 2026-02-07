/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import classnames from "classnames";
import { ProductsSectionProps } from "./types";
import { SimpleVariant } from "./variants/SimpleVariant";
import { CardsVariant } from "./variants/CardsVariant";
import { GridVariant } from "./variants/GridVariant";
import { OverlayVariant } from "./variants/OverlayVariant";
import ContentModeField from "../../lib/fields/ContentModeField";
import { getConvexClient, queryRef } from "../../lib/convex";
import {
  ContentModeFieldConfig,
  ContentOption,
} from "../../lib/fields/content-mode-types";

const getClassName = getClassNameFactory("ProductsSection", styles);

export type { ProductsSectionProps } from "./types";
export type { ProductItem } from "./types";

export const ProductsSection: PuckComponent<ProductsSectionProps> = ({
  heading,
  subheading,
  subheadingPosition = "above",
  headingAlign = "left",
  products,
  variant,
  showDescription,
  showCategory,
  showPrice,
  showRating,
  showCTA,
  showColorSwatches,
  imageAspectRatio,
  pricePosition,
  textAlign,
  sectionCTAText,
  sectionCTALink,
  puck,
}) => {
  const headingBlockClass =
    headingAlign === "center" ? getClassName("headingBlock--center") : "";

  const renderVariant = () => {
    const commonProps = {
      products,
      isEditing: puck.isEditing,
    };

    switch (variant) {
      case "simple":
        return (
          <SimpleVariant
            {...commonProps}
            showDescription={showDescription}
            showCategory={showCategory}
            showPrice={showPrice}
            showRating={showRating}
            showColorSwatches={showColorSwatches}
            imageAspectRatio={imageAspectRatio}
            pricePosition={pricePosition}
            textAlign={textAlign}
          />
        );
      case "grid":
        return (
          <GridVariant
            {...commonProps}
            showDescription={showDescription}
            showCategory={showCategory}
            showPrice={showPrice}
            showRating={showRating}
          />
        );
      case "overlay":
        return (
          <OverlayVariant
            {...commonProps}
            showDescription={showDescription}
            showCategory={showCategory}
            showPrice={showPrice}
            showRating={showRating}
            showCTA={showCTA}
          />
        );
      case "cards":
      default:
        return (
          <CardsVariant
            {...commonProps}
            showDescription={showDescription}
            showCategory={showCategory}
            showPrice={showPrice}
            showRating={showRating}
            showCTA={showCTA}
            imageAspectRatio={imageAspectRatio}
            pricePosition={pricePosition}
            textAlign={textAlign}
          />
        );
    }
  };

  return (
    <Section className={getClassName({ [variant]: true })}>
      <div
        className={classnames(getClassName("headingBlock"), headingBlockClass)}
      >
        {subheading && subheadingPosition === "above" && (
          <p className={getClassName("subheading")}>{subheading}</p>
        )}
        <div className={getClassName("headingRow")}>
          <h2 className={getClassName("heading")}>{heading}</h2>
          {sectionCTAText && sectionCTALink && (
            <a
              href={sectionCTALink}
              className={getClassName("sectionCTA")}
              tabIndex={puck.isEditing ? -1 : undefined}
            >
              {sectionCTAText}
              <span aria-hidden="true"> &rarr;</span>
            </a>
          )}
        </div>
        {subheading && subheadingPosition === "below" && (
          <p className={getClassName("subheading")}>{subheading}</p>
        )}
      </div>
      {renderVariant()}
      {sectionCTAText && sectionCTALink && (
        <div className={getClassName("sectionCTAMobile")}>
          <a
            href={sectionCTALink}
            className={getClassName("sectionCTA")}
            tabIndex={puck.isEditing ? -1 : undefined}
          >
            {sectionCTAText}
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      )}
    </Section>
  );
};

export const ProductsSectionConfig: ComponentConfig<ProductsSectionProps> = {
  fields: {
    contentSource: {
      type: "custom",
      label: "Products",
      entityLabel: "Products",
      selectionMode: "multiple",
      listQueryName: "products:list",
      currentForLocationQueryName: "relationships:productsForLocation",
      linkMutationName: "relationships:linkLocationProduct",
      unlinkMutationName: "relationships:unlinkLocationProduct",
      locationIdArg: "locationId",
      itemIdArg: "productId",
      mapItemToOption: (item: Record<string, unknown>): ContentOption => ({
        id: String(item._id),
        label: String(item.name ?? "Untitled product"),
        imageUrl: item.image ? String(item.image) : undefined,
        raw: item,
      }),
      render: (params: {
        field: ContentModeFieldConfig;
        value: unknown;
        onChange: (value: unknown) => void;
      }) => <ContentModeField {...params} />,
    },
    variant: {
      type: "radio",
      label: "Variant",
      options: [
        { label: "Cards", value: "cards" },
        { label: "Simple", value: "simple" },
        { label: "Grid", value: "grid" },
        { label: "Overlay", value: "overlay" },
      ],
    },
    heading: {
      type: "text",
      label: "Heading",
    },
    subheading: {
      type: "text",
      label: "Subheading",
    },
    subheadingPosition: {
      type: "radio",
      label: "Subheading position",
      options: [
        { label: "Above heading", value: "above" },
        { label: "Below heading", value: "below" },
      ],
    },
    headingAlign: {
      type: "radio",
      label: "Heading alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
    },
    sectionCTAText: {
      type: "text",
      label: "Section CTA Text",
    },
    sectionCTALink: {
      type: "text",
      label: "Section CTA Link",
    },
    // Visibility options
    showDescription: {
      type: "radio",
      label: "Show Description",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showCategory: {
      type: "radio",
      label: "Show Category",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showPrice: {
      type: "radio",
      label: "Show Price",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showRating: {
      type: "radio",
      label: "Show Rating",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showCTA: {
      type: "radio",
      label: "Show CTA Button",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showColorSwatches: {
      type: "radio",
      label: "Show Color Swatches",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    // Styling options
    imageAspectRatio: {
      type: "radio",
      label: "Image Aspect Ratio",
      options: [
        { label: "Square", value: "square" },
        { label: "Portrait", value: "portrait" },
        { label: "Landscape", value: "landscape" },
      ],
    },
    pricePosition: {
      type: "radio",
      label: "Price Position",
      options: [
        { label: "Inline", value: "inline" },
        { label: "Below", value: "below" },
      ],
    },
    textAlign: {
      type: "radio",
      label: "Text Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
    },
    products: {
      type: "array",
      label: "",
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
            stream: false,
          },
        },
        link: { type: "text", label: "Link" },
        price: { type: "text", label: "Price" },
        rating: {
          type: "number",
          label: "Rating (1-5)",
        },
        reviewCount: {
          type: "number",
          label: "Review Count",
        },
        colorSwatches: {
          type: "array",
          label: "Color Swatches",
          getItemSummary: (item) => item.name || "Color",
          arrayFields: {
            name: { type: "text", label: "Color Name" },
            colorBg: { type: "text", label: "Color (hex or CSS color)" },
          },
        },
      },
      defaultItemProps: {
        title: "Product Title",
        category: "Category, Pricing, etc",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        imageUrl:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
        link: "#",
        price: "$99",
        rating: 5,
        reviewCount: 24,
        colorSwatches: [],
      },
    },
  },
  defaultProps: {
    contentSource: { source: "static", dynamicMode: "all" },
    variant: "cards",
    heading: "Featured Products at Business Geomodifier",
    subheadingPosition: "above",
    headingAlign: "left",
    showDescription: true,
    showCategory: true,
    showPrice: true,
    showRating: false,
    showCTA: true,
    showColorSwatches: false,
    imageAspectRatio: "portrait",
    pricePosition: "below",
    textAlign: "left",
    products: [
      {
        title: "Product Title",
        category: "Category, Pricing, etc",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        imageUrl:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
        link: "#",
        price: "$99",
        rating: 5,
        reviewCount: 24,
        colorSwatches: [],
      },
      {
        title: "Product Title",
        category: "Category, Pricing, etc",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        imageUrl:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
        link: "#",
        price: "$99",
        rating: 5,
        reviewCount: 24,
        colorSwatches: [],
      },
      {
        title: "Product Title",
        category: "Category, Pricing, etc",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        imageUrl:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
        link: "#",
        price: "$99",
        rating: 5,
        reviewCount: 24,
        colorSwatches: [],
      },
    ],
  },
  resolveData: async ({ props }, { changed, metadata }) => {
    const source = props.contentSource;
    if (!source || source.source === "static") {
      return { props, readOnly: { products: false } };
    }
    if (changed && !changed.contentSource) {
      return { props };
    }

    const client = getConvexClient();
    let records: Record<string, unknown>[] = [];

    const mode = source.dynamicMode ?? "all";

    if (mode === "all" && source.selectedIds?.length) {
      records = (await client.query(queryRef("products:getByIds"), {
        ids: source.selectedIds,
      })) as Record<string, unknown>[];
    }

    if (mode === "perLocation") {
      const locationId = metadata?.location?._id;
      if (locationId) {
        const products = (await client.query(
          queryRef("relationships:productsForLocation"),
          { locationId }
        )) as Record<string, unknown>[];
        const order = source.perLocationSelectedIds?.[locationId] ?? [];
        const ordered = [
          ...order
            .map((id) => products.find((product) => String(product._id) === id))
            .filter(Boolean),
          ...products.filter(
            (product) => !order.includes(String(product._id))
          ),
        ];
        records = ordered as Record<string, unknown>[];
      }
    }

    if (!records.length) {
      return { props, readOnly: { products: false } };
    }

    const products = records.map((product) => ({
      title: String(product.name ?? "Product"),
      category: String(product.category ?? ""),
      description: String(product.description ?? ""),
      imageUrl: String(product.image ?? ""),
      link: "#",
      price:
        product.price === null || product.price === undefined
          ? undefined
          : `$${String(product.price)}`,
    }));

    return {
      props: {
        ...props,
        products,
      },
      readOnly: { products: true },
    };
  },
  resolveFields: (data) => {
    const { variant, contentSource } = data.props;
    const baseFields = ProductsSectionConfig.fields;

    // Filter fields based on variant
    const filteredFields: typeof baseFields = { ...baseFields };

    if (contentSource?.source === "dynamic") {
      delete filteredFields.products;
    }

    // Color swatches only for simple variant (not shown on grid/cards/overlay)
    if (variant !== "simple") {
      delete filteredFields.showColorSwatches;
    }

    // CTA only makes sense for cards and overlay variants
    if (variant !== "cards" && variant !== "overlay") {
      delete filteredFields.showCTA;
    }

    // Image aspect ratio and price position don't apply to grid variant
    if (variant === "grid") {
      delete filteredFields.imageAspectRatio;
      delete filteredFields.pricePosition;
      delete filteredFields.textAlign;
    }

    // Text align doesn't apply to overlay variant
    if (variant === "overlay") {
      delete filteredFields.textAlign;
      delete filteredFields.pricePosition;
    }

    return filteredFields;
  },
  render: ProductsSection,
};

export default ProductsSection;
