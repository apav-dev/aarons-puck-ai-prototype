/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import { Section } from "../../components/Section/index";
import getClassNameFactory from "../../lib/get-class-name-factory";
import styles from "./styles.module.css";
import { TeamSectionProps } from "./types";
import { CardsVariant } from "./variants/CardsVariant";
import { PortraitVariant } from "./variants/PortraitVariant";
import { AvatarVariant } from "./variants/AvatarVariant";

const getClassName = getClassNameFactory("TeamSection", styles);

export type { TeamSectionProps } from "./types";

export const TeamSection: PuckComponent<TeamSectionProps> = ({
  title,
  subtitle,
  teamMembers,
  variant,
  showDescription,
  showPhone,
  showEmail,
  showSocialLinks,
  showProfileButton,
  avatarSize,
  avatarAlignment,
  puck,
}) => {
  const renderVariant = () => {
    const commonProps = {
      title,
      subtitle,
      teamMembers,
      showDescription,
      showSocialLinks,
      isEditing: puck.isEditing,
    };

    const contactProps = {
      showPhone,
      showEmail,
      showProfileButton,
    };

    switch (variant) {
      case "portrait":
        return <PortraitVariant {...commonProps} {...contactProps} />;
      case "avatar":
        return (
          <AvatarVariant
            {...commonProps}
            {...contactProps}
            avatarSize={avatarSize}
            avatarAlignment={avatarAlignment}
          />
        );
      case "cards":
      default:
        return (
          <CardsVariant
            {...commonProps}
            showPhone={showPhone}
            showEmail={showEmail}
            showProfileButton={showProfileButton}
          />
        );
    }
  };

  return (
    <Section className={getClassName({ [variant]: true })}>
      {renderVariant()}
    </Section>
  );
};

export const TeamSectionConfig: ComponentConfig<TeamSectionProps> = {
  fields: {
    variant: {
      type: "radio",
      label: "Variant",
      options: [
        { label: "Cards", value: "cards" },
        { label: "Portrait", value: "portrait" },
        { label: "Avatar", value: "avatar" },
      ],
    },
    title: {
      type: "text",
      label: "Title",
      ai: {
        instructions:
          "The main heading for the team section. For brick-and-mortar location landing pages, use SEO-friendly, location-specific titles like 'Meet Our Team at [Location Name]', 'Our Financial Advisors at [Location]', or 'Meet the [Location] Team'. Include the location name and service type when available to improve local SEO.",
      },
    },
    subtitle: {
      type: "textarea",
      label: "Subtitle",
      ai: {
        instructions:
          "Optional subtitle or description text that appears below the main title. Use to provide additional context about the team or location.",
      },
    },
    // Visibility options
    showDescription: {
      type: "radio",
      label: "Show Description",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showPhone: {
      type: "radio",
      label: "Show Phone",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showEmail: {
      type: "radio",
      label: "Show Email",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showSocialLinks: {
      type: "radio",
      label: "Show Social Links",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showProfileButton: {
      type: "radio",
      label: "Show Profile Button",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    // Avatar variant specific options
    avatarSize: {
      type: "radio",
      label: "Avatar Size",
      options: [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
      ],
    },
    avatarAlignment: {
      type: "radio",
      label: "Avatar Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
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
            stream: false,
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
        description: {
          type: "textarea",
          label: "Description",
          ai: {
            instructions:
              "A brief bio or description of the team member. Keep it concise (1-2 sentences) and highlight relevant expertise or experience.",
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
          label: "Profile Link Text",
          ai: {
            instructions:
              "Optional custom text for the profile link. Defaults to 'Visit Profile' if not provided. Can use variations like 'Learn More', 'View Profile', or 'Read More'.",
          },
        },
        socialLinks: {
          type: "object",
          label: "Social Links",
          objectFields: {
            twitter: { type: "text", label: "Twitter URL" },
            linkedin: { type: "text", label: "LinkedIn URL" },
            github: { type: "text", label: "GitHub URL" },
          },
        },
      },
      defaultItemProps: {
        name: "First Last",
        role: "Associate Agent",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
        socialLinks: {
          twitter: "",
          linkedin: "",
          github: "",
        },
      },
    },
  },
  defaultProps: {
    variant: "cards",
    title: "Meet Our Team",
    subtitle:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    showDescription: false,
    showPhone: true,
    showEmail: true,
    showSocialLinks: false,
    showProfileButton: true,
    avatarSize: "medium",
    avatarAlignment: "left",
    teamMembers: [
      {
        name: "First Last",
        role: "Associate Agent",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
        socialLinks: {
          twitter: "",
          linkedin: "",
          github: "",
        },
      },
      {
        name: "First Last",
        role: "Associate Agent",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
        socialLinks: {
          twitter: "",
          linkedin: "",
          github: "",
        },
      },
      {
        name: "First Last",
        role: "Associate Agent",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        phoneNumber: "(202) 770-6619",
        emailAddress: "jkelley@company.com",
        profileUrl: "#",
        profileLinkText: "Visit Profile",
        socialLinks: {
          twitter: "",
          linkedin: "",
          github: "",
        },
      },
    ],
  },
  resolveFields: (data) => {
    const { variant } = data.props;
    const baseFields = TeamSectionConfig.fields;

    // Filter fields based on variant
    const filteredFields: typeof baseFields = { ...baseFields };

    // Avatar-specific fields only show for avatar variant
    if (variant !== "avatar") {
      delete filteredFields.avatarSize;
      delete filteredFields.avatarAlignment;
    }

    return filteredFields;
  },
  ai: {
    instructions:
      "Create a team section for a brick-and-mortar location landing page that showcases staff members, advisors, or team members who work at the location. This component has three variants: 'cards' for contact-focused layouts with phone/email/profile buttons, 'portrait' for large vertical photos with social links, and 'avatar' for compact circular avatar layouts. Choose the variant based on the desired visual style and information density. Include location-specific information in titles and roles to improve local SEO.",
  },
  render: TeamSection,
};

export default TeamSection;
