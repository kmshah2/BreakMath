import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { FoilCard, SceneShell, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, money, POP } from "../theme";

type Tier = "Top" | "Mid" | "Low";

// Prices come from the product's real formula: $1,200 box + $60 shipping,
// 12% fees, 20% profit goal, weights Top 3 / Mid 2 / Low 1.
// "before" is with Dallas at Mid, "after" is once Dallas is bumped to Top.
const TEAMS: { name: string; tier: Tier; flipsTo?: Tier; before: number; after: number }[] = [
  { name: "Kansas City", tier: "Top", before: 344, after: 322 },
  { name: "Philadelphia", tier: "Top", before: 344, after: 322 },
  { name: "Dallas", tier: "Mid", flipsTo: "Top", before: 229, after: 322 },
  { name: "Buffalo", tier: "Mid", before: 229, after: 215 },
  { name: "Detroit", tier: "Mid", before: 229, after: 215 },
  { name: "Chicago", tier: "Low", before: 115, after: 107 },
  { name: "Denver", tier: "Low", before: 115, after: 107 },
  { name: "Seattle", tier: "Low", before: 115, after: 107 },
];
const FLIP = 100;

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

// Teams get a tier, every spot gets a price, and one tap re-prices the lot.
export const Tiers: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={56}>
      <Words text="Rate each team. Get a price for every spot." style={{ ...headline, fontSize: 88 }} />
      <FoilCard style={{ padding: "20px 44px" }}>
        {TEAMS.map((team, i) => {
          const appear = 14 + i * 6;
          const flipped = team.flipsTo !== undefined && frame >= FLIP;
          return (
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
                opacity: interpolate(frame, [appear, appear + 8], [0, 1], CLAMP),
                translate: interpolate(frame, [appear, appear + 16], ["0px 30px", "0px 0px"], {
                  ...CLAMP,
                  easing: EASE_OUT,
                }),
              }}
            >
              <span>{team.name}</span>
              <div style={{ position: "relative" }}>
                {team.flipsTo ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: -14,
                      borderRadius: 999,
                      border: "4px solid #9b8cff",
                      opacity: interpolate(frame, [FLIP - 4, FLIP + 2, FLIP + 18], [0, 1, 0], CLAMP),
                      scale: interpolate(frame, [FLIP - 4, FLIP + 18], [0.9, 1.35], CLAMP),
                    }}
                  />
                ) : null}
                <div
                  style={{
                    ...chip(flipped ? team.flipsTo! : team.tier),
                    scale: team.flipsTo
                      ? interpolate(frame, [FLIP, FLIP + 16], [0.8, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" })
                      : 1,
                  }}
                >
                  {flipped ? team.flipsTo : team.tier}
                </div>
              </div>
              <span style={{ textAlign: "right", fontSize: 56, fontWeight: 800 }}>
                {money(
                  frame < FLIP
                    ? interpolate(frame, [appear + 4, appear + 24], [0, team.before], { ...CLAMP, easing: EASE_OUT })
                    : interpolate(frame, [FLIP, FLIP + 20], [team.before, team.after], { ...CLAMP, easing: EASE_OUT }),
                )}
              </span>
            </Interactive.Div>
          );
        })}
      </FoilCard>
    </SceneShell>
  );
};
