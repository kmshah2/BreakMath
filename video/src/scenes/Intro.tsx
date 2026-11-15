import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { LogoMark, SceneShell, Sfx, Words } from "../parts";
import { CLAMP, EASE_OUT, FOIL, headline, POP } from "../theme";

// The turn: name the product and what it does.
export const Intro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={36}>
      <Sfx name="whoosh" volume={0.55} />
      <div style={{ position: "relative", width: 240, height: 240 }}>
        <div
          style={{
            position: "absolute",
            inset: -160,
            borderRadius: "50%",
            background: `conic-gradient(from ${frame * 9}deg, ${FOIL})`,
            filter: "blur(120px)",
            opacity: interpolate(frame, [0, 6, 40], [0, 0.75, 0.4], CLAMP),
          }}
        />
        <Interactive.Div
          name="Logo"
          style={{
            position: "relative",
            scale: interpolate(frame, [0, 12], [0.3, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
            rotate: interpolate(frame, [0, 12], ["-18deg", "0deg"], { ...CLAMP, easing: EASE_OUT }),
          }}
        >
          <LogoMark size={240} />
        </Interactive.Div>
      </div>
      <Interactive.Div
        name="Wordmark"
        style={{
          fontSize: 164,
          fontWeight: 800,
          letterSpacing: "-0.045em",
          lineHeight: 1,
          opacity: interpolate(frame, [3, 8], [0, 1], CLAMP),
          translate: interpolate(frame, [3, 14], ["0px 50px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        BreakMath
      </Interactive.Div>
      <Words text="prices every spot before you buy the box." start={10} style={{ ...headline, fontSize: 84 }} />
    </SceneShell>
  );
};
