// Every spoken line in every video, with the shortest each scene may run.
// Plain data only: generate-voiceover.ts reads this file directly.

export const FPS = 30;

// The voice is played back slightly faster than recorded to keep the pace up.
export const VOICE_RATE = 1.12;

export const REEL_LINES = [
  { id: "01-hook", baseFrames: 80, voiceover: "Card breakers: your break can sell out and still lose money." },
  { id: "02-what", baseFrames: 60, voiceover: "BreakMath is a free app that tells you what to charge for every spot." },
  { id: "03-inputs", baseFrames: 60, voiceover: "Enter your box cost and fees, then rate each team." },
  { id: "04-cards", baseFrames: 60, voiceover: "Every team gets its own price." },
  { id: "05-profit", baseFrames: 60, voiceover: "And you see your profit before you buy the box." },
  { id: "06-cta", baseFrames: 55, voiceover: "It's free. Link in bio." },
] as const;

// Four shorter ads, each with its own look. Every one has a hook, a demo and
// the closing call. The spoken hook names the audience first. All numbers are
// the 6-spot sample break: $1,200 box + $60 shipping, fees of 10.9% plus $0.30
// a spot, 20% profit goal.
export const SHORT_LINES = {
  // The receipt.
  fees: {
    hookVoiceover: "Card breakers: adding 20% to your cost doesn't make 20% profit.",
    hookBaseFrames: 50,
    demoVoiceover: "Fees come out of every sale. BreakMath prices for them, so you actually hit your goal.",
    demoBaseFrames: 110,
  },
  // The podium.
  tiers: {
    hookVoiceover: "Card breakers: charging the same for every team?",
    hookBaseFrames: 40,
    demoVoiceover: "Top teams carry more. Weak teams cost less. BreakMath prices each spot by what it's worth.",
    demoBaseFrames: 120,
  },
  // The gauge.
  whatif: {
    hookVoiceover: "Card breakers: how far below list can your spots sell?",
    hookBaseFrames: 45,
    demoVoiceover:
      "At list price, this break makes $253. At 10% under, $101. At 20% under, it loses money. BreakMath shows your floor before you go live.",
    demoBaseFrames: 280,
  },
  // The pack wall, for card-game breakers. A 36-pack box: $160 + $10 shipping,
  // same fees. $5 a pack sells out for $180 and loses $20. $7 a pack lists at
  // $252 and makes $44.
  packs: {
    hookVoiceover: "Pokémon breakers: you can sell every pack and still lose money.",
    hookBaseFrames: 100,
    demoVoiceover: "36 packs at $5 each sells out, and loses $20. BreakMath does the fee math: $7 a pack, $44 profit.",
    demoBaseFrames: 200,
  },
} as const;

// Every clip to record: file name (without .mp3) and the words.
export const ALL_CLIPS: { id: string; text: string }[] = [
  ...REEL_LINES.map((l) => ({ id: l.id, text: l.voiceover })),
  ...Object.entries(SHORT_LINES).flatMap(([id, s]) => [
    { id: `short-${id}-hook`, text: s.hookVoiceover },
    { id: `short-${id}-demo`, text: s.demoVoiceover },
  ]),
];
