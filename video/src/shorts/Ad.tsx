import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Chrome, Music, SoundContext } from "../parts";
import { Cta } from "../scenes/Cta";
import { SHORT_CTA_FRAMES, SHORTS, ShortId, VOICE_RATE } from "../script";

export type AdProps = { voiceover: boolean };

// The frame every short ad shares: its own world behind, then hook, demo and
// the closing call, with that ad's voice clips and music track.
export const Ad: React.FC<{
  id: ShortId;
  voiceover: boolean;
  world: React.ReactNode;
  Hook: React.FC<{ duration: number }>;
  Demo: React.FC<{ duration: number }>;
}> = ({ id, voiceover, world, Hook, Demo }) => {
  const { hookFrames, demoFrames } = SHORTS[id];
  const voice = (clip: string) =>
    voiceover ? <Audio from={2} playbackRate={VOICE_RATE} src={staticFile(`voiceover/${clip}.mp3`)} /> : null;
  return (
    <SoundContext.Provider value={voiceover}>
      <AbsoluteFill>
        {world}
        <Music track={`music-${id}`} />
        <Series>
          <Series.Sequence name="Hook" durationInFrames={hookFrames}>
            <Hook duration={hookFrames} />
            {voice(`short-${id}-hook`)}
          </Series.Sequence>
          <Series.Sequence name="Demo" durationInFrames={demoFrames}>
            <Demo duration={demoFrames} />
            {voice(`short-${id}-demo`)}
          </Series.Sequence>
          <Series.Sequence name="Call to action" durationInFrames={SHORT_CTA_FRAMES}>
            <Cta duration={SHORT_CTA_FRAMES} />
            {voice("06-cta")}
          </Series.Sequence>
        </Series>
        <Chrome />
      </AbsoluteFill>
    </SoundContext.Provider>
  );
};
