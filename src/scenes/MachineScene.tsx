import { useState } from "preact/hooks";
import { SceneFrame } from "../kit/SceneFrame";
import { ART, SUIT_THEME } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

/**
 * Illustrated SVG Number Machine (input hopper -> gear box rule -> output chute).
 * Covers mc.run, mc.rule, and mc.inverse.
 */
export function MachineScene({ question, suit, solved = false, onActivity }: SceneProps) {
  const n = num(question, "n", 4);
  const change = num(question, "change", 2);
  const op = str(question, "op", "+");
  const result = num(question, "result", op === "+" ? n + change : n - change);
  const [pulsed, setPulsed] = useState(false);

  const isRule = question.skillId === "mc.rule";
  const isInverse = question.skillId === "mc.inverse";
  const theme = SUIT_THEME[suit];

  if (isRule) {
    const pairs = [0, 1, 2].map(step => ({
      inVal: n + change * step,
      outVal: n + change * (step + 1),
    }));
    return <SceneFrame chip="Find the rule" caption="See how each input changes into the output" suit={suit} solved={solved} class="machine-scene">
      <svg class="kit-svg machine-svg" viewBox="0 0 500 176" role="img" aria-label="Number machine rule table">
        <text x="108" y="24" text-anchor="middle" font-size="13" font-weight="850" fill={ART.muted}>IN</text>
        <text x="250" y="24" text-anchor="middle" font-size="13" font-weight="850" fill={ART.goldStroke}>RULE</text>
        <text x="392" y="24" text-anchor="middle" font-size="13" font-weight="850" fill={ART.muted}>OUT</text>
        {pairs.map((row, i) => {
          const y = 38 + i * 44;
          return <g key={i} data-machine-row={i}>
            <rect x="64" y={y} width="88" height="34" rx="10" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="2.4" />
            <text x="108" y={y + 23} text-anchor="middle" font-size="18" font-weight="900" fill={ART.ink}>{row.inVal}</text>
            <line x1="154" y1={y + 17} x2="196" y2={y + 17} stroke={ART.stroke} stroke-width="2.8" />
            <rect x="198" y={y} width="104" height="34" rx="10" fill={ART.goldLight} stroke={ART.goldStroke} stroke-width="2.4" />
            <text x="250" y={y + 23} text-anchor="middle" font-size="16" font-weight="900" fill={ART.goldStroke}>
              {solved ? `+ ${change}` : "?"}
            </text>
            <line x1="304" y1={y + 17} x2="346" y2={y + 17} stroke={ART.stroke} stroke-width="2.8" />
            <rect x="348" y={y} width="88" height="34" rx="10" fill={ART.mintLight} stroke={ART.mintStroke} stroke-width="2.4" />
            <text x="392" y={y + 23} text-anchor="middle" font-size="18" font-weight="900" fill={ART.ink}>{row.outVal}</text>
          </g>;
        })}
      </svg>
    </SceneFrame>;
  }

  return <SceneFrame
    chip="Number machine"
    caption={isInverse ? "Work backwards to find what went in" : "Follow the rule through the machine"}
    suit={suit}
    solved={solved}
    class="machine-scene"
    action={{
      label: "RUN",
      icon: "⚙",
      done: false,
      onTrigger: () => { onActivity?.(); setPulsed(v => !v); },
      status: isInverse ? `Rule is ${op} ${change} · output is ${result}.` : `${n} goes in · rule is ${op} ${change}.`,
    }}
  >
    <svg class="kit-svg machine-svg" viewBox="0 0 540 156" role="img" aria-label={`Number machine with rule ${op} ${change}`}>
      {/* Pipes */}
      <line x1="126" y1="78" x2="188" y2="78" stroke={ART.stroke} stroke-width="8" stroke-linecap="round" />
      <line x1="352" y1="78" x2="414" y2="78" stroke={ART.stroke} stroke-width="8" stroke-linecap="round" />
      <polygon points="178,68 192,78 178,88" fill={ART.gold} stroke={ART.goldStroke} stroke-width="1.8" />
      <polygon points="402,68 416,78 402,88" fill={ART.gold} stroke={ART.goldStroke} stroke-width="1.8" />

      {/* Input box */}
      <rect x="24" y="40" width="104" height="76" rx="16" fill={isInverse ? ART.goldLight : ART.skyLight}
        stroke={isInverse ? ART.goldStroke : ART.skyStroke} stroke-width="3" />
      <text x="76" y="30" text-anchor="middle" font-size="12" font-weight="850" fill={ART.muted}>IN</text>
      <text x="76" y="88" text-anchor="middle" font-size="30" font-weight="900" fill={ART.ink}>
        {isInverse && !solved ? "?" : n}
      </text>

      {/* Machine core */}
      <rect x="190" y="24" width="162" height="108" rx="22" fill={theme.accentSoft} stroke={theme.accentStroke} stroke-width="3.4" />
      <g class="machine-gear" transform={`rotate(${pulsed || solved ? 45 : 0} 214 48)`}>
        <circle cx="214" cy="48" r="10" fill={ART.surface} stroke={theme.accentStroke} stroke-width="2.5" stroke-dasharray="4 3" />
      </g>
      <g class="machine-gear" transform={`rotate(${pulsed || solved ? -45 : 0} 328 108)`}>
        <circle cx="328" cy="108" r="10" fill={ART.surface} stroke={theme.accentStroke} stroke-width="2.5" stroke-dasharray="4 3" />
      </g>
      <text x="271" y="90" text-anchor="middle" font-size="34" font-weight="900" fill={theme.accentStroke}>{op} {change}</text>

      {/* Output box */}
      <rect x="412" y="40" width="104" height="76" rx="16" fill={!isInverse ? ART.goldLight : ART.mintLight}
        stroke={!isInverse ? ART.goldStroke : ART.mintStroke} stroke-width="3" />
      <text x="464" y="30" text-anchor="middle" font-size="12" font-weight="850" fill={ART.muted}>OUT</text>
      <text x="464" y="88" text-anchor="middle" font-size="30" font-weight="900" fill={ART.ink}>
        {!isInverse && !solved ? "?" : result}
      </text>
    </svg>
  </SceneFrame>;
}
