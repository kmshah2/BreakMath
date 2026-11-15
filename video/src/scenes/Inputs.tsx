import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { FoilCard, SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline } from "../theme";

const FIELDS = [
  { label: "Box cost", value: "$1,200", start: 6 },
  { label: "Fees", value: "10.9% + $0.30", start: 20 },
  { label: "Profit goal", value: "20%", start: 40 },
];
const FRAMES_PER_KEY = 1.4;

// The breaker's own numbers being typed into the planner.
export const Inputs: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration}>
      <Sfx name="whoosh" volume={0.5} />
      <Words text="Your cost. Your real fees." style={headline} />
      <FoilCard style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        {FIELDS.map((field, i) => {
          const end = field.start + field.value.length * FRAMES_PER_KEY;
          const active = frame >= field.start - 3 && frame < end + 6;
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
                gap: 14,
                opacity: interpolate(frame, [i * 2, 5 + i * 2], [0, 1], CLAMP),
                translate: interpolate(frame, [i * 2, 10 + i * 2], ["0px 40px", "0px 0px"], {
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
                  height: 160,
                  padding: "0 40px",
                  borderRadius: 30,
                  backgroundColor: C.raised,
                  border: `3px solid ${active ? "#9b8cff" : C.line}`,
                  fontSize: 96,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                {typed}
                <span
                  style={{
                    width: 6,
                    height: 90,
                    marginLeft: 8,
                    borderRadius: 3,
                    backgroundColor: C.text,
                    opacity: active ? 1 : 0,
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
