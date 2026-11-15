import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AudienceTag, SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, FOIL, headline, POP } from "../theme";
import { Ad, AdProps } from "./Ad";

// The receipt ad. Cost is $1,260. Marking it up 20% lists the break at $1,512;
// fees of 10.9% plus $0.30 a spot take $167, leaving $85: 6.8% of cost.
// BreakMath lists it at $1,700; fees take $187, leaving $253: 20%.
const PAPER = "#f3efe4";
const INK = "#15161b";

type Line = { label: string; value: string; rule?: boolean; total?: boolean };

const Receipt: React.FC<{
  title: string;
  lines: Line[];
  start: number;
  foil?: boolean;
  stamp: { text: string; color: string; at: number };
  tilt: number;
}> = ({ title, lines, start, foil, stamp, tilt }) => {
  const frame = useCurrentFrame();
  const printed = interpolate(frame, [start, start + 34], [0, 100], CLAMP);
  return (
    <div style={{ position: "relative", alignSelf: "center", width: 820, rotate: `${tilt}deg`, textShadow: "none" }}>
      {foil ? (
        <div
          style={{
            position: "absolute",
            inset: "4% -4%",
            background: `conic-gradient(from ${frame * 6}deg, ${FOIL})`,
            filter: "blur(90px)",
            opacity: 0.5,
          }}
        />
      ) : null}
      <div style={{ position: "relative", clipPath: `inset(0 0 ${100 - printed}% 0)` }}>
        <div
          style={{
            padding: "44px 52px 30px",
            backgroundColor: PAPER,
            color: INK,
            fontVariantNumeric: "tabular-nums",
            borderTop: foil ? "14px solid #9b8cff" : `14px solid ${INK}`,
          }}
        >
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 18 }}>{title}</div>
          {lines.map((line) => (
            <div
              key={line.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: line.total ? "22px 0 6px" : "13px 0",
                marginTop: line.rule ? 14 : 0,
                borderTop: line.rule ? `4px dashed ${INK}` : "none",
                fontSize: line.total ? 92 : 46,
                fontWeight: line.total ? 800 : 600,
                letterSpacing: line.total ? "-0.04em" : "0",
              }}
            >
              <span>{line.label}</span>
              <span>{line.value}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            height: 26,
            background: `linear-gradient(135deg, ${PAPER} 13px, transparent 0), linear-gradient(225deg, ${PAPER} 13px, transparent 0)`,
            backgroundSize: "26px 26px",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 30,
          bottom: -170,
          rotate: "-12deg",
          padding: "8px 30px",
          border: `9px solid ${stamp.color}`,
          borderRadius: 18,
          color: stamp.color,
          backgroundColor: "rgba(243, 239, 228, 0.9)",
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: "0.02em",
          opacity: interpolate(frame, [stamp.at, stamp.at + 2], [0, 1], CLAMP),
          scale: interpolate(frame, [stamp.at, stamp.at + 9], [2.4, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" }),
        }}
      >
        {stamp.text}
      </div>
    </div>
  );
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.045) 0 3px, transparent 3px 64px)",
          backgroundPosition: `${frame * 1.5}px 0px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 760,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `conic-gradient(from ${frame * 2}deg, ${FOIL})`,
          filter: "blur(210px)",
          opacity: 0.22,
        }}
      />
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ duration: number }> = ({ duration }) => (
  <SceneShell duration={duration} gap={34}>
    <Sfx name="whoosh" volume={0.5} />
    <Sfx name="impact" at={104} volume={0.9} />
    <AudienceTag />
    <Words text="Add 20% to your cost. Keep 6.8%." start={4} style={{ ...headline, fontSize: 104 }} />
    <Receipt
      title="Cost + 20%"
      start={14}
      tilt={-2}
      stamp={{ text: "NOT 20%", color: "#d92b2b", at: 104 }}
      lines={[
        { label: "Your cost", value: "$1,260" },
        { label: "Add 20%", value: "+$252" },
        { label: "List price", value: "$1,512", rule: true },
        { label: "Fees", value: "-$167" },
        { label: "Box + shipping", value: "-$1,260" },
        { label: "Profit", value: "$85", rule: true, total: true },
      ]}
    />
  </SceneShell>
);

const Demo: React.FC<{ duration: number }> = ({ duration }) => (
  <SceneShell duration={duration} gap={34}>
    <Sfx name="whoosh" volume={0.5} />
    <Sfx name="cash" at={78} volume={0.75} />
    <Words text="Price for your fees. Hit your goal." style={{ ...headline, fontSize: 104 }} />
    <Receipt
      title="Priced with BreakMath"
      start={8}
      tilt={1.5}
      foil
      stamp={{ text: "20%", color: "#12995c", at: 78 }}
      lines={[
        { label: "List price", value: "$1,700" },
        { label: "Fees", value: "-$187" },
        { label: "Box + shipping", value: "-$1,260" },
        { label: "Profit", value: "$253", rule: true, total: true },
      ]}
    />
  </SceneShell>
);

export const FeesAd: React.FC<AdProps> = ({ voiceover }) => (
  <Ad id="fees" voiceover={voiceover} world={<World />} Hook={Hook} Demo={Demo} />
);
