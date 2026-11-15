import { AbsoluteFill, Interactive, interpolate, useCurrentFrame } from "remotion";
import { C, CLAMP, EASE_OUT, FOIL, fontFamily } from "./theme";

// Slow drifting foil light behind every scene.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Background" style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: 260,
          top: 120,
          borderRadius: "50%",
          background: `conic-gradient(from ${frame * 1.2}deg, ${FOIL})`,
          filter: "blur(190px)",
          opacity: 0.2,
          translate: `${Math.sin(frame / 70) * 90}px ${Math.cos(frame / 90) * 120}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: -340,
          top: 1050,
          borderRadius: "50%",
          background: `conic-gradient(from ${-frame * 0.9}deg, ${FOIL})`,
          filter: "blur(200px)",
          opacity: 0.13,
          translate: `${Math.cos(frame / 80) * 80}px ${Math.sin(frame / 60) * 70}px`,
        }}
      />
    </AbsoluteFill>
  );
};

// Shared frame for a scene: keeps content inside the area that TikTok and
// Reels leave clear of their own buttons, and fades the scene in and out.
export const SceneShell: React.FC<{ duration: number; gap?: number; children: React.ReactNode }> = ({
  duration,
  gap = 64,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        fontFamily,
        color: C.text,
        padding: "230px 90px 430px",
        justifyContent: "center",
        gap,
        opacity: interpolate(frame, [0, 6, duration - 7, duration], [0, 1, 1, 0], CLAMP),
        scale: interpolate(frame, [duration - 10, duration], [1, 0.965], {
          ...CLAMP,
          easing: EASE_OUT,
          output: "perceptual-scale",
        }),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Headline whose words rise in one after another.
export const Words: React.FC<{ text: string; start?: number; stagger?: number; style?: React.CSSProperties }> = ({
  text,
  start = 0,
  stagger = 3,
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div name="Headline" style={style}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "0.24em",
            opacity: interpolate(frame, [start + i * stagger, start + i * stagger + 10], [0, 1], CLAMP),
            translate: interpolate(
              frame,
              [start + i * stagger, start + i * stagger + 16],
              ["0px 46px", "0px 0px"],
              { ...CLAMP, easing: EASE_OUT },
            ),
          }}
        >
          {word}
        </span>
      ))}
    </Interactive.Div>
  );
};

// Card with the turning foil edge and a soft glow behind it.
export const FoilCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; glow?: number }> = ({
  children,
  style,
  glow = 0.34,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: "8% 4%",
          background: `conic-gradient(from ${frame * 2.4}deg, ${FOIL})`,
          filter: "blur(110px)",
          opacity: glow,
        }}
      />
      <div
        style={{
          position: "relative",
          border: "4px solid transparent",
          borderRadius: 48,
          padding: 48,
          background: `linear-gradient(${C.surface}, ${C.surface}) padding-box, conic-gradient(from ${frame * 2.4}deg, ${FOIL}) border-box`,
          fontVariantNumeric: "tabular-nums",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const LogoMark: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 28 28" width={size} height={size}>
    <defs>
      <linearGradient id="logo-foil" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7DF3FF" />
        <stop offset=".4" stopColor="#9B8CFF" />
        <stop offset=".7" stopColor="#FF8AD4" />
        <stop offset="1" stopColor="#FFD58A" />
      </linearGradient>
    </defs>
    <rect x="3.5" y="6.5" width="13" height="18" rx="3" fill="none" stroke="url(#logo-foil)" strokeWidth="1.6" opacity=".55" />
    <rect x="11.5" y="3.5" width="13" height="18" rx="3" fill={C.bg} stroke="url(#logo-foil)" strokeWidth="1.6" />
    <path d="M15.5 14.5l2.5-5 2.5 5" fill="none" stroke={C.text} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
