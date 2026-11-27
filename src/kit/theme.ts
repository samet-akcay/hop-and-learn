import type { SuitId } from "../core/types";

/**
 * Shared visual tokens for every SVG scene and menu icon.
 * One calm, bright, high-contrast illustration style across the whole game:
 * - Warm gold always means "active / shaded / highlighted / newly counted".
 * - Sky teal always means "base / starting / secondary part".
 * - Soft mint means "complete / aligned / confirmed".
 */
export const ART = {
  ink: "#1d3946",
  stroke: "#2c4a58",
  muted: "#536f7c",
  surface: "#ffffff",
  surfaceSoft: "#f3f8fb",
  neutral: "#eaf4f9",
  neutralActive: "#f6d887",
  track: "#c7d9e2",
  gold: "#f0be4f",
  goldLight: "#fff7df",
  goldStroke: "#9b6d0d",
  sky: "#6bb5d6",
  skyLight: "#e8f5fb",
  skyStroke: "#2c6f8e",
  mint: "#57b377",
  mintLight: "#ebf8ef",
  mintStroke: "#2f7448",
} as const;

export type TrackStyle = "moon" | "conveyor" | "rooftops" | "city" | "race" | "stones" | "pond";

export interface SuitVisual {
  id: SuitId;
  accent: string;
  accentSoft: string;
  accentStroke: string;
  stationFill: string;
  stationStroke: string;
  tokenName: string;
  tokenPlural: string;
  trackStyle: TrackStyle;
}

export const SUIT_THEME: Record<SuitId, SuitVisual> = {
  space: {
    id: "space",
    accent: "#4fa3cf",
    accentSoft: "#e4f4fc",
    accentStroke: "#265e7d",
    stationFill: "#f0be4f",
    stationStroke: "#9b6d0d",
    tokenName: "fuel cell",
    tokenPlural: "fuel cells",
    trackStyle: "moon",
  },
  robot: {
    id: "robot",
    accent: "#5e92ad",
    accentSoft: "#e7f1f5",
    accentStroke: "#2d566b",
    stationFill: "#8cc0d9",
    stationStroke: "#2d566b",
    tokenName: "bolt",
    tokenPlural: "bolts",
    trackStyle: "conveyor",
  },
  webhero: {
    id: "webhero",
    accent: "#d6454d",
    accentSoft: "#fcecef",
    accentStroke: "#7a1f28",
    stationFill: "#3e73c4",
    stationStroke: "#1f427d",
    tokenName: "web ball",
    tokenPlural: "web balls",
    trackStyle: "rooftops",
  },
  monster: {
    id: "monster",
    accent: "#72a655",
    accentSoft: "#edf6e6",
    accentStroke: "#3c612a",
    stationFill: "#e5b44c",
    stationStroke: "#8a6012",
    tokenName: "boulder",
    tokenPlural: "boulders",
    trackStyle: "city",
  },
  speed: {
    id: "speed",
    accent: "#e38c3b",
    accentSoft: "#fff3e4",
    accentStroke: "#8c4a12",
    stationFill: "#f0be4f",
    stationStroke: "#9b6d0d",
    tokenName: "gold ring",
    tokenPlural: "gold rings",
    trackStyle: "race",
  },
  dino: {
    id: "dino",
    accent: "#7ba352",
    accentSoft: "#f1f6e6",
    accentStroke: "#446128",
    stationFill: "#e09d55",
    stationStroke: "#824e19",
    tokenName: "dino egg",
    tokenPlural: "dino eggs",
    trackStyle: "stones",
  },
  pond: {
    id: "pond",
    accent: "#4da892",
    accentSoft: "#e5f6f1",
    accentStroke: "#256657",
    stationFill: "#75c4a8",
    stationStroke: "#256657",
    tokenName: "pond pearl",
    tokenPlural: "pond pearls",
    trackStyle: "pond",
  },
};
