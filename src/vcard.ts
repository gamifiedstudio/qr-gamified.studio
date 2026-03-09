export interface PhoneEntry {
  type: string;
  value: string;
}

export interface EmailEntry {
  type: string;
  value: string;
}

export interface Address {
  type: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  poBox: string;
  geo?: string; // "lat,lng" for precise location (vCard GEO field)
}

export interface VCardData {
  // Name
  firstName: string;
  lastName: string;
  prefix: string;
  suffix: string;
  // Organization
  org: string;
  title: string;
  // Contact
  phones: PhoneEntry[];
  emails: EmailEntry[];
  // Addresses
  addresses: Address[];
  // Web
  url: string;
  // Notes
  note: string;
}

export const defaultVCard: VCardData = {
  firstName: '',
  lastName: '',
  prefix: '',
  suffix: '',
  org: '',
  title: '',
  phones: [{ type: 'CELL', value: '' }],
  emails: [{ type: 'WORK', value: '' }],
  addresses: [],
  url: '',
  note: '',
};

export function createEmptyAddress(): Address {
  return {
    type: 'WORK',
    street: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    poBox: '',
    geo: '',
  };
}

/**
 * Escape special characters in vCard values per RFC 6350.
 * Semicolons, commas, and backslashes must be escaped.
 * Newlines become literal \n.
 */
function escapeValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Build a vCard 3.0 string from form data.
 *
 * Address handling follows RFC 2426 § 3.2.1:
 *   ADR;TYPE=type:PO Box;Extended Address;Street;City;Region;Postal Code;Country
 *
 * This is the part tec-it gets wrong — they often swap fields or
 * collapse the 7-component structure. We keep each field in its
 * correct positional slot.
 */
export function buildVCard(data: VCardData): string {
  const lines: string[] = [];

  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');

  // N: Last;First;Middle;Prefix;Suffix
  const lastName = escapeValue(data.lastName);
  const firstName = escapeValue(data.firstName);
  const prefix = escapeValue(data.prefix);
  const suffix = escapeValue(data.suffix);
  lines.push(`N:${lastName};${firstName};;${prefix};${suffix}`);

  // FN: Full display name
  const fullName = [data.prefix, data.firstName, data.lastName, data.suffix]
    .filter(Boolean)
    .join(' ');
  if (fullName) {
    lines.push(`FN:${escapeValue(fullName)}`);
  }

  // ORG
  if (data.org) {
    lines.push(`ORG:${escapeValue(data.org)}`);
  }

  // TITLE
  if (data.title) {
    lines.push(`TITLE:${escapeValue(data.title)}`);
  }

  // TEL entries
  for (const phone of data.phones) {
    if (phone.value.trim()) {
      lines.push(`TEL;TYPE=${phone.type}:${phone.value.trim()}`);
    }
  }

  // EMAIL entries
  for (const email of data.emails) {
    if (email.value.trim()) {
      lines.push(`EMAIL;TYPE=${email.type}:${email.value.trim()}`);
    }
  }

  // ADR entries — the critical part
  // Format: ADR;TYPE=x:PO Box;Extended Addr;Street;City;State;ZIP;Country
  for (const addr of data.addresses) {
    const hasContent = [
      addr.poBox, addr.street2, addr.street,
      addr.city, addr.state, addr.zip, addr.country,
    ].some((v) => v.trim());

    if (hasContent) {
      const components = [
        escapeValue(addr.poBox.trim()),
        escapeValue(addr.street2.trim()),   // Extended Address (apt, suite, etc.)
        escapeValue(addr.street.trim()),     // Street
        escapeValue(addr.city.trim()),       // Locality
        escapeValue(addr.state.trim()),      // Region
        escapeValue(addr.zip.trim()),        // Postal Code
        escapeValue(addr.country.trim()),    // Country
      ];
      lines.push(`ADR;TYPE=${addr.type}:${components.join(';')}`);

      // Also add a LABEL for display purposes
      const labelParts = [
        addr.street.trim(),
        addr.street2.trim(),
        [addr.city.trim(), addr.state.trim(), addr.zip.trim()].filter(Boolean).join(', '),
        addr.country.trim(),
      ].filter(Boolean);
      if (labelParts.length > 0) {
        lines.push(`LABEL;TYPE=${addr.type}:${escapeValue(labelParts.join('\\n'))}`);
      }

      // GEO for precise map pin
      if (addr.geo) {
        lines.push(`GEO:${addr.geo}`);
      }
    }
  }

  // URL
  if (data.url) {
    lines.push(`URL:${data.url.trim()}`);
  }

  // NOTE
  if (data.note) {
    lines.push(`NOTE:${escapeValue(data.note)}`);
  }

  // REV — timestamp
  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);

  lines.push('END:VCARD');

  // vCard spec requires \r\n line endings
  return lines.join('\r\n');
}

export function hasMinimumData(data: VCardData): boolean {
  return !!(data.firstName || data.lastName || data.org);
}
