"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import { Menu, X, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import classnames from "classnames";

const getClassName = getClassNameFactory("NavHeaderSection", styles);

export type NavHeaderSectionProps = {
  logoUrl: string;
  logoText?: string;
  primaryLinks: Array<{
    label: string;
    href: string;
    useFlyout?: boolean;
    flyoutLinks?: Array<{ label: string; href: string }>;
  }>;
  secondaryLinks: Array<{ label: string; href: string }>;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export const NavHeaderSection: PuckComponent<NavHeaderSectionProps> = ({
  logoUrl,
  logoText,
  primaryLinks,
  secondaryLinks,
  primaryCta,
  secondaryCta,
  puck,
}) => {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [primaryNavCollapsed, setPrimaryNavCollapsed] = useState(false);
  const [mobileFlyoutIndex, setMobileFlyoutIndex] = useState<number | null>(
    null,
  );
  const primaryNavRef = useRef<HTMLDivElement>(null);
  const primaryNavListRef = useRef<HTMLUListElement>(null);
  const isEditing = puck?.isEditing ?? false;

  const toggleFlyout = () => {
    setFlyoutOpen((prev) => !prev);
  };

  const closeFlyout = () => setFlyoutOpen(false);

  const showHamburger = primaryNavCollapsed;
  const showFlyout = flyoutOpen;
  const toggleMobileFlyout = (index: number) => {
    setMobileFlyoutIndex((prev) => (prev === index ? null : index));
  };

  // Lock body scroll when flyout is open
  useEffect(() => {
    if (showFlyout) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showFlyout]);

  // Detect overflow: when primary links don't fit, collapse into hamburger
  useEffect(() => {
    const nav = primaryNavRef.current;
    const list = primaryNavListRef.current;
    if (!nav || !list) return;

    const checkOverflow = () => {
      const navWidth = nav.offsetWidth;
      const listWidth = list.scrollWidth;
      setPrimaryNavCollapsed(listWidth > navWidth);
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(nav);

    return () => observer.disconnect();
  }, [primaryLinks]);

  return (
    <header className={getClassName()}>
      <div className={getClassName("inner")}>
        {/* Top row: secondary links (desktop only) */}
        {secondaryLinks.length > 0 && (
          <div className={getClassName("topRow")}>
            {secondaryLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className={getClassName("secondaryLink")}
                tabIndex={isEditing ? -1 : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Bottom row: logo, primary nav or hamburger, CTAs */}
        <div className={getClassName("bottomRow")}>
          <a
            href="/"
            className={getClassName("logoWrapper")}
            tabIndex={isEditing ? -1 : undefined}
          >
            <img
              src={logoUrl}
              alt={logoText || "Logo"}
              className={getClassName("logoIcon")}
            />
            {logoText && (
              <span className={getClassName("logoText")}>{logoText}</span>
            )}
          </a>

          {/* Primary nav: desktop, hidden when collapsed */}
          <nav
            ref={primaryNavRef}
            className={classnames(
              getClassName("primaryNav"),
              showHamburger && getClassName("primaryNav--collapsed"),
            )}
            aria-label="Primary navigation"
          >
            <PopoverGroup
              as="ul"
              ref={primaryNavListRef}
              className={getClassName("primaryNavList")}
            >
              {primaryLinks.map((link, i) => (
                <li key={i} className={getClassName("primaryNavItem")}>
                  {link.useFlyout ? (
                    <Popover className={getClassName("primaryFlyout")}>
                      <PopoverButton
                        className={classnames(
                          getClassName("primaryLink"),
                          getClassName("primaryLinkButton"),
                        )}
                        tabIndex={isEditing ? -1 : undefined}
                      >
                        {link.label}
                        <ChevronDownIcon
                          aria-hidden="true"
                          className={getClassName("primaryLinkIcon")}
                        />
                      </PopoverButton>
                      <PopoverPanel
                        className={getClassName("primaryFlyoutPanel")}
                      >
                        <div className={getClassName("primaryFlyoutContent")}>
                          {(link.flyoutLinks ?? []).map((item, index) => (
                            <a
                              key={index}
                              href={item.href}
                              className={getClassName("primaryFlyoutLink")}
                              tabIndex={isEditing ? -1 : undefined}
                            >
                              {item.label}
                            </a>
                          ))}
                        </div>
                      </PopoverPanel>
                    </Popover>
                  ) : (
                    <a
                      href={link.href}
                      className={getClassName("primaryLink")}
                      tabIndex={isEditing ? -1 : undefined}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </PopoverGroup>
          </nav>

          {/* CTAs: desktop only, always visible when row visible */}
          <div className={getClassName("ctas")}>
            <a
              href={primaryCta.href}
              className={getClassName("primaryCta")}
              tabIndex={isEditing ? -1 : undefined}
            >
              {primaryCta.label}
            </a>
            <a
              href={secondaryCta.href}
              className={getClassName("secondaryCta")}
              tabIndex={isEditing ? -1 : undefined}
            >
              {secondaryCta.label}
            </a>
          </div>

          {/* Hamburger: mobile always, desktop when primary nav collapsed */}
          <button
            type="button"
            onClick={toggleFlyout}
            className={classnames(
              getClassName("hamburger"),
              showHamburger && getClassName("hamburger--visible"),
            )}
            aria-label={showFlyout ? "Close menu" : "Open menu"}
            aria-expanded={showFlyout}
          >
            <Menu size={24} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Flyout overlay */}
      <div
        className={classnames(
          getClassName("flyoutOverlay"),
          showFlyout && getClassName("flyoutOverlay--open"),
        )}
        aria-hidden={!showFlyout}
        onClick={closeFlyout}
      />

      {/* Flyout panel */}
      <div
        className={classnames(
          getClassName("flyout"),
          showFlyout && getClassName("flyout--open"),
        )}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className={getClassName("flyoutHeader")}>
          <a
            href="/"
            className={getClassName("logoWrapper")}
            onClick={closeFlyout}
            tabIndex={isEditing ? -1 : undefined}
          >
            <img
              src={logoUrl}
              alt={logoText || "Logo"}
              className={getClassName("logoIcon")}
            />
            {logoText && (
              <span className={getClassName("logoText")}>{logoText}</span>
            )}
          </a>
          <button
            type="button"
            onClick={closeFlyout}
            className={getClassName("flyoutClose")}
            aria-label="Close menu"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        <div className={getClassName("flyoutBody")}>
          {primaryLinks.length > 0 && (
            <div className={getClassName("flyoutPrimary")}>
              {primaryLinks.map((link, i) => (
                <div key={i} className={getClassName("flyoutPrimaryItem")}>
                  {link.useFlyout ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleMobileFlyout(i)}
                        className={getClassName("flyoutPrimaryButton")}
                        aria-expanded={mobileFlyoutIndex === i}
                      >
                        {link.label}
                        <ChevronRight
                          size={20}
                          className={classnames(
                            getClassName("chevron"),
                            mobileFlyoutIndex === i &&
                              getClassName("chevron--open"),
                          )}
                        />
                      </button>
                      {mobileFlyoutIndex === i && (
                        <div className={getClassName("flyoutPrimarySubmenu")}>
                          {(link.flyoutLinks ?? []).map((item, index) => (
                            <a
                              key={index}
                              href={item.href}
                              className={getClassName("flyoutPrimarySubLink")}
                              onClick={closeFlyout}
                              tabIndex={isEditing ? -1 : undefined}
                            >
                              {item.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      href={link.href}
                      className={getClassName("flyoutPrimaryLink")}
                      onClick={closeFlyout}
                      tabIndex={isEditing ? -1 : undefined}
                    >
                      {link.label}
                      <ChevronRight
                        size={20}
                        className={getClassName("chevron")}
                      />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {secondaryLinks.length > 0 && (
            <div className={getClassName("flyoutSecondary")}>
              {secondaryLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className={getClassName("flyoutSecondaryLink")}
                  onClick={closeFlyout}
                  tabIndex={isEditing ? -1 : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <div className={getClassName("flyoutCtas")}>
            <a
              href={primaryCta.href}
              className={getClassName("flyoutPrimaryCta")}
              onClick={closeFlyout}
              tabIndex={isEditing ? -1 : undefined}
            >
              {primaryCta.label}
            </a>
            <a
              href={secondaryCta.href}
              className={getClassName("flyoutSecondaryCta")}
              onClick={closeFlyout}
              tabIndex={isEditing ? -1 : undefined}
            >
              {secondaryCta.label}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export const NavHeaderSectionConfig: ComponentConfig<NavHeaderSectionProps> = {
  label: "Nav Header",
  fields: {
    logoUrl: {
      type: "text",
      label: "Logo URL",
      ai: {
        instructions:
          "Always use the getImage tool to get a company logo. Use the business name as the brand, 'Logo' as the component, and any available entity type context.",
        stream: false,
      },
    },
    logoText: {
      type: "text",
      label: "Logo text",
      ai: {
        instructions:
          "Optional text shown next to the logo (e.g. brand name). Leave empty to hide.",
      },
    },
    primaryLinks: {
      type: "array",
      label: "Primary header links",
      getItemSummary: (item) => item.label || "Link",
      arrayFields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "URL" },
        useFlyout: {
          type: "radio",
          label: "Use flyout menu",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        flyoutLinks: {
          type: "array",
          label: "Flyout links",
          getItemSummary: (item) => item.label || "Flyout link",
          arrayFields: {
            label: { type: "text", label: "Label" },
            href: { type: "text", label: "URL" },
          },
          defaultItemProps: { label: "Flyout link", href: "#" },
        },
      },
      defaultItemProps: {
        label: "Main Header Link",
        href: "#",
        useFlyout: false,
        flyoutLinks: [],
      },
      ai: {
        instructions:
          "Main navigation links (e.g. Home, About, Services, Products, Contact). Enable a flyout when needed; otherwise shown as a standard link. Shown in the primary row on desktop; collapse into hamburger when they don't fit.",
      },
    },
    secondaryLinks: {
      type: "array",
      label: "Secondary header links",
      getItemSummary: (item) => item.label || "Link",
      arrayFields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "URL" },
      },
      defaultItemProps: { label: "Secondary Header Link", href: "#" },
      ai: {
        instructions:
          "Utility links (e.g. Sign in, Help, Contact). Shown in the top row on desktop; below primary links in the mobile flyout.",
      },
    },
    primaryCta: {
      type: "object",
      label: "Primary CTA",
      objectFields: {
        label: { type: "text", label: "Button label" },
        href: { type: "text", label: "Button URL" },
      },
      ai: {
        instructions:
          "Main call-to-action button (solid style). Remains outside when primary links collapse.",
      },
    },
    secondaryCta: {
      type: "object",
      label: "Secondary CTA",
      objectFields: {
        label: { type: "text", label: "Button label" },
        href: { type: "text", label: "Button URL" },
      },
      ai: {
        instructions:
          "Secondary call-to-action button (outline style). Remains outside when primary links collapse.",
      },
    },
  },
  defaultProps: {
    logoUrl:
      "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=200&h=200&fit=crop",
    logoText: "Logo",
    primaryLinks: [
      { label: "Home", href: "#" },
      {
        label: "Company",
        href: "#",
        useFlyout: true,
        flyoutLinks: [
          { label: "About us", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Support", href: "#" },
          { label: "Press", href: "#" },
          { label: "Blog", href: "#" },
        ],
      },
      { label: "Services", href: "#" },
      { label: "Case Studies", href: "#" },
      { label: "Contact", href: "#" },
    ],
    secondaryLinks: [
      { label: "Secondary Header Link", href: "#" },
      { label: "Secondary Header Link", href: "#" },
      { label: "Secondary Header Link", href: "#" },
      { label: "Secondary Header Link", href: "#" },
      { label: "Secondary Header Link", href: "#" },
    ],
    primaryCta: { label: "Call to Action", href: "#" },
    secondaryCta: { label: "Call to Action", href: "#" },
  },
  ai: {
    instructions:
      "Two-row navigation header with primary and secondary links, logo, and CTAs. Use at the top of the page.",
  },
  render: NavHeaderSection,
};

export default NavHeaderSection;
