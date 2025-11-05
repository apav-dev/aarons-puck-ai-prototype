import { tool } from "@puckeditor/cloud-client";
import { tavily } from "@tavily/core";
import z from "zod";
import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getGoogleFonts } from "./google-fonts";

// Initialize Tavily client
const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY || "",
});

// Placeholder image URL to use as fallback
const PLACEHOLDER_IMAGE_URL =
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop";

// Common image file extensions
const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".ico",
];

// Domains known to host direct image URLs
const TRUSTED_IMAGE_DOMAINS = [
  "unsplash.com",
  "images.unsplash.com",
  "pexels.com",
  "images.pexels.com",
  "pixabay.com",
  "cdn.",
  "imgur.com",
  "i.imgur.com",
  "cloudinary.com",
  "res.cloudinary.com",
];

// Domains that are known to NOT provide direct image URLs
const BLOCKED_DOMAINS = [
  "instagram.com",
  "lookaside.instagram.com",
  "facebook.com",
  "fbcdn.net",
  "twitter.com",
  "x.com",
  "t.co",
  "pinterest.com",
  "linkedin.com",
];

/**
 * Validates if a URL is a direct image URL that can be used in an <img> tag
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();

    // Block known non-image domains
    for (const blockedDomain of BLOCKED_DOMAINS) {
      if (hostname.includes(blockedDomain)) {
        return false;
      }
    }

    // Check if URL ends with image extension
    const hasImageExtension = IMAGE_EXTENSIONS.some((ext) =>
      pathname.endsWith(ext)
    );

    if (hasImageExtension) {
      return true;
    }

    // Check for trusted image hosting domains
    const isTrustedDomain = TRUSTED_IMAGE_DOMAINS.some((domain) =>
      hostname.includes(domain)
    );

    if (isTrustedDomain) {
      return true;
    }

    // Check for common image path patterns
    const imagePathPatterns = [
      "/image/",
      "/images/",
      "/img/",
      "/photo/",
      "/photos/",
      "/media/",
      "/picture/",
      "/pictures/",
    ];

    const hasImagePath = imagePathPatterns.some((pattern) =>
      pathname.includes(pattern)
    );

    // Check for image-related query parameters
    const imageQueryParams = ["image", "img", "photo", "media", "picture"];
    const hasImageQueryParam = imageQueryParams.some((param) =>
      urlObj.searchParams.has(param)
    );

    // Accept if it has image path or query param, but also check it's not a social media crawler URL
    if ((hasImagePath || hasImageQueryParam) && !hostname.includes("crawler")) {
      return true;
    }

    return false;
  } catch (error) {
    // Invalid URL format
    return false;
  }
}

// Define the input schema for getImage tool
const getImageInputSchema = z.object({
  brand: z.string().describe("The brand or business name"),
  component: z
    .string()
    .describe("The component type (e.g., Hero, ProductsSection)"),
  entityType: z
    .string()
    .optional()
    .describe("The entity type (e.g., restaurant, hotel, location)"),
  stylePreferences: z
    .string()
    .optional()
    .describe("Additional style or context preferences"),
});

// Export the getImage tool
export const getImage = tool({
  description:
    "Retrieve the best brand image URL for a specified component. Returns a single image URL that is most suitable for the given brand, component type, and context.",
  inputSchema: getImageInputSchema,
  execute: async ({ brand, component, entityType, stylePreferences }) => {
    try {
      // Build search query combining all provided inputs
      const queryParts = [brand, component];
      if (entityType) {
        queryParts.push(entityType);
      }
      if (stylePreferences) {
        queryParts.push(stylePreferences);
      }
      const query = `${queryParts.join(" ")} image`.trim();

      // Perform Tavily search with images included
      const response = await tavilyClient.search(query, {
        include_images: true,
        max_results: 5,
      });

      // Extract images from response
      const images = response.images || [];

      if (images.length > 0) {
        // Iterate through images to find the first valid direct image URL
        for (const image of images) {
          if (image?.url && isValidImageUrl(image.url)) {
            return image.url;
          }
        }
      }

      // No suitable image found, return placeholder
      return PLACEHOLDER_IMAGE_URL;
    } catch (error) {
      console.error("Error fetching image from Tavily:", error);
      // Return placeholder on error
      return PLACEHOLDER_IMAGE_URL;
    }
  },
});

// Cache for getFontFamily tool responses
const fontFamilyCache = new Map<string, string>();

// Define the input schema for getFontFamily tool
const getFontFamilyInputSchema = z.object({
  brand: z.string().describe("The brand or business name"),
  fontType: z
    .enum(["heading", "body"])
    .describe(
      "The type of font needed: 'heading' for headings or 'body' for body text"
    ),
  entityType: z
    .string()
    .optional()
    .describe("The entity type (e.g., restaurant, hotel, location)"),
});

// Export the getFontFamily tool
export const getFontFamily = tool({
  description:
    "Get the closest matching Google Font for a brand. Returns a single font name from available Google Fonts that best matches the brand's style and identity. Use this for selecting fonts that align with brand aesthetics.",
  inputSchema: getFontFamilyInputSchema,
  execute: async ({ brand, fontType, entityType }) => {
    try {
      // Normalize cache key
      const cacheKey = `${brand.toLowerCase().trim()}-${fontType}-${
        entityType?.toLowerCase().trim() || ""
      }`;

      // Check cache first
      if (fontFamilyCache.has(cacheKey)) {
        return fontFamilyCache.get(cacheKey)!;
      }

      // Get available Google Fonts
      const availableFonts = await getGoogleFonts();
      const fontNames = availableFonts.map((f) => f.name);

      // If no fonts available, return a default
      if (fontNames.length === 0) {
        const defaultFont = "Roboto";
        fontFamilyCache.set(cacheKey, defaultFont);
        return defaultFont;
      }

      // Limit font list to top 200 to avoid token limit issues
      // Since fonts are sorted by popularity, this gives us the most relevant options
      const MAX_FONTS_IN_PROMPT = 200;
      const fontsForPrompt = fontNames.slice(0, MAX_FONTS_IN_PROMPT);
      const fontList = fontsForPrompt.join(", ");

      const fontTypeDescription =
        fontType === "heading"
          ? "Display font suitable for headings - can be bold, decorative, or distinctive"
          : "Body font suitable for readable text - should be clean, legible, and professional";

      const prompt = `You are a typography expert. Given a brand name and context, recommend the best Google Font from this list: ${fontList}

Brand: ${brand}
Font Type: ${fontTypeDescription}${
        entityType ? `\nEntity Type: ${entityType}` : ""
      }

Consider:
- For headings: Choose fonts that are distinctive, bold, or match the brand's personality (e.g., modern tech brands might use sans-serif, traditional brands might use serif)
- For body: Choose fonts that are highly readable and professional
- Match the font style to the brand's industry and personality
- Ensure the font name exactly matches one from the list above

Respond with ONLY the font name, nothing else.`;

      // Make LLM call using AI SDK with Gemini
      const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!googleApiKey) {
        console.warn(
          "GOOGLE_GENERATIVE_AI_API_KEY not set, using default font"
        );
        const defaultFont = fontType === "heading" ? "Montserrat" : "Open Sans";
        fontFamilyCache.set(cacheKey, defaultFont);
        return defaultFont;
      }

      const { text } = await generateText({
        model: google("gemini-2.5-flash-lite"),
        system:
          "You are a typography expert. Respond with only the font name from the provided list, nothing else.",
        prompt: prompt,
        temperature: 0.7,
      });

      const selectedFont = text.trim();

      if (!selectedFont) {
        throw new Error("No font returned from LLM");
      }

      // Validate that the selected font is in our FULL list (case-insensitive)
      // Note: We check against the full list, not just the prompt subset
      const normalizedSelected = selectedFont.replace(/^["']|["']$/g, ""); // Remove quotes if present
      const matchedFont = fontNames.find(
        (f) => f.toLowerCase() === normalizedSelected.toLowerCase()
      );

      const finalFont =
        matchedFont || (fontType === "heading" ? "Montserrat" : "Open Sans");

      // Cache the result
      fontFamilyCache.set(cacheKey, finalFont);

      return finalFont;
    } catch (error) {
      console.error("Error in getFontFamily:", error);
      // Return a sensible default based on font type
      const defaultFont = fontType === "heading" ? "Montserrat" : "Open Sans";
      return defaultFont;
    }
  },
});

// Cache for getBrandColors tool responses
const brandColorsCache = new Map<
  string,
  { primary: string; secondary: string; background: string; text: string }
>();

// Helper function to validate hex color
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Define the output schema for getBrandColors tool (for structured output)
const brandColorsOutputSchema = z.object({
  primary: z
    .string()
    .regex(/^#[A-Fa-f0-9]{6}$/, "Must be a valid hex color (e.g., #dc2626)")
    .describe(
      "Main brand color in hex format - used for primary buttons and accents"
    ),
  secondary: z
    .string()
    .regex(/^#[A-Fa-f0-9]{6}$/, "Must be a valid hex color (e.g., #7c3aed)")
    .describe(
      "Complementary/accent color in hex format - used for secondary buttons and accents"
    ),
  background: z
    .string()
    .regex(/^#[A-Fa-f0-9]{6}$/, "Must be a valid hex color (e.g., #ffffff)")
    .describe(
      "Light background color in hex format - used for section/card backgrounds"
    ),
  text: z
    .string()
    .regex(/^#[A-Fa-f0-9]{6}$/, "Must be a valid hex color (e.g., #000000)")
    .describe(
      "Dark text color in hex format - used for all text on light backgrounds"
    ),
});

// Define the input schema for getBrandColors tool
const getBrandColorsInputSchema = z.object({
  brand: z.string().describe("The brand or business name"),
  entityType: z
    .string()
    .optional()
    .describe("The entity type (e.g., restaurant, hotel, location)"),
});

// Export the getBrandColors tool
export const getBrandColors = tool({
  description:
    "Get a 4-color brand palette for a business. Returns an object with primary, secondary, background, and text colors in hex format. Colors are chosen to match the brand's identity and ensure accessibility with proper contrast ratios.",
  inputSchema: getBrandColorsInputSchema,
  execute: async ({ brand, entityType }) => {
    try {
      // Normalize cache key
      const cacheKey = `${brand.toLowerCase().trim()}-${
        entityType?.toLowerCase().trim() || ""
      }`;

      // Check cache first
      if (brandColorsCache.has(cacheKey)) {
        return brandColorsCache.get(cacheKey)!;
      }

      const prompt = `Generate a brand color palette for: ${brand}${
        entityType ? ` (${entityType})` : ""
      }

Requirements:
- Primary: distinct brand color (hex format like #dc2626)
- Secondary: complementary accent color (hex format)
- Background: light color like #ffffff or #f9fafb
- Text: dark color like #000000 or #1f2937
- Colors should match the brand's industry and personality
- Ensure good contrast for accessibility`;

      // Make LLM call using AI SDK with Gemini
      const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!googleApiKey) {
        console.warn(
          "GOOGLE_GENERATIVE_AI_API_KEY not set, using default colors"
        );
        const defaultColors = {
          primary: "#dc2626",
          secondary: "#7c3aed",
          background: "#ffffff",
          text: "#000000",
        };
        brandColorsCache.set(cacheKey, defaultColors);
        return defaultColors;
      }

      // Use structured output with zod schema for reliable parsing
      const { object } = await generateObject({
        model: google("gemini-2.5-flash-lite"),
        system:
          "You are a color expert. Generate brand color palettes with 4 hex colors: primary, secondary, background, and text.",
        prompt: prompt,
        schema: brandColorsOutputSchema,
        schemaName: "BrandColors",
        schemaDescription:
          "A 4-color brand palette with primary, secondary, background, and text colors in hex format",
        temperature: 0.7,
        mode: "json",
        maxOutputTokens: 1000,
      });

      // The structured output ensures we get valid colors
      const finalColors = {
        primary: object.primary,
        secondary: object.secondary,
        background: object.background,
        text: object.text,
      };

      // Cache the result
      brandColorsCache.set(cacheKey, finalColors);

      return finalColors;
    } catch (error) {
      console.error("Error in getBrandColors:", error);
      // Return sensible defaults
      const defaultColors = {
        primary: "#dc2626",
        secondary: "#7c3aed",
        background: "#ffffff",
        text: "#000000",
      };
      return defaultColors;
    }
  },
});
