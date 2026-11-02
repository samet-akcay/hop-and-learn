import { useEffect, useRef, useState } from "preact/hooks";
import { ACTIVITIES, ACTIVITY_BY_ID, SUITS } from "../content/catalogue";
import { AnswerInput } from "../activities/AnswerInput";
import { HERO_NAMES, HeroAvatar } from "../activities/HeroCharacter";
import { QuestionScene, WORK_VISUALS } from "../activities/QuestionScene";
import { makeRng } from "../core/rng";
import { playSound, type SfxName } from "../core/sound";
import { speak, stopSpeaking } from "../core/speech";
import { DEFAULT_SETTINGS, type ActivityId, type AreaId, type GeneratedQuestion } from "../core/types";
import { makeQuestion } from "./questions";
import { DEFAULT_PLAY_SETTINGS, freshPlayData, savePlayData, type PlayData, type PlaySettings } from "./settings";

const MISTAKE_LINE = "Uh oh. That's okay. Let's fix it.";
const BLURBS: Partial<Record<ActivityId, string>> = {
  numberline: "Hop along the line to add and take away",
  bonds: "Find the missing part that makes 10 or 20",
  times: "Make groups of dots and count them up",
};
const SECTIONS: { area: AreaId; title: string }[] = [
  { area: "numbers", title: "Maths" },
  { area: "code", title: "Code" },
  { area: "words", title: "Words" },
];

function normalize(question: GeneratedQuestion, answer: string): string {
  if (question.answerKind === "sequence") return answer.split("|").map(part => part.trim().toLowerCase()).join("|");
  return answer.trim().toLowerCase().replace(/[.!?,]/g, "").replace(/\s+/g, " ");
}

