'use client';

import Link from 'next/link';
import { Terminal, Globe, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="bg-[var(--muted)] p-4 text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-3 right-3 p-1.5 bg-[var(--background)] border border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function ToolCard({ name, description, params }: { name: string; description: string; params: string }) {
  return (
    <div className="border border-[var(--border)] p-4">
      <div className="flex items-center gap-3 mb-1.5">
        <code className="text-sm font-semibold">{name}</code>
        <span className="rounded-full bg-green-500/10 text-green-600 px-2 py-0.5 text-xs font-medium">read-only</span>
      </div>
      <p className="text-sm text-[var(--muted-foreground)] mb-2">{description}</p>
      <p className="text-xs text-[var(--muted-foreground)]">
        <span className="font-medium text-[var(--foreground)]">Params:</span> {params}
      </p>
    </div>
  );
}

export default function McpDocs() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">MCP Server Documentation</h1>
        <p className="text-[var(--muted-foreground)] mb-10">
          Generate QR codes for URLs, contacts, WiFi, events, and more via the Model Context Protocol.
        </p>

        {/* Overview */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Overview</h2>
          <p className="mb-3">
            The <strong>qr-generator</strong> MCP server provides 11 tools for generating QR codes across
            multiple formats: URLs, plain text, vCards, MeCards, WiFi networks, email, phone, SMS,
            calendar events, X/Twitter profiles, and raw vCard text. It supports full contact fields
            including name, phone numbers, emails, postal addresses (with GPS coordinates), organization,
            title, website, and notes.
          </p>
          <p>
            No authentication is required. All processing is stateless and in-memory — no data is
            stored or logged.
          </p>
        </section>

        {/* Connection */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Connection</h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />
                <h3 className="font-medium">Remote (Claude.ai / Claude Desktop)</h3>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                Connect via Streamable HTTP transport. Add to your MCP client configuration:
              </p>
              <CopyBlock code={`{
  "mcpServers": {
    "qr-generator": {
      "type": "streamable-http",
      "url": "https://qr.gamified.studio/mcp"
    }
  }
}`} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-4 w-4 text-[var(--muted-foreground)]" />
                <h3 className="font-medium">Local (Claude Code / Cursor)</h3>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                Run locally via stdio transport. Requires Bun installed:
              </p>
              <CopyBlock code={`{
  "mcpServers": {
    "qr-generator": {
      "command": "bun",
      "args": ["run", "src/mcp/stdio.ts"],
      "cwd": "/path/to/qr-gamified.studio"
    }
  }
}`} />
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                The local version includes an additional <code className="bg-[var(--muted)] px-1.5 py-0.5 text-xs">generate_vcard_qr_file</code> tool
                that saves QR codes directly to disk.
              </p>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Tools</h2>

          <div className="space-y-6">
            {/* generate_vcard_qr — full detail */}
            <div className="border border-[var(--border)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <code className="text-sm font-semibold">generate_vcard_qr</code>
                <span className="rounded-full bg-green-500/10 text-green-600 px-2 py-0.5 text-xs font-medium">read-only</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Generate a QR code image from vCard contact data. Returns a base64-encoded PNG image
                alongside the raw vCard text.
              </p>

              <h4 className="text-sm font-medium mb-2">Parameters</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="pb-2 pr-4 font-medium">Name</th>
                      <th className="pb-2 pr-4 font-medium">Type</th>
                      <th className="pb-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--muted-foreground)]">
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">firstName</td><td className="py-2 pr-4">string?</td><td className="py-2">First name</td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">lastName</td><td className="py-2 pr-4">string?</td><td className="py-2">Last name</td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">prefix</td><td className="py-2 pr-4">string?</td><td className="py-2">Name prefix (Mr., Dr.)</td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">suffix</td><td className="py-2 pr-4">string?</td><td className="py-2">Name suffix (Jr., PhD)</td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">org</td><td className="py-2 pr-4">string?</td><td className="py-2">Organization / company</td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">title</td><td className="py-2 pr-4">string?</td><td className="py-2">Job title</td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">phones</td><td className="py-2 pr-4">array?</td><td className="py-2">Phone numbers — each with <code className="text-xs bg-[var(--muted)] px-1">type</code> (CELL, WORK, HOME, FAX) and <code className="text-xs bg-[var(--muted)] px-1">value</code></td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">emails</td><td className="py-2 pr-4">array?</td><td className="py-2">Email addresses — each with <code className="text-xs bg-[var(--muted)] px-1">type</code> (WORK, HOME) and <code className="text-xs bg-[var(--muted)] px-1">value</code></td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">addresses</td><td className="py-2 pr-4">array?</td><td className="py-2">Postal addresses — street, city, state, zip, country, poBox, geo (lat,lng)</td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">url</td><td className="py-2 pr-4">string?</td><td className="py-2">Website URL</td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">note</td><td className="py-2 pr-4">string?</td><td className="py-2">Additional notes</td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">width</td><td className="py-2 pr-4">number?</td><td className="py-2">Image width in pixels (default: 800)</td></tr>
                    <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4 font-mono text-xs">darkColor</td><td className="py-2 pr-4">string?</td><td className="py-2">QR dot color, hex (default: #000000)</td></tr>
                    <tr><td className="py-2 pr-4 font-mono text-xs">lightColor</td><td className="py-2 pr-4">string?</td><td className="py-2">Background color, hex (default: #ffffff)</td></tr>
                  </tbody>
                </table>
              </div>

              <h4 className="text-sm font-medium mt-4 mb-2">Response</h4>
              <p className="text-sm text-[var(--muted-foreground)]">
                Returns two content items: a text block with the generated vCard string, and an image
                block with the base64-encoded PNG QR code.
              </p>
            </div>

            {/* generate_vcard_text */}
            <div className="border border-[var(--border)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <code className="text-sm font-semibold">generate_vcard_text</code>
                <span className="rounded-full bg-green-500/10 text-green-600 px-2 py-0.5 text-xs font-medium">read-only</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Generate raw vCard 3.0 text without a QR code. Useful for creating .vcf files or
                embedding contact data in other formats.
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Accepts the same contact parameters as <code className="text-xs bg-[var(--muted)] px-1">generate_vcard_qr</code> (excluding
                width, darkColor, lightColor). Returns the vCard string as plain text.
              </p>
            </div>

            {/* All QR Tools */}
            <div>
              <h3 className="text-base font-semibold mb-1">All QR Tools</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                All QR tools below also accept optional styling parameters: <code className="text-xs bg-[var(--muted)] px-1">width</code> (number, default 800), <code className="text-xs bg-[var(--muted)] px-1">darkColor</code> (hex string), and <code className="text-xs bg-[var(--muted)] px-1">lightColor</code> (hex string). Each returns a base64-encoded PNG image.
              </p>

              <div className="grid gap-3">
                <ToolCard
                  name="generate_url_qr"
                  description="Generate a QR code for a URL or website link."
                  params={`url (string, required)`}
                />
                <ToolCard
                  name="generate_text_qr"
                  description="Generate a QR code encoding plain text."
                  params={`text (string, required)`}
                />
                <ToolCard
                  name="generate_wifi_qr"
                  description="Generate a QR code for joining a WiFi network. Scanning auto-connects on most devices."
                  params={`ssid (string, required), password (string), encryption ("WPA" | "WEP" | "nopass"), hidden (boolean)`}
                />
                <ToolCard
                  name="generate_email_qr"
                  description="Generate a QR code that opens a pre-filled email compose window."
                  params={`to (string, required), subject (string), body (string)`}
                />
                <ToolCard
                  name="generate_phone_qr"
                  description="Generate a QR code that initiates a phone call when scanned."
                  params={`phone (string, required)`}
                />
                <ToolCard
                  name="generate_sms_qr"
                  description="Generate a QR code that opens an SMS compose window with a pre-filled message."
                  params={`phone (string, required), message (string)`}
                />
                <ToolCard
                  name="generate_event_qr"
                  description="Generate a QR code for a calendar event (iCalendar format)."
                  params={`title (string, required), startDate (string, required, YYYY-MM-DD), startTime (string, HH:MM), endDate (string), endTime (string), location (string), description (string), allDay (boolean)`}
                />
                <ToolCard
                  name="generate_mecard_qr"
                  description="Generate a compact contact QR code using the MeCard format. Widely supported on Android."
                  params={`firstName (string), lastName (string) — at least one required. Also: phone, email, org, url, address, note`}
                />
                <ToolCard
                  name="generate_xprofile_qr"
                  description="Generate a QR code linking to an X (Twitter) profile."
                  params={`username (string, required)`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Examples</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">1. URL QR code</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                "Create a QR code for my website https://gamified.studio"
              </p>
              <CopyBlock code={`{
  "name": "generate_url_qr",
  "arguments": {
    "url": "https://gamified.studio"
  }
}`} />
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Returns a PNG QR code that opens the URL when scanned.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. vCard text for file export</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                "Generate a vCard for Dr. Sarah Lee, CMO at HealthCorp, with her office address."
              </p>
              <CopyBlock code={`{
  "name": "generate_vcard_text",
  "arguments": {
    "prefix": "Dr.",
    "firstName": "Sarah",
    "lastName": "Lee",
    "title": "Chief Medical Officer",
    "org": "HealthCorp",
    "emails": [{ "type": "WORK", "value": "sarah.lee@healthcorp.com" }],
    "phones": [{ "type": "WORK", "value": "+1-555-0200" }],
    "addresses": [{
      "type": "WORK",
      "street": "100 Medical Dr",
      "city": "Boston",
      "state": "MA",
      "zip": "02101",
      "country": "US"
    }]
  }
}`} />
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Returns raw vCard 3.0 text (BEGIN:VCARD ... END:VCARD) ready to save as a .vcf file.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Custom-styled QR code</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                "Make a navy-blue QR code for Gamified Studio with the website and contact email."
              </p>
              <CopyBlock code={`{
  "name": "generate_vcard_qr",
  "arguments": {
    "org": "Gamified Studio",
    "url": "https://gamified.studio",
    "emails": [{ "type": "WORK", "value": "so@gamified.studio" }],
    "width": 600,
    "darkColor": "#1e3a5f",
    "lightColor": "#ffffff"
  }
}`} />
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Returns a 600px navy-blue QR code. Custom colors are useful for matching brand guidelines on printed materials.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">4. WiFi QR code</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                "Generate a WiFi QR for my office network 'GamifiedHQ' with WPA password 'welcome2025'"
              </p>
              <CopyBlock code={`{
  "name": "generate_wifi_qr",
  "arguments": {
    "ssid": "GamifiedHQ",
    "password": "welcome2025",
    "encryption": "WPA"
  }
}`} />
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Returns a QR code that auto-connects to the WiFi network when scanned on most smartphones.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Technical Details</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Protocol:</strong> MCP (Model Context Protocol) over Streamable HTTP</li>
            <li><strong>Endpoint:</strong> <code className="bg-[var(--muted)] px-1.5 py-0.5 text-xs">https://qr.gamified.studio/mcp</code></li>
            <li><strong>Authentication:</strong> None required</li>
            <li><strong>Session:</strong> Stateful (UUID-based session IDs)</li>
            <li><strong>vCard format:</strong> vCard 3.0 (RFC 2426)</li>
            <li><strong>QR output:</strong> PNG, base64-encoded</li>
            <li><strong>Data retention:</strong> None — all processing is in-memory, discarded after response</li>
          </ul>
        </section>

        {/* Support */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Support</h2>
          <p className="text-sm">
            For questions, issues, or feedback, contact{' '}
            <a href="mailto:so@gamified.studio" className="underline underline-offset-4 hover:text-[var(--foreground)]">
              so@gamified.studio
            </a>.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <span>&copy; {new Date().getFullYear()} Gamified Studio</span>
          <div className="flex gap-4">
            <Link href="/policies/privacy" className="underline underline-offset-4 hover:text-[var(--foreground)]">
              Privacy Policy
            </Link>
            <Link href="/policies/tos" className="underline underline-offset-4 hover:text-[var(--foreground)]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
