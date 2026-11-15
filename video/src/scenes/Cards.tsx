import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell, Sfx, TeamCard, Words } from "../parts";
import { CLAMP, EASE_OUT, headline } from "../theme";

// Real output of the product's formula for a 6-spot break: $1,200 box + $60
// shipping, fees of 10.9% plus $0.30 a spot, 20% profit goal, weights 3 / 2 / 1.
// Prices add to $1,700.
const CARDS: { team: string; tier: "Top" | "Mid" | "Low"; price: string }[] = [
  { team: "Kansas City", tier: "Top", price: "$425" },
  { team: "Philadelphia", tier: "Top", price: "$425" },
  { team: "Dallas", tier: "Mid", price: "$283" },
  { team: "Buffalo", tier: "Mid", price: "$283" },
  { team: "Chicago", tier: "Low", price: "$142" },
  { team: "Seattle", tier: "Low", price: "$142" },
];

// Six face-down cards flip over, one per team, each with its own price.
export const Cards: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={48}>
      <Sfx name="whoosh" volume={0.5} />
      <Sfx name="pop" at={12} volume={0.6} />
      <Sfx name="pop" at={24} volume={0.6} />
      <Words text="Every team gets its own price." style={headline} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 280px)", gap: 30 }}>
        {CARDS.map((card, i) => {
          const start = 10 + i * 5;
          return (
            <div
              key={card.team}
              style={{
                translate: interpolate(frame, [i * 2, 10 + i * 2], ["0px 120px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
                opacity: interpolate(frame, [i * 2, 4 + i * 2], [0, 1], CLAMP),
              }}
            >
              <TeamCard
                team={card.team}
                tier={card.tier}
                price={card.price}
                flip={interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASE_OUT })}
              />
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};
