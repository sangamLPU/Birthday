import { renderThemeExperience, renderThemeMiniature, themes } from './themes.js';
import { getActiveTrack, getMusicVolume, musicCatalog, playInteractionSound, setMusicVolume, startMusic, stopMusic, suspendMusicForHiddenPage, resumeMusicForVisiblePage } from './music.js';
const themeCategories = [...new Set(themes.flatMap(theme => theme.categories))];
const relationships = ['Friend', 'Best friend', 'Partner', 'Sibling', 'Parent', 'Cousin', 'Colleague', 'Other'];
const defaultForm = () => ({
  recipientName: '', nickname: '', relationship: 'Friend', age: '', birthdayDate: '', location: '', personality: '',
  photos: [], message: '', messageSource: 'template', intro: '', reasons: [], insideJoke: '', surprise: '', secret: '', closing: '', signature: '',
  storyOrder: ['letter', 'memories', 'reasons', 'inside-joke', 'surprise'],
  themeId: 'strawberry', musicTrack: 'birthday_classic', musicEnabled: true, musicAuto: true, animationIntensity: 'normal',
  showConfetti: true, showCake: true, showGallery: true, finaleStyle: 'theme', soundEffects: true, tone: 'Sweet', length: 'Medium', context: ''
});
let favoriteThemeIds = new Set();
try {
  const storedFavorites = JSON.parse(localStorage.getItem('birthday-spark-favorite-themes') || '[]');
  favoriteThemeIds = new Set(Array.isArray(storedFavorites) ? storedFavorites.filter(id => themes.some(theme => theme.id === id)) : []);
} catch { /* favorites are a convenience, not required to use the gallery */ }
let form = defaultForm();
let step = 0;
let editSlug = null;
let activeCategory = 'All';
let themeModalId = null;
let currentPage = null;
let renderSequence = 0;
let messageSuggestions = [];
let toastTimer;
let activeAudioTrack = null;
let previewMode = 'desktop';
let birthdayRevealObserver;
let memorySlideObserver;
let memoryFocusOrigin = null;
const experienceProgress = new WeakMap();

try {
  const saved = JSON.parse(localStorage.getItem('birthday-spark-draft') || 'null');
  if (saved && typeof saved === 'object') form = { ...defaultForm(), ...saved, photos: Array.isArray(saved.photos) ? saved.photos : [], reasons: Array.isArray(saved.reasons) ? saved.reasons : [], storyOrder: Array.isArray(saved.storyOrder) ? saved.storyOrder : defaultForm().storyOrder };
} catch { /* a broken local draft should never block page creation */ }
if (!themes.some(theme => theme.id === form.themeId)) form.themeId = 'strawberry';

const root = document.querySelector('#app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const themeById = id => themes.find(theme => theme.id === id) || themes[0];
const publicPath = slug => `/birthday/${encodeURIComponent(slug)}`;
const tokenKey = slug => `birthday-spark-edit-${slug}`;
const saveDraft = () => { try { localStorage.setItem('birthday-spark-draft', JSON.stringify(form)); } catch { /* private browsing can disable storage */ } };

function encodeCardData(card) {
  try {
    const compact = {
      r: card.recipient,
      s: card.story,
      t: card.themeId,
      m: card.music,
      c: card.customization,
      p: (card.photos || []).map(p => ({ u: p.url, c: p.caption, y: p.year, m: p.memory }))
    };
    const jsonStr = JSON.stringify(compact);
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

function decodeCardData(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const jsonStr = new TextDecoder().decode(bytes);
    const data = JSON.parse(jsonStr);
    return {
      recipient: data.r || {},
      story: data.s || {},
      themeId: data.t || 'strawberry',
      music: data.m || { enabled: false },
      customization: data.c || {},
      photos: (data.p || []).map(p => ({ url: p.u, caption: p.c || '', year: p.y || '', memory: p.m || '', alt: `${data.r?.name || 'Birthday'} memory` })),
      message: { text: data.s?.letter || '', type: 'custom' },
      slug: 'surprise'
    };
  } catch {
    return null;
  }
}

function setMeta(attribute, key, value) {
  let meta = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!meta) { meta = document.createElement('meta'); meta.setAttribute(attribute, key); document.head.appendChild(meta); }
  meta.setAttribute('content', value);
}

function updatePageMetadata(title, description) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('name', 'twitter:card', 'summary');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
}

function toast(message, error = false) {
  const host = document.querySelector('#toast-root');
  if (!host) return;
  host.innerHTML = `<div class="toast${error ? ' error' : ''}" role="status">${esc(message)}</div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { host.innerHTML = ''; }, 3400);
}

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...(options.body ? { 'content-type': 'application/json' } : {}), ...(options.headers || {}) } });
  let payload;
  try { payload = await response.json(); } catch { payload = {}; }
  if (!response.ok) throw new Error(payload.error || 'Something went wrong. Please try again.');
  return payload;
}

function brandMark() {
  return `<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z" fill="white"/><path d="M11.5 2.5c-.8 2.1 2.2 2.2 1.4 4.4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg></span>`;
}

function header(active = '') {
  return `<header class="site-header"><div class="shell nav-inner">
    <a class="brand" href="/" data-navigate>${brandMark()}<span>Birthday Spark</span></a>
    <nav class="nav-links" aria-label="Main navigation"><a href="/create" data-navigate>Build their story</a><a href="/themes" data-navigate>Explore experiences</a><a href="/#how-it-works" data-navigate>How it works</a></nav>
    <div class="nav-actions"><a class="btn btn-primary btn-small" href="/create" data-navigate>Build their story <span aria-hidden="true">↗</span></a></div>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="shell footer-inner"><a class="brand" href="/" data-navigate>${brandMark()}<span>Birthday Spark</span></a><span>Made for the people who make life sweeter ♡</span><div class="footer-links"><a href="/themes" data-navigate>Themes</a><a href="/create" data-navigate>Create</a></div></div></footer>`;
}

function themeTile(theme, options = {}) {
  const { compact = false, selected = false, cta = 'Use this theme', action = 'theme-use' } = options;
  const isFavorite = favoriteThemeIds.has(theme.id);
  return `<article class="theme-card${compact ? ' theme-choice' : ''}${selected ? ' selected' : ''}" ${compact ? `role="button" tabindex="0" aria-label="Select ${esc(theme.name)} theme" aria-pressed="${selected}" data-action="select-theme" data-theme-id="${theme.id}"` : ''}>
    ${renderThemeMiniature(theme.id)}
    <div class="theme-meta"><div class="theme-meta-row"><h3>${esc(theme.name)}</h3><span class="theme-category">${esc(theme.categories[0])}</span></div><p>${esc(theme.description)}</p>${compact ? '' : `<div class="theme-actions"><span class="theme-category">${theme.categories.map(esc).join(' · ')}</span><div class="theme-buttons"><button id="preview-theme-${theme.id}" class="btn btn-secondary btn-small" type="button" data-action="theme-preview" data-theme-id="${theme.id}">Preview experience</button><button class="theme-favorite${isFavorite ? ' active' : ''}" type="button" data-action="toggle-theme-favorite" data-theme-id="${theme.id}" aria-label="${isFavorite ? 'Remove' : 'Add'} ${esc(theme.name)} ${isFavorite ? 'from' : 'to'} favorites" aria-pressed="${isFavorite}">${isFavorite ? '♥' : '♡'}</button><a class="btn btn-primary btn-small" href="/create?theme=${theme.id}" data-navigate data-theme="${theme.id}" data-action="${action}">${esc(cta)} <span aria-hidden="true">→</span></a></div></div>`}</div>
  </article>`;
}

function birthdayThemePreview(theme) {
  return birthdayMarkup({
    recipient: { name: 'Maya', nickname: 'Maya', relationship: 'Friend', location: 'Somewhere sunny' },
    message: { text: 'You make the world a little softer and brighter just by being you. Wishing you a day that feels as special as you are. ♡', type: 'template' },
    story: { intro: 'A little story about the person who makes ordinary days better.', letter: 'You make the world a little softer and brighter just by being you. Wishing you a day that feels as special as you are. ♡', reasons: ['You make even the ordinary feel like a story.', 'You always know how to make me laugh.'], insideJoke: 'Remember the train platform and the runaway cake?', surprise: 'One more year of adventures. I’m already looking forward to it.', closing: 'Here’s to all the good things still finding their way to you.', signature: 'With all my heart, someone who loves you.', order: ['letter', 'memories', 'reasons', 'inside-joke', 'surprise'] },
    themeId: theme.id, photos: [], music: { trackId: theme.defaultMusic, enabled: false },
    customization: { showCake: true, showGallery: false, showConfetti: true, animationIntensity: 'normal', finaleStyle: 'theme', soundEffects: true }
  }, { preview: true });
}

function themePreviewModal() {
  if (!themeModalId) return '';
  const theme = themeById(themeModalId);
  return `<div class="theme-modal-backdrop" data-modal-backdrop><section class="theme-modal" role="dialog" aria-modal="true" aria-labelledby="theme-modal-title"><div class="theme-modal-head"><div><span class="eyebrow">The complete experience</span><h2 id="theme-modal-title">${esc(theme.name)}</h2></div><button class="theme-modal-close" type="button" data-action="close-theme-preview" aria-label="Close theme preview">×</button></div><div class="theme-modal-canvas">${birthdayThemePreview(theme)}</div><div class="theme-modal-actions"><p>${esc(theme.description)}</p><a class="btn btn-primary" href="/create?theme=${theme.id}" data-navigate data-theme="${theme.id}">Make a page in this style <span aria-hidden="true">→</span></a></div></section></div>`;
}

function closeThemePreview() {
  const previousTheme = themeModalId;
  themeModalId = null;
  root.innerHTML = themeGalleryPage();
  if (previousTheme) document.querySelector(`#preview-theme-${previousTheme}`)?.focus();
}

