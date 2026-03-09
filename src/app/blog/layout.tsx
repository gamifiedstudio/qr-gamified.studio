import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Blog | QR Gamified Studio",
    template: "%s | QR Gamified Studio",
  },
  description:
    "Tips, guides, and insights on QR codes — from vCards and WiFi sharing to events and bulk generation.",
  openGraph: {
    siteName: "QR Gamified Studio",
    type: "website",
    locale: "en_US",
    url: "https://qr.gamified.studio/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
