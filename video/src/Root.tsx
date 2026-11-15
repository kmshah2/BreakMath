import { AbsoluteFill, Composition, Folder, Still } from "remotion";
import { Background, Field, LogoMark } from "./parts";
import { Reel, SCENE_COMPONENTS } from "./Reel";
import { FPS, SCRIPT, SHORTS, ShortId, TOTAL_FRAMES } from "./script";
import { Short, shortFrames } from "./shorts/Short";

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
        {(Object.keys(SHORTS) as ShortId[]).map((id) => (
          <Composition
            key={id}
            id={`Short-${id}`}
            component={Short}
            width={WIDTH}
            height={HEIGHT}
            fps={FPS}
            durationInFrames={shortFrames(id)}
            defaultProps={{ id, voiceover: true }}
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
