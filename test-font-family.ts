/**
 * Test script for getFontFamily function
 * Run with: npx tsx test-font-family.ts
 * or: node --loader ts-node/esm test-font-family.ts
 */

// Load environment variables from .env.local and .env files
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local first (higher priority), then .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getGoogleFonts } from "./lib/google-fonts";

// Cache for getFontFamily responses (for testing)
const fontFamilyCache = new Map<string, string>();

async function testGetFontFamily(
  brand: string,
  fontType: "heading" | "body",
  entityType?: string
) {
  console.log(
    `\n🧪 Testing getFontFamily for: ${brand} (${fontType})${
      entityType ? ` (${entityType})` : ""
    }`
  );
  console.log("=".repeat(60));

  // Check API key
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!googleApiKey) {
    console.error("❌ ERROR: GOOGLE_GENERATIVE_AI_API_KEY not set");
    console.log("\nDebug info:");
    console.log(`  - Current working directory: ${process.cwd()}`);
    console.log(`  - NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
    console.log(
      `  - Environment variables loaded: ${Object.keys(process.env).length}`
    );
    console.log("\nPlease ensure:");
    console.log("  1. The key is set in .env.local or .env file");
    console.log("  2. The file is in the project root directory");
    console.log("  3. The key name is exactly: GOOGLE_GENERATIVE_AI_API_KEY");
    return;
  }
  console.log(`✅ API key found (length: ${googleApiKey.length} characters)`);

  // Normalize cache key (same as tool)
  const cacheKey = `${brand.toLowerCase().trim()}-${fontType}-${
    entityType?.toLowerCase().trim() || ""
  }`;

  // Check cache first (same as tool)
  if (fontFamilyCache.has(cacheKey)) {
    console.log("\n📦 Using cached result:");
    console.log(`  Font: ${fontFamilyCache.get(cacheKey)}`);
    return fontFamilyCache.get(cacheKey)!;
  }

  // Get available Google Fonts (same as tool)
  console.log("\n🔍 Fetching Google Fonts list...");
  const startFontsTime = Date.now();
  const availableFonts = await getGoogleFonts();
  const fontsDuration = Date.now() - startFontsTime;
  console.log(
    `✅ Fetched ${availableFonts.length} fonts (took ${fontsDuration}ms)`
  );

  const fontNames = availableFonts.map((f) => f.name);

  // If no fonts available, return a default (same as tool)
  if (fontNames.length === 0) {
    console.warn("⚠️  No fonts available, using default");
    const defaultFont = "Roboto";
    fontFamilyCache.set(cacheKey, defaultFont);
    return defaultFont;
  }

  // Limit font list to top 200 to avoid token limit issues (same as tool)
  const MAX_FONTS_IN_PROMPT = 200;
  const fontsForPrompt = fontNames.slice(0, MAX_FONTS_IN_PROMPT);
  const fontList = fontsForPrompt.join(", ");

  if (fontNames.length > MAX_FONTS_IN_PROMPT) {
    console.log(
      `\n⚠️  Limiting font list to top ${MAX_FONTS_IN_PROMPT} fonts (out of ${fontNames.length} total)`
    );
  }

  const fontTypeDescription =
    fontType === "heading"
      ? "Display font suitable for headings - can be bold, decorative, or distinctive"
      : "Body font suitable for readable text - should be clean, legible, and professional";

  // Build prompt (same as tool)
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

  // Debug: Verify font list is in prompt
  const fontListLength = fontList.length;
  const fontListInPrompt = prompt.includes(fontList.substring(0, 50)); // Check if first 50 chars of font list are in prompt
  
  console.log("\n📝 Prompt Details:");
  console.log(`   Brand: ${brand}`);
  console.log(`   Font Type: ${fontTypeDescription}`);
  if (entityType) {
    console.log(`   Entity Type: ${entityType}`);
  }
  console.log(
    `   Available fonts: ${fontsForPrompt.length} in prompt (${fontNames.length} total)`
  );
  console.log(`   Font list length: ${fontListLength} characters`);
  console.log(`   Font list in prompt: ${fontListInPrompt ? "✅ Yes" : "❌ No"}`);
  
  // Show sample fonts from the list
  if (fontsForPrompt.length > 0) {
    const firstFew = fontsForPrompt.slice(0, 5).join(", ");
    const lastFew = fontsForPrompt.slice(-5).join(", ");
    console.log(`   First 5 fonts: ${firstFew}`);
    console.log(`   Last 5 fonts: ${lastFew}`);
    
    // Verify these fonts appear in the prompt
    const firstFontInPrompt = prompt.includes(fontsForPrompt[0]);
    console.log(`   First font "${fontsForPrompt[0]}" in prompt: ${firstFontInPrompt ? "✅ Yes" : "❌ No"}`);
  }
  
  console.log(`   Full prompt length: ${prompt.length} characters`);

  console.log("\n🤖 Calling generateText...");
  
  // Show a preview of the actual prompt being sent (first 500 chars and last 200 chars)
  const promptPreview = prompt.length > 700 
    ? `${prompt.substring(0, 500)}...\n[... ${prompt.length - 700} characters ...]\n...${prompt.substring(prompt.length - 200)}`
    : prompt;
  console.log(`\n📄 Prompt preview (first 500 + last 200 chars):`);
  console.log(promptPreview);
  
  const startTime = Date.now();

  try {
    // Add timeout wrapper to prevent hanging
    const TIMEOUT_MS = 30000; // 30 seconds timeout
    
    // Use gemini-2.5-flash-lite (same as brand colors test which works)
    const modelName = "gemini-2.5-flash-lite";
    console.log(`\n⚙️  API Configuration:`);
    console.log(`   Model: ${modelName}`);
    console.log(`   Prompt length: ${prompt.length} characters`);
    console.log(`   System message length: ${"You are a typography expert. Respond with only the font name from the provided list, nothing else.".length} characters`);
    console.log(`   Timeout: ${TIMEOUT_MS}ms`);
    
    const generateTextPromise = generateText({
      model: google(modelName),
      system:
        "You are a typography expert. Respond with only the font name from the provided list, nothing else.",
      prompt: prompt,
      temperature: 0.7,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`generateText timed out after ${TIMEOUT_MS}ms`));
      }, TIMEOUT_MS);
    });

    // Call generateText with timeout
    const { text } = await Promise.race([generateTextPromise, timeoutPromise]);

    const duration = Date.now() - startTime;
    console.log(`\n✅ Success! (took ${duration}ms)`);
    console.log(`\n📊 Raw response: "${text.trim()}"`);

    const selectedFont = text.trim();

    if (!selectedFont) {
      throw new Error("No font returned from LLM");
    }

    // Validate that the selected font is in our FULL list (case-insensitive) (same as tool)
    const normalizedSelected = selectedFont.replace(/^["']|["']$/g, ""); // Remove quotes if present
    const matchedFont = fontNames.find(
      (f) => f.toLowerCase() === normalizedSelected.toLowerCase()
    );

    const finalFont =
      matchedFont || (fontType === "heading" ? "Montserrat" : "Open Sans");

    if (!matchedFont) {
      console.warn(
        `\n⚠️  Warning: Selected font "${normalizedSelected}" not found in font list. Using fallback: ${finalFont}`
      );
    } else {
      console.log(`\n✅ Font matched successfully`);
    }

    console.log(`\n🎨 Final font: ${finalFont}`);

    // Cache the result (same as tool)
    fontFamilyCache.set(cacheKey, finalFont);

    // Show usage info if available
    console.log("\n📈 Usage:");
    // Note: generateText might not always return usage info in the same format

    return finalFont;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.log(`\n❌ Error after ${duration}ms`);
    console.error("\nError details:");
    console.error("Message:", error.message);
    console.error("Name:", error.name);

    if (error.cause) {
      console.error("Cause:", error.cause);
    }

    if (error.response) {
      console.error("Response:", JSON.stringify(error.response, null, 2));
    }

    if (error.usage) {
      console.error("Usage:", error.usage);
    }

    if (error.finishReason) {
      console.error("Finish reason:", error.finishReason);
    }

    if (error.text) {
      console.error("Text:", error.text);
    }

    // Log status code if available
    if (error.statusCode) {
      console.error("Status code:", error.statusCode);
    }

    // Log the full error object for debugging
    console.error("\nFull error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Also log the error directly
    console.error("\nError:", error);

    // Return a sensible default based on font type (same as tool)
    const defaultFont = fontType === "heading" ? "Montserrat" : "Open Sans";
    console.log(`\n🔄 Using fallback font: ${defaultFont}`);
    return defaultFont;
  }
}

// Main test execution
async function main() {
  console.log("🚀 Starting getFontFamily test\n");

  // Test cases
  const testCases = [
    {
      brand: "Starbucks",
      fontType: "heading" as const,
      entityType: "coffee shop",
    },
    {
      brand: "Starbucks",
      fontType: "body" as const,
      entityType: "coffee shop",
    },
    {
      brand: "Apple",
      fontType: "heading" as const,
      entityType: "technology company",
    },
    {
      brand: "Apple",
      fontType: "body" as const,
      entityType: "technology company",
    },
    {
      brand: "McDonald's",
      fontType: "heading" as const,
      entityType: "restaurant",
    },
    {
      brand: "McDonald's",
      fontType: "body" as const,
      entityType: "restaurant",
    },
  ];

  for (const testCase of testCases) {
    try {
      await testGetFontFamily(
        testCase.brand,
        testCase.fontType,
        testCase.entityType
      );
      // Add a small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(
        `\n❌ Test failed for ${testCase.brand} (${testCase.fontType})`
      );
      // Continue with next test
    }
  }

  console.log("\n✨ All tests completed");
}

// Run the tests
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
