"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import QRCodeStyling, { type DotType, type CornerSquareType, type CornerDotType } from 'qr-code-styling';
import JSZip from 'jszip';
import { type VCardData, type PhoneEntry, type EmailEntry, type Address, buildVCard, hasMinimumData } from '@/vcard';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

// ── QR Style ──

interface QRStyle {
  dotColor: string;
  bgColor: string;
  transparentBg: boolean;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  bgRound: number;
  logo: string;
  logoSize: number;
  logoMargin: number;
}

const defaultStyle: QRStyle = {
  dotColor: '#000000',
  bgColor: '#ffffff',
  transparentBg: false,
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  bgRound: 0,
  logo: '',
  logoSize: 0.35,
  logoMargin: 6,
};

const dotTypes: { label: string; value: DotType }[] = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Dots', value: 'dots' },
  { label: 'Square', value: 'square' },
  { label: 'Classy', value: 'classy' },
  { label: 'Classy Rounded', value: 'classy-rounded' },
  { label: 'Extra Rounded', value: 'extra-rounded' },
];

const cornerSquareTypes: { label: string; value: CornerSquareType }[] = [
  { label: 'Square', value: 'square' },
  { label: 'Extra Rounded', value: 'extra-rounded' },
  { label: 'Dot', value: 'dot' },
];

const cornerDotTypes: { label: string; value: CornerDotType }[] = [
  { label: 'Square', value: 'square' },
  { label: 'Dot', value: 'dot' },
];

type InputMode = 'csv' | 'json';

const MAX_CONTACTS = 500;
const VISIBLE_CONTACTS = 20;

// ── CSV columns ──

const CSV_EXAMPLE = `firstName,lastName,prefix,suffix,org,title,phone,email,street,street2,city,state,zip,country,poBox,geo,url,note
John,Doe,,Mr.,Acme Corp,Software Engineer,CELL:+1 234 567 8900,WORK:john@acme.com,123 Main St,,Dubai,Dubai,00000,UAE,,,https://acme.com,
Jane,Smith,,Dr.,Acme Corp,CTO,CELL:+1 987 654 3210|WORK:+1 555 123 4567,WORK:jane@acme.com|HOME:jane@gmail.com,"Level 3, AI Campus",Innovation One,Dubai,Dubai,,UAE,,25.2070564;55.2759353,https://acme.com,`;

const CSV_AI_PROMPT = `Generate a CSV with these exact headers for vCard contact cards:

firstName,lastName,prefix,suffix,org,title,phone,email,street,street2,city,state,zip,country,poBox,geo,url,note

Rules:
- firstName or lastName or org is required (at least one)
- prefix: Mr., Mrs., Dr., etc. (optional)
- suffix: Jr., PhD, etc. (optional)
- phone: Single number or multiple with pipe separator. Format: TYPE:number or just number (defaults to CELL). Types: CELL, WORK, HOME, FAX. Example: CELL:+1234567890|WORK:+9876543210
- email: Single or multiple with pipe separator. Format: TYPE:address or just address (defaults to WORK). Types: WORK, HOME. Example: WORK:john@acme.com|HOME:john@gmail.com
- street: Main street address (optional)
- street2: Apt, suite, floor, building name (optional)
- city, state, zip, country: Address fields (optional)
- poBox: PO Box number (optional)
- geo: GPS coordinates as "lat;lng" for exact map pin (optional). Get coordinates from Google Maps by right-clicking a location → "Copy coordinates", then format as lat;lng (e.g. 25.2070564;55.2759353). This ensures the contact navigates to the exact location regardless of how the text address resolves.
- url: Website URL (optional)
- note: Additional notes (optional)
- Wrap fields in quotes if they contain commas

Output ONLY the CSV with headers, no markdown code blocks, no explanation. I need contacts for the following people:

[LIST YOUR PEOPLE HERE]`;

// ── JSON templates ──

