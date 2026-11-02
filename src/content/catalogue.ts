import type { ActivityDefinition, ActivityId, AreaId, SuitId } from "../core/types";

export const AREAS: { id: AreaId; title: string; icon: string; blurb: string }[] = [
  { id: "numbers", title: "Numbers", icon: "＋", blurb: "Build strong number sense and maths fluency." },
  { id: "code", title: "Code", icon: "⌘", blurb: "Plan, test and fix programs." },
  { id: "words", title: "Words", icon: "Aa", blurb: "Read, build sentences and play with words." },
];

export const ACTIVITIES: ActivityDefinition[] = [
  { id: "numberline", area: "numbers", title: "Number Line", icon: "↗", summary: "Hop, bridge ten and find the difference.", stage: "Year 1–2" },
  { id: "bonds", area: "numbers", title: "Number Bonds", icon: "◉", summary: "See parts, make 10 and build to 20.", stage: "Year 1–2" },
  { id: "times", area: "numbers", title: "Times Tables", icon: "×", summary: "Make equal groups, arrays and share.", stage: "Year 2+" },
  { id: "placevalue", area: "numbers", title: "Place Value", icon: "▦", summary: "Build tens and ones; read two-digit numbers.", stage: "Year 2" },
  { id: "compare", area: "numbers", title: "Compare", icon: "⇄", summary: "Compare numbers and expressions.", stage: "Year 2" },
  { id: "money", area: "numbers", title: "Money", icon: "£", summary: "Make totals and find change with UK coins.", stage: "Year 2" },
  { id: "time", area: "numbers", title: "Time", icon: "◷", summary: "Read o'clock, half past and quarter times.", stage: "Year 2" },
  { id: "fractions", area: "numbers", title: "Fractions", icon: "◐", summary: "Find halves, quarters and thirds.", stage: "Year 2" },
  { id: "measure", area: "numbers", title: "Measure", icon: "↔", summary: "Read rulers, scales and measuring jugs.", stage: "Year 2" },
  { id: "shapes", area: "numbers", title: "Shapes", icon: "⬡", summary: "Explore sides, faces and patterns.", stage: "Year 2" },
  { id: "turns", area: "numbers", title: "Turns", icon: "⤾", summary: "Turn and move Bit around a grid.", stage: "Year 2" },
  { id: "charts", area: "numbers", title: "Charts", icon: "▥", summary: "Read pictograms and compare amounts.", stage: "Year 2" },
  { id: "stories", area: "numbers", title: "Maths Stories", icon: "▤", summary: "Turn a short story into a number sentence.", stage: "Year 2" },
  { id: "spotbug", area: "numbers", title: "Spot the Bug", icon: "⚙", summary: "Check Captain Hop's answer and fix a bug.", stage: "Year 2" },
  { id: "rover", area: "code", title: "Program the Rover", icon: "▸", summary: "Plan a route, run it, and debug it.", stage: "KS1 Computing" },
  { id: "machine", area: "code", title: "Number Machine", icon: "⇢", summary: "Find the rule that changes a number.", stage: "KS1 Computing" },
  { id: "logic", area: "code", title: "Logic Puzzles", icon: "⊞", summary: "Sort objects by their properties.", stage: "KS1 Computing" },
  { id: "steps", area: "code", title: "Steps in Order", icon: "☷", summary: "Put instructions in the right sequence.", stage: "KS1 Computing" },
  { id: "binary", area: "code", title: "Signal Lights", icon: "●", summary: "Use 1, 2, 4 and 8 to make a number.", stage: "Stretch" },
  { id: "sentence", area: "words", title: "Sentence Builder", icon: "Aa", summary: "Build a sentence; the scene acts it out.", stage: "Stage 4–5" },
  { id: "fixit", area: "words", title: "Fix the Sentence", icon: "✎", summary: "Help Zib fix a grammar bug.", stage: "Stage 4–5" },
  { id: "story", area: "words", title: "Story Maker", icon: "▣", summary: "Put a story in order and build its sentences.", stage: "Stage 4–5" },
  { id: "listen", area: "words", title: "Listen and Do", icon: "◉", summary: "Follow a clear instruction in a picture.", stage: "Language" },
  { id: "wordsort", area: "words", title: "Word Sort", icon: "⇆", summary: "Sort, describe and find opposites.", stage: "Language" },
  { id: "readmatch", area: "words", title: "Read and Match", icon: "▧", summary: "Read a sentence and match the picture.", stage: "Reading" },
  { id: "sounds", area: "words", title: "Sounds and Spelling", icon: "◖", summary: "Blend sounds and choose a spelling.", stage: "Synthetic phonics" },
  { id: "alien", area: "words", title: "Alien Words", icon: "✦", summary: "Read made-up words and hatch an alien.", stage: "Synthetic phonics" },
  { id: "tricky", area: "words", title: "Tricky Words", icon: "✧", summary: "Find and spell common exception words.", stage: "Year 1–2" },
  { id: "mixups", area: "words", title: "Zib's Mix-ups", icon: "?", summary: "Spot the word Zib mixed up.", stage: "Reading" },
  { id: "typing", area: "words", title: "Typing", icon: "⌨", summary: "Type words and robot commands.", stage: "Writing" },
  { id: "letters", area: "words", title: "Letter of the Day", icon: "✎", summary: "See how to form letters and numbers.", stage: "Writing" },
];

export const ACTIVITY_BY_ID = new Map<ActivityId, ActivityDefinition>(ACTIVITIES.map(item => [item.id, item]));

export const SUITS: { id: SuitId; name: string; tagline: string; emoji: string }[] = [
  { id: "space", name: "Space", tagline: "Moon rocks and fuel cells", emoji: "🚀" },
  { id: "robot", name: "Robot", tagline: "Workshop panels and bolts", emoji: "🤖" },
  { id: "webhero", name: "Spider-Man", tagline: "City rooftops and web balls", emoji: "🕷️" },
  { id: "monster", name: "Monster", tagline: "Big stomps and boulders", emoji: "🦖" },
  { id: "speed", name: "Speed", tagline: "A track and golden rings", emoji: "⚡" },
  { id: "dino", name: "Dino", tagline: "Stepping stones and eggs", emoji: "🦕" },
  { id: "pond", name: "Frog Pond", tagline: "Lily pads and splashes", emoji: "🐸" },
];

export function listActivities(area?: AreaId): ActivityDefinition[] {
  return area ? ACTIVITIES.filter(item => item.area === area) : ACTIVITIES;
}
