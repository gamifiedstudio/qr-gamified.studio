import { NextRequest, NextResponse } from 'next/server';

/**
 * Resolve a shortened URL (e.g. maps.app.goo.gl) by following redirects
 * and returning the final URL. Used to extract coordinates from Google Maps
 * short links without running into CORS issues on the client.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Only allow Google Maps domains
  try {
    const parsed = new URL(url);
    const allowed = ['maps.app.goo.gl', 'goo.gl', 'maps.google.com', 'www.google.com', 'google.com'];
    if (!allowed.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d))) {
      return NextResponse.json({ error: 'Only Google Maps URLs are supported' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    // Follow the first redirect manually to get the Location header
    // (avoids issues with Google returning HTML instead of redirecting for fetch)
    const res = await fetch(url, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QRGenerator/1.0)',
      },
    });

    // 3xx redirect — return the Location header
    const location = res.headers.get('location');
    if (location) {
      return NextResponse.json({ resolved: location });
    }

    // If no redirect, return the original URL (it was already a full URL)
    return NextResponse.json({ resolved: url });
  } catch {
    return NextResponse.json({ error: 'Failed to resolve URL' }, { status: 502 });
  }
}