const JSON_EXAMPLE = `[
  {
    "firstName": "John",
    "lastName": "Doe",
    "prefix": "",
    "suffix": "",
    "org": "Acme Corp",
    "title": "Software Engineer",
    "phones": [
      { "type": "CELL", "value": "+1 234 567 8900" }
    ],
    "emails": [
      { "type": "WORK", "value": "john@acme.com" }
    ],
    "addresses": [
      {
        "type": "WORK",
        "street": "Level 3, AI Campus",
        "street2": "Innovation One",
        "city": "Dubai",
        "state": "Dubai",
        "zip": "",
        "country": "UAE",
        "poBox": "",
        "geo": "25.2070564;55.2759353"
      }
    ],
    "url": "https://acme.com",
    "note": ""
  }
]`;

const JSON_AI_PROMPT = `Generate a JSON array of vCard contacts using this exact structure:

\`\`\`json
${JSON_EXAMPLE}
\`\`\`

Field reference:
- firstName, lastName: Required (at least one)
- prefix: Mr., Mrs., Dr., etc. (optional)
- suffix: Jr., PhD, etc. (optional)
- org: Company/organization name
- title: Job title
- phones: Array of { type: "CELL"|"WORK"|"HOME"|"FAX", value: "phone number" }
- emails: Array of { type: "WORK"|"HOME", value: "email address" }
- addresses: Array of { type: "WORK"|"HOME", street: "", street2: "", city: "", state: "", zip: "", country: "", poBox: "", geo: "lat;lng" }
  - geo is optional GPS coordinates for exact map pin (e.g. "25.2070564;55.2759353"). Get coordinates from Google Maps by right-clicking a location → Copy coordinates. This ensures the contact navigates to the exact location.
- url: Website URL
- note: Additional notes

Output ONLY the JSON array, no markdown, no explanation. I need contacts for the following people:

[LIST YOUR PEOPLE HERE]`;

// ── CSV Parser ──

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ("")
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function parsePhoneField(raw: string): PhoneEntry[] {
  if (!raw.trim()) return [{ type: 'CELL', value: '' }];
  return raw.split('|').map(part => {
    const trimmed = part.trim();
    const colonIdx = trimmed.indexOf(':');
    // Check if before the colon is a known phone type
    if (colonIdx > 0) {
      const maybeType = trimmed.slice(0, colonIdx).toUpperCase();
      if (['CELL', 'WORK', 'HOME', 'FAX'].includes(maybeType)) {
        return { type: maybeType, value: trimmed.slice(colonIdx + 1).trim() };
      }
    }
    return { type: 'CELL', value: trimmed };
  }).filter(p => p.value);
}

function parseEmailField(raw: string): EmailEntry[] {
  if (!raw.trim()) return [{ type: 'WORK', value: '' }];
  return raw.split('|').map(part => {
    const trimmed = part.trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      const maybeType = trimmed.slice(0, colonIdx).toUpperCase();
      if (['WORK', 'HOME'].includes(maybeType)) {
        return { type: maybeType, value: trimmed.slice(colonIdx + 1).trim() };
      }
    }
    return { type: 'WORK', value: trimmed };
  }).filter(e => e.value);
}

function parseCSVContacts(csv: string): { contacts: VCardData[]; errors: string[] } {
  const errors: string[] = [];
  const lines = csv.trim().split('\n').map(l => l.replace(/\r$/, ''));
  if (lines.length < 2) return { contacts: [], errors: [] };

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const colMap = new Map<string, number>();
  headers.forEach((h, i) => colMap.set(h, i));

  // Check for required columns
  const hasNameCols = colMap.has('firstname') || colMap.has('lastname') || colMap.has('org');
  if (!hasNameCols) {
    return { contacts: [], errors: ['CSV must have at least one of: firstName, lastName, or org columns'] };
  }

  const get = (fields: string[], col: string) => {
    const idx = colMap.get(col);
    if (idx === undefined || idx >= fields.length) return '';
    return fields[idx].trim();
  };

  const contacts: VCardData[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // skip empty lines

    const fields = parseCSVLine(lines[i]);

    const street = get(fields, 'street');
    const street2 = get(fields, 'street2');
    const city = get(fields, 'city');
    const state = get(fields, 'state');
    const zip = get(fields, 'zip');
    const country = get(fields, 'country');
    const poBox = get(fields, 'pobox');
    const geo = get(fields, 'geo');
    const hasAddress = [street, street2, city, state, zip, country, poBox, geo].some(Boolean);

    const contact: VCardData = {
      firstName: get(fields, 'firstname'),
      lastName: get(fields, 'lastname'),
      prefix: get(fields, 'prefix'),
      suffix: get(fields, 'suffix'),
      org: get(fields, 'org'),
      title: get(fields, 'title'),
      phones: parsePhoneField(get(fields, 'phone')),
      emails: parseEmailField(get(fields, 'email')),
      addresses: hasAddress ? [{
        type: 'WORK',
        street,
        street2,
        city,
        state,
        zip,
        country,
        poBox,
        geo,
      }] : [],
      url: get(fields, 'url'),
      note: get(fields, 'note'),
    };

    if (!hasMinimumData(contact)) {
      errors.push(`Row ${i + 1}: needs at least a first name, last name, or organization`);
      continue;
    }

    contacts.push(contact);
  }

  if (contacts.length > MAX_CONTACTS) {
    return { contacts: [], errors: [`Maximum ${MAX_CONTACTS} contacts per batch. Please split your data into smaller files.`] };
  }

  return { contacts, errors };
}

