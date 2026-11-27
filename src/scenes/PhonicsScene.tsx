import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const list = (q: SceneProps["question"], key: string) => Array.isArray(q.data[key]) ? q.data[key] as string[] : [];
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

/** Deterministically hatch a unique, friendly SVG alien from any alien word! */
function HatchedAlien({ word, hatched }: { word: string; hatched: boolean }) {
  let hash = 0;
  for (let i = 0; i < word.length; i++) hash = (hash * 31 + word.charCodeAt(i)) >>> 0;
  const palettes = [
    { body: "#82cfb2", stroke: "#2b6350" },
    { body: "#86bfe0", stroke: "#2c5f7d" },
    { body: "#c4a3de", stroke: "#5c3f78" },
    { body: "#f0be67", stroke: "#8a5f14" },
    { body: "#e89b8e", stroke: "#873e33" },
  ];
  const color = palettes[hash % palettes.length]!;
  const eyes = (hash % 3) + 1;
  const horns = (hash >> 3) % 2 === 0;

  return <svg class="kit-svg alien-hatch-svg" viewBox="0 0 180 140" role="img" aria-label={hatched ? `Friendly alien named ${word}` : "Wiggling alien egg"}>
    {!hatched ? <g data-alien-egg="true">
      <ellipse cx="90" cy="124" rx="34" ry="8" fill="rgba(0,0,0,.1)" />
      <path d="M 90 22 C 122 22 132 72 126 100 C 120 120 60 120 54 100 C 48 72 58 22 90 22 Z" fill={ART.goldLight} stroke={ART.goldStroke} stroke-width="3.2" />
      <circle cx="76" cy="58" r="7" fill={color.body} opacity="0.7" />
      <circle cx="106" cy="78" r="9" fill={color.body} opacity="0.7" />
      <path d="M 62 72 L 76 64 L 88 76 L 104 65 L 118 74" fill="none" stroke={ART.goldStroke} stroke-width="2.5" stroke-linejoin="round" />
    </g> : <g data-alien-hatched={word}>
      <ellipse cx="90" cy="126" rx="36" ry="8" fill="rgba(0,0,0,.12)" />
      {/* Cracked bottom shell */}
      <path d="M 52 104 L 66 96 L 78 106 L 90 95 L 102 106 L 114 96 L 128 104 C 124 122 56 122 52 104 Z" fill={ART.goldLight} stroke={ART.goldStroke} stroke-width="2.8" stroke-linejoin="round" />
      {/* Alien body */}
      {horns ? <>
        <path d="M 70 42 L 60 22 L 80 36 M 110 42 L 120 22 L 100 36" fill={ART.gold} stroke={color.stroke} stroke-width="2.5" stroke-linejoin="round" />
      </> : <>
        <line x1="74" y1="40" x2="64" y2="20" stroke={color.stroke} stroke-width="3" stroke-linecap="round" />
        <circle cx="64" cy="18" r="5" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
        <line x1="106" y1="40" x2="116" y2="20" stroke={color.stroke} stroke-width="3" stroke-linecap="round" />
        <circle cx="116" cy="18" r="5" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
      </>}
      <ellipse cx="90" cy="70" rx="32" ry="34" fill={color.body} stroke={color.stroke} stroke-width="3" />
      {Array.from({ length: eyes }, (_, i) => {
        const ex = eyes === 1 ? 90 : eyes === 2 ? 76 + i * 28 : 70 + i * 20;
        const ey = eyes === 3 && i === 1 ? 56 : 62;
        return <g key={i}>
          <circle cx={ex} cy={ey} r={eyes === 1 ? 11 : 7.5} fill="#fff" stroke={color.stroke} stroke-width="2" />
          <circle cx={ex} cy={ey} r={eyes === 1 ? 4.5 : 3.2} fill={ART.ink} />
        </g>;
      })}
      <path d="M 78 82 Q 90 92 102 82" fill="none" stroke={color.stroke} stroke-width="2.8" stroke-linecap="round" />
    </g>}
  </svg>;
}

/**
 * Light-mode synthetic phonics scenes for Sounds & Spelling, Alien Words, and Tricky Words.
 */
