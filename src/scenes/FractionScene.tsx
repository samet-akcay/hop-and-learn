import { useEffect, useId, useRef, useState } from "preact/hooks";
import type { GeneratedQuestion } from "../core/types";
import { HERO_NAMES, HeroCharacter } from "../activities/HeroCharacter";
import { SceneFrame } from "../kit/SceneFrame";
import { SuitToken } from "../kit/SuitToken";
import { ART, SUIT_THEME } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: GeneratedQuestion, key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: GeneratedQuestion, key: string, fallback = "") => String(q.data[key] ?? fallback);
const bool = (q: GeneratedQuestion, key: string, fallback = false) => Boolean(q.data[key] ?? fallback);

/** SVG path for a circular sector measured clockwise from 12 o'clock (0 deg = top). */
export function pieSlicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const startRad = ((startDeg - 90) * Math.PI) / 180;
  const endRad = ((endDeg - 90) * Math.PI) / 180;
  const x1 = +(cx + r * Math.cos(startRad)).toFixed(2);
  const y1 = +(cy + r * Math.sin(startRad)).toFixed(2);
  const x2 = +(cx + r * Math.cos(endRad)).toFixed(2);
  const y2 = +(cy + r * Math.sin(endRad)).toFixed(2);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function sliceLabelPoint(cx: number, cy: number, r: number, startDeg: number, endDeg: number): { x: number; y: number } {
  const midRad = (((startDeg + endDeg) / 2 - 90) * Math.PI) / 180;
  return {
    x: +(cx + r * 0.56 * Math.cos(midRad)).toFixed(2),
    y: +(cy + r * 0.56 * Math.sin(midRad)).toFixed(2),
  };
}

function fractionWord(numerator: number, denominator: number): string {
  const names = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
  const n = names[numerator] ?? String(numerator);
  if (denominator === 2) return numerator === 1 ? "1 half" : `${numerator} halves`;
  if (denominator === 3) return `${numerator} ${numerator === 1 ? "third" : "thirds"}`;
  if (denominator === 4) return `${numerator} ${numerator === 1 ? "quarter" : "quarters"}`;
  if (denominator === 6) return `${n} ${numerator === 1 ? "sixth" : "sixths"}`;
  if (denominator === 8) return `${n} ${numerator === 1 ? "eighth" : "eighths"}`;
  return `${numerator}/${denominator}`;
}

function StackedFractionSvg({ x, y, numerator, denominator, color = ART.stroke }: {
  x: number; y: number; numerator: number; denominator: number; color?: string;
}) {
  return <g class="svg-stacked-fraction" fill={color}>
    <text x={x} y={y - 7} text-anchor="middle" font-size="22" font-weight="850">{numerator}</text>
    <line x1={x - 15} y1={y} x2={x + 15} y2={y} stroke={color} stroke-width="3" stroke-linecap="round" />
    <text x={x} y={y + 22} text-anchor="middle" font-size="22" font-weight="850">{denominator}</text>
  </g>;
}

export function FractionScene(props: SceneProps) {
  const { question } = props;
  if (question.skillId === "fr.equal") return <EqualPartsDiagram {...props} />;
  if (question.skillId === "fr.shapes") return <ShadedShapeDiagram {...props} />;
  if (question.skillId === "fr.equivalent") return <EquivalentWallDiagram {...props} />;
  if (question.skillId === "fr.line") return <FractionNumberLineDiagram {...props} />;
  return <ShareSetDiagram {...props} />;
}

