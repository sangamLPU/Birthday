const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export const themes = [
  { id: 'strawberry', name: 'The Birthday Edit', description: 'A keepsake issue with a headline made for one person.', categories: ['Editorial', 'Romantic'], defaultMusic: 'elegant', interaction: { id: 'cover', label: 'Turn the cover', hint: 'A little story is waiting inside.' } },
  { id: 'sakura', name: 'A Day in Bloom', description: 'A garden note that gathers small wishes like petals.', categories: ['Botanical', 'Serene'], defaultMusic: 'dream', interaction: { id: 'petals', label: 'Gather three petals', hint: 'Tap the petals to let the garden wake up.' } },
  { id: 'teddy', name: 'Memory Lane', description: 'A tactile album with a new page for every moment.', categories: ['Keepsake', 'Scrapbook'], defaultMusic: 'nostalgia', interaction: { id: 'album', label: 'Turn an album page', hint: 'There is always one more little memory.' } },
  { id: 'cloud', name: 'Big Day Poster', description: 'A birthday street party with a tiny balloon hunt.', categories: ['Graphic', 'Expressive'], defaultMusic: 'upbeat', interaction: { id: 'balloons', label: 'Pop three party balloons', hint: 'Tap three balloons to kick off the party.' } },
  { id: 'bunny', name: 'A Letter for You', description: 'A piece of birthday mail, sealed and opened by hand.', categories: ['Letters', 'Romantic'], defaultMusic: 'romance', interaction: { id: 'envelope', label: 'Break the seal', hint: 'Your letter is addressed to you.' } },
  { id: 'candy', name: 'The Birthday Club', description: 'An after-hours listening booth with a song for the birthday star.', categories: ['Playful', 'Retro'], defaultMusic: 'playful', interaction: { id: 'jukebox', label: 'Drop the needle', hint: 'Choose play and the birthday club comes alive.' } },
  { id: 'starry', name: 'Wish Upon Tonight', description: 'A quiet observatory where their stars join into a wish.', categories: ['Celestial', 'Night'], defaultMusic: 'cinematic', interaction: { id: 'constellation', label: 'Connect three stars', hint: 'Tap the stars to draw a path for your wish.' } }
];

const miniatures = {
  strawberry: `<span class="mini-issue">THE BIRTHDAY EDIT · 01</span><strong class="mini-editorial-title">HAPPY<br><i>birthday</i></strong><span class="mini-editorial-photo"></span><span class="mini-editorial-rule">A DAY MADE FOR YOU</span>`,
  sakura: `<span class="mini-botanical-label">GARDEN LETTERS</span><span class="mini-bloom"><i></i><i></i><i></i><i></i><i></i></span><strong class="mini-botanical-title">A day<br>in bloom</strong><span class="mini-botanical-stem"></span>`,
  teddy: `<span class="mini-scrap-tape"></span><strong class="mini-scrap-note">little<br>moments<br><i>big love</i></strong><span class="mini-polaroid"><i></i><b>our story</b></span><span class="mini-scrap-stamp">♡</span>`,
  cloud: `<span class="mini-poster-spark">✳</span><span class="mini-poster-top">TODAY IS YOURS</span><strong class="mini-poster-title">HAPPY<br>BIRTHDAY</strong><span class="mini-poster-name">MAYA!</span><span class="mini-poster-foot">MAKE SOME JOY</span>`,
  bunny: `<span class="mini-postmark">SPECIAL<br>DELIVERY</span><span class="mini-envelope"><i></i><b>✦</b></span><strong class="mini-letter-title">a letter<br><i>for you</i></strong><span class="mini-letter-address">OPEN WHEN READY →</span>`,
  candy: `<span class="mini-club-sign">THE BIRTHDAY CLUB</span><span class="mini-diner-star">✦</span><strong class="mini-menu-title">TODAY'S<br>SPECIAL</strong><span class="mini-dessert">✿</span><span class="mini-menu-name">YOU, EXTRA SWEET</span>`,
  starry: `<span class="mini-starfield"></span><span class="mini-cosmic-orbit"></span><span class="mini-cosmic-label">ONE ORBIT BRIGHTER</span><strong class="mini-cosmic-title">MAKE A<br>WISH</strong><span class="mini-cosmic-photo"></span><span class="mini-cosmic-name">MAYA</span>`
};

