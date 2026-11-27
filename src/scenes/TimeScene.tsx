import { useState } from "preact/hooks";
import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import { pieSlicePath } from "./FractionScene";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);

/**
 * Crisp SVG analogue clock on SceneFrame:
 * - Shaded minute wedge connects o'clock / quarter past / half past / quarter to directly to fractions.
 * - Tapping the clock reveals the 5-minute outer ring (5, 10, 15... 55) as a calm helper.
 * - Distinct short slate hour hand and long gold minute hand.
 */
export function TimeScene({ question, suit, solved = false, onActivity }: SceneProps) {
  const [showMinutes, setShowMinutes] = useState(false);

  if (question.skillId === "tm.facts") {
    return <SceneFrame chip="Clock facts" caption="Think about seconds, minutes, hours and days" suit={suit} solved={solved} class="clock-scene">
      <svg class="kit-svg clock-svg" viewBox="0 0 260 220" role="img" aria-label="Analogue clock face">
        <circle cx="130" cy="110" r="88" fill={ART.surface} stroke={ART.stroke} stroke-width="5" />
        <circle cx="130" cy="110" r="78" fill={ART.skyLight} opacity="0.55" />
        {Array.from({ length: 12 }, (_, i) => {
          const angle = ((i * 30 - 90) * Math.PI) / 180;
          return <text key={i} x={130 + Math.cos(angle) * 62} y={110 + Math.sin(angle) * 62 + 6} text-anchor="middle" class="clock-number">
            {i === 0 ? 12 : i}
          </text>;
        })}
        <line x1="130" y1="110" x2="130" y2="58" stroke={ART.stroke} stroke-width="7" stroke-linecap="round" />
        <line x1="130" y1="110" x2="174" y2="110" stroke={ART.goldStroke} stroke-width="5" stroke-linecap="round" />
        <circle cx="130" cy="110" r="7" fill={ART.stroke} />
      </svg>
    </SceneFrame>;
  }

  const hour = num(question, "hour", 3);
  const minutes = num(question, "minutes", 0);
  const minuteAngle = minutes * 6;
  const hourAngle = (hour % 12) * 30 + minutes * 0.5;
  const cx = 140;
  const cy = 122;
  const r = 88;
  const revealRing = showMinutes || solved;

  // Shade the elapsed fraction of the hour (or remaining quarter for quarter-to)
  const sectorPath = minutes > 0 && minutes <= 30
    ? pieSlicePath(cx, cy, r - 4, 0, minuteAngle)
    : minutes === 45
      ? pieSlicePath(cx, cy, r - 4, 270, 360)
      : minutes > 30
        ? pieSlicePath(cx, cy, r - 4, 0, minuteAngle)
        : null;

  return <SceneFrame
    chip="Clock"
    caption="Short hand: hour · Long gold hand: minutes"
    suit={suit}
    solved={solved}
    class="clock-scene"
    note={solved
      ? <>The clock shows <b>{hour}:{String(minutes).padStart(2, "0")}</b></>
      : revealRing
        ? "Each big number is 5 minutes — tap the clock to hide"
        : "Tap the clock to show the 5-minute numbers"}
  >
    <svg class="kit-svg clock-svg kit-interactive" viewBox="0 0 280 244" role="img"
      aria-label={`Clock showing ${hour}:${String(minutes).padStart(2, "0")}`}
      onClick={() => { onActivity?.(); setShowMinutes(v => !v); }}>
      {/* Outer 5-minute helper ring */}
      {revealRing && Array.from({ length: 12 }, (_, i) => {
        const angle = ((i * 30 - 90) * Math.PI) / 180;
        const mx = cx + Math.cos(angle) * (r + 18);
        const my = cy + Math.sin(angle) * (r + 18);
        return <text key={`m-${i}`} x={mx} y={my + 4} text-anchor="middle" class="clock-min-hint">
          :{String(i * 5).padStart(2, "0")}
        </text>;
      })}

      {/* Clock rim & face */}
      <circle cx={cx} cy={cy} r={r} fill={ART.surface} stroke={ART.stroke} stroke-width="5" />

      {/* Quarter/half shaded sector */}
      {sectorPath && <path d={sectorPath} fill={minutes === 45 ? ART.skyLight : ART.goldLight} opacity="0.85" data-clock-sector="true" />}

      {/* 60 minute ticks */}
      {Array.from({ length: 60 }, (_, i) => {
        const angle = ((i * 6 - 90) * Math.PI) / 180;
        const major = i % 5 === 0;
        const r1 = r - (major ? 12 : 7);
        const r2 = r - 3;
        return <line key={`t-${i}`}
          x1={cx + Math.cos(angle) * r1} y1={cy + Math.sin(angle) * r1}
          x2={cx + Math.cos(angle) * r2} y2={cy + Math.sin(angle) * r2}
          stroke={major ? ART.stroke : "#a8bec9"} stroke-width={major ? "3" : "1.5"} stroke-linecap="round" />;
      })}

      {/* Hour numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = ((i * 30 - 90) * Math.PI) / 180;
        const tx = cx + Math.cos(angle) * 63;
        const ty = cy + Math.sin(angle) * 63;
        return <text key={i} x={tx} y={ty + 6} text-anchor="middle" class="clock-number">{i === 0 ? 12 : i}</text>;
      })}

      {/* Hour hand (short, bold slate) */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - 46} stroke={ART.stroke} stroke-width="8.5" stroke-linecap="round"
        transform={`rotate(${hourAngle} ${cx} ${cy})`} />

      {/* Minute hand (long, warm gold) */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - 70} stroke={ART.gold} stroke-width="6" stroke-linecap="round"
        transform={`rotate(${minuteAngle} ${cx} ${cy})`} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - 70} stroke={ART.goldStroke} stroke-width="2" stroke-linecap="round"
        transform={`rotate(${minuteAngle} ${cx} ${cy})`} />

      {/* Center cap */}
      <circle cx={cx} cy={cy} r="7.5" fill={ART.stroke} />
      <circle cx={cx} cy={cy} r="3" fill={ART.gold} />
    </svg>
  </SceneFrame>;
}