/** 1. Equal vs. unequal parts across bars, circles and squares. */
function EqualPartsDiagram({ question, suit, solved = false, onActivity }: SceneProps) {
  const clipId = useId();
  const shape = str(question, "shape", "bar");
  const parts = Math.max(2, num(question, "parts", num(question, "denominator", 4)));
  const equal = question.data.equal !== undefined ? bool(question, "equal", true) : !bool(question, "unequal", false);
  const [selected, setSelected] = useState<number[]>([]);

  const togglePart = (index: number) => {
    onActivity?.();
    setSelected(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index]);
  };

  const renderBar = () => {
    const x0 = 24, y0 = 18, width = 412, height = 88;
    const fractions = equal
      ? Array.from({ length: parts }, () => 1 / parts)
      : parts === 2 ? [0.24, 0.76] : parts === 3 ? [0.17, 0.57, 0.26] : [0.13, 0.41, 0.16, 0.30];
    let cursor = x0;
    const segments = fractions.map((ratio, index) => {
      const segW = ratio * width;
      const seg = { index, x: cursor, w: segW };
      cursor += segW;
      return seg;
    });

    return <svg class="fraction-svg fraction-bar-svg" viewBox="0 0 460 124" role="img"
      aria-label={`A bar split into ${parts} ${equal ? "equal" : "unequal"} parts`}>
      <defs>
        <clipPath id={clipId}><rect x={x0} y={y0} width={width} height={height} rx="12" /></clipPath>
      </defs>
      <g clip-path={`url(#${clipId})`}>
        {segments.map(seg => {
          const active = selected.includes(seg.index);
          return <g key={seg.index} class="fraction-part-group" data-equal={equal ? "true" : "false"} data-part={seg.index} onClick={() => togglePart(seg.index)}>
            <rect x={seg.x} y={y0} width={seg.w} height={height} fill={active ? ART.neutralActive : ART.neutral} />
            {active && <text x={seg.x + seg.w / 2} y={y0 + height / 2 + 7} text-anchor="middle" class="fraction-part-num">{seg.index + 1}</text>}
          </g>;
        })}
        {segments.slice(1).map(seg => <line key={`div-${seg.index}`} x1={seg.x} y1={y0} x2={seg.x} y2={y0 + height} stroke={ART.stroke} stroke-width="3.5" />)}
      </g>
      <rect x={x0} y={y0} width={width} height={height} rx="12" fill="none" stroke={ART.stroke} stroke-width="3.5" />
    </svg>;
  };

  const renderCircle = () => {
    const cx = 110, cy = 96, r = 78;
    if (!equal && parts === 2) {
      const cutX = cx - 32;
      const pieces = [
        { index: 0, x: cx - r, w: cutX - (cx - r), labelX: cx - 55 },
        { index: 1, x: cutX, w: cx + r - cutX, labelX: cx + 18 },
      ];
      return <svg class="fraction-svg fraction-circle-svg" viewBox="0 0 220 192" role="img"
        aria-label="A circle split into 2 unequal parts">
        <defs><clipPath id={clipId}><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
        <g clip-path={`url(#${clipId})`}>
          {pieces.map(piece => {
            const active = selected.includes(piece.index);
            return <g key={piece.index} class="fraction-part-group" data-equal="false" data-part={piece.index} onClick={() => togglePart(piece.index)}>
              <rect x={piece.x} y={cy - r} width={piece.w} height={r * 2} fill={active ? ART.neutralActive : ART.neutral} />
              {active && <text x={piece.labelX} y={cy + 7} text-anchor="middle" class="fraction-part-num">{piece.index + 1}</text>}
            </g>;
          })}
          <line x1={cutX} y1={cy - r} x2={cutX} y2={cy + r} stroke={ART.stroke} stroke-width="3.5" />
        </g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={ART.stroke} stroke-width="3.5" />
      </svg>;
    }

    const angles = equal
      ? Array.from({ length: parts }, () => 360 / parts)
      : parts === 3 ? [52, 204, 104] : [38, 142, 46, 134];
    let deg = 0;
    const wedges = angles.map((span, index) => {
      const start = deg;
      deg += span;
      return { index, start, end: deg };
    });

    return <svg class="fraction-svg fraction-circle-svg" viewBox="0 0 220 192" role="img"
      aria-label={`A circle split into ${parts} ${equal ? "equal" : "unequal"} parts`}>
      {wedges.map(wedge => {
        const active = selected.includes(wedge.index);
        const label = sliceLabelPoint(cx, cy, r, wedge.start, wedge.end);
        return <g key={wedge.index} class="fraction-part-group" data-equal={equal ? "true" : "false"} data-part={wedge.index} onClick={() => togglePart(wedge.index)}>
          <path d={pieSlicePath(cx, cy, r, wedge.start, wedge.end)} fill={active ? ART.neutralActive : ART.neutral} stroke={ART.stroke} stroke-width="3.5" stroke-linejoin="round" />
          {active && <text x={label.x} y={label.y + 7} text-anchor="middle" class="fraction-part-num">{wedge.index + 1}</text>}
        </g>;
      })}
    </svg>;
  };

  const renderSquare = () => {
    const x0 = 34, y0 = 16, size = 152;
    type Cell = { index: number; x: number; y: number; w: number; h: number };
    const cells: Cell[] = [];
    if (parts === 2) {
      const w1 = equal ? size / 2 : size * 0.25;
      cells.push({ index: 0, x: x0, y: y0, w: w1, h: size });
      cells.push({ index: 1, x: x0 + w1, y: y0, w: size - w1, h: size });
    } else if (parts === 3) {
      const heights = equal ? [size / 3, size / 3, size / 3] : [size * 0.19, size * 0.57, size * 0.24];
      let cy = y0;
      heights.forEach((h, index) => { cells.push({ index, x: x0, y: cy, w: size, h }); cy += h; });
    } else {
      const splitX = equal ? size / 2 : size * 0.28;
      const splitY = equal ? size / 2 : size * 0.30;
      cells.push({ index: 0, x: x0, y: y0, w: splitX, h: splitY });
      cells.push({ index: 1, x: x0 + splitX, y: y0, w: size - splitX, h: splitY });
      cells.push({ index: 2, x: x0, y: y0 + splitY, w: splitX, h: size - splitY });
      cells.push({ index: 3, x: x0 + splitX, y: y0 + splitY, w: size - splitX, h: size - splitY });
    }

    return <svg class="fraction-svg fraction-square-svg" viewBox="0 0 220 184" role="img"
      aria-label={`A square split into ${parts} ${equal ? "equal" : "unequal"} parts`}>
      <defs><clipPath id={clipId}><rect x={x0} y={y0} width={size} height={size} rx="10" /></clipPath></defs>
      <g clip-path={`url(#${clipId})`}>
        {cells.map(cell => {
          const active = selected.includes(cell.index);
          return <g key={cell.index} class="fraction-part-group" data-equal={equal ? "true" : "false"} data-part={cell.index} onClick={() => togglePart(cell.index)}>
            <rect x={cell.x} y={cell.y} width={cell.w} height={cell.h} fill={active ? ART.neutralActive : ART.neutral} stroke={ART.stroke} stroke-width="3.5" />
            {active && <text x={cell.x + cell.w / 2} y={cell.y + cell.h / 2 + 7} text-anchor="middle" class="fraction-part-num">{cell.index + 1}</text>}
          </g>;
        })}
      </g>
      <rect x={x0} y={y0} width={size} height={size} rx="10" fill="none" stroke={ART.stroke} stroke-width="3.5" />
    </svg>;
  };

  return <SceneFrame
    chip="Compare the parts"
    caption={`Are all ${parts} parts the exact same size?`}
    suit={suit}
    solved={solved}
    class="fraction-scene"
    note={solved ? (equal ? `All ${parts} parts are equal.` : `These ${parts} parts are different sizes.`) : undefined}
  >
    {shape === "circle" ? renderCircle() : shape === "square" ? renderSquare() : renderBar()}
  </SceneFrame>;
}

