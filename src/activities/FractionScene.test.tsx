import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateQuestion } from "../content/generate";
import { makeRng } from "../core/rng";
import type { GeneratedQuestion } from "../core/types";
import { FractionScene, pieSlicePath } from "./FractionScene";

afterEach(cleanup);

function makeFractionQuestion(skillId: string, data: GeneratedQuestion["data"], extras: Partial<GeneratedQuestion> = {}): GeneratedQuestion {
  return {
    key: `test-${skillId}-${JSON.stringify(data)}`,
    activityId: "fractions",
    skillId,
    level: 2,
    prompt: "Test fraction question",
    spoken: "Test fraction question",
    answer: "1/2",
    answerKind: "choice",
    choices: ["1/2", "1/3", "1/4"],
    model: "Test model.",
    hint1: "Hint 1",
    hint2: "Hint 2",
    visual: "fraction",
    data,
    ...extras,
  };
}

describe("FractionScene", () => {
  it("computes valid SVG arc paths for circular pie slices", () => {
    const half = pieSlicePath(100, 100, 80, 0, 180);
    expect(half).toContain("M 100 100");
    expect(half).toContain("A 80 80 0 0 1");
    const big = pieSlicePath(100, 100, 80, 0, 210);
    expect(big).toContain("A 80 80 0 1 1");
  });

  it("renders equal and unequal SVG diagrams for fr.equal across bars, circles and squares", () => {
    for (const shape of ["bar", "circle", "square"] as const) {
      for (const equal of [true, false]) {
        const question = makeFractionQuestion("fr.equal", { shape, parts: 4, denominator: 4, equal, unequal: !equal });
        const { container } = render(<FractionScene question={question} suit="space" />);
        const svg = container.querySelector("svg.fraction-svg");
        expect(svg, `${shape} equal=${equal}`).toBeTruthy();
        const parts = container.querySelectorAll("[data-part]");
        expect(parts).toHaveLength(4);
        expect(parts[0]?.getAttribute("data-equal")).toBe(String(equal));
        cleanup();
      }
    }
  });

  it("draws bar segments with equal widths when equal and distinct widths when unequal", () => {
    const equalQ = makeFractionQuestion("fr.equal", { shape: "bar", parts: 3, denominator: 3, equal: true });
    const equalRender = render(<FractionScene question={equalQ} suit="space" />);
    const equalWidths = [...equalRender.container.querySelectorAll("[data-part] rect")].map(el => Number(el.getAttribute("width")));
    expect(Math.max(...equalWidths) - Math.min(...equalWidths)).toBeLessThan(0.1);
    cleanup();

    const unequalQ = makeFractionQuestion("fr.equal", { shape: "bar", parts: 3, denominator: 3, equal: false });
    const unequalRender = render(<FractionScene question={unequalQ} suit="space" />);
    const unequalWidths = [...unequalRender.container.querySelectorAll("[data-part] rect")].map(el => Number(el.getAttribute("width")));
    expect(Math.max(...unequalWidths) - Math.min(...unequalWidths)).toBeGreaterThan(80);
  });

  it("renders shaded fraction shapes with exact numerator/denominator counts and tap-to-count badges", async () => {
    const user = userEvent.setup();
    const question = makeFractionQuestion("fr.shapes", { shape: "circle", numerator: 3, denominator: 4 });
    const { container } = render(<FractionScene question={question} suit="robot" />);
    expect(container.querySelectorAll('[data-shaded="true"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-shaded="false"]')).toHaveLength(1);

    const firstPart = container.querySelector("[data-shaded='true']")!;
    await user.click(firstPart);
    expect(container.textContent).toContain("Counted 1 part");
    expect(container.querySelector(".fraction-part-num")?.textContent).toBe("1");
  });

  it("lets him share counters round-by-round into equal groups for fr.sets", async () => {
    const user = userEvent.setup();
    const onStep = vi.fn();
    const onWorkComplete = vi.fn();
    const question = makeFractionQuestion("fr.sets", { whole: 12, denominator: 4, numerator: 1, part: 3 });
    const { container } = render(<FractionScene question={question} suit="space" onStep={onStep} onWorkComplete={onWorkComplete} />);

    expect(container.querySelectorAll("[data-group]")).toHaveLength(4);
    expect(container.querySelectorAll('[data-target="true"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-token="shared"]')).toHaveLength(0);

    const shareButton = screen.getByRole("button", { name: /^SHARE/ });
    await user.click(shareButton);
    expect(container.querySelectorAll('[data-token="shared"]')).toHaveLength(4);
    expect(onStep).toHaveBeenCalledWith(1);

    // Space key deals another round
    fireEvent.keyDown(window, { key: " " });
    expect(container.querySelectorAll('[data-token="shared"]')).toHaveLength(8);

    await user.click(shareButton);
    expect(container.querySelectorAll('[data-token="shared"]')).toHaveLength(12);
    expect(onWorkComplete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /^SHARE/ })).toBeNull();
    expect(container.textContent).toContain("All shared!");
  });

  it("renders aligned guide line for equivalent fractions and separate guide lines for non-equivalent fractions", () => {
    const sameQ = makeFractionQuestion("fr.equivalent", { numerator: 2, denominator: 4, numerator2: 1, denominator2: 2, same: true });
    const sameRender = render(<FractionScene question={sameQ} suit="space" />);
    expect(sameRender.container.querySelectorAll(".fraction-guide-line")).toHaveLength(1);
    cleanup();

    const diffQ = makeFractionQuestion("fr.equivalent", { numerator: 2, denominator: 4, numerator2: 1, denominator2: 3, same: false });
    const diffRender = render(<FractionScene question={diffQ} suit="space" />);
    expect(diffRender.container.querySelectorAll(".fraction-guide-line")).toHaveLength(2);
  });

  it("renders a 0-to-1 fraction number line with the hero for fr.line", () => {
    const question = generateQuestion("fractions", 2, makeRng(19), [], { skillId: "fr.line" });
    const { container } = render(<FractionScene question={question} suit="dino" />);
    expect(container.querySelector("svg.fraction-line-svg")).toBeTruthy();
    expect(container.querySelector(".captain-hop.hop-dino")).toBeTruthy();
    expect(container.textContent).toContain("0");
    expect(container.textContent).toContain("1");
  });
});
