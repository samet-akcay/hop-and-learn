import { useEffect, useRef, useState } from "preact/hooks";
import type { GeneratedQuestion } from "../core/types";
import { SENTENCE_LEXICON, sentenceVerbOptions, type SentenceTime } from "../content/lexicon";

interface Props {
  question: GeneratedQuestion;
  disabled: boolean;
  onSubmit: (value: string) => void;
  onActivity?: () => void;
  showTargetKey?: boolean;
}

export function AnswerInput({ question, disabled, onSubmit, onActivity, showTargetKey = false }: Props) {
  const [value, setValue] = useState("");
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!disabled) field.current?.focus({ preventScroll: true }); }, [disabled, question.key]);
  useEffect(() => {
    if (disabled || question.answerKind !== "choice" || !question.choices) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select")) return;
      const index = Number(event.key) - 1;
      const selected = question.choices?.[index];
      if (selected !== undefined) { event.preventDefault(); onActivity?.(); onSubmit(selected); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, question.key, question.answerKind, onSubmit]);
  if (question.answerKind === "grownup") {
    return <div class="grownup-check" role="group" aria-label="Grown-up reading check"><p>Read it out loud.</p><button class="choice-button" disabled={disabled} onClick={() => { onActivity?.(); onSubmit("He read it"); }}>I read it!</button><button class="quiet-button" disabled={disabled} onClick={() => { onActivity?.(); onSubmit("Let's sound it out"); }}>Help me sound it out</button></div>;
  }

  if (question.answerKind === "choice" && question.choices) {
    return <div class="answer-choice-grid" role="group" aria-label="Choose an answer">
      {question.choices.map((choice, i) => <button key={`${choice}-${i}`} class="choice-button" disabled={disabled} onClick={() => { onActivity?.(); onSubmit(choice); }}>
        <span class="choice-index">{i + 1}</span>{choice}
      </button>)}
    </div>;
  }

  if (question.answerKind === "sequence" && question.choices) {
    const expectedLength = question.answer.split("|").length;
    const sourceOrder = Array.isArray(question.data.scrambled) ? question.data.scrambled as string[] : question.choices;
    return <SequenceInput question={question} disabled={disabled} onSubmit={onSubmit} onActivity={onActivity} length={expectedLength} sourceOrder={sourceOrder} />;
  }

  if (question.activityId === "sentence") {
    return <SentenceInput question={question} disabled={disabled} onSubmit={onSubmit} onActivity={onActivity} />;
  }

  return <form class="typed-answer" onSubmit={e => { e.preventDefault(); if (value.trim()) { onActivity?.(); onSubmit(value.trim()); } }}>
    <label for="answer-field" class="sr-only">Your answer</label>
    <div class="answer-entry">
      <input
        ref={field}
        id="answer-field"
        type="text"
        inputMode={question.answerKind === "number" ? "numeric" : "text"}
        autoComplete="off"
        spellcheck={false}
        maxLength={40}
        value={value}
        disabled={disabled}
        onInput={e => { setValue((e.currentTarget as HTMLInputElement).value); onActivity?.(); }}
        aria-label="Type your answer"
      />
      {question.unit && <span class="answer-unit">{question.unit}</span>}
      <button class="submit-answer" type="submit" disabled={disabled || !value.trim()}>Check</button>
    </div>
    {question.activityId === "typing" && <div class="virtual-keyboard" aria-label="On-screen keyboard">
      {["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((row, index) => <div class="virtual-key-row" key={index}>{row.split("").map(letter => <button type="button" key={letter} class={showTargetKey && String(question.data.word ?? "").toLowerCase().slice(value.length, value.length + 1) === letter ? "target-key" : ""} disabled={disabled} onClick={() => { onActivity?.(); setValue(current => current + letter); }}>{letter}</button>)}{index === 2 && <><button type="button" disabled={disabled || !value} onClick={() => { onActivity?.(); setValue(current => current.slice(0, -1)); }}>⌫</button><button type="button" disabled={disabled} onClick={() => { onActivity?.(); setValue(current => `${current} `); }}>SPACE</button></>}</div>)}
    </div>}
    <div class="key-help">Press <kbd>Enter</kbd> to check.</div>
  </form>;
}

function SequenceInput({ question, disabled, onSubmit, onActivity, length, sourceOrder }: Props & { length: number; sourceOrder: string[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const add = (item: string) => {
    onActivity?.();
    if (selected.length < length) setSelected(current => [...current, item]);
  };
  const clear = () => { onActivity?.(); setSelected([]); };
  useEffect(() => {
    if (disabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select")) return;
      const arrow: Record<string, string> = { ArrowUp: "↑", ArrowRight: "→", ArrowDown: "↓", ArrowLeft: "←" };
      const command = question.activityId === "rover" ? arrow[event.key] : undefined;
      if (command && sourceOrder.includes(command) && selected.length < length) { event.preventDefault(); add(command); return; }
      const optionIndex = Number(event.key) - 1;
      if (!command && Number.isInteger(optionIndex) && optionIndex >= 0 && sourceOrder[optionIndex] !== undefined && selected.length < length) { event.preventDefault(); add(sourceOrder[optionIndex]!); return; }
      if (event.key === "Backspace" && selected.length) { event.preventDefault(); setSelected(value => value.slice(0, -1)); onActivity?.(); return; }
      if (event.key === "Enter" && selected.length === length) { event.preventDefault(); onSubmit(selected.join("|")); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, question.key, selected, length, sourceOrder]);
  return <div class="sequence-input">
    <div class="sequence-current" aria-live="polite">{selected.length ? selected.map((item, i) => <span key={`${item}-${i}`}>{item}</span>) : <small>Choose each step in order</small>}</div>
    <div class="sequence-options">
      {sourceOrder.map((item, i) => <button key={`${item}-${i}`} disabled={disabled || selected.length >= length} onClick={() => add(item)}>{item}</button>)}
    </div>
    <div class="sequence-actions">
      <button class="quiet-button" disabled={disabled || !selected.length} onClick={clear}>Start again</button>
      <button class="submit-answer" disabled={disabled || selected.length !== length} onClick={() => { onActivity?.(); onSubmit(selected.join("|")); }}>Run / check</button>
    </div>
    <span class="sr-only">{question.prompt}</span>
  </div>;
}

function SentenceInput({ question, disabled, onSubmit, onActivity }: Props) {
  const subject = String(question.data.subject ?? "The robot");
  const object = String(question.data.object ?? "the ball");
  const place = String(question.data.place ?? "on the moon");
  const slotCount = Number(question.data.slots ?? 4);
  const when = String(question.data.when ?? "");
  const isDescribe = question.skillId === "sw.describe";
  const isWhen = question.skillId === "sw.when";
  const verbs = sentenceVerbOptions((when || "now") as SentenceTime);
  const [parts, setParts] = useState<string[]>(() => Array.from({ length: slotCount }, () => ""));
  const [slotIndex, setSlotIndex] = useState(0);
  const slotOptions = isDescribe ? [
    Array.from(new Set([subject, ...SENTENCE_LEXICON.subjects])), verbs,
    Array.from(new Set([String(question.data.describing ?? "big"), ...SENTENCE_LEXICON.describing])),
    Array.from(new Set([object, "rocket", "star", "ball", "robot"])),
    Array.from(new Set([place, ...SENTENCE_LEXICON.places])),
  ] : [
    Array.from(new Set([subject, ...SENTENCE_LEXICON.subjects])), verbs,
    Array.from(new Set([object, ...SENTENCE_LEXICON.objects])),
    Array.from(new Set([place, ...SENTENCE_LEXICON.places])),
    when ? [when] : [],
  ];
  const slotTypes = isDescribe ? ["who", "doing", "describing", "what", "where"] : ["who", "doing", "what", "where", "when"];
  const labels = slotTypes.slice(0, slotCount);
  const choose = (slot: number, tile: string) => { onActivity?.(); setParts(old => old.map((part, i) => i === slot ? tile : part)); };
  const ready = parts.length === slotCount && parts.every(Boolean);
  const sentence = isDescribe
    ? parts.every(Boolean) ? `${parts[0]} ${parts[1]} the ${parts[2]} ${parts[3]} ${parts[4]}` : parts.filter(Boolean).join(" ")
    : isWhen ? parts[4] ? `${parts[4]![0]!.toUpperCase()}${parts[4]!.slice(1)} ${parts.slice(0, 4).join(" ")}` : parts.slice(0, 4).filter(Boolean).join(" ")
      : parts.filter(Boolean).join(" ");
  useEffect(() => {
    if (disabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        setSlotIndex(index => Math.max(0, Math.min(slotCount - 1, index + (event.key === "ArrowRight" ? 1 : -1))));
        onActivity?.();
        return;
      }
      const optionIndex = Number(event.key) - 1;
      const option = slotOptions[slotIndex]?.[optionIndex];
      if (option !== undefined) { event.preventDefault(); choose(slotIndex, option); return; }
      if (event.key === "Enter" && ready) { event.preventDefault(); onSubmit(`${sentence}.`); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, slotIndex, slotCount, ready, sentence, question.key]);
  return <div class="sentence-input">
    {labels.map((label, i) => <div class="sentence-choice-slot" key={label}>
      <div class="slot-label" style={{ borderBottom: `3px solid var(--sentence-${labels[i]})` }}>{label}</div>
      <div class="sentence-option-row">{slotOptions[i]!.map((option, index) => <button key={`${option}-${index}`} class={`tile-button ${parts[i] === option ? "tile-selected" : ""}`} disabled={disabled} onClick={() => choose(i, option)}>{option}</button>)}</div>
    </div>)}
    <div class="sentence-preview" aria-live="polite">{sentence}{ready ? "." : " …"}</div>
    <button class="submit-answer" disabled={disabled || !ready} onClick={() => { onActivity?.(); onSubmit(`${sentence}.`); }}>Read it back</button>
  </div>;
}
