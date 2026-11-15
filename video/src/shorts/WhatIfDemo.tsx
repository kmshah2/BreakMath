import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { FoilCard, SceneShell } from "../parts";
import { C, CLAMP, EASE_OUT, money } from "../theme";

// Sample break: list $1,720, 12% fees, $1,260 cost.
const profitAt = (discount: number) => 1720 * (1 - discount / 100) * 0.88 - 1260;
const MAX = 30;

// Drag the discount and watch profit fall through zero.
export const WhatIfDemo: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const discount = interpolate(frame, [96, 118, 190, 212], [0, 10, 10, 20], { ...CLAMP, easing: EASE_OUT });
  const profit = profitAt(discount);
  return (
    <SceneShell duration={duration} gap={48}>
      <FoilCard style={{ display: "flex", flexDirection: "column", gap: 28, padding: 56 }}>
        <Interactive.Div name="Label" style={{ fontSize: 50, fontWeight: 600, color: C.muted }}>
          Spots sell{" "}
          <span style={{ color: C.text, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
            {Math.round(discount)}%
          </span>{" "}
          below list
        </Interactive.Div>
        <Interactive.Div
          name="Profit"
          style={{
            fontSize: 300,
            fontWeight: 800,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            color: profit < 0 ? C.down : C.up,
            opacity: interpolate(frame, [6, 14], [0, 1], CLAMP),
          }}
        >
          {money(profit)}
        </Interactive.Div>
        <div style={{ fontSize: 46, fontWeight: 600, color: C.muted }}>profit on this break</div>
        <div style={{ position: "relative", height: 72, marginTop: 20 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 30,
              height: 12,
              borderRadius: 6,
              background: "linear-gradient(90deg, #7df3ff, #9b8cff, #ff8ad4, #ffd58a)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `calc(${(discount / MAX) * 100}% - ${(discount / MAX) * 72}px)`,
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: C.text,
              boxShadow: "0 0 0 14px rgba(255, 255, 255, 0.14)",
            }}
          />
        </div>
      </FoilCard>
      <Interactive.Div
        name="Floor"
        style={{
          fontSize: 76,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.08,
          opacity: interpolate(frame, [285, 297], [0, 1], CLAMP),
          translate: interpolate(frame, [285, 307], ["0px 40px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        Profitable up to 16% below list.
      </Interactive.Div>
    </SceneShell>
  );
};
