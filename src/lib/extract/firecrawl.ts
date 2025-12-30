import Firecrawl from "@mendable/firecrawl-js";

export async function firecrawlScrape(url: string) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("Missing FIRECRAWL_API_KEY");

  const firecrawl = new Firecrawl({ apiKey });

  // Firecrawl v4 throws on error and returns document directly on success
  const doc = await firecrawl.scrape(url, {
    formats: ["html", "markdown"],
  });

  if (!doc || !doc.html) {
    throw new Error("Firecrawl returned empty content");
  }

  return doc;
}
