import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

export type Barra = {
  etiqueta: string;
  valor: number;
  tono?: "ink" | "carmin" | "verde" | "ocre";
  /** divide el valor mostrado (510000 con escala 1000 se muestra como 510) */
  escala?: number;
  decimales?: number;
};

export type BarrasSpec = {
  unidad?: string;
  datos: Barra[];
  prefijo?: string;
  sufijo?: string;
  /** franja sombreada de contexto, para decir "lo normal es esto" */
  referencia?: { etiqueta: string; min: number; max: number };
  diferencia?: string;
  resaltaDiferencia?: boolean;
};

const TONO = { ink: C.ink, carmin: C.carmin, verde: C.verde, ocre: C.ocre };
const suave = (x: number) => 1 - Math.pow(1 - x, 3);

const BASE = 656;
const ALTO = 392;

export const Barras: React.FC<{ spec: BarrasSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const crece = suave(
    interpolate(frame, [5, Math.min(durationInFrames - 8, 5 + 1.5 * fps)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const valores = spec.datos.map((d) => d.valor);
  const tope = Math.max(...valores, spec.referencia?.max ?? 0) * 1.18;

  const n = spec.datos.length;
  const ancho = n === 1 ? 420 : n === 2 ? 300 : n === 3 ? 240 : 190;
  const hueco = n <= 2 ? 150 : 96;
  const total = n * ancho + (n - 1) * hueco;
  const x0 = (1920 - total) / 2;

  const alturaDe = (v: number) => (v / tope) * ALTO;

  const fmt = (v: number, d: Barra) => {
    const escalado = v / (d.escala ?? 1);
    const txt = escalado.toLocaleString("es-ES", {
      minimumFractionDigits: d.decimales ?? 0,
      maximumFractionDigits: d.decimales ?? 0,
    });
    return `${spec.prefijo ?? ""}${txt}${spec.sufijo ?? ""}`;
  };

  // el corchete de la diferencia solo aparece con dos barras
  const hayDif = spec.diferencia && n === 2;
  const hA = alturaDe(spec.datos[0]?.valor ?? 0) * crece;
  const hB = hayDif ? alturaDe(spec.datos[1].valor) * crece : 0;
  const difOpacidad = spec.resaltaDiferencia
    ? interpolate(frame, [1.1 * fps, 1.7 * fps], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0.55;

  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 1920 1080"
    >
      {/* franja de referencia: el contexto de lo que es normal */}
      {spec.referencia ? (
        <g opacity={crece}>
          <rect
            x={176}
            y={BASE - alturaDe(spec.referencia.max)}
            width={1568}
            height={alturaDe(spec.referencia.max) - alturaDe(spec.referencia.min)}
            fill={C.verde}
            opacity="0.13"
          />
          <line
            x1={176}
            y1={BASE - alturaDe(spec.referencia.max)}
            x2={1744}
            y2={BASE - alturaDe(spec.referencia.max)}
            stroke={C.verde}
            strokeWidth="2"
            strokeDasharray="10 8"
          />
          <text
            x={176}
            y={BASE - alturaDe(spec.referencia.max) - 20}
            fill={C.verde}
            fontFamily={FONT.mono}
            fontSize="24"
            letterSpacing="2"
          >
            {spec.referencia.etiqueta}
          </text>
        </g>
      ) : null}

      {spec.datos.map((d, i) => {
        const x = x0 + i * (ancho + hueco);
        const h = alturaDe(d.valor) * crece;
        const color = TONO[d.tono ?? "ink"];
        const mostrado = d.valor * crece;
        return (
          <g key={i}>
            {/* sombra plana desplazada: el recurso del canal */}
            <rect x={x + 16} y={BASE - h + 16} width={ancho} height={h} fill={C.carmin} opacity="0.2" />
            <rect x={x} y={BASE - h} width={ancho} height={h} fill={color} />
            <text
              x={x + ancho / 2}
              y={BASE - h - 30}
              textAnchor="middle"
              fill={C.ink}
              fontFamily={FONT.sans}
              fontWeight="700"
              fontSize={n <= 2 ? 76 : 58}
              letterSpacing="-0.03em"
            >
              {fmt(mostrado, d)}
            </text>
            <text
              x={x + ancho / 2}
              y={BASE + 52}
              textAnchor="middle"
              fill={C.muted}
              fontFamily={FONT.mono}
              fontSize="26"
              letterSpacing="2"
            >
              {d.etiqueta}
            </text>
          </g>
        );
      })}

      <line x1={x0 - 120} y1={BASE} x2={x0 + total + 120} y2={BASE} stroke={C.ink} strokeWidth="4" />

      {/* corchete que mide la diferencia entre las dos barras */}
      {hayDif ? (
        <g opacity={difOpacidad}>
          <line x1={x0 + total + 60} y1={BASE - hA} x2={x0 + total + 60} y2={BASE - hB} stroke={C.carmin} strokeWidth="5" />
          <line x1={x0 + total + 38} y1={BASE - hA} x2={x0 + total + 82} y2={BASE - hA} stroke={C.carmin} strokeWidth="5" />
          <line x1={x0 + total + 38} y1={BASE - hB} x2={x0 + total + 82} y2={BASE - hB} stroke={C.carmin} strokeWidth="5" />
          <text
            x={1744}
            y={BASE - hA - 26}
            textAnchor="end"
            fill={C.carmin}
            fontFamily={FONT.sans}
            fontWeight="700"
            fontSize="38"
          >
            {spec.diferencia}
          </text>
        </g>
      ) : null}

      {spec.unidad ? (
        <text x={176} y={196} fill={C.muted} fontFamily={FONT.mono} fontSize="26" letterSpacing="4">
          {spec.unidad}
        </text>
      ) : null}
    </svg>
  );
};

/** Serie temporal simple: dos extremos y la pendiente entre ellos. */
export const Lineas: React.FC<{
  spec: {
    unidad?: string;
    nota?: string;
    series: { nombre: string; tono?: string; sufijo?: string; puntos: [string, number][] }[];
  };
}> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const k = suave(
    interpolate(frame, [8, Math.min(durationInFrames - 8, 8 + 1.6 * fps)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const todos = spec.series.flatMap((s) => s.puntos.map((p) => p[1]));
  const max = Math.max(...todos) * 1.15;
  const min = Math.min(...todos) * 0.82;
  const X0 = 340;
  const X1 = 1580;
  const Y0 = 250;
  const Y1 = 720;
  const sx = (i: number, n: number) => X0 + (i / (n - 1)) * (X1 - X0);
  const sy = (v: number) => Y1 - ((v - min) / (max - min)) * (Y1 - Y0);

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
      <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={C.ink} strokeWidth="4" />
      {spec.series.map((s, si) => {
        const n = s.puntos.length;
        const color = (TONO as any)[s.tono ?? "ink"] ?? C.ink;
        const xEnd = sx(0, n) + (sx(n - 1, n) - sx(0, n)) * k;
        const yEnd = sy(s.puntos[0][1]) + (sy(s.puntos[n - 1][1]) - sy(s.puntos[0][1])) * k;
        return (
          <g key={si}>
            <path
              d={`M${sx(0, n)} ${sy(s.puntos[0][1])} L${xEnd} ${yEnd} L${xEnd} ${Y1} L${sx(0, n)} ${Y1} Z`}
              fill={color}
              opacity="0.12"
            />
            <line x1={sx(0, n)} y1={sy(s.puntos[0][1])} x2={xEnd} y2={yEnd} stroke={color} strokeWidth="7" strokeLinecap="round" />
            <circle cx={sx(0, n)} cy={sy(s.puntos[0][1])} r="12" fill={color} />
            <circle cx={xEnd} cy={yEnd} r="14" fill={C.carmin} />
            <text x={sx(0, n)} y={sy(s.puntos[0][1]) - 34} textAnchor="middle" fill={C.ink} fontFamily={FONT.sans} fontWeight="700" fontSize="52">
              {s.puntos[0][1].toLocaleString("es-ES")}
              {s.sufijo ?? ""}
            </text>
            <text x={xEnd} y={yEnd - 40} textAnchor="middle" fill={C.carmin} fontFamily={FONT.sans} fontWeight="700" fontSize="60" opacity={k}>
              {(s.puntos[0][1] + (s.puntos[n - 1][1] - s.puntos[0][1]) * k).toLocaleString("es-ES", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {s.sufijo ?? ""}
            </text>
            <text x={sx(0, n)} y={Y1 + 48} textAnchor="middle" fill={C.muted} fontFamily={FONT.mono} fontSize="26">
              {s.puntos[0][0]}
            </text>
            <text x={sx(n - 1, n)} y={Y1 + 48} textAnchor="middle" fill={C.muted} fontFamily={FONT.mono} fontSize="26">
              {s.puntos[n - 1][0]}
            </text>
          </g>
        );
      })}
      {spec.unidad ? (
        <text x={X0} y={196} fill={C.muted} fontFamily={FONT.mono} fontSize="26" letterSpacing="4">
          {spec.unidad}
        </text>
      ) : null}
      {spec.nota ? (
        <text x={X1} y={196} textAnchor="end" fill={C.carmin} fontFamily={FONT.sans} fontWeight="700" fontSize="34" opacity={k}>
          {spec.nota}
        </text>
      ) : null}
    </svg>
  );
};
