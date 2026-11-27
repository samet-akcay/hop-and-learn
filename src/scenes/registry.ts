import type { ComponentType } from "preact";
import { ACTIVITIES } from "../content/catalogue";
import type { ActivityId, GeneratedQuestion, VisualKind } from "../core/types";
import { BinaryScene } from "./BinaryScene";
import { BondsScene } from "./BondsScene";
import { ChartsScene } from "./ChartsScene";
import { CompareScene } from "./CompareScene";
import { FractionScene } from "./FractionScene";
import { LogicScene } from "./LogicScene";
import { MachineScene } from "./MachineScene";
import { MeasureScene } from "./MeasureScene";
import { MoneyScene } from "./MoneyScene";
import { NumberLineScene } from "./NumberLineScene";
import { PhonicsScene } from "./PhonicsScene";
import { PlaceValueScene } from "./PlaceValueScene";
import { RoverScene } from "./RoverScene";
import { SentenceScene } from "./SentenceScene";
import { ShapesScene } from "./ShapesScene";
import { SpotBugScene } from "./SpotBugScene";
import { StepsScene } from "./StepsScene";
import { StoriesScene } from "./StoriesScene";
import { TimeScene } from "./TimeScene";
import { TimesScene } from "./TimesScene";
import { TurnsScene } from "./TurnsScene";
import { WordsPictureScene } from "./WordsPictureScene";
import { WritingScene } from "./WritingScene";
import type { SceneProps } from "./types";

/** All 31 activities are built on the unified SVG visual kit (src/kit/). */
export const POLISHED_ACTIVITIES = new Set<ActivityId>(ACTIVITIES.map(activity => activity.id));

const ACTIVITY_SCENES: Partial<Record<ActivityId, ComponentType<SceneProps>>> = {
  time: TimeScene,
  rover: RoverScene,
  turns: TurnsScene,
  shapes: ShapesScene,
  spotbug: SpotBugScene,
  stories: StoriesScene,
  machine: MachineScene,
  logic: LogicScene,
  steps: StepsScene,
  binary: BinaryScene,
  sentence: SentenceScene,
  fixit: SentenceScene,
  mixups: SentenceScene,
  listen: WordsPictureScene,
  wordsort: WordsPictureScene,
  readmatch: WordsPictureScene,
  story: WordsPictureScene,
  sounds: PhonicsScene,
  alien: PhonicsScene,
  tricky: PhonicsScene,
  typing: WritingScene,
  letters: WritingScene,
};

const VISUAL_SCENES: Partial<Record<VisualKind, ComponentType<SceneProps>>> = {
  numberline: NumberLineScene,
  bonds: BondsScene,
  array: TimesScene,
  fraction: FractionScene,
  placevalue: PlaceValueScene,
  balance: CompareScene,
  coins: MoneyScene,
  clock: TimeScene,
  chart: ChartsScene,
};

/** Resolve the unified SVG scene component for any question. */
export function resolveScene(question: GeneratedQuestion): ComponentType<SceneProps> | undefined {
  if (question.activityId === "measure") {
    return question.visual === "balance" ? CompareScene : MeasureScene;
  }
  return ACTIVITY_SCENES[question.activityId] ?? VISUAL_SCENES[question.visual];
}
