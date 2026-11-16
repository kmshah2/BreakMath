import { AbsoluteFill, Composition, Folder, Still } from "remotion";
import { Background, Field, LogoMark } from "./parts";
import { Reel, SCENE_COMPONENTS } from "./Reel";
import { FPS, SCRIPT, shortFrames, TOTAL_FRAMES } from "./script";
import { FeesAd } from "./shorts/FeesAd";
import { GaugeAd } from "./shorts/GaugeAd";
import { PacksAd } from "./shorts/PacksAd";
import { TiersAd } from "./shorts/TiersAd";

const WIDTH = 1080;
const HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BreakMathReel"
        component={Reel}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={TOTAL_FRAMES}
        defaultProps={{ voiceover: false }}
      />
      <Composition
        id="BreakMathReelWithVoiceover"
        component={Reel}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={TOTAL_FRAMES}
        defaultProps={{ voiceover: true }}
      />
      <Folder name="Shorts">
        {(
          [
            ["fees", FeesAd],
            ["tiers", TiersAd],
            ["whatif", GaugeAd],
            ["packs", PacksAd],
          ] as const
        ).map(([id, component]) => (
          <Composition
            key={id}
            id={`Short-${id}`}
            component={component}
            width={WIDTH}
            height={HEIGHT}
            fps={FPS}
            durationInFrames={shortFrames(id)}
            defaultProps={{ voiceover: true }}
          />
        ))}
      </Folder>
      <Still
        id="ProfileImage"
        width={1080}
        height={1080}
        component={() => (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <Background />
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <LogoMark size={640} />
            </AbsoluteFill>
          </AbsoluteFill>
        )}
      />
      <Folder name="Scenes">
        {SCRIPT.map((scene) => {
          const Scene = SCENE_COMPONENTS[scene.id];
          return (
            <Composition
              key={scene.id}
              id={`Scene-${scene.id}`}
              component={() => (
                <AbsoluteFill>
                  <Field yard={50} />
                  <Scene duration={scene.durationInFrames} />
                </AbsoluteFill>
              )}
              width={WIDTH}
              height={HEIGHT}
              fps={FPS}
              durationInFrames={scene.durationInFrames}
            />
          );
        })}
      </Folder>
    </>
  );
};
