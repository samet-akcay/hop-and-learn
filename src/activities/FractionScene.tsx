import { useEffect, useId, useRef, useState } from "preact/hooks";
import type { GeneratedQuestion, SuitId } from "../core/types";
import { HERO_NAMES, HeroCharacter } from "./HeroCharacter";

export interface FractionSceneProps {
  question: GeneratedQuestion;
  suit: SuitId;
  solved?: boolean;
  reducedMotion?: boolean;
  onActivity?: () => void;
  onStep?: (steps: number) => void;
  onWorkComplete?: () => void;
}

const num = (q: GeneratedQuestion, key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: GeneratedQuestion, key: string, fallback = "") => String(q.data[key] ?? fallback);
const bool = (q: GeneratedQuestion, key: string, fallback = false) => Boolean(q.data[key] ?? fallback);

const SHADED_FILL = "#f0be4f";
const SHADED_STROKE = "#9b6d0d";
const SECOND_FILL = "#6bb5d6";
const SECOND_STROKE = "#2c6f8e";
const UNSHADED_FILL = "#ffffff";
const NEUTRAL_FILL = "#eaf4f9";
const NEUTRAL_ACTIVE = "#f6d887";
const LINE_STROKE = "#2c4a58";

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

function StackedFractionSvg({ x, y, numerator, denominator, color = LINE_STROKE }: {
  x: number; y: number; numerator: number; denominator: number; color?: string;
}) {
  return <g class="svg-stacked-fraction" fill={color}>
    <text x={x} y={y - 7} text-anchor="middle" font-size="22" font-weight="850">{numerator}</text>
    <line x1={x - 15} y1={y} x2={x + 15} y2={y} stroke={color} stroke-width="3" stroke-linecap="round" />
    <text x={x} y={y + 22} text-anchor="middle" font-size="22" font-weight="850">{denominator}</text>
  </g>;
}

export function FractionScene(props: FractionSceneProps) {
  const { question } = props;
  if (question.skillId === "fr.equal") return <EqualPartsDiagram question={question} solved={props.solved} onActivity={props.onActivity} />;
  if (question.skillId === "fr.shapes") return <ShadedShapeDiagram question={question} solved={props.solved} onActivity={props.onActivity} />;
  if (question.skillId === "fr.equivalent") return <EquivalentWallDiagram question={question} solved={props.solved} />;
  if (question.skillId === "fr.line") return <FractionNumberLineDiagram question={question} suit={props.suit} solved={props.solved} />;
  return <ShareSetDiagram {...props} />;
}

/** 1. Equal vs. unequal parts across bars, circles and squares. */
function EqualPartsDiagram({ question, solved = false, onActivity }: {
  question: GeneratedQuestion; solved?: boolean; onActivity?: () => void;
}) {
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
            <rect x={seg.x} y={y0} width={seg.w} height={height} fill={active ? NEUTRAL_ACTIVE : NEUTRAL_FILL} />
            {active && <text x={seg.x + seg.w / 2} y={y0 + height / 2 + 7} text-anchor="middle" class="fraction-part-num">{seg.index + 1}</text>}
          </g>;
        })}
        {segments.slice(1).map(seg => <line key={`div-${seg.index}`} x1={seg.x} y1={y0} x2={seg.x} y2={y0 + height} stroke={LINE_STROKE} stroke-width="3.5" />)}
      </g>
      <rect x={x0} y={y0} width={width} height={height} rx="12" fill="none" stroke={LINE_STROKE} stroke-width="3.5" />
    </svg>;
  };

  const renderCircle = () => {
    const cx = 110, cy = 96, r = 78;
    // For 2 unequal parts, use a classic off-center vertical chord cut.
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
              <rect x={piece.x} y={cy - r} width={piece.w} height={r * 2} fill={active ? NEUTRAL_ACTIVE : NEUTRAL_FILL} />
              {active && <text x={piece.labelX} y={cy + 7} text-anchor="middle" class="fraction-part-num">{piece.index + 1}</text>}
            </g>;
          })}
          <line x1={cutX} y1={cy - r} x2={cutX} y2={cy + r} stroke={LINE_STROKE} stroke-width="3.5" />
        </g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={LINE_STROKE} stroke-width="3.5" />
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
          <path d={pieSlicePath(cx, cy, r, wedge.start, wedge.end)} fill={active ? NEUTRAL_ACTIVE : NEUTRAL_FILL} stroke={LINE_STROKE} stroke-width="3.5" stroke-linejoin="round" />
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
            <rect x={cell.x} y={cell.y} width={cell.w} height={cell.h} fill={active ? NEUTRAL_ACTIVE : NEUTRAL_FILL} stroke={LINE_STROKE} stroke-width="3.5" />
            {active && <text x={cell.x + cell.w / 2} y={cell.y + cell.h / 2 + 7} text-anchor="middle" class="fraction-part-num">{cell.index + 1}</text>}
          </g>;
        })}
      </g>
      <rect x={x0} y={y0} width={size} height={size} rx="10" fill="none" stroke={LINE_STROKE} stroke-width="3.5" />
    </svg>;
  };

  return <div class="fraction-scene">
    <div class="scene-caption">
      <span class="scene-chip">Compare the parts</span>
      <span>Are all {parts} parts the exact same size?</span>
    </div>
    {shape === "circle" ? renderCircle() : shape === "square" ? renderSquare() : renderBar()}
    {solved && <div class="fraction-solved-note">
      {equal ? `All ${parts} parts are equal.` : `These ${parts} parts are different sizes.`}
    </div>}
  </div>;
}

