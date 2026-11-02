import type { ActivityId, SuitId } from "../core/types";

export type MaxNumber = 10 | 20 | 100;
export type Difficulty = "easy" | "medium" | "hard";

export interface PlaySettings {
  /** The biggest number a maths question may use (times tables and clocks excepted). */
  maxNumber: MaxNumber;
  numberLineOps: "both" | "add" | "sub";
  /** The most hops a number-line question asks for. */
  maxHops: 3 | 5 | 10;
  bondsTo: 10 | 20;
  tables: number[];
  /** How hard the other games are. */
  difficulty: Difficulty;
  hiddenGames: ActivityId[];
  speech: boolean;
  sound: boolean;
}

export interface PlayData {
  stars: number;
  gameStars: Partial<Record<ActivityId, number>>;
  hero: SuitId;
  /** Games pinned to the big "My games" cards at the top of the menu, in pin order. */
  pinned: ActivityId[];
  settings: PlaySettings;
}

export const DEFAULT_PLAY_SETTINGS: PlaySettings = {
  maxNumber: 20,
  numberLineOps: "both",
  maxHops: 5,
  bondsTo: 20,
  tables: [2, 5, 10],
  difficulty: "easy",
  hiddenGames: [],
  speech: true,
  sound: true,
};

export const STORAGE_KEY = "math-play-v2";

export function freshPlayData(): PlayData {
  return { stars: 0, gameStars: {}, hero: "pond", pinned: ["numberline", "bonds", "times"], settings: { ...DEFAULT_PLAY_SETTINGS } };
}

export function loadPlayData(): PlayData {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<PlayData> | null;
    if (!saved) return freshPlayData();
    const fresh = freshPlayData();
    return { ...fresh, ...saved, gameStars: { ...saved.gameStars }, settings: { ...fresh.settings, ...saved.settings } };
  } catch {
    return freshPlayData();
  }
}

export function savePlayData(data: PlayData): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* private mode: play still works */ }
}
