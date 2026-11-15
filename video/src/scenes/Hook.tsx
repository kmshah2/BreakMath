import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { AudienceTag, SceneShell, Sfx, TeamCard } from "../parts";
import { C, CLAMP, POP } from "../theme";

export const SAMPLE_TEAMS = ["Kansas City", "Philadelphia", "Dallas", "Buffalo", "Chicago", "Seattle"];
// A 6-spot break sells out for $1,300. Fees of 10.9% plus $0.30 a spot take
// $144, and the box and shipping cost $1,260: a $104 loss.
const SLAM = 72;

// The hook: names the audience, then shows a sold-out break losing money.
export const Hook: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={30}>
      <Sfx name="whoosh" volume={0.5} />
      <Sfx name="pop" at={16} volume={0.5} />
      <Sfx name="pop" at={24} volume={0.5} />
      <Sfx name="impact" at={SLAM} volume={0.9} />
      <AudienceTag />
      <Interactive.Div
        name="Headline"
        style={{ fontSize: 112, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, minHeight: 226 }}
      >
        {frame < SLAM ? (
          <span style={{ color: C.up, opacity: interpolate(frame, [12, 16], [0, 1], CLAMP) }}>Your break sold out.</span>
        ) : (
          <span
            style={{
              display: "inline-block",
              transformOrigin: "left center",
              scale: interpolate(frame, [SLAM, SLAM + 10], [1.5, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
            }}
          >
            You still lost <span style={{ color: C.down }}>$104.</span>
          </span>
        )}
      </Interactive.Div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 250px)",
          gap: 28,
          translate: `${Math.sin(frame * 2.8) * interpolate(frame, [SLAM, SLAM + 12], [18, 0], CLAMP)}px 0px`,
        }}
      >
        {SAMPLE_TEAMS.map((team, i) => (
          <div
            key={team}
            style={{
              opacity: interpolate(frame, [4 + i * 2, 8 + i * 2], [0, 1], CLAMP),
              translate: interpolate(frame, [4 + i * 2, 14 + i * 2], ["0px 80px", "0px 0px"], CLAMP),
              rotate: `${(i % 3 - 1) * 2.5}deg`,
            }}
          >
            <TeamCard team={team} width={250} stamp={interpolate(frame, [16 + i * 3, 21 + i * 3], [0, 1], CLAMP)} />
          </div>
        ))}
      </div>
      <Interactive.Div
        name="Math"
        style={{
          fontSize: 44,
          fontWeight: 600,
          color: C.text,
          opacity: interpolate(frame, [SLAM + 6, SLAM + 12], [0, 1], CLAMP),
        }}
      >
        $1,300 in sales, $144 in fees, $1,260 box
      </Interactive.Div>
    </SceneShell>
  );
};
