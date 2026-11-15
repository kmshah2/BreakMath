// Every spoken line in every video, with the shortest each scene may run.
// Plain data only: generate-voiceover.ts reads this file directly.

export const FPS = 30;

export const REEL_LINES = [
  { id: "01-hook", baseFrames: 105, voiceover: "Still pricing your break spots by gut feel?" },
  { id: "02-problem", baseFrames: 135, voiceover: "One badly priced break can wipe out several good ones." },
  { id: "03-intro", baseFrames: 75, voiceover: "BreakMath does the math." },
  { id: "04-inputs", baseFrames: 150, voiceover: "Enter your box cost, your fees, and the profit you want." },
  { id: "05-tiers", baseFrames: 165, voiceover: "Rate each team, and get a price for every spot." },
  { id: "06-profit", baseFrames: 105, voiceover: "Know your profit before you open the box." },
  { id: "07-cta", baseFrames: 95, voiceover: "Try it free. Link in bio." },
] as const;

// Three shorter follow-up videos. Each is a hook, one demo and the closing
// call to try it. Numbers all come from the same sample break as the main reel
// ($1,200 box, $60 shipping, 12% fees, 20% profit goal, 8 spots).
export const SHORT_LINES = {
  fees: {
    hook: "Adding 20% to your cost doesn't make 20% profit.",
    hookBaseFrames: 105,
    demoVoiceover: "Fees come out of every sale. Price for them, and you actually hit your goal.",
    demoBaseFrames: 190,
  },
  tiers: {
    hook: "Charging the same for every team?",
    hookBaseFrames: 75,
    demoVoiceover: "Top teams carry more. Weak teams cost less. Same total, priced by what each spot is worth.",
    demoBaseFrames: 200,
  },
  whatif: {
    hook: "How far below list can your spots sell?",
    hookBaseFrames: 85,
    demoVoiceover:
      "At list price, this break makes $254. At 10% under, $102. At 20% under, it loses money. Know your floor before you go live.",
    demoBaseFrames: 330,
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
