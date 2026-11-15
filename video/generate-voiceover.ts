// Records every voiceover line with ElevenLabs, saves the clips to
// public/voiceover/, and measures them so each scene stretches to fit.
//
//   npm run voice        record, then render every video
//   npm run voiceover    record only
//
// The key is read from ELEVENLABS_API_KEY in .env.local (created by
// `npx @elevenlabs/cli onboard init`). Optional settings in .env.local:
//   ELEVENLABS_VOICE_ID   a different voice (default: Liam)
//   ELEVENLABS_MODEL      a different model (default: eleven_v4)

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { ALL_CLIPS } from "./src/lines.ts";

if (!process.env.ELEVENLABS_API_KEY) {
  console.error("No ElevenLabs key found. Run this from the video folder to sign in and save one:\n\n  npx -y @elevenlabs/cli@latest onboard init\n");
  process.exit(1);
}

// Liam: young American voice ElevenLabs labels "Energetic, Social Media Creator".
const voiceId = process.env.ELEVENLABS_VOICE_ID || "TX3LPaxmHKxFdv7VOQHJ";
const modelId = process.env.ELEVENLABS_MODEL || "eleven_v4";

const client = new ElevenLabsClient();
mkdirSync("public/voiceover", { recursive: true });
const timing: Record<string, number> = {};

for (const clip of ALL_CLIPS) {
  const file = `public/voiceover/${clip.id}.mp3`;
  try {
    const audio = await client.textToSpeech.convert(voiceId, {
      text: clip.text,
      modelId,
      outputFormat: "mp3_44100_128",
      voiceSettings: { stability: 0.45, similarityBoost: 0.75 },
    });
    writeFileSync(file, Buffer.from(await new Response(audio).arrayBuffer()));
  } catch (err) {
    console.error(`ElevenLabs could not record "${clip.id}": ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
  const seconds = Number(execFileSync("afinfo", [file]).toString().match(/estimated duration: ([\d.]+)/)?.[1] ?? 0);
  timing[clip.id] = Math.round(seconds * 100) / 100;
  console.log(`${clip.id}: ${timing[clip.id]}s`);
}

writeFileSync("src/voice-timing.json", JSON.stringify(timing, null, 2) + "\n");
console.log("\nVoice recorded. Scene lengths updated to fit.");
