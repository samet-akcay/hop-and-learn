export type ActivityId =
  | "numberline" | "bonds" | "times" | "placevalue" | "compare" | "money" | "time"
  | "fractions" | "measure" | "shapes" | "turns" | "charts" | "stories" | "spotbug"
  | "rover" | "machine" | "logic" | "steps" | "binary"
  | "sentence" | "fixit" | "story" | "listen" | "wordsort" | "readmatch"
  | "sounds" | "alien" | "tricky" | "mixups" | "typing" | "letters";

export type AreaId = "numbers" | "code" | "words";
export type SuitId = "space" | "robot" | "webhero" | "monster" | "speed" | "dino" | "pond";
export type SessionMode = "solo" | "together";
export type Mood = "ready" | "tired" | "wiggly" | "upset";
export type Level = 1 | 2 | 3 | 4 | 5;
export type AnswerKind = "number" | "choice" | "text" | "sequence" | "grownup";
export type VisualKind = "numberline" | "bonds" | "array" | "placevalue" | "balance" | "clock" | "fraction" | "rover" | "sentence" | "chart" | "coins" | "shape" | "picture" | "none";

export interface ActivityDefinition {
  id: ActivityId;
  area: AreaId;
  title: string;
  icon: string;
  summary: string;
  stage: string;
}

export interface GeneratedQuestion {
  key: string;
  activityId: ActivityId;
  skillId: string;
  level: Level;
  prompt: string;
  spoken: string;
  instruction?: string;
  answer: string;
  answerKind: AnswerKind;
  choices?: string[];
  unit?: string;
  model: string;
  hint1: string;
  hint2: string;
  visual: VisualKind;
  data: Record<string, string | number | boolean | string[] | number[]>;
  strategy?: string;
  mixUp?: string;
}

export interface Outcome {
  at: number;
  activityId: ActivityId;
  skillId: string;
  key: string;
  level: Level;
  correctFirstTry: boolean;
  elapsedMs: number;
  hint: number;
  demo: boolean;
  checked: boolean;
  answer: string;
  wrongAnswers?: string[];
  twinOf?: string;
  isReview?: boolean;
  sessionId?: string;
  mixUps?: string[];
  strategy?: string;
  stepIndex?: number;
}

export type SkillStatus = "locked" | "open" | "learning" | "mastered";

export interface SkillProgress {
  level: Level;
  mastered: boolean;
  status?: SkillStatus;
  recent: boolean[];
  masteryDays: string[];
  sessionsSeen?: number;
  lastSessionId?: string;
  reviewDue?: string;
  reviewStep?: number;
}

export interface FactCard {
  key: string;
  box: 0 | 1 | 2 | 3 | 4 | 5;
  due: string;
  lastMs: number;
  activityId?: ActivityId;
  skillId?: string;
}

export interface MixUpSupport { mixUp: string; remaining: number }

export interface LearningState {
  progress: Record<string, SkillProgress>;
  facts: Record<string, FactCard>;
  attempts: Outcome[];
  sessionsPlayed: number;
  activityRuns: Record<string, number>;
  mixUpPatterns: Record<string, string[]>;
  mixUpSupport: Record<string, MixUpSupport>;
  badges: string[];
  lastActivityId?: ActivityId;
  lastActivityStreak: number;
  wordOfWeek?: string;
  wordOfWeekKey?: string;
}

export interface PendingReview {
  question: GeneratedQuestion;
  remaining: number;
}

export type MissionStep =
  | { kind: "mission"; activityId: ActivityId; questions: number; skillId?: string; warmup?: boolean; area?: AreaId }
  | { kind: "move" };

export type PlanStep =
  | { kind: "checkin" }
  | { kind: "mission"; activityId: ActivityId; skillId?: string; length: number; warmup?: boolean }
  | { kind: "move" }
  | { kind: "calm" }
  | { kind: "reward"; minutes: number };

export interface SessionPlan {
  mode: SessionMode;
  activityId: ActivityId;
  suit: SuitId;
  questions: number;
  warmup: boolean;
  startedAt: number;
  steps?: MissionStep[];
  tutorPlan?: PlanStep[];
  rewardMinutes?: number;
  freePlay?: boolean;
  freePlayRound?: boolean;
}

