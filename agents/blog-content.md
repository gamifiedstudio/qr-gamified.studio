# Blog Content Guidelines

Instructions for creating blog posts on QR Gamified Studio. Every post is a single MDX file — no CMS, no database.

## Site Info

| Key | Value |
|-----|-------|
| Site name | QR Gamified Studio |
| Short name | QR Gamified |
| Base URL | `https://qr.gamified.studio` |
| Blog URL | `https://qr.gamified.studio/blog` |
| Domain | `qr.gamified.studio` |

## File Location

`src/content/blog/{slug}.mdx`

## Frontmatter Spec

Every MDX file starts with a YAML frontmatter block:

```yaml
---
title: "WiFi QR Code: Share Your Network Instantly"
description: "Generate WiFi QR codes that let guests join your network instantly. Step-by-step setup for offices, Airbnbs, cafes, and events."
date: "2026-03-14"
author: "So"
tags: ["QR Codes", "Guide"]
readTime: 7
---
```

| Field         | Type           | Required | Notes                                                              |
| ------------- | -------------- | -------- | ------------------------------------------------------------------ |
| `title`       | string         | Yes      | Under 45 chars. Layout appends ` \| QR Gamified` (+15 chars). Rendered `<title>` must stay under 60. |
| `description` | string         | Yes      | 150-160 chars. Used in meta tags, OG images, TLDR sidebar. Start with an action word. |
| `date`        | `"YYYY-MM-DD"` | Yes      | Publish date. Posts sort newest-first.                             |
| `updatedDate` | `"YYYY-MM-DD"` | No       | Set when content is materially updated.                            |
| `author`      | string         | Yes      | Default: `"So"`. See Author Attribution below.                    |
| `slug`        | string         | No       | Only needed if slug differs from filename. Normally omit — slug is derived from filename. |
| `tags`        | string[]       | Yes      | 2-4 tags. Title Case. See Tag Rules below.                        |
| `readTime`    | number         | Yes      | Estimated minutes. Calculate as `words / 200`, rounded.           |

### Title Rules

