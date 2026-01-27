import { tavily } from "@tavily/core";
import z from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

// Lazy initialization of Tavily client
let tavilyClient: ReturnType<typeof tavily> | null = null;

function getTavilyClient() {
  if (!tavilyClient) {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error(
        "TAVILY_API_KEY not set. Please set it in your environment variables."
      );
    }
    tavilyClient = tavily({
      apiKey: apiKey,
    });
  }
  return tavilyClient;
}

// FAQ item schema
const faqItemSchema = z.object({
  question: z.string().describe("The FAQ question"),
  answer: z.string().describe("The FAQ answer"),
});

// Output schema for FAQs
export const faqsOutputSchema = z.object({
  faqs: z
    .array(faqItemSchema)
    .min(1)
    .max(5)
    .describe("Array of FAQ items with question and answer"),
});

/**
 * Extracts FAQs from text content by looking for common FAQ patterns
 */
export function extractFAQsFromText(
  content: string
): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];

  if (!content || typeof content !== "string") {
    return faqs;
  }

  // Common FAQ patterns to look for
  // Note: Using [\s\S] instead of . with s flag for ES5 compatibility
  const patterns = [
    // Q: ... A: ... pattern
    /Q:\s*([\s\S]+?)\s*A:\s*([\s\S]+?)(?=Q:|$)/gi,
    // Question: ... Answer: ... pattern
    /Question:\s*([\s\S]+?)\s*Answer:\s*([\s\S]+?)(?=Question:|$)/gi,
    // ### Question ### Answer pattern (markdown)
    /###\s*([\s\S]+?)\s*###\s*([\s\S]+?)(?=###|$)/gi,
    // <h3>Question</h3>...<p>Answer</p> pattern (HTML-like)
    /<h[23]>\s*([\s\S]+?)\s*<\/h[23]>\s*<p>\s*([\s\S]+?)\s*<\/p>/gi,
    // Heading (h3/h4) followed by question (h4) and answer (p) - McDonald's style
    /<h[34]>\s*([\s\S]+?)\s*<\/h[34]>\s*<h[34]>\s*([\s\S]+?\?)\s*<\/h[34]>\s*<p>\s*([\s\S]+?)\s*<\/p>/gi,
    // Question heading (h4) followed by answer paragraph - most common pattern
    /<h4>\s*([\s\S]+?\?)\s*<\/h4>\s*<p>\s*([\s\S]+?)\s*<\/p>/gi,
  ];

  // Also look for FAQ section headers followed by content
  // Try to find FAQ section and extract up to 10000 characters
  const faqSectionPattern =
    /(?:FAQ|Frequently Asked Questions|Questions? & Answers?|Common Questions?|Question & Answers)[\s\S]{0,10000}/i;
  let faqSection = content;
  const faqSectionMatch = content.match(faqSectionPattern);

  if (faqSectionMatch) {
    faqSection = faqSectionMatch[0];
  } else {
    // If no FAQ section header found, look for patterns that suggest FAQ content
    // Check if content has multiple question-answer patterns
    const questionCount = (content.match(/<h[34]>\s*[^<]*\?/gi) || []).length;
    if (questionCount >= 3) {
      // Likely FAQ content, use the whole content
      faqSection = content;
    }
  }

  // Try to extract Q&A pairs from the FAQ section
  for (const pattern of patterns) {
    const matches = Array.from(faqSection.matchAll(pattern));
    for (const match of matches) {
      // Handle different pattern groups
      let question: string | undefined;
      let answer: string | undefined;

      if (match.length >= 3) {
        // Most patterns have question as group 1, answer as group 2
        question = match[1]?.trim();
        answer = match[2]?.trim();

        // Some patterns might have question in group 2, answer in group 3
        if (match.length >= 4 && (!question || question.length < 10)) {
          question = match[2]?.trim();
          answer = match[3]?.trim();
        }
      }

      if (question && answer && question.length > 10 && answer.length > 20) {
        // Clean up HTML tags and extra whitespace
        question = question
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim();
        answer = answer
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim();

        // Only add if it looks like a real Q&A pair
        // Filter out common non-FAQ patterns and blog/forum content
        const questionLower = question.toLowerCase();
        const answerLower = answer.toLowerCase();
        const isNonFAQ =
          questionLower.includes("visit profile") ||
          questionLower.includes("nearby locations") ||
          questionLower.includes("get directions") ||
          questionLower.includes("contact us") ||
          questionLower.includes("found this post") ||
          questionLower.includes("askseattle") ||
          questionLower.includes("reddit") ||
          questionLower.includes("blog") ||
          questionLower.includes("pin it") ||
          questionLower.includes("share to") ||
          questionLower.includes("reply") ||
          questionLower.includes("comment") ||
          answerLower.includes("reddit.com") ||
          answerLower.includes("blogger.com") ||
          answerLower.includes("buy me a coffee") ||
          answerLower.includes("sponsored post") ||
          answerLower.includes("further reading") ||
          (questionLower.includes("hours") &&
            !questionLower.includes("what are")) ||
          !!questionLower.match(/^\d+\.?\s*$/) || // Just a number
          !!questionLower.match(/^[a-z]\s*$/) || // Single letter
          question.length < 10 ||
          answer.length < 20;

        if (!isNonFAQ && (question.endsWith("?") || question.length > 15)) {
          faqs.push({ question, answer });
        }
      }
    }
  }

  // If no FAQs found with patterns, try to find question-like sentences followed by answers
  if (faqs.length === 0) {
    // Look for sentences ending with "?" followed by paragraphs
    const questionAnswerPattern =
      /([A-Z][^.!?]*\?)\s+([A-Z][^.!?]+(?:\.[^.!?]+)*)/g;
    const matches = Array.from(content.matchAll(questionAnswerPattern));

    for (const match of matches.slice(0, 10)) {
      const question = match[1]?.trim();
      const answer = match[2]?.trim();
      if (question && answer && question.length > 10 && answer.length > 30) {
        faqs.push({ question, answer });
      }
    }
  }

  // Remove duplicates based on question text
  const seenQuestions = new Set<string>();
  return faqs.filter((faq) => {
    const normalized = faq.question.toLowerCase().trim();
    if (seenQuestions.has(normalized)) {
      return false;
    }
    seenQuestions.add(normalized);
    return true;
  });
}

