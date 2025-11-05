/**
 * Test script for getBrandColors function
 * Run with: npx tsx test-brand-colors.ts
 * or: node --loader ts-node/esm test-brand-colors.ts
 */

// Load environment variables from .env.local and .env files
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local first (higher priority), then .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";

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

async function testGetBrandColors(brand: string, entityType?: string) {
  console.log(
    `\n🧪 Testing getBrandColors for: ${brand}${
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

  console.log("\n📝 Prompt:");
  console.log(prompt);

  console.log("\n🤖 Calling generateObject...");
  const startTime = Date.now();

  try {
    const result = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      system:
        "You are a color expert. Generate brand color palettes with 4 hex colors: primary, secondary, background, and text.",
      prompt: prompt,
      schema: brandColorsOutputSchema,
      schemaName: "BrandColors",
      schemaDescription:
        "A 4-color brand palette with primary, secondary, background, and text colors in hex format",
      maxOutputTokens: 1000,
      temperature: 0.7,
      mode: "json",
    });

    const duration = Date.now() - startTime;
    console.log(`\n✅ Success! (took ${duration}ms)`);
    console.log("\n📊 Result:");
    console.log(JSON.stringify(result.object, null, 2));
    console.log("\n📈 Usage:");
    console.log(`  - Total tokens: ${result.usage.totalTokens}`);
    if ("inputTokens" in result.usage) {
      console.log(`  - Input tokens: ${(result.usage as any).inputTokens}`);
    }
    if ("outputTokens" in result.usage) {
      console.log(`  - Output tokens: ${(result.usage as any).outputTokens}`);
    }
    console.log(`\n🏁 Finish reason: ${result.finishReason}`);

    // Validate the result
    const validation = brandColorsOutputSchema.safeParse(result.object);
    if (validation.success) {
      console.log("\n✅ Schema validation passed");
    } else {
      console.log("\n❌ Schema validation failed:");
      console.log(validation.error.issues);
    }

    return result.object;
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

    console.error("\nFull error:", error);
    throw error;
  }
}

// Main test execution
async function main() {
  console.log("🚀 Starting getBrandColors test\n");

  // Test cases
  const testCases = [
    { brand: "Starbucks", entityType: "coffee shop" },
    { brand: "Apple", entityType: "technology company" },
    { brand: "McDonald's", entityType: "restaurant" },
  ];

  for (const testCase of testCases) {
    try {
      await testGetBrandColors(testCase.brand, testCase.entityType);
      // Add a small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`\n❌ Test failed for ${testCase.brand}`);
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
