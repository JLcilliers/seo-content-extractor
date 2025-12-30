import { NextResponse } from "next/server";
import { z } from "zod";
import { validatePublicHttpUrl } from "@/lib/extract/ssrf";
import { firecrawlScrape } from "@/lib/extract/firecrawl";
import { postProcess } from "@/lib/extract/postprocess";
import type { ExtractResult } from "@/lib/extract/types";

export const runtime = "nodejs";

const BodySchema = z.object({ url: z.string() });

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}

function getString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  return "";
}

export async function POST(req: Request) {
  let firecrawlErrorMsg: string | null = null;
  let localErrorMsg: string | null = null;

  // Dynamic import for sanitize-html
  const sanitizeHtml = (await import("sanitize-html")).default;

  function safeRenderHtml(html: string): string {
    return sanitizeHtml(html, {
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
      allowedAttributes: { a: ["href", "target", "rel"], "*": ["id", "class"] },
    });
  }

  try {
    const { url: rawUrl } = BodySchema.parse(await req.json());
    const url = await validatePublicHttpUrl(rawUrl);

    // 1) Firecrawl first
    try {
      const response = await firecrawlScrape(url);
      const metadata = response.metadata as Record<string, unknown> | undefined;

      const metaTitle = getString(metadata?.title);
      const metaDescription = getString(metadata?.description);
      const canonicalUrl = getString(metadata?.ogUrl) || getString(metadata?.sourceURL);
      const robotsMeta = getString(metadata?.robots);

      const contentHtml = safeRenderHtml(getString(response.html));
      const pp = postProcess(contentHtml);

      const result: ExtractResult = {
        inputUrl: url,
        finalUrl: getString(metadata?.sourceURL) || url,
        metaTitle,
        metaDescription,
        canonicalUrl: canonicalUrl || undefined,
        robotsMeta: robotsMeta || undefined,
        headings: pp.headings,
        contentHtml,
        contentText: pp.contentText,
        wordCount: pp.wordCount,
        source: "firecrawl",
        qualityScore: pp.qualityScore,
        warnings: pp.warnings,
      };

      // If quality is acceptable, return immediately
      if (result.qualityScore >= 50 && result.contentText.length > 400) {
        return NextResponse.json(result);
      }

      // Otherwise fall through to local fallback
    } catch (firecrawlError) {
      firecrawlErrorMsg = firecrawlError instanceof Error ? firecrawlError.message : "Unknown firecrawl error";
      console.error("Firecrawl error:", firecrawlErrorMsg);
      // Fall through to local fallback
    }

    // 2) Local fallback - dynamic import
    try {
      const { localExtract } = await import("@/lib/extract/local");
      const local = await localExtract(url);
      const contentHtml = safeRenderHtml(local.contentHtml);
      const pp = postProcess(contentHtml);

      const result: ExtractResult = {
        inputUrl: url,
        finalUrl: local.finalUrl,
        metaTitle: local.metaTitle,
        metaDescription: local.metaDescription,
        canonicalUrl: local.canonicalUrl || undefined,
        robotsMeta: local.robotsMeta || undefined,
        headings: pp.headings,
        contentHtml,
        contentText: pp.contentText,
        wordCount: pp.wordCount,
        source: "local",
        qualityScore: pp.qualityScore,
        warnings: pp.warnings,
      };

      return NextResponse.json(result);
    } catch (localError) {
      localErrorMsg = localError instanceof Error ? localError.message : "Unknown local error";
      console.error("Local fallback error:", localErrorMsg);
    }

    // Both methods failed
    const errorDetails = [
      firecrawlErrorMsg ? `Firecrawl: ${firecrawlErrorMsg}` : null,
      localErrorMsg ? `Local: ${localErrorMsg}` : null,
    ].filter(Boolean).join("; ");

    return NextResponse.json({ error: `Extraction failed. ${errorDetails}` }, { status: 500 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
