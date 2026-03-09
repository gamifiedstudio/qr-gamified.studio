# QR Code Generator

Multi-format QR code generator with a web app, blog, CLI tool, and MCP server. Built with Next.js 15 and React 19.

**Live at [qr.gamified.studio](https://qr.gamified.studio)**

## Features

- **10 QR types** -- URL, Text, vCard, Wi-Fi, Email, Phone, SMS, Calendar Event, MeCard, X/Twitter Profile
- **vCard support** -- Full RFC 2426 contact cards with multiple phones, emails, and addresses
- **Bulk generation** -- Import contacts via CSV or JSON, generate QR codes in batch, download as ZIP
- **Style customization** -- Dot patterns, corner styles, colors, and logo embedding
- **Multiple export formats** -- PNG, SVG, WEBP
- **Blog** -- MDX-powered blog with syntax highlighting, table of contents, and JSON-LD schemas
- **SEO** -- Per-route metadata, dynamic OG images, sitemap, and structured data
- **CLI** -- Generate vCard QR codes from the terminal
- **MCP server** -- Expose QR generation to AI assistants via the Model Context Protocol (stdio + HTTP)

## Tech Stack

| Layer      | Tech                                              |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 15, React 19, App Router                  |
| Language   | TypeScript (strict mode)                           |
| Styling    | Tailwind v4, CSS variables (oklch), shadcn/ui      |
| QR         | qr-code-styling (web), qrcode (CLI/MCP)           |
| Blog       | MDX (next-mdx-remote/rsc), rehype-pretty-code      |
| MCP        | @modelcontextprotocol/sdk                          |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+

### Install

```bash
bun install
```

### Development

```bash
bun dev
```

Starts the Next.js dev server with Turbopack at `http://localhost:3000`.

### Build

```bash
bun build
```

Produces a standalone Next.js build in `.next/standalone/`.

### Production

```bash
bun start
```

Runs the standalone Node.js server (`node .next/standalone/server.js`).

## CLI

Generate vCard QR codes from the command line:

```bash
bun run cli --first-name John --last-name Doe \
  --org "Acme Corp" --title "Engineer" \
  --phone "CELL:+1234567890" \
  --email "WORK:john@acme.com" \
  --address "123 Main St;;Springfield;IL;62701;US" \
  -o john_doe_qr.png
```

Key options:

| Flag | Description |
| ---- | ----------- |
| `-f, --first-name` | First name |
| `-l, --last-name` | Last name |
| `--org` | Organization |
| `--title` | Job title |
| `--phone` | Phone as `TYPE:number` (repeatable) |
| `--email` | Email as `TYPE:address` (repeatable) |
| `--address` | Semicolon-delimited or JSON (repeatable) |
| `--url` | Website URL |
| `-o, --output` | Output file path (default: `<name>_qr.png`) |
| `--vcard-only` | Output raw vCard text instead of QR image |
| `-h, --help` | Show full help |

## MCP Server

Expose QR generation to AI assistants over stdio:

```bash
bun run mcp
```

The MCP server is also available over HTTP at `/mcp` on the production site.

### Tools

| Tool | Description |
| ---- | ----------- |
| `generate_vcard_qr` | Generate a vCard QR code, returns base64 PNG |
| `generate_vcard_qr_file` | Generate a vCard QR code and save to a file |
| `generate_vcard_text` | Generate raw vCard text (for .vcf files) |

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "vcard-qr": {
      "command": "bun",
      "args": ["run", "/path/to/qr-gamified.studio/src/mcp/stdio.ts"]
    }
  }
}
```

## Project Structure

```
src/
  app/
    layout.tsx               # Root layout (ThemeProvider, fonts, globals)
    page.tsx                 # Home — QR generator (default URL type)
    [type]/page.tsx          # QR generator per type (url, text, wifi, etc.)
    vcard/
      page.tsx               # vCard QR generator
      bulk/page.tsx          # Bulk vCard generation
    blog/
      page.tsx               # Blog listing with tag filtering
      [slug]/page.tsx        # Blog post (MDX rendering, JSON-LD, ToC)
    docs/mcp/page.tsx        # MCP server documentation
    policies/
      privacy/page.tsx       # Privacy policy
      tos/page.tsx           # Terms of service
    mcp/route.ts             # MCP endpoint (Streamable HTTP)
    sitemap.ts               # Dynamic sitemap
    robots.ts                # robots.txt
  components/
    ui/                      # shadcn/ui primitives
    QRGenerator.tsx          # Main QR generator (client component)
    BulkVCard.tsx            # Bulk vCard generator (client component)
    AddressSearch.tsx        # Address autocomplete
  content/blog/              # MDX blog posts
  lib/
    qr-generator.ts          # QR generation logic
    blog.ts                  # Blog content loading
    utils.ts                 # cn() utility
  qr-types.ts               # QR type definitions + encoders
  vcard.ts                   # vCard encoding logic
  seo.ts                     # Per-route SEO metadata
  mcp/
    tools.ts                 # Shared MCP tool definitions
    stdio.ts                 # Stdio transport (local/Claude Code)
    http.ts                  # HTTP transport handler
  cli/index.ts               # CLI entry point
```

## License

MIT