export function renderThemeMiniature(themeId) {
  return `<div class="theme-art-preview theme-art-${themeId}" aria-hidden="true">${miniatures[themeId] || miniatures.strawberry}</div>`;
}

const covers = {
  strawberry: c => `<header class="cover-masthead"><span>THE BIRTHDAY EDITION</span><span>MADE FOR ${esc(c.fullName.toUpperCase())} · VOL. 01</span></header><section class="world-cover editorial-cover"><div class="cover-copy"><p class="experience-kicker">TODAY'S COVER STORY</p><h1>Happy<br><em>birthday,</em><br>${c.name}.</h1><p class="cover-intro">${esc(c.intro || 'A whole day for the person who makes ordinary life feel like the good part.')}</p>${c.identity}<button class="experience-open" type="button" data-action="theme-interact" data-interaction="cover">Turn the cover <span aria-hidden="true">↗</span></button><span class="interaction-hint">${esc(c.interaction.hint)}</span></div><figure class="cover-portrait editorial-portrait">${c.primary}<figcaption>THE PERSON OF THE DAY</figcaption></figure><span class="cover-index">01</span>${c.secretMarker}</section>`,
  sakura: c => `<header class="cover-masthead"><span>FIELD NOTES · A DAY IN BLOOM</span><span>${c.recipient.birthdayDate ? esc(c.recipient.birthdayDate) : 'ONE MORE TRIP AROUND THE SUN'}</span></header><section class="world-cover botanical-cover"><div class="botanical-orbit" aria-hidden="true"></div><div class="botanical-branch" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="cover-copy"><p class="experience-kicker">A SMALL CELEBRATION OF YOU</p><h1>Another year<br>in <em>bloom,</em><span>${c.name}</span></h1><p class="cover-intro">${esc(c.intro || 'May the days ahead open gently, like the first flowers of spring.')}</p>${c.identity}<button class="experience-open" type="button" data-action="theme-interact" data-interaction="petals">Gather a little luck <span aria-hidden="true">✿</span></button><span class="interaction-hint">${esc(c.interaction.hint)}</span><p class="interaction-status" data-interaction-status aria-live="polite">0 petals gathered</p></div><figure class="cover-portrait botanical-portrait">${c.primary}<figcaption>the loveliest part of this season</figcaption></figure>${c.secretMarker}<span class="cover-index">GROWN WITH LOVE · 02</span></section>`,
  teddy: c => `<header class="cover-masthead"><span>THE LITTLE MEMORY BOOK</span><span>OPENED JUST FOR YOU · 03</span></header><section class="world-cover scrapbook-cover"><span class="scrap-tape tape-left" aria-hidden="true"></span><span class="scrap-tape tape-right" aria-hidden="true"></span><div class="cover-copy scrapbook-note"><p class="experience-kicker">A PAGE FOR OUR FAVORITE PERSON</p><h1>Happy<br>birthday,<br><em>${c.name}!</em></h1><p class="cover-intro">${esc(c.intro || 'One more year of being exactly, wonderfully you.')}</p>${c.identity}<button class="experience-open" type="button" data-action="theme-interact" data-interaction="album">Turn the first page <span aria-hidden="true">↗</span></button><span class="interaction-hint">${esc(c.interaction.hint)}</span><p class="interaction-status" data-interaction-status aria-live="polite">The album is closed</p></div><figure class="cover-portrait scrapbook-portrait">${c.primary}<figcaption>the day is better with you in it</figcaption></figure><span class="scrap-sticker sticker-one" aria-hidden="true">GOOD<br>THINGS</span>${c.secretMarker}</section>`,
  cloud: c => `<header class="cover-masthead"><span>THE WHOLE DAY IS YOURS</span><span>ONE DAY ONLY · BIG DAY NO. 04</span></header><section class="world-cover poster-cover"><span class="poster-spark poster-spark-one" aria-hidden="true">✳</span><p class="experience-kicker">TODAY IS YOURS</p><h1>HAPPY<br><span>BIRTHDAY</span></h1><div class="poster-focus"><span class="poster-name">${c.name}!</span><figure class="cover-portrait poster-portrait">${c.primary}<figcaption>OFFICIALLY THE MAIN EVENT</figcaption></figure></div><p class="cover-intro">${esc(c.intro || 'Make some room. This whole day belongs to you.')}</p>${c.identity}<div class="balloon-gang" aria-label="Three party balloons">${[1, 2, 3].map((balloon, index) => `<button type="button" class="party-balloon balloon-${index + 1}" data-action="theme-interact" data-interaction="balloons" aria-label="Pop party balloon ${balloon}"><span aria-hidden="true">${index === 1 ? '✳' : '•'}</span></button>`).join('')}</div><p class="interaction-hint">${esc(c.interaction.hint)}</p><p class="interaction-status" data-interaction-status aria-live="polite">0 of 3 popped</p>${c.secretMarker}</section>`,
  bunny: c => `<header class="cover-masthead"><span>PERSONAL POST</span><span>DELIVERED WITH LOVE · 05</span></header><section class="world-cover letter-cover"><div class="letter-postmark" aria-hidden="true"><span>FOR YOU</span><i>✳</i><small>GOOD NEWS INSIDE</small></div><div class="letter-envelope"><div class="envelope-flap"></div><div class="envelope-photo">${c.primary}</div><span class="envelope-seal">✦</span></div><p class="experience-kicker">A LITTLE SOMETHING IN THE POST</p><h1>A letter<br>for <em>${c.name}</em></h1><p class="cover-intro">${esc(c.intro || 'No occasion calls for better mail.')}</p>${c.identity}<button class="experience-open" type="button" data-action="theme-interact" data-interaction="envelope">Break the seal <span aria-hidden="true">✉</span></button><span class="interaction-hint">${esc(c.interaction.hint)}</span><span class="letter-address">TO: ${esc(c.fullName.toUpperCase())} · OPEN WHEN READY</span>${c.secretMarker}</section>`,
  candy: c => `<header class="cover-masthead"><span>THE BIRTHDAY CLUB · EST. TODAY</span><span>OPEN ALL DAY · 06</span></header><section class="world-cover club-cover"><div class="club-awning" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="club-sign"><span class="club-est">GOOD TIMES · SINCE TODAY</span><p class="experience-kicker">A VERY GOOD DAY TO BE</p><h1>${c.name}</h1><span class="club-special">TODAY'S<br><b>SPECIAL</b></span></div><figure class="cover-portrait club-portrait">${c.primary}<figcaption>served with extra joy</figcaption></figure><p class="cover-intro">${esc(c.intro || 'Pull up a chair. Your favorite song is on the menu.')}</p>${c.identity}<button class="experience-open" type="button" data-action="theme-interact" data-interaction="jukebox">Drop the needle <span aria-hidden="true">♫</span></button><span class="interaction-hint">${esc(c.interaction.hint)}</span><div class="club-record" aria-hidden="true"><span>BS</span></div>${c.secretMarker}</section>`,
  starry: c => `<header class="cover-masthead"><span>OBSERVATORY LOG · 07</span><span>${c.recipient.location ? esc(c.recipient.location.toUpperCase()) : 'WISHES INBOUND'}</span></header><section class="world-cover cosmic-cover"><div class="cosmic-stars" aria-hidden="true"></div><span class="cosmic-orbit orbit-a" aria-hidden="true"></span><span class="cosmic-orbit orbit-b" aria-hidden="true"></span><p class="experience-kicker">ONE ORBIT BRIGHTER</p><h1>Happy birthday,<br><em>${c.name}</em></h1><figure class="cover-portrait cosmic-portrait">${c.primary}<figcaption>THE BRIGHTEST THING IN OUR SKY</figcaption></figure><p class="cover-intro">${esc(c.intro || 'A whole universe is glad you were born.')}</p>${c.identity}<div class="constellation-path" aria-label="A three star birthday constellation">${[1, 2, 3].map(star => `<button type="button" class="constellation-star star-${star}" data-action="theme-interact" data-interaction="constellation" data-star="${star}" aria-label="Connect birthday star ${star}">✦</button>`).join('')}</div><span class="interaction-hint">${esc(c.interaction.hint)}</span><p class="interaction-status" data-interaction-status aria-live="polite">The stars are waiting</p>${c.secretMarker}<span class="cosmic-coordinate bottom-coordinate">N 07° · WISHES INBOUND</span></section>`
};

