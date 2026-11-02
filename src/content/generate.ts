import type { ActivityId, GeneratedQuestion, Level, Mood, SessionMode, VisualKind } from "../core/types";
import type { Rng } from "../core/rng";
import { SENTENCE_LEXICON, SENTENCE_VERBS, sentenceLine, verbForm, type SentenceTime } from "./lexicon";
import { BLOCKED_ALIEN_WORDS, COMMON_REAL_WORDS, isBlockedAlienWord } from "./blocklist";

const PEOPLE = ["Captain Hop", "Bit", "Zib", "the monster", "the dino"] as const;
const COUNTABLES = ["bolts", "rocks", "stars", "rings", "books", "eggs"] as const;
const TRICKY_YEAR_1 = ["the", "a", "do", "to", "today", "of", "said", "says", "are", "were", "was", "is", "his", "has", "I", "you", "your", "they", "be", "he", "me", "she", "we", "no", "go", "so", "by", "my", "here", "there", "where", "love", "come", "some", "one", "once", "ask", "friend", "school", "put", "push", "pull", "full", "house", "our"] as const;
const TRICKY_YEAR_2 = ["door", "floor", "poor", "because", "find", "kind", "mind", "behind", "child", "children", "wild", "climb", "most", "only", "both", "old", "cold", "gold", "hold", "told", "every", "everybody", "even", "great", "break", "steak", "pretty", "beautiful", "after", "fast", "last", "past", "father", "class", "grass", "pass", "plant", "path", "bath", "hour", "move", "prove", "improve", "sure", "sugar", "eye", "could", "should", "would", "who", "whole", "any", "many", "clothes", "busy", "people", "water", "again", "half", "money", "Mr", "Mrs", "parents", "Christmas"] as const;
const TRICKY = [...TRICKY_YEAR_1, ...TRICKY_YEAR_2] as const;
const PHASE4_WORDS = ["ship", "frog", "milk", "crab", "hand", "tent", "stamp", "crisp", "frost", "drink", "plant", "trust", "stand", "blend", "crust", "string", "clamp", "grand", "spent", "twist", "blimp", "strap", "shift", "thump", "print", "track", "shell", "whisk", "crunch", "stump", "fresh", "chest", "shelf", "lunch", "chimp", "brush", "crash", "splash", "scrunch", "shrink", "spring", "strong", "thrift", "thrush", "drift", "grasp", "split", "spend", "clung", "tramp", "twigs", "strips", "grin", "step", "sled", "swim", "plum", "drum", "flag", "clap", "slip", "trip", "grip", "glad", "spin", "plan", "snack", "bunch", "cramp", "cliff", "fling", "sprint", "flick", "block", "black", "clock", "truck", "brick", "grill", "blush", "flesh", "stampede", "sunset", "magnet", "picnic"] as const;
const PHASE5_WORDS = ["play", "day", "stay", "tray", "brain", "train", "chain", "paint", "snail", "speech", "green", "beach", "dream", "these", "theme", "light", "night", "flight", "kind", "child", "goat", "road", "float", "home", "stone", "cube", "huge", "tune", "rude", "cute", "cloud", "found", "brown", "crown", "town", "shout", "mouth", "cow", "toy", "enjoy", "join", "coin", "point", "bird", "girl", "shirt", "dirt", "first", "turn", "nurse", "church", "pure", "cure", "here", "there", "where", "fear", "near", "beard", "chair", "fair", "stairs", "square", "care", "share", "hair", "phone", "photo", "wheel", "when", "whale", "write", "wrong", "pie", "blue", "saw", "boy", "grew", "toe", "cake", "bike", "teeth", "cheek", "might", "toast", "stone", "flute"] as const;
const PHASE6_WORDS = ["jumping", "helpful", "quickly", "darkness", "handful", "painted", "runner", "hopping", "kindness", "slowly", "careful", "boxes", "jumped", "jumping", "helping", "helped", "helper", "playing", "played", "player", "happily", "happiness", "sadness", "sadly", "careless", "carefully", "careless", "fearless", "fearfully", "darkest", "brightest", "brighter", "smallest", "smaller", "bigger", "biggest", "hopped", "hopping", "running", "runner", "runners", "stopped", "stopping", "clapped", "clapping", "cries", "crying", "tries", "trying", "boxes", "wishes", "foxes", "knocked", "knocking", "thoughtful", "enjoyment", "movement", "shipment", "kindly", "slowly", "loudly", "badly", "happier", "happiest", "copied", "copying", "carried", "carrying", "made", "making", "riding", "rider", "shining", "shiny"] as const;
const ALIEN_WORDS = ["chog", "plim", "nemp", "frop", "spling", "drabe", "vust", "glane", "brint", "thope", "blim", "nust", "chabe", "frint", "splog", "clope", "thim", "grabe", "vemp", "shund"] as const;
const STORY_SEQUENCES = [
  ["The seed is planted", "A shoot comes up", "A flower opens"],
  ["Bit finds a wheel", "Bit fixes the wheel", "The rover moves"],
  ["The rocket is ready", "The engines start", "The rocket lifts off"],
  ["The monster gets bread", "The monster adds the filling", "The monster eats a sandwich"],
  ["The racers line up", "The race begins", "The racers reach the finish"],
  ["The dino egg shakes", "A small crack appears", "A baby dino hatches"],
  ["Rain falls on the hill", "The rain stops", "A rainbow appears"],
  ["The ball rolls away", "Bit looks under the bench", "Bit finds the ball"],
  ["The friends build a tower", "A gust of wind knocks it down", "The friends build it again"],
  ["The bath is ready", "The child gets in the bath", "The child gets dry"],
  ["The family packs a bag", "They walk to the park", "They play on the swings"],
  ["Bit spots a broken wheel", "Bit finds a tool", "Bit fixes the rover"],
] as const;
const REAL_WORDS = new Set<string>([...PHASE4_WORDS, ...PHASE5_WORDS, ...TRICKY, ...COMMON_REAL_WORDS]);

const SMALL_NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS_WORDS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function numberName(value: number): string {
  if (value < 20) return SMALL_NUMBER_WORDS[value] ?? String(value);
  if (value < 100) return `${TENS_WORDS[Math.floor(value / 10)]}${value % 10 ? `-${SMALL_NUMBER_WORDS[value % 10]}` : ""}`;
  const hundreds = Math.floor(value / 100), remainder = value % 100;
  return `${SMALL_NUMBER_WORDS[hundreds]} hundred${remainder ? ` and ${numberName(remainder)}` : ""}`;
}

function timeLabel(hour: number, minutes: number): string {
  if (minutes === 0) return `${hour} o'clock`;
  if (minutes === 15) return `quarter past ${hour}`;
  if (minutes === 30) return `half past ${hour}`;
  if (minutes === 45) return `quarter to ${hour === 12 ? 1 : hour + 1}`;
  return minutes < 30
    ? `${numberName(minutes)} past ${hour}`
    : `${numberName(60 - minutes)} to ${hour === 12 ? 1 : hour + 1}`;
}

function uniqueChoices(correct: string, candidates: string[], rng: Rng): string[] {
  const seen = new Set([correct]);
  const distractors = candidates.filter(item => item !== correct && !seen.has(item));
  while (distractors.length && seen.size < 3) {
    const index = rng.int(0, distractors.length - 1);
    seen.add(distractors.splice(index, 1)[0]!);
  }
  const result = [...seen];
  let fallbackIndex = 1;
  while (result.length < 3) {
    const numeric = Number(correct);
    const fallback = Number.isFinite(numeric) ? String(numeric + fallbackIndex) : `Option ${fallbackIndex}`;
    fallbackIndex++;
    if (!seen.has(fallback)) { result.push(fallback); seen.add(fallback); }
  }
  return result.sort(() => rng.int(0, 1) ? 1 : -1);
}

function make(
  activityId: ActivityId,
  skillId: string,
  level: Level,
  key: string,
  prompt: string,
  answer: string,
  model: string,
  visual: VisualKind = "none",
  data: GeneratedQuestion["data"] = {},
  extras: Partial<GeneratedQuestion> = {},
): GeneratedQuestion {
  return {
    key, activityId, skillId, level, prompt, spoken: prompt, answer, answerKind: "number",
    model, hint1: "Let's look carefully.", hint2: "Let's try the first step together.", visual, data,
    ...extras,
  };
}

export interface GeneratorOptions {
  skillId?: string;
  factKey?: string;
  warmup?: boolean;
  phonicsPhase?: 4 | 5 | 6;
  knownGraphemes?: string[];
  grammarFocus?: string[];
  crewNames?: { hop: string; bit: string; zib: string };
  mode?: SessionMode;
  mood?: Mood;
}

type Builder = (level: Level, rng: Rng, options?: GeneratorOptions) => GeneratedQuestion;

