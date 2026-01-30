/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@measured/puck";
import { PuckComponent } from "@measured/puck";
import classnames from "classnames";
import { Section } from "../../components/Section/index";
import getClassNameFactory from "../../lib/get-class-name-factory";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("FinancialServicesHero", styles);

export type FinancialServicesHeroVariant =
  | "AdvisorCard"
  | "InstitutionalSplit";

export type FinancialServicesHeroProps = {
  variant?: FinancialServicesHeroVariant;
  imagePosition?: "left" | "right";
  businessNameLabel: string;
  advisorName: string;
  credentials: string;
  roleLine: string;
  licenseLabel: string;
  licenseValue: string;
  rating: number;
  reviewCount: number;
  address: {
    line1: string;
    line2: string;
    city: string;
    region: string;
    postalCode: string;
    country?: string;
  };
  directionsLink: {
    label: string;
    href: string;
  };
  phone: {
    label: string;
    value: string;
    href: string;
  };
  tollFree: {
    label: string;
    value: string;
    href: string;
  };
  email: {
    value: string;
    href: string;
  };
  ctaButton: {
    label: string;
    href: string;
  };
  imageUrl: string;
  imageAlt: string;
};

const variantClassMap: Record<FinancialServicesHeroVariant, string> = {
  AdvisorCard: "advisorCard",
  InstitutionalSplit: "institutionalSplit",
};

const formatAddressLines = (address: FinancialServicesHeroProps["address"]) => {
  const cityRegion = [address.city, address.region].filter(Boolean).join(", ");
  const cityRegionPostal = [cityRegion, address.postalCode]
    .filter(Boolean)
    .join(" ");

  return [
    address.line1,
    address.line2,
    cityRegionPostal,
    address.country,
  ].filter(Boolean);
};

type ContactRowProps = {
  icon: "phone" | "tollFree" | "email";
  label?: string;
  value: string;
  href: string;
};

const ContactRow = ({ icon, label, value, href }: ContactRowProps) => {
  const iconPath =
    icon === "email"
      ? "M4 6h16v12H4z M4 6l8 6 8-6"
      : "M6.6 10.8c1.6 3.2 4.4 6 7.6 7.6l2.6-2.6a1 1 0 0 1 1-.2c1.1.4 2.2.6 3.4.6a1 1 0 0 1 1 1v3.6a1 1 0 0 1-1 1C10.5 22.4 1.6 13.5 1.6 2.8a1 1 0 0 1 1-1H6a1 1 0 0 1 1 1c0 1.2.2 2.3.6 3.4a1 1 0 0 1-.2 1l-2.8 2.8z";

  return (
    <a className={getClassName("contactRow")} href={href}>
      <span className={getClassName("contactIcon")} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d={iconPath} stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      <span className={getClassName("contactText")}>
        {label && <span className={getClassName("contactLabel")}>{label}</span>}
        <span className={getClassName("contactValue")}>{value}</span>
      </span>
    </a>
  );
};

export const FinancialServicesHeroSection: PuckComponent<
  FinancialServicesHeroProps
