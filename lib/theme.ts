export type ThemeColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
};

export type ThemeFonts = {
  heading: string;
  body: string;
};

export type PageTheme = {
  colors: ThemeColors;
  fonts: ThemeFonts;
};

export const DEFAULT_THEME: PageTheme = {
  colors: {
    primary: "#dc2626",
    secondary: "#0f172a",
    tertiary: "#ffffff",
    quaternary: "#f3f4f6",
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
  },
};

export const mergeTheme = (theme?: Partial<PageTheme>): PageTheme => {
  return {
    colors: {
      ...DEFAULT_THEME.colors,
      ...(theme?.colors || {}),
    },
    fonts: {
      ...DEFAULT_THEME.fonts,
      ...(theme?.fonts || {}),
    },
  };
};
