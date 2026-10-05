export const musicCatalog = [
  { id: 'birthday_classic', name: 'Happy Birthday (Classic)', kind: 'Birthday · iconic melody, warm bells & keys', mood: 'Birthday' },
  { id: 'romantic_ballad', name: "Can't Help Falling", kind: 'Romantic · sweet ballad chords, warm piano & strings', mood: 'Romantic' },
  { id: 'birthday_cheer', name: 'Birthday Party Cheer', kind: 'Birthday · festive brass & pop, party claps', mood: 'Birthday' },
  { id: 'candlelight_romance', name: 'Candlelight Romance', kind: 'Romantic · soft felt keys, intimate strings', mood: 'Romantic' },
  { id: 'make_a_wish', name: 'Make a Birthday Wish', kind: 'Birthday · dreamy music box, celestial sparkles', mood: 'Birthday' },
  { id: 'sweetheart_waltz', name: 'Sweetheart Love Waltz', kind: 'Romantic · romantic 3/4 waltz, piano & bells', mood: 'Romantic' },
  { id: 'sunset_lofi', name: 'Lo-Fi Birthday Sunset', kind: 'Lo-Fi · chill tape keys, cozy dusty drums', mood: 'Lo-Fi' },
  { id: 'romance', name: 'A little closer', kind: 'Romantic · warm keys, soft strings', mood: 'Romantic' },
  { id: 'piano', name: 'Soft Piano Hug', kind: 'Cozy · piano-like keys, slow chords', mood: 'Cozy' },
  { id: 'sunshine', name: 'Sunny Birthday', kind: 'Energetic · plucked melody, bright rhythm', mood: 'Energetic' },
  { id: 'playful', name: 'Sugar rush', kind: 'Playful · plucked notes, handclaps', mood: 'Playful' },
  { id: 'upbeat', name: 'Everybody up', kind: 'Energetic · bright bass, party rhythm', mood: 'Energetic' },
  { id: 'dream', name: 'Clouds at dusk', kind: 'Dreamy · slow piano, airy pads', mood: 'Dreamy' },
  { id: 'magic', name: 'The wishing kind', kind: 'Magical · bell tones, tiny arpeggios', mood: 'Magical' },
  { id: 'cinematic', name: 'The big wide sky', kind: 'Cinematic · swelling chords, low pulse', mood: 'Cinematic' },
  { id: 'nostalgia', name: 'Back when we laughed', kind: 'Nostalgic · tape-warm keys, gentle pulse', mood: 'Nostalgic' },
  { id: 'cozy', name: 'Sunday morning', kind: 'Cozy · soft felt piano, brush drums', mood: 'Cozy' },
  { id: 'elegant', name: 'The birthday waltz', kind: 'Elegant · rounded piano, pizzicato', mood: 'Elegant' },
  { id: 'twinkle', name: 'Little Star Wishes', kind: 'Magical · bell melody, soft harmony', mood: 'Magical' },
  { id: 'night', name: 'Night sky lullaby', kind: 'Night-time · low pads, distant bells', mood: 'Night-time' },
  { id: 'lofi', name: 'After the party', kind: 'Lo-fi · mellow keys, dusty percussion', mood: 'Lo-fi' }
];

