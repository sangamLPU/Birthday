import { createServer } from 'node:http';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';
import { production, storageDir, uploadDir, redisConfig, redis, durableReady, getBirthdayBySlug, storeBirthday, photoKey, rateLimit, ServiceError } from './storage.mjs';
import { renderSocialImage } from './social.mjs';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');
const port = Number(process.env.PORT || 4173);
const maxJsonBytes = 10 * 1024 * 1024;
const allowedThemes = new Set(['strawberry', 'sakura', 'teddy', 'cloud', 'bunny', 'candy', 'starry']);
const allowedTracks = new Set([
  'birthday_classic', 'romantic_ballad', 'birthday_cheer', 'candlelight_romance',
  'make_a_wish', 'sweetheart_waltz', 'sunset_lofi',
  'dream', 'romance', 'cinematic', 'nostalgia', 'playful', 'cozy', 'magic',
  'upbeat', 'lofi', 'elegant', 'night', 'twinkle', 'sunshine', 'piano'
]);
const allowedRelationships = new Set(['Friend', 'Best friend', 'Partner', 'Sibling', 'Parent', 'Cousin', 'Colleague', 'Other']);
const allowedStorySections = new Set(['letter', 'memories', 'reasons', 'inside-joke', 'surprise']);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8'
};

async function ensureStorage() { await mkdir(uploadDir, { recursive: true }); }

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  res.end(payload);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function trustedBlobUrl(value) {
  try {
    const url = new URL(value);
    const host = process.env.BLOB_PUBLIC_HOSTNAME?.toLowerCase();
    return Boolean(host && /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(host) && url.protocol === 'https:' && url.hostname === host && !url.port && !url.username && !url.password && !url.search && !url.hash && /^\/birthdays\/[a-f0-9-]+\.(?:webp|png|jpe?g)$/.test(url.pathname));
  } catch { return false; }
}

async function cleanupUnusedPhotos(previous, updated) {
  const retained = new Set((updated?.photos || []).map(photo => photo.url));
  for (const url of new Set((previous.photos || []).map(photo => photo.url))) {
    if (retained.has(url)) continue;
    try {
      if (trustedBlobUrl(url) && redisConfig() && await redis(['GET', photoKey(url)]) === `deleting:${previous.slug}`) {
        await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
        // Keep the deleting marker: an old copied URL must never become attachable again.
      } else if (!redisConfig() && /^\/uploads\/[a-f0-9-]+\.(?:webp|png|jpe?g)$/.test(url)) {
        const rows = JSON.parse(await readFile(path.join(storageDir, 'birthdays.json'), 'utf8'));
        if (!rows.some(row => (row.photos || []).some(photo => photo.url === url))) await unlink(path.join(uploadDir, path.basename(url)));
      }
    } catch { console.warn('Photo cleanup deferred.'); } // record mutation already succeeded; never expose provider errors
  }
}

function cleanText(value, maxLength, field) {
  if (typeof value !== 'string') throw new Error(`${field} must be text.`);
  const text = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (text.length > maxLength) throw new Error(`${field} is too long.`);
  return text;
}

function safePhoto(photo) {
  if (!photo || typeof photo !== 'object' || typeof photo.url !== 'string') {
    throw new Error('One of the photos is not valid. Please upload it again.');
  }
  const isUploadPath = /^\/uploads\/[a-f0-9-]+\.(?:webp|png|jpe?g)$/.test(photo.url);
  const isDataUrl = /^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(photo.url);
  if (!isUploadPath && !isDataUrl && !trustedBlobUrl(photo.url)) {
    throw new Error('One of the photos is not valid. Please upload it again.');
  }
  return {
    url: photo.url,
    alt: cleanText(typeof photo.alt === 'string' ? photo.alt : 'Birthday memory', 120, 'Photo description') || 'Birthday memory',
    caption: cleanText(typeof photo.caption === 'string' ? photo.caption : '', 100, 'Photo caption'),
    year: cleanText(typeof photo.year === 'string' ? photo.year : '', 24, 'Memory date'),
    memory: cleanText(typeof photo.memory === 'string' ? photo.memory : '', 360, 'Memory note')
  };
}

