import { cleanup, render } from "@testing-library/preact";
import { afterEach, describe, expect, it } from "vitest";
import { SUITS } from "../content/catalogue";
import { HERO_NAMES, HeroCharacter } from "./HeroCharacter";

afterEach(cleanup);

describe("mission crew art", () => {
  it("draws a distinct named character for every available suit", () => {
    for (const suit of SUITS) {
      const { container } = render(<svg><HeroCharacter suit={suit.id} /></svg>);
      expect(container.querySelector(`.captain-hop.hop-${suit.id}`)).toBeTruthy();
      expect(HERO_NAMES[suit.id].length).toBeGreaterThan(4);
      expect(container.querySelectorAll("circle, ellipse, path, rect").length).toBeGreaterThan(4);
      cleanup();
    }
  });
});