const scores = {
  birthday_classic: { bpm: 92, root: 53, scale: 'major', progression: [0, 4, 4, 0], voice: 'bell', bass: 'soft', rhythm: 'spark', arp: true, melody: [4, 4, 5, 4, 7, 6, -1, -1, 4, 4, 5, 4, 8, 7, -1, -1] },
  romantic_ballad: { bpm: 70, root: 57, scale: 'major', progression: [0, 2, 5, 3], voice: 'warm', bass: 'round', rhythm: 'brush', arp: false, melody: [0, -1, 4, -1, 2, -1, 1, 2, 3, -1, 2, -1, 1, -1, 0, -1] },
  birthday_cheer: { bpm: 122, root: 62, scale: 'major', progression: [0, 4, 5, 3], voice: 'bright', bass: 'bounce', rhythm: 'party', arp: true, melody: [4, 4, 5, 4, 7, 7, 6, -1, 4, 4, 5, 4, 8, 8, 7, -1] },
  candlelight_romance: { bpm: 72, root: 55, scale: 'major', progression: [5, 3, 0, 4], voice: 'felt', bass: 'deep', rhythm: 'brush', arp: false, melody: [2, 4, 5, -1, 4, 2, 1, -1, 0, 2, 4, -1, 2, 1, 0, -1] },
  make_a_wish: { bpm: 82, root: 64, scale: 'major', progression: [0, 5, 3, 4], voice: 'bell', bass: 'soft', rhythm: 'spark', arp: true, melody: [4, 5, 6, 7, 6, 4, 2, -1, 4, 2, 0, 2, 4, 2, 0, -1] },
  sweetheart_waltz: { bpm: 94, root: 60, scale: 'major', progression: [0, 3, 4, 0], voice: 'piano', bass: 'round', rhythm: 'waltz', arp: true, melody: [0, 2, 4, 5, 4, 2, 1, -1, 2, 4, 6, 7, 6, 4, 2, 0] },
  sunset_lofi: { bpm: 78, root: 58, scale: 'minor', progression: [0, 3, 5, 4], voice: 'tape', bass: 'round', rhythm: 'dust', arp: false, melody: [0, -1, 2, 3, -1, 4, 2, -1, 5, 4, 2, -1, 1, 2, 0, -1] },
  dream: { bpm: 72, root: 62, scale: 'major', progression: [0, 4, 5, 3], voice: 'air', bass: 'soft', rhythm: 'none', arp: true, melody: [0, -1, 2, -1, 4, -1, 2, -1, 5, -1, 4, -1, 2, -1, 1, -1] },
  romance: { bpm: 78, root: 57, scale: 'major', progression: [0, 5, 3, 4], voice: 'warm', bass: 'round', rhythm: 'brush', arp: false, melody: [4, -1, 3, 2, -1, 4, 5, -1, 4, -1, 2, 1, -1, 2, 0, -1] },
  cinematic: { bpm: 78, root: 53, scale: 'minor', progression: [0, 5, 3, 6], voice: 'wide', bass: 'deep', rhythm: 'soft', arp: false, melody: [0, -1, -1, 4, -1, 3, 2, -1, 5, -1, 4, -1, 2, 1, -1, -1] },
  nostalgia: { bpm: 84, root: 60, scale: 'major', progression: [0, 3, 4, 0], voice: 'tape', bass: 'round', rhythm: 'dust', arp: true, melody: [0, 2, -1, 4, 2, -1, 5, 4, -1, 2, 1, -1, 4, 2, 0, -1] },
  playful: { bpm: 114, root: 60, scale: 'major', progression: [0, 4, 1, 5], voice: 'pluck', bass: 'pluck', rhythm: 'clap', arp: true, melody: [0, 2, 4, 2, 5, 4, 2, 1, 0, 2, 5, 4, 6, 5, 2, 0] },
  cozy: { bpm: 74, root: 55, scale: 'major', progression: [0, 3, 1, 4], voice: 'felt', bass: 'soft', rhythm: 'brush', arp: false, melody: [0, -1, 2, -1, 4, 2, -1, 3, 4, -1, 5, -1, 2, 1, 0, -1] },
  magic: { bpm: 92, root: 62, scale: 'major', progression: [0, 5, 3, 4], voice: 'bell', bass: 'soft', rhythm: 'spark', arp: true, melody: [0, 2, 4, -1, 6, 4, 2, -1, 5, 4, 2, 0, 1, 2, 4, -1] },
  upbeat: { bpm: 122, root: 60, scale: 'major', progression: [0, 3, 4, 0], voice: 'bright', bass: 'bounce', rhythm: 'party', arp: true, melody: [0, 2, 4, 2, 5, 4, 2, 1, 0, 2, 4, 6, 5, 4, 2, 0] },
  lofi: { bpm: 82, root: 57, scale: 'minor', progression: [0, 5, 3, 4], voice: 'mellow', bass: 'round', rhythm: 'dust', arp: false, melody: [0, -1, 2, 3, -1, 4, 2, -1, 5, -1, 4, 3, -1, 2, 0, -1] },
  elegant: { bpm: 92, root: 60, scale: 'major', progression: [0, 3, 4, 0], voice: 'piano', bass: 'round', rhythm: 'waltz', arp: false, melody: [0, -1, 2, 4, -1, 5, 4, -1, 3, -1, 2, 1, -1, 0, 2, -1] },
  night: { bpm: 66, root: 50, scale: 'minor', progression: [0, 3, 5, 4], voice: 'dark', bass: 'deep', rhythm: 'none', arp: true, melody: [0, -1, -1, 2, -1, 4, -1, -1, 5, -1, 4, -1, -1, 2, 0, -1] },
  twinkle: { bpm: 96, root: 60, scale: 'major', progression: [0, 4, 5, 3], voice: 'bell', bass: 'soft', rhythm: 'spark', arp: true, melody: [4, -1, 4, -1, 6, -1, 6, -1, 4, 2, 0, -1, 2, -1, 4, -1] },
  sunshine: { bpm: 116, root: 62, scale: 'major', progression: [0, 4, 3, 5], voice: 'pluck', bass: 'bounce', rhythm: 'party', arp: true, melody: [0, 2, 4, 2, 5, 4, 2, 4, 6, 5, 4, 2, 1, 2, 0, -1] },
  piano: { bpm: 76, root: 57, scale: 'major', progression: [0, 3, 4, 0], voice: 'felt', bass: 'soft', rhythm: 'none', arp: false, melody: [0, -1, 2, 4, -1, 5, 4, -1, 2, -1, 1, 2, -1, 0, -1, -1] }
};

