import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Background } from "./parts";
import { SCRIPT, SceneId } from "./script";
import { Cta } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { Inputs } from "./scenes/Inputs";
import { Intro } from "./scenes/Intro";
import { Problem } from "./scenes/Problem";
import { Profit } from "./scenes/Profit";
import { Tiers } from "./scenes/Tiers";

export const SCENE_COMPONENTS: Record<SceneId, React.FC<{ duration: number }>> = {
  "01-hook": Hook,
  "02-problem": Problem,
  "03-intro": Intro,
  "04-inputs": Inputs,
  "05-tiers": Tiers,
  "06-profit": Profit,
  "07-cta": Cta,
};

export type ReelProps = {
  // Plays public/voiceover/<scene id>.mp3 over each scene. Turn on once the
  // files exist (see generate-voiceover.ts).
  voiceover: boolean;
};

export const Reel: React.FC<ReelProps> = ({ voiceover }) => {
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        {SCRIPT.map((scene) => {
          const Scene = SCENE_COMPONENTS[scene.id];
          return (
            <Series.Sequence key={scene.id} name={scene.id} durationInFrames={scene.durationInFrames}>
              <Scene duration={scene.durationInFrames} />
              {voiceover ? <Audio from={6} src={staticFile(`voiceover/${scene.id}.mp3`)} /> : null}
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
