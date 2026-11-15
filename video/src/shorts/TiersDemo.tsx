import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { FoilCard, SceneShell, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, money, POP } from "../theme";

type Tier = "Top" | "Mid" | "Low";

// Flat: $1,720 across 8 spots is $215 each. Tiered prices add to the same $1,720.
const FLAT = 215;
const TEAMS: { name: string; tier: Tier; price: number }[] = [
  { name: "Kansas City", tier: "Top", price: 344 },
  { name: "Philadelphia", tier: "Top", price: 344 },
  { name: "Dallas", tier: "Mid", price: 229 },
  { name: "Buffalo", tier: "Mid", price: 229 },
  { name: "Detroit", tier: "Mid", price: 229 },
  { name: "Chicago", tier: "Low", price: 115 },
  { name: "Denver", tier: "Low", price: 115 },
  { name: "Seattle", tier: "Low", price: 115 },
];
const SPLIT = 84;

const chip = (tier: Tier): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 140,
  height: 68,
  borderRadius: 999,
  fontSize: 38,
  fontWeight: 700,
  ...(tier === "Top"
    ? { backgroundColor: C.text, color: C.bg }
    : tier === "Mid"
      ? { backgroundColor: "rgba(255, 255, 255, 0.16)", color: C.text }
      : { border: `2px solid ${C.line}`, color: C.muted }),
});

// Every spot starts at one flat price, then splits by team value.
export const TiersDemo: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={56}>
      <Words text="Same $1,720 total. Priced by team." style={{ ...headline, fontSize: 88 }} />
      <FoilCard style={{ padding: "20px 44px" }}>
        {TEAMS.map((team, i) => (
          <Interactive.Div
            key={team.name}
            name={team.name}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 170px",
              alignItems: "center",
              gap: 24,
              height: 100,
              borderBottom: i < TEAMS.length - 1 ? `2px solid ${C.line}` : "none",
              fontSize: 50,
              fontWeight: 600,
              opacity: interpolate(frame, [8 + i * 4, 16 + i * 4], [0, 1], CLAMP),
              translate: interpolate(frame, [8 + i * 4, 24 + i * 4], ["0px 30px", "0px 0px"], {
                ...CLAMP,
                easing: EASE_OUT,
              }),
            }}
          >
            <span>{team.name}</span>
            <div
              style={{
                ...chip(team.tier),
                opacity: interpolate(frame, [SPLIT + i * 2, SPLIT + i * 2 + 4], [0, 1], CLAMP),
                scale: interpolate(frame, [SPLIT + i * 2, SPLIT + i * 2 + 16], [0.6, 1], {
                  ...CLAMP,
                  easing: POP,
                  output: "perceptual-scale",
                }),
              }}
            >
              {team.tier}
            </div>
            <span style={{ textAlign: "right", fontSize: 56, fontWeight: 800 }}>
              {money(
                interpolate(frame, [SPLIT + i * 2, SPLIT + i * 2 + 22], [FLAT, team.price], {
                  ...CLAMP,
                  easing: EASE_OUT,
                }),
              )}
            </span>
          </Interactive.Div>
        ))}
      </FoilCard>
    </SceneShell>
  );
};
