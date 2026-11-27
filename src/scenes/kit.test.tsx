import { cleanup, render, screen } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ACTIVITIES, SUITS } from "../content/catalogue";
import { makeRng } from "../core/rng";
import { GameIcon } from "../kit/GameIcon";
import { SuitToken } from "../kit/SuitToken";
import { SUIT_THEME } from "../kit/theme";
import { makeQuestion } from "../play/questions";
import { DEFAULT_PLAY_SETTINGS } from "../play/settings";
import { BondsScene } from "./BondsScene";
import { TimesScene } from "./TimesScene";
import { POLISHED_ACTIVITIES, resolveScene } from "./registry";

afterEach(cleanup);

describe("Core visual kit and rebuilt scenes", () => {
  it("renders an SVG token for every hero suit", () => {
    for (const suit of SUITS) {
      const { container } = render(<svg><SuitToken suit={suit.id} cx={20} cy={20} /></svg>);
      expect(container.querySelector("circle, rect, polygon, path"), suit.id).toBeTruthy();
      expect(SUIT_THEME[suit.id].tokenPlural.length).toBeGreaterThan(3);
      cleanup();
    }
  });

  it("renders an SVG menu icon for every activity", () => {
    for (const activity of ACTIVITIES) {
      const { container } = render(<GameIcon activityId={activity.id} />);
      expect(container.querySelector("svg.game-icon-svg"), activity.id).toBeTruthy();
      cleanup();
    }
  });

  it("resolves every polished activity to a dedicated scene component", () => {
    for (const activityId of POLISHED_ACTIVITIES) {
      const question = makeQuestion(activityId, DEFAULT_PLAY_SETTINGS, makeRng(11));
      expect(resolveScene(question), activityId).toBeTruthy();
    }
  });

  it("lets him count suit tokens into a ten-frame in BondsScene", async () => {
    const user = userEvent.setup();
    const onWorkComplete = vi.fn();
    const question = makeQuestion("bonds", { ...DEFAULT_PLAY_SETTINGS, bondsTo: 10 }, makeRng(4));
    const missing = Number(question.data.missing);
    const { container } = render(<BondsScene question={question} suit="dino" level={1} onWorkComplete={onWorkComplete} />);

    expect(container.querySelector("svg.bonds-svg")).toBeTruthy();
    expect(container.textContent).toContain("dino eggs");
    expect(container.querySelectorAll('[data-slot="empty"]')).toHaveLength(missing);

    for (let i = 0; i < missing; i++) {
      await user.click(screen.getByRole("button", { name: /^COUNT/ }));
    }
    expect(container.querySelectorAll('[data-slot="added"]')).toHaveLength(missing);
    expect(onWorkComplete).toHaveBeenCalledTimes(1);
  });

  it("lets him light up suit-themed equal pods one at a time in TimesScene", async () => {
    const user = userEvent.setup();
    const onWorkComplete = vi.fn();
    const question = makeQuestion("times", { ...DEFAULT_PLAY_SETTINGS, tables: [2] }, makeRng(9));
    const groups = Number(question.data.groups);
    const { container } = render(<TimesScene question={question} suit="speed" level={1} onWorkComplete={onWorkComplete} />);

    expect(container.querySelector("svg.times-svg")).toBeTruthy();
    expect(container.textContent).toContain("gold rings");
    expect(container.querySelectorAll("[data-pod]")).toHaveLength(groups);
    expect(container.querySelectorAll('[data-lit="true"]')).toHaveLength(0);

    for (let i = 0; i < groups; i++) {
      await user.click(screen.getByRole("button", { name: /^GROUP/ }));
    }
    expect(container.querySelectorAll('[data-lit="true"]')).toHaveLength(groups);
    expect(onWorkComplete).toHaveBeenCalledTimes(1);
  });
});
