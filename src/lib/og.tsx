import { type ReactElement } from 'react';

const SO_AVATAR =
  'data:image/jpeg;base64,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';
const GS_AVATAR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAADBUlEQVR4nNSZMWv6ThjHk8NAW9qhU2mXtpAsTae+gJZChpaOhUKXlk7J2pfUuYKgUUjOQR3cxRch6OAiIvHM/flzIOWnxid3Z+78znfn8zH3zTfPXYlSauyzkOoCRFWCDKpWq71ej2N1hNDZ2dlgMOCYe3d39/Lysn0cBejr64ujAsMwLMvq9/vn5+ccc33fh9QG2kKmaXJUwHRzc4Mx5mAA/ujOPYAQcl230+lcX1/vZP1dLLoq27ajKLq4uJC+cnFvIcdx4jjm80OGCn2Nuq6LMZb7HIrOAdd12+321dWVrAUVBJlt23Ecy3oOapLYcZwoiqT4QdmnxO3trRQ/qPwWYn4QzAfFH3Pi+aD+a1QwH9QDCOaDFgAiftAFgNsPGgHw+UEvAA4/gAAKbvyZHy4vL0GjIW1bs9k8ODjgKMWyLMj6a0UIgQwDAVBK6/U6B4MIAFBQgMVigTE+Pj7eVwDG0Gq1Tk5O9hWAUpqmKcb48PBwXwGY4H7QFIBSijGG7CV9AYB+0Bdg6YfsvVQAgCmYso1G4/X1dTabbQJIkmTT3CRJRqPR/0WsO0U8Ojo6PT3dXoHgH5CdD9lPIEmSj4+PTYUFQQApQBQg2w9btxAhxPd9xQAZfoB4gBCy9jkUCsC0mg9AE8/n8/f3d/UAq36Av4VW/aAAYOmHJUOu1yghJAgCxQD/+CFvDhBCPj8/FQMwMT9wBNnSD0AA0C0lh56ensIwfHt7yzuxVCr9/PxYlgUcL5rEGUrTtNvtjsfjyWTCMXc4HH5/f28fyrVBcihX//BXMq9ZReR53u/vL0c/rcs1q2EYz8/PYRjm7aeBKgIAIfT4+LgjhoJO5hBC9/f3lUqF73wpa2W5y2XINE3P88rlslyGos9GmR9ync1kq2gA5odarSbLDwpOpxFCDw8Psvyg7Hhdlh9U3g9I8YNKACl+UHxDI54P6q+YBPNBPQATtx90AeD2gy4Af/MhV/+gEQBT3v5BO4C8/cMOe2IRpWk6nU4hDJoCwKXjFsql/wIAAP///HWUDCRDqTIAAAAASUVORK5CYII=';

/** Site colors (from index.css .dark theme) */
const C = {
  bg: '#0a0a0a',
  fg: '#e5e5e5',
  muted: '#737373',
  border: '#1a1a1a',
  subtle: '#2a2a2a',
};

export const OG_SUBTITLES: Record<string, string> = {
  '': 'URLs, vCards, WiFi, Events & More — no sign-up required',
  url: 'Create link QR codes for any website — free',
  vcard: 'Share contact info instantly — scan to save',
  wifi: 'Share WiFi passwords with a single scan',
  email: 'Pre-fill email with recipient, subject & body',
  phone: 'One scan to call — no manual dialing',
  sms: 'Create text message QR codes with pre-filled content',
  event: 'Add calendar events automatically — scan to save',
  mecard: 'Compact contact cards — smaller QR, same info',
  text: 'Encode any plain text as a scannable QR code',
  'x-profile': 'Share your profile — scan to follow',
};

/** Lucide-style SVG icon paths (24×24 viewBox) */
const ICONS: Record<string, string> = {
  home: '<path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" stroke-linejoin="round"/>',
  url: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  vcard: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/>',
  email: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
  sms: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  event: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  mecard: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  text: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  'x-profile': '<path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.4L20 4h-2l-5.2 6.4L8 4H4z"/>',
};

