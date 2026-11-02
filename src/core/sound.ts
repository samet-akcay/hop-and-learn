import type { AppSettings, SuitId } from "./types";

export type SfxName = "step" | "land" | "success" | "star" | "chime" | "tap";

export const SOUND_LIMITS = Object.freeze({ minFrequencyHz: 110, maxFrequencyHz: 700, filterHz: 2500, masterGain: 0.18, minimumAttackSeconds: 0.015 });

export function limitedFrequency(hz: number): number {
  return Math.min(SOUND_LIMITS.maxFrequencyHz, Math.max(SOUND_LIMITS.minFrequencyHz, hz));
}

const SUIT_TONES: Record<SuitId, Partial<Record<SfxName, number[]>>> = {
  space: { step: [260], land: [300, 220], success: [392, 494, 587], star: [494, 587], chime: [330], tap: [260] },
  robot: { step: [220], land: [247, 196], success: [330, 392, 494], star: [392, 494], chime: [294], tap: [220] },
  webhero: { step: [294], land: [247, 196], success: [349, 440, 523], star: [440, 523], chime: [294], tap: [247] },
  monster: { step: [164], land: [196, 147], success: [262, 330, 392], star: [330, 392], chime: [220], tap: [196] },
  speed: { step: [330], land: [294, 220], success: [392, 494, 587], star: [494, 587], chime: [349], tap: [294] },
  dino: { step: [196], land: [220, 164], success: [294, 370, 440], star: [370, 440], chime: [247], tap: [196] },
  pond: { step: [262], land: [294, 220], success: [349, 440, 523], star: [440, 523], chime: [294], tap: [262] },
};

let context: AudioContext | undefined;
let master: GainNode | undefined;
let filter: BiquadFilterNode | undefined;
const playing = new Map<SfxName, number>();

function getAudio(): { ctx: AudioContext; gain: GainNode } | null {
  const Constructor = window.AudioContext;
  if (!Constructor) return null;
  context ??= new Constructor();
  if (!master || !filter) {
    master = context.createGain();
    filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = SOUND_LIMITS.filterHz;
    master.gain.value = SOUND_LIMITS.masterGain;
    filter.connect(master);
    master.connect(context.destination);
  }
  if (context.state === "suspended") void context.resume();
  return { ctx: context, gain: master };
}

export function playSound(name: SfxName, suit: SuitId, settings: AppSettings): void {
  if (!settings.sound || settings.volume <= 0) return;
  const audio = getAudio();
  if (!audio) return;
  const now = performance.now();
  if ((playing.get(name) ?? 0) > now) return;
  playing.set(name, now + 120);
  audio.gain.gain.setTargetAtTime(Math.min(SOUND_LIMITS.masterGain, settings.volume), audio.ctx.currentTime, 0.03);
  const freqs = SUIT_TONES[suit][name] ?? [220];
  freqs.forEach((freq, i) => {
    const osc = audio.ctx.createOscillator();
    const env = audio.ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = limitedFrequency(freq);
    const start = audio.ctx.currentTime + i * 0.095;
    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(0.55, start + SOUND_LIMITS.minimumAttackSeconds);
    env.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    osc.connect(env);
    env.connect(filter!);
    osc.start(start);
    osc.stop(start + 0.24);
  });
}
