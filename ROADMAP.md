# Hop & Learn — Phased Build Plan

Every game is built on the shared visual foundation (`src/kit/` + `src/scenes/`):
- **One consistent art style** (`src/kit/theme.ts`): bright calm surfaces, crisp `#2c4a58` outlines, warm gold for active/highlighted elements, sky-teal for base elements, soft mint for confirmed answers.
- **Hero theme everywhere** (`src/kit/SuitToken.tsx`, `src/kit/SceneFrame.tsx`): the chosen hero appears on stage or in the buddy corner, and suit-specific SVG tokens carry through counting, grouping, sharing, and measuring.
- **Gradual promotion** (`src/scenes/registry.ts`): each game moves onto the child's default menu (`POLISHED_ACTIVITIES`) only once its SVG scene, interaction, and tests are ready.

---

## Phase 1 — Core Foundation & Big Four Maths *(Done)*
- [x] Shared SVG visual kit (`theme.ts`, `SuitToken.tsx`, `SceneFrame.tsx`, `GameIcon.tsx`)
- [x] Scene registry (`src/scenes/registry.ts`) and configurable per-game ranges
- [x] **Number Line** (`NumberLineScene.tsx`) — suit-themed stops, squash-and-stretch hops, configurable range (`10 / 20 / 30 / 50 / 100`)
- [x] **Number Bonds** (`BondsScene.tsx`) — interactive SVG ten-frame(s) with suit tokens + visual part–whole bar
- [x] **Times Tables** (`TimesScene.tsx`) — interactive SVG equal-group pods with suit tokens + skip-count reveal
- [x] **Fractions** (`FractionScene.tsx`) — equal/unequal shapes, shaded shapes, interactive sharing sets, fraction wall, fraction number line, stacked fraction buttons

---

## Phase 2 — Everyday Year 2 Maths (Tactile Visuals)
High-value Year 2 skills that shine with crisp interactive SVG diagrams:
- [ ] **Place Value** (`PlaceValueScene.tsx`) — SVG base-10 tens rods and ones cubes (tap/build tens and ones, flexible partitioning like `47 = 30 + 17`, 10 more/less highlight)
- [ ] **Compare** (`CompareScene.tsx`) — real SVG balance beam that physically tilts toward the heavier pan, backed by mini base-10 blocks so he can *see* why `34 > 29`
- [ ] **Money** (`MoneyScene.tsx`) — illustrated UK coins (copper 1p/2p, silver 5p/10p, heptagonal silver 20p/50p, gold £1), interactive counting tray and change counter
- [ ] **Time** (`TimeScene.tsx`) — upgraded SVG analogue clock with shaded quarter/half sectors, colour-coded minute/hour hands, and 5-minute step markers

---

## Phase 3 — Visual Reasoning & Computing
Interactive grid, measurement, and spatial games:
- [ ] **Program the Rover** (`RoverScene.tsx`) — animated SVG mission grid where the chosen hero/Bit actually drives step-by-step along the programmed arrows to collect a crystal, with obstacle/bug highlights
- [ ] **Turns** (`TurnsScene.tsx`) — clean light-mode compass dial with animated quarter/half turn arc and hero facing direction
- [ ] **Shapes** (`ShapesScene.tsx`) — crisp 2D shapes with tappable side/vertex counters, real isometric 3D SVGs (cube, cylinder, triangular prism, sphere, cone), and a visual symmetry mirror fold
- [ ] **Measure** (`MeasureScene.tsx`) — SVG ruler (cm), dial weighing scale (g/kg), liquid measuring jug (ml/l), and thermometer (°C) — unlocking the 3 skills currently hidden in `LEFT_OUT`
- [ ] **Spot the Bug** (`SpotBugScene.tsx`) — hero speech bubble showing their attempted sum + a visual "check" diagram proving whether it is right or a bug

---

## Phase 4 — Data, Stories & Logic
Visual bridges between maths, patterns, and word problems:
- [ ] **Charts** (`ChartsScene.tsx`) — SVG pictograms using suit tokens (key = 1, 2, 5, or 10), tally charts, and colour-coded block diagrams
- [ ] **Maths Stories** (`StoriesScene.tsx`) — illustrated story strip + interactive bar model linking the story words to the number sentence
- [ ] **Number Machine** (`MachineScene.tsx`) — animated input → glowing gear box → output SVG machine
- [ ] **Logic Puzzles** (`LogicScene.tsx`) — crisp 4×4 illustrated shape sudoku grid and Venn/Carroll sorting circles
- [ ] **Signal Lights** (`BinaryScene.tsx`) — interactive glowing 8-4-2-1 signal console lamps

---

## Phase 5 — Words & Language (Illustrated Scenes)
Replace the `◇` text placeholders with proper visual SVG scenes and Colourful Semantics integration:
- [ ] **Sentence Builder & Fix the Sentence** — illustrated mini-scenes that act out the sentence built in the coloured slots (`Who / Doing / What / Where`)
- [ ] **Sounds, Alien Words & Tricky Words** — polished light-mode phonics sound buttons, blending hop-bar, and custom alien SVG generator (each decoded alien word hatches a unique SVG alien)
- [ ] **Listen and Do, Read and Match, Story Maker & Word Sort** — reusable SVG scene props (objects + positions: *in, on, under, next to, between*) replacing all placeholder diamonds
- [ ] **Typing & Letter of the Day** — animated stroke-order SVG guides and responsive on-screen keyboard highlights
