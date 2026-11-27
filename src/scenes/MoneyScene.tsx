import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);

/** Regular n-sided polygon path centered at (cx, cy), used for 7-sided UK 20p/50p and 12-sided £1 coins. */
function polygonPoints(cx: number, cy: number, r: number, sides: number): string {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

/** Break any pence amount into real UK coins (largest first) for crisp visual display. */
export function decomposeUkCoins(pence: number): number[] {
  const denoms = [100, 50, 20, 10, 5, 2, 1];
  const coins: number[] = [];
  let left = Math.max(0, Math.round(pence));
  for (const coin of denoms) {
    while (left >= coin && coins.length < 8) {
      coins.push(coin);
      left -= coin;
    }
  }
  return coins;
}

/** Authentic illustrated UK coin (copper 1p/2p, silver 5p/10p, 7-sided 20p/50p, 12-sided £1). */
export function UkCoin({ value, cx, cy, scale = 1 }: { value: number; cx: number; cy: number; scale?: number }) {
  const isPound = value >= 100;
  const isHeptagon = value === 20 || value === 50;
  const isCopper = value === 1 || value === 2;
  const baseR = value === 1 ? 26 : value === 2 ? 32 : value === 5 ? 25 : value === 10 ? 31 : value === 20 ? 29 : value === 50 ? 35 : 34;
  const r = baseR * scale;

  const fill = isCopper ? "#d8905c" : isPound ? "#f0c24c" : "#dce6ec";
  const innerFill = isCopper ? "#e4a474" : isPound ? "#e5edf2" : "#edf3f7";
  const stroke = isCopper ? "#7f461f" : isPound ? "#8f6510" : "#4b6778";
  const label = isPound ? `£${Math.round(value / 100)}` : `${value}p`;

  return <g data-coin={value} transform={`translate(${cx} ${cy})`}>
    {isPound ? <>
      <polygon points={polygonPoints(0, 0, r, 12)} fill={fill} stroke={stroke} stroke-width="3" stroke-linejoin="round" />
      <circle cx="0" cy="0" r={r * 0.68} fill={innerFill} stroke={stroke} stroke-width="2" />
    </> : isHeptagon ? <>
      <polygon points={polygonPoints(0, 0, r, 7)} fill={fill} stroke={stroke} stroke-width="3" stroke-linejoin="round" />
      <polygon points={polygonPoints(0, 0, r * 0.8, 7)} fill={innerFill} stroke={stroke} stroke-width="1.2" opacity="0.7" />
    </> : <>
      <circle cx="0" cy="0" r={r} fill={fill} stroke={stroke} stroke-width="3" />
      <circle cx="0" cy="0" r={r * 0.8} fill={innerFill} stroke={stroke} stroke-width="1.2" opacity="0.7" />
    </>}
    <text x="0" y={7 * scale} text-anchor="middle" font-size={Math.round(18 * scale)} font-weight="900" fill={stroke}>{label}</text>
  </g>;
}

/**
 * Illustrated UK Coins scene supporting coin recognition, adding totals,
 * making amounts, finding change, and pounds & pence.
 */
export function MoneyScene({ question, suit, solved = false }: SceneProps) {
  const a = num(question, "a", 0);
  const b = num(question, "b", 0);
  const total = num(question, "total", a + b);
  const skill = question.skillId;

  if (skill === "mn.coins") {
    return <SceneFrame chip="UK coins" caption="Look at the shape, colour and number" suit={suit} solved={solved} class="coin-scene"
      note={solved ? <>This is a <b>{a}p</b> coin.</> : "Copper: 1p, 2p · Round silver: 5p, 10p · 7-sided: 20p, 50p"}>
      <svg class="kit-svg money-svg" viewBox="0 0 360 160" role="img" aria-label={`A UK ${a}p coin`}>
        <UkCoin value={a} cx={180} cy={80} scale={1.55} />
      </svg>
    </SceneFrame>;
  }

  if (skill === "mn.change") {
    const paid = a;
    const cost = b;
    const change = paid - cost;
    const barX = 48, barW = 464, barY = 120, barH = 38;
    const costW = Math.max(24, (cost / Math.max(1, paid)) * barW);
    return <SceneFrame chip="Find the change" caption={`Paid ${paid}p · Price ${cost}p`} suit={suit} solved={solved} class="coin-scene"
      note={solved ? <><b>{cost}p</b> + <b>{change}p</b> = <b>{paid}p</b></> : `Count up from ${cost}p to ${paid}p`}>
      <svg class="kit-svg money-svg" viewBox="0 0 560 184" role="img" aria-label={`Paid ${paid}p for an item costing ${cost}p`}>
        {/* Price tag & paid coin */}
        <rect x="64" y="18" width="166" height="68" rx="14" fill={ART.surface} stroke={ART.skyStroke} stroke-width="2.8" />
        <text x="147" y="42" text-anchor="middle" class="kit-pod-label" fill={ART.skyStroke}>PRICE TAG</text>
        <text x="147" y="72" text-anchor="middle" font-size="28" font-weight="900" fill={ART.ink}>{cost}p</text>

        <text x="275" y="60" text-anchor="middle" font-size="22" font-weight="800" fill={ART.muted}>Paid</text>
        <UkCoin value={paid} cx={370} cy={52} scale={1.05} />

        {/* Counting-up bar */}
        <rect x={barX} y={barY} width={barW} height={barH} rx="10" fill={ART.goldLight} stroke={ART.stroke} stroke-width="2.5" />
        <rect x={barX} y={barY} width={costW} height={barH} rx="10" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="2.5" />
        <text x={barX + costW / 2} y={barY + 25} text-anchor="middle" class="kit-bar-label" fill={ART.skyStroke}>{cost}p</text>
        <text x={barX + costW + (barW - costW) / 2} y={barY + 25} text-anchor="middle" class="kit-bar-label" fill={ART.goldStroke}>
          {solved ? `${change}p change` : "? change"}
        </text>
      </svg>
    </SceneFrame>;
  }

  if (skill === "mn.make" || skill === "mn.ways") {
    const coins = [...decomposeUkCoins(a), ...decomposeUkCoins(b)];
    return <SceneFrame chip="UK coins" caption={skill === "mn.ways" ? "Find another way to make the same amount" : "Make the target amount"} suit={suit} solved={solved} class="coin-scene"
      note={solved ? <>Total value: <b>{total}p</b></> : "Add the coin values together to match the price tag"}>
      <svg class="kit-svg money-svg" viewBox="0 0 560 156" role="img" aria-label={`Target price ${total}p`}>
        <rect x="44" y="34" width="160" height="86" rx="18" fill={ART.goldLight} stroke={ART.goldStroke} stroke-width="3" />
        <text x="124" y="60" text-anchor="middle" class="kit-pod-label" fill={ART.goldStroke}>TARGET</text>
        <text x="124" y="102" text-anchor="middle" font-size="36" font-weight="900" fill={ART.ink}>{total}p</text>

        <text x="240" y="88" text-anchor="middle" font-size="30" font-weight="900" fill={ART.muted}>=</text>

        {skill === "mn.ways" || solved
          ? coins.map((coin, index) => {
            const spacing = Math.min(84, 240 / Math.max(1, coins.length));
            const startX = 395 - ((coins.length - 1) * spacing) / 2;
            return <UkCoin key={`${coin}-${index}`} value={coin} cx={startX + index * spacing} cy={78} scale={0.98} />;
          })
          : <>
            <circle cx="330" cy="78" r="32" fill={ART.surface} stroke="#9fb8c4" stroke-width="3" stroke-dasharray="6 5" />
            <text x="330" y="88" text-anchor="middle" font-size="28" font-weight="900" fill={ART.goldStroke}>?</text>
            <text x="390" y="87" text-anchor="middle" font-size="28" font-weight="900" fill={ART.muted}>+</text>
            <circle cx="450" cy="78" r="32" fill={ART.surface} stroke="#9fb8c4" stroke-width="3" stroke-dasharray="6 5" />
            <text x="450" y="88" text-anchor="middle" font-size="28" font-weight="900" fill={ART.goldStroke}>?</text>
          </>}
      </svg>
    </SceneFrame>;
  }

  if (skill === "mn.pounds-pence") {
    const pounds = Math.floor(a / 100);
    const penceCoins = decomposeUkCoins(b);
    return <SceneFrame chip="Pounds and pence" caption={`£${pounds} and ${b}p`} suit={suit} solved={solved} class="coin-scene">
      <svg class="kit-svg money-svg" viewBox="0 0 560 150" role="img" aria-label={`${pounds} pound coins and ${b} pence`}>
        {Array.from({ length: pounds }, (_, i) => (
          <UkCoin key={`p-${i}`} value={100} cx={74 + i * 74} cy={76} scale={0.95} />
        ))}
        <text x={74 + pounds * 74 + 6} y={84} text-anchor="middle" font-size="28" font-weight="900" fill={ART.muted}>+</text>
        {penceCoins.map((coin, i) => (
          <UkCoin key={`c-${i}`} value={coin} cx={74 + pounds * 74 + 68 + i * 72} cy={76} scale={0.95} />
        ))}
      </svg>
    </SceneFrame>;
  }

  // Default mn.total: Coin A + Coin B = ?
  const coinsA = decomposeUkCoins(a);
  const coinsB = decomposeUkCoins(b);
  return <SceneFrame chip="UK coins" caption="Add the coin values" suit={suit} solved={solved} class="coin-scene"
    note={solved ? <><b>{a}p</b> + <b>{b}p</b> = <b>{total}p</b></> : "Start with the bigger coin and count on"}>
    <svg class="kit-svg money-svg" viewBox="0 0 560 156" role="img" aria-label={`${a}p coin plus ${b}p coin`}>
      {coinsA.map((c, i) => <UkCoin key={`a-${i}`} value={c} cx={136 + i * 68} cy={78} scale={1.2} />)}
      <text x="234" y="88" text-anchor="middle" font-size="34" font-weight="900" fill={ART.muted}>+</text>
      {coinsB.map((c, i) => <UkCoin key={`b-${i}`} value={c} cx={314 + i * 68} cy={78} scale={1.2} />)}
      <text x="404" y="88" text-anchor="middle" font-size="32" font-weight="900" fill={ART.muted}>=</text>
      <rect x="434" y="46" width="90" height="64" rx="16" fill={solved ? ART.mintLight : ART.goldLight} stroke={solved ? ART.mintStroke : ART.goldStroke} stroke-width="3" />
      <text x="479" y="88" text-anchor="middle" font-size="28" font-weight="900" fill={ART.ink}>{solved ? `${total}p` : "?"}</text>
    </svg>
  </SceneFrame>;
}
