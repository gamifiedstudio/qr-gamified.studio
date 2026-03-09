import { ImageResponse } from 'next/og';
import { OGLayout, OG_SUBTITLES } from '@/lib/og';
import { PAGE_SEO } from '@/seo';
import { QR_TYPES } from '@/qr-types';

export const alt = 'QR Code Generator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return QR_TYPES.filter((t) => t.id !== 'vcard').map((t) => ({ type: t.id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const seo = PAGE_SEO[type];
  const title = seo?.h1 ?? 'QR Code Generator';
  const subtitle = OG_SUBTITLES[type] ?? '';

  return new ImageResponse(
    <OGLayout title={title} subtitle={subtitle} type={type} />,
    { ...size },
  );
}
