'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Check, Loader2, X } from 'lucide-react';
import { parseCoordinates, isShortMapLink, resolveShortLink, toVCardGeo } from '@/lib/geo';

interface Props {
  value: string; // current geo value ("lat;lng" or "")
  onChange: (geo: string) => void;
}

type Status = 'idle' | 'resolving' | 'pinned' | 'error';

export default function LocationPin({ value, onChange }: Props) {
  // Local input state only used while user is actively typing/editing
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');

  const isPinned = !!value && !editing && !resolving;
  const displayCoords = value ? value.replace(';', ', ') : '';
  const inputValue = editing ? draft : (value ? value.replace(';', ', ') : '');

  const status: Status = resolving ? 'resolving' : error ? 'error' : isPinned ? 'pinned' : 'idle';

  const handlePin = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setError('');

    // If it's a short link, resolve it first
    if (isShortMapLink(trimmed)) {
      setResolving(true);
      try {
        const resolved = await resolveShortLink(trimmed);
        const coords = parseCoordinates(resolved);
        if (coords) {
          onChange(toVCardGeo(coords.lat, coords.lng));
          setEditing(false);
        } else {
          setError('Could not extract coordinates from the resolved URL');
        }
      } catch {
        setError('Failed to resolve short link');
      }
      setResolving(false);
      return;
    }

    // Try direct parse (full Google Maps URL or raw coords)
    const coords = parseCoordinates(trimmed);
    if (coords) {
      onChange(toVCardGeo(coords.lat, coords.lng));
      setEditing(false);
    } else {
      setError('Could not parse coordinates. Try a Google Maps link or lat, lng');
    }
  }, [onChange]);

  const handleClear = () => {
    onChange('');
    setDraft('');
    setEditing(false);
    setError('');
  };

  const startEditing = () => {
    setDraft(value ? value.replace(';', ', ') : '');
    setEditing(true);
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePin(draft);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={inputValue}
            onChange={e => {
              if (!editing) startEditing();
              setDraft(e.target.value);
              if (error) setError('');
            }}
            onFocus={() => {
              if (!editing && !isPinned) startEditing();
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (editing && draft.trim()) {
                handlePin(draft);
              } else if (editing && !draft.trim()) {
                setEditing(false);
              }
            }}
            placeholder="Google Maps link or lat, lng"
            className={status === 'pinned' ? 'pr-8 border-emerald-500/50 bg-emerald-500/5' : status === 'error' ? 'border-destructive/50' : ''}
          />
          {status === 'pinned' && (
            <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
          )}
          {status === 'resolving' && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {status === 'idle' || status === 'error' ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePin(draft)}
            disabled={!draft.trim()}
          >
            <MapPin className="h-3.5 w-3.5 mr-1" />
            Pin
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {status === 'pinned' && displayCoords && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {displayCoords}
        </p>
      )}
      {status === 'error' && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
