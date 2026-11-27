import { useState } from "preact/hooks";
import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);
const list = (q: SceneProps["question"], key: string) => Array.isArray(q.data[key]) ? q.data[key] as string[] : [];

function polygonPoints(cx: number, cy: number, r: number, sides: number): { x: number; y: number }[] {
  // Even-sided shapes get a half-step turn so they sit on a flat side (a square, not a diamond).
  const offset = sides % 2 === 0 ? Math.PI / sides : 0;
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2 + offset;
    return { x: +(cx + r * Math.cos(angle)).toFixed(2), y: +(cy + r * Math.sin(angle)).toFixed(2) };
  });
}

function PatternGlyph({ symbol, cx, cy, r = 20 }: { symbol: string; cx: number; cy: number; r?: number }) {
  if (symbol === "●") return <circle cx={cx} cy={cy} r={r} fill={ART.sky} stroke={ART.skyStroke} stroke-width="3" />;
  if (symbol === "▲") return <polygon points={`${cx},${cy - r} ${cx + r},${cy + r * 0.85} ${cx - r},${cy + r * 0.85}`} fill={ART.mint} stroke={ART.mintStroke} stroke-width="3" stroke-linejoin="round" />;
  if (symbol === "■") return <rect x={cx - r * 0.88} y={cy - r * 0.88} width={r * 1.76} height={r * 1.76} rx="5" fill={ART.gold} stroke={ART.goldStroke} stroke-width="3" />;
  return <polygon points={`${cx},${cy - r} ${cx + r * 0.3},${cy - r * 0.3} ${cx + r},${cy - r * 0.2} ${cx + r * 0.45},${cy + r * 0.25} ${cx + r * 0.6},${cy + r} ${cx},${cy + r * 0.6} ${cx - r * 0.6},${cy + r} ${cx - r * 0.45},${cy + r * 0.25} ${cx - r},${cy - r * 0.2} ${cx - r * 0.3},${cy - r * 0.3}`}
    fill="#df9b8b" stroke="#8a4435" stroke-width="2.5" stroke-linejoin="round" />;
}

/**
 * Unified SVG Shapes scene:
 * - 2D polygons with tappable sides/vertices to count
 * - Real isometric 3D solids (cube, cylinder, triangular prism)
 * - Mirror symmetry with interactive fold preview
 * - Colourful SVG repeating shape pattern strip
 */