function birthdayMarkup(birthday, { preview = false } = {}) {
  const themeId = themes.some(theme => theme.id === birthday.themeId) ? birthday.themeId : 'strawberry';
  const trackId = birthday.music?.trackId || themeById(themeId).defaultMusic || 'birthday_classic';
  const music = { trackId, enabled: true };
  const track = musicCatalog.find(item => item.id === trackId) || musicCatalog[0];
  const settings = birthday.customization || { showConfetti: true, showCake: true, showGallery: true, soundEffects: true };
  const animationStyle = ['low', 'normal', 'high'].includes(settings.animationIntensity) ? settings.animationIntensity : 'normal';
  const experience = renderThemeExperience(themeId, { ...birthday, music }, { preview, track });
  const lightbox = `<div class="memory-lightbox" data-memory-lightbox hidden role="dialog" aria-modal="true" aria-label="A birthday memory"><button type="button" class="memory-lightbox-close" data-action="memory-close" aria-label="Close memory">×</button><button type="button" class="memory-lightbox-step previous" data-action="memory-modal-step" data-step="-1" aria-label="Previous memory">←</button><figure><img data-lightbox-image alt=""><figcaption><span data-lightbox-date></span><strong data-lightbox-caption></strong><span data-lightbox-note></span></figcaption></figure><button type="button" class="memory-lightbox-step next" data-action="memory-modal-step" data-step="1" aria-label="Next memory">→</button></div>`;
  return `<article class="birthday-page theme-${themeId} animation-${animationStyle}${preview ? ' preview' : ''}" data-theme-page="${themeId}" data-confetti="${settings.showConfetti !== false}" data-sound-effects="${settings.soundEffects !== false}" data-finale-style="${esc(settings.finaleStyle || 'cake')}">${experience}${lightbox}</article>`;
}

function armExperienceMusic(page) {
  if (!page || page.classList.contains('preview')) return;
  const onFirstInteraction = async () => {
    window.removeEventListener('pointerdown', onFirstInteraction, { capture: true });
    window.removeEventListener('keydown', onFirstInteraction, { capture: true });
    if (!getActiveTrack()) {
      await beginExperienceMusic(page);
    }
  };
  window.addEventListener('pointerdown', onFirstInteraction, { capture: true, once: true });
  window.addEventListener('keydown', onFirstInteraction, { capture: true, once: true });
}

function observeBirthdayReveals() {
  birthdayRevealObserver?.disconnect();
  memorySlideObserver?.disconnect();
  const targets = [...document.querySelectorAll('.birthday-page:not(.preview) .story-scene')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    targets.forEach(target => target.classList.add('revealed'));
    return;
  }
  birthdayRevealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      birthdayRevealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  targets.forEach(target => birthdayRevealObserver.observe(target));
  const slides = [...document.querySelectorAll('.birthday-page:not(.preview) .memory-slide')];
  if (slides.length) {
    memorySlideObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting && entry.intersectionRatio > .55) setMemoryIndex(entry.target.closest('.birthday-page'), Number(entry.target.dataset.memorySlide)); });
    }, { root: document.querySelector('.memory-track'), threshold: [.55, .8] });
    slides.forEach(slide => memorySlideObserver.observe(slide));
  }
}

function cakeMarkup() {
  return '<div class="birthday-cake" aria-label="Birthday cake with three candles" role="img"><span class="candle c1"></span><span class="candle c2"></span><span class="candle c3"></span><span class="cake-top"></span><span class="cake-body"></span><span class="cake-icing"></span></div>';
}

function homePage() {
  const featured = [themes[0], themes[2], themes[1], themes[6]];
  return `${header()}<main class="app-main">
    <section class="hero"><div class="shell hero-grid"><div class="hero-copy"><span class="eyebrow"><span aria-hidden="true">✦</span> A little story made for one person</span><h1>Give them a birthday story <span class="color-word">they can step into</span> 🎂</h1><p class="hero-lede">Gather your photos and the details only you know. We will turn them into a story they can open, explore and hear in their own time.</p><div class="hero-buttons"><a class="btn btn-primary" href="/create" data-navigate>Build their birthday story <span aria-hidden="true">→</span></a><a class="btn btn-secondary" href="/themes" data-navigate>Explore experiences</a></div><div class="social-proof"><div class="avatar-stack" aria-hidden="true"><span>♡</span><span>✿</span><span>✦</span><span>☺</span></div><span>A little gift they can open anywhere</span></div><div class="trust-line"><span>♡ No signup needed</span><span>✦ Made in minutes</span><span>↗ Easy to share</span></div></div>
      <div class="hero-art" aria-label="Example birthday website preview"><div class="hero-glow"></div><div class="preview-browser"><div class="browser-bar"><span></span><span></span><span></span><small class="browser-label">a birthday surprise, made with love</small></div><div class="hero-preview"><span class="preview-stars one">✦</span><span class="preview-stars two">♡</span><span class="preview-stars three">✧</span><span class="float-deco heart" aria-hidden="true">♡</span><span class="float-deco berry" aria-hidden="true">🍓</span><div><span class="preview-name-pill">a little surprise for you</span>${cakeMarkup()}<h2 class="hero-preview-title">Happy Birthday, Prachi!</h2><p class="hero-preview-note">Here’s to all the little things that make you, wonderfully you. You make every day brighter. ♡</p></div></div></div><div class="hero-note">A page full of their favorite things ✦</div></div>
    </div></section>
    <section class="home-section white" id="how-it-works"><div class="shell"><div class="section-head center"><span class="eyebrow">Four little steps</span><h2 class="section-title">A few memories become their story</h2><p class="section-copy">No design skills, no big setup. Just your favorite person and a few minutes.</p></div><div class="steps-grid"><article class="step-card"><div class="step-icon" aria-hidden="true">♡</div><h3>Start with the person</h3><p>Add their name, the things you call them, and photos with context.</p></article><article class="step-card"><div class="step-icon" aria-hidden="true">✿</div><h3>Write what you know</h3><p>Build a letter from your memories, shared jokes and little reasons.</p></article><article class="step-card"><div class="step-icon" aria-hidden="true">✦</div><h3>Choose their world</h3><p>Each theme brings its own opening, photo story, music and ending.</p></article><article class="step-card"><div class="step-icon" aria-hidden="true">↗</div><h3>Send them inside</h3><p>Share one link. They can tap, listen, swipe, read and explore at their pace.</p></article></div></div></section>
    <section class="home-section"><div class="shell"><div class="section-head center"><span class="eyebrow">A theme for every kind of lovely</span><h2 class="section-title">Pick a little world for their day</h2><p class="section-copy">Each theme gives their photos and your words a different kind of birthday magic.</p></div><div class="theme-grid">${featured.map(theme => themeTile(theme)).join('')}</div><p class="center" style="margin:27px 0 0"><a class="text-link" href="/themes" data-navigate>See all seven themes →</a></p></div></section>
    <section class="home-section white"><div class="shell story-grid"><div class="story-art"><article class="story-card"><div class="story-photo" aria-label="Photo illustration">🌷</div><h3>Dear Maya,</h3><p>Thank you for being the kind of person who makes ordinary days feel a little more golden...</p></article></div><div class="story-copy"><span class="eyebrow">A link that feels like a hug</span><h2>More than “happy birthday” in a text</h2><p>Make a little space for your favorite photos, the words you really mean, and a moment they can come back to. Then send it in a message, tuck it in a card, or share it at the party.</p><div class="share-chips"><span class="share-chip">WhatsApp</span><span class="share-chip">Telegram</span><span class="share-chip">Email</span><span class="share-chip">Copy a link</span><span class="share-chip">Any phone</span></div><a href="/create" class="text-link" data-navigate>Make yours in a few minutes →</a></div></div></section>
    <section class="final-cta"><div class="shell"><span class="eyebrow">A little love goes a long way</span><h2>Make someone smile today 💕</h2><p>The best birthday gifts sound a little like you.</p><a class="btn btn-primary" href="/create" data-navigate>Create their birthday page <span aria-hidden="true">→</span></a></div></section>
  </main>${footer()}`;
}

function themeGalleryPage() {
  const categories = ['All', ...themeCategories, 'Favorites'];
  const visible = activeCategory === 'All' ? themes : activeCategory === 'Favorites' ? themes.filter(theme => favoriteThemeIds.has(theme.id)) : themes.filter(theme => theme.categories.includes(activeCategory));
  const empty = activeCategory === 'Favorites' && !visible.length ? `<div class="theme-empty"><span aria-hidden="true">♡</span><h2>Your saved little worlds will show up here</h2><p>Tap the heart on any theme to keep it close.</p></div>` : '';
  return `${header()}<main class="app-main gallery-page"><div class="shell"><div class="gallery-intro"><div><span class="eyebrow">SEVEN LITTLE WORLDS · SEVEN DIFFERENT FEELINGS</span><h1 class="section-title">Find their kind of birthday magic</h1><p class="section-copy">Browse the art direction first. Every preview is the real page, with its own layout, type, and reveal.</p></div><div class="gallery-count"><strong>${visible.length.toString().padStart(2, '0')}</strong><span>${activeCategory === 'Favorites' ? 'SAVED WORLDS' : 'WAYS TO CELEBRATE'}</span></div></div><div class="gallery-filter" role="group" aria-label="Filter themes by style"><span class="gallery-filter-label">FILTER BY FEELING</span>${categories.map(category => `<button class="chip${category === activeCategory ? ' active' : ''}" type="button" data-action="filter-themes" data-category="${esc(category)}" aria-pressed="${category === activeCategory}">${category === 'Favorites' ? `♡ Favorites${favoriteThemeIds.size ? ` (${favoriteThemeIds.size})` : ''}` : esc(category)}</button>`).join('')}</div>${empty}<div class="gallery-grid">${visible.map(theme => themeTile(theme)).join('')}</div><div class="gallery-selection-note"><span class="gallery-note-mark">✳</span><p><strong>Found the one?</strong> Choose a theme to carry the same layout and feeling through to the page you share.</p><a class="btn btn-primary" href="/create" data-navigate>Start making a page <span aria-hidden="true">→</span></a></div></div></main>${footer()}${themePreviewModal()}`;
}

