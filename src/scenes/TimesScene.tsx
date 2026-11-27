import { useEffect, useRef, useState } from "preact/hooks";
import { SceneFrame } from "../kit/SceneFrame";
import { SuitToken } from "../kit/SuitToken";
import { ART, SUIT_THEME } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);

/**
 * Interactive SVG equal-group pods for Times Tables and Sharing/Doubles.
 * Each pod fills with the child's chosen SuitTokens one group at a time.
 */
export function TimesScene({
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
  const groups = Math.max(1, num(question, "groups", 2));
  const table = Math.max(1, num(question, "table", 2));
  const requiresWork = level <= 2;

  const [steps, setSteps] = useState(initialSteps);
  const stepsRef = useRef(initialSteps);
  const complete = initialComplete || steps >= groups;

  useEffect(() => {
    if (requiresWork && initialSteps >= groups) onWorkComplete?.();
  }, [initialSteps, groups, onWorkComplete, requiresWork]);

  const addGroup = () => {
    if (stepsRef.current >= groups || solved) return;
    onActivity?.();
    const next = Math.min(groups, stepsRef.current + 1);
    stepsRef.current = next;
    setSteps(next);
    onStep?.(next);
    if (next >= groups) onWorkComplete?.();
  };

  useEffect(() => {
    if (!solved || steps >= groups) return;
    const remaining = groups - steps;
    const timer = window.setTimeout(() => {
      const next = remaining > 6 || reducedMotion ? groups : Math.min(groups, stepsRef.current + 1);
      stepsRef.current = next;
      setSteps(next);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [solved, steps, groups, reducedMotion]);

  useEffect(() => {
    if (solved) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("button, input, select, textarea")) return;
      if (event.key === " ") { event.preventDefault(); addGroup(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [solved, groups, question.key]);

  const theme = SUIT_THEME[suit];
  const shown = Math.min(groups, steps);

  // Responsive SVG grid: up to 5 pods per row, each pod holds `table` tokens neatly.
  const podCols = groups <= 5 ? groups : Math.ceil(groups / 2);
  const podRows = Math.ceil(groups / podCols);
  const tokenCols = table <= 2 ? 2 : table <= 4 ? 2 : table <= 6 ? 3 : table <= 9 ? 3 : 5;
  const tokenRows = Math.ceil(table / tokenCols);

  const podW = Math.max(118, tokenCols * 30 + 26);
  const podH = Math.max(82, tokenRows * 28 + 38);
  const gap = 14;
  const pad = 16;
  const svgW = Math.max(520, podCols * podW + (podCols - 1) * gap + pad * 2);
  const svgH = podRows * podH + (podRows - 1) * gap + pad * 2;
  const startX = (svgW - (podCols * podW + (podCols - 1) * gap)) / 2;

  const statusText = complete
    ? `${groups} ${groups === 1 ? "group" : "groups"} of ${table}`
    : shown
      ? `Group ${shown} of ${groups}`
      : `Need help? Press GROUP to fill one pod at a time.`;

  return <SceneFrame
    chip="Equal groups"
    caption={`${groups} ${groups === 1 ? "group" : "groups"} of ${table} ${theme.tokenPlural}`}
    suit={suit}
    solved={solved}
    class="array-scene"
    action={{
      label: "GROUP",
      icon: "+",
      done: complete,
      onTrigger: addGroup,
      status: statusText,
    }}
  >
    <svg class="kit-svg times-svg" viewBox={`0 0 ${svgW} ${svgH}`} role="img"
      aria-label={`${groups} equal groups of ${table}, ${shown} shown`}>
      {Array.from({ length: groups }, (_, index) => {
        const col = index % podCols;
        const row = Math.floor(index / podCols);
        const px = startX + col * (podW + gap);
        const py = pad + row * (podH + gap);
        const isLit = index < shown;
        const isNext = index === shown && !solved;
        const tokenAreaW = podW - 20;
        const tokenAreaH = podH - 34;
        const stepX = tokenAreaW / tokenCols;
        const stepY = tokenAreaH / tokenRows;
        const radius = table > 6 ? 9.5 : 11.5;

        return <g key={index} class={isNext ? "kit-interactive" : ""} data-pod={index} data-lit={isLit ? "true" : "false"}
          onClick={isNext ? addGroup : undefined}>
          <rect x={px} y={py} width={podW} height={podH} rx="14"
            fill={isLit ? theme.accentSoft : ART.surface}
            stroke={isLit ? theme.accentStroke : isNext ? ART.goldStroke : "#b8ccd6"}
            stroke-width={isLit || isNext ? "2.8" : "2"}
            stroke-dasharray={!isLit && !isNext ? "5 4" : undefined} />
          <text x={px + 12} y={py + 18} class="kit-pod-label" fill={isLit ? theme.accentStroke : ART.muted}>
            Group {index + 1}
          </text>
          {solved && <text x={px + podW - 12} y={py + 18} text-anchor="end" class="kit-pod-count" fill={ART.goldStroke}>
            {(index + 1) * table}
          </text>}

          {Array.from({ length: table }, (_, t) => {
            const tc = t % tokenCols;
            const tr = Math.floor(t / tokenCols);
            const cx = px + 10 + tc * stepX + stepX / 2;
            const cy = py + 26 + tr * stepY + stepY / 2;
            return <SuitToken key={t} suit={suit} cx={cx} cy={cy} r={radius}
              tone={isLit ? (index === shown - 1 && !solved ? "highlight" : "primary") : "ghost"}
              dataToken={isLit ? "pod-token" : "pod-ghost"} />;
          })}
        </g>;
      })}
    </svg>
  </SceneFrame>;
}
