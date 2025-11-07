# Best Practices for Extract

> Learn the best practices for web content extraction process

## Extracting web content using Tavily

Efficiently extracting content from web pages is crucial for AI-powered applications. Tavily provides two main approaches to content extraction, each suited for different use cases.

### 1. One-step extraction: directly retrieve `raw_content`

You can extract web content by enabling `include_raw_content = true` when making a Tavily Search API call. This allows you to retrieve both search results and extracted content in a single step.

**However**, this can increase latency because you may extract raw content from sources that are not relevant in the first place. It's recommended to split the process into two steps: running multiple sub-queries to expand the pool of sources, then curating the most relevant documents based on content snippets or source scores. By extracting raw content from the most relevant sources, you get high-quality RAG documents.

### 2. Two-step process: search, then extract

For better accuracy and customization, we recommend a two-step process:

> #### Step 1: Search

Use the Tavily Search API to retrieve relevant web pages, which output URLs.

> #### Step 2: Extract

Use the Tavily Extract API to fetch the full content from the most relevant URLs.

**Example:**

```python theme={null}
import asyncio
from tavily import AsyncTavilyClient

tavily_client = AsyncTavilyClient(api_key="tvly-YOUR_API_KEY")

async def fetch_and_extract():
   # Define the queries with search_depth and max_results inside the query dictionary
   queries = [
       {"query": "AI applications in healthcare", "search_depth": "advanced", "max_results": 10},
       {"query": "ethical implications of AI in healthcare", "search_depth": "advanced", "max_results": 10},
       {"query": "latest trends in machine learning healthcare applications", "search_depth": "advanced",
        "max_results": 10},
       {"query": "AI and healthcare regulatory challenges", "search_depth": "advanced", "max_results": 10}
   ]

   # Perform the search queries concurrently, passing the entire query dictionary
   responses = await asyncio.gather(*[tavily_client.search(**q) for q in queries])

   # Filter URLs with a score greater than 0.5. Alternatively, you can use a re-ranking model or an LLM to identify the most relevant sources, or cluster your documents and extract content only from the most relevant cluster
   relevant_urls = []
   for response in responses:
       for result in response.get('results', []):
           if result.get('score', 0) > 0.5:
               relevant_urls.append(result.get('url'))

   # Extract content from the relevant URLs
   extracted_data = await asyncio.gather(*(tavily_client.extract(url) for url in relevant_urls))

   # Print the extracted content
   for data in extracted_data:
       print(data)

# Run the function
asyncio.run(fetch_and_extract())
```

#### **Pros of two-Step extraction**

✅ **More control** – Extract only from selected URLs.

✅ **Higher accuracy** – Filter out irrelevant results before extraction.

✅ **Advanced extraction capabilities** – Using `search_depth = "advanced"`.

#### **Cons of two-step extraction**

❌ slightly more expensive.

### Using advanced extraction

Using `extract_depth = "advanced"` in the Extract API allows for more comprehensive content retrieval. This mode is particularly useful when dealing with:

- **Complex web pages** with dynamic content, embedded media, or structured data.
- **Tables and structured information** that require accurate parsing.
- **Higher success rates**.

> If precision and depth are priorities for your application, `extract_depth = "advanced"` is the recommended choice.
