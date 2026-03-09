import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const DIST = join(import.meta.dir, 'dist');
const PORT = parseInt(process.env.PORT || '3000', 10);
const BASE_URL = 'https://qr.beyondtheinnovation.com';

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
};

// ── Per-route SEO metadata (injected server-side for social scrapers & crawlers) ──

interface PageSEO {
  title: string;
  description: string;
  keywords: string;
}

const PAGE_SEO: Record<string, PageSEO> = {
  url: {
    title: 'URL QR Code Generator — Create Link QR Codes Free',
    description: 'Generate QR codes for any URL or website link. Free online tool with custom colors, dot patterns, and logo support. Download as high-quality PNG or SVG.',
    keywords: 'URL QR code generator, link QR code, website QR code, free QR code generator',

  },
  vcard: {
    title: 'vCard QR Code Generator — Share Contact Info Instantly',
    description: 'Create vCard QR codes to share contact details instantly. Encode name, phone, email, address, and company. Scan to save contacts to any phone automatically.',
    keywords: 'vCard QR code generator, contact QR code, business card QR code, digital business card',

  },
  wifi: {
    title: 'WiFi QR Code Generator — Share WiFi Password with QR Code',
    description: 'Create WiFi QR codes so guests connect to your network instantly — no password typing needed. Supports WPA, WPA2, and WEP encryption. Free, no sign-up.',
    keywords: 'WiFi QR code generator, share WiFi password QR, WiFi QR code, wireless QR code',

  },
  email: {
    title: 'Email QR Code Generator — Pre-Fill Email with QR Code',
    description: 'Generate QR codes that open a pre-filled email with recipient, subject, and body. Perfect for feedback forms, support contacts, and marketing materials.',
    keywords: 'email QR code generator, mailto QR code, email QR code, contact QR code',

  },
  phone: {
    title: 'Phone QR Code Generator — Create Call QR Codes Free',
    description: 'Generate QR codes that dial a phone number when scanned. Perfect for business cards, flyers, and posters. One scan to call — no manual dialing.',
    keywords: 'phone QR code generator, call QR code, telephone QR code, dial QR code',

  },
  sms: {
    title: 'SMS QR Code Generator — Create Text Message QR Codes',
    description: 'Generate QR codes that open a pre-filled SMS message. Set the phone number and message body. Scan to text — ideal for marketing and customer support.',
    keywords: 'SMS QR code generator, text message QR code, SMS QR code, message QR code',

  },
  event: {
    title: 'Event QR Code Generator — Create Calendar QR Codes',
    description: 'Generate QR codes that add events to any calendar app. Set title, date, time, location, and description. Scan to save — perfect for invitations and posters.',
    keywords: 'event QR code generator, calendar QR code, iCal QR code, meeting QR code',

  },
  mecard: {
    title: 'MeCard QR Code Generator — Compact Contact QR Codes',
    description: 'Generate MeCard QR codes for compact contact sharing. Encode name, phone, email, organization, and address. Widely supported by Android and iOS devices.',
    keywords: 'MeCard QR code generator, MeCard QR code, contact QR code, compact vCard',

  },
  text: {
    title: 'Text QR Code Generator — Encode Any Text as QR Code',
    description: 'Generate QR codes containing any plain text. Perfect for sharing messages, codes, serial numbers, or instructions. Free with custom styling options.',
    keywords: 'text QR code generator, plain text QR code, message QR code, QR code from text',

  },
  'x-profile': {
    title: 'Twitter/X QR Code Generator — Share Your X Profile',
    description: 'Generate QR codes linking to any Twitter/X profile. Scan to open the profile directly. Perfect for social media marketing and business cards.',
    keywords: 'Twitter QR code generator, X profile QR code, social media QR code, Twitter QR code',

  },
  'vcard/bulk': {
    title: 'Bulk vCard QR Code Generator — Generate Multiple Contact QR Codes',
    description: 'Generate QR codes for multiple contacts at once. Paste JSON data, customize the style, and download all QR codes as a ZIP file. AI prompt template included.',
    keywords: 'bulk QR code generator, multiple vCard QR codes, batch QR code, bulk contact QR codes',

  },
};

