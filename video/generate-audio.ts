// Makes the background music and sound effects with ElevenLabs and saves them
// to public/audio/. Run once; re-run only to get different sounds.
//
//   npm run audio

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { mkdirSync, writeFileSync } from "node:fs";

if (!process.env.ELEVENLABS_API_KEY) {
  console.error("No ElevenLabs key found. Run `npx -y @elevenlabs/cli@latest onboard init` in this folder first.");
  process.exit(1);
}

const client = new ElevenLabsClient();
mkdirSync("public/audio", { recursive: true });

const save = async (name: string, audio: ReadableStream<Uint8Array>) => {
  writeFileSync(`public/audio/${name}.mp3`, Buffer.from(await new Response(audio).arrayBuffer()));
  console.log(`Saved public/audio/${name}.mp3`);
};

const EFFECTS = [
  { name: "whoosh", text: "Fast clean whoosh swoosh transition, short, dry, no reverb", durationSeconds: 0.6 },
  { name: "impact", text: "Deep punchy cinematic bass impact hit, short tail", durationSeconds: 1.2 },
  { name: "pop", text: "Single bright soft UI pop, very short, clean", durationSeconds: 0.5 },
  { name: "cash", text: "Bright cash register cha-ching bell, clean, short", durationSeconds: 1.2 },
];

const only = process.argv[2];

for (const effect of EFFECTS) {
  if (only && only !== effect.name) continue;
  try {
    await save(
      effect.name,
      await client.textToSoundEffects.convert({
        text: effect.text,
        durationSeconds: effect.durationSeconds,
        promptInfluence: 0.6,
        modelId: "eleven_text_to_sound_v3",
      }),
    );
  } catch (err) {
    console.error(`Could not make "${effect.name}": ${err instanceof Error ? err.message : err}`);
  }
}

if (!only || only === "music") {
  try {
    await save(
      "music",
      await client.music.compose({
        prompt:
          "Upbeat, confident instrumental for a short social media ad. Punchy modern drums, bouncy 808 bass, bright synth plucks, driving energy from the first beat with no slow intro, 122 BPM, no vocals.",
        musicLengthMs: 30000,
        modelId: "music_v2_5",
      }),
    );
  } catch (err) {
    console.error(`Could not make the music: ${err instanceof Error ? err.message : err}`);
  }
}
