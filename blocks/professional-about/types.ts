export type RightColumnItem = {
  text: string;
};

export type RightColumnSection = {
  title: string;
  style?: "bullets" | "badges";
  items: RightColumnItem[];
};

export type AwardItem = {
  imageUrl: string;
  title: string;
  description: string;
  meta?: string;
};

export type ProfessionalAboutSectionProps = {
  heading: string;
  body: { text: string }[];
  showRightColumn: boolean;
  rightColumnSections: RightColumnSection[];
  showAwards: boolean;
  awardsHeading: string;
  awards: AwardItem[];
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  dividerColor: string;
};
