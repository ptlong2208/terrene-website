import rawWords from '@/lib/data/vnOffensiveWords.json';

// Word list vendored from https://github.com/blue-eyes-vn/vietnamese-offensive-words
// See lib/data/vnOffensiveWords.LICENSE.txt for the full MIT license text.

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const normalizedWords = [...new Set(rawWords.map(normalize))].filter((w) => w.length >= 2);

// eslint-disable-next-line security/detect-non-literal-regexp -- built from our own vendored word list, not user input
const pattern = new RegExp(`\\b(${normalizedWords.map(escapeRegex).join('|')})\\b`);

export function containsVietnameseProfanity(text: string): boolean {
  return pattern.test(normalize(text));
}
