# SEO Content Extractor

A web application that extracts SEO-relevant content from any URL and exports it to professionally formatted Word documents with Poppins font styling.

## Features

- **Content Extraction**: Automatically extracts meta titles, descriptions, headings, and main content while filtering out navigation, headers, footers, and cookie banners
- **Dual Extraction Methods**: Uses Firecrawl as primary extractor with local fallback (jsdom + Readability) for reliability
- **Meta Comparison**: Side-by-side table comparing current vs optimized meta title and description
- **Word Export**: Generate professionally formatted Word documents (.docx) with Poppins font styling
- **SSRF Protection**: Built-in security to prevent server-side request forgery attacks
- **Quality Scoring**: Automatic content quality assessment

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Primary Extractor**: [Firecrawl](https://firecrawl.dev) Node SDK
- **Fallback Extractor**: jsdom + @mozilla/readability + sanitize-html
- **Word Export**: docx library
- **Styling**: Tailwind CSS + Poppins font

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firecrawl API key (get one at [firecrawl.dev](https://firecrawl.dev))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/seo-content-extractor.git
cd seo-content-extractor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` and add your Firecrawl API key:
```
FIRECRAWL_API_KEY=fc-YOUR_API_KEY_HERE
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter a URL in the input field
2. Click "Extract" to fetch and analyze the page content
3. Review the extracted meta information in the comparison table
4. Enter optimized meta title and description in the editable fields
5. Review the heading structure and page content below
6. Click "Export Word" to download a formatted .docx report

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── extract/
│   │       └── route.ts      # API endpoint for extraction
│   ├── extractor/
│   │   └── page.tsx          # Main extractor UI
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with Poppins font
│   └── page.tsx              # Landing page
└── lib/
    ├── export/
    │   └── docx.ts           # Word document generation
    └── extract/
        ├── firecrawl.ts      # Firecrawl SDK integration
        ├── local.ts          # Local fallback extractor
        ├── postprocess.ts    # Content processing & scoring
        ├── ssrf.ts           # SSRF protection
        └── types.ts          # TypeScript types
```

## Deployment on Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add the `FIRECRAWL_API_KEY` environment variable in Vercel project settings
4. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FIRECRAWL_API_KEY` | Your Firecrawl API key | Yes |

## Security

- **SSRF Protection**: All URLs are validated to prevent requests to private/internal networks
- **Content Sanitization**: All extracted HTML is sanitized before rendering
- **DNS Validation**: Blocks localhost, private IPs, and metadata endpoints

## License

MIT