function normalizeBirthday(input) {
  if (!input || typeof input !== 'object') throw new Error('Birthday details are missing.');
  const recipient = input.recipient || {};
  const message = input.message || {};
  const music = input.music || {};
  const customization = input.customization || {};
  const story = input.story || {};
  const name = cleanText(recipient.name, 80, 'Name');
  const text = cleanText(message.text, 3600, 'Birthday message');
  if (!name) throw new Error('Add the birthday person’s name.');
  if (!text) throw new Error('Add a birthday message.');
  const themeId = input.themeId;
  if (!allowedThemes.has(themeId)) throw new Error('Choose one of the available birthday themes.');
  const relationship = typeof recipient.relationship === 'string' && allowedRelationships.has(recipient.relationship) ? recipient.relationship : 'Friend';
  if (!Array.isArray(input.photos) || input.photos.length > 5) throw new Error('Add up to five photos.');
  const photos = input.photos.map(safePhoto);
  const trackId = allowedTracks.has(music.trackId) ? music.trackId : 'twinkle';
  const ageValue = recipient.age === '' || recipient.age === null || recipient.age === undefined ? null : Number(recipient.age);
  if (ageValue !== null && (!Number.isInteger(ageValue) || ageValue < 1 || ageValue > 130)) throw new Error('Age must be between 1 and 130.');
  const birthdayDate = cleanText(typeof recipient.birthdayDate === 'string' ? recipient.birthdayDate : '', 10, 'Birthday date');
  if (birthdayDate) {
    const date = new Date(`${birthdayDate}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdayDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== birthdayDate) throw new Error('Enter a real birthday date.');
  }
  const reasons = Array.isArray(story.reasons) ? story.reasons.slice(0, 6).map((reason, index) => cleanText(reason, 140, `Reason ${index + 1}`)).filter(Boolean) : [];
  const order = Array.isArray(story.order) ? [...new Set(story.order.filter(section => allowedStorySections.has(section)))] : [];
  const legacyStory = !input.story || typeof input.story !== 'object';
  const storyData = {
    intro: cleanText(typeof story.intro === 'string' ? story.intro : '', 220, 'Opening line'),
    letter: text,
    reasons,
    insideJoke: cleanText(typeof story.insideJoke === 'string' ? story.insideJoke : '', 220, 'Inside joke'),
    surprise: cleanText(typeof story.surprise === 'string' ? story.surprise : '', 500, 'Surprise message'),
    secret: cleanText(typeof story.secret === 'string' ? story.secret : '', 500, 'Secret note'),
    closing: cleanText(typeof story.closing === 'string' ? story.closing : '', 500, 'Closing note'),
    signature: cleanText(typeof story.signature === 'string' ? story.signature : '', 100, 'Signature'),
    order: Array.isArray(story.order) ? order : ['letter', 'memories', 'reasons', 'inside-joke', 'surprise']
  };
  return {
    recipient: {
      name,
      nickname: cleanText(typeof recipient.nickname === 'string' ? recipient.nickname : '', 48, 'Nickname'),
      relationship,
      age: ageValue,
      birthdayDate,
      location: cleanText(typeof recipient.location === 'string' ? recipient.location : '', 100, 'Location'),
      personality: cleanText(typeof recipient.personality === 'string' ? recipient.personality : '', 100, 'Personality')
    },
    message: { text: storyData.letter, type: ['custom', 'generated', 'template'].includes(message.type) ? message.type : 'custom' },
    story: storyData,
    themeId,
    photos,
    music: { trackId, enabled: music.enabled === true, automatic: music.automatic === true },
    customization: {
      animationIntensity: ['low', 'normal', 'high'].includes(customization.animationIntensity) ? customization.animationIntensity : 'normal',
      showConfetti: customization.showConfetti !== false,
      showCake: customization.showCake !== false,
      showGallery: customization.showGallery !== false,
      finaleStyle: ['theme', 'cake', 'quiet'].includes(customization.finaleStyle) ? customization.finaleStyle : legacyStory && customization.showCake !== false ? 'cake' : 'theme',
      soundEffects: customization.soundEffects !== false
    },
    visibility: 'public-link'
  };
}

function publicRecord(row) {
  const { editTokenHash, editToken, ...publicData } = row;
  return publicData;
}

function hashToken(value) {
  return createHash('sha256').update(value).digest();
}

function authorized(row, value) {
  if (!row || typeof value !== 'string' || value.length < 32) return false;
  const supplied = hashToken(value);
  const expected = Buffer.from(typeof row.editTokenHash === 'string' ? row.editTokenHash : '', 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function slugPart(name) {
  const result = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 34);
  return result || 'birthday-star';
}

async function bodyJson(req) {
  // Vercel's Node helpers may already have parsed/consumed the request stream.
  if (req.body !== undefined) {
    try {
      const encoded = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (Buffer.byteLength(encoded) > maxJsonBytes) throw new ServiceError('This upload is too large. Try a smaller photo.', 413);
      return JSON.parse(encoded);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('The request could not be read. Please try again.', 400);
    }
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxJsonBytes) throw new ServiceError('This upload is too large. Try a smaller photo.', 413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ServiceError('The request could not be read. Please try again.', 400); }
}

function validImage(buffer, type) {
  if (type === 'image/png') return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === 'image/jpeg') return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === 'image/webp') return buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/health' && req.method === 'GET') {
    const ready = await durableReady();
    return json(res, production && !ready ? 503 : 200, {
      ok: !production || ready, storage: redisConfig() ? 'upstash-redis' : production ? 'unavailable' : 'local-filesystem', durableStorageReady: ready
    });
  }

  if (url.pathname === '/api/uploads' && req.method === 'POST') {
    await rateLimit(req, res, 'upload');
    const input = await bodyJson(req);
    if (typeof input.dataUrl !== 'string') return json(res, 400, { error: 'Choose a photo to upload.' });
    const match = input.dataUrl.match(/^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return json(res, 400, { error: 'Use a JPG, PNG, or WebP photo.' });
    const type = match[1];
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > 2 * 1024 * 1024) return json(res, 413, { error: 'That photo is too large. Try a smaller image.' });
    if (!validImage(bytes, type)) return json(res, 400, { error: 'That image could not be read. Please choose another.' });
    // Decode as well as checking the signature; bound decompression before accepting bytes.
    try { await sharp(bytes, { limitInputPixels: 16_000_000 }).resize(1, 1).raw().toBuffer(); }
    catch { return json(res, 400, { error: 'That image could not be read. Please choose another.' }); }
    if (production || process.env.BLOB_READ_WRITE_TOKEN) {
      if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.BLOB_PUBLIC_HOSTNAME || !redisConfig()) throw new ServiceError('Photo uploads are temporarily unavailable. You can still create a page without photos.');
      let blob;
      try {
        const extension = type === 'image/jpeg' ? 'jpg' : type.slice(6);
        blob = await put(`birthdays/${randomUUID()}.${extension}`, bytes, { access: 'public', addRandomSuffix: false, contentType: type, token: process.env.BLOB_READ_WRITE_TOKEN });
        if (!trustedBlobUrl(blob.url)) throw new Error('Unexpected Blob host');
        if (await redis(['SET', photoKey(blob.url), 'pending']) !== 'OK') throw new ServiceError();
      } catch {
        if (blob?.url && trustedBlobUrl(blob.url)) { try { await del(blob.url); } catch { /* retry via store administration */ } }
        throw new ServiceError('That photo could not be saved. Please try again, or continue without photos.');
      }
      return json(res, 201, { photo: { url: blob.url, alt: 'Birthday memory' } });
    }
    await ensureStorage();
    const extension = type === 'image/jpeg' ? 'jpg' : type.slice(6);
    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDir, fileName), bytes, { flag: 'wx' });
    return json(res, 201, { photo: { url: `/uploads/${fileName}`, alt: 'Birthday memory' } });
  }

  if (url.pathname === '/api/birthdays' && req.method === 'POST') {
    await rateLimit(req, res, 'create');
    const input = await bodyJson(req);
    let normalized;
    try { normalized = normalizeBirthday(input.birthday); }
    catch (error) { return json(res, 400, { error: error.message }); }
    const slug = `${slugPart(normalized.recipient.name)}-${randomBytes(16).toString('base64url')}`;
    const editToken = randomBytes(32).toString('base64url');
    const now = new Date().toISOString();
    const row = { id: randomUUID(), slug, ...normalized, editTokenHash: hashToken(editToken).toString('hex'), createdAt: now, updatedAt: now };
    await storeBirthday(row, null, row.photos.map(photo => photo.url).filter(trustedBlobUrl));
    return json(res, 201, { birthday: publicRecord(row), editToken });
  }

  const match = url.pathname.match(/^\/api\/birthdays\/([A-Za-z0-9_-]+)(?:\/(edit))?$/);
  if (match) {
    const [, slug, editPath] = match;
    await rateLimit(req, res, req.method === 'GET' && !editPath ? 'read' : 'manage');
    const row = await getBirthdayBySlug(slug);
    if (req.method === 'GET' && !editPath) return row ? json(res, 200, { birthday: publicRecord(row) }) : json(res, 404, { error: 'This birthday surprise could not be found.' });
    if (req.method === 'GET' && editPath) {
      if (!authorized(row, req.headers['x-edit-token'])) return json(res, 403, { error: 'Use the private edit link saved by the creator to manage this page.' });
      return json(res, 200, { birthday: publicRecord(row) });
    }
    if (req.method === 'PATCH' && !editPath) {
      if (!authorized(row, req.headers['x-edit-token'])) return json(res, 403, { error: 'Use the creator’s private edit link to change this page.' });
      const input = await bodyJson(req);
      let normalized;
      try { normalized = normalizeBirthday(input.birthday); }
      catch (error) { return json(res, 400, { error: error.message }); }
      const updated = { ...row, ...normalized, updatedAt: new Date().toISOString() };
      const blobPhotos = [...new Set([...row.photos || [], ...updated.photos].map(photo => photo.url).filter(trustedBlobUrl))];
      await storeBirthday(updated, row, blobPhotos);
      await cleanupUnusedPhotos(row, updated);
      return json(res, 200, { birthday: publicRecord(updated) });
    }
    if (req.method === 'DELETE' && !editPath) {
      if (!authorized(row, req.headers['x-edit-token'])) return json(res, 403, { error: 'This page can only be removed by its creator.' });
      await storeBirthday(null, row, (row.photos || []).map(photo => photo.url).filter(trustedBlobUrl));
      await cleanupUnusedPhotos(row, null);
      return json(res, 200, { ok: true });
    }
  }
  return json(res, 404, { error: 'That page could not be found.' });
}

function publicOrigin(req) {
  if (process.env.PUBLIC_ORIGIN) {
    const origin = new URL(process.env.PUBLIC_ORIGIN);
    if (origin.protocol !== 'https:' && production) throw new ServiceError();
    return origin.origin;
  }
  const host = req.headers.host;
  if (typeof host !== 'string' || !/^[a-zA-Z0-9.-]+(?::[0-9]+)?$/.test(host)) throw new ServiceError();
  return `${production ? 'https' : 'http'}://${host}`;
}

async function serveStatic(req, res, url) {
  if (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/social/')) return handleApi(req, res, url);
  const socialRoute = url.pathname.match(/^\/api\/social\/([A-Za-z0-9_-]+)\.png$/);
  const birthdayRoute = url.pathname.match(/^\/birthday\/([A-Za-z0-9_-]+)$/);
  if ((birthdayRoute || socialRoute) && (req.method === 'GET' || req.method === 'HEAD')) {
    await rateLimit(req, res, 'read');
    const slug = (birthdayRoute || socialRoute)[1];
    const birthday = await getBirthdayBySlug(slug);
    if (socialRoute) {
      if (!birthday) { res.writeHead(404, { 'cache-control': 'no-store' }); return res.end('Not found'); }
      const content = await renderSocialImage(birthday, { trustedBlobUrl, uploadDir });
      res.writeHead(200, { 'content-type': 'image/png', 'content-length': content.length, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex, nofollow' });
      return req.method === 'HEAD' ? res.end() : res.end(content);
    }
    let document = await readFile(path.join(publicDir, 'index.html'), 'utf8');
    if (birthday) {
      const title = escapeHtml(`Happy Birthday ${birthday.recipient.name} 🎂`);
      const description = escapeHtml(`Someone made ${birthday.recipient.name} a little birthday story to open.`);
      const origin = publicOrigin(req);
      const pageUrl = escapeHtml(`${origin}/birthday/${slug}`);
      const image = escapeHtml(`${origin}/api/social/${slug}.png`);
      document = document.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
        .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${description}">`)
        .replace('</head>', `<meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:url" content="${pageUrl}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${image}"></head>`);
    }
    document = document.replace('</head>', '<meta name="robots" content="noindex,nofollow"></head>');
    const content = Buffer.from(document);
    res.writeHead(birthday ? 200 : 404, { 'content-type': 'text/html; charset=utf-8', 'content-length': content.length, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex, nofollow' });
    return req.method === 'HEAD' ? res.end() : res.end(content);
  }
  let filePath;
  if (url.pathname.startsWith('/uploads/')) {
    const fileName = path.basename(url.pathname);
    if (!/^[a-f0-9-]+\.(?:webp|png|jpe?g)$/.test(fileName)) {
      res.writeHead(404); return res.end('Not found');
    }
    filePath = path.join(uploadDir, fileName);
  } else {
    const requested = decodeURIComponent(url.pathname);
    const candidate = path.resolve(publicDir, `.${requested}`);
    if (!candidate.startsWith(`${publicDir}${path.sep}`) && candidate !== publicDir && candidate !== path.join(publicDir, 'index.html')) {
      res.writeHead(403); return res.end('Forbidden');
    }
    filePath = candidate;
    try {
      const stat = await import('node:fs/promises').then(fs => fs.stat(filePath));
      if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch { /* SPA route below */ }
    try { await readFile(filePath); }
    catch { filePath = path.join(publicDir, 'index.html'); }
  }
  try {
    const content = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'content-type': mimeTypes[extension] || 'application/octet-stream',
      'content-length': content.length,
      'x-content-type-options': 'nosniff',
      'cache-control': ['.html', '.css', '.js'].includes(extension) ? 'no-store, no-cache, must-revalidate' : 'public, max-age=86400'
    });
    if (req.method === 'HEAD') return res.end();
    res.end(content);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Not found');
  }
}

export async function requestListener(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost');
    // Explicit rewrite parameter used only for server-rendered public routes.
    if (url.pathname === '/api/public' && url.searchParams.has('birthday')) url.pathname = `/birthday/${url.searchParams.get('birthday')}`;
    if (url.pathname === '/api/public' && url.searchParams.has('upload')) url.pathname = `/uploads/${url.searchParams.get('upload')}`;
    if (url.pathname === '/api/public' && url.searchParams.has('social')) url.pathname = `/api/social/${url.searchParams.get('social')}.png`;
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'POST' && req.method !== 'PATCH' && req.method !== 'DELETE') {
      res.writeHead(405, { allow: 'GET, HEAD, POST, PATCH, DELETE' }); return res.end();
    }
    await serveStatic(req, res, url);
  } catch (error) {
    console.error('Birthday request failed.', { status: error.status || 500 });
    if (!res.headersSent) json(res, error.status || 500, { error: error instanceof ServiceError ? error.message : 'The birthday magic hit a little bump. Please try again.' });
    else res.end();
  }
}

const server = createServer(requestListener);

if (!process.env.VERCEL && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(port, '0.0.0.0', () => console.log(`Birthday Spark is ready at http://localhost:${port}`));
}

export { server };
export default requestListener;
