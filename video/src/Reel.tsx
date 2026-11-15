import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, Series, staticFile, useCurrentFrame } from "remotion";
import { Chrome, Field, Music, SoundContext } from "./parts";
import { SCRIPT, SceneId, VOICE_RATE } from "./script";
import { Cards } from "./scenes/Cards";
import { Cta } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { Inputs } from "./scenes/Inputs";
import { Intro } from "./scenes/Intro";
import { Profit } from "./scenes/Profit";

export const SCENE_COMPONENTS: Record<SceneId, React.FC<{ duration: number }>> = {
  "01-hook": Hook,
  "02-what": Intro,
  "03-inputs": Inputs,
  "04-cards": Cards,
  "05-profit": Profit,
  "06-cta": Cta,
};

// Where the camera is on the field at the end of each scene, in yards. The
// video is one drive: own 18 to the end zone, arriving as the profit lands.
const YARD_AFTER_SCENE = [30, 44, 62, 93, 104, 106];

export type ReelProps = {
  // Adds the voice (public/voiceover), music and sound effects (public/audio).
  voiceover: boolean;
};

export const Reel: React.FC<ReelProps> = ({ voiceover }) => {
  const frame = useCurrentFrame();
  const cuts = SCRIPT.reduce<number[]>((acc, scene) => [...acc, acc[acc.length - 1] + scene.durationInFrames], [0]);
  const yard = interpolate(frame, cuts, [18, ...YARD_AFTER_SCENE], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SCRIPT.map(() => Easing.inOut(Easing.quad)),
  });
  return (
    <SoundContext.Provider value={voiceover}>
      <AbsoluteFill>
        <Field yard={yard} />
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
