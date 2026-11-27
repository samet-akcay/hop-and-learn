import type { ComponentType } from "preact";
import type { ActivityId, GeneratedQuestion, VisualKind } from "../core/types";
import { BondsScene } from "./BondsScene";
import { CompareScene } from "./CompareScene";
import { FractionScene } from "./FractionScene";
import { MoneyScene } from "./MoneyScene";
import { NumberLineScene } from "./NumberLineScene";
import { PlaceValueScene } from "./PlaceValueScene";
import { TimeScene } from "./TimeScene";
import { TimesScene } from "./TimesScene";
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
};

/** Resolve a rebuilt scene component for a question, or undefined to use the legacy renderer. */
export function resolveScene(question: GeneratedQuestion): ComponentType<SceneProps> | undefined {
  if (question.activityId === "time") return TimeScene;
  return VISUAL_SCENES[question.visual];
}
