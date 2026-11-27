import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

/**
 * Light-mode scenes for Typing (clean monitor display) and Letter of the Day
 * (primary-school sky/midline/grass handwriting guide card).
 */
export function WritingScene({ question, suit, solved = false }: SceneProps) {
  if (question.activityId === "letters") {
    const isDigit = num(question, "digit", -1) >= 0;
    const glyph = str(question, "symbol", str(question, "letter", "a"));
    return <SceneFrame
      chip={isDigit ? "Number formation" : "Letter formation"}
      caption="Follow the sky, middle and grass lines"
      suit={suit}
      solved={solved}
      class="writing-scene"
    >
      <svg class="kit-svg letter-guide-svg" viewBox="0 0 360 156" role="img" aria-label={`Handwriting guide for ${glyph}`}>
        <rect x="16" y="12" width="328" height="132" rx="16" fill={ART.surface} stroke={ART.stroke} stroke-width="2.8" />
        {/* Sky line, dashed midline, grass baseline */}
        <line x1="36" y1="36" x2="324" y2="36" stroke={ART.sky} stroke-width="2.2" />
        <line x1="36" y1="78" x2="324" y2="78" stroke="#9eb8c4" stroke-width="2" stroke-dasharray="6 5" />
        <line x1="36" y1="120" x2="324" y2="120" stroke={ART.mint} stroke-width="2.8" />
        {/* Start dot + large letter */}
        <text x="180" y="118" text-anchor="middle" font-size="92" font-weight="800" fill={ART.ink} data-letter-glyph={glyph}>{glyph}</text>
        <circle cx="136" cy="48" r="6" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
      </svg>
    </SceneFrame>;
  }

  // Typing
  const isDictation = question.skillId === "ty.dictation";
  const word = str(question, "word");
  const chip = isDictation ? "Listen and type"
    : question.skillId === "ty.keys" ? "Find the key"
      : question.skillId === "ty.commands" ? "Robot command"
        : question.skillId === "ty.sentence" ? "Sentence typing"
          : "Word typing";

  return <SceneFrame
    chip={chip}
    caption={isDictation ? "Press the speaker to hear the word again" : "Take your time — accuracy comes first"}
    suit={suit}
    solved={solved}
    class="writing-scene"
  >
    <div class={`typing-screen ${solved ? "typing-screen-done" : ""}`} data-typing-screen="true">
      {isDictation && !solved
        ? <span class="tricky-listen">🔈 Listen and type the word</span>
        : <b>{word}</b>}
    </div>
  </SceneFrame>;
}
