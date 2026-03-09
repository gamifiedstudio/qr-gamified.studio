import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { type VCardData } from '../vcard.ts';
import { generateQRBase64, generateVCardString } from '../lib/qr-generator.ts';

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
}

export function createMcpServer() {
  const server = new McpServer({
    name: 'vcard-qr',
    version: '1.0.0',
  });
  registerTools(server);
  return server;
}
