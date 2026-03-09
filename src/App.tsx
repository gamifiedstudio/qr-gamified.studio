import { useState, useRef, useEffect, useCallback } from 'react';
import QRCodeStyling, {
  type DotType,
} from 'qr-code-styling';
import {
  type VCardData,
  type PhoneEntry,
  type EmailEntry,
  type Address,
  defaultVCard,
  createEmptyAddress,
  buildVCard,
  hasMinimumData,
} from './vcard';

type QRStyle = {
  dotColor: string;
  bgColor: string;
  dotType: DotType;
};

const defaultStyle: QRStyle = {
  dotColor: '#000000',
  bgColor: '#ffffff',
  dotType: 'rounded',
};

const dotTypes: { label: string; value: DotType }[] = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Dots', value: 'dots' },
  { label: 'Square', value: 'square' },
  { label: 'Classy', value: 'classy' },
  { label: 'Classy Rounded', value: 'classy-rounded' },
  { label: 'Extra Rounded', value: 'extra-rounded' },
];

export default function App() {
  const [data, setData] = useState<VCardData>({ ...defaultVCard });
  const [style, setStyle] = useState<QRStyle>({ ...defaultStyle });
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const vcard = hasMinimumData(data) ? buildVCard(data) : '';

  // Initialize QR code instance
  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 280,
      height: 280,
      type: 'svg',
      data: '',
      dotsOptions: {
        color: style.dotColor,
        type: style.dotType,
      },
      backgroundOptions: {
        color: style.bgColor,
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        type: 'dot',
      },
      qrOptions: {
        errorCorrectionLevel: 'M',
      },
    });
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, []);

  // Update QR code when data or style changes
  useEffect(() => {
    if (qrCode.current && vcard) {
      qrCode.current.update({
        data: vcard,
        dotsOptions: {
          color: style.dotColor,
          type: style.dotType,
        },
        backgroundOptions: {
          color: style.bgColor,
        },
      });
    }
  }, [vcard, style]);

  const updateField = useCallback(
    (field: keyof VCardData, value: string) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Phone helpers
  const updatePhone = (index: number, field: keyof PhoneEntry, value: string) => {
    setData((prev) => {
      const phones = [...prev.phones];
      phones[index] = { ...phones[index], [field]: value };
      return { ...prev, phones };
    });
  };
  const addPhone = () =>
    setData((prev) => ({
      ...prev,
      phones: [...prev.phones, { type: 'CELL', value: '' }],
    }));
  const removePhone = (i: number) =>
    setData((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, idx) => idx !== i),
    }));

  // Email helpers
  const updateEmail = (index: number, field: keyof EmailEntry, value: string) => {
    setData((prev) => {
      const emails = [...prev.emails];
      emails[index] = { ...emails[index], [field]: value };
      return { ...prev, emails };
    });
  };
  const addEmail = () =>
    setData((prev) => ({
      ...prev,
      emails: [...prev.emails, { type: 'WORK', value: '' }],
    }));
  const removeEmail = (i: number) =>
    setData((prev) => ({
      ...prev,
      emails: prev.emails.filter((_, idx) => idx !== i),
    }));

  // Address helpers
  const updateAddress = (index: number, field: keyof Address, value: string) => {
    setData((prev) => {
      const addresses = [...prev.addresses];
      addresses[index] = { ...addresses[index], [field]: value };
      return { ...prev, addresses };
    });
  };
  const addAddress = () =>
    setData((prev) => ({
      ...prev,
      addresses: [...prev.addresses, createEmptyAddress()],
    }));
  const removeAddress = (i: number) =>
    setData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, idx) => idx !== i),
    }));

  const downloadQR = async (format: 'png' | 'svg') => {
    if (!qrCode.current) return;
    const filename = [data.firstName, data.lastName].filter(Boolean).join('_') || 'vcard';
    qrCode.current.download({
      name: `${filename}_qr`,
      extension: format,
    });
  };

  const fullName = [data.prefix, data.firstName, data.lastName, data.suffix]
    .filter(Boolean)
    .join(' ');
  const titleOrg = [data.title, data.org].filter(Boolean).join(' at ');

  return (
    <div className="app">
      <header className="app-header">
        <h1>vCard QR Generator</h1>
        <p>Generate QR codes for contact cards with proper address handling</p>
      </header>

      <div className="layout">
        {/* Form Panel */}
        <div className="form-panel">
          {/* Name Section */}
          <div className="form-section">
            <div className="form-section-title">Name</div>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  value={data.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  value={data.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Prefix</label>
                <input
                  value={data.prefix}
                  onChange={(e) => updateField('prefix', e.target.value)}
                  placeholder="Mr., Dr., etc."
                />
              </div>
              <div className="form-group">
                <label>Suffix</label>
                <input
                  value={data.suffix}
                  onChange={(e) => updateField('suffix', e.target.value)}
                  placeholder="Jr., PhD, etc."
                />
              </div>
            </div>
          </div>

          {/* Organization Section */}
          <div className="form-section">
            <div className="form-section-title">Organization</div>
            <div className="form-row">
              <div className="form-group">
                <label>Company</label>
                <input
                  value={data.org}
                  onChange={(e) => updateField('org', e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  value={data.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          </div>

          {/* Phone Section */}
          <div className="form-section">
            <div className="form-section-title">Phone</div>
            {data.phones.map((phone, i) => (
              <div key={i} className="multi-entry">
                <select
                  value={phone.type}
                  onChange={(e) => updatePhone(i, 'type', e.target.value)}
                >
                  <option value="CELL">Mobile</option>
                  <option value="WORK">Work</option>
                  <option value="HOME">Home</option>
                  <option value="FAX">Fax</option>
                </select>
                <input
                  value={phone.value}
                  onChange={(e) => updatePhone(i, 'value', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
                {data.phones.length > 1 && (
                  <button className="btn-remove" onClick={() => removePhone(i)}>
                    x
                  </button>
                )}
              </div>
            ))}
            <button className="btn-add" onClick={addPhone}>
              + Add Phone
            </button>
          </div>

          {/* Email Section */}
          <div className="form-section">
            <div className="form-section-title">Email</div>
            {data.emails.map((email, i) => (
              <div key={i} className="multi-entry">
                <select
                  value={email.type}
                  onChange={(e) => updateEmail(i, 'type', e.target.value)}
                >
                  <option value="WORK">Work</option>
                  <option value="HOME">Personal</option>
                </select>
                <input
                  value={email.value}
                  onChange={(e) => updateEmail(i, 'value', e.target.value)}
                  placeholder="john@example.com"
                  type="email"
                />
                {data.emails.length > 1 && (
                  <button className="btn-remove" onClick={() => removeEmail(i)}>
                    x
                  </button>
                )}
              </div>
            ))}
            <button className="btn-add" onClick={addEmail}>
              + Add Email
            </button>
          </div>

          {/* Address Section */}
          <div className="form-section">
            <div className="form-section-title">Addresses</div>
            {data.addresses.map((addr, i) => (
              <div key={i} className="address-entry">
                <div className="address-header">
                  <select
                    className="address-type-select"
                    value={addr.type}
                    onChange={(e) => updateAddress(i, 'type', e.target.value)}
                  >
                    <option value="WORK">Work</option>
                    <option value="HOME">Home</option>
                  </select>
                  <button className="btn-remove" onClick={() => removeAddress(i)}>
                    x
                  </button>
                </div>
                <div className="form-group">
                  <label>Street</label>
                  <input
                    value={addr.street}
                    onChange={(e) => updateAddress(i, 'street', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="form-group">
                  <label>Apt / Suite / Floor</label>
                  <input
                    value={addr.street2}
                    onChange={(e) => updateAddress(i, 'street2', e.target.value)}
                    placeholder="Suite 400, Floor 3, etc."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      value={addr.city}
                      onChange={(e) => updateAddress(i, 'city', e.target.value)}
                      placeholder="Dubai"
                    />
                  </div>
                  <div className="form-group">
                    <label>State / Region</label>
                    <input
                      value={addr.state}
                      onChange={(e) => updateAddress(i, 'state', e.target.value)}
                      placeholder="Dubai"
                    />
                  </div>
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label>ZIP / Postal</label>
                    <input
                      value={addr.zip}
                      onChange={(e) => updateAddress(i, 'zip', e.target.value)}
                      placeholder="00000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      value={addr.country}
                      onChange={(e) => updateAddress(i, 'country', e.target.value)}
                      placeholder="UAE"
                    />
                  </div>
                  <div className="form-group">
                    <label>PO Box</label>
                    <input
                      value={addr.poBox}
                      onChange={(e) => updateAddress(i, 'poBox', e.target.value)}
                      placeholder="PO Box 1234"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-add" onClick={addAddress}>
              + Add Address
            </button>
          </div>

          {/* Web & Notes */}
          <div className="form-section">
            <div className="form-section-title">Web & Notes</div>
            <div className="form-group">
              <label>Website</label>
              <input
                value={data.url}
                onChange={(e) => updateField('url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={data.note}
                onChange={(e) => updateField('note', e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="preview-panel">
          <div className="qr-container" ref={qrRef}>
            {!vcard && <span className="qr-placeholder">Enter a name to generate QR</span>}
          </div>

          {hasMinimumData(data) && (
            <>
              <div className="contact-preview">
                {fullName && <div className="name">{fullName}</div>}
                {titleOrg && <div className="title-org">{titleOrg}</div>}
                {data.phones.map(
                  (p, i) =>
                    p.value && (
                      <div key={i} className="detail">
                        {p.type}: {p.value}
                      </div>
                    ),
                )}
                {data.emails.map(
                  (e, i) =>
                    e.value && (
                      <div key={i} className="detail">
                        {e.value}
                      </div>
                    ),
                )}
                {data.addresses.map((a, i) => {
                  const parts = [
                    a.street,
                    a.street2,
                    [a.city, a.state, a.zip].filter(Boolean).join(', '),
                    a.country,
                  ].filter(Boolean);
                  return parts.length > 0 ? (
                    <div key={i} className="detail" style={{ marginTop: '0.25rem' }}>
                      {a.type}: {parts.join(', ')}
                    </div>
                  ) : null;
                })}
                {data.url && <div className="detail">{data.url}</div>}
              </div>

              <div className="download-actions">
                <button className="btn-download primary" onClick={() => downloadQR('png')}>
                  Download PNG
                </button>
                <button className="btn-download" onClick={() => downloadQR('svg')}>
                  Download SVG
                </button>
              </div>
            </>
          )}

          {/* QR Style Options */}
          <div className="qr-options">
            <div className="qr-options-title">QR Style</div>
            <div className="color-options">
              <div className="color-option">
                <label>Dots</label>
                <input
                  type="color"
                  value={style.dotColor}
                  onChange={(e) => setStyle((s) => ({ ...s, dotColor: e.target.value }))}
                />
              </div>
              <div className="color-option">
                <label>Background</label>
                <input
                  type="color"
                  value={style.bgColor}
                  onChange={(e) => setStyle((s) => ({ ...s, bgColor: e.target.value }))}
                />
              </div>
            </div>
            <div className="dot-style-options">
              {dotTypes.map((dt) => (
                <button
                  key={dt.value}
                  className={`dot-style-btn ${style.dotType === dt.value ? 'active' : ''}`}
                  onClick={() => setStyle((s) => ({ ...s, dotType: dt.value }))}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Raw vCard */}
          {vcard && (
            <div className="vcard-raw">
              <details>
                <summary>View raw vCard</summary>
                <pre>{vcard}</pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
