# BreakMath launch reel

Vertical video (1080×1920, 30 fps, 28 seconds) for TikTok and Instagram Reels, built with [Remotion](https://www.remotion.dev).

## Voice

The voice is recorded with ElevenLabs (voice: Liam, model: eleven_v4). The clips are in `public/voiceover/`.

To change the words or the voice and re-make every video:

1. Words: edit `src/lines.ts`. Voice: add `ELEVENLABS_VOICE_ID=...` to `.env.local` (the ID is on each voice's page in ElevenLabs).
2. Run:

```
npm run voice
```

That records all 13 lines, stretches each scene to fit, renders all four videos and copies them to `launch/videos/`.

The ElevenLabs key lives in `.env.local`, which is never committed. On a new computer, run `npx -y @elevenlabs/cli@latest onboard init` in this folder to sign in and create one.

## Commands

Run these from this `video/` folder.

| What | Command |
|---|---|
| Preview and edit in the browser | `npm run dev` |
| Record the voice, then render everything | `npm run voice` |
| Only record the voice | `npm run voiceover` |
| Only render all four videos with the current voice | `npm run render:all` |
| Render the silent launch reel | `npm run render` |

Videos are saved to `out/`.

## Other videos

Three shorts live in `src/shorts/` (`Short-fees`, `Short-tiers`, `Short-whatif`) and a square `ProfileImage` still. Render one with, for example:

```
npx remotion render Short-fees out/breakmath-short-fees.mp4
```

## Where things are

- `src/lines.ts`: every spoken line and each scene's minimum length.
- `src/script.ts`: stretches scenes to fit the recorded voice.
- `src/scenes/`: one file per scene.
- `src/parts.tsx`: background, foil card, headline animation, logo.
- `src/theme.ts`: colours, font, easing.

The prices and profit shown come from BreakMath's own formula with the sample numbers ($1,200 box, $60 shipping, 12% fees, 20% profit goal).
