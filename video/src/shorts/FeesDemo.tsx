import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { FoilCard, SceneShell, Sfx } from "../parts";
import { C, CLAMP, EASE_OUT, money } from "../theme";

// Cost is $1,260 and fees are 12% of sales.
// Cost + 20% = $1,512 list, which keeps $1,330.56 after fees: $71 profit, 5.6%.
// BreakMath's list is $1,718, which keeps $1,511.84: $252 profit, 20%.
const label: React.CSSProperties = { fontSize: 46, fontWeight: 600, color: C.muted };
const title: React.CSSProperties = { fontSize: 60, fontWeight: 800, letterSpacing: "-0.03em" };
const figure: React.CSSProperties = {
  fontSize: 150,
  fontWeight: 800,
  letterSpacing: "-0.05em",
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
};

const Body: React.FC<{ name: string; list: string; profit: number; result: string; start: number; good: boolean }> = ({
  name,
  list,
  profit,
  result,
  start,
  good,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={title}>{name}</div>
      <div style={label}>List all spots for {list}</div>
      <div style={{ ...figure, color: good ? C.up : C.down }}>
        {money(interpolate(frame, [start + 4, start + 18], [0, profit], { ...CLAMP, easing: EASE_OUT }))}
      </div>
      <div
        style={{
          ...label,
          color: C.text,
          opacity: interpolate(frame, [start + 16, start + 22], [0, 1], CLAMP),
        }}
      >
        {result}
      </div>
    </div>
  );
};

export const FeesDemo: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} gap={44}>
      <Sfx name="cash" at={56} volume={0.6} />
      <Interactive.Div
        name="Cost plus 20%"
        style={{
          padding: 48,
          borderRadius: 48,
          backgroundColor: "rgba(8, 10, 16, 0.88)",
          border: `3px solid ${C.line}`,
          textShadow: "none",
          opacity: interpolate(frame, [2, 6], [0, 1], CLAMP),
          translate: interpolate(frame, [2, 12], ["0px 50px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        <Body name="Cost + 20%" list="$1,512" profit={71} result="5.6% profit after fees, not 20%" start={2} good={false} />
      </Interactive.Div>
      <Interactive.Div
        name="BreakMath price"
        style={{
          opacity: interpolate(frame, [52, 56], [0, 1], CLAMP),
          translate: interpolate(frame, [52, 62], ["0px 50px", "0px 0px"], { ...CLAMP, easing: EASE_OUT }),
        }}
      >
        <FoilCard>
          <Body name="Priced for fees" list="$1,718" profit={252} result="20% profit after fees" start={52} good />
        </FoilCard>
      </Interactive.Div>
    </SceneShell>
  );
};
