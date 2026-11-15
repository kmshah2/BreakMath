import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AudienceTag, SceneShell, Sfx, TeamCard, Words } from "../parts";
import { C, CLAMP, EASE_OUT, FOIL, headline, money, POP } from "../theme";
import { Ad, AdProps } from "./Ad";

// The podium ad. Six spots at one flat price ($283 each) against the same
// $1,700 split by team value: Top $425, Mid $283, Low $142.
const FLAT = 283;
const COLUMNS: { tier: "Top" | "Mid" | "Low"; price: number; teams: [string, string]; height: number }[] = [
  { tier: "Top", price: 425, teams: ["Kansas City", "Philadelphia"], height: 300 },
  { tier: "Mid", price: 283, teams: ["Dallas", "Buffalo"], height: 200 },
  { tier: "Low", price: 142, teams: ["Chicago", "Seattle"], height: 104 },
];

const World: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#05060a", overflow: "hidden" }}>
      {[-1, 1].map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            left: 540 + side * 420 - 260,
            top: -260,
            width: 520,
            height: 2000,
            background: `linear-gradient(180deg, ${side < 0 ? "rgba(125, 243, 255, 0.34)" : "rgba(255, 138, 212, 0.34)"}, transparent 78%)`,
            clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
            transformOrigin: "50% 0",
            rotate: `${-side * 16 + Math.sin(frame / 26 + side) * 7}deg`,
            filter: "blur(22px)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1490,
          height: 430,
          background: "linear-gradient(180deg, rgba(155, 140, 255, 0.22), rgba(5, 6, 10, 0) 80%)",
          borderTop: "5px solid transparent",
          borderImage: "linear-gradient(90deg, #7df3ff, #9b8cff, #ff8ad4, #ffd58a) 1",
        }}
      />
    </AbsoluteFill>
  );
};

// Three podiums on the stage floor. `rise` runs 0 (all level, flat price) to 1
// (each at its own height and price).
const Podiums: React.FC<{ rise: number; reveal: number }> = ({ rise, reveal }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: "inherit" }}>
      {COLUMNS.map((col, i) => {
        const height = interpolate(rise, [0, 1], [160, col.height]);
        const price = interpolate(rise, [0, 1], [FLAT, col.price]);
        return (
          <div
            key={col.tier}
            style={{
              position: "absolute",
              left: 90 + i * 310,
              bottom: 430,
              width: 280,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: interpolate(frame, [i * 3, 6 + i * 3], [0, 1], CLAMP),
            }}
          >
            <div style={{ position: "relative", width: 280, height: 430 }}>
              {col.teams.map((team, k) => (
                <div
                  key={team}
                  style={{
                    position: "absolute",
                    left: k === 0 ? -8 : 26,
                    top: k === 0 ? 0 : 54,
                    rotate: `${k === 0 ? -5 : 4}deg`,
                  }}
                >
                  <TeamCard team={team} tier={reveal > 0.5 ? col.tier : undefined} price={money(price)} width={262} />
                </div>
              ))}
            </div>
            <div
              style={{
                width: 280,
                height,
                marginTop: 14,
                borderRadius: "22px 22px 0 0",
                border: "4px solid transparent",
                borderBottom: "none",
                background: `linear-gradient(180deg, #171b29, #0b0d14) padding-box, conic-gradient(from ${frame * 5 + i * 90}deg, ${FOIL}) border-box`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingTop: 16,
                color: C.text,
                textShadow: "none",
              }}
            >
              <span style={{ fontSize: 62, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {money(price)}
              </span>
              <span style={{ fontSize: 34, fontWeight: 700, color: C.muted, opacity: reveal }}>{col.tier}</span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const top: React.CSSProperties = { justifyContent: "flex-start", padding: "270px 90px 0" };

const Hook: React.FC<{ duration: number }> = ({ duration }) => (
  <>
    <SceneShell duration={duration} gap={30} style={top}>
      <Sfx name="impact" volume={0.8} />
      <AudienceTag />
      <Words text="Same price for every team?" start={4} style={{ ...headline, fontSize: 116 }} />
    </SceneShell>
    <SceneShell duration={duration}>
      <Podiums rise={0} reveal={0} />
    </SceneShell>
  </>
);

const Demo: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [34, 62], [0, 1], { ...CLAMP, easing: POP });
  return (
    <>
      <SceneShell duration={duration} gap={26} style={top}>
        <Sfx name="whoosh" volume={0.5} />
        <Sfx name="pop" at={34} volume={0.8} />
        <Words text="Price each team by what it's worth." style={{ ...headline, fontSize: 96 }} />
        <div
          style={{
            fontSize: 50,
            fontWeight: 700,
            opacity: interpolate(frame, [70, 78], [0, 1], CLAMP),
            translate: interpolate(frame, [70, 82], ["0px 24px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
          }}
        >
          Same $1,700 total.
        </div>
      </SceneShell>
      <SceneShell duration={duration}>
        <Podiums rise={rise} reveal={interpolate(frame, [34, 44], [0, 1], CLAMP)} />
      </SceneShell>
    </>
  );
};

export const TiersAd: React.FC<AdProps> = ({ voiceover }) => (
  <Ad id="tiers" voiceover={voiceover} world={<World />} Hook={Hook} Demo={Demo} />
);
