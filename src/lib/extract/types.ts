export type ExtractResult = {
  inputUrl: string;
  finalUrl?: string;

  metaTitle: string;
  metaDescription: string;

  canonicalUrl?: string;
  robotsMeta?: string;

  headings: { tag: string; text: string }[];

  contentHtml: string;
  contentText: string;
  wordCount: number;

  source: "firecrawl" | "local" | "playwright";
  qualityScore: number;
  warnings: string[];
};
