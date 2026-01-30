import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import classnames from "classnames";
import { AboutColumnsSectionProps } from "./types";
import { ClassicVariant } from "./variants/ClassicVariant";
import { CardsVariant } from "./variants/CardsVariant";
import { StackedVariant } from "./variants/StackedVariant";
import { BorderedVariant } from "./variants/BorderedVariant";

const getClassName = getClassNameFactory("AboutColumnsSection", styles);

export type {
  AboutColumnsSectionProps,
  ColumnItem,
  AboutColumnsVariant,
} from "./types";

export const AboutColumnsSection: PuckComponent<AboutColumnsSectionProps> = ({
  tagline,
  heading,
  subheading,
  subheadingPosition = "above",
  headingAlign = "left",
  columns,
  desktopColumns,
  variant,
  puck,
}) => {
  const headingBlockClass =
    headingAlign === "center" ? getClassName("headingBlock--center") : "";

  const renderVariant = () => {
    const commonProps = {
      columns,
      desktopColumns,
      isEditing: puck.isEditing,
    };

    switch (variant) {
      case "cards":
        return <CardsVariant {...commonProps} />;
      case "stacked":
        return <StackedVariant {...commonProps} />;
      case "bordered":
        return <BorderedVariant {...commonProps} />;
      case "classic":
      default:
        return <ClassicVariant {...commonProps} />;
    }
  };

  return (
    <Section className={getClassName({ [variant]: true })}>
      <div
        className={classnames(getClassName("headingBlock"), headingBlockClass)}
      >
        {tagline && (
          <p className={getClassName("tagline")}>{tagline}</p>
        )}
        {subheading && subheadingPosition === "above" && (
          <p className={getClassName("subheading")}>{subheading}</p>
        )}
        <h2 className={getClassName("heading")}>{heading}</h2>
        {subheading && subheadingPosition === "below" && (
          <p className={getClassName("subheading")}>{subheading}</p>
        )}
      </div>
      {renderVariant()}
    </Section>
  );
};

export const AboutColumnsSectionConfig: ComponentConfig<AboutColumnsSectionProps> = {
  fields: {
    variant: {
      type: "radio",
      label: "Variant",
      options: [
        { label: "Classic", value: "classic" },
        { label: "Cards", value: "cards" },
        { label: "Stacked", value: "stacked" },
        { label: "Bordered", value: "bordered" },
      ],
    },
    tagline: {
      type: "text",
      label: "Tagline",
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
    desktopColumns: {
      type: "radio",
      label: "Desktop columns",
      options: [
        { label: "2 columns", value: 2 },
        { label: "3 columns", value: 3 },
      ],
    },
    columns: {
      type: "array",
      label: "Columns",
      getItemSummary: (item) => item.title || "Column",
      arrayFields: {
        title: {
          type: "text",
          label: "Title",
        },
        content: {
          type: "textarea",
          label: "Content",
        },
      },
      defaultItemProps: {
        title: "Column Title",
        content: "Column content goes here. You can add multiple paragraphs by separating them with line breaks.",
      },
    },
  },
  defaultProps: {
    variant: "classic",
    heading: "Who we are, what we do",
    tagline: "LEARN MORE",
    subheadingPosition: "above",
    headingAlign: "left",
    desktopColumns: 2,
    columns: [
      {
        title: "About us",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\nOur mission is to deliver value to our clients through quality service, innovation, and a commitment to long-term success.",
      },
      {
        title: "Our services",
        content: "We offer personalized guidance tailored to your unique goals and circumstances. Our team works with you to develop a plan that addresses your needs today and helps you prepare for tomorrow.\n\nWe take a holistic approach, considering all aspects of your situation to help you make informed decisions and achieve your objectives.",
      },
    ],
  },
  ai: {
    instructions:
      "Create an about/info columns section that displays information in a clean, organized grid layout. The section includes an optional tagline, main heading, optional subheading, and a configurable number of columns (2 or 3 on desktop, always 1 on mobile). Each column has a title and content. The component supports multiple visual variants: 'classic' for a dark full-bleed background with white text, 'cards' for card-wrapped columns on a light background, 'stacked' for a vertical layout with dividers, and 'bordered' for columns with accent borders. Use this section to present company information, services, values, or any structured content that benefits from a multi-column layout.",
  },
  render: AboutColumnsSection,
};

export default AboutColumnsSection;
