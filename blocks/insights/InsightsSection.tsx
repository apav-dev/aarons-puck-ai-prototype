/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from "react";
import { ComponentConfig } from "@measured/puck";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { getGoogleFontsUrl } from "../../lib/google-fonts";

const getClassName = getClassNameFactory("InsightsSection", styles);

export type InsightItem = {
  title: string;
  category: string;
  date: string;
  description: string;
  imageUrl: string;
  link: string;
};

export type InsightsSectionProps = {
  heading: string;
  insights: InsightItem[];
  seeAllButton: {
    label: string;
    href: string;
  };
  padding: string;
  headingFont?: string;
  bodyFont?: string;
  colors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
};

export const InsightsSection: PuckComponent<InsightsSectionProps> = ({
  heading,
  insights,
  seeAllButton,
  padding,
  headingFont,
  bodyFont,
  colors,
  puck,
}) => {
  // Prepare font styles
  const headingStyle = headingFont
    ? { fontFamily: `"${headingFont}", sans-serif` }
    : undefined;
  const bodyStyle = bodyFont
    ? { fontFamily: `"${bodyFont}", sans-serif` }
    : undefined;

  // Prepare color styles
  const sectionStyle = colors
    ? { backgroundColor: colors.background }
    : undefined;
  const textColorStyle = colors ? { color: colors.text } : undefined;
  const titleColorStyle = colors ? { color: colors.primary } : undefined;
  const readMoreColorStyle = colors ? { color: colors.primary } : undefined;
  const seeAllButtonStyle = colors
    ? {
        color: colors.secondary,
        borderColor: colors.secondary,
      }
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
      style={{
        paddingTop: padding,
        paddingBottom: padding,
        ...sectionStyle,
      }}
    >
      <h2
        className={getClassName("heading")}
        style={{ ...headingStyle, ...textColorStyle }}
      >
        {heading}
      </h2>
      <div className={getClassName("grid")}>
        {insights.map((insight, index) => (
          <article key={index} className={getClassName("card")}>
            <div className={getClassName("imageWrapper")}>
              <img
                src={insight.imageUrl}
                alt={insight.title}
                className={getClassName("image")}
              />
            </div>
            <div className={getClassName("cardContent")}>
              <div
                className={getClassName("metadata")}
                style={{ ...bodyStyle, ...textColorStyle }}
              >
                <span className={getClassName("category")}>
                  {insight.category}
                </span>
                <span className={getClassName("separator")}>|</span>
                <span className={getClassName("date")}>{insight.date}</span>
              </div>
              <h3
                className={getClassName("title")}
                style={{ ...headingStyle, ...titleColorStyle }}
              >
                {insight.title}
              </h3>
              <p
                className={getClassName("description")}
                style={{ ...bodyStyle, ...textColorStyle }}
              >
                {insight.description}
              </p>
              <a
                href={insight.link}
                className={getClassName("readMore")}
                style={readMoreColorStyle}
                tabIndex={puck.isEditing ? -1 : undefined}
              >
                Read more
                <svg
                  className={getClassName("arrow")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </article>
        ))}
      </div>
      {seeAllButton.label && seeAllButton.href && (
        <div className={getClassName("seeAllWrapper")}>
          <a
            href={seeAllButton.href}
            className={getClassName("seeAllButton")}
            style={seeAllButtonStyle}
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
    heading: {
      type: "text",
      label: "Heading",
      ai: {
        instructions:
          "The main heading for the insights section. For brick-and-mortar location landing pages, use SEO-friendly titles like 'Insights & Resources' or 'Helpful Articles from [Business Name]' or 'Local Insights for [Location]'.",
      },
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
    colors: {
      type: "object",
      label: "Brand Colors",
      objectFields: {
        primary: { type: "text", label: "Primary Color" },
        secondary: { type: "text", label: "Secondary Color" },
        background: { type: "text", label: "Background Color" },
        text: { type: "text", label: "Text Color" },
      },
      ai: {
        instructions:
          "Always use the getBrandColors tool. Use the business name as the brand and any available entity type context. Ensure colors maintain accessibility with proper contrast ratios.",
      },
    },
  },
  defaultProps: {
    heading: "Insights",
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
      },
    ],
    seeAllButton: {
      label: "See All Articles",
      href: "#",
    },
    padding: "64px",
  },
  ai: {
    instructions:
      "Create an insights section for a brick-and-mortar location landing page that showcases helpful articles, blog posts, or resources related to the location and its services. The section should be SEO-optimized with location-specific content, relevant keywords, and compelling titles that help establish the business as a local authority. Articles should be relevant to potential customers visiting the location page.",
  },
  render: InsightsSection,
};

export default InsightsSection;
