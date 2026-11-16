import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AudienceTag, glass, SceneShell, Sfx, Words } from "../parts";
import { C, CLAMP, EASE_OUT, FOIL, headline, POP } from "../theme";
import { Ad, AdProps } from "./Ad";

// The pack wall ad, for card-game breakers. One 36-pack box: $160 plus $10
// shipping, fees of 10.9% plus $0.30 an order. At $5 a pack it sells out for
// $180, fees take $30, and it loses $20. At $7 a pack it lists for $252, fees
// take $38, and it makes $44.
const PACK_COLORS = [
  ["#7df3ff", "#3b7bff"],
  ["#9b8cff", "#5a3bd6"],
  ["#ff8ad4", "#c93b8e"],
  ["#ffd58a", "#e08a2e"],
];

// A sealed foil booster pack: crimped ends, a spark in the middle, a moving shine.
const Pack: React.FC<{ index: number; width: number; height: number; sold?: number }> = ({
  index,
  width,
  height,
  sold = 0,
}) => {
  const frame = useCurrentFrame();
  const [light, dark] = PACK_COLORS[index % PACK_COLORS.length];
  const crimp = Math.max(8, Math.round(height * 0.075));
  const crimpStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    height: crimp,
    backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.32) 0 3px, rgba(255,255,255,0.18) 3px 6px)",
  };
  const spark = width * 0.46;
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: Math.round(width * 0.07),
        overflow: "hidden",
        background: `linear-gradient(165deg, ${light}, ${dark})`,
        boxShadow: "0 10px 26px rgba(0, 0, 0, 0.5)",
        textShadow: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
          translate: `${((frame * 5 + index * 37) % 260) - 130}% 0`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: (width - spark) / 2,
          top: (height - spark) / 2,
          width: spark,
          height: spark,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          clipPath: "polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%)",
        }}
      />
      <div style={{ ...crimpStyle, top: 0 }} />
      <div style={{ ...crimpStyle, bottom: 0 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(5, 6, 10, 0.72)",
          color: C.text,
          fontSize: Math.round(width * 0.27),
          fontWeight: 800,
          letterSpacing: "0.04em",
          opacity: sold,
        }}
      >
        <span style={{ rotate: "-14deg" }}>SOLD</span>
      </div>
    </div>
  );
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: -660,
          top: -240,
          width: 2400,
          height: 2400,
          background:
            "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.05) 0deg 5deg, transparent 5deg 15deg)",
          rotate: `${frame * 0.35}deg`,
          maskImage: "radial-gradient(circle, transparent 12%, black 30%, transparent 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 620,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `conic-gradient(from ${-frame * 2}deg, ${FOIL})`,
          filter: "blur(200px)",
          opacity: 0.26,
        }}
      />
    </AbsoluteFill>
  );
};

const COLS = 9;
const PACK_W = 89;
const PACK_H = 164;
const PACK_GAP = 12;

const Hook: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const stampAt = 74;
  return (
    <SceneShell duration={duration} gap={34}>
      <Sfx name="whoosh" volume={0.5} />
      <Sfx name="pop" at={30} volume={0.45} />
      <Sfx name="impact" at={stampAt} volume={0.9} />
      <AudienceTag text="For Pokémon breakers" />
      <Words text="Every pack sold. Still lost money." start={4} style={{ ...headline, fontSize: 104 }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: PACK_GAP, width: COLS * PACK_W + (COLS - 1) * PACK_GAP }}>
          {Array.from({ length: 36 }, (_, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const enter = 8 + (col + row) * 1.4;
            const soldAt = 30 + i * 1.05;
            return (
              <div
                key={i}
                style={{
                  opacity: interpolate(frame, [enter, enter + 3], [0, 1], CLAMP),
                  scale: interpolate(frame, [enter, enter + 9], [0.5, 1], {
                    ...CLAMP,
                    easing: POP,
                    output: "perceptual-scale",
                  }),
                }}
              >
                <Pack
                  index={i}
                  width={PACK_W}
                  height={PACK_H}
                  sold={interpolate(frame, [soldAt, soldAt + 3], [0, 1], CLAMP)}
                />
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            translate: "-50% -50%",
            rotate: "-9deg",
            padding: "10px 44px",
            border: `10px solid ${C.down}`,
            borderRadius: 22,
            color: C.down,
            backgroundColor: "rgba(5, 6, 10, 0.92)",
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            textShadow: "none",
            opacity: interpolate(frame, [stampAt, stampAt + 2], [0, 1], CLAMP),
            scale: interpolate(frame, [stampAt, stampAt + 9], [2.4, 1], {
              ...CLAMP,
              easing: POP,
              output: "perceptual-scale",
            }),
          }}
        >
          LOST $20
        </div>
      </div>
      <div
        style={{
          fontSize: 50,
          fontWeight: 700,
          color: C.muted,
          fontVariantNumeric: "tabular-nums",
          opacity: interpolate(frame, [44, 50], [0, 1], CLAMP),
        }}
      >
        36 packs × $5 = $180 on a $160 box
      </div>
    </SceneShell>
  );
};

