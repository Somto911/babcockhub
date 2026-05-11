export const GRADS = [
  'linear-gradient(135deg,#1a56ff,#5b7fff)',
  'linear-gradient(135deg,#f04040,#f59500)',
  'linear-gradient(135deg,#8b5cf6,#06b6d4)',
  'linear-gradient(135deg,#00c27a,#1a56ff)',
  'linear-gradient(135deg,#f59500,#f04040)',
  'linear-gradient(135deg,#06b6d4,#8b5cf6)',
];

export const grad = (n) => {
  let h = 0;
  for (const c of n) h = (h * 31 + c.charCodeAt(0)) % GRADS.length;
  return GRADS[h];
};

export const ini = (n) =>
  n
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const api = async (path, opts = {}) => {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || 'Request failed');
    if (data?.needsVerification) err.needsVerification = true;
    throw err;
  }
  return data;
};

export const taglines = [
  'Your campus. Your community.',
  'Where Babcock vibes live online',
  'Connect. Gist. Belong.',
  'From hostel life to campus fame',
  'The real Babcock experience',
  'Gist, polls & campus vibes',
  'Your people are here',
  'Stay in the loop. Always.',
];

export const pulseMessages = [
  '📚 3 study groups created in the last hour',
  '🔥 #TechNight is trending — 284 posts today',
  '🏠 Goodluck Hall power restored 2 hours ago',
  '🎉 612 students are currently active on campus',
  '📊 New poll: 78% prefer jollof over fried rice',
];

export const months = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
