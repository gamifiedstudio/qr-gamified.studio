import { useState, useRef, useEffect, useCallback } from 'react';
import type { Address } from '../vcard';

interface Props {
  onSelect: (address: Partial<Address>) => void;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    housenumber?: string;
    street?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
    osm_value?: string;
    extent?: number[];
  };
}

/**
 * Address search using Photon (Komoot) — free, no API key, OpenStreetMap-backed.
 * Returns structured address components + lat/lng for GEO field.
 */
export default function AddressSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`
      );
      const data = await res.json();
      setResults(data.features || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = (feature: PhotonFeature) => {
    const p = feature.properties;
    const [lng, lat] = feature.geometry.coordinates;

    const street = [p.housenumber, p.street || p.name].filter(Boolean).join(' ');

    onSelect({
      street: street,
      street2: '',
      city: p.city || '',
      state: p.state || '',
      zip: p.postcode || '',
      country: p.country || '',
      geo: `${lat};${lng}`,
    });

    setQuery(formatLabel(feature));
    setOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="address-search" ref={wrapperRef}>
      <div className="address-search-input-wrap">
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for an address or place..."
          className="address-search-input"
        />
        {loading && <span className="address-search-spinner" />}
      </div>
      {open && results.length > 0 && (
        <ul className="address-search-results">
          {results.map((r, i) => (
            <li key={i} onClick={() => handleSelect(r)}>
              <span className="address-search-name">
                {r.properties.name || r.properties.street || 'Unknown'}
              </span>
              <span className="address-search-detail">{formatDetail(r)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatLabel(f: PhotonFeature): string {
  const p = f.properties;
  return [p.name || p.street, p.city, p.country].filter(Boolean).join(', ');
}

function formatDetail(f: PhotonFeature): string {
  const p = f.properties;
  return [p.street, p.city, p.state, p.postcode, p.country]
    .filter(Boolean)
    .join(', ');
}
