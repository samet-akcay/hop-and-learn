import type { ActivityId, AreaId, Level } from "../core/types";

export type CurriculumStage = "R" | "Y1" | "Y2" | "Y3" | "Y4";

export interface SkillDefinition {
  id: string;
  activityId: ActivityId;
  area: AreaId;
  stage: CurriculumStage;
  stretch: boolean;
  requires: string[];
  masteryLevel: Level;
  fact: boolean;
  nlaStage?: 5;
}

interface PathDefinition {
  activityId: ActivityId;
  area: AreaId;
  stage: CurriculumStage;
  skills: string[];
  stretch?: string[];
  facts?: string[];
  stageFive?: string[];
  masteryLevel?: Level;
}

const paths: PathDefinition[] = [
  { activityId: "numberline", area: "numbers", stage: "Y2", skills: ["nl.count-on", "nl.count-back", "nl.bigger-first", "nl.bridge-10", "nl.difference", "nl.missing", "nl.skip", "nl.estimate", "nl.tens", "nl.2d-1d", "nl.2d-2d", "nl.scale", "nl.below-zero", "nl.to-1000"], stretch: ["nl.below-zero", "nl.to-1000"], facts: ["nl.count-on", "nl.count-back", "nl.bigger-first", "nl.bridge-10", "nl.difference", "nl.missing", "nl.tens", "nl.2d-1d", "nl.2d-2d"] },
  { activityId: "bonds", area: "numbers", stage: "Y2", skills: ["bd.subitise", "bd.make-n", "bd.to-10", "bd.doubles", "bd.to-20", "bd.family", "bd.related", "bd.bar", "bd.three", "bd.to-100", "bd.facts-20"], stretch: ["bd.to-100"], facts: ["bd.to-10", "bd.to-20", "bd.family", "bd.related", "bd.facts-20"] },
  { activityId: "times", area: "numbers", stage: "Y2", skills: ["tt.equal", "tt.repeated", "tt.arrays", "tt.x2", "tt.x10", "tt.x5", "tt.odd-even", "tt.double-half", "tt.share", "tt.group", "tt.x3", "tt.x4", "tt.x8", "tt.x6", "tt.x9", "tt.x7", "tt.x11", "tt.x12", "tt.facts"], stretch: ["tt.x3", "tt.x4", "tt.x8", "tt.x6", "tt.x9", "tt.x7", "tt.x11", "tt.x12"], facts: ["tt.x2", "tt.x10", "tt.x5", "tt.x3", "tt.x4", "tt.x8", "tt.x6", "tt.x9", "tt.x7", "tt.x11", "tt.x12", "tt.facts"] },
  { activityId: "placevalue", area: "numbers", stage: "Y2", skills: ["pv.teens", "pv.tens-ones", "pv.partition", "pv.flexible", "pv.more-less", "pv.words", "pv.hundreds"], stretch: ["pv.hundreds"] },
  { activityId: "compare", area: "numbers", stage: "Y2", skills: ["cmp.numbers", "cmp.order", "cmp.expressions"] },
  { activityId: "money", area: "numbers", stage: "Y2", skills: ["mn.coins", "mn.total", "mn.make", "mn.ways", "mn.change", "mn.pounds-pence"] },
  { activityId: "time", area: "numbers", stage: "Y2", skills: ["tm.oclock-half", "tm.quarters", "tm.five", "tm.facts"] },
  { activityId: "fractions", area: "numbers", stage: "Y2", skills: ["fr.equal", "fr.shapes", "fr.sets", "fr.equivalent", "fr.line"], stretch: ["fr.line"] },
  { activityId: "measure", area: "numbers", stage: "Y2", skills: ["ms.ruler", "ms.scales", "ms.jugs", "ms.temp", "ms.compare"] },
  { activityId: "shapes", area: "numbers", stage: "Y2", skills: ["sh.patterns", "sh.2d-names", "sh.2d-props", "sh.3d-props", "sh.faces", "sh.symmetry", "sh.sort"] },
  { activityId: "turns", area: "numbers", stage: "Y2", skills: ["tu.turns", "tu.position"] },
  { activityId: "charts", area: "numbers", stage: "Y2", skills: ["ch.tally", "ch.pictogram", "ch.block", "ch.questions"] },
  { activityId: "stories", area: "numbers", stage: "Y2", skills: ["st.add-sub", "st.mult-div", "st.two-step"], stretch: ["st.two-step"] },
  { activityId: "spotbug", area: "numbers", stage: "Y2", skills: ["sb.add-sub", "sb.times"] },
  { activityId: "rover", area: "code", stage: "Y2", skills: ["rv.drive", "rv.sequence", "rv.predict", "rv.debug", "rv.turns", "rv.loops", "rv.functions", "rv.conditions"], stretch: ["rv.functions", "rv.conditions"] },
  { activityId: "machine", area: "code", stage: "Y2", skills: ["mc.run", "mc.rule", "mc.inverse"] },
  { activityId: "logic", area: "code", stage: "Y2", skills: ["lg.sudoku4", "lg.sort"] },
  { activityId: "steps", area: "code", stage: "Y2", skills: ["sp.order", "sp.bug"] },
  { activityId: "binary", area: "code", stage: "Y4", skills: ["bn.make", "bn.read"], stretch: ["bn.make", "bn.read"] },
  { activityId: "sentence", area: "words", stage: "Y2", skills: ["sw.3-slots", "sw.4-slots", "sw.describe", "sw.when", "sw.agree", "sw.join", "sw.because", "sw.question"], stageFive: ["sw.join", "sw.because", "sw.question"] },
  { activityId: "fixit", area: "words", stage: "Y2", skills: ["fx.past", "fx.agree", "fx.pronouns", "fx.articles", "fx.questions"], stageFive: ["fx.questions"] },
  { activityId: "story", area: "words", stage: "Y2", skills: ["sm.order", "sm.tell"] },
  { activityId: "listen", area: "words", stage: "Y2", skills: ["ld.2kw", "ld.3kw", "ld.4kw", "ld.position", "ld.order", "ld.quantity"] },
  { activityId: "wordsort", area: "words", stage: "Y2", skills: ["ws.groups", "ws.opposites", "ws.describe"] },
  { activityId: "readmatch", area: "words", stage: "Y2", skills: ["rm.sentence", "rm.who-what-where", "rm.why-how"], stageFive: ["rm.why-how"] },
  { activityId: "sounds", area: "words", stage: "Y2", skills: ["so.blend", "so.segment", "so.spelling", "so.suffix"] },
  { activityId: "alien", area: "words", stage: "Y2", skills: ["al.read", "al.hear"] },
  { activityId: "tricky", area: "words", stage: "Y2", skills: ["tw.find", "tw.spell", "tw.read"] },
  { activityId: "mixups", area: "words", stage: "Y2", skills: ["zm.words", "zm.tricky", "zm.endings"] },
  { activityId: "typing", area: "words", stage: "Y2", skills: ["ty.keys", "ty.words", "ty.commands", "ty.sentence", "ty.dictation"] },
  { activityId: "letters", area: "words", stage: "Y2", skills: ["lt.letters", "lt.digits"] },
];

