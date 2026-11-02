import { describe, expect, it } from "vitest";
import { ACTIVITIES } from "../content/catalogue";
import { makeRng } from "../core/rng";
import { makeQuestion, numberChoices, skillPool } from "./questions";
import { DEFAULT_PLAY_SETTINGS, type PlaySettings } from "./settings";

const numbersIn = (text: string) => (text.match(/\d+/g) ?? []).map(Number);

describe("Hop & Learn questions", () => {
  it("keeps number-line, bonds and compare questions inside 'Numbers up to'", () => {
    for (const maxNumber of [10, 20] as const) {
      const settings: PlaySettings = { ...DEFAULT_PLAY_SETTINGS, maxNumber };
      for (let i = 0; i < 200; i++) {
        for (const id of ["numberline", "bonds", "compare", "money", "stories", "spotbug", "machine"] as const) {
          const question = makeQuestion(id, settings, makeRng(i * 13 + 1));
          expect(Math.max(...numbersIn(`${question.prompt} ${question.answer}`)), `${id}: ${question.prompt}`).toBeLessThanOrEqual(maxNumber);
        }
      }
    }
  });

  it("follows the number-line settings for + / − and the most hops", () => {
    const settings: PlaySettings = { ...DEFAULT_PLAY_SETTINGS, numberLineOps: "sub", maxHops: 3 };
    for (let i = 0; i < 100; i++) {
      const question = makeQuestion("numberline", settings, makeRng(i));
      expect(question.data.op).toBe("−");
      expect(Number(question.data.amount)).toBeLessThanOrEqual(3);
      expect(Number(question.answer)).toBeGreaterThanOrEqual(0);
    }
  });

  it("only asks the chosen times tables", () => {
    const settings: PlaySettings = { ...DEFAULT_PLAY_SETTINGS, tables: [5] };
    for (let i = 0; i < 50; i++) expect(makeQuestion("times", settings, makeRng(i)).data.table).toBe(5);
  });

  it("turns number answers into three big choices that include the answer", () => {
    for (let i = 0; i < 100; i++) {
      const choices = numberChoices(i % 21, 20, makeRng(i));
      expect(new Set(choices).size).toBe(3);
      expect(choices).toContain(String(i % 21));
      choices.forEach(choice => expect(Number(choice)).toBeGreaterThanOrEqual(0));
    }
  });

  it("makes a question for every game at every difficulty", () => {
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      for (const activity of ACTIVITIES) {
        expect(skillPool(activity.id, difficulty).length).toBeGreaterThan(0);
        const question = makeQuestion(activity.id, { ...DEFAULT_PLAY_SETTINGS, difficulty }, makeRng(7));
        expect(question.prompt.length, activity.id).toBeGreaterThan(0);
        if (question.answerKind === "choice") expect(question.choices, activity.id).toContain(question.answer);
      }
    }
  });

  it("only offers real UK coins when asking what a coin is worth", () => {
    for (let i = 0; i < 200; i++) {
      const question = makeQuestion("money", DEFAULT_PLAY_SETTINGS, makeRng(i));
      if (question.skillId === "mn.coins") question.choices!.forEach(choice => expect(["1", "2", "5", "10", "20", "50"]).toContain(choice));
    }
  });
});
