import type { ComponentType } from "preact";
import type { ActivityId, GeneratedQuestion, VisualKind } from "../core/types";
import { BondsScene } from "./BondsScene";
import { FractionScene } from "./FractionScene";
import { NumberLineScene } from "./NumberLineScene";
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
]);

const VISUAL_SCENES: Partial<Record<VisualKind, ComponentType<SceneProps>>> = {
  numberline: NumberLineScene,
  bonds: BondsScene,
  array: TimesScene,
  fraction: FractionScene,
};

/** Resolve a rebuilt scene component for a question, or undefined to use the legacy renderer. */
export function resolveScene(question: GeneratedQuestion): ComponentType<SceneProps> | undefined {
  return VISUAL_SCENES[question.visual];
}