const scales = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10] };
const voiceProfiles = {
  air: { wave: 'sine', overtone: 'triangle', overtoneLevel: .13, cutoff: 1900, attack: .24, release: 1.15, level: .043, detune: 3 },
  warm: { wave: 'triangle', overtone: 'sine', overtoneLevel: .3, cutoff: 1450, attack: .09, release: .78, level: .045, detune: 2 },
  wide: { wave: 'sawtooth', overtone: 'sine', overtoneLevel: .19, cutoff: 1050, attack: .5, release: 1.6, level: .034, detune: 8 },
  tape: { wave: 'triangle', overtone: 'sine', overtoneLevel: .23, cutoff: 1200, attack: .035, release: .44, level: .045, detune: 7 },
  pluck: { wave: 'triangle', overtone: 'sine', overtoneLevel: .2, cutoff: 2500, attack: .006, release: .24, level: .05, detune: 1 },
  felt: { wave: 'sine', overtone: 'triangle', overtoneLevel: .32, cutoff: 1700, attack: .015, release: .65, level: .049, detune: 1 },
  bell: { wave: 'sine', overtone: 'sine', overtoneLevel: .52, cutoff: 3500, attack: .004, release: 1.05, level: .043, detune: 0 },
  bright: { wave: 'square', overtone: 'triangle', overtoneLevel: .15, cutoff: 2200, attack: .008, release: .28, level: .035, detune: 2 },
  mellow: { wave: 'triangle', overtone: 'sine', overtoneLevel: .27, cutoff: 950, attack: .025, release: .62, level: .045, detune: 4 },
  piano: { wave: 'sine', overtone: 'triangle', overtoneLevel: .43, cutoff: 2400, attack: .009, release: .5, level: .046, detune: 0 },
  dark: { wave: 'sine', overtone: 'triangle', overtoneLevel: .25, cutoff: 790, attack: .38, release: 1.35, level: .041, detune: 3 }
};
const bassProfiles = { soft: { wave: 'sine', level: .3, cutoff: 360 }, round: { wave: 'triangle', level: .24, cutoff: 480 }, deep: { wave: 'sine', level: .31, cutoff: 260 }, pluck: { wave: 'triangle', level: .2, cutoff: 600 }, bounce: { wave: 'triangle', level: .24, cutoff: 520 } };
const themeCueNotes = { strawberry: 74, sakura: 78, teddy: 69, cloud: 81, bunny: 76, candy: 72, starry: 86 };
const engine = { context: null, master: null, compressor: null, timer: null, active: null, volume: .32, nextTime: 0, step: 0, nodes: new Set(), noiseBuffer: null };
let cueTimer;

