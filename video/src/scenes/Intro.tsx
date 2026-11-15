import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { glass, LogoMark, SceneShell, Sfx, Words } from "../parts";
import { CLAMP, EASE_OUT, headline, POP } from "../theme";

// Says plainly what BreakMath is.
export const Intro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={40}>
      <Sfx name="whoosh" volume={0.55} />
      <Interactive.Div
        name="Brand"
        style={{
          ...glass,
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "34px 48px",
          scale: interpolate(frame, [0, 12], [0.5, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
          transformOrigin: "left center",
        }}
      >
        <LogoMark size={150} />
        <span style={{ fontSize: 124, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1 }}>BreakMath</span>
      </Interactive.Div>
      <Words
        text="A free app that tells you what to charge for every spot."
        start={8}
        style={{ ...headline, fontSize: 108 }}
      />
      <Interactive.Div
        name="Where"
        style={{
          fontSize: 50,
          fontWeight: 600,
          opacity: interpolate(frame, [34, 42], [0, 0.9], CLAMP),
          translate: interpolate(frame, [34, 46], ["0px 30px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        For team breaks on Whatnot and other live apps
      </Interactive.Div>
    </SceneShell>
  );
};
