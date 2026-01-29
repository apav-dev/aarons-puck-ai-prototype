/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@measured/puck";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import classnames from "classnames";
import { InsightsSectionProps } from "./types";
import { ClassicVariant } from "./variants/ClassicVariant";
import { EditorialVariant } from "./variants/EditorialVariant";
import { ImmersiveVariant } from "./variants/ImmersiveVariant";

const getClassName = getClassNameFactory("InsightsSection", styles);

export type {
  InsightsSectionProps,
  InsightItem,
  InsightVariant,
} from "./types";

export const InsightsSection: PuckComponent<InsightsSectionProps> = ({
  heading,
  subheading,
  subheadingPosition = "above",
  headingAlign = "left",
  insights,
  variant,
  seeAllButton,
  showCategory,
  showDate,
  showDescription,
  showReadMore,
  puck,
}) => {
  const headingBlockClass =
    headingAlign === "center" ? getClassName("headingBlock--center") : "";
  const renderVariant = () => {
    const commonProps = {
      insights,
      showCategory,
      showDate,
      showDescription,
      showReadMore,
      isEditing: puck.isEditing,
    };

    switch (variant) {
      case "editorial":
        return <EditorialVariant {...commonProps} />;
      case "immersive":
        return <ImmersiveVariant {...commonProps} />;
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
        {subheading && subheadingPosition === "above" && (
          <p className={getClassName("subheading")}>{subheading}</p>
        )}
        <h2 className={getClassName("heading")}>{heading}</h2>
        {subheading && subheadingPosition === "below" && (
          <p className={getClassName("subheading")}>{subheading}</p>
        )}
      </div>
      {renderVariant()}
      {seeAllButton.label && seeAllButton.href && (
        <div className={getClassName("seeAllWrapper")}>
          <a
            href={seeAllButton.href}
            className={getClassName("seeAllButton")}
            tabIndex={puck.isEditing ? -1 : undefined}
          >
            {seeAllButton.label}
          </a>
        </div>
      )}
    </Section>
  );
};

export const InsightsSectionConfig: ComponentConfig<InsightsSectionProps> = {
  fields: {
    variant: {
      type: "radio",
      label: "Variant",
      options: [
        { label: "Classic", value: "classic" },
        { label: "Editorial", value: "editorial" },
        { label: "Immersive", value: "immersive" },
      ],
    },
    heading: {
      type: "text",
      label: "Heading",
      ai: {
        instructions:
          "The main heading for the insights section. For brick-and-mortar location landing pages, use SEO-friendly titles like 'Insights & Resources' or 'Helpful Articles from [Business Name]' or 'Local Insights for [Location]'.",
      },
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
    // Visibility options
    showCategory: {
      type: "radio",
      label: "Show Category",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showDate: {
      type: "radio",
      label: "Show Date",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showDescription: {
      type: "radio",
      label: "Show Description",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showReadMore: {
      type: "radio",
      label: "Show Read More Link",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    insights: {
      type: "array",
      label: "Insights",
      min: 1,
      max: 6,
      getItemSummary: (item) => item.title || "Insight",
      arrayFields: {
        title: {
          type: "text",
          label: "Article Title",
          ai: {
            instructions:
              "Create SEO-optimized article titles that are relevant to the brick-and-mortar location and its services. Titles should include location-specific keywords naturally and be compelling to potential customers. Examples: 'Complete Guide to [Service] in [Location]', 'What to Know Before Visiting [Business Name]', '[Business Type] Tips for [Location] Residents'.",
          },
        },
        category: {
          type: "text",
          label: "Category",
          ai: {
            instructions:
              "The category or topic area of the article (e.g., 'Tips', 'Guide', 'News', 'How-To', 'Resources'). Keep it concise, typically one or two words.",
          },
        },
        date: {
          type: "text",
          label: "Date",
          ai: {
            instructions:
              "The publication date of the article in a readable format (e.g., 'August 2, 2022', 'March 15, 2024'). Use a consistent date format across all insights.",
          },
        },
        description: {
          type: "textarea",
          label: "Description",
          ai: {
            instructions:
              "A brief summary or excerpt of the article content, approximately 250-300 characters. This should be SEO-optimized and include relevant keywords related to the location and services. The description should entice readers while providing value and including location-specific context where appropriate.",
          },
        },
        imageUrl: {
          type: "text",
          label: "Image URL",
          ai: {
            instructions:
              "Always use an image URL provided by the getImage tool. Use the business name as the brand, 'InsightsSection' as the component, and the article title or category as additional context. Images should be relevant to the article topic and location.",
            stream: false,
          },
        },
        link: {
          type: "text",
          label: "Article Link",
          ai: {
            instructions:
              "The URL to the full article. Should be a valid, accessible URL to the complete article content.",
          },
        },
        linkText: {
          type: "text",
          label: "Link Text",
          ai: {
            instructions:
              "Optional custom text for the read more link. Defaults to 'Read more' for classic/immersive or 'READ BLOG' for editorial variant.",
          },
        },
      },
      defaultItemProps: {
        title: "Article Name Lorem Ipsum",
        category: "Category",
        date: "August 2, 2022",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters.",
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
        link: "#",
        linkText: "",
      },
    },
    seeAllButton: {
      type: "object",
      label: "See All Button",
      objectFields: {
        label: { type: "text" },
        href: { type: "text" },
      },
    },
  },
  defaultProps: {
    variant: "classic",
    heading: "Insights",
    subheadingPosition: "above",
    headingAlign: "left",
    showCategory: true,
    showDate: true,
    showDescription: true,
    showReadMore: true,
    insights: [
      {
        title: "Article Name Lorem Ipsum",
        category: "Category",
        date: "August 2, 2022",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters.",
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
        link: "#",
        linkText: "",
      },
      {
        title: "Article Name Lorem Ipsum",
        category: "Category",
        date: "August 2, 2022",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters.",
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
        link: "#",
        linkText: "",
      },
      {
        title: "Article Name Lorem Ipsum",
        category: "Category",
        date: "August 2, 2022",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters.",
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
        link: "#",
        linkText: "",
      },
    ],
    seeAllButton: {
      label: "See All Articles",
      href: "#",
    },
  },
  ai: {
    instructions:
      "Create an insights section for a brick-and-mortar location landing page that showcases helpful articles, blog posts, or resources related to the location and its services. This component has three variants: 'classic' for traditional card layouts, 'editorial' for magazine-style horizontal cards with prominent dates, and 'immersive' for full-bleed image cards with text overlay. The section should be SEO-optimized with location-specific content, relevant keywords, and compelling titles that help establish the business as a local authority. Articles should be relevant to potential customers visiting the location page.",
  },
  render: InsightsSection,
};

export default InsightsSection;
