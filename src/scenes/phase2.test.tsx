import { cleanup, render } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { generateQuestion } from "../content/generate";
import { makeRng } from "../core/rng";
import { CompareScene } from "./CompareScene";
import { MoneyScene, decomposeUkCoins } from "./MoneyScene";
import { PlaceValueScene } from "./PlaceValueScene";
import { TimeScene } from "./TimeScene";

afterEach(cleanup);

describe("Phase 2 scenes", () => {
  it("renders PlaceValueScene with exact tens rods, ones cubes and tap-to-count", async () => {
    const user = userEvent.setup();
    const q = generateQuestion("placevalue", 2, makeRng(15), [], { skillId: "pv.tens-ones" });
    const tens = Number(q.data.tens);
    const ones = Number(q.data.ones);
    const { container } = render(<PlaceValueScene question={q} suit="space" level={2} />);
    expect(container.querySelector("svg.placevalue-svg")).toBeTruthy();
    expect(container.querySelectorAll('[data-block="ten"]')).toHaveLength(tens);
    expect(container.querySelectorAll('[data-block="one"]')).toHaveLength(ones);

    const firstTen = container.querySelector('[data-block="ten"]');
    if (firstTen) {
      await user.click(firstTen);
      expect(container.textContent).toContain("Counted 1 block");
    }
  });

  it("tilts CompareScene toward the heavier side and levels when equal", () => {
    const heavierLeft = {
      ...generateQuestion("compare", 2, makeRng(3), [], { skillId: "cmp.numbers" }),
      data: { a: 42, b: 19 },
    };
    const leftRender = render(<CompareScene question={heavierLeft} suit="monster" level={2} />);
    expect(Number(leftRender.container.querySelector(".balance-beam-line")?.getAttribute("data-tilt"))).toBeLessThan(0);
    cleanup();

    const heavierRight = { ...heavierLeft, data: { a: 12, b: 37 } };
    const rightRender = render(<CompareScene question={heavierRight} suit="monster" level={2} />);
    expect(Number(rightRender.container.querySelector(".balance-beam-line")?.getAttribute("data-tilt"))).toBeGreaterThan(0);
    cleanup();

    const equal = { ...heavierLeft, data: { a: 25, b: 25 } };
    const eqRender = render(<CompareScene question={equal} suit="monster" level={2} />);
    expect(Number(eqRender.container.querySelector(".balance-beam-line")?.getAttribute("data-tilt"))).toBe(0);
  });

  it("renders authentic UK coins across MoneyScene skills", () => {
    expect(decomposeUkCoins(70)).toEqual([50, 20]);
    expect(decomposeUkCoins(125)).toEqual([100, 20, 5]);
    for (const skillId of ["mn.coins", "mn.total", "mn.make", "mn.ways", "mn.change", "mn.pounds-pence"] as const) {
      const q = generateQuestion("money", 2, makeRng(skillId.length * 17), [], { skillId });
      const { container } = render(<MoneyScene question={q} suit="robot" level={2} />);
      expect(container.querySelector("svg.money-svg"), skillId).toBeTruthy();
      cleanup();
    }
  });

  it("renders TimeScene with quarter/half sector shading and tappable 5-minute ring", async () => {
    const user = userEvent.setup();
    const q = {
      ...generateQuestion("time", 2, makeRng(5), [], { skillId: "tm.quarters" }),
      data: { hour: 3, minutes: 15 },
    };
    const { container } = render(<TimeScene question={q} suit="dino" level={2} />);
    expect(container.querySelector("svg.clock-svg")).toBeTruthy();
    expect(container.querySelector('[data-clock-sector="true"]')).toBeTruthy();
    expect(container.querySelectorAll(".clock-min-hint")).toHaveLength(0);

    await user.click(container.querySelector("svg.clock-svg")!);
    expect(container.querySelectorAll(".clock-min-hint")).toHaveLength(12);
  });
});