export function ShapesScene({ question, suit, solved = false, onActivity }: SceneProps) {
  if (question.skillId === "sh.patterns") {
    const pattern = list(question, "pattern");
    const cell = 64;
    const gap = 12;
    const count = pattern.length + 1;
    const w = count * cell + (count - 1) * gap + 32;
    return <SceneFrame chip="Pattern strip" caption="Look for the shapes that repeat" suit={suit} solved={solved} class="shape-scene">
      <svg class="kit-svg shape-pattern-svg" viewBox={`0 0 ${w} 92`} role="img" aria-label="Repeating shape pattern">
        {pattern.map((symbol, i) => {
          const x = 16 + i * (cell + gap);
          return <g key={i} data-pattern-item={i}>
            <rect x={x} y="12" width={cell} height={cell} rx="14" fill={ART.surface} stroke="#bdd0d9" stroke-width="2.5" />
            <PatternGlyph symbol={symbol} cx={x + cell / 2} cy={12 + cell / 2} r={19} />
          </g>;
        })}
        <g>
          <rect x={16 + pattern.length * (cell + gap)} y="12" width={cell} height={cell} rx="14"
            fill={ART.goldLight} stroke={ART.goldStroke} stroke-width="3" stroke-dasharray="6 4" />
          {solved
            ? <PatternGlyph symbol={question.answer} cx={16 + pattern.length * (cell + gap) + cell / 2} cy={44} r={19} />
            : <text x={16 + pattern.length * (cell + gap) + cell / 2} y="54" text-anchor="middle" font-size="30" font-weight="900" fill={ART.goldStroke}>?</text>}
        </g>
      </svg>
    </SceneFrame>;
  }

  if (question.skillId === "sh.symmetry") {
    const symmetric = Boolean(question.data.symmetric);
    const [folded, setFolded] = useState(false);
    return <SceneFrame
      chip="Mirror line"
      caption="Do both sides match if you fold along the dotted line?"
      suit={suit}
      solved={solved}
      class="shape-scene"
      action={{
        label: folded ? "UNFOLD" : "FOLD",
        icon: "⇆",
        done: false,
        onTrigger: () => { onActivity?.(); setFolded(v => !v); },
        status: folded ? (symmetric ? "Both halves cover each other!" : "Look — the two halves do not match!") : "Press FOLD to check both sides.",
      }}
    >
      <svg class="kit-svg shape-svg" viewBox="0 0 320 180" role="img" aria-label={symmetric ? "Symmetrical shape with mirror line" : "Asymmetrical shape with mirror line"}>
        {/* Left half */}
        <polygon points="160,26 84,64 68,140 160,154" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="3.5" stroke-linejoin="round" />
        <circle cx="118" cy="100" r="14" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.5" />

        {/* Right half */}
        {symmetric ? <g>
          <polygon points="160,26 236,64 252,140 160,154" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="3.5" stroke-linejoin="round" />
          <circle cx="202" cy="100" r="14" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.5" />
        </g> : <g>
          <rect x="160" y="54" width="84" height="96" rx="12" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="3.5" />
          <rect x="192" y="106" width="24" height="24" rx="4" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.5" />
        </g>}

        {/* Fold ghost overlay showing left half mirrored onto right */}
        {(folded || solved) && <g opacity="0.58">
          <polygon points="160,26 236,64 252,140 160,154" fill={ART.mintLight} stroke={ART.mintStroke} stroke-width="3" stroke-dasharray="6 4" stroke-linejoin="round" />
        </g>}

        {/* Mirror line */}
        <line x1="160" y1="10" x2="160" y2="170" stroke={ART.goldStroke} stroke-width="3.5" stroke-dasharray="7 5" />
      </svg>
    </SceneFrame>;
  }

  if (question.skillId === "sh.3d-props" || question.skillId === "sh.faces") {
    const shape = str(question, "shape", "cube");
    return <SceneFrame
      chip="3D shape"
      caption={shape[0]!.toUpperCase() + shape.slice(1)}
      suit={suit}
      solved={solved}
      class="shape-scene"
      note={solved ? `${shape[0]!.toUpperCase()}${shape.slice(1)}: ${num(question, "faces")} faces · ${num(question, "edges")} edges · ${num(question, "vertices")} vertices` : "Look at the flat faces of this 3D solid."}
    >
      <svg class="kit-svg shape-3d-svg" viewBox="0 0 240 185" role="img" aria-label={`3D ${shape}`}>
        {shape === "cube" && <g data-solid="cube">
          {/* Hidden back edges */}
          <line x1="114" y1="30" x2="114" y2="106" stroke="#9bb4bf" stroke-width="2" stroke-dasharray="4 4" />
          <line x1="114" y1="106" x2="62" y2="138" stroke="#9bb4bf" stroke-width="2" stroke-dasharray="4 4" />
          <line x1="114" y1="106" x2="182" y2="106" stroke="#9bb4bf" stroke-width="2" stroke-dasharray="4 4" />
          {/* Top face */}
          <polygon points="62,62 114,30 182,30 130,62" fill={ART.goldLight} stroke={ART.stroke} stroke-width="3" stroke-linejoin="round" />
          {/* Front square face */}
          <rect x="62" y="62" width="68" height="76" fill={question.skillId === "sh.faces" ? ART.gold : ART.skyLight} stroke={ART.stroke} stroke-width="3" stroke-linejoin="round" />
          {/* Right face */}
          <polygon points="130,62 182,30 182,106 130,138" fill={ART.sky} stroke={ART.stroke} stroke-width="3" stroke-linejoin="round" />
        </g>}

        {shape === "cylinder" && <g data-solid="cylinder">
          {/* Body */}
          <path d="M 68 52 V 134 A 52 20 0 0 0 172 134 V 52 Z" fill={ART.skyLight} stroke={ART.stroke} stroke-width="3" stroke-linejoin="round" />
          {/* Hidden back curve of bottom circle */}
          <path d="M 68 134 A 52 20 0 0 1 172 134" fill="none" stroke="#8eaab8" stroke-width="2" stroke-dasharray="4 4" />
          {/* Top circular face */}
          <ellipse cx="120" cy="52" rx="52" ry="20" fill={question.skillId === "sh.faces" ? ART.gold : ART.goldLight} stroke={ART.stroke} stroke-width="3" />
        </g>}

        {shape === "triangular prism" && <g data-solid="triangular prism">
          {/* Back hidden edges */}
          <line x1="138" y1="34" x2="102" y2="114" stroke="#9bb4bf" stroke-width="2" stroke-dasharray="4 4" />
          <line x1="102" y1="114" x2="188" y2="114" stroke="#9bb4bf" stroke-width="2" stroke-dasharray="4 4" />
          <line x1="56" y1="146" x2="102" y2="114" stroke="#9bb4bf" stroke-width="2" stroke-dasharray="4 4" />
          {/* Slanted side face */}
          <polygon points="94,64 138,34 188,114 142,146" fill={ART.sky} stroke={ART.stroke} stroke-width="3" stroke-linejoin="round" />
          {/* Front triangular face */}
          <polygon points="94,64 142,146 56,146" fill={question.skillId === "sh.faces" ? ART.gold : ART.goldLight} stroke={ART.stroke} stroke-width="3" stroke-linejoin="round" />
        </g>}
      </svg>
    </SceneFrame>;
  }

  if (question.skillId === "sh.sort") {
    return <SceneFrame chip="Compare shapes" caption="Look at the sides and corners" suit={suit} solved={solved} class="shape-scene">
      <svg class="kit-svg shape-sort-svg" viewBox="0 0 420 140" role="img" aria-label="Triangle, square, and circle">
        <g>
          <polygon points="75,24 122,108 28,108" fill={ART.mintLight} stroke={ART.mintStroke} stroke-width="3.5" stroke-linejoin="round" />
          <text x="75" y="130" text-anchor="middle" font-size="14" font-weight="800" fill={ART.muted}>triangle</text>
        </g>
        <g>
          <rect x="170" y="28" width="80" height="80" rx="6" fill={ART.goldLight} stroke={ART.goldStroke} stroke-width="3.5" />
          <text x="210" y="130" text-anchor="middle" font-size="14" font-weight="800" fill={ART.muted}>square</text>
        </g>
        <g>
          <circle cx="345" cy="68" r="42" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="3.5" />
          <text x="345" y="130" text-anchor="middle" font-size="14" font-weight="800" fill={ART.muted}>circle</text>
        </g>
      </svg>
    </SceneFrame>;
  }

  // 2D polygon with tappable sides/corners so he can count them one by one!
  const shape = str(question, "shape", "triangle");
  const sides = Math.max(3, num(question, "sides", 3));
  const [marked, setMarked] = useState<number[]>([]);
  const pts = polygonPoints(130, 92, 68, sides);

  const toggleEdge = (i: number) => {
    onActivity?.();
    setMarked(cur => cur.includes(i) ? cur.filter(v => v !== i) : [...cur, i]);
  };

  return <SceneFrame
    chip="2D shape"
    caption="Tap each straight side to count them"
    suit={suit}
    solved={solved}
    class="shape-scene"
    note={solved
      ? <>A <b>{shape}</b> has <b>{sides}</b> straight sides and <b>{sides}</b> vertices.</>
      : marked.length > 0
        ? <>Counted <b>{marked.length}</b> {marked.length === 1 ? "side" : "sides"}</>
        : "Tap the edges around the outside to count."}
  >
    <svg class="kit-svg shape-2d-svg" viewBox="0 0 260 184" role="img" aria-label={shape}>
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill={ART.mintLight} stroke="none" />
      {pts.map((p, i) => {
        const next = pts[(i + 1) % pts.length]!;
        const isMarked = solved || marked.includes(i);
        const mx = (p.x + next.x) / 2;
        const my = (p.y + next.y) / 2;
        return <g key={i} class="kit-interactive" data-edge={i} onClick={() => toggleEdge(i)}>
          {/* Wide invisible hit target for easy tapping */}
          <line x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke="transparent" stroke-width="18" />
          <line x1={p.x} y1={p.y} x2={next.x} y2={next.y}
            stroke={isMarked ? ART.goldStroke : ART.mintStroke} stroke-width={isMarked ? "6" : "4.5"} stroke-linecap="round" />
          {isMarked && <>
            <circle cx={mx} cy={my} r="11" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
            <text x={mx} y={my + 4.5} text-anchor="middle" font-size="12" font-weight="900" fill={ART.ink}>{i + 1}</text>
          </>}
        </g>;
      })}
      {/* Corner vertices */}
      {pts.map((p, i) => <circle key={`v-${i}`} cx={p.x} cy={p.y} r="5.5" fill={ART.surface} stroke={ART.stroke} stroke-width="2.5" />)}
    </svg>
  </SceneFrame>;
}
