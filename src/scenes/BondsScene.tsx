import { useEffect, useRef, useState } from "preact/hooks";
import { SceneFrame } from "../kit/SceneFrame";
import { SuitToken } from "../kit/SuitToken";
import { ART, SUIT_THEME } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);

/**
 * Interactive SVG ten-frame(s) and visual part-whole bar for Number Bonds.
 * Starting counters and counted counters use the child's chosen SuitToken
 * (fuel cells, bolts, web balls, boulders, gold rings, dino eggs, pond pearls).
 */
export function BondsScene({
  question,
  suit,
  level,
  solved = false,
  reducedMotion = false,
  initialSteps = 0,
  initialComplete = false,
  onActivity,
  onStep,
  onWorkComplete,
}: SceneProps) {
  const total = Math.max(2, num(question, "total", 10));
  const part = Math.max(0, Math.min(total, num(question, "part", 0)));
  const limit = Math.max(1, num(question, "missing", total - part));
  const requiresWork = level <= 2;

  const [steps, setSteps] = useState(initialSteps);
  const stepsRef = useRef(initialSteps);
  const complete = initialComplete || steps >= limit;

  useEffect(() => {
    if (requiresWork && initialSteps >= limit) onWorkComplete?.();
  }, [initialSteps, limit, onWorkComplete, requiresWork]);

  const addOne = () => {
    if (stepsRef.current >= limit || solved) return;
    onActivity?.();
    const next = Math.min(limit, stepsRef.current + 1);
    stepsRef.current = next;
    setSteps(next);
    onStep?.(next);
    if (next >= limit) onWorkComplete?.();
  };

  useEffect(() => {
    if (!solved || steps >= limit) return;
    const remaining = limit - steps;
    const timer = window.setTimeout(() => {
      const next = remaining > 6 || reducedMotion ? limit : Math.min(limit, stepsRef.current + 1);
      stepsRef.current = next;
      setSteps(next);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [solved, steps, limit, reducedMotion]);

  useEffect(() => {
    if (solved) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("button, input, select, textarea")) return;
      if (event.key === " ") { event.preventDefault(); addOne(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [solved, limit, question.key]);

  const theme = SUIT_THEME[suit];
  const frames = total > 10 ? 2 : 1;
  const cols = 5;
  const cellW = 54;
  const cellH = 54;
  const frameW = cols * cellW;
  const frameH = 2 * cellH;
  const frameGap = 24;
  const totalFramesW = frames * frameW + (frames - 1) * frameGap;
  const svgW = Math.max(580, totalFramesW + 48);
  const startX = (svgW - totalFramesW) / 2;
  const frameY = 14;
  const barY = frameY + frameH + 26;
  const barH = 38;
  const barW = Math.min(480, totalFramesW);
  const barX = (svgW - barW) / 2;
  const svgH = barY + barH + 14;

  const filledPartW = (part / total) * barW;
  const countedPartW = (Math.min(limit, steps) / total) * barW;

  const statusText = complete
    ? `We counted ${steps} more.`
    : steps
      ? `${steps} more so far`
      : `Need help? Press COUNT or tap an empty space.`;

  return <SceneFrame
    chip={`Whole: ${total}`}
    caption={`Fill the empty spaces with ${theme.tokenPlural}`}
    suit={suit}
    solved={solved}
    class="bonds-scene"
    action={{
      label: "COUNT",
      icon: "+",
      done: complete,
      onTrigger: addOne,
      status: statusText,
    }}
  >
    <svg class="kit-svg bonds-svg" viewBox={`0 0 ${svgW} ${svgH}`} role="img"
      aria-label={`Ten frame showing ${part} filled and ${steps} counted out of ${total}`}>
      {Array.from({ length: frames }, (_, frameIndex) => {
        const fx = startX + frameIndex * (frameW + frameGap);
        const frameSlots = Math.min(10, total - frameIndex * 10);
        return <g key={frameIndex}>
          <rect x={fx} y={frameY} width={frameW} height={frameH} rx="12" fill={ART.surface} stroke={ART.stroke} stroke-width="3" />
          {/* Internal grid lines */}
          <line x1={fx} y1={frameY + cellH} x2={fx + frameW} y2={frameY + cellH} stroke="#c8dae2" stroke-width="2" />
          {Array.from({ length: cols - 1 }, (_, c) => (
            <line key={c} x1={fx + (c + 1) * cellW} y1={frameY} x2={fx + (c + 1) * cellW} y2={frameY + frameH} stroke="#c8dae2" stroke-width="2" />
          ))}
          {Array.from({ length: frameSlots }, (_, slot) => {
            const globalIndex = frameIndex * 10 + slot;
            const col = slot % cols;
            const row = Math.floor(slot / cols);
            const cx = fx + col * cellW + cellW / 2;
            const cy = frameY + row * cellH + cellH / 2;
            const isStart = globalIndex < part;
            const isAdded = !isStart && globalIndex < part + steps;
            const isEmpty = !isStart && !isAdded;
            return <g key={slot} class={isEmpty && !solved ? "kit-interactive" : ""} data-slot={isStart ? "start" : isAdded ? "added" : "empty"}
              onClick={isEmpty ? addOne : undefined}>
              <rect x={fx + col * cellW + 3} y={frameY + row * cellH + 3} width={cellW - 6} height={cellH - 6} rx="8"
                fill={isStart ? theme.accentSoft : isAdded ? ART.goldLight : "transparent"} />
              <SuitToken suit={suit} cx={cx} cy={cy} r={16} tone={isStart ? "primary" : isAdded ? "highlight" : "ghost"} />
            </g>;
          })}
        </g>;
      })}

      {/* Visual part-whole bar directly below */}
      <g>
        <rect x={barX} y={barY} width={barW} height={barH} rx="10" fill={ART.surface} stroke={ART.stroke} stroke-width="2.5" />
        {filledPartW > 0 && <rect x={barX + 1.5} y={barY + 1.5} width={Math.max(0, filledPartW - 1.5)} height={barH - 3} rx="8" fill={theme.accentSoft} />}
        {countedPartW > 0 && <rect x={barX + filledPartW} y={barY + 1.5} width={Math.max(0, countedPartW - 1.5)} height={barH - 3} rx="8" fill={ART.goldLight} />}
        <line x1={barX + filledPartW} y1={barY} x2={barX + filledPartW} y2={barY + barH} stroke={ART.stroke} stroke-width="2.5" />
        <text x={barX + filledPartW / 2} y={barY + 24} text-anchor="middle" class="kit-bar-label" fill={theme.accentStroke}>{part}</text>
        <text x={barX + filledPartW + (barW - filledPartW) / 2} y={barY + 24} text-anchor="middle" class="kit-bar-label" fill={ART.goldStroke}>
          {solved ? limit : steps > 0 ? `+ ${steps}` : "?"}
        </text>
      </g>
    </svg>
  </SceneFrame>;
}
