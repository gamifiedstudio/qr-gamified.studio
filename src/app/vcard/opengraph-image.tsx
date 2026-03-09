import { ImageResponse } from 'next/og';
import { OGLayout, OG_SUBTITLES } from '@/lib/og';

export const alt = 'vCard QR Code Generator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <OGLayout
      title="vCard QR Code Generator"
      subtitle={OG_SUBTITLES['vcard']}
      type="vcard"
    />,
    { ...size },
  );
}
