export interface VoiceSettings {
  enabled: boolean;
  voiceName?: string;
  rate?: number;
}

export function availableVoices(): SpeechSynthesisVoice[] {
  if (!("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().sort((a, b) => {
    const aGB = /^en-GB$/i.test(a.lang) ? 0 : /^en/i.test(a.lang) ? 1 : 2;
    const bGB = /^en-GB$/i.test(b.lang) ? 0 : /^en/i.test(b.lang) ? 1 : 2;
    return aGB - bGB || a.name.localeCompare(b.name);
  });
}

export function chooseVoice(voices: SpeechSynthesisVoice[], preferred = "Daniel"): SpeechSynthesisVoice | undefined {
  return voices.find(v => v.name === preferred && /^en-GB$/i.test(v.lang))
    ?? voices.find(v => /^en-GB$/i.test(v.lang))
    ?? voices.find(v => /^en/i.test(v.lang));
}

export function stopSpeaking(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function speak(text: string, settings: VoiceSettings): Promise<void> {
  if (!settings.enabled || !("speechSynthesis" in window) || !text.trim()) return Promise.resolve();
  stopSpeaking();
  return new Promise(resolve => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = availableVoices();
      const voice = chooseVoice(voices, settings.voiceName);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? "en-GB";
      utterance.rate = settings.rate ?? 0.9;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
      // Some browser/OS combinations don't fire `end` if speech is unavailable.
      window.setTimeout(resolve, Math.max(1200, text.length * 95));
    } catch {
      resolve();
    }
  });
}
