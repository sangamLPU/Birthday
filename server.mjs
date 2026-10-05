import { createServer } from 'node:http';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');
const storageDir = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : (process.env.VERCEL ? path.join('/tmp', 'storage') : path.join(root, 'storage'));
const uploadDir = path.join(storageDir, 'uploads');
const dbPath = path.join(storageDir, 'birthdays.json');
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

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function ensureStorage() {
  try { await mkdir(uploadDir, { recursive: true }); }
  catch { /* storage folder already created or running in read-only environment */ }
}

async function readDatabase() {
  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/birthdays`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const data = await res.json();
      if (data && data.result) {
        const parsed = JSON.parse(data.result);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error('KV read error:', err.message);
    }
  }
  try {
    const rows = JSON.parse(await readFile(dbPath, 'utf8'));
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeDatabase(rows) {
  if (kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/set/birthdays`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(JSON.stringify(rows))
      });
    } catch (err) {
      console.error('KV write error:', err.message);
    }
  }
  await ensureStorage();
  try {
    const tempPath = `${dbPath}.${randomBytes(5).toString('hex')}.tmp`;
    await writeFile(tempPath, JSON.stringify(rows, null, 2), { encoding: 'utf8', flag: 'wx' });
    await rename(tempPath, dbPath);
  } catch (err) {
    if (!kvUrl) console.error('Disk write error:', err.message);
  }
}

async function getBirthdayBySlug(slug) {
  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/birthday:${encodeURIComponent(slug)}`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const data = await res.json();
      if (data && data.result) {
        return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      }
    } catch (err) {
      console.error('KV read slug error:', err.message);
    }
  }
  const rows = await readDatabase();
  return rows.find(r => r.slug === slug);
}

async function saveBirthdayRecord(row) {
  if (kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/set/birthday:${encodeURIComponent(row.slug)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(JSON.stringify(row))
      });
    } catch (err) {
      console.error('KV save slug error:', err.message);
    }
  }
}

async function deleteBirthdayRecord(slug) {
  if (kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/del/birthday:${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}` }
      });
    } catch (err) {
      console.error('KV delete slug error:', err.message);
    }
  }
}

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

