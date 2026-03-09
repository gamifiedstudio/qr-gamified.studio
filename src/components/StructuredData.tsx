export function WebApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free QR Code Generator',
    url: 'https://qr.gamified.studio/',
    description:
      'Generate custom QR codes for URLs, vCards, WiFi passwords, emails, phone numbers, SMS, calendar events, MeCards, and X/Twitter profiles. Free, no sign-up required.',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'URL QR codes',
      'vCard contact QR codes',
      'WiFi password QR codes',
      'Email QR codes',
      'Phone number QR codes',
      'SMS QR codes',
      'Calendar event QR codes',
      'MeCard QR codes',
      'X/Twitter profile QR codes',
      'Custom colors and dot patterns',
      'Center logo support',
      'PNG and SVG download',
    ],
    creator: {
      '@type': 'Organization',
      name: 'Gamified Studio',
      url: 'https://gamified.studio',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function HomeFAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What types of QR codes can I create?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can create QR codes for URLs, plain text, vCard contacts, WiFi passwords, emails, phone numbers, SMS messages, calendar events, MeCards, and X/Twitter profiles — all for free.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this QR code generator free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, completely free with no sign-up required. Generate unlimited QR codes and download them as high-quality PNG or SVG files.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I customize the QR code design?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can change foreground and background colors, choose from 6 dot patterns (rounded, dots, square, classy, classy-rounded, extra-rounded), customize corner styles, and add a center logo.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a vCard QR code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "A vCard QR code encodes contact information (name, phone, email, address, company) in the vCard 3.0 format. When scanned, the contact is automatically added to the phone's address book.",
        },
      },
      {
        '@type': 'Question',
        name: 'How do I create a WiFi QR code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Select the WiFi type, enter your network name (SSID), password, and encryption type (WPA/WPA2, WEP, or None). The generated QR code lets anyone scan to connect instantly — no typing required.',
        },
      },
      {
        '@type': 'Question',
        name: 'What formats can I download QR codes in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QR codes can be downloaded as PNG (raster, ideal for digital use) or SVG (vector, perfect for print at any size).',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
