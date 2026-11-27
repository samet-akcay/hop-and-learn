import { cleanup, render } from "@testing-library/preact";
import { afterEach, describe, expect, it } from "vitest";
import { ACTIVITIES } from "../content/catalogue";
import { generateQuestion } from "../content/generate";
import { makeRng } from "../core/rng";
import { PhonicsScene } from "./PhonicsScene";
import { resolveScene } from "./registry";
import { SentenceScene } from "./SentenceScene";
import { WordsPictureScene } from "./WordsPictureScene";
import { WritingScene } from "./WritingScene";

afterEach(cleanup);

describe("Phase 5 Words & Language scenes", () => {
  it("resolves a unified scene component for every single one of the 31 activities", () => {
    for (const activity of ACTIVITIES) {
      const q = generateQuestion(activity.id, 2, makeRng(activity.id.length * 17));
      expect(resolveScene(q), activity.id).toBeTruthy();
    }
  });

  it("renders Zib speech bubble for fixit/mixups and Colourful Semantics slots for sentence builder", () => {
    const fixQ = generateQuestion("fixit", 2, makeRng(3), [], { skillId: "fx.past" });
    const fix = render(<SentenceScene question={fixQ} suit="space" level={2} />);
    expect(fix.container.querySelector(".zib-alien")).toBeTruthy();
    expect(fix.container.querySelector('[data-zib-sentence="true"]')).toBeTruthy();
    cleanup();

    const buildQ = generateQuestion("sentence", 2, makeRng(7), [], { skillId: "sw.4-slots" });
    const build = render(<SentenceScene question={buildQ} suit="dino" level={2} />);
    expect(build.container.querySelectorAll("[data-slot-kind]")).toHaveLength(4);
  });

  it("renders illustrated SVG cards for listen, wordsort, readmatch, and story with zero ◇ placeholders", () => {
    for (const [activityId, skillId] of [
      ["listen", "ld.position"],
      ["listen", "ld.quantity"],
      ["wordsort", "ws.groups"],
      ["readmatch", "rm.sentence"],
      ["story", "sm.order"],
    ] as const) {
      const q = generateQuestion(activityId, 2, makeRng(11), [], { skillId });
      const { container } = render(<WordsPictureScene question={q} suit="pond" level={2} />);
      expect(container.textContent).not.toContain("◇");
      expect(container.querySelector("svg, [data-story-panel]")).toBeTruthy();
      cleanup();
    }
  });

  it("hatches a unique SVG alien when solved and renders sound buttons for phonics", () => {
    const alienQ = generateQuestion("alien", 2, makeRng(19), [], { skillId: "al.hear" });
    const egg = render(<PhonicsScene question={alienQ} suit="robot" level={2} solved={false} />);
    expect(egg.container.querySelector('[data-alien-egg="true"]')).toBeTruthy();
    cleanup();

    const hatched = render(<PhonicsScene question={alienQ} suit="robot" level={2} solved={true} />);
    expect(hatched.container.querySelector(`[data-alien-hatched="${alienQ.data.word}"]`)).toBeTruthy();
    cleanup();

    const soundQ = generateQuestion("sounds", 2, makeRng(23), [], { skillId: "so.blend" });
    const sounds = render(<PhonicsScene question={soundQ} suit="space" level={2} />);
    expect(sounds.container.querySelector('[data-sound-buttons="true"]')).toBeTruthy();
  });

  it("renders lined handwriting guides for letters and clean display cards for typing", () => {
    const letterQ = generateQuestion("letters", 2, makeRng(5), [], { skillId: "lt.letters" });
    const letter = render(<WritingScene question={letterQ} suit="speed" level={2} />);
    expect(letter.container.querySelector("svg.letter-guide-svg")).toBeTruthy();
    cleanup();

    const typeQ = generateQuestion("typing", 2, makeRng(9), [], { skillId: "ty.words" });
    const typing = render(<WritingScene question={typeQ} suit="webhero" level={2} />);
    expect(typing.container.querySelector('[data-typing-screen="true"]')).toBeTruthy();
  });
});
