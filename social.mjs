import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fontfile = fileURLToPath(new URL('./assets/NotoSans-Regular.ttf', import.meta.url));
const art = {
  strawberry: ['The Birthday Edit', '#fff6ed', '#402b35', '#ba647c', 'editorial'],
  sakura: ['A Day in Bloom', '#eff4e7', '#314938', '#77906a', 'botanical'],
  teddy: ['Memory Lane', '#f4e8d4', '#513c2c', '#b18461', 'scrapbook'],
  cloud: ['Big Day Poster', '#333b9c', '#fff7bd', '#d3ff68', 'poster'],
  bunny: ['A Letter for You', '#fcf1e5', '#663b46', '#bb7387', 'letter'],
  candy: ['The Birthday Club', '#faf0db', '#493439', '#ca5b66', 'club'],
  starry: ['Wish Upon Tonight', '#111b32', '#f1e6c8', '#d6bb79', 'stars']
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
async function textLayer(value, color, size, width, height) {
  return sharp({ text: { text: `<span foreground="${color}">${escape(value)}</span>`, font: `Noto Sans ${size}`, fontfile, width, height, rgba: true, align: 'left', wrap: 'word-char' } }).png().toBuffer();
}
async function photoBytes(value, { trustedBlobUrl, uploadDir }) {
  if (/^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value)) {
    const bytes = Buffer.from(value.slice(value.indexOf(',') + 1), 'base64');
    if (bytes.length <= 8 * 1024 * 1024) return bytes;
  } else if (/^\/uploads\/[a-f0-9-]+\.(?:webp|png|jpe?g)$/.test(value)) {
    return readFile(path.join(uploadDir, path.basename(value)));
  } else if (trustedBlobUrl(value)) {
    const response = await fetch(value, { redirect: 'error', signal: AbortSignal.timeout(4000) });
    if (!response.ok || !/^image\/(webp|png|jpeg)(?:;|$)/.test(response.headers.get('content-type') || '')) return null;
    const chunks = []; let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 2 * 1024 * 1024) { await response.body.cancel().catch(() => {}); return null; }
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
  return null;
}
function ornaments(style, accent) {
  const star = (x, y, r = 16) => `<path d="M${x} ${y-r} L${x+4} ${y-4} L${x+r} ${y} L${x+4} ${y+4} L${x} ${y+r} L${x-4} ${y+4} L${x-r} ${y} L${x-4} ${y-4}Z" fill="${accent}"/>`;
  if (style === 'stars') return `<path d="M820 180 L995 84 L1090 235 L870 410" fill="none" stroke="${accent}" opacity=".5"/>${Array.from({ length: 35 }, (_, i) => star(785 + (i * 137 % 350), 35 + (i * 73 % 555), i % 4 ? 3 : 9)).join('')}`;
  if (style === 'botanical') return `<g stroke="${accent}" fill="${accent}" opacity=".45"><path d="M1080 620 Q960 330 1115 50" fill="none" stroke-width="5"/>${[80,150,220,300,380,460,540].map((y,i) => `<ellipse cx="${i%2 ? 1070 : 1000}" cy="${y}" rx="43" ry="15" transform="rotate(${i%2 ? -30 : 30} ${i%2 ? 1070 : 1000} ${y})"/>`).join('')}</g>`;
  if (style === 'poster') return `${star(1050, 130, 115)}${star(90, 535, 55)}<circle cx="1100" cy="520" r="65" fill="none" stroke="${accent}" stroke-width="12"/>`;
  if (style === 'scrapbook') return `<path d="M55 100 L1110 70 L1140 540 L60 570Z" fill="#fffaf0"/><path d="M850 24 L1000 47 L978 120 L830 95Z" fill="${accent}" opacity=".4"/>${star(1100,530,35)}`;
  if (style === 'letter') return `<rect x="1030" y="66" width="95" height="110" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="5 5"/><circle cx="1060" cy="460" r="70" fill="none" stroke="${accent}" opacity=".4"/>${star(1080,120,25)}`;
  if (style === 'club') return `<g fill="${accent}" opacity=".75">${Array.from({length:12},(_,i)=>`<rect x="${i*100}" y="0" width="50" height="26"/><rect x="${i*100+50}" y="604" width="50" height="26"/>`).join('')}</g>${star(1060,110,50)}`;
  return `<path d="M65 68 H1135 M65 555 H1135" stroke="${accent}" stroke-width="2"/>${star(1080,125,42)}`;
}
export async function renderSocialImage(birthday, options) {
  const [theme, background, ink, accent, style] = art[birthday.themeId] || art.strawberry;
  let photo;
  try {
    const bytes = await photoBytes(birthday.photos?.[0]?.url || '', options);
    if (bytes) photo = await sharp(bytes, { limitInputPixels: 16_000_000 }).rotate().resize(310, 396, { fit: 'cover' }).png().toBuffer();
  } catch { /* a missing legacy photo must not break the birthday card */ }
  const width = photo ? 680 : 1000;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${background}"/>${ornaments(style,accent)}${photo ? `<rect x="797" y="122" width="342" height="438" rx="4" fill="#fffaf2"/>` : `<circle cx="1030" cy="385" r="115" fill="none" stroke="${accent}" opacity=".18" stroke-width="24"/>`}</svg>`;
  const layers = [
    { input: await textLayer(theme.toUpperCase(), accent, 22, width, 28), left: 76, top: 84 },
    { input: await textLayer('Happy birthday,', ink, 48, width, 62), left: 76, top: 156 },
    { input: await textLayer(birthday.recipient?.name || 'Birthday Star', ink, 80, width, 205), left: 76, top: 235 },
    { input: await textLayer('A little story, made for you.', accent, 25, width, 34), left: 76, top: 466 },
    { input: await textLayer('BIRTHDAY SPARK', accent, 14, 220, 20), left: 76, top: 566 }
  ];
  if (photo) layers.push({ input: photo, left: 813, top: 138 });
  return sharp(Buffer.from(svg)).composite(layers).png().toBuffer();
}
