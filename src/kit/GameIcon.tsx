import type { ActivityId } from "../core/types";
import { ART } from "./theme";

/**
 * Crisp illustrated mini SVG icons for the menu cards.
 * Uses the exact same calm palette and stroke weight as the in-game scenes.
 */
export function GameIcon({ activityId }: { activityId: ActivityId }) {
  return <svg class="game-icon-svg" viewBox="0 0 48 48" aria-hidden="true">
    {renderGlyph(activityId)}
  </svg>;
}

function renderGlyph(id: ActivityId) {
  const s = ART.stroke;
  switch (id) {
    case "numberline":
      return <>
        <line x1="6" y1="32" x2="42" y2="32" stroke="#8fb3c4" stroke-width="4" stroke-linecap="round" />
        <path d="M 12 28 Q 22 10 34 26" fill="none" stroke={ART.mintStroke} stroke-width="3" stroke-dasharray="4 3" stroke-linecap="round" />
        <circle cx="12" cy="32" r="4.5" fill={ART.surface} stroke={s} stroke-width="2.5" />
        <circle cx="24" cy="32" r="4.5" fill={ART.surface} stroke={s} stroke-width="2.5" />
        <circle cx="36" cy="32" r="5.5" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.5" />
      </>;
    case "bonds":
      return <>
        <rect x="6" y="13" width="36" height="22" rx="6" fill={ART.surface} stroke={s} stroke-width="2.5" />
        <line x1="6" y1="24" x2="42" y2="24" stroke={s} stroke-width="2" />
        {[12, 20, 28, 36].map((x, i) => <circle key={`t-${i}`} cx={x} cy="18.5" r="3" fill={ART.sky} stroke={ART.skyStroke} stroke-width="1.4" />)}
        {[12, 20].map((x, i) => <circle key={`b-${i}`} cx={x} cy="29.5" r="3" fill={ART.gold} stroke={ART.goldStroke} stroke-width="1.4" />)}
        {[28, 36].map((x, i) => <circle key={`e-${i}`} cx={x} cy="29.5" r="2.6" fill="none" stroke="#9fb8c4" stroke-width="1.5" stroke-dasharray="2 2" />)}
      </>;
    case "times":
      return <>
        {[[7, 8], [26, 8], [7, 26], [26, 26]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width="15" height="14" rx="4" fill={i < 3 ? ART.skyLight : ART.goldLight} stroke={i < 3 ? ART.skyStroke : ART.goldStroke} stroke-width="2" />
            <circle cx={x! + 4.8} cy={y! + 7} r="2.4" fill={i < 3 ? ART.sky : ART.gold} />
            <circle cx={x! + 10.2} cy={y! + 7} r="2.4" fill={i < 3 ? ART.sky : ART.gold} />
          </g>
        ))}
      </>;
    case "fractions":
      return <>
        <circle cx="24" cy="24" r="16" fill={ART.surface} stroke={s} stroke-width="2.8" />
        <path d="M 24 24 L 24 8 A 16 16 0 1 1 8 24 Z" fill={ART.gold} stroke={s} stroke-width="2.5" stroke-linejoin="round" />
        <line x1="24" y1="8" x2="24" y2="40" stroke={s} stroke-width="2.4" />
        <line x1="8" y1="24" x2="40" y2="24" stroke={s} stroke-width="2.4" />
      </>;
    case "placevalue":
      return <>
        <rect x="9" y="8" width="10" height="32" rx="3" fill={ART.mint} stroke={ART.mintStroke} stroke-width="2.2" />
        {[14, 20, 26, 32].map(y => <line key={y} x1="9" y1={y} x2="19" y2={y} stroke={ART.mintStroke} stroke-width="1.5" />)}
        <rect x="25" y="29" width="8" height="8" rx="2" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
        <rect x="35" y="29" width="8" height="8" rx="2" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
        <rect x="25" y="18" width="8" height="8" rx="2" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
      </>;
    case "compare":
      return <>
        <path d="M 24 38 L 17 42 H 31 Z" fill={s} />
        <line x1="24" y1="16" x2="24" y2="38" stroke={s} stroke-width="3" stroke-linecap="round" />
        <line x1="8" y1="22" x2="40" y2="14" stroke={s} stroke-width="3" stroke-linecap="round" />
        <circle cx="11" cy="28" r="6" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
        <circle cx="37" cy="20" r="5" fill={ART.sky} stroke={ART.skyStroke} stroke-width="2" />
      </>;
    case "money":
      return <>
        <circle cx="19" cy="26" r="11" fill="#d88f5b" stroke="#7d4721" stroke-width="2.4" />
        <circle cx="30" cy="21" r="11" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.4" />
        <text x="30" y="25" text-anchor="middle" font-size="12" font-weight="900" fill={ART.goldStroke}>£</text>
      </>;
    case "time":
      return <>
        <circle cx="24" cy="24" r="16" fill={ART.surface} stroke={s} stroke-width="2.8" />
        <path d="M 24 24 L 24 10 A 14 14 0 0 1 38 24 Z" fill={ART.goldLight} />
        <line x1="24" y1="24" x2="24" y2="13" stroke={ART.goldStroke} stroke-width="2.8" stroke-linecap="round" />
        <line x1="24" y1="24" x2="33" y2="24" stroke={s} stroke-width="3" stroke-linecap="round" />
        <circle cx="24" cy="24" r="2.5" fill={s} />
      </>;
    case "measure":
      return <>
        <rect x="7" y="24" width="34" height="13" rx="3" fill={ART.surface} stroke={s} stroke-width="2.4" />
        {[13, 19, 25, 31, 37].map((x, i) => <line key={x} x1={x} y1="24" x2={x} y2={i % 2 === 0 ? 31 : 28} stroke={s} stroke-width="2" />)}
        <rect x="8" y="12" width="22" height="8" rx="2" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
        <polygon points="30,12 37,16 30,20" fill="#e9d2a6" stroke={ART.goldStroke} stroke-width="2" stroke-linejoin="round" />
      </>;
    case "shapes":
      return <>
        <polygon points="18,9 30,30 6,30" fill={ART.mintLight} stroke={ART.mintStroke} stroke-width="2.5" stroke-linejoin="round" />
        <circle cx="32" cy="29" r="10" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="2.5" />
      </>;
    case "turns":
      return <>
        <path d="M 24 10 A 14 14 0 1 1 11 28" fill="none" stroke={ART.skyStroke} stroke-width="3.2" stroke-linecap="round" />
        <polygon points="24,5 32,12 22,15" fill={ART.gold} stroke={ART.goldStroke} stroke-width="1.8" stroke-linejoin="round" />
      </>;
    case "charts":
      return <>
        <rect x="9" y="24" width="8" height="15" rx="2" fill={ART.sky} stroke={ART.skyStroke} stroke-width="2" />
        <rect x="20" y="13" width="8" height="26" rx="2" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
        <rect x="31" y="19" width="8" height="20" rx="2" fill={ART.mint} stroke={ART.mintStroke} stroke-width="2" />
      </>;
    case "rover":
      return <>
        <rect x="7" y="7" width="34" height="34" rx="7" fill={ART.surface} stroke={s} stroke-width="2.4" />
        <line x1="18" y1="7" x2="18" y2="41" stroke="#c7d9e2" stroke-width="1.8" />
        <line x1="30" y1="7" x2="30" y2="41" stroke="#c7d9e2" stroke-width="1.8" />
        <line x1="7" y1="18" x2="41" y2="18" stroke="#c7d9e2" stroke-width="1.8" />
        <line x1="7" y1="30" x2="41" y2="30" stroke="#c7d9e2" stroke-width="1.8" />
        <circle cx="12.5" cy="35.5" r="3.5" fill={ART.mint} stroke={ART.mintStroke} stroke-width="1.6" />
        <polygon points="35.5,9.5 39,13 35.5,16.5 32,13" fill={ART.gold} stroke={ART.goldStroke} stroke-width="1.6" />
      </>;
    case "machine":
      return <>
        <rect x="13" y="13" width="22" height="22" rx="6" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="2.5" />
        <path d="M 5 24 H 13 M 35 24 H 43" stroke={s} stroke-width="3" stroke-linecap="round" />
        <circle cx="24" cy="24" r="5" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
      </>;
    case "spotbug":
      return <>
        <circle cx="21" cy="21" r="11" fill={ART.goldLight} stroke={s} stroke-width="2.8" />
        <line x1="29" y1="29" x2="40" y2="40" stroke={s} stroke-width="4" stroke-linecap="round" />
        <circle cx="21" cy="21" r="4" fill={ART.gold} stroke={ART.goldStroke} stroke-width="1.8" />
      </>;
    case "stories":
    case "story":
      return <>
        <rect x="8" y="10" width="16" height="28" rx="3" fill={ART.surface} stroke={s} stroke-width="2.4" />
        <rect x="24" y="10" width="16" height="28" rx="3" fill={ART.goldLight} stroke={s} stroke-width="2.4" />
        <line x1="12" y1="18" x2="20" y2="18" stroke={ART.skyStroke} stroke-width="2.2" stroke-linecap="round" />
        <line x1="12" y1="24" x2="20" y2="24" stroke={ART.skyStroke} stroke-width="2.2" stroke-linecap="round" />
        <circle cx="32" cy="22" r="4" fill={ART.gold} stroke={ART.goldStroke} stroke-width="1.8" />
      </>;
    case "sentence":
    case "fixit":
    case "readmatch":
    case "tricky":
    case "mixups":
      return <>
        <rect x="7" y="11" width="34" height="26" rx="7" fill={ART.surface} stroke={s} stroke-width="2.4" />
        <rect x="11" y="16" width="11" height="6" rx="3" fill="#df9b8b" />
        <rect x="25" y="16" width="12" height="6" rx="3" fill={ART.gold} />
        <rect x="11" y="26" width="15" height="6" rx="3" fill={ART.mint} />
        <rect x="29" y="26" width="8" height="6" rx="3" fill={ART.sky} />
      </>;
    case "sounds":
    case "alien":
      return <>
        <rect x="7" y="14" width="10" height="20" rx="4" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="2.2" />
        <rect x="19" y="14" width="10" height="20" rx="4" fill={ART.goldLight} stroke={ART.goldStroke} stroke-width="2.2" />
        <rect x="31" y="14" width="10" height="20" rx="4" fill={ART.mintLight} stroke={ART.mintStroke} stroke-width="2.2" />
      </>;
    default:
      return <>
        <rect x="9" y="9" width="30" height="30" rx="9" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="2.5" />
        <polygon points="24,15 26.8,21 33.2,21.8 28.5,26.2 29.8,32.5 24,29.4 18.2,32.5 19.5,26.2 14.8,21.8 21.2,21"
          fill={ART.gold} stroke={ART.goldStroke} stroke-width="1.8" stroke-linejoin="round" />
      </>;
  }
}
