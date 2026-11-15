import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, money } from "../theme";

// Same break as the Tiers scene: $1,699 list, fees of 10.9% plus $0.30 a spot,
// $1,260 cost. Profit if only part of the break sells.
const ROWS = [
  { sold: "100% sold", profit: 251 },
  { sold: "90% sold", profit: 100 },
  { sold: "80% sold", profit: -51 },
  { sold: "70% sold", profit: -202 },
];

// What the break makes if it doesn't sell out.
export const Fill: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={48}>
      <Sfx name="whoosh" volume={0.5} />
      <Words text="Even if it doesn't sell out." style={headline} />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {ROWS.map((row, i) => {
          const start = 6 + i * 6;
          return (
            <Interactive.Div
              key={row.sold}
              name={row.sold}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "34px 44px",
                borderRadius: 32,
                backgroundColor: row.profit < 0 ? "rgba(255, 128, 128, 0.1)" : "rgba(99, 230, 169, 0.1)",
                border: `3px solid ${row.profit < 0 ? "rgba(255, 128, 128, 0.45)" : "rgba(99, 230, 169, 0.45)"}`,
                fontVariantNumeric: "tabular-nums",
                opacity: interpolate(frame, [start, start + 4], [0, 1], CLAMP),
                translate: interpolate(frame, [start, start + 10], ["80px 0px", "0px 0px"], {
                  ...CLAMP,
                  easing: EASE_OUT,
                }),
              }}
            >
              <span style={{ fontSize: 60, fontWeight: 700 }}>{row.sold}</span>
              <span
                style={{
                  fontSize: 96,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: row.profit < 0 ? C.down : C.up,
                }}
              >
                {money(interpolate(frame, [start, start + 12], [0, row.profit], { ...CLAMP, easing: EASE_OUT }))}
              </span>
            </Interactive.Div>
          );
        })}
      </div>
    </SceneShell>
  );
};
