import type { GeneratedQuestion, Level, SuitId } from "../core/types";
import { resolveScene } from "../scenes/registry";

interface Props {
  question: GeneratedQuestion;
  suit: SuitId;
  level: Level;
  initialComplete?: boolean;
  initialSteps?: number;
  onActivity?: () => void;
  onStep?: (steps: number) => void;
  onPlayPhoneme?: (grapheme: string, word?: string) => void;
  hasPhoneme?: (grapheme: string, word?: string) => boolean;
  reducedMotion?: boolean;
  solved?: boolean;
  onWorkComplete: () => void;
}

const num = (q: GeneratedQuestion, key: string, fallback = 0) => Number(q.data[key] ?? fallback);
const str = (q: GeneratedQuestion, key: string, fallback = "") => String(q.data[key] ?? fallback);
const list = (q: GeneratedQuestion, key: string) => Array.isArray(q.data[key]) ? q.data[key] as string[] : [];

export const WORK_VISUALS = ["numberline", "bonds", "array"];

export function QuestionScene({ question, suit, level, onWorkComplete, onActivity, onStep, onPlayPhoneme, hasPhoneme, reducedMotion = false, initialComplete = false, initialSteps = 0, solved = false }: Props) {
  const Scene = resolveScene(question);
  if (Scene) {
    return <div class="scene-wrap">
      <Scene
        question={question}
        suit={suit}
        level={level}
        solved={solved}
        reducedMotion={reducedMotion}
        initialComplete={initialComplete}
        initialSteps={initialSteps}
        onActivity={onActivity}
        onStep={onStep}
        onWorkComplete={onWorkComplete}
      />
    </div>;
  }

  return <div class="scene-wrap">
    {question.visual === "rover" && (question.activityId === "turns" ? <TurnScene question={question} /> : <RoverScene question={question} />)}
    {question.visual === "sentence" && <SentenceScene question={question} />}
    {question.visual === "chart" && <ChartScene question={question} />}
    {question.visual === "shape" && <ShapeScene question={question} />}
    {question.visual === "picture" && <PictureScene question={question} onPlayPhoneme={onPlayPhoneme} hasPhoneme={hasPhoneme} />}
  </div>;
}

function RoverScene({ question }: { question: GeneratedQuestion }) {
  const path = list(question, "path");
  const size = 5;
  let col = 0, row = size - 1, facing = 0;
  const hasTurns = path.some(step => step === "↶" || step === "↷");
  for (const command of path) {
    if (command === "↶") { facing = (facing + 3) % 4; continue; }
    if (command === "↷") { facing = (facing + 1) % 4; continue; }
    if (hasTurns && command === "↑") {
      if (facing === 0) row--;
      else if (facing === 1) col++;
      else if (facing === 2) row++;
      else col--;
    } else {
      if (command === "↑") row--;
      if (command === "↓") row++;
      if (command === "→") col++;
      if (command === "←") col--;
    }
  }
  const x = Math.max(0, Math.min(size - 1, col));
  const y = Math.max(0, Math.min(size - 1, row));
  return <div class="rover-scene">
    <div class="scene-caption"><span class="scene-chip">Program Bit</span><span>Plan the moves in order</span></div>
    <div class="rover-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {Array.from({ length: size * size }, (_, i) => {
        const col = i % size, row = Math.floor(i / size);
        const start = row === size - 1 && col === 0;
        const goal = row === y && col === x;
        return <div class={`rover-cell ${start ? "rover-start" : ""} ${goal ? "rover-goal" : ""}`} key={i}>{start ? "B" : goal ? "◆" : ""}</div>;
      })}
    </div>
  </div>;
}

function TurnScene({ question }: { question: GeneratedQuestion }) {
  const from = str(question, "from", "up");
  const turn = str(question, "turn", "quarter clockwise");
  const directions: Record<string, number> = { up: 0, right: 90, down: 180, left: 270 };
  return <div class="rover-scene"><div class="scene-caption"><span class="scene-chip">Turn Bit</span><span>{turn}</span></div><svg class="turn-diagram" viewBox="0 0 220 145" role="img" aria-label={`Bit faces ${from}; make a ${turn}`}><circle cx="110" cy="74" r="55" fill="#122d42" stroke="#42657a" stroke-width="3"/><path d="M 110 20 A 54 54 0 0 1 160 74" fill="none" stroke="#e2b850" stroke-width="4" stroke-dasharray="6 6"/><path d="M 155 64 L 162 76 L 148 77" fill="#e2b850"/><g transform={`rotate(${directions[from] ?? 0} 110 74)`}><path d="M110 33 L96 76 L110 68 L124 76 Z" fill="#a6d7b1"/><circle cx="110" cy="74" r="7" fill="#e7bd61"/></g><text x="110" y="140" text-anchor="middle" class="svg-label">Start: {from}</text><text x="110" y="15" text-anchor="middle" class="svg-small">Then make the turn</text></svg></div>;
}

