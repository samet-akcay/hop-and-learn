import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

/**
 * Illustrated SVG Signal Console for binary (8-4-2-1 lamps).
 * Bright glowing gold lamps for ON bits and calm dim lamps for OFF bits.
 */
export function BinaryScene({ question, suit, solved = false }: SceneProps) {
  const bits = (question.data.bits as number[] | undefined) ?? [];
  const lights = (question.data.lights as number[] | undefined) ?? [8, 4, 2, 1];
  const value = Number(question.data.value ?? bits.reduce((sum, b) => sum + b, 0));

  const lampW = 92;
  const gap = 18;
  const pad = 28;
  const svgW = lights.length * lampW + (lights.length - 1) * gap + pad * 2;

  return <SceneFrame
    chip="Signal lights"
    caption="Add the values of the glowing lamps"
    suit={suit}
    solved={solved}
    class="binary-scene"
    note={solved ? <>{bits.join(" + ")} = <b>{value}</b></> : "Only count the lamps that are switched ON."}
  >
    <svg class="kit-svg binary-svg" viewBox={`0 0 ${svgW} 166`} role="img" aria-label={`Signal lights showing ${bits.join(", ")}`}>
      {/* Console plate */}
      <rect x="12" y="10" width={svgW - 24} height="146" rx="20" fill={ART.surfaceSoft} stroke={ART.stroke} stroke-width="3" />
      {lights.map((lampVal, i) => {
        const x = pad + i * (lampW + gap);
        const cx = x + lampW / 2;
        const on = bits.includes(lampVal);
        return <g key={lampVal} data-lamp={lampVal} data-on={on ? "true" : "false"}>
          <rect x={x} y="24" width={lampW} height="118" rx="14"
            fill={on ? ART.goldLight : ART.surface}
            stroke={on ? ART.goldStroke : "#bdd0d9"} stroke-width={on ? "3" : "2.2"} />

          {/* Light rays when ON */}
          {on && [0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
            const rad = (deg * Math.PI) / 180;
            return <line key={deg}
              x1={cx + Math.cos(rad) * 26} y1={66 + Math.sin(rad) * 26}
              x2={cx + Math.cos(rad) * 33} y2={66 + Math.sin(rad) * 33}
              stroke={ART.goldStroke} stroke-width="2.5" stroke-linecap="round" />;
          })}

          {/* Bulb */}
          <circle cx={cx} cy="66" r="21" fill={on ? ART.gold : "#e7eff2"} stroke={on ? ART.goldStroke : "#90aab6"} stroke-width="3" />
          <circle cx={cx - 6} cy="59" r="5" fill="#ffffff" opacity={on ? "0.75" : "0.45"} />

          {/* Value & ON/OFF label */}
          <text x={cx} y="114" text-anchor="middle" font-size="22" font-weight="900" fill={on ? ART.ink : ART.muted}>{lampVal}</text>
          <text x={cx} y="132" text-anchor="middle" font-size="11" font-weight="850" fill={on ? ART.goldStroke : "#8aa2ad"}>
            {on ? "ON" : "OFF"}
          </text>
        </g>;
      })}
    </svg>
  </SceneFrame>;
}
