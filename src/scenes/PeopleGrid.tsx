import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/**
 * Rejilla de figuras.
 *
 * Convierte un número abstracto en algo que se cuenta con la vista. La rejilla
 * se adapta sola: elige columnas y tamaño para que quepa siempre en el mismo
 * hueco, tanto con veinte figuras como con setecientas.
 *
 * Cuando el subconjunto destacado no llega ni a una figura —ochenta y dos
 * personas dentro de seiscientas setenta mil— no se redondea al alza: se
 * dibuja del tamaño que le corresponde, aunque sea una mota, y se señala con
 * una guía. Esa desproporción *es* el dato.
 */

const CAJA = { x: 190, y: 250, w: 1540, h: 430 };

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

  const n = Math.max(1, Math.round(total / escala));
  const exactoHi = destacados / escala;
  const nHi = Math.floor(exactoHi);
  const resto = exactoHi - nHi; // la fracción que no llega a una figura entera

  // columnas y tamaño de celda para que la rejilla llene la caja sin salirse
  const cols = Math.max(1, Math.ceil(Math.sqrt((n * CAJA.w) / CAJA.h)));
  const rows = Math.ceil(n / cols);
  const celda = Math.min(CAJA.w / cols, CAJA.h / rows);
  const esc = celda / 58; // la figura está dibujada para una celda de 58
  const x0 = CAJA.x + (CAJA.w - cols * celda) / 2;
  const y0 = CAJA.y + (CAJA.h - rows * celda) / 2;

  const aparecen = interpolate(
    frame,
    [6, Math.min(durationInFrames - 10, 6 + 1.6 * fps)],
    [0, n],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const tHi = interpolate(
    frame,
    [Math.min(durationInFrames - 10, 1.9 * fps), Math.min(durationInFrames - 5, 3.0 * fps)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const pos = (i: number) => ({
    x: x0 + (i % cols) * celda,
    y: y0 + Math.floor(i / cols) * celda,
  });

  const figuras: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    if (i > aparecen) break;
    const { x, y } = pos(i);
    const destacada = i >= n - nHi && (n - i) / Math.max(nHi, 1) <= tHi;
    const entra = Math.min(1, (aparecen - i) * 1.6);
    figuras.push(
      <g key={i} transform={`translate(${x} ${y}) scale(${0.86 * esc * entra})`} opacity={entra}>
        <circle cx="17" cy="11" r="11" fill={destacada ? C.carmin : C.ink} />
        <path d="M2 46 C2 30 8 25 17 25 C26 25 32 30 32 46 Z" fill={destacada ? C.carmin : C.ink} />
      </g>
    );
  }

  // el caso de la minoría invisible
  const mota = nHi === 0 && resto > 0;
  const ultima = pos(n - 1);

  return (
    <>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
        {figuras}

        {mota ? (
          <g opacity={tHi}>
            {/* la fracción dibujada a su tamaño real: una mota */}
            <rect
              x={ultima.x + 10 * esc}
              y={ultima.y + 46 * esc - Math.max(1.5, 40 * esc * resto)}
              width={Math.max(2.5, 22 * esc)}
              height={Math.max(1.5, 40 * esc * resto)}
              fill={C.carmin}
            />
            <line
              x1={ultima.x + 20 * esc}
              y1={ultima.y + 44 * esc}
              x2={ultima.x + 150}
              y2={ultima.y + 150}
              stroke={C.carmin}
              strokeWidth="3"
            />
            <circle cx={ultima.x + 20 * esc} cy={ultima.y + 44 * esc} r="7" fill={C.carmin} />
            {etiquetaDestacados ? (
              <text
                x={ultima.x + 162}
                y={ultima.y + 162}
                fill={C.carmin}
                fontFamily={FONT.sans}
                fontWeight="700"
                fontSize="40"
              >
                {etiquetaDestacados}
              </text>
            ) : null}
          </g>
        ) : null}
      </svg>

      {etiqueta ? (
        <div
          style={{
            position: "absolute",
            left: CAJA.x,
            top: CAJA.y - 62,
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

      {etiquetaDestacados && !mota ? (
        <div
          style={{
            position: "absolute",
            left: CAJA.x,
            top: CAJA.y + rows * celda + 26,
            opacity: tHi,
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
