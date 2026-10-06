// Vercel rewrites these public routes through /api/public. Translate them here,
// before they reach the normal API dispatcher, so they stay distinct routes.
import requestListener from '../server.mjs';

function queryValue(req, url, key) {
  const value = req.query?.[key] ?? url.searchParams.get(key);
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' ? first : null;
}

export default function publicHandler(req, res) {
  const url = new URL(req.url || '/', 'https://birthday-spark.invalid');
  const hasRewriteQuery = ['birthday', 'social', 'upload'].some(key => req.query?.[key] !== undefined || url.searchParams.has(key));
  if (url.pathname === '/api/public' || hasRewriteQuery) {
    const birthday = queryValue(req, url, 'birthday');
    const social = queryValue(req, url, 'social')?.replace(/\.png$/i, '');
    const upload = queryValue(req, url, 'upload');
    const routes = [birthday && ['birthday', birthday], social && ['social', social], upload && ['upload', upload]].filter(Boolean);
    if (routes.length !== 1) { res.writeHead(404, { 'cache-control': 'no-store' }); return res.end('Not found'); }
    const [kind, value] = routes[0];
    if (kind === 'birthday' && /^[A-Za-z0-9_-]+$/.test(value)) req.url = `/birthday/${encodeURIComponent(value)}`;
    else if (kind === 'social' && /^[A-Za-z0-9_-]+$/.test(value)) req.url = `/api/social/${encodeURIComponent(value)}.png`;
    else if (kind === 'upload' && /^[a-f0-9-]+\.(?:webp|png|jpe?g)$/i.test(value)) req.url = `/uploads/${encodeURIComponent(value)}`;
    else { res.writeHead(404, { 'cache-control': 'no-store' }); return res.end('Not found'); }
  }
  return requestListener(req, res);
}
