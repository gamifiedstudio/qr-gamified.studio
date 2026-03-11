import type { Metadata } from 'next';
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
