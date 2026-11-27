import { SceneFrame } from "../kit/SceneFrame";
import { ART } from "../kit/theme";
import type { SceneProps } from "./types";

const list = (q: SceneProps["question"], key: string) => Array.isArray(q.data[key]) ? q.data[key] as string[] : [];

/**
 * Visual numbered flowchart cards for Steps in Order (algorithms / sequencing).
 */
export function StepsScene({ question, suit, solved = false }: SceneProps) {
  const sequence = list(question, "sequence");
  const scrambled = list(question, "scrambled");
  const shown = solved && sequence.length ? sequence : scrambled;

  return <SceneFrame
    chip="Steps in order"
    caption={solved ? "All steps in the right order!" : "Put these steps in order from first to last"}
    suit={suit}
    solved={solved}
    class="steps-scene"
  >
    <div class="steps-flow">
      {shown.map((step, i) => (
        <div class="steps-card-wrap" key={`${step}-${i}`}>
          <div class={`steps-card ${solved ? "steps-card-done" : ""}`} data-step-card={i}>
            <span class="steps-badge">{solved ? i + 1 : "?"}</span>
            <b>{step}</b>
          </div>
          {i < shown.length - 1 && <span class="steps-arrow" aria-hidden="true" style={{ color: ART.goldStroke }}>→</span>}
        </div>
      ))}
    </div>
  </SceneFrame>;
}