function SentenceScene({ question }: { question: GeneratedQuestion }) {
  if (question.activityId === "fixit" || question.activityId === "mixups") {
    return <div class="sentence-scene"><div class="scene-caption"><span class="scene-chip">Zib's sentence</span><span>Let's read it together</span></div><p class="sentence-to-fix">{str(question, "sentence")}</p></div>;
  }
  const slotTypes = question.skillId === "sw.describe" ? ["who", "doing", "describing", "what", "where"] : ["who", "doing", "what", "where", "when"];
  const labels = slotTypes.slice(0, num(question, "slots", 4));
  return <div class="sentence-scene">
    <div class="scene-caption"><span class="scene-chip">Sentence slots</span><span>{labels.join(" · ")}</span></div>
    <div class="sentence-slots" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>
      {labels.map(label => <div class="sentence-slot" key={label} style={{ borderBottom: `3px solid var(--sentence-${label})` }}><small>{label.toUpperCase()}</small><b>Choose a tile</b></div>)}
    </div>
  </div>;
}

function ChartScene({ question }: { question: GeneratedQuestion }) {
  const names = list(question, "names"), counts = (question.data.counts as number[] | undefined) ?? [];
  const max = Math.max(...counts, 1);
  return <div class="chart-scene">
    <div class="scene-caption"><span class="scene-chip">Cargo count</span><span>Which has the most?</span></div>
    <div class="chart-bars">{names.map((name, i) => <div class="chart-bar-col" key={name}><span class="chart-value">{counts[i]}</span><div class="chart-bar" style={{ height: `${Math.max(12, counts[i]! / max * 105)}px` }} /><b>{name}</b></div>)}</div>
  </div>;
}

function ShapeScene({ question }: { question: GeneratedQuestion }) {
  const shape = str(question, "shape", "triangle");
  const sides = num(question, "sides", 3);
  if (question.activityId === "logic" && question.skillId === "lg.sudoku4") {
    return <div class="shape-scene"><div class="scene-caption"><span class="scene-chip">Shape grid</span><span>One shape of each kind in every row</span></div><div class="sudoku-row">{list(question, "row").map((cell, index) => <span class={cell === "?" ? "sudoku-cell sudoku-blank" : "sudoku-cell"} key={index}>{cell}</span>)}</div></div>;
  }
  if (question.activityId === "logic") return <div class="shape-scene"><div class="scene-caption"><span class="scene-chip">Logic lab</span><span>Look at the shapes</span></div><div class="shape-options"><span>○</span><span>□</span><span>△</span><span>☆</span></div></div>;
  if (question.activityId === "shapes" && question.skillId === "sh.patterns") return <div class="shape-scene"><div class="scene-caption"><span class="scene-chip">Pattern strip</span><span>What comes next?</span></div><div class="shape-options">{list(question, "pattern").map((item, i) => <span key={i}>{item}</span>)}<span>?</span></div></div>;
  if (question.activityId === "shapes" && question.skillId === "sh.symmetry") return <div class="shape-scene"><div class="scene-caption"><span class="scene-chip">Mirror line</span><span>Do both sides match?</span></div><div class="mirror-grid"><div class="mirror-half">◢</div><i /><div class="mirror-half">{question.data.symmetric ? "◣" : "○"}</div></div></div>;
  if (question.activityId === "shapes" && (question.skillId === "sh.3d-props" || question.skillId === "sh.faces")) return <div class="shape-scene"><div class="scene-caption"><span class="scene-chip">3D shape</span><span>{shape}</span></div><div class="solid-shape">{shape === "cylinder" ? "▱" : shape === "triangular prism" ? "◭" : "◇"}<small>Turn the shape in your mind.</small></div></div>;
  return <div class="shape-scene"><div class="scene-caption"><span class="scene-chip">Shape lab</span><span>Count the straight sides</span></div><svg viewBox="0 0 220 150" role="img" aria-label={shape}>
    {sides === 3 ? <polygon points="110,18 190,132 30,132" fill="#dcefdc" stroke="#54815a" stroke-width="5" /> : sides === 4 ? <rect x="48" y="28" width="124" height="104" rx="4" fill="#dcefdc" stroke="#54815a" stroke-width="5" /> : <polygon points={Array.from({ length: sides }, (_, i) => { const angle = (2 * Math.PI * i / sides) - Math.PI / 2; return `${110 + 75 * Math.cos(angle)},${75 + 58 * Math.sin(angle)}`; }).join(" ")} fill="#dcefdc" stroke="#54815a" stroke-width="5" />}
  </svg></div>;
}

