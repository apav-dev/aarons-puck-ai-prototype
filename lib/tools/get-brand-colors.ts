import { tool } from "@puckeditor/cloud-client";
import z from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

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








