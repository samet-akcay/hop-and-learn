import { generateQuestion } from "../content/generate";
import type { Rng } from "../core/rng";
import type { ActivityId, GeneratedQuestion, Level } from "../core/types";
import { SKILLS_BY_ACTIVITY } from "../content/skills";
import type { PlaySettings } from "./settings";

/** Games whose numbers follow "Numbers up to"; times tables, clocks and turns have their own limits. */
const CAPPED = new Set<ActivityId>(["numberline", "bonds", "placevalue", "compare", "money", "fractions", "measure", "charts", "stories", "spotbug", "machine"]);
/** The big three from the original Math Play game, with their own simple builders. */
export const CORE_GAMES: ActivityId[] = ["numberline", "bonds", "times"];

const LEVEL: Record<PlaySettings["difficulty"], Level> = { easy: 1, medium: 2, hard: 3 };

function biggestNumber(question: GeneratedQuestion): number {
  const numbers = `${question.prompt} ${question.answer}`.match(/\d+/g) ?? [];
  return Math.max(0, ...numbers.map(Number));
}

/** Easy uses the first third of a game's skills, medium two thirds, hard all of them (stretch skills excluded). */
/** Skills left out of the simple game because their pictures can't show them clearly yet. */
const LEFT_OUT = new Set(["ms.scales", "ms.jugs", "ms.temp"]);

export function skillPool(activityId: ActivityId, difficulty: PlaySettings["difficulty"]): string[] {
  const all = (SKILLS_BY_ACTIVITY.get(activityId) ?? []).filter(skill => !LEFT_OUT.has(skill.id));
  const core = all.filter(skill => !skill.stretch && !skill.nlaStage);
  const skills = (core.length ? core : all).map(skill => skill.id);
  const share = difficulty === "easy" ? 1 / 3 : difficulty === "medium" ? 2 / 3 : 1;
  return skills.slice(0, Math.max(1, Math.ceil(skills.length * share)));
}

function numberLine(settings: PlaySettings, rng: Rng): GeneratedQuestion {
  const op = settings.numberLineOps === "add" ? "+" : settings.numberLineOps === "sub" ? "−" : rng.pick(["+", "−"]);
  const amount = rng.int(1, Math.min(settings.maxHops, settings.maxNumber - 1));
  const start = op === "+" ? rng.int(0, settings.maxNumber - amount) : rng.int(amount, settings.maxNumber);
  const result = op === "+" ? start + amount : start - amount;
  // On a line to 100 the hero hops along a 20-wide window, so every hop is easy to see.
  const min = settings.maxNumber > 20 ? Math.max(0, Math.min(Math.floor(Math.min(start, result) / 10) * 10, 80)) : 0;
  const max = settings.maxNumber > 20 ? min + 20 : settings.maxNumber;
  const way = op === "+" ? "right" : "left";
  return {
    key: `nl-${start}${op}${amount}`, activityId: "numberline", skillId: op === "+" ? "nl.count-on" : "nl.count-back", level: 1,
    prompt: `${start} ${op} ${amount} = ?`, spoken: `${start} ${op === "+" ? "add" : "take away"} ${amount}.`,
    instruction: `Start at ${start}. Hop ${amount} ${amount === 1 ? "time" : "times"} to the ${way}.`,
    answer: String(result), answerKind: "number",
    model: `${start} ${op === "+" ? "add" : "take away"} ${amount} is equal to ${result}.`,
    hint1: `We hop to the ${way}.`, hint2: `Start at ${start}.`, visual: "numberline",
    data: { start, amount, op, result, min, max },
  };
}

function bonds(settings: PlaySettings, rng: Rng): GeneratedQuestion {
  const total = settings.maxNumber === 10 ? 10 : settings.bondsTo;
  const part = rng.int(1, total - 1), missing = total - part;
  return {
    key: `bd-${part}+${total}`, activityId: "bonds", skillId: total === 10 ? "bd.to-10" : "bd.to-20", level: 1,
    prompt: `${part} + ? = ${total}`, spoken: `${part} and what make ${total}?`,
    instruction: `Fill the empty spaces to make ${total}.`,
    answer: String(missing), answerKind: "number",
    model: `${part} and ${missing} make ${total}.`, hint1: "Count the empty spaces.", hint2: `We need to get to ${total}.`,
    visual: "bonds", data: { total, part, missing },
  };
}

