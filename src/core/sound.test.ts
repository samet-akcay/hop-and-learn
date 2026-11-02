import { describe, expect, it } from "vitest";
import { limitedFrequency, SOUND_LIMITS } from "./sound";

describe("gentle sound limits", () => {
  it("keeps every oscillator between 110 and 700 Hz", () => {
    expect(limitedFrequency(40)).toBe(110);
    expect(limitedFrequency(440)).toBe(440);
    expect(limitedFrequency(1400)).toBe(700);
    expect(SOUND_LIMITS.filterHz).toBeLessThanOrEqual(2500);
    expect(SOUND_LIMITS.masterGain).toBeLessThanOrEqual(0.25);
    expect(SOUND_LIMITS.minimumAttackSeconds).toBeGreaterThanOrEqual(0.015);
  });
});
