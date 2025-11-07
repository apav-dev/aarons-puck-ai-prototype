/**
 * Test script for getFAQs function
 * Run with: npx tsx test-faqs.ts
 * or: node --loader ts-node/esm test-faqs.ts
 */

// Load environment variables from .env.local and .env files
import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";

// Load .env.local first (higher priority), then .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

// Output file for test results
const OUTPUT_FILE = resolve(process.cwd(), "test-faqs-output.json");
const OUTPUT_LOG_FILE = resolve(process.cwd(), "test-faqs-output.log");

// Capture console output
const logMessages: string[] = [];
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args: any[]) => {
  const message = args.map((arg) => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  logMessages.push(`[LOG] ${message}`);
  originalLog(...args);
};

console.error = (...args: any[]) => {
  const message = args.map((arg) => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  logMessages.push(`[ERROR] ${message}`);
  originalError(...args);
};

console.warn = (...args: any[]) => {
  const message = args.map((arg) => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  logMessages.push(`[WARN] ${message}`);
  originalWarn(...args);
};

import {
  searchAndExtractFAQs,
  generateFAQsWithAI,
  extractFAQsFromText,
} from "./lib/tools/get-faqs-core";

interface TestResult {
  brand: string;
  locationUrl?: string;
  entityType?: string;
  location?: string;
  success: boolean;
  faqs: Array<{ question: string; answer: string }>;
  duration: number;
  error?: string;
}

const testResults: TestResult[] = [];

async function testGetFAQs(
  brand: string,
  locationUrl?: string,
  entityType?: string,
  location?: string
): Promise<TestResult> {
  console.log(
    `\n🧪 Testing getFAQs for: ${brand}${
      entityType ? ` (${entityType})` : ""
    }${location ? ` in ${location}` : ""}`
  );
  if (locationUrl) {
    console.log(`   Location URL: ${locationUrl}`);
  }
  console.log("=".repeat(80));

  // Check API keys
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!tavilyApiKey) {
    console.error("❌ ERROR: TAVILY_API_KEY not set");
    console.log("\nPlease ensure:");
    console.log("  1. The key is set in .env.local or .env file");
    console.log("  2. The file is in the project root directory");
    console.log("  3. The key name is exactly: TAVILY_API_KEY");
    return {
      brand,
      locationUrl,
      entityType,
      location,
      success: false,
      faqs: [],
      duration: 0,
      error: "TAVILY_API_KEY not set",
    };
  }
  console.log(
    `✅ TAVILY_API_KEY found (length: ${tavilyApiKey.length} characters)`
  );

  if (!googleApiKey) {
    console.warn("⚠️  WARNING: GOOGLE_GENERATIVE_AI_API_KEY not set");
    console.log("  FAQ generation fallback will not work");
  } else {
    console.log(
      `✅ GOOGLE_GENERATIVE_AI_API_KEY found (length: ${googleApiKey.length} characters)`
    );
  }

  console.log("\n📝 Input parameters:");
  console.log(`  - Brand: ${brand}`);
  if (entityType) {
    console.log(`  - Entity Type: ${entityType}`);
  }
  if (location) {
    console.log(`  - Location: ${location}`);
  }
  if (locationUrl) {
    console.log(`  - Location URL: ${locationUrl}`);
  }

  console.log("\n🤖 Calling searchAndExtractFAQs...");
  const startTime = Date.now();

  try {
    // First, try to extract FAQs from location landing page
    let result = await searchAndExtractFAQs(
      brand,
      locationUrl,
      entityType,
      location
    );

    // If no FAQs found, try generating with AI
    if (result.length === 0 && googleApiKey) {
      console.log("\n📝 No FAQs extracted, trying AI generation...");
      result = await generateFAQsWithAI(brand, entityType, location);
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Success! (took ${duration}ms)`);
    console.log(`\n📊 Found ${result.length} FAQ(s):\n`);

    if (result.length === 0) {
      console.log("⚠️  No FAQs returned");
    } else {
      result.forEach((faq, index) => {
        console.log(`${index + 1}. Q: ${faq.question}`);
        console.log(
          `   A: ${faq.answer.substring(0, 150)}${
            faq.answer.length > 150 ? "..." : ""
          }`
        );
        console.log();
      });

      console.log("\n📋 Full FAQ data:");
      console.log(JSON.stringify(result, null, 2));
    }

    // Validate structure
    const hasValidStructure = result.every(
      (faq) =>
        typeof faq === "object" &&
        typeof faq.question === "string" &&
        typeof faq.answer === "string" &&
        faq.question.length > 0 &&
        faq.answer.length > 0
    );

    if (hasValidStructure) {
      console.log("\n✅ All FAQs have valid structure (question + answer)");
    } else {
      console.log("\n❌ Some FAQs have invalid structure");
    }

    const testResult: TestResult = {
      brand,
      locationUrl,
      entityType,
      location,
      success: true,
      faqs: result,
      duration,
    };
    testResults.push(testResult);
    return testResult;
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

    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }

    console.error("\nFull error:", error);
    
    const testResult: TestResult = {
      brand,
      locationUrl,
      entityType,
      location,
      success: false,
      faqs: [],
      duration,
      error: error.message || String(error),
    };
    testResults.push(testResult);
    return testResult;
  }
}

// Test the extractFAQsFromText function directly
async function testExtractFAQsFromText() {
  console.log("\n🧪 Testing extractFAQsFromText function");
  console.log("=".repeat(80));

  const testContent = `
    <h2>Question & Answers</h2>
    <h3>McDelivery</h3>
    <h4>How do I know if McDelivery is available to my address?</h4>
    <p>Depending on where you are, McDelivery is available on DoorDash, Uber Eats, Grubhub, or Postmates apps.</p>
    <h4>How do I know what items are available for McDelivery?</h4>
    <p>Menu items will vary by location. For food item availability, please select McDelivery in the McDonald's app.</p>
    <h3>Mobile Order & Pay</h3>
    <h4>How do I know which restaurants are participating in Mobile Order & Pay?</h4>
    <p>Make sure you turn on location services so that we can include all of the available features in the McDonald's app.</p>
  `;

  try {
    const faqs = extractFAQsFromText(testContent);
    console.log(`\n✅ Extracted ${faqs.length} FAQ(s) from test content:\n`);
    faqs.forEach((faq, index) => {
      console.log(`${index + 1}. Q: ${faq.question}`);
      console.log(`   A: ${faq.answer}`);
      console.log();
    });
    return faqs.length > 0;
  } catch (error: any) {
    console.error("\n❌ Error testing extractFAQsFromText:", error.message);
    return false;
  }
}

// Main test execution
async function main() {
  console.log("🚀 Starting getFAQs test\n");

  // Test extraction function first
  await testExtractFAQsFromText();

  // Test cases
  const testCases = [
    {
      brand: "McDonald's",
      locationUrl:
        "https://www.mcdonalds.com/us/en-us/location/NY/BROOKLYN/904-MANHATTAN-AVE/2678.html?cid=RF:YXT:GMB::Clicks",
      entityType: "restaurant",
      location: "Brooklyn, NY",
      description: "McDonald's location with FAQs on the page",
    },
    {
      brand: "TIAA",
      locationUrl:
        "https://locations.tiaa.org/ny/new-york/730-third-avenue?tc_mcid=bn_yextglocal_0618",
      entityType: "financial services",
      location: "New York, NY",
      description: "TIAA location without FAQs (should generate with AI)",
    },
    {
      brand: "Starbucks",
      entityType: "coffee shop",
      location: "Seattle, WA",
      description: "Starbucks without URL (should search and extract or generate)",
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      console.log(`\n${"═".repeat(80)}`);
      console.log(`Test Case: ${testCase.description}`);
      console.log(`${"═".repeat(80)}`);
      const result = await testGetFAQs(
        testCase.brand,
        testCase.locationUrl,
        testCase.entityType,
        testCase.location
      );
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
      // Add a delay between tests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`\n❌ Test failed for ${testCase.brand}`);
      failed++;
      // Continue with next test
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total: ${passed + failed}`);
  console.log("\n✨ All tests completed");

  // Write results to JSON file
  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      passed,
      failed,
      total: passed + failed,
    },
    results: testResults,
  };

  try {
    writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf-8");
    console.log(`\n📄 Test results written to: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error(`\n❌ Failed to write output file:`, error);
  }

  // Write log to file
  try {
    writeFileSync(OUTPUT_LOG_FILE, logMessages.join("\n"), "utf-8");
    console.log(`📄 Test log written to: ${OUTPUT_LOG_FILE}`);
  } catch (error) {
    console.error(`\n❌ Failed to write log file:`, error);
  }
}

// Run the tests
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
