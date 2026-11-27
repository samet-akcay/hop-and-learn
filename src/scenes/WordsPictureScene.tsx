import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const list = (q: SceneProps["question"], key: string) => Array.isArray(q.data[key]) ? q.data[key] as string[] : [];
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

/** Renders a real crisp SVG mini-illustration for common language & vocabulary phrases. */
function OptionIllustration({ label }: { label: string }) {
  const lower = label.toLowerCase();

  // Position & scene cards (Listen and Do / Read and Match)
  if (lower.includes("star") && lower.includes("box")) {
    const redStar = lower.includes("red star");
    const redBox = lower.includes("red box");
    const onBox = lower.includes(" on ");
    const starY = onBox ? 24 : 74;
    const boxY = onBox ? 44 : 20;
    return <svg viewBox="0 0 110 92" class="word-card-svg" aria-hidden="true">
      <rect x="28" y={boxY} width="54" height="34" rx="7" fill={redBox ? "#e67c6e" : ART.sky} stroke={ART.stroke} stroke-width="2.6" />
      <polygon points={`55,${starY - 12} 59,${starY - 3} 68,${starY - 2} 61,${starY + 4} 63,${starY + 13} 55,${starY + 8} 47,${starY + 13} 49,${starY + 4} 42,${starY - 2} 51,${starY - 3}`}
        fill={redStar ? "#e35b52" : ART.sky} stroke={ART.stroke} stroke-width="2.2" stroke-linejoin="round" />
    </svg>;
  }
  if (lower.includes("ball") && lower.includes("table")) {
    const bigBall = lower.includes("big ball");
    const redBall = lower.includes("red ball");
    const blueBall = lower.includes("blue ball");
    const under = lower.includes("under");
    const r = bigBall ? 15 : 10;
    const ballY = under ? 70 : 30;
    const tableW = lower.includes("small table") ? 50 : 76;
    const tableX = (110 - tableW) / 2;
    return <svg viewBox="0 0 110 92" class="word-card-svg" aria-hidden="true">
      <rect x={tableX} y="44" width={tableW} height="10" rx="4" fill="#c99b68" stroke="#6e4b26" stroke-width="2.4" />
      <line x1={tableX + 8} y1="54" x2={tableX + 8} y2="82" stroke="#6e4b26" stroke-width="4" stroke-linecap="round" />
      <line x1={tableX + tableW - 8} y1="54" x2={tableX + tableW - 8} y2="82" stroke="#6e4b26" stroke-width="4" stroke-linecap="round" />
      <circle cx="55" cy={ballY} r={r} fill={blueBall ? ART.sky : redBall ? "#e35b52" : ART.gold} stroke={ART.stroke} stroke-width="2.4" />
    </svg>;
  }
  if (lower.includes("book") && lower.includes("cup")) {
    const nextTo = lower.includes("next to");
    const cupOnBook = lower.includes("cup on book");
    return <svg viewBox="0 0 110 92" class="word-card-svg" aria-hidden="true">
      <rect x={nextTo ? 16 : 32} y={cupOnBook ? 54 : nextTo ? 42 : 56} width="42" height="26" rx="4" fill={ART.mint} stroke={ART.mintStroke} stroke-width="2.4" />
      <rect x={nextTo ? 68 : 42} y={cupOnBook ? 24 : nextTo ? 42 : 24} width="24" height="28" rx="4" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.4" />
      <path d={`M ${nextTo ? 92 : 66} ${cupOnBook ? 30 : nextTo ? 48 : 30} C ${nextTo ? 102 : 76} ${cupOnBook ? 30 : nextTo ? 48 : 30} ${nextTo ? 102 : 76} ${cupOnBook ? 44 : nextTo ? 62 : 44} ${nextTo ? 92 : 66} ${cupOnBook ? 44 : nextTo ? 62 : 44}`}
        fill="none" stroke={ART.goldStroke} stroke-width="2.6" />
    </svg>;
  }
  if (lower.includes("stars") || lower.includes("star")) {
    const count = lower.includes("two") ? 2 : 1;
    const red = lower.includes("red");
    return <svg viewBox="0 0 110 92" class="word-card-svg" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const cx = count === 2 ? 36 + i * 38 : 55;
        return <polygon key={i} points={`${cx},26 ${cx + 5},39 ${cx + 18},40 ${cx + 8},49 ${cx + 11},62 ${cx},55 ${cx - 11},62 ${cx - 8},49 ${cx - 18},40 ${cx - 5},39`}
          fill={red ? "#e35b52" : ART.sky} stroke={ART.stroke} stroke-width="2.4" stroke-linejoin="round" />;
      })}
    </svg>;
  }
  if (lower.includes("rocket") && lower.includes("moon")) {
    const big = lower.includes("big");
    const onMoon = lower.includes("on moon");
    const scale = big ? 1.15 : 0.78;
    return <svg viewBox="0 0 110 92" class="word-card-svg" aria-hidden="true">
      <circle cx={onMoon ? 55 : 74} cy={onMoon ? 60 : 50} r="22" fill={ART.goldLight} stroke={ART.goldStroke} stroke-width="2.5" />
      <g transform={`translate(${onMoon ? 55 : 32} ${onMoon ? 28 : 48}) scale(${scale})`}>
        <path d="M 0 -22 C 11 -10 11 8 8 16 H -8 C -11 8 -11 -10 0 -22 Z" fill={ART.sky} stroke={ART.skyStroke} stroke-width="2.6" />
        <circle cx="0" cy="-2" r="4.5" fill="#fff" stroke={ART.skyStroke} stroke-width="1.8" />
      </g>
    </svg>;
  }

  // Word sort single object cards
  if (lower === "train" || lower === "bus") {
    return <svg viewBox="0 0 110 80" class="word-card-svg" aria-hidden="true">
      <rect x="16" y="20" width="78" height="36" rx="8" fill={lower === "train" ? ART.sky : ART.gold} stroke={ART.stroke} stroke-width="2.6" />
      <rect x="24" y="28" width="18" height="14" rx="3" fill="#fff" stroke={ART.stroke} stroke-width="1.8" />
      <rect x="48" y="28" width="18" height="14" rx="3" fill="#fff" stroke={ART.stroke} stroke-width="1.8" />
      <circle cx="32" cy="58" r="8" fill={ART.stroke} /><circle cx="78" cy="58" r="8" fill={ART.stroke} />
    </svg>;
  }
  if (lower === "plane") {
    return <svg viewBox="0 0 110 80" class="word-card-svg" aria-hidden="true">
      <path d="M 16 44 L 86 30 L 94 38 L 62 46 L 46 66 L 38 66 L 46 48 L 22 50 Z" fill={ART.sky} stroke={ART.skyStroke} stroke-width="2.6" stroke-linejoin="round" />
    </svg>;
  }
  if (lower === "apple") {
    return <svg viewBox="0 0 110 80" class="word-card-svg" aria-hidden="true">
      <circle cx="55" cy="46" r="20" fill="#e06556" stroke="#852c21" stroke-width="2.6" />
      <path d="M 55 26 Q 58 14 66 16" fill="none" stroke="#5c4223" stroke-width="3" stroke-linecap="round" />
      <ellipse cx="64" cy="21" rx="8" ry="4" fill={ART.mint} stroke={ART.mintStroke} stroke-width="1.8" />
    </svg>;
  }
  if (lower === "hammer") {
    return <svg viewBox="0 0 110 80" class="word-card-svg" aria-hidden="true">
      <rect x="50" y="30" width="10" height="38" rx="4" fill="#c99b68" stroke="#6e4b26" stroke-width="2.4" />
      <rect x="30" y="16" width="50" height="18" rx="5" fill="#8ea7b5" stroke={ART.stroke} stroke-width="2.6" />
    </svg>;
  }
  if (lower === "chair") {
    return <svg viewBox="0 0 110 80" class="word-card-svg" aria-hidden="true">
      <path d="M 36 16 V 68 M 36 44 H 74 V 68" fill="none" stroke="#6e4b26" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>;
  }
  if (lower === "shoe") {
    return <svg viewBox="0 0 110 80" class="word-card-svg" aria-hidden="true">
      <path d="M 24 28 V 56 H 88 Q 88 44 68 42 L 50 28 Z" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.6" stroke-linejoin="round" />
    </svg>;
  }
  if (lower === "cup") {
    return <svg viewBox="0 0 110 80" class="word-card-svg" aria-hidden="true">
      <rect x="34" y="22" width="34" height="40" rx="6" fill={ART.mint} stroke={ART.mintStroke} stroke-width="2.6" />
      <path d="M 68 30 C 82 30 82 52 68 52" fill="none" stroke={ART.mintStroke} stroke-width="3.5" />
    </svg>;
  }

  // Fallback friendly badge icon (never a bare ◇ placeholder)
  return <svg viewBox="0 0 110 64" class="word-card-svg" aria-hidden="true">
    <rect x="26" y="12" width="58" height="40" rx="12" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="2.4" />
    <circle cx="55" cy="32" r="10" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.2" />
  </svg>;
}

