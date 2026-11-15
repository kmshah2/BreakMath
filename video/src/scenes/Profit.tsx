import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { Confetti, SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, money, POP } from "../theme";

// $1,700 list, less fees of 10.9% plus $0.30 a spot, less $1,260 cost.
const PROFIT = 253;

// Touchdown: the field reaches the end zone and the profit number lands.
export const Profit: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <SceneShell duration={duration} gap={26}>
        <Sfx name="cash" at={4} volume={0.75} />
        <Sfx name="impact" at={4} volume={0.6} />
        <Interactive.Div name="Label" style={{ fontSize: 56, fontWeight: 700 }}>
          Your profit if every spot sells
        </Interactive.Div>
        <Interactive.Div
          name="Profit"
          style={{
            fontSize: 400,
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 0.95,
            color: C.up,
            fontVariantNumeric: "tabular-nums",
            transformOrigin: "left center",
            scale: interpolate(frame, [2, 16], [0.5, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
          }}
        >
          {money(interpolate(frame, [2, 18], [0, PROFIT], { ...CLAMP, easing: EASE_OUT }))}
        </Interactive.Div>
        <Words
          text="Before you buy the box."
          start={14}
          style={{ ...headline, fontSize: 108, marginTop: 20, textShadow: "0 4px 40px rgba(0, 0, 0, 0.95), 0 0 12px rgba(0, 0, 0, 0.8)" }}
        />
        <Interactive.Div
          name="Sample note"
          style={{
            alignSelf: "flex-start",
            padding: "12px 26px",
            borderRadius: 999,
            backgroundColor: "rgba(5, 6, 10, 0.82)",
            fontSize: 38,
            fontWeight: 600,
            textShadow: "none",
            opacity: interpolate(frame, [26, 34], [0, 1], CLAMP),
          }}
        >
          Sample break. Your numbers will differ.
        </Interactive.Div>
      </SceneShell>
      <Confetti at={4} />
    </>
  );
};
