import React, { useState } from "react";
import { ComponentConfig } from "@puckeditor/core";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import classnames from "classnames";

const getClassName = getClassNameFactory("FAQsSection", styles);

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQVariant = "classic" | "grid" | "sidebar" | "elevated";

export type FAQsSectionProps = {
  title: string;
  faqs: FAQItem[];
  variant: FAQVariant;
};

// Parse answer text to support links (simple markdown-style links: [text](url))
const parseAnswer = (answer: string) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(answer)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: answer.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: "link",
      text: match[1],
      href: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < answer.length) {
    parts.push({ type: "text", content: answer.slice(lastIndex) });
  }

  if (parts.length === 0) {
    return [{ type: "text", content: answer }];
  }

  return parts;
};

// Render answer with parsed links
const AnswerContent = ({
  answer,
  isEditing,
}: {
  answer: string;
  isEditing: boolean;
}) => {
  const parts = parseAnswer(answer);
  return (
    <>
      {parts.map((part, partIndex) => {
        if (part.type === "link") {
          return (
            <a
              key={partIndex}
              href={part.href}
              className={getClassName("answerLink")}
              tabIndex={isEditing ? -1 : undefined}
            >
              {part.text}
            </a>
          );
        }
        return <span key={partIndex}>{part.content}</span>;
      })}
    </>
  );
};

// Classic variant - Accordion style with expandable items
const ClassicVariant = ({
  title,
  faqs,
  isEditing,
}: {
  title: string;
  faqs: FAQItem[];
  isEditing: boolean;
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    isEditing ? null : 0,
  );

  const toggleFAQ = (index: number) => {
    if (isEditing) return;
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className={getClassName("classic")}>
      <h2 className={getClassName("title")}>{title}</h2>
      <div className={getClassName("classicList")}>
        {faqs.map((faq, index) => {
          const isExpanded = isEditing || expandedIndex === index;
          return (
            <div key={index} className={getClassName("classicItem")}>
              <button
                className={getClassName("classicQuestion")}
                onClick={() => toggleFAQ(index)}
                disabled={isEditing}
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
                >
                  <path d={isExpanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
                </svg>
              </button>
              {isExpanded && (
                <div
                  id={`faq-answer-${index}`}
                  className={getClassName("classicAnswer")}
                >
                  <AnswerContent answer={faq.answer} isEditing={isEditing} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Grid variant - Multi-column grid layout
const GridVariant = ({
  title,
  faqs,
  isEditing,
}: {
  title: string;
  faqs: FAQItem[];
  isEditing: boolean;
}) => {
  return (
    <div className={getClassName("grid")}>
      <div className={getClassName("gridHeader")}>
        <h2 className={getClassName("title")}>{title}</h2>
      </div>
      <div className={getClassName("gridList")}>
        {faqs.map((faq, index) => (
          <div key={index} className={getClassName("gridItem")}>
            <h4 className={getClassName("gridQuestion")}>{faq.question}</h4>
            <p className={getClassName("gridAnswer")}>
              <AnswerContent answer={faq.answer} isEditing={isEditing} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sidebar variant - Title on left, FAQs on right
const SidebarVariant = ({
  title,
  faqs,
  isEditing,
}: {
  title: string;
  faqs: FAQItem[];
  isEditing: boolean;
}) => {
  return (
    <div className={getClassName("sidebar")}>
      <div className={getClassName("sidebarHeader")}>
        <span className={getClassName("sidebarLabel")}>
          Frequently asked questions
        </span>
        <h2 className={getClassName("sidebarTitle")}>{title}</h2>
      </div>
      <div className={getClassName("sidebarContent")}>
        <ul className={getClassName("sidebarList")}>
          {faqs.map((faq, index) => (
            <li key={index} className={getClassName("sidebarItem")}>
              <h4 className={getClassName("sidebarQuestion")}>{faq.question}</h4>
              <p className={getClassName("sidebarAnswer")}>
                <AnswerContent answer={faq.answer} isEditing={isEditing} />
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Elevated variant - Centered card with shadow
const ElevatedVariant = ({
  title,
  faqs,
  isEditing,
}: {
  title: string;
  faqs: FAQItem[];
  isEditing: boolean;
}) => {
  return (
    <div className={getClassName("elevated")}>
      <div className={getClassName("elevatedHeader")}>
        <h2 className={getClassName("title")}>{title}</h2>
      </div>
      <div className={getClassName("elevatedCard")}>
        <div className={getClassName("elevatedGrid")}>
          {faqs.map((faq, index) => (
            <div key={index} className={getClassName("elevatedItem")}>
              <h4 className={getClassName("elevatedQuestion")}>{faq.question}</h4>
              <p className={getClassName("elevatedAnswer")}>
                <AnswerContent answer={faq.answer} isEditing={isEditing} />
              </p>
            </div>
          ))}
        </div>
        <span className={getClassName("elevatedDivider")} />
      </div>
    </div>
  );
};

export const FAQsSection: PuckComponent<FAQsSectionProps> = ({
  title,
  faqs,
  variant,
  puck,
}) => {
  const renderVariant = () => {
    switch (variant) {
      case "grid":
        return (
          <GridVariant title={title} faqs={faqs} isEditing={puck.isEditing} />
        );
      case "sidebar":
        return (
          <SidebarVariant title={title} faqs={faqs} isEditing={puck.isEditing} />
        );
      case "elevated":
        return (
          <ElevatedVariant
            title={title}
            faqs={faqs}
            isEditing={puck.isEditing}
          />
        );
      case "classic":
      default:
        return (
          <ClassicVariant
            title={title}
            faqs={faqs}
            isEditing={puck.isEditing}
          />
        );
    }
  };

  return (
    <Section className={getClassName({ [variant]: true })}>{renderVariant()}</Section>
  );
};

export const FAQsSectionConfig: ComponentConfig<FAQsSectionProps> = {
  fields: {
    variant: {
      type: "radio",
      label: "Variant",
      options: [
        { label: "Classic", value: "classic" },
        { label: "Grid", value: "grid" },
        { label: "Sidebar", value: "sidebar" },
        { label: "Elevated", value: "elevated" },
      ],
    },
    title: {
      type: "text",
      label: "Title",
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
        },
        answer: {
          type: "textarea",
          label: "Answer",
        },
      },
      defaultItemProps: {
        question: "Question Lorem ipsum dolor sit amet?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
    },
  },
  defaultProps: {
    variant: "classic",
    title: "Frequently Asked Questions",
    faqs: [
      {
        question: "What are some random questions to ask?",
        answer:
          "That's exactly the reason we created this random question generator. There are hundreds of random questions to choose from so you're able to find the perfect random question.",
      },
      {
        question: "Do you include common questions?",
        answer:
          "This generator doesn't include most common questions. The thought is that you can come up with common questions on your own so most of the questions in this generator.",
      },
      {
        question: "Can I use this for 21 questions?",
        answer:
          "Yes! There are two ways that you can use this question generator depending on what you're after. You can indicate that you want 21 questions generated.",
      },
      {
        question: "Are these questions for girls or for boys?",
        answer:
          "The questions in this generator are gender neutral and can be used to ask either male or females (or any other gender the person identifies with).",
      },
      {
        question: "What do you wish you had more talent doing?",
        answer:
          "If you've been searching for a way to get random questions, you've landed on the correct webpage. We created the Random Question Generator to ask you as many random questions as your heart desires.",
      },
    ],
  },
  render: FAQsSection,
};

export default FAQsSection;