const crossPrerequisites: Record<string, string[]> = {
  "nl.tens": ["pv.tens-ones"],
  "nl.2d-1d": ["pv.tens-ones", "nl.bridge-10"],
  "nl.2d-2d": ["pv.tens-ones", "nl.bridge-10"],
  "cmp.numbers": ["pv.tens-ones"],
  "st.add-sub": ["bd.bar"],
  "st.mult-div": ["tt.share"],
  "fr.sets": ["tt.share"],
  "mn.change": ["nl.difference"],
  "ms.scales": ["nl.scale"],
  "ms.jugs": ["nl.scale"],
  "ms.temp": ["nl.scale"],
  "sb.add-sub": ["bd.to-20"],
  "sb.times": ["tt.x2"],
  "rv.turns": ["tu.turns"],
};

export const SKILLS: SkillDefinition[] = paths.flatMap(path => path.skills.map((id, index) => ({
  id,
  activityId: path.activityId,
  area: path.area,
  stage: path.stretch?.includes(id) ? "Y3" as CurriculumStage : path.stage,
  stretch: path.stretch?.includes(id) ?? false,
  requires: [...(index > 0 ? [path.skills[index - 1]!] : []), ...(crossPrerequisites[id] ?? [])],
  masteryLevel: path.masteryLevel ?? 4,
  fact: path.facts?.includes(id) ?? false,
  nlaStage: path.stageFive?.includes(id) ? 5 : undefined,
})));

export const SKILL_BY_ID = new Map(SKILLS.map(skill => [skill.id, skill]));
export const SKILLS_BY_ACTIVITY = new Map<ActivityId, SkillDefinition[]>(paths.map(path => [path.activityId, SKILLS.filter(skill => skill.activityId === path.activityId)]));
export const SKILL_ORDER = new Map(SKILLS.map((skill, index) => [skill.id, index]));

export function skillsForArea(area: AreaId): SkillDefinition[] {
  return SKILLS.filter(skill => skill.area === area);
}

export function defaultLevelFor(skillId: string): Level {
  const known: Record<string, Level> = {
    "nl.count-on": 3, "nl.bridge-10": 2,
    "bd.to-10": 4, "bd.to-20": 3,
    "tt.x2": 3, "tt.x10": 2, "tt.x5": 2,
    "rv.drive": 2, "sw.3-slots": 2, "fx.past": 2, "so.blend": 2,
  };
  return known[skillId] ?? 1;
}