const stepsMeta = [
  { title: 'Who is this story for?', copy: 'A few details help the experience sound like it belongs to this one person.' },
  { title: 'Choose the moments to keep', copy: 'Add up to five photos, then give the ones you love a date or a little memory.' },
  { title: 'Write what only you can say', copy: 'Start with your own words. You can add reasons, an inside joke, or a private note too.' },
  { title: 'Choose their little world', copy: 'Each theme changes how the story opens, how memories appear, and what happens at the end.' },
  { title: 'Set the mood', copy: 'Choose an original score, arrange the story, and decide how it should end.' }
];

const sampleMessages = {
  Sweet: name => [`Happy birthday, ${name}! I hope your day is full of tiny joys, your favorite people, and the biggest slice of cake. You make life sweeter just by being you. ♡`, `To ${name}, wishing you a day as lovely as the way you make everyone around you feel. So glad you’re in my life. Happy birthday! ✨`],
  Funny: name => [`Happy birthday, ${name}! You’re not getting older, you’re just becoming a limited-edition classic. Please accept this tiny website as proof that I remembered before the cake was gone. 🎂`, `Another year wiser, funnier, and still somehow the person who gets to choose the playlist. Happy birthday, ${name}! Today the snacks are all yours. ♡`],
  Romantic: name => [`Happy birthday to my favorite person, ${name}. Every ordinary day feels a little more magical with you in it. I hope today gives even a little of that love back to you. ♡`, `To ${name}, my favorite hello and my safest place. Here’s to celebrating you today and loving you in all the little moments after. Happy birthday. ✨`],
  Emotional: name => [`${name}, I hope you know how much light you bring into the lives around you. I’m grateful for every laugh, every honest talk, and every ordinary day made better by you. Happy birthday. ♡`, `Happy birthday, ${name}. Thank you for being exactly who you are. I hope this next year brings you the gentleness, joy, and love you so freely give to everyone else.`],
  Wholesome: name => [`Dear ${name}, I hope your birthday is a soft, sunny reminder that you are loved, appreciated, and wonderfully easy to celebrate. Here’s to a cozy year ahead. 🌷`, `Wishing you warm hugs, good snacks, happy surprises, and all the little things that make a day feel just right. You deserve all of it, ${name}. Happy birthday!`],
  'Best Friend': name => [`Happy birthday, ${name}! Life is funnier, kinder, and infinitely better with you as my best friend. Today I hope everything feels as wonderful as you make people feel. ♡`, `To my built-in adventure buddy, ${name}: thanks for showing up, laughing too loudly, and making the ordinary feel like a story. I’m lucky to call you my best friend. ✨`],
  Family: name => [`Happy birthday, ${name}! Family means a lot of things, but getting to share life and all these memories with you is one of my favorites. Sending you a big birthday hug. ♡`, `To ${name}, wishing you a birthday full of home, laughter, and people who love you exactly as you are. So grateful we get to call each other family. 🌷`],
  'Short & Cute': name => [`Happy birthday, ${name}! You make life a little brighter. Hope today brings cake, cuddles, and all your favorite things. ♡`, `A big birthday hug for ${name}! You’re loved more than all the sprinkles on the cake. ✨`],
  Heartfelt: name => [`${name}, I hope this year meets you with the same tenderness and kindness you give to everyone around you. Thank you for being someone I can always count on. Happy birthday, with all my heart. ♡`, `Happy birthday, ${name}. Wherever this next year takes you, I hope you always remember how deeply you are loved and how much better the world is with you here.`]
};
const toneOptions = ['Sweet', 'Funny', 'Romantic', 'Emotional', 'Wholesome', 'Best Friend', 'Family', 'Short & Cute', 'Heartfelt'];

function makeMessage() {
  const name = form.nickname.trim() || form.recipientName.trim() || 'you';
  const messageFactory = sampleMessages[form.tone] || sampleMessages.Sweet;
  const list = messageFactory(name);
  let message = list[form.length === 'Short' ? 0 : 1];
  if (form.length === 'Short' || form.tone === 'Short & Cute') message = `Happy birthday, ${name}! You make life brighter just by being you. I hope your day is full of love, cake, and all your favorite things. ♡`;
  const relationshipNote = {
    Friend: 'I’m so glad life gave me a friend like you.', 'Best friend': 'I’m lucky to call you my best friend.',
    Partner: 'I feel lucky to share all the little moments of life with you.', Sibling: 'Growing up alongside you gave me some of my favorite memories.',
    Parent: 'Thank you for all the ways you have always shown up for me.', Cousin: 'I’m grateful for all the family memories we share.',
    Colleague: 'It’s a joy to work alongside someone as thoughtful as you.', Other: 'I’m so glad our paths crossed.'
  }[form.relationship];
  if (relationshipNote && form.tone !== 'Best Friend' && form.length !== 'Short') message += `\n\n${relationshipNote}`;
  if (form.length === 'Long') message += `\n\n${form.context.trim() ? `I keep thinking about ${form.context.trim()}.` : 'I’m so grateful for all the moments we’ve shared, and I can’t wait for the memories still ahead.'} I hope this new year brings you more reasons to laugh, more people who show up for you, and plenty of ordinary days that feel like a gift.`;
  else if (form.context.trim()) message += `\n\nI’ll always smile when I think about ${form.context.trim()}.`;
  return message;
}

