import { useState } from "preact/hooks";
import { SceneFrame } from "../kit/SceneFrame";
import { ART, SUIT_THEME } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

/**
 * Crisp SVG Base-10 Place Value scene:
 * - Hundreds flats (10x10 grid in sky teal) when hundreds > 0
 * - Tens rods (segmented 10-blocks in soft mint)
 * - Ones cubes (in warm gold)
 * Tapping any rod or cube highlights it for touch-counting.
 */
export function PlaceValueScene({ question, suit, solved = false, onActivity }: SceneProps) {
  const hundreds = Math.max(0, num(question, "hundreds", 0));
  const tens = Math.max(0, num(question, "tens", 0));
  const ones = Math.max(0, num(question, "ones", 0));
  const number = num(question, "number", hundreds * 100 + tens * 10 + ones);
  const kind = str(question, "kind", "");
  const [tapped, setTapped] = useState<string[]>([]);

  const toggle = (id: string) => {
    onActivity?.();
    setTapped(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  const theme = SUIT_THEME[suit];
  const showHundreds = hundreds > 0;
  const width = showHundreds ? 660 : 560;
  const height = 216;
  const cols = showHundreds ? 3 : 2;
  const pad = 20;
  const gap = 16;
  const colW = (width - pad * 2 - gap * (cols - 1)) / cols;
  const colY = 14;
  const colH = 188;

  const tensX = pad + (showHundreds ? colW + gap : 0);
  const onesX = tensX + colW + gap;

  // Layout for tens rods (vertical segmented bars)
  const rodW = 18;
  const rodH = 110;
  const rodGap = tens > 6 ? 7 : 11;
  const rodsTotalW = tens * rodW + Math.max(0, tens - 1) * rodGap;
  const rodsStartX = tensX + (colW - rodsTotalW) / 2;
  const rodsY = colY + 46;

  // Layout for ones cubes (neat grid up to 5 per row)
  const cubeSize = ones > 12 ? 18 : 22;
  const cubeGap = ones > 12 ? 6 : 8;
  const cubeCols = ones <= 5 ? Math.max(1, ones) : 5;
  const cubeRows = Math.max(1, Math.ceil(ones / cubeCols));
  const cubesW = cubeCols * cubeSize + (cubeCols - 1) * cubeGap;
  const cubesH = cubeRows * cubeSize + (cubeRows - 1) * cubeGap;
  const cubesStartX = onesX + (colW - cubesW) / 2;
  const cubesStartY = colY + 46 + (rodH - cubesH) / 2;

  const caption = kind === "teen"
    ? "1 ten and extra ones"
    : kind === "flexible"
      ? `Partition ${number} into tens and ones`
      : kind === "more-less"
        ? "Watch which column changes"
        : "Tap the blocks to count tens and ones";

  return <SceneFrame
    chip="Place value"
    caption={caption}
    suit={suit}
    solved={solved}
    class="place-scene"
    note={solved
      ? <><b>{number}</b> = {showHundreds ? <><b>{hundreds}</b> {hundreds === 1 ? "hundred" : "hundreds"}, </> : null}<b>{tens}</b> {tens === 1 ? "ten" : "tens"} and <b>{ones}</b> {ones === 1 ? "one" : "ones"}</>
      : tapped.length > 0
        ? <>Counted <b>{tapped.length}</b> {tapped.length === 1 ? "block" : "blocks"} — tap again to clear</>
        : <>Each tall green rod is <b>10</b> · Each gold cube is <b>1</b></>}
  >
    <svg class="kit-svg placevalue-svg" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`Base 10 blocks showing ${hundreds ? `${hundreds} hundreds, ` : ""}${tens} tens and ${ones} ones`}>

      {/* Hundreds column (Y3 stretch) */}
      {showHundreds && <g data-column="hundreds">
        <rect x={pad} y={colY} width={colW} height={colH} rx="16" fill={ART.surface} stroke="#9fc0cf" stroke-width="2.5" />
        <text x={pad + colW / 2} y={colY + 26} text-anchor="middle" class="kit-col-head" fill={ART.skyStroke}>
          HUNDREDS ({hundreds})
        </text>
        {Array.from({ length: Math.min(hundreds, 9) }, (_, i) => {
          const colsH = hundreds <= 4 ? 2 : 3;
          const size = hundreds <= 4 ? 54 : 38;
          const cx = pad + 18 + (i % colsH) * (size + 8);
          const cy = colY + 44 + Math.floor(i / colsH) * (size + 8);
          const id = `h-${i}`;
          const active = tapped.includes(id);
          return <g key={id} class="kit-interactive" data-block="hundred" onClick={() => toggle(id)}>
            <rect x={cx} y={cy} width={size} height={size} rx="5" fill={active ? ART.gold : ART.sky} stroke={active ? ART.goldStroke : ART.skyStroke} stroke-width="2" />
            <line x1={cx + size / 2} y1={cy} x2={cx + size / 2} y2={cy + size} stroke={ART.surface} stroke-width="1" opacity="0.65" />
            <line x1={cx} y1={cy + size / 2} x2={cx + size} y2={cy + size / 2} stroke={ART.surface} stroke-width="1" opacity="0.65" />
          </g>;
        })}
      </g>}

      {/* Tens column */}
      <g data-column="tens">
        <rect x={tensX} y={colY} width={colW} height={colH} rx="16" fill={ART.surface} stroke={ART.mintStroke} stroke-width="2.5" />
        <text x={tensX + colW / 2} y={colY + 26} text-anchor="middle" class="kit-col-head" fill={ART.mintStroke}>
          TENS {solved ? `(${tens})` : ""}
        </text>
        {tens === 0 && <text x={tensX + colW / 2} y={colY + 108} text-anchor="middle" class="kit-muted-label">0 tens</text>}
        {Array.from({ length: tens }, (_, i) => {
          const rx = rodsStartX + i * (rodW + rodGap);
          const id = `t-${i}`;
          const active = tapped.includes(id);
          const segH = rodH / 10;
          return <g key={id} class="kit-interactive" data-block="ten" onClick={() => toggle(id)}>
            <rect x={rx} y={rodsY} width={rodW} height={rodH} rx="4"
              fill={active ? theme.accent : ART.mint} stroke={active ? theme.accentStroke : ART.mintStroke} stroke-width="2" />
            {Array.from({ length: 9 }, (_, seg) => (
              <line key={seg} x1={rx + 1} y1={rodsY + (seg + 1) * segH} x2={rx + rodW - 1} y2={rodsY + (seg + 1) * segH}
                stroke={ART.surface} stroke-width="1.2" opacity="0.7" />
            ))}
          </g>;
        })}
        <text x={tensX + colW / 2} y={colY + colH - 12} text-anchor="middle" class="kit-col-sub" fill={ART.muted}>
          {solved ? `${tens * 10}` : "Count in 10s"}
        </text>
      </g>

      {/* Ones column */}
      <g data-column="ones">
        <rect x={onesX} y={colY} width={colW} height={colH} rx="16" fill={ART.surface} stroke={ART.goldStroke} stroke-width="2.5" />
        <text x={onesX + colW / 2} y={colY + 26} text-anchor="middle" class="kit-col-head" fill={ART.goldStroke}>
          ONES {solved ? `(${ones})` : ""}
        </text>
        {ones === 0 && <text x={onesX + colW / 2} y={colY + 108} text-anchor="middle" class="kit-muted-label">0 ones</text>}
        {Array.from({ length: ones }, (_, i) => {
          const col = i % cubeCols;
          const row = Math.floor(i / cubeCols);
          const cx = cubesStartX + col * (cubeSize + cubeGap);
          const cy = cubesStartY + row * (cubeSize + cubeGap);
          const id = `o-${i}`;
          const active = tapped.includes(id);
          return <g key={id} class="kit-interactive" data-block="one" onClick={() => toggle(id)}>
            <rect x={cx} y={cy} width={cubeSize} height={cubeSize} rx="5"
              fill={active ? theme.accent : ART.gold} stroke={active ? theme.accentStroke : ART.goldStroke} stroke-width="2.2" />
            <rect x={cx + 3} y={cy + 3} width={cubeSize * 0.35} height={cubeSize * 0.25} rx="2" fill="#fff7d4" opacity="0.75" />
          </g>;
        })}
        <text x={onesX + colW / 2} y={colY + colH - 12} text-anchor="middle" class="kit-col-sub" fill={ART.muted}>
          {solved ? `${ones}` : "Count in 1s"}
        </text>
      </g>
    </svg>
  </SceneFrame>;
}
