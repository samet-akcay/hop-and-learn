import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

/**
 * Visual Singapore / White Rose bar-model SVG for Maths Stories.
 * Turns word problems into a clear part-whole or equal-groups diagram.
 */
export function StoriesScene({ question, suit, solved = false }: SceneProps) {
  if (question.skillId === "st.mult-div") {
    const groups = Math.max(1, num(question, "groups", 3));
    const each = Math.max(1, num(question, "table", 2));
    const total = num(question, "total", groups * each);
    const barX = 36;
    const barW = 448;
    const boxW = barW / groups;
    return <SceneFrame chip="Story bar model" caption={`${groups} equal boxes · ${each} in each`} suit={suit} solved={solved} class="stories-scene">
      <svg class="kit-svg stories-svg" viewBox="0 0 520 156" role="img" aria-label={`Bar model with ${groups} equal groups of ${each}`}>
        {/* Top whole bracket */}
        <path d={`M ${barX} 42 V 28 H ${barX + barW} V 42`} fill="none" stroke={ART.stroke} stroke-width="2.6" stroke-linecap="round" />
        <rect x={260 - 44} y="10" width="88" height="30" rx="15" fill={ART.goldLight} stroke={ART.goldStroke} stroke-width="2.4" />
        <text x="260" y="30" text-anchor="middle" font-size="17" font-weight="900" fill={ART.goldStroke}>
          {solved ? total : question.answer === String(total) ? "?" : total}
        </text>

        {/* Equal boxes */}
        <rect x={barX} y="54" width={barW} height="64" rx="12" fill={ART.surface} stroke={ART.stroke} stroke-width="3" />
        {Array.from({ length: groups }, (_, i) => {
          const x = barX + i * boxW;
          return <g key={i} data-story-box={i}>
            <rect x={x + 2} y="56" width={boxW - 4} height="60" rx="9" fill={i % 2 === 0 ? ART.skyLight : ART.mintLight} />
            {i > 0 && <line x1={x} y1="54" x2={x} y2="118" stroke={ART.stroke} stroke-width="2.6" />}
            <text x={x + boxW / 2} y="93" text-anchor="middle" font-size="22" font-weight="900" fill={ART.ink}>{each}</text>
          </g>;
        })}
        <text x="260" y="142" text-anchor="middle" font-size="14" font-weight="800" fill={ART.muted}>
          {question.answer === String(groups) && !solved ? "? equal groups" : `${groups} equal groups`}
        </text>
      </svg>
    </SceneFrame>;
  }

  // Addition, subtraction, or two-step bar model
  const start = num(question, "start", 6);
  const change = num(question, "change", 3);
  const op = str(question, "op", "+");
  const total = num(question, "total", op === "+" ? start + change : start - change);
  const isAdd = op === "+";
  const isTwoStep = question.skillId === "st.two-step";
  const barX = 36;
  const barW = 448;

  const wholeVal = isAdd ? start + change : start;
  const leftVal = isAdd ? start : Math.max(0, start - change);
  const leftW = Math.max(88, Math.min(barW - 88, (leftVal / Math.max(1, wholeVal)) * barW));
  const rightW = barW - leftW;

  return <SceneFrame
    chip="Story bar model"
    caption={isTwoStep ? "Add first, then take away 2" : isAdd ? "Put the two parts together" : "Find the part that is left"}
    suit={suit}
    solved={solved}
    class="stories-scene"
  >
    <svg class="kit-svg stories-svg" viewBox="0 0 520 156" role="img" aria-label={`Bar model for ${start} ${op} ${change}`}>
      {/* Top whole bracket */}
      <path d={`M ${barX} 42 V 28 H ${barX + barW} V 42`} fill="none" stroke={ART.stroke} stroke-width="2.6" stroke-linecap="round" />
      <rect x={260 - 44} y="10" width="88" height="30" rx="15" fill={ART.goldLight} stroke={ART.goldStroke} stroke-width="2.4" />
      <text x="260" y="30" text-anchor="middle" font-size="17" font-weight="900" fill={ART.goldStroke}>
        {isAdd ? (solved ? wholeVal : "?") : wholeVal}
      </text>

      {/* Two parts bar */}
      <rect x={barX} y="54" width={leftW} height="64" rx="10" fill={ART.skyLight} stroke={ART.stroke} stroke-width="3" />
      <rect x={barX + leftW} y="54" width={rightW} height="64" rx="10" fill={isAdd ? ART.goldLight : "#fae8e3"} stroke={ART.stroke} stroke-width="3" />

      <text x={barX + leftW / 2} y="93" text-anchor="middle" font-size="24" font-weight="900" fill={ART.ink}>
        {isAdd ? start : (solved ? total : "?")}
      </text>
      <text x={barX + leftW + rightW / 2} y="93" text-anchor="middle" font-size="24" font-weight="900" fill={isAdd ? ART.goldStroke : "#8e3c2b"}>
        {isAdd ? `+${change}` : `−${change}`}
      </text>

      <text x="260" y="142" text-anchor="middle" font-size="14" font-weight="800" fill={ART.muted}>
        {isTwoStep
          ? (solved ? `${start} + ${change} − 2 = ${total}` : `Step 1: ${start} + ${change} · Step 2: take away 2`)
          : isAdd ? `Start: ${start} · Finds ${change} more` : `Start: ${start} · Gives away ${change}`}
      </text>
    </svg>
  </SceneFrame>;
}