/** 2. Shaded fraction of a shape (circle pie, fraction bar, or equal grid). */
function ShadedShapeDiagram({ question, suit, solved = false, onActivity }: SceneProps) {
  const clipId = useId();
  const shape = str(question, "shape", "circle");
  const denominator = Math.max(2, num(question, "denominator", 2));
  const numerator = Math.max(1, Math.min(denominator, num(question, "numerator", num(question, "part", 1))));
  const [counted, setCounted] = useState<number[]>([]);

  const toggleCount = (index: number) => {
    onActivity?.();
    setCounted(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index]);
  };

  const badgeNumber = (index: number): number | null => {
    if (solved) return index + 1;
    const pos = counted.indexOf(index);
    return pos >= 0 ? pos + 1 : null;
  };

  const renderCircle = () => {
    const cx = 110, cy = 98, r = 80;
    const step = 360 / denominator;
    return <svg class="fraction-svg fraction-circle-svg" viewBox="0 0 220 196" role="img"
      aria-label={`A circle with ${numerator} of ${denominator} equal parts shaded`}>
      {Array.from({ length: denominator }, (_, index) => {
        const shaded = index < numerator;
        const start = index * step;
        const end = (index + 1) * step;
        const pos = sliceLabelPoint(cx, cy, r, start, end);
        const badge = badgeNumber(index);
        return <g key={index} class="fraction-part-group" data-shaded={shaded ? "true" : "false"} onClick={() => toggleCount(index)}>
          <path d={pieSlicePath(cx, cy, r, start, end)}
            fill={shaded ? ART.gold : ART.surface}
            stroke={ART.stroke} stroke-width="3.5" stroke-linejoin="round" />
          {badge !== null && <>
            <circle cx={pos.x} cy={pos.y} r="14" fill={shaded ? ART.goldLight : ART.neutral} stroke={shaded ? ART.goldStroke : ART.stroke} stroke-width="2" />
            <text x={pos.x} y={pos.y + 6} text-anchor="middle" class="fraction-part-num">{badge}</text>
          </>}
        </g>;
      })}
    </svg>;
  };

  const renderBar = () => {
    const x0 = 24, y0 = 18, width = 412, height = 88;
    const partW = width / denominator;
    return <svg class="fraction-svg fraction-bar-svg" viewBox="0 0 460 124" role="img"
      aria-label={`A bar with ${numerator} of ${denominator} equal parts shaded`}>
      <defs><clipPath id={clipId}><rect x={x0} y={y0} width={width} height={height} rx="12" /></clipPath></defs>
      <g clip-path={`url(#${clipId})`}>
        {Array.from({ length: denominator }, (_, index) => {
          const shaded = index < numerator;
          const x = x0 + index * partW;
          const badge = badgeNumber(index);
          return <g key={index} class="fraction-part-group" data-shaded={shaded ? "true" : "false"} onClick={() => toggleCount(index)}>
            <rect x={x} y={y0} width={partW} height={height} fill={shaded ? ART.gold : ART.surface} />
            {badge !== null && <>
              <circle cx={x + partW / 2} cy={y0 + height / 2} r="15" fill={shaded ? ART.goldLight : ART.neutral} stroke={shaded ? ART.goldStroke : ART.stroke} stroke-width="2" />
              <text x={x + partW / 2} y={y0 + height / 2 + 6} text-anchor="middle" class="fraction-part-num">{badge}</text>
            </>}
          </g>;
        })}
        {Array.from({ length: denominator - 1 }, (_, index) => {
          const x = x0 + (index + 1) * partW;
          return <line key={`div-${index}`} x1={x} y1={y0} x2={x} y2={y0 + height} stroke={ART.stroke} stroke-width="3.5" />;
        })}
      </g>
      <rect x={x0} y={y0} width={width} height={height} rx="12" fill="none" stroke={ART.stroke} stroke-width="3.5" />
    </svg>;
  };

  const renderGrid = () => {
    const cols = 2;
    const rows = denominator === 4 ? 2 : 1;
    const cellW = denominator === 4 ? 78 : 112;
    const cellH = denominator === 4 ? 78 : 112;
    const totalW = cols * cellW;
    const totalH = rows * cellH;
    const x0 = (260 - totalW) / 2;
    const y0 = (188 - totalH) / 2;
    return <svg class="fraction-svg fraction-square-svg" viewBox="0 0 260 188" role="img"
      aria-label={`A shape grid with ${numerator} of ${denominator} equal squares shaded`}>
      <defs><clipPath id={clipId}><rect x={x0} y={y0} width={totalW} height={totalH} rx="10" /></clipPath></defs>
      <g clip-path={`url(#${clipId})`}>
        {Array.from({ length: denominator }, (_, index) => {
          const shaded = index < numerator;
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = x0 + col * cellW;
          const y = y0 + row * cellH;
          const badge = badgeNumber(index);
          return <g key={index} class="fraction-part-group" data-shaded={shaded ? "true" : "false"} onClick={() => toggleCount(index)}>
            <rect x={x} y={y} width={cellW} height={cellH} fill={shaded ? ART.gold : ART.surface} stroke={ART.stroke} stroke-width="3.5" />
            {badge !== null && <>
              <circle cx={x + cellW / 2} cy={y + cellH / 2} r="15" fill={shaded ? ART.goldLight : ART.neutral} stroke={shaded ? ART.goldStroke : ART.stroke} stroke-width="2" />
              <text x={x + cellW / 2} y={y + cellH / 2 + 6} text-anchor="middle" class="fraction-part-num">{badge}</text>
            </>}
          </g>;
        })}
      </g>
      <rect x={x0} y={y0} width={totalW} height={totalH} rx="10" fill="none" stroke={ART.stroke} stroke-width="3.5" />
    </svg>;
  };

  return <SceneFrame
    chip="Equal parts"
    caption="Tap the parts to count them"
    suit={suit}
    solved={solved}
    class="fraction-scene"
    note={solved
      ? <><b>{numerator}</b> shaded out of <b>{denominator}</b> equal parts = <b>{numerator}/{denominator}</b></>
      : counted.length > 0
        ? <>Counted <b>{counted.length}</b> {counted.length === 1 ? "part" : "parts"} — tap again to clear</>
        : <>Top number: shaded parts · Bottom number: all equal parts</>}
  >
    {shape === "bar" ? renderBar() : shape === "grid" && (denominator === 2 || denominator === 4) ? renderGrid() : renderCircle()}
  </SceneFrame>;
}

