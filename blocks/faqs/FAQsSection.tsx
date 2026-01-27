import React, { useState, useEffect } from "react";
import { ComponentConfig } from "@puckeditor/core";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { getGoogleFontsUrl } from "../../lib/google-fonts";
import classnames from "classnames";

const getClassName = getClassNameFactory("FAQsSection", styles);

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQsSectionProps = {
  title: string;
  faqs: FAQItem[];
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

export const FAQsSection: PuckComponent<FAQsSectionProps> = ({
  title,
  faqs,
  padding,
  headingFont,
  bodyFont,
  colors,
  puck,
}) => {
  // In edit mode, show all FAQs expanded. In view mode, start with first expanded
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    puck.isEditing ? null : 0,
  );

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
  const linkColorStyle = colors ? { color: colors.primary } : undefined;
  const chevronColorStyle = colors ? { color: colors.primary } : undefined;

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

  const toggleFAQ = (index: number) => {
    if (puck.isEditing) return;
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Parse answer text to support links (simple markdown-style links: [text](url))
  const parseAnswer = (answer: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(answer)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: answer.slice(lastIndex, match.index),
        });
      }
      // Add the link
      parts.push({
        type: "link",
        text: match[1],
        href: match[2],
      });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < answer.length) {
      parts.push({ type: "text", content: answer.slice(lastIndex) });
    }

    if (parts.length === 0) {
      return [{ type: "text", content: answer }];
    }

    return parts;
  };

  return (
    <Section
      className={getClassName()}
      style={{
        paddingTop: padding,
        paddingBottom: padding,
        ...sectionStyle,
      }}
    >
      <div className={getClassName("inner")}>
        <h2
          className={getClassName("title")}
          style={{ ...headingStyle, ...textColorStyle }}
        >
          {title}
        </h2>
        <div className={getClassName("faqsList")}>
          {faqs.map((faq, index) => {
            // In edit mode, show all FAQs expanded; otherwise use state
            const isExpanded = puck.isEditing || expandedIndex === index;
            const answerParts = parseAnswer(faq.answer);

            return (
              <div key={index} className={getClassName("faqItem")}>
                <button
                  className={getClassName("faqQuestion")}
                  onClick={() => toggleFAQ(index)}
                  style={{ ...bodyStyle, ...textColorStyle }}
                  disabled={puck.isEditing}
                  aria-expanded={isExpanded}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className={getClassName("questionText")}>
                    {faq.question}
                  </span>
                  <svg
                    className={classnames(
                      getClassName("chevron"),
                      isExpanded && styles["FAQsSection-chevron--expanded"],
                    )}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={chevronColorStyle}
                  >
                    {isExpanded ? (
                      <path d="M18 15l-6-6-6 6" />
                    ) : (
                      <path d="M6 9l6 6 6-6" />
                    )}
                  </svg>
                </button>
                {isExpanded && (
                  <div
                    id={`faq-answer-${index}`}
                    className={getClassName("faqAnswer")}
                    style={{ ...bodyStyle, ...textColorStyle }}
                  >
                    {answerParts.map((part, partIndex) => {
                      if (part.type === "link") {
                        return (
                          <a
                            key={partIndex}
                            href={part.href}
                            className={getClassName("answerLink")}
                            style={linkColorStyle}
                            tabIndex={puck.isEditing ? -1 : undefined}
                          >
                            {part.text}
                          </a>
                        );
                      }
                      return <span key={partIndex}>{part.content}</span>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

export const FAQsSectionConfig: ComponentConfig<FAQsSectionProps> = {
  fields: {
    title: {
      type: "text",
      label: "Title",
      ai: {
        instructions:
          "The main heading for the FAQs section. For brick-and-mortar location landing pages, use SEO-friendly titles like 'Frequently Asked Questions about [Business Name]' or 'Common Questions about [Location] [Service Type]'.",
      },
    },
    faqs: {
      type: "array",
      label: "FAQs",
      min: 1,
      getItemSummary: (item) => item.question || "FAQ",
      ai: {
        instructions:
          "CRITICAL: You MUST use the getFAQs tool to populate the FAQs array. Call getFAQs with the business name as the brand parameter, and optionally include entityType and location if available. Use the returned FAQs array directly without modification - do not generate FAQs manually. The getFAQs tool will return an array of FAQ objects with 'question' and 'answer' properties that should be used exactly as returned.",
      },
      arrayFields: {
        question: {
          type: "text",
          label: "Question",
          // ai: {
          //   instructions:
          //     "Create SEO-optimized questions that potential customers would search for about this brick-and-mortar location. Include location-specific questions (e.g., 'Where is [Business Name] located?', 'What are your hours?', 'Do you offer [service] at your [location] location?'). Questions should be natural and match common search queries.",
          // },
        },
        answer: {
          type: "textarea",
          label: "Answer",
          // ai: {
          //   instructions:
          //     "Provide comprehensive, SEO-optimized answers that include location-specific details, business name, services offered, and relevant information. Include internal links to other pages using markdown format: [link text](url). Answers should be detailed enough to satisfy search intent while maintaining readability. Include local keywords naturally.",
          // },
        },
      },
      defaultItemProps: {
        question: "Question Lorem ipsum dolor sit amet?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea [commodo consequat](https://example.com).",
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
    title: "Frequently Asked Questions",
    faqs: [
      {
        question: "Question Lorem ipsum dolor sit amet?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea [commodo consequat](https://example.com).",
      },
      {
        question: "Question Lorem ipsum dolor sit amet?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        question: "Question Lorem ipsum dolor sit amet?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        question: "Question Lorem ipsum dolor sit amet?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        question: "Question Lorem ipsum dolor sit amet?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
    ],
    padding: "64px",
  },
  // ai: {
  //   instructions:
  //     "Aa comprehensive FAQs section for a brick-and-mortar location landing page. Always use the getFAQs tool to retrieve FAQs for the business. The tool will attempt to extract FAQs from the brand's location landing page if a locationUrl is provided, or generate appropriate FAQs using AI based on the brand, entity type, and location. The FAQs should address common customer questions about the location, services, hours, policies, and other relevant information. Questions and answers should be optimized for local SEO and include location-specific details when available.",
  // },
  render: FAQsSection,
};

export default FAQsSection;