/** 2. Shaded fraction of a shape (circle pie, fraction bar, or equal grid). */
function ShadedShapeDiagram({ question, solved = false, onActivity }: {
  question: GeneratedQuestion; solved?: boolean; onActivity?: () => void;
}) {
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
            fill={shaded ? SHADED_FILL : UNSHADED_FILL}
            stroke={LINE_STROKE} stroke-width="3.5" stroke-linejoin="round" />
          {badge !== null && <>
            <circle cx={pos.x} cy={pos.y} r="14" fill={shaded ? "#fff9e6" : "#e9f3f8"} stroke={shaded ? SHADED_STROKE : LINE_STROKE} stroke-width="2" />
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
            <rect x={x} y={y0} width={partW} height={height} fill={shaded ? SHADED_FILL : UNSHADED_FILL} />
            {badge !== null && <>
              <circle cx={x + partW / 2} cy={y0 + height / 2} r="15" fill={shaded ? "#fff9e6" : "#e9f3f8"} stroke={shaded ? SHADED_STROKE : LINE_STROKE} stroke-width="2" />
              <text x={x + partW / 2} y={y0 + height / 2 + 6} text-anchor="middle" class="fraction-part-num">{badge}</text>
            </>}
          </g>;
        })}
        {Array.from({ length: denominator - 1 }, (_, index) => {
          const x = x0 + (index + 1) * partW;
          return <line key={`div-${index}`} x1={x} y1={y0} x2={x} y2={y0 + height} stroke={LINE_STROKE} stroke-width="3.5" />;
        })}
      </g>
      <rect x={x0} y={y0} width={width} height={height} rx="12" fill="none" stroke={LINE_STROKE} stroke-width="3.5" />
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
            <rect x={x} y={y} width={cellW} height={cellH} fill={shaded ? SHADED_FILL : UNSHADED_FILL} stroke={LINE_STROKE} stroke-width="3.5" />
            {badge !== null && <>
              <circle cx={x + cellW / 2} cy={y + cellH / 2} r="15" fill={shaded ? "#fff9e6" : "#e9f3f8"} stroke={shaded ? SHADED_STROKE : LINE_STROKE} stroke-width="2" />
              <text x={x + cellW / 2} y={y + cellH / 2 + 6} text-anchor="middle" class="fraction-part-num">{badge}</text>
            </>}
          </g>;
        })}
      </g>
      <rect x={x0} y={y0} width={totalW} height={totalH} rx="10" fill="none" stroke={LINE_STROKE} stroke-width="3.5" />
    </svg>;
  };

  return <div class="fraction-scene">
    <div class="scene-caption">
      <span class="scene-chip">Equal parts</span>
      <span>Tap the parts to count them</span>
    </div>
    {shape === "bar" ? renderBar() : shape === "grid" && (denominator === 2 || denominator === 4) ? renderGrid() : renderCircle()}
    <div class="fraction-solved-note">
      {solved
        ? <><b>{numerator}</b> shaded out of <b>{denominator}</b> equal parts = <b>{numerator}/{denominator}</b></>
        : counted.length > 0
          ? <>Counted <b>{counted.length}</b> {counted.length === 1 ? "part" : "parts"} — tap again to clear</>
          : <>Top number: shaded parts · Bottom number: all equal parts</>}
    </div>
  </div>;
}