function notify() {
  document.dispatchEvent(new CustomEvent('birthday-music-state', { detail: { trackId: engine.active, playing: Boolean(engine.active), volume: engine.volume } }));
}

function ensureContext() {
  if (!engine.context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('This browser cannot play the original birthday score. The rest of the surprise still works.');
    engine.context = new AudioContextClass();
    engine.master = engine.context.createGain();
    engine.compressor = engine.context.createDynamicsCompressor();
    engine.compressor.threshold.value = -20;
    engine.compressor.ratio.value = 3;
    engine.master.gain.value = 0;
    engine.master.connect(engine.compressor);
    engine.compressor.connect(engine.context.destination);
    const length = Math.floor(engine.context.sampleRate * .22);
    engine.noiseBuffer = engine.context.createBuffer(1, length, engine.context.sampleRate);
    const data = engine.noiseBuffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / length);
  }
  return engine.context;
}

function midiFrequency(note) { return 440 * (2 ** ((note - 69) / 12)); }

function tone(note, when, duration, settings = {}) {
  const context = engine.context;
  const startTime = Math.max(context.currentTime + 0.005, when);
  const patch = settings.patch || voiceProfiles.felt;
  const attack = Math.max(0.005, settings.attack ?? patch.attack);
  const release = Math.max(0.02, settings.release ?? patch.release);
  const amplitude = Math.max(.0001, settings.level ?? patch.level);
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  filter.type = settings.filterType || 'lowpass';
  filter.frequency.setValueAtTime(settings.cutoff || patch.cutoff, startTime);
  filter.Q.value = settings.q || .6;
  envelope.gain.setValueAtTime(.0001, startTime);
  envelope.gain.exponentialRampToValueAtTime(amplitude, startTime + attack);
  envelope.gain.exponentialRampToValueAtTime(.0001, startTime + duration + release);
  filter.connect(envelope);
  envelope.connect(engine.master);
  const oscillators = [];
  for (const [wave, level, detune] of [[patch.wave, 1, 0], [patch.overtone, patch.overtoneLevel || 0, patch.detune || 0]]) {
    if (!level) continue;
    const oscillator = context.createOscillator();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(midiFrequency(note), startTime);
    oscillator.detune.value = detune;
    const voiceGain = context.createGain();
    voiceGain.gain.value = level;
    oscillator.connect(voiceGain);
    voiceGain.connect(filter);
    oscillator.onended = () => engine.nodes.delete(oscillator);
    engine.nodes.add(oscillator);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + release + .025);
    oscillators.push(oscillator);
  }
}

function noise(when, duration, kind, level) {
  const startTime = Math.max(engine.context.currentTime + 0.005, when);
  const safeDuration = Math.max(0.02, duration);
  const source = engine.context.createBufferSource();
  source.buffer = engine.noiseBuffer;
  const filter = engine.context.createBiquadFilter();
  const envelope = engine.context.createGain();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(kind === 'snare' ? 850 : 4200, startTime);
  envelope.gain.setValueAtTime(Math.max(.0001, level), startTime);
  envelope.gain.exponentialRampToValueAtTime(.0001, startTime + safeDuration);
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(engine.master);
  source.onended = () => engine.nodes.delete(source);
  engine.nodes.add(source);
  source.start(startTime);
  source.stop(startTime + safeDuration + .01);
}

