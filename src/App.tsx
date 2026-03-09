import { useState, useRef, useEffect } from 'react';
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

// ── QR Style ──

interface QRStyle {
  dotColor: string;
  bgColor: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
}

const defaultStyle: QRStyle = {
  dotColor: '#000000',
  bgColor: '#ffffff',
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
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
  const encoded = encode(activeType, currentData, vcardData);
  const ready = hasData(activeType, currentData, vcardData);

  // Init QR
  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 280,
      height: 280,
      type: 'svg',
      data: '',
      dotsOptions: { color: style.dotColor, type: style.dotType },
      backgroundOptions: { color: style.bgColor },
      cornersSquareOptions: { type: style.cornerSquareType },
      cornersDotOptions: { type: style.cornerDotType },
      qrOptions: { errorCorrectionLevel: 'M' },
    });
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, []);

  // Update QR
  useEffect(() => {
    if (!qrCode.current) return;
    if (ready && encoded) {
      qrCode.current.update({
        data: encoded,
        dotsOptions: { color: style.dotColor, type: style.dotType },
        backgroundOptions: { color: style.bgColor },
        cornersSquareOptions: { type: style.cornerSquareType },
        cornersDotOptions: { type: style.cornerDotType },
      });
    } else {
      qrCode.current.update({ data: ' ' }); // blank but keeps SVG mounted
    }
  }, [encoded, ready, style]);

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
    <div className="app">
      <header className="app-header">
        <h1>QR Code Generator</h1>
        <p>Generate QR codes for URLs, contacts, Wi-Fi, events, and more</p>
      </header>

      {/* Type selector */}
      <div className="type-selector">
        {QR_TYPES.map(t => (
          <button
            key={t.id}
            className={`type-btn ${activeType === t.id ? 'active' : ''}`}
            onClick={() => setActiveType(t.id)}
          >
            <span className="type-icon">{t.icon}</span>
            <span className="type-label">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="layout">
        {/* Form */}
        <div className="form-panel">
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
        </div>

        {/* Preview */}
        <div className="preview-panel">
          <div className="qr-container" ref={qrRef}>
            {!ready && <span className="qr-placeholder">Fill in the form to generate a QR code</span>}
          </div>

          {ready && (
            <div className="download-actions">
              <button className="btn-download primary" onClick={() => downloadQR('png')}>PNG</button>
              <button className="btn-download" onClick={() => downloadQR('svg')}>SVG</button>
            </div>
          )}

          {/* Style options */}
          <div className="qr-options">
            <div className="qr-options-title">Style</div>
            <div className="color-options">
              <div className="color-option">
                <label>Foreground</label>
                <input type="color" value={style.dotColor} onChange={e => setStyle(s => ({ ...s, dotColor: e.target.value }))} />
              </div>
              <div className="color-option">
                <label>Background</label>
                <input type="color" value={style.bgColor} onChange={e => setStyle(s => ({ ...s, bgColor: e.target.value }))} />
              </div>
            </div>

            <div className="style-section-label">Dot Pattern</div>
            <div className="dot-style-options">
              {dotTypes.map(dt => (
                <button key={dt.value} className={`dot-style-btn ${style.dotType === dt.value ? 'active' : ''}`}
                  onClick={() => setStyle(s => ({ ...s, dotType: dt.value }))}>{dt.label}</button>
              ))}
            </div>

            <div className="style-section-label">Corner Square</div>
            <div className="dot-style-options">
              {cornerSquareTypes.map(ct => (
                <button key={ct.value} className={`dot-style-btn ${style.cornerSquareType === ct.value ? 'active' : ''}`}
                  onClick={() => setStyle(s => ({ ...s, cornerSquareType: ct.value }))}>{ct.label}</button>
              ))}
            </div>

            <div className="style-section-label">Corner Dot</div>
            <div className="dot-style-options">
              {cornerDotTypes.map(cd => (
                <button key={cd.value} className={`dot-style-btn ${style.cornerDotType === cd.value ? 'active' : ''}`}
                  onClick={() => setStyle(s => ({ ...s, cornerDotType: cd.value }))}>{cd.label}</button>
              ))}
            </div>
          </div>

          {/* Raw output */}
          {ready && encoded && (
            <div className="vcard-raw">
              <details>
                <summary>View raw data</summary>
                <pre>{encoded}</pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Simple type forms ──

function URLForm({ data, onChange }: { data: URLData; onChange: (d: Partial<URLData>) => void }) {
  return (
    <div className="form-section">
      <div className="form-section-title">URL</div>
      <div className="form-group">
        <label>Website URL</label>
        <input value={data.url} onChange={e => onChange({ url: e.target.value })} placeholder="https://example.com" />
      </div>
    </div>
  );
}

function TextForm({ data, onChange }: { data: TextData; onChange: (d: Partial<TextData>) => void }) {
  return (
    <div className="form-section">
      <div className="form-section-title">Plain Text</div>
      <div className="form-group">
        <label>Text Content</label>
        <textarea value={data.text} onChange={e => onChange({ text: e.target.value })} placeholder="Enter any text..." rows={6} />
      </div>
    </div>
  );
}

function PhoneForm({ data, onChange }: { data: PhoneData; onChange: (d: Partial<PhoneData>) => void }) {
  return (
    <div className="form-section">
      <div className="form-section-title">Phone Number</div>
      <div className="form-group">
        <label>Phone</label>
        <input value={data.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="+971 52 478 9738" type="tel" />
      </div>
    </div>
  );
}

function SMSForm({ data, onChange }: { data: SMSData; onChange: (d: Partial<SMSData>) => void }) {
  return (
    <div className="form-section">
      <div className="form-section-title">SMS</div>
      <div className="form-group">
        <label>Phone Number</label>
        <input value={data.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="+971 52 478 9738" type="tel" />
      </div>
      <div className="form-group">
        <label>Message (optional)</label>
        <textarea value={data.message} onChange={e => onChange({ message: e.target.value })} placeholder="Pre-filled message..." rows={3} />
      </div>
    </div>
  );
}

function EmailForm({ data, onChange }: { data: EmailData; onChange: (d: Partial<EmailData>) => void }) {
  return (
    <div className="form-section">
      <div className="form-section-title">Email</div>
      <div className="form-group">
        <label>To</label>
        <input value={data.to} onChange={e => onChange({ to: e.target.value })} placeholder="hello@example.com" type="email" />
      </div>
      <div className="form-group">
        <label>Subject</label>
        <input value={data.subject} onChange={e => onChange({ subject: e.target.value })} placeholder="Email subject..." />
      </div>
      <div className="form-group">
        <label>Body</label>
        <textarea value={data.body} onChange={e => onChange({ body: e.target.value })} placeholder="Email body..." rows={4} />
      </div>
    </div>
  );
}

function WiFiForm({ data, onChange }: { data: WiFiData; onChange: (d: Partial<WiFiData>) => void }) {
  return (
    <div className="form-section">
      <div className="form-section-title">Wi-Fi Network</div>
      <div className="form-group">
        <label>Network Name (SSID)</label>
        <input value={data.ssid} onChange={e => onChange({ ssid: e.target.value })} placeholder="MyNetwork" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Password</label>
          <input value={data.password} onChange={e => onChange({ password: e.target.value })}
            placeholder={data.encryption === 'nopass' ? 'No password' : 'Network password'}
            disabled={data.encryption === 'nopass'} type="password" />
        </div>
        <div className="form-group">
          <label>Encryption</label>
          <select value={data.encryption} onChange={e => onChange({ encryption: e.target.value as WiFiData['encryption'] })}>
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None</option>
          </select>
        </div>
      </div>
      <label className="checkbox-label">
        <input type="checkbox" checked={data.hidden} onChange={e => onChange({ hidden: e.target.checked })} />
        Hidden network
      </label>
    </div>
  );
}

function EventForm({ data, onChange }: { data: EventData; onChange: (d: Partial<EventData>) => void }) {
  return (
    <div className="form-section">
      <div className="form-section-title">Calendar Event</div>
      <div className="form-group">
        <label>Event Title</label>
        <input value={data.title} onChange={e => onChange({ title: e.target.value })} placeholder="Team Meeting" />
      </div>
      <div className="form-group">
        <label>Location</label>
        <input value={data.location} onChange={e => onChange({ location: e.target.value })} placeholder="Conference Room A" />
      </div>
      <label className="checkbox-label" style={{ marginBottom: '0.75rem' }}>
        <input type="checkbox" checked={data.allDay} onChange={e => onChange({ allDay: e.target.checked })} />
        All day event
      </label>
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" value={data.startDate} onChange={e => onChange({ startDate: e.target.value })} />
        </div>
        {!data.allDay && (
          <div className="form-group">
            <label>Start Time</label>
            <input type="time" value={data.startTime} onChange={e => onChange({ startTime: e.target.value })} />
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>End Date</label>
          <input type="date" value={data.endDate} onChange={e => onChange({ endDate: e.target.value })} />
        </div>
        {!data.allDay && (
          <div className="form-group">
            <label>End Time</label>
            <input type="time" value={data.endTime} onChange={e => onChange({ endTime: e.target.value })} />
          </div>
        )}
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={data.description} onChange={e => onChange({ description: e.target.value })} placeholder="Event details..." rows={3} />
      </div>
    </div>
  );
}

function MeCardForm({ data, onChange }: { data: MeCardData; onChange: (d: Partial<MeCardData>) => void }) {
  return (
    <div className="form-section">
      <div className="form-section-title">MeCard (Compact Contact)</div>
      <div className="form-row">
        <div className="form-group">
          <label>First Name</label>
          <input value={data.firstName} onChange={e => onChange({ firstName: e.target.value })} placeholder="John" />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input value={data.lastName} onChange={e => onChange({ lastName: e.target.value })} placeholder="Doe" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Phone</label>
          <input value={data.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="+1234567890" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input value={data.email} onChange={e => onChange({ email: e.target.value })} placeholder="john@example.com" />
        </div>
      </div>
      <div className="form-group">
        <label>Organization</label>
        <input value={data.org} onChange={e => onChange({ org: e.target.value })} placeholder="Acme Corp" />
      </div>
      <div className="form-group">
        <label>Website</label>
        <input value={data.url} onChange={e => onChange({ url: e.target.value })} placeholder="https://example.com" />
      </div>
      <div className="form-group">
        <label>Address</label>
        <input value={data.address} onChange={e => onChange({ address: e.target.value })} placeholder="123 Main St, City, Country" />
      </div>
      <div className="form-group">
        <label>Note</label>
        <input value={data.note} onChange={e => onChange({ note: e.target.value })} placeholder="Additional info" />
      </div>
    </div>
  );
}

function XProfileForm({ data, onChange }: { data: XProfileData; onChange: (d: Partial<XProfileData>) => void }) {
  return (
    <div className="form-section">
      <div className="form-section-title">X / Twitter Profile</div>
      <div className="form-group">
        <label>Username</label>
        <div className="input-prefix-wrap">
          <span className="input-prefix">@</span>
          <input value={data.username} onChange={e => onChange({ username: e.target.value })} placeholder="username" className="input-with-prefix" />
        </div>
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
    <>
      {/* Name */}
      <div className="form-section">
        <div className="form-section-title">Name</div>
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input value={data.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="John" />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input value={data.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="Doe" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Prefix</label>
            <input value={data.prefix} onChange={e => updateField('prefix', e.target.value)} placeholder="Mr., Dr." />
          </div>
          <div className="form-group">
            <label>Suffix</label>
            <input value={data.suffix} onChange={e => updateField('suffix', e.target.value)} placeholder="Jr., PhD" />
          </div>
        </div>
      </div>

      {/* Organization */}
      <div className="form-section">
        <div className="form-section-title">Organization</div>
        <div className="form-row">
          <div className="form-group">
            <label>Company</label>
            <input value={data.org} onChange={e => updateField('org', e.target.value)} placeholder="Acme Corp" />
          </div>
          <div className="form-group">
            <label>Title</label>
            <input value={data.title} onChange={e => updateField('title', e.target.value)} placeholder="Software Engineer" />
          </div>
        </div>
      </div>

      {/* Phones */}
      <div className="form-section">
        <div className="form-section-title">Phone</div>
        {data.phones.map((phone, i) => (
          <div key={i} className="multi-entry">
            <select value={phone.type} onChange={e => updatePhone(i, 'type', e.target.value)}>
              <option value="CELL">Mobile</option>
              <option value="WORK">Work</option>
              <option value="HOME">Home</option>
              <option value="FAX">Fax</option>
            </select>
            <input value={phone.value} onChange={e => updatePhone(i, 'value', e.target.value)} placeholder="+1 234 567 8900" />
            {data.phones.length > 1 && <button className="btn-remove" onClick={() => removePhone(i)}>x</button>}
          </div>
        ))}
        <button className="btn-add" onClick={addPhone}>+ Add Phone</button>
      </div>

      {/* Emails */}
      <div className="form-section">
        <div className="form-section-title">Email</div>
        {data.emails.map((email, i) => (
          <div key={i} className="multi-entry">
            <select value={email.type} onChange={e => updateEmail(i, 'type', e.target.value)}>
              <option value="WORK">Work</option>
              <option value="HOME">Personal</option>
            </select>
            <input value={email.value} onChange={e => updateEmail(i, 'value', e.target.value)} placeholder="john@example.com" type="email" />
            {data.emails.length > 1 && <button className="btn-remove" onClick={() => removeEmail(i)}>x</button>}
          </div>
        ))}
        <button className="btn-add" onClick={addEmail}>+ Add Email</button>
      </div>

      {/* Addresses */}
      <div className="form-section">
        <div className="form-section-title">Addresses</div>
        {data.addresses.map((addr, i) => (
          <div key={i} className="address-entry">
            <div className="address-header">
              <select className="address-type-select" value={addr.type} onChange={e => updateAddress(i, 'type', e.target.value)}>
                <option value="WORK">Work</option>
                <option value="HOME">Home</option>
              </select>
              <button className="btn-remove" onClick={() => removeAddress(i)}>x</button>
            </div>

            {/* Address search with autocomplete */}
            <div className="form-group">
              <label>Search Address</label>
              <AddressSearch onSelect={(fields) => setAddressFields(i, fields)} />
            </div>

            <div className="form-group">
              <label>Street</label>
              <input value={addr.street} onChange={e => updateAddress(i, 'street', e.target.value)} placeholder="123 Main Street" />
            </div>
            <div className="form-group">
              <label>Apt / Suite / Floor</label>
              <input value={addr.street2} onChange={e => updateAddress(i, 'street2', e.target.value)} placeholder="Suite 400, Floor 3" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input value={addr.city} onChange={e => updateAddress(i, 'city', e.target.value)} placeholder="Dubai" />
              </div>
              <div className="form-group">
                <label>State / Region</label>
                <input value={addr.state} onChange={e => updateAddress(i, 'state', e.target.value)} placeholder="Dubai" />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label>ZIP / Postal</label>
                <input value={addr.zip} onChange={e => updateAddress(i, 'zip', e.target.value)} placeholder="00000" />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input value={addr.country} onChange={e => updateAddress(i, 'country', e.target.value)} placeholder="UAE" />
              </div>
              <div className="form-group">
                <label>PO Box</label>
                <input value={addr.poBox} onChange={e => updateAddress(i, 'poBox', e.target.value)} placeholder="PO Box 1234" />
              </div>
            </div>
            <div className="form-group">
              <label>GPS Coordinates</label>
              <input value={addr.geo || ''} onChange={e => updateAddress(i, 'geo', e.target.value)}
                placeholder="Auto-filled from search (lat;lng)" readOnly className="input-readonly" />
            </div>
          </div>
        ))}
        <button className="btn-add" onClick={addAddress}>+ Add Address</button>
      </div>

      {/* Web & Notes */}
      <div className="form-section">
        <div className="form-section-title">Web & Notes</div>
        <div className="form-group">
          <label>Website</label>
          <input value={data.url} onChange={e => updateField('url', e.target.value)} placeholder="https://example.com" />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea value={data.note} onChange={e => updateField('note', e.target.value)} placeholder="Additional notes..." />
        </div>
      </div>
    </>
  );
}