export interface SessionRun {
  plan: SessionPlan;
  mood?: Mood;
  status: "ready" | "running" | "reward" | "landed" | "paused" | "calm";
  stepIndex: number;
  questionIndex: number;
  question?: GeneratedQuestion;
  previousKeys: string[];
  pendingReview?: PendingReview[];
  isReview?: boolean;
  attemptsOnCurrent: number;
  wrongAnswers?: string[];
  twinOf?: string;
  firstTry: boolean;
  hintLevel: 0 | 1 | 2;
  demosUsed: number;
  worked: boolean;
  workStep: number;
  checked: boolean;
  feedback: string;
  questionStartedAt: number;
  focusMessage?: string;
  fastWrongHistory?: boolean[];
  focusLevel: number;
  easierQuestionsRemaining: number;
  supportNotice?: string;
  focusResponse?: "move" | "easier" | "calm" | "grownup";
  hintRushed?: boolean;
  hintRushHistory?: boolean[];
  demoRushHistory?: boolean[];
  advanceOnResume?: boolean;
  resumeAfterMovement?: boolean;
  returnStatus?: "ready" | "running" | "reward";
  rewardStartedAt?: number;
  endedEarly?: boolean;
}

export interface AppSettings {
  voiceName: string;
  speech: boolean;
  sound: boolean;
  volume: number;
  reducedMotion: boolean;
  suitsOffered: SuitId[];
  hintChargeSec: number;
  soloDemoLimit: number;
  togetherDemoLimit: number;
  freePlay: boolean;
  childCanReplay: boolean;
  phonicsPhase: 4 | 5 | 6;
  knownGraphemes: string[];
  nlaStage: 4 | 5 | 6;
  grammarFocus: string[];
  sentenceColours: Record<"who" | "doing" | "what" | "where" | "describing" | "when" | "joining", string>;
  suitChooser: "child" | "grownup";
}

export interface MoodEntry { at: number; mood: Mood }
export interface FocusEvent { at: number; sessionId: string; stepIndex: number; signal: "fast-guessing" | "hint-rush" | "demo-rush" | "idle" | "left"; level: number }

export interface AppData {
  setupComplete: boolean;
  childName?: string;
  crewNames: { hop: string; bit: string; zib: string };
  pinSalt: string;
  pinHash: string;
  stars: number;
  settings: AppSettings;
  progress: Record<string, SkillProgress>;
  attempts: Outcome[];
  facts: Record<string, FactCard>;
  activityRuns: Record<string, number>;
  mixUpPatterns: Record<string, string[]>;
  mixUpSupport: Record<string, MixUpSupport>;
  badges: string[];
  lastActivityId?: ActivityId;
  lastActivityStreak: number;
  wordOfWeek?: string;
  wordOfWeekKey?: string;
  run?: SessionRun;
  unlockedBase: string[];
  baseDecor: string[];
  daysPlayed: string[];
  checkins: MoodEntry[];
  focusEvents: FocusEvent[];
  realWorldDone: Record<string, string>;
  sessionsPlayed: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  voiceName: "Daniel",
  speech: true,
  sound: true,
  volume: 0.18,
  reducedMotion: false,
  suitsOffered: ["space", "robot", "speed"],
  hintChargeSec: 10,
  soloDemoLimit: 1,
  togetherDemoLimit: 2,
  freePlay: false,
  childCanReplay: true,
  phonicsPhase: 5,
  knownGraphemes: ["s", "a", "t", "p", "i", "n", "m", "d", "g", "o", "c", "k", "e", "u", "r", "h", "b", "f", "l", "j", "v", "w", "x", "y", "z", "qu", "ch", "sh", "th", "ng"],
  nlaStage: 4,
  grammarFocus: [],
  sentenceColours: { who: "#df9b8b", doing: "#e2c276", what: "#8dbc9b", where: "#83b6d0", describing: "#d99ac5", when: "#c5a6d5", joining: "#a8a8b4" },
  suitChooser: "child",
};

export function freshAppData(): AppData {
  return {
    setupComplete: false,
    crewNames: { hop: "Captain Hop", bit: "Bit", zib: "Zib" },
    pinSalt: "",
    pinHash: "",
    stars: 0,
    settings: { ...DEFAULT_SETTINGS, suitsOffered: [...DEFAULT_SETTINGS.suitsOffered], knownGraphemes: [...DEFAULT_SETTINGS.knownGraphemes], grammarFocus: [], sentenceColours: { ...DEFAULT_SETTINGS.sentenceColours } },
    progress: {},
    attempts: [],
    facts: {},
    activityRuns: {},
    mixUpPatterns: {},
    mixUpSupport: {},
    badges: [],
    lastActivityStreak: 0,
    unlockedBase: ["launch"],
    baseDecor: [],
    daysPlayed: [],
    checkins: [],
    focusEvents: [],
    realWorldDone: {},
    sessionsPlayed: 0,
  };
}
