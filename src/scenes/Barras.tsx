import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { ACENTO, APAGADO, C, FONT, REALCE, TINTA } from "../theme";
import { familiaDe, pesoDe, useFrame, usePlantilla } from "../estilo";

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

const TONO = { ink: TINTA, carmin: ACENTO, verde: C.verde, ocre: REALCE };
const suave = (x: number) => 1 - Math.pow(1 - x, 3);

const BASE = 656;
const ALTO = 392;

/* ---------- columnas: barras verticales. La de siempre. ---------- */
const Columnas: React.FC<{ spec: BarrasSpec }> = ({ spec }) => {
  const frame = useFrame();
  const { fps, durationInFrames } = useVideoConfig();

  /**
   * Las barras ya no suben todas a la vez ni en el primer segundo.
   *
   * Antes crecian juntas en segundo y medio y el resto del plano se quedaba
   * muerto: cinco segundos mirando un grafico quieto. Ahora cada barra tiene
   * su turno, escalonadas, y la ultima termina pasada la mitad de la escena.
   * Ver crecer una barra despues de otra es ademas lo que hace la
   * comparacion: la segunda se mide contra la primera, que ya esta ahi.
   */
  const finBarras = Math.min(durationInFrames - 6, 5 + 2.6 * fps);
  const creceDe = (i: number) =>
    suave(
      interpolate(frame, [5 + i * 0.42 * fps, finBarras + i * 0.42 * fps], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );
  const crece = creceDe(0);

  // Latido lento del conjunto, para que nada quede del todo inmovil.
  const respira = interpolate(frame, [0, durationInFrames], [1, 1.028], {
    extrapolateRight: "clamp",
  });

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
      {/* latido lento: nada queda del todo inmovil */}
      <g transform={`translate(960 ${BASE}) scale(${respira}) translate(-960 ${-BASE})`}>
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
        const k = creceDe(i);
        const h = alturaDe(d.valor) * k;
        const color = TONO[d.tono ?? "ink"];
        const mostrado = d.valor * k;
        return (
          <g key={i}>
            {/* sombra plana desplazada: el recurso del canal */}
            <rect x={x + 16} y={BASE - h + 16} width={ancho} height={h} fill={ACENTO} opacity="0.2" />
            <rect x={x} y={BASE - h} width={ancho} height={h} fill={color} />
            <text
              x={x + ancho / 2}
              y={BASE - h - 30}
              textAnchor="middle"
              fill={TINTA}
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
              fill={APAGADO}
              fontFamily={FONT.mono}
              fontSize="26"
              letterSpacing="2"
            >
              {d.etiqueta}
            </text>
          </g>
        );
      })}

      <line x1={x0 - 120} y1={BASE} x2={x0 + total + 120} y2={BASE} stroke={TINTA} strokeWidth="4" />

      {/* corchete que mide la diferencia entre las dos barras */}
      {hayDif ? (
        <g opacity={difOpacidad}>
          <line x1={x0 + total + 60} y1={BASE - hA} x2={x0 + total + 60} y2={BASE - hB} stroke={ACENTO} strokeWidth="5" />
          <line x1={x0 + total + 38} y1={BASE - hA} x2={x0 + total + 82} y2={BASE - hA} stroke={ACENTO} strokeWidth="5" />
          <line x1={x0 + total + 38} y1={BASE - hB} x2={x0 + total + 82} y2={BASE - hB} stroke={ACENTO} strokeWidth="5" />
          <text
            x={1744}
            y={BASE - hA - 26}
            textAnchor="end"
            fill={ACENTO}
            fontFamily={FONT.sans}
            fontWeight="700"
            fontSize="38"
          >
            {spec.diferencia}
          </text>
        </g>
      ) : null}

      {spec.unidad ? (
        <text x={176} y={196} fill={APAGADO} fontFamily={FONT.mono} fontSize="26" letterSpacing="4">
          {spec.unidad}
        </text>
      ) : null}
      </g>
    </svg>
  );
};

/** Serie temporal simple: dos extremos y la pendiente entre ellos. */

