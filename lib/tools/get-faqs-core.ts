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
    .max(10)
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
  try {
    // If locationUrl is provided, try to extract directly from it
    if (locationUrl) {
      try {
        const extracted = await getTavilyClient().extract([locationUrl], {
          extractDepth: "advanced",
        });

        if (extracted?.results && extracted.results.length > 0) {
          const firstResult = extracted.results[0];
          if (firstResult?.rawContent) {
            const faqs = extractFAQsFromText(firstResult.rawContent);
            if (faqs.length > 0) {
              // Refine the extracted FAQs using AI
              return await refineFAQsWithAI(faqs, brand, entityType, location);
            }
          }
        }
      } catch (error) {
        console.warn(
          `Failed to extract from provided URL ${locationUrl}:`,
          error
        );
      }
    }

    // Build search query for location landing page
    // Be more specific to avoid blog posts and forums
    const queryParts = [brand];
    if (location) {
      queryParts.push(location);
    }
    queryParts.push(
      "location",
      "store",
      "branch",
      "FAQ",
      "frequently asked questions"
    );
    // Don't use site: operators as Tavily may not support them
    // Instead, we'll filter URLs after getting results
    const query = queryParts.join(" ");

    // Search for location landing pages
    const searchResponse = await getTavilyClient().search(query, {
      search_depth: "advanced",
      max_results: 5,
    });

    // Filter URLs that look like location landing pages
    // Exclude blog posts, Reddit, forums, review sites
    const relevantUrls: string[] = [];
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
    ];

    for (const result of searchResponse.results || []) {
      const url = result.url;
      if (url && (result.score || 0) > 0.3) {
        const urlLower = url.toLowerCase();

        // Skip if it's from an excluded domain
        const isExcluded = excludedDomains.some((domain) =>
          urlLower.includes(domain)
        );
        if (isExcluded) {
          continue;
        }

        // Check if URL looks like a location page
        if (
          urlLower.includes("/location") ||
          urlLower.includes("/locations") ||
          urlLower.includes("/store") ||
          urlLower.includes("/branch") ||
          urlLower.includes("/find") ||
          urlLower.includes("/near") ||
          (urlLower.includes(brand.toLowerCase().replace(/[^a-z0-9]/g, "")) &&
            !urlLower.includes("/blog") &&
            !urlLower.includes("/news") &&
            !urlLower.includes("/article"))
        ) {
          relevantUrls.push(url);
        }
      }
    }

    // If no location-specific URLs found, try the top results
    if (relevantUrls.length === 0 && searchResponse.results) {
      relevantUrls.push(
        ...searchResponse.results
          .slice(0, 3)
          .map((r) => r.url)
          .filter((url): url is string => !!url)
      );
    }

    // Extract content from relevant URLs (batch extract)
    let extractedContents: string[] = [];
    if (relevantUrls.length > 0) {
      try {
        const extracted = await getTavilyClient().extract(relevantUrls, {
          extractDepth: "advanced",
        });

        if (extracted?.results) {
          extractedContents = extracted.results
            .map((result) => result?.rawContent || "")
            .filter((content) => content.length > 0);
        }
      } catch (error) {
        console.warn(`Failed to extract from URLs:`, error);
        // Try extracting one by one as fallback
        extractedContents = await Promise.all(
          relevantUrls.map(async (url) => {
            try {
              const extracted = await getTavilyClient().extract([url], {
                extractDepth: "advanced",
              });
              return extracted?.results?.[0]?.rawContent || "";
            } catch (err) {
              console.warn(`Failed to extract from ${url}:`, err);
              return "";
            }
          })
        );
      }
    }

    // Try to extract FAQs from all extracted content
    let allExtractedFAQs: Array<{ question: string; answer: string }> = [];
    for (const content of extractedContents) {
      if (content) {
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
          // Skip blog/forum content
          continue;
        }

        const faqs = extractFAQsFromText(content);
        if (faqs.length > 0) {
          allExtractedFAQs.push(...faqs);
        }
      }
    }

    // Refine the extracted FAQs using AI
    if (allExtractedFAQs.length > 0) {
      const refinedFAQs = await refineFAQsWithAI(
        allExtractedFAQs,
        brand,
        entityType,
        location
      );

      // If refinement filtered everything out, it might be blog content
      // Return empty array so we can fall back to AI generation
      if (refinedFAQs.length === 0 && allExtractedFAQs.length > 3) {
        return [];
      }

      return refinedFAQs;
    }

    return [];
  } catch (error) {
    console.error("Error in searchAndExtractFAQs:", error);
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

  const prompt = `You are cleaning up and refining FAQs extracted from a website for ${brand}${
    entityType ? ` (${entityType})` : ""
  }${location ? ` in ${location}` : ""}.

Below are raw FAQs that were extracted from a web page. Some may be incorrectly formatted, contain non-FAQ content (like lists, hours, contact info, footers), or have questions and answers mixed together.

CRITICAL INSTRUCTIONS:
- PRESERVE the original content from the scraped FAQs. Do NOT invent new information or answers.
- Only clean up formatting, remove markdown artifacts, and fix minor issues.
- Keep the original meaning and details from the scraped content.
- If a FAQ is valid but poorly formatted, fix the formatting while keeping the original content.
- Do NOT rewrite answers with information you think might be correct - only use what was actually scraped.

Your task:
1. Filter out any items that are NOT actual FAQs, including:
   - Blog posts, Reddit comments, forum discussions
   - Lists of advisors, team members, or staff
   - Hours listings (unless part of a question)
   - Contact info, navigation links, footers
   - Social media sharing buttons or "buy me a coffee" links
   - Review site content or user-generated content
   - Any content that looks like it's from a blog, forum, or social media
2. Ensure each question ends with a "?" and is a proper question (fix formatting only, don't change meaning)
3. Clean up answers to remove markdown artifacts, extra formatting, URLs, and ensure they're readable - but PRESERVE the original content and meaning
4. Separate questions from answers if they're mixed together
5. Keep only the most relevant FAQs that are official business information
6. Ensure questions are customer-focused and location-specific where possible
7. If the content appears to be from blogs, Reddit, forums, or review sites, return an empty array

CRITICAL: You MUST return AT MOST 10 FAQs. The response schema enforces a maximum of 10 items. If you return more than 10 FAQs, the validation will fail. Select only the best, most relevant FAQs (aim for 5-10 items).

Raw FAQs to refine (showing up to 15):
${JSON.stringify(rawFAQs.slice(0, 15), null, 2)}

Return only properly formatted FAQs that preserve the original scraped content. Remember: MAXIMUM 10 FAQs, and PRESERVE the original information - do not invent or hallucinate content.`;

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      system:
        "You are an expert at cleaning and formatting FAQs. Your job is to PRESERVE the original scraped content while cleaning up formatting. Do NOT invent or hallucinate information - only use what was actually scraped. Filter out non-FAQ content and ensure proper question/answer formatting. CRITICAL: You must return at most 10 FAQs. The schema validation will fail if you return more than 10 items.",
      prompt: prompt,
      schema: faqsOutputSchema,
      schemaName: "FAQs",
      schemaDescription:
        "An array of cleaned FAQ items, each with a properly formatted question and answer. Maximum 10 items allowed.",
      temperature: 0.1, // Very low temperature to preserve original content and minimize hallucination
      mode: "json",
      maxOutputTokens: 4000, // Increased to handle up to 10 FAQs with detailed answers
    });

    // Ensure we never return more than 10 FAQs (schema limit)
    return object.faqs.slice(0, 10);
  } catch (error) {
    console.error("Error refining FAQs with AI:", error);
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
      .slice(0, 10); // Changed from 8 to 10 to match schema limit
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
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!googleApiKey) {
    console.warn("GOOGLE_GENERATIVE_AI_API_KEY not set, returning empty FAQs");
    return [];
  }

  const prompt = `Generate 5-8 frequently asked questions (FAQs) for a brick-and-mortar ${
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

    return object.faqs;
  } catch (error) {
    console.error("Error generating FAQs with AI:", error);
    return [];
  }
}
