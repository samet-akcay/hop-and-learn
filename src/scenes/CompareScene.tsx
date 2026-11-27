import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);

/**
 * Illustrated SVG balance beam that physically tilts toward the heavier number,
 * with mini tens/ones block previews so children can visually compare magnitude.
 */
export function CompareScene({ question, suit, solved = false }: SceneProps) {
  const a = num(question, "a", 0);
  const b = num(question, "b", 0);
  const unit = question.unit ?? "";
  const isExpression = question.skillId === "cmp.expressions";

  // Tilt gently toward the heavier number (heavier side goes down).
  // For cmp.expressions both sides are equal once balanced!
  const diff = a - b;
  const tiltDeg = isExpression || diff === 0 ? 0 : diff > 0 ? -9 : 9;
  const rad = (tiltDeg * Math.PI) / 180;
  const pivotX = 280;
  const pivotY = 122;
  const arm = 158;
  const leftX = +(pivotX - Math.cos(rad) * arm).toFixed(2);
  const leftY = +(pivotY - Math.sin(rad) * arm).toFixed(2);
  const rightX = +(pivotX + Math.cos(rad) * arm).toFixed(2);
  const rightY = +(pivotY + Math.sin(rad) * arm).toFixed(2);

  const renderMiniBlocks = (value: number, cx: number, topY: number) => {
    if (value <= 0 || value > 99) return null;
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    const rodW = 6;
    const rodGap = 3;
    const rodsW = tens * rodW + Math.max(0, tens - 1) * rodGap;
    const onesCols = Math.min(3, ones);
    const onesW = ones > 0 ? onesCols * 7 + (onesCols - 1) * 2 : 0;
    const totalW = rodsW + (tens > 0 && ones > 0 ? 8 : 0) + onesW;
    const startX = cx - totalW / 2;

    return <g aria-hidden="true">
      {Array.from({ length: tens }, (_, i) => (
        <rect key={`t-${i}`} x={startX + i * (rodW + rodGap)} y={topY - 24} width={rodW} height={24} rx="2"
          fill={ART.mint} stroke={ART.mintStroke} stroke-width="1.2" />
      ))}
      {Array.from({ length: ones }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const ox = startX + rodsW + (tens > 0 ? 8 : 0) + col * 9;
        const oy = topY - 7 - row * 8;
        return <rect key={`o-${i}`} x={ox} y={oy} width={6.5} height={6.5} rx="1.5"
          fill={ART.gold} stroke={ART.goldStroke} stroke-width="1.1" />;
      })}
    </g>;
  };

  const renderPan = (cx: number, cy: number, value: number, side: "left" | "right", heavier: boolean) => {
    const panY = cy + 32;
    const fill = heavier ? ART.goldLight : ART.surface;
    const stroke = heavier ? ART.goldStroke : ART.skyStroke;
    const label = isExpression && side === "right" && !solved ? "?" : `${value}${unit ? ` ${unit}` : ""}`;
    return <g data-pan={side} data-value={value}>
      {/* Hanger cords */}
      <line x1={cx} y1={cy} x2={cx - 46} y2={panY} stroke="#7e9cab" stroke-width="2.2" />
      <line x1={cx} y1={cy} x2={cx + 46} y2={panY} stroke="#7e9cab" stroke-width="2.2" />
      <circle cx={cx} cy={cy} r="5" fill={ART.stroke} />
      {/* Mini blocks sitting in the pan */}
      {!(isExpression && side === "right" && !solved) && renderMiniBlocks(value, cx, panY - 2)}
      {/* Pan bowl */}
      <path d={`M ${cx - 58} ${panY} H ${cx + 58} Q ${cx + 54} ${panY + 46} ${cx} ${panY + 46} Q ${cx - 54} ${panY + 46} ${cx - 58} ${panY} Z`}
        fill={fill} stroke={stroke} stroke-width="3" stroke-linejoin="round" />
      <text x={cx} y={panY + 30} text-anchor="middle" class="kit-pan-value" fill={ART.ink}>{label}</text>
    </g>;
  };

  const symbol = a < b ? "<" : a > b ? ">" : "=";

  return <SceneFrame
    chip="Compare"
    caption={isExpression ? "Make both sides balance equally" : a >= 10 && b >= 10 ? "Look at the tens rods first" : "The heavier number pulls the scale down"}
    suit={suit}
    solved={solved}
    class="balance-scene"
    note={solved
      ? <><b>{a}{unit ? ` ${unit}` : ""}</b> {symbol} <b>{b}{unit ? ` ${unit}` : ""}</b></>
      : isExpression
        ? "Both pans must have the exact same total"
        : "Green rods are tens · Gold cubes are ones"}
  >
    <svg class="kit-svg compare-svg" viewBox="0 0 560 226" role="img"
      aria-label={`Balance scale comparing ${a}${unit} and ${b}${unit}`}>
      {/* Base stand */}
      <path d="M 232 214 H 328 L 314 198 H 246 Z" fill={ART.neutral} stroke={ART.stroke} stroke-width="3" stroke-linejoin="round" />
      <line x1={pivotX} y1={pivotY} x2={pivotX} y2="198" stroke={ART.stroke} stroke-width="7" stroke-linecap="round" />

      {/* Tilting beam */}
      <line class="balance-beam-line" data-tilt={tiltDeg} x1={leftX} y1={leftY} x2={rightX} y2={rightY}
        stroke={ART.stroke} stroke-width="8" stroke-linecap="round" />

      {/* Center sign badge */}
      <circle cx={pivotX} cy={pivotY} r="22" fill={solved ? ART.mintLight : ART.surface} stroke={solved ? ART.mintStroke : ART.stroke} stroke-width="3.2" />
      <text x={pivotX} y={pivotY + 8} text-anchor="middle" class="kit-pivot-sign" fill={solved ? ART.mintStroke : ART.goldStroke}>
        {solved || isExpression ? symbol : "?"}
      </text>

      {/* Left and right pans */}
      {renderPan(leftX, leftY, a, "left", a > b)}
      {renderPan(rightX, rightY, b, "right", b > a)}
    </svg>
  </SceneFrame>;
}
