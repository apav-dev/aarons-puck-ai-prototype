/* eslint-disable @next/next/no-img-element */
import React, { useEffect } from "react";
import { ComponentConfig } from "@measured/puck";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { getGoogleFontsUrl } from "../../lib/google-fonts";

const getClassName = getClassNameFactory("TeamSection", styles);

export type TeamMember = {
  profileImage?: string;
  name: string;
  role: string;
  phoneNumber: string;
  emailAddress: string;
  profileUrl: string;
  profileLinkText?: string;
};

export type TeamSectionProps = {
  title: string;
  teamMembers: TeamMember[];
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

export const TeamSection: PuckComponent<TeamSectionProps> = ({
  title,
  teamMembers,
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
  const linkColorStyle = colors ? { color: colors.primary } : undefined;
  const emailColorStyle = colors ? { color: colors.primary } : undefined;

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
      <div className={getClassName("inner")}>
        <h2
          className={getClassName("title")}
          style={{ ...headingStyle, ...textColorStyle }}
        >
          {title}
        </h2>
        <div className={getClassName("grid")}>
          {teamMembers.map((member, index) => (
            <div key={index} className={getClassName("card")}>
              <div className={getClassName("cardHeader")}>
                {member.profileImage ? (
                  <img
                    src={member.profileImage}
                    alt={member.name}
                    className={getClassName("profileImage")}
                  />
                ) : (
                  <div className={getClassName("profilePlaceholder")}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                <div className={getClassName("memberInfo")}>
                  <h3
                    className={getClassName("memberName")}
                    style={{ ...headingStyle, ...textColorStyle }}
                  >
                    {member.name}
                  </h3>
                  <p
                    className={getClassName("memberRole")}
                    style={{ ...bodyStyle, ...textColorStyle }}
                  >
                    {member.role}
                  </p>
                </div>
              </div>
              <div className={getClassName("separator")} />
              <div className={getClassName("contactInfo")}>
                <div
                  className={getClassName("contactItem")}
                  style={{ ...bodyStyle, ...textColorStyle }}
                >
                  <svg
                    className={getClassName("icon")}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={linkColorStyle}
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{member.phoneNumber}</span>
                </div>
                <div
                  className={getClassName("contactItem")}
                  style={{ ...bodyStyle, ...textColorStyle }}
                >
                  <svg
                    className={getClassName("icon")}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={emailColorStyle}
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <a
                    href={`mailto:${member.emailAddress}`}
                    className={getClassName("emailLink")}
                    style={emailColorStyle}
                    tabIndex={puck.isEditing ? -1 : undefined}
                  >
                    {member.emailAddress}
                  </a>
                </div>
              </div>
              <a
                href={member.profileUrl}
                className={getClassName("profileLink")}
                style={{ ...bodyStyle, ...linkColorStyle }}
                tabIndex={puck.isEditing ? -1 : undefined}
              >
                {member.profileLinkText || "Visit Profile"}
                <svg
                  className={getClassName("arrowIcon")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export const TeamSectionConfig: ComponentConfig<TeamSectionProps> = {
  fields: {
    title: {
      type: "text",
      label: "Title",
      ai: {
        instructions:
          "The main heading for the team section. For brick-and-mortar location landing pages, use SEO-friendly, location-specific titles like 'Meet Our Team at [Location Name]', 'Our Financial Advisors at [Location]', or 'Meet the [Location] Team'. Include the location name and service type when available to improve local SEO.",
      },
    },
    teamMembers: {
      type: "array",
      label: "Team Members",
      min: 1,
      getItemSummary: (item) => item.name || "Team Member",
      arrayFields: {
        profileImage: {
          type: "text",
          label: "Profile Image URL",
          ai: {
            instructions:
              "Always use an image URL provided by the getImage tool. Use the business name as the brand, 'TeamSection' as the component, and the team member's name and role as additional context. Use professional headshot images. If not provided, a placeholder icon will be displayed.",
          },
        },
        name: {
          type: "text",
          label: "Name",
          ai: {
            instructions:
              "The full name of the team member. Use proper capitalization (e.g., 'John Smith' not 'john smith'). Include professional credentials if relevant (e.g., 'Jane Doe, CFP').",
          },
        },
        role: {
          type: "text",
          label: "Role/Title",
          ai: {
            instructions:
              "The professional title or role of the team member (e.g., 'Associate Agent', 'Senior Financial Advisor', 'Branch Manager'). Use location-specific or service-specific titles when relevant to improve SEO.",
          },
        },
        phoneNumber: {
          type: "text",
          label: "Phone Number",
          ai: {
            instructions:
              "The team member's direct phone number in a readable format (e.g., '(202) 770-6619'). Use the location's local area code when possible.",
          },
        },
        emailAddress: {
          type: "text",
          label: "Email Address",
          ai: {
            instructions:
              "The team member's professional email address. Use the format provided by the business (e.g., 'jkelley@company.com').",
          },
        },
        profileUrl: {
          type: "text",
          label: "Profile URL",
          ai: {
            instructions:
              "The URL to the team member's detailed profile page. This creates internal linking opportunities for SEO and provides users with more information about the team member. Use relative URLs when possible (e.g., '/team/john-smith') or full URLs if needed.",
          },
        },
        profileLinkText: {
          type: "text",
          label: "Profile Link Text (optional)",
          ai: {
            instructions:
              "Optional custom text for the profile link. Defaults to 'Visit Profile' if not provided. Can use variations like 'Learn More', 'View Profile', or 'Read More'.",
          },
        },
      },
      defaultItemProps: {
        name: "First Last",
        role: "Associate Agent",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
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
          "Always use the getBrandColors tool. Use the business name as the brand and any available entity type context. Ensure colors maintain accessibility with proper contrast ratios. Default to white background (#ffffff) and black text (#000000) if not specified.",
      },
    },
  },
  defaultProps: {
    title: "Meet Our Team",
    teamMembers: [
      {
        name: "First Last",
        role: "Associate Agent",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
      },
      {
        name: "First Last",
        role: "Associate Agent",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
      },
      {
        name: "First Last",
        role: "Associate Agent",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
      },
      {
        name: "First Last",
        role: "Associate Agent",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
      },
      {
        name: "First Last",
        role: "Associate Agent",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
      },
      {
        name: "First Last",
        role: "Associate Agent",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
      },
    ],
    padding: "64px",
  },
  ai: {
    instructions:
      "Create a team section for a brick-and-mortar location landing page that showcases staff members, advisors, or team members who work at the location. This component is particularly useful for businesses like financial advisory firms, real estate offices, insurance agencies, or any service-based business where personal relationships matter. Include location-specific information in titles and roles to improve local SEO. Each team member should have complete contact information and a link to their detailed profile page for internal linking and SEO benefits.",
  },
  render: TeamSection,
};

export default TeamSection;
