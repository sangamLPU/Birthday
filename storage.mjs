import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isIP } from 'node:net';

export const production = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
export const storageDir = path.resolve(process.env.STORAGE_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'storage'));
export const uploadDir = path.join(storageDir, 'uploads');
const storedValue = Symbol('storedRedisValue');
const dbPath = path.join(storageDir, 'birthdays.json');
export class ServiceError extends Error {
  constructor(message = 'Saving is temporarily unavailable. Please try again shortly.', status = 503) { super(message); this.status = status; }
}
export function redisConfig() {
  for (const [urlKey, tokenKey] of [['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'], ['KV_REST_API_URL', 'KV_REST_API_TOKEN']]) {
    if (process.env[urlKey] && process.env[tokenKey]) return { url: process.env[urlKey], token: process.env[tokenKey] };
  }
  return null;
}
export async function redis(command) {
  const config = redisConfig();
  if (!config) throw new ServiceError();
  try {
    const response = await fetch(config.url.replace(/\/$/, ''), {
      method: 'POST', headers: { Authorization: `Bearer ${config.token}`, 'content-type': 'application/json' },
      body: JSON.stringify(command), signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('Redis HTTP failure');
    const data = await response.json();
    if (!data || data.error || !Object.hasOwn(data, 'result')) throw new Error('Redis response failure');
    return data.result;
  } catch { throw new ServiceError(); }
}
export async function durableReady() {
  try { return await redis(['PING']) === 'PONG'; } catch { return false; }
}
function useRedis() {
  if (redisConfig()) return true;
  if (production) throw new ServiceError();
  return false;
}
function parse(value, array = false) {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (array ? !Array.isArray(parsed) : !parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch { throw new ServiceError('Birthday storage is temporarily unavailable. Please try again shortly.'); }
}
async function localRows() {
  try { return parse(await readFile(dbPath, 'utf8'), true); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
export async function getBirthdayBySlug(slug) {
  if (!useRedis()) return (await localRows()).find(row => row.slug === slug);
  const value = await redis(['GET', `birthday:${slug}`]);
  if (value !== null) {
    const row = parse(value);
    if (row.slug !== slug || typeof row.recipient?.name !== 'string') throw new ServiceError();
    Object.defineProperty(row, storedValue, { value: typeof value === 'string' ? value : JSON.stringify(value) });
    return row;
  }
  if (await redis(['GET', `birthday-deleted:${slug}`]) !== null) return undefined;
  // Read old aggregate records lazily; edits migrate to independent keys.
  const legacy = await redis(['GET', 'birthdays']);
  const row = legacy === null ? undefined : parse(legacy, true).find(row => row?.slug === slug);
  if (row && typeof row.recipient?.name !== 'string') throw new ServiceError();
  return row;
}
export const photoKey = url => `birthday-photo:${createHash('sha256').update(url).digest('hex')}`;
// Ownership is assigned once. A public photo URL cannot be adopted by a second page.
// Mark removed photos before cleanup so concurrent edits cannot reattach a deleting Blob.
const mutateScript = `
local current = redis.call('GET', KEYS[1])
if ARGV[3] == '' then
  if current or redis.call('EXISTS', KEYS[2]) == 1 then return -1 end
else
  if redis.call('EXISTS', KEYS[2]) == 1 then return -1 end
  if current and current ~= ARGV[3] then return -1 end
end
local added = cjson.decode(ARGV[4])
local removed = cjson.decode(ARGV[5])
local legacyReplacement = nil
if ARGV[2] == '' then
  local legacy = redis.call('GET', 'birthdays')
  if legacy then
    local kept = {}
    local found = false
    for _, row in ipairs(cjson.decode(legacy)) do
      if row.slug == ARGV[1] then found = true else table.insert(kept, row) end
    end
    if found then legacyReplacement = #kept == 0 and '[]' or cjson.encode(kept) end
  end
end
for _, key in ipairs(added) do
  local owner = redis.call('GET', key)
  if owner ~= 'pending' and owner ~= ARGV[1] then return -2 end
end
for _, key in ipairs(added) do redis.call('SET', key, ARGV[1]) end
for _, key in ipairs(removed) do
  if redis.call('GET', key) == ARGV[1] then redis.call('SET', key, 'deleting:' .. ARGV[1]) end
end
if ARGV[2] == '' then
  if legacyReplacement then redis.call('SET', 'birthdays', legacyReplacement) end
  redis.call('SET', KEYS[2], '1')
  redis.call('DEL', KEYS[1])
else redis.call('SET', KEYS[1], ARGV[2]) end
return 1`;
let localWrite = Promise.resolve();
export async function storeBirthday(row, previous = null, blobPhotos = []) {
  const slug = (row || previous).slug;
  if (useRedis()) {
    const before = new Set((previous?.photos || []).map(photo => photo.url));
    const after = new Set((row?.photos || []).map(photo => photo.url));
    const added = blobPhotos.filter(url => after.has(url) && !before.has(url)).map(photoKey);
    const removed = blobPhotos.filter(url => before.has(url) && !after.has(url)).map(photoKey);
    const result = await redis(['EVAL', mutateScript, 2, `birthday:${slug}`, `birthday-deleted:${slug}`,
      slug, row ? JSON.stringify(row) : '', previous ? previous[storedValue] || JSON.stringify(previous) : '', JSON.stringify(added), JSON.stringify(removed)]);
    if (result === -1) throw new ServiceError('This page changed while you were editing. Reload it before trying again.', 409);
    if (result === -2) throw new ServiceError('A photo is already used by another page or is being removed. Please upload it again.', 400);
    if (result !== 1) throw new ServiceError();
    return;
  }
  const task = localWrite.catch(() => {}).then(async () => {
    const rows = await localRows();
    const index = rows.findIndex(item => item.slug === slug);
    if (!previous && index >= 0 || previous && (index < 0 || JSON.stringify(rows[index]) !== JSON.stringify(previous))) {
      throw new ServiceError('This page changed. Reload before trying again.', 409);
    }
    if (row) { if (index < 0) rows.push(row); else rows[index] = row; }
    else rows.splice(index, 1);
    await mkdir(storageDir, { recursive: true });
    const temp = `${dbPath}.${randomUUID()}.tmp`;
    await writeFile(temp, JSON.stringify(rows, null, 2), { flag: 'wx' });
    await rename(temp, dbPath);
  });
  localWrite = task;
  await task;
}

export const RATE_LIMITS = { create: 10, upload: 50, manage: 120, read: 1200 }; // per hour/IP
function clientIP(req) {
  // Only Vercel's overwritten header is trusted; other hosts use their socket peer.
  let value = process.env.VERCEL ? req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] : req.socket?.remoteAddress;
  value = typeof value === 'string' ? value.split(',')[0].trim() : '';
  if (value.startsWith('::ffff:') && isIP(value.slice(7)) === 4) value = value.slice(7);
  if (!isIP(value)) return 'unknown';
  if (isIP(value) === 6) {
    const canonical = new URL(`http://[${value}]/`).hostname.slice(1, -1);
    const [left, right = ''] = canonical.split('::');
    const a = left ? left.split(':') : [], b = right ? right.split(':') : [];
    const groups = canonical.includes('::') ? [...a, ...Array(8 - a.length - b.length).fill('0'), ...b] : a;
    return `${groups.slice(0, 4).map(x => x.padStart(4, '0')).join(':')}::/64`;
  }
  return value;
}
export async function rateLimit(req, res, category) {
  if (!production) return true; // convenient local development
  const key = `birthday-rate:${category}:${createHash('sha256').update(clientIP(req)).digest('hex')}`;
  const result = await redis(['EVAL', `local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 3600) end; return {n, redis.call('TTL', KEYS[1])}`, 1, key]);
  if (!Array.isArray(result) || result.length !== 2 || !result.every(Number.isInteger) || result[1] < 0) throw new ServiceError();
  if (result[0] <= RATE_LIMITS[category]) return true;
  res.setHeader('Retry-After', String(Math.max(1, result[1])));
  throw new ServiceError('A few too many requests just now. Please give the birthday magic a little time and try again.', 429);
}
