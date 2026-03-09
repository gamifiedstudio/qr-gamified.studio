#!/usr/bin/env bun
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { resolve } from 'path';
import { z } from 'zod';
import { type VCardData } from '../vcard.ts';
import { generateQRToFile } from '../lib/qr-generator.ts';
import { createMcpServer } from './tools.ts';

const server = createMcpServer();

// File-write tool only available in local/stdio mode (not remote)
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
    phones: z.array(z.object({
      type: z.enum(['CELL', 'WORK', 'HOME', 'FAX']).default('CELL'),
      value: z.string().describe('Phone number with country code'),
    })).optional().describe('Phone numbers'),
    emails: z.array(z.object({
      type: z.enum(['WORK', 'HOME']).default('WORK'),
      value: z.string().describe('Email address'),
    })).optional().describe('Email addresses'),
    addresses: z.array(z.object({
      type: z.enum(['WORK', 'HOME']).default('WORK'),
      street: z.string().default(''),
      street2: z.string().default(''),
      city: z.string().default(''),
      state: z.string().default(''),
      zip: z.string().default(''),
      country: z.string().default(''),
      poBox: z.string().default(''),
      geo: z.string().optional(),
    })).optional().describe('Postal addresses'),
    url: z.string().optional().describe('Website URL'),
    note: z.string().optional().describe('Additional notes'),
    outputPath: z.string().describe('File path to save the QR code PNG'),
    width: z.number().optional().default(800).describe('QR image width in pixels'),
    darkColor: z.string().optional().default('#000000'),
    lightColor: z.string().optional().default('#ffffff'),
  },
  {
    title: 'Save vCard QR Code to File',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
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

    const resolvedOutput = resolve(params.outputPath);
    const cwd = process.cwd();
    if (!resolvedOutput.startsWith(cwd)) {
      return {
        content: [{ type: 'text' as const, text: `Error: Output path must be within the current working directory (${cwd})` }],
      };
    }

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server error:', err);
  process.exit(1);
});
