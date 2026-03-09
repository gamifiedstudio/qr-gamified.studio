/**
 * Parse coordinates from various Google Maps URL formats or raw lat,lng input.
 *
 * Supported formats:
 *   - Raw coordinates: "25.2131, 55.2797" or "25.2131,55.2797"
 *   - Google Maps @lat,lng: https://www.google.com/maps/place/.../@25.2131,55.2797,...
 *   - Google Maps ?q=lat,lng: https://www.google.com/maps?q=25.2131,55.2797
 *   - Google Maps /dir/lat,lng: coordinates in path segments
 *   - Short links need server-side resolution first (maps.app.goo.gl/...)
 */
export function parseCoordinates(input: string): { lat: number; lng: number } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try raw "lat, lng" or "lat,lng" (with optional spaces)
  const rawMatch = trimmed.match(/^(-?\d+\.?\d*)\s*[,;]\s*(-?\d+\.?\d*)$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (isValidCoord(lat, lng)) return { lat, lng };
  }

  // Try Google Maps URL patterns
  try {
    const url = new URL(trimmed);

    // Pattern: /@lat,lng,zoom
    const atMatch = url.pathname.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (isValidCoord(lat, lng)) return { lat, lng };
    }

    // Pattern: ?q=lat,lng or &ll=lat,lng
    for (const param of ['q', 'll', 'center', 'query']) {
      const val = url.searchParams.get(param);
      if (val) {
        const coordMatch = val.match(/^(-?\d+\.?\d+),(-?\d+\.?\d+)$/);
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lng = parseFloat(coordMatch[2]);
          if (isValidCoord(lat, lng)) return { lat, lng };
        }
      }
    }

    // Pattern: /dir/ or /place/ with coordinates in path like /25.2131,55.2797/
    const pathCoordMatch = url.pathname.match(/\/(-?\d+\.?\d+),(-?\d+\.?\d+)/);
    if (pathCoordMatch) {
      const lat = parseFloat(pathCoordMatch[1]);
      const lng = parseFloat(pathCoordMatch[2]);
      if (isValidCoord(lat, lng)) return { lat, lng };
    }
  } catch {
    // Not a URL — that's fine, we already tried raw coords above
  }

  return null;
}

function isValidCoord(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Check if input looks like a Google Maps short link that needs server-side resolution.
 */
export function isShortMapLink(input: string): boolean {
  try {
    const url = new URL(input.trim());
    return url.hostname === 'maps.app.goo.gl' || url.hostname === 'goo.gl';
  } catch {
    return false;
  }
}

/**
 * Resolve a short Google Maps link via our API route.
 */
export async function resolveShortLink(shortUrl: string): Promise<string> {
  const res = await fetch(`/api/resolve-url?url=${encodeURIComponent(shortUrl)}`);
  if (!res.ok) throw new Error('Failed to resolve URL');
  const data = await res.json();
  return data.resolved;
}

/**
 * Format coordinates for display.
 */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Format coordinates for vCard GEO field (lat;lng per RFC 2426).
 */
export function toVCardGeo(lat: number, lng: number): string {
  return `${lat};${lng}`;
}
