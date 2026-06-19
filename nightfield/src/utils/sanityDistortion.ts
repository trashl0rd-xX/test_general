import { seededRandom } from './seededRandom';

const GLYPH_SUBS: Record<string, string[]> = {
  e: ['3', 'ε', 'e̴'],
  o: ['0', 'ø', 'o̷'],
  a: ['@', 'α', 'a̸'],
  i: ['1', 'ɨ', 'i̶'],
  s: ['5', 'ƨ', 's̵'],
};

const CORRUPT = ['̸', '̷', '̴', '̲', '̳'];

export function distortText(raw: string, sanity: number, seed: number): string {
  if (sanity > 70) return raw;

  const intensity = (70 - sanity) / 70;
  let result = '';

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    const roll = seededRandom(seed + i);
    const lower = char.toLowerCase();

    if (roll < intensity * 0.12 && GLYPH_SUBS[lower]) {
      const subs = GLYPH_SUBS[lower];
      const sub = subs[Math.floor(seededRandom(seed + i + 1000) * subs.length)];
      result += char === char.toUpperCase() ? sub.toUpperCase() : sub;
    } else if (roll < intensity * 0.04) {
      result += char + CORRUPT[Math.floor(seededRandom(seed + i + 2000) * CORRUPT.length)];
    } else {
      result += char;
    }
  }

  return result;
}
