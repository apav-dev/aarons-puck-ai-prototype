import { tool } from "@puckeditor/cloud-client";
import z from "zod";
import { searchAndExtractFAQs, generateFAQsWithAI } from "./get-faqs-core";

// Re-export core functions for testing
export {
  extractFAQsFromText,
  searchAndExtractFAQs,
  generateFAQsWithAI,
  refineFAQsWithAI,
} from "./get-faqs-core";

// Define the input schema for getFAQs tool
const getFAQsInputSchema = z.object({
  brand: z.string().describe("The brand or business name"),
  locationUrl: z
    .string()
    .url()
    .optional()
    .describe(
      "Optional URL to the brand's location landing page (e.g., https://www.mcdonalds.com/us/en-us/location/...)"
    ),
  entityType: z
    .string()
    .optional()
    .describe("The entity type (e.g., restaurant, hotel, financial services)"),
  location: z
    .string()
    .optional()
    .describe("Location details (e.g., city, address)"),
});

// Export the getFAQs tool
export const getFAQs = tool({
  description:
    "Retrieve FAQs for a brick-and-mortar location. First attempts to extract FAQs from the brand's location landing page if available. If no FAQs are found, generates appropriate FAQs using AI based on the brand, entity type, and location.",
  inputSchema: getFAQsInputSchema,
  execute: async ({ brand, locationUrl, entityType, location }) => {
    try {
      // First, try to extract FAQs from location landing page
      const extractedFAQs = await searchAndExtractFAQs(
        brand,
        locationUrl,
        entityType,
        location
      );

      if (extractedFAQs.length > 0) {
        // Return extracted FAQs (limit to 10)
        return extractedFAQs.slice(0, 10);
      }

      // If no FAQs found, generate them using AI
      const generatedFAQs = await generateFAQsWithAI(
        brand,
        entityType,
        location
      );

      if (generatedFAQs.length > 0) {
        return generatedFAQs;
      }

      // Fallback: return empty array
      return [];
    } catch (error) {
      console.error("Error in getFAQs:", error);
      // Try to generate FAQs as fallback
      try {
        return await generateFAQsWithAI(brand, entityType, location);
      } catch (fallbackError) {
        console.error("Fallback FAQ generation also failed:", fallbackError);
        return [];
      }
    }
  },
});