function renderLetter(id, c) {
  const title = { strawberry: 'The note', sakura: 'A note left in the garden', teddy: 'A note to keep', cloud: 'A very important note', bunny: 'Birthday mail', candy: 'For the birthday regular', starry: 'Incoming transmission' }[id];
  const greeting = { strawberry: `DEAR ${c.fullName.toUpperCase()},`, sakura: `Dear ${c.fullName},`, teddy: `Dear ${c.fullName},`, cloud: `FOR ${c.fullName.toUpperCase()}`, bunny: `DEAR ${c.fullName.toUpperCase()},`, candy: `ORDER UP FOR ${c.fullName.toUpperCase()}`, starry: `✦ FOR ${c.fullName.toUpperCase()}` }[id];
  return `<section class="story-scene note-scene note-${id}" id="story-letter"><div class="scene-overline">${esc(greeting)}</div><h2>${esc(title)}</h2><p class="experience-message">${esc(c.story.letter || c.message)}</p><p class="scene-signoff">${esc(c.story.signature || 'With all my heart.')}</p></section>`;
}

function renderMemories(id, c) {
  if (!c.showGallery || !c.photos.length) return '';
  return `<section class="story-scene memory-scene memory-${id}" id="story-memories"><div class="scene-overline">A FEW THINGS I NEVER WANT TO FORGET</div><h2>${id === 'teddy' ? 'Turn another page.' : id === 'starry' ? 'Little lights, long ago.' : id === 'candy' ? 'Play the good parts again.' : 'The days we keep.'}</h2><div class="memory-reel" data-memory-reel><div class="memory-track" data-memory-track>${c.photos.map((photo, index) => `<figure class="memory-slide memory-slide-${index % 4}" data-memory-slide="${index}"><button type="button" class="memory-open" data-action="memory-open" data-memory-index="${index}" aria-label="Open memory ${index + 1}: ${esc(photo.caption || `Birthday memory ${index + 1}`)}"><img src="${esc(photo.url)}" alt="${esc(photo.alt || photo.caption || `Birthday memory ${index + 1}`)}" loading="${index > 1 ? 'lazy' : 'eager'}"${index === 0 ? ' fetchpriority="high"' : ''}></button><figcaption><span class="memory-date">${esc(photo.year || `MEMORY ${String(index + 1).padStart(2, '0')}`)}</span><strong>${esc(photo.caption || 'A little moment')}</strong>${photo.memory ? `<span class="memory-caption">${esc(photo.memory)}</span>` : ''}</figcaption></figure>`).join('')}</div></div><div class="memory-controls"><button type="button" class="memory-arrow" data-action="memory-step" data-step="-1" aria-label="Previous memory" disabled>←</button><div class="memory-dots" role="group" aria-label="Choose a memory">${c.photos.map((_, index) => `<button type="button" data-action="memory-select" data-memory-index="${index}" aria-label="Show memory ${index + 1}" aria-pressed="${index === 0}"></button>`).join('')}</div><span class="memory-count" data-memory-count aria-live="polite">01 / ${String(c.photos.length).padStart(2, '0')}</span><button type="button" class="memory-arrow" data-action="memory-step" data-step="1" aria-label="Next memory"${c.photos.length <= 1 ? ' disabled' : ''}>→</button></div><p class="memory-swipe-hint">Swipe, or use the arrows, to turn through the memories.</p></section>`;
}

