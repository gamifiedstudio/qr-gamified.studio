// SEO metadata per route — used by both client (h1/headings) and server (meta tag injection)

export interface PageSEO {
  slug: string;
  title: string;
  description: string;
  h1: string;
  keywords: string;
  ogImage: string;  // OG image path (relative to BASE_URL)
  useCase: string;  // when to use this type
  output: string;   // what happens when scanned
}

const BASE_URL = 'https://qr.beyondtheinnovation.com';

export const PAGE_SEO: Record<string, PageSEO> = {
  url: {
    slug: 'url',
    title: 'URL QR Code Generator — Create Link QR Codes Free',
    description: 'Generate QR codes for any URL or website link. Free online tool with custom colors, dot patterns, and logo support. Download as high-quality PNG or SVG.',
    h1: 'URL QR Code Generator',
    keywords: 'URL QR code generator, link QR code, website QR code, free QR code generator',
    ogImage: '/url/opengraph.png',
    useCase: 'Use this when you want to link to a website, landing page, portfolio, or any URL. Great for business cards, flyers, product packaging, and restaurant menus.',
    output: 'When scanned, the phone opens the URL directly in the browser.',
  },
  vcard: {
    slug: 'vcard',
    title: 'vCard QR Code Generator — Share Contact Info Instantly',
    description: 'Create vCard QR codes to share contact details instantly. Encode name, phone, email, address, and company. Scan to save contacts to any phone automatically.',
    h1: 'vCard QR Code Generator',
    keywords: 'vCard QR code generator, contact QR code, business card QR code, digital business card',
    ogImage: '/vcard/opengraph.png',
    useCase: 'Use this to share your full contact details — name, phone numbers, emails, address, company, and website. Ideal for business cards, conference badges, and email signatures.',
    output: 'When scanned, the phone prompts to save the contact directly to the address book with all fields pre-filled.',
  },
  wifi: {
    slug: 'wifi',
    title: 'WiFi QR Code Generator — Share WiFi Password with QR Code',
    description: 'Create WiFi QR codes so guests connect to your network instantly — no password typing needed. Supports WPA, WPA2, and WEP encryption. Free, no sign-up.',
    h1: 'WiFi QR Code Generator',
    keywords: 'WiFi QR code generator, share WiFi password QR, WiFi QR code, wireless QR code',
    ogImage: '/wifi/opengraph.png',
    useCase: 'Use this to let guests, customers, or visitors connect to your WiFi without typing a password. Perfect for offices, cafes, hotels, Airbnbs, and home networks.',
    output: 'When scanned, the phone automatically connects to the WiFi network — no manual password entry needed.',
  },
  email: {
    slug: 'email',
    title: 'Email QR Code Generator — Pre-Fill Email with QR Code',
    description: 'Generate QR codes that open a pre-filled email with recipient, subject, and body. Perfect for feedback forms, support contacts, and marketing materials.',
    h1: 'Email QR Code Generator',
    keywords: 'email QR code generator, mailto QR code, email QR code, contact QR code',
    ogImage: '/email/opengraph.png',
    useCase: 'Use this when you want people to email you with a specific subject or message. Great for support contacts, feedback collection, RSVP requests, and order inquiries.',
    output: 'When scanned, the phone opens the email app with the recipient, subject, and body already filled in. The user just hits send.',
  },
  phone: {
    slug: 'phone',
    title: 'Phone QR Code Generator — Create Call QR Codes Free',
    description: 'Generate QR codes that dial a phone number when scanned. Perfect for business cards, flyers, and posters. One scan to call — no manual dialing.',
    h1: 'Phone QR Code Generator',
    keywords: 'phone QR code generator, call QR code, telephone QR code, dial QR code',
    ogImage: '/phone/opengraph.png',
    useCase: 'Use this when you want people to call you instantly — on business cards, storefront signs, flyers, ads, or emergency contact sheets.',
    output: 'When scanned, the phone dials the number directly. The user confirms the call and is connected immediately.',
  },
  sms: {
    slug: 'sms',
    title: 'SMS QR Code Generator — Create Text Message QR Codes',
    description: 'Generate QR codes that open a pre-filled SMS message. Set the phone number and message body. Scan to text — ideal for marketing and customer support.',
    h1: 'SMS QR Code Generator',
    keywords: 'SMS QR code generator, text message QR code, SMS QR code, message QR code',
    ogImage: '/sms/opengraph.png',
    useCase: 'Use this for opt-in campaigns, customer support shortcuts, feedback requests, or any scenario where you want someone to text a specific number with a pre-written message.',
    output: 'When scanned, the phone opens the messaging app with the number and message pre-filled. The user just taps send.',
  },
  event: {
    slug: 'event',
    title: 'Event QR Code Generator — Create Calendar QR Codes',
    description: 'Generate QR codes that add events to any calendar app. Set title, date, time, location, and description. Scan to save — perfect for invitations and posters.',
    h1: 'Event QR Code Generator',
    keywords: 'event QR code generator, calendar QR code, iCal QR code, meeting QR code',
    ogImage: '/event/opengraph.png',
    useCase: 'Use this for event invitations, conference schedules, meetup posters, class timetables, or any date people need to remember. Works with Google Calendar, Apple Calendar, and Outlook.',
    output: 'When scanned, the phone prompts to add the event to the calendar with title, date, time, location, and description already filled in.',
  },
  mecard: {
    slug: 'mecard',
    title: 'MeCard QR Code Generator — Compact Contact QR Codes',
    description: 'Generate MeCard QR codes for compact contact sharing. Encode name, phone, email, organization, and address. Widely supported by Android and iOS devices.',
    h1: 'MeCard QR Code Generator',
    keywords: 'MeCard QR code generator, MeCard QR code, contact QR code, compact vCard',
    ogImage: '/mecard/opengraph.png',
    useCase: 'Use this as a lightweight alternative to vCard when you need a smaller QR code. Best for name tags, simple business cards, or when you only need basic contact fields.',
    output: 'When scanned, the phone prompts to save the contact. MeCard produces a more compact QR code than vCard, making it easier to scan at smaller sizes.',
  },
  text: {
    slug: 'text',
    title: 'Text QR Code Generator — Encode Any Text as QR Code',
    description: 'Generate QR codes containing any plain text. Perfect for sharing messages, codes, serial numbers, or instructions. Free with custom styling options.',
    h1: 'Text QR Code Generator',
    keywords: 'text QR code generator, plain text QR code, message QR code, QR code from text',
    ogImage: '/text/opengraph.png',
    useCase: 'Use this to encode any plain text — serial numbers, coupon codes, short instructions, Wi-Fi passwords as plain text, or hidden messages. No internet connection needed to read it.',
    output: 'When scanned, the phone displays the text directly on screen. No internet required — the content is stored entirely in the QR code itself.',
  },
  'x-profile': {
    slug: 'x-profile',
    title: 'Twitter/X QR Code Generator — Share Your X Profile',
    description: 'Generate QR codes linking to any Twitter/X profile. Scan to open the profile directly. Perfect for social media marketing and business cards.',
    h1: 'X / Twitter QR Code Generator',
    keywords: 'Twitter QR code generator, X profile QR code, social media QR code, Twitter QR code',
    ogImage: '/x-profile/opengraph.png',
    useCase: 'Use this to link to your X / Twitter profile from business cards, presentations, posters, or printed media. Help people follow you without searching.',
    output: 'When scanned, the phone opens the X / Twitter profile in the app (if installed) or in the browser.',
  },
};

export const HOME_SEO: PageSEO = {
  slug: '',
  title: 'Free QR Code Generator — URLs, vCards, WiFi, Events & More',
  description: 'Generate custom QR codes for free. Create QR codes for URLs, vCards, WiFi passwords, emails, phone numbers, SMS, calendar events, and more.',
  h1: 'Free QR Code Generator',
  keywords: 'QR code generator, free QR code, vCard QR code, WiFi QR code, QR code maker, create QR code online, custom QR code',
  ogImage: '/opengraph.png',
  useCase: 'Create QR codes for websites, contacts, WiFi, emails, phone calls, text messages, calendar events, and social profiles. Pick a type from the left to get started.',
  output: 'Download your QR code as a high-quality PNG or SVG file. Customize colors, dot patterns, corner styles, and add your own logo.',
};

export function getSEO(slug: string | undefined): PageSEO {
  if (!slug) return HOME_SEO;
  return PAGE_SEO[slug] || HOME_SEO;
}

export function getCanonicalURL(slug: string | undefined): string {
  if (!slug) return `${BASE_URL}/`;
  return `${BASE_URL}/${slug}`;
}

export { BASE_URL };
