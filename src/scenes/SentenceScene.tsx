import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const num = (q: SceneProps["question"], key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: SceneProps["question"], key: string, fallback = "") => String(q.data[key] ?? fallback);

/** Friendly alien character Zib for Words activities, matching HeroCharacter's art style. */
export function ZibAlien({ x = 0, y = 0, scale = 1, happy = false }: { x?: number; y?: number; scale?: number; happy?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} class="zib-alien">
    <ellipse cx="30" cy="64" rx="18" ry="5" fill="rgba(0,0,0,.14)" />
    {/* Antennae */}
    <path d="M 22 18 Q 16 7 12 10" fill="none" stroke="#3c6b5e" stroke-width="3" stroke-linecap="round" />
    <circle cx="12" cy="10" r="4" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
    <path d="M 38 18 Q 44 7 48 10" fill="none" stroke="#3c6b5e" stroke-width="3" stroke-linecap="round" />
    <circle cx="48" cy="10" r="4" fill={ART.gold} stroke={ART.goldStroke} stroke-width="2" />
    {/* Body */}
    <ellipse cx="30" cy="40" rx="20" ry="22" fill="#82cfb2" stroke="#2d6352" stroke-width="2.8" />
    <ellipse cx="30" cy="45" rx="12" ry="10" fill="#b4e8d2" />
    {/* Three friendly eyes */}
    <circle cx="20" cy="31" r="5" fill="#fff" stroke="#2d6352" stroke-width="1.8" />
    <circle cx="30" cy="27" r="5.5" fill="#fff" stroke="#2d6352" stroke-width="1.8" />
    <circle cx="40" cy="31" r="5" fill="#fff" stroke="#2d6352" stroke-width="1.8" />
    <circle cx="20.5" cy="31" r="2.2" fill="#1d3946" />
    <circle cx="30" cy="27" r="2.4" fill="#1d3946" />
    <circle cx="39.5" cy="31" r="2.2" fill="#1d3946" />
    {/* Smile */}
    <path d={happy ? "M 21 43 Q 30 52 39 43" : "M 23 44 Q 30 49 37 44"} fill="none" stroke="#2d6352" stroke-width="2.5" stroke-linecap="round" />
    {/* Little feet */}
    <path d="M 22 60 L 18 65 M 38 60 L 42 65" stroke="#2d6352" stroke-width="4" stroke-linecap="round" />
  </g>;
}

const SLOT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  who: { bg: "#fdf0ec", border: "#d9826c", text: "#873926" },
  doing: { bg: "#fff7df", border: "#dca83c", text: "#7d5509" },
  describing: { bg: "#f9eef6", border: "#c783b5", text: "#753864" },
  what: { bg: "#ebf7ef", border: "#5da678", text: "#26613d" },
  where: { bg: "#e8f4fb", border: "#5aa0c4", text: "#215a78" },
  when: { bg: "#f2effb", border: "#9c82c7", text: "#4f3b78" },
};

/**
 * Light-mode Colourful Semantics & Zib Grammar scenes for Sentence Builder,
 * Fix the Sentence, and Zib's Mix-ups.
 */
export function SentenceScene({ question, suit, solved = false }: SceneProps) {
  if (question.activityId === "fixit" || question.activityId === "mixups") {
    const sentence = str(question, "sentence");
    const fixed = str(question, "fixed");
    const wrong = str(question, "wrong");
    const right = str(question, "right");
    const displayLine = solved ? (fixed || (wrong && right ? sentence.replace(wrong, right) : sentence)) : sentence;

    return <SceneFrame
      chip={question.activityId === "fixit" ? "Fix Zib's sentence" : "Zib's mix-up"}
      caption={solved ? "All fixed! Listen to how smooth it sounds." : "Help Zib spot and fix the tricky part"}
      suit={suit}
      solved={solved}
      showHero={false}
      class="sentence-scene"
    >
      <div class="zib-speech-row">
        <svg class="zib-avatar-svg" viewBox="0 0 60 70" role="img" aria-label="Zib the alien">
          <ZibAlien happy={solved} />
        </svg>
        <div class={`zib-bubble ${solved ? "zib-bubble-fixed" : ""}`} data-zib-sentence="true">
          <p>{displayLine}</p>
        </div>
      </div>
    </SceneFrame>;
  }

  // Sentence builder: choice grammar skills (sw.agree, sw.join, sw.because, sw.question)
  if (question.answerKind === "choice") {
    return <SceneFrame chip="Sentence check" caption="Read each sentence aloud to hear what fits" suit={suit} solved={solved} class="sentence-scene">
      <div class="zib-speech-row">
        <svg class="zib-avatar-svg" viewBox="0 0 60 70" role="img" aria-label="Zib the alien">
          <ZibAlien happy={solved} />
        </svg>
        <div class={`zib-bubble ${solved ? "zib-bubble-fixed" : ""}`}>
          <p>{solved ? question.model : str(question, "sentence", question.prompt)}</p>
        </div>
      </div>
    </SceneFrame>;
  }

  // Colourful Semantics tile builder
  const slotTypes = question.skillId === "sw.describe"
    ? ["who", "doing", "describing", "what", "where"]
    : ["who", "doing", "what", "where", "when"];
  const labels = slotTypes.slice(0, num(question, "slots", 4));
  const values: Record<string, string> = {
    who: str(question, "subject"),
    doing: str(question, "verb"),
    describing: str(question, "describing"),
    what: str(question, "object"),
    where: str(question, "place"),
    when: str(question, "when"),
  };

  return <SceneFrame
    chip="Colourful Semantics"
    caption={solved ? "Great sentence!" : "Pick a tile for each coloured slot below"}
    suit={suit}
    solved={solved}
    class="sentence-scene"
  >
    <div class="kit-slots" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>
      {labels.map(label => {
        const c = SLOT_COLORS[label] ?? SLOT_COLORS.what!;
        return <div key={label} class="kit-slot" data-slot-kind={label}
          style={{ background: c.bg, borderColor: c.border, color: c.text }}>
          <small>{label.toUpperCase()}</small>
          <b>{solved ? values[label] || "✓" : "?"}</b>
        </div>;
      })}
    </div>
  </SceneFrame>;
}