/**
 * Searches for location landing pages and extracts FAQs
 */
export async function searchAndExtractFAQs(
  brand: string,
  locationUrl?: string,
  entityType?: string,
  location?: string
): Promise<Array<{ question: string; answer: string }>> {
  const startTime = Date.now();

  // Use NYC as proxy location if no location provided or location is "N/A"
  const searchLocation =
    !location || location === "N/A" ? "New York City" : location;

  console.log(
    `[searchAndExtractFAQs] Starting FAQ extraction for brand: "${brand}", entityType: "${
      entityType || "N/A"
    }", location: "${
      location || "N/A"
    }", searchLocation: "${searchLocation}", locationUrl: "${
      locationUrl || "N/A"
    }"`
  );
  try {
    // If locationUrl is provided, try to extract directly from it
    if (locationUrl && locationUrl !== "N/A") {
      console.log(
        `[searchAndExtractFAQs] Attempting direct extraction from provided URL: ${locationUrl}`
      );
      try {
        const extracted = await getTavilyClient().extract([locationUrl], {
          extractDepth: "advanced",
        });

        if (extracted?.results && extracted.results.length > 0) {
          const firstResult = extracted.results[0];
          if (firstResult?.rawContent) {
            console.log(
              `[searchAndExtractFAQs] Successfully extracted content from URL (${firstResult.rawContent.length} chars), extracting FAQs...`
            );
            const faqs = extractFAQsFromText(firstResult.rawContent);
            console.log(
              `[searchAndExtractFAQs] Found ${faqs.length} raw FAQs from URL extraction`
            );
            if (faqs.length > 0) {
              // Refine the extracted FAQs using AI
              console.log(
                `[searchAndExtractFAQs] Refining ${faqs.length} FAQs with AI...`
              );
              const refinedFAQs = await refineFAQsWithAI(
                faqs,
                brand,
                entityType,
                location
              );
              console.log(
                `[searchAndExtractFAQs] Returning ${refinedFAQs.length} refined FAQs from URL extraction`
              );
              console.log(
                `[searchAndExtractFAQs] Refined FAQs:`,
                JSON.stringify(refinedFAQs, null, 2)
              );
              const duration = (Date.now() - startTime) / 1000;
              console.log(
                `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(
                  2
                )}s`
              );
              return refinedFAQs;
            } else {
              console.log(
                `[searchAndExtractFAQs] No FAQs found on provided location page, returning empty array for AI fallback`
              );
              const duration = (Date.now() - startTime) / 1000;
              console.log(
                `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(
                  2
                )}s`
              );
              return [];
            }
          } else {
            console.log(
              `[searchAndExtractFAQs] No rawContent found in extraction result, returning empty array for AI fallback`
            );
            const duration = (Date.now() - startTime) / 1000;
            console.log(
              `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(
                2
              )}s`
            );
            return [];
          }
        } else {
          console.log(
            `[searchAndExtractFAQs] No results returned from URL extraction, returning empty array for AI fallback`
          );
          const duration = (Date.now() - startTime) / 1000;
          console.log(
            `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(
              2
            )}s`
          );
          return [];
        }
      } catch (error) {
        console.warn(
          `[searchAndExtractFAQs] Failed to extract from provided URL ${locationUrl}, returning empty array for AI fallback:`,
          error
        );
        const duration = (Date.now() - startTime) / 1000;
        console.log(
          `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(
            2
          )}s`
        );
        return [];
      }
    }

    // Build search query specifically for location landing pages
    // Target URLs like: brand.com/location/STATE/CITY/ADDRESS/ID.html
    const queryParts = [
      brand,
      searchLocation,
      "location",
      "store location",
      "branch",
    ];
    const query = queryParts.join(" ");

    console.log(
      `[searchAndExtractFAQs] Searching Tavily for location page with query: "${query}"`
    );

    // Search for location landing pages
    const searchResponse = await getTavilyClient().search(query, {
      search_depth: "advanced",
      max_results: 10, // Get more results to find a good location page
    });
    console.log(
      `[searchAndExtractFAQs] Tavily search returned ${
        searchResponse.results?.length || 0
      } results`
    );

    // Filter URLs to find actual location pages (like the McDonald's example)
    // Look for URLs with patterns like: /location/STATE/CITY/... or /locations/.../...
    const excludedDomains = [
      "blog",
      "reddit.com",
      "tripadvisor",
      "yelp.com",
      "foursquare",
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "medium.com",
      "wordpress.com",
      "blogger.com",
      "tumblr.com",
      "contact-us",
      "faq.html",
      "help-center",
    ];

    // Find the first URL that looks like a location page
    let locationPageUrl: string | null = null;

    for (const result of searchResponse.results || []) {
      const url = result.url;
      if (!url || (result.score || 0) < 0.3) {
        continue;
      }

      const urlLower = url.toLowerCase();
      const brandLower = brand.toLowerCase().replace(/[^a-z0-9]/g, "");

      // Skip excluded domains
      const isExcluded = excludedDomains.some((domain) =>
        urlLower.includes(domain)
      );
      if (isExcluded) {
        continue;
      }

      // Check if URL looks like a specific location page
      // Pattern: /location/STATE/CITY/ADDRESS/ID.html or similar
      const isLocationPage =
        // Must include brand domain
        urlLower.includes(brandLower) &&
        // Must have /location/ in path (not just "location" in domain)
        urlLower.match(/\/location[s]?\//) !== null &&
        // Should have multiple path segments after /location/ (suggests specific location)
        (urlLower.split("/location")[1]?.split("/").filter(Boolean).length ||
          0) >= 2 &&
        // Not a general FAQ or contact page
        !urlLower.includes("/faq") &&
        !urlLower.includes("/contact") &&
        !urlLower.includes("/help");

      if (isLocationPage) {
        locationPageUrl = url;
        console.log(
          `[searchAndExtractFAQs] Found location page: ${locationPageUrl}`
        );
        break; // Only use the first matching location page
      }
    }

    // If no location page found, return empty array to fall back to AI generation
    if (!locationPageUrl) {
      console.log(
        `[searchAndExtractFAQs] No location page found, returning empty array for AI fallback`
      );
      const duration = (Date.now() - startTime) / 1000;
      console.log(
        `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(2)}s`
      );
      return [];
    }

    // Extract content from the single location page
    console.log(
      `[searchAndExtractFAQs] Extracting content from location page: ${locationPageUrl}`
    );
    try {
      const extracted = await getTavilyClient().extract([locationPageUrl], {
        extractDepth: "advanced",
      });

      if (!extracted?.results || extracted.results.length === 0) {
        console.log(
          `[searchAndExtractFAQs] No content extracted from location page, returning empty array for AI fallback`
        );
        const duration = (Date.now() - startTime) / 1000;
        console.log(
          `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(
            2
          )}s`
        );
        return [];
      }

      const firstResult = extracted.results[0];
      const content = firstResult?.rawContent || "";

      if (!content || content.length === 0) {
        console.log(
          `[searchAndExtractFAQs] Empty content extracted from location page, returning empty array for AI fallback`
        );
        const duration = (Date.now() - startTime) / 1000;
        console.log(
          `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(
            2
          )}s`
        );
        return [];
      }

      console.log(
        `[searchAndExtractFAQs] Successfully extracted content from location page (${content.length} chars), extracting FAQs...`
      );

      // Check if content looks like blog/forum content
      const contentLower = content.toLowerCase();
      const isBlogContent =
        contentLower.includes("reddit") ||
        contentLower.includes("blogger.com") ||
        contentLower.includes("buy me a coffee") ||
        contentLower.includes("further reading") ||
        contentLower.includes("sponsored post") ||
        contentLower.includes("askseattle") ||
        (contentLower.includes("comment") &&
          contentLower.includes("reply") &&
          contentLower.includes("share"));

      if (isBlogContent) {
        console.log(
          `[searchAndExtractFAQs] Content appears to be blog/forum content, returning empty array for AI fallback`
        );
        const duration = (Date.now() - startTime) / 1000;
        console.log(
          `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(
            2
          )}s`
        );
        return [];
      }

      // Extract FAQs from the single content source
      const faqs = extractFAQsFromText(content);
      console.log(
        `[searchAndExtractFAQs] Extracted ${faqs.length} raw FAQs from location page`
      );

      if (faqs.length === 0) {
        console.log(
          `[searchAndExtractFAQs] No FAQs found on location page, returning empty array for AI fallback`
        );
        const duration = (Date.now() - startTime) / 1000;
        console.log(
          `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(
            2
          )}s`
        );
        return [];
      }

      // Refine the extracted FAQs using AI
      console.log(
        `[searchAndExtractFAQs] Refining ${faqs.length} raw FAQs with AI...`
      );
      const refinedFAQs = await refineFAQsWithAI(
        faqs,
        brand,
        entityType,
        location
      );

      if (refinedFAQs.length === 0) {
        console.log(
          `[searchAndExtractFAQs] Refinement filtered out all FAQs, returning empty array for AI fallback`
        );
        const duration = (Date.now() - startTime) / 1000;
        console.log(
          `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(
            2
          )}s`
        );
        return [];
      }

      console.log(
        `[searchAndExtractFAQs] Successfully refined to ${refinedFAQs.length} FAQs`
      );
      console.log(
        `[searchAndExtractFAQs] Refined FAQs:`,
        JSON.stringify(refinedFAQs, null, 2)
      );
      const duration = (Date.now() - startTime) / 1000;
      console.log(
        `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(2)}s`
      );
      return refinedFAQs;
    } catch (error) {
      console.warn(
        `[searchAndExtractFAQs] Failed to extract from location page ${locationPageUrl}, returning empty array for AI fallback:`,
        error
      );
      const duration = (Date.now() - startTime) / 1000;
      console.log(
        `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(2)}s`
      );
      return [];
    }
  } catch (error) {
    console.error(
      "[searchAndExtractFAQs] Error in searchAndExtractFAQs:",
      error
    );
    const duration = (Date.now() - startTime) / 1000;
    console.log(
      `[searchAndExtractFAQs] Execution completed in ${duration.toFixed(2)}s`
    );
    return [];
  }
}

/**
 * Refines and cleans extracted FAQs using AI to ensure proper formatting
 */
export async function refineFAQsWithAI(
  rawFAQs: Array<{ question: string; answer: string }>,
  brand: string,
  entityType?: string,
  location?: string
): Promise<Array<{ question: string; answer: string }>> {
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!googleApiKey || rawFAQs.length === 0) {
    return rawFAQs;
  }

  // Always refine if we have FAQs - helps ensure quality
  // But skip if we have very few clean FAQs already
  const hasCleanFAQs =
    rawFAQs.length <= 8 &&
    rawFAQs.every(
      (faq) =>
        faq.question.endsWith("?") &&
        !faq.question.includes("#") &&
        faq.question.length < 200 &&
        faq.answer.length < 1000 &&
        faq.question.length > 10 &&
        faq.answer.length > 20
    );

  if (hasCleanFAQs && rawFAQs.length > 0) {
    // Already clean, but still refine to ensure consistency
    // Only skip if we have exactly the right number of clean FAQs
    if (rawFAQs.length >= 5 && rawFAQs.length <= 8) {
      return rawFAQs;
    }
  }

  // Truncate very long answers in input to reduce token usage
  // We'll preserve up to 800 chars per answer, which should be enough for context
  const truncatedFAQs = rawFAQs.slice(0, 12).map((faq) => ({
    question: faq.question.substring(0, 300), // Limit question length
    answer: faq.answer.substring(0, 800), // Limit answer length for input
  }));

  const prompt = `Clean and refine FAQs for ${brand}${
    entityType ? ` (${entityType})` : ""
  }${location ? ` in ${location}` : ""}.

CRITICAL: PRESERVE original content. Only fix formatting. Do NOT invent information.
Keep answers concise but complete (aim for 100-300 words max per answer).

Tasks:
1. Filter non-FAQs (blogs, lists, footers, etc.)
2. Fix formatting (add "?" to questions, clean markdown)
3. Keep original meaning and details
4. Select best 3-5 FAQs (MAX 5)
5. Keep answers concise - if an answer is very long, preserve the key information but trim unnecessary details

Raw FAQs:
${JSON.stringify(truncatedFAQs, null, 2)}

Return formatted FAQs preserving original content. MAX 5 items. Keep answers concise.`;

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      system:
        "Clean and format FAQs. PRESERVE original content. Only fix formatting. Return max 5 FAQs.",
      prompt: prompt,
      schema: faqsOutputSchema,
      schemaName: "FAQs",
      schemaDescription:
        "An array of cleaned FAQ items, each with a properly formatted question and answer. Maximum 5 items allowed.",
      temperature: 0.1, // Very low temperature to preserve original content and minimize hallucination
      mode: "json",
      maxOutputTokens: 8000, // Sufficient for up to 5 FAQs with detailed answers
    });

    // Ensure we never return more than 5 FAQs (schema limit)
    return object.faqs.slice(0, 5);
  } catch (error: any) {
    console.error("Error refining FAQs with AI:", error);

    // Try to extract partial results if JSON was truncated
    if (
      error.text &&
      (error.finishReason === "length" ||
        error.message?.includes("parse") ||
        error.message?.includes("Unterminated"))
    ) {
      try {
        let jsonText = error.text;

        // Strategy: Find the last complete FAQ item by looking for complete question/answer pairs
        // Look for patterns like: "question": "...",\n      "answer": "..."
        // Then find the closing brace after a complete answer

        // Find all complete FAQ items by looking for the pattern: }, followed by either }, or end
        const faqItemPattern =
          /"question":\s*"[^"]*",\s*\n\s*"answer":\s*"[^"]*"/g;
        const matches = Array.from(
          jsonText.matchAll(faqItemPattern)
        ) as RegExpMatchArray[];

        if (matches.length > 0) {
          // Find the position after the last complete FAQ item
          const lastMatch = matches[matches.length - 1];
          const matchIndex = lastMatch.index ?? -1;
          if (matchIndex >= 0 && lastMatch[0]) {
            const afterLastMatch = matchIndex + lastMatch[0].length;

            // Look for the closing brace of this FAQ item
            let closingBraceIndex = jsonText.indexOf("  }", afterLastMatch);
            if (closingBraceIndex === -1) {
              // Try to find it in the remaining text
              closingBraceIndex = jsonText.indexOf("\n    }", afterLastMatch);
            }

            if (closingBraceIndex > 0) {
              // Extract up to and including the last complete FAQ
              let fixedJson = jsonText.substring(0, closingBraceIndex + 3);

              // Remove trailing comma if present
              fixedJson = fixedJson.replace(/,\s*$/, "");

              // Close the array and object properly
              if (!fixedJson.trim().endsWith("]")) {
                fixedJson += "\n  ]";
              }
              if (!fixedJson.trim().endsWith("}")) {
                fixedJson += "\n}";
              }

              const partialResult = JSON.parse(fixedJson);
              if (
                partialResult.faqs &&
                Array.isArray(partialResult.faqs) &&
                partialResult.faqs.length > 0
              ) {
                console.warn(
                  `Extracted ${partialResult.faqs.length} FAQs from truncated response`
                );
                return partialResult.faqs.slice(0, 5);
              }
            }
          }
        }

        // Fallback: Try to find last complete closing brace pattern
        const lastBraceMatch = jsonText.lastIndexOf("\n    },\n");
        if (lastBraceMatch > 0) {
          let fixedJson = jsonText.substring(0, lastBraceMatch + 5);
          fixedJson = fixedJson.replace(/,\s*$/, "");
          if (!fixedJson.trim().endsWith("]")) fixedJson += "\n  ]";
          if (!fixedJson.trim().endsWith("}")) fixedJson += "\n}";

          const partialResult = JSON.parse(fixedJson);
          if (
            partialResult.faqs &&
            Array.isArray(partialResult.faqs) &&
            partialResult.faqs.length > 0
          ) {
            console.warn(
              `Extracted ${partialResult.faqs.length} FAQs from truncated response (fallback method)`
            );
            return partialResult.faqs.slice(0, 5);
          }
        }
      } catch (parseError) {
        // If we can't parse partial JSON, fall through to fallback
        console.warn(
          "Could not extract partial results from truncated JSON:",
          parseError
        );
      }
    }

    // Return filtered raw FAQs as fallback
    return rawFAQs
      .filter(
        (faq) =>
          faq.question.endsWith("?") &&
          faq.question.length < 200 &&
          faq.answer.length < 1000 &&
          !faq.question.toLowerCase().includes("visit profile") &&
          !faq.question.toLowerCase().includes("nearby locations") &&
          !faq.question.toLowerCase().includes("hours") &&
          !faq.question.toLowerCase().includes("contact us") &&
          !faq.question.match(/^\d+\.\s*$/) // Not just a number
      )
      .slice(0, 5); // Limit to 5 FAQs to match schema limit
  }
}

