import { useState, useRef, useEffect, useMemo } from 'react';
import QRCodeStyling, { type DotType, type CornerSquareType, type CornerDotType } from 'qr-code-styling';
import {
  type QRType,
  type URLData, type TextData, type PhoneData, type SMSData,
  type EmailData, type WiFiData, type EventData, type MeCardData, type XProfileData,
  QR_TYPES, defaults, encode, hasData,
} from './qr-types';
import {
  type VCardData, type PhoneEntry, type EmailEntry, type Address,
  defaultVCard, createEmptyAddress,
} from './vcard';
import AddressSearch from './components/AddressSearch';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── QR Style ──

interface QRStyle {
  dotColor: string;
  bgColor: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  logo: string; // base64 data URL or empty
  logoSize: number; // 0.2 to 0.5
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

// ── App ──

export default function App() {
  const [activeType, setActiveType] = useState<QRType>('url');
  const [formData, setFormData] = useState<Record<string, unknown>>(
    Object.fromEntries(QR_TYPES.filter(t => t.id !== 'vcard').map(t => [t.id, { ...(defaults[t.id] as object) }]))
  );
  const [vcardData, setVcardData] = useState<VCardData>({ ...defaultVCard });
  const [style, setStyle] = useState<QRStyle>({ ...defaultStyle });
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const currentData = activeType === 'vcard' ? null : formData[activeType];
  const activeQRType = QR_TYPES.find(t => t.id === activeType)!;
  const encoded = useMemo(() => encode(activeType, currentData, vcardData), [activeType, currentData, vcardData]);
  const ready = useMemo(() => hasData(activeType, currentData, vcardData), [activeType, currentData, vcardData]);

  // Init QR
  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 280,
      height: 280,
      type: 'svg',
      data: '',
    });
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, []);

  // Update QR (debounced for style changes like color picker drag / slider)
  useEffect(() => {
    if (!qrCode.current) return;
    const timer = setTimeout(() => {
      if (ready && encoded) {
        qrCode.current!.update({
          data: encoded,
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
          } : { image: '' }),
        });
      } else {
        qrCode.current!.update({ data: ' ' });
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [encoded, ready, style]);

  // Logo file handler (5MB max)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setStyle(s => ({ ...s, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => setStyle(s => ({ ...s, logo: '' }));

  const updateForm = <T extends object>(type: QRType, updates: Partial<T>) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...(prev[type] as object), ...updates },
    }));
  };

  const downloadQR = (format: 'png' | 'svg') => {
    if (!qrCode.current || !ready) return;
    qrCode.current.download({ name: `qr_${activeType}`, extension: format });
  };

  // ── vCard helpers ──
  const updateVCard = (field: keyof VCardData, value: string) =>
    setVcardData(prev => ({ ...prev, [field]: value }));

  const updatePhone = (i: number, field: keyof PhoneEntry, value: string) =>
    setVcardData(prev => {
      const phones = [...prev.phones];
      phones[i] = { ...phones[i], [field]: value };
      return { ...prev, phones };
    });

  const updateEmail = (i: number, field: keyof EmailEntry, value: string) =>
    setVcardData(prev => {
      const emails = [...prev.emails];
      emails[i] = { ...emails[i], [field]: value };
      return { ...prev, emails };
    });

  const updateAddress = (i: number, field: keyof Address, value: string) =>
    setVcardData(prev => {
      const addresses = [...prev.addresses];
      addresses[i] = { ...addresses[i], [field]: value };
      return { ...prev, addresses };
    });

  const setAddressFields = (i: number, fields: Partial<Address>) =>
    setVcardData(prev => {
      const addresses = [...prev.addresses];
      addresses[i] = { ...addresses[i], ...fields };
      return { ...prev, addresses };
    });

  // ── Render ──

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">QR Code Generator</h1>
          <p className="mt-2 text-muted-foreground">Generate QR codes for URLs, contacts, Wi-Fi, events, and more</p>
        </header>

        {/* Type selector — horizontal scrolling pills */}
        <div className="mb-8 flex justify-center">
          <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-muted/50 p-1.5 scrollbar-none">
            {QR_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  activeType === t.id
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-foreground/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-base">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Form Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{activeQRType.label}</CardTitle>
                <Badge variant="secondary">{activeQRType.icon}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {activeType === 'url' && <URLForm data={formData.url as URLData} onChange={d => updateForm('url', d)} />}
              {activeType === 'text' && <TextForm data={formData.text as TextData} onChange={d => updateForm('text', d)} />}
              {activeType === 'phone' && <PhoneForm data={formData.phone as PhoneData} onChange={d => updateForm('phone', d)} />}
              {activeType === 'sms' && <SMSForm data={formData.sms as SMSData} onChange={d => updateForm('sms', d)} />}
              {activeType === 'email' && <EmailForm data={formData.email as EmailData} onChange={d => updateForm('email', d)} />}
              {activeType === 'wifi' && <WiFiForm data={formData.wifi as WiFiData} onChange={d => updateForm('wifi', d)} />}
              {activeType === 'event' && <EventForm data={formData.event as EventData} onChange={d => updateForm('event', d)} />}
              {activeType === 'mecard' && <MeCardForm data={formData.mecard as MeCardData} onChange={d => updateForm('mecard', d)} />}
              {activeType === 'x-profile' && <XProfileForm data={formData['x-profile'] as XProfileData} onChange={d => updateForm('x-profile', d)} />}
              {activeType === 'vcard' && (
                <VCardForm
                  data={vcardData}
                  updateField={updateVCard}
                  updatePhone={updatePhone}
                  updateEmail={updateEmail}
                  updateAddress={updateAddress}
                  setAddressFields={setAddressFields}
                  addPhone={() => setVcardData(p => ({ ...p, phones: [...p.phones, { type: 'CELL', value: '' }] }))}
                  removePhone={i => setVcardData(p => ({ ...p, phones: p.phones.filter((_, idx) => idx !== i) }))}
                  addEmail={() => setVcardData(p => ({ ...p, emails: [...p.emails, { type: 'WORK', value: '' }] }))}
                  removeEmail={i => setVcardData(p => ({ ...p, emails: p.emails.filter((_, idx) => idx !== i) }))}
                  addAddress={() => setVcardData(p => ({ ...p, addresses: [...p.addresses, createEmptyAddress()] }))}
                  removeAddress={i => setVcardData(p => ({ ...p, addresses: p.addresses.filter((_, idx) => idx !== i) }))}
                />
              )}
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
            {/* QR Preview */}
            <Card>
              <CardContent className="flex flex-col items-center gap-4">
                <div
                  ref={qrRef}
                  className="flex min-h-[280px] items-center justify-center rounded-lg"
                >
                  {!ready && (
                    <span className="px-4 text-center text-sm text-muted-foreground">
                      Fill in the form to generate a QR code
                    </span>
                  )}
                </div>

                {ready && (
                  <div className="flex w-full gap-2">
                    <Button className="flex-1" onClick={() => downloadQR('png')}>
                      Download PNG
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => downloadQR('svg')}>
                      Download SVG
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Style Options */}
            <Card>
              <CardHeader>
                <CardTitle>Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Colors */}
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1.5">
                    <Label>Foreground</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={style.dotColor}
                        onChange={e => setStyle(s => ({ ...s, dotColor: e.target.value }))}
                        className="h-8 w-10 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
                      />
                      <span className="text-xs text-muted-foreground">{style.dotColor}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label>Background</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={style.bgColor}
                        onChange={e => setStyle(s => ({ ...s, bgColor: e.target.value }))}
                        className="h-8 w-10 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
                      />
                      <span className="text-xs text-muted-foreground">{style.bgColor}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dot Pattern */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Dot Pattern</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {dotTypes.map(dt => (
                      <Button
                        key={dt.value}
                        variant={style.dotType === dt.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStyle(s => ({ ...s, dotType: dt.value }))}
                      >
                        {dt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Corner Square */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Corner Square</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {cornerSquareTypes.map(ct => (
                      <Button
                        key={ct.value}
                        variant={style.cornerSquareType === ct.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStyle(s => ({ ...s, cornerSquareType: ct.value }))}
                      >
                        {ct.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Corner Dot */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Corner Dot</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {cornerDotTypes.map(cd => (
                      <Button
                        key={cd.value}
                        variant={style.cornerDotType === cd.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStyle(s => ({ ...s, cornerDotType: cd.value }))}
                      >
                        {cd.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Logo */}
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Center Logo</Label>
                  {style.logo ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={style.logo}
                          alt="Logo"
                          className="h-10 w-10 rounded-md border border-border object-contain"
                        />
                        <Button variant="destructive" size="sm" onClick={removeLogo}>
                          Remove
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Size</Label>
                            <span className="text-xs text-muted-foreground">{Math.round(style.logoSize * 100)}%</span>
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
                            <span className="text-xs text-muted-foreground">{style.logoMargin}px</span>
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
              </CardContent>
            </Card>

            {/* Raw output */}
            {ready && encoded && (
              <Card>
                <CardContent>
                  <details>
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      View raw data
                    </summary>
                    <pre className="mt-3 max-h-48 overflow-auto rounded-md bg-muted/50 p-3 text-xs text-muted-foreground break-all whitespace-pre-wrap">
                      {encoded}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Simple type forms ──

function URLForm({ data, onChange }: { data: URLData; onChange: (d: Partial<URLData>) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="url-input">Website URL</Label>
      <Input id="url-input" value={data.url} onChange={e => onChange({ url: e.target.value })} placeholder="https://example.com" />
    </div>
  );
}

function TextForm({ data, onChange }: { data: TextData; onChange: (d: Partial<TextData>) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="text-input">Text Content</Label>
      <Textarea id="text-input" value={data.text} onChange={e => onChange({ text: e.target.value })} placeholder="Enter any text..." rows={6} />
    </div>
  );
}

function PhoneForm({ data, onChange }: { data: PhoneData; onChange: (d: Partial<PhoneData>) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone-input">Phone</Label>
      <Input id="phone-input" value={data.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="+971 52 478 9738" type="tel" />
    </div>
  );
}

function SMSForm({ data, onChange }: { data: SMSData; onChange: (d: Partial<SMSData>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sms-phone">Phone Number</Label>
        <Input id="sms-phone" value={data.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="+971 52 478 9738" type="tel" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sms-message">Message (optional)</Label>
        <Textarea id="sms-message" value={data.message} onChange={e => onChange({ message: e.target.value })} placeholder="Pre-filled message..." rows={3} />
      </div>
    </div>
  );
}

function EmailForm({ data, onChange }: { data: EmailData; onChange: (d: Partial<EmailData>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-to">To</Label>
        <Input id="email-to" value={data.to} onChange={e => onChange({ to: e.target.value })} placeholder="hello@example.com" type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-subject">Subject</Label>
        <Input id="email-subject" value={data.subject} onChange={e => onChange({ subject: e.target.value })} placeholder="Email subject..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-body">Body</Label>
        <Textarea id="email-body" value={data.body} onChange={e => onChange({ body: e.target.value })} placeholder="Email body..." rows={4} />
      </div>
    </div>
  );
}

function WiFiForm({ data, onChange }: { data: WiFiData; onChange: (d: Partial<WiFiData>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
        <Input id="wifi-ssid" value={data.ssid} onChange={e => onChange({ ssid: e.target.value })} placeholder="MyNetwork" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="wifi-pass">Password</Label>
          <Input
            id="wifi-pass"
            value={data.password}
            onChange={e => onChange({ password: e.target.value })}
            placeholder={data.encryption === 'nopass' ? 'No password' : 'Network password'}
            disabled={data.encryption === 'nopass'}
            type="password"
          />
        </div>
        <div className="space-y-2">
          <Label>Encryption</Label>
          <Select value={data.encryption} onValueChange={v => onChange({ encryption: v as WiFiData['encryption'] })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA">WPA/WPA2</SelectItem>
              <SelectItem value="WEP">WEP</SelectItem>
              <SelectItem value="nopass">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={data.hidden}
          onChange={e => onChange({ hidden: e.target.checked })}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <span className="text-foreground">Hidden network</span>
      </label>
    </div>
  );
}

function EventForm({ data, onChange }: { data: EventData; onChange: (d: Partial<EventData>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event-title">Event Title</Label>
        <Input id="event-title" value={data.title} onChange={e => onChange({ title: e.target.value })} placeholder="Team Meeting" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-location">Location</Label>
        <Input id="event-location" value={data.location} onChange={e => onChange({ location: e.target.value })} placeholder="Conference Room A" />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={data.allDay}
          onChange={e => onChange({ allDay: e.target.checked })}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <span className="text-foreground">All day event</span>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" value={data.startDate} onChange={e => onChange({ startDate: e.target.value })} />
        </div>
        {!data.allDay && (
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input type="time" value={data.startTime} onChange={e => onChange({ startTime: e.target.value })} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="date" value={data.endDate} onChange={e => onChange({ endDate: e.target.value })} />
        </div>
        {!data.allDay && (
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input type="time" value={data.endTime} onChange={e => onChange({ endTime: e.target.value })} />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-desc">Description</Label>
        <Textarea id="event-desc" value={data.description} onChange={e => onChange({ description: e.target.value })} placeholder="Event details..." rows={3} />
      </div>
    </div>
  );
}

function MeCardForm({ data, onChange }: { data: MeCardData; onChange: (d: Partial<MeCardData>) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mecard-first">First Name</Label>
          <Input id="mecard-first" value={data.firstName} onChange={e => onChange({ firstName: e.target.value })} placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mecard-last">Last Name</Label>
          <Input id="mecard-last" value={data.lastName} onChange={e => onChange({ lastName: e.target.value })} placeholder="Doe" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mecard-phone">Phone</Label>
          <Input id="mecard-phone" value={data.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="+1234567890" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mecard-email">Email</Label>
          <Input id="mecard-email" value={data.email} onChange={e => onChange({ email: e.target.value })} placeholder="john@example.com" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mecard-org">Organization</Label>
        <Input id="mecard-org" value={data.org} onChange={e => onChange({ org: e.target.value })} placeholder="Acme Corp" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mecard-url">Website</Label>
        <Input id="mecard-url" value={data.url} onChange={e => onChange({ url: e.target.value })} placeholder="https://example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mecard-addr">Address</Label>
        <Input id="mecard-addr" value={data.address} onChange={e => onChange({ address: e.target.value })} placeholder="123 Main St, City, Country" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mecard-note">Note</Label>
        <Input id="mecard-note" value={data.note} onChange={e => onChange({ note: e.target.value })} placeholder="Additional info" />
      </div>
    </div>
  );
}

function XProfileForm({ data, onChange }: { data: XProfileData; onChange: (d: Partial<XProfileData>) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="x-username">Username</Label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
        <Input
          id="x-username"
          value={data.username}
          onChange={e => onChange({ username: e.target.value })}
          placeholder="username"
          className="pl-7"
        />
      </div>
    </div>
  );
}

// ── vCard Form (full featured) ──

interface VCardFormProps {
  data: VCardData;
  updateField: (field: keyof VCardData, value: string) => void;
  updatePhone: (i: number, field: keyof PhoneEntry, value: string) => void;
  updateEmail: (i: number, field: keyof EmailEntry, value: string) => void;
  updateAddress: (i: number, field: keyof Address, value: string) => void;
  setAddressFields: (i: number, fields: Partial<Address>) => void;
  addPhone: () => void;
  removePhone: (i: number) => void;
  addEmail: () => void;
  removeEmail: (i: number) => void;
  addAddress: () => void;
  removeAddress: (i: number) => void;
}

function VCardForm({
  data, updateField, updatePhone, updateEmail, updateAddress, setAddressFields,
  addPhone, removePhone, addEmail, removeEmail, addAddress, removeAddress,
}: VCardFormProps) {
  return (
    <div className="space-y-6">
      {/* Name */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Name</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input value={data.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input value={data.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="Doe" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Prefix</Label>
            <Input value={data.prefix} onChange={e => updateField('prefix', e.target.value)} placeholder="Mr., Dr." />
          </div>
          <div className="space-y-2">
            <Label>Suffix</Label>
            <Input value={data.suffix} onChange={e => updateField('suffix', e.target.value)} placeholder="Jr., PhD" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Organization */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Organization</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company</Label>
            <Input value={data.org} onChange={e => updateField('org', e.target.value)} placeholder="Acme Corp" />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={data.title} onChange={e => updateField('title', e.target.value)} placeholder="Software Engineer" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Phones */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Phone</h3>
        {data.phones.map((phone, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select value={phone.type} onValueChange={v => updatePhone(i, 'type', v)}>
              <SelectTrigger className="w-28 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CELL">Mobile</SelectItem>
                <SelectItem value="WORK">Work</SelectItem>
                <SelectItem value="HOME">Home</SelectItem>
                <SelectItem value="FAX">Fax</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={phone.value}
              onChange={e => updatePhone(i, 'value', e.target.value)}
              placeholder="+1 234 567 8900"
              className="flex-1"
            />
            {data.phones.length > 1 && (
              <Button variant="ghost" size="icon-sm" onClick={() => removePhone(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                &times;
              </Button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addPhone} className="text-muted-foreground">
          + Add Phone
        </Button>
      </div>

      <Separator />

      {/* Emails */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Email</h3>
        {data.emails.map((email, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select value={email.type} onValueChange={v => updateEmail(i, 'type', v)}>
              <SelectTrigger className="w-28 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WORK">Work</SelectItem>
                <SelectItem value="HOME">Personal</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={email.value}
              onChange={e => updateEmail(i, 'value', e.target.value)}
              placeholder="john@example.com"
              type="email"
              className="flex-1"
            />
            {data.emails.length > 1 && (
              <Button variant="ghost" size="icon-sm" onClick={() => removeEmail(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                &times;
              </Button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addEmail} className="text-muted-foreground">
          + Add Email
        </Button>
      </div>

      <Separator />

      {/* Addresses */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Addresses</h3>
        {data.addresses.map((addr, i) => (
          <Card key={i} className="bg-muted/30">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Select value={addr.type} onValueChange={v => updateAddress(i, 'type', v)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORK">Work</SelectItem>
                    <SelectItem value="HOME">Home</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon-sm" onClick={() => removeAddress(i)} className="text-muted-foreground hover:text-destructive">
                  &times;
                </Button>
              </div>

              {/* Address search with autocomplete */}
              <div className="space-y-2">
                <Label>Search Address</Label>
                <AddressSearch onSelect={(fields) => setAddressFields(i, fields)} />
              </div>

              <div className="space-y-2">
                <Label>Street</Label>
                <Input value={addr.street} onChange={e => updateAddress(i, 'street', e.target.value)} placeholder="123 Main Street" />
              </div>
              <div className="space-y-2">
                <Label>Apt / Suite / Floor</Label>
                <Input value={addr.street2} onChange={e => updateAddress(i, 'street2', e.target.value)} placeholder="Suite 400, Floor 3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={addr.city} onChange={e => updateAddress(i, 'city', e.target.value)} placeholder="Dubai" />
                </div>
                <div className="space-y-2">
                  <Label>State / Region</Label>
                  <Input value={addr.state} onChange={e => updateAddress(i, 'state', e.target.value)} placeholder="Dubai" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>ZIP / Postal</Label>
                  <Input value={addr.zip} onChange={e => updateAddress(i, 'zip', e.target.value)} placeholder="00000" />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={addr.country} onChange={e => updateAddress(i, 'country', e.target.value)} placeholder="UAE" />
                </div>
                <div className="space-y-2">
                  <Label>PO Box</Label>
                  <Input value={addr.poBox} onChange={e => updateAddress(i, 'poBox', e.target.value)} placeholder="PO Box 1234" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>GPS Coordinates</Label>
                <Input
                  value={addr.geo || ''}
                  onChange={e => updateAddress(i, 'geo', e.target.value)}
                  placeholder="Auto-filled from search (lat;lng)"
                  readOnly
                  className="bg-muted/50 text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>
        ))}
        <Button variant="ghost" size="sm" onClick={addAddress} className="text-muted-foreground">
          + Add Address
        </Button>
      </div>

      <Separator />

      {/* Web & Notes */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Web & Notes</h3>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input value={data.url} onChange={e => updateField('url', e.target.value)} placeholder="https://example.com" />
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea value={data.note} onChange={e => updateField('note', e.target.value)} placeholder="Additional notes..." />
        </div>
      </div>
    </div>
  );
}
