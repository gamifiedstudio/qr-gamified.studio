import type { Metadata } from 'next';
import QRGenerator from '@/components/QRGenerator';

export const metadata: Metadata = {
  title: 'Free QR Code Generator — URLs, vCards, WiFi, Events & More',
  description: 'Generate custom QR codes for free. Create QR codes for URLs, vCards, WiFi passwords, emails, phone numbers, SMS, calendar events, and more.',
};

export default function HomePage() {
  return <QRGenerator />;
}
