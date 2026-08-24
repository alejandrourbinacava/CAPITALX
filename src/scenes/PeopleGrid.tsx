import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/**
 * Rejilla de figuras. Entran escalonadas y una parte cambia de color para
 * marcar el subconjunto del que habla la locucion.
 *
 * Es el recurso mas util del lenguaje Vox para cifras de personas: convierte
 * un numero abstracto en algo que se cuenta con la vista.
 */
export const PeopleGrid: React.FC<{
  total: number;
  destacados: number;
  /** Cada figura representa a N personas. */
  escala: number;
  etiqueta?: string;
  etiquetaDestacados?: string;
}> = ({ total, destacados, escala, etiqueta, etiquetaDestacados }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const n = Math.round(total / escala);
  const nHi = Math.round(destacados / escala);
  const cols = 24;
  const rows = Math.ceil(n / cols);

  const cell = 58;
  const gridW = cols * cell;
  const x0 = (1920 - gridW) / 2 + 10;
  const y0 = 268;

  // Las figuras entran una tras otra en el primer tercio del plano
  const appear = interpolate(frame, [6, Math.min(durationInFrames - 10, 6 + 1.5 * fps)], [0, n], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // El subconjunto se tiñe despues, cuando ya estan todas
  const hiT = interpolate(
    frame,
    [Math.min(durationInFrames - 8, 1.9 * fps), Math.min(durationInFrames - 4, 3.0 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const figures = [];
  for (let i = 0; i < n; i++) {
    if (i > appear) break;
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = x0 + c * cell;
    const y = y0 + r * cell;
    // los destacados son los ultimos de la rejilla: se tiñen de abajo arriba
    const isHi = i >= n - nHi;
    const hiHere = isHi && (n - i) / Math.max(nHi, 1) <= hiT;
    const pop = Math.min(1, (appear - i) * 1.6);
    figures.push(
      <g key={i} transform={`translate(${x} ${y}) scale(${0.86 * pop})`} opacity={pop}>
        <circle cx="17" cy="11" r="11" fill={hiHere ? C.carmin : C.ink} />
        <path
          d="M2 46 C2 30 8 25 17 25 C26 25 32 30 32 46 Z"
          fill={hiHere ? C.carmin : C.ink}
        />
      </g>
    );
  }

  return (
    <>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
        {figures}
      </svg>
      {etiqueta ? (
        <div
          style={{
            position: "absolute",
            left: x0,
            top: y0 - 62,
            fontFamily: FONT.mono,
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          {etiqueta}
        </div>
      ) : null}
      {etiquetaDestacados ? (
        <div
          style={{
            position: "absolute",
            left: x0,
            top: y0 + rows * cell + 26,
            opacity: hiT,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 40,
            color: C.carmin,
          }}
        >
          {etiquetaDestacados}
        </div>
      ) : null}
    </>
  );
};
