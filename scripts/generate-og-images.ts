/**
 * Generate OG social preview images (1200x630) for each QR type route.
 * Matches the site's monochrome dark/white identity exactly.
 *
 * Output: public/[slug]/opengraph.png (e.g. public/url/opengraph.png)
 * Homepage: public/opengraph.png
 *
 * Usage: bun run scripts/generate-og-images.ts
 */

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

const OUT_DIR = join(import.meta.dir, '..', 'public');

// ── Embed avatars as base64 (matching the site footer) ──

const soAvatarB64 = readFileSync(join(import.meta.dir, 'assets', 'so-avatar.png')).toString('base64');
const gsAvatarB64 = readFileSync(join(import.meta.dir, 'assets', 'gs-avatar.png')).toString('base64');

// ── Site colors (from index.css .dark theme) ──

const COLORS = {
  bg: '#0a0a0a',          // --background / theme-color
  fg: '#e5e5e5',          // --foreground (text)
  muted: '#737373',       // --muted-foreground
  border: '#1a1a1a',      // --border (~10% white on dark)
  subtle: '#2a2a2a',      // slightly lighter than border
};

// ── QR logo mark (same geometry as favicon.svg) ──

function qrLogoMark(x: number, y: number, scale: number, color: string): string {
  const s = scale;
  const ox = x;
  const oy = y;

  const r = (v: number) => ox + v * s;
  const ry = (v: number) => oy + v * s;
  const sz = (v: number) => v * s;

  return [
    `<rect x="${r(2)}" y="${ry(2)}" width="${sz(10)}" height="${sz(10)}" rx="${sz(1)}" fill="none" stroke="${color}" stroke-width="${sz(2)}"/>`,
    `<rect x="${r(5)}" y="${ry(5)}" width="${sz(4)}" height="${sz(4)}" rx="${sz(0.5)}" fill="${color}"/>`,
    `<rect x="${r(20)}" y="${ry(2)}" width="${sz(10)}" height="${sz(10)}" rx="${sz(1)}" fill="none" stroke="${color}" stroke-width="${sz(2)}"/>`,
    `<rect x="${r(23)}" y="${ry(5)}" width="${sz(4)}" height="${sz(4)}" rx="${sz(0.5)}" fill="${color}"/>`,
    `<rect x="${r(2)}" y="${ry(20)}" width="${sz(10)}" height="${sz(10)}" rx="${sz(1)}" fill="none" stroke="${color}" stroke-width="${sz(2)}"/>`,
    `<rect x="${r(5)}" y="${ry(23)}" width="${sz(4)}" height="${sz(4)}" rx="${sz(0.5)}" fill="${color}"/>`,
    `<rect x="${r(15)}" y="${ry(15)}" width="${sz(3)}" height="${sz(3)}" rx="${sz(0.5)}" fill="${color}"/>`,
    `<rect x="${r(20)}" y="${ry(20)}" width="${sz(3)}" height="${sz(3)}" rx="${sz(0.5)}" fill="${color}"/>`,
    `<rect x="${r(26)}" y="${ry(20)}" width="${sz(3)}" height="${sz(3)}" rx="${sz(0.5)}" fill="${color}"/>`,
    `<rect x="${r(20)}" y="${ry(26)}" width="${sz(3)}" height="${sz(3)}" rx="${sz(0.5)}" fill="${color}"/>`,
    `<rect x="${r(15)}" y="${ry(21)}" width="${sz(3)}" height="${sz(3)}" rx="${sz(0.5)}" fill="${color}"/>`,
    `<rect x="${r(21)}" y="${ry(15)}" width="${sz(3)}" height="${sz(3)}" rx="${sz(0.5)}" fill="${color}"/>`,
    `<rect x="${r(15)}" y="${ry(2)}" width="${sz(3)}" height="${sz(3)}" rx="${sz(0.5)}" fill="${color}"/>`,
    `<rect x="${r(2)}" y="${ry(15)}" width="${sz(3)}" height="${sz(3)}" rx="${sz(0.5)}" fill="${color}"/>`,
  ].join('\n  ');
}

// ── SVG icons (Lucide-style, 24x24 viewBox) ──

const ICONS: Record<string, string> = {
  home: '<path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" stroke-linejoin="round"/>',
  url: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  vcard: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/>',
  email: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
  sms: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  event: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  mecard: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  text: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  'x-profile': '<path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.4L20 4h-2l-5.2 6.4L8 4H4z"/>',
};

// ── Route definitions ──

interface OGRoute {
  slug: string;
  title: string;
  subtitle: string;
}

const routes: OGRoute[] = [
  { slug: '', title: 'Free QR Code Generator', subtitle: 'URLs, vCards, WiFi, Events & More — no sign-up required' },
  { slug: 'url', title: 'URL QR Code Generator', subtitle: 'Create link QR codes for any website — free' },
  { slug: 'vcard', title: 'vCard QR Code Generator', subtitle: 'Share contact info instantly — scan to save' },
  { slug: 'wifi', title: 'WiFi QR Code Generator', subtitle: 'Share WiFi passwords with a single scan' },
  { slug: 'email', title: 'Email QR Code Generator', subtitle: 'Pre-fill email with recipient, subject & body' },
  { slug: 'phone', title: 'Phone QR Code Generator', subtitle: 'One scan to call — no manual dialing' },
  { slug: 'sms', title: 'SMS QR Code Generator', subtitle: 'Create text message QR codes with pre-filled content' },
  { slug: 'event', title: 'Event QR Code Generator', subtitle: 'Add calendar events automatically — scan to save' },
  { slug: 'mecard', title: 'MeCard QR Code Generator', subtitle: 'Compact contact cards — smaller QR, same info' },
  { slug: 'text', title: 'Text QR Code Generator', subtitle: 'Encode any plain text as a scannable QR code' },
  { slug: 'x-profile', title: 'X / Twitter QR Code Generator', subtitle: 'Share your profile — scan to follow' },
];