/** 3. Interactive sharing of counters into equal groups (fr.sets). */
function ShareSetDiagram({ question, suit, solved = false, reducedMotion = false, onActivity, onStep, onWorkComplete }: FractionSceneProps) {
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

  // Finish sharing smoothly when solved so he sees the completed equal groups.
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

  // Support Space key just like COUNT / GROUP in QuestionScene.
  useEffect(() => {
    if (solved) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("button, input, select, textarea")) return;
      if (event.key === " ") { event.preventDefault(); dealRound(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [solved, perGroup, question.key]);

  const remaining = Math.max(0, whole - rounds * denominator);
  const width = 660;
  const trayGap = 16;
  const trayPad = 24;
  const trayW = (width - trayPad * 2 - trayGap * (denominator - 1)) / denominator;
  const trayY = 128;
  const trayH = 112;
  const highlightW = numerator * trayW + (numerator - 1) * trayGap;

  // Layout for unshared tokens at the top (max 10 per row).
  const topCols = Math.min(10, Math.max(1, whole));
  const topSpacing = Math.min(38, 520 / topCols);

  // Layout for tokens inside each equal tray.
  const groupCols = perGroup <= 4 ? 2 : 3;
  const groupRows = Math.ceil(perGroup / groupCols);

  const tokenFill = (highlighted: boolean) => highlighted ? SHADED_FILL : SECOND_FILL;
  const tokenStroke = (highlighted: boolean) => highlighted ? SHADED_STROKE : SECOND_STROKE;

  return <div class={`fraction-scene fraction-sets suit-${suit}`}>
    <div class="scene-caption">
      <span class="scene-chip">Share equally</span>
      <span>{whole} counters · {denominator} equal groups</span>
    </div>
    <svg class="fraction-svg fraction-sets-svg" viewBox={`0 0 ${width} 260`} role="img"
      aria-label={`${whole} counters shared into ${denominator} equal groups, ${rounds} in each group so far`}>
      {/* Top unshared pile */}
      <g class={complete ? "" : "fraction-part-group"} onClick={dealRound}>
        <rect x="44" y="8" width={width - 88} height="74" rx="16"
          fill={remaining ? "#ffffff" : "#f2f8f5"}
          stroke={remaining ? "#9cb7c4" : "#87b999"} stroke-width="2.5" stroke-dasharray={remaining ? "6 5" : undefined} />
        {remaining > 0
          ? Array.from({ length: remaining }, (_, index) => {
            const row = Math.floor(index / topCols);
            const col = index % topCols;
            const rowCount = Math.min(topCols, remaining - row * topCols);
            const startX = width / 2 - ((rowCount - 1) * topSpacing) / 2;
            const cy = remaining > topCols ? (row === 0 ? 31 : 59) : 45;
            return <circle key={index} cx={startX + col * topSpacing} cy={cy} r="11"
              fill={SECOND_FILL} stroke={SECOND_STROKE} stroke-width="2.5" />;
          })
          : <text x={width / 2} y="51" text-anchor="middle" class="fraction-tray-done">All {whole} counters shared equally!</text>}
      </g>

      {/* Highlight bracket over the target numerator group(s) */}
      <g>
        <rect x={trayPad - 5} y={trayY - 26} width={highlightW + 10} height={trayH + 34} rx="18"
          fill="rgba(240, 190, 79, 0.14)" stroke={SHADED_STROKE} stroke-width="2.5" stroke-dasharray="6 4" />
        <rect x={trayPad + highlightW / 2 - 58} y={trayY - 36} width="116" height="22" rx="11" fill={SHADED_FILL} stroke={SHADED_STROKE} stroke-width="2" />
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
            fill={isTarget ? "#fffdf5" : "#ffffff"}
            stroke={isTarget ? SHADED_STROKE : "#7ea0b0"} stroke-width={isTarget ? "3" : "2.5"} />
          {Array.from({ length: rounds }, (_, itemIndex) => {
            const col = itemIndex % groupCols;
            const row = Math.floor(itemIndex / groupCols);
            const cx = gx + 12 + col * cellW + cellW / 2;
            const cy = trayY + 14 + row * cellH + cellH / 2;
            return <circle key={itemIndex} cx={cx} cy={cy} r={perGroup > 6 ? 9 : 11}
              fill={tokenFill(isTarget)} stroke={tokenStroke(isTarget)} stroke-width="2.5" data-token="shared" />;
          })}
          {solved && <text x={gx + trayW / 2} y={trayY + trayH - 6} text-anchor="middle" class="fraction-group-count">{rounds}</text>}
        </g>;
      })}
    </svg>

    {!solved && <div class="work-control">
      {!complete && <button class="work-button" onMouseDown={event => event.preventDefault()} onClick={dealRound}>
        SHARE <span aria-hidden="true">↓</span>
      </button>}
      <p aria-live="polite">
        {complete
          ? (numerator === 1
            ? "All shared! Count the counters in the gold group."
            : `All shared! Count the counters in the ${numerator} gold groups.`)
          : rounds === 0
            ? `Need help? Press SHARE to give 1 to each of the ${denominator} groups.`
            : `${remaining} left to share`}
      </p>
    </div>}
    {solved && <div class="fraction-solved-note">
      Each equal group has <b>{perGroup}</b>.{numerator > 1 ? <> <b>{numerator}</b> groups have <b>{numerator * perGroup}</b>.</> : null}
    </div>}
  </div>;
}