/**
 * Illustrated visual scenes for Listen and Do, Word Sort, Read and Match, and Story Maker.
 */
export function WordsPictureScene({ question, suit, solved = false }: SceneProps) {
  // Quantity visual: ALL / SOME / NONE stars inside a box!
  if (question.activityId === "listen" && question.skillId === "ld.quantity") {
    const cards = [
      { id: "all", label: "all", inBox: 3, outBox: 0 },
      { id: "some", label: "some", inBox: 1, outBox: 2 },
      { id: "none", label: "none", inBox: 0, outBox: 3 },
    ];
    return <SceneFrame chip="Listen and look" caption="Check how many stars are inside each box" suit={suit} solved={solved} class="words-scene">
      <div class="word-picture-grid">
        {cards.map(card => (
          <div key={card.id} class={`word-picture-card ${solved && card.id === question.answer ? "word-card-hit" : ""}`} data-quantity-card={card.id}>
            <svg viewBox="0 0 120 90" class="word-card-svg" aria-label={`${card.label} stars in the box`}>
              <rect x="18" y="34" width="84" height="46" rx="10" fill={ART.skyLight} stroke={ART.skyStroke} stroke-width="2.6" />
              {Array.from({ length: card.inBox }, (_, i) => {
                const cx = 38 + i * 22;
                return <circle key={`in-${i}`} cx={cx} cy="57" r="8" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.2" />;
              })}
              {Array.from({ length: card.outBox }, (_, i) => {
                const cx = 38 + i * 24;
                return <circle key={`out-${i}`} cx={cx} cy="17" r="8" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2.2" />;
              })}
            </svg>
            <b>{card.label}</b>
          </div>
        ))}
      </div>
    </SceneFrame>;
  }

  // Story Maker: First / Next / Last comic strip
  if (question.activityId === "story") {
    const sequence = list(question, "sequence");
    const scrambled = list(question, "scrambled");
    const panels = solved || !scrambled.length ? sequence : scrambled;
    const labels = panels.length === 3 ? ["First", "Next", "Last"] : ["First", "Next", "Then", "Last"];
    return <SceneFrame chip="Story panels" caption={solved ? "What a great story!" : "Think about what happens first, next and last"} suit={suit} solved={solved} class="words-scene">
      <div class="story-comic-row">
        {panels.map((line, i) => (
          <div key={`${line}-${i}`} class={`story-comic-card ${solved ? "story-comic-done" : ""}`} data-story-panel={i}>
            <span class="story-comic-tag">{solved || !scrambled.length ? labels[i] : `Card ${i + 1}`}</span>
            <b>{line}</b>
          </div>
        ))}
      </div>
    </SceneFrame>;
  }

  // Illustrated option cards for listen / wordsort / readmatch
  const options = list(question, "options");
  if (options.length > 0) {
    return <SceneFrame
      chip={question.activityId === "listen" ? "Listen and do" : question.activityId === "wordsort" ? "Word sort" : "Read and match"}
      caption="Match the sentence to the right picture"
      suit={suit}
      solved={solved}
      class="words-scene"
    >
      <div class="word-picture-grid">
        {options.map((option, i) => (
          <div key={`${option}-${i}`} class={`word-picture-card ${solved && option === question.answer ? "word-card-hit" : ""}`} data-word-card={i}>
            <OptionIllustration label={option} />
            <b>{option}</b>
          </div>
        ))}
      </div>
    </SceneFrame>;
  }

  // Comprehension / Opposites / Describing highlight card
  return <SceneFrame
    chip={question.activityId === "listen" ? "Listen carefully" : question.activityId === "wordsort" ? "Word lab" : "Read and think"}
    caption={solved ? "Nice reading!" : "Use the clues in the words"}
    suit={suit}
    solved={solved}
    class="words-scene"
  >
    <div class="word-clue-card" data-clue-card="true">
      <p>{str(question, "prompt", question.prompt)}</p>
    </div>
  </SceneFrame>;
}
