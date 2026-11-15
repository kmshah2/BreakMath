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

// Three shorter follow-up videos. Each is a hook, one demo and the closing
// call to try it. The spoken hook names the audience first.
export const SHORT_LINES = {
  fees: {
    hook: "Adding 20% to your cost doesn't make 20% profit.",
    hookVoiceover: "Card breakers: adding 20% to your cost doesn't make 20% profit.",
    hookBaseFrames: 50,
    demoVoiceover: "Fees come out of every sale. BreakMath prices for them, so you actually hit your goal.",
    demoBaseFrames: 110,
  },
  tiers: {
    hook: "Charging the same for every team?",
    hookVoiceover: "Card breakers: charging the same for every team?",
    hookBaseFrames: 40,
    demoVoiceover: "Top teams carry more. Weak teams cost less. BreakMath prices each spot by what it's worth.",
    demoBaseFrames: 120,
  },
  whatif: {
    hook: "How far below list can your spots sell?",
    hookVoiceover: "Card breakers: how far below list can your spots sell?",
    hookBaseFrames: 45,
    demoVoiceover:
      "At list price, this break makes $254. At 10% under, $102. At 20% under, it loses money. BreakMath shows your floor before you go live.",
    demoBaseFrames: 280,
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
