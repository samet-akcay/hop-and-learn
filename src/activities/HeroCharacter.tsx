import type { SuitId } from "../core/types";

export const HERO_NAMES: Record<SuitId, string> = {
  space: "Captain Hop",
  robot: "Bit the robot",
  webhero: "Spider-Man",
  monster: "Monster",
  speed: "Speedy",
  dino: "Little Dino",
  pond: "Captain Hop",
};

export function HeroCharacter({ suit }: { suit: SuitId }) {
  return <g class={`captain-hop hop-${suit}`} aria-label={HERO_NAMES[suit]}>
    {suit === "robot" ? <Robot /> : suit === "webhero" ? <SpiderMan /> : suit === "monster" ? <Monster /> : suit === "speed" ? <SpeedRunner /> : suit === "dino" ? <Dinosaur /> : <FrogAstronaut space={suit === "space"} />}
  </g>;
}

export function HeroAvatar({ suit, class: className = "" }: { suit: SuitId; class?: string }) {
  return <svg class={`hero-avatar ${className}`} viewBox="0 0 52 62" role="img" aria-label={HERO_NAMES[suit]}>
    <HeroCharacter suit={suit} />
  </svg>;
}

function FrogAstronaut({ space }: { space: boolean }) {
  return <>
    <ellipse cx="25" cy="57" rx="17" ry="5" fill="rgba(0,0,0,.22)" />
    {space && <><rect x="2" y="28" width="10" height="22" rx="4" fill="#c7d3d3" stroke="#526d79" stroke-width="2"/><path d="M4 50 L9 57 L13 50" fill="#e7bd61"/><rect x="38" y="28" width="10" height="22" rx="4" fill="#c7d3d3" stroke="#526d79" stroke-width="2"/><path d="M38 50 L42 57 L47 50" fill="#e7bd61"/> </>}
    <ellipse cx="25" cy="39" rx="18" ry="17" fill={space ? "#e8ece5" : "#70ad72"} stroke="#365e43" stroke-width="2" />
    <ellipse cx="25" cy="41" rx="10" ry="9" fill={space ? "#a6c4a1" : "#83bf7d"} />
    <circle cx="17" cy="23" r="8" fill="#70ad72" stroke="#365e43" stroke-width="2" />
    <circle cx="33" cy="23" r="8" fill="#70ad72" stroke="#365e43" stroke-width="2" />
    <circle cx="18" cy="23" r="4" fill="#fff"/><circle cx="32" cy="23" r="4" fill="#fff" />
    <circle cx="19" cy="23" r="1.8" fill="#173047"/><circle cx="31" cy="23" r="1.8" fill="#173047" />
    <path d="M20 36 Q25 41 30 36" fill="none" stroke="#294f37" stroke-width="2" stroke-linecap="round" />
    <path d="M11 47 Q4 51 8 56 M39 47 Q46 51 42 56" fill="none" stroke="#365e43" stroke-width="4" stroke-linecap="round" />
    {space && <><circle cx="25" cy="25" r="23" fill="rgba(188,224,230,.12)" stroke="#c4dce1" stroke-width="2.5"/><path d="M11 15 Q17 7 25 8" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.5" stroke-linecap="round"/><rect x="18" y="46" width="14" height="5" rx="2.5" fill="#8bc5e1"/></>}
    {!space && <><path d="M10 44 L4 50 L13 51 M40 44 L46 50 L37 51" fill="none" stroke="#365e43" stroke-width="3" stroke-linecap="round"/><path d="M21 49 L19 55 M29 49 L31 55" stroke="#365e43" stroke-width="3" stroke-linecap="round"/></>}
  </>;
}

function Robot() {
  return <>
    <ellipse cx="25" cy="57" rx="18" ry="5" fill="rgba(0,0,0,.22)" />
    <path d="M25 5 V12" stroke="#9dc2d5" stroke-width="3" stroke-linecap="round"/><circle cx="25" cy="5" r="4" fill="#e7bd61"/>
    <rect x="7" y="12" width="36" height="29" rx="8" fill="#91b8c9" stroke="#385d70" stroke-width="3"/>
    <rect x="12" y="18" width="26" height="15" rx="6" fill="#17364a"/>
    <circle cx="19" cy="25" r="3" fill="#dff3f4"/><circle cx="31" cy="25" r="3" fill="#dff3f4"/>
    <path d="M19 36 H31" stroke="#284d60" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="12" y="42" width="26" height="13" rx="5" fill="#668ca0" stroke="#385d70" stroke-width="2"/>
    <circle cx="25" cy="48" r="3" fill="#e7bd61"/>
    <path d="M11 45 L5 49 M39 45 L45 49 M18 54 L15 59 M32 54 L35 59" stroke="#9dc2d5" stroke-width="4" stroke-linecap="round"/>
  </>;
}

function SpiderMan() {
  return <>
    <ellipse cx="25" cy="57" rx="18" ry="5" fill="rgba(0,0,0,.22)" />
    <path d="M16 39 L14 56 H22 L24 42 Z M34 39 L36 56 H28 L26 42 Z" fill="#2c5fb4" stroke="#14284f" stroke-width="2" stroke-linejoin="round" />
    <path d="M13 29 Q25 24 37 29 L40 45 Q25 51 10 45 Z" fill="#d7262e" stroke="#4a0d12" stroke-width="2" />
    <path d="M25 30 V49 M15 36 Q25 42 35 36 M13 42 Q25 48 37 42" fill="none" stroke="#1b1b1f" stroke-width="1" opacity=".7" />
    <path d="M13 30 L5 42 L9 45 L16 33 Z M37 30 L45 42 L41 45 L34 33 Z" fill="#d7262e" stroke="#4a0d12" stroke-width="2" stroke-linejoin="round" />
    <circle cx="7" cy="45" r="3.5" fill="#2c5fb4" stroke="#14284f" stroke-width="1.5" />
    <circle cx="43" cy="45" r="3.5" fill="#2c5fb4" stroke="#14284f" stroke-width="1.5" />
    <circle cx="25" cy="19" r="13" fill="#d7262e" stroke="#4a0d12" stroke-width="2" />
    <path d="M14 19 H36 M25 7 V31 M17 10 L33 28 M33 10 L17 28" fill="none" stroke="#1b1b1f" stroke-width="1" opacity=".6" />
    <path d="M15 15 Q19 11 23 14 Q24 20 19 24 Q14 22 15 15 Z" fill="#ffffff" stroke="#111" stroke-width="1.6" />
    <path d="M35 15 Q31 11 27 14 Q26 20 31 24 Q36 22 35 15 Z" fill="#ffffff" stroke="#111" stroke-width="1.6" />
  </>;
}

function Monster() {
  return <>
    <ellipse cx="25" cy="57" rx="19" ry="5" fill="rgba(0,0,0,.22)" />
    <path d="M12 18 L7 7 L20 14 M38 18 L43 7 L30 14" fill="#b3c99a" stroke="#506a4c" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="25" cy="35" rx="20" ry="22" fill="#94b577" stroke="#506a4c" stroke-width="3"/>
    <circle cx="18" cy="25" r="6" fill="#fff"/><circle cx="32" cy="25" r="6" fill="#fff"/>
    <circle cx="19" cy="25" r="2" fill="#263b33"/><circle cx="31" cy="25" r="2" fill="#263b33"/>
    <path d="M16 39 Q25 50 34 39 Q25 44 16 39" fill="#385446"/><path d="M21 41 L23 45 L25 41 L27 45 L29 41" fill="#fff4dc"/>
    <circle cx="9" cy="34" r="2" fill="#e7bd61"/><circle cx="41" cy="34" r="2" fill="#e7bd61"/>
    <path d="M17 54 L13 59 M33 54 L37 59" stroke="#506a4c" stroke-width="5" stroke-linecap="round"/>
  </>;
}

function SpeedRunner() {
  return <>
    <ellipse cx="25" cy="57" rx="18" ry="5" fill="rgba(0,0,0,.22)" />
    <path d="M12 35 L3 42 L13 43 M13 41 L2 49 L14 48" fill="none" stroke="#e0b457" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="25" cy="39" rx="17" ry="17" fill="#d77b51" stroke="#71483f" stroke-width="2.5"/>
    <path d="M13 28 L8 17 L21 25 M20 25 L19 13 L28 24 M29 25 L35 15 L35 29" fill="#c45f4c" stroke="#71483f" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="21" cy="35" r="5" fill="#fff"/><circle cx="32" cy="35" r="4" fill="#fff"/>
    <circle cx="23" cy="36" r="2" fill="#253b4a"/><circle cx="33" cy="36" r="2" fill="#253b4a"/>
    <path d="M26 44 Q32 48 37 43" fill="none" stroke="#71483f" stroke-width="2" stroke-linecap="round"/>
    <path d="M14 52 L9 57 L22 57 L25 53 M34 52 L31 57 L44 57 L42 52" fill="#e0b457" stroke="#71483f" stroke-width="2"/>
  </>;
}

function Dinosaur() {
  return <>
    <ellipse cx="25" cy="57" rx="19" ry="5" fill="rgba(0,0,0,.22)" />
    <path d="M14 43 Q1 42 4 32 Q10 35 15 36" fill="#85a965" stroke="#4d694b" stroke-width="2.5"/>
    <ellipse cx="23" cy="40" rx="16" ry="14" fill="#a2bd73" stroke="#4d694b" stroke-width="2.5"/>
    <path d="M27 36 Q42 28 44 36 Q44 44 30 45" fill="#a2bd73" stroke="#4d694b" stroke-width="2.5"/>
    <path d="M15 29 L17 21 L22 28 L26 19 L30 28 L35 22 L37 32" fill="#d6a66d" stroke="#4d694b" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="35" cy="34" r="2.5" fill="#fff"/><circle cx="36" cy="34" r="1" fill="#253b38"/>
    <path d="M30 42 Q37 46 42 41" fill="none" stroke="#4d694b" stroke-width="2"/>
    <path d="M18 51 L16 58 M29 51 L32 58" stroke="#4d694b" stroke-width="4" stroke-linecap="round"/>
  </>;
}
