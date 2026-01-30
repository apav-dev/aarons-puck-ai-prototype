import React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import classnames from "classnames";
import { Section } from "../../components/Section/index";
import getClassNameFactory from "../../lib/get-class-name-factory";
import styles from "./styles.module.css";
import {
  ProfessionalAboutSectionProps,
  RightColumnSection,
  RightColumnItem,
  AwardItem,
} from "./types";

export type { ProfessionalAboutSectionProps } from "./types";

const getClassName = getClassNameFactory("ProfessionalAboutSection", styles);

const renderRightColumnItems = (
  section: RightColumnSection,
  items: RightColumnItem[],
) => {
  if (section.style === "badges") {
    return (
      <div className={getClassName("badgeList")}>
        {items.map((item, index) => (
          <span key={`${item.text}-${index}`} className={getClassName("badge")}>
            {item.text}
          </span>
        ))}
      </div>
    );
  }

  return (
    <ul className={getClassName("bulletList")}>
      {items.map((item, index) => (
        <li key={`${item.text}-${index}`} className={getClassName("bulletItem")}>
          {item.text}
        </li>
      ))}
    </ul>
  );
};

const renderAwards = (awards: AwardItem[]) => (
  <div className={getClassName("awardsList")}>
    {awards.map((award, index) => (
      <div key={`${award.title}-${index}`} className={getClassName("awardItem")}>
        <div className={getClassName("awardLogo")}>
          <img src={award.imageUrl} alt={award.title} />
        </div>
        <div className={getClassName("awardText")}>
          <h4 className={getClassName("awardTitle")}>{award.title}</h4>
          <p className={getClassName("awardDescription")}>{award.description}</p>
          {award.meta && (
            <p className={getClassName("awardMeta")}>{award.meta}</p>
          )}
        </div>
      </div>
    ))}
  </div>
);

export const ProfessionalAboutSection: PuckComponent<ProfessionalAboutSectionProps> = ({
  heading,
  body,
  showRightColumn,
  rightColumnSections,
  showAwards,
  awardsHeading,
  awards,
  backgroundColor,
  textColor,
  accentColor,
  dividerColor,
  puck,
}) => {
  const hasRightColumn = showRightColumn && rightColumnSections.length > 0;
  const contentClass = classnames(getClassName("content"), {
    [getClassName("content--single")]: !hasRightColumn,
  });

  return (
    <Section
      className={getClassName()}
      style={{
        backgroundColor,
        color: textColor,
        ["--professional-about-accent" as string]: accentColor,
        ["--professional-about-divider" as string]: dividerColor,
      }}
    >
      <div className={contentClass}>
        <div className={getClassName("main")}>
          <h2 className={getClassName("heading")}>{heading}</h2>
          <div className={getClassName("body")}>
            {body.map((paragraph, index) => (
              <p key={`${paragraph.text}-${index}`} className={getClassName("paragraph")}>
                {paragraph.text}
              </p>
            ))}
          </div>
        </div>

        {showRightColumn && (
          <aside className={getClassName("sidebar")}>
            {hasRightColumn ? (
              rightColumnSections.map((section, index) => (
                <div
                  key={`${section.title}-${index}`}
                  className={getClassName("sidebarSection")}
                >
                  <h3 className={getClassName("sidebarTitle")}>{section.title}</h3>
                  {renderRightColumnItems(section, section.items)}
                </div>
              ))
            ) : (
              <p className={getClassName("sidebarPlaceholder")}>
                {puck.isEditing
                  ? "Add items to the right column list."
                  : ""}
              </p>
            )}
          </aside>
        )}
      </div>

      {showAwards && (
        <div className={getClassName("awards")}>
          <h3 className={getClassName("awardsHeading")}>{awardsHeading}</h3>
          {renderAwards(awards)}
        </div>
      )}
    </Section>
  );
};

