import type { Metadata } from 'next';
import QRGenerator from '@/components/QRGenerator';
import { PAGE_SEO, getCanonicalURL } from '@/seo';
import { QR_TYPES } from '@/qr-types';

export function generateStaticParams() {
  return QR_TYPES
    .filter(t => t.id !== 'vcard')
    .map(t => ({ type: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const seo = PAGE_SEO[type];

  if (!seo) {
    return {
      title: 'Free QR Code Generator',
    };
  }

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: getCanonicalURL(type),
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: getCanonicalURL(type),
    },
    twitter: {
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function TypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  return <QRGenerator type={type} />;
}
