import React from "react";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { TeamMember } from "../types";
import { SocialIcons } from "../SocialIcons";
import { ProfilePlaceholder } from "../ProfilePlaceholder";

const getClassName = getClassNameFactory("TeamSection", styles);

type PortraitVariantProps = {
  title: string;
  subtitle?: string;
  teamMembers: TeamMember[];
  showDescription: boolean;
  showSocialLinks: boolean;
  isEditing: boolean;
};

export const PortraitVariant = ({
  title,
  subtitle,
  teamMembers,
  showDescription,
  showSocialLinks,
  isEditing,
}: PortraitVariantProps) => {
  return (
    <div className={getClassName("portrait")}>
      <div className={getClassName("portraitHeader")}>
        <h2 className={getClassName("title")}>{title}</h2>
        {subtitle && <p className={getClassName("subtitle")}>{subtitle}</p>}
      </div>
      <ul className={getClassName("portraitGrid")}>
        {teamMembers.map((member, index) => (
          <li key={index} className={getClassName("portraitItem")}>
            <div className={getClassName("portraitImageWrapper")}>
              {member.profileImage ? (
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className={getClassName("portraitImage")}
                />
              ) : (
                <ProfilePlaceholder
                  className={getClassName("portraitImagePlaceholder")}
                />
              )}
            </div>
            <div className={getClassName("portraitInfo")}>
              <h4 className={getClassName("portraitName")}>{member.name}</h4>
              <p className={getClassName("portraitRole")}>{member.role}</p>
              {showDescription && member.description && (
                <p className={getClassName("portraitDescription")}>
                  {member.description}
                </p>
              )}
              {showSocialLinks && member.socialLinks && (
                <SocialIcons
                  socialLinks={member.socialLinks}
                  isEditing={isEditing}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
