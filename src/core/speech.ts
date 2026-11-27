export interface VoiceSettings {
  enabled: boolean;
  voiceName?: string;
  rate?: number;
}

const NOVELTY_VOICES = /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;

const isUK = (lang: string) => /^en[-_]GB$/i.test(lang);
const isEnglish = (lang: string) => /^en\b/i.test(lang);
const isNovelty = (name: string) => NOVELTY_VOICES.test(name);

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function availableVoices(): SpeechSynthesisVoice[] {
  if (!("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().sort((a, b) => {
    const aGB = isUK(a.lang) ? 0 : isEnglish(a.lang) ? 1 : 2;
    const bGB = isUK(b.lang) ? 0 : isEnglish(b.lang) ? 1 : 2;
    const aNov = isNovelty(a.name) ? 1 : 0;
    const bNov = isNovelty(b.name) ? 1 : 0;
    return aGB - bGB || aNov - bNov || a.name.localeCompare(b.name);
  });
}

export function chooseVoice(voices: SpeechSynthesisVoice[], preferred = "Daniel"): SpeechSynthesisVoice | undefined {
  const uk = voices.filter(v => isUK(v.lang));
  const matchesPreferred = (v: SpeechSynthesisVoice) =>
    v.name === preferred || v.name.startsWith(`${preferred} (`);
  return uk.find(v => matchesPreferred(v) && /enhanced|premium/i.test(v.name))
    ?? uk.find(matchesPreferred)
    ?? uk.find(v => !isNovelty(v.name))
    ?? uk[0]
    ?? voices.find(v => isEnglish(v.lang) && !isNovelty(v.name))
    ?? voices.find(v => isEnglish(v.lang));
}

/** Turn any raw maths symbols into natural spoken British English. */
export function cleanSpokenText(text: string): string {
  return text
    .replace(/□/g, "what")
    .replace(/\u2212/g, "take away")
    .replace(/×/g, "times")
    .replace(/÷/g, "divided by")
    .replace(/\s+/g, " ")
    .trim();
}

export function stopSpeaking(): void {
  activeUtterance = null;
  if (!("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  if (synth.speaking || synth.pending) synth.cancel();
}

export function speak(text: string, settings: VoiceSettings): Promise<void> {
  const spoken = cleanSpokenText(text);
  if (!settings.enabled || !("speechSynthesis" in window) || !spoken) return Promise.resolve();
  stopSpeaking();
  return new Promise(resolve => {
    try {
      const utterance = new SpeechSynthesisUtterance(spoken);
      const voices = availableVoices();
      const voice = chooseVoice(voices, settings.voiceName);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? "en-GB";
      utterance.rate = settings.rate ?? 0.9;
      utterance.pitch = 1;
      const done = () => {
        if (activeUtterance === utterance) activeUtterance = null;
        resolve();
      };
      utterance.onend = done;
      utterance.onerror = done;
      activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      // Some browser/OS combinations don't fire `end` if speech is unavailable.
      window.setTimeout(done, Math.max(1200, spoken.length * 95));
    } catch {
      resolve();
    }
  });
}
