import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { glass, LogoMark, SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, POP } from "../theme";

// The ask, with the product named once more.
export const Cta: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={44}>
      <Sfx name="whoosh" volume={0.5} />
      <Sfx name="impact" at={8} volume={0.5} />
      <Interactive.Div
        name="Brand"
        style={{
          ...glass,
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "center",
          gap: 26,
          padding: "28px 42px",
          opacity: interpolate(frame, [0, 4], [0, 1], CLAMP),
        }}
      >
        <LogoMark size={110} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 84, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>BreakMath</span>
          <span style={{ fontSize: 40, fontWeight: 600, color: C.muted }}>Spot pricing for card breaks</span>
        </div>
      </Interactive.Div>
      <Words text="Price your next break free." start={4} style={{ ...headline, fontSize: 132 }} />
      <Interactive.Div
        name="Button"
        style={{
          alignSelf: "flex-start",
          padding: "44px 80px",
          borderRadius: 999,
          backgroundColor: C.text,
          color: C.bg,
          fontSize: 84,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          textShadow: "none",
          opacity: interpolate(frame, [12, 15], [0, 1], CLAMP),
          scale: interpolate(frame, [12, 24, 34, 42, 50], [0.6, 1, 1, 1.06, 1], {
            ...CLAMP,
            easing: [POP, EASE_OUT, EASE_OUT, EASE_OUT],
            output: "perceptual-scale",
          }),
          transformOrigin: "left center",
        }}
      >
        Link in bio
      </Interactive.Div>
      <Interactive.Div
        name="Fine print"
        style={{
          fontSize: 48,
          fontWeight: 600,
          opacity: interpolate(frame, [20, 26], [0, 0.9], CLAMP),
          translate: interpolate(frame, [20, 30], ["0px 30px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        No account. No card needed.
      </Interactive.Div>
    </SceneShell>
  );
};
