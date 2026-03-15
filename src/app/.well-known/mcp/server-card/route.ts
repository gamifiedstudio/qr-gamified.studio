import { NextResponse } from 'next/server';

const serverCard = {
  $schema:
    'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
  name: 'io.gamified.studio/qr-generator',
  version: '1.0.0',
  title: 'QR Code Generator',
  description:
    'Generate QR codes for URLs, vCards, WiFi, email, phone, SMS, calendar events, MeCards, X profiles, and plain text. No auth required.',
  websiteUrl: 'https://qr.gamified.studio',
  icons: [
    {
      src: 'https://qr.gamified.studio/favicon.svg',
      mimeType: 'image/svg+xml',
    },
  ],
  remotes: [
    {
      type: 'streamable-http',
      url: 'https://qr.gamified.studio/mcp',
      supportedProtocolVersions: ['2025-03-26', '2025-06-18', '2025-11-25'],
      authentication: { required: false },
    },
  ],
  capabilities: {
    tools: { listChanged: false },
  },
};

export async function GET() {
  return NextResponse.json(serverCard, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