// ── JSON Parser ──

function parseJSONContacts(json: string): { contacts: VCardData[]; errors: string[] } {
  const errors: string[] = [];
  if (!json.trim()) return { contacts: [], errors: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return { contacts: [], errors: [`Invalid JSON: ${(e as Error).message}`] };
  }

  if (!Array.isArray(parsed)) {
    return { contacts: [], errors: ['Expected a JSON array of contacts'] };
  }

  const contacts: VCardData[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (typeof item !== 'object' || item === null) {
      errors.push(`Contact ${i + 1}: must be an object`);
      continue;
    }

    const contact: VCardData = {
      firstName: String(item.firstName ?? ''),
      lastName: String(item.lastName ?? ''),
      prefix: String(item.prefix ?? ''),
      suffix: String(item.suffix ?? ''),
      org: String(item.org ?? ''),
      title: String(item.title ?? ''),
      phones: Array.isArray(item.phones)
        ? item.phones.map((p: unknown) => ({
            type: String((p as PhoneEntry)?.type ?? 'CELL'),
            value: String((p as PhoneEntry)?.value ?? ''),
          }))
        : [{ type: 'CELL', value: '' }],
      emails: Array.isArray(item.emails)
        ? item.emails.map((e: unknown) => ({
            type: String((e as EmailEntry)?.type ?? 'WORK'),
            value: String((e as EmailEntry)?.value ?? ''),
          }))
        : [{ type: 'WORK', value: '' }],
      addresses: Array.isArray(item.addresses)
        ? item.addresses.map((a: unknown) => ({
            type: String((a as Address)?.type ?? 'WORK'),
            street: String((a as Address)?.street ?? ''),
            street2: String((a as Address)?.street2 ?? ''),
            city: String((a as Address)?.city ?? ''),
            state: String((a as Address)?.state ?? ''),
            zip: String((a as Address)?.zip ?? ''),
            country: String((a as Address)?.country ?? ''),
            poBox: String((a as Address)?.poBox ?? ''),
            geo: (a as Address)?.geo ? String((a as Address).geo) : '',
          }))
        : [],
      url: String(item.url ?? ''),
      note: String(item.note ?? ''),
    };

    if (!hasMinimumData(contact)) {
      errors.push(`Contact ${i + 1}: needs at least a first name, last name, or organization`);
      continue;
    }

    contacts.push(contact);
  }

  if (contacts.length > MAX_CONTACTS) {
    return { contacts: [], errors: [`Maximum ${MAX_CONTACTS} contacts per batch. Please split your data into smaller files.`] };
  }

  return { contacts, errors };
}

// ── Helpers ──

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function getContactFilename(contact: VCardData, index: number): string {
  const parts = [contact.firstName, contact.lastName].filter(Boolean);
  if (parts.length > 0) return sanitizeFilename(parts.join('_'));
  if (contact.org) return sanitizeFilename(contact.org);
  return `contact_${index + 1}`;
}

