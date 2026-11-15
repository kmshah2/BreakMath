import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, EASE_OUT, FOIL, headline, money, POP } from "../theme";

// List total $1,699 less fees less $1,260 cost, from the Tiers scene.
const PROFIT = 251;

// The payoff: the number you get before any box is opened.
export const Profit: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={30}>
      <Sfx name="cash" at={2} volume={0.7} />
      <Interactive.Div name="Label" style={{ fontSize: 52, fontWeight: 600, color: C.muted }}>
        Profit if every spot sells
      </Interactive.Div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: "10% 0",
            background: `conic-gradient(from ${frame * 7}deg, ${FOIL})`,
            filter: "blur(130px)",
            opacity: interpolate(frame, [0, 14], [0, 0.5], CLAMP),
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
            scale: interpolate(frame, [0, 14], [0.6, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
          }}
        >
          {money(interpolate(frame, [0, 16], [0, PROFIT], { ...CLAMP, easing: EASE_OUT }))}
        </Interactive.Div>
      </div>
      <Words text="Know your number before you go live." start={12} style={{ ...headline, marginTop: 30 }} />
      <Interactive.Div
        name="Sample note"
        style={{
          fontSize: 40,
          fontWeight: 500,
          color: C.muted,
          opacity: interpolate(frame, [26, 34], [0, 1], CLAMP),
        }}
      >
        Sample break. Your numbers will differ.
      </Interactive.Div>
    </SceneShell>
  );
};
