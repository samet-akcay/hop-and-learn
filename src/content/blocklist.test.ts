import { describe, expect, it } from "vitest";
import { BLOCKED_ALIEN_WORDS, isBlockedAlienWord, isCommonRealWord } from "./blocklist";
import { WORD_LISTS } from "./generate";

describe("alien safety lists", () => {
  it("blocks inappropriate generated text case-insensitively", () => {
    for (const word of BLOCKED_ALIEN_WORDS) {
      expect(isBlockedAlienWord(word.toUpperCase())).toBe(true);
      expect(isCommonRealWord(word)).toBe(false);
    }
  });
  it("keeps the hand-checked pseudo-word bank out of common exception words", () => {
    for (const word of WORD_LISTS.alien) {
      expect(isBlockedAlienWord(word)).toBe(false);
      expect(isCommonRealWord(word)).toBe(false);
    }
  });
});