/**
 * Generates FAQs using AI when extraction fails
 */
export async function generateFAQsWithAI(
  brand: string,
  entityType?: string,
  location?: string
): Promise<Array<{ question: string; answer: string }>> {
  console.log(
    `[generateFAQsWithAI] Starting AI generation for brand: "${brand}", entityType: "${
      entityType || "N/A"
    }", location: "${location || "N/A"}"`
  );
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!googleApiKey) {
    console.warn(
      "[generateFAQsWithAI] GOOGLE_GENERATIVE_AI_API_KEY not set, returning empty FAQs"
    );
    return [];
  }

  const prompt = `Generate 3-5 frequently asked questions (FAQs) for a brick-and-mortar ${
    entityType || "business"
  } location${location ? ` in ${location}` : ""} called ${brand}.

Requirements:
- Questions should be location-specific and relevant to customers visiting this type of business
- Answers should be comprehensive, helpful, and include relevant details
- Questions should cover common topics like: hours, services, location, policies, contact information, parking, accessibility, etc.
- Make questions natural and match what real customers would ask
- Answers should be detailed enough to be helpful but concise
- Focus on information that would be useful for someone planning to visit this location`;

  try {
    console.log(
      `[generateFAQsWithAI] Calling AI model (gemini-2.5-flash) to generate FAQs...`
    );
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      system:
        "You are an expert at creating helpful FAQs for brick-and-mortar business locations. Generate realistic, location-specific questions and comprehensive answers.",
      prompt: prompt,
      schema: faqsOutputSchema,
      schemaName: "FAQs",
      schemaDescription:
        "An array of FAQ items, each with a question and answer string",
      temperature: 0.7,
      mode: "json",
      maxOutputTokens: 2000,
    });

    console.log(
      `[generateFAQsWithAI] Successfully generated ${object.faqs.length} FAQs`
    );
    return object.faqs;
  } catch (error) {
    console.error("[generateFAQsWithAI] Error generating FAQs with AI:", error);
    return [];
  }
}
