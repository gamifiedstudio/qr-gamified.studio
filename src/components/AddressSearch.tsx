import { useState, useRef, useEffect, useCallback } from 'react';
import type { Address } from '../vcard';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
  const abortRef = useRef<AbortController>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`,
        { signal: controller.signal }
      );
      const data = await res.json();
      setResults(data.features || []);
      setOpen(true);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
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

  // Cleanup timer and inflight requests on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

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
    <div className="relative" ref={wrapperRef}>
      <Input
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search for an address or place..."
      />
      {loading && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
      {open && results.length > 0 && (
        <Card className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto py-1">
          <ul className="divide-y divide-border">
            {results.map((r, i) => (
              <li
                key={i}
                onClick={() => handleSelect(r)}
                className="cursor-pointer px-3 py-2 transition-colors hover:bg-muted/50"
              >
                <span className="block text-sm font-medium text-foreground">
                  {r.properties.name || r.properties.street || 'Unknown'}
                </span>
                <span className="block text-xs text-muted-foreground">{formatDetail(r)}</span>
              </li>
            ))}
          </ul>
        </Card>
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
