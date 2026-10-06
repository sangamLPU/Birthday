import requestListener from '../server.mjs';

function routeSegments(value) {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap(part => typeof part === 'string' ? part.split('/') : []).filter(Boolean);
}

export default function apiHandler(req, res) {
  const url = new URL(req.url || '/', 'https://birthday-spark.invalid');
  const routeParam = req.query?.path ?? url.searchParams.getAll('path');
  const segments = routeSegments(routeParam);
  if (!segments.length || !segments.every(segment => /^[A-Za-z0-9_.-]+$/.test(segment) && segment !== '.' && segment !== '..')) {
    res.writeHead(404, { 'cache-control': 'no-store' });
    return res.end('Not found');
  }

  // Vercel rewrites every API and public asset request here with its original
  // route in `path`. Restore that path before the app's normal dispatcher runs.
  url.searchParams.delete('path');
  req.url = `/${segments.map(encodeURIComponent).join('/')}${url.search}`;
  return requestListener(req, res);
}
