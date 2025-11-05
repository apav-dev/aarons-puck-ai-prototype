/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from "react";
import { ComponentConfig } from "@measured/puck";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { getGoogleFontsUrl } from "../../lib/google-fonts";

const getClassName = getClassNameFactory("PromoSection", styles);

export type PromoSectionProps = {
  title: string;
  description: string;
  ctaButton: {
    label: string;
    href: string;
  };
  appStoreLink?: string;
  googlePlayLink?: string;
  imageUrl: string;
  padding: string;
  headingFont?: string;
  bodyFont?: string;
};

export const PromoSection: PuckComponent<PromoSectionProps> = ({
  title,
  description,
  ctaButton,
  appStoreLink,
  googlePlayLink,
  imageUrl,
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
      <div className={getClassName("inner")}>
        <div className={getClassName("imageWrapper")}>
          <img src={imageUrl} alt={title} className={getClassName("image")} />
        </div>

        <div className={getClassName("content")}>
          <h2 className={getClassName("title")} style={headingStyle}>
            {title}
          </h2>
          <p className={getClassName("description")} style={bodyStyle}>
            {description}
          </p>

          <a
            href={ctaButton.href}
            className={getClassName("ctaButton")}
            style={bodyStyle}
            tabIndex={puck.isEditing ? -1 : undefined}
          >
            {ctaButton.label}
          </a>

          {(appStoreLink || googlePlayLink) && (
            <div className={getClassName("appBadges")}>
              {appStoreLink && (
                <a
                  href={appStoreLink}
                  className={getClassName("appBadge")}
                  tabIndex={puck.isEditing ? -1 : undefined}
                >
                  <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                    <rect width="120" height="40" rx="6" fill="#000" />
                    <path
                      d="M16 12h8v16h-8V12zm8.5 0c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5zm-9 8c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5-4.5-2-4.5-4.5z"
                      fill="#fff"
                    />
                    <text
                      x="30"
                      y="25"
                      fill="#fff"
                      fontSize="10"
                      fontWeight="600"
                    >
                      Download on the
                    </text>
                    <text
                      x="30"
                      y="32"
                      fill="#fff"
                      fontSize="12"
                      fontWeight="700"
                    >
                      App Store
                    </text>
                  </svg>
                </a>
              )}
              {googlePlayLink && (
                <a
                  href={googlePlayLink}
                  className={getClassName("appBadge")}
                  tabIndex={puck.isEditing ? -1 : undefined}
                >
                  <svg width="135" height="40" viewBox="0 0 135 40" fill="none">
                    <rect width="135" height="40" rx="6" fill="#000" />
                    <path
                      d="M8 12l12 7-12 7V12zm14 0v14l10-7-10-7zm-7 7l7 4 7-4-7-4-7 4z"
                      fill="#fff"
                    />
                    <text
                      x="30"
                      y="22"
                      fill="#fff"
                      fontSize="8"
                      fontWeight="600"
                    >
                      GET IT ON
                    </text>
                    <text
                      x="30"
                      y="32"
                      fill="#fff"
                      fontSize="11"
                      fontWeight="700"
                    >
                      Google Play
                    </text>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

export const PromoSectionConfig: ComponentConfig<PromoSectionProps> = {
  fields: {
    title: {
      type: "text",
      label: "Title",
    },
    description: {
      type: "textarea",
      label: "Description",
    },
    ctaButton: {
      type: "object",
      label: "CTA Button",
      objectFields: {
        label: { type: "text" },
        href: { type: "text" },
      },
    },
    appStoreLink: {
      type: "text",
      label: "App Store Link (optional)",
    },
    googlePlayLink: {
      type: "text",
      label: "Google Play Link (optional)",
    },
    imageUrl: {
      type: "text",
      label: "Image URL",
      ai: {
        instructions:
          "Always use an image URL provided by the getImage tool. Use the business name as the brand, 'PromoSection' as the component, and any relevant context from the title or description.",
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
    title: "Featured Promotion",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters",
    ctaButton: {
      label: "Learn More",
      href: "#",
    },
    appStoreLink: "#",
    googlePlayLink: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    padding: "64px",
  },
  render: PromoSection,
};

export default PromoSection;
