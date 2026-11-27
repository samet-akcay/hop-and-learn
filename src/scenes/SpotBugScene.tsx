import { useState } from "preact/hooks";
import { HERO_NAMES, HeroCharacter } from "../activities/HeroCharacter";
import { SceneFrame } from "../kit/SceneFrame";
import { SuitToken } from "../kit/SuitToken";
import { ART, SUIT_THEME } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

/**
 * Hero speech-bubble scene for Spot the Bug.
 * The child's chosen hero shares a sum and he can press CHECK to inspect
 * a visual SuitToken proof before deciding "Right" or "Bug".
 */
export function SpotBugScene({ question, suit, solved = false, onActivity }: SceneProps) {
  const a = num(question, "a", 5);
  const b = num(question, "b", 3);
  const sign = str(question, "sign", "+");
  const shown = num(question, "shown", a + b);
  const correct = num(question, "correct", sign === "×" ? a * b : a + b);
  const isBug = Boolean(question.data.isBug);
  const [checked, setChecked] = useState(false);

  const theme = SUIT_THEME[suit];
  const showProof = checked || solved;

  return <SceneFrame
    chip="Spot the bug"
    caption={`Check ${HERO_NAMES[suit]}'s sum`}
    suit={suit}
    solved={solved}
    showHero={false}
    class="spotbug-scene"
    action={!checked ? {
      label: "CHECK IT",
      icon: "🔍",
      done: false,
      onTrigger: () => { onActivity?.(); setChecked(true); },
      status: "Press CHECK IT to count the picture and check the answer.",
    } : undefined}
    note={solved ? (isBug ? `Good catch! ${a} ${sign} ${b} is ${correct}, not ${shown}.` : `Yes! ${a} ${sign} ${b} really is ${correct}.`) : undefined}
  >
    <svg class="kit-svg spotbug-svg" viewBox="0 0 560 156" role="img"
      aria-label={`${HERO_NAMES[suit]} says ${a} ${sign} ${b} equals ${shown}`}>
      {/* Hero on the left */}
      <g transform="translate(26 30) scale(1.55)">
        <HeroCharacter suit={suit} />
      </g>

      {/* Speech bubble */}
      <path d="M 142 30 H 526 Q 540 30 540 44 V 114 Q 540 128 526 128 H 142 Q 128 128 128 114 V 92 L 106 80 L 128 68 V 44 Q 128 30 142 30 Z"
        fill={ART.surface} stroke={solved ? (isBug ? ART.goldStroke : ART.mintStroke) : ART.stroke} stroke-width="3.2" stroke-linejoin="round" />
      <text x="334" y="92" text-anchor="middle" font-size="40" font-weight="900" fill={ART.ink}>
        {a} {sign} {b} = {shown}
      </text>
      {solved && <text x="518" y="54" text-anchor="end" font-size="14" font-weight="900" fill={isBug ? ART.goldStroke : ART.mintStroke}>
        {isBug ? `→ ${correct}` : "✓ Right!"}
      </text>}
    </svg>

    {/* Optional visual proof tray */}
    {showProof && sign === "+" && a + b <= 24 && (
      <svg class="kit-svg spotbug-proof-svg" viewBox="0 0 560 76" role="img" aria-label={`Visual check: ${a} plus ${b}`} data-proof="true">
        <rect x="20" y="8" width="520" height="60" rx="14" fill={theme.accentSoft} stroke={theme.accentStroke} stroke-width="2.2" />
        {Array.from({ length: a + b }, (_, i) => {
          const total = a + b;
          const cols = Math.min(12, total);
          const spacing = Math.min(36, 480 / cols);
          const row = Math.floor(i / cols);
          const col = i % cols;
          const rowCount = Math.min(cols, total - row * cols);
          const startX = 280 - ((rowCount - 1) * spacing) / 2;
          const cy = total > cols ? (row === 0 ? 25 : 51) : 38;
          return <SuitToken key={i} suit={suit} cx={startX + col * spacing} cy={cy} r={total > 12 ? 9.5 : 11.5} tone={i < a ? "primary" : "highlight"} />;
        })}
      </svg>
    )}
    {showProof && sign === "×" && (
      <div class="kit-scene-note" data-proof="true">
        Count in {b}s ({a} times): <b>{Array.from({ length: a }, (_, i) => (i + 1) * b).join(", ")}</b>
      </div>
    )}
  </SceneFrame>;
}
