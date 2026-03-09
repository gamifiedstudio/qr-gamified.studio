import { ImageResponse } from 'next/og';
import { OGLayout } from '@/lib/og';

export const alt = 'Free QR Code Generator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <OGLayout
      title="Free QR Code Generator"
      subtitle="URLs, vCards, WiFi, Events & More — no sign-up required"
    />,
    { ...size },
  );
}
