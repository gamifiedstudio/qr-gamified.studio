import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for QR Gamified Studio. Free QR code generator with no accounts or data collection.',
};

export default function TermsOfService() {
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

        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-10">
          Last updated: March 9, 2026
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p>
              QR Gamified Studio ("we", "us", "our") operates the QR code generator at{' '}
              <strong>qr.gamified.studio</strong>, including the web application, CLI tool, and
              MCP (Model Context Protocol) server. These Terms of Service ("Terms") govern your
              use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
            <p>
              By accessing or using the service, you agree to be bound by these Terms. If you
              do not agree to these Terms, you should not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Service Description</h2>
            <p className="mb-3">
              QR Gamified Studio is a <strong>free QR code generator</strong> available through
              multiple interfaces:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Web application</strong> — generates QR codes entirely client-side in
                your browser. No data is sent to our servers.
              </li>
              <li>
                <strong>MCP server</strong> — processes tool call requests in-memory and returns
                generated QR codes or vCard text. No data is persisted.
              </li>
              <li>
                <strong>CLI tool</strong> — runs locally on your machine with no network
                requests to our servers.
              </li>
            </ul>
            <p className="mt-3">
              No accounts, sign-ups, or authentication are required to use any part of the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Use the service for any <strong>illegal or unlawful purpose</strong>, including
                generating QR codes that link to malicious, fraudulent, or harmful content.
              </li>
              <li>
                <strong>Abuse the MCP endpoint</strong> with excessive or automated requests
                beyond reasonable use. Rate limiting may be applied at our discretion.
              </li>
              <li>
                Attempt to <strong>reverse engineer, decompile, or disassemble</strong> the
                service beyond what is permitted by applicable law.
              </li>
              <li>
                Attempt to <strong>disrupt, overload, or interfere</strong> with the service's
                infrastructure or availability for other users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
            <p className="mb-3">
              <strong>QR codes you generate are yours.</strong> We claim no ownership over the
              output produced by the service.
            </p>
            <p>
              The service itself, including its source code, branding, design, and
              documentation, is owned by Gamified Studio. You may not copy, modify, or
              distribute the service or its branding without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">No Warranty</h2>
            <p>
              The service is provided <strong>"as is"</strong> and{' '}
              <strong>"as available"</strong> without warranties of any kind, whether express or
              implied, including but not limited to implied warranties of merchantability,
              fitness for a particular purpose, and non-infringement. We do not guarantee that
              the service will be uninterrupted, error-free, or available at all times.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Gamified Studio shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, or any
              loss of profits or data, arising out of or in connection with your use of the
              service or any QR codes generated through it, regardless of the cause of action
              or the theory of liability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">MCP Server Terms</h2>
            <p className="mb-3">
              The remote MCP endpoint at{' '}
              <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm">
                qr.gamified.studio/mcp
              </code>{' '}
              is provided for integration with AI assistants and other MCP-compatible clients.
              The following additional terms apply:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>No SLA.</strong> The MCP endpoint is provided without any service level
                agreement. We make no guarantees regarding uptime, latency, or availability.
              </li>
              <li>
                We may <strong>rate-limit, modify, or discontinue</strong> the MCP endpoint at
                any time without prior notice.
              </li>
              <li>
                The endpoint is intended for reasonable, good-faith use. Automated abuse or
                excessive request volumes may result in temporary or permanent access
                restrictions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Changes will be reflected on this
              page with an updated date. Your continued use of the service after changes are
              posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p>
              If you have questions about these Terms of Service, contact us at{' '}
              <a
                href="mailto:so@gamified.studio"
                className="underline underline-offset-4 hover:text-[var(--foreground)]"
              >
                so@gamified.studio
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)] text-sm text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} Gamified Studio. All rights reserved.
          {' · '}
          <Link
            href="/policies/privacy"
            className="underline underline-offset-4 hover:text-[var(--foreground)]"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