/** 3. Interactive sharing of SuitTokens into equal groups (fr.sets). */
function ShareSetDiagram({ question, suit, solved = false, reducedMotion = false, onActivity, onStep, onWorkComplete }: SceneProps) {
  const denominator = Math.max(2, num(question, "denominator", 2));
  const whole = Math.max(denominator, num(question, "whole", 8));
  const perGroup = Math.max(1, Math.floor(whole / denominator));
  const numerator = Math.max(1, Math.min(denominator, num(question, "numerator", 1)));
  const [rounds, setRounds] = useState(0);
  const roundsRef = useRef(0);
  const complete = rounds >= perGroup;

  const dealRound = () => {
    if (roundsRef.current >= perGroup || solved) return;
    onActivity?.();
    const next = Math.min(perGroup, roundsRef.current + 1);
    roundsRef.current = next;
    setRounds(next);
    onStep?.(next);
    if (next >= perGroup) onWorkComplete?.();
  };

  useEffect(() => {
    if (!solved || complete) return;
    const remaining = perGroup - rounds;
    const timer = window.setTimeout(() => {
      const next = reducedMotion || remaining > 5 ? perGroup : Math.min(perGroup, roundsRef.current + 1);
      roundsRef.current = next;
      setRounds(next);
    }, 340);
    return () => window.clearTimeout(timer);
  }, [solved, complete, rounds, perGroup, reducedMotion]);

  useEffect(() => {
    if (solved) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("button, input, select, textarea")) return;
      if (event.key === " ") { event.preventDefault(); dealRound(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [solved, perGroup, question.key]);

  const theme = SUIT_THEME[suit];
  const remaining = Math.max(0, whole - rounds * denominator);
  const width = 660;
  const trayGap = 16;
  const trayPad = 24;
  const trayW = (width - trayPad * 2 - trayGap * (denominator - 1)) / denominator;
  const trayY = 128;
  const trayH = 112;
  const highlightW = numerator * trayW + (numerator - 1) * trayGap;

  const topCols = Math.min(10, Math.max(1, whole));
  const topSpacing = Math.min(40, 520 / topCols);
  const groupCols = perGroup <= 4 ? 2 : 3;
  const groupRows = Math.ceil(perGroup / groupCols);

  const statusText = complete
    ? (numerator === 1
      ? `All shared! Count the ${theme.tokenPlural} in the gold group.`
      : `All shared! Count the ${theme.tokenPlural} in the ${numerator} gold groups.`)
    : rounds === 0
      ? `Need help? Press SHARE to give 1 to each of the ${denominator} groups.`
      : `${remaining} left to share`;

  return <SceneFrame
    chip="Share equally"
    caption={`${whole} ${theme.tokenPlural} · ${denominator} equal groups`}
    suit={suit}
    solved={solved}
    class="fraction-scene fraction-sets"
    action={{
      label: "SHARE",
      icon: "↓",
      done: complete,
      onTrigger: dealRound,
      status: statusText,
    }}
    note={solved
      ? <>Each equal group has <b>{perGroup}</b>.{numerator > 1 ? <> <b>{numerator}</b> groups have <b>{numerator * perGroup}</b>.</> : null}</>
      : undefined}
  >
    <svg class="fraction-svg fraction-sets-svg" viewBox={`0 0 ${width} 260`} role="img"
      aria-label={`${whole} ${theme.tokenPlural} shared into ${denominator} equal groups, ${rounds} in each group so far`}>
      {/* Top unshared pile */}
      <g class={complete ? "" : "fraction-part-group"} onClick={dealRound}>
        <rect x="44" y="8" width={width - 88} height="74" rx="16"
          fill={remaining ? ART.surface : ART.mintLight}
          stroke={remaining ? "#9cb7c4" : ART.mintStroke} stroke-width="2.5" stroke-dasharray={remaining ? "6 5" : undefined} />
        {remaining > 0
          ? Array.from({ length: remaining }, (_, index) => {
            const row = Math.floor(index / topCols);
            const col = index % topCols;
            const rowCount = Math.min(topCols, remaining - row * topCols);
            const startX = width / 2 - ((rowCount - 1) * topSpacing) / 2;
            const cy = remaining > topCols ? (row === 0 ? 31 : 59) : 45;
            return <SuitToken key={index} suit={suit} cx={startX + col * topSpacing} cy={cy} r={11.5} tone="primary" />;
          })
          : <text x={width / 2} y="51" text-anchor="middle" class="fraction-tray-done">All {whole} {theme.tokenPlural} shared equally!</text>}
      </g>

      {/* Highlight bracket over the target numerator group(s) */}
      <g>
        <rect x={trayPad - 5} y={trayY - 26} width={highlightW + 10} height={trayH + 34} rx="18"
          fill="rgba(240, 190, 79, 0.14)" stroke={ART.goldStroke} stroke-width="2.5" stroke-dasharray="6 4" />
        <rect x={trayPad + highlightW / 2 - 58} y={trayY - 36} width="116" height="22" rx="11" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
        <text x={trayPad + highlightW / 2} y={trayY - 21} text-anchor="middle" class="fraction-highlight-tag">{fractionWord(numerator, denominator)}</text>
      </g>

      {/* Equal group trays */}
      {Array.from({ length: denominator }, (_, groupIndex) => {
        const gx = trayPad + groupIndex * (trayW + trayGap);
        const isTarget = groupIndex < numerator;
        const cellW = (trayW - 24) / groupCols;
        const cellH = (trayH - 28) / Math.max(1, groupRows);
        return <g key={groupIndex} data-group={groupIndex} data-target={isTarget ? "true" : "false"}>
          <rect x={gx} y={trayY} width={trayW} height={trayH} rx="14"
            fill={isTarget ? ART.goldLight : ART.surface}
            stroke={isTarget ? ART.goldStroke : "#7ea0b0"} stroke-width={isTarget ? "3" : "2.5"} />
          {Array.from({ length: rounds }, (_, itemIndex) => {
            const col = itemIndex % groupCols;
            const row = Math.floor(itemIndex / groupCols);
            const cx = gx + 12 + col * cellW + cellW / 2;
            const cy = trayY + 14 + row * cellH + cellH / 2;
            return <SuitToken key={itemIndex} suit={suit} cx={cx} cy={cy} r={perGroup > 6 ? 9 : 11}
              tone={isTarget ? "highlight" : "primary"} dataToken="shared" />;
          })}
          {solved && <text x={gx + trayW / 2} y={trayY + trayH - 6} text-anchor="middle" class="fraction-group-count">{rounds}</text>}
        </g>;
      })}
    </svg>
  </SceneFrame>;
}

/** 4. Equivalent fractions side-by-side Fraction Wall (fr.equivalent). */
function EquivalentWallDiagram({ question, suit, solved = false }: SceneProps) {
  const clipTop = useId();
  const clipBottom = useId();
  const n1 = Math.max(1, num(question, "numerator", num(question, "part", 2)));
  const d1 = Math.max(2, num(question, "denominator", 4));
  const n2 = Math.max(1, num(question, "numerator2", 1));
  const d2 = Math.max(2, num(question, "denominator2", 2));
  const same = n1 * d2 === n2 * d1;

  const barX = 96;
  const barW = 416;
  const topY = 20;
  const bottomY = 114;
  const barH = 60;
  const edge1 = barX + (n1 / d1) * barW;
  const edge2 = barX + (n2 / d2) * barW;

  const renderWallBar = (y: number, numerator: number, denominator: number, fill: string, clipId: string) => {
    const partW = barW / denominator;
    return <g>
      <defs><clipPath id={clipId}><rect x={barX} y={y} width={barW} height={barH} rx="10" /></clipPath></defs>
      <g clip-path={`url(#${clipId})`}>
        {Array.from({ length: denominator }, (_, index) => (
          <rect key={index} x={barX + index * partW} y={y} width={partW} height={barH}
            fill={index < numerator ? fill : ART.surface}
            data-shaded={index < numerator ? "true" : "false"} />
        ))}
        {Array.from({ length: denominator - 1 }, (_, index) => {
          const x = barX + (index + 1) * partW;
          return <line key={`d-${index}`} x1={x} y1={y} x2={x} y2={y + barH} stroke={ART.stroke} stroke-width="3" />;
        })}
      </g>
      <rect x={barX} y={y} width={barW} height={barH} rx="10" fill="none" stroke={ART.stroke} stroke-width="3.5" />
    </g>;
  };

  return <SceneFrame
    chip="Fraction wall"
    caption="Both whole bars are the exact same length"
    suit={suit}
    solved={solved}
    class="fraction-scene"
    note={solved
      ? (same ? "The shaded edges line up! Both fractions cover the same amount." : "The shaded edges do not line up. They are different amounts.")
      : "Follow the dotted line to see if both shaded parts end in the same place."}
  >
    <svg class="fraction-svg fraction-wall-svg" viewBox="0 0 540 196" role="img"
      aria-label={`Fraction wall comparing ${n1}/${d1} and ${n2}/${d2}`}>
      <StackedFractionSvg x={46} y={topY + barH / 2} numerator={n1} denominator={d1} color={ART.goldStroke} />
      {renderWallBar(topY, n1, d1, ART.gold, clipTop)}

      <StackedFractionSvg x={46} y={bottomY + barH / 2} numerator={n2} denominator={d2} color={ART.skyStroke} />
      {renderWallBar(bottomY, n2, d2, ART.sky, clipBottom)}

      <line class="fraction-guide-line" x1={edge1} y1={topY - 8} x2={edge1} y2={bottomY + barH + 8}
        stroke={solved && same ? ART.mintStroke : ART.stroke} stroke-width="3" stroke-dasharray="6 5" />
      <circle cx={edge1} cy={topY + barH} r="5" fill={ART.goldStroke} />

      {!same && <>
        <line class="fraction-guide-line" x1={edge2} y1={topY + barH + 10} x2={edge2} y2={bottomY + barH + 8}
          stroke={ART.skyStroke} stroke-width="3" stroke-dasharray="6 5" />
        <circle cx={edge2} cy={bottomY} r="5" fill={ART.skyStroke} />
        <line x1={Math.min(edge1, edge2) + 4} y1={topY + barH + 17} x2={Math.max(edge1, edge2) - 4} y2={topY + barH + 17}
          stroke={ART.stroke} stroke-width="2.5" stroke-linecap="round" />
      </>}
      {same && <circle cx={edge2} cy={bottomY} r="5" fill={solved ? ART.mintStroke : ART.skyStroke} />}
    </svg>
  </SceneFrame>;
}

/** 5. Fractions on a 0-to-1 number line with the hero (fr.line). */
function FractionNumberLineDiagram({ question, suit, solved = false }: SceneProps) {
  const denominator = Math.max(2, num(question, "denominator", 4));
  const numerator = Math.max(1, Math.min(denominator - 1, num(question, "numerator", num(question, "part", 1))));
  const width = 660;
  const margin = 64;
  const span = width - margin * 2;
  const lineY = 122;
  const posX = (step: number) => margin + (step / denominator) * span;
  const targetX = posX(numerator);

  return <SceneFrame
    chip="Fraction line"
    caption={`${denominator} equal jumps from 0 to 1`}
    suit={suit}
    solved={solved}
    showHero={false}
    class="fraction-scene"
  >
    <svg class="fraction-svg fraction-line-svg" viewBox={`0 0 ${width} 196`} role="img"
      aria-label={`Number line from 0 to 1 split into ${denominator} equal parts with ${HERO_NAMES[suit]} at ${numerator}/${denominator}`}>
      <line x1={margin} y1={lineY} x2={width - margin} y2={lineY} stroke={ART.track} stroke-width="10" stroke-linecap="round" />
      <line x1={margin} y1={lineY} x2={targetX} y2={lineY} stroke={ART.gold} stroke-width="10" stroke-linecap="round" />

      {Array.from({ length: numerator }, (_, index) => {
        const from = posX(index);
        const to = posX(index + 1);
        return <path key={`hop-${index}`} d={`M ${from} ${lineY - 8} Q ${(from + to) / 2} ${lineY - 56} ${to} ${lineY - 8}`}
          fill="none" stroke={ART.goldStroke} stroke-width="3.5" stroke-dasharray="6 5" stroke-linecap="round" />;
      })}

      {Array.from({ length: denominator + 1 }, (_, index) => {
        const x = posX(index);
        const isEnd = index === 0 || index === denominator;
        const isTarget = index === numerator;
        return <g key={index}>
          <line x1={x} y1={lineY - (isEnd ? 15 : 11)} x2={x} y2={lineY + (isEnd ? 15 : 11)}
            stroke={ART.stroke} stroke-width={isEnd ? "4" : "3"} stroke-linecap="round" />
          <circle cx={x} cy={lineY} r={isTarget ? 11 : isEnd ? 8 : 6}
            fill={isTarget ? ART.gold : ART.surface} stroke={isTarget ? ART.goldStroke : ART.stroke} stroke-width="3" />
          {isEnd && <text x={x} y={lineY + 42} text-anchor="middle" class="svg-label">{index === 0 ? "0" : "1"}</text>}
          {!isEnd && isTarget && !solved && <text x={x} y={lineY + 44} text-anchor="middle" class="fraction-line-unknown">?</text>}
          {!isEnd && solved && <StackedFractionSvg x={x} y={lineY + 42} numerator={index} denominator={denominator} color={isTarget ? ART.goldStroke : "#5d7784"} />}
        </g>;
      })}

      <g transform={`translate(${targetX - 31} 36) scale(1.22)`}>
        <HeroCharacter suit={suit} />
      </g>
    </svg>
  </SceneFrame>;
}
