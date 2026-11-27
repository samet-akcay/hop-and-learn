import type { GeneratedQuestion, Level, SuitId } from "../core/types";
import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import { resolveScene } from "../scenes/registry";

interface Props {
  question: GeneratedQuestion;
  suit: SuitId;
  level: Level;
  initialComplete?: boolean;
  initialSteps?: number;
  onActivity?: () => void;
  onStep?: (steps: number) => void;
  onPlayPhoneme?: (grapheme: string, word?: string) => void;
  hasPhoneme?: (grapheme: string, word?: string) => boolean;
  reducedMotion?: boolean;
  solved?: boolean;
  onWorkComplete: () => void;
}

const num = (q: GeneratedQuestion, key: string, fallback = 0) => Number(q.data[key] ?? fallback);

export const WORK_VISUALS = ["numberline", "bonds", "array"];

export function QuestionScene({
  question,
  suit,
  level,
  onWorkComplete,
  onActivity,
  onStep,
  onPlayPhoneme,
  hasPhoneme,
  reducedMotion = false,
  initialComplete = false,
  initialSteps = 0,
  solved = false,
}: Props) {
  const Scene = resolveScene(question);
  if (Scene) {
    return <div class="scene-wrap">
      <Scene
        question={question}
        suit={suit}
        level={level}
        solved={solved}
        reducedMotion={reducedMotion}
        initialComplete={initialComplete}
        initialSteps={initialSteps}
        onActivity={onActivity}
        onStep={onStep}
        onWorkComplete={onWorkComplete}
        onPlayPhoneme={onPlayPhoneme}
        hasPhoneme={hasPhoneme}
      />
    </div>;
  }

  // Fallback for auxiliary picture sub-skills (e.g. nl.estimate, bd.subitise, tt.equal)
  return <div class="scene-wrap">
    <AuxPictureScene question={question} suit={suit} solved={solved} />
  </div>;
}

function AuxPictureScene({ question, suit, solved }: { question: GeneratedQuestion; suit: SuitId; solved: boolean }) {
  if (question.activityId === "numberline" && ["nl.scale", "nl.estimate"].includes(question.skillId)) {
    const max = num(question, "max", 100);
    const target = num(question, "result");
    return <SceneFrame chip="Number line" caption="Use the labels to estimate the point" suit={suit} solved={solved}>
      <svg class="kit-svg estimate-line" viewBox="0 0 600 110" role="img" aria-label={`Marked point on a line from zero to ${max}`}>
        <line x1="30" y1="52" x2="570" y2="52" stroke={ART.track} stroke-width="8" stroke-linecap="round" />
        <circle cx={30 + (target / max) * 540} cy="52" r="10" fill={ART.gold} stroke={ART.goldStroke} stroke-width="3" />
        <text x="30" y="91" text-anchor="middle" class="svg-label">0</text>
        <text x="570" y="91" text-anchor="middle" class="svg-label">{max}</text>
      </svg>
    </SceneFrame>;
  }
  return <SceneFrame chip="Look closely" caption="Think through each step" suit={suit} solved={solved}>
    <div class="word-clue-card"><p>{question.prompt}</p></div>
  </SceneFrame>;
}
