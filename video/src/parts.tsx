import { Audio } from "@remotion/media";
import { createContext, useContext } from "react";
import { AbsoluteFill, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, CLAMP, EASE_OUT, FOIL, fontFamily } from "./theme";

// Whether this render has sound (voice, music, effects) or is the silent cut.
export const SoundContext = createContext(false);

// A one-shot sound effect from public/audio, placed on the scene's own clock.
export const Sfx: React.FC<{ name: "whoosh" | "impact" | "pop" | "cash"; at?: number; volume?: number }> = ({
  name,
  at = 0,
  volume = 0.5,
}) => {
  const sound = useContext(SoundContext);
  return sound ? <Audio from={at} src={staticFile(`audio/${name}.mp3`)} volume={volume} /> : null;
};

// Music bed under the whole video, faded out over the last half second.
export const Music: React.FC = () => {
  const sound = useContext(SoundContext);
  const { durationInFrames } = useVideoConfig();
  return sound ? (
    <Audio
      src={staticFile("audio/music.mp3")}
      volume={(f) => interpolate(f, [0, durationInFrames - 16, durationInFrames - 1], [0.2, 0.2, 0], CLAMP)}
    />
  ) : null;
};

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
          background: `conic-gradient(from ${frame * 2.4}deg, ${FOIL})`,
          filter: "blur(190px)",
          opacity: 0.22,
          translate: `${Math.sin(frame / 35) * 110}px ${Math.cos(frame / 45) * 140}px`,
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
          background: `conic-gradient(from ${-frame * 1.8}deg, ${FOIL})`,
          filter: "blur(200px)",
          opacity: 0.14,
          translate: `${Math.cos(frame / 40) * 90}px ${Math.sin(frame / 30) * 80}px`,
        }}
      />
    </AbsoluteFill>
  );
};

// Brand tag and a foil progress line that runs the length of the video.
export const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill name="Chrome" style={{ fontFamily, color: C.text }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: 10, width: "100%", backgroundColor: "rgba(255,255,255,0.08)" }}>
        <div
          style={{
            height: "100%",
            width: `${(frame / (durationInFrames - 1)) * 100}%`,
            background: "linear-gradient(90deg, #7df3ff, #9b8cff, #ff8ad4, #ffd58a)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 128,
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          opacity: 0.92,
        }}
      >
        <LogoMark size={60} />
        BreakMath
      </div>
    </AbsoluteFill>
  );
};

// Shared frame for a scene: keeps content inside the area that TikTok and
// Reels leave clear of their own buttons, punches in on the cut, then drifts.
export const SceneShell: React.FC<{ duration: number; gap?: number; children: React.ReactNode }> = ({
  duration,
  gap = 56,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        fontFamily,
        color: C.text,
        padding: "250px 90px 430px",
        justifyContent: "center",
        gap,
        opacity: interpolate(frame, [0, 3, duration - 3, duration], [0, 1, 1, 0], CLAMP),
        scale: interpolate(frame, [0, 7, duration], [1.1, 1, 1.035], {
          ...CLAMP,
          easing: [EASE_OUT, (t: number) => t],
          output: "perceptual-scale",
        }),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Headline whose words snap in one after another.
export const Words: React.FC<{ text: string; start?: number; stagger?: number; style?: React.CSSProperties }> = ({
  text,
  start = 0,
  stagger = 2,
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
            opacity: interpolate(frame, [start + i * stagger, start + i * stagger + 4], [0, 1], CLAMP),
            translate: interpolate(
              frame,
              [start + i * stagger, start + i * stagger + 9],
              ["0px 40px", "0px 0px"],
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
          background: `conic-gradient(from ${frame * 5}deg, ${FOIL})`,
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
          background: `linear-gradient(${C.surface}, ${C.surface}) padding-box, conic-gradient(from ${frame * 5}deg, ${FOIL}) border-box`,
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
