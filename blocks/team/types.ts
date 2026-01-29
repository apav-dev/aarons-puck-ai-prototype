export type SocialLinks = {
  twitter?: string;
  linkedin?: string;
  github?: string;
};

export type TeamMember = {
  profileImage?: string;
  name: string;
  role: string;
  description?: string;
  phoneNumber?: string;
  emailAddress?: string;
  profileUrl?: string;
  profileLinkText?: string;
  socialLinks?: SocialLinks;
};

export type TeamVariant = "cards" | "portrait" | "avatar";
export type AvatarSize = "small" | "medium" | "large";
export type AvatarAlignment = "left" | "center";

export type TeamSectionProps = {
  title: string;
  subtitle?: string;
  subheading?: string;
  subheadingPosition?: "above" | "below";
  headingAlign?: "left" | "center";
  teamMembers: TeamMember[];
  variant: TeamVariant;
  // Visibility options
  showDescription: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showSocialLinks: boolean;
  showProfileButton: boolean;
  // Avatar variant specific
  avatarSize: AvatarSize;
  avatarAlignment: AvatarAlignment;
};
