import type { ComponentType } from "preact";
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
import { PlaceValueScene } from "./PlaceValueScene";
import { RoverScene } from "./RoverScene";
import { ShapesScene } from "./ShapesScene";
import { SpotBugScene } from "./SpotBugScene";
import { StepsScene } from "./StepsScene";
import { StoriesScene } from "./StoriesScene";
import { TimeScene } from "./TimeScene";
import { TimesScene } from "./TimesScene";
import { TurnsScene } from "./TurnsScene";
import type { SceneProps } from "./types";

/**
 * Activities that have been rebuilt on the unified SVG visual kit (src/kit/).
 * Shown on the child's home screen by default; other games can still be enabled
 * from the Grown-up corner while we rebuild them one by one.
 */
export const POLISHED_ACTIVITIES = new Set<ActivityId>([
  "numberline",
  "bonds",
  "times",
  "fractions",
  "placevalue",
  "compare",
  "money",
  "time",
  "rover",
  "turns",
  "shapes",
  "measure",
  "spotbug",
  "charts",
  "stories",
  "machine",
  "logic",
  "steps",
  "binary",
]);

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

/** Resolve a rebuilt scene component for a question, or undefined to use the legacy renderer. */
export function resolveScene(question: GeneratedQuestion): ComponentType<SceneProps> | undefined {
  if (question.activityId === "time") return TimeScene;
  if (question.activityId === "rover") return RoverScene;
  if (question.activityId === "turns") return TurnsScene;
  if (question.activityId === "shapes") return ShapesScene;
  if (question.activityId === "measure" && question.visual !== "balance") return MeasureScene;
  if (question.activityId === "spotbug") return SpotBugScene;
  if (question.activityId === "stories") return StoriesScene;
  if (question.activityId === "machine") return MachineScene;
  if (question.activityId === "logic") return LogicScene;
  if (question.activityId === "steps") return StepsScene;
  if (question.activityId === "binary") return BinaryScene;
  return VISUAL_SCENES[question.visual];
}
