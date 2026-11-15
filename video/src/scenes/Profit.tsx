import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneShell, Words } from "../parts";
import { C, CLAMP, EASE_OUT, FOIL, headline, money, POP } from "../theme";

// List total $1,717 less 12% fees less $1,260 cost, from the Tiers scene.
const PROFIT = 251;

// The payoff: the number you get before any box is opened.
export const Profit: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={36}>
      <Interactive.Div
        name="Label"
        style={{
          fontSize: 52,
          fontWeight: 600,
          color: C.muted,
          opacity: interpolate(frame, [4, 14], [0, 1], CLAMP),
        }}
      >
        Profit if every spot sells
      </Interactive.Div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: "10% 0",
            background: `conic-gradient(from ${frame * 3}deg, ${FOIL})`,
            filter: "blur(130px)",
            opacity: interpolate(frame, [8, 40], [0, 0.42], CLAMP),
          }}
        />
        <Interactive.Div
          name="Profit"
          style={{
            position: "relative",
            fontSize: 380,
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 0.95,
            color: C.up,
            fontVariantNumeric: "tabular-nums",
            transformOrigin: "left center",
            scale: interpolate(frame, [8, 34], [0.7, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
            opacity: interpolate(frame, [8, 14], [0, 1], CLAMP),
          }}
        >
          {money(interpolate(frame, [8, 42], [0, PROFIT], { ...CLAMP, easing: EASE_OUT }))}
        </Interactive.Div>
      </div>
      <Words
        text="Know your profit before you open the box."
        start={40}
        style={{ ...headline, marginTop: 40 }}
      />
      <Interactive.Div
        name="Sample note"
        style={{
          fontSize: 40,
          fontWeight: 500,
          color: C.muted,
          opacity: interpolate(frame, [64, 76], [0, 1], CLAMP),
        }}
      >
        Sample break. Your numbers will differ.
      </Interactive.Div>
    </SceneShell>
  );
};