/** Encode an SVG string as a data URI */
function svgUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Data URI for a Lucide-style icon by QR type */
function iconUri(type: string): string {
  const paths = ICONS[type] || ICONS.home;
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${C.fg}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`,
  );
}

/** QR code logo mark data URI (same geometry as favicon.svg) */
function qrMarkUri(): string {
  const c = C.subtle;
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33">` +
      // Finder pattern outlines
      `<rect x="2" y="2" width="10" height="10" rx="1" fill="none" stroke="${c}" stroke-width="2"/>` +
      `<rect x="20" y="2" width="10" height="10" rx="1" fill="none" stroke="${c}" stroke-width="2"/>` +
      `<rect x="2" y="20" width="10" height="10" rx="1" fill="none" stroke="${c}" stroke-width="2"/>` +
      // Finder pattern centers
      `<rect x="5" y="5" width="4" height="4" rx="0.5" fill="${c}"/>` +
      `<rect x="23" y="5" width="4" height="4" rx="0.5" fill="${c}"/>` +
      `<rect x="5" y="23" width="4" height="4" rx="0.5" fill="${c}"/>` +
      // Data modules (bottom-right quadrant)
      `<rect x="15" y="15" width="3" height="3" rx="0.5" fill="${c}"/>` +
      `<rect x="20" y="20" width="3" height="3" rx="0.5" fill="${c}"/>` +
      `<rect x="26" y="20" width="3" height="3" rx="0.5" fill="${c}"/>` +
      `<rect x="20" y="26" width="3" height="3" rx="0.5" fill="${c}"/>` +
      `<rect x="15" y="21" width="3" height="3" rx="0.5" fill="${c}"/>` +
      `<rect x="21" y="15" width="3" height="3" rx="0.5" fill="${c}"/>` +
      // Side modules
      `<rect x="15" y="2" width="3" height="3" rx="0.5" fill="${c}"/>` +
      `<rect x="2" y="15" width="3" height="3" rx="0.5" fill="${c}"/>` +
      `</svg>`,
  );
}

interface OGImageProps {
  title: string;
  subtitle: string;
  type?: string;
}

export function OGLayout({ title, subtitle, type }: OGImageProps): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: C.bg,
        position: 'relative',
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {/* Top border line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 1,
          background: C.border,
        }}
      />
      {/* Bottom border line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 1,
          background: C.border,
        }}
      />

      {/* Left panel */}
      <div
        style={{
          width: 840,
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: 64,
        }}
      >
        {/* Icon */}
        <img
          src={iconUri(type || 'home')}
          width={43}
          height={43}
          alt=""
          style={{ marginTop: 180, opacity: 0.85 }}
        />

        {/* Spacer between icon and title */}
        <div style={{ flex: 1, minHeight: 30 }} />

        {/* Title */}
        <div
          style={{
            color: C.fg,
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: C.muted,
            fontSize: 20,
            marginTop: 12,
          }}
        >
          {subtitle}
        </div>

        {/* Spacer between subtitle and footer */}
        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 24,
            marginBottom: 44,
          }}
        >
          {/* Made by So from Gamified.studio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: C.muted, fontSize: 13, opacity: 0.7 }}>
              Made by
            </span>
            <img
              src={SO_AVATAR}
              width={18}
              height={18}
              alt=""
              style={{ borderRadius: '50%' }}
            />
            <span style={{ color: C.fg, fontSize: 13 }}>So</span>
            <span style={{ color: C.muted, fontSize: 13, opacity: 0.7 }}>
              from
            </span>
            <img
              src={GS_AVATAR}
              width={18}
              height={18}
              alt=""
              style={{ borderRadius: '50%' }}
            />
            <span style={{ color: C.fg, fontSize: 13 }}>Gamified.studio</span>
          </div>
          <span style={{ color: C.muted, fontSize: 13, opacity: 0.5 }}>
            Free, no sign-up required
          </span>
        </div>
      </div>

      {/* Vertical divider */}
      <div style={{ width: 1, height: '100%', background: C.border }} />

      {/* Right panel — QR logo mark */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 160,
        }}
      >
        <img src={qrMarkUri()} width={140} height={140} alt="" />
      </div>
    </div>
  );
}
