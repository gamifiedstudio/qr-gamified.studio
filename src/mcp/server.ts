#!/usr/bin/env bun
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { type VCardData } from '../vcard.ts';
import { generateQRBase64, generateQRToFile, generateVCardString } from '../lib/qr-generator.ts';

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

const server = new McpServer({
  name: 'vcard-qr',
  version: '1.0.0',
});

// Tool: generate_vcard_qr
server.tool(
  'generate_vcard_qr',
  'Generate a QR code image from vCard contact data. Returns a base64-encoded PNG.',
  {
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
    width: z.number().optional().default(800).describe('QR image width in pixels'),
    darkColor: z.string().optional().default('#000000').describe('QR dot color (hex)'),
    lightColor: z.string().optional().default('#ffffff').describe('QR background color (hex)'),
  },
  async (params) => {
    const data: VCardData = {
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

// Tool: generate_vcard_qr_file
server.tool(
  'generate_vcard_qr_file',
  'Generate a QR code and save it to a file. Returns the file path.',
  {
    firstName: z.string().optional().describe('First name'),
    lastName: z.string().optional().describe('Last name'),
    prefix: z.string().optional().describe('Name prefix'),
    suffix: z.string().optional().describe('Name suffix'),
    org: z.string().optional().describe('Organization / company'),
    title: z.string().optional().describe('Job title'),
    phones: z.array(PhoneSchema).optional().describe('Phone numbers'),
    emails: z.array(EmailSchema).optional().describe('Email addresses'),
    addresses: z.array(AddressSchema).optional().describe('Postal addresses'),
    url: z.string().optional().describe('Website URL'),
    note: z.string().optional().describe('Additional notes'),
    outputPath: z.string().describe('File path to save the QR code PNG'),
    width: z.number().optional().default(800).describe('QR image width in pixels'),
    darkColor: z.string().optional().default('#000000'),
    lightColor: z.string().optional().default('#ffffff'),
  },
  async (params) => {
    const data: VCardData = {
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

    await generateQRToFile(data, params.outputPath, {
      width: params.width,
      darkColor: params.darkColor,
      lightColor: params.lightColor,
    });

    const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.org;

    return {
      content: [
        {
          type: 'text' as const,
          text: `QR code for ${name} saved to: ${params.outputPath}`,
        },
      ],
    };
  },
);

// Tool: generate_vcard_text
server.tool(
  'generate_vcard_text',
  'Generate raw vCard text (no QR code). Useful for .vcf file creation.',
  {
    firstName: z.string().optional().describe('First name'),
    lastName: z.string().optional().describe('Last name'),
    prefix: z.string().optional().describe('Name prefix'),
    suffix: z.string().optional().describe('Name suffix'),
    org: z.string().optional().describe('Organization / company'),
    title: z.string().optional().describe('Job title'),
    phones: z.array(PhoneSchema).optional().describe('Phone numbers'),
    emails: z.array(EmailSchema).optional().describe('Email addresses'),
    addresses: z.array(AddressSchema).optional().describe('Postal addresses'),
    url: z.string().optional().describe('Website URL'),
    note: z.string().optional().describe('Additional notes'),
  },
  async (params) => {
    const data: VCardData = {
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server error:', err);
  process.exit(1);
});
