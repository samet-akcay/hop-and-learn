import { describe, expect, it } from "vitest";
import { hopPose } from "./hop";

describe("number-line hop animation", () => {
  it("starts and lands at the exact number-line positions", () => {
    expect(hopPose(80, 140, 0)).toEqual({ x: 80, y: 0, scaleX: 1, scaleY: 1 });
    expect(hopPose(80, 140, 1)).toEqual({ x: 140, y: 0, scaleX: 1, scaleY: 1 });
  });
  it("travels between ticks and lifts the character in an arc", () => {
    const midpoint = hopPose(80, 140, 0.5);
    expect(midpoint.x).toBe(110);
    expect(midpoint.y).toBeCloseTo(-44);
    expect(midpoint.scaleX).toBeGreaterThan(1);
    expect(midpoint.scaleY).toBeLessThan(1);
  });
  it("clamps frames beyond the animation endpoints", () => {
    expect(hopPose(80, 140, -1).x).toBe(80);
    expect(hopPose(80, 140, 2).x).toBe(140);
  });
});
