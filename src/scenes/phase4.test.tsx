import { cleanup, render, screen } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { generateQuestion } from "../content/generate";
import { makeRng } from "../core/rng";
import { BinaryScene } from "./BinaryScene";
import { ChartsScene } from "./ChartsScene";
import { LogicScene } from "./LogicScene";
import { MachineScene } from "./MachineScene";
import { StepsScene } from "./StepsScene";
import { StoriesScene } from "./StoriesScene";

afterEach(cleanup);

describe("Phase 4 SVG scenes", () => {
  it("renders tally, pictogram, and block bar charts in ChartsScene", () => {
    for (const [skillId, attr] of [
      ["ch.tally", "[data-tally-row]"],
      ["ch.pictogram", "[data-picto-col]"],
      ["ch.block", "[data-bar]"],
    ] as const) {
      const q = generateQuestion("charts", 2, makeRng(15), [], { skillId });
      const { container } = render(<ChartsScene question={q} suit="speed" level={2} />);
      expect(container.querySelector("svg.chart-svg"), skillId).toBeTruthy();
      expect(container.querySelectorAll(attr).length).toBe(3);
      cleanup();
    }
  });

  it("renders part-whole and equal-groups bar models in StoriesScene", () => {
    const addQ = generateQuestion("stories", 2, makeRng(3), [], { skillId: "st.add-sub" });
    const add = render(<StoriesScene question={addQ} suit="space" level={2} />);
    expect(add.container.querySelector("svg.stories-svg")).toBeTruthy();
    cleanup();

    const multQ = generateQuestion("stories", 2, makeRng(8), [], { skillId: "st.mult-div" });
    const mult = render(<StoriesScene question={multQ} suit="dino" level={2} />);
    expect(mult.container.querySelectorAll("[data-story-box]").length).toBe(Number(multQ.data.groups));
  });

  it("renders interactive machine and rule table in MachineScene", async () => {
    const user = userEvent.setup();
    const runQ = generateQuestion("machine", 2, makeRng(2), [], { skillId: "mc.run" });
    const run = render(<MachineScene question={runQ} suit="robot" level={2} />);
    expect(run.container.querySelector("svg.machine-svg")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /^RUN/ }));
    cleanup();

    const ruleQ = generateQuestion("machine", 2, makeRng(6), [], { skillId: "mc.rule" });
    const rule = render(<MachineScene question={ruleQ} suit="robot" level={2} />);
    expect(rule.container.querySelectorAll("[data-machine-row]")).toHaveLength(3);
  });

  it("renders shape sudoku and logic sort cards in LogicScene and flow cards in StepsScene", () => {
    const sudokuQ = generateQuestion("logic", 2, makeRng(4), [], { skillId: "lg.sudoku4" });
    const sudoku = render(<LogicScene question={sudokuQ} suit="webhero" level={2} />);
    expect(sudoku.container.querySelectorAll("[data-sudoku-cell]")).toHaveLength(4);
    cleanup();

    const stepsQ = generateQuestion("steps", 2, makeRng(12), [], { skillId: "sp.order" });
    const steps = render(<StepsScene question={stepsQ} suit="pond" level={2} />);
    expect(steps.container.querySelectorAll("[data-step-card]")).toHaveLength(3);
  });

  it("renders 8-4-2-1 glowing signal lamps matching the target bits in BinaryScene", () => {
    const q = generateQuestion("binary", 2, makeRng(29), [], { skillId: "bn.read" });
    const bits = q.data.bits as number[];
    const { container } = render(<BinaryScene question={q} suit="space" level={2} />);
    expect(container.querySelector("svg.binary-svg")).toBeTruthy();
    expect(container.querySelectorAll('[data-on="true"]')).toHaveLength(bits.length);
  });
});
