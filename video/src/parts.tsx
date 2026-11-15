import { Audio } from "@remotion/media";
import { createContext, useContext } from "react";
import { AbsoluteFill, Interactive, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
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
          gap: 18,
          fontSize: 46,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          textShadow: "0 2px 18px rgba(0, 0, 0, 0.7)",
        }}
      >
        <LogoMark size={64} />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
          <span>BreakMath</span>
          <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0", color: C.muted }}>
            Spot pricing app for card breaks
          </span>
        </div>
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
        textShadow: "0 4px 26px rgba(0, 0, 0, 0.55)",
        padding: "270px 90px 430px",
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
          textShadow: "none",
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

/* ---------- The football field world ---------- */

const YARD = 48; // pixels per yard on the field plane
const FIELD_DEPTH = 3600; // how far downfield the plane reaches, in pixels
const NEAR = 3; // yards between the camera and the bottom edge of the frame

// A night-game field seen from just above the turf, flying toward the end
// zone. `yard` is where the camera is: 0 is your own goal line, 100 is the far
// goal line, and 100 to 110 is the end zone.
export const Field: React.FC<{ yard: number }> = ({ yard }) => {
  const frame = useCurrentFrame();
  const at = (worldYard: number) => FIELD_DEPTH - (worldYard - yard + NEAR) * YARD;
  const first = Math.max(0, Math.floor((yard - 6) / 5) * 5);
  const marks: number[] = [];
  for (let y = first; y <= Math.min(100, yard + 78); y += 5) marks.push(y);
  return (
    <AbsoluteFill name="Field" style={{ backgroundColor: "#04060a", overflow: "hidden" }}>
      {/* Stadium lights */}
      <div
        style={{
          position: "absolute",
          left: -260,
          top: -200,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `conic-gradient(from ${frame * 3}deg, ${FOIL})`,
          filter: "blur(170px)",
          opacity: 0.34,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -300,
          top: -120,
          width: 860,
          height: 860,
          borderRadius: "50%",
          background: `conic-gradient(from ${-frame * 2.4}deg, ${FOIL})`,
          filter: "blur(180px)",
          opacity: 0.26,
        }}
      />
      <div style={{ position: "absolute", inset: 0, perspective: 900, perspectiveOrigin: "50% 26%" }}>
        <div
          style={{
            position: "absolute",
            left: (1080 - 1700) / 2,
            width: 1700,
            height: FIELD_DEPTH,
            bottom: -260,
            transformOrigin: "50% 100%",
            transform: `rotateX(66deg) rotateZ(${Math.sin(frame / 34) * 2.2}deg) translateX(${Math.sin(frame / 52) * 90}px)`,
            backgroundColor: "#0a3323",
            borderLeft: "16px solid rgba(255, 255, 255, 0.9)",
            borderRight: "16px solid rgba(255, 255, 255, 0.9)",
            overflow: "hidden",
            fontFamily,
          }}
        >
          {marks.map((y) => (
            <div key={`band-${y}`}>
              {y < 100 && (y / 5) % 2 === 0 ? (
                <div style={{ position: "absolute", left: 0, right: 0, top: at(y + 5), height: 5 * YARD, backgroundColor: "#0d4029" }} />
              ) : null}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: at(y) - (y === 100 || y === 0 ? 9 : 4),
                  height: y === 100 || y === 0 ? 18 : 8,
                  backgroundColor: "rgba(255, 255, 255, 0.92)",
                }}
              />
              {y % 10 === 0 && y > 0 && y < 100
                ? ["13%", "87%"].map((left) => (
                    <div
                      key={left}
                      style={{
                        position: "absolute",
                        left,
                        top: at(y) - 96,
                        translate: "-50% 0",
                        fontSize: 170,
                        fontWeight: 800,
                        lineHeight: 1,
                        color: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      {y <= 50 ? y : 100 - y}
                    </div>
                  ))
                : null}
            </div>
          ))}
          {/* End zone */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: at(110),
              height: 10 * YARD,
              background: "linear-gradient(90deg, #7df3ff, #9b8cff, #ff8ad4, #ffd58a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 330,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: "#05060a",
            }}
          >
            PROFIT
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: at(140), height: 30 * YARD, backgroundColor: "#04060a" }} />
        </div>
      </div>
      {/* Darken the top so text stays readable, and fade the far field into haze */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(4, 6, 10, 0.96) 0%, rgba(4, 6, 10, 0.72) 22%, rgba(4, 6, 10, 0.2) 46%, rgba(4, 6, 10, 0) 70%, rgba(4, 6, 10, 0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Dark see-through panel that sits over the field.
export const glass: React.CSSProperties = {
  borderRadius: 44,
  backgroundColor: "rgba(8, 10, 16, 0.86)",
  border: "3px solid rgba(255, 255, 255, 0.16)",
  textShadow: "none",
  fontVariantNumeric: "tabular-nums",
};

// "For card breakers" tag: tells a cold viewer who this is for.
export const AudienceTag: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Audience tag"
      style={{
        alignSelf: "flex-start",
        padding: "18px 34px",
        borderRadius: 999,
        background: "linear-gradient(90deg, #7df3ff, #9b8cff, #ff8ad4, #ffd58a)",
        color: "#05060a",
        fontSize: 50,
        fontWeight: 800,
        letterSpacing: "-0.01em",
        textShadow: "none",
        scale: interpolate(frame, [0, 9], [0.5, 1], { ...CLAMP, easing: EASE_OUT, output: "perceptual-scale" }),
        transformOrigin: "left center",
      }}
    >
      For card breakers
    </Interactive.Div>
  );
};

