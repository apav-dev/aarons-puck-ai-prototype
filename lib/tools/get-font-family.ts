import { tool } from "@puckeditor/cloud-client";
import z from "zod";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getGoogleFonts } from "../google-fonts";

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

