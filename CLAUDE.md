# QR Code Generator (BTI)

Multi-format QR code generator with web app, CLI, and MCP server. Vite SPA with Bun static file server for SSR SEO injection.

## Commands

```bash
bun dev          # Vite dev server :5173
bun build        # OG images + TypeScript + Vite production build
bun start        # Production server (Bun, serves dist/)
bun run cli      # CLI tool
bun run mcp      # MCP server
bun lint         # ESLint
```

## Tech Stack

| Layer      | Tech                                            |
| ---------- | ----------------------------------------------- |
| Framework  | Vite, React 19, React Router DOM                |
| Language   | TypeScript (strict mode)                        |
| Styling    | Tailwind v4, CSS variables                      |
| Components | shadcn/ui (Radix), CVA for variants             |
| Icons      | lucide-react                                    |
| QR         | qr-code-styling (web), qrcode (CLI/MCP)        |
| Server     | Bun static file server with SEO injection       |
| CLI        | Bun executable (`bun run src/cli/index.ts`)     |
| MCP        | @modelcontextprotocol/sdk                       |

## Structure

```
src/
  App.tsx                  # Main app with router
  main.tsx                 # Entry point
  qr-types.ts             # QR type definitions
  vcard.ts                 # vCard encoding logic
  seo.ts                   # Client-side SEO metadata
  BulkVCard.tsx            # Bulk vCard generation page
  components/
    ui/                    # shadcn/ui primitives
    AddressSearch.tsx       # Address autocomplete
  lib/
    qr-generator.ts        # QR generation logic
    utils.ts               # cn() utility
  cli/index.ts             # CLI entry point
  mcp/server.ts            # MCP server entry point
server.ts                  # Production Bun server (SEO injection, SPA fallback)
scripts/generate-og-images.ts  # OG image generation (runs at build time)
```

## Rules

- **Imports**: `@/` alias → `./src/`. Use `cn()` from `@/lib/utils` for class names
- **Components**: Shared in `components/`, primitives in `components/ui/`
- **Styling**: Tailwind v4 + CSS vars in `src/index.css`. Never hardcode colors — use theme vars
- **SEO**: Server-side injection in `server.ts` (per-route meta, OG images, canonical URLs). Client-side metadata in `seo.ts`
- **Domain**: `qr.gamified.studio` (production)

## Railway

This project is **already linked** via `~/.railway/config.json`.

| Key           | Value                                          |
| ------------- | ---------------------------------------------- |
| Project       | `b04ab144-8e1f-43aa-bf69-49f834795fc0`         |
| Service       | `ae57155f-d822-4e0f-bf53-9e9e77f97924`         |
| Service name  | `bti-vcard-qr`                                 |
| Environment   | `bb472f06-db63-4fb8-a53c-b5689d04fa28` (prod)  |
| Domain        | `qr.gamified.studio`                           |

## Cloudflare

| Key     | Value                              |
| ------- | ---------------------------------- |
| Zone    | `ed1e713c326cd1afcd60de9178bf26c3` (gamified.studio) |
| CNAME   | `qr` → `1j40mwg6.up.railway.app`  |

## Linear

Team **BTI** — use `BTI-` prefix for commit messages.

## No Tests

No test framework. Don't create test files unless asked.
