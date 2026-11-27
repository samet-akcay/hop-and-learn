import { useEffect, useRef, useState } from "preact/hooks";
import { HERO_NAMES, HeroCharacter } from "../activities/HeroCharacter";
import { SceneFrame } from "../kit/SceneFrame";
import { ART, SUIT_THEME } from "../kit/theme";
import type { SceneProps } from "./types";

const list = (q: SceneProps["question"], key: string) => Array.isArray(q.data[key]) ? q.data[key] as string[] : [];

interface GridPos {
  col: number;
  row: number;
  facing: number; // 0=up, 1=right, 2=down, 3=left
}

function tracePath(path: string[], startCol: number, startRow: number, size: number): GridPos[] {
  let col = startCol;
  let row = startRow;
  let facing = 0;
  const hasTurns = path.some(step => step === "↶" || step === "↷");
  const states: GridPos[] = [{ col, row, facing }];
  for (const command of path) {
    if (command === "↶") {
      facing = (facing + 3) % 4;
    } else if (command === "↷") {
      facing = (facing + 1) % 4;
    } else if (hasTurns && command === "↑") {
      if (facing === 0) row--;
      else if (facing === 1) col++;
      else if (facing === 2) row++;
      else col--;
    } else {
      if (command === "↑") row--;
      if (command === "↓") row++;
      if (command === "→") col++;
      if (command === "←") col--;
    }
    col = Math.max(0, Math.min(size - 1, col));
    row = Math.max(0, Math.min(size - 1, row));
    states.push({ col, row, facing });
  }
  return states;
}

/**
 * Animated 5x5 SVG mission grid for Program the Rover.
 * The child's hero steps along the route toward a glowing crystal.
 */
export function RoverScene({ question, suit, solved = false, reducedMotion = false, onActivity, onStep }: SceneProps) {
  const path = list(question, "path");
  const size = 5;
  const startCol = question.skillId === "rv.drive" ? 2 : 0;
  const startRow = question.skillId === "rv.drive" ? 2 : size - 1;
  const states = tracePath(path, startCol, startRow, size);
  const goal = states[states.length - 1] ?? { col: startCol, row: startRow, facing: 0 };

  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const maxStep = Math.max(0, states.length - 1);

  const previewStep = () => {
    if (solved) return;
    onActivity?.();
    const next = stepRef.current >= maxStep ? 0 : stepRef.current + 1;
    stepRef.current = next;
    setStep(next);
    onStep?.(next);
  };

  // Auto-run the full animation when solved so he watches his hero grab the crystal.
  useEffect(() => {
    if (!solved || step >= maxStep) return;
    const timer = window.setTimeout(() => {
      const next = reducedMotion ? maxStep : Math.min(maxStep, stepRef.current + 1);
      stepRef.current = next;
      setStep(next);
    }, 340);
    return () => window.clearTimeout(timer);
  }, [solved, step, maxStep, reducedMotion]);

  const current = states[Math.min(step, maxStep)] ?? states[0]!;
  const theme = SUIT_THEME[suit];
  const cell = 54;
  const gap = 6;
  const pad = 16;
  const gridSpan = size * cell + (size - 1) * gap;
  const svgW = gridSpan + pad * 2;
  const svgH = gridSpan + pad * 2;
  const cellX = (c: number) => pad + c * (cell + gap);
  const cellY = (r: number) => pad + r * (cell + gap);

  // Place a decorative rock ahead of the first turn for rv.conditions
  const rockPos = question.skillId === "rv.conditions" && states.length > 1
    ? {
      col: Math.max(0, Math.min(size - 1, states[1]!.col + (path[0] === "→" ? 1 : 0))),
      row: Math.max(0, Math.min(size - 1, states[1]!.row + (path[0] === "↑" ? -1 : 0))),
    }
    : null;
  const showRock = rockPos && !(rockPos.col === goal.col && rockPos.row === goal.row);

  const reachedGoal = solved && step >= maxStep;

  return <SceneFrame
    chip="Program the Rover"
    caption={`Guide ${HERO_NAMES[suit]} to the crystal`}
    suit={suit}
    solved={solved}
    showHero={false}
    class="rover-scene"
    action={question.skillId !== "rv.drive" ? {
      label: step >= maxStep ? "RESET" : "STEP",
      icon: step >= maxStep ? "↺" : "▸",
      done: false,
      onTrigger: previewStep,
      status: step === 0 ? "Plan the moves below, or press STEP to trace the route." : `Step ${step} of ${maxStep}`,
    } : undefined}
  >
    <svg class="kit-svg rover-svg" viewBox={`0 0 ${svgW} ${svgH}`} role="img"
      aria-label={`5 by 5 mission grid with ${HERO_NAMES[suit]} moving toward a crystal`}>
      {/* Grid tiles */}
      {Array.from({ length: size * size }, (_, i) => {
        const col = i % size;
        const row = Math.floor(i / size);
        const x = cellX(col);
        const y = cellY(row);
        const isStart = col === startCol && row === startRow;
        const isGoal = col === goal.col && row === goal.row;
        const visited = states.slice(0, step + 1).some(s => s.col === col && s.row === row);
        return <rect key={i} x={x} y={y} width={cell} height={cell} rx="10"
          data-cell={`${col}-${row}`}
          data-goal={isGoal ? "true" : undefined}
          fill={isGoal ? ART.goldLight : visited ? theme.accentSoft : isStart ? ART.mintLight : ART.surface}
          stroke={isGoal ? ART.goldStroke : visited ? theme.accentStroke : "#bdd0d9"}
          stroke-width={isGoal || visited ? "2.8" : "2"} />;
      })}

      {/* Dashed route trail for steps taken so far */}
      {step > 0 && <polyline
        points={states.slice(0, step + 1).map(s => `${cellX(s.col) + cell / 2},${cellY(s.row) + cell / 2}`).join(" ")}
        fill="none" stroke={theme.accentStroke} stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round" stroke-linejoin="round" />}

      {/* Rock obstacle for condition questions */}
      {showRock && <g transform={`translate(${cellX(rockPos.col) + cell / 2} ${cellY(rockPos.row) + cell / 2})`}>
        <polygon points="-16,10 -12,-10 4,-14 16,-4 14,12 -6,14" fill="#9fb0b8" stroke={ART.stroke} stroke-width="2.4" stroke-linejoin="round" />
      </g>}

      {/* Glowing crystal at goal */}
      {!reachedGoal && <g data-crystal="true" transform={`translate(${cellX(goal.col) + cell / 2} ${cellY(goal.row) + cell / 2})`}>
        <polygon points="0,-18 14,0 0,18 -14,0" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.5" stroke-linejoin="round" />
        <polygon points="0,-12 7,0 0,12 -7,0" fill="#fff5cc" opacity="0.7" />
      </g>}

      {/* Hero standing on current square */}
      <g class="rover-hero" data-pos={`${current.col}-${current.row}`}
        transform={`translate(${cellX(current.col) + 6} ${cellY(current.row) + 1}) scale(0.82)`}>
        <HeroCharacter suit={suit} />
      </g>

      {/* Celebration sparkle when goal is reached */}
      {reachedGoal && <text x={cellX(goal.col) + cell - 6} y={cellY(goal.row) + 16} font-size="18" fill={ART.goldStroke}>★</text>}
    </svg>
  </SceneFrame>;
}