const builders: Record<ActivityId, Builder> = {
  numberline: (level, rng, options = {}) => {
    const requestedSkill = options.skillId;
    const storedFact = options.factKey ? /^(\d+)([+−])(\d+)$/.exec(options.factKey) : null;
    if (storedFact) {
      const start = Number(storedFact[1]), amount = Number(storedFact[3]), op = storedFact[2]!;
      const answer = start + (op === "+" ? amount : -amount);
      return make("numberline", requestedSkill ?? "nl.count-on", level, options.factKey!, `${start} ${op} ${amount} = ?`, String(answer), `${start} ${op === "+" ? "add" : "take away"} ${amount} is equal to ${answer}.`, "numberline", { start, amount, op, result: answer, max: 20 }, { strategy: "We remembered a number fact." });
    }
    if (requestedSkill === "nl.missing") {
      const kind = rng.int(0, 3);
      const a = rng.int(3, 10), b = rng.int(1, 9);
      const difference = a - Math.min(a - 1, b);
      const total = a + b;
      const prompt = kind === 0 ? `${a} + □ = ${total}` : kind === 1 ? `□ + ${b} = ${total}` : kind === 2 ? `${a} − □ = ${difference}` : `□ − ${b} = ${a}`;
      const answer = kind === 0 ? b : kind === 1 ? a : kind === 2 ? a - difference : a + b;
      return make("numberline", "nl.missing", level, `missing-${prompt}`, prompt, String(answer), `The missing number is ${answer}.`, "picture", { a, b, total, result: kind === 2 ? difference : a, kind }, {
        hint1: "Let's find the whole and the part we know.", hint2: "Let's use the opposite operation to find the missing number.",
      });
    }
    if (requestedSkill === "nl.difference") {
      const start = rng.int(0, 14), amount = rng.int(1, Math.min(6, 20 - start)), end = start + amount;
      return make("numberline", requestedSkill, level, `difference-${start}-${end}`, `How far is it from ${start} to ${end}?`, String(amount), `From ${start} to ${end} is ${amount}. The difference is ${amount}.`, "numberline", { start, amount, op: "+", result: end, max: 20 }, {
        spoken: `Let's count on from ${start} to ${end}.`, instruction: `Let's count on from ${start} to ${end}.`, hint1: "Let's start at the smaller number.", hint2: "Let's hop to the next ten first.",
      });
    }
    if (requestedSkill === "nl.skip") {
      const jumpSize = rng.pick([2, 3, 5, 10]), amount = rng.int(2, 5), start = jumpSize === 10 ? rng.int(0, 4) * 10 : rng.int(0, 5);
      const result = start + amount * jumpSize;
      return make("numberline", requestedSkill, level, `skip-${start}-${jumpSize}-${amount}`, `Count on in ${jumpSize}s. What number comes after ${amount} jumps?`, String(result), `Start at ${start}. Count ${jumpSize}, ${jumpSize * 2}, ${jumpSize * 3}. We land on ${result}.`, "numberline", { start, amount, jumpSize, op: "+", result, max: 100 }, {
        spoken: `Let's count on in ${jumpSize}s.`, instruction: `Let's count on in ${jumpSize}s.`, hint1: "Let's look at the jump size.", hint2: `One jump is ${jumpSize}.`,
      });
    }
    if (requestedSkill === "nl.tens") {
      const start = rng.int(2, 7) * 10 + rng.int(1, 8), amount = rng.int(1, 3), op = rng.int(0, 1) ? "+" : "−";
      const result = start + (op === "+" ? amount : -amount) * 10;
      return make("numberline", requestedSkill, level, `tens-${start}-${op}${amount * 10}`, `${start} ${op} ${amount * 10} = ?`, String(result), `${start} ${op === "+" ? "add" : "take away"} ${amount * 10} is equal to ${result}.`, "numberline", { start, amount, jumpSize: 10, op, result, max: 100 }, {
        spoken: `Let's jump ${amount} tens ${op === "+" ? "forwards" : "back"}.`, instruction: `Let's jump ${amount} tens ${op === "+" ? "forwards" : "back"}.`, hint1: "Let's look at the tens digit.", hint2: "One big hop is ten.",
      });
    }
    if (requestedSkill === "nl.2d-1d" || requestedSkill === "nl.2d-2d" || requestedSkill === "nl.to-1000") {
      const max = requestedSkill === "nl.to-1000" ? 1000 : 100;
      const tensJump = requestedSkill === "nl.to-1000" ? 100 : 10;
      const start = rng.int(1, requestedSkill === "nl.to-1000" ? 7 : 7) * (requestedSkill === "nl.to-1000" ? 100 : 10) + (requestedSkill === "nl.to-1000" ? 0 : rng.int(0, 9));
      const amount = requestedSkill === "nl.2d-1d" ? rng.int(1, 9) : requestedSkill === "nl.2d-2d" ? rng.int(11, 28) : rng.int(1, 4) * tensJump;
      const op = rng.int(0, 1) ? "+" : "−";
      const safeAmount = op === "−" ? Math.min(amount, start) : Math.min(amount, max - start);
      const result = start + (op === "+" ? safeAmount : -safeAmount);
      const prompt = `${start} ${op} ${safeAmount} = ?`;
      return make("numberline", requestedSkill, level, `${start}${op}${safeAmount}`, prompt, String(result), `${start} ${op === "+" ? "add" : "take away"} ${safeAmount} is equal to ${result}.`, "picture", { start, amount: safeAmount, op, result, max }, {
        spoken: `Let's ${op === "+" ? "add" : "take away"} ${safeAmount}.`, instruction: `Let's ${op === "+" ? "add" : "take away"} ${safeAmount}.`, hint1: "Let's look at the tens and ones.", hint2: "Let's do the tens first.",
      });
    }
    if (requestedSkill === "nl.below-zero") {
      const start = rng.int(-5, 5), amount = rng.int(1, 5), op = rng.int(0, 1) ? "+" : "−";
      const result = start + (op === "+" ? amount : -amount);
      return make("numberline", requestedSkill, level, `below-zero-${start}${op}${amount}`, `${start} ${op} ${amount} = ?`, String(result), `${start} ${op === "+" ? "add" : "take away"} ${amount} is equal to ${result}.`, "picture", { start, amount, op, result, max: 10 }, { hint1: "Let's look at zero in the middle.", hint2: "Let's count one step at a time." });
    }
    if (requestedSkill === "nl.scale" || requestedSkill === "nl.estimate") {
      const max = requestedSkill === "nl.estimate" ? 100 : 20;
      const answer = rng.int(1, max - 1);
      const prompt = requestedSkill === "nl.scale" ? "The pointer is on the number line. What number does it show?" : `A point is marked between 0 and ${max}. Which number is closest?`;
      return make("numberline", requestedSkill, level, `${requestedSkill}-${answer}-${max}`, prompt, String(answer), `The point is at ${answer}.`, "picture", { start: 0, amount: answer, result: answer, max }, {
        spoken: `Let's read the number line.`, instruction: `Let's read the number line.`, hint1: "Let's look at the labelled numbers.", hint2: "Let's count the spaces between labels.",
      });
    }
    const max = level >= 4 && !options.warmup ? 100 : 20;
    const amount = rng.int(1, options.warmup ? 9 : level === 1 ? 3 : level < 4 ? 8 : 15);
    const op = requestedSkill === "nl.count-on" || requestedSkill === "nl.bigger-first" || requestedSkill === "nl.bridge-10"
      ? "+" : requestedSkill === "nl.count-back" ? "−" : rng.int(0, 1) === 0 ? "+" : "−";
    let start = op === "+" ? rng.int(0, max - amount) : rng.int(amount, max);
    if (requestedSkill === "nl.bigger-first") {
      const small = rng.int(1, 5), large = rng.int(6, 15);
      start = large;
      return make("numberline", requestedSkill, level, `bigger-first-${small}-${large}`, `${small} + ${large} = ?`, String(small + large), `Start at ${large}. Add ${small}. ${small} add ${large} is equal to ${small + large}.`, "numberline", { start, amount: small, op: "+", result: small + large, max: 20 }, { spoken: `Let's start from the bigger number, ${large}.`, instruction: `Let's start from the bigger number, ${large}.`, hint1: "We can start from the bigger number.", hint2: `Let's hop on ${small} from ${large}.` });
    }
    if (requestedSkill === "nl.bridge-10") start = op === "+" ? rng.int(6, 9) : rng.int(11, 19);
    const result = op === "+" ? start + amount : start - amount;
    const key = `${start}${op}${amount}`;
    return make("numberline", requestedSkill ?? (level === 1 ? "nl.count-on" : level < 3 ? "nl.bridge-10" : "nl.difference"), level, key,
      `${start} ${op} ${amount} = ?`, String(result),
      op === "+" ? `Start at ${start}. Hop ${amount}. Land on ${result}. ${start} add ${amount} is equal to ${result}.` : `Start at ${start}. Hop back ${amount}. Land on ${result}. ${start} take away ${amount} is equal to ${result}.`,
      "numberline", { start, amount, op, result, max }, {
        spoken: `Start at ${start}. Hop ${amount} to the ${op === "+" ? "right" : "left"}.`,
        instruction: `Start at ${start}. Hop ${amount} to the ${op === "+" ? "right" : "left"}.`,
        hint1: op === "+" ? "Let's look at the plus sign. We hop to the right." : "Let's look at the minus sign. We hop to the left.",
        hint2: `Let's start at ${start} and count ${op === "+" ? "on" : "back"} one hop.`,
        strategy: result % 10 === 0 ? "We landed on a ten." : "We counted the hops.",
      });
  },
  bonds: (level, rng, options = {}) => {
    const skill = options.skillId ?? (level < 3 ? "bd.to-10" : "bd.to-20");
    const storedFact = options.factKey ? /^(\d+)\+(\d+)$/.exec(options.factKey) : null;
    if (storedFact) {
      const a = Number(storedFact[1]), b = Number(storedFact[2]), total = a + b;
      return make("bonds", skill, level, options.factKey!, `${a} + ${b} = ?`, String(total), `${a} add ${b} is equal to ${total}.`, "bonds", { total, part: a, missing: b }, { strategy: "We remembered a number bond." });
    }
    if (skill === "bd.subitise") {
      const total = rng.int(1, 10);
      return make("bonds", skill, level, `subitise-${total}`, "How many counters do we see?", String(total), `We see ${total} counters.`, "picture", { total, counters: total }, {
        answerKind: "choice", choices: uniqueChoices(String(total), [String(total - 1), String(total + 1), "5", "10"], rng),
        hint1: "Let's look at the groups of counters.", hint2: "Let's see how many are there without counting one by one.",
      });
    }
    if (skill === "bd.doubles") {
      const part = rng.int(1, 10), total = part * 2;
      return make("bonds", skill, level, `double-${part}`, `${part} + ${part} = ?`, String(total), `Double ${part} is ${total}.`, "bonds", { total, part, missing: part }, {
        spoken: `Two equal parts. Each part is ${part}.`, instruction: `Two equal parts. Each part is ${part}.`, hint1: "Both parts are the same size.", hint2: `Let's add ${part} and ${part}.`, strategy: "We used a double.",
      });
    }
    if (skill === "bd.related") {
      const tens = rng.int(2, 8), base = tens * 10;
      const whole = rng.pick([100, base + 10]);
      const missing = whole - base;
      return make("bonds", skill, level, `related-${base}-${whole}`, `${base} + ? = ${whole}`, String(missing), `${base} and ${missing} make ${whole}.`, "picture", { part: base, total: whole, missing }, {
        hint1: "Let's use the related bond to 10.", hint2: `${tens} tens and how many more tens make ${whole}?`,
      });
    }
    if (skill === "bd.three") {
      const pair = rng.int(1, 9), first = rng.int(1, 9), third = 10 - pair;
      const total = first + pair + third;
      return make("bonds", skill, level, `three-${first}-${pair}-${third}`, `${first} + ${pair} + ${third} = ?`, String(total), `First ${pair} and ${third} make 10. Then ${first} more makes ${total}.`, "picture", { first, part: pair, missing: third, total }, {
        hint1: "Let's find the pair that makes 10.", hint2: `${pair} and ${third} make 10.`, strategy: "We found the bond to 10 first.",
      });
    }
    if (skill === "bd.to-100") {
      const part = rng.int(1, 9) * 10 + rng.int(0, 9), total = 100, missing = total - part;
      return make("bonds", skill, level, `${part}+?=100`, `${part} + ? = 100`, String(missing), `${part} and ${missing} make 100.`, "picture", { part, total, missing }, {
        hint1: "Let's look at the tens and ones.", hint2: "Let's count up to the next ten, then to 100.",
      });
    }
    if (skill === "bd.facts-20") {
      const a = rng.int(2, 18), b = rng.int(1, 20 - a), total = a + b;
      return make("bonds", skill, level, `${a}+${b}`, `${a} + ${b} = ?`, String(total), `${a} add ${b} is equal to ${total}.`, "picture", { part: a, total, missing: b }, {
        hint1: "Let's make the next ten first.", hint2: "Let's count on from the first number.",
      });
    }
    const total = skill === "bd.to-10" ? 10 : skill === "bd.to-20" || skill === "bd.bar" || skill === "bd.family" ? 20 : skill === "bd.make-n" ? rng.int(5, 10) : level < 3 ? 10 : 20;
    const part = rng.int(1, total - 1);
    const missing = total - part;
    const prompt = skill === "bd.bar" ? `${part} and ? make ${total}. Find the missing part.` : `${part} + ? = ${total}`;
    return make("bonds", skill, level, `${part}+?=${total}`,
      prompt, String(missing), `The whole is ${total}. One part is ${part}. The other part is ${missing}.`,
      "bonds", { total, part, missing }, {
        spoken: `The whole is ${total}. One part is ${part}. Let's find the other part.`,
        instruction: `The whole is ${total}. One part is ${part}. Let's find the other part.`,
        hint1: "Let's look at the empty spaces.",
        hint2: `Let's count on from ${part} to the next ten.`,
        strategy: "We made a whole.",
      });
  },
  times: (level, rng, options = {}) => {
    const skill = options.skillId ?? (level < 3 ? "tt.x2" : "tt.x5");
    if (skill === "tt.odd-even") {
      const value = rng.int(2, 20), answer = value % 2 === 0 ? "even" : "odd";
      return make("times", skill, level, `odd-even-${value}`, `Is ${value} odd or even?`, answer, `${value} is ${answer}.`, "picture", { value }, {
        answerKind: "choice", choices: ["odd", "even"], hint1: "Let's pair the counters.", hint2: "If every counter gets a partner, the number is even.",
      });
    }
    if (skill === "tt.double-half") {
      const half = rng.int(2, 10) * 2, double = rng.int(2, 10), askHalf = rng.int(0, 1) === 0;
      const value = askHalf ? half : double, answer = askHalf ? half / 2 : double * 2;
      return make("times", skill, level, `${askHalf ? "half" : "double"}-${value}`, `${askHalf ? "What is half of" : "Double"} ${value}?`, String(answer), `${askHalf ? "Half of" : "Double"} ${value} is ${answer}.`, "array", { groups: 2, table: askHalf ? answer : value, total: askHalf ? value : answer }, {
        hint1: "Let's split the counters into two equal groups.", hint2: `Let's share ${value} between 2.`,
      });
    }
    if (skill === "tt.equal") {
      const equal = rng.int(0, 1) === 1, first = rng.int(2, 5), second = equal ? first : first + 1;
      return make("times", skill, level, `equal-${first}-${second}-${equal}`, "Do the groups have the same number in each?", equal ? "Yes" : "No", equal ? "Each group has the same number." : "The groups do not have the same number.", "picture", { first, second }, {
        answerKind: "choice", choices: ["Yes", "No"], hint1: "Let's count the counters in each group.", hint2: `The first group has ${first}.`,
      });
    }
    if (skill === "tt.share" || skill === "tt.group") {
      const divisor = rng.pick([2, 3, 4, 5]), perGroup = rng.int(2, 6), total = divisor * perGroup;
      const share = skill === "tt.share";
      return make("times", skill, level, `${share ? "share" : "group"}-${total}-${divisor}`, share ? `Share ${total} counters equally between ${divisor} friends. How many each?` : `How many groups of ${perGroup} are in ${total}?`, String(share ? perGroup : divisor), share ? `${total} shared between ${divisor} friends is ${perGroup} each.` : `There are ${divisor} groups of ${perGroup} in ${total}.`, "array", { groups: divisor, table: perGroup, total }, {
        spoken: share ? `Let's share ${total} counters between ${divisor} friends.` : `Let's make groups of ${perGroup}.`,
        instruction: share ? `Let's share ${total} counters between ${divisor} friends.` : `Let's make groups of ${perGroup}.`,
        hint1: "Let's give one counter to each friend at a time.", hint2: `Let's count the groups of ${perGroup}.`,
      });
    }
    const arrays = skill === "tt.arrays";
    const repeated = skill === "tt.repeated";
    const factTable = /^tt\.x\d+$/.test(skill) ? Number(skill.slice(4)) : undefined;
    const fact = options.factKey ? /^(\d+)x(\d+)$/.exec(options.factKey) : null;
    const table = fact ? Number(fact[2]) : factTable ?? rng.pick(level >= 4 ? [2, 5, 10, 3, 4] : [2, 5, 10]);
    const groups = fact ? Number(fact[1]) : rng.int(2, level === 1 ? 5 : 10);
    const total = table * groups;
    if (arrays) {
      const prompt = `${groups} rows of ${table} make an array. How many counters are there?`;
      return make("times", skill, level, `array-${groups}x${table}`, prompt, String(total), `${groups} rows of ${table} make ${total}.`, "array", { groups, table, total }, {
        hint1: "Let's count one row.", hint2: `One row has ${table} counters.`,
      });
    }
    const op = !repeated && level >= 4 && rng.int(0, 2) === 0 ? "÷" : "×";
    const answer = op === "×" ? total : groups;
    const prompt = repeated ? `${Array.from({ length: groups }, () => table).join(" + ")} = ?` : op === "×" ? `${groups} × ${table} = ?` : `${total} ÷ ${table} = ?`;
    const sentence = op === "×" ? `${groups} groups of ${table} is equal to ${total}.` : `${total} shared into groups of ${table} makes ${groups} groups.`;
    return make("times", skill, level, `${groups}x${table}${op}`, prompt, String(answer), sentence, "array", { groups, table, total, op }, {
      spoken: `${groups} groups of ${table}. Let's count them.`, instruction: `${groups} groups of ${table}. Let's count them.`,
      hint1: `Each group has ${table}. Let's look at one group.`, hint2: `Let's count ${table}, ${table * 2}, ${table * 3}...`, strategy: "We counted in equal groups.",
    });
  },
  placevalue: (level, rng, options = {}) => {
    const skill = options.skillId ?? "pv.tens-ones";
    if (skill === "pv.teens") {
      const ones = rng.int(1, 9), number = 10 + ones;
      return make("placevalue", skill, level, `teen-${number}`, `10 and ${ones} more is what number?`, String(number), `${number} is 10 and ${ones} ones.`, "placevalue", { number, tens: 1, ones, kind: "teen" }, {
        hint1: "Let's look at the ten and the ones.", hint2: `10 and ${ones} more.`,
      });
    }
    if (skill === "pv.flexible") {
      const number = rng.int(31, 89), tens = Math.floor(number / 10), givenTens = Math.max(1, tens - 1), answer = number - givenTens * 10;
      return make("placevalue", skill, level, `flex-${number}-${givenTens}`, `${number} = ${givenTens * 10} + □`, String(answer), `${number} is ${givenTens * 10} and ${answer} more.`, "placevalue", { number, tens: givenTens, ones: answer, kind: "flexible" }, {
        hint1: "Let's break one ten into 10 ones.", hint2: `${givenTens * 10} is less than ${number}.`,
      });
    }
    if (skill === "pv.more-less") {
      const number = rng.int(10, 89), change = rng.pick([1, 10]), add = rng.int(0, 1) === 0;
      const answer = number + (add ? change : -change);
      return make("placevalue", skill, level, `place-${number}-${add ? "+" : "-"}${change}`, `${change} ${add ? "more" : "less"} than ${number} is?`, String(answer), `${answer} is ${change} ${add ? "more" : "less"} than ${number}.`, "placevalue", { number, tens: Math.floor(number / 10), ones: number % 10, kind: "more-less" }, {
        hint1: change === 10 ? "Let's change the tens digit." : "Let's look at the ones digit.", hint2: `Let's ${add ? "add" : "take away"} ${change}.`,
      });
    }
    const n = skill === "pv.hundreds" ? rng.int(100, 999) : rng.int(12, level > 2 ? 99 : 60);
    const tens = Math.floor(n / 10) % 10, hundreds = Math.floor(n / 100), ones = n % 10;
    if (skill === "pv.words") {
      const prompt = `Which words name ${n}?`;
      const answer = numberName(n);
      const choices = uniqueChoices(answer, [numberName(n + 1), numberName(Math.max(0, n - 1)), numberName((Math.floor(n / 10) * 10) + (n % 10 === 0 ? 1 : 0))], rng);
      return make("placevalue", skill, level, `words-${n}`, prompt, answer, `${n} is ${answer}.`, "placevalue", { number: n, tens, ones, kind: "words" }, {
        answerKind: "choice", choices, hint1: "Let's listen for the tens and ones in the word.", hint2: "Thirteen and thirty sound different.",
      });
    }
    const kind = skill === "pv.partition" ? "partition" : skill === "pv.hundreds" ? "hundreds" : rng.pick(["tens", "ones"] as const);
    const answer = kind === "tens" ? tens : kind === "ones" ? ones : n;
    const prompt = kind === "tens" ? `How many tens are in ${n}?` : kind === "ones" ? `How many ones are in ${n}?` : `What number is ${hundreds} hundreds, ${tens} tens and ${ones} ones?`;
    return make("placevalue", skill, level, `${n}:${kind}`, prompt, String(answer),
      `${n} is ${hundreds ? `${hundreds} hundred, ` : ""}${tens} tens and ${ones} ones.`, "placevalue", { number: n, tens, ones, hundreds, kind }, {
        hint1: `Let's look at the tens and the ones in ${n}.`, hint2: `${tens} tens is ${tens * 10}.`,
        unit: kind === "tens" ? "tens" : kind === "ones" ? "ones" : undefined,
      });
  },
  compare: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "cmp.numbers";
    if (skill === "cmp.order") {
      const values = [rng.int(10, 80), rng.int(10, 80), rng.int(10, 80)];
      const ordered = [...values].sort((a, b) => a - b).map(String);
      const scrambled = [...values].map(String);
      return make("compare", skill, 2, `order-${scrambled.join("-")}`, `Put these numbers in order, smallest first: ${scrambled.join(", ")}.`, ordered.join("|"), `Smallest first: ${ordered.join(", ")}.`, "picture", { sequence: ordered, scrambled }, {
        answerKind: "sequence", choices: scrambled, hint1: "Let's compare the tens first.", hint2: `The smallest number is ${ordered[0]}.`,
      });
    }
    if (skill === "cmp.expressions") {
      const leftA = rng.int(2, 8), leftB = rng.int(1, 8), rightB = rng.int(1, 8);
      const answer = leftA + leftB - rightB;
      return make("compare", skill, 2, `expression-${leftA}-${leftB}-${rightB}`, `${leftA} + ${leftB} = □ + ${rightB}. What goes in the box?`, String(answer), `${leftA} add ${leftB} is ${leftA + leftB}. ${answer} add ${rightB} is also ${leftA + leftB}.`, "balance", { a: leftA + leftB, b: answer + rightB }, {
        hint1: "Let's make both sides equal.", hint2: `The left side is ${leftA + leftB}.`,
      });
    }
    const a = rng.int(10, 99), b = rng.int(10, 99);
    const answer = a < b ? "<" : a > b ? ">" : "=";
    return make("compare", skill, 2, `${a}${answer}${b}`, `${a} □ ${b}. Which sign belongs in the box?`, answer,
      `${a} is ${a < b ? "less than" : a > b ? "greater than" : "equal to"} ${b}.`, "balance", { a, b }, {
        answerKind: "choice", choices: ["<", "=", ">"], hint1: "Let's compare the tens first.", hint2: `The tens are ${Math.floor(a / 10)} and ${Math.floor(b / 10)}.`,
      });
  },
  money: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "mn.total";
    const coins = [1, 2, 5, 10, 20, 50];
    if (skill === "mn.coins") {
      const value = rng.pick(coins);
      return make("money", skill, 2, `coin-${value}`, `What is this coin worth?`, String(value), `This coin is worth ${value} pence.`, "coins", { a: value, b: 0, total: value }, {
        unit: "p", hint1: "Let's look at the number on the coin.", hint2: "The coin number tells its value.",
      });
    }
    if (skill === "mn.ways") {
      const row = rng.pick([
        { target: 20, a: 10, b: 10, known: "10p + 10p", other: "20p", distractor: "5p + 5p" },
        { target: 30, a: 20, b: 10, known: "20p + 10p", other: "10p + 10p + 10p", distractor: "20p + 5p" },
      ] as const);
      const choices = uniqueChoices(row.other, [row.known, row.distractor, `${row.target}p`], rng);
      return make("money", skill, 2, `ways-${row.target}`, `${row.target}p can be made with ${row.known}. Which is another way?`, row.other, `${row.known} and ${row.other} both make ${row.target}p.`, "coins", { a: row.a, b: row.b, total: row.target }, {
        answerKind: "choice", choices, hint1: "Let's look for a different combination of coins.", hint2: "We can use different coins but keep the same total.",
      });
    }
    if (skill === "mn.make") {
      const target = rng.pick([15, 25, 30, 40, 60, 75]);
      const correct = `${Math.floor(target / 10) * 10}p + ${target % 10}p`;
      const choices = uniqueChoices(correct, [`${target}p`, `${Math.max(1, target - 5)}p + 5p`, `${target - 10}p + 10p`], rng);
      return make("money", skill, 2, `make-${target}`, `Which coins make ${target}p?`, correct, `${correct} makes ${target}p.`, "coins", { a: Math.floor(target / 10) * 10, b: target % 10, total: target }, {
        answerKind: "choice", choices, hint1: "Let's look for coin values that make the total.", hint2: `Let's start with ${Math.floor(target / 10) * 10}p.`,
      });
    }
    if (skill === "mn.change") {
      const paid = rng.pick([20, 50, 100]), cost = rng.int(1, Math.min(paid - 1, 45)), change = paid - cost;
      return make("money", skill, 2, `change-${paid}-${cost}`, `It costs ${cost}p. We pay ${paid}p. How much change?`, String(change), `We paid ${paid}p. It cost ${cost}p. The change is ${change}p.`, "coins", { a: paid, b: cost, total: change }, {
        unit: "p", hint1: "Let's find the difference between the price and the amount paid.", hint2: `Let's count up from ${cost}p to ${paid}p.`,
      });
    }
    if (skill === "mn.pounds-pence") {
      const pounds = rng.int(1, 4), pence = rng.pick([5, 10, 25, 50]);
      const answer = `${pounds}.${String(pence).padStart(2, "0")}`;
      return make("money", skill, 2, `money-${answer}`, `How much is £${pounds} and ${pence}p?`, answer, `£${pounds} and ${pence}p is £${answer}.`, "coins", { a: pounds * 100, b: pence, total: pounds * 100 + pence }, {
        answerKind: "text", hint1: "Let's keep pounds and pence in their places.", hint2: `${pence}p is less than one pound.`, unit: "£",
      });
    }
    const a = rng.pick([5, 10, 20, 50]);
    const b = rng.pick([1, 2, 5, 10, 20]);
    const total = a + b;
    return make("money", skill, 2, `${a}p+${b}p`, `${a}p and ${b}p make how much?`, String(total), `${a}p and ${b}p make ${total}p.`, "coins", { a, b, total }, {
      hint1: "Let's look at the coin values.", hint2: `Let's start with ${a}p and count on ${b}p.`, unit: "p",
    });
  },
  time: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "tm.quarters";
    if (skill === "tm.facts") {
      const fact = rng.pick([{ prompt: "How many minutes are in one hour?", answer: "60", model: "There are 60 minutes in one hour." }, { prompt: "How many hours are in one day?", answer: "24", model: "There are 24 hours in one day." }, { prompt: "Which is longer: one hour or one minute?", answer: "one hour", model: "One hour is longer than one minute." }] as const);
      return make("time", skill, 2, `time-fact-${fact.answer}`, fact.prompt, fact.answer, fact.model, "picture", {}, {
        answerKind: fact.answer === "one hour" ? "choice" : "number", choices: fact.answer === "one hour" ? ["one minute", "one hour", "one day"] : undefined,
        hint1: "Let's think about the clock units.", hint2: "One hour has 60 minutes.",
      });
    }
    const hour = rng.int(1, 12);
    const minutes = skill === "tm.oclock-half" ? rng.pick([0, 30]) : skill === "tm.quarters" ? rng.pick([15, 45]) : skill === "tm.five" ? rng.int(0, 11) * 5 : rng.pick([0, 15, 30, 45]);
    const label = timeLabel(hour, minutes);
    const shown = `${hour}:${String(minutes).padStart(2, "0")}`;
    const answerOptions = uniqueChoices(label, Array.from({ length: 12 }, (_, i) => timeLabel(hour, i * 5)).filter(value => value !== label), rng);
    return make("time", skill, 2, shown, `The clock shows ${shown}. What time is it?`, label, `The minute hand points to ${minutes === 0 ? 12 : minutes / 5}. It is ${label}.`, "clock", { hour, minutes }, {
      answerKind: "choice", choices: answerOptions, hint1: "Let's look at the long minute hand.", hint2: minutes === 45 ? "The minute hand is near the 12. We say quarter to." : "Each number is five minutes.",
    });
  },
  fractions: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "fr.sets";
    if (skill === "fr.equal") {
      const equal = rng.int(0, 1) === 1;
      return make("fractions", skill, 2, `equal-parts-${equal}`, "Are these parts equal?", equal ? "Yes" : "No", equal ? "The parts are equal." : "The parts are not equal.", "fraction", { denominator: 4, whole: 8, part: equal ? 2 : 3, unequal: !equal }, {
        answerKind: "choice", choices: ["Yes", "No"], hint1: "Let's compare the size of each part.", hint2: "Equal parts are the same size.",
      });
    }
    if (skill === "fr.equivalent") {
      const same = rng.int(0, 1) === 1;
      return make("fractions", skill, 2, `equivalent-${same}`, `Is 2/4 the same as ${same ? "1/2" : "1/3"}?`, same ? "Yes" : "No", same ? "2/4 is equal to 1/2." : "2/4 is not equal to 1/3.", "fraction", { denominator: 4, whole: 4, part: 2 }, {
        answerKind: "choice", choices: ["Yes", "No"], hint1: "Let's split the whole into equal parts.", hint2: "Two quarters cover the same space as one half.",
      });
    }
    if (skill === "fr.shapes" || skill === "fr.line") {
      const denominator = rng.pick([2, 3, 4]), numerator = rng.int(1, denominator - 1);
      const fraction = `${numerator}/${denominator}`;
      const name = denominator === 2 ? (numerator === 1 ? "one half" : "two halves") : denominator === 3 ? `${numberName(numerator)} third${numerator > 1 ? "s" : ""}` : `${numberName(numerator)} quarter${numerator > 1 ? "s" : ""}`;
      return make("fractions", skill, 2, `fraction-${fraction}`, skill === "fr.line" ? `What fraction is at this point?` : `What fraction of the shape is shaded?`, fraction, `${name} is shaded.`, "fraction", { denominator, whole: denominator, part: numerator, numerator, fraction }, {
        answerKind: "choice", choices: uniqueChoices(fraction, [`${numerator}/${denominator + 1}`, `${Math.max(1, numerator - 1)}/${denominator}`, `1/${denominator}`, `${numerator + 1}/${denominator + 1}`, `${numerator}/${denominator + 2}`], rng),
        hint1: "Let's count the equal parts.", hint2: `There are ${denominator} equal parts in the whole.`,
      });
    }
    const denominator = rng.pick([2, 3, 4]);
    const whole = denominator * rng.int(2, 8);
    const part = whole / denominator;
    const label = denominator === 2 ? "half" : denominator === 3 ? "one third" : "one quarter";
    return make("fractions", skill, 2, `${label}-of-${whole}`, `What is ${label} of ${whole}?`, String(part), `${label[0]!.toUpperCase()}${label.slice(1)} of ${whole} is ${part}.`, "fraction", { denominator, whole, part }, {
      hint1: `Let's share ${whole} into ${denominator} equal groups.`, hint2: `Let's count ${whole} counters into ${denominator} groups.`, strategy: "We shared equally.",
    });
  },
  measure: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "ms.ruler";
    const length = rng.int(3, skill === "ms.temp" ? 40 : 18);
    const unit = skill === "ms.scales" ? rng.pick(["g", "kg"]) : skill === "ms.jugs" ? rng.pick(["ml", "l"]) : skill === "ms.temp" ? "°C" : "cm";
    const thing = unit === "cm" ? "pencil" : unit === "g" || unit === "kg" ? "bag" : unit === "°C" ? "thermometer" : "jug";
    const model = unit === "cm" ? `The pencil is ${length} centimetres long.` : unit === "g" ? `The bag weighs ${length} grams.` : unit === "kg" ? `The bag weighs ${length} kilograms.` : unit === "°C" ? `The thermometer shows ${length} degrees Celsius.` : unit === "ml" ? `The jug holds ${length} millilitres.` : `The jug holds ${length} litres.`;
    if (skill === "ms.compare") {
      const other = Math.max(1, length - rng.int(1, 6));
      const answer = length > other ? ">" : "<";
      return make("measure", skill, 2, `measure-compare-${length}-${other}`, `${length} ${unit} □ ${other} ${unit}. Which sign belongs?`, answer, `${length} ${unit} is greater than ${other} ${unit}.`, "balance", { a: length, b: other }, {
        answerKind: "choice", choices: ["<", "=", ">"], hint1: "Let's compare the scale readings.", hint2: "The longer bar has the greater measure.", unit,
      });
    }
    return make("measure", skill, 2, `${thing}-${length}-${unit}`, `How much does the ${thing} measure?`, String(length), model, "picture", { length, unit, thing }, {
      hint1: "Let's look where the pointer ends.", hint2: "Let's count the marks from zero.", unit,
    });
  },
  shapes: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "sh.2d-props";
    if (skill === "sh.patterns") {
      const patterns = [{ shown: ["●", "▲", "●", "▲"], answer: "●", options: ["●", "▲", "■"] }, { shown: ["●", "●", "▲", "●", "●"], answer: "▲", options: ["▲", "●", "■"] }, { shown: ["■", "●", "▲", "■", "●"], answer: "▲", options: ["▲", "●", "■"] }] as const;
      const pattern = rng.pick(patterns);
      return make("shapes", skill, 2, `pattern-${pattern.shown.join("")}`, `What shape comes next? ${pattern.shown.join(" ")} …`, pattern.answer, `The next shape is ${pattern.answer}.`, "shape", { pattern: [...pattern.shown] }, {
        answerKind: "choice", choices: [...pattern.options], hint1: "Let's look at the shapes that repeat.", hint2: `The pattern starts again with ${pattern.shown[0]}.`,
      });
    }
    if (skill === "sh.3d-props" || skill === "sh.faces") {
      const rows = [{ name: "cube", faces: 6, edges: 12, vertices: 8, face: "square" }, { name: "cylinder", faces: 3, edges: 2, vertices: 0, face: "circle" }, { name: "triangular prism", faces: 5, edges: 9, vertices: 6, face: "triangle" }] as const;
      const item = rng.pick(rows);
      const prompt = skill === "sh.faces" ? `Which 2D shape is a face of the ${item.name}?` : `How many faces does a ${item.name} have?`;
      const answer = skill === "sh.faces" ? item.face : String(item.faces);
      const choices = skill === "sh.faces" ? ["circle", "square", "triangle"] : uniqueChoices(answer, ["3", "5", "6", "8"], rng);
      return make("shapes", skill, 2, `solid-${item.name}-${skill}`, prompt, answer, skill === "sh.faces" ? `A ${item.name} has a ${item.face} face.` : `A ${item.name} has ${item.faces} faces.`, "shape", { shape: item.name, faces: item.faces, edges: item.edges, vertices: item.vertices }, {
        answerKind: "choice", choices, hint1: `Let's look at the faces of the ${item.name}.`, hint2: "A face is a flat surface.",
      });
    }
    if (skill === "sh.sort") {
      const prompt = rng.pick(["Which shape has 3 sides?", "Which shape has 4 equal sides?", "Which shape has no straight sides?"]);
      const answer = prompt.includes("3 sides") ? "triangle" : prompt.includes("equal") ? "square" : "circle";
      return make("shapes", skill, 2, `shape-sort-${answer}`, prompt, answer, `The ${answer} matches those properties.`, "shape", { shape: answer, sides: answer === "triangle" ? 3 : answer === "circle" ? 0 : 4 }, {
        answerKind: "choice", choices: ["triangle", "square", "circle"], hint1: "Let's check the sides and corners.", hint2: "A circle has no straight sides.",
      });
    }
    if (skill === "sh.symmetry") {
      const symmetric = rng.int(0, 1) === 1;
      return make("shapes", skill, 2, `symmetry-${symmetric}`, "Does the shape match on both sides of the mirror line?", symmetric ? "Yes" : "No", symmetric ? "Both sides match. It is symmetrical." : "The sides do not match.", "shape", { shape: symmetric ? "square" : "triangle", symmetric }, {
        answerKind: "choice", choices: ["Yes", "No"], hint1: "Let's fold along the mirror line.", hint2: "The two halves should cover each other.",
      });
    }
    const shape = rng.pick([{ name: "triangle", sides: 3 }, { name: "square", sides: 4 }, { name: "pentagon", sides: 5 }, { name: "hexagon", sides: 6 }]);
    const askVertices = skill === "sh.2d-names" ? false : rng.int(0, 1) === 1;
    const answerNumber = askVertices ? shape.sides : shape.sides;
    const prompt = skill === "sh.2d-names" ? `Which shape has ${shape.sides} sides?` : `How many ${askVertices ? "vertices" : "sides"} does a ${shape.name} have?`;
    const answer = skill === "sh.2d-names" ? shape.name : String(answerNumber);
    const choices = skill === "sh.2d-names" ? ["triangle", "square", "pentagon", "hexagon"] : uniqueChoices(answerNumber.toString(), ["3", "4", "5", "6"], rng);
    return make("shapes", skill, 2, `${shape.name}-sides-${skill}`, prompt, answer, `A ${shape.name} has ${shape.sides} sides and ${shape.sides} vertices.`, "shape", { shape: shape.name, sides: shape.sides }, {
      answerKind: "choice", choices, hint1: "Let's follow the outside edge.", hint2: "Let's count each straight side once.",
    });
  },
  turns: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "tu.turns";
    if (skill === "tu.position") {
      const positions = ["left", "right", "above", "below", "between"];
      const answer = rng.pick(positions);
      return make("turns", skill, 2, `position-${answer}`, `Where is Bit in relation to the star?`, answer, `Bit is ${answer} the star.`, "picture", { position: answer }, {
        answerKind: "choice", choices: positions.filter(item => item !== answer).slice(0, 2).concat(answer), hint1: "Let's look at Bit and the star.", hint2: `The star is ${answer === "left" ? "to Bit's right" : "near Bit"}.`,
      });
    }
    const from = rng.pick(["up", "right", "down", "left"]);
    const turn = rng.pick(["quarter clockwise", "quarter anticlockwise", "half turn"]);
    const dirs = ["up", "right", "down", "left"];
    const index = dirs.indexOf(from);
    const offset = turn === "half turn" ? 2 : turn === "quarter clockwise" ? 1 : 3;
    const to = dirs[(index + offset) % 4]!;
    return make("turns", skill, 2, `${from}-${turn}`, `Bit faces ${from}. Bit makes a ${turn === "half turn" ? "half turn" : turn.replace("quarter", "quarter turn")}. Which way does Bit face now?`, to,
      `Bit faces ${to}.`, "rover", { from, turn, to }, { answerKind: "choice", choices: ["up", "right", "down", "left"], hint1: "Let's look at the turn arrow.", hint2: turn === "half turn" ? "A half turn faces the other way." : "A quarter turn is one corner." });
  },
  charts: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "ch.questions";
    let a = rng.int(3, 9), b = rng.int(2, 8), c = rng.int(1, 7);
    const names = ["bolts", "rings", "stars"];
    if ([a, b, c].filter(value => value === Math.max(a, b, c)).length > 1) a = Math.min(9, Math.max(a, b, c) + 1);
    const counts = [a, b, c];
    const max = Math.max(...counts), maxIndex = counts.indexOf(max), min = Math.min(...counts), minIndex = counts.indexOf(min);
    const data = { names, counts, key: skill === "ch.pictogram" ? 2 : skill === "ch.block" ? 5 : 1 };
    if (skill === "ch.questions" && rng.int(0, 1) === 1) {
      const answer = max - min;
      return make("charts", skill, 2, `chart-difference-${a}-${b}-${c}`, `How many more ${names[maxIndex]} than ${names[minIndex]}?`, String(answer), `There are ${answer} more ${names[maxIndex]} than ${names[minIndex]}.`, "chart", data, {
        hint1: "Let's compare the tallest and shortest bars.", hint2: `The bars show ${max} and ${min}.`,
      });
    }
    const answer = skill === "ch.questions" && rng.int(0, 1) === 1 ? String(counts.reduce((sum, value) => sum + value, 0)) : names[maxIndex]!;
    const choices = answer === names[maxIndex] ? names : [String(counts.reduce((sum, value) => sum + value, 0)), String(max), String(min)];
    return make("charts", skill, 2, `chart-${skill}-${a}-${b}-${c}`, skill === "ch.tally" ? "Which team collected the most?" : skill === "ch.questions" && answer !== names[maxIndex] ? "How many counters are there altogether?" : "Which team collected the most?", answer,
      typeof answer === "string" && names.includes(answer) ? `${answer[0]!.toUpperCase()}${answer.slice(1)} has the most.` : `There are ${answer} counters altogether.`, "chart", data, {
        answerKind: typeof answer === "string" && names.includes(answer) ? "choice" : "number", choices: typeof answer === "string" && names.includes(answer) ? choices : undefined,
        hint1: "Let's compare the bars.", hint2: `The tallest bar has ${max}.`,
      });
  },
  stories: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "st.add-sub";
    if (skill === "st.mult-div") {
      const groups = rng.int(2, 5), each = rng.pick([2, 5, 10]), total = groups * each;
      const cast = [options.crewNames?.hop ?? PEOPLE[0], options.crewNames?.bit ?? PEOPLE[1], options.crewNames?.zib ?? PEOPLE[2], "the monster", "the dino"];
      const who = rng.pick(cast), thing = rng.pick(COUNTABLES);
      const divide = rng.int(0, 1) === 1;
      const prompt = divide ? `${who} shares ${total} ${thing} equally into groups of ${each}. How many groups?` : `${who} has ${groups} boxes with ${each} ${thing} in each box. How many altogether?`;
      return make("stories", skill, 2, `story-mult-${groups}-${each}-${divide}`, prompt, String(divide ? groups : total), `${groups} groups of ${each} is equal to ${total}.`, "picture", { groups, table: each, total }, {
        hint1: "Let's find the equal groups in the story.", hint2: `Let's count in ${each}s.`,
      });
    }
    const a = rng.int(3, 12), b = rng.int(1, 8);
    const add = skill === "st.two-step" ? true : rng.int(0, 1) === 0;
    const total = add ? a + b : Math.max(a, b) - Math.min(a, b);
    const start = add ? a : Math.max(a, b), change = add ? b : Math.min(a, b);
    const cast = [options.crewNames?.hop ?? PEOPLE[0], options.crewNames?.bit ?? PEOPLE[1], options.crewNames?.zib ?? PEOPLE[2], "the monster", "the dino"];
    const who = rng.pick(cast), thing = rng.pick(COUNTABLES);
    const prompt = skill === "st.two-step"
      ? `${who} has ${start} ${thing}. ${who} finds ${change} more, then gives 2 away. How many are left?`
      : add ? `${who} has ${start} ${thing}. ${who} finds ${change} more. How many now?` : `${who} has ${start} ${thing}. ${who} gives away ${change}. How many are left?`;
    const storyAnswer = skill === "st.two-step" ? total - 2 : total;
    return make("stories", skill, 2, `story-${start}-${add ? "+" : "-"}${change}-${skill}`,
      prompt, String(storyAnswer), `${who} has ${storyAnswer} ${thing} now.`, "picture", { start, change, total: storyAnswer, op: add ? "+" : "−", thing }, {
        hint1: "Let's find the numbers in the story.", hint2: add ? `Let's add ${change} more.` : `Let's take away ${change}.`,
      });
  },
  spotbug: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "sb.add-sub";
    const a = rng.int(3, skill === "sb.times" ? 8 : 14), b = rng.int(1, skill === "sb.times" ? 10 : 6), correct = skill === "sb.times" ? a * b : a + b;
    const isBug = rng.int(0, 1) === 0;
    const shown = isBug ? correct + (rng.int(0, 1) ? 1 : -1) : correct;
    const sign = skill === "sb.times" ? "×" : "+";
    return make("spotbug", skill, 2, `bug-${a}${sign}${b}-${shown}`, `Captain Hop says ${a} ${sign} ${b} = ${shown}. Is that right?`, isBug ? "Bug" : "Right",
      isBug ? `Captain Hop said ${shown}. The answer is ${correct}. Let's fix it.` : `Captain Hop was right. ${a} ${sign} ${b} is ${correct}.`, "picture", { a, b, shown, correct, isBug, sign }, {
        answerKind: "choice", choices: ["Right", "Bug"], hint1: "Let's check Captain Hop's sum.", hint2: `Let's add ${a} and ${b}.`,
      });
  },
  rover: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "rv.sequence";
    let path: string[] = rng.pick([["↑", "↑", "→"], ["→", "↑", "↑"], ["↑", "→", "→"], ["→", "→", "↑"], ["↑", "↑", "→", "→"]] as const);
    let prompt = "Program Bit to reach the crystal. Choose the moves in order.";
    if (skill === "rv.drive") { path = [rng.pick(["↑", "→", "↓", "←"])]; prompt = "Move Bit one square. Choose a direction."; }
    if (skill === "rv.predict") prompt = `Bit follows this program: ${path.join(" ")}. Which moves take Bit to the crystal?`;
    if (skill === "rv.debug") { prompt = `One command is wrong. Fix this route: ${[...path.slice(0, 1), "↓", ...path.slice(2)].join(" ")}`; }
    if (skill === "rv.turns") { path = ["↑", rng.pick(["↶", "↷"]), "↑"]; prompt = "Program Bit: move forward, turn, then move forward."; }
    if (skill === "rv.loops") { const move = rng.pick(["↑", "→"]); path = [move, move, move]; prompt = `Use REPEAT 3: ${move}.`; }
    if (skill === "rv.functions") { const move = rng.pick(["↑", "→"]), turn = rng.pick(["↶", "↷"]); path = [move, turn, move, turn]; prompt = `Run the ${move === "↑" ? "UP" : "RIGHT"}-AND-TURN block twice.`; }
    if (skill === "rv.conditions") { const move = rng.pick(["↑", "→"]), turn = rng.pick(["↶", "↷"]); path = [move, turn, move]; prompt = `If there is a rock ahead, turn ${turn === "↶" ? "left" : "right"}. Then move to the crystal.`; }
    return make("rover", skill, 2, `rover-${skill}-${path.join("")}`, prompt, path.join("|"), `Bit moves ${path.join(", ")}. Bit gets the crystal!`, "rover", { path, commands: ["↑", "→", "↓", "←", "↶", "↷"] }, {
      answerKind: "sequence", choices: ["↑", "→", "↓", "←", "↶", "↷"], hint1: "Let's look at Bit and the crystal.", hint2: `Let's start with ${path[0]}.`,
    });
  },
  machine: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "mc.run";
    if (skill === "mc.rule") {
      const n = rng.int(2, 12), change = rng.pick([2, 3, 5]), outputs = [n + change, n + change * 2, n + change * 3];
      return make("machine", skill, 2, `rule-${n}-${change}`, `Inputs ${n}, ${n + change} and ${n + change * 2} come out as ${outputs[0]}, ${outputs[1]} and ${outputs[2]}. What is the rule?`, `add ${change}`, `The machine adds ${change}.`, "picture", { n, change }, {
        answerKind: "choice", choices: [`add ${change}`, `take away ${change}`, `add ${change + 1}`], hint1: "Let's compare each input and output.", hint2: `Each output is ${change} more than its input.`,
      });
    }
    if (skill === "mc.inverse") {
      const change = rng.pick([2, 5, 10]), output = rng.int(10, 30), add = rng.int(0, 1) === 0;
      const input = add ? output - change : output + change;
      return make("machine", skill, 2, `inverse-${output}-${change}-${add}`, `The machine ${add ? "adds" : "takes away"} ${change}. It outputs ${output}. What went in?`, String(input), `${input} goes in. The machine changes it by ${change}. ${output} comes out.`, "picture", { n: input, change, op: add ? "+" : "−", result: output }, {
        hint1: "Let's undo the machine rule.", hint2: `Let's ${add ? "take away" : "add"} ${change} from the output.`,
      });
    }
    const n = rng.int(2, 20), change = rng.pick([2, 5, 10]), add = rng.int(0, 1) === 0;
    const result = add ? n + change : n - change;
    return make("machine", skill, 2, `machine-${n}-${add ? "+" : "-"}${change}`, `The machine changes ${n} by ${add ? "adding" : "taking away"} ${change}. What comes out?`, String(result),
      `${n} goes in. ${add ? "Add" : "Take away"} ${change}. ${result} comes out.`, "picture", { n, change, result, op: add ? "+" : "−" }, {
        hint1: "Let's look at the rule.", hint2: `Let's change ${n} by ${change}.`,
      });
  },
  logic: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "lg.sort";
    if (skill === "lg.sudoku4") {
      const symbols = ["●", "▲", "■", "★"], missing = rng.int(0, 3), answer = symbols[missing]!;
      const row = symbols.map((symbol, index) => index === missing ? "?" : symbol);
      return make("logic", skill, 2, `sudoku-row-${missing}`, `Which shape is missing? ${row.join(" ")}`, answer, `The missing shape is ${answer}.`, "shape", { symbols: [...symbols], row }, {
        answerKind: "choice", choices: [...symbols], hint1: "Let's find the shape missing from the row.", hint2: "Each row has one of each shape.",
      });
    }
    const labels = ["circle", "square", "triangle", "star"];
    const picked = rng.pick(labels);
    return make("logic", skill, 2, `sort-${picked}`, `Which shape has 3 sides?`, "triangle", `The triangle has 3 sides.`, "shape", { shapes: labels }, {
      answerKind: "choice", choices: [picked, "triangle", "circle"].filter((v, i, a) => a.indexOf(v) === i), hint1: "Let's count the sides.", hint2: "A side is one straight edge.",
    });
  },
  steps: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "sp.order";
    const sequence = rng.pick([["Put on socks", "Put on shoes", "Tie laces"], ["Fill the cup", "Add water", "Drink"], ["Pick up the blocks", "Build the tower", "Put the blocks away"]] as const);
    const scrambled = [...sequence].reverse();
    const prompt = skill === "sp.bug" ? `One step is in the wrong place. Fix this order: ${scrambled.join(" • ")}` : `Put these steps in order: ${scrambled.join(" • ")}`;
    return make("steps", skill, 2, `steps-${skill}-${sequence.join("-")}`, prompt, sequence.join("|"), `First ${sequence[0]!.toLowerCase()}. Next ${sequence[1]!.toLowerCase()}. Last ${sequence[2]!.toLowerCase()}.`, "picture", { sequence: [...sequence], scrambled }, {
      answerKind: "sequence", choices: scrambled, hint1: "Let's think about what happens first.", hint2: `Let's start with: ${sequence[0]}.`,
    });
  },
  binary: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "bn.make";
    const value = rng.int(1, 15);
    const bits = [8, 4, 2, 1].filter(bit => (value & bit) !== 0);
    const prompt = skill === "bn.read" ? "The signal lights are on. What number do they show?" : "Add up the lamps that are on. What number do they make?";
    return make("binary", skill, 2, `binary-${skill}-${value}`, prompt, String(value), `${bits.join(" add ")} is equal to ${value}.`, "picture", { value, bits, lights: [8, 4, 2, 1] }, {
      hint1: "Let's look at the lights that are on.", hint2: "Let's add their values.",
    });
  },
  sentence: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "sw.3-slots";
    if (skill === "sw.agree") {
      const plural = rng.int(0, 1) === 1;
      const subject = plural ? "The robots" : "The robot";
      const answer = plural ? "are" : "is";
      return make("sentence", skill, 2, `agree-${subject}`, `${subject} ___ ready. Choose is or are.`, answer, `${subject} ${answer} ready.`, "sentence", { sentence: `${subject} ___ ready.` }, {
        answerKind: "choice", choices: ["is", "are"], hint1: "Let's count who is in the sentence.", hint2: plural ? "More than one robot: we say are." : "One robot: we say is.",
      });
    }
    if (skill === "sw.join" || skill === "sw.because" || skill === "sw.question") {
      const rows = skill === "sw.join"
        ? [
          { prompt: "Join the ideas with AND.", answer: "The robot jumped and Captain Hop cheered.", wrong: ["The robot jumped because Captain Hop cheered.", "The robot jumped, the Captain Hop cheered."] },
          { prompt: "Join the ideas with BUT.", answer: "The rocket was small but it flew high.", wrong: ["The rocket was small because it flew high.", "The rocket was small so it flew high."] },
          { prompt: "Join the ideas with SO.", answer: "The robot was tired so it sat down.", wrong: ["The robot was tired but it sat down.", "The robot was tired because it sat down."] },
        ]
        : skill === "sw.because"
          ? [
            { prompt: "Choose the sentence that gives a reason.", answer: "The rocket stopped because the battery was empty.", wrong: ["Because the rocket stopped the battery was empty.", "The rocket stopped and the battery was empty?"] },
            { prompt: "Choose the sentence that explains why.", answer: "Bit wore a coat because it was cold.", wrong: ["Because Bit wore a coat it was cold.", "Bit wore a coat but it was cold."] },
            { prompt: "Choose the sentence that tells the reason.", answer: "The dino smiled because the game was fun.", wrong: ["The dino smiled when the game was fun?", "Because the dino smiled the game was fun."] },
          ]
          : [
            { prompt: "Choose the question with the right word order.", answer: "Where is the robot?", wrong: ["Where the robot is?", "Where does the robot?" ] },
            { prompt: "Choose the question with the right word order.", answer: "What did Bit find?", wrong: ["What Bit did find?", "What Bit found?"] },
            { prompt: "Choose the question with the right word order.", answer: "Can Captain Hop jump?", wrong: ["Captain Hop can jump?", "Can jump Captain Hop?"] },
          ]
      const row = rng.pick(rows);
      return make("sentence", skill, 2, `grammar-${skill}-${row.answer}`, row.prompt, row.answer, row.answer, "sentence", { sentence: row.prompt }, {
        answerKind: "choice", choices: [row.answer, ...row.wrong], hint1: "Let's read each sentence aloud.", hint2: `Listen for ${skill === "sw.join" ? "and" : skill === "sw.because" ? "because" : "the question word order"}.`,
      });
    }
    const subjects = SENTENCE_LEXICON.subjects.map(subject => subject === "Bit" ? options.crewNames?.bit ?? subject : subject === "Captain Hop" ? options.crewNames?.hop ?? subject : subject === "Zib" ? options.crewNames?.zib ?? subject : subject);
    const subject = rng.pick(subjects);
    const verb = rng.pick(SENTENCE_VERBS);
    const describing = skill === "sw.describe" ? rng.pick(SENTENCE_LEXICON.describing) : "";
    const object = skill === "sw.describe" ? rng.pick(["rocket", "star", "ball", "robot"]) : rng.pick(SENTENCE_LEXICON.objects);
    const objectPhrase = skill === "sw.describe" ? `the ${describing} ${object}` : object;
    const place = rng.pick(SENTENCE_LEXICON.places);
    const when: SentenceTime | "" = skill === "sw.when" ? rng.pick(SENTENCE_LEXICON.when) : "";
    const action = verbForm(verb, when || "now");
    const sentenceParts = skill === "sw.3-slots" ? [subject, action, objectPhrase] : [subject, action, objectPhrase, place];
    const expected = sentenceLine(subject, action, objectPhrase, skill === "sw.3-slots" ? undefined : place, when || undefined);
    const slots = skill === "sw.describe" || skill === "sw.when" ? 5 : sentenceParts.length;
    return make("sentence", skill, 2, `sentence-${skill}-${expected}`, skill === "sw.when" ? `Build a sentence about ${when}.` : "Build a sentence with the word tiles.", expected, expected,
      "sentence", { subject, verb: action, verbBase: verb.base, object, objectPhrase, describing, place, slots, when, tiles: sentenceParts }, {
        answerKind: "text", hint1: "Let's choose who is in the sentence.", hint2: "Let's start with the Who tile.",
      });
  },
  fixit: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "fx.past";
    const rows = [
      { skill: "fx.past", focus: "past tense", bad: "Yesterday the robot jump.", good: "Yesterday the robot jumped.", choices: ["jumped", "jumps", "jump"] },
      { skill: "fx.past", focus: "past tense", bad: "Last night Bit go to bed.", good: "Last night Bit went to bed.", choices: ["went", "goes", "go"] },
      { skill: "fx.agree", focus: "is/are", bad: "The monster are happy.", good: "The monster is happy.", choices: ["is", "are", "were"] },
      { skill: "fx.agree", focus: "is/are", bad: "The children was ready.", good: "The children were ready.", choices: ["were", "was", "is"] },
      { skill: "fx.pronouns", focus: "pronouns", bad: "Her is playing.", good: "She is playing.", choices: ["She", "Her", "Them"] },
      { skill: "fx.pronouns", focus: "pronouns", bad: "The robot lost his wheel. She found it.", good: "The robot lost its wheel. She found it.", choices: ["its", "his", "their"] },
      { skill: "fx.articles", focus: "a/an", bad: "I saw a apple.", good: "I saw an apple.", choices: ["an", "a", "the"] },
      { skill: "fx.articles", focus: "a/an", bad: "Bit found an ball.", good: "Bit found a ball.", choices: ["a", "an", "the"] },
      { skill: "fx.articles", focus: "a/an", bad: "The dino ate a egg.", good: "The dino ate an egg.", choices: ["an", "a", "some"] },
      { skill: "fx.questions", focus: "questions", bad: "Where the robot is?", good: "Where is the robot?", choices: ["is the robot", "the robot is", "the robot"] },
      { skill: "fx.questions", focus: "questions", bad: "What Bit did find?", good: "What did Bit find?", choices: ["did Bit find", "Bit did find", "Bit find"] },
      { skill: "fx.questions", focus: "questions", bad: "Can jump Captain Hop?", good: "Can Captain Hop jump?", choices: ["Captain Hop jump", "jump Captain Hop", "Captain Hop can jump"] },
    ] as const;
    const group = rows.filter(row => row.skill === skill);
    const focused = options.grammarFocus?.length ? group.filter(row => options.grammarFocus!.some(form => form.toLowerCase() === row.focus || form.toLowerCase() === row.skill)) : group;
    const row = rng.pick(focused.length ? focused : group.length ? group : rows);
    return make("fixit", skill, 2, `fix-${row.bad}`, `Zib says: “${row.bad}” Which words fix the sentence?`, row.choices[0], `Zib says, “${row.good}” We fixed it!`, "sentence", { sentence: row.bad, fixed: row.good, choices: [...row.choices] }, {
      answerKind: "choice", choices: [...row.choices], hint1: "Let's find the word that sounds different.", hint2: `Let's say the sentence with ${row.choices[0]}.`,
    });
  },
  story: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "sm.order";
    const steps = rng.pick(STORY_SEQUENCES);
    const labels = steps.length === 3 ? ["First", "Next", "Last"] : ["First", "Next", "Then", "Last"];
    if (skill === "sm.tell") {
      const answer = steps.map((line, index) => `${labels[index]} ${line[0]!.toLowerCase()}${line.slice(1)}.`).join(" ");
      const reverse = [...steps].reverse().map((line, index) => `${labels[index]} ${line[0]!.toLowerCase()}${line.slice(1)}.`).join(" ");
      const middleSwap = [...steps];
      const second = middleSwap[1]!, third = middleSwap[2]!;
      middleSwap[1] = third; middleSwap[2] = second;
      const alternative = middleSwap.map((line, index) => `${labels[index]} ${line[0]!.toLowerCase()}${line.slice(1)}.`).join(" ");
      return make("story", skill, 2, `story-tell-${steps[0]}`, `Which story sentence tells what happened first, next and last?`, answer, answer, "picture", { sequence: [...steps] }, {
        answerKind: "choice", choices: [answer, reverse, alternative], hint1: "Let's look for first, next, then and last.", hint2: `First: ${steps[0]}.`,
      });
    }
    const scrambled = [...steps].reverse();
    const model = steps.map((line, index) => `${labels[index]} ${line[0]!.toLowerCase()}${line.slice(1)}.`).join(" ");
    return make("story", skill, 2, `story-${steps.join("-")}`, `Put the story in order: ${scrambled.join(" • ")}`, steps.join("|"), model, "picture", { sequence: [...steps], scrambled }, {
      answerKind: "sequence", choices: [...steps], hint1: "Let's think about what happens first.", hint2: `Let's start with: ${steps[0]}.`,
    });
  },
  listen: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "ld.position";
    if (skill === "ld.order") {
      const rows = [
        { first: "Put on socks", second: "Put on shoes", third: "Tie laces" },
        { first: "Put bread on the plate", second: "Add the filling", third: "Close the sandwich" },
        { first: "Put soil in the pot", second: "Plant the seed", third: "Add water" },
      ] as const;
      const row = rng.pick(rows);
      const answer = `First ${row.first.toLowerCase()}, then ${row.second.toLowerCase()}, then ${row.third.toLowerCase()}.`;
      return make("listen", skill, 2, `listen-order-${row.first}`, "Listen, then choose what happens first.", row.first, answer, "picture", {}, {
        spoken: answer, answerKind: "choice", choices: [row.first, row.second, row.third], hint1: "Let's listen for first and then.", hint2: `${row.first} happens first.`,
      });
    }
    if (skill === "ld.quantity") {
      const answer = rng.pick(["all", "some", "none"]);
      return make("listen", skill, 2, `listen-quantity-${answer}`, `Choose the picture where ${answer === "all" ? "every" : answer === "none" ? "no" : "some"} stars are in the box.`, answer, `${answer[0]!.toUpperCase()}${answer.slice(1)} of the stars are in the box.`, "picture", { quantity: answer }, {
        answerKind: "choice", choices: ["all", "some", "none"], hint1: "Let's look at the stars inside the box.", hint2: "Count the stars in the box and outside it.",
      });
    }
    const items = [
      { prompt: "Put the red star under the blue box.", answer: "red star under blue box", options: ["red star under blue box", "blue star under red box", "red star on blue box"] },
      { prompt: "Put the small ball on the big table.", answer: "small ball on big table", options: ["small ball on big table", "big ball on small table", "small ball under big table"] },
      { prompt: "Put the book next to the cup.", answer: "book next to cup", options: ["book next to cup", "cup on book", "book under cup"] },
    ] as const;
    const item = rng.pick(items);
    return make("listen", skill, 2, item.answer, item.prompt, item.answer, `The ${item.answer}.`, "picture", { options: [...item.options] }, {
      answerKind: "choice", choices: [...item.options], hint1: skill === "ld.2kw" ? "Let's listen for the object word." : "Let's listen for the position word.", hint2: `The position word is ${item.answer.split(" ").slice(-2, -1)[0]}.`,
    });
  },
  wordsort: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "ws.groups";
    if (skill === "ws.opposites") {
      const rows = [{ prompt: "What is the opposite of fast?", answer: "slow", options: ["slow", "quick", "speedy"] }, { prompt: "What is the opposite of full?", answer: "empty", options: ["empty", "heavy", "open"] }, { prompt: "What is the opposite of above?", answer: "below", options: ["below", "beside", "behind"] }] as const;
      const row = rng.pick(rows);
      return make("wordsort", skill, 2, `opposite-${row.answer}`, row.prompt, row.answer, `${row.answer[0]!.toUpperCase()}${row.answer.slice(1)} is the opposite.`, "picture", {}, {
        answerKind: "choice", choices: [...row.options], hint1: "Let's picture the two words.", hint2: "Let's think of a word that means the reverse.",
      });
    }
    if (skill === "ws.describe") {
      const row = rng.pick([{ thing: "lemon", answer: "yellow", options: ["yellow", "square", "heavy"] }, { thing: "ball", answer: "round", options: ["round", "quiet", "cold"] }, { thing: "ice", answer: "cold", options: ["cold", "tall", "soft"] }] as const);
      return make("wordsort", skill, 2, `describe-${row.thing}-${row.answer}`, `Choose a word to describe the ${row.thing}.`, row.answer, `The ${row.thing} is ${row.answer}.`, "picture", {}, {
        answerKind: "choice", choices: [...row.options], hint1: "Let's look closely at the object.", hint2: "Which word tells us what it is like?",
      });
    }
    const row = rng.pick([{ prompt: "Which one is a vehicle?", answer: "train", options: ["train", "apple", "hammer"] }, { prompt: "Which one is a fruit?", answer: "apple", options: ["apple", "chair", "bus"] }, { prompt: "Which one can fly?", answer: "plane", options: ["plane", "shoe", "cup"] }] as const);
    return make("wordsort", skill, 2, `sort-${row.answer}`, row.prompt, row.answer, `${row.answer[0]!.toUpperCase()}${row.answer.slice(1)} is the right group.`, "picture", { options: [...row.options] }, {
      answerKind: "choice", choices: [...row.options], hint1: "Let's look at what each thing is.", hint2: "Let's name each picture.",
    });
  },
  readmatch: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "rm.sentence";
    if (skill === "rm.who-what-where") {
      const rows = [{ prompt: "Zib puts the star in the box.", question: "Who puts the star in the box?", answer: "Zib", options: ["Zib", "Bit", "Captain Hop"] }, { prompt: "Bit paints the rover blue.", question: "What does Bit paint?", answer: "the rover", options: ["the rover", "the rocket", "the box"] }, { prompt: "The dino sleeps by the tree.", question: "Where does the dino sleep?", answer: "by the tree", options: ["by the tree", "in the box", "on the moon"] }] as const;
      const row = rng.pick(rows);
      return make("readmatch", skill, 2, `read-question-${row.prompt}`, `${row.prompt} ${row.question}`, row.answer, row.prompt, "picture", {}, {
        answerKind: "choice", choices: [...row.options], hint1: "Let's find the words that answer the question.", hint2: `Look for ${row.question.startsWith("Who") ? "who did it" : row.question.startsWith("What") ? "what was used" : "where it happened"}.`,
      });
    }
    if (skill === "rm.why-how") {
      const rows = [{ prompt: "Bit wears a helmet because rocks can fall.", question: "Why does Bit wear a helmet?", answer: "To protect Bit", options: ["To protect Bit", "To make Bit taller", "To carry a star"] }, { prompt: "Captain Hop counts the fuel carefully.", question: "How does Captain Hop count the fuel?", answer: "Carefully", options: ["Carefully", "Under the table", "Yesterday"] }] as const;
      const row = rng.pick(rows);
      return make("readmatch", skill, 2, `read-why-${row.prompt}`, `${row.prompt} ${row.question}`, row.answer, row.prompt, "picture", {}, {
        answerKind: "choice", choices: [...row.options], hint1: "Let's read the reason in the sentence.", hint2: "The answer tells why or how.",
      });
    }
    const rows = [
      { prompt: "The red ball is under the table.", answer: "Red ball under table", options: ["Red ball under table", "Red ball on table", "Blue ball under table"] },
      { prompt: "Bit has two blue stars.", answer: "Two blue stars", options: ["Two blue stars", "One blue star", "Two red stars"] },
      { prompt: "The small rocket is next to the moon.", answer: "Small rocket by moon", options: ["Small rocket by moon", "Big rocket by moon", "Small rocket on moon"] },
    ] as const;
    const row = rng.pick(rows);
    return make("readmatch", skill, 2, `read-${row.prompt}`, row.prompt, row.answer, row.prompt, "picture", { options: [...row.options] }, {
      answerKind: "choice", choices: [...row.options], hint1: "Let's look for the describing word.", hint2: "Let's find the position word in the sentence.",
    });
  },
  sounds: (level, rng, options = {}) => {
    const skill = options.skillId ?? "so.blend";
    const phase = options.phonicsPhase ?? 5;
    const source = phase === 4 ? PHASE4_WORDS : phase === 6 ? PHASE6_WORDS : level === 1 ? PHASE4_WORDS : PHASE5_WORDS;
    const known = new Set(options.knownGraphemes ?? []);
    const decodable = source.filter(word => word.length > 4 || options.mood !== "tired")
      .filter(word => known.size === 0 || segmentGraphemes(word).every(grapheme => known.has(grapheme)));
    const word = rng.pick(decodable.length ? decodable : source);
    const graphemes = segmentGraphemes(word);
    if (skill === "so.segment") return make("sounds", skill, level, `segment-${word}`, `Build the word from its sounds.`, graphemes.join("|"), `The word is ${word}.`, "picture", { word, graphemes, blank: true }, {
      answerKind: "sequence", choices: graphemes, spoken: word, hint1: "Let's listen to each sound.", hint2: `The word has ${graphemes.length} sounds.`,
    });
    if (skill === "so.spelling") {
      const distractors = [word.replace(/[aeiou]/, "a"), `${word.slice(0, -1)}e`, `${word}s`, "play", "rain"];
      return make("sounds", skill, level, `spelling-${word}`, "Listen to the word. Which spelling matches?", word, `The word is ${word}.`, "picture", { word, graphemes }, {
        answerKind: "choice", choices: uniqueChoices(word, distractors, rng), spoken: word, hint1: "Let's look at the sound that can be spelt in different ways.", hint2: `The word has ${graphemes.length} sounds.`,
      });
    }
    if (skill === "so.suffix") {
      const rows = [{ root: "help", suffix: "ful", answer: "helpful", wrong: ["helpfull", "helpfuls"] }, { root: "jump", suffix: "ing", answer: "jumping", wrong: ["jumping", "jumpping"] }, { root: "care", suffix: "less", answer: "careless", wrong: ["careles", "carelesss"] }] as const;
      const row = rng.pick(rows);
      return make("sounds", skill, 2, `suffix-${row.root}-${row.suffix}`, `Add -${row.suffix} to ${row.root}. Which spelling is correct?`, row.answer, `${row.root} plus ${row.suffix} makes ${row.answer}.`, "picture", { word: row.root, suffix: row.suffix }, {
        answerKind: "choice", choices: uniqueChoices(row.answer, [...row.wrong], rng), hint1: "Let's look at the end of the root word.", hint2: "Check if we keep or change the last letter.",
      });
    }
    return make("sounds", skill, 2, `sound-${word}`, `Blend the sounds. Which word do you hear?`, word, `The word is ${word}.`, "picture", { word, graphemes }, {
      answerKind: "choice", choices: uniqueChoices(word, [word.slice(0, -1), `${word}s`, word.replace(/[aeiou]/, "a"), "stamp", "play"], rng),
      hint1: "Let's look at the sound buttons.", hint2: `Let's blend the sounds in ${word}.`,
    });
  },
  alien: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "al.hear";
    const known = new Set(options.knownGraphemes ?? []);
    const decodable = ALIEN_WORDS.filter(word => !isBlockedAlienWord(word) && (known.size === 0 || segmentGraphemes(word).every(grapheme => known.has(grapheme))));
    const generated = known.size && !decodable.length ? pseudoAlienWords(known) : [];
    const candidates = decodable.length ? decodable : generated.length ? generated : ALIEN_WORDS;
    const word = rng.pick(candidates);
    const grownupRead = skill === "al.read" || options.mode === "together";
    const correct = grownupRead ? "He read it" : word;
    const safeDistractors = [...new Set([...decodable, ...generated, ...ALIEN_WORDS])]
      .filter(candidate => candidate !== word && !isBlockedAlienWord(candidate) && !REAL_WORDS.has(candidate) && (known.size === 0 || segmentGraphemes(candidate).every(grapheme => known.has(grapheme))));
    const choices = uniqueChoices(word, safeDistractors, rng);
    return make("alien", skill, 2, `alien-${word}`, grownupRead ? "Read Zib's made-up word aloud together." : "Listen to Zib's made-up word. Which letters spell it?", correct, `${word} is a made-up alien word.`, "picture", { word, grownupRead, graphemes: segmentGraphemes(word) }, {
      spoken: grownupRead ? `The alien word is ${word}.` : word,
      answerKind: grownupRead ? "grownup" : "choice", choices: grownupRead ? undefined : choices, hint1: "Let's look at the first sound.", hint2: `The word starts with ${word.slice(0, 1)}.`,
    });
  },
  tricky: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "tw.find";
    const source = options.phonicsPhase === 4 ? TRICKY_YEAR_1 : TRICKY;
    const available = source.filter(word => options.mood !== "tired" || word.length <= 6);
    const word = rng.pick(available.length ? available : source);
    if (skill === "tw.read" || options.mode === "together") return make("tricky", skill, 2, `tricky-read-${word}`, `Read this tricky word aloud together: ${word}.`, "He read it", `${word}.`, "picture", { word, grownupRead: true }, {
      spoken: word, answerKind: "grownup", hint1: "Let's say the whole word.", hint2: "The tricky part is shown in the word.",
    });
    if (skill === "tw.spell") return make("tricky", skill, 2, `tricky-spell-${word}`, `Type the tricky word you hear.`, word, `${word}.`, "picture", { word }, {
      spoken: word, answerKind: "text", hint1: "Let's look at the tricky part.", hint2: `The word starts with ${word[0]}.`,
    });
    const choices = uniqueChoices(word, [word.slice(0, -1), `${word}s`, "said", "some", "there"], rng);
    return make("tricky", skill, 2, `tricky-${word}`, `Find the word “${word}”.`, word, `${word}.`, "picture", { word, choices }, {
      answerKind: "choice", choices, hint1: "Let's look at the middle of the word.", hint2: `The word starts with ${word[0]}.`,
    });
  },
  mixups: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "zm.words";
    const rows = skill === "zm.tricky"
      ? [{ line: "The star saw red.", wrong: "saw", right: "was", choices: ["was", "saw", "has"] }, { line: "She was a little cat.", wrong: "was", right: "saw", choices: ["saw", "was", "has"] }]
      : skill === "zm.endings"
        ? [{ line: "The robot jump yesterday.", wrong: "jump", right: "jumped", choices: ["jumped", "jumps", "jump"] }, { line: "Bit play with the rover last night.", wrong: "play", right: "played", choices: ["played", "plays", "play"] }]
        : [{ line: "I saw a little horse.", wrong: "horse", right: "house", choices: ["house", "horse", "horse's"] }, { line: "The star is on the box.", wrong: "on", right: "in", choices: ["in", "on", "under"] }];
    const row = rng.pick(rows);
    return make("mixups", skill, 2, `mix-${skill}-${row.line}`, `Zib reads: “${row.line}” One word is mixed up. Which word?`, row.wrong, `Zib said ${row.wrong}. Let's change it to ${row.right}.`, "sentence", { sentence: row.line, wrong: row.wrong, right: row.right, choices: [...row.choices] }, {
      answerKind: "choice", choices: [...row.choices], hint1: "Let's listen to each word.", hint2: `One word sounds like ${row.right}.`,
    });
  },
  typing: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "ty.commands";
    const commands = ["go", "up", "down", "stop", "jump", "spin", "zap", "land", "run", "hop"];
    const phaseSource = options.phonicsPhase === 4 ? PHASE4_WORDS : options.phonicsPhase === 6 ? PHASE6_WORDS : PHASE5_WORDS;
    const phaseWords = phaseSource.filter(word => options.mood !== "tired" || word.length <= 4);
    const known = new Set(options.knownGraphemes ?? []);
    const words = phaseWords.filter(word => known.size === 0 || segmentGraphemes(word).every(grapheme => known.has(grapheme)));
    if (skill === "ty.keys") {
      const letter = rng.pick(["a", "b", "c", "d", "m", "o", "s", "t"]);
      return make("typing", skill, 2, `typing-letter-${letter}`, `Type the letter you see: ${letter}`, letter, `The letter is ${letter}.`, "picture", { word: letter }, { answerKind: "text", hint1: `Let's find ${letter} on the keyboard.`, hint2: `${letter} is the letter.`, spoken: `${letter}.` });
    }
    if (skill === "ty.words" || skill === "ty.dictation") {
      const word = rng.pick(words.length ? words : phaseWords);
      const dictated = skill === "ty.dictation";
      return make("typing", skill, 2, `typing-${skill}-${word}`, dictated ? "Listen to Zib, then type the word." : `Type this word: ${word}`, word, `The word is ${word}.`, "picture", { word, concealed: dictated }, {
        answerKind: "text", spoken: dictated ? word : `Type the word ${word}.`, hint1: "Let's find the first letter.", hint2: `The word starts with ${word[0]}.`,
      });
    }
    if (skill === "ty.sentence") {
      const verb = rng.pick(SENTENCE_VERBS), subject = rng.pick(["The robot", options.crewNames?.hop ?? "Captain Hop"]);
      const sentence = sentenceLine(subject, verb.present, "the rocket");
      return make("typing", skill, 2, `typing-sentence-${sentence}`, `Type this sentence: ${sentence}`, sentence, `${sentence} We wrote a whole sentence.`, "picture", { word: sentence }, {
        answerKind: "text", spoken: sentence, hint1: "Let's start with a capital letter.", hint2: `The first word is ${subject}.`,
      });
    }
    const word = rng.pick(commands);
    return make("typing", skill, 2, `typing-command-${word}`, `Type this robot command: ${word}`, word, `The command is ${word}.`, "picture", { word }, {
      answerKind: "text", hint1: "Let's find the first letter.", hint2: `The first letter is ${word[0]}.`,
    });
  },
  letters: (_level, rng, options = {}) => {
    const skill = options.skillId ?? "lt.letters";
    const digit = skill === "lt.digits";
    const symbol = digit ? String(rng.int(0, 9)) : rng.pick(["a", "c", "d", "g", "o", "s", "t", "m", "r", "b"]);
    const choices = uniqueChoices(symbol, digit ? [String((Number(symbol) + 1) % 10), String((Number(symbol) + 2) % 10), "0", "5"] : [symbol.toUpperCase(), String.fromCharCode(symbol.charCodeAt(0) + 1), "a", "o", "m"], rng);
    return make("letters", skill, 2, `${digit ? "digit" : "letter"}-${symbol}`, digit ? `Which number are we practising?` : `Which letter are we practising?`, symbol, `This is the ${digit ? "number" : "letter"} ${symbol}. Let's write it on paper.`, "picture", { letter: digit ? "" : symbol, digit: digit ? Number(symbol) : -1, symbol }, {
      answerKind: "choice", choices, hint1: "Let's look at the shape.", hint2: digit ? `This is the number ${symbol}.` : "Let's follow the start point and the arrow.",
    });
  },
};

