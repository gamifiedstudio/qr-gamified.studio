# QR Code Generator (BTI)

Multi-format QR code generator with web app, blog, CLI, and MCP server. Next.js 15 App Router with standalone output for Railway.

## Commands

```bash
bun dev          # Next.js dev server (Turbopack) :3000
bun build        # Next.js production build (standalone output)
bun start        # Production server (node .next/standalone/server.js)
bun run cli      # CLI tool
bun run mcp      # MCP server (stdio, for local/Claude Code)
                   # Remote MCP: served at /mcp via Next.js route handler
bun lint         # ESLint (next lint)
bun run indexnow # Submit URLs to search engines after deploy
```

## Tech Stack

| Layer      | Tech                                              |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 15, React 19, App Router                  |
| Language   | TypeScript (strict mode)                           |
| Styling    | Tailwind v4, CSS variables (oklch), @tailwindcss/postcss |
| Components | shadcn/ui (Radix), CVA for variants               |
| Icons      | lucide-react                                       |
| Dark mode  | next-themes (defaultTheme="dark")                  |
| QR         | qr-code-styling (web), qrcode (CLI/MCP)           |
| Blog       | MDX (next-mdx-remote/rsc), gray-matter, rehype-pretty-code, remark-gfm |
| CLI        | Bun executable (`bun run src/cli/index.ts`)        |
| MCP        | @modelcontextprotocol/sdk (route handler + stdio)  |

## Structure

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
      layout.tsx             # Blog metadata template
      page.tsx               # Blog listing with tag filtering
      opengraph-image.tsx    # Blog listing OG image (next/og)
      [slug]/
        page.tsx             # Blog post (MDX rendering, JSON-LD, ToC)
        opengraph-image.tsx  # Per-post OG image (next/og)
    docs/mcp/page.tsx        # MCP server documentation
    policies/
      privacy/page.tsx       # Privacy policy
      tos/page.tsx           # Terms of service
    privacy/route.ts         # Redirect → /policies/privacy
    mcp/route.ts             # MCP endpoint (Streamable HTTP)
    sitemap.ts               # Dynamic sitemap
    robots.ts                # robots.txt
  components/
    ui/                      # shadcn/ui primitives
    QRGenerator.tsx          # Main QR generator (client component)
    BulkVCard.tsx            # Bulk vCard generator (client component)
    McpDocs.tsx              # MCP docs (client component)
    AddressSearch.tsx        # Address autocomplete (Photon/Komoot)
    BlogGrid.tsx             # Post card grid with tag filtering
    BlogTag.tsx              # Tag pill link
    BlogToC.tsx              # Table of contents (sidebar + inline)
    CodeBlock.tsx            # Code block with copy button
    StructuredData.tsx       # JSON-LD schemas (WebApplication, FAQ)
  content/blog/              # MDX blog posts
  lib/
    blog.ts                  # Blog content loading (gray-matter)
    toc.ts                   # Table of contents extraction
    qr-generator.ts          # QR generation logic (server-side)
    utils.ts                 # cn() utility
  qr-types.ts               # QR type definitions + encoders
  vcard.ts                   # vCard encoding logic
  seo.ts                     # Per-route SEO metadata
  mcp/
    tools.ts                 # Shared MCP tool definitions
    stdio.ts                 # Stdio transport (local/Claude Code)
    http.ts                  # HTTP transport handler
  cli/index.ts               # CLI entry point
scripts/
  indexnow.ts                # Post-deploy search engine notification
```

## Rules

- **Imports**: `@/` alias → `./src/`. Use `cn()` from `@/lib/utils` for class names
- **Components**: Client components need `"use client"` directive. QR generator, bulk vCard, and interactive blog components are client-side
- **Styling**: Tailwind v4 + CSS vars in `src/index.css`. Never hardcode colors — use theme vars
- **SEO**: Next.js Metadata API per route. Blog posts auto-generate JSON-LD (BreadcrumbList, BlogPosting, FAQPage)
- **Blog**: MDX files in `src/content/blog/`. Frontmatter parsed by gray-matter. Quick Answer + FAQ patterns auto-extract to schema
- **Domain**: `qr.gamified.studio` (production)
- **CLI/MCP**: These files use `.ts` extensions in imports (Bun convention). They're excluded from tsconfig for Next.js build

## Railway

This project is **already linked** via `~/.railway/config.json`.

| Key           | Value                                          |
| ------------- | ---------------------------------------------- |
| Project       | `b04ab144-8e1f-43aa-bf69-49f834795fc0`         |
| Service       | `ae57155f-d822-4e0f-bf53-9e9e77f97924`         |
| Service name  | `bti-vcard-qr`                                 |
| Environment   | `bb472f06-db63-4fb8-a53c-b5689d04fa28` (prod)  |
| Domain        | `qr.gamified.studio`                           |

**Standalone deploy**: `bun build` produces `.next/standalone/`. Start with `node .next/standalone/server.js`. Copy static assets post-build: `cp -r public .next/standalone/public && cp -r .next/static .next/standalone/.next/static`.

## Cloudflare

| Key     | Value                              |
| ------- | ---------------------------------- |
| Zone    | `ed1e713c326cd1afcd60de9178bf26c3` (gamified.studio) |
| CNAME   | `qr` → `1j40mwg6.up.railway.app`  |

## Linear

Team **BTI** — use `BTI-` prefix for commit messages.

## No Tests

No test framework. Don't create test files unless asked.
