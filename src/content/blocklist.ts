const BLOCKED_ALIEN_WORDS = ["sex", "cunt", "fuck", "shit", "damn", "hell", "rape", "nazi", "kill", "death", "hate"] as const;

// Common curriculum words, short decodable words and exception words are kept
// out of the generated fallback vocabulary so it remains visibly alien.
const COMMON_REAL_WORDS = [
  "cat", "dog", "sun", "hat", "bed", "pin", "sit", "run", "man", "map", "can", "tap", "bat", "rat", "fan", "sad", "bad", "mad", "jam", "ten", "pen", "net", "pet", "hop", "hot", "not", "pot", "top", "win", "fin", "lip", "pig", "big", "box", "fox", "log", "leg", "red", "get", "wet", "cut", "cup", "bus", "bug", "rug", "mud", "fun", "mix", "six", "tax", "act", "ant", "and", "end", "old", "new", "yes", "yet", "the", "this", "that",
] as const;

const blocked = new Set<string>(BLOCKED_ALIEN_WORDS);
const common = new Set<string>(COMMON_REAL_WORDS);

export function isBlockedAlienWord(word: string): boolean { return blocked.has(word.toLowerCase()); }
export function isCommonRealWord(word: string): boolean { return common.has(word.toLowerCase()); }
export { BLOCKED_ALIEN_WORDS, COMMON_REAL_WORDS };
