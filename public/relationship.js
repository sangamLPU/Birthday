const family = { reasons: 'A few things I really appreciate about you.', signature: 'With love from your family.', completion: 'Here’s to another year of good moments together. ✦', note: 'I’m grateful for all the family memories we share.' };
const language = {
  Partner: { reasons: 'Little things I love about you.', signature: 'With all my heart.', completion: 'And that’s the whole story. I’m so glad you’re in mine. ✦', note: 'I feel lucky to share all the little moments of life with you.' },
  'Best friend': { reasons: 'A few things that make having you in my life so good.', signature: 'From your very lucky best friend.', completion: 'Here’s to all the friendship and adventures still ahead. ✦', note: 'I’m lucky to call you my best friend.' },
  Friend: { reasons: 'A few things that make you wonderfully you.', signature: 'With warm birthday wishes, from your friend.', completion: 'Here’s to more laughs and good days with a friend like you. ✦', note: 'I’m so glad life gave me a friend like you.' },
  Sibling: { ...family, note: 'Being your sibling has given me some of my favorite memories.' },
  Parent: { ...family, note: 'Thank you for all the ways you have shown up for me.' },
  Cousin: family,
  Colleague: { reasons: 'A few things worth celebrating about you.', signature: 'With appreciation and warm birthday wishes.', completion: 'Wishing you a wonderful day and a rewarding year ahead. ✦', note: 'It’s a joy to work alongside someone as thoughtful as you.' },
  Other: { reasons: 'A few things worth celebrating about you.', signature: 'With warm birthday wishes.', completion: 'Here’s to a year full of good things for you. ✦', note: 'Wishing you a wonderful day and a year full of good things.' }
};
export function relationshipLanguage(relationship) {
  const selected = language[relationship] || language.Other;
  return { ...selected, letter: `Wishing you a day full of little joys, big laughs, and your favorite things. ${selected.note}` };
}

export function safePhotoUrl(value) {
  if (typeof value !== 'string') return false;
  if (/^\/uploads\/[a-f0-9-]+\.(?:webp|png|jpe?g)$/.test(value) || /^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(url.hostname) && !url.port && !url.username && !url.password && !url.search && !url.hash && /^\/birthdays\/[a-f0-9-]+\.(?:webp|png|jpe?g)$/.test(url.pathname);
  } catch { return false; }
}
