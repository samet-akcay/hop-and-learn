import { useState } from "preact/hooks";
import { HERO_NAMES, HeroCharacter } from "../activities/HeroCharacter";
import { SceneFrame } from "../kit/SceneFrame";
import { ART, SUIT_THEME } from "../kit/theme";
import type { SceneProps } from "./types";

const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

const DIR_ANGLES: Record<string, number> = { up: 0, right: 90, down: 180, left: 270 };

/** SVG arc path on circle (cx, cy, r) from startDeg to endDeg (0 = top/up). */
function turnArc(cx: number, cy: number, r: number, startDeg: number, deltaDeg: number): { d: string; tipX: number; tipY: number; tipAngle: number } {
  const endDeg = startDeg + deltaDeg;
  const sRad = ((startDeg - 90) * Math.PI) / 180;
  const eRad = ((endDeg - 90) * Math.PI) / 180;
  const x1 = +(cx + r * Math.cos(sRad)).toFixed(2);
  const y1 = +(cy + r * Math.sin(sRad)).toFixed(2);
  const x2 = +(cx + r * Math.cos(eRad)).toFixed(2);
  const y2 = +(cy + r * Math.sin(eRad)).toFixed(2);
  const sweep = deltaDeg >= 0 ? 1 : 0;
  const large = Math.abs(deltaDeg) > 180 ? 1 : 0;
  return {
    d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`,
    tipX: x2,
    tipY: y2,
    tipAngle: endDeg + (deltaDeg >= 0 ? 90 : -90),
  };
}

/**
 * Clean light-mode SVG scenes for Turns & Position words:
 * - tu.turns: compass dial with curved turn arc and animated hero pointer.
 * - tu.position: 3x3 stage accurately placing the hero left/right/above/below/between the star(s).
 */
export function TurnsScene({ question, suit, solved = false, onActivity }: SceneProps) {
  if (question.skillId === "tu.position") {
    return <PositionDiagram question={question} suit={suit} solved={solved} />;
  }

  const from = str(question, "from", "up");
  const turn = str(question, "turn", "quarter clockwise");
  const to = str(question, "to", "right");
  const [previewed, setPreviewed] = useState(false);

  const startDeg = DIR_ANGLES[from] ?? 0;
  const deltaDeg = turn === "half turn" ? 180 : turn === "quarter anticlockwise" ? -90 : 90;
  const shownDeg = solved || previewed ? startDeg + deltaDeg : startDeg;
  const arc = turnArc(150, 108, 66, startDeg, deltaDeg);
  const theme = SUIT_THEME[suit];

  return <SceneFrame
    chip="Turn compass"
    caption={`Start facing ${from} · make a ${turn}`}
    suit={suit}
    solved={solved}
    class="turns-scene"
    action={{
      label: previewed ? "RESET" : "TRY TURN",
      icon: deltaDeg >= 0 ? "↻" : "↺",
      done: false,
      onTrigger: () => { onActivity?.(); setPreviewed(v => !v); },
      status: previewed ? `After turning: facing ${to}?` : "Press TRY TURN to watch the pointer turn.",
    }}
  >
    <svg class="kit-svg turns-svg" viewBox="0 0 300 218" role="img"
      aria-label={`Compass starting facing ${from} with a ${turn} arrow`}>
      {/* Outer compass face */}
      <circle cx="150" cy="108" r="76" fill={ART.surface} stroke={ART.stroke} stroke-width="3.5" />
      <circle cx="150" cy="108" r="54" fill={ART.surfaceSoft} stroke="#d2e1e8" stroke-width="2" stroke-dasharray="4 4" />

      {/* Direction labels */}
      {[
        { label: "up", x: 150, y: 20 },
        { label: "right", x: 256, y: 113 },
        { label: "down", x: 150, y: 205 },
        { label: "left", x: 44, y: 113 },
      ].map(dir => {
        const isStart = dir.label === from;
        const isEnd = solved && dir.label === to;
        return <text key={dir.label} x={dir.x} y={dir.y} text-anchor="middle"
          font-size="15" font-weight="850"
          fill={isEnd ? ART.mintStroke : isStart ? ART.goldStroke : ART.muted}>
          {dir.label}
        </text>;
      })}

      {/* Curved turn arc + arrowhead */}
      <path d={arc.d} fill="none" stroke={ART.goldStroke} stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round" />
      <g transform={`translate(${arc.tipX} ${arc.tipY}) rotate(${arc.tipAngle})`}>
        <polygon points="0,-7 10,0 0,7" fill={ART.gold} stroke={ART.goldStroke} stroke-width="1.8" stroke-linejoin="round" />
      </g>

      {/* Directional arrow that rotates cleanly */}
      <g class="turn-pointer" data-angle={shownDeg} transform={`rotate(${shownDeg} 150 108)`}>
        <path d="M 150 52 L 134 112 L 150 100 L 166 112 Z" fill={theme.accent} stroke={theme.accentStroke} stroke-width="2.8" stroke-linejoin="round" />
        <circle cx="150" cy="108" r="9" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.5" />
      </g>
    </svg>
  </SceneFrame>;
}

function PositionDiagram({ question, suit, solved }: { question: SceneProps["question"]; suit: SceneProps["suit"]; solved: boolean }) {
  const position = str(question, "position", "left");
  // Place hero and star(s) on a clean 3x3 grid matching the exact spatial relation
  let heroCell: [number, number] = [0, 1];
  let stars: [number, number][] = [[1, 1]];
  if (position === "left") { heroCell = [0, 1]; stars = [[1, 1]]; }
  else if (position === "right") { heroCell = [2, 1]; stars = [[1, 1]]; }
  else if (position === "above") { heroCell = [1, 0]; stars = [[1, 1]]; }
  else if (position === "below") { heroCell = [1, 2]; stars = [[1, 1]]; }
  else if (position === "between") { heroCell = [1, 1]; stars = [[0, 1], [2, 1]]; }

  const cell = 64;
  const gap = 8;
  const pad = 16;
  const span = 3 * cell + 2 * gap;
  const cx = (col: number) => pad + col * (cell + gap);
  const cy = (row: number) => pad + row * (cell + gap);

  return <SceneFrame
    chip="Position words"
    caption={`Where is ${HERO_NAMES[suit]} compared to the star?`}
    suit={suit}
    solved={solved}
    showHero={false}
    class="turns-scene"
  >
    <svg class="kit-svg position-svg" viewBox={`0 0 ${span + pad * 2} ${span + pad * 2}`} role="img"
      aria-label={`${HERO_NAMES[suit]} is ${position} the star`}>
      {Array.from({ length: 9 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const isHero = col === heroCell[0] && row === heroCell[1];
        const isStar = stars.some(([sc, sr]) => sc === col && sr === row);
        return <rect key={i} x={cx(col)} y={cy(row)} width={cell} height={cell} rx="12"
          fill={isStar ? ART.goldLight : isHero ? ART.skyLight : ART.surface}
          stroke={isStar ? ART.goldStroke : isHero ? ART.skyStroke : "#c8dae2"}
          stroke-width={isStar || isHero ? "2.6" : "2"} />;
      })}
      {stars.map(([sc, sr], i) => (
        <g key={i} data-star="true" transform={`translate(${cx(sc) + cell / 2} ${cy(sr) + cell / 2})`}>
          <polygon points="0,-20 6,-7 20,-5 10,5 12,19 0,12 -12,19 -10,5 -20,-5 -6,-7"
            fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.4" stroke-linejoin="round" />
        </g>
      ))}
      <g data-hero-pos={position} transform={`translate(${cx(heroCell[0]) + 7} ${cy(heroCell[1]) + 2}) scale(0.95)`}>
        <HeroCharacter suit={suit} />
      </g>
    </svg>
  </SceneFrame>;
}
