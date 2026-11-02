import { describe, it } from "vitest";
import { makeRng } from "../core/rng";
import { SKILLS } from "./skills";
import type { Level } from "../core/types";
import { generateQuestion } from "./generate";

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const RUNS = 1_000;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

describe("seeded generator properties", () => {
  it("keeps adjacent keys and choices valid for 1,000 seeds at every skill and level", () => {
    for (const skill of SKILLS) for (const level of LEVELS) {
      const rng = makeRng(skill.id.length * 1009 + level * 7919);
      let previous = "";
      for (let seed = 0; seed < RUNS; seed++) {
        const question = generateQuestion(skill.activityId, level, rng, previous ? [previous] : [], { skillId: skill.id });
        assert(question.key !== previous, `${skill.id} at level ${level} repeated ${question.key} at seed ${seed}`);
        assert(question.answer.length > 0, `${skill.id} at level ${level} generated an empty answer`);
        if (question.answerKind === "choice") {
          assert(question.choices?.includes(question.answer), `${skill.id} at level ${level} omitted the correct choice`);
          assert(new Set(question.choices).size === question.choices?.length, `${skill.id} at level ${level} duplicated a choice`);
        }
        const twin = generateQuestion(skill.activityId, level, rng, [question.key], { skillId: skill.id });
        assert(twin.key !== question.key, `${skill.id} at level ${level} produced a repeated twin`);
        if (twin.answerKind === "choice") {
          assert(twin.choices?.includes(twin.answer), `${skill.id} at level ${level} omitted the twin answer`);
          assert(new Set(twin.choices).size === twin.choices?.length, `${skill.id} at level ${level} duplicated a twin choice`);
        }
        previous = question.key;
      }
    }
  }, 120_000);
});