// A trading card for one team's spot. `flip` runs 0 (foil back showing) to 1
// (front showing).
export const TeamCard: React.FC<{
  team: string;
  tier?: "Top" | "Mid" | "Low";
  price?: string;
  flip?: number;
  stamp?: number;
  width?: number;
}> = ({ team, tier, price, flip = 1, stamp = 0, width = 280 }) => {
  const frame = useCurrentFrame();
  const height = Math.round(width * 1.34);
  const face: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: 30,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };
  return (
    <div style={{ width, height, perspective: 1200, textShadow: "none" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transform: `rotateY(${(1 - flip) * 180}deg)`,
        }}
      >
        <div
          style={{
            ...face,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "24px 24px 22px",
            border: "5px solid transparent",
            background: `linear-gradient(160deg, #141826, #090b12) padding-box, conic-gradient(from ${frame * 6}deg, ${FOIL}) border-box`,
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
          }}
        >
          <span
            style={{
              alignSelf: "flex-start",
              padding: "6px 18px",
              borderRadius: 999,
              fontSize: 30,
              fontWeight: 800,
              backgroundColor: tier === "Top" ? C.text : tier === "Mid" ? "rgba(255,255,255,0.2)" : "transparent",
              border: tier === "Low" ? `2px solid ${C.line}` : "2px solid transparent",
              color: tier === "Top" ? C.bg : tier === "Low" ? C.muted : C.text,
              opacity: tier ? 1 : 0,
            }}
          >
            {tier ?? "Spot"}
          </span>
          <span style={{ fontSize: team.length > 9 ? 35 : 44, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{team}</span>
          <span
            style={{
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              color: price ? C.text : "transparent",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {price ?? "$0"}
          </span>
          {stamp > 0 ? (
            <span
              style={{
                position: "absolute",
                left: "50%",
                top: "76%",
                translate: "-50% -50%",
                rotate: "-14deg",
                scale: String(interpolate(stamp, [0, 1], [2.2, 1], CLAMP)),
                opacity: stamp,
                padding: "6px 22px",
                border: `6px solid ${C.up}`,
                borderRadius: 14,
                color: C.up,
                fontSize: 50,
                fontWeight: 800,
                letterSpacing: "0.04em",
                backgroundColor: "rgba(5, 6, 10, 0.7)",
              }}
            >
              SOLD
            </span>
          ) : null}
        </div>
        <div
          style={{
            ...face,
            transform: "rotateY(180deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `conic-gradient(from ${frame * 6}deg at 50% 50%, ${FOIL})`,
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
          }}
        >
          <div style={{ padding: 22, borderRadius: 26, backgroundColor: "rgba(5, 6, 10, 0.88)" }}>
            <LogoMark size={Math.round(width * 0.4)} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Foil confetti that bursts up and falls, starting at local frame `at`.
export const Confetti: React.FC<{ at: number; count?: number }> = ({ at, count = 70 }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / 30;
  if (t < 0) return null;
  const colors = ["#7df3ff", "#9b8cff", "#ff8ad4", "#ffd58a", "#63e6a9"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (-90 + (random(`a${i}`) - 0.5) * 120) * (Math.PI / 180);
        const speed = 900 + random(`s${i}`) * 1500;
        const x = 540 + Math.cos(angle) * speed * t;
        const y = 1150 + Math.sin(angle) * speed * t + 1700 * t * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 18 + random(`w${i}`) * 16,
              height: 30 + random(`h${i}`) * 22,
              borderRadius: 5,
              backgroundColor: colors[i % colors.length],
              rotate: `${random(`r${i}`) * 360 + t * (300 + random(`v${i}`) * 500)}deg`,
              opacity: interpolate(t, [0, 1.3, 1.9], [1, 1, 0], CLAMP),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
