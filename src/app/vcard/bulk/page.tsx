import type { Metadata } from 'next';
import BulkVCard from '@/components/BulkVCard';

export const metadata: Metadata = {
  title: 'Bulk vCard QR Code Generator — Generate Multiple Contact QR Codes',
  description:
    'Generate QR codes for multiple contacts at once. Paste CSV or JSON data to create vCard QR codes in bulk. Download all as a ZIP file.',
  openGraph: {
    title: 'Bulk vCard QR Code Generator',
    description:
      'Generate QR codes for multiple contacts at once. Paste CSV or JSON data to create vCard QR codes in bulk.',
    images: [{ url: '/vcard/opengraph.png', width: 1200, height: 630 }],
  },
};

export default function BulkVCardPage() {
  return <BulkVCard />;
}
