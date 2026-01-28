import React from "react";
import classnames from "classnames";
import styles from "../styles.module.css";
import getClassNameFactory from "../../../lib/get-class-name-factory";
import { AvatarAlignment, AvatarSize, TeamMember } from "../types";
import { SocialIcons } from "../SocialIcons";
import { ProfilePlaceholder } from "../ProfilePlaceholder";

const getClassName = getClassNameFactory("TeamSection", styles);

type AvatarVariantProps = {
  title: string;
  subtitle?: string;
  teamMembers: TeamMember[];
  showDescription: boolean;
  showSocialLinks: boolean;
  avatarSize: AvatarSize;
  avatarAlignment: AvatarAlignment;
  isEditing: boolean;
};

export const AvatarVariant = ({
  title,
  subtitle,
  teamMembers,
  showDescription,
  showSocialLinks,
  avatarSize,
  avatarAlignment,
  isEditing,
}: AvatarVariantProps) => {
  const isCentered = avatarAlignment === "center";

  const getSizeClass = () => {
    switch (avatarSize) {
      case "small":
        return styles["TeamSection-avatarImageSmall"];
      case "large":
        return styles["TeamSection-avatarImageLarge"];
      case "medium":
      default:
        return styles["TeamSection-avatarImageMedium"];
    }
  };

  return (
    <div
      className={classnames(
        getClassName("avatar"),
        isCentered && styles["TeamSection-avatarCentered"],
      )}
    >
      <div
        className={classnames(
          getClassName("avatarHeader"),
          isCentered && styles["TeamSection-avatarHeaderCentered"],
        )}
      >
        <h2 className={getClassName("title")}>{title}</h2>
        {subtitle && <p className={getClassName("subtitle")}>{subtitle}</p>}
      </div>
      <ul
        className={classnames(
          getClassName("avatarGrid"),
          isCentered && styles["TeamSection-avatarGridCentered"],
        )}
      >
        {teamMembers.map((member, index) => (
          <li
            key={index}
            className={classnames(
              getClassName("avatarItem"),
              isCentered
                ? styles["TeamSection-avatarItemCentered"]
                : styles["TeamSection-avatarItemLeft"],
            )}
          >
            <div
              className={classnames(
                getClassName("avatarImageWrapper"),
                getSizeClass(),
              )}
            >
              {member.profileImage ? (
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className={getClassName("avatarImage")}
                />
              ) : (
                <ProfilePlaceholder
                  className={getClassName("avatarImagePlaceholder")}
                />
              )}
            </div>
            <div
              className={classnames(
                getClassName("avatarInfo"),
                isCentered && styles["TeamSection-avatarInfoCentered"],
              )}
            >
              <h4 className={getClassName("avatarName")}>{member.name}</h4>
              <p className={getClassName("avatarRole")}>{member.role}</p>
              {showDescription && member.description && (
                <p className={getClassName("avatarDescription")}>
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
