import type { ComponentChildren } from "preact";
import type { SuitId } from "../core/types";
import { HeroAvatar } from "../activities/HeroCharacter";

export interface SceneFrameProps {
  /** Short uppercase badge in the header (e.g. "Equal parts", "Number bonds"). */
  chip: string;
  /** Helpful one-line subtitle beside the badge. */
  caption?: string;
  suit: SuitId;
  solved?: boolean;
  /** Show the mini hero buddy in the corner (set false when the hero is already on stage). */
  showHero?: boolean;
  /** Optional scene-specific class name. */
  class?: string;
  /** Primary SVG or visual diagram content. */
  children: ComponentChildren;
  /** Optional interactive step button (HOP, COUNT, GROUP, SHARE). */
  action?: {
    label: string;
    icon?: string;
    done: boolean;
    onTrigger: () => void;
    status: string;
  };
  /** Optional calm footer helper / solved breakdown line. */
  note?: ComponentChildren;
}

/**
 * Shared stage container for all rebuilt visual scenes.
 * Gives every game the same calm header, consistent hero presence,
 * and uniform interactive step bar.
 */
export function SceneFrame({
  chip,
  caption,
  suit,
  solved = false,
  showHero = true,
  class: className = "",
  children,
  action,
  note,
}: SceneFrameProps) {
  return <div class={`kit-scene suit-${suit} ${solved ? "kit-solved" : ""} ${className}`}>
    <div class="kit-scene-head">
      <div class="scene-caption">
        <span class="scene-chip">{chip}</span>
        {caption && <span>{caption}</span>}
      </div>
      {showHero && <div class={`kit-hero-buddy ${solved ? "celebrate" : ""}`} aria-hidden="true">
        <HeroAvatar suit={suit} class="kit-hero-avatar" />
        {solved && <span class="kit-hero-star">★</span>}
      </div>}
    </div>

    <div class="kit-scene-stage">{children}</div>

    {action && !solved && <div class="work-control">
      {!action.done && <button class="work-button" onMouseDown={event => event.preventDefault()} onClick={action.onTrigger}>
        {action.label}{action.icon ? <span aria-hidden="true">{action.icon}</span> : null}
      </button>}
      <p aria-live="polite">{action.status}</p>
    </div>}

    {note && <div class="kit-scene-note">{note}</div>}
  </div>;
}
