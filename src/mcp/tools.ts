import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { type VCardData } from '../vcard.ts';
import { generateQRBase64, generateQRFromStringBase64, generateVCardString } from '../lib/qr-generator.ts';

const AddressSchema = z.object({
  type: z.enum(['WORK', 'HOME']).default('WORK'),
  street: z.string().default(''),
  street2: z.string().default('').describe('Apt, suite, floor, building name'),
  city: z.string().default(''),
  state: z.string().default('').describe('State, region, or district'),
  zip: z.string().default('').describe('ZIP or postal code'),
  country: z.string().default(''),
  poBox: z.string().default(''),
  geo: z.string().optional().describe('GPS coordinates as "lat,lng" for precise map pin'),
});

const PhoneSchema = z.object({
  type: z.enum(['CELL', 'WORK', 'HOME', 'FAX']).default('CELL'),
  value: z.string().describe('Phone number with country code'),
});

const EmailSchema = z.object({
  type: z.enum(['WORK', 'HOME']).default('WORK'),
  value: z.string().describe('Email address'),
});

function buildVCardData(params: {
  firstName?: string;
  lastName?: string;
  prefix?: string;
  suffix?: string;
  org?: string;
  title?: string;
  phones?: { type: 'CELL' | 'WORK' | 'HOME' | 'FAX'; value: string }[];
  emails?: { type: 'WORK' | 'HOME'; value: string }[];
  addresses?: {
    type: 'WORK' | 'HOME';
    street: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    poBox: string;
    geo?: string;
  }[];
  url?: string;
  note?: string;
}): VCardData {
  return {
    firstName: params.firstName || '',
    lastName: params.lastName || '',
    prefix: params.prefix || '',
    suffix: params.suffix || '',
    org: params.org || '',
    title: params.title || '',
    phones: params.phones || [],
    emails: params.emails || [],
    addresses: (params.addresses || []).map((a) => ({
      type: a.type,
      street: a.street,
      street2: a.street2,
      city: a.city,
      state: a.state,
      zip: a.zip,
      country: a.country,
      poBox: a.poBox,
      geo: a.geo,
    })),
    url: params.url || '',
    note: params.note || '',
  };
}

const contactParams = {
  firstName: z.string().optional().describe('First name'),
  lastName: z.string().optional().describe('Last name'),
  prefix: z.string().optional().describe('Name prefix (Mr., Dr.)'),
  suffix: z.string().optional().describe('Name suffix (Jr., PhD)'),
  org: z.string().optional().describe('Organization / company'),
  title: z.string().optional().describe('Job title'),
  phones: z.array(PhoneSchema).optional().describe('Phone numbers'),
  emails: z.array(EmailSchema).optional().describe('Email addresses'),
  addresses: z.array(AddressSchema).optional().describe('Postal addresses (RFC 2426 compliant)'),
  url: z.string().optional().describe('Website URL'),
  note: z.string().optional().describe('Additional notes'),
};

/**
 * Register all shared MCP tools on the given server instance.
 * These tools are used by both stdio (local) and HTTP (remote) transports.
 */