function createQRInstance(data: string, style: QRStyle): QRCodeStyling {
  return new QRCodeStyling({
    width: 1024,
    height: 1024,
    type: 'canvas',
    data,
    dotsOptions: { color: style.dotColor, type: style.dotType },
    backgroundOptions: {
      color: style.transparentBg ? 'transparent' : style.bgColor,
      round: style.bgRound,
    },
    cornersSquareOptions: { type: style.cornerSquareType },
    cornersDotOptions: { type: style.cornerDotType },
    qrOptions: { errorCorrectionLevel: style.logo ? 'Q' : 'M' },
    ...(style.logo ? {
      image: style.logo,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: style.logoSize,
        margin: style.logoMargin,
        crossOrigin: 'anonymous',
      },
    } : {}),
  });
}

// ── Component ──

export default function BulkVCard() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<InputMode>('csv');
  const [style, setStyle] = useState<QRStyle>({ ...defaultStyle });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [copied, setCopied] = useState<'prompt' | 'example' | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [dragging, setDragging] = useState(false);

  const { contacts, errors } = useMemo(
    () => mode === 'csv' ? parseCSVContacts(input) : parseJSONContacts(input),
    [input, mode],
  );

  // Preview first contact
  const firstEncoded = useMemo(() => {
    if (contacts.length === 0) return '';
    return buildVCard(contacts[0]);
  }, [contacts]);

  useEffect(() => {
    if (!firstEncoded) {
      qrCode.current = null;
      return;
    }
    if (!qrRef.current) return;
    const el = qrRef.current;
    const timer = setTimeout(() => {
      try {
        qrCode.current = new QRCodeStyling({
          width: 280,
          height: 280,
          type: 'svg',
          data: firstEncoded,
          dotsOptions: { color: style.dotColor, type: style.dotType },
          backgroundOptions: {
            color: style.transparentBg ? 'transparent' : style.bgColor,
            round: style.bgRound,
          },
          cornersSquareOptions: { type: style.cornerSquareType },
          cornersDotOptions: { type: style.cornerDotType },
          qrOptions: { errorCorrectionLevel: style.logo ? 'Q' : 'M' },
          ...(style.logo ? {
            image: style.logo,
            imageOptions: {
              hideBackgroundDots: true,
              imageSize: style.logoSize,
              margin: style.logoMargin,
              crossOrigin: 'anonymous',
            },
          } : {}),
        });
        el.innerHTML = '';
        qrCode.current.append(el);
      } catch (e) {
        console.warn('QR render failed:', e);
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [firstEncoded, style]);

  // Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setStyle(s => ({ ...s, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const removeLogo = () => setStyle(s => ({ ...s, logo: '' }));

  // Copy handlers
  const copyToClipboard = useCallback(async (text: string, type: 'prompt' | 'example') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  // Mode switch — clear input when toggling
  const switchMode = (newMode: InputMode) => {
    if (newMode === mode) return;
    setInput('');
    setMode(newMode);
  };

  // File upload handler
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const ext = file.name.split('.').pop()?.toLowerCase();
      setMode(ext === 'json' ? 'json' : 'csv');
      setInput(text);
    };
    reader.readAsText(file);
  }, []);

  const onFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  }, [handleFileUpload]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  // Bulk download
  const downloadZip = useCallback(async () => {
    if (contacts.length === 0) return;
    setGenerating(true);
    setProgress({ current: 0, total: contacts.length });

    try {
      const zip = new JSZip();

      for (let i = 0; i < contacts.length; i++) {
        setProgress({ current: i + 1, total: contacts.length });
        const vcard = buildVCard(contacts[i]);
        const qr = createQRInstance(vcard, style);

        const blob = await qr.getRawData('png');
        if (blob) {
          const filename = getContactFilename(contacts[i], i);
          zip.file(`${filename}.png`, blob);
        }

        // Yield main thread every 10 contacts to allow GC and UI updates
        // Prevents canvas memory exhaustion on large batches
        if ((i + 1) % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vcard_qr_codes_${contacts.length}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('ZIP generation failed:', e);
      alert('Failed to generate ZIP. Check console for details.');
    } finally {
      setGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [contacts, style]);

  // Download single preview
  const downloadPreview = (format: 'png' | 'svg') => {
    if (!qrCode.current || contacts.length === 0) return;
    const filename = getContactFilename(contacts[0], 0);
    qrCode.current.download({ name: filename, extension: format });
  };

  const aiPrompt = mode === 'csv' ? CSV_AI_PROMPT : JSON_AI_PROMPT;
  const example = mode === 'csv' ? CSV_EXAMPLE : JSON_EXAMPLE;

  useEffect(() => setShowAllContacts(false), [contacts.length]);

  const visibleContacts = contacts.length > VISIBLE_CONTACTS && !showAllContacts
    ? contacts.slice(0, VISIBLE_CONTACTS)
    : contacts;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-7xl border-x border-border flex flex-col flex-1 min-h-0">
        {/* Header */}
        <header className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/vcard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                &larr; Back
              </Link>
              <div className="w-px h-4 bg-border" />
              <h1 className="text-sm font-semibold tracking-wide uppercase text-foreground">
                Bulk vCard QR Generator
              </h1>
            </div>
          </div>
        </header>

        {/* Main grid: input | preview+style */}
        <div className="grid flex-1 min-h-0 lg:grid-cols-[1fr_360px]">

          {/* ── Left: Input panel ── */}
          <div className="border-b border-border lg:border-b-0 lg:border-r border-border overflow-y-auto">
            {/* Section header */}
            <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="text-lg" aria-hidden="true">👥</span>
                <h2 className="text-sm font-semibold text-foreground">Bulk Generate</h2>
                {contacts.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                    {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Paste contact data to generate QR codes for all of them at once. Copy the AI prompt to have any AI generate the data for you.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Format toggle */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/50 w-fit">
                <button
                  onClick={() => switchMode('csv')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    mode === 'csv'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  CSV
                </button>
                <button
                  onClick={() => switchMode('json')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    mode === 'json'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  JSON
                </button>
              </div>

              {/* AI Prompt section */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">AI Prompt Template</h3>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  Copy this prompt and give it to any AI (ChatGPT, Claude, etc.) along with your list of people. It will generate the {mode === 'csv' ? 'CSV' : 'JSON'} data you can paste below.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(aiPrompt, 'prompt')}
                  >
                    {copied === 'prompt' ? 'Copied!' : 'Copy AI Prompt'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(example, 'example')}
                  >
                    {copied === 'example' ? 'Copied!' : 'Copy Example'}
                  </Button>
                </div>
                <details>
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    View prompt template
                  </summary>
                  <pre className="mt-3 max-h-64 overflow-auto rounded border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground break-all whitespace-pre-wrap">
                    {aiPrompt}
                  </pre>
                </details>
              </div>

              <div className="border-t border-dashed border-border" />

              {/* Data Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Contact Data ({mode === 'csv' ? 'CSV' : 'JSON'})
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs text-muted-foreground">
                      Upload File
                    </Button>
                    {input.trim() && (
                      <Button variant="ghost" size="sm" onClick={() => setInput('')} className="text-xs text-muted-foreground">
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={onFileInputChange}
                  className="sr-only"
                />
                <div
                  className={`relative rounded-md ${dragging ? 'ring-2 ring-primary' : ''}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={mode === 'csv'
                      ? `Paste CSV here or drag & drop a file...\n\n${CSV_EXAMPLE}`
                      : `Paste JSON here or drag & drop a file...\n\n${JSON_EXAMPLE}`
                    }
                    rows={16}
                    className="font-mono text-xs"
                  />
                  {dragging && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-primary/10 border-2 border-dashed border-primary pointer-events-none">
                      <span className="text-sm font-medium text-primary">Drop file here</span>
                    </div>
                  )}
                </div>
                {mode === 'csv' && !input.trim() && (
                  <div className="text-xs text-muted-foreground/60 space-y-1">
                    <p><span className="font-medium text-muted-foreground">Phone:</span> +1234567890 or CELL:+123|WORK:+456</p>
                    <p><span className="font-medium text-muted-foreground">Email:</span> john@acme.com or WORK:john@acme.com|HOME:john@gmail.com</p>
                    <p><span className="font-medium text-muted-foreground">Geo:</span> lat;lng for exact map pin (e.g. 25.2070564;55.2759353)</p>
                  </div>
                )}
              </div>

              {/* Validation feedback */}
              {(errors.length > 0 || contacts.length > 0) && (
                <div className="space-y-2">
                  {contacts.length > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {contacts.length} valid contact{contacts.length !== 1 ? 's' : ''} found
                    </p>
                  )}
                  {errors.map((err, i) => (
                    <p key={i} className="text-xs text-destructive">{err}</p>
                  ))}
                </div>
              )}

              {/* Contact list preview */}
              {contacts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contacts</h3>
                  <div className="space-y-1.5">
                    {visibleContacts.map((c, i) => {
                      const displayName = [c.prefix, c.firstName, c.lastName, c.suffix].filter(Boolean).join(' ');
                      const detail = [c.title, c.org].filter(Boolean).join(' at ');
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 rounded-md border px-3 py-2 text-xs ${i === 0 ? 'border-foreground/20 bg-accent' : 'border-border'}`}
                        >
                          <span className="text-muted-foreground font-mono w-5 text-right shrink-0">{i + 1}</span>
                          <div className="min-w-0">
                            <span className="font-medium text-foreground">{displayName || c.org}</span>
                            {detail && <span className="text-muted-foreground ml-2">{detail}</span>}
                          </div>
                          {i === 0 && (
                            <Badge variant="outline" className="text-[9px] ml-auto shrink-0">Preview</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {contacts.length > VISIBLE_CONTACTS && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllContacts(!showAllContacts)}
                      className="w-full text-xs text-muted-foreground"
                    >
                      {showAllContacts
                        ? 'Show less'
                        : `Show all ${contacts.length} contacts (${contacts.length - VISIBLE_CONTACTS} more)`
                      }
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Preview + Style + Download ── */}
          <div className="overflow-y-auto">
            {/* QR Preview */}
            <div className="border-b border-border px-6 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Preview {contacts.length > 0 && `(${contacts[0].firstName || contacts[0].org})`}
              </p>
            </div>
            <div className="border-b border-border p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="flex min-h-[280px] items-center justify-center">
                  {contacts.length === 0 ? (
                    <span className="px-4 text-center text-sm text-muted-foreground">
                      Paste contact data to preview
                    </span>
                  ) : (
                    <div ref={qrRef} />
                  )}
                </div>

                {contacts.length > 0 && (
                  <div className="flex w-full gap-2">
                    <Button className="flex-1" onClick={() => downloadPreview('png')}>
                      Download PNG
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => downloadPreview('svg')}>
                      Download SVG
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Bulk Download */}
            {contacts.length > 1 && (
              <div className="border-b border-border p-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={downloadZip}
                  disabled={generating}
                >
                  {generating
                    ? `Generating ${progress.current}/${progress.total}...`
                    : `Download All ${contacts.length} QR Codes (ZIP)`
                  }
                </Button>
                {generating && (
                  <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Style Options */}
            <div className="border-b border-border px-6 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Style</p>
            </div>

            {/* Colors */}
            <div className="border-b border-dashed border-border px-6 py-4 space-y-3">
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Foreground</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.dotColor}
                      onChange={e => setStyle(s => ({ ...s, dotColor: e.target.value }))}
                      className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    />
                    <span className="text-xs text-muted-foreground font-mono">{style.dotColor}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Background</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.bgColor}
                      onChange={e => setStyle(s => ({ ...s, bgColor: e.target.value }))}
                      className={`h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5 ${style.transparentBg ? 'opacity-40 pointer-events-none' : ''}`}
                    />
                    <span className="text-xs text-muted-foreground font-mono">{style.transparentBg ? 'transparent' : style.bgColor}</span>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={style.transparentBg}
                  onChange={e => setStyle(s => ({ ...s, transparentBg: e.target.checked }))}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-xs text-muted-foreground">Transparent background</span>
              </label>
            </div>

            {/* Dot Pattern */}
            <div className="border-b border-dashed border-border px-6 py-4 space-y-2">
              <Label className="text-xs text-muted-foreground">Dot Pattern</Label>
              <div className="flex flex-wrap gap-1.5">
                {dotTypes.map(dt => (
                  <Button
                    key={dt.value}
                    variant={style.dotType === dt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStyle(s => ({ ...s, dotType: dt.value }))}
                    className="text-xs"
                  >
                    {dt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Corner Square */}
            <div className="border-b border-dashed border-border px-6 py-4 space-y-2">
              <Label className="text-xs text-muted-foreground">Corner Square</Label>
              <div className="flex flex-wrap gap-1.5">
                {cornerSquareTypes.map(ct => (
                  <Button
                    key={ct.value}
                    variant={style.cornerSquareType === ct.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStyle(s => ({ ...s, cornerSquareType: ct.value }))}
                    className="text-xs"
                  >
                    {ct.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Corner Dot */}
            <div className="border-b border-dashed border-border px-6 py-4 space-y-2">
              <Label className="text-xs text-muted-foreground">Corner Dot</Label>
              <div className="flex flex-wrap gap-1.5">
                {cornerDotTypes.map(cd => (
                  <Button
                    key={cd.value}
                    variant={style.cornerDotType === cd.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStyle(s => ({ ...s, cornerDotType: cd.value }))}
                    className="text-xs"
                  >
                    {cd.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Background Rounding */}
            <div className="border-b border-dashed border-border px-6 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Frame Rounding</Label>
                <span className="text-xs text-muted-foreground font-mono">{Math.round(style.bgRound * 100)}%</span>
              </div>
              <Slider
                min={0}
                max={50}
                step={1}
                value={[Math.round(style.bgRound * 100)]}
                onValueChange={([v]) => setStyle(s => ({ ...s, bgRound: v / 100 }))}
              />
            </div>

            {/* Logo */}
            <div className="border-b border-border px-6 py-4 space-y-3">
              <Label className="text-xs text-muted-foreground">Center Logo</Label>
              {style.logo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={style.logo}
                      alt="Logo"
                      className="h-10 w-10 rounded border border-border object-contain"
                    />
                    <Button variant="destructive" size="sm" onClick={removeLogo}>
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Size</Label>
                        <span className="text-xs text-muted-foreground font-mono">{Math.round(style.logoSize * 100)}%</span>
                      </div>
                      <Slider
                        min={15}
                        max={50}
                        step={1}
                        value={[Math.round(style.logoSize * 100)]}
                        onValueChange={([v]) => setStyle(s => ({ ...s, logoSize: v / 100 }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Margin</Label>
                        <span className="text-xs text-muted-foreground font-mono">{style.logoMargin}px</span>
                      </div>
                      <Slider
                        min={0}
                        max={20}
                        step={1}
                        value={[style.logoMargin]}
                        onValueChange={([v]) => setStyle(s => ({ ...s, logoMargin: v }))}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="relative" asChild>
                  <label>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                    Upload Logo
                  </label>
                </Button>
              )}
            </div>

            {/* Raw vCard preview */}
            {firstEncoded && (
              <div className="px-6 py-4">
                <details>
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    View raw vCard (first contact)
                  </summary>
                  <pre className="mt-3 max-h-48 overflow-auto rounded border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground break-all whitespace-pre-wrap">
                    {firstEncoded}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-border px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              Made by
              <a href="https://github.com/Sokanon" target="_blank" rel="noopener noreferrer" className="group/so inline-flex items-center gap-1.5 text-foreground">
                <img src="https://avatars.githubusercontent.com/u/53493508?v=4" alt="So" className="h-4 w-4 rounded-full" />
                <span className="hand-underline">So</span>
              </a>
              from
              <a href="https://gamified.studio" target="_blank" rel="noopener noreferrer" className="group/gs inline-flex items-center gap-1.5 text-foreground">
                <img src="https://avatars.githubusercontent.com/u/164414310?v=4" alt="Gamified Studio" className="h-4 w-4 rounded-full" />
                <span className="hand-underline">Gamified.studio</span>
              </a>
            </span>
            <a href="https://railway.com?referralCode=_xv-mn" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 text-foreground">
              <img src="https://avatars.githubusercontent.com/u/66716858?s=200&v=4" alt="Railway" className="h-4 w-4 rounded-full" />
              <span className="hand-underline">Deployed on Railway</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
