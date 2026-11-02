import { describe, expect, it } from "vitest";
import { SENTENCE_LEXICON, SENTENCE_VERBS, sentenceLine, sentenceVerbOptions, verbForm, type SentenceTime } from "./lexicon";

describe("controlled sentence lexicon", () => {
  it("has stored base, present, past, future and -ing forms for every verb", () => {
    for (const verb of SENTENCE_VERBS) {
      expect([verb.base, verb.present, verb.past, verb.future, verb.gerund].every(Boolean)).toBe(true);
      expect(verb.future).toBe(`will ${verb.base}`);
    }
  });

  it.each(["yesterday", "now", "tomorrow"] as const)("keeps every %s verb option in the selected time", time => {
    const forms = sentenceVerbOptions(time);
    expect(forms).toHaveLength(SENTENCE_VERBS.length);
    for (const verb of SENTENCE_VERBS) expect(forms).toContain(verbForm(verb, time));
    if (time === "tomorrow") expect(forms.every(form => form.startsWith("will "))).toBe(true);
    if (time === "now") expect(forms.every(form => !form.startsWith("will "))).toBe(true);
  });

  it("forms grammatical sentences across every subject, verb, object, place and tense", () => {
    for (const subject of SENTENCE_LEXICON.subjects) {
      for (const verb of SENTENCE_VERBS) {
        for (const object of SENTENCE_LEXICON.objects) {
          for (const place of SENTENCE_LEXICON.places) {
            for (const time of SENTENCE_LEXICON.when as readonly SentenceTime[]) {
              const line = sentenceLine(subject, verbForm(verb, time), object, place, time);
              expect(line.endsWith(".")).toBe(true);
              expect(line).toContain(`${verbForm(verb, time)} ${object} ${place}.`);
            }
          }
        }
      }
    }
  });
});
