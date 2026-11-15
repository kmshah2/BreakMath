import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { LogoMark, SceneShell, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, POP } from "../theme";

// The ask.
export const Cta: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={56}>
      <Interactive.Div
        name="Brand"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          opacity: interpolate(frame, [2, 12], [0, 1], CLAMP),
        }}
      >
        <LogoMark size={96} />
        BreakMath
      </Interactive.Div>
      <Words text="Try it free." start={8} style={{ ...headline, fontSize: 150 }} />
      <Interactive.Div
        name="Button"
        style={{
          alignSelf: "flex-start",
          padding: "40px 72px",
          borderRadius: 999,
          backgroundColor: C.text,
          color: C.bg,
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          opacity: interpolate(frame, [26, 32], [0, 1], CLAMP),
          scale: interpolate(frame, [26, 48], [0.7, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
          transformOrigin: "left center",
        }}
      >
        Link in bio
      </Interactive.Div>
      <Interactive.Div
        name="Fine print"
        style={{
          fontSize: 48,
          fontWeight: 500,
          color: C.muted,
          opacity: interpolate(frame, [44, 56], [0, 1], CLAMP),
          translate: interpolate(frame, [44, 62], ["0px 30px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        No account. No card needed.
      </Interactive.Div>
    </SceneShell>
  );
};
