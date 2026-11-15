// Scene order and scene lengths. Each scene runs at least its base length and
// stretches to fit its voice clip, using the clip lengths that
// generate-voiceover.ts measures and saves in voice-timing.json.

import { FPS, REEL_LINES, SHORT_LINES, VOICE_RATE } from "./lines";
import timing from "./voice-timing.json";

export { FPS, VOICE_RATE };

const clipSeconds = timing as Record<string, number>;

// Frames a scene needs: the clip at playback speed plus a beat before the cut.
const fit = (clipId: string, baseFrames: number) =>
  Math.max(baseFrames, Math.ceil(((clipSeconds[clipId] ?? 0) / VOICE_RATE) * FPS) + 10);

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
      hookFrames: fit(`short-${id}-hook`, SHORT_LINES[id].hookBaseFrames),
      demoFrames: fit(`short-${id}-demo`, SHORT_LINES[id].demoBaseFrames),
    },
  ]),
) as Record<ShortId, { hookFrames: number; demoFrames: number }>;

export const SHORT_CTA_FRAMES = fit("06-cta", 55);

export const shortFrames = (id: ShortId) => SHORTS[id].hookFrames + SHORTS[id].demoFrames + SHORT_CTA_FRAMES;