/** 4. Equivalent fractions side-by-side Fraction Wall (fr.equivalent). */
function EquivalentWallDiagram({ question, solved = false }: {
  question: GeneratedQuestion; solved?: boolean;
}) {
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
            fill={index < numerator ? fill : UNSHADED_FILL}
            data-shaded={index < numerator ? "true" : "false"} />
        ))}
        {Array.from({ length: denominator - 1 }, (_, index) => {
          const x = barX + (index + 1) * partW;
          return <line key={`d-${index}`} x1={x} y1={y} x2={x} y2={y + barH} stroke={LINE_STROKE} stroke-width="3" />;
        })}
      </g>
      <rect x={barX} y={y} width={barW} height={barH} rx="10" fill="none" stroke={LINE_STROKE} stroke-width="3.5" />
    </g>;
  };

  return <div class="fraction-scene">
    <div class="scene-caption">
      <span class="scene-chip">Fraction wall</span>
      <span>Both whole bars are the exact same length</span>
    </div>
    <svg class="fraction-svg fraction-wall-svg" viewBox="0 0 540 196" role="img"
      aria-label={`Fraction wall comparing ${n1}/${d1} and ${n2}/${d2}`}>
      <StackedFractionSvg x={46} y={topY + barH / 2} numerator={n1} denominator={d1} color={SHADED_STROKE} />
      {renderWallBar(topY, n1, d1, SHADED_FILL, clipTop)}

      <StackedFractionSvg x={46} y={bottomY + barH / 2} numerator={n2} denominator={d2} color={SECOND_STROKE} />
      {renderWallBar(bottomY, n2, d2, SECOND_FILL, clipBottom)}

      {/* Vertical alignment guide line(s) — neutral before solving so colour never gives the answer away */}
      <line class="fraction-guide-line" x1={edge1} y1={topY - 8} x2={edge1} y2={bottomY + barH + 8}
        stroke={solved && same ? "#2f7d4d" : LINE_STROKE} stroke-width="3" stroke-dasharray="6 5" />
      <circle cx={edge1} cy={topY + barH} r="5" fill={SHADED_STROKE} />

      {!same && <>
        <line class="fraction-guide-line" x1={edge2} y1={topY + barH + 10} x2={edge2} y2={bottomY + barH + 8}
          stroke={SECOND_STROKE} stroke-width="3" stroke-dasharray="6 5" />
        <circle cx={edge2} cy={bottomY} r="5" fill={SECOND_STROKE} />
        <line x1={Math.min(edge1, edge2) + 4} y1={topY + barH + 17} x2={Math.max(edge1, edge2) - 4} y2={topY + barH + 17}
          stroke={LINE_STROKE} stroke-width="2.5" stroke-linecap="round" />
      </>}
      {same && <circle cx={edge2} cy={bottomY} r="5" fill={solved ? "#2f7d4d" : SECOND_STROKE} />}
    </svg>
    <div class="fraction-solved-note">
      {solved
        ? (same ? "The shaded edges line up! Both fractions cover the same amount." : "The shaded edges do not line up. They are different amounts.")
        : "Follow the dotted line to see if both shaded parts end in the same place."}
    </div>
  </div>;
}

