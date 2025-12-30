import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Packer,
} from "docx";
import type { ExtractResult } from "@/lib/extract/types";

// Poppins font sizes (in half-points, so multiply pt by 2)
const FONT_SIZES = {
  h1: 48, // 24pt
  h2: 40, // 20pt
  h3: 36, // 18pt
  h4: 32, // 16pt
  h5: 28, // 14pt
  h6: 24, // 12pt
  body: 24, // 12pt
  small: 20, // 10pt
};

const FONT_NAME = "Poppins";

interface DocxOptions {
  optimizedTitle?: string;
  optimizedDescription?: string;
}

export async function generateDocx(
  data: ExtractResult,
  options: DocxOptions = {}
): Promise<Blob> {
  const sections: Paragraph[] = [];

  // Title
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "SEO Content Extraction Report",
          font: FONT_NAME,
          size: FONT_SIZES.h1,
          bold: true,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    })
  );

  // URL Info
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Source URL: ",
          font: FONT_NAME,
          size: FONT_SIZES.body,
          bold: true,
        }),
        new TextRun({
          text: data.inputUrl,
          font: FONT_NAME,
          size: FONT_SIZES.body,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  if (data.finalUrl && data.finalUrl !== data.inputUrl) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Final URL: ",
            font: FONT_NAME,
            size: FONT_SIZES.body,
            bold: true,
          }),
          new TextRun({
            text: data.finalUrl,
            font: FONT_NAME,
            size: FONT_SIZES.body,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Meta Data Table
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Meta Information",
          font: FONT_NAME,
          size: FONT_SIZES.h2,
          bold: true,
        }),
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header Row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Field",
                    font: FONT_NAME,
                    size: FONT_SIZES.body,
                    bold: true,
                  }),
                ],
              }),
            ],
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: "E5E7EB" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Current",
                    font: FONT_NAME,
                    size: FONT_SIZES.body,
                    bold: true,
                  }),
                ],
              }),
            ],
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: { fill: "E5E7EB" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Optimized",
                    font: FONT_NAME,
                    size: FONT_SIZES.body,
                    bold: true,
                  }),
                ],
              }),
            ],
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: { fill: "E5E7EB" },
          }),
        ],
      }),
      // Title Row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Meta Title",
                    font: FONT_NAME,
                    size: FONT_SIZES.body,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.metaTitle || "(not set)",
                    font: FONT_NAME,
                    size: FONT_SIZES.body,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: options.optimizedTitle || "",
                    font: FONT_NAME,
                    size: FONT_SIZES.body,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Description Row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Meta Description",
                    font: FONT_NAME,
                    size: FONT_SIZES.body,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.metaDescription || "(not set)",
                    font: FONT_NAME,
                    size: FONT_SIZES.body,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: options.optimizedDescription || "",
                    font: FONT_NAME,
                    size: FONT_SIZES.body,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
    },
  });

  // Stats section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Content Statistics",
          font: FONT_NAME,
          size: FONT_SIZES.h2,
          bold: true,
        }),
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Word Count: ${data.wordCount}`,
          font: FONT_NAME,
          size: FONT_SIZES.body,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Quality Score: ${data.qualityScore}/100`,
          font: FONT_NAME,
          size: FONT_SIZES.body,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Extraction Source: ${data.source}`,
          font: FONT_NAME,
          size: FONT_SIZES.body,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Heading Structure
  if (data.headings.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Heading Structure",
            font: FONT_NAME,
            size: FONT_SIZES.h2,
            bold: true,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    for (const heading of data.headings) {
      const indent = (parseInt(heading.tag.slice(1)) - 1) * 400;
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${heading.tag.toUpperCase()}] ${heading.text}`,
              font: FONT_NAME,
              size: FONT_SIZES.body,
            }),
          ],
          indent: { left: indent },
          spacing: { after: 100 },
        })
      );
    }
  }

  // Main Content
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Page Content",
          font: FONT_NAME,
          size: FONT_SIZES.h2,
          bold: true,
        }),
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  // Split content into paragraphs
  const contentParagraphs = data.contentText.split(/\n\n+/);
  for (const para of contentParagraphs) {
    if (para.trim()) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: para.trim(),
              font: FONT_NAME,
              size: FONT_SIZES.body,
            }),
          ],
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  }

  // Warnings
  if (data.warnings.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Warnings",
            font: FONT_NAME,
            size: FONT_SIZES.h2,
            bold: true,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    for (const warning of data.warnings) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `\u26A0 ${warning}`,
              font: FONT_NAME,
              size: FONT_SIZES.body,
              color: "B45309",
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        children: [sections[0], sections[1], sections[2], metaTable, ...sections.slice(3)],
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: FONT_NAME,
            size: FONT_SIZES.body,
          },
        },
      },
    },
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
