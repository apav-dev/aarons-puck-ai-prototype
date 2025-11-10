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

// Non-image file extensions that should be blocked even if they're in image paths
const BLOCKED_EXTENSIONS = [
  ".ashx", // ASP.NET handler files
  ".aspx", // ASP.NET pages
  ".php", // PHP scripts
  ".html", // HTML pages
  ".htm", // HTML pages
  ".js", // JavaScript files
  ".css", // CSS files
  ".xml", // XML files
  ".json", // JSON files
  ".pdf", // PDF files
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

    // Block URLs ending with non-image extensions (even if they're in image paths)
    const hasBlockedExtension = BLOCKED_EXTENSIONS.some((ext) =>
      pathname.endsWith(ext)
    );
    if (hasBlockedExtension) {
      return false;
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