function renderReasons(id, c) {
  if (!c.story.reasons.length) return '';
  return `<section class="story-scene reasons-scene reasons-${id}" id="story-reasons"><div class="scene-overline">A SHORT LIST, WITH NO END</div><h2>Little things I love about you.</h2><div class="reason-stack">${c.story.reasons.map((reason, index) => `<button class="reason-card" type="button" data-action="reason-reveal" aria-expanded="false"><span class="reason-front"><small>0${index + 1} · TAP TO OPEN</small><strong>${id === 'starry' ? 'a bright thing about you' : id === 'bunny' ? 'a note in the margin' : id === 'candy' ? 'today’s special' : 'one little reason'}</strong></span><span class="reason-back" aria-hidden="true">${esc(reason)}</span></button>`).join('')}</div></section>`;
}

function renderInsideJoke(id, c) {
  if (!c.story.insideJoke) return '';
  return `<section class="story-scene aside-scene aside-${id}" id="story-inside-joke"><div class="scene-overline">BETWEEN JUST US</div><button class="inside-joke" type="button" data-action="reason-reveal" aria-expanded="false"><span class="inside-front">${id === 'bunny' ? 'P.S. open the little postscript' : id === 'starry' ? 'A signal only we understand' : 'Psst… there’s an inside joke here'}</span><span class="inside-back" aria-hidden="true">${esc(c.story.insideJoke)}</span></button></section>`;
}

