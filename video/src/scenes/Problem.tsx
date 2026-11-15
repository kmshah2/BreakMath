import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneShell, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, money, POP } from "../theme";

const GOOD = [
  { label: "Break 1", profit: 210 },
  { label: "Break 2", profit: 180 },
  { label: "Break 3", profit: 240 },
];
const BAD = { label: "Break 4", profit: -630 };
const CRASH = 62;

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 56,
  fontWeight: 600,
  padding: "30px 0",
  borderBottom: `2px solid ${C.line}`,
  fontVariantNumeric: "tabular-nums",
};

// Three good breaks add up, then one bad one takes the month back to zero.
export const Problem: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={72}>
      <Words text="One badly priced break can wipe out several good ones." style={headline} />
      <div
        style={{
          padding: "20px 48px 44px",
          borderRadius: 48,
          backgroundColor: C.surface,
          border: `2px solid ${C.line}`,
        }}
      >
        {GOOD.map((item, i) => (
          <Interactive.Div
            key={item.label}
            name={item.label}
            style={{
              ...row,
              opacity: interpolate(frame, [22 + i * 9, 30 + i * 9], [0, 1], CLAMP),
              translate: interpolate(frame, [22 + i * 9, 38 + i * 9], ["-40px 0px", "0px 0px"], {
                ...CLAMP,
                easing: EASE_OUT,
              }),
            }}
          >
            <span>{item.label}</span>
            <span style={{ color: C.up, fontWeight: 800 }}>+{money(item.profit)}</span>
          </Interactive.Div>
        ))}
        <Interactive.Div
          name={BAD.label}
          style={{
            ...row,
            opacity: interpolate(frame, [CRASH, CRASH + 4], [0, 1], CLAMP),
            scale: interpolate(frame, [CRASH, CRASH + 14], [1.25, 1], {
              ...CLAMP,
              easing: POP,
              output: "perceptual-scale",
            }),
            translate: `${Math.sin(frame * 2.6) * interpolate(frame, [CRASH, CRASH + 20], [16, 0], CLAMP)}px 0px`,
          }}
        >
          <span>{BAD.label}</span>
          <span style={{ color: C.down, fontWeight: 800 }}>{money(BAD.profit)}</span>
        </Interactive.Div>
        <Interactive.Div
          name="Month total"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingTop: 40,
            fontSize: 48,
            fontWeight: 600,
            color: C.muted,
            opacity: interpolate(frame, [22, 32], [0, 1], CLAMP),
          }}
        >
          <span>This month</span>
          <span
            style={{
              fontSize: 120,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              fontVariantNumeric: "tabular-nums",
              color: frame < CRASH ? C.up : C.down,
            }}
          >
            {money(
              frame < CRASH
                ? interpolate(frame, [22, 52], [0, 630], CLAMP)
                : interpolate(frame, [CRASH, CRASH + 26], [630, 0], { ...CLAMP, easing: EASE_OUT }),
            )}
          </span>
        </Interactive.Div>
      </div>
    </SceneShell>
  );
};
