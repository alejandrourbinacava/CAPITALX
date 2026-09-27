import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { ACENTO, APAGADO, FONT, TINTA } from "../theme";
import { familiaDe, pesoDe, useFrame, usePlantilla } from "../estilo";

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
 *
 * Tiene tres formas, porque la cuadrícula compacta salía igual en los
 * dieciséis vídeos: la cuadrícula de siempre, unas pocas filas anchas con
 * figuras grandes -que se cuentan con el dedo, como un pictograma de
 * periódico- y el reparto en dos bloques separados por un hueco, donde la
 * división se ve antes de contar nada.
 */

const CAJA = { x: 190, y: 250, w: 1540, h: 430 };

type Props = {
  total: number;
  destacados: number;
  /** Cada figura representa a N personas. */
  escala: number;
  etiqueta?: string;
  etiquetaDestacados?: string;
};

/** Una figura, del tamaño que le toque. */
const Figura: React.FC<{ x: number; y: number; esc: number; on: boolean; k: number }> = ({
  x,
  y,
  esc,
  on,
  k,
}) => (
  <g transform={`translate(${x} ${y}) scale(${0.86 * esc * k})`} opacity={k}>
    <circle cx="17" cy="11" r="11" fill={on ? ACENTO : TINTA} />
    <path d="M2 46 C2 30 8 25 17 25 C26 25 32 30 32 46 Z" fill={on ? ACENTO : TINTA} />
  </g>
);

/** Reparte `n` figuras dentro de una caja. `filas` fuerza el numero de filas. */
const repartir = (n: number, caja: typeof CAJA, filas?: number) => {
  const cols = filas
    ? Math.ceil(n / filas)
    : Math.max(1, Math.ceil(Math.sqrt((n * caja.w) / caja.h)));
  const rows = filas ?? Math.ceil(n / cols);
  const celda = Math.min(caja.w / cols, caja.h / rows);
  return {
    cols,
    rows,
    celda,
    esc: celda / 58,
    x0: caja.x + (caja.w - cols * celda) / 2,
    y0: caja.y + (caja.h - rows * celda) / 2,
  };
};

