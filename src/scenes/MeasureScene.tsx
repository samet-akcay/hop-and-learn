import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

/**
 * Illustrated SVG measuring instruments for all 4 Year 2 measurement skills:
 * - ms.ruler: centimetre ruler (0..20 cm) + pencil
 * - ms.scales: kitchen dial scale (0..20 g/kg) + parcel
 * - ms.jugs: graduated measuring jug (0..20 ml/l) + water level
 * - ms.temp: thermometer (0..40 °C) + mercury column
 */
export function MeasureScene({ question, suit, solved = false }: SceneProps) {
  const value = num(question, "length", 10);
  const unit = str(question, "unit", "cm");
  const thing = str(question, "thing", "pencil");

  if (unit === "g" || unit === "kg") {
    const max = 20;
    // Sweep dial from -135 deg (0) to +135 deg (20)
    const angle = -135 + (Math.min(max, Math.max(0, value)) / max) * 270;
    return <SceneFrame chip={`Weighing scale (${unit})`} caption={`Read where the pointer lands`} suit={suit} solved={solved} class="measure-scene">
      <svg class="kit-svg measure-dial-svg" viewBox="0 0 260 220" role="img" aria-label={`Weighing scale showing ${value} ${unit}`}>
        {/* Top weighing pan + parcel */}
        <path d="M 74 44 Q 130 58 186 44" fill="none" stroke={ART.stroke} stroke-width="4" stroke-linecap="round" />
        <line x1="130" y1="51" x2="130" y2="66" stroke={ART.stroke} stroke-width="5" />
        <rect x="96" y="14" width="68" height="32" rx="8" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.8" />
        <text x="130" y="35" text-anchor="middle" font-size="13" font-weight="850" fill="#4a3102">{thing}</text>

        {/* Scale body & dial */}
        <circle cx="130" cy="138" r="72" fill={ART.surface} stroke={ART.stroke} stroke-width="4" />
        {Array.from({ length: max + 1 }, (_, i) => {
          const deg = -135 + (i / max) * 270;
          const rad = ((deg - 90) * Math.PI) / 180;
          const isMajor = i % 5 === 0;
          const r1 = isMajor ? 53 : 60;
          const r2 = 66;
          const lx = 130 + Math.cos(rad) * 42;
          const ly = 138 + Math.sin(rad) * 42;
          return <g key={i}>
            <line x1={130 + Math.cos(rad) * r1} y1={138 + Math.sin(rad) * r1}
              x2={130 + Math.cos(rad) * r2} y2={138 + Math.sin(rad) * r2}
              stroke={ART.stroke} stroke-width={isMajor ? "3" : "1.8"} stroke-linecap="round" />
            {isMajor && <text x={lx} y={ly + 5} text-anchor="middle" font-size="13" font-weight="850" fill={ART.ink}>{i}</text>}
          </g>;
        })}
        <text x="130" y="188" text-anchor="middle" font-size="14" font-weight="850" fill={ART.muted}>{unit}</text>

        {/* Needle */}
        <g data-dial-value={value} transform={`rotate(${angle} 130 138)`}>
          <line x1="130" y1="146" x2="130" y2="82" stroke="#c84b31" stroke-width="4.5" stroke-linecap="round" />
        </g>
        <circle cx="130" cy="138" r="7.5" fill={ART.stroke} />
      </svg>
    </SceneFrame>;
  }

  if (unit === "ml" || unit === "l") {
    const max = 20;
    const jugTop = 26;
    const jugBottom = 186;
    const jugH = jugBottom - jugTop;
    const fillH = (Math.min(max, Math.max(0, value)) / max) * jugH;
    const fillY = jugBottom - fillH;
    return <SceneFrame chip={`Measuring jug (${unit})`} caption="Read the water line on the scale" suit={suit} solved={solved} class="measure-scene">
      <svg class="kit-svg measure-jug-svg" viewBox="0 0 260 212" role="img" aria-label={`Measuring jug filled to ${value} ${unit}`}>
        {/* Jug handle */}
        <path d="M 180 56 C 216 56 216 144 180 144" fill="none" stroke={ART.stroke} stroke-width="7" stroke-linecap="round" />
        {/* Water fill */}
        <rect x="64" y={fillY} width="114" height={fillH} rx="6" fill={ART.sky} opacity="0.72" data-jug-value={value} />
        <line x1="64" y1={fillY} x2="178" y2={fillY} stroke={ART.skyStroke} stroke-width="3" />
        {/* Jug glass outline with spout */}
        <path d="M 52 26 L 64 40 V 182 Q 64 190 74 190 H 168 Q 178 190 178 182 V 26 Z" fill="none" stroke={ART.stroke} stroke-width="3.5" stroke-linejoin="round" />
        {/* Graduated scale ticks */}
        {Array.from({ length: max + 1 }, (_, i) => {
          const y = jugBottom - (i / max) * jugH;
          const isMajor = i % 5 === 0;
          return <g key={i}>
            <line x1="64" y1={y} x2={isMajor ? 92 : 78} y2={y} stroke={ART.stroke} stroke-width={isMajor ? "2.6" : "1.6"} />
            {isMajor && <text x="100" y={y + 4.5} font-size="13" font-weight="850" fill={ART.ink}>{i} {unit}</text>}
          </g>;
        })}
      </svg>
    </SceneFrame>;
  }

  if (unit === "°C") {
    const max = 40;
    const scaleTop = 22;
    const scaleBottom = 162;
    const scaleH = scaleBottom - scaleTop;
    const fillH = (Math.min(max, Math.max(0, value)) / max) * scaleH;
    const fillY = scaleBottom - fillH;
    return <SceneFrame chip="Thermometer (°C)" caption="Read where the warm column stops" suit={suit} solved={solved} class="measure-scene">
      <svg class="kit-svg measure-temp-svg" viewBox="0 0 240 214" role="img" aria-label={`Thermometer showing ${value} degrees Celsius`}>
        {/* Tube body */}
        <rect x="92" y="14" width="24" height="162" rx="12" fill={ART.surface} stroke={ART.stroke} stroke-width="3" />
        {/* Mercury column & bulb */}
        <rect x="98" y={fillY} width="12" height={scaleBottom - fillY + 14} rx="5" fill="#e06748" data-temp-value={value} />
        <circle cx="104" cy="182" r="20" fill="#e06748" stroke={ART.stroke} stroke-width="3" />
        <circle cx="98" cy="176" r="5" fill="#fff" opacity="0.55" />
        {/* Tick marks */}
        {Array.from({ length: 9 }, (_, idx) => {
          const deg = idx * 5;
          const y = scaleBottom - (deg / max) * scaleH;
          const isMajor = deg % 10 === 0;
          return <g key={deg}>
            <line x1="118" y1={y} x2={isMajor ? 136 : 128} y2={y} stroke={ART.stroke} stroke-width={isMajor ? "2.6" : "1.8"} />
            {isMajor && <text x="142" y={y + 5} font-size="14" font-weight="850" fill={ART.ink}>{deg}°C</text>}
          </g>;
        })}
      </svg>
    </SceneFrame>;
  }

  // Default: cm ruler + pencil
  const cm = 28;
  const maxCm = 20;
  const width = maxCm * cm + 48;
  const tipX = 24 + value * cm;
  return <SceneFrame chip="Measure in cm" caption={`Line the ${thing} up with 0`} suit={suit} solved={solved} class="measure-scene">
    <svg class="kit-svg measure-svg" viewBox={`0 0 ${width} 122`} role="img" aria-label={`A ${thing} measuring ${value} centimetres on a ruler from 0 to 20`}>
      {/* Pencil */}
      <rect x="24" y="16" width={Math.max(12, value * cm - 18)} height="24" rx="4" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.4" />
      <rect x="24" y="16" width="12" height="24" rx="3" fill="#e39a8e" stroke={ART.goldStroke} stroke-width="2.2" />
      <polygon points={`${tipX - 18},16 ${tipX},28 ${tipX - 18},40`} fill="#f2dec0" stroke={ART.goldStroke} stroke-width="2.4" stroke-linejoin="round" />
      <polygon points={`${tipX - 6},24 ${tipX},28 ${tipX - 6},32`} fill={ART.stroke} />
      {solved && <line x1={tipX} y1="28" x2={tipX} y2="62" stroke={ART.mintStroke} stroke-width="2.5" stroke-dasharray="4 3" />}

      {/* Ruler */}
      <rect x="14" y="54" width={maxCm * cm + 20} height="54" rx="8" fill={ART.surface} stroke={ART.stroke} stroke-width="2.8" />
      {Array.from({ length: maxCm + 1 }, (_, i) => {
        const x = 24 + i * cm;
        const isMajor = i % 5 === 0;
        return <g key={i}>
          <line x1={x} y1="54" x2={x} y2={isMajor ? 74 : 66} stroke={ART.stroke} stroke-width={isMajor ? "2.6" : "1.8"} />
          <text x={x} y="96" text-anchor="middle" font-size="14" font-weight="800" fill={solved && i === value ? ART.goldStroke : ART.ink}>{i}</text>
        </g>;
      })}
    </svg>
  </SceneFrame>;
}