type Row = { label: string; value: string; total?: boolean };

const Ledger: React.FC<{ start: number; rows: Row[]; color: string }> = ({ start, rows, color }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...glass, padding: "30px 44px", display: "flex", flexDirection: "column" }}>
      {rows.map((row, i) => {
        const at = start + i * 5;
        return (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: row.total ? "22px 0 4px" : "14px 0",
              marginTop: row.total ? 10 : 0,
              borderTop: row.total ? `3px solid ${C.line}` : "none",
              fontSize: row.total ? 96 : 48,
              fontWeight: row.total ? 800 : 600,
              letterSpacing: row.total ? "-0.04em" : "0",
              color: row.total ? color : C.text,
              opacity: interpolate(frame, [at, at + 4], [0, 1], CLAMP),
              translate: interpolate(frame, [at, at + 9], ["0px 24px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
            }}
          >
            <span style={{ color: row.total ? color : C.muted }}>{row.label}</span>
            <span>{row.value}</span>
          </div>
        );
      })}
    </div>
  );
};

const Demo: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  // The voice spends its first half on the $5 price, then turns to BreakMath.
  const flip = Math.round(duration * 0.47);
  const fixed = frame >= flip;
  const tagPop = interpolate(frame, [flip, flip + 10], [0.6, 1], { ...CLAMP, easing: POP, output: "perceptual-scale" });
  return (
    <SceneShell duration={duration} gap={38}>
      <Sfx name="whoosh" volume={0.5} />
      <Sfx name="whoosh" at={flip - 3} volume={0.5} />
      <Sfx name="cash" at={flip + 22} volume={0.75} />
      <Words
        key={fixed ? "fixed" : "naive"}
        text={fixed ? "Price in the fees. Keep the profit." : "Fees ate the whole margin."}
        start={fixed ? flip : 0}
        style={{ ...headline, fontSize: 104 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
        <div style={{ rotate: fixed ? "4deg" : "-5deg" }}>
          <Pack index={fixed ? 1 : 2} width={210} height={330} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, scale: fixed ? tagPop : 1, transformOrigin: "left center" }}>
          <span
            style={{
              fontSize: 200,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
              color: fixed ? C.up : C.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fixed ? "$7" : "$5"}
          </span>
          <span style={{ fontSize: 56, fontWeight: 700, color: C.muted }}>a pack, 36 packs</span>
        </div>
      </div>
      {fixed ? (
        <Ledger
          key="fixed"
          start={flip + 6}
          color={C.up}
          rows={[
            { label: "Sold out", value: "$252" },
            { label: "Fees", value: "-$38" },
            { label: "Box + shipping", value: "-$170" },
            { label: "Profit", value: "$44", total: true },
          ]}
        />
      ) : (
        <Ledger
          key="naive"
          start={8}
          color={C.down}
          rows={[
            { label: "Sold out", value: "$180" },
            { label: "Fees", value: "-$30" },
            { label: "Box + shipping", value: "-$170" },
            { label: "Profit", value: "-$20", total: true },
          ]}
        />
      )}
    </SceneShell>
  );
};

export const PacksAd: React.FC<AdProps> = ({ voiceover }) => (
  <Ad id="packs" voiceover={voiceover} world={<World />} Hook={Hook} Demo={Demo} />
);
