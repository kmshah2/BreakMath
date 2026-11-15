// Scene order and scene lengths. Each scene runs at least its base length and
// stretches to fit its voice clip, using the clip lengths that
// generate-voiceover.ts measures and saves in voice-timing.json.

import { FPS, REEL_LINES, SHORT_LINES } from "./lines";
import timing from "./voice-timing.json";

export { FPS };

const clipSeconds = timing as Record<string, number>;

// Frames a scene needs: a short lead-in, the clip, then a breath before the cut.
const fit = (clipId: string, baseFrames: number) =>
  Math.max(baseFrames, Math.ceil((clipSeconds[clipId] ?? 0) * FPS) + 20);

export const SCRIPT = REEL_LINES.map((line) => ({
  id: line.id,
  voiceover: line.voiceover,
  durationInFrames: fit(line.id, line.baseFrames),
}));

export type SceneId = (typeof REEL_LINES)[number]["id"];

export const TOTAL_FRAMES = SCRIPT.reduce((sum, scene) => sum + scene.durationInFrames, 0);

export type ShortId = keyof typeof SHORT_LINES;

export const SHORTS = Object.fromEntries(
  (Object.keys(SHORT_LINES) as ShortId[]).map((id) => [
    id,
    {
      hook: SHORT_LINES[id].hook,
      hookFrames: fit(`short-${id}-hook`, SHORT_LINES[id].hookBaseFrames),
      demoFrames: fit(`short-${id}-demo`, SHORT_LINES[id].demoBaseFrames),
    },
  ]),
) as Record<ShortId, { hook: string; hookFrames: number; demoFrames: number }>;

export const SHORT_CTA_FRAMES = fit("07-cta", 95);
