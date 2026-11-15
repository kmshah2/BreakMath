import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { glass, SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, POP } from "../theme";

const FIELDS = [
  { label: "Box cost", value: "$1,200", start: 6 },
  { label: "Fees", value: "10.9% + $0.30", start: 18 },
  { label: "Profit goal", value: "20%", start: 36 },
];
const FRAMES_PER_KEY = 1.3;
const TIERS = [
  { label: "Top", style: { backgroundColor: C.text, color: C.bg } },
  { label: "Mid", style: { backgroundColor: "rgba(255, 255, 255, 0.2)", color: C.text } },
  { label: "Low", style: { border: `3px solid ${C.line}`, color: C.muted } },
];

// The breaker's own numbers go in, then each team gets a tier.
export const Inputs: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={44}>
      <Sfx name="whoosh" volume={0.5} />
      <Sfx name="pop" at={48} volume={0.6} />
      <Words text="Your cost. Your fees. Your teams." style={headline} />
      <div style={{ ...glass, display: "flex", flexDirection: "column", padding: "16px 48px" }}>
        {FIELDS.map((field, i) => {
          const end = field.start + field.value.length * FRAMES_PER_KEY;
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
                alignItems: "center",
                justifyContent: "space-between",
                height: 150,
                borderBottom: i < FIELDS.length - 1 ? `2px solid ${C.line}` : "none",
              }}
            >
              <span style={{ fontSize: 50, fontWeight: 600, color: C.muted }}>{field.label}</span>
              <span style={{ fontSize: 78, fontWeight: 800, letterSpacing: "-0.03em" }}>
                {typed}
                <span style={{ opacity: frame >= field.start && frame < end + 4 ? 1 : 0, color: "#9b8cff" }}>|</span>
              </span>
            </Interactive.Div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ fontSize: 48, fontWeight: 700, whiteSpace: "nowrap" }}>Rate each team</span>
        {TIERS.map((tier, i) => (
          <Interactive.Div
            key={tier.label}
            name={tier.label}
            style={{
              padding: "14px 30px",
              borderRadius: 999,
              fontSize: 44,
              fontWeight: 800,
              textShadow: "none",
              border: "3px solid transparent",
              ...tier.style,
              opacity: interpolate(frame, [48 + i * 4, 51 + i * 4], [0, 1], CLAMP),
              scale: interpolate(frame, [48 + i * 4, 58 + i * 4], [0.5, 1], {
                ...CLAMP,
                easing: POP,
                output: "perceptual-scale",
              }),
              translate: interpolate(frame, [48 + i * 4, 58 + i * 4], ["0px 20px", "0px 0px"], {
                ...CLAMP,
                easing: EASE_OUT,
              }),
            }}
          >
            {tier.label}
          </Interactive.Div>
        ))}
      </div>
    </SceneShell>
  );
};
