"use client";

import { useState, useCallback } from "react";
import type { ExtractResult } from "@/lib/extract/types";

export default function ExtractorPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [optimizedTitle, setOptimizedTitle] = useState("");
  const [optimizedDescription, setOptimizedDescription] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExtract = useCallback(async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      setResult(data);
      setOptimizedTitle("");
      setOptimizedDescription("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleExport = useCallback(async () => {
    if (!result) return;

    setExporting(true);
    try {
      const { generateDocx } = await import("@/lib/export/docx");
      const blob = await generateDocx(result, {
        optimizedTitle,
        optimizedDescription,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seo-report-${new Date().toISOString().split("T")[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [result, optimizedTitle, optimizedDescription]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SEO Content Extractor
          </h1>
          <p className="text-gray-600">
            Extract SEO content from any URL and export to a formatted Word
            document
          </p>
        </header>

        {/* URL Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to extract (e.g., https://example.com/page)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleExtract()}
            />
            <button
              onClick={handleExtract}
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Extracting...
                </span>
              ) : (
                "Extract"
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Meta Table - 2 Columns */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Meta Information
                </h2>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  {exporting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Export Word
                    </>
                  )}
                </button>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 w-1/6">
                      Field
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 w-5/12">
                      Current
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 w-5/12">
                      Optimized
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700 bg-gray-50">
                      Meta Title
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      {result.metaTitle || (
                        <span className="text-gray-400 italic">(not set)</span>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {result.metaTitle?.length || 0} characters
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <input
                        type="text"
                        value={optimizedTitle}
                        onChange={(e) => setOptimizedTitle(e.target.value)}
                        placeholder="Enter optimized title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        {optimizedTitle.length} characters (recommended: 50-60)
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700 bg-gray-50">
                      Meta Description
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      {result.metaDescription || (
                        <span className="text-gray-400 italic">(not set)</span>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {result.metaDescription?.length || 0} characters
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <textarea
                        value={optimizedDescription}
                        onChange={(e) =>
                          setOptimizedDescription(e.target.value)
                        }
                        placeholder="Enter optimized description..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        {optimizedDescription.length} characters (recommended:
                        150-160)
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Word Count</div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.wordCount}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Quality Score</div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.qualityScore}/100
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Headings</div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.headings.length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Source</div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {result.source}
                </div>
              </div>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-amber-800 mb-2">Warnings</h3>
                <ul className="list-disc list-inside text-amber-700">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Heading Structure */}
            {result.headings.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Heading Structure
                </h2>
                <div className="space-y-1">
                  {result.headings.map((h, i) => {
                    const level = parseInt(h.tag.slice(1));
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${(level - 1) * 24}px` }}
                      >
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-mono rounded">
                          {h.tag.toUpperCase()}
                        </span>
                        <span className="text-gray-700">{h.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Page Content
              </h2>
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: result.contentHtml }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