async function cleanupUnusedPhotos(photoUrls, rows) {
  const used = new Set(rows.flatMap(row => (row.photos || []).map(photo => photo.url)));
  const unused = [...new Set(photoUrls)].filter(photoUrl => !used.has(photoUrl));
  await Promise.all(unused.map(photoUrl => unlink(path.join(uploadDir, path.basename(photoUrl))).catch(() => { })));
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
  if (!isUploadPath && !isDataUrl) {
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
    music: { trackId, enabled: music.enabled === true },
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
  const { editTokenHash, ...publicData } = row;
  return publicData;
}

function hashToken(value) {
  return createHash('sha256').update(value).digest();
}

function authorized(row, value) {
  if (!row || typeof value !== 'string' || value.length < 32) return false;
  const supplied = hashToken(value);
  const expected = Buffer.from(row.editTokenHash, 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function slugPart(name) {
  const result = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 34);
  return result || 'birthday-star';
}

async function bodyJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxJsonBytes) throw new Error('This upload is too large. Try a smaller photo.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('The request could not be read. Please try again.'); }
}

function validImage(buffer, type) {
  if (type === 'image/png') return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === 'image/jpeg') return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === 'image/webp') return buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/health' && req.method === 'GET') {
    return json(res, 200, { ok: true, storage: kvUrl && kvToken ? 'upstash-redis' : 'local' });
  }

  if (url.pathname === '/api/uploads' && req.method === 'POST') {
    const input = await bodyJson(req);
    if (typeof input.dataUrl !== 'string') return json(res, 400, { error: 'Choose a photo to upload.' });
    const match = input.dataUrl.match(/^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return json(res, 400, { error: 'Use a JPG, PNG, or WebP photo.' });
    const type = match[1];
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > 8 * 1024 * 1024) return json(res, 413, { error: 'That photo is too large. Try a smaller image.' });
    if (!validImage(bytes, type)) return json(res, 400, { error: 'That image could not be read. Please choose another.' });
    if (process.env.VERCEL) {
      return json(res, 201, { photo: { url: input.dataUrl, alt: 'Birthday memory' } });
    }
    await ensureStorage();
    const extension = type === 'image/jpeg' ? 'jpg' : type.slice(6);
    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDir, fileName), bytes, { flag: 'wx' });
    return json(res, 201, { photo: { url: `/uploads/${fileName}`, alt: 'Birthday memory' } });
  }

  if (url.pathname === '/api/birthdays' && req.method === 'POST') {
    const input = await bodyJson(req);
    let normalized;
    try { normalized = normalizeBirthday(input.birthday); }
    catch (error) { return json(res, 400, { error: error.message }); }
    const rows = await readDatabase();
    let slug;
    do { slug = `${slugPart(normalized.recipient.name)}-${randomBytes(4).toString('hex')}`; }
    while (rows.some(row => row.slug === slug));
    const editToken = randomBytes(32).toString('base64url');
    const now = new Date().toISOString();
    const row = { id: randomUUID(), slug, ...normalized, editTokenHash: hashToken(editToken).toString('hex'), createdAt: now, updatedAt: now };
    rows.push(row);
    await writeDatabase(rows);
    await saveBirthdayRecord(row);
    return json(res, 201, { birthday: publicRecord(row), editToken });
  }

  const match = url.pathname.match(/^\/api\/birthdays\/([a-z0-9-]+)(?:\/(edit))?$/);
  if (match) {
    const [, slug, editPath] = match;
    const row = await getBirthdayBySlug(slug);
    if (req.method === 'GET' && !editPath) return row ? json(res, 200, { birthday: publicRecord(row) }) : json(res, 404, { error: 'This birthday surprise could not be found.' });
    if (req.method === 'GET' && editPath) {
      if (!authorized(row, req.headers['x-edit-token'])) return json(res, 403, { error: 'This private edit link is not available on this device.' });
      return json(res, 200, { birthday: publicRecord(row) });
    }
    if (req.method === 'PATCH' && !editPath) {
      if (!authorized(row, req.headers['x-edit-token'])) return json(res, 403, { error: 'This page can only be changed from its creator’s device.' });
      const input = await bodyJson(req);
      let normalized;
      try { normalized = normalizeBirthday(input.birthday); }
      catch (error) { return json(res, 400, { error: error.message }); }
      const rows = await readDatabase();
      const index = rows.findIndex(r => r.slug === slug);
      const replacedPhotos = (row.photos || []).map(photo => photo.url);
      const updated = { ...row, ...normalized, updatedAt: new Date().toISOString() };
      if (index >= 0) rows[index] = updated; else rows.push(updated);
      await writeDatabase(rows);
      await saveBirthdayRecord(updated);
      await cleanupUnusedPhotos(replacedPhotos, rows);
      return json(res, 200, { birthday: publicRecord(updated) });
    }
    if (req.method === 'DELETE' && !editPath) {
      if (!authorized(row, req.headers['x-edit-token'])) return json(res, 403, { error: 'This page can only be removed by its creator.' });
      const rows = await readDatabase();
      const index = rows.findIndex(r => r.slug === slug);
      if (index >= 0) rows.splice(index, 1);
      await writeDatabase(rows);
      await deleteBirthdayRecord(slug);
      await cleanupUnusedPhotos((row?.photos || []).map(photo => photo.url), rows);
      return json(res, 200, { ok: true });
    }
  }
  return json(res, 404, { error: 'That page could not be found.' });
}

async function serveStatic(req, res, url) {
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
  const birthdayRoute = url.pathname.match(/^\/birthday\/([a-z0-9-]+)$/);
  if (birthdayRoute && (req.method === 'GET' || req.method === 'HEAD')) {
    const [birthday, shell] = await Promise.all([getBirthdayBySlug(birthdayRoute[1]), readFile(path.join(publicDir, 'index.html'), 'utf8')]);
    let document = shell;
    if (birthday) {
      const title = escapeHtml(`Happy Birthday ${birthday.recipient.name} 🎂`);
      const description = escapeHtml(`Someone made ${birthday.recipient.name} a special birthday surprise.`);
      document = document.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
        .replace('</head>', `<meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"></head>`);
    }
    const content = Buffer.from(document);
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'content-length': content.length, 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' });
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
    const rawPath = req.headers['x-matched-path'] || req.url;
    const url = new URL(rawPath, `http://${req.headers.host || 'localhost'}`);
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'POST' && req.method !== 'PATCH' && req.method !== 'DELETE') {
      res.writeHead(405, { allow: 'GET, HEAD, POST, PATCH, DELETE' }); return res.end();
    }
    await serveStatic(req, res, url);
  } catch (error) {
    console.error('Request failed:', error.message);
    if (!res.headersSent) json(res, 500, { error: 'The birthday magic hit a little bump. Please try again.' });
    else res.end();
  }
}

const server = createServer(requestListener);

if (!process.env.VERCEL) {
  server.listen(port, '0.0.0.0', () => console.log(`Birthday Spark is ready at http://localhost:${port}`));
}

export { server };
export default requestListener;
