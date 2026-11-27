import { SceneFrame } from "../kit/SceneFrame";
import { SuitToken } from "../kit/SuitToken";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const list = (q: SceneProps["question"], key: string) => Array.isArray(q.data[key]) ? q.data[key] as string[] : [];

function TallyMarks({ count, x, y }: { count: number; x: number; y: number }) {
  const gates = Math.floor(count / 5);
  const rem = count % 5;
  const gateW = 34;
  return <g>
    {Array.from({ length: gates }, (_, g) => {
      const gx = x + g * (gateW + 10);
      return <g key={`g-${g}`}>
        {[0, 1, 2, 3].map(s => (
          <line key={s} x1={gx + s * 7} y1={y - 12} x2={gx + s * 7} y2={y + 12} stroke={ART.stroke} stroke-width="3" stroke-linecap="round" />
        ))}
        <line x1={gx - 3} y1={y + 10} x2={gx + 24} y2={y - 10} stroke={ART.goldStroke} stroke-width="3" stroke-linecap="round" />
      </g>;
    })}
    {Array.from({ length: rem }, (_, s) => (
      <line key={`r-${s}`} x1={x + gates * (gateW + 10) + s * 7} y1={y - 12} x2={x + gates * (gateW + 10) + s * 7} y2={y + 12}
        stroke={ART.stroke} stroke-width="3" stroke-linecap="round" />
    ))}
  </g>;
}

const BAR_STYLES = [
  { fill: ART.sky, stroke: ART.skyStroke },
  { fill: ART.gold, stroke: ART.goldStroke },
  { fill: ART.mint, stroke: ART.mintStroke },
];

/**
 * Unified SVG Charts scene covering:
 * - ch.tally: tally chart with 5-gate bundles
 * - ch.pictogram: stacked SuitToken pictogram columns
 * - ch.block / ch.questions: crisp block bar chart with scale gridlines
 */
export function ChartsScene({ question, suit, solved = false }: SceneProps) {
  const names = list(question, "names");
  const counts = (question.data.counts as number[] | undefined) ?? [4, 2, 6];
  const maxVal = Math.max(...counts, 1);

  if (question.skillId === "ch.tally") {
    const rowH = 44;
    const svgH = names.length * rowH + 34;
    return <SceneFrame chip="Tally chart" caption="Each bundle with a slash is 5" suit={suit} solved={solved} class="chart-scene">
      <svg class="kit-svg chart-svg" viewBox={`0 0 460 ${svgH}`} role="img" aria-label="Tally chart">
        <rect x="16" y="10" width="428" height={svgH - 20} rx="14" fill={ART.surface} stroke={ART.stroke} stroke-width="2.6" />
        {names.map((name, i) => {
          const y = 36 + i * rowH;
          const count = counts[i] ?? 0;
          return <g key={name} data-tally-row={name}>
            {i > 0 && <line x1="16" y1={y - 22} x2="444" y2={y - 22} stroke="#d4e2e8" stroke-width="1.8" />}
            <text x="36" y={y + 5} font-size="16" font-weight="850" fill={ART.ink}>{name}</text>
            <TallyMarks count={count} x={150} y={y} />
            <text x="418" y={y + 5} text-anchor="end" font-size="16" font-weight="900" fill={ART.goldStroke}>{count}</text>
          </g>;
        })}
      </svg>
    </SceneFrame>;
  }

  if (question.skillId === "ch.pictogram") {
    const colW = 130;
    const startX = 45;
    const baseY = 178;
    const stepY = Math.min(18, 138 / Math.max(1, maxVal));
    return <SceneFrame chip="Pictogram" caption="Count the tokens in each column" suit={suit} solved={solved} class="chart-scene">
      <svg class="kit-svg chart-svg" viewBox="0 0 480 218" role="img" aria-label="Pictogram chart">
        <line x1="28" y1={baseY} x2="452" y2={baseY} stroke={ART.stroke} stroke-width="3" stroke-linecap="round" />
        {names.map((name, i) => {
          const cx = startX + i * colW + colW / 2;
          const count = counts[i] ?? 0;
          return <g key={name} data-picto-col={name}>
            {Array.from({ length: count }, (_, idx) => (
              <SuitToken key={idx} suit={suit} cx={cx} cy={baseY - 14 - idx * stepY} r={7.5} tone={i === 1 ? "highlight" : "primary"} />
            ))}
            <text x={cx} y={baseY - 18 - count * stepY} text-anchor="middle" font-size="14" font-weight="900" fill={ART.ink}>{count}</text>
            <text x={cx} y={baseY + 24} text-anchor="middle" font-size="15" font-weight="850" fill={ART.muted}>{name}</text>
          </g>;
        })}
      </svg>
    </SceneFrame>;
  }

  // Block / bar chart
  const baseY = 166;
  const maxH = 124;
  const barW = 68;
  const gap = 58;
  const totalW = names.length * barW + (names.length - 1) * gap;
  const startX = (460 - totalW) / 2;

  return <SceneFrame chip="Block chart" caption="Compare the height of each bar" suit={suit} solved={solved} class="chart-scene">
    <svg class="kit-svg chart-svg" viewBox="0 0 460 206" role="img" aria-label="Bar chart comparing cargo counts">
      {/* Subtle horizontal gridlines */}
      {[0.25, 0.5, 0.75, 1].map(frac => (
        <line key={frac} x1="42" y1={baseY - frac * maxH} x2="418" y2={baseY - frac * maxH} stroke="#dce8ee" stroke-width="1.8" stroke-dasharray="4 4" />
      ))}
      <line x1="42" y1={baseY} x2="418" y2={baseY} stroke={ART.stroke} stroke-width="3" stroke-linecap="round" />

      {names.map((name, i) => {
        const count = counts[i] ?? 0;
        const h = Math.max(16, (count / maxVal) * maxH);
        const x = startX + i * (barW + gap);
        const y = baseY - h;
        const palette = BAR_STYLES[i % BAR_STYLES.length]!;
        return <g key={name} data-bar={name}>
          <rect x={x} y={y} width={barW} height={h} rx="10" fill={palette.fill} stroke={palette.stroke} stroke-width="2.8" />
          <text x={x + barW / 2} y={y - 8} text-anchor="middle" font-size="16" font-weight="900" fill={ART.ink}>{count}</text>
          <text x={x + barW / 2} y={baseY + 24} text-anchor="middle" font-size="15" font-weight="850" fill={ART.muted}>{name}</text>
        </g>;
      })}
    </svg>
  </SceneFrame>;
}
