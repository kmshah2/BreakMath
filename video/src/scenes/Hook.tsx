import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneShell, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, money } from "../theme";

const ROWS = [
  { team: "Kansas City", guesses: [150, 200, 120, 175, 140, 190, 160] },
  { team: "Dallas", guesses: [150, 110, 165, 130, 180, 125, 145] },
  { team: "Seattle", guesses: [150, 90, 135, 70, 115, 100, 80] },
];

// A spot list whose prices will not hold still: pricing by gut feel.
export const Hook: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={90}>
      <Words text="Still pricing your break spots by gut feel?" style={{ ...headline, fontSize: 112 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {ROWS.map((row, i) => (
          <Interactive.Div
            key={row.team}
            name={`Guess ${row.team}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "34px 44px",
              borderRadius: 32,
              backgroundColor: C.surface,
              border: `2px solid ${C.line}`,
              fontSize: 56,
              fontWeight: 600,
              opacity: interpolate(frame, [24 + i * 5, 34 + i * 5], [0, 1], CLAMP),
              translate: interpolate(frame, [24 + i * 5, 42 + i * 5], ["0px 50px", "0px 0px"], {
                ...CLAMP,
                easing: EASE_OUT,
              }),
            }}
          >
            <span>{row.team}</span>
            <span
              style={{
                fontSize: 68,
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
                color: C.muted,
                translate: `${Math.sin((frame + i * 9) * 1.9) * 5}px 0px`,
              }}
            >
              {money(row.guesses[Math.floor(Math.max(0, frame - 30) / 6 + i) % row.guesses.length])}?
            </span>
          </Interactive.Div>
        ))}
      </div>
    </SceneShell>
  );
};
