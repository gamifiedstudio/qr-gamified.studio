import type { Metadata } from 'next';
import McpDocs from '@/components/McpDocs';

export const metadata: Metadata = {
  title: 'MCP Server Documentation',
  description: 'Generate QR codes for URLs, contacts, WiFi, events, and more via the Model Context Protocol.',
};

export default function McpDocsPage() {
  return <McpDocs />;
}
