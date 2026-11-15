import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AudienceTag, SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, EASE_OUT, FOIL, headline, money } from "../theme";
import { Ad, AdProps } from "./Ad";

// The gauge ad. Sample break: $1,700 list, fees of 10.9% plus $0.30 a spot,
// $1,260 cost. Profit is $253 at list, $101 at 10% under, -$50 at 20% under,
// and crosses zero at 16.7% under.
const profitAt = (discount: number) => 1700 * (1 - discount / 100) * 0.891 - 1.8 - 1260;
const FLOOR = 16.7;
const MAX = 30;
const CX = 450;
const CY = 450;
const R = 380;

const angle = (discount: number) => Math.PI * (1 - discount / MAX);
const point = (discount: number, radius: number) => ({
  x: CX + radius * Math.cos(angle(discount)),
  y: CY - radius * Math.sin(angle(discount)),
});
const arc = (from: number, to: number) => {
  const a = point(from, R);
  const b = point(to, R);
  return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`;
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#05060a", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 50% 56%, rgba(255,255,255,0.07) 0 3px, transparent 3px 110px)",
          scale: String(1 + (frame % 60) / 60 * 0.12),
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 1180,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `conic-gradient(from ${frame * 3}deg, ${FOIL})`,
          filter: "blur(200px)",
          opacity: 0.26,
        }}
      />
    </AbsoluteFill>
  );
};

const Gauge: React.FC<{ discount: number; showFloor: number }> = ({ discount, showFloor }) => {
  const profit = profitAt(discount);
  const tip = point(discount, R - 70);
  const floorIn = point(FLOOR, R - 62);
  const floorOut = point(FLOOR, R + 62);
  return (
    <div style={{ position: "relative", width: 900, alignSelf: "center", textShadow: "none" }}>
      <svg viewBox="0 0 900 500" width={900} height={500} style={{ overflow: "visible" }}>
        <path d={arc(0, FLOOR)} stroke={C.up} strokeWidth={76} fill="none" />
        <path d={arc(FLOOR, MAX)} stroke={C.down} strokeWidth={76} fill="none" />
        {[0, 10, 20, 30].map((d) => {
          const p = point(d, R + 96);
          return (
            <text key={d} x={p.x} y={p.y + 14} textAnchor="middle" fill={C.text} fontSize={44} fontWeight={700}>
              {d}%
            </text>
          );
        })}
        <line x1={floorIn.x} y1={floorIn.y} x2={floorOut.x} y2={floorOut.y} stroke={C.text} strokeWidth={10} opacity={showFloor} />
        <line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke={C.text} strokeWidth={20} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={38} fill={C.text} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40, gap: 6 }}>
        <span style={{ fontSize: 50, fontWeight: 600, color: C.muted }}>
          Spots sell{" "}
          <span style={{ color: C.text, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{Math.round(discount)}%</span>{" "}
          below list
        </span>
        <span
          style={{
            fontSize: 250,
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            color: profit < 0 ? C.down : C.up,
          }}
        >
          {money(profit)}
        </span>
        <span style={{ fontSize: 46, fontWeight: 600, color: C.muted }}>profit on this break</span>
      </div>
    </div>
  );
};

const Hook: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={40}>
      <Sfx name="impact" volume={0.8} />
      <AudienceTag />
      <Words text="How low can your spots sell?" start={4} style={{ ...headline, fontSize: 112 }} />
      <Gauge discount={Math.max(0, Math.sin(frame / 7) * 1.6 + 1.6)} showFloor={0} />
    </SceneShell>
  );
};

const Demo: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const discount = interpolate(frame, [82, 96, 168, 182, 262, 280], [0, 10, 10, 20, 20, FLOOR], {
    ...CLAMP,
    easing: EASE_OUT,
  });
  return (
    <SceneShell duration={duration} gap={40}>
      <Sfx name="whoosh" volume={0.5} />
      <Sfx name="pop" at={82} volume={0.6} />
      <Sfx name="impact" at={174} volume={0.8} />
      <Words
        text={frame < 262 ? "Watch your profit fall." : "Your floor: 16% below list."}
        start={frame < 262 ? 0 : 262}
        style={{ ...headline, fontSize: 100, minHeight: 200 }}
      />
      <Gauge discount={discount} showFloor={interpolate(frame, [262, 270], [0, 1], CLAMP)} />
    </SceneShell>
  );
};

export const GaugeAd: React.FC<AdProps> = ({ voiceover }) => (
  <Ad id="whatif" voiceover={voiceover} world={<World />} Hook={Hook} Demo={Demo} />
);
