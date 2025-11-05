import { tool } from "@puckeditor/cloud-client";
import { tavily } from "@tavily/core";
import z from "zod";

// Initialize Tavily client
const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY || "",
});

// Placeholder image URL to use as fallback
const PLACEHOLDER_IMAGE_URL =
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop";

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
        // Tavily returns images sorted by relevance, so take the first one
        const bestImage = images[0];

        if (bestImage?.url) {
          return bestImage.url;
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
