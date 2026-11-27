import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const list = (q: SceneProps["question"], key: string) => Array.isArray(q.data[key]) ? q.data[key] as string[] : [];

function LogicShape({ symbol, cx, cy, r = 22 }: { symbol: string; cx: number; cy: number; r?: number }) {
  if (symbol === "●" || symbol === "circle") return <circle cx={cx} cy={cy} r={r} fill={ART.sky} stroke={ART.skyStroke} stroke-width="3" />;
  if (symbol === "▲" || symbol === "triangle") return <polygon points={`${cx},${cy - r} ${cx + r},${cy + r * 0.85} ${cx - r},${cy + r * 0.85}`} fill={ART.mint} stroke={ART.mintStroke} stroke-width="3" stroke-linejoin="round" />;
  if (symbol === "■" || symbol === "square") return <rect x={cx - r * 0.88} y={cy - r * 0.88} width={r * 1.76} height={r * 1.76} rx="6" fill={ART.gold} stroke={ART.goldStroke} stroke-width="3" />;
  return <polygon points={`${cx},${cy - r} ${cx + r * 0.3},${cy - r * 0.3} ${cx + r},${cy - r * 0.2} ${cx + r * 0.45},${cy + r * 0.25} ${cx + r * 0.6},${cy + r} ${cx},${cy + r * 0.6} ${cx - r * 0.6},${cy + r} ${cx - r * 0.45},${cy + r * 0.25} ${cx - r},${cy - r * 0.2} ${cx - r * 0.3},${cy - r * 0.3}`}
    fill="#df9b8b" stroke="#8a4435" stroke-width="2.5" stroke-linejoin="round" />;
}

/**
 * Illustrated SVG Logic Puzzles scene:
 * - lg.sudoku4: 4-slot coloured shape sudoku row with missing tile
 * - lg.sort: side-by-side illustrated shape cards to sort by properties
 */
export function LogicScene({ question, suit, solved = false }: SceneProps) {
  if (question.skillId === "lg.sudoku4") {
    const row = list(question, "row");
    const cell = 76;
    const gap = 14;
    const w = 4 * cell + 3 * gap + 36;
    return <SceneFrame chip="Shape sudoku" caption="Every row needs one of each shape" suit={suit} solved={solved} class="logic-scene">
      <svg class="kit-svg logic-svg" viewBox={`0 0 ${w} 112`} role="img" aria-label="Four-shape sudoku row">
        {row.map((cellVal, i) => {
          const x = 18 + i * (cell + gap);
          const isBlank = cellVal === "?";
          return <g key={i} data-sudoku-cell={i}>
            <rect x={x} y="16" width={cell} height={cell} rx="16"
              fill={isBlank ? ART.goldLight : ART.surface}
              stroke={isBlank ? ART.goldStroke : ART.stroke}
              stroke-width={isBlank ? "3.2" : "2.6"}
              stroke-dasharray={isBlank && !solved ? "6 4" : undefined} />
            {isBlank
              ? (solved
                ? <LogicShape symbol={question.answer} cx={x + cell / 2} cy={54} r={22} />
                : <text x={x + cell / 2} y="65" text-anchor="middle" font-size="32" font-weight="900" fill={ART.goldStroke}>?</text>)
              : <LogicShape symbol={cellVal} cx={x + cell / 2} cy={54} r={22} />}
          </g>;
        })}
      </svg>
    </SceneFrame>;
  }

  const shapes = list(question, "shapes");
  const items = shapes.length ? shapes : ["circle", "square", "triangle", "star"];
  const cardW = 88;
  const gap = 14;
  const w = items.length * cardW + (items.length - 1) * gap + 36;
  return <SceneFrame chip="Logic sort" caption="Check the properties of each shape" suit={suit} solved={solved} class="logic-scene">
    <svg class="kit-svg logic-svg" viewBox={`0 0 ${w} 136`} role="img" aria-label="Shapes to sort">
      {items.map((name, i) => {
        const x = 18 + i * (cardW + gap);
        const isAnswer = solved && name === question.answer;
        return <g key={name} data-sort-shape={name}>
          <rect x={x} y="12" width={cardW} height="110" rx="16"
            fill={isAnswer ? ART.mintLight : ART.surface}
            stroke={isAnswer ? ART.mintStroke : "#bdd0d9"} stroke-width={isAnswer ? "3.2" : "2.4"} />
          <LogicShape symbol={name} cx={x + cardW / 2} cy={54} r={22} />
          <text x={x + cardW / 2} y="106" text-anchor="middle" font-size="13" font-weight="850" fill={ART.ink}>{name}</text>
        </g>;
      })}
    </svg>
  </SceneFrame>;
}
