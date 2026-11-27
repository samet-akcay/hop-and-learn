import { describe, expect, it } from "vitest";
import { chooseVoice, cleanSpokenText } from "./speech";

const voice = (name: string, lang: string) => ({ name, lang } as SpeechSynthesisVoice);

describe("British speech voice selection", () => {
  it("chooses Daniel when the Mac provides him (including suffixed or Enhanced names)", () => {
    expect(chooseVoice([voice("Daniel", "en-GB"), voice("Alex", "en-US")])?.name).toBe("Daniel");
    expect(chooseVoice([voice("Eddy (English (UK))", "en_GB"), voice("Daniel (English (UK))", "en_GB")])?.name).toBe("Daniel (English (UK))");
    expect(chooseVoice([voice("Daniel", "en-GB"), voice("Daniel (Enhanced)", "en-GB")])?.name).toBe("Daniel (Enhanced)");
  });

  it("uses a natural British voice before novelty voices or American voices", () => {
    expect(chooseVoice([voice("Samantha", "en-US"), voice("Eddy (English (UK))", "en-GB"), voice("Kate", "en-GB")])?.name).toBe("Kate");
  });

  it("falls back to another English voice when no UK voice exists", () => {
    expect(chooseVoice([voice("Alex", "en-US")])?.name).toBe("Alex");
  });

  it("turns raw maths symbols into natural spoken words", () => {
    expect(cleanSpokenText("47 = 30 + □")).toBe("47 = 30 + what");
    expect(cleanSpokenText("12 − 4")).toBe("12 take away 4");
    expect(cleanSpokenText("twenty-four")).toBe("twenty-four");
  });
});