function wizardStepContent() {
  if (step === 0) return `<div class="field-stack"><div class="recipient-note"><strong>Start with the person, not the template.</strong><br>A nickname, birthday detail or familiar place can make the opening feel unmistakably theirs.</div><div class="field"><label for="recipient-name">Their name</label><input class="input" id="recipient-name" data-field="recipientName" maxlength="80" autocomplete="off" placeholder="e.g. Prachi" value="${esc(form.recipientName)}"><small>This is how their name will appear on the page.</small></div><div class="field-row"><div class="field"><label for="recipient-nickname">What you call them</label><input class="input" id="recipient-nickname" data-field="nickname" maxlength="48" placeholder="A nickname (optional)" value="${esc(form.nickname)}"></div><div class="field"><label for="relationship">They’re my…</label><select class="select" id="relationship" data-field="relationship">${relationships.map(item => `<option${form.relationship === item ? ' selected' : ''}>${esc(item)}</option>`).join('')}</select></div></div><details class="customize-details"><summary>A few details about them</summary><div class="customize-options"><div class="field-row"><div class="field"><label for="recipient-age">Age (optional)</label><input class="input" id="recipient-age" type="number" min="1" max="130" data-field="age" value="${esc(form.age)}" placeholder="e.g. 30"></div><div class="field"><label for="recipient-birthday">Birthday date</label><input class="input" id="recipient-birthday" type="date" data-field="birthdayDate" value="${esc(form.birthdayDate)}"></div></div><div class="field"><label for="recipient-place">A place that feels like them</label><input class="input" id="recipient-place" class="input" data-field="location" maxlength="100" placeholder="Their city, a favorite place…" value="${esc(form.location)}"></div><div class="field"><label for="recipient-personality">Their kind of energy</label><input class="input" id="recipient-personality" data-field="personality" maxlength="100" placeholder="e.g. quiet mischief, big-hearted, always dancing" value="${esc(form.personality)}"></div></div></details><p class="hint">These extra details are optional. The page is only shared with people who have its link.</p></div>`;
  if (step === 1) return `<div><label class="upload-zone" id="upload-zone" for="photo-input"><input class="sr-only" id="photo-input" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="Choose birthday photos"><span><span class="upload-icon" aria-hidden="true">＋</span><strong>Drop photos here, or browse</strong><p>JPG, PNG or WebP · up to 5 photos · resized before upload</p></span></label><p class="photo-status" id="photo-status" aria-live="polite">${form.photos.length ? `${form.photos.length} photo${form.photos.length === 1 ? '' : 's'} ready` : 'No photos yet — your story can be lovely without photos too.'}</p><div class="memory-editor-list">${form.photos.map((photo, index) => `<article class="memory-editor"><div class="memory-editor-photo"><img src="${esc(photo.url)}" alt="${esc(photo.alt || `Selected birthday photo ${index + 1}`)}" loading="lazy">${index === 0 ? '<span class="photo-primary-label">Opening photo</span>' : `<button class="photo-primary-button" type="button" data-action="make-cover" data-index="${index}">Make opening photo</button>`}<button class="photo-remove" type="button" data-action="remove-photo" data-index="${index}" aria-label="Remove photo ${index + 1}">×</button></div><details class="memory-caption-editor"><summary>Give this moment a little context</summary><div class="customize-options"><div class="field"><label>Caption</label><input class="input" data-photo-field="caption" data-photo-index="${index}" maxlength="100" placeholder="What was happening?" value="${esc(photo.caption || '')}"></div><div class="field"><label>Date or year</label><input class="input" data-photo-field="year" data-photo-index="${index}" maxlength="24" placeholder="e.g. Summer 2024" value="${esc(photo.year || '')}"></div><div class="field"><label>The bit you remember</label><textarea class="textarea" data-photo-field="memory" data-photo-index="${index}" maxlength="360" placeholder="A detail you would tell them when this photo comes up…">${esc(photo.memory || '')}</textarea></div></div></details></article>`).join('')}</div><div class="recipient-note" style="margin-top:18px"><strong>Photos become part of the story.</strong><br>They turn into a timeline, album or film strip depending on the theme you choose.</div></div>`;
  if (step === 2) {
    const name = form.nickname.trim() || form.recipientName.trim() || 'your favorite person';
    messageSuggestions = (sampleMessages[form.tone] || sampleMessages.Sweet)(name);
    if (form.length === 'Short') messageSuggestions = messageSuggestions.map(() => makeMessage());
    return `<div class="story-editor"><div class="field"><label for="story-intro">An opening line (optional)</label><input id="story-intro" class="input" maxlength="220" data-field="intro" placeholder="The thing you always want them to remember…" value="${esc(form.intro)}"><small>A sentence in your voice to set up the story.</small></div><div class="message-settings"><div class="field"><label for="tone-select">A little mood</label><select id="tone-select" class="select" data-field="tone">${toneOptions.map(tone => `<option${form.tone === tone ? ' selected' : ''}>${esc(tone)}</option>`).join('')}</select></div><div class="field"><label for="length-select">Message length</label><select id="length-select" class="select" data-field="length">${['Short', 'Medium', 'Long'].map(length => `<option${form.length === length ? ' selected' : ''}>${length}</option>`).join('')}</select></div></div><div class="message-topline"><h3>A starting point, if you need one</h3><button class="btn btn-quiet btn-small" type="button" data-action="generate-message">✦ Give me a starting point</button></div>${messageSuggestions.map((text, index) => `<button type="button" class="message-option${form.message === text ? ' selected' : ''}" data-action="choose-message" data-message-index="${index}"><strong>${index === 0 ? `${form.tone} & lovely` : 'Another way to say it'}</strong><span>${esc(text)}</span></button>`).join('')}<div class="field" style="margin-top:16px"><label for="birthday-message">Your letter</label><textarea id="birthday-message" class="textarea" maxlength="3600" data-field="message" placeholder="Dear ${esc(form.nickname || form.recipientName || 'you')},\n\nI hope you know how much…">${esc(form.message || '')}</textarea><small><span id="message-count">${String(form.message || '').length}</span> / 3,600 characters · use line breaks to give it room</small></div><details class="customize-details story-details"><summary>Add the details only you know</summary><div class="customize-options"><div class="field"><label>Reasons or wishes (up to six)</label><div class="reason-editor-list">${form.reasons.map((reason, index) => `<div class="reason-editor-row"><input class="input" data-reason-index="${index}" maxlength="140" aria-label="Reason or wish ${index + 1}" placeholder="One thing you appreciate about them…" value="${esc(reason)}"><button class="photo-remove" type="button" data-action="remove-reason" data-index="${index}" aria-label="Remove reason ${index + 1}">×</button></div>`).join('')}</div>${form.reasons.length < 6 ? '<button class="btn btn-secondary btn-small" type="button" data-action="add-reason">Add a reason or wish</button>' : '<small>You have six. That is a lovely little list.</small>'}</div><div class="field"><label for="memory-context">A memory to weave into the letter</label><input class="input" id="memory-context" data-field="context" maxlength="180" placeholder="e.g. that rainy road trip where we got lost" value="${esc(form.context)}"></div><div class="field"><label for="inside-joke">A shared joke or phrase</label><input class="input" id="inside-joke" data-field="insideJoke" maxlength="220" placeholder="A line that only the two of you understand" value="${esc(form.insideJoke)}"></div><div class="field"><label for="surprise-message">A small surprise to unwrap</label><textarea class="textarea" id="surprise-message" data-field="surprise" maxlength="500" placeholder="A promise, plan, ticket, or one more thing you want to tell them…">${esc(form.surprise)}</textarea></div><div class="field"><label for="secret-message">An optional hidden note</label><textarea class="textarea" id="secret-message" data-field="secret" maxlength="500" placeholder="A little easter egg they can find if they look…">${esc(form.secret)}</textarea></div><div class="field-row"><div class="field"><label for="closing-note">How you want to leave them</label><input class="input" id="closing-note" data-field="closing" maxlength="500" placeholder="A final wish in your own words" value="${esc(form.closing)}"></div><div class="field"><label for="signature">Sign it from you</label><input class="input" id="signature" data-field="signature" maxlength="100" placeholder="Your name or how they know you" value="${esc(form.signature)}"></div></div></div></details></div>`;
  }
  if (step === 3) {
    const categories = ['All', ...themeCategories];
    const category = categories.includes(activeCategory) ? activeCategory : 'All';
    const available = category === 'All' ? themes : themes.filter(theme => theme.categories.includes(category));
    const pickedTheme = themeById(form.themeId);
    return `<div><div class="chosen-experience"><span>YOUR CURRENT WORLD</span><strong>${esc(pickedTheme.name)}</strong><p>${esc(pickedTheme.description)} The opening: ${esc(pickedTheme.interaction.label.toLowerCase())}.</p></div><div class="chip-row" role="group" aria-label="Filter themes by style" style="margin-bottom:13px">${categories.map(item => `<button type="button" class="chip${category === item ? ' active' : ''}" data-action="filter-generator-themes" data-category="${esc(item)}" aria-pressed="${category === item}">${esc(item)}</button>`).join('')}</div><div class="theme-choice-grid">${available.map(theme => themeTile(theme, { compact: true, selected: form.themeId === theme.id })).join('')}</div></div>`;
  }
  const selectableTracks = musicCatalog;
  const track = musicCatalog.find(item => item.id === form.musicTrack) || musicCatalog.find(item => item.id === themeById(form.themeId).defaultMusic);
  const sectionTitles = { letter: 'Your letter', memories: 'Photo memories', reasons: 'Reasons and wishes', 'inside-joke': 'Inside joke', surprise: 'Gift reveal' };
  const ordered = [...form.storyOrder];
  return `<div class="finish-editor"><div class="field"><label for="music-mood">A soundtrack mood</label><select id="music-mood" class="select" data-field="musicTrack">${selectableTracks.map(item => `<option value="${item.id}"${form.musicTrack === item.id ? ' selected' : ''}>${esc(item.name)} — ${esc(item.kind)}</option>`).join('')}</select><small>Each score has its own chords, tempo, bass, melody and instruments. It is composed in the browser and only starts after a tap.</small></div><div class="score-preview"><span class="score-glyph" aria-hidden="true">♫</span><div><strong>${esc(track.name)}</strong><small>${esc(track.kind)}</small></div><div class="score-meter" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="music-preview" type="button" data-action="preview-track" data-track-id="${track.id}" aria-pressed="${activeAudioTrack === track.id}">${activeAudioTrack === track.id ? 'Pause' : 'Listen'}</button></div><label class="check-row music-optin"><input type="checkbox" data-field="musicEnabled"${form.musicEnabled ? ' checked' : ''}> Include this score on their page</label><details class="customize-details story-path-editor"><summary>Arrange the story and ending</summary><div class="customize-options"><p class="hint">Use the arrows to change the order. Empty scenes are skipped automatically.</p><div class="story-order-list">${ordered.map((section, index) => `<div class="story-order-row"><label><input type="checkbox" data-story-section="${section}" checked> ${esc(sectionTitles[section] || section)}</label><div><button type="button" data-action="story-order" data-index="${index}" data-direction="-1" aria-label="Move ${esc(sectionTitles[section])} up"${index === 0 ? ' disabled' : ''}>↑</button><button type="button" data-action="story-order" data-index="${index}" data-direction="1" aria-label="Move ${esc(sectionTitles[section])} down"${index === ordered.length - 1 ? ' disabled' : ''}>↓</button></div></div>`).join('')}${Object.keys(sectionTitles).filter(section => !ordered.includes(section)).map(section => `<div class="story-order-row"><label><input type="checkbox" data-story-section="${section}"> ${esc(sectionTitles[section])}</label><span class="story-order-spacer">Add to story</span></div>`).join('')}</div><div class="field"><label for="finale-style">The last scene</label><select id="finale-style" class="select" data-field="finaleStyle"><option value="theme"${form.finaleStyle === 'theme' ? ' selected' : ''}>A finale that belongs to this theme</option><option value="cake"${form.finaleStyle === 'cake' ? ' selected' : ''}>Classic candles and a wish</option><option value="quiet"${form.finaleStyle === 'quiet' ? ' selected' : ''}>A quiet sign-off</option></select></div>${form.finaleStyle === 'cake' ? '<label class="check-row"><input type="checkbox" data-field="showCake" checked> Include the candle cake</label>' : `<label class="check-row"><input type="checkbox" data-field="showCake"${form.showCake ? ' checked' : ''}> Keep the candle cake available in the classic ending</label>`}<div class="field"><label for="animation-intensity">Motion</label><select id="animation-intensity" class="select" data-field="animationIntensity"><option value="low"${form.animationIntensity === 'low' ? ' selected' : ''}>Soft and subtle</option><option value="normal"${form.animationIntensity === 'normal' ? ' selected' : ''}>A little movement</option><option value="high"${form.animationIntensity === 'high' ? ' selected' : ''}>Party time</option></select></div><label class="check-row"><input type="checkbox" data-field="showConfetti"${form.showConfetti ? ' checked' : ''}> A little confetti at the ending</label><label class="check-row"><input type="checkbox" data-field="soundEffects"${form.soundEffects ? ' checked' : ''}> Soft interaction sounds</label><label class="check-row"><input type="checkbox" data-field="showGallery"${form.showGallery ? ' checked' : ''}> Include photo memories</label></div></details><div class="recipient-note" style="margin-top:19px"><strong>It is still your story.</strong><br>The recipient can read at their own pace, swipe through memories, and skip any interaction they do not feel like trying.</div></div>`;
}

function birthdayDraft() {
  return {
    recipient: { name: form.recipientName.trim(), nickname: form.nickname.trim(), relationship: form.relationship, age: form.age, birthdayDate: form.birthdayDate, location: form.location.trim(), personality: form.personality.trim() },
    message: { text: form.message.trim(), type: form.messageSource },
    story: { intro: form.intro.trim(), letter: form.message.trim(), reasons: form.reasons.map(reason => reason.trim()).filter(Boolean), insideJoke: form.insideJoke.trim(), surprise: form.surprise.trim(), secret: form.secret.trim(), closing: form.closing.trim(), signature: form.signature.trim(), order: [...form.storyOrder] },
    themeId: form.themeId,
    photos: form.photos.map(photo => ({ url: photo.url, alt: photo.alt || `A birthday memory of ${form.recipientName}`, caption: photo.caption || '', year: photo.year || '', memory: photo.memory || '' })),
    music: { trackId: form.musicTrack || 'birthday_classic', enabled: form.musicEnabled !== false },
    customization: { animationIntensity: form.animationIntensity, showConfetti: form.showConfetti, showCake: form.showCake, showGallery: form.showGallery, finaleStyle: form.finaleStyle, soundEffects: form.soundEffects }
  };
}

function updateLivePreview() {
  if (!location.pathname.startsWith('/create') && !location.pathname.startsWith('/edit/')) return;
  const host = document.querySelector('#live-preview');
  if (!host) return;
  const data = birthdayDraft();
  host.innerHTML = birthdayMarkup(data, { preview: true });
  host.className = `preview-frame ${previewMode === 'mobile' ? 'mobile' : ''}`;
}