/* ================================================================== */
/* filas: barras horizontales. El ojo baja por las etiquetas en vez de */
/* recorrer el pie, y caben etiquetas largas sin partirlas.            */
/* ================================================================== */
const Filas: React.FC<{ spec: BarrasSpec }> = ({ spec }) => {
  const frame = useFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = usePlantilla();

  const n = spec.datos.length;
  const alto = n <= 2 ? 124 : n === 3 ? 96 : 72;
  const hueco = n <= 2 ? 78 : 52;
  const totalAlto = n * alto + (n - 1) * hueco;
  const y0 = 540 - totalAlto / 2 + 40;

  const X = 700;
  const LARGO = 1020;
  const tope = Math.max(...spec.datos.map((d) => d.valor)) * 1.16;

  const fin = Math.min(durationInFrames - 6, 5 + 2.4 * fps);
  const creceDe = (i: number) =>
    suave(
      interpolate(frame, [5 + i * 0.36 * fps, fin + i * 0.36 * fps], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );

  const fmt = (v: number, d: Barra) => {
    const escalado = v / (d.escala ?? 1);
    const txt = escalado.toLocaleString("es-ES", {
      minimumFractionDigits: d.decimales ?? 0,
      maximumFractionDigits: d.decimales ?? 0,
    });
    return `${spec.prefijo ?? ""}${txt}${spec.sufijo ?? ""}`;
  };

  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 1920 1080"
    >
      {spec.unidad ? (
        <text x={180} y={y0 - 78} fill={APAGADO} fontFamily={FONT.mono} fontSize="26" letterSpacing="4">
          {spec.unidad}
        </text>
      ) : null}

      {/* el eje vertical del que cuelgan todas */}
      <line x1={X} y1={y0 - 34} x2={X} y2={y0 + totalAlto + 14} stroke={TINTA} strokeWidth="4" />

      {spec.datos.map((d, i) => {
        const y = y0 + i * (alto + hueco);
        const k = creceDe(i);
        const w = (d.valor / tope) * LARGO * k;
        const color = TONO[d.tono ?? "ink"];
        return (
          <g key={i}>
            <text
              x={X - 34}
              y={y + alto * 0.68}
              textAnchor="end"
              fill={APAGADO}
              fontFamily={FONT.mono}
              fontSize={n <= 3 ? 30 : 26}
              letterSpacing="2"
            >
              {d.etiqueta}
            </text>
            <rect x={X} y={y} width={w} height={alto} fill={color} />
            <text
              x={X + w + 26}
              y={y + alto * 0.74}
              fill={TINTA}
              fontFamily={familiaDe(p)}
              fontWeight={pesoDe(p)}
              fontSize={n <= 2 ? 68 : 50}
              letterSpacing="-0.03em"
            >
              {fmt(d.valor * k, d)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ================================================================== */
/* puntos: casi todo papel en blanco. Un filete por dato y un punto    */
/* gordo en el valor. Compara posiciones, no areas.                    */
/* ================================================================== */
const Puntos: React.FC<{ spec: BarrasSpec }> = ({ spec }) => {
  const frame = useFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = usePlantilla();

  const n = spec.datos.length;
  const paso = n <= 2 ? 190 : n === 3 ? 150 : 112;
  const totalAlto = (n - 1) * paso;
  const y0 = 540 - totalAlto / 2;

  const X = 660;
  const LARGO = 1020;
  const tope = Math.max(...spec.datos.map((d) => d.valor)) * 1.2;

  const fin = Math.min(durationInFrames - 6, 5 + 2.2 * fps);
  const creceDe = (i: number) =>
    suave(
      interpolate(frame, [5 + i * 0.4 * fps, fin + i * 0.4 * fps], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );

  const fmt = (v: number, d: Barra) => {
    const escalado = v / (d.escala ?? 1);
    const txt = escalado.toLocaleString("es-ES", {
      minimumFractionDigits: d.decimales ?? 0,
      maximumFractionDigits: d.decimales ?? 0,
    });
    return `${spec.prefijo ?? ""}${txt}${spec.sufijo ?? ""}`;
  };

  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 1920 1080"
    >
      {spec.unidad ? (
        <text x={180} y={y0 - 120} fill={APAGADO} fontFamily={FONT.mono} fontSize="26" letterSpacing="4">
          {spec.unidad}
        </text>
      ) : null}

      {spec.datos.map((d, i) => {
        const y = y0 + i * paso;
        const k = creceDe(i);
        const x = X + (d.valor / tope) * LARGO * k;
        const color = TONO[d.tono ?? "ink"];
        return (
          <g key={i}>
            {/* el carril entero, para que se vea contra que se compara */}
            <line x1={X} y1={y} x2={X + LARGO} y2={y} stroke={APAGADO} strokeWidth="2" opacity="0.3" />
            <line x1={X} y1={y} x2={x} y2={y} stroke={color} strokeWidth="8" />
            <circle cx={x} cy={y} r={26} fill={color} />
            <text
              x={X - 34}
              y={y + 11}
              textAnchor="end"
              fill={APAGADO}
              fontFamily={FONT.mono}
              fontSize={n <= 3 ? 30 : 26}
              letterSpacing="2"
            >
              {d.etiqueta}
            </text>
            <text
              x={x + 44}
              y={y + 20}
              fill={TINTA}
              fontFamily={familiaDe(p)}
              fontWeight={pesoDe(p)}
              fontSize={n <= 2 ? 64 : 48}
              letterSpacing="-0.02em"
            >
              {fmt(d.valor * k, d)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/**
 * El mismo dato, con la forma que pida la plantilla.
 *
 * Un grafico de barras verticales centrado era la unica forma que tenia el
 * canal, y las barras son entre el diez y el dieciseis por ciento de las
 * escenas de cada video. Tres formas distintas de leer lo mismo.
 */
export const Barras: React.FC<{ spec: BarrasSpec }> = ({ spec }) => {
  const p = usePlantilla();
  if (!spec?.datos?.length) return null;
  // El corchete de diferencia y la franja de referencia solo estan dibujados
  // en columnas: si el guion los pide, manda la forma que sabe pintarlos.
  if (spec.referencia || (spec.diferencia && spec.datos.length === 2)) {
    return <Columnas spec={spec} />;
  }
  if (p.grafico === "filas") return <Filas spec={spec} />;
  if (p.grafico === "puntos") return <Puntos spec={spec} />;
  return <Columnas spec={spec} />;
};

export const Lineas: React.FC<{
  spec: {
    unidad?: string;
    nota?: string;
    series: { nombre: string; tono?: string; sufijo?: string; puntos: [string, number][] }[];
  };
}> = ({ spec }) => {
  const frame = useFrame();
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
      <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={TINTA} strokeWidth="4" />
      {spec.series.map((s, si) => {
        const n = s.puntos.length;
        const color = (TONO as any)[s.tono ?? "ink"] ?? TINTA;
        // La curva pasa por TODOS los puntos de la serie y se va descubriendo por longitud.
        const pts = s.puntos.map((q, i) => ({ x: sx(i, n), y: sy(q[1]) }));
        const largos = pts.slice(1).map((b, i) => Math.hypot(b.x - pts[i].x, b.y - pts[i].y));
        const total = largos.reduce((a, b) => a + b, 0) || 1;
        let resto = k * total;
        const visibles: { x: number; y: number }[] = [pts[0]];
        let valorFin = s.puntos[0][1];
        for (let i = 0; i < largos.length; i++) {
          if (resto >= largos[i]) {
            visibles.push(pts[i + 1]);
            resto -= largos[i];
            valorFin = s.puntos[i + 1][1];
          } else {
            const f = largos[i] > 0 ? resto / largos[i] : 0;
            visibles.push({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f });
            valorFin = s.puntos[i][1] + (s.puntos[i + 1][1] - s.puntos[i][1]) * f;
            resto = 0;
            break;
          }
        }
        const punta = visibles[visibles.length - 1];
        const trazo = visibles.map((q, i) => `${i ? "L" : "M"}${q.x} ${q.y}`).join(" ");
        // Cuantas etiquetas de eje caben: todas si son pocas; una de cada dos si son muchas.
        const paso = n > 8 ? 2 : 1;
        return (
          <g key={si}>
            <path d={`${trazo} L${punta.x} ${Y1} L${pts[0].x} ${Y1} Z`} fill={color} opacity="0.12" />
            <path d={trazo} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((q, i) =>
              q.x <= punta.x + 0.5 ? <circle key={i} cx={q.x} cy={q.y} r={i === 0 ? 12 : 8} fill={color} /> : null
            )}
            <circle cx={punta.x} cy={punta.y} r="14" fill={ACENTO} />
            <text x={pts[0].x} y={pts[0].y - 34} textAnchor="middle" fill={TINTA} fontFamily={FONT.sans} fontWeight="700" fontSize="52">
              {s.puntos[0][1].toLocaleString("es-ES")}
              {s.sufijo ?? ""}
            </text>
            <text x={punta.x} y={punta.y - 40} textAnchor="middle" fill={ACENTO} fontFamily={FONT.sans} fontWeight="700" fontSize="60" opacity={k}>
              {valorFin.toLocaleString("es-ES", {
                minimumFractionDigits: 0,
                maximumFractionDigits: Math.abs(valorFin) < 10 ? 2 : 0,
              })}
              {s.sufijo ?? ""}
            </text>
            {pts.map((q, i) =>
              (i % paso === 0 || i === n - 1) && q.x <= punta.x + 0.5 ? (
                <text key={`e${i}`} x={q.x} y={Y1 + 48} textAnchor="middle" fill={APAGADO} fontFamily={FONT.mono} fontSize={n > 5 ? 22 : 26}>
                  {s.puntos[i][0]}
                </text>
              ) : null
            )}
          </g>
        );
      })}
      {spec.unidad ? (
        <text x={X0} y={196} fill={APAGADO} fontFamily={FONT.mono} fontSize="26" letterSpacing="4">
          {spec.unidad}
        </text>
      ) : null}
      {spec.nota ? (
        <text x={X1} y={196} textAnchor="end" fill={ACENTO} fontFamily={FONT.sans} fontWeight="700" fontSize="34" opacity={k}>
          {spec.nota}
        </text>
      ) : null}
    </svg>
  );
};
