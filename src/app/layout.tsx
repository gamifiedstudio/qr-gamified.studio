import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { ThemeProvider } from 'next-themes';
import { SiteNav } from '@/components/SiteNav';
import { GitHubBadge } from '@/components/GitHubBadge';
import { SiteFooter } from '@/components/SiteFooter';
import '@fontsource-variable/geist';
import '@/index.css';

const GA_ID = 'G-R2J5HK6LX2';

const BASE_URL = 'https://qr.gamified.studio';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Free QR Code Generator — URLs, vCards, WiFi, Events & More',
    template: '%s | QR Gamified Studio',
  },
  description:
    'Generate custom QR codes for free. Create QR codes for URLs, vCards, WiFi passwords, emails, phone numbers, SMS, calendar events, and more.',
  keywords:
    'QR code generator, free QR code, vCard QR code, WiFi QR code, QR code maker, create QR code online, custom QR code',
  authors: [{ name: 'Gamified Studio', url: 'https://gamified.studio' }],
  openGraph: {
    type: 'website',
    siteName: 'QR Code Generator by Gamified Studio',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="h-screen bg-background flex flex-col overflow-hidden">
            <div className="mx-auto w-full max-w-7xl border-x border-border flex flex-col flex-1 min-h-0">
              {/* Header */}
              <header className="shrink-0 border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      href="/"
                      className="text-sm font-semibold tracking-wide uppercase text-foreground hover:text-foreground/80 transition-colors"
                    >
                      <span className="hand-underline">Free</span> QR Code Generator
                    </Link>
                    <span className="h-4 w-px bg-border" aria-hidden="true" />
                    <GitHubBadge />
                  </div>
                  <SiteNav />
                </div>
              </header>

              {/* Page content */}
              <main className="flex-1 min-h-0 flex flex-col">
                {children}
              </main>

              {/* Footer */}
              <SiteFooter />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
