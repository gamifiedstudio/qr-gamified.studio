#!/usr/bin/env bun
import { parseArgs } from 'util';
import { resolve } from 'path';
import {
  type VCardData,
  type Address,
  defaultVCard,
} from '../vcard.ts';
import { generateQRToFile, generateVCardString } from '../lib/qr-generator.ts';
import { SKIN_COLORS, resolveColors } from '../skins.ts';

const HELP = `
vcard-qr — Generate QR codes from vCard contact data

Usage:
  vcard-qr [options]

Name:
  -f, --first-name <name>        First name
  -l, --last-name <name>         Last name
  --prefix <prefix>              Name prefix (Mr., Dr.)
  --suffix <suffix>              Name suffix (Jr., PhD)

Organization:
  --org <company>                Organization / company
  --title <job-title>            Job title

Contact:
  --phone <type:number>          Phone (e.g. "CELL:+971521234567" or just "+971521234567")
                                 Can be specified multiple times
  --email <type:address>         Email (e.g. "WORK:john@acme.com" or just "john@acme.com")
                                 Can be specified multiple times

Address:
  --address <json-or-semicolons> Address. Two formats:
                                 Semicolons: "street;street2;city;state;zip;country"
                                 JSON: '{"street":"...","city":"...","country":"..."}'
                                 Can be specified multiple times

Web & Notes:
  --url <website>                Website URL
  --note <text>                  Additional notes

Output:
  -o, --output <path>            Output file path (default: <name>_qr.png)
  --width <pixels>               QR code width (default: 800)
  --skin <name>                  Color preset. Options:
                                 classic, modern, dots, classy, elegant, bubble,
                                 midnight, ocean, sunset, neon, rose, inverted
  --dark-color <hex>             QR dark color (overrides skin)
  --light-color <hex>            QR light color (overrides skin)
  --vcard-only                   Output raw vCard text instead of QR image

Other:
  -h, --help                     Show this help
  -v, --version                  Show version
`.trim();

function parsePhone(raw: string): { type: string; value: string } {
  if (raw.includes(':')) {
    const idx = raw.indexOf(':');
    return { type: raw.slice(0, idx).toUpperCase(), value: raw.slice(idx + 1) };
  }
  return { type: 'CELL', value: raw };
}

function parseEmail(raw: string): { type: string; value: string } {
  // Only split on colon if prefix looks like a type (all alpha, short)
  const match = raw.match(/^([A-Za-z]{2,6}):(.*)/);
  if (match) {
    return { type: match[1].toUpperCase(), value: match[2] };
  }
  return { type: 'WORK', value: raw };
}

function parseAddress(raw: string): Address {
  // Try JSON first
  try {
    const obj = JSON.parse(raw);
    return {
      type: obj.type || 'WORK',
      street: obj.street || '',
      street2: obj.street2 || '',
      city: obj.city || '',
      state: obj.state || '',
      zip: obj.zip || '',
      country: obj.country || '',
      poBox: obj.poBox || '',
      geo: obj.geo || '',
    };
  } catch {
    // Semicolon-delimited: street;street2;city;state;zip;country
    const parts = raw.split(';').map((s) => s.trim());
    return {
      type: 'WORK',
      street: parts[0] || '',
      street2: parts[1] || '',
      city: parts[2] || '',
      state: parts[3] || '',
      zip: parts[4] || '',
      country: parts[5] || '',
      poBox: '',
      geo: '',
    };
  }
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'first-name': { type: 'string', short: 'f' },
      'last-name': { type: 'string', short: 'l' },
      prefix: { type: 'string' },
      suffix: { type: 'string' },
      org: { type: 'string' },
      title: { type: 'string' },
      phone: { type: 'string', multiple: true },
      email: { type: 'string', multiple: true },
      address: { type: 'string', multiple: true },
      url: { type: 'string' },
      note: { type: 'string' },
      output: { type: 'string', short: 'o' },
      width: { type: 'string' },
      skin: { type: 'string' },
      'dark-color': { type: 'string' },
      'light-color': { type: 'string' },
      'vcard-only': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
    strict: true,
  });

  if (values.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (values.version) {
    console.log('vcard-qr v1.0.0');
    process.exit(0);
  }

  // Build VCardData
  const data: VCardData = {
    ...defaultVCard,
    firstName: values['first-name'] || '',
    lastName: values['last-name'] || '',
    prefix: values.prefix || '',
    suffix: values.suffix || '',
    org: values.org || '',
    title: values.title || '',
    phones: (values.phone || []).map(parsePhone),
    emails: (values.email || []).map(parseEmail),
    addresses: (values.address || []).map(parseAddress),
    url: values.url || '',
    note: values.note || '',
  };

  if (!data.firstName && !data.lastName && !data.org) {
    console.error('Error: provide at least --first-name, --last-name, or --org');
    process.exit(1);
  }

  // vCard-only mode
  if (values['vcard-only']) {
    console.log(generateVCardString(data));
    process.exit(0);
  }

  // Validate skin
  if (values.skin && !(values.skin in SKIN_COLORS)) {
    console.error(`Error: unknown skin "${values.skin}". Options: ${Object.keys(SKIN_COLORS).join(', ')}`);
    process.exit(1);
  }

  // Determine output path
  const name = [data.firstName, data.lastName].filter(Boolean).join('_') || 'vcard';
  const outputPath = resolve(values.output || `${name}_qr.png`);

  const colors = resolveColors({
    skin: values.skin,
    darkColor: values['dark-color'],
    lightColor: values['light-color'],
  });

  await generateQRToFile(data, outputPath, {
    width: values.width ? parseInt(values.width, 10) : 800,
    ...colors,
  });

  console.log(`QR code saved: ${outputPath}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