function wizardPage() {
  const meta = stepsMeta[step];
  const actionError = window.generatorError ? `<p class="inline-error" role="alert">${esc(window.generatorError)}</p>` : '';
  return `${header()}<main class="generator-shell"><div class="shell"><div class="page-top" style="padding:0 0 16px"><a class="breadcrumb" href="/" data-navigate>← Back to Birthday Spark</a></div><div class="generator-heading"><div><h1>${editSlug ? 'Make a little update' : 'Let’s make their birthday page'}</h1><p>A few sweet details, then it’s ready to share. ♡</p></div><div class="generator-progress" aria-label="Step ${step + 1} of 5">${stepsMeta.map((_, index) => `<span class="progress-dot${index <= step ? ' active' : ''}" aria-hidden="true"></span>`).join('')}<span class="progress-label">${step + 1} of 5</span></div></div><div class="generator-layout"><section class="editor-panel" aria-labelledby="step-title"><h2 class="editor-step-heading" id="step-title" tabindex="-1">${meta.title}</h2><p class="editor-step-copy">${meta.copy}</p><div class="step-content">${wizardStepContent()}${actionError}</div><div class="editor-actions"><button class="btn btn-secondary" type="button" data-action="previous-step"${step === 0 ? ' disabled' : ''}>← Back</button><div class="right-actions">${step < 4 ? `<button class="btn btn-primary" type="button" data-action="next-step">Next step <span aria-hidden="true">→</span></button>` : `<button class="btn btn-primary" type="button" data-action="generate-page">${editSlug ? 'Save my changes' : 'Create their page'} <span aria-hidden="true">♡</span></button>`}</div></div></section><aside class="preview-panel" aria-label="Live birthday page preview"><div class="preview-head"><div><h2>A little peek at their page</h2><p>Your changes show up here right away</p></div><div class="preview-switch" role="group" aria-label="Preview size"><button type="button" data-action="preview-mode" data-mode="desktop" class="${previewMode === 'desktop' ? 'active' : ''}" aria-pressed="${previewMode === 'desktop'}">Desktop</button><button type="button" data-action="preview-mode" data-mode="mobile" class="${previewMode === 'mobile' ? 'active' : ''}" aria-pressed="${previewMode === 'mobile'}">Mobile</button></div></div><div id="live-preview" class="preview-frame ${previewMode === 'mobile' ? 'mobile' : ''}">${birthdayMarkup(birthdayDraft(), { preview: true })}</div><p class="preview-caption">A real page preview — not just a picture ♡</p></aside></div></div></main>${footer()}`;
}

function successPage(slug) {
  const birthday = currentPage?.slug === slug ? currentPage : null;
  if (!birthday) return `${header()}<main class="error-state"><div><div class="success-icon">🎁</div><h1>Your little link isn’t here yet</h1><p>Build their birthday story first, then we’ll bring you back to its share card.</p><a class="btn btn-primary" href="/create" data-navigate>Make a birthday page</a></div></main>${footer()}`;
  const link = `${location.origin}${publicPath(slug)}`;
  return `${header()}<main class="success-wrap"><section class="success-card"><div class="success-icon" aria-hidden="true">🎉</div><span class="eyebrow">All wrapped up</span><h1>Your birthday surprise is ready!</h1><p>One lovely little page for ${esc(birthday.recipient.name)}. Send this link wherever they are, and let them open their surprise.</p><div class="share-url"><input id="share-link" aria-label="Birthday page link" readonly value="${esc(link)}"><button class="btn btn-primary btn-small" type="button" data-action="copy-link">Copy link</button></div><div class="share-actions"><button class="btn btn-secondary btn-small" type="button" data-action="share-native">Share…</button><a class="btn btn-secondary btn-small" target="_blank" rel="noreferrer" href="https://wa.me/?text=${encodeURIComponent(`A little birthday surprise for ${birthday.recipient.name}: ${link}`)}">WhatsApp ↗</a><a class="btn btn-secondary btn-small" target="_blank" rel="noreferrer" href="https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`A birthday surprise for ${birthday.recipient.name}`)}">Telegram ↗</a><a class="btn btn-secondary btn-small" href="mailto:?subject=${encodeURIComponent(`A birthday surprise for ${birthday.recipient.name}`)}&body=${encodeURIComponent(`A little birthday surprise for you: ${link}`)}">Email ↗</a><a class="btn btn-secondary btn-small" target="_blank" rel="noreferrer" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}">Facebook ↗</a></div><div class="success-preview">${birthdayMarkup(birthday, { preview: true })}</div><div class="success-bottom"><a class="text-link" href="${publicPath(slug)}" data-navigate>Open their birthday page →</a><a class="text-link" href="/edit/${encodeURIComponent(slug)}" data-navigate>Edit this page</a><button class="text-link new-page-link" type="button" data-action="new-page">Make another page</button></div></section></main>${footer()}`;
}

function errorPage(title = 'This birthday surprise couldn’t be found 🎈', description = 'That little link may be old or mistyped. Ask the person who made it for a fresh one.') {
  return `${header()}<main class="error-state"><div><div class="success-icon" aria-hidden="true">🎈</div><h1>${esc(title)}</h1><p>${esc(description)}</p><a class="btn btn-primary" href="/" data-navigate>Back to Birthday Spark</a></div></main>${footer()}`;
}