// ── Footer: "Made by So from Gamified.studio" with avatars ──

function footerSVG(y: number): string {
  const avatarSize = 18;
  const textY = y + 13; // vertical center of text baseline relative to avatar
  let x = 64;

  const parts: string[] = [];

  // "Made by"
  parts.push(`<text x="${x}" y="${textY}" font-size="13" fill="${COLORS.muted}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" opacity="0.7">Made by</text>`);
  x += 58;

  // So avatar (circular clip)
  parts.push(`<defs><clipPath id="so-clip"><circle cx="${x + avatarSize / 2}" cy="${y + avatarSize / 2}" r="${avatarSize / 2}"/></clipPath></defs>`);
  parts.push(`<image href="data:image/jpeg;base64,${soAvatarB64}" x="${x}" y="${y}" width="${avatarSize}" height="${avatarSize}" clip-path="url(#so-clip)"/>`);
  x += avatarSize + 5;

  // "So"
  parts.push(`<text x="${x}" y="${textY}" font-size="13" fill="${COLORS.fg}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">So</text>`);
  x += 22;

  // "from"
  parts.push(`<text x="${x}" y="${textY}" font-size="13" fill="${COLORS.muted}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" opacity="0.7">from</text>`);
  x += 36;

  // GS avatar (circular clip)
  parts.push(`<defs><clipPath id="gs-clip"><circle cx="${x + avatarSize / 2}" cy="${y + avatarSize / 2}" r="${avatarSize / 2}"/></clipPath></defs>`);
  parts.push(`<image href="data:image/png;base64,${gsAvatarB64}" x="${x}" y="${y}" width="${avatarSize}" height="${avatarSize}" clip-path="url(#gs-clip)"/>`);
  x += avatarSize + 5;

  // "Gamified.studio"
  parts.push(`<text x="${x}" y="${textY}" font-size="13" fill="${COLORS.fg}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">Gamified.studio</text>`);

  return parts.join('\n  ');
}

// ── SVG Template ──

function generateSVG(route: OGRoute): string {
  const W = 1200;
  const H = 630;
  const iconKey = route.slug || 'home';

  const gridLines = [
    `<line x1="0" y1="1" x2="${W}" y2="1" stroke="${COLORS.border}" stroke-width="1"/>`,
    `<line x1="0" y1="${H - 1}" x2="${W}" y2="${H - 1}" stroke="${COLORS.border}" stroke-width="1"/>`,
    `<line x1="${W - 360}" y1="0" x2="${W - 360}" y2="${H}" stroke="${COLORS.border}" stroke-width="1"/>`,
  ].join('\n  ');

  const iconPath = ICONS[iconKey];

  // Layout: icon at top, then generous gap, then title + subtitle
  const iconX = 64;
  const iconY = 180;
  const iconScale = 1.8;   // 24 * 1.8 = ~43px rendered icon
  const titleY = 310;      // plenty of space below icon (icon bottom ~223, title top ~270)
  const subtitleY = titleY + 42;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLORS.bg}"/>
  ${gridLines}
  ${qrLogoMark(W - 360 + 108, 160, 4.5, COLORS.subtle)}
  <g transform="translate(${iconX}, ${iconY}) scale(${iconScale})" fill="none" stroke="${COLORS.fg}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
    ${iconPath}
  </g>
  <text x="${iconX}" y="${titleY}" font-size="44" font-weight="600" fill="${COLORS.fg}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" letter-spacing="-0.5">${escapeXml(route.title)}</text>
  <text x="${iconX}" y="${subtitleY}" font-size="20" fill="${COLORS.muted}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">${escapeXml(route.subtitle)}</text>
  ${footerSVG(H - 58)}
  <text x="${W - 360 - 24}" y="${H - 44}" font-size="13" fill="${COLORS.muted}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" text-anchor="end" opacity="0.5">Free, no sign-up required</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Generate ──

console.log('Generating OG images...\n');

for (const route of routes) {
  const svg = generateSVG(route);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render().asPng();

  let outPath: string;
  if (!route.slug) {
    outPath = join(OUT_DIR, 'opengraph.png');
  } else {
    const dir = join(OUT_DIR, route.slug);
    mkdirSync(dir, { recursive: true });
    outPath = join(dir, 'opengraph.png');
  }

  writeFileSync(outPath, png);
  const label = route.slug ? `/${route.slug}/opengraph.png` : '/opengraph.png';
  console.log(`  ✓ ${label} (${(png.length / 1024).toFixed(0)} KB)`);
}

console.log(`\nDone — ${routes.length} images generated.`);