function renderSurprise(id, c) {
  if (!c.story.surprise) return '';
  return `<section class="story-scene surprise-scene surprise-${id}" id="story-surprise"><div class="scene-overline">ONE MORE THING, WRAPPED JUST FOR YOU</div><h2>A small surprise.</h2><button type="button" class="gift-reveal" data-action="reveal-gift" aria-expanded="false"><span class="gift-box" aria-hidden="true"><i></i></span><span>Untie the ribbon</span></button><p class="surprise-message" data-gift-message hidden>${esc(c.story.surprise)}</p></section>`;
}

const endings = {
  strawberry: `<span class="finale-glyph" aria-hidden="true">✦</span><button class="finale-action" type="button" data-action="complete-finale">Seal this beautiful issue <span aria-hidden="true">↗</span></button>`,
  sakura: `<span class="finale-glyph finale-petal" aria-hidden="true">✿</span><button class="finale-action" type="button" data-action="complete-finale">Let one wish drift <span aria-hidden="true">↗</span></button>`,
  teddy: `<span class="finale-glyph finale-sticker" aria-hidden="true">♥</span><button class="finale-action" type="button" data-action="complete-finale">Press the last sticker <span aria-hidden="true">↗</span></button>`,
  cloud: `<span class="finale-glyph finale-spark" aria-hidden="true">✳</span><button class="finale-action" type="button" data-action="complete-finale">Let the whole day pop <span aria-hidden="true">↗</span></button>`,
  bunny: `<span class="finale-glyph finale-stamp" aria-hidden="true">POST</span><button class="finale-action" type="button" data-action="complete-finale">Send one last little note <span aria-hidden="true">↗</span></button>`,
  candy: `<span class="finale-glyph finale-record" aria-hidden="true">♫</span><button class="finale-action" type="button" data-action="complete-finale">Drop the needle on your finale <span aria-hidden="true">↗</span></button>`,
  starry: `<span class="finale-glyph finale-constellation" aria-hidden="true">✦ · ✧ · ✦</span><button class="finale-action" type="button" data-action="complete-finale">Connect the last star <span aria-hidden="true">↗</span></button>`
};

function cake() {
  return `<div class="birthday-cake finale-cake" aria-label="A birthday cake with three candles" role="img"><span class="candle c1"></span><span class="candle c2"></span><span class="candle c3"></span><span class="cake-top"></span><span class="cake-body"></span><span class="cake-icing"></span></div><button class="finale-action" type="button" data-action="make-wish">Blow out the candles <span aria-hidden="true">✦</span></button>`;
}

function renderFinale(id, c) {
  const style = c.customization.finaleStyle || (c.legacy ? 'cake' : 'theme');
  if (style === 'quiet') return `<section class="story-scene finale-scene finale-${id} finale-quiet" id="story-finale"><div class="scene-overline">THE DAY IS YOURS</div><h2>${esc(c.story.closing || `Keep a little room for more good days, ${c.personName}.`)}</h2><p>${esc(c.story.signature || 'Made with love.')}</p></section>`;
  const action = style === 'cake' && c.customization.showCake ? cake() : endings[id];
  return `<section class="story-scene finale-scene finale-${id}" id="story-finale"><div class="scene-overline">A LAST LITTLE WISH</div><h2>${esc(c.story.closing || `May this next trip around the sun be kind to you, ${c.personName}.`)}</h2>${action}<p class="finale-complete-note" data-finale-note aria-live="polite" hidden>And that’s the whole story. I’m so glad you’re in mine. ✦</p></section>`;
}

function renderSecretMarker(id, text) {
  if (!text) return '';
  const glyph = { strawberry: '✦', sakura: '✿', teddy: '♥', cloud: '✳', bunny: '✉', candy: '♫', starry: '✧' }[id];
  return `<div class="secret-discovery secret-${id}"><button type="button" data-action="reveal-secret" aria-expanded="false" aria-label="Open a hidden birthday note">${glyph}</button><span>A tiny note is tucked away</span><p class="secret-note" data-secret-note hidden>${esc(text)}</p></div>`;
}