export const ProfessionalAboutSectionConfig: ComponentConfig<ProfessionalAboutSectionProps> = {
  fields: {
    heading: {
      type: "text",
      label: "Heading",
    },
    body: {
      type: "array",
      label: "Body paragraphs",
      getItemSummary: (item) => item.text || "Paragraph",
      arrayFields: {
        text: {
          type: "textarea",
          label: "Text",
        },
      },
      defaultItemProps: {
        text: "Write your paragraph here.",
      },
    },
    showRightColumn: {
      type: "radio",
      label: "Show right column",
      options: [
        { label: "Show", value: true },
        { label: "Hide", value: false },
      ],
    },
    rightColumnSections: {
      type: "array",
      label: "Right column sections",
      getItemSummary: (item) => item.title || "Section",
      arrayFields: {
        title: {
          type: "text",
          label: "Title",
        },
        style: {
          type: "radio",
          label: "List style",
          options: [
            { label: "Bullets", value: "bullets" },
            { label: "Badges", value: "badges" },
          ],
        },
        items: {
          type: "array",
          label: "Items",
          getItemSummary: (item) => item.text || "Item",
          arrayFields: {
            text: {
              type: "text",
              label: "Text",
            },
          },
          defaultItemProps: {
            text: "List item",
          },
        },
      },
      defaultItemProps: {
        title: "Section title",
        style: "bullets",
        items: [],
      },
    },
    showAwards: {
      type: "radio",
      label: "Show awards",
      options: [
        { label: "Show", value: true },
        { label: "Hide", value: false },
      ],
    },
    awardsHeading: {
      type: "text",
      label: "Awards heading",
    },
    awards: {
      type: "array",
      label: "Awards",
      getItemSummary: (item) => item.title || "Award",
      arrayFields: {
        imageUrl: {
          type: "text",
          label: "Image URL",
          ai: {
            instructions:
              "Always use an image URL provided by the getImage tool. Use the business name as the brand, 'ProfessionalAboutSection' as the component, and the award name as additional context.",
            stream: false,
          },
        },
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        meta: { type: "text", label: "Metadata line" },
      },
      defaultItemProps: {
        imageUrl:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=320&h=160&fit=crop",
        title: "Award title goes here",
        description:
          "Published annually Jan - April. Rankings based on data as of June 30 of prior year.",
        meta: "SHOOK Research",
      },
    },
    backgroundColor: {
      type: "text",
      label: "Background color",
    },
    textColor: {
      type: "text",
      label: "Text color",
    },
    accentColor: {
      type: "text",
      label: "Accent color",
    },
    dividerColor: {
      type: "text",
      label: "Divider color",
    },
  },
  defaultProps: {
    heading: "About Robbie",
    body: [
      {
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
      },
      {
        text: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
      },
      {
        text: "In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
      },
      {
        text: "Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.",
      },
    ],
    showRightColumn: true,
    rightColumnSections: [
      {
        title: "Languages Spoken",
        style: "bullets",
        items: [
          { text: "Auge interdum velit euismod" },
          { text: "Euismod lacinia at quis" },
        ],
      },
      {
        title: "Educations",
        style: "bullets",
        items: [
          { text: "Auge interdum velit euismod" },
          { text: "Euismod lacinia at quis" },
        ],
      },
      {
        title: "Follow Us",
        style: "badges",
        items: [
          { text: "X" },
          { text: "Facebook" },
          { text: "Instagram" },
          { text: "LinkedIn" },
        ],
      },
    ],
    showAwards: true,
    awardsHeading: "Awards",
    awards: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=320&h=160&fit=crop",
        title: "Award title goes here",
        description:
          "Published annually Jan - April. Rankings based on data as of June 30 of prior year.",
        meta: "SHOOK Research",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=320&h=160&fit=crop",
        title: "Award title goes here",
        description:
          "Published annually Feb - April. Rankings based on data as of June 30 - September 30 of prior year.",
        meta: "SHOOK Research",
      },
    ],
    backgroundColor: "#f9f1f1",
    textColor: "#1b1b1b",
    accentColor: "#6b0f1a",
    dividerColor: "#d7c7c7",
  },
  render: ProfessionalAboutSection,
};

export default ProfessionalAboutSection;