function PictureScene({ question, onPlayPhoneme, hasPhoneme }: { question: GeneratedQuestion; onPlayPhoneme?: (grapheme: string, word?: string) => void; hasPhoneme?: (grapheme: string, word?: string) => boolean }) {
  if (question.activityId === "numberline" && ["nl.scale", "nl.estimate"].includes(question.skillId)) {
    const max = num(question, "max", 100), target = num(question, "result");
    return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Number line</span><span>Use the labels to estimate the point</span></div><svg class="estimate-line" viewBox="0 0 600 110" role="img" aria-label={`Marked point on a line from zero to ${max}`}><line x1="30" y1="52" x2="570" y2="52" stroke="#95b9c8" stroke-width="7" stroke-linecap="round"/><circle cx={30 + target / max * 540} cy="52" r="10" fill="#e7bd61" stroke="#fff1c7" stroke-width="3"/><text x="30" y="91" text-anchor="middle" class="svg-label">0</text><text x="570" y="91" text-anchor="middle" class="svg-label">{max}</text></svg></div>;
  }
  if (question.activityId === "bonds" && question.skillId === "bd.subitise") return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Quick look</span><span>How many counters?</span></div><div class="subitise-dots">{Array.from({ length: num(question, "counters") }, (_, index) => <span key={index} />)}</div></div>;
  if (question.activityId === "times" && question.skillId === "tt.equal") return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Check the groups</span><span>Does each group have the same?</span></div><div class="equal-groups"><div>{Array.from({ length: num(question, "first") }, (_, index) => <span key={index} />)}</div><div>{Array.from({ length: num(question, "second") }, (_, index) => <span key={index} />)}</div></div></div>;
  if (question.activityId === "steps" || question.activityId === "story") {
    const tiles = list(question, "scrambled");
    return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Story cards</span><span>Choose what happens first</span></div><div class="story-tiles">{tiles.map((tile, index) => <div class="story-tile" key={`${tile}-${index}`}><small>Card {index + 1}</small><b>{tile}</b></div>)}</div></div>;
  }
  if (question.activityId === "numberline" && question.skillId === "nl.missing") return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Part and whole</span><span>One part is missing</span></div><div class="part-whole-row"><span class="part-chip">{num(question, "a")}</span><span class="part-link">+</span><span class="part-chip missing">?</span><span class="part-link">=</span><span class="part-chip whole">{num(question, "result")}</span></div></div>;
  if (question.activityId === "spotbug") return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Captain Hop's sum</span></div><div class="bug-sum">{num(question, "a")} {str(question, "sign", "+")} {num(question, "b")} = {num(question, "shown")}</div></div>;
  if (question.activityId === "machine") return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Number machine</span><span>Input goes in · follow the rule · output comes out</span></div><div class="machine-flow"><span>{num(question, "n")}</span><b>→</b><span>?</span></div></div>;
  if (question.activityId === "binary") {
    const bits = (question.data.bits as number[] | undefined) ?? [];
    const lights = (question.data.lights as number[] | undefined) ?? [8, 4, 2, 1];
    return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Signal lights</span><span>Each lamp has a value</span></div><div class="binary-lights">{lights.map(value => <div class={`binary-lamp ${bits.includes(value) ? "lamp-on" : ""}`} key={value}><span>{bits.includes(value) ? "●" : "○"}</span><small>{value}</small></div>)}</div></div>;
  }
  if (question.activityId === "sounds") {
    const graphemes = list(question, "graphemes");
    if (question.skillId === "so.segment") return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Sound boxes</span><span>Listen, then build the word</span></div><div class="sound-boxes blank-sound-boxes">{graphemes.map((_, index) => <span key={index}>□</span>)}</div><small class="phonics-note">Use the grapheme tiles below.</small></div>;
    return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Sound boxes</span><span>Blend from left to right</span></div><div class="sound-boxes">{graphemes.map((sound, index) => {
      const recorded = hasPhoneme?.(sound, str(question, "word")) ?? false;
      return <button key={`${sound}-${index}`} disabled={!recorded} aria-label={recorded ? `Play ${sound} sound` : `${sound} sound not recorded`} onClick={() => onPlayPhoneme?.(sound, str(question, "word"))}>{sound}</button>;
    })}</div><small class="phonics-note">{graphemes.some(sound => !hasPhoneme?.(sound, str(question, "word"))) ? "Say each sound, then blend them." : "Click a sound to hear it."}</small></div>;
  }
  if (question.activityId === "alien") {
    const word = str(question, "word");
    const graphemes = list(question, "graphemes");
    if (question.data.grownupRead) return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">A word from Planet Zib</span><span>Read it together</span></div><div class="alien-word">✦ {word} ✦</div><div class="sound-boxes">{graphemes.map((sound, index) => {
      const recorded = hasPhoneme?.(sound, word) ?? false;
      return <button key={`${sound}-${index}`} disabled={!recorded} aria-label={recorded ? `Play ${sound} sound` : `${sound} sound not recorded`} onClick={() => onPlayPhoneme?.(sound, word)}>{sound}</button>;
    })}</div></div>;
    return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">A word from Planet Zib</span></div><div class="alien-cue">✦ <span>Listen, then choose the letters.</span> ✦</div></div>;
  }
  if (question.activityId === "typing") return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">{question.skillId === "ty.dictation" ? "Listen and type" : question.skillId === "ty.keys" ? "Keyboard practice" : question.skillId === "ty.words" ? "Word typing" : question.skillId === "ty.sentence" ? "Sentence typing" : "Robot command"}</span></div>{question.skillId === "ty.dictation" ? <div class="alien-cue">✦ <span>Listen for the word.</span> ✦</div> : <div class="typing-cue">{str(question, "word")}</div>}</div>;
  if (question.activityId === "letters") {
    const isDigit = num(question, "digit", -1) >= 0;
    return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">{isDigit ? "Number strokes" : "Letter strokes"}</span><span>Watch the direction</span></div><div class="letter-strokes"><b>{str(question, "symbol", str(question, "letter"))}</b><span>↘</span><span>↗</span><span>↓</span></div></div>;
  }
  if (question.activityId === "stories") return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Story panel</span><span>Let's find the numbers in the story</span></div><div class="story-tiles"><span class="story-number">{num(question, "start")}</span><span class="story-number">{num(question, "change")}</span><span class="story-number">?</span></div></div>;
  if (question.activityId === "measure") {
    const length = num(question, "length", 10), cm = 26;
    return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Measure it</span><span>Line the {str(question, "thing", "pencil")} up with 0</span></div>
      <svg class="measure-svg" viewBox={`0 0 ${20 * cm + 40} 110`} role="img" aria-label={`A ${str(question, "thing", "pencil")} next to a ruler from 0 to 20`}>
        <rect x="20" y="14" width={length * cm - 16} height="22" rx="4" fill="#f2c14e" stroke="#9a7417" stroke-width="2" />
        <polygon points={`${4 + length * cm},14 ${20 + length * cm},25 ${4 + length * cm},36`} fill="#e9d2a6" stroke="#9a7417" stroke-width="2" />
        <rect x="14" y="48" width={20 * cm + 12} height="48" rx="6" fill="#fff" stroke="#9fb8bf" stroke-width="2" />
        {Array.from({ length: 21 }, (_, i) => <g key={i}><line x1={20 + i * cm} y1="48" x2={20 + i * cm} y2={i % 5 === 0 ? 66 : 60} stroke="#4b6570" stroke-width="2" /><text x={20 + i * cm} y="88" text-anchor="middle" class="svg-label">{i}</text></g>)}
      </svg></div>;
  }
  if (question.activityId === "tricky" && question.data.grownupRead) return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Tricky word</span><span>Read it together</span></div><div class="typing-cue">{str(question, "word")}</div></div>;
  if (["listen", "wordsort", "readmatch", "tricky"].includes(question.activityId)) {
    const options = list(question, question.activityId === "tricky" ? "choices" : "options");
    return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">{question.activityId === "listen" ? "Listen and do" : question.activityId === "wordsort" ? "Word sort" : question.activityId === "tricky" ? "Tricky word" : "Read and match"}</span></div><div class="picture-option-cards">{options.map((option, index) => <div class="picture-option-card" key={`${option}-${index}`}><span>{question.activityId === "listen" ? "↗" : question.activityId === "tricky" ? "Aa" : "◇"}</span><b>{option}</b></div>)}</div></div>;
  }
  if (question.activityId === "turns") return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Position words</span><span>Move Bit in relation to the star</span></div><div class="position-grid"><span>◇</span><span>★</span><span>◇</span><span>◇</span><span>Bit</span><span>◇</span></div></div>;
  return <div class="picture-scene"><div class="scene-caption"><span class="scene-chip">Look closely</span><span>Let's check the picture.</span></div><div class="picture-placeholder">◇</div></div>;
}