export function registerTools(server: McpServer) {
  server.tool(
    'generate_vcard_qr',
    'Generate a QR code image from vCard contact data. Returns a base64-encoded PNG.',
    {
      ...contactParams,
      width: z.number().optional().default(800).describe('QR image width in pixels'),
      darkColor: z.string().optional().default('#000000').describe('QR dot color (hex)'),
      lightColor: z.string().optional().default('#ffffff').describe('QR background color (hex)'),
    },
    {
      title: 'Generate vCard QR Code',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async (params) => {
      const data = buildVCardData(params);

      const base64 = await generateQRBase64(data, {
        width: params.width,
        darkColor: params.darkColor,
        lightColor: params.lightColor,
      });

      const vcard = generateVCardString(data);
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.org;

      return {
        content: [
          {
            type: 'text' as const,
            text: `QR code generated for ${name}.\n\nvCard:\n${vcard}`,
          },
          {
            type: 'image' as const,
            data: base64,
            mimeType: 'image/png' as const,
          },
        ],
      };
    },
  );

  server.tool(
    'generate_vcard_text',
    'Generate raw vCard text (no QR code). Useful for .vcf file creation.',
    contactParams,
    {
      title: 'Generate vCard Text',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async (params) => {
      const data = buildVCardData(params);
      const vcard = generateVCardString(data);

      return {
        content: [
          {
            type: 'text' as const,
            text: vcard,
          },
        ],
      };
    },
  );
  // ── Style params shared by all QR tools ──
  const styleParams = {
    width: z.number().optional().default(800).describe('QR image width in pixels'),
    darkColor: z.string().optional().default('#000000').describe('QR dot color (hex)'),
    lightColor: z.string().optional().default('#ffffff').describe('QR background color (hex)'),
  };

  const readOnlyAnnotations = {
    readOnlyHint: true as const,
    destructiveHint: false as const,
    idempotentHint: true as const,
    openWorldHint: false as const,
  };

  // ── URL QR Code ──
  server.tool(
    'generate_url_qr',
    'Generate a QR code for a URL or website link. Scanned to open in browser.',
    {
      url: z.string().describe('The URL to encode (https:// prefix added automatically if missing)'),
      ...styleParams,
    },
    { title: 'Generate URL QR Code', ...readOnlyAnnotations },
    async (params) => {
      let url = params.url.trim();
      if (url && !url.match(/^https?:\/\//i)) url = 'https://' + url;
      if (!url) return { content: [{ type: 'text' as const, text: 'Error: URL is required' }] };

      const base64 = await generateQRFromStringBase64(url, {
        width: params.width, darkColor: params.darkColor, lightColor: params.lightColor,
      });

      return {
        content: [
          { type: 'text' as const, text: `QR code generated for ${url}` },
          { type: 'image' as const, data: base64, mimeType: 'image/png' as const },
        ],
      };
    },
  );

  // ── Text QR Code ──
  server.tool(
    'generate_text_qr',
    'Generate a QR code containing plain text. Displays text when scanned — no internet needed.',
    {
      text: z.string().describe('The text to encode'),
      ...styleParams,
    },
    { title: 'Generate Text QR Code', ...readOnlyAnnotations },
    async (params) => {
      if (!params.text.trim()) return { content: [{ type: 'text' as const, text: 'Error: Text is required' }] };

      const base64 = await generateQRFromStringBase64(params.text, {
        width: params.width, darkColor: params.darkColor, lightColor: params.lightColor,
      });

      return {
        content: [
          { type: 'text' as const, text: `QR code generated with ${params.text.length} characters of text` },
          { type: 'image' as const, data: base64, mimeType: 'image/png' as const },
        ],
      };
    },
  );

  // ── WiFi QR Code ──
  server.tool(
    'generate_wifi_qr',
    'Generate a QR code for WiFi network credentials. Scan to connect — no password typing.',
    {
      ssid: z.string().describe('WiFi network name (SSID)'),
      password: z.string().optional().default('').describe('WiFi password'),
      encryption: z.enum(['WPA', 'WEP', 'nopass']).optional().default('WPA').describe('Encryption type'),
      hidden: z.boolean().optional().default(false).describe('Whether the network is hidden'),
      ...styleParams,
    },
    { title: 'Generate WiFi QR Code', ...readOnlyAnnotations },
    async (params) => {
      if (!params.ssid.trim()) return { content: [{ type: 'text' as const, text: 'Error: SSID is required' }] };

      const esc = (s: string) => s.replace(/[\\;,"":]/g, '\\$&');
      let str = `WIFI:T:${params.encryption};S:${esc(params.ssid)};`;
      if (params.encryption !== 'nopass' && params.password) str += `P:${esc(params.password)};`;
      if (params.hidden) str += 'H:true;';
      str += ';';

      const base64 = await generateQRFromStringBase64(str, {
        width: params.width, darkColor: params.darkColor, lightColor: params.lightColor,
      });

      return {
        content: [
          { type: 'text' as const, text: `WiFi QR code generated for network "${params.ssid}" (${params.encryption})` },
          { type: 'image' as const, data: base64, mimeType: 'image/png' as const },
        ],
      };
    },
  );

  // ── Email QR Code ──
  server.tool(
    'generate_email_qr',
    'Generate a QR code that opens a pre-filled email. Scan to compose — recipient, subject, and body pre-set.',
    {
      to: z.string().describe('Recipient email address'),
      subject: z.string().optional().default('').describe('Email subject line'),
      body: z.string().optional().default('').describe('Email body text'),
      ...styleParams,
    },
    { title: 'Generate Email QR Code', ...readOnlyAnnotations },
    async (params) => {
      if (!params.to.trim()) return { content: [{ type: 'text' as const, text: 'Error: Recipient email is required' }] };

      const parts: string[] = [];
      if (params.subject) parts.push(`subject=${encodeURIComponent(params.subject)}`);
      if (params.body) parts.push(`body=${encodeURIComponent(params.body)}`);
      const query = parts.length ? `?${parts.join('&')}` : '';
      const mailto = `mailto:${params.to.trim()}${query}`;

      const base64 = await generateQRFromStringBase64(mailto, {
        width: params.width, darkColor: params.darkColor, lightColor: params.lightColor,
      });

      return {
        content: [
          { type: 'text' as const, text: `Email QR code generated for ${params.to}${params.subject ? ` (subject: "${params.subject}")` : ''}` },
          { type: 'image' as const, data: base64, mimeType: 'image/png' as const },
        ],
      };
    },
  );

  // ── Phone QR Code ──
  server.tool(
    'generate_phone_qr',
    'Generate a QR code that dials a phone number when scanned.',
    {
      phone: z.string().describe('Phone number with country code (e.g., +1-555-0100)'),
      ...styleParams,
    },
    { title: 'Generate Phone QR Code', ...readOnlyAnnotations },
    async (params) => {
      if (!params.phone.trim()) return { content: [{ type: 'text' as const, text: 'Error: Phone number is required' }] };

      const base64 = await generateQRFromStringBase64(`tel:${params.phone.trim()}`, {
        width: params.width, darkColor: params.darkColor, lightColor: params.lightColor,
      });

      return {
        content: [
          { type: 'text' as const, text: `Phone QR code generated for ${params.phone}` },
          { type: 'image' as const, data: base64, mimeType: 'image/png' as const },
        ],
      };
    },
  );

  // ── SMS QR Code ──
  server.tool(
    'generate_sms_qr',
    'Generate a QR code that opens a pre-filled text message. Scan to text.',
    {
      phone: z.string().describe('Recipient phone number'),
      message: z.string().optional().default('').describe('Pre-filled message body'),
      ...styleParams,
    },
    { title: 'Generate SMS QR Code', ...readOnlyAnnotations },
    async (params) => {
      if (!params.phone.trim()) return { content: [{ type: 'text' as const, text: 'Error: Phone number is required' }] };

      const phone = params.phone.trim();
      const msg = params.message.trim();
      const smsStr = msg ? `SMSTO:${phone}:${msg}` : `SMSTO:${phone}`;

      const base64 = await generateQRFromStringBase64(smsStr, {
        width: params.width, darkColor: params.darkColor, lightColor: params.lightColor,
      });

      return {
        content: [
          { type: 'text' as const, text: `SMS QR code generated for ${phone}${msg ? ` with message "${msg}"` : ''}` },
          { type: 'image' as const, data: base64, mimeType: 'image/png' as const },
        ],
      };
    },
  );

  // ── Event QR Code ──
  server.tool(
    'generate_event_qr',
    'Generate a QR code for a calendar event. Scan to add to Google Calendar, Apple Calendar, or Outlook.',
    {
      title: z.string().describe('Event title'),
      startDate: z.string().describe('Start date (YYYY-MM-DD)'),
      startTime: z.string().optional().default('').describe('Start time (HH:MM, 24h format). Omit for all-day events.'),
      endDate: z.string().optional().default('').describe('End date (YYYY-MM-DD). Defaults to start date.'),
      endTime: z.string().optional().default('').describe('End time (HH:MM, 24h format)'),
      location: z.string().optional().default('').describe('Event location'),
      description: z.string().optional().default('').describe('Event description'),
      allDay: z.boolean().optional().default(false).describe('All-day event (ignores time fields)'),
      ...styleParams,
    },
    { title: 'Generate Event QR Code', ...readOnlyAnnotations },
    async (params) => {
      if (!params.title.trim()) return { content: [{ type: 'text' as const, text: 'Error: Event title is required' }] };
      if (!params.startDate) return { content: [{ type: 'text' as const, text: 'Error: Start date is required' }] };

      const fmt = (date: string, time: string, allDay: boolean) => {
        if (!date) return '';
        const d = date.replace(/-/g, '');
        if (allDay) return d;
        const t = (time || '0000').replace(/:/g, '') + '00';
        return `${d}T${t}`;
      };

      const lines: string[] = ['BEGIN:VEVENT', `SUMMARY:${params.title}`];
      if (params.location) lines.push(`LOCATION:${params.location}`);
      if (params.description) lines.push(`DESCRIPTION:${params.description}`);

      const start = fmt(params.startDate, params.startTime, params.allDay);
      const end = fmt(params.endDate || params.startDate, params.endTime, params.allDay);
      if (params.allDay) {
        lines.push(`DTSTART;VALUE=DATE:${start}`);
        if (end) lines.push(`DTEND;VALUE=DATE:${end}`);
      } else {
        lines.push(`DTSTART:${start}`);
        if (end) lines.push(`DTEND:${end}`);
      }
      lines.push('END:VEVENT');

      const base64 = await generateQRFromStringBase64(lines.join('\r\n'), {
        width: params.width, darkColor: params.darkColor, lightColor: params.lightColor,
      });

      return {
        content: [
          { type: 'text' as const, text: `Event QR code generated for "${params.title}" on ${params.startDate}` },
          { type: 'image' as const, data: base64, mimeType: 'image/png' as const },
        ],
      };
    },
  );

  // ── MeCard QR Code ──
  server.tool(
    'generate_mecard_qr',
    'Generate a MeCard QR code for compact contact sharing. Produces smaller QR codes than vCard.',
    {
      firstName: z.string().optional().default('').describe('First name'),
      lastName: z.string().optional().default('').describe('Last name'),
      phone: z.string().optional().default('').describe('Phone number'),
      email: z.string().optional().default('').describe('Email address'),
      org: z.string().optional().default('').describe('Organization'),
      url: z.string().optional().default('').describe('Website URL'),
      address: z.string().optional().default('').describe('Address (single line)'),
      note: z.string().optional().default('').describe('Additional note'),
      ...styleParams,
    },
    { title: 'Generate MeCard QR Code', ...readOnlyAnnotations },
    async (params) => {
      if (!params.firstName && !params.lastName) {
        return { content: [{ type: 'text' as const, text: 'Error: At least a first or last name is required' }] };
      }

      const esc = (s: string) => s.replace(/[\\;,"":]/g, '\\$&');
      let str = 'MECARD:';
      if (params.lastName || params.firstName) str += `N:${esc(params.lastName)},${esc(params.firstName)};`;
      if (params.phone) str += `TEL:${esc(params.phone)};`;
      if (params.email) str += `EMAIL:${esc(params.email)};`;
      if (params.org) str += `ORG:${esc(params.org)};`;
      if (params.url) str += `URL:${esc(params.url)};`;
      if (params.address) str += `ADR:${esc(params.address)};`;
      if (params.note) str += `NOTE:${esc(params.note)};`;
      str += ';';

      const name = [params.firstName, params.lastName].filter(Boolean).join(' ');

      const base64 = await generateQRFromStringBase64(str, {
        width: params.width, darkColor: params.darkColor, lightColor: params.lightColor,
      });

      return {
        content: [
          { type: 'text' as const, text: `MeCard QR code generated for ${name}` },
          { type: 'image' as const, data: base64, mimeType: 'image/png' as const },
        ],
      };
    },
  );

  // ── X / Twitter Profile QR Code ──
  server.tool(
    'generate_xprofile_qr',
    'Generate a QR code linking to an X (Twitter) profile. Scan to open the profile.',
    {
      username: z.string().describe('X/Twitter username (with or without @)'),
      ...styleParams,
    },
    { title: 'Generate X Profile QR Code', ...readOnlyAnnotations },
    async (params) => {
      const username = params.username.trim().replace(/^@/, '');
      if (!username) return { content: [{ type: 'text' as const, text: 'Error: Username is required' }] };

      const url = `https://x.com/${username}`;

      const base64 = await generateQRFromStringBase64(url, {
        width: params.width, darkColor: params.darkColor, lightColor: params.lightColor,
      });

      return {
        content: [
          { type: 'text' as const, text: `X profile QR code generated for @${username} (${url})` },
          { type: 'image' as const, data: base64, mimeType: 'image/png' as const },
        ],
      };
    },
  );
}

export function createMcpServer() {
  const server = new McpServer({
    name: 'qr-generator',
    version: '1.0.0',
  });
  registerTools(server);
  return server;
}
