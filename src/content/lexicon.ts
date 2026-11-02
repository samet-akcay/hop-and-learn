export type SentenceTime = "yesterday" | "now" | "tomorrow";

export interface SentenceVerb {
  base: string;
  present: string;
  past: string;
  future: string;
  gerund: string;
}

export const SENTENCE_LEXICON = Object.freeze({
  subjects: ["Captain Hop", "Bit", "Zib", "the robot", "the monster", "the dino", "the girl", "the boy", "the dog", "Mum", "Dad"],
  objects: ["a ball", "a rocket", "a cake", "a box", "a star", "a hat", "a car", "a book", "an apple", "a wheel"],
  places: ["on the moon", "in the box", "under the table", "next to the tree", "behind the house", "in the city", "on the roof", "in space"],
  describing: ["big", "small", "red", "blue", "green", "shiny", "fast", "happy", "sleepy", "huge"],
  when: ["yesterday", "now", "tomorrow"] as const,
  joining: ["and", "but", "so", "because", "when", "if"],
});

export const SENTENCE_VERBS: readonly SentenceVerb[] = Object.freeze([
  { base: "jump", present: "jumps", past: "jumped", future: "will jump", gerund: "jumping" },
  { base: "kick", present: "kicks", past: "kicked", future: "will kick", gerund: "kicking" },
  { base: "eat", present: "eats", past: "ate", future: "will eat", gerund: "eating" },
  { base: "push", present: "pushes", past: "pushed", future: "will push", gerund: "pushing" },
  { base: "pull", present: "pulls", past: "pulled", future: "will pull", gerund: "pulling" },
  { base: "throw", present: "throws", past: "threw", future: "will throw", gerund: "throwing" },
  { base: "catch", present: "catches", past: "caught", future: "will catch", gerund: "catching" },
  { base: "carry", present: "carries", past: "carried", future: "will carry", gerund: "carrying" },
  { base: "drop", present: "drops", past: "dropped", future: "will drop", gerund: "dropping" },
  { base: "paint", present: "paints", past: "painted", future: "will paint", gerund: "painting" },
  { base: "fix", present: "fixes", past: "fixed", future: "will fix", gerund: "fixing" },
  { base: "ride", present: "rides", past: "rode", future: "will ride", gerund: "riding" },
  { base: "find", present: "finds", past: "found", future: "will find", gerund: "finding" },
  { base: "hide", present: "hides", past: "hid", future: "will hide", gerund: "hiding" },
  { base: "sleep", present: "sleeps", past: "slept", future: "will sleep", gerund: "sleeping" },
]);

export function verbForm(verb: SentenceVerb, time: SentenceTime): string {
  return time === "yesterday" ? verb.past : time === "tomorrow" ? verb.future : verb.present;
}

export function sentenceVerbOptions(time: SentenceTime): string[] {
  return [...new Set(SENTENCE_VERBS.map(verb => verbForm(verb, time)))];
}

export function sentenceLine(subject: string, action: string, object: string, place?: string, when?: SentenceTime): string {
  const clause = [subject, action, object, place].filter(Boolean).join(" ");
  return `${when ? `${when[0]!.toUpperCase()}${when.slice(1)} ` : ""}${clause}.`;
}
