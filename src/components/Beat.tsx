import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

export type Anim = "pop" | "slideL" | "slideR" | "slideUp" | "wipeX" | "grow" | "fade";

/**
 * Un elemento que entra y sale en un momento concreto del plano.
 *
 * Es la pieza que da el pulso al montaje: en lugar de dejar el encuadre
 * quieto, cada plano se compone de varios beats que aparecen y desaparecen.
 * Los tiempos van en segundos desde el inicio del plano.
 */
export const Beat: React.FC<{
  in?: number;
  out?: number;
  anim?: Anim;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ in: tIn = 0, out, anim = "pop", children, style }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fIn = Math.round(tIn * fps);
  const fOut = out === undefined ? durationInFrames + 999 : Math.round(out * fps);

  const enter = spring({
    frame: frame - fIn,
    fps,
    config: anim === "pop" ? { damping: 14, mass: 0.5, stiffness: 170 } : { damping: 200, mass: 0.55 },
  });
  const exit =
    out === undefined
      ? 0
      : interpolate(frame, [fOut, fOut + Math.round(0.28 * fps)], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  if (frame < fIn - 1) return null;
  if (exit >= 1) return null;

  const k = enter * (1 - exit);
  let transform = "";
  let clipPath: string | undefined;

  switch (anim) {
    case "slideL":
      transform = `translateX(${interpolate(k, [0, 1], [70, 0])}px)`;
      break;
    case "slideR":
      transform = `translateX(${interpolate(k, [0, 1], [-70, 0])}px)`;
      break;
    case "slideUp":
      transform = `translateY(${interpolate(k, [0, 1], [58, 0])}px)`;
      break;
    case "wipeX":
      clipPath = `inset(0 ${(1 - k) * 100}% 0 0)`;
      break;
    case "grow":
      transform = `scaleY(${k})`;
      break;
    case "fade":
      break;
    case "pop":
    default:
      transform = `translateY(${interpolate(k, [0, 1], [26, 0])}px) scale(${interpolate(
        k,
        [0, 1],
        [0.93, 1]
      )})`;
  }

  return (
    <div
      style={{
        position: "absolute",
        opacity: anim === "wipeX" ? 1 : k,
        transform,
        clipPath,
        transformOrigin: anim === "grow" ? "bottom center" : "center center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Etiqueta al estilo Vox: bloque de color solido con texto en negrita. */
export const Tag: React.FC<{
  children: React.ReactNode;
  tone?: "ocre" | "carmin" | "ink" | "paper";
  size?: number;
}> = ({ children, tone = "ocre", size = 40 }) => {
  const bg = tone === "carmin" ? C.carmin : tone === "ink" ? C.ink : tone === "paper" ? C.paper : C.ocre;
  const fg = tone === "carmin" || tone === "ink" ? C.paper : C.ink;
  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color: fg,
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.01em",
        padding: "8px 18px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

/** Linea guia con punto: conecta una etiqueta con un punto del dibujo. */
export const Leader: React.FC<{ w: number; h: number; flip?: boolean; color?: string }> = ({
  w,
  h,
  flip,
  color = C.carmin,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame, fps, config: { damping: 200, mass: 0.5 } });
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <line
        x1={flip ? w : 0}
        y1={0}
        x2={flip ? w - (w - 0) * k : w * k}
        y2={h * k}
        stroke={color}
        strokeWidth="3"
      />
      <circle cx={flip ? 0 : w} cy={h} r={7 * k} fill={color} />
    </svg>
  );
};

/** Circulo trazado a mano. Solo para señalar una prueba concreta. */
export const SketchRing: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  seedBase?: number;
  delay?: number;
}> = ({ cx, cy, rx, ry, seedBase = 3, delay = 0.4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = interpolate(frame, [delay * fps, delay * fps + 0.75 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const turns = 1.45;
  const n = 96;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2 * turns - 0.6;
    const wob = 1 + Math.sin(i * seedBase * 1.7) * 0.045;
    const x = cx + Math.cos(t) * rx * wob;
    const y = cy + Math.sin(t) * ry * wob;
    d += (i ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  const len = Math.PI * 2 * turns * ((rx + ry) / 2) * 1.15;
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
      <path
        d={d}
        fill="none"
        stroke={C.carmin}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - k)}
      />
    </svg>
  );
};
