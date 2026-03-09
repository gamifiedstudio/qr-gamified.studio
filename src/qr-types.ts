// All QR code type encoders — each takes form data and returns raw string for QR encoding

import { type VCardData, buildVCard, hasMinimumData } from './vcard.ts';

// ── Type definitions ──

export type QRType =
  | 'url'
  | 'text'
  | 'phone'
  | 'sms'
  | 'email'
  | 'wifi'
  | 'vcard'
  | 'event'
  | 'x-profile'
  | 'mecard';

export interface QRTypeConfig {
  id: QRType;
  label: string;
  icon: string;
  description: string;
}

export const QR_TYPES: QRTypeConfig[] = [
  { id: 'url', label: 'URL', icon: '🔗', description: 'Website link' },
  { id: 'text', label: 'Text', icon: '📝', description: 'Plain text' },
  { id: 'vcard', label: 'vCard', icon: '👤', description: 'Contact card' },
  { id: 'wifi', label: 'Wi-Fi', icon: '📶', description: 'Network credentials' },
  { id: 'email', label: 'Email', icon: '✉️', description: 'Compose email' },
  { id: 'phone', label: 'Phone', icon: '📞', description: 'Call number' },
  { id: 'sms', label: 'SMS', icon: '💬', description: 'Text message' },
  { id: 'event', label: 'Event', icon: '📅', description: 'Calendar event' },
  { id: 'mecard', label: 'MeCard', icon: '🪪', description: 'Compact contact' },
  { id: 'x-profile', label: 'X / Twitter', icon: '𝕏', description: 'Profile link' },
];

// ── Form data types ──

export interface URLData {
  url: string;
}

export interface TextData {
  text: string;
}

export interface PhoneData {
  phone: string;
}

export interface SMSData {
  phone: string;
  message: string;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export interface WiFiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface EventData {
  title: string;
  location: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
}

export interface MeCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  org: string;
  url: string;
  address: string;
  note: string;
}

export interface XProfileData {
  username: string;
}

// ── Default values ──

export const defaults: Record<QRType, unknown> = {
  url: { url: '' } as URLData,
  text: { text: '' } as TextData,
  phone: { phone: '' } as PhoneData,
  sms: { phone: '', message: '' } as SMSData,
  email: { to: '', subject: '', body: '' } as EmailData,
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false } as WiFiData,
  vcard: null, // uses VCardData from vcard.ts
  event: {
    title: '', location: '', description: '',
    startDate: '', startTime: '', endDate: '', endTime: '', allDay: false,
  } as EventData,
  mecard: {
    firstName: '', lastName: '', phone: '', email: '',
    org: '', url: '', address: '', note: '',
  } as MeCardData,
  'x-profile': { username: '' } as XProfileData,
};

// ── Encoders ──

function encodeURL(data: URLData): string {
  let url = data.url.trim();
  if (url && !url.match(/^https?:\/\//i)) url = 'https://' + url;
  return url;
}

function encodeText(data: TextData): string {
  return data.text;
}

function encodePhone(data: PhoneData): string {
  return `tel:${data.phone.trim()}`;
}

function encodeSMS(data: SMSData): string {
  const phone = data.phone.trim();
  const msg = data.message.trim();
  if (msg) return `SMSTO:${phone}:${msg}`;
  return `SMSTO:${phone}`;
}

function encodeEmail(data: EmailData): string {
  const parts: string[] = [];
  if (data.subject) parts.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) parts.push(`body=${encodeURIComponent(data.body)}`);
  const query = parts.length ? `?${parts.join('&')}` : '';
  return `mailto:${data.to.trim()}${query}`;
}

function encodeWiFi(data: WiFiData): string {
  const esc = (s: string) => s.replace(/[\\;,"":]/g, '\\$&');
  let str = `WIFI:T:${data.encryption};S:${esc(data.ssid)};`;
  if (data.encryption !== 'nopass' && data.password) {
    str += `P:${esc(data.password)};`;
  }
  if (data.hidden) str += 'H:true;';
  str += ';';
  return str;
}

function encodeEvent(data: EventData): string {
  const fmt = (date: string, time: string, allDay: boolean) => {
    if (!date) return '';
    const d = date.replace(/-/g, '');
    if (allDay) return d;
    const t = (time || '0000').replace(/:/g, '') + '00';
    return `${d}T${t}`;
  };

  const lines: string[] = [
    'BEGIN:VEVENT',
    `SUMMARY:${data.title}`,
  ];
  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (data.description) lines.push(`DESCRIPTION:${data.description}`);

  const start = fmt(data.startDate, data.startTime, data.allDay);
  const end = fmt(data.endDate || data.startDate, data.endTime, data.allDay);
  if (start) {
    if (data.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${start}`);
      if (end) lines.push(`DTEND;VALUE=DATE:${end}`);
    } else {
      lines.push(`DTSTART:${start}`);
      if (end) lines.push(`DTEND:${end}`);
    }
  }
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

function encodeMeCard(data: MeCardData): string {
  const esc = (s: string) => s.replace(/[\\;,"":]/g, '\\$&');
  let str = 'MECARD:';
  if (data.lastName || data.firstName) {
    str += `N:${esc(data.lastName)},${esc(data.firstName)};`;
  }
  if (data.phone) str += `TEL:${esc(data.phone)};`;
  if (data.email) str += `EMAIL:${esc(data.email)};`;
  if (data.org) str += `ORG:${esc(data.org)};`;
  if (data.url) str += `URL:${esc(data.url)};`;
  if (data.address) str += `ADR:${esc(data.address)};`;
  if (data.note) str += `NOTE:${esc(data.note)};`;
  str += ';';
  return str;
}

function encodeXProfile(data: XProfileData): string {
  const username = data.username.trim().replace(/^@/, '');
  return `https://x.com/${username}`;
}

// ── Main encode function ──

export function encode(type: QRType, data: unknown, vcardData?: VCardData): string {
  switch (type) {
    case 'url': return encodeURL(data as URLData);
    case 'text': return encodeText(data as TextData);
    case 'phone': return encodePhone(data as PhoneData);
    case 'sms': return encodeSMS(data as SMSData);
    case 'email': return encodeEmail(data as EmailData);
    case 'wifi': return encodeWiFi(data as WiFiData);
    case 'vcard': return vcardData && hasMinimumData(vcardData) ? buildVCard(vcardData) : '';
    case 'event': return encodeEvent(data as EventData);
    case 'mecard': return encodeMeCard(data as MeCardData);
    case 'x-profile': return encodeXProfile(data as XProfileData);
    default: return '';
  }
}

export function hasData(type: QRType, data: unknown, vcardData?: VCardData): boolean {
  switch (type) {
    case 'url': return !!(data as URLData).url.trim();
    case 'text': return !!(data as TextData).text.trim();
    case 'phone': return !!(data as PhoneData).phone.trim();
    case 'sms': return !!(data as SMSData).phone.trim();
    case 'email': return !!(data as EmailData).to.trim();
    case 'wifi': return !!(data as WiFiData).ssid.trim();
    case 'vcard': return !!vcardData && hasMinimumData(vcardData);
    case 'event': return !!(data as EventData).title.trim() && !!(data as EventData).startDate;
    case 'mecard': return !!((data as MeCardData).firstName || (data as MeCardData).lastName);
    case 'x-profile': return !!(data as XProfileData).username.trim();
    default: return false;
  }
}
