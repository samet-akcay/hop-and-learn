import { useEffect, useRef, useState } from "preact/hooks";
import { hopPose, type HopPose } from "../activities/hop";
import { HERO_NAMES, HeroCharacter } from "../activities/HeroCharacter";
import { SceneFrame } from "../kit/SceneFrame";
import { ART, SUIT_THEME } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

/**
 * Interactive SVG number line with suit-themed stepping stops (lily pads,
 * moon rocks, conveyor tiles, rooftops, race checkpoints, boulders, stones)
 * and squash-and-stretch hero hops.
 */
export function NumberLineScene({
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
  const start = num(question, "start");
  const min = num(question, "min", 0);
  const max = num(question, "max", 20);
  const op = str(question, "op", "+");
  const jumpSize = num(question, "jumpSize", 1);
  const limit = Math.max(1, num(question, "amount", 1));
  const requiresWork = level <= 2;

  const [steps, setSteps] = useState(initialSteps);
  const stepsRef = useRef(initialSteps);
  const complete = initialComplete || steps >= limit;

  useEffect(() => {
    if (requiresWork && initialSteps >= limit) onWorkComplete?.();
  }, [initialSteps, limit, onWorkComplete, requiresWork]);

  const doHop = () => {
    if (stepsRef.current >= limit || solved) return;
    onActivity?.();
    const next = Math.min(limit, stepsRef.current + 1);
    stepsRef.current = next;
    setSteps(next);
    onStep?.(next);
    if (next >= limit) onWorkComplete?.();
  };

  // Finish hops smoothly when answered early so he sees where the hero lands.
  useEffect(() => {
    if (!solved || steps >= limit) return;
    const remaining = limit - steps;
    const timer = window.setTimeout(() => {
      const next = remaining > 6 || reducedMotion ? limit : Math.min(limit, stepsRef.current + 1);
      stepsRef.current = next;
      setSteps(next);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [solved, steps, limit, reducedMotion]);

  // Arrow keys hop in the direction of the sign.
  useEffect(() => {
    if (solved) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("button, input, select, textarea")) return;
      const expected = op === "+" ? "ArrowRight" : "ArrowLeft";
      if (event.key === expected) { event.preventDefault(); doHop(); }
      else if (event.key === "ArrowLeft" || event.key === "ArrowRight") event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [solved, op, limit, question.key]);

  const pos = start + (op === "+" ? steps : -steps) * jumpSize;
  const span = Math.max(1, max - min);
  const tickCount = span <= 20 ? span : 10;
  const width = 820;
  const lineY = 114;
  const margin = 34;
  const x = (n: number) => margin + ((n - min) / span) * (width - margin * 2);
  const targetX = x(pos);

  const [pose, setPose] = useState<HopPose>(() => hopPose(targetX, targetX, 1));
  const poseRef = useRef(pose);
  const previousSteps = useRef(steps);

  useEffect(() => {
    const fromX = poseRef.current.x;
    const previous = previousSteps.current;
    previousSteps.current = steps;
    const reduced = reducedMotion || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || previous === steps) {
      const landed = hopPose(targetX, targetX, 1);
      poseRef.current = landed;
      setPose(landed);
      return;
    }
    const startedAt = performance.now();
    const duration = 620;
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const next = hopPose(fromX, targetX, progress);
      poseRef.current = next;
      setPose(next);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [steps, targetX, reducedMotion]);

  const isHopping = Math.abs(pose.x - targetX) > 0.5 || Math.abs(pose.y) > 0.5;
  const arcMid = (pose.x + targetX) / 2;
  const theme = SUIT_THEME[suit];

  const statusText = complete
    ? `We landed on ${pos}!`
    : steps
      ? `Hop ${steps} of ${limit}`
      : `Need help? Press HOP ${limit} ${limit === 1 ? "time" : "times"}.`;

  const renderStop = (n: number, cx: number) => {
    const isStart = n === start;
    const isStation = n % 10 === 0;
    const fill = isStart ? ART.gold : isStation ? theme.stationFill : ART.surface;
    const stroke = isStart ? ART.goldStroke : isStation ? theme.stationStroke : ART.stroke;

    if (theme.trackStyle === "pond") {
      // Lily pad with tiny notch
      const r = isStart ? 11 : isStation ? 10 : 7.5;
      return <g>
        <circle class={isStation ? "station-stop" : "line-stop"} cx={cx} cy={lineY} r={r} fill={isStart ? ART.gold : isStation ? "#73bf9d" : "#bce2cf"} stroke={stroke} stroke-width="2.5" />
        <polygon points={`${cx},${lineY} ${cx + r},${lineY - 3} ${cx + r},${lineY + 3}`} fill={ART.surfaceSoft} />
      </g>;
    }
    if (theme.trackStyle === "conveyor" || theme.trackStyle === "rooftops" || theme.trackStyle === "city") {
      const size = isStart ? 18 : isStation ? 16 : 12;
      return <rect class={isStation ? "station-stop" : "line-stop"} x={cx - size / 2} y={lineY - size / 2} width={size} height={size} rx={theme.trackStyle === "conveyor" ? 3 : 2}
        fill={fill} stroke={stroke} stroke-width={isStation ? 3 : 2.5} />;
    }
    return <circle class={isStation ? "station-stop" : "line-stop"} cx={cx} cy={lineY} r={isStart ? 9.5 : isStation ? 8.5 : 6.5}
      fill={fill} stroke={stroke} stroke-width={isStation ? 3.5 : 2.8} />;
  };

  return <SceneFrame
    chip="Number line"
    caption={op === "+" ? "Hop right to add" : "Hop left to take away"}
    suit={suit}
    solved={solved}
    showHero={false}
    class="numberline-scene"
    action={{
      label: "HOP",
      icon: op === "+" ? "→" : "←",
      done: complete,
      onTrigger: doHop,
      status: statusText,
    }}
  >
    <svg viewBox={`0 0 ${width} 190`} role="img" aria-label={`Number line from ${min} to ${max}`} class="numberline-svg">
      {/* Track */}
      <line x1={margin} y1={lineY} x2={width - margin} y2={lineY} stroke={ART.track} stroke-width="10" stroke-linecap="round" />
      {theme.trackStyle === "race" && (
        <line x1={margin} y1={lineY} x2={width - margin} y2={lineY} stroke="#ffffff" stroke-width="2.5" stroke-dasharray="10 10" stroke-linecap="round" />
      )}

      {/* Stops & labels */}
      {Array.from({ length: tickCount + 1 }, (_, index) => {
        const n = min + (span <= 20 ? index : index * 10);
        const cx = x(n);
        return <g key={n}>
          {renderStop(n, cx)}
          {(span <= 20 || n % 20 === 0) && <text x={cx} y="158" text-anchor="middle" class="svg-label">{n}</text>}
        </g>;
      })}

      {/* Completed hop trails */}
      {Array.from({ length: isHopping ? Math.max(0, steps - 1) : steps }, (_, i) => {
        const from = x(start + (op === "+" ? i : -i) * jumpSize);
        const to = x(start + (op === "+" ? i + 1 : -(i + 1)) * jumpSize);
        return <path key={i} class="hop-trail" d={`M ${from} ${lineY - 9} Q ${(from + to) / 2} ${lineY - 54} ${to} ${lineY - 9}`} />;
      })}

      {steps > 0 && !isHopping && <circle class="landing-ring" cx={targetX} cy={lineY} r="16" />}
      {isHopping && <path class={`hop-arc ${op === "+" ? "hop-arc-plus" : "hop-arc-minus"}`} d={`M ${pose.x} ${lineY - 9} Q ${arcMid} ${lineY - 72} ${targetX} ${lineY - 9}`} />}

      {/* Animated hero */}
      <g class="hop-traveler" transform={`translate(${pose.x - 25} ${50 + pose.y}) scale(${pose.scaleX} ${pose.scaleY})`} aria-label={`${HERO_NAMES[suit]} jumping`}>
        <g transform="translate(-7.5 -9) scale(1.3)"><HeroCharacter suit={suit} /></g>
      </g>
    </svg>
  </SceneFrame>;
}
