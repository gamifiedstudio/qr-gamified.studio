# QR Code Generator

Multi-format QR code generator with a web app, CLI tool, and MCP server. Built with React 19 and Bun.

**Live at [qr.gamified.studio](https://qr.gamified.studio)**

## Features

- **10 QR types** -- URL, Text, vCard, Wi-Fi, Email, Phone, SMS, Calendar Event, MeCard, X/Twitter Profile
- **vCard support** -- Full RFC 2426 contact cards with multiple phones, emails, and addresses
- **Bulk generation** -- Import contacts via CSV or JSON, generate QR codes in batch, download as ZIP
- **Style customization** -- Dot patterns, corner styles, colors, and logo embedding
- **Multiple export formats** -- PNG, SVG, WEBP
- **SEO** -- Server-side meta injection for social previews and search engines
- **CLI** -- Generate vCard QR codes from the terminal
- **MCP server** -- Expose QR generation to AI assistants via the Model Context Protocol

## Tech Stack

| Layer      | Tech                                         |
| ---------- | -------------------------------------------- |
| Framework  | Vite, React 19, React Router DOM             |
| Language   | TypeScript (strict mode)                     |
| Styling    | Tailwind v4, CSS variables, shadcn/ui        |
| QR         | qr-code-styling (web), qrcode (CLI/MCP)     |
| Server     | Bun static file server with SEO injection    |
| MCP        | @modelcontextprotocol/sdk                    |

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

Starts the Vite dev server at `http://localhost:5173`.

### Build

```bash
bun build
```

Generates OG images, runs TypeScript checks, and produces the production bundle in `dist/`.

### Production

```bash
bun start
```

Runs the Bun production server (serves `dist/` with SPA fallback and SEO injection).

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
      "args": ["run", "/path/to/qr-gamified.studio/src/mcp/server.ts"]
    }
  }
}
```

## Project Structure

```
src/
  App.tsx                  # Main app with router
  main.tsx                 # Entry point
  qr-types.ts             # QR type definitions and encoders
  vcard.ts                 # vCard encoding logic
  seo.ts                   # Client-side SEO metadata
  BulkVCard.tsx            # Bulk vCard generation page
  components/
    ui/                    # shadcn/ui primitives
    AddressSearch.tsx      # Address autocomplete
  lib/
    qr-generator.ts        # QR generation logic
    utils.ts               # cn() utility
  cli/index.ts             # CLI entry point
  mcp/server.ts            # MCP server entry point
server.ts                  # Production Bun server (SEO injection, SPA fallback)
scripts/generate-og-images.ts  # OG image generation (runs at build time)
```

## License

MIT
