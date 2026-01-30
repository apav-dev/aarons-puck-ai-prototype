import { useEffect, useMemo, useState } from "react";
import { createUsePuck } from "@puckeditor/core";
import { Palette } from "lucide-react";
import { getGoogleFonts } from "../lib/google-fonts";
import { DEFAULT_THEME, mergeTheme, PageTheme } from "../lib/theme";
import styles from "./ThemePlugin.module.css";

const usePuck = createUsePuck();

const labelMap: Record<keyof PageTheme["colors"], string> = {
  primary: "Primary",
  secondary: "Secondary",
  tertiary: "Tertiary",
  quaternary: "Quaternary",
};

const normalizeHex = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("#")) {
    return `#${trimmed}`;
  }
  return trimmed;
};

const ThemePluginPanel = () => {
  const data = usePuck((s) => s.appState.data);
  const dispatch = usePuck((s) => s.dispatch);
  const [fonts, setFonts] = useState<Array<{ name: string; value: string }>>(
    []
  );

  const theme = useMemo<PageTheme>(() => {
    return mergeTheme(data?.root?.props?.theme);
  }, [data]);

  useEffect(() => {
    let active = true;
    getGoogleFonts().then((items) => {
      if (active) setFonts(items);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!data?.root?.props?.theme) {
      const nextData = {
        ...(data || { content: [], root: { props: {} }, zones: {} }),
        root: {
          ...(data?.root || {}),
          props: {
            ...(data?.root?.props || {}),
            theme: DEFAULT_THEME,
          },
        },
      };
      dispatch({ type: "setData", data: nextData as Parameters<typeof dispatch>[0] extends { data: infer D } ? D : never });
    }
  }, [data, dispatch]);

  const updateTheme = (nextTheme: PageTheme) => {
    const nextData = {
      ...(data || { content: [], root: { props: {} }, zones: {} }),
      root: {
        ...(data?.root || {}),
        props: {
          ...(data?.root?.props || {}),
          theme: nextTheme,
        },
      },
    };
    dispatch({ type: "setData", data: nextData as Parameters<typeof dispatch>[0] extends { data: infer D } ? D : never });
  };

  const updateColor = (key: keyof PageTheme["colors"], value: string) => {
    updateTheme({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value,
      },
    });
  };

  const updateFont = (key: keyof PageTheme["fonts"], value: string) => {
    updateTheme({
      ...theme,
      fonts: {
        ...theme.fonts,
        [key]: value,
      },
    });
  };

  return (
    <div className={styles.ThemePlugin}>
      <section className={styles["ThemePlugin-section"]}>
        <h3 className={styles["ThemePlugin-sectionTitle"]}>Palette</h3>
        {(Object.keys(theme.colors) as Array<keyof PageTheme["colors"]>).map(
          (colorKey) => (
            <label key={colorKey} className={styles["ThemePlugin-row"]}>
              <span className={styles["ThemePlugin-rowLabel"]}>
                {labelMap[colorKey]}
              </span>
              <div className={styles["ThemePlugin-inputGroup"]}>
                <input
                  type="color"
                  className={styles["ThemePlugin-colorInput"]}
                  value={theme.colors[colorKey]}
                  onChange={(event) =>
                    updateColor(colorKey, event.target.value)
                  }
                />
                <input
                  type="text"
                  className={styles["ThemePlugin-textInput"]}
                  value={theme.colors[colorKey]}
                  onChange={(event) =>
                    updateColor(colorKey, normalizeHex(event.target.value))
                  }
                />
              </div>
            </label>
          )
        )}
      </section>

      <section className={styles["ThemePlugin-section"]}>
        <h3 className={styles["ThemePlugin-sectionTitle"]}>Typography</h3>
        <label className={styles["ThemePlugin-row"]}>
          <span className={styles["ThemePlugin-rowLabel"]}>Heading</span>
          <select
            className={styles["ThemePlugin-select"]}
            value={theme.fonts.heading}
            onChange={(event) => updateFont("heading", event.target.value)}
          >
            {fonts.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles["ThemePlugin-row"]}>
          <span className={styles["ThemePlugin-rowLabel"]}>Body</span>
          <select
            className={styles["ThemePlugin-select"]}
            value={theme.fonts.body}
            onChange={(event) => updateFont("body", event.target.value)}
          >
            {fonts.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <button
        type="button"
        className={styles["ThemePlugin-resetButton"]}
        onClick={() => updateTheme(DEFAULT_THEME)}
      >
        Reset to defaults
      </button>
    </div>
  );
};

const themePlugin = {
  name: "theme",
  label: "Theme",
  icon: <Palette />,
  render: ThemePluginPanel,
};

export default themePlugin;
