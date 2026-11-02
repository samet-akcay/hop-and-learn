import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GeneratedQuestion } from "../core/types";
import { generateQuestion } from "../content/generate";
import { makeRng } from "../core/rng";
import { AnswerInput } from "./AnswerInput";

afterEach(cleanup);

function question(overrides: Partial<GeneratedQuestion>): GeneratedQuestion {
  return { activityId: "listen", skillId: "li.instruction", key: "q1", level: 2, prompt: "Choose.", spoken: "Choose.", answer: "B", model: "B", hint1: "Look.", hint2: "Look again.", visual: "picture", data: {}, answerKind: "choice", choices: ["A", "B", "C"], ...overrides };
}

describe("child answer controls", () => {
  it("supports number keys for picture choices", () => {
    const onSubmit = vi.fn();
    render(<AnswerInput question={question({})} disabled={false} onSubmit={onSubmit} />);
    fireEvent.keyDown(window, { key: "2" });
    expect(onSubmit).toHaveBeenCalledWith("B");
  });

  it("supports arrow keys and Enter for a rover sequence", () => {
    const onSubmit = vi.fn();
    const rover = question({
      activityId: "rover", skillId: "rv.program", answerKind: "sequence", answer: "→|↑", choices: ["↑", "→", "↓", "←"],
    });
    render(<AnswerInput question={rover} disabled={false} onSubmit={onSubmit} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowUp" });
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("→|↑");
  });

  it.each(["sw.3-slots", "sw.4-slots", "sw.describe", "sw.when"] as const)("builds a grammatical %s sentence from its matching slots", async skillId => {
    const user = userEvent.setup();
    const generated = generateQuestion("sentence", 2, makeRng(skillId.length * 23), [], { skillId });
    const onSubmit = vi.fn();
    render(<AnswerInput question={generated} disabled={false} onSubmit={onSubmit} />);
    const desired = skillId === "sw.describe"
      ? [generated.data.subject, generated.data.verb, generated.data.describing, generated.data.object, generated.data.place]
      : skillId === "sw.when"
        ? [generated.data.subject, generated.data.verb, generated.data.object, generated.data.place, generated.data.when]
        : [generated.data.subject, generated.data.verb, generated.data.object, ...(skillId === "sw.4-slots" ? [generated.data.place] : [])];
    const slots = Array.from(document.querySelectorAll<HTMLElement>(".sentence-choice-slot"));
    for (const [index, item] of desired.entries()) {
      const button = Array.from(slots[index]!.querySelectorAll("button")).find(candidate => candidate.textContent === String(item));
      expect(button).toBeTruthy();
      await user.click(button!);
    }
    await user.click(screen.getByRole("button", { name: "Read it back" }));
    expect(onSubmit).toHaveBeenCalledWith(generated.answer);
  });

  it("lets him say he read it, or ask for help to sound it out", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnswerInput question={question({ answerKind: "grownup", answer: "He read it", choices: undefined })} disabled={false} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Help me sound it out" }));
    expect(onSubmit).toHaveBeenCalledWith("Let's sound it out");
  });
});
