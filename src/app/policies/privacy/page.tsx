import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for QR Gamified Studio. We do not collect, store, or transmit any personal data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to QR Generator
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-10">
          Last updated: March 9, 2026
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p>
              QR Gamified Studio ("we", "us", "our") operates the QR code generator at{' '}
              <strong>qr.gamified.studio</strong>, including the web application, CLI tool, and
              MCP (Model Context Protocol) server. We are committed to protecting your privacy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data We Collect</h2>
            <p className="mb-3">
              <strong>We do not collect, store, or transmit any personal data.</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>QR code generation</strong> happens entirely in your browser (web app) or
                on your local machine (CLI). No contact data, vCard information, URLs, or any
                input you provide is sent to our servers.
              </li>
              <li>
                <strong>MCP server requests</strong> are processed in-memory and not logged or
                stored. Contact data sent via MCP tool calls is used solely to generate the
                requested QR code or vCard text and is immediately discarded after the response
                is returned.
              </li>
              <li>
                <strong>No cookies</strong> are set. No tracking scripts, analytics, or
                third-party services are loaded.
              </li>
              <li>
                <strong>No accounts or sign-ups</strong> are required. We do not collect names,
                email addresses, or any identifying information.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Server Logs</h2>
            <p>
              Our hosting provider (Railway) may collect standard HTTP access logs (IP address,
              request path, timestamp, user agent) as part of normal infrastructure operations.
              These logs are managed by Railway under their own{' '}
              <a
                href="https://railway.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-[var(--foreground)]"
              >
                privacy policy
              </a>
              . We do not access or process these logs for any purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">MCP Server (Remote)</h2>
            <p>
              The remote MCP endpoint at <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm">qr.gamified.studio/mcp</code> processes
              tool calls over the Streamable HTTP transport. Specifically:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Contact data provided in tool calls is used only to generate the QR code or vCard text.</li>
              <li>No data is persisted, cached, or written to disk.</li>
              <li>Session state is held in-memory for the duration of the connection and discarded on disconnect.</li>
              <li>No authentication is required — no OAuth tokens or credentials are collected.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
            <p>
              The web app uses <strong>Komoot Photon</strong> for address autocomplete
              suggestions. When you type in the address field, search queries are sent to{' '}
              <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm">photon.komoot.io</code>.
              This is the only external network request made by the app. Komoot's API does not
              require authentication and their usage is subject to their own terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
            <p>
              We retain no user data. All QR codes are generated client-side or in-memory on
              the server and are never stored. There is nothing to delete because nothing is
              saved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to This Policy</h2>
            <p>
              We may update this policy as our services evolve. Changes will be reflected on
              this page with an updated date. Since we collect no data, changes are unlikely to
              be material.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p>
              If you have questions about this privacy policy or our practices, contact us at{' '}
              <a
                href="mailto:so@gamified.studio"
                className="underline underline-offset-4 hover:text-[var(--foreground)]"
              >
                so@gamified.studio
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <span>© {new Date().getFullYear()} Gamified Studio</span>
          <Link href="/policies/tos" className="underline underline-offset-4 hover:text-[var(--foreground)]">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
