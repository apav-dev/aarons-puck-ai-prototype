/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { ComponentConfig } from "@puckeditor/core";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("PhotoGridSection", styles);

export type PhotoGridItem = {
  imageUrl: string;
  overlayText: string;
  label: string;
};

export type PhotoGridSectionProps = {
  type: "Gallery" | "Carousel";
  heading: string;
  items: PhotoGridItem[];
};

// Arrow icons as inline SVGs
const ArrowLeft = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ArrowRight = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const PhotoGridSection: PuckComponent<PhotoGridSectionProps> = ({
  type = "Gallery",
  heading,
  items,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
  };

  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex === items.length - 1;

  if (type === "Carousel") {
    return (
      <Section className={getClassName()}>
        <h2 className={getClassName("heading")}>{heading}</h2>
        <div className={getClassName("carousel")}>
          <button
            className={getClassName("carouselArrow")}
            onClick={handlePrevious}
            disabled={isAtStart}
            aria-label="Previous image"
            data-position="left"
          >
            <ArrowLeft />
          </button>

          <div className={getClassName("carouselImageContainer")}>
            <img
              src={items[currentIndex]?.imageUrl}
              alt={items[currentIndex]?.label || "Carousel image"}
              className={getClassName("carouselImage")}
            />
          </div>

          <button
            className={getClassName("carouselArrow")}
            onClick={handleNext}
            disabled={isAtEnd}
            aria-label="Next image"
            data-position="right"
          >
            <ArrowRight />
          </button>
        </div>

        <div className={getClassName("carouselPagination")}>
          {items.map((_, index) => (
            <button
              key={index}
              className={getClassName("carouselIndicator")}
              data-active={index === currentIndex}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </Section>
    );
  }

  // Gallery type (default)
  return (
    <Section className={getClassName()}>
      <h2 className={getClassName("heading")}>{heading}</h2>
      <div className={getClassName("grid")}>
        {items.map((item, index) => (
          <div key={index} className={getClassName("item")}>
            <div className={getClassName("imageWrapper")}>
              <img
                src={item.imageUrl}
                alt={item.label}
                className={getClassName("image")}
              />
              {item.overlayText && (
                <div className={getClassName("overlay")}>
                  <span className={getClassName("overlayText")}>
                    {item.overlayText}
                  </span>
                </div>
              )}
            </div>
            {item.label && (
              <div className={getClassName("label")}>{item.label}</div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
};

export const PhotoGridSectionConfig: ComponentConfig<PhotoGridSectionProps> = {
  fields: {
    type: {
      type: "radio",
      label: "Type",
      options: [
        { label: "Gallery", value: "Gallery" },
        { label: "Carousel", value: "Carousel" },
      ],
    },
    heading: {
      type: "text",
      label: "Heading",
    },
    items: {
      type: "array",
      label: "Items",
      min: 1,
      getItemSummary: (item) => item.label || "Item",
      arrayFields: {
        imageUrl: {
          type: "text",
          label: "Image URL",
          ai: {
            instructions:
              "Always use an image URL provided by the getImage tool. Use the business name as the brand, 'PhotoGridSection' as the component, and the item label as additional context.",
            stream: false,
          },
        },
        overlayText: {
          type: "text",
          label: "Overlay Text",
        },
        label: {
          type: "text",
          label: "Label",
        },
      },
      defaultItemProps: {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
    },
  },
  defaultProps: {
    type: "Gallery",
    heading: "Find the best coverage for you",
    items: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        overlayText: "5:2",
        label: "Insurance Name",
      },
    ],
  },
  render: PhotoGridSection,
};

export default PhotoGridSection;
