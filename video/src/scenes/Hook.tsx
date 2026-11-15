import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneShell, Sfx } from "../parts";
import { C, CLAMP, EASE_OUT, POP } from "../theme";

const TEAMS = ["Kansas City", "Philadelphia", "Dallas", "Buffalo", "Detroit", "Chicago", "Denver", "Seattle"];
// Every spot sells for $1,300 in total. Fees of 10.9% plus $0.30 a spot take
// $144, the box and shipping cost $1,260: a $104 loss on a sold-out break.
const SLAM = 44;

// The hook: every spot sells, and the break still loses money.
export const Hook: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={40}>
      <Sfx name="pop" at={2} volume={0.5} />
      <Sfx name="pop" at={10} volume={0.5} />
      <Sfx name="impact" at={SLAM} volume={0.85} />
      <Interactive.Div
        name="Sold out"
        style={{
          fontSize: 150,
          fontWeight: 800,
          letterSpacing: "-0.045em",
          lineHeight: 1,
          color: C.up,
          opacity: interpolate(frame, [0, 3, SLAM - 2, SLAM + 3], [0, 1, 1, 0], CLAMP),
          scale: interpolate(frame, [0, 10], [1.3, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
          transformOrigin: "left center",
        }}
      >
        Sold out.
      </Interactive.Div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          opacity: interpolate(frame, [SLAM - 2, SLAM + 3], [1, 0.07], CLAMP),
        }}
      >
        {TEAMS.map((team, i) => {
          const sold = frame >= 3 + i * 2;
          return (
            <div
              key={team}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "26px 30px",
                borderRadius: 28,
                backgroundColor: sold ? "rgba(99, 230, 169, 0.13)" : C.surface,
                border: `3px solid ${sold ? "rgba(99, 230, 169, 0.6)" : C.line}`,
                scale: interpolate(frame, [3 + i * 2, 9 + i * 2], [1.12, 1], { ...CLAMP, easing: EASE_OUT }),
              }}
            >
              <span style={{ fontSize: 44, fontWeight: 700 }}>{team}</span>
              <span style={{ fontSize: 38, fontWeight: 800, color: sold ? C.up : C.muted }}>{sold ? "SOLD" : "Open"}</span>
            </div>
          );
        })}
      </div>
      <Interactive.Div
        name="Loss"
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 560,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          opacity: interpolate(frame, [SLAM, SLAM + 3], [0, 1], CLAMP),
          scale: interpolate(frame, [SLAM, SLAM + 12], [1.6, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
          translate: `${Math.sin(frame * 2.8) * interpolate(frame, [SLAM, SLAM + 14], [20, 0], CLAMP)}px 0px`,
        }}
      >
        <span style={{ fontSize: 110, fontWeight: 800, letterSpacing: "-0.035em" }}>Sold out. Still lost</span>
        <span
          style={{
            fontSize: 310,
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 0.92,
            color: C.down,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          -$104
        </span>
        <span style={{ fontSize: 44, fontWeight: 600, color: C.muted, lineHeight: 1.3 }}>
          $1,300 in sales, $144 in fees, $1,260 box
        </span>
      </Interactive.Div>
    </SceneShell>
  );
};