async function render() {
  const sequence = ++renderSequence;
  const path = decodeURIComponent(location.pathname);
  window.generatorError = '';
  if (path === '/create' || path === '/edit' || path.startsWith('/edit/')) {
    updatePageMetadata('Build their birthday story — Birthday Spark', 'Make a beautiful personal birthday website in a few minutes.');
    if (path.startsWith('/edit/')) {
      const slug = path.slice('/edit/'.length);
      const token = localStorage.getItem(tokenKey(slug));
      if (!token) { updatePageMetadata('Private edit link — Birthday Spark', 'Edit links stay with the browser that created the page.'); root.innerHTML = errorPage('This private edit link isn’t on this device', 'For safety, birthday pages can only be edited on the device that created them. You can still open and share the public page.'); return; }
      try {
        const response = await api(`/api/birthdays/${encodeURIComponent(slug)}/edit`, { headers: { 'x-edit-token': token } });
        if (sequence !== renderSequence) return;
        editSlug = slug;
        form = formFromBirthday(response.birthday);
      } catch (error) { if (sequence === renderSequence) { updatePageMetadata('Page edit unavailable — Birthday Spark', 'This birthday page cannot be edited on this device.'); root.innerHTML = errorPage('This page is ready, but it can’t be edited here', error.message); } return; }
    } else {
      editSlug = null;
      const selectedTheme = new URLSearchParams(location.search).get('theme');
      if (selectedTheme && themes.some(theme => theme.id === selectedTheme)) form.themeId = selectedTheme;
    }
    root.innerHTML = wizardPage();
    updateLivePreview();
    return;
  }
  if (path === '/themes') { updatePageMetadata('Birthday themes — Birthday Spark', 'Find a sweet birthday theme for every kind of lovely.'); root.innerHTML = themeGalleryPage(); return; }
  if (path.startsWith('/birthday/')) {
    const slug = path.slice('/birthday/'.length);
    let cardFromHash = null;
    try {
      const hashMatch = location.hash.match(/[#&]card=([A-Za-z0-9_-]+)/);
      if (hashMatch) cardFromHash = decodeCardData(hashMatch[1]);
      if (!cardFromHash) {
        const stored = localStorage.getItem(`birthday-spark-card-${slug}`);
        if (stored) cardFromHash = JSON.parse(stored);
      }
    } catch { /* proceed */ }

    if (cardFromHash) {
      currentPage = cardFromHash;
      const title = `Happy Birthday ${currentPage.recipient?.name || 'Friend'} 🎂`;
      const description = `Someone made ${currentPage.recipient?.name || 'someone'} a special birthday surprise.`;
      updatePageMetadata(title, description);
      root.innerHTML = birthdayMarkup(currentPage);
      updateMusicControls({ detail: { trackId: getActiveTrack(), volume: getMusicVolume() } });
      observeBirthdayReveals();
      armExperienceMusic(root.querySelector('.birthday-page'));
    } else {
      root.innerHTML = `<main class="error-state"><div><div class="success-icon">✦</div><h1>Opening your birthday surprise…</h1><p>A little love note is on its way.</p></div></main>`;
    }

    try {
      const response = await api(`/api/birthdays/${encodeURIComponent(slug)}`);
      if (sequence !== renderSequence) return;
      currentPage = response.birthday;
      try { localStorage.setItem(`birthday-spark-card-${slug}`, JSON.stringify(currentPage)); } catch {}
      const title = `Happy Birthday ${currentPage.recipient.name} 🎂`;
      const description = `Someone made ${currentPage.recipient.name} a special birthday surprise.`;
      updatePageMetadata(title, description);
      root.innerHTML = birthdayMarkup(currentPage);
      updateMusicControls({ detail: { trackId: getActiveTrack(), volume: getMusicVolume() } });
      observeBirthdayReveals();
      armExperienceMusic(root.querySelector('.birthday-page'));
    } catch (error) {
      if (sequence === renderSequence) {
        if (cardFromHash) return;
        updatePageMetadata('Birthday surprise not found — Birthday Spark', 'This birthday surprise could not be found.');
        root.innerHTML = errorPage('This birthday surprise couldn’t be found 🎈', error.message);
      }
    }
    return;
  }
  if (path.startsWith('/ready/')) { updatePageMetadata('Your birthday surprise is ready — Birthday Spark', 'Your special birthday page is ready to share.'); root.innerHTML = successPage(path.slice('/ready/'.length)); return; }
  editSlug = null;
  updatePageMetadata('Birthday Spark — make their day magic', 'Turn photos, memories, music, and birthday wishes into a beautiful personalized webpage in minutes.');
  root.innerHTML = homePage();
}

function formFromBirthday(birthday) {
  const story = birthday.story || {};
  return {
    ...defaultForm(), recipientName: birthday.recipient?.name || '', nickname: birthday.recipient?.nickname || '', relationship: birthday.recipient?.relationship || 'Friend',
    age: birthday.recipient?.age ?? '', birthdayDate: birthday.recipient?.birthdayDate || '', location: birthday.recipient?.location || '', personality: birthday.recipient?.personality || '',
    photos: (birthday.photos || []).map(photo => ({ ...photo, caption: photo.caption || '', year: photo.year || '', memory: photo.memory || '' })),
    message: story.letter || birthday.message?.text || '', messageSource: birthday.message?.type || 'custom', themeId: birthday.themeId || 'strawberry',
    intro: story.intro || '', reasons: Array.isArray(story.reasons) ? [...story.reasons] : [], insideJoke: story.insideJoke || '', surprise: story.surprise || '', secret: story.secret || '', closing: story.closing || '', signature: story.signature || '',
    storyOrder: Array.isArray(story.order) ? [...story.order] : ['letter', 'memories', 'reasons', 'inside-joke', 'surprise'],
    musicTrack: birthday.music?.trackId || themeById(birthday.themeId).defaultMusic, musicEnabled: !!birthday.music?.enabled, musicAuto: false,
    animationIntensity: birthday.customization?.animationIntensity || 'normal', showConfetti: birthday.customization?.showConfetti !== false,
    showCake: birthday.customization?.showCake !== false, showGallery: birthday.customization?.showGallery !== false,
    finaleStyle: birthday.customization?.finaleStyle || (birthday.story ? 'theme' : birthday.customization?.showCake !== false ? 'cake' : 'quiet'),
    soundEffects: birthday.customization?.soundEffects !== false
  };
}

function go(path) {
  if (getActiveTrack()) stopMusic();
  themeModalId = null;
  const hash = new URL(path, location.origin).hash;
  if (path.startsWith('/create')) {
    activeCategory = 'All';
    const url = new URL(path, location.origin);
    const selectedTheme = url.searchParams.get('theme');
    if (selectedTheme && themes.some(theme => theme.id === selectedTheme)) { form.themeId = selectedTheme; if (form.musicAuto) form.musicTrack = themeById(selectedTheme).defaultMusic; }
    step = 0;
  }
  history.pushState({}, '', path);
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  render();
  if (hash) requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
}

function updateField(input) {
  const field = input.dataset.field;
  if (!field) return;
  if (['musicEnabled', 'showCake', 'showConfetti', 'showGallery', 'soundEffects'].includes(field)) form[field] = input.checked;
  else form[field] = input.value;
  if (field === 'message') form.messageSource = 'custom';
  if (field === 'musicTrack') { form.musicAuto = false; form.musicEnabled = true; }
  if (field === 'musicTrack') {
    const selected = musicCatalog.find(track => track.id === form.musicTrack);
    if (selected) {
      document.querySelector('.score-preview strong')?.replaceChildren(document.createTextNode(selected.name));
      const description = document.querySelector('.score-preview small');
      if (description) description.textContent = selected.kind;
      const preview = document.querySelector('.score-preview [data-action="preview-track"]');
      if (preview) { preview.dataset.trackId = selected.id; preview.setAttribute('aria-pressed', String(getActiveTrack() === selected.id)); preview.textContent = getActiveTrack() === selected.id ? 'Pause' : 'Listen'; }
    }
    if (getActiveTrack() && getActiveTrack() !== form.musicTrack) stopMusic();
  }
  saveDraft();
  if (field === 'message') {
    const count = document.querySelector('#message-count');
    if (count) count.textContent = String(form.message.length);
  }
  updateLivePreview();
}

function updatePhotoField(input) {
  const photo = form.photos[Number(input.dataset.photoIndex)];
  if (!photo) return;
  photo[input.dataset.photoField] = input.value;
  saveDraft();
  updateLivePreview();
}

function stepNext() {
  if (step === 0 && !form.recipientName.trim()) {
    window.generatorError = 'Add their name first so the surprise feels personal.';
    root.innerHTML = wizardPage(); updateLivePreview(); document.querySelector('#recipient-name')?.focus(); return;
  }
  if (step === 2 && !form.message.trim()) form.message = makeMessage();
  if (step < stepsMeta.length - 1) step += 1;
  window.generatorError = '';
  saveDraft(); root.innerHTML = wizardPage(); updateLivePreview();
  document.querySelector('#step-title')?.focus({ preventScroll: true });
}

function stepPrevious() {
  if (step > 0) step -= 1;
  window.generatorError = '';
  root.innerHTML = wizardPage(); updateLivePreview();
}

function randomSet(array) { return array[Math.floor(Math.random() * array.length)]; }

async function compressImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('That file doesn’t look like a photo. Choose a JPG, PNG or WebP image.');
  if (file.size > 20 * 1024 * 1024) throw new Error('That photo is a little too large. Choose one under 20 MB.');
  let source;
  if (typeof createImageBitmap === 'function') {
    try { source = await createImageBitmap(file); } catch { /* fallback to Image element */ }
  }
  if (!source) {
    source = await new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This photo couldn’t be read.')); };
      img.src = url;
    });
  }
  const srcWidth = source.naturalWidth || source.width;
  const srcHeight = source.naturalHeight || source.height;
  const scale = Math.min(1, 960 / Math.max(srcWidth, srcHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(srcWidth * scale));
  canvas.height = Math.max(1, Math.round(srcHeight * scale));
  const context = canvas.getContext('2d', { alpha: false });
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  if (typeof source.close === 'function') source.close();
  let blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .75));
  if (!blob) blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .75));
  if (!blob) throw new Error('This photo couldn’t be prepared. Please try another.');
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('This photo couldn’t be read.'));
    reader.readAsDataURL(blob);
  });
}

async function uploadFiles(fileList) {
  const files = [...fileList].slice(0, Math.max(0, 5 - form.photos.length));
  if (!files.length) { toast('You can add up to five photos.'); return; }
  const status = document.querySelector('#photo-status');
  for (const [index, file] of files.entries()) {
    if (status) status.textContent = `Getting photo ${index + 1} of ${files.length} ready…`;
    try {
      const dataUrl = await compressImage(file);
      if (status) status.textContent = `Adding photo ${index + 1} of ${files.length}…`;
      let photoObj = {
        url: dataUrl,
        alt: `${form.recipientName || 'Birthday'} memory`,
        caption: '',
        year: '',
        memory: ''
      };
      try {
        const result = await api('/api/uploads', { method: 'POST', body: JSON.stringify({ dataUrl }) });
        if (result && result.photo && result.photo.url) {
          photoObj = { ...photoObj, ...result.photo };
        }
      } catch (uploadErr) {
        console.warn('API upload fallback to direct dataUrl:', uploadErr.message);
      }
      form.photos.push(photoObj);
      saveDraft();
      if (location.pathname === '/create' || location.pathname.startsWith('/edit/')) { root.innerHTML = wizardPage(); updateLivePreview(); }
    } catch (error) { toast(error.message || 'Oops! That photo didn’t upload. Try again ♡', true); }
  }
  const finalStatus = document.querySelector('#photo-status');
  if (finalStatus) finalStatus.textContent = form.photos.length ? `${form.photos.length} photo${form.photos.length === 1 ? '' : 's'} ready` : 'No photos yet — you can make a lovely page without one.';
}

async function generatePage(button) {
  if (!form.recipientName.trim()) { step = 0; window.generatorError = 'Add their name so we know who to celebrate.'; root.innerHTML = wizardPage(); updateLivePreview(); return; }
  if (!form.message.trim()) form.message = makeMessage();
  if (!themes.some(theme => theme.id === form.themeId)) form.themeId = 'strawberry';
  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = 'Wrapping the birthday magic… ✨';
  try {
    let birthday;
    if (editSlug) {
      const token = localStorage.getItem(tokenKey(editSlug));
      const response = await api(`/api/birthdays/${encodeURIComponent(editSlug)}`, { method: 'PATCH', headers: { 'x-edit-token': token || '' }, body: JSON.stringify({ birthday: birthdayDraft() }) });
      birthday = response.birthday;
    } else {
      const response = await api('/api/birthdays', { method: 'POST', body: JSON.stringify({ birthday: birthdayDraft() }) });
      birthday = response.birthday;
      localStorage.setItem(tokenKey(birthday.slug), response.editToken);
    }
    currentPage = birthday;
    try {
      localStorage.setItem('birthday-spark-last-created', birthday.slug);
      localStorage.setItem(`birthday-spark-card-${birthday.slug}`, JSON.stringify(birthday));
    } catch { /* optional convenience only */ }
    saveDraft();
    go(`/ready/${encodeURIComponent(birthday.slug)}`);
  } catch (error) {
    button.disabled = false; button.innerHTML = original;
    window.generatorError = `The birthday magic got interrupted ✨ ${error.message}`;
    toast(window.generatorError, true);
    root.innerHTML = wizardPage(); updateLivePreview();
  }
}

async function toggleTrack(trackId) {
  try {
    if (getActiveTrack() === trackId) await stopMusic();
    else await startMusic(trackId);
  } catch (error) { toast(error.message, true); }
}

function updateMusicControls(event) {
  activeAudioTrack = event?.detail?.trackId ?? getActiveTrack();
  if (Number.isFinite(event?.detail?.volume)) document.querySelectorAll('[data-volume]').forEach(input => { input.value = String(event.detail.volume); });
  document.querySelectorAll('[data-action="preview-track"]').forEach(button => {
    const active = activeAudioTrack === button.dataset.trackId;
    button.textContent = active ? 'Pause' : 'Listen';
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('.birthday-music').forEach(player => {
    const active = Boolean(activeAudioTrack);
    player.classList.toggle('is-playing', active);
    const button = player.querySelector('button[data-action="toggle-music"]');
    if (button) { button.textContent = active ? 'Ⅱ' : '▶'; button.setAttribute('aria-label', active ? 'Pause birthday music' : 'Play birthday music'); button.setAttribute('aria-pressed', String(active)); }
  });
}

document.addEventListener('birthday-music-state', updateMusicControls);

async function playPageSound(page, moment) {
  if (!page || page.dataset.soundEffects !== 'true') return;
  try { await playInteractionSound(page.dataset.themePage, moment); } catch { /* sound is an optional layer; the interaction still completes */ }
}

function launchConfetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let layer = document.querySelector('.confetti-layer');
  if (!layer) { layer = document.createElement('div'); layer.className = 'confetti-layer'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); }
  layer.innerHTML = '';
  const colors = ['#ef8da3', '#f5c66f', '#9bc9a6', '#a99bde', '#f29f7d', '#76c8c3'];
  for (let i = 0; i < 42; i += 1) {
    const piece = document.createElement('i'); piece.className = 'confetti-piece'; piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = randomSet(colors); piece.style.animationDelay = `${Math.random() * .55}s`; piece.style.setProperty('--x', `${Math.random() * 190 - 95}px`); piece.style.setProperty('--spin', `${Math.random() * 900 - 450}deg`); layer.appendChild(piece);
  }
  setTimeout(() => layer.remove(), 3600);
}

