import { describe, expect, it } from "vitest";
import { ACTIVITIES } from "./catalogue";
import { SKILLS } from "./skills";
import { BLOCKED_ALIEN_WORDS, generateQuestion, segmentGraphemes, WORD_LISTS } from "./generate";
import { makeRng } from "../core/rng";

const levels = [1, 2, 3, 4, 5] as const;

describe("question generators", () => {
  it.each(ACTIVITIES.map(activity => [activity.id] as const))("generates playable %s questions", activityId => {
    const rng = makeRng(217);
    for (const level of levels) {
      const question = generateQuestion(activityId, level, rng);
      expect(question.activityId).toBe(activityId);
      expect(question.key.length).toBeGreaterThan(0);
      expect(question.prompt.length).toBeGreaterThan(0);
      expect(question.model.length).toBeGreaterThan(0);
      if (question.answerKind === "choice") {
        expect(question.choices).toContain(question.answer);
        expect(new Set(question.choices).size).toBe(question.choices?.length);
      }
      if (question.answerKind === "sequence") {
        expect(question.choices?.length).toBeGreaterThan(0);
        expect(question.answer.split("|").length).toBeGreaterThan(1);
      }
    }
  });

  it.each(ACTIVITIES.map(activity => [activity.id] as const))("can generate a different twin for %s", activityId => {
    const rng = makeRng(31337);
    const original = generateQuestion(activityId, 2, rng);
    const twin = generateQuestion(activityId, 2, rng, [original.key]);
    expect(twin.key).not.toBe(original.key);
  });

  it("generates the requested missing-number skill instead of substituting another skill", () => {
    const question = generateQuestion("numberline", 2, makeRng(41), [], { skillId: "nl.missing" });
    expect(question.skillId).toBe("nl.missing");
    expect(question.prompt).toMatch(/[□?]/);
    expect(question.answerKind).toBe("number");
  });

  it.each(SKILLS.map(skill => [skill.id, skill.activityId] as const))("generates a question for skill %s", (skillId, activityId) => {
    const question = generateQuestion(activityId, 2, makeRng(skillId.length * 37), [], { skillId });
    expect(question.skillId).toBe(skillId);
    expect(question.prompt.length).toBeGreaterThan(0);
    expect(question.answer.length).toBeGreaterThan(0);
    if (question.answerKind === "choice") expect(question.choices).toContain(question.answer);
  });

  it("generates unique, non-repeating questions for every Star Map skill", () => {
    const rng = makeRng(90210);
    for (const skill of SKILLS) {
      const question = generateQuestion(skill.activityId, 2, rng, [], { skillId: skill.id });
      const twin = generateQuestion(skill.activityId, question.level, rng, [question.key], { skillId: skill.id });
      expect(question.skillId).toBe(skill.id);
      expect(twin.key).not.toBe(question.key);
      if (question.answerKind === "choice") {
        expect(new Set(question.choices).size).toBe(question.choices?.length);
        expect(question.choices).toContain(question.answer);
      }
    }
  });

  it("routes each typing and letter skill to its own task", () => {
    const rng = makeRng(664);
    const key = generateQuestion("typing", 2, rng, [], { skillId: "ty.keys" });
    expect(key.prompt).toContain(String(key.data.word));
    const word = generateQuestion("typing", 2, rng, [], { skillId: "ty.words" });
    expect(word.prompt).toContain(String(word.data.word));
    const command = generateQuestion("typing", 2, rng, [], { skillId: "ty.commands" });
    expect(command.prompt).toContain("robot command");
    const sentence = generateQuestion("typing", 2, rng, [], { skillId: "ty.sentence" });
    expect(sentence.answer).toContain(" ");
    const dictation = generateQuestion("typing", 2, rng, [], { skillId: "ty.dictation" });
    expect(dictation.prompt).not.toContain(dictation.answer);
    expect(dictation.data.concealed).toBe(true);
    expect(generateQuestion("letters", 2, rng, [], { skillId: "lt.digits" }).answer).toMatch(/^\d$/);
  });

  it("offers the full set of 12 ordered story sequences and matching story choices", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const question = generateQuestion("story", 2, makeRng(seed + 501), [], { skillId: "sm.order" });
      const sequence = question.data.sequence as string[];
      const scrambled = question.data.scrambled as string[];
      expect(sequence.length).toBeGreaterThanOrEqual(3);
      expect(sequence.length).toBeLessThanOrEqual(4);
      expect(scrambled).toEqual([...sequence].reverse());
      expect(question.answer.split("|")).toEqual(sequence);
      seen.add(sequence[0]!);
      const tell = generateQuestion("story", 2, makeRng(seed + 1501), [], { skillId: "sm.tell" });
      expect(tell.choices).toContain(tell.answer);
      expect(tell.answer).toContain("First");
      expect(tell.answer).toContain("Last");
    }
    expect(seen.size).toBe(12);
  });

  it("uses grown-up-supported aloud reading in together mode", () => {
    for (const [activityId, skillId] of [["alien", "al.hear"], ["tricky", "tw.find"]] as const) {
      const together = generateQuestion(activityId, 2, makeRng(skillId.length * 71), [], { skillId, mode: "together" });
      const solo = generateQuestion(activityId, 2, makeRng(skillId.length * 71), [], { skillId, mode: "solo" });
      expect(together.answerKind).toBe("grownup");
      expect(together.answer).toBe("He read it");
      expect(typeof together.data.word).toBe("string");
      expect(solo.answerKind).toBe("choice");
    }
  });

  it("segments common digraphs and split digraphs for the sound boxes", () => {
    expect(segmentGraphemes("ship")).toEqual(["sh", "i", "p"]);
    expect(segmentGraphemes("stamp")).toEqual(["s", "t", "a", "m", "p"]);
    expect(segmentGraphemes("cake")).toEqual(["c", "a-e", "k"]);
    expect(segmentGraphemes("phone")).toEqual(["ph", "o-e", "n"]);
  });

  it("builds an alien word only from a small class-known grapheme set", () => {
    for (const knownGraphemes of [["c", "a", "t"], ["x"]]) for (let seed = 0; seed < 20; seed++) {
      const question = generateQuestion("alien", 2, makeRng(seed + 700), [], { skillId: "al.hear", knownGraphemes });
      expect(segmentGraphemes(String(question.data.word)).every(grapheme => knownGraphemes.includes(grapheme))).toBe(true);
      expect(question.choices?.flatMap(segmentGraphemes).every(grapheme => knownGraphemes.includes(grapheme))).toBe(true);
      expect(BLOCKED_ALIEN_WORDS).not.toContain(String(question.data.word).toLowerCase());
    }
  });

  it("has decodable practice banks for the synthetic phonics phases", () => {
    expect(WORD_LISTS.phase4.length).toBeGreaterThanOrEqual(80);
    expect(WORD_LISTS.phase5.length).toBeGreaterThanOrEqual(80);
    expect(WORD_LISTS.phase6.length).toBeGreaterThanOrEqual(60);
    for (const pseudoWord of WORD_LISTS.alien) expect(BLOCKED_ALIEN_WORDS).not.toContain(pseudoWord.toLowerCase());
  });

  it("keeps number-line addition and subtraction within the displayed range", () => {
    const rng = makeRng(92);
    for (const level of levels) {
      for (let i = 0; i < 100; i++) {
        const q = generateQuestion("numberline", level, rng);
        const start = Number(q.data.start);
        const amount = Number(q.data.amount);
        const result = Number(q.answer);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(Number(q.data.max));
        expect(result).toBe(start + (q.data.op === "+" ? amount : -amount));
      }
    }
  });
});
