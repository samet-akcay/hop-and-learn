import type { SuitId } from "../core/types";
import { ART, SUIT_THEME } from "./theme";

export type TokenTone = "primary" | "highlight" | "ghost";

export interface SuitTokenProps {
  suit: SuitId;
  cx: number;
  cy: number;
  r?: number;
  tone?: TokenTone;
  /** Optional data attribute for tests or interaction targeting. */
  dataToken?: string;
}

/**
 * Illustrated SVG counter styled for the child's chosen hero suit.
 * Reused across Number Bonds, Times Tables, Fractions and future counting games
 * so his chosen world carries consistently through every activity.
 */
export function SuitToken({ suit, cx, cy, r = 13, tone = "primary", dataToken }: SuitTokenProps) {
  if (tone === "ghost") {
    return <circle cx={cx} cy={cy} r={r * 0.86} fill="none" stroke="#b6cad3" stroke-width="2" stroke-dasharray="4 4" data-token={dataToken} />;
  }

  const theme = SUIT_THEME[suit];
  const fill = tone === "highlight" ? ART.gold : theme.accent;
  const stroke = tone === "highlight" ? ART.goldStroke : theme.accentStroke;
  const shine = tone === "highlight" ? "#fff6d1" : "#ffffff";

  if (suit === "space") {
    // Fuel cell capsule
    const w = r * 1.45;
    const h = r * 1.95;
    return <g transform={`translate(${cx} ${cy})`} data-token={dataToken}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r * 0.45} fill={fill} stroke={stroke} stroke-width="2.2" />
      <rect x={-w * 0.34} y={-h * 0.22} width={w * 0.68} height={h * 0.44} rx={r * 0.18} fill={shine} opacity="0.82" />
      <line x1={-w * 0.48} y1={-h * 0.28} x2={w * 0.48} y2={-h * 0.28} stroke={stroke} stroke-width="1.6" />
      <line x1={-w * 0.48} y1={h * 0.28} x2={w * 0.48} y2={h * 0.28} stroke={stroke} stroke-width="1.6" />
    </g>;
  }

  if (suit === "robot") {
    // Hex bolt
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
    }).join(" ");
    return <g transform={`translate(${cx} ${cy})`} data-token={dataToken}>
      <polygon points={pts} fill={fill} stroke={stroke} stroke-width="2.2" stroke-linejoin="round" />
      <circle cx="0" cy="0" r={r * 0.4} fill={shine} stroke={stroke} stroke-width="1.6" opacity="0.9" />
    </g>;
  }

  if (suit === "webhero") {
    // Web ball
    return <g transform={`translate(${cx} ${cy})`} data-token={dataToken}>
      <circle cx="0" cy="0" r={r} fill={fill} stroke={stroke} stroke-width="2.2" />
      <path d={`M ${-r * 0.72} 0 H ${r * 0.72} M 0 ${-r * 0.72} V ${r * 0.72} M ${-r * 0.5} ${-r * 0.5} L ${r * 0.5} ${r * 0.5} M ${r * 0.5} ${-r * 0.5} L ${-r * 0.5} ${r * 0.5}`}
        stroke={shine} stroke-width="1.4" stroke-linecap="round" opacity="0.72" />
      <circle cx="0" cy="0" r={r * 0.34} fill="none" stroke={shine} stroke-width="1.3" opacity="0.78" />
    </g>;
  }

  if (suit === "monster") {
    // Faceted friendly boulder
    const pts = `${-r * 0.9},${r * 0.2} ${-r * 0.55},${-r * 0.85} ${r * 0.45},${-r * 0.92} ${r * 0.95},${-r * 0.15} ${r * 0.65},${r * 0.85} ${-r * 0.55},${r * 0.88}`;
    return <g transform={`translate(${cx} ${cy})`} data-token={dataToken}>
      <polygon points={pts} fill={fill} stroke={stroke} stroke-width="2.2" stroke-linejoin="round" />
      <path d={`M ${-r * 0.45} ${-r * 0.5} L ${r * 0.25} ${-r * 0.58} L ${r * 0.08} ${-r * 0.12} Z`} fill={shine} opacity="0.45" />
    </g>;
  }

  if (suit === "speed") {
    // Shiny golden speed ring
    return <g transform={`translate(${cx} ${cy})`} data-token={dataToken}>
      <circle cx="0" cy="0" r={r} fill={tone === "highlight" ? ART.gold : "#f3c64f"} stroke={stroke} stroke-width="2.2" />
      <circle cx="0" cy="0" r={r * 0.48} fill={ART.surface} stroke={stroke} stroke-width="2" />
      <path d={`M ${-r * 0.68} ${-r * 0.32} A ${r * 0.76} ${r * 0.76} 0 0 1 ${r * 0.18} ${-r * 0.72}`}
        fill="none" stroke={shine} stroke-width="2.2" stroke-linecap="round" opacity="0.88" />
    </g>;
  }

  if (suit === "dino") {
    // Speckled dino egg
    return <g transform={`translate(${cx} ${cy})`} data-token={dataToken}>
      <path d={`M 0 ${-r * 1.05} C ${r * 0.75} ${-r * 1.05} ${r * 0.92} ${r * 0.1} ${r * 0.82} ${r * 0.62} C ${r * 0.72} ${r * 1.02} ${-r * 0.72} ${r * 1.02} ${-r * 0.82} ${r * 0.62} C ${-r * 0.92} ${r * 0.1} ${-r * 0.75} ${-r * 1.05} 0 ${-r * 1.05} Z`}
        fill={fill} stroke={stroke} stroke-width="2.2" />
      <circle cx={-r * 0.28} cy={-r * 0.15} r={r * 0.2} fill={shine} opacity="0.72" />
      <circle cx={r * 0.28} cy={r * 0.28} r={r * 0.17} fill={shine} opacity="0.72" />
    </g>;
  }

  // Pond pearl / water orb
  return <g transform={`translate(${cx} ${cy})`} data-token={dataToken}>
    <circle cx="0" cy="0" r={r} fill={fill} stroke={stroke} stroke-width="2.2" />
    <ellipse cx={-r * 0.3} cy={-r * 0.32} rx={r * 0.32} ry={r * 0.2} transform="rotate(-25)" fill={shine} opacity="0.78" />
  </g>;
}
