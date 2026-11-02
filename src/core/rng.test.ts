import { describe, expect, it } from "vitest";
import { makeRng } from "./rng";

describe("seeded random generator", () => {
  it("is repeatable", () => {
    const a = makeRng(42);
    const b = makeRng(42);
    expect(Array.from({ length: 10 }, () => a.int(1, 100))).toEqual(Array.from({ length: 10 }, () => b.int(1, 100)));
  });
  it("keeps inclusive bounds", () => {
    const rng = makeRng(4);
    for (let i = 0; i < 200; i++) expect(rng.int(1, 3)).toBeGreaterThanOrEqual(1);
    const other = makeRng(4);
    for (let i = 0; i < 200; i++) expect(other.int(1, 3)).toBeLessThanOrEqual(3);
  });
});
