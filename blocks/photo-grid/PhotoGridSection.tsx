/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@measured/puck";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("PhotoGridSection", styles);

export type PhotoGridItem = {
  imageUrl: string;
  overlayText: string;
  label: string;
};

export type PhotoGridSectionProps = {
  heading: string;
  items: PhotoGridItem[];
};

export const PhotoGridSection: PuckComponent<PhotoGridSectionProps> = ({
  heading,
  items,
}) => {
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
