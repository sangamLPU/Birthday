import requestListener from '../server.mjs';

function routeSegments(value) {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap(part => typeof part === 'string' ? part.split('/') : [])
    .filter(Boolean);
}

export default function apiHandler(req, res) {
  const url = new URL(req.url || '/', 'https://birthday-spark.invalid');
  const routeParam = req.query?.path ?? url.searchParams.getAll('path');
  const segments = routeSegments(routeParam);
  if (segments[0] === 'api') segments.shift();
  const opaqueFunctionPath = /\[[^\]]*\.\.\.[^\]]*\]/.test(url.pathname) || url.pathname === '/api';

  // Vercel may expose catch-all segments in req.query.path while req.url points
  // at the function entry. Rebuild the original API path before dispatching.
  if (segments.length && (opaqueFunctionPath || !url.pathname.startsWith('/api/'))) {
    if (!segments.every(segment => /^[A-Za-z0-9_.-]+$/.test(segment) && segment !== '.' && segment !== '..')) {
      res.writeHead(404, { 'cache-control': 'no-store' });
      return res.end('Not found');
    }
    url.searchParams.delete('path');
    req.url = `/api/${segments.map(encodeURIComponent).join('/')}${url.search}`;
  } else if (opaqueFunctionPath) {
    res.writeHead(404, { 'cache-control': 'no-store' });
    return res.end('Not found');
  }

  return requestListener(req, res);
}
