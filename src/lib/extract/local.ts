import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import sanitizeHtml from "sanitize-html";

function pickMeta(doc: Document, selector: string): string {
  return (doc.querySelector(selector)?.getAttribute("content") || "").trim();
}

function stripChrome(doc: Document): void {
  doc
    .querySelectorAll("script, style, noscript, iframe")
    .forEach((n) => n.remove());
  doc
    .querySelectorAll("header, nav, footer, aside")
    .forEach((n) => n.remove());
  doc
    .querySelectorAll(
      '[role="navigation"], [role="banner"], [role="contentinfo"]'
    )
    .forEach((n) => n.remove());

  const kill = [
    ".header",
    "#header",
    ".site-header",
    ".nav",
    ".navbar",
    ".menu",
    "#menu",
    ".footer",
    "#footer",
    ".site-footer",
    ".cookie",
    ".cookies",
    ".cookie-banner",
    ".consent",
    ".gdpr",
    ".modal",
    ".popup",
  ];
  doc.querySelectorAll(kill.join(",")).forEach((n) => n.remove());
}

export async function localExtract(url: string) {
  const resp = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SEOExtractor/1.0)",
    },
  });

  if (!resp.ok) throw new Error(`Fetch failed (${resp.status})`);
  const finalUrl = resp.url;
  const html = await resp.text();

  const dom = new JSDOM(html, { url: finalUrl });
  const doc = dom.window.document;

  const metaTitle = (doc.querySelector("title")?.textContent || "").trim();
  const metaDescription =
    pickMeta(doc, 'meta[name="description"]') ||
    pickMeta(doc, 'meta[property="og:description"]') ||
    "";

  const canonicalUrl = (
    doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || ""
  ).trim();
  const robotsMeta = pickMeta(doc, 'meta[name="robots"]');

  stripChrome(doc);

  const reader = new Readability(doc);
  const article = reader.parse();

  const rawHtml = article?.content || "";
  const contentHtml = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      "*": ["id", "class"],
    },
  });

  return {
    finalUrl,
    metaTitle,
    metaDescription,
    canonicalUrl,
    robotsMeta,
    contentHtml,
  };
}
