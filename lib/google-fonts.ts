// Cache for Google Fonts list
let fontsCache: Array<{ name: string; value: string }> | null = null;
let fontsFetchPromise: Promise<Array<{ name: string; value: string }>> | null =
  null;

// Fallback curated list of popular Google Fonts
const FALLBACK_FONTS: Array<{ name: string; value: string }> = [
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Lato", value: "Lato" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Poppins", value: "Poppins" },
  { name: "Playfair Display", value: "Playfair Display" },
  { name: "Merriweather", value: "Merriweather" },
  { name: "Oswald", value: "Oswald" },
  { name: "Raleway", value: "Raleway" },
  { name: "Source Sans Pro", value: "Source Sans Pro" },
  { name: "Ubuntu", value: "Ubuntu" },
  { name: "Dancing Script", value: "Dancing Script" },
  { name: "Inter", value: "Inter" },
  { name: "Nunito", value: "Nunito" },
  { name: "PT Sans", value: "PT Sans" },
  { name: "Roboto Condensed", value: "Roboto Condensed" },
  { name: "Bebas Neue", value: "Bebas Neue" },
  { name: "Lora", value: "Lora" },
  { name: "Pacifico", value: "Pacifico" },
  { name: "Crimson Text", value: "Crimson Text" },
];

/**
 * Fetches Google Fonts list from Google Fonts API
 */
async function fetchGoogleFonts(): Promise<
  Array<{ name: string; value: string }>
> {
  const apiKey = process.env.GOOGLE_FONTS_API_KEY;

  if (!apiKey) {
    console.warn("GOOGLE_FONTS_API_KEY not set, using fallback font list");
    return FALLBACK_FONTS;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`
    );

    if (!response.ok) {
      throw new Error(`Google Fonts API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Invalid response format from Google Fonts API");
    }

    // Transform API response to our format
    const fonts = data.items.map((font: { family: string }) => ({
      name: font.family,
      value: font.family, // Use family name as value (already URL-safe)
    }));

    return fonts;
  } catch (error) {
    console.error("Error fetching Google Fonts:", error);
    return FALLBACK_FONTS;
  }
}

/**
 * Gets the list of available Google Fonts
 * Caches the result in memory to avoid repeated API calls
 */
export async function getGoogleFonts(): Promise<
  Array<{ name: string; value: string }>
> {
  // Return cached result if available
  if (fontsCache) {
    return fontsCache;
  }

  // If there's already a fetch in progress, wait for it
  if (fontsFetchPromise) {
    const result = await fontsFetchPromise;
    fontsCache = result;
    return result;
  }

  // Start new fetch
  fontsFetchPromise = fetchGoogleFonts();
  const result = await fontsFetchPromise;
  fontsCache = result;
  fontsFetchPromise = null;

  return result;
}

/**
 * Formats a font name for use in Google Fonts API URL
 * Replaces spaces with + and handles special characters
 */
export function formatFontNameForUrl(fontName: string): string {
  return encodeURIComponent(fontName);
}

/**
 * Generates a Google Fonts CSS link URL for a font
 */
export function getGoogleFontsUrl(
  fontName: string,
  weights: number[] = [400, 500, 600, 700]
): string {
  const formattedName = formatFontNameForUrl(fontName);
  const weightsParam = weights.join(";");
  return `https://fonts.googleapis.com/css2?family=${formattedName}:wght@${weightsParam}&display=swap`;
}
