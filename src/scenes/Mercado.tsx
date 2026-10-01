import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { ACENTO, APAGADO, FONT, PAPEL, REALCE, TINTA } from "../theme";
import { useFrame } from "../estilo";

/**
 * Motion graphics hechos para un video concreto.
 *
 * Los dibujos de `Ilustracion` valen para cualquier tema: una ciudad que se
 * construye, un caudal que se corta. Estos no. Cada uno cuenta una cosa que
 * solo existe en el video de la deuda francesa -la deuda subiendo en directo,
 * la escalera de las notas, el termometro del bono-, y se programan para eso.
 * Es la diferencia entre rellenar una plantilla y montar un video.
 *
 * Son dibujo, no fotografia: van escalonados con el resto de la plantilla.
 */

const VB = "0 0 1920 1080";
const lienzo: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
const suave = (x: number) => 1 - Math.pow(1 - x, 3);

const tramo = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/* ================================================================== */
/* reloj: la deuda subiendo en directo                                 */
/* ================================================================== */
export type EspecReloj = {
  /** Deuda de partida, en euros. */
  base: number;
  /** Cuanto sube por segundo, en euros. */
  porSegundo: number;
  etiqueta?: string;
  nota?: string;
};

export const RelojDeuda: React.FC<{ spec: EspecReloj }> = ({ spec }) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const entra = suave(tramo(frame, 0, 12));
  const valor = Math.floor(spec.base + spec.porSegundo * (frame / fps));
  const texto = valor.toLocaleString("es-ES");

  // Los digitos que cambian tan deprisa que no se leen se pintan mas
  // apagados: se ve donde esta la frontera entre lo que es dato y lo que
  // es movimiento.
  const vivos = 4;
  const ini = Math.max(0, texto.length - vivos);

  return (
    <svg style={lienzo} viewBox={VB}>
      <g opacity={entra} transform={`translate(0 ${(1 - entra) * 24})`}>
        <rect x="170" y="150" width="1580" height="520" fill={REALCE} stroke={ACENTO} strokeWidth="3" />
        <rect x="170" y="150" width="1580" height="64" fill={ACENTO} />
        <text
          x="206"
          y="194"
          fill={PAPEL}
          fontFamily={FONT.mono}
          fontSize="30"
          fontWeight="500"
          letterSpacing="5"
        >
          {(spec.etiqueta ?? "DEUDA PÚBLICA · FRANCIA").toUpperCase()}
        </text>
        <text
          x="1714"
          y="194"
          textAnchor="end"
          fill={PAPEL}
          fontFamily={FONT.mono}
          fontSize="26"
          letterSpacing="4"
        >
          EUR
        </text>

        {/* las cifras */}
        <text
          x="960"
          y="430"
          textAnchor="middle"
          fontFamily={FONT.mono}
          fontWeight="500"
          fontSize="118"
          letterSpacing="-2"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          <tspan fill={TINTA}>{texto.slice(0, ini)}</tspan>
          <tspan fill={ACENTO}>{texto.slice(ini)}</tspan>
        </text>

        {/* el ritmo */}
        <line x1="260" y1="500" x2="1660" y2="500" stroke={APAGADO} strokeWidth="2" opacity="0.5" />
        <text x="260" y="574" fill={APAGADO} fontFamily={FONT.mono} fontSize="30" letterSpacing="4">
          CADA SEGUNDO
        </text>
        <text
          x="1660"
          y="574"
          textAnchor="end"
          fill={ACENTO}
          fontFamily={FONT.mono}
          fontWeight="500"
          fontSize="62"
        >
          ▲ +{String(Math.round(spec.porSegundo)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €
        </text>
        <text x="260" y="620" fill={APAGADO} fontFamily={FONT.mono} fontSize="26" letterSpacing="3">
          {spec.nota ?? ""}
        </text>

        {/* barra de pulso: avanza un tramo por cada segundo de reloj */}
        <rect x="260" y="642" width="1400" height="6" fill={APAGADO} opacity="0.25" />
        <rect
          x="260"
          y="642"
          width={1400 * ((frame / fps) % 1)}
          height="6"
          fill={ACENTO}
        />
      </g>
    </svg>
  );
};

/* ================================================================== */
/* escalera: las notas de las agencias, peldano a peldano              */
/* ================================================================== */
export type EspecEscalera = {
  agencias: { nombre: string; peldano: number; nota: string; perspectiva?: string }[];
};

const PELDANOS = ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-"];

export const EscaleraNotas: React.FC<{ spec: EspecEscalera }> = ({ spec }) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const Y0 = 140;
  const H = 86;
  const ancho = 400;
  const X0 = 360;

  return (
    <svg style={lienzo} viewBox={VB}>
      {/* peldanos */}
      {PELDANOS.map((n, i) => {
        const y = Y0 + i * H;
        const e = suave(tramo(frame, 2 + i * 2, 14 + i * 2));
        return (
          <g key={n} opacity={e}>
            <text
              x={X0 - 40}
              y={y + 52}
              textAnchor="end"
              fill={i === 0 ? ACENTO : APAGADO}
              fontFamily={FONT.mono}
              fontWeight="500"
              fontSize="42"
              letterSpacing="2"
            >
              {n}
            </text>
            <line
              x1={X0}
              y1={y + H - 6}
              x2={X0 + ancho * spec.agencias.length + 220}
              y2={y + H - 6}
              stroke={APAGADO}
              strokeWidth="2"
              opacity="0.35"
            />
          </g>
        );
      })}

      {spec.agencias.map((a, k) => {
        const x = X0 + 40 + k * ancho;
        // Bajan de uno en uno: cada peldano un golpe, con una pausa corta, y
        // las tres agencias no a la vez sino escalonadas.
        const t0 = 34 + k * 14;
        const paso = 11;
        const avance = interpolate(frame, [t0, t0 + a.peldano * paso], [0, a.peldano], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const entero = Math.floor(avance);
        const resto = avance - entero;
        const bajando = frame >= t0 && avance < a.peldano;
        // Dentro de cada peldano, un rebote corto al aterrizar.
        const pos = entero + suave(Math.min(1, resto * 1.6));
        const y = Y0 + pos * H;
        const llega = suave(tramo(frame, t0 + a.peldano * paso, t0 + a.peldano * paso + 8));
        const fin = a.peldano >= 3;

        return (
          <g key={a.nombre}>
            {/* la estela del descenso */}
            <line
              x1={x + 145}
              y1={Y0 + 6}
              x2={x + 145}
              y2={y + 6}
              stroke={ACENTO}
              strokeWidth="3"
              strokeDasharray="8 8"
              opacity="0.7"
            />
            <g transform={`translate(${x} ${y + 6})`}>
              <rect width="290" height={H - 14} fill={fin && !bajando ? ACENTO : TINTA} />
              <text
                x="22"
                y={(H - 14) / 2 + 11}
                fill={PAPEL}
                fontFamily={FONT.mono}
                fontWeight="500"
                fontSize="27"
                letterSpacing="2"
              >
                {a.nombre.toUpperCase()}
              </text>
              {/* la nota aparece cuando aterriza, dentro del propio chip */}
              <text
                x="268"
                y={(H - 14) / 2 + 14}
                textAnchor="end"
                fill={PAPEL}
                fontFamily={FONT.mono}
                fontWeight="500"
                fontSize="40"
                opacity={llega}
              >
                {a.nota}
              </text>
            </g>
            {a.perspectiva ? (
              <text
                x={x + 308}
                y={y + 6 + (H - 14) / 2 + 9}
                fill={ACENTO}
                fontFamily={FONT.mono}
                fontSize="24"
                letterSpacing="3"
                opacity={llega}
              >
                {a.perspectiva.toUpperCase()}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* marca de la triple A: lo que tenian las tres hasta 2012 */}
      <g opacity={suave(tramo(frame, 8, 22))}>
        <text
          x={X0 + ancho * spec.agencias.length + 200}
          y={Y0 + 50}
          textAnchor="end"
          fill={ACENTO}
          fontFamily={FONT.mono}
          fontSize="26"
          letterSpacing="3"
        >
          HASTA 2012
        </text>
      </g>
    </svg>
  );
};

/* ================================================================== */
/* termometro: el bono a diez anos, lectura a lectura                  */
/* ================================================================== */
export type EspecTermometro = {
  lecturas: { etiqueta: string; valor: number }[];
  umbral?: number;
  minimo?: number;
  maximo?: number;
};

export const TermometroBono: React.FC<{ spec: EspecTermometro }> = ({ spec }) => {
  const frame = useFrame();
  const min = spec.minimo ?? 3.0;
  const max = spec.maximo ?? 5.5;
  const Y_ALTO = 190;
  const Y_BAJO = 665;
  const yDe = (v: number) => Y_BAJO - ((v - min) / (max - min)) * (Y_BAJO - Y_ALTO);
  const TX = 400;
  const n = spec.lecturas.length;

  // Cada lectura tiene su tramo: el mercurio sube hasta ella y se queda.
  const dur = 38;
  const inicio = 14;
  let nivel = min;
  for (let i = 0; i < n; i++) {
    const desde = i === 0 ? min : spec.lecturas[i - 1].valor;
    const t = suave(tramo(frame, inicio + i * (dur + 12), inicio + i * (dur + 12) + dur));
    if (frame >= inicio + i * (dur + 12)) nivel = desde + (spec.lecturas[i].valor - desde) * t;
  }

  const entra = suave(tramo(frame, 0, 12));

  return (
    <svg style={lienzo} viewBox={VB}>
      <g opacity={entra}>
        {/* escala */}
        {[3.0, 3.5, 4.0, 4.5, 5.0, 5.5]
          .filter((v) => v >= min && v <= max)
          .map((v) => (
            <g key={v}>
              <line x1={TX - 90} y1={yDe(v)} x2={TX - 50} y2={yDe(v)} stroke={APAGADO} strokeWidth="3" />
              <text
                x={TX - 110}
                y={yDe(v) + 10}
                textAnchor="end"
                fill={APAGADO}
                fontFamily={FONT.mono}
                fontSize="30"
              >
                {v.toFixed(1).replace(".", ",")} %
              </text>
            </g>
          ))}

        {/* tubo */}
        <rect
          x={TX - 34}
          y={Y_ALTO - 20}
          width="68"
          height={Y_BAJO - Y_ALTO + 40}
          rx="34"
          fill={REALCE}
          stroke={APAGADO}
          strokeWidth="3"
        />
        {/* mercurio */}
        <rect
          x={TX - 22}
          y={yDe(nivel)}
          width="44"
          height={Y_BAJO - yDe(nivel) + 14}
          fill={ACENTO}
        />
        <circle cx={TX} cy={Y_BAJO + 56} r="58" fill={REALCE} stroke={APAGADO} strokeWidth="3" />
        <circle cx={TX} cy={Y_BAJO + 56} r="42" fill={ACENTO} />

        {/* umbral */}
        {spec.umbral !== undefined ? (
          <g>
            <line
              x1={TX - 60}
              y1={yDe(spec.umbral)}
              x2={1560}
              y2={yDe(spec.umbral)}
              stroke={TINTA}
              strokeWidth="3"
              strokeDasharray="14 10"
            />
            <text
              x={1560}
              y={yDe(spec.umbral) - 16}
              textAnchor="end"
              fill={TINTA}
              fontFamily={FONT.mono}
              fontSize="28"
              letterSpacing="3"
            >
              EL 5 %
            </text>
          </g>
        ) : null}

        {/* las lecturas. Las etiquetas se reparten para no pisarse: dos
            lecturas a nueve centesimas una de otra caen a veinte pixeles. */}
        {(() => {
          const orden = spec.lecturas
            .map((l, i) => ({ l, i, y: yDe(l.valor) }))
            .sort((a, b) => a.y - b.y);
          let previo = -1e9;
          const huecos = orden.map((o) => {
            const ly = Math.max(o.y, previo + 118);
            previo = ly;
            return { ...o, ly };
          });
          return huecos.map(({ l, i, y, ly }) => {
            const ini = inicio + i * (dur + 12) + dur;
            const e = suave(tramo(frame, ini, ini + 9));
            const ultimo = i === n - 1;
            const color = ultimo ? ACENTO : TINTA;
            return (
              <g key={i} opacity={e}>
                <polyline
                  points={`${TX + 40},${y} 560,${y} 620,${ly}`}
                  fill="none"
                  stroke={ultimo ? ACENTO : APAGADO}
                  strokeWidth="3"
                />
                <circle cx={TX + 40} cy={y} r="9" fill={color} />
                <text
                  x={650}
                  y={ly + 18}
                  fill={color}
                  fontFamily={FONT.mono}
                  fontWeight="500"
                  fontSize={ultimo ? 84 : 60}
                >
                  {l.valor.toFixed(2).replace(".", ",")} %
                </text>
                <text
                  x={650}
                  y={ly + 56}
                  fill={APAGADO}
                  fontFamily={FONT.mono}
                  fontSize="26"
                  letterSpacing="3"
                >
                  {l.etiqueta.toUpperCase()}
                </text>
              </g>
            );
          });
        })()}
      </g>
    </svg>
  );
};

/* ================================================================== */
/* cuartos: a quien le debe Francia                                    */
/* ================================================================== */
export type EspecCuartos = {
  cuartos: { etiqueta: string; valor?: string; nota?: string }[];
};

export const CuartosDeuda: React.FC<{ spec: EspecCuartos }> = ({ spec }) => {
  const frame = useFrame();
  const L = 276;
  const G = 12;
  const X0 = 250;
  const Y0 = 140;
  const pos = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ];
  const tonos = [TINTA, ACENTO, REALCE, APAGADO];
  // Parte la etiqueta en dos lineas por el espacio mas cercano al medio: en un
  // cuarto de 276 px "INVERSORES FRANCESES" no cabe en una.
  const partir = (t: string) => {
    if (t.length <= 12) return [t];
    const m = t.length / 2;
    let mejor = -1;
    for (let i = 0; i < t.length; i++)
      if (t[i] === " " && (mejor < 0 || Math.abs(i - m) < Math.abs(mejor - m))) mejor = i;
    return mejor < 0 ? [t] : [t.slice(0, mejor), t.slice(mejor + 1)];
  };

  return (
    <svg style={lienzo} viewBox={VB}>
      {spec.cuartos.slice(0, 4).map((c, i) => {
        const t0 = 8 + i * 22;
        const k = suave(tramo(frame, t0, t0 + 16));
        const [cx, cy] = pos[i];
        const x = X0 + cx * (L + G);
        const y = Y0 + cy * (L + G);
        const oscuro = i === 0 || i === 1;
        return (
          <g key={i}>
            <rect x={x} y={y} width={L} height={L} fill="none" stroke={APAGADO} strokeWidth="2" opacity="0.5" />
            {/* se llena desde abajo */}
            <rect
              x={x}
              y={y + L * (1 - k)}
              width={L}
              height={L * k}
              fill={tonos[i]}
              stroke={i === 2 ? APAGADO : "none"}
              strokeWidth="2"
            />
            <g opacity={k}>
              <text
                x={x + 24}
                y={y + 86}
                fill={oscuro ? PAPEL : TINTA}
                fontFamily={FONT.mono}
                fontWeight="500"
                fontSize="78"
              >
                {c.valor ?? "25 %"}
              </text>
              {partir(c.etiqueta.toUpperCase()).map((linea, j, todas) => (
                <text
                  key={j}
                  x={x + 24}
                  y={y + L - 28 - (todas.length - 1 - j) * 34}
                  fill={oscuro ? PAPEL : TINTA}
                  fontFamily={FONT.mono}
                  fontWeight="500"
                  fontSize="27"
                  letterSpacing="2"
                >
                  {linea}
                </text>
              ))}
            </g>
          </g>
        );
      })}

      {/* las notas, a la derecha, una por cuarto */}
      {spec.cuartos.slice(0, 4).map((c, i) => {
        const t0 = 8 + i * 22 + 12;
        const e = suave(tramo(frame, t0, t0 + 12));
        const y = Y0 + 40 + i * 140;
        const [cx, cy] = pos[i];
        return (
          <g key={i} opacity={e}>
            <circle cx={1060} cy={y + 10} r="8" fill={tonos[i] === REALCE ? APAGADO : tonos[i]} />
            <text x={1100} y={y + 22} fill={TINTA} fontFamily={FONT.mono} fontWeight="500" fontSize="40">
              {c.etiqueta}
            </text>
            <text x={1100} y={y + 66} fill={APAGADO} fontFamily={FONT.mono} fontSize="28">
              {c.nota ?? ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ================================================================== */
/* anos: un calendario en rojo                                         */
/* ================================================================== */
export type EspecAnos = {
  desde: number;
  hasta: number;
  etiqueta?: string;
};

export const AnosEnRojo: React.FC<{ spec: EspecAnos }> = ({ spec }) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const total = spec.hasta - spec.desde + 1;
  const COLS = 17;
  const filas = Math.ceil(total / COLS);
  const W = 62;
  const H = 118;
  const G = 8;
  const X0 = 190;
  const Y0 = 170;

  // Un cuadro por cada ano, en ritmo constante: el calendario se llena como
  // quien pasa las hojas de un taco.
  const dur = Math.min(3.4 * fps, 90);
  const cuenta = Math.floor(tramo(frame, 8, 8 + dur) * total);

  return (
    <svg style={lienzo} viewBox={VB}>
      {Array.from({ length: total }, (_, i) => {
        const c = i % COLS;
        const f = Math.floor(i / COLS);
        const lleno = i < cuenta;
        const recien = i === cuenta - 1;
        return (
          <g key={i} transform={`translate(${X0 + c * (W + G)} ${Y0 + f * (H + G)})`}>
            <rect
              width={W}
              height={H}
              fill={lleno ? ACENTO : "none"}
              stroke={lleno ? ACENTO : APAGADO}
              strokeWidth="2"
              opacity={lleno ? 1 : 0.35}
            />
            <text
              x={W / 2}
              y={H - 14}
              textAnchor="middle"
              fill={lleno ? PAPEL : APAGADO}
              fontFamily={FONT.mono}
              fontSize="19"
              fontWeight={recien ? 500 : 400}
            >
              {String(spec.desde + i).slice(2)}
            </text>
          </g>
        );
      })}

      {/* el total */}
      <text
        x="1760"
        y={Y0 + 250}
        textAnchor="end"
        fill={TINTA}
        fontFamily={FONT.mono}
        fontWeight="500"
        fontSize="250"
        letterSpacing="-6"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {cuenta}
      </text>
      <text
        x="1760"
        y={Y0 + 310}
        textAnchor="end"
        fill={APAGADO}
        fontFamily={FONT.mono}
        fontSize="30"
        letterSpacing="4"
      >
        AÑOS SEGUIDOS
      </text>
      <text
        x="1760"
        y={Y0 + 356}
        textAnchor="end"
        fill={ACENTO}
        fontFamily={FONT.mono}
        fontSize="30"
        letterSpacing="4"
      >
        {spec.desde} → {spec.hasta}
      </text>
      <rect x={X0} y={Y0 + filas * (H + G) + 12} width="1" height="1" fill="none" />
    </svg>
  );
};
