import { JSDOM } from "jsdom";

function textFromHtml(html: string): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}

function extractHeadings(html: string): { tag: string; text: string }[] {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  return Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"))
    .map((h) => ({
      tag: h.tagName.toLowerCase(),
      text: (h.textContent || "").trim(),
    }))
    .filter((h) => h.text);
}

function wordCount(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function scoreContent(contentText: string): { score: number; wc: number } {
  const wc = wordCount(contentText);
  let score = 0;
  if (wc >= 1200) score = 100;
  else if (wc >= 600) score = 85;
  else if (wc >= 300) score = 70;
  else if (wc >= 150) score = 50;
  else score = 25;
  return { score, wc };
}

export function postProcess(contentHtml: string): {
  headings: { tag: string; text: string }[];
  contentText: string;
  wordCount: number;
  qualityScore: number;
  warnings: string[];
} {
  const headings = extractHeadings(contentHtml);
  const contentText = textFromHtml(contentHtml);
  const { score, wc } = scoreContent(contentText);

  const warnings: string[] = [];
  if (wc < 150)
    warnings.push(
      "Extracted content is very short. Page may be JS-rendered or blocked."
    );

  return {
    headings,
    contentText,
    wordCount: wc,
    qualityScore: score,
    warnings,
  };
}
