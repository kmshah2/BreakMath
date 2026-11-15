import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { FoilCard, SceneShell, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline } from "../theme";

const FIELDS = [
  { label: "Box cost", value: "$1,200", start: 24 },
  { label: "Platform fees", value: "12%", start: 62 },
  { label: "Profit goal", value: "20%", start: 94 },
];
const FRAMES_PER_KEY = 4;

// The breaker's own numbers being typed into the planner.
export const Inputs: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={72}>
      <Words text="Enter your numbers." style={headline} />
      <FoilCard style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {FIELDS.map((field, i) => {
          const end = field.start + field.value.length * FRAMES_PER_KEY;
          const active = frame >= field.start - 6 && frame < end + 10;
          const typed = field.value.slice(
            0,
            Math.floor(interpolate(frame, [field.start, end], [0, field.value.length], CLAMP)),
          );
          return (
            <Interactive.Div
              key={field.label}
              name={field.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                opacity: interpolate(frame, [8 + i * 5, 18 + i * 5], [0, 1], CLAMP),
                translate: interpolate(frame, [8 + i * 5, 26 + i * 5], ["0px 40px", "0px 0px"], {
                  ...CLAMP,
                  easing: EASE_OUT,
                }),
              }}
            >
              <span style={{ fontSize: 46, fontWeight: 600, color: C.muted }}>{field.label}</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 168,
                  padding: "0 40px",
                  borderRadius: 30,
                  backgroundColor: C.raised,
                  border: `3px solid ${active ? "#9b8cff" : C.line}`,
                  fontSize: 104,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                {typed}
                <span
                  style={{
                    width: 6,
                    height: 96,
                    marginLeft: 8,
                    borderRadius: 3,
                    backgroundColor: C.text,
                    opacity: active && Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
                  }}
                />
              </div>
            </Interactive.Div>
          );
        })}
      </FoilCard>
    </SceneShell>
  );
};