export function PhonicsScene({ question, suit, solved = false, onPlayPhoneme, hasPhoneme }: SceneProps & {
  onPlayPhoneme?: (grapheme: string, word?: string) => void;
  hasPhoneme?: (grapheme: string, word?: string) => boolean;
}) {
  const word = str(question, "word");
  const graphemes = list(question, "graphemes");

  if (question.activityId === "alien") {
    const grownupRead = Boolean(question.data.grownupRead);
    return <SceneFrame
      chip="Planet Zib"
      caption={solved ? `Say hello to ${word}!` : grownupRead ? "Sound out this alien word together" : "Listen closely to hatch the alien"}
      suit={suit}
      solved={solved}
      class="phonics-scene"
    >
      <HatchedAlien word={word || "zib"} hatched={solved || grownupRead} />
      {(grownupRead || solved) && <div class="phonics-word-display">✦ {word} ✦</div>}
      {(grownupRead || solved) && graphemes.length > 0 && (
        <div class="kit-sound-row">
          {graphemes.map((g, i) => {
            const recorded = hasPhoneme?.(g, word) ?? false;
            return <button key={`${g}-${i}`} class="kit-sound-tile" disabled={!recorded}
              aria-label={recorded ? `Play ${g} sound` : `${g} sound`}
              onClick={() => onPlayPhoneme?.(g, word)}>
              <b>{g}</b>
              <span class={g.length > 1 ? "sound-bar" : "sound-dot"} aria-hidden="true" />
            </button>;
          })}
        </div>
      )}
    </SceneFrame>;
  }

  if (question.activityId === "tricky") {
    const concealed = question.skillId === "tw.spell" && !solved;
    return <SceneFrame
      chip="Tricky word"
      caption={concealed ? "Listen carefully, then type the word" : "Look closely at the whole word"}
      suit={suit}
      solved={solved}
      class="phonics-scene"
    >
      <div class={`tricky-flashcard ${solved ? "tricky-done" : ""}`} data-tricky-card="true">
        {concealed ? <span class="tricky-listen">🔈 Listen and spell</span> : <b>{word}</b>}
      </div>
    </SceneFrame>;
  }

  // Sounds & Spelling (so.blend, so.segment, so.spelling, so.suffix)
  if (question.skillId === "so.suffix") {
    const suffix = str(question, "suffix");
    return <SceneFrame chip="Word endings" caption="Join the root word and the ending" suit={suit} solved={solved} class="phonics-scene">
      <div class="suffix-join">
        <span class="suffix-root">{word}</span>
        <span class="suffix-plus">+</span>
        <span class="suffix-end">-{suffix}</span>
        <span class="suffix-plus">=</span>
        <span class={`suffix-out ${solved ? "suffix-done" : ""}`}>{solved ? question.answer : "?"}</span>
      </div>
    </SceneFrame>;
  }

  const isBlank = question.skillId === "so.segment" && !solved;
  return <SceneFrame
    chip="Sound buttons"
    caption={isBlank ? "Listen to each sound and build the word" : "Blend the sounds from left to right"}
    suit={suit}
    solved={solved}
    class="phonics-scene"
  >
    <div class="kit-sound-row" data-sound-buttons="true">
      {graphemes.map((g, i) => {
        if (isBlank) {
          return <div key={i} class="kit-sound-tile kit-sound-blank"><b>?</b><span class="sound-dot" /></div>;
        }
        const recorded = hasPhoneme?.(g, word) ?? false;
        return <button key={`${g}-${i}`} class="kit-sound-tile" disabled={!recorded}
          aria-label={recorded ? `Play ${g} sound` : `${g} sound`}
          onClick={() => onPlayPhoneme?.(g, word)}>
          <b>{g}</b>
          <span class={g.length > 1 ? "sound-bar" : "sound-dot"} aria-hidden="true" />
        </button>;
      })}
    </div>
    <svg class="kit-svg blend-arrow-svg" viewBox="0 0 280 28" aria-hidden="true">
      <line x1="20" y1="14" x2="246" y2="14" stroke={ART.goldStroke} stroke-width="3.5" stroke-linecap="round" />
      <polygon points="244,7 260,14 244,21" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" stroke-linejoin="round" />
    </svg>
  </SceneFrame>;
}