The blog layout template is `%s | QR Gamified`. This adds 15 characters to every title. To keep the rendered `<title>` tag under 60 characters (Google's display limit):

- **Max frontmatter title: ~45 characters**
- Put the primary keyword near the front
- Use sentence case for the body, but proper nouns/acronyms are fine
- Good: "How to Create a QR Code for Your Business Card" (46 chars)
- Bad: "The Ultimate Complete Guide to QR Code Types: URLs, vCards, WiFi, and Beyond" (too long)

### Description Rules

- 150-160 characters (fills the SERP snippet)
- Start with an action word: Learn, Generate, Create, Add, How to
- Include the primary keyword
- Promise specific value (what the reader gets)
- Do NOT start with "Master" or "Discover the power of"

## Tag Naming Rules

- **Title Case** — `"QR Codes"`, not `"qr codes"`
- **2-4 tags per post**
- **Check existing tags first** before creating new ones
- Tags drive the "Related Articles" widget at the bottom of each post

### Existing Tags

Scan `src/content/blog/*.mdx` frontmatter for the current tag list before creating new ones. Tags appear in the blog sidebar filter and on the TLDR panel.

## Content Structure

### Heading Hierarchy

- **Never use `# h1`** — the page renders the title from frontmatter as `<h1>`
- **`## h2`** — Main sections (appear in Table of Contents sidebar)
- **`### h3`** — Subsections (also in ToC, indented)
- **`#### h4` and below** — Sparingly; not in ToC

### Quick Answer Pattern (required)

Every `## h2` section should start with a `**Quick answer:**` line. This pattern is extracted by the page template for:
- **FAQPage JSON-LD schema** (SEO structured data)
- **TLDR sidebar** (Key Points panel on desktop)

```markdown
## What types of QR codes can you generate?

**Quick answer:** There are 10 types — URL, vCard, WiFi, email, phone, SMS, plain text, calendar events, MeCard, and X/Twitter profile. Each encodes data differently but all produce a standard scannable QR code.
```

The regex that extracts these: `/^##\s+(.+)\n+\*\*Quick answer:\*\*\s+(.+)/gm`

### TLDR Right Panel (auto-populated)

On xl+ screens, blog posts show a right sidebar panel with four sections. All are auto-populated from frontmatter and content — no manual setup needed.

| Section | Source | Notes |
|---------|--------|-------|
| **TLDR** | `description` from frontmatter | Shown as-is. Write descriptions that work as standalone summaries. |
| **Tags** | `tags` from frontmatter | Rendered as bordered badges linking to `/blog?tag=X`. |
| **Latest** | 5 most recent posts (excluding current) | Auto-generated. No action needed. |

### FAQ Section (required)

End every post with a `## Frequently asked questions` section using `### Q:` prefixed headings:

```markdown
## Frequently asked questions

### Q: Can I use a QR code on both a business card and email signature?

Yes. The same vCard QR code works anywhere — print it on cards, paste it into email signatures, or display it on a screen. The contact data inside is identical regardless of where you put it.

### Q: What size should a QR code be for a business card?

At minimum, 2cm x 2cm (about 0.8 inches). Smaller than that and phones struggle to scan it, especially in low light.
```

The regex that extracts these: `/###\s+Q:\s+(.+)\n+([\s\S]+?)(?=\n###|\n##|$)/g`

**Both patterns feed the FAQPage JSON-LD schema.** Do not change the format.

### Content Length

- **Minimum: 1,500 words** — posts under this are too thin for competitive keywords
- **Target: 1,500-2,500 words** — long enough to rank, short enough to finish
- **Maximum: 3,000 words** — split into multiple posts if longer

### Internal Linking (required)

Every post must include:
- **2-4 links to other blog posts** in the body text (not just the auto-generated Related Articles widget)
- **1-2 links to tool pages** (`/vcard`, `/wifi`, `/vcard/bulk`, `/docs/mcp`, etc.)
- **Descriptive anchor text** — "the [design best practices guide](/blog/qr-code-design-best-practices)" not "click here"

### SEO Keyword Placement

| Location | What to include |
|----------|----------------|
| Title (frontmatter) | Primary keyword near front, under 45 chars |
| Description | Primary keyword + value prop, 150-160 chars |
| First 100 words | Primary keyword naturally |
| At least one H2 | Primary keyword or close variant |
| Quick answers | Direct, keyword-rich answers (1-2 sentences) |
| FAQ questions | Long-tail question keywords |
| Body | Secondary keywords woven naturally, no stuffing |

## Author Attribution

| Author | Use for |
|--------|---------|
| `"So"` | Default. All current posts. Technical and general content. |

If additional authors are added, update this table.

## Slug Convention

- **Kebab-case** — `qr-code-business-cards`, not `qr_code_business_cards`
- **Include the primary keyword** — `wifi-qr-code-guide`, not `post-4`
- **Keep under 50 characters**
- **Lowercase only**
- **Filename = slug** — the slug is derived from the `.mdx` filename

## Content Voice

- **Audience**: Small business owners, marketers, developers, and anyone who needs QR codes for practical use
- **Tone**: Practical, direct, opinionated. Like a colleague explaining something they've actually done, not a textbook or press release.
- **First person**: Use "I" and "we" where it fits. First person is honest, not unprofessional.
- **Vary rhythm**: Mix short sentences with longer ones. Don't let every paragraph be the same length.
- **Have opinions**: "I'd skip PDFs entirely" is better than neutrally listing pros and cons.

### What to avoid (humanizer rules)

These patterns make content sound AI-generated. Never use them:

- **Promotional language**: groundbreaking, vibrant, stunning, nestled, breathtaking, must-visit, renowned
- **Significance inflation**: pivotal, crucial, vital, enduring testament, marking a shift, key turning point, evolving landscape
- **AI vocabulary**: delve, foster, enhance, underscore, leverage, tapestry, interplay, garner, showcase
- **Copula avoidance**: "serves as" / "stands as" / "functions as" — just use "is"
- **-ing tacked-on phrases**: "highlighting the importance of..." / "showcasing how..." / "ensuring that..."
- **Rule of three**: Don't force ideas into groups of three
- **Em dash overuse**: Use commas or periods. One em dash per 500 words max.
- **Negative parallelisms**: "It's not just X; it's Y" / "Not only...but also..."
- **Filler phrases**: "In order to", "It is important to note", "At its core", "In today's world"
- **Vague attributions**: "Experts say", "Studies show" — cite specifics or remove
- **Generic positive conclusions**: "The future looks bright", "Exciting times lie ahead"
- **Sycophantic openers**: "Great question!", "Absolutely!"
- **Bold+colon inline lists**: Don't use `- **Label:** Description` for every item. Convert to prose.
- **Emojis in headings/lists**: No decorating with rocket/lightbulb/checkmark emojis
- **Title Case headings**: Use sentence case. "How to create your QR code" not "How To Create Your QR Code"

### What to include

- Specific numbers, sizes, and concrete examples
- Practical tips from real experience
- Honest caveats ("this won't work if...")
- Concrete recommendations over vague suggestions
- Links to the actual tool pages where relevant

## Existing Blog Inventory

Do NOT maintain a list here. Scan `src/content/blog/*.mdx` for current posts and read their frontmatter to check for topic overlap before writing.

## Tool Pages (for internal linking)

| Path | What it is |
|------|-----------|
| `/` | Homepage — QR generator (default URL type) |
| `/url` | URL QR code generator |
| `/text` | Plain text QR code |
| `/wifi` | WiFi QR code generator |
| `/email` | Email QR code |
| `/phone` | Phone number QR code |
| `/sms` | SMS QR code |
| `/event` | Calendar event QR code |
| `/vcard` | vCard QR code generator |
| `/vcard/bulk` | Bulk vCard generation (CSV upload) |
| `/mecard` | MeCard QR code |
| `/x-profile` | X/Twitter profile QR code |
| `/docs/mcp` | MCP server documentation |

## New Post Checklist

1. Run `/mdx-research {topic}` — validate keywords and create content brief
2. Run `/mdx-writer` — produces the complete MDX file
3. Verify:
   - Filename matches slug (no `.mdx` in slug)
   - Title under 45 chars
   - Description 150-160 chars
   - Tags use Title Case and match existing tags
   - Content starts with `## h2` (not `# h1`)
   - Each `## h2` has a `**Quick answer:**` line
   - FAQ section uses `### Q:` prefix
   - 2-4 blog cross-links in body text
   - 1,500+ words
   - readTime = words / 200, rounded
4. Run `bun build` — confirm frontmatter parses and page renders
5. Check `bun run indexnow` after deploy — notifies search engines

## JSON-LD Schemas (auto-generated)

The blog post page template (`src/app/blog/[slug]/page.tsx`) auto-generates three JSON-LD schemas:

1. **BreadcrumbList** — Home > Blog > Post Title
2. **BlogPosting** — headline, description, dates, author, publisher, wordCount
3. **FAQPage** — extracted from `**Quick answer:**` patterns AND `### Q:` patterns

You do NOT need to add JSON-LD manually. Just follow the Quick Answer and FAQ Q: formatting patterns.

## Redirects

When renaming a post slug, add a permanent redirect in `next.config.ts`. Check the file for current redirects — do NOT maintain a list here.
