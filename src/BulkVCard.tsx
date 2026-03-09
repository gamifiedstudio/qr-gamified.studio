import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import QRCodeStyling, { type DotType, type CornerSquareType, type CornerDotType } from 'qr-code-styling';
import JSZip from 'jszip';
import { type VCardData, type PhoneEntry, type EmailEntry, type Address, buildVCard, hasMinimumData } from './vcard';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

// ── QR Style (same as App.tsx) ──

interface QRStyle {
  dotColor: string;
  bgColor: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  logo: string;
  logoSize: number;
  logoMargin: number;
}

const defaultStyle: QRStyle = {
  dotColor: '#000000',
  bgColor: '#ffffff',
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
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

// ── AI Prompt template ──

const SCHEMA_TEMPLATE = `[
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
    "addresses": [],
    "url": "https://acme.com",
    "note": ""
  }
]`;

const AI_PROMPT = `Generate a JSON array of vCard contacts using this exact structure. Each contact must follow this schema:

\`\`\`json
${SCHEMA_TEMPLATE}
\`\`\`

Field reference:
- firstName, lastName: Required (at least one)
- prefix: Mr., Mrs., Dr., etc. (optional)
- suffix: Jr., PhD, etc. (optional)
- org: Company/organization name
- title: Job title
- phones: Array of { type: "CELL"|"WORK"|"HOME"|"FAX", value: "phone number" }
- emails: Array of { type: "WORK"|"HOME", value: "email address" }
- addresses: Array of { type: "WORK"|"HOME", street: "", street2: "", city: "", state: "", zip: "", country: "", poBox: "" }
- url: Website URL
- note: Additional notes

Output ONLY the JSON array, no markdown, no explanation. I need contacts for the following people:

[LIST YOUR PEOPLE HERE]`;

// ── Helpers ──

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function getContactFilename(contact: VCardData, index: number): string {
  const parts = [contact.firstName, contact.lastName].filter(Boolean);
  if (parts.length > 0) {
    return sanitizeFilename(parts.join('_'));
  }
  if (contact.org) {
    return sanitizeFilename(contact.org);
  }
  return `contact_${index + 1}`;
}

function parseContacts(json: string): { contacts: VCardData[]; errors: string[] } {
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

  return { contacts, errors };
}

function createQRInstance(data: string, style: QRStyle): QRCodeStyling {
  return new QRCodeStyling({
    width: 1024,
    height: 1024,
    type: 'canvas',
    data,
    dotsOptions: { color: style.dotColor, type: style.dotType },
    backgroundOptions: { color: style.bgColor },
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
  const [jsonInput, setJsonInput] = useState('');
  const [style, setStyle] = useState<QRStyle>({ ...defaultStyle });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [copied, setCopied] = useState<'prompt' | 'schema' | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const { contacts, errors } = useMemo(() => parseContacts(jsonInput), [jsonInput]);

  // Preview first contact
  const firstEncoded = useMemo(() => {
    if (contacts.length === 0) return '';
    return buildVCard(contacts[0]);
  }, [contacts]);

  useEffect(() => {
    if (!qrRef.current) return;
    const timer = setTimeout(() => {
      try {
        if (!firstEncoded) {
          qrRef.current!.innerHTML = '';
          qrCode.current = null;
          return;
        }
        qrCode.current = new QRCodeStyling({
          width: 280,
          height: 280,
          type: 'svg',
          data: firstEncoded,
          dotsOptions: { color: style.dotColor, type: style.dotType },
          backgroundOptions: { color: style.bgColor },
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
        qrRef.current!.innerHTML = '';
        qrCode.current.append(qrRef.current!);
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
  const copyToClipboard = useCallback(async (text: string, type: 'prompt' | 'schema') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

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

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-7xl border-x border-border flex flex-col flex-1 min-h-0">
        {/* Header */}
        <header className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/vcard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
                Paste a JSON array of contacts to generate QR codes for all of them at once. Use the prompt template to have AI generate the data for you.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* AI Prompt section */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">AI Prompt Template</h3>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  Copy this prompt and give it to any AI (ChatGPT, Claude, etc.) along with your list of people. It will generate the JSON data you can paste below.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(AI_PROMPT, 'prompt')}
                  >
                    {copied === 'prompt' ? 'Copied!' : 'Copy AI Prompt'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(SCHEMA_TEMPLATE, 'schema')}
                  >
                    {copied === 'schema' ? 'Copied!' : 'Copy Schema Only'}
                  </Button>
                </div>
                <details>
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    View prompt template
                  </summary>
                  <pre className="mt-3 max-h-64 overflow-auto rounded border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground break-all whitespace-pre-wrap">
                    {AI_PROMPT}
                  </pre>
                </details>
              </div>

              <div className="border-t border-dashed border-border" />

              {/* JSON Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact Data (JSON)</h3>
                  {jsonInput.trim() && (
                    <Button variant="ghost" size="sm" onClick={() => setJsonInput('')} className="text-xs text-muted-foreground">
                      Clear
                    </Button>
                  )}
                </div>
                <Textarea
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  placeholder={`Paste your JSON array here...\n\n${SCHEMA_TEMPLATE}`}
                  rows={16}
                  className="font-mono text-xs"
                />
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
                    {contacts.map((c, i) => {
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
                <div
                  ref={qrRef}
                  className="flex min-h-[280px] items-center justify-center"
                >
                  {contacts.length === 0 && (
                    <span className="px-4 text-center text-sm text-muted-foreground">
                      Paste contact JSON to preview
                    </span>
                  )}
                </div>

                {contacts.length > 0 && (
                  <>
                    <div className="flex w-full gap-2">
                      <Button className="flex-1" onClick={() => downloadPreview('png')}>
                        Download PNG
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => downloadPreview('svg')}>
                        Download SVG
                      </Button>
                    </div>
                  </>
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
            <div className="border-b border-dashed border-border px-6 py-4">
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
                      className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    />
                    <span className="text-xs text-muted-foreground font-mono">{style.bgColor}</span>
                  </div>
                </div>
              </div>
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