function scheduleKick(when, level = .08) {
  tone(35, when, .12, { patch: { wave: 'sine', overtone: null, cutoff: 180, attack: .002, release: .16, level }, level, cutoff: 180, release: .16 });
}

function chordNotes(root, scale, degree) {
  return [0, 2, 4].map(step => root + scale[(degree + step) % scale.length] + Math.floor((degree + step) / scale.length) * 12);
}

function scheduleStep(score) {
  const context = engine.context;
  const step = engine.step % 32;
  const bar = Math.floor(step / 8);
  const scale = scales[score.scale];
  const beat = 60 / score.bpm;
  const progressionDegree = score.progression[bar];
  const chord = chordNotes(score.root, scale, progressionDegree);
  const voice = voiceProfiles[score.voice];

  if (step % 8 === 0) chord.forEach((note, index) => tone(note + (index === 2 ? 12 : 0), engine.nextTime, beat * 1.7, { patch: voice, level: voice.level * .3, release: beat * 1.9, attack: Math.max(.04, voice.attack) }));
  if (step % 2 === 0) {
    const bass = bassProfiles[score.bass];
    const bassNote = score.root - 12 + scale[progressionDegree];
    tone(bassNote, engine.nextTime, beat * .76, { patch: { wave: bass.wave, overtone: null, cutoff: bass.cutoff, attack: .005, release: .1, level: bass.level }, level: bass.level * .2, cutoff: bass.cutoff, release: beat * .22 });
    const melodyIndex = step / 2;
    const degree = score.melody[melodyIndex];
    if (degree >= 0) {
      const octave = score.voice === 'dark' ? 12 : 24;
      tone(score.root + scale[degree % scale.length] + octave + Math.floor(degree / 7) * 12, engine.nextTime, beat * .72, { patch: voice, level: voice.level * .9, release: beat * 1.1 });
    }
  } else if (score.arp && step % 4 === 1) {
    const chordIndex = Math.floor(step / 2) % chord.length;
    tone(chord[chordIndex] + 12, engine.nextTime, beat * .3, { patch: voice, level: voice.level * .34, release: beat * .45, attack: .006 });
  }

  const rhythm = score.rhythm;
  if (rhythm === 'party' || rhythm === 'clap') {
    if (step % 8 === 0 || (rhythm === 'party' && step % 8 === 4)) scheduleKick(engine.nextTime, rhythm === 'party' ? .1 : .055);
    if (step % 8 === 4) noise(engine.nextTime, .12, 'snare', rhythm === 'party' ? .047 : .032);
    if (step % 4 === 2) noise(engine.nextTime, .045, 'hat', .017);
  } else if (rhythm === 'brush' || rhythm === 'waltz' || rhythm === 'dust') {
    if ((step + (rhythm === 'waltz' ? 2 : 0)) % 8 === 4) noise(engine.nextTime, .1, 'snare', rhythm === 'dust' ? .022 : .018);
    if (rhythm !== 'brush' && step % 4 === 2) noise(engine.nextTime, .035, 'hat', .009);
  } else if (rhythm === 'spark' && step % 8 === 6) {
    tone(score.root + 36 + scale[(step + bar) % 7], engine.nextTime, beat * .22, { patch: voiceProfiles.bell, level: .009, release: .42 });
  }
  engine.nextTime += beat / 2;
  engine.step += 1;
}

export async function startMusic(trackId) {
  if (!scores[trackId]) trackId = 'birthday_classic';
  const context = ensureContext();
  if (context.state === 'suspended') {
    await context.resume();
  }
  if (engine.timer) clearInterval(engine.timer);
  engine.active = trackId;
  engine.step = 0;
  engine.nextTime = context.currentTime + .05;
  engine.master.gain.cancelScheduledValues(context.currentTime);
  engine.master.gain.setValueAtTime(0.0001, context.currentTime);
  engine.master.gain.setTargetAtTime(engine.volume, context.currentTime, .18);
  const score = scores[trackId] || scores.birthday_classic;
  engine.timer = setInterval(() => {
    if (!engine.active || !engine.context) return;
    if (engine.context.state === 'suspended') {
      engine.context.resume().catch(() => {});
      return;
    }
    if (engine.context.state !== 'running') return;
    if (engine.nextTime < engine.context.currentTime) {
      engine.nextTime = engine.context.currentTime + 0.02;
    }
    const horizon = engine.context.currentTime + .22;
    while (engine.nextTime < horizon) scheduleStep(score);
  }, 55);
  notify();
}

