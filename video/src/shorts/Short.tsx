import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Series, staticFile, useCurrentFrame } from "remotion";
import { AudienceTag, Chrome, Field, Music, SceneShell, Sfx, SoundContext, Words } from "../parts";
import { Cta } from "../scenes/Cta";
import { SHORT_CTA_FRAMES, SHORTS, ShortId, VOICE_RATE } from "../script";
import { headline } from "../theme";
import { FeesDemo } from "./FeesDemo";
import { TiersDemo } from "./TiersDemo";
import { WhatIfDemo } from "./WhatIfDemo";

const DEMOS: Record<ShortId, React.FC<{ duration: number }>> = {
  fees: FeesDemo,
  tiers: TiersDemo,
  whatif: WhatIfDemo,
};

export const shortFrames = (id: ShortId) => SHORTS[id].hookFrames + SHORTS[id].demoFrames + SHORT_CTA_FRAMES;

export type ShortProps = { id: ShortId; voiceover: boolean };

// A follow-up video: hook line, one demo, closing call.
export const Short: React.FC<ShortProps> = ({ id, voiceover }) => {
  const short = SHORTS[id];
  const Demo = DEMOS[id];
  const frame = useCurrentFrame();
  const total = shortFrames(id);
  // One drive from midfield into the end zone, arriving for the closing call.
  const yard = interpolate(frame, [0, total - SHORT_CTA_FRAMES, total], [52, 98, 104], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <SoundContext.Provider value={voiceover}>
      <AbsoluteFill>
        <Field yard={yard} />
        <Music />
        <Series>
          <Series.Sequence name="Hook" durationInFrames={short.hookFrames}>
            <SceneShell duration={short.hookFrames}>
              <Sfx name="impact" volume={0.8} />
              <AudienceTag />
              <Words text={short.hook} start={4} style={{ ...headline, fontSize: 132 }} />
            </SceneShell>
            {voiceover ? (
              <Audio from={2} playbackRate={VOICE_RATE} src={staticFile(`voiceover/short-${id}-hook.mp3`)} />
            ) : null}
          </Series.Sequence>
          <Series.Sequence name="Demo" durationInFrames={short.demoFrames}>
            <Sfx name="whoosh" volume={0.5} />
            <Demo duration={short.demoFrames} />
            {voiceover ? (
              <Audio from={2} playbackRate={VOICE_RATE} src={staticFile(`voiceover/short-${id}-demo.mp3`)} />
            ) : null}
          </Series.Sequence>
          <Series.Sequence name="Call to action" durationInFrames={SHORT_CTA_FRAMES}>
            <Cta duration={SHORT_CTA_FRAMES} />
            {voiceover ? <Audio from={2} playbackRate={VOICE_RATE} src={staticFile("voiceover/06-cta.mp3")} /> : null}
          </Series.Sequence>
        </Series>
        <Chrome />
      </AbsoluteFill>
    </SoundContext.Provider>
  );
};
