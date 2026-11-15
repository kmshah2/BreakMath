// Every spoken line in every video, with the shortest each scene may run.
// Plain data only: generate-voiceover.ts reads this file directly.

export const FPS = 30;

// The voice is played back slightly faster than recorded to keep the pace up.
export const VOICE_RATE = 1.12;

export const REEL_LINES = [
  { id: "01-hook", baseFrames: 70, voiceover: "Your break sold out. And you still lost money." },
  { id: "02-turn", baseFrames: 55, voiceover: "BreakMath prices every spot before you buy the box." },
  { id: "03-inputs", baseFrames: 55, voiceover: "Enter your cost and your real fees." },
  { id: "04-tiers", baseFrames: 70, voiceover: "Rate each team. Every spot gets a price." },
  { id: "05-fill", baseFrames: 55, voiceover: "See your profit, even if it doesn't sell out." },
  { id: "06-profit", baseFrames: 50, voiceover: "Know your number before you go live." },
  { id: "07-cta", baseFrames: 50, voiceover: "It's free. Link in bio." },
] as const;

// Three shorter follow-up videos. Each is a hook, one demo and the closing
// call to try it.
export const SHORT_LINES = {
  fees: {
    hook: "Adding 20% to your cost doesn't make 20% profit.",
    hookBaseFrames: 50,
    demoVoiceover: "Fees come out of every sale. Price for them, and you actually hit your goal.",
    demoBaseFrames: 110,
  },
  tiers: {
    hook: "Charging the same for every team?",
    hookBaseFrames: 40,
    demoVoiceover: "Top teams carry more. Weak teams cost less. Same total, priced by what each spot is worth.",
    demoBaseFrames: 120,
  },
  whatif: {
    hook: "How far below list can your spots sell?",
    hookBaseFrames: 45,
    demoVoiceover:
      "At list price, this break makes $254. At 10% under, $102. At 20% under, it loses money. Know your floor before you go live.",
    demoBaseFrames: 280,
  },
} as const;

// Every clip to record: file name (without .mp3) and the words.
export const ALL_CLIPS: { id: string; text: string }[] = [
  ...REEL_LINES.map((l) => ({ id: l.id, text: l.voiceover })),
  ...Object.entries(SHORT_LINES).flatMap(([id, s]) => [
    { id: `short-${id}-hook`, text: s.hook },
    { id: `short-${id}-demo`, text: s.demoVoiceover },
  ]),
];