const HOME_SEO: PageSEO = {
  title: 'Free QR Code Generator — URLs, vCards, WiFi, Events & More',
  description: 'Generate custom QR codes for free. Create QR codes for URLs, vCards, WiFi passwords, emails, phone numbers, SMS, calendar events, and more.',
  keywords: 'QR code generator, free QR code, vCard QR code, WiFi QR code, QR code maker, create QR code online, custom QR code',

};

function getSEO(pathname: string): PageSEO {
  const slug = pathname.replace(/^\//, '').replace(/\/$/, '');
  if (!slug) return HOME_SEO;
  // Handle nested routes like vcard/bulk
  if (slug === 'vcard/bulk') return PAGE_SEO['vcard/bulk'] || HOME_SEO;
  return PAGE_SEO[slug] || HOME_SEO;
}

function getCanonicalURL(pathname: string): string {
  const slug = pathname.replace(/^\//, '').replace(/\/$/, '');
  if (!slug) return `${BASE_URL}/`;
  return `${BASE_URL}/${slug}`;
}

// Cache the template HTML on startup
const templateHtml = readFileSync(join(DIST, 'index.html'), 'utf-8');

function injectSEO(html: string, pathname: string): string {
  const seo = getSEO(pathname);
  const canonical = getCanonicalURL(pathname);
  const slug = pathname.replace(/^\//, '').replace(/\/$/, '');
  const ogImageUrl = slug
    ? `${BASE_URL}/${slug}/opengraph-image`
    : `${BASE_URL}/opengraph-image`;

  return html
    // Title
    .replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`)
    // Meta description
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${seo.description}$2`,
    )
    // Keywords
    .replace(
      /(<meta name="keywords" content=")[^"]*(")/,
      `$1${seo.keywords}$2`,
    )
    // Canonical
    .replace(
      /(<link rel="canonical" href=")[^"]*(")/,
      `$1${canonical}$2`,
    )
    // OG tags
    .replace(
      /(<meta property="og:title" content=")[^"]*(")/,
      `$1${seo.title}$2`,
    )
    .replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      `$1${seo.description}$2`,
    )
    .replace(
      /(<meta property="og:url" content=")[^"]*(")/,
      `$1${canonical}$2`,
    )
    .replace(
      /(<meta property="og:image" content=")[^"]*(")/,
      `$1${ogImageUrl}$2`,
    )
    // Twitter tags
    .replace(
      /(<meta name="twitter:title" content=")[^"]*(")/,
      `$1${seo.title}$2`,
    )
    .replace(
      /(<meta name="twitter:description" content=")[^"]*(")/,
      `$1${seo.description}$2`,
    )
    .replace(
      /(<meta name="twitter:url" content=")[^"]*(")/,
      `$1${canonical}$2`,
    )
    .replace(
      /(<meta name="twitter:image" content=")[^"]*(")/,
      `$1${ogImageUrl}$2`,
    );
}

Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname === '/' ? '/index.html' : url.pathname;
    let filePath = join(DIST, path);

    // SPA fallback — serve index.html with injected SEO for non-file routes
    if (!existsSync(filePath)) {
      const html = injectSEO(templateHtml, url.pathname);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      });
    }

    // For the root index.html, also inject SEO
    if (path === '/index.html') {
      const html = injectSEO(templateHtml, url.pathname);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      });
    }

    try {
      const file = readFileSync(filePath);
      const ext = extname(path);
      const isStatic = ext === '.js' || ext === '.css' || ext === '.woff' || ext === '.woff2';
      return new Response(file, {
        headers: {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'Cache-Control': isStatic ? 'public, max-age=31536000, immutable' : 'no-cache',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      });
    } catch {
      return new Response('Not Found', { status: 404 });
    }
  },
});

console.log(`Serving on port ${PORT}`);