function pseudoAlienWords(known: Set<string>): string[] {
  const consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "x", "z"].filter(letter => known.has(letter));
  const vowels = ["a", "e", "i", "o", "u"].filter(letter => known.has(letter));
  const words = new Set<string>();
  for (const first of consonants) for (const vowel1 of vowels) for (const middle of consonants) for (const last of consonants) for (const vowel2 of vowels) {
    const word = `${first}${vowel1}${middle}${last}${vowel2}`;
    if (REAL_WORDS.has(word) || isBlockedAlienWord(word) || !segmentGraphemes(word).every(grapheme => known.has(grapheme))) continue;
    words.add(word);
  }
  if (!words.size) for (const grapheme of known) {
    if (segmentGraphemes(grapheme).length !== 1) continue;
    for (let length = 3; length <= 5; length++) {
      const word = grapheme.repeat(length);
      if (!REAL_WORDS.has(word) && !isBlockedAlienWord(word)) words.add(word);
    }
  }
  return [...words];
}

export function segmentGraphemes(word: string): string[] {
  const lower = word.toLowerCase();
  const splitDigraphs = ["a-e", "e-e", "i-e", "o-e", "u-e"];
  for (const split of splitDigraphs) {
    const vowel = split[0]!;
    const index = lower.lastIndexOf(vowel, lower.length - 3);
    if (index >= 0 && index === lower.length - 3 && lower.endsWith("e")) {
      const prefix = segmentGraphemes(lower.slice(0, index));
      const middle = lower[index + 1]!;
      return [...prefix, split, middle];
    }
  }
  const digraphs = ["igh", "tch", "dge", "sh", "ch", "th", "ng", "ck", "ai", "ee", "oa", "oo", "ar", "or", "ur", "ow", "oi", "ear", "air", "ure", "er", "ay", "ou", "ie", "ea", "oy", "ir", "ue", "aw", "wh", "ph", "ew", "oe", "au", "ey"];
  const result: string[] = [];
  let i = 0;
  while (i < word.length) {
    const match = digraphs.find(item => word.startsWith(item, i));
    if (match) { result.push(match); i += match.length; }
    else { result.push(word[i]!); i++; }
  }
  return result;
}

function createQuestion(activity: ActivityId, level: Level, rng: Rng, options: GeneratorOptions): GeneratedQuestion {
  const question = builders[activity](level, rng, options);
  return { ...question, level, ...(options.skillId ? { skillId: options.skillId } : {}) };
}

export function generateQuestion(activity: ActivityId, level: Level, rng: Rng, avoid: string[] = [], options: GeneratorOptions = {}): GeneratedQuestion {
  let question = createQuestion(activity, level, rng, options);
  for (let i = 0; i < 40 && avoid.includes(question.key); i++) question = createQuestion(activity, level, rng, options);
  return question;
}

export function questionVisualLabel(kind: VisualKind): string {
  return kind;
}

export const WORD_LISTS = { phase4: PHASE4_WORDS, phase5: PHASE5_WORDS, phase6: PHASE6_WORDS, alien: ALIEN_WORDS, trickyYear1: TRICKY_YEAR_1, trickyYear2: TRICKY_YEAR_2, tricky: TRICKY };
export { BLOCKED_ALIEN_WORDS };
