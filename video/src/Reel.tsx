import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Background, Chrome, Music, SoundContext } from "./parts";
import { SCRIPT, SceneId, VOICE_RATE } from "./script";
import { Cta } from "./scenes/Cta";
import { Fill } from "./scenes/Fill";
import { Hook } from "./scenes/Hook";
import { Inputs } from "./scenes/Inputs";
import { Intro } from "./scenes/Intro";
import { Profit } from "./scenes/Profit";
import { Tiers } from "./scenes/Tiers";

export const SCENE_COMPONENTS: Record<SceneId, React.FC<{ duration: number }>> = {
  "01-hook": Hook,
  "02-turn": Intro,
  "03-inputs": Inputs,
  "04-tiers": Tiers,
  "05-fill": Fill,
  "06-profit": Profit,
  "07-cta": Cta,
};

export type ReelProps = {
  // Adds the voice (public/voiceover), music and sound effects (public/audio).
  voiceover: boolean;
};

export const Reel: React.FC<ReelProps> = ({ voiceover }) => {
  return (
    <SoundContext.Provider value={voiceover}>
      <AbsoluteFill>
        <Background />
        <Music />
        <Series>
          {SCRIPT.map((scene) => {
            const Scene = SCENE_COMPONENTS[scene.id as SceneId];
            return (
              <Series.Sequence key={scene.id} name={scene.id} durationInFrames={scene.durationInFrames}>
                <Scene duration={scene.durationInFrames} />
                {voiceover ? (
                  <Audio from={2} playbackRate={VOICE_RATE} src={staticFile(`voiceover/${scene.id}.mp3`)} />
                ) : null}
              </Series.Sequence>
            );
          })}
        </Series>
        <Chrome />
      </AbsoluteFill>
    </SoundContext.Provider>
  );
};