function renderMusicPlayer(c) {
  if (!c.music.enabled || c.preview) return '';
  return `<aside class="birthday-music music-${c.id}" aria-label="Birthday soundtrack"><span class="player-glyph" aria-hidden="true">${{ strawberry: '◉', sakura: '✿', teddy: '▣', cloud: '▤', bunny: '♫', candy: '●', starry: '✧' }[c.id]}</span><span class="player-copy"><strong>${esc(c.track.name)}</strong><small>${esc(c.track.mood)} · original score</small></span><span class="music-visualizer" aria-hidden="true">${Array.from({ length: 7 }, () => '<i></i>').join('')}</span><button type="button" data-action="toggle-music" aria-label="Play birthday music" aria-pressed="false">▶</button><label class="sr-only" for="music-volume">Music volume</label><input id="music-volume" type="range" min="0" max="1" step=".05" value=".32" data-volume aria-label="Music volume"></aside>`;
}

export function renderThemeExperience(themeId, birthday, { preview = false, track = { name: 'Birthday score', mood: 'dreamy' } } = {}) {
  const id = themes.some(theme => theme.id === themeId) ? themeId : 'strawberry';
  const theme = themes.find(item => item.id === id);
  const recipient = birthday.recipient || {};
  const photos = Array.isArray(birthday.photos) ? birthday.photos : [];
  const message = birthday.message?.text || 'Wishing you a day full of little joys, big laughs, and all the love you deserve.';
  const savedStory = birthday.story || {};
  const story = {
    intro: savedStory.intro || '',
    letter: savedStory.letter || message,
    reasons: Array.isArray(savedStory.reasons) ? savedStory.reasons : [],
    insideJoke: savedStory.insideJoke || '',
    surprise: savedStory.surprise || '',
    secret: savedStory.secret || '',
    closing: savedStory.closing || '',
    signature: savedStory.signature || '',
    order: Array.isArray(savedStory.order) ? savedStory.order : ['letter', 'memories', 'reasons', 'inside-joke', 'surprise']
  };
  const customization = birthday.customization || {};
  const identityParts = [];
  if (recipient.age) identityParts.push(`${recipient.age} today`);
  if (recipient.relationship) identityParts.push(`your ${String(recipient.relationship).toLowerCase()}`);
  if (recipient.personality) identityParts.push(recipient.personality);
  if (recipient.location && id !== 'starry') identityParts.push(recipient.location);
  const c = {
    id, personName: recipient.nickname || recipient.name || 'birthday star', fullName: recipient.name || 'Birthday Star',
    name: esc(recipient.nickname || recipient.name || 'Birthday Star'), recipient, photos, story,
    message, music: birthday.music || { enabled: false }, track, customization,
    intro: story.intro || '', showGallery: customization.showGallery !== false,
    preview, legacy: !birthday.story,
    interaction: theme.interaction,
    identity: identityParts.length ? `<p class="person-note">${identityParts.map(esc).join(' · ')}</p>` : '',
    primary: photos[0] ? `<img src="${esc(photos[0].url)}" alt="${esc(photos[0].alt || `${recipient.name || 'Birthday'} portrait`)}" fetchpriority="high">` : '<span class="photo-illustration" aria-hidden="true"><i></i><b></b><em></em></span>'
  };
  c.secretMarker = renderSecretMarker(id, story.secret);
  const order = Array.isArray(story.order) ? story.order : ['letter', 'memories', 'reasons', 'inside-joke', 'surprise'];
  const sceneRenderers = {
    letter: () => renderLetter(id, c), memories: () => renderMemories(id, c), reasons: () => renderReasons(id, c),
    'inside-joke': () => renderInsideJoke(id, c), surprise: () => renderSurprise(id, c)
  };
  const scenes = [...new Set(order)].map(key => sceneRenderers[key]?.() || '').filter(Boolean).join('');
  const main = `<div class="birthday-experience world-${id}">${covers[id](c)}<main class="story-path story-path-${id}">${scenes}${renderFinale(id, c)}</main><footer class="experience-footer"><span>A birthday story for ${esc(c.fullName)}.</span><span>${esc(theme.name.toUpperCase())} · BIRTHDAY SPARK</span></footer></div>`;
  return main + renderMusicPlayer({ ...c, track });
}
