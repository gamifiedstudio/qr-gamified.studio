import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const DIST = join(import.meta.dir, 'dist');
const PORT = parseInt(process.env.PORT || '3000', 10);

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname === '/' ? '/index.html' : url.pathname;
    let filePath = join(DIST, path);

    // SPA fallback — serve index.html for non-file routes
    if (!existsSync(filePath)) {
      filePath = join(DIST, 'index.html');
      path = '/index.html';
    }

    try {
      const file = readFileSync(filePath);
      const ext = extname(path);
      return new Response(file, {
        headers: {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      return new Response('Not Found', { status: 404 });
    }
  },
});

console.log(`Serving on port ${PORT}`);
