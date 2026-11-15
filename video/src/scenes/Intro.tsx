import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { LogoMark, SceneShell } from "../parts";
import { C, CLAMP, EASE_OUT, FOIL, POP } from "../theme";

// The turn: name the product.
export const Intro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={40}>
      <div style={{ position: "relative", width: 300, height: 300 }}>
        <div
          style={{
            position: "absolute",
            inset: -160,
            borderRadius: "50%",
            background: `conic-gradient(from ${frame * 5}deg, ${FOIL})`,
            filter: "blur(120px)",
            opacity: interpolate(frame, [0, 14, 60], [0, 0.7, 0.4], CLAMP),
          }}
        />
        <Interactive.Div
          name="Logo"
          style={{
            position: "relative",
            scale: interpolate(frame, [2, 26], [0.4, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
            opacity: interpolate(frame, [2, 10], [0, 1], CLAMP),
            rotate: interpolate(frame, [2, 26], ["-14deg", "0deg"], { ...CLAMP, easing: EASE_OUT }),
          }}
        >
          <LogoMark size={300} />
        </Interactive.Div>
      </div>
      <Interactive.Div
        name="Wordmark"
        style={{
          fontSize: 164,
          fontWeight: 800,
          letterSpacing: "-0.045em",
          lineHeight: 1,
          opacity: interpolate(frame, [12, 24], [0, 1], CLAMP),
          translate: interpolate(frame, [12, 34], ["0px 60px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        BreakMath
      </Interactive.Div>
      <Interactive.Div
        name="Tagline"
        style={{
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: C.muted,
          opacity: interpolate(frame, [26, 38], [0, 1], CLAMP),
          translate: interpolate(frame, [26, 46], ["0px 40px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        does the math.
      </Interactive.Div>
    </SceneShell>
  );
};
