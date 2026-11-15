import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, POP } from "../theme";

// The ask.
export const Cta: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={52}>
      <Sfx name="whoosh" volume={0.5} />
      <Sfx name="impact" at={8} volume={0.5} />
      <Words text="It's free." style={{ ...headline, fontSize: 200 }} />
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
          opacity: interpolate(frame, [8, 11], [0, 1], CLAMP),
          scale: interpolate(
            frame,
            [8, 20, 30, 38, 46],
            [0.6, 1, 1, 1.06, 1],
            { ...CLAMP, easing: [POP, EASE_OUT, EASE_OUT, EASE_OUT], output: "perceptual-scale" },
          ),
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
          opacity: interpolate(frame, [16, 22], [0, 1], CLAMP),
          translate: interpolate(frame, [16, 26], ["0px 30px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        No account. No card needed.
      </Interactive.Div>
    </SceneShell>
  );
};
