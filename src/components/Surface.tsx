import React, { useMemo } from "react";
import { random, useCurrentFrame } from "remotion";
import { C, FONT, T } from "../theme";

/** Cuadricula de papel milimetrado. Dos densidades, como en un cuaderno. */
export const Grid: React.FC<{ night?: boolean }> = ({ night }) => {
  const fine = night ? "#16221F" : C.grid;
  const bold = night ? "#1E2E2A" : "#B7BFB4";
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 1920 1080"
    >
      <defs>
        <pattern id="gfine" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0 L0 0 0 64" fill="none" stroke={fine} strokeWidth="1.6" />
        </pattern>
        <pattern id="gbold" width="320" height="320" patternUnits="userSpaceOnUse">
          <path d="M320 0 L0 0 0 320" fill="none" stroke={bold} strokeWidth="2.2" />
        </pattern>
      </defs>
      <rect width="1920" height="1080" fill="url(#gfine)" />
      <rect width="1920" height="1080" fill="url(#gbold)" />
    </svg>
  );
};

/**
 * Grano de papel. Se regenera cada pocos fotogramas para que respire, igual
 * que el grano de una pelicula, en vez de quedarse congelado.
 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.16 }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 3);
  const specks = useMemo(() => {
    const out: { x: number; y: number; r: number; d: number; o: number }[] = [];
    for (let i = 0; i < 900; i++) {
      out.push({
        x: random(`gx${step}${i}`) * 1920,
        y: random(`gy${step}${i}`) * 1080,
        r: 0.8 + random(`gr${step}${i}`) * 2.6,
        d: random(`gd${step}${i}`),
        o: 0.15 + random(`go${step}${i}`) * 0.5,
      });
    }
    return out;
  }, [step]);

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none",
      }}
      viewBox="0 0 1920 1080"
    >
      {specks.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={s.d > 0.5 ? "#D8D8D8" : "#3C3C3C"}
          opacity={s.o}
        />
      ))}
    </svg>
  );
};

/** Orla fina y marcas de esquina: el mobiliario de marco del canal. */
export const Frame: React.FC<{ night?: boolean }> = ({ night }) => {
  const c = night ? C.paleDim : "#B9B09A";
  const P = [
    [96, 92, 1, 1],
    [1824, 92, -1, 1],
    [96, 988, 1, -1],
    [1824, 988, -1, -1],
  ];
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 1920 1080"
    >
      {P.map((p, i) => (
        <g key={i}>
          <path
            d={`M${p[0] + p[2] * 62} ${p[1]} L${p[0]} ${p[1]} L${p[0]} ${p[1] + p[3] * 62}`}
            fill="none"
            stroke={c}
            strokeWidth="2.4"
            opacity="0.62"
          />
          <circle cx={p[0]} cy={p[1]} r="4.5" fill="none" stroke={c} strokeWidth="1.4" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
};

/** Lienzo base de cualquier plano. */
export const Surface: React.FC<{
  night?: boolean;
  grid?: boolean;
  frame?: boolean;
  children?: React.ReactNode;
}> = ({ night, grid = true, frame = true, children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: night ? C.night : C.paper,
      overflow: "hidden",
    }}
  >
    {grid ? <Grid night={night} /> : null}
    {children}
    {frame ? <Frame night={night} /> : null}
    <Grain opacity={night ? 0.1 : 0.16} />
  </div>
);

export const Kicker: React.FC<{ children: React.ReactNode; night?: boolean }> = ({
  children,
  night,
}) => (
  <div
    style={{
      position: "absolute",
      left: 128,
      top: 96,
      fontFamily: FONT.mono,
      fontSize: T.kicker,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: night ? C.mutedNight : C.muted,
    }}
  >
    {children}
  </div>
);

export const Source: React.FC<{ children: React.ReactNode; night?: boolean }> = ({
  children,
  night,
}) => (
  <div
    style={{
      position: "absolute",
      right: 128,
      bottom: 92,
      textAlign: "right",
      fontFamily: FONT.mono,
      fontSize: T.source,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: night ? C.paleDim : "#8A918B",
    }}
  >
    {children}
  </div>
);
