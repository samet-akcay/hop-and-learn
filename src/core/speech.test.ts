import { describe, expect, it } from "vitest";
import { chooseVoice } from "./speech";

const voice = (name: string, lang: string) => ({ name, lang } as SpeechSynthesisVoice);

describe("British speech voice selection", () => {
  it("chooses Daniel when the Mac provides him", () => {
    expect(chooseVoice([voice("Daniel", "en-GB"), voice("Alex", "en-US")])?.name).toBe("Daniel");
  });
  it("uses another British voice before any American voice", () => {
    expect(chooseVoice([voice("Samantha", "en-US"), voice("Kate", "en-GB")])?.name).toBe("Kate");
  });
  it("falls back to another English voice when no UK voice exists", () => {
    expect(chooseVoice([voice("Alex", "en-US")])?.name).toBe("Alex");
  });
});