export const PeopleGrid: React.FC<Props> = (props) => {
  const { total, destacados, escala, etiqueta, etiquetaDestacados } = props;
  const frame = useFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = usePlantilla();

  const n = Math.max(1, Math.round(total / escala));
  const exactoHi = destacados / escala;
  const nHi = Math.floor(exactoHi);
  const resto = exactoHi - nHi;
  // La minoria invisible tiene su propio dibujo y solo esta resuelto sobre la
  // cuadricula compacta: cuando toca, manda ella.
  const mota = nHi === 0 && resto > 0;
  const forma = mota ? "rejilla" : p.gente;

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

  /* ---------- bloque: los destacados, aparte ---------- */
  if (forma === "bloque") {
    const nResto = n - nHi;
    const HUECO = 130;
    const anchoUtil = CAJA.w - HUECO;
    const wResto = Math.max(160, (anchoUtil * nResto) / n);
    const wHi = anchoUtil - wResto;
    const izq = repartir(nResto, { ...CAJA, w: wResto });
    const der = repartir(nHi, { ...CAJA, x: CAJA.x + wResto + HUECO, w: wHi });
    const celda = Math.min(izq.celda, der.celda);
    const esc = celda / 58;
    // Cada grupo se pega a su lado del hueco. Centrados dentro de su caja
    // quedaba un vacio raro entre el grupo pequeno y la linea de division.
    const xIzq = CAJA.x + wResto - izq.cols * celda;
    const xDer = CAJA.x + wResto + HUECO;

    return (
      <>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
          {Array.from({ length: nResto }, (_, i) => {
            if (i > aparecen) return null;
            return (
              <Figura
                key={`r${i}`}
                x={xIzq + (i % izq.cols) * celda}
                y={izq.y0 + Math.floor(i / izq.cols) * celda}
                esc={esc}
                on={false}
                k={Math.min(1, (aparecen - i) * 1.6)}
              />
            );
          })}
          {Array.from({ length: nHi }, (_, i) => (
            <Figura
              key={`h${i}`}
              x={xDer + (i % der.cols) * celda}
              y={der.y0 + Math.floor(i / der.cols) * celda}
              esc={esc}
              on
              k={Math.min(1, tHi * 2 - i / Math.max(nHi, 1))}
            />
          ))}
          {/* la linea del hueco: es lo que convierte dos grupos en una division */}
          <line
            x1={CAJA.x + wResto + HUECO / 2}
            y1={CAJA.y - 30}
            x2={CAJA.x + wResto + HUECO / 2}
            y2={CAJA.y + CAJA.h + 30}
            stroke={ACENTO}
            strokeWidth="4"
            opacity={tHi}
          />
        </svg>
        <Etiquetas
          p={p}
          etiqueta={etiqueta}
          etiquetaDestacados={etiquetaDestacados}
          tHi={tHi}
          abajo={CAJA.y + CAJA.h + 26}
          xDestacados={CAJA.x + wResto + HUECO}
        />
      </>
    );
  }

  /* ---------- rejilla y fila ---------- */
  const filas = forma === "fila" ? Math.min(3, Math.max(1, Math.ceil(n / 14))) : undefined;
  const g = repartir(n, CAJA, filas);
  const pos = (i: number) => ({
    x: g.x0 + (i % g.cols) * g.celda,
    y: g.y0 + Math.floor(i / g.cols) * g.celda,
  });

  const figuras: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    if (i > aparecen) break;
    const { x, y } = pos(i);
    const destacada = i >= n - nHi && (n - i) / Math.max(nHi, 1) <= tHi;
    figuras.push(
      <Figura
        key={i}
        x={x}
        y={y}
        esc={g.esc}
        on={destacada}
        k={Math.min(1, (aparecen - i) * 1.6)}
      />
    );
  }

  const ultima = pos(n - 1);

  return (
    <>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
        {figuras}

        {mota ? (
          <g opacity={tHi}>
            {/* la fracción dibujada a su tamaño real: una mota */}
            <rect
              x={ultima.x + 10 * g.esc}
              y={ultima.y + 46 * g.esc - Math.max(1.5, 40 * g.esc * resto)}
              width={Math.max(2.5, 22 * g.esc)}
              height={Math.max(1.5, 40 * g.esc * resto)}
              fill={ACENTO}
            />
            <line
              x1={ultima.x + 20 * g.esc}
              y1={ultima.y + 44 * g.esc}
              x2={ultima.x + 150}
              y2={ultima.y + 150}
              stroke={ACENTO}
              strokeWidth="3"
            />
            <circle cx={ultima.x + 20 * g.esc} cy={ultima.y + 44 * g.esc} r="7" fill={ACENTO} />
            {etiquetaDestacados ? (
              <text
                x={ultima.x + 162}
                y={ultima.y + 162}
                fill={ACENTO}
                fontFamily={familiaDe(p)}
                fontWeight={pesoDe(p)}
                fontSize="40"
              >
                {etiquetaDestacados}
              </text>
            ) : null}
          </g>
        ) : null}
      </svg>

      <Etiquetas
        p={p}
        etiqueta={etiqueta}
        etiquetaDestacados={mota ? undefined : etiquetaDestacados}
        tHi={tHi}
        abajo={CAJA.y + g.rows * g.celda + 26}
      />
    </>
  );
};

const Etiquetas: React.FC<{
  p: ReturnType<typeof usePlantilla>;
  etiqueta?: string;
  etiquetaDestacados?: string;
  tHi: number;
  abajo: number;
  xDestacados?: number;
}> = ({ p, etiqueta, etiquetaDestacados, tHi, abajo, xDestacados }) => (
  <>
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
          color: APAGADO,
        }}
      >
        {etiqueta}
      </div>
    ) : null}

    {etiquetaDestacados ? (
      <div
        style={{
          position: "absolute",
          left: xDestacados ?? CAJA.x,
          top: abajo,
          opacity: tHi,
          fontFamily: familiaDe(p),
          fontWeight: pesoDe(p),
          fontSize: 40,
          color: ACENTO,
        }}
      >
        {etiquetaDestacados}
      </div>
    ) : null}
  </>
);
