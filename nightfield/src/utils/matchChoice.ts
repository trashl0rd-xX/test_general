import type { NarrativeChoice } from '../types/narrative';

const STOP_WORDS = new Set([
  'i', 'my', 'me', 'you', 'your', 'the', 'a', 'an', 'and', 'or', 'of',
  'in', 'into', 'at', 'on', 'it', 'its', 'do', 'just', 'very', 'really',
  'try', 'to', 'up', 'is', 'am', 'are', 'be', 'out',
]);

// Groups of interchangeable words — any two words from the same group match each other
const SYNONYM_GROUPS: string[][] = [
  ['move', 'walk', 'go', 'head', 'travel', 'step', 'enter', 'proceed', 'approach'],
  ['search', 'look', 'examine', 'check', 'find', 'investigate', 'inspect', 'explore', 'see', 'peer'],
  ['listen', 'hear', 'wait', 'pause', 'stay', 'stand', 'still', 'quiet', 'silent', 'stop'],
  ['back', 'return', 'retreat', 'leave', 'exit', 'away', 'south'],
  ['crawl', 'hide', 'duck', 'crouch', 'inside', 'hollow', 'log'],
  ['kneel', 'drink', 'water', 'creek', 'sip', 'taste'],
  ['read', 'paper', 'note', 'writing', 'writing'],
  ['cross', 'wade', 'ford', 'over', 'across'],
  ['run', 'flee', 'escape', 'rush', 'sprint', 'bolt', 'dash'],
  ['continue', 'advance', 'forward', 'push', 'deeper', 'further', 'press', 'north'],
  ['light', 'glow', 'amber', 'bright', 'shining', 'burning', 'fire'],
  ['east', 'right', 'edge', 'side'],
  ['field', 'open', 'grass', 'clearing', 'outside'],
  ['stone', 'ring', 'circle', 'stones', 'rocks', 'markings', 'names'],
  ['take', 'grab', 'pick', 'get', 'collect'],
  ['shack', 'cabin', 'building', 'house', 'door', 'structure'],
  ['fence', 'wire', 'posts', 'keyring', 'key'],
  ['follow', 'trace', 'along', 'beside'],
];

function getSynonymGroup(word: string): number {
  for (let i = 0; i < SYNONYM_GROUPS.length; i++) {
    if (SYNONYM_GROUPS[i].includes(word)) return i;
  }
  return -1;
}

function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const ga = getSynonymGroup(a);
  const gb = getSynonymGroup(b);
  return ga !== -1 && ga === gb;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function scoreMatch(inputTokens: string[], choiceTokens: string[]): number {
  if (choiceTokens.length === 0) return 0;
  let matched = 0;
  for (const it of inputTokens) {
    if (choiceTokens.some((ct) => wordsMatch(it, ct))) matched++;
  }
  return matched / choiceTokens.length;
}

const THRESHOLD = 0.18;

export function matchChoice(input: string, choices: NarrativeChoice[]): number | null {
  const inputTokens = tokenize(input);
  if (inputTokens.length === 0) return null;

  let bestScore = -1;
  let bestIndex: number | null = null;

  for (const choice of choices) {
    if (choice.isPhantom) continue;
    const choiceTokens = tokenize(choice.text);
    const score = scoreMatch(inputTokens, choiceTokens);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = choice.index;
    }
  }

  return bestScore >= THRESHOLD ? bestIndex : null;
}
