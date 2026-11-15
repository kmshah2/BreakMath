import { loadFont } from "@remotion/google-fonts/Archivo";
import { Easing } from "remotion";

export const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

export const C = {
  bg: "#05060a",
  surface: "#0c0e15",
  raised: "#161a26",
  line: "rgba(255, 255, 255, 0.12)",
  text: "#f3f4f8",
  muted: "#9aa0b2",
  up: "#63e6a9",
  down: "#ff8080",
};

export const FOIL = "#7df3ff, #9b8cff, #ff8ad4, #ffd58a, #7df3ff";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const SPRING = Easing.spring({ damping: 200 });
export const POP = Easing.spring({ damping: 12, stiffness: 180 });

export const money = (n: number) => {
  const rounded = Math.round(n);
  return (rounded < 0 ? "-$" : "$") + Math.abs(rounded).toLocaleString("en-US");
};

export const headline: React.CSSProperties = {
  margin: 0,
  fontWeight: 800,
  fontSize: 96,
  lineHeight: 1.02,
  letterSpacing: "-0.035em",
  color: C.text,
};
