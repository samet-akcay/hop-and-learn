import type { GeneratedQuestion, Level, SuitId } from "../core/types";

/**
 * Uniform contract for every scene component in src/scenes/.
 * Adding a new game visual means writing one self-contained component
 * with these props and registering it in src/scenes/registry.ts.
 */
export interface SceneProps {
  question: GeneratedQuestion;
  suit: SuitId;
  level: Level;
  solved?: boolean;
  reducedMotion?: boolean;
  initialSteps?: number;
  initialComplete?: boolean;
  onActivity?: () => void;
  onStep?: (steps: number) => void;
  onWorkComplete?: () => void;
}