export async function stopMusic() {
  if (engine.timer) clearInterval(engine.timer);
  engine.timer = null;
  if (engine.context && engine.master) {
    const now = engine.context.currentTime;
    engine.master.gain.cancelScheduledValues(now);
    engine.master.gain.setTargetAtTime(.0001, now, .06);
  }
  engine.active = null;
  notify();
}

export function getActiveTrack() { return engine.active; }
export function getMusicVolume() { return engine.volume; }

export function setMusicVolume(volume) {
  engine.volume = Math.min(1, Math.max(0, Number(volume) || 0));
  if (engine.active && engine.context && engine.master) engine.master.gain.setTargetAtTime(engine.volume, engine.context.currentTime, .06);
}

export async function playInteractionSound(themeId, moment = 'open') {
  const context = ensureContext();
  await context.resume();
  if (!engine.active) {
    engine.master.gain.cancelScheduledValues(context.currentTime);
    engine.master.gain.setTargetAtTime(engine.volume, context.currentTime, .035);
    clearTimeout(cueTimer);
    cueTimer = setTimeout(() => {
      if (!engine.active && engine.context && engine.master) engine.master.gain.setTargetAtTime(.0001, engine.context.currentTime, .12);
    }, 1150);
  }
  const root = themeCueNotes[themeId] || 76;
  const now = context.currentTime + .01;
  const patch = voiceProfiles[themeId === 'cloud' ? 'bright' : themeId === 'teddy' ? 'tape' : themeId === 'starry' ? 'bell' : themeId === 'bunny' ? 'warm' : themeId === 'sakura' ? 'air' : themeId === 'candy' ? 'pluck' : 'piano'];
  if (moment === 'finale') {
    [0, 4, 7, 11].forEach((interval, index) => tone(root - 12 + interval, now + index * .025, .75, { patch, level: .027, release: .95, attack: .04 }));
    tone(root + 24, now + .12, .45, { patch: voiceProfiles.bell, level: .025, release: .8 });
    return;
  }
  if (moment === 'balloon') {
    scheduleKick(now, .025);
    tone(root - 12, now + .015, .08, { patch: { wave: 'sine', overtone: null, cutoff: 200, attack: .003, release: .1, level: .05 }, level: .05, cutoff: 200, release: .1 });
    return;
  }
  if (moment === 'envelope') noise(now, .22, 'hat', .012);
  const steps = moment === 'finale' ? [0, 4, 7] : [0, moment === 'petal' ? 7 : moment === 'secret' ? 12 : 4];
  steps.forEach((interval, index) => tone(root + interval, now + index * .045, .22 + index * .09, { patch, level: .022, release: .4, attack: .012 }));
}

export async function suspendMusicForHiddenPage() {
  if (!engine.active || !engine.context) return;
  const trackId = engine.active;
  await stopMusic();
  engine.active = trackId;
  await engine.context.suspend();
}

export async function resumeMusicForVisiblePage() {
  if (!engine.active || !engine.context) return;
  const trackId = engine.active;
  await engine.context.resume();
  engine.master.gain.setTargetAtTime(engine.volume, engine.context.currentTime, .18);
  engine.step = 0;
  engine.nextTime = engine.context.currentTime + .08;
  const score = scores[trackId];
  engine.timer = setInterval(() => {
    if (!engine.active || engine.context.state !== 'running') return;
    const horizon = engine.context.currentTime + .22;
    while (engine.nextTime < horizon) scheduleStep(score);
  }, 55);
  notify();
}