async function copyLink() {
  const input = document.querySelector('#share-link');
  try { await navigator.clipboard.writeText(input.value); toast('Birthday link copied — ready to share ♡'); }
  catch { input.select(); document.execCommand('copy'); toast('Birthday link copied — ready to share ♡'); }
}

async function nativeShare() {
  const link = document.querySelector('#share-link')?.value;
  if (!link) return;
  if (navigator.share) {
    try { await navigator.share({ title: `A birthday surprise for ${currentPage?.recipient.name || 'you'}`, text: 'Someone made a little birthday surprise for you ♡', url: link }); }
    catch (error) { if (error.name !== 'AbortError') toast('Sharing didn’t open. You can copy the link instead.', true); }
  } else { await copyLink(); }
}

function setMemoryIndex(page, index) {
  const slides = [...(page?.querySelectorAll('.memory-slide') || [])];
  if (!slides.length) return;
  const active = Math.max(0, Math.min(slides.length - 1, index));
  page.dataset.activeMemory = String(active);
  page.querySelectorAll('.memory-dots button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
  const count = page.querySelector('[data-memory-count]');
  if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  page.querySelectorAll('.memory-arrow').forEach(button => { button.disabled = (Number(button.dataset.step) < 0 && active === 0) || (Number(button.dataset.step) > 0 && active === slides.length - 1); });
}

function stepMemory(page, delta) {
  const slides = [...(page?.querySelectorAll('.memory-slide') || [])];
  const active = Number(page?.dataset.activeMemory || 0);
  const next = Math.max(0, Math.min(slides.length - 1, active + delta));
  setMemoryIndex(page, next);
  slides[next]?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest', inline: 'center' });
}

function updateMemoryDialog(page, index) {
  const slides = [...(page?.querySelectorAll('.memory-slide') || [])];
  if (!slides.length) return;
  const next = Math.max(0, Math.min(slides.length - 1, index));
  page.dataset.lightboxMemory = String(next);
  const slide = slides[next];
  page.querySelector('[data-lightbox-image]').src = slide.querySelector('img').src;
  page.querySelector('[data-lightbox-image]').alt = slide.querySelector('img').alt;
  const captions = slide.querySelector('figcaption');
  page.querySelector('[data-lightbox-date]').textContent = captions.querySelector('.memory-date')?.textContent || '';
  page.querySelector('[data-lightbox-caption]').textContent = captions.querySelector('strong')?.textContent || '';
  page.querySelector('[data-lightbox-note]').textContent = captions.querySelector('.memory-caption')?.textContent || '';
  page.querySelectorAll('.memory-lightbox-step').forEach(button => { button.disabled = (Number(button.dataset.step) < 0 && next === 0) || (Number(button.dataset.step) > 0 && next === slides.length - 1); });
}

async function beginExperienceMusic(page) {
  const isPreview = page?.classList.contains('preview');
  if (isPreview || getActiveTrack()) return;
  const birthday = currentPage || birthdayDraft();
  const trackId = birthday?.music?.trackId || themeById(birthday?.themeId).defaultMusic || 'birthday_classic';
  try { await startMusic(trackId); } catch { /* the greeting and its interactions work without audio */ }
}

async function interactWithTheme(button) {
  const page = button.closest('.birthday-page');
  if (!page) return;
  const interaction = button.dataset.interaction;
  const themeId = page.dataset.themePage;
  const state = experienceProgress.get(page) || { petals: 0, balloons: new Set(), stars: new Set(), album: 0 };
  experienceProgress.set(page, state);
  const status = page.querySelector('[data-interaction-status]');
  const cue = { petals: 'petal', balloons: 'balloon', album: 'reveal', envelope: 'envelope', constellation: 'star', jukebox: 'open', cover: 'reveal' }[interaction] || 'open';
  if (interaction === 'jukebox' && page.classList.contains('jukebox-on') && getActiveTrack()) await stopMusic();
  else await beginExperienceMusic(page);
  await playPageSound(page, cue);

  if (interaction === 'cover') {
    page.classList.add('surprise-open', 'cover-revealed');
    button.setAttribute('aria-pressed', 'true');
    button.innerHTML = 'The story is open <span aria-hidden="true">✦</span>';
    if (status) status.textContent = 'The cover has turned. Take your time with the story.';
    if (!page.classList.contains('preview')) page.querySelector('.story-path')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  } else if (interaction === 'petals') {
    state.petals = Math.min(3, state.petals + 1);
    page.classList.add(`petals-${state.petals}`);
    button.setAttribute('aria-pressed', String(state.petals === 3));
    if (status) status.textContent = state.petals === 3 ? 'Three petals gathered. A little luck for the year ahead.' : `${state.petals} of 3 petals gathered`;
    if (state.petals === 3) page.classList.add('garden-awake');
  } else if (interaction === 'album') {
    const isPreview = page.classList.contains('preview');
    const birthday = isPreview ? birthdayDraft() : currentPage;
    const slides = [...page.querySelectorAll('.memory-slide img')];
    const photoList = (birthday?.photos && birthday.photos.length > 0)
      ? birthday.photos
      : slides.map(img => ({ url: img.src, alt: img.alt, caption: '' }));
    const total = Math.max(1, photoList.length);
    state.album = (state.album % total) + 1;
    page.classList.add('album-open');
    const portrait = page.querySelector('.scrapbook-portrait img');
    if (portrait && photoList.length) {
      const selected = photoList[state.album - 1];
      if (selected?.url) portrait.src = selected.url;
      if (selected?.alt || selected?.caption) portrait.alt = selected.alt || selected.caption;
    }
    const figcaption = page.querySelector('.scrapbook-portrait figcaption');
    if (figcaption && photoList.length) {
      const selected = photoList[state.album - 1];
      figcaption.textContent = selected.caption || selected.memory || (total > 1 ? `Memory ${state.album} of ${total}` : 'the day is better with you in it');
    }
    if (slides.length) {
      setMemoryIndex(page, state.album - 1);
    }
    button.setAttribute('aria-pressed', 'true');
    button.innerHTML = state.album === total ? 'Turn to beginning <span aria-hidden="true">↺</span>' : 'Turn another page <span aria-hidden="true">↗</span>';
    if (status) status.textContent = total > 1 ? `Page ${state.album} of ${total} turned. The memory album is open.` : 'Page 1 turned. The memory album is open.';
  } else if (interaction === 'balloons') {
    const balloon = button.dataset.star || button.dataset.interactionIndex || button.getAttribute('aria-label');
    if (button.dataset.popped) return;
    button.dataset.popped = 'true';
    button.disabled = true;
    button.classList.add('balloon-popped');
    state.balloons.add(balloon);
    if (status) status.textContent = `${state.balloons.size} of 3 popped`;
    if (state.balloons.size === 3) {
      page.classList.add('party-started');
      if (page.dataset.confetti === 'true') launchConfetti();
      if (status) status.textContent = 'The party is officially yours. Keep the good things coming.';
    }
  } else if (interaction === 'envelope') {
    page.classList.add('surprise-open', 'envelope-open');
    button.setAttribute('aria-pressed', 'true');
    button.innerHTML = 'The letter is open <span aria-hidden="true">✉</span>';
    if (status) status.textContent = 'The flap lifted. Your letter is waiting below.';
    if (!page.classList.contains('preview')) page.querySelector('.story-path')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  } else if (interaction === 'jukebox') {
    page.classList.toggle('jukebox-on');
    button.setAttribute('aria-pressed', String(page.classList.contains('jukebox-on')));
    button.innerHTML = page.classList.contains('jukebox-on') ? 'The club is playing <span aria-hidden="true">♫</span>' : 'Drop the needle <span aria-hidden="true">♫</span>';
    if (status) status.textContent = page.classList.contains('jukebox-on') ? 'Your table is ready. The soundtrack is on.' : 'The player paused. Tap when you are ready.';
  } else if (interaction === 'constellation') {
    const star = button.dataset.star;
    if (state.stars.has(star)) return;
    state.stars.add(star);
    button.classList.add('star-connected');
    button.setAttribute('aria-pressed', 'true');
    if (status) status.textContent = state.stars.size < 3 ? `${state.stars.size} of 3 stars connected` : 'The constellation is yours. Make a quiet wish.';
    if (state.stars.size === 3) page.classList.add('constellation-complete');
  }
}

async function handleAction(action, element) {
  if (action === 'previous-step') stepPrevious();
  else if (action === 'next-step') stepNext();
  else if (action === 'generate-page') generatePage(element);
  else if (action === 'remove-photo') { form.photos.splice(Number(element.dataset.index), 1); saveDraft(); root.innerHTML = wizardPage(); updateLivePreview(); }
  else if (action === 'make-cover') { const [photo] = form.photos.splice(Number(element.dataset.index), 1); if (photo) form.photos.unshift(photo); saveDraft(); root.innerHTML = wizardPage(); updateLivePreview(); }
  else if (action === 'select-theme') { if (getActiveTrack()) stopMusic(); form.themeId = element.dataset.themeId; if (form.musicAuto) form.musicTrack = themeById(form.themeId).defaultMusic; saveDraft(); root.innerHTML = wizardPage(); updateLivePreview(); }
  else if (action === 'theme-preview') { themeModalId = element.dataset.themeId; root.innerHTML = themeGalleryPage(); document.querySelector('[data-action="close-theme-preview"]')?.focus(); }
  else if (action === 'close-theme-preview') closeThemePreview();
  else if (action === 'toggle-theme-favorite') {
    const themeId = element.dataset.themeId;
    if (favoriteThemeIds.has(themeId)) favoriteThemeIds.delete(themeId); else favoriteThemeIds.add(themeId);
    try { localStorage.setItem('birthday-spark-favorite-themes', JSON.stringify([...favoriteThemeIds])); } catch { /* current-session favorites still work */ }
    root.innerHTML = themeGalleryPage();
  }
  else if (action === 'filter-themes' || action === 'filter-generator-themes') { activeCategory = element.dataset.category; if (action === 'filter-themes') root.innerHTML = themeGalleryPage(); else { root.innerHTML = wizardPage(); updateLivePreview(); } }
  else if (action === 'select-track') { if (getActiveTrack()) stopMusic(); form.musicTrack = element.dataset.trackId; form.musicAuto = false; saveDraft(); root.innerHTML = wizardPage(); updateLivePreview(); }
  else if (action === 'preview-track') toggleTrack(element.dataset.trackId);
  else if (action === 'generate-message') { form.message = makeMessage(); form.messageSource = 'generated'; saveDraft(); root.innerHTML = wizardPage(); updateLivePreview(); }
  else if (action === 'choose-message') { form.message = messageSuggestions[Number(element.dataset.messageIndex)] || makeMessage(); form.messageSource = 'template'; saveDraft(); root.innerHTML = wizardPage(); updateLivePreview(); }
  else if (action === 'preview-mode') { previewMode = element.dataset.mode; document.querySelectorAll('[data-action="preview-mode"]').forEach(button => { button.classList.toggle('active', button.dataset.mode === previewMode); button.setAttribute('aria-pressed', String(button.dataset.mode === previewMode)); }); updateLivePreview(); }
  else if (action === 'copy-link') copyLink();
  else if (action === 'share-native') nativeShare();
  else if (action === 'new-page') { if (getActiveTrack()) stopMusic(); form = defaultForm(); step = 0; editSlug = null; currentPage = null; saveDraft(); go('/create'); }
  else if (action === 'theme-interact') interactWithTheme(element);
  else if (action === 'toggle-music') {
    if (getActiveTrack()) {
      await stopMusic();
    } else {
      const page = element.closest('.birthday-page');
      const birthday = page?.classList.contains('preview') ? birthdayDraft() : currentPage;
      const trackId = birthday?.music?.trackId || themeById(birthday?.themeId).defaultMusic || 'birthday_classic';
      try { await startMusic(trackId); } catch (error) { toast(error.message, true); }
    }
  }
  else if (action === 'memory-step') stepMemory(element.closest('.birthday-page'), Number(element.dataset.step));
  else if (action === 'memory-select') { const page = element.closest('.birthday-page'); const index = Number(element.dataset.memoryIndex); setMemoryIndex(page, index); page.querySelector(`[data-memory-slide="${index}"]`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest', inline: 'center' }); }
  else if (action === 'memory-open') { const page = element.closest('.birthday-page'); memoryFocusOrigin = element; updateMemoryDialog(page, Number(element.dataset.memoryIndex)); const dialog = page?.querySelector('[data-memory-lightbox]'); if (dialog) { dialog.hidden = false; dialog.focus?.(); dialog.querySelector('[data-action="memory-close"]')?.focus(); } }
  else if (action === 'memory-close') { const page = element.closest('.birthday-page'); const dialog = page?.querySelector('[data-memory-lightbox]'); if (dialog) dialog.hidden = true; memoryFocusOrigin?.focus(); memoryFocusOrigin = null; }
  else if (action === 'memory-modal-step') { const page = element.closest('.birthday-page'); updateMemoryDialog(page, Number(page.dataset.lightboxMemory || 0) + Number(element.dataset.step)); }
  else if (action === 'reason-reveal') { const revealed = element.getAttribute('aria-expanded') === 'true'; element.setAttribute('aria-expanded', String(!revealed)); element.classList.toggle('is-revealed', !revealed); }
  else if (action === 'reveal-gift') { const message = element.closest('.surprise-scene')?.querySelector('[data-gift-message]'); if (message) { message.hidden = false; element.setAttribute('aria-expanded', 'true'); element.classList.add('is-open'); element.querySelector('span:last-child').textContent = 'A little something for you'; playPageSound(element.closest('.birthday-page'), 'reveal'); } }
  else if (action === 'reveal-secret') { const note = element.closest('.secret-discovery')?.querySelector('[data-secret-note]'); if (note) { note.hidden = false; element.setAttribute('aria-expanded', 'true'); element.classList.add('is-open'); playPageSound(element.closest('.birthday-page'), 'secret'); } }
  else if (action === 'story-order') { const index = Number(element.dataset.index); const next = index + Number(element.dataset.direction); if (next >= 0 && next < form.storyOrder.length) { [form.storyOrder[index], form.storyOrder[next]] = [form.storyOrder[next], form.storyOrder[index]]; saveDraft(); root.innerHTML = wizardPage(); updateLivePreview(); document.querySelector('.story-path-editor')?.setAttribute('open', ''); } }
  else if (action === 'add-reason') { if (form.reasons.length < 6) form.reasons.push(''); saveDraft(); root.innerHTML = wizardPage(); updateLivePreview(); document.querySelector('.story-details')?.setAttribute('open', ''); document.querySelector('[data-reason-index]:last-of-type')?.focus(); }
  else if (action === 'remove-reason') { form.reasons.splice(Number(element.dataset.index), 1); saveDraft(); root.innerHTML = wizardPage(); updateLivePreview(); document.querySelector('.story-details')?.setAttribute('open', ''); }
  else if (action === 'complete-finale' || action === 'make-wish') {
    const page = element.closest('.birthday-page');
    page?.classList.add('finale-complete', 'wish-complete');
    const scene = element.closest('.finale-scene');
    scene?.querySelector('[data-finale-note]')?.removeAttribute('hidden');
    element.disabled = true;
    element.innerHTML = action === 'make-wish' ? 'Wish sent <span aria-hidden="true">✦</span>' : 'A wish sent your way <span aria-hidden="true">✦</span>';
    if (page?.dataset.confetti === 'true') launchConfetti();
    const isPreview = page?.classList.contains('preview');
    const birthday = isPreview ? birthdayDraft() : currentPage;
    if (birthday?.music?.enabled && !getActiveTrack()) { try { await startMusic(birthday.music.trackId); } catch { /* soundtrack is optional */ } }
    await playPageSound(page, 'finale');
  }
}

document.addEventListener('click', event => {
  const navigate = event.target.closest('[data-navigate]');
  if (navigate && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !navigate.target) {
    event.preventDefault();
    const path = navigate.getAttribute('href');
    const selectedTheme = navigate.dataset.theme;
    go(selectedTheme ? `/create?theme=${encodeURIComponent(selectedTheme)}` : path);
    return;
  }
  const action = event.target.closest('[data-action]');
  if (action) { event.preventDefault(); handleAction(action.dataset.action, action); }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && themeModalId) { event.preventDefault(); closeThemePreview(); return; }
  const memoryDialog = event.target.closest('[data-memory-lightbox]:not([hidden])');
  if (memoryDialog && event.key === 'Escape') { event.preventDefault(); memoryDialog.querySelector('[data-action="memory-close"]')?.click(); return; }
  if (memoryDialog && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault();
    const page = memoryDialog.closest('.birthday-page');
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    updateMemoryDialog(page, Number(page.dataset.lightboxMemory || 0) + direction);
    return;
  }
  if (memoryDialog && event.key === 'Tab') {
    const focusable = [...memoryDialog.querySelectorAll('button:not([disabled])')];
    if (focusable.length) {
      const first = focusable[0]; const last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || !memoryDialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !memoryDialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
    return;
  }
  const buttonLike = event.target.closest('[role="button"][data-action]');
  if (!buttonLike || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  handleAction(buttonLike.dataset.action, buttonLike);
});

document.addEventListener('click', event => {
  if (event.target.matches('[data-modal-backdrop]')) closeThemePreview();
});

document.addEventListener('input', event => {
  const target = event.target;
  if (target.matches('[data-field]')) updateField(target);
  if (target.matches('[data-photo-field]')) updatePhotoField(target);
  if (target.matches('[data-reason-index]')) { form.reasons[Number(target.dataset.reasonIndex)] = target.value; saveDraft(); updateLivePreview(); }
  if (target.matches('[data-volume]')) setMusicVolume(target.value);
});

document.addEventListener('change', event => {
  const target = event.target;
  if (target.matches('[data-field]')) updateField(target);
  if (target.matches('[data-photo-field]')) updatePhotoField(target);
  if (target.matches('[data-story-section]')) {
    const section = target.dataset.storySection;
    if (target.checked && !form.storyOrder.includes(section)) form.storyOrder.push(section);
    if (!target.checked) form.storyOrder = form.storyOrder.filter(item => item !== section);
    saveDraft(); root.innerHTML = wizardPage(); updateLivePreview(); document.querySelector('.story-path-editor')?.setAttribute('open', '');
  }
  if (target.id === 'photo-input') uploadFiles(target.files);
});

document.addEventListener('dragover', event => { const zone = event.target.closest('#upload-zone'); if (zone) { event.preventDefault(); zone.classList.add('dragover'); } });
document.addEventListener('dragleave', event => { const zone = event.target.closest('#upload-zone'); if (zone && !zone.contains(event.relatedTarget)) zone.classList.remove('dragover'); });
document.addEventListener('drop', event => { const zone = event.target.closest('#upload-zone'); if (!zone) return; event.preventDefault(); zone.classList.remove('dragover'); uploadFiles(event.dataTransfer.files); });
window.addEventListener('popstate', () => { stopMusic(); render(); });
window.addEventListener('pagehide', stopMusic);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) suspendMusicForHiddenPage();
  else resumeMusicForVisiblePage();
});
render();