function times(settings: PlaySettings, rng: Rng): GeneratedQuestion {
  const table = rng.pick(settings.tables.length ? settings.tables : [2]);
  const groups = rng.int(1, settings.maxNumber === 10 ? 5 : 10);
  const total = groups * table;
  return {
    key: `tt-${groups}x${table}`, activityId: "times", skillId: `tt.x${table}`, level: 1,
    prompt: `${groups} × ${table} = ?`, spoken: `${groups} groups of ${table}.`,
    instruction: `Make ${groups} ${groups === 1 ? "group" : "groups"} of ${table}.`,
    answer: String(total), answerKind: "number",
    model: `${groups} groups of ${table} make ${total}.`, hint1: "Count the dots in each group.", hint2: `Count in ${table}s.`,
    visual: "array", data: { groups, table, total },
  };
}

function compare(settings: PlaySettings, rng: Rng): GeneratedQuestion {
  const a = rng.int(0, settings.maxNumber);
  let b = rng.int(0, settings.maxNumber - 1);
  if (b >= a) b++;
  const bigger = rng.int(0, 1) === 0;
  const answer = bigger ? Math.max(a, b) : Math.min(a, b);
  const word = bigger ? "bigger" : "smaller";
  return {
    key: `cmp-${a}-${b}-${word}`, activityId: "compare", skillId: "cmp.numbers", level: 1,
    prompt: `Which number is ${word}?`, spoken: `Which number is ${word}, ${a} or ${b}?`,
    answer: String(answer), answerKind: "choice", choices: [String(a), String(b)],
    model: `${answer} is ${word} than ${answer === a ? b : a}.`, hint1: "Which one is further along the number line?", hint2: "Look at the tens first.",
    visual: "balance", data: { a, b },
  };
}

/** Three big buttons: the answer and two close neighbours that stay inside the allowed range. */
export function numberChoices(answer: number, limit: number, rng: Rng): string[] {
  const options = new Set([answer]);
  const offsets = rng.pick([[1, -1], [1, 2], [-1, -2], [2, -2], [10, -1], [1, -10]]);
  for (const offset of [...offsets, 1, -1, 2, -2, 3, -3, 4]) {
    const value = answer + offset;
    if (options.size < 3 && value >= 0 && value <= Math.max(limit, answer + 4)) options.add(value);
  }
  return [...options].sort(() => (rng.int(0, 1) ? 1 : -1)).map(String);
}

export function makeQuestion(activityId: ActivityId, settings: PlaySettings, rng: Rng, avoid: string[] = []): GeneratedQuestion {
  let question: GeneratedQuestion;
  if (activityId === "numberline") question = numberLine(settings, rng);
  else if (activityId === "bonds") question = bonds(settings, rng);
  else if (activityId === "times") question = times(settings, rng);
  else if (activityId === "compare") question = compare(settings, rng);
  else {
    const pool = skillPool(activityId, settings.difficulty);
    const capped = CAPPED.has(activityId);
    let best: GeneratedQuestion | undefined;
    for (let attempt = 0; attempt < 40; attempt++) {
      const candidate = generateQuestion(activityId, LEVEL[settings.difficulty], rng, avoid, { skillId: rng.pick(pool), phonicsPhase: 5 });
      if (candidate.answer.trim().startsWith("-")) continue;
      if (!capped || biggestNumber(candidate) <= settings.maxNumber) { best = candidate; break; }
      if (!best || biggestNumber(candidate) < biggestNumber(best)) best = candidate;
    }
    question = best ?? generateQuestion(activityId, 1, rng, avoid, { skillId: pool[0], phonicsPhase: 5 });
  }
  question = { ...question, prompt: question.prompt.charAt(0).toUpperCase() + question.prompt.slice(1) };
  if (question.choices) question = { ...question, choices: question.choices.filter(choice => !/^Option \d+$/.test(choice)) };
  if (question.skillId === "mn.coins") {
    // Wrong answers are real coins too, never a 4p or 6p coin that doesn't exist.
    const others = [1, 2, 5, 10, 20, 50].filter(value => String(value) !== question.answer);
    const picks = [question.answer, ...[0, 1].map(() => String(others.splice(rng.int(0, others.length - 1), 1)[0]))];
    question = { ...question, answerKind: "choice", choices: picks.sort(() => (rng.int(0, 1) ? 1 : -1)) };
  }
  if (question.answerKind === "number" && !question.choices && /^\d+$/.test(question.answer)) {
    const limit = CAPPED.has(activityId) ? settings.maxNumber : Number(question.answer) + 10;
    question = { ...question, answerKind: "choice", choices: numberChoices(Number(question.answer), limit, rng) };
  }
  return question;
}
