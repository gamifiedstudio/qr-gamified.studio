import type { Metadata } from 'next';
import QRGenerator from '@/components/QRGenerator';
import { PAGE_SEO, getCanonicalURL } from '@/seo';

const seo = PAGE_SEO['vcard'];

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  alternates: {
    canonical: getCanonicalURL('vcard'),
  },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: getCanonicalURL('vcard'),
  },
  twitter: {
    title: seo.title,
    description: seo.description,
  },
};

export default function VCardPage() {
  return <QRGenerator type="vcard" />;
}