/** 5. Fractions on a 0-to-1 number line with the hero (fr.line). */
function FractionNumberLineDiagram({ question, suit, solved = false }: {
  question: GeneratedQuestion; suit: SuitId; solved?: boolean;
}) {
  const denominator = Math.max(2, num(question, "denominator", 4));
  const numerator = Math.max(1, Math.min(denominator - 1, num(question, "numerator", num(question, "part", 1))));
  const width = 660;
  const margin = 64;
  const span = width - margin * 2;
  const lineY = 122;
  const posX = (step: number) => margin + (step / denominator) * span;
  const targetX = posX(numerator);

  return <div class="fraction-scene">
    <div class="scene-caption">
      <span class="scene-chip">Fraction line</span>
      <span>{denominator} equal jumps from 0 to 1</span>
    </div>
    <svg class="fraction-svg fraction-line-svg" viewBox={`0 0 ${width} 196`} role="img"
      aria-label={`Number line from 0 to 1 split into ${denominator} equal parts with ${HERO_NAMES[suit]} at ${numerator}/${denominator}`}>
      {/* Base track and shaded progress */}
      <line x1={margin} y1={lineY} x2={width - margin} y2={lineY} stroke="#bed0d8" stroke-width="10" stroke-linecap="round" />
      <line x1={margin} y1={lineY} x2={targetX} y2={lineY} stroke={SHADED_FILL} stroke-width="10" stroke-linecap="round" />

      {/* Equal jump arcs from 0 to target */}
      {Array.from({ length: numerator }, (_, index) => {
        const from = posX(index);
        const to = posX(index + 1);
        return <path key={`hop-${index}`} d={`M ${from} ${lineY - 8} Q ${(from + to) / 2} ${lineY - 56} ${to} ${lineY - 8}`}
          fill="none" stroke={SHADED_STROKE} stroke-width="3.5" stroke-dasharray="6 5" stroke-linecap="round" />;
      })}

      {/* Tick marks */}
      {Array.from({ length: denominator + 1 }, (_, index) => {
        const x = posX(index);
        const isEnd = index === 0 || index === denominator;
        const isTarget = index === numerator;
        return <g key={index}>
          <line x1={x} y1={lineY - (isEnd ? 15 : 11)} x2={x} y2={lineY + (isEnd ? 15 : 11)}
            stroke={LINE_STROKE} stroke-width={isEnd ? "4" : "3"} stroke-linecap="round" />
          <circle cx={x} cy={lineY} r={isTarget ? 11 : isEnd ? 8 : 6}
            fill={isTarget ? SHADED_FILL : "#ffffff"} stroke={isTarget ? SHADED_STROKE : LINE_STROKE} stroke-width="3" />
          {isEnd && <text x={x} y={lineY + 42} text-anchor="middle" class="svg-label">{index === 0 ? "0" : "1"}</text>}
          {!isEnd && isTarget && !solved && <text x={x} y={lineY + 44} text-anchor="middle" class="fraction-line-unknown">?</text>}
          {!isEnd && solved && <StackedFractionSvg x={x} y={lineY + 42} numerator={index} denominator={denominator} color={isTarget ? SHADED_STROKE : "#5d7784"} />}
        </g>;
      })}

      {/* Hero standing on the target fraction */}
      <g transform={`translate(${targetX - 31} 36) scale(1.22)`}>
        <HeroCharacter suit={suit} />
      </g>
    </svg>
  </div>;
}
