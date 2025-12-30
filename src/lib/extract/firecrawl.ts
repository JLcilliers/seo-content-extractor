import Firecrawl from "@mendable/firecrawl-js";

export async function firecrawlScrape(url: string) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("Missing FIRECRAWL_API_KEY");

  const firecrawl = new Firecrawl({ apiKey });

  const res = await firecrawl.scrape(url, {
    formats: ["html", "markdown"],
    blockAds: true,
    timeout: 60000,
    waitFor: 0,
    removeBase64Images: true,
  });

  if (!res) {
    throw new Error("Firecrawl scrape failed.");
  }

  return res;
}
