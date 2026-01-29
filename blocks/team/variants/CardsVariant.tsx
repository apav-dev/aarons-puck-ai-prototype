import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { TeamMember } from "../types";
import { SocialIcons } from "../SocialIcons";
import { ProfilePlaceholder } from "../ProfilePlaceholder";

const getClassName = getClassNameFactory("TeamSection", styles);

type CardsVariantProps = {
  title: string;
  subtitle?: string;
  teamMembers: TeamMember[];
  showDescription: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showSocialLinks: boolean;
  showProfileButton: boolean;
  isEditing: boolean;
};

export const CardsVariant = ({
  title,
  subtitle,
  teamMembers,
  showDescription,
  showPhone,
  showEmail,
  showSocialLinks,
  showProfileButton,
  isEditing,
}: CardsVariantProps) => {
  return (
    <div className={getClassName("cards")}>
      <div className={getClassName("cardsHeader")}>
        <h2 className={getClassName("title")}>{title}</h2>
        {subtitle && <p className={getClassName("subtitle")}>{subtitle}</p>}
      </div>
      <div className={getClassName("cardsGrid")}>
        {teamMembers.map((member, index) => (
          <div key={index} className={getClassName("card")}>
            <div className={getClassName("cardHeader")}>
              {member.profileImage ? (
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className={getClassName("cardAvatar")}
                />
              ) : (
                <ProfilePlaceholder
                  className={getClassName("cardAvatarPlaceholder")}
                />
              )}
              <div className={getClassName("cardInfo")}>
                <h3 className={getClassName("cardName")}>{member.name}</h3>
                <p className={getClassName("cardRole")}>{member.role}</p>
              </div>
            </div>
            {showDescription && member.description && (
              <p className={getClassName("cardDescription")}>
                {member.description}
              </p>
            )}
            <div className={getClassName("cardSeparator")} />
            <div className={getClassName("cardContact")}>
              {showPhone && member.phoneNumber && (
                <div className={getClassName("cardContactItem")}>
                  <svg
                    className={getClassName("cardIcon")}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{member.phoneNumber}</span>
                </div>
              )}
              {showEmail && member.emailAddress && (
                <div className={getClassName("cardContactItem")}>
                  <svg
                    className={getClassName("cardIcon")}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <a
                    href={`mailto:${member.emailAddress}`}
                    className={getClassName("cardEmailLink")}
                    tabIndex={isEditing ? -1 : undefined}
                  >
                    {member.emailAddress}
                  </a>
                </div>
              )}
            </div>
            {showSocialLinks && member.socialLinks && (
              <SocialIcons
                socialLinks={member.socialLinks}
                isEditing={isEditing}
              />
            )}
            {showProfileButton && member.profileUrl && (
              <a
                href={member.profileUrl}
                className={getClassName("cardButton")}
                tabIndex={isEditing ? -1 : undefined}
              >
                {member.profileLinkText || "Visit Profile"}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
