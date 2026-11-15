import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { FoilCard, SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, EASE_OUT, headline, money, POP } from "../theme";

type Tier = "Top" | "Mid" | "Low";

// Prices come from the product's real formula: $1,200 box + $60 shipping,
// fees of 10.9% plus $0.30 a spot, 20% profit goal, weights Top 3 / Mid 2 / Low 1.
// "before" is with Dallas at Mid, "after" is once Dallas is bumped to Top.
const TEAMS: { name: string; tier: Tier; flipsTo?: Tier; before: number; after: number }[] = [
  { name: "Kansas City", tier: "Top", before: 340, after: 319 },
  { name: "Philadelphia", tier: "Top", before: 340, after: 319 },
  { name: "Dallas", tier: "Mid", flipsTo: "Top", before: 227, after: 319 },
  { name: "Buffalo", tier: "Mid", before: 227, after: 212 },
  { name: "Detroit", tier: "Mid", before: 227, after: 212 },
  { name: "Chicago", tier: "Low", before: 113, after: 106 },
  { name: "Denver", tier: "Low", before: 113, after: 106 },
  { name: "Seattle", tier: "Low", before: 113, after: 106 },
];
const FLIP = 46;

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
    <SceneShell duration={duration} gap={48}>
      <Sfx name="whoosh" volume={0.5} />
      <Sfx name="pop" at={FLIP} volume={0.8} />
      <Words text="Rate each team. Every spot gets a price." style={{ ...headline, fontSize: 88 }} />
      <FoilCard style={{ padding: "20px 44px" }}>
        {TEAMS.map((team, i) => {
          const appear = 3 + i * 2;
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
                opacity: interpolate(frame, [appear, appear + 4], [0, 1], CLAMP),
                translate: interpolate(frame, [appear, appear + 9], ["0px 30px", "0px 0px"], {
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
                      opacity: interpolate(frame, [FLIP - 3, FLIP + 1, FLIP + 12], [0, 1, 0], CLAMP),
                      scale: interpolate(frame, [FLIP - 3, FLIP + 12], [0.9, 1.4], CLAMP),
                    }}
                  />
                ) : null}
                <div
                  style={{
                    ...chip(flipped ? team.flipsTo! : team.tier),
                    scale: team.flipsTo && frame >= FLIP
                      ? interpolate(frame, [FLIP, FLIP + 10], [0.7, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" })
                      : 1,
                  }}
                >
                  {flipped ? team.flipsTo : team.tier}
                </div>
              </div>
              <span style={{ textAlign: "right", fontSize: 56, fontWeight: 800 }}>
                {money(
                  frame < FLIP
                    ? interpolate(frame, [appear + 2, appear + 14], [0, team.before], { ...CLAMP, easing: EASE_OUT })
                    : interpolate(frame, [FLIP, FLIP + 12], [team.before, team.after], { ...CLAMP, easing: EASE_OUT }),
                )}
              </span>
            </Interactive.Div>
          );
        })}
      </FoilCard>
    </SceneShell>
  );
};
