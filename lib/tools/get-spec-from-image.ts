import { tool } from "@puckeditor/cloud-client";
import z from "zod";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import * as fs from "fs";
import * as path from "path";

// Define the input schema for getSpecFromImage tool
const getSpecFromImageInputSchema = z.object({
  imagePath: z
    .string()
    .describe(
      "Path to the local image file. Can be relative (e.g., 'screenshots/component.png') or absolute. If relative, it will be resolved from the project root."
    ),
});

// Helper function to resolve image path
function resolveImagePath(imagePath: string): string {
  // If it's already an absolute path, return it
  if (path.isAbsolute(imagePath)) {
    return imagePath;
  }

  // If it starts with screenshots/, resolve from project root
  if (imagePath.startsWith("screenshots/")) {
    return path.join(process.cwd(), imagePath);
  }

  // Otherwise, resolve from project root
  return path.join(process.cwd(), imagePath);
}

// Helper function to read image and convert to base64
function readImageAsBase64(filePath: string): string {
  try {
    const resolvedPath = resolveImagePath(filePath);
    const imageBuffer = fs.readFileSync(resolvedPath);
    const base64 = imageBuffer.toString("base64");

    // Determine MIME type from file extension
    const ext = path.extname(resolvedPath).toLowerCase();
    let mimeType = "image/png"; // default
    if (ext === ".jpg" || ext === ".jpeg") {
      mimeType = "image/jpeg";
    } else if (ext === ".png") {
      mimeType = "image/png";
    } else if (ext === ".webp") {
      mimeType = "image/webp";
    } else if (ext === ".gif") {
      mimeType = "image/gif";
    }

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    throw new Error(`Failed to read image file: ${filePath}. Error: ${error}`);
  }
}

// Export the getSpecFromImage tool
export const getSpecFromImage = tool({
  description:
    "Analyze a Figma screenshot of a component and return a detailed prompt for building it with atomic components. The prompt is written for a blind web developer and describes the layout structure and visual design using only available atom component fields.",
  inputSchema: getSpecFromImageInputSchema,
  execute: async ({ imagePath }) => {
    try {
      // Read and convert image to base64
      const base64Image = readImageAsBase64(imagePath);

      // Check for API key
      const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!googleApiKey) {
        throw new Error(
          "GOOGLE_GENERATIVE_AI_API_KEY not set. Please set this environment variable to use image analysis."
        );
      }

      // System prompt describing available atoms and their fields
      const systemPrompt = `You are analyzing a Figma screenshot of a web component. Your task is to create a detailed, descriptive prompt for a blind web developer to build this component using atomic components.

Available atomic components and their fields:

1. **Flex** - Flexible container layout
   - direction: "row" | "column"
   - justifyContent: "start" | "center" | "end"
   - gap: number (spacing between items)
   - wrap: "wrap" | "nowrap"
   - layout.padding: string (vertical padding, e.g., "32px")
   - layout.grow: boolean (flex grow)

2. **Grid** - Grid-based layout
   - numColumns: number (1-12)
   - gap: number (spacing between grid items)
   - layout.spanCol: number (columns to span, 1-12)
   - layout.spanRow: number (rows to span, 1-12)
   - layout.padding: string (vertical padding)

3. **Heading** - Typography for headings
   - text: string (heading content)
   - level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
   - fontSize: string (e.g., "32px", "2rem")
   - fontWeight: "300" | "400" | "500" | "600" | "700" | "800" | "900"
   - fontFamily: string (Google Font name)
   - color: string (hex code, rgb, or CSS color name)
   - textAlign: "left" | "center" | "right"
   - lineHeight: string (e.g., "1.2", "1.5")
   - letterSpacing: string (e.g., "0.01em")
   - textTransform: "none" | "uppercase" | "lowercase" | "capitalize"
   - marginTop: string (e.g., "16px")
   - marginBottom: string (e.g., "16px")

4. **Text** - Typography for body text
   - content: string (text content, supports **bold** and *italic* markdown)
   - fontSize: string (e.g., "16px", "1rem")
   - fontWeight: "300" | "400" | "500" | "600" | "700"
   - fontFamily: string (Google Font name)
   - color: string (hex code, rgb, or CSS color name)
   - textAlign: "left" | "center" | "right" | "justify"
   - lineHeight: string (e.g., "1.5", "1.6")
   - letterSpacing: string
   - marginTop: string
   - marginBottom: string
   - maxWidth: string (e.g., "65ch", "600px")
   - opacity: number (0-1)

5. **Button** - Call-to-action buttons
   - label: string (button text)
   - href: string (link URL)
   - variant: "primary" | "secondary" | "outline" | "ghost"
   - size: "small" | "medium" | "large"
   - backgroundColor: string (hex code, rgb, or CSS color name)
   - textColor: string (hex code, rgb, or CSS color name)
   - borderColor: string (hex code, rgb, or CSS color name)
   - borderRadius: string (e.g., "4px", "8px", "24px")
   - paddingX: string (horizontal padding)
   - paddingY: string (vertical padding)
   - fontSize: string
   - fontWeight: "400" | "500" | "600" | "700"
   - width: "auto" | "full"
   - hoverEffect: "darken" | "lighten" | "scale" | "none"
   - icon: string (emoji or text symbol, optional)
   - iconPosition: "left" | "right"

6. **Image** - Images
   - src: string (image URL)
   - alt: string (alt text for accessibility)
   - width: string (e.g., "100%", "300px")
   - height: string (e.g., "300px")
   - objectFit: "cover" | "contain" | "fill" | "none"
   - borderRadius: string (e.g., "8px", "16px")
   - borderWidth: string (e.g., "1px")
   - borderColor: string
   - boxShadow: string (e.g., "0 2px 4px rgba(0,0,0,0.1)")
   - opacity: number (0-1)
   - aspectRatio: string (e.g., "16/9", "1/1", "4/3")
   - hoverEffect: "zoom" | "opacity" | "none"

7. **Spacer** - Spacing element
   - height: string (vertical spacing, e.g., "32px", "48px")
   - width: string (horizontal spacing, optional)

Instructions:
- Analyze the screenshot and describe the component structure in detail
- Write as if explaining to a blind web developer who cannot see the image
- Describe the layout hierarchy: which components nest inside which
- Specify exact values for colors (hex codes), spacing (pixels), font sizes, etc.
- Describe the visual design: colors, typography, spacing, alignment
- Only reference fields that exist in the atomic components listed above
- Be specific about Flex direction, Grid columns, alignment, gaps, padding
- Describe text content, button labels, and any visible text
- Specify colors using hex codes when possible
- Describe spacing relationships between elements
- Explain the overall structure and how components are arranged

Return a clear, detailed prompt that can be used to build this component exactly as shown in the screenshot.`;

      // User prompt for the vision model
      const userPrompt = `Analyze this Figma screenshot and create a detailed prompt for building this component with atomic components. Describe the layout structure, visual design, colors, typography, and spacing. Write as if explaining to a blind web developer.`;

      // Call Gemini with vision capabilities
      const { text } = await generateText({
        model: google("gemini-2.5-pro"),
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt,
              },
              {
                type: "image",
                image: base64Image,
              },
            ],
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent, accurate descriptions
      });

      return text;
    } catch (error) {
      console.error("Error in getSpecFromImage:", error);
      throw new Error(
        `Failed to analyze image: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  },
});