export function PlayApp({ initialData }: { initialData: PlayData }) {
  const [data, setState] = useState(initialData);
  const latest = useRef(initialData);
  // Save straight away, so a star is never lost if the window closes right after an answer.
  const setData = (change: (current: PlayData) => PlayData) => {
    latest.current = change(latest.current);
    savePlayData(latest.current);
    setState(latest.current);
  };
  const [game, setGame] = useState<ActivityId | null>(null);
  const [cornerOpen, setCornerOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "g") { event.preventDefault(); setCornerOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const voice = { enabled: data.settings.speech, voiceName: "Daniel", rate: 0.9 };
  const sound = (name: SfxName) => playSound(name, data.hero, { ...DEFAULT_SETTINGS, sound: data.settings.sound });
  const addStar = (activityId: ActivityId) => setData(current => ({
    ...current, stars: current.stars + 1, gameStars: { ...current.gameStars, [activityId]: (current.gameStars[activityId] ?? 0) + 1 },
  }));

  return <>
    {game
      ? <GameScreen key={game} activityId={game} data={data} voice={voice} sound={sound} onStar={() => addStar(game)} onHome={() => { stopSpeaking(); setGame(null); }} />
      : <Menu data={data} onPlay={setGame} onHero={hero => setData(current => ({ ...current, hero }))} onOpenCorner={() => setCornerOpen(true)}
        onPin={id => setData(current => ({ ...current, pinned: current.pinned.includes(id) ? current.pinned.filter(item => item !== id) : [...current.pinned, id] }))} />}
    {cornerOpen && <GrownupCorner data={data} onChange={settings => setData(current => ({ ...current, settings }))} onResetStars={() => setData(current => ({ ...freshPlayData(), hero: current.hero, pinned: current.pinned, settings: current.settings }))} onClose={() => setCornerOpen(false)} />}
  </>;
}

function Menu({ data, onPlay, onHero, onOpenCorner, onPin }: { data: PlayData; onPlay: (id: ActivityId) => void; onHero: (hero: PlayData["hero"]) => void; onOpenCorner: () => void; onPin: (id: ActivityId) => void }) {
  const visible = ACTIVITIES.filter(activity => !data.settings.hiddenGames.includes(activity.id));
  const pinned = data.pinned.map(id => visible.find(activity => activity.id === id)).filter((activity): activity is (typeof ACTIVITIES)[number] => !!activity);
  const card = (activity: (typeof ACTIVITIES)[number], big: boolean) => <div key={activity.id} class={`game-card ${big ? "big" : ""}`}>
    <button class="game-play" aria-label={activity.title} onClick={() => onPlay(activity.id)}>
      <span class="game-icon">{activity.icon}</span><b>{activity.title}</b>{big && <small>{BLURBS[activity.id] ?? activity.summary}</small>}<span class="game-stars">★ {data.gameStars[activity.id] ?? 0}</span>
    </button>
    <button class={`pin-button ${big ? "pinned" : ""}`} aria-pressed={big} aria-label={`${big ? "Unpin" : "Pin"} ${activity.title}`} title={big ? "Unpin" : "Pin to my games"} onClick={() => onPin(activity.id)}>📌</button>
  </div>;
  return <div class={`child-shell play-menu suit-${data.hero}`}>
    <header class="play-topbar"><StarPill stars={data.stars} /><HoldButton label="Grown-ups" onHold={onOpenCorner} /></header>
    <main>
      <h1>Hop &amp; Learn</h1>
      <div class="hero-row" role="group" aria-label="Pick your hero">
        {SUITS.map(suit => <button key={suit.id} class={`hero-choice ${data.hero === suit.id ? "selected" : ""}`} aria-pressed={data.hero === suit.id} aria-label={suit.name} title={suit.name} onClick={() => onHero(suit.id)}><HeroAvatar suit={suit.id} /></button>)}
      </div>
      <section class="my-games" aria-label="My games">
        <h2>My games</h2>
        {pinned.length ? <div class="core-games">{pinned.map(activity => card(activity, true))}</div> : <p class="menu-hint">Press 📌 on a game below to keep it here.</p>}
      </section>
      {SECTIONS.map(section => {
        const games = visible.filter(activity => activity.area === section.area && !data.pinned.includes(activity.id));
        return games.length ? <section class="game-section" key={section.area}><h2>{section.title}</h2><div class="game-grid">{games.map(activity => card(activity, false))}</div></section> : null;
      })}
    </main>
  </div>;
}

function GameScreen({ activityId, data, voice, sound, onStar, onHome }: {
  activityId: ActivityId; data: PlayData; voice: { enabled: boolean; voiceName: string; rate: number };
  sound: (name: SfxName) => void; onStar: () => void; onHome: () => void;
}) {
  const rng = useRef(makeRng(Date.now()));
  const recent = useRef<string[]>([]);
  const [question, setQuestion] = useState(() => makeQuestion(activityId, data.settings, rng.current));
  const [worked, setWorked] = useState(false);
  const [wrong, setWrong] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [milestone, setMilestone] = useState(false);
  const activity = ACTIVITY_BY_ID.get(activityId)!;
  const hasTool = WORK_VISUALS.includes(question.visual);
  const answersReady = !hasTool || worked;

  useEffect(() => { void speak(question.spoken, voice); }, [question.key]);

  const next = () => {
    recent.current = [...recent.current, question.key].slice(-8);
    setQuestion(makeQuestion(activityId, data.settings, rng.current, recent.current));
    setWorked(false); setWrong([]); setAttempts(0); setSolved(false);
  };
  const submit = (answer: string) => {
    if (solved) return;
    if (question.answerKind === "grownup" && answer !== "He read it") { void speak("Let's sound it out together.", voice); return; }
    if (question.answerKind === "grownup" || normalize(question, answer) === normalize(question, question.answer)) {
      setSolved(true);
      onStar();
      sound("success");
      void speak(`${question.model} ${attempts ? "We fixed it!" : "We did it!"}`, voice);
      if ((data.stars + 1) % 10 === 0) window.setTimeout(() => { setMilestone(true); sound("star"); }, 900);
      return;
    }
    setWrong(current => [...current, answer]);
    setAttempts(count => count + 1);
    void speak(MISTAKE_LINE, voice);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select")) return;
      if (solved && !milestone && event.key === "Enter") { event.preventDefault(); next(); return; }
      const choice = question.answerKind === "choice" && answersReady && !solved ? question.choices?.[Number(event.key) - 1] : undefined;
      if (choice !== undefined && !wrong.includes(choice)) { event.preventDefault(); submit(choice); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return <div class={`child-shell play-game suit-${data.hero}`}>
    <header class="play-topbar">
      <button class="icon-button" aria-label="Back to games" title="Back to games" onClick={onHome}>⌂</button>
      <span class="game-title">{activity.title}</span>
      <StarPill stars={data.stars} />
    </header>
    <main class="play-main">
      <div class="play-question">
        <h1>{question.prompt}</h1>
        <button class="icon-button say-again" aria-label="Say it again" title="Say it again" onClick={() => void speak(question.spoken, voice)}>🔈</button>
      </div>
      {question.instruction && !solved && <p class="play-instruction">{question.instruction}</p>}
      <QuestionScene key={question.key} question={question} suit={data.hero} level={1} solved={solved}
        onWorkComplete={() => setWorked(true)} onStep={() => sound("step")} />
      {attempts > 0 && !solved && <p class="play-mistake" role="status">{MISTAKE_LINE}</p>}
      {solved
        ? <div class="play-success" role="status"><span class="star-pop" aria-hidden="true">★</span><h2>{attempts ? "We fixed it!" : "We did it!"}</h2><p>{question.model}</p><button class="next-button" onClick={next}>Next <span>→</span></button></div>
        : answersReady && (question.answerKind === "choice" && question.choices
          ? <div class="big-choices" role="group" aria-label="Choose an answer">{question.choices.map(choice => <button key={choice} class={`big-choice ${choice.length > 5 ? "wordy" : ""}`} disabled={wrong.includes(choice)} onClick={() => submit(choice)}>{choice}{question.unit === "p" || question.unit === "cm" ? <small>{question.unit}</small> : null}</button>)}</div>
          : <div class="play-answer"><AnswerInput key={`${question.key}-${attempts}`} question={question} disabled={false} onSubmit={submit} /></div>)}
    </main>
    {milestone && <div class="modal-scrim"><section class="milestone-card" role="dialog" aria-modal="true">
      <HeroAvatar suit={data.hero} class="milestone-hero" />
      <h2>{data.stars} stars!</h2><p>{HERO_NAMES[data.hero]} is so proud of you.</p>
      <button class="next-button" onClick={() => { setMilestone(false); next(); }}>Keep playing</button>
    </section></div>}
  </div>;
}

function StarPill({ stars }: { stars: number }) {
  return <div class="star-pill" aria-label={`${stars} stars`}><span>★</span> {stars}</div>;
}

/** A button that only works when held for two seconds, so grown-up settings stay out of the way. */
function HoldButton({ label, onHold }: { label: string; onHold: () => void }) {
  const timer = useRef<number | undefined>(undefined);
  const [holding, setHolding] = useState(false);
  const start = () => { setHolding(true); timer.current = window.setTimeout(() => { setHolding(false); onHold(); }, 2000); };
  const stop = () => { setHolding(false); window.clearTimeout(timer.current); };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return <button class={`hold-button ${holding ? "holding" : ""}`} title={`${label}: press and hold`} aria-label={`${label} (press and hold)`}
    onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onContextMenu={event => event.preventDefault()}>
    ⚙<span class="hold-ring" />
  </button>;
}

function Choice<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <div class="corner-row"><span>{label}</span><div class="segmented" role="group" aria-label={label}>
    {options.map(option => <button key={String(option.value)} class={value === option.value ? "on" : ""} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div></div>;
}

function GrownupCorner({ data, onChange, onResetStars, onClose }: { data: PlayData; onChange: (settings: PlaySettings) => void; onResetStars: () => void; onClose: () => void }) {
  const settings = data.settings;
  const set = (change: Partial<PlaySettings>) => onChange({ ...settings, ...change });
  const [confirmReset, setConfirmReset] = useState(false);
  const toggle = <T,>(list: T[], item: T) => list.includes(item) ? list.filter(value => value !== item) : [...list, item];
  return <div class="modal-scrim"><section class="grownup-corner" role="dialog" aria-modal="true" aria-label="Grown-up corner">
    <header><h2>Grown-up corner</h2><button class="next-button" onClick={onClose}>Done</button></header>

    <h3>How hard</h3>
    <Choice label="Numbers up to" value={settings.maxNumber} options={[{ value: 10, label: "10" }, { value: 20, label: "20" }, { value: 100, label: "100" }]} onChange={maxNumber => set({ maxNumber })} />
    <Choice label="Other games" value={settings.difficulty} options={[{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }]} onChange={difficulty => set({ difficulty })} />

    <h3>Number Line</h3>
    <Choice label="Sums" value={settings.numberLineOps} options={[{ value: "add", label: "+ only" }, { value: "sub", label: "− only" }, { value: "both", label: "+ and −" }]} onChange={numberLineOps => set({ numberLineOps })} />
    <Choice label="Most hops" value={settings.maxHops} options={[{ value: 3, label: "3" }, { value: 5, label: "5" }, { value: 10, label: "10" }]} onChange={maxHops => set({ maxHops })} />

    <h3>Number Bonds and Times Tables</h3>
    <Choice label="Bonds to" value={settings.bondsTo} options={[{ value: 10, label: "10" }, { value: 20, label: "20" }]} onChange={bondsTo => set({ bondsTo })} />
    <div class="corner-row"><span>Times tables</span><div class="segmented wrap" role="group" aria-label="Times tables">
      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(table => <button key={table} class={settings.tables.includes(table) ? "on" : ""} aria-pressed={settings.tables.includes(table)} onClick={() => { const tables = toggle(settings.tables, table); if (tables.length) set({ tables: tables.sort((a, b) => a - b) }); }}>× {table}</button>)}
    </div></div>

    <h3>Games on the menu</h3>
    <div class="game-toggles">{ACTIVITIES.map(activity => {
      const shown = !settings.hiddenGames.includes(activity.id);
      return <button key={activity.id} class={shown ? "on" : ""} aria-pressed={shown} onClick={() => set({ hiddenGames: toggle(settings.hiddenGames, activity.id) })}>{shown ? "✓ " : ""}{activity.title}</button>;
    })}</div>

    <h3>Sound</h3>
    <Choice label="Read aloud" value={settings.speech ? "on" : "off"} options={[{ value: "on", label: "On" }, { value: "off", label: "Off" }]} onChange={value => set({ speech: value === "on" })} />
    <Choice label="Sound effects" value={settings.sound ? "on" : "off"} options={[{ value: "on", label: "On" }, { value: "off", label: "Off" }]} onChange={value => set({ sound: value === "on" })} />

    <h3>Start again</h3>
    <div class="corner-row"><span>{data.stars} stars so far</span>
      {confirmReset
        ? <div class="segmented"><button class="danger" onClick={() => { onResetStars(); setConfirmReset(false); }}>Yes, reset stars</button><button onClick={() => setConfirmReset(false)}>Cancel</button></div>
        : <div class="segmented"><button onClick={() => setConfirmReset(true)}>Reset stars</button><button onClick={() => onChange({ ...DEFAULT_PLAY_SETTINGS })}>Default settings</button></div>}
    </div>
    <p class="corner-note">Open this corner by holding ⚙ for 2 seconds, or with Ctrl + Shift + G. Everything is saved on this computer only.</p>
  </section></div>;
}
