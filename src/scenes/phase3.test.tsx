import { cleanup, render, screen } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { generateQuestion } from "../content/generate";
import { makeRng } from "../core/rng";
import { MeasureScene } from "./MeasureScene";
import { RoverScene } from "./RoverScene";
import { ShapesScene } from "./ShapesScene";
import { SpotBugScene } from "./SpotBugScene";
import { TurnsScene } from "./TurnsScene";

afterEach(cleanup);

describe("Phase 3 SVG scenes", () => {
  it("steps the hero across the 5x5 mission grid in RoverScene", async () => {
    const user = userEvent.setup();
    const q = generateQuestion("rover", 2, makeRng(17), [], { skillId: "rv.sequence" });
    const { container } = render(<RoverScene question={q} suit="robot" level={2} />);
    expect(container.querySelector("svg.rover-svg")).toBeTruthy();
    expect(container.querySelector('[data-pos="0-4"]')).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /^STEP/ }));
    expect(container.querySelector('[data-pos="0-4"]')).toBeNull();
  });

  it("renders a compass with preview turn and accurate spatial grids in TurnsScene", async () => {
    const user = userEvent.setup();
    const turnQ = generateQuestion("turns", 2, makeRng(5), [], { skillId: "tu.turns" });
    const { container } = render(<TurnsScene question={turnQ} suit="space" level={2} />);
    const before = container.querySelector(".turn-pointer")?.getAttribute("data-angle");
    await user.click(screen.getByRole("button", { name: /TRY TURN/ }));
    const after = container.querySelector(".turn-pointer")?.getAttribute("data-angle");
    expect(after).not.toBe(before);
    cleanup();

    const posQ = generateQuestion("turns", 2, makeRng(9), [], { skillId: "tu.position" });
    const posRender = render(<TurnsScene question={posQ} suit="dino" level={2} />);
    expect(posRender.container.querySelector("svg.position-svg")).toBeTruthy();
    expect(posRender.container.querySelector(`[data-hero-pos="${posQ.data.position}"]`)).toBeTruthy();
  });

  it("renders tappable 2D sides, isometric 3D solids, symmetry fold, and pattern strips in ShapesScene", async () => {
    const user = userEvent.setup();
    const polyQ = generateQuestion("shapes", 2, makeRng(11), [], { skillId: "sh.2d-props" });
    const poly = render(<ShapesScene question={polyQ} suit="pond" level={2} />);
    await user.click(poly.container.querySelector('[data-edge="0"]')!);
    expect(poly.container.textContent).toContain("Counted 1 side");
    cleanup();

    const solidQ = generateQuestion("shapes", 2, makeRng(21), [], { skillId: "sh.3d-props" });
    const solid = render(<ShapesScene question={solidQ} suit="space" level={2} />);
    expect(solid.container.querySelector(`[data-solid="${solidQ.data.shape}"]`)).toBeTruthy();
    cleanup();

    const symQ = generateQuestion("shapes", 2, makeRng(31), [], { skillId: "sh.symmetry" });
    const sym = render(<ShapesScene question={symQ} suit="webhero" level={2} />);
    await user.click(screen.getByRole("button", { name: /^FOLD/ }));
    expect(sym.container.textContent).toMatch(/cover each other|do not match/);
    cleanup();

    const patQ = generateQuestion("shapes", 2, makeRng(41), [], { skillId: "sh.patterns" });
    const pat = render(<ShapesScene question={patQ} suit="speed" level={2} />);
    expect(pat.container.querySelectorAll("[data-pattern-item]").length).toBeGreaterThanOrEqual(4);
  });

  it("renders ruler, dial scale, measuring jug, and thermometer SVGs in MeasureScene", () => {
    for (const [skillId, selector] of [
      ["ms.ruler", "svg.measure-svg"],
      ["ms.scales", "svg.measure-dial-svg"],
      ["ms.jugs", "svg.measure-jug-svg"],
      ["ms.temp", "svg.measure-temp-svg"],
    ] as const) {
      const q = generateQuestion("measure", 2, makeRng(7), [], { skillId });
      const { container } = render(<MeasureScene question={q} suit="space" level={2} />);
      expect(container.querySelector(selector), skillId).toBeTruthy();
      cleanup();
    }
  });

  it("shows hero speech bubble and reveals visual proof on CHECK IT in SpotBugScene", async () => {
    const user = userEvent.setup();
    const q = generateQuestion("spotbug", 2, makeRng(13), [], { skillId: "sb.add-sub" });
    const { container } = render(<SpotBugScene question={q} suit="monster" level={2} />);
    expect(container.querySelector("svg.spotbug-svg")).toBeTruthy();
    expect(container.querySelector('[data-proof="true"]')).toBeNull();
    await user.click(screen.getByRole("button", { name: /CHECK IT/ }));
    expect(container.querySelector('[data-proof="true"]')).toBeTruthy();
  });
});
