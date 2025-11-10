/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@measured/puck";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("HeaderSection", styles);

export type HeaderSectionProps = {
  logoUrl: string;
  // links: Array<{
  //   label: string;
  //   href: string;
  // }>;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
};

export const HeaderSection: PuckComponent<HeaderSectionProps> = ({
  logoUrl,
  // links,
  primaryCta,
  secondaryCta,
  puck,
}) => {
  return (
    <header className={getClassName()}>
      <div className={getClassName("inner")}>
        <div className={getClassName("logoWrapper")}>
          <img src={logoUrl} alt="Logo" className={getClassName("logo")} />
        </div>

        {/* <nav className={getClassName("nav")}>
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={getClassName("navLink")}
              tabIndex={puck.isEditing ? -1 : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav> */}

        <div className={getClassName("ctas")}>
          <a
            href={primaryCta.href}
            className={getClassName("primaryCta")}
            tabIndex={puck.isEditing ? -1 : undefined}
          >
            {primaryCta.label}
          </a>
          <a
            href={secondaryCta.href}
            className={getClassName("secondaryCta")}
            tabIndex={puck.isEditing ? -1 : undefined}
          >
            {secondaryCta.label}
          </a>
        </div>
      </div>
    </header>
  );
};

export const HeaderSectionConfig: ComponentConfig<HeaderSectionProps> = {
  fields: {
    logoUrl: {
      type: "text",
      label: "Logo URL",
      ai: {
        instructions:
          "Always use the getImage tool to get a company logo that belongs in a site. Use the business name as the brand, 'Logo' as the component, and any available entity type context.",
        stream: false,
      },
    },
    // links: {
    //   type: "array",
    //   label: "Navigation Links",
    //   getItemSummary: (item) => item.label || "Link",
    //   arrayFields: {
    //     label: { type: "text", label: "Link Label" },
    //     href: { type: "text", label: "Link URL" },
    //   },
    //   defaultItemProps: {
    //     label: "",
    //     href: "#",
    //   },
    //   ai: {
    //     instructions:
    //       "Create navigation links that make sense for the brand. Consider common navigation patterns like Home, About, Services, Products, Contact, etc. based on the business type and entity type.",
    //   },
    // },
    primaryCta: {
      type: "object",
      label: "Primary CTA",
      objectFields: {
        label: { type: "text", label: "Button Label" },
        href: { type: "text", label: "Button URL" },
      },
    },
    secondaryCta: {
      type: "object",
      label: "Secondary CTA",
      objectFields: {
        label: { type: "text", label: "Button Label" },
        href: { type: "text", label: "Button URL" },
      },
    },
  },
  defaultProps: {
    logoUrl:
      "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=200&h=200&fit=crop",
    // links: [
    //   { label: "Main Header Link", href: "#" },
    //   { label: "Main Header Link", href: "#" },
    //   { label: "Main Header Link", href: "#" },
    //   { label: "Main Header Link", href: "#" },
    //   { label: "Main Header Link", href: "#" },
    // ],
    primaryCta: {
      label: "Call to Action",
      href: "#",
    },
    secondaryCta: {
      label: "Call to Action",
      href: "#",
    },
  },
  ai: {
    instructions: "This section should go at the top of the page.",
  },
  render: HeaderSection,
};

export default HeaderSection;