> = ({
  variant = "AdvisorCard",
  imagePosition = "left",
  businessNameLabel,
  advisorName,
  credentials,
  roleLine,
  licenseLabel,
  licenseValue,
  rating,
  reviewCount,
  address,
  directionsLink,
  phone,
  tollFree,
  email,
  ctaButton,
  imageUrl,
  imageAlt,
  puck,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const variantKey = variantClassMap[variant];
  const layoutPosition = imagePosition === "right" ? "right" : "left";

  const rootClass = getClassName({
    [variantKey]: true,
    "accent-emerald": true,
    [`layout-${layoutPosition}`]: true,
  });

  const addressLines = formatAddressLines(address);
  const phoneHref = phone.href || `tel:${phone.value}`;
  const tollFreeHref = tollFree.href || `tel:${tollFree.value}`;
  const emailHref = email.href || `mailto:${email.value}`;

  return (
    <Section className={rootClass}>
      <div className={getClassName("inner")}>
        <div className={getClassName("media")}>
          <img
            src={imageUrl}
            alt={imageAlt || advisorName}
            className={getClassName("image")}
          />
        </div>
        <div className={getClassName("contentGroup")}>
          <div className={getClassName("contentMain")}>
            <div className={getClassName("identity")}>
              <div className={getClassName("identityTopRow")}>
                <span className={getClassName("businessLabel")}>
                  {businessNameLabel}
                </span>
                <span className={getClassName("credentials")}>
                  {credentials}
                </span>
              </div>
              <h1 className={getClassName("advisorName")}>{advisorName}</h1>
              <p className={getClassName("roleLine")}>{roleLine}</p>
              <div className={getClassName("licenseRow")}>
                <span className={getClassName("licenseLabel")}>
                  {licenseLabel}
                </span>
                <span className={getClassName("licenseValue")}>
                  {licenseValue}
                </span>
              </div>
            </div>

            <div className={getClassName("rating")}>
              <span className={getClassName("ratingValue")}>{rating}</span>
              <div className={getClassName("stars")}>
                {Array.from({ length: fullStars }).map((_, i) => (
                  <svg
                    key={`full-${i}`}
                    className={getClassName("star")}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
                {hasHalfStar && (
                  <svg
                    className={getClassName("star")}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <defs>
                      <linearGradient
                        id={`half-${rating}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="50%" stopColor="currentColor" />
                        <stop
                          offset="50%"
                          stopColor="transparent"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fill={`url(#half-${rating})`}
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                )}
                {Array.from({ length: emptyStars }).map((_, i) => (
                  <svg
                    key={`empty-${i}`}
                    className={classnames(getClassName("star"), "empty")}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className={getClassName("reviewCount")}>
                ({reviewCount} reviews)
              </span>
            </div>

            <div className={getClassName("address")}>
              {addressLines.map((line, index) => (
                <div key={`${line}-${index}`} className={getClassName("addressLine")}>
                  {line}
                </div>
              ))}
              <a
                className={getClassName("directionsLink")}
                href={directionsLink.href}
                tabIndex={puck.isEditing ? -1 : undefined}
              >
                {directionsLink.label}
                <span className={getClassName("directionsArrow")}>›</span>
              </a>
            </div>

            <div className={getClassName("actions")}>
              <a
                href={ctaButton.href}
                className={getClassName("ctaButton")}
                tabIndex={puck.isEditing ? -1 : undefined}
              >
                {ctaButton.label}
              </a>
            </div>
          </div>

          <div className={getClassName("contactColumn")}>
            <ContactRow
              icon="phone"
              label={phone.label}
              value={phone.value}
              href={phoneHref}
            />
            <ContactRow
              icon="tollFree"
              label={tollFree.label}
              value={tollFree.value}
              href={tollFreeHref}
            />
            <ContactRow icon="email" value={email.value} href={emailHref} />
          </div>
        </div>
      </div>
    </Section>
  );
};

export const FinancialServicesHeroSectionConfig: ComponentConfig<
  FinancialServicesHeroProps
> = {
  fields: {
    variant: {
      type: "select",
      label: "Variant",
      options: [
        { label: "Advisor Card", value: "AdvisorCard" },
        { label: "Institutional Split", value: "InstitutionalSplit" },
      ],
      ai: {
        instructions: `Choose the variant:

**Advisor Card**: Professional profile card with photo, identity, rating, address, directions link, contact methods (phone, toll-free, email), and Contact Me CTA. Best for individual advisors, branch managers, or local offices.

**Institutional Split**: Same content as Advisor Card with a firmer layout and stronger separation between profile and contact info. Best for large practices or multi-office firms.`,
        stream: false,
      },
    },
    imagePosition: {
      type: "radio",
      label: "Image position",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
    businessNameLabel: {
      type: "text",
      label: "Business name label",
    },
    advisorName: {
      type: "text",
      label: "Advisor name",
    },
    credentials: {
      type: "text",
      label: "Credentials",
    },
    roleLine: {
      type: "text",
      label: "Role line",
    },
    licenseLabel: {
      type: "text",
      label: "License label",
    },
    licenseValue: {
      type: "text",
      label: "License value",
    },
    rating: {
      type: "number",
      label: "Rating",
      min: 0,
      max: 5,
      step: 0.1,
    },
    reviewCount: {
      type: "number",
      label: "Review count",
      min: 0,
    },
    address: {
      type: "object",
      label: "Address",
      objectFields: {
        line1: { type: "text", label: "Line 1" },
        line2: { type: "text", label: "Line 2" },
        city: { type: "text", label: "City" },
        region: { type: "text", label: "Region" },
        postalCode: { type: "text", label: "Postal code" },
        country: { type: "text", label: "Country" },
      },
    },
    directionsLink: {
      type: "object",
      label: "Directions link",
      objectFields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "Href" },
      },
    },
    phone: {
      type: "object",
      label: "Phone",
      objectFields: {
        label: { type: "text", label: "Label" },
        value: { type: "text", label: "Value" },
        href: { type: "text", label: "Href" },
      },
    },
    tollFree: {
      type: "object",
      label: "Toll-free",
      objectFields: {
        label: { type: "text", label: "Label" },
        value: { type: "text", label: "Value" },
        href: { type: "text", label: "Href" },
      },
    },
    email: {
      type: "object",
      label: "Email",
      objectFields: {
        value: { type: "text", label: "Value" },
        href: { type: "text", label: "Href" },
      },
    },
    ctaButton: {
      type: "object",
      label: "CTA button",
      objectFields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "Href" },
      },
    },
    imageUrl: {
      type: "text",
      label: "Image URL",
      ai: {
        instructions:
          "Always use an image URL provided by the getImage tool. Use the advisor name as the brand and 'Financial Services Hero' as the component.",
        stream: false,
      },
    },
    imageAlt: {
      type: "text",
      label: "Image alt text",
    },
  },
  defaultProps: {
    variant: "AdvisorCard",
    imagePosition: "left",
    businessNameLabel: "Business Name",
    advisorName: "John Smith",
    credentials: "CIMA®, CRPC®",
    roleLine: "Managing Director, Wealth Management",
    licenseLabel: "#NMLS",
    licenseValue: "",
    rating: 4.5,
    reviewCount: 21,
    address: {
      line1: "2145 Pennsylvania Avenue West",
      line2: "Suite 998",
      city: "Washington",
      region: "DC",
      postalCode: "20002",
      country: "",
    },
    directionsLink: {
      label: "Get Directions",
      href: "#",
    },
    phone: {
      label: "Phone",
      value: "(339) 291-5039",
      href: "tel:+13392915039",
    },
    tollFree: {
      label: "Toll-free",
      value: "(800) 291-5039",
      href: "tel:+18002915039",
    },
    email: {
      value: "email@gmail.com",
      href: "mailto:email@gmail.com",
    },
    ctaButton: {
      label: "Contact Me",
      href: "#",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=800&h=600&fit=crop",
    imageAlt: "Advisor profile photo",
  },
  render: FinancialServicesHeroSection,
};

export default FinancialServicesHeroSection;
