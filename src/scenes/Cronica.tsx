import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { ACENTO, APAGADO, FONT, PAPEL, REALCE, TINTA } from "../theme";
import { useFrame } from "../estilo";

/**
 * Motion graphics del video de Turquia.
 *
 * Igual que los del video de la deuda francesa, solo valen para una historia
 * concreta: aqui son la silla del gobernador del banco central, las dos curvas
 * que se cruzan -tipos que bajan, precios que suben- y el marcador del dolar.
 * Se dibujan con la tinta, el papel y el acento de la plantilla, asi que se
 * ven igual de bien sobre el papel blanco del canal.
 */

const VB = "0 0 1920 1080";
const lienzo: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
const suave = (x: number) => 1 - Math.pow(1 - x, 3);
const tramo = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/* ================================================================== */
/* silla: quien se ha sentado, y cuanto ha durado                      */
/* ================================================================== */
export type EspecSilla = {
  gobernadores: {
    nombre: string;
    meses: number;
    /** despedido · dimitio · relevado · sigue */
    fin: "despedido" | "dimitio" | "relevado" | "sigue";
    cuando?: string;
  }[];
  /** Cuantos mostrar. El resto no existe todavia: la silla se va llenando. */
  hasta?: number;
};

const ETIQUETA_FIN: Record<string, string> = {
  despedido: "DESPEDIDO",
  dimitio: "DIMITIÓ",
  relevado: "RELEVADO",
  sigue: "SIGUE",
};

export const SillaGobernador: React.FC<{ spec: EspecSilla }> = ({ spec }) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const n = Math.min(spec.hasta ?? spec.gobernadores.length, spec.gobernadores.length);
  const lista = spec.gobernadores.slice(0, n);

  const X0 = 560;
  const ANCHO_MAX = 800;
  const maxMeses = 40;
  const ALTO = 92;
  const Y0 = 214;

  return (
    <svg style={lienzo} viewBox={VB}>
      <text x={X0 + 6} y="186" fill={APAGADO} fontFamily={FONT.mono} fontSize="24" letterSpacing="5">
        MESES EN LA SILLA
      </text>
      <line x1={X0} y1={Y0 - 14} x2={X0} y2={Y0 + 6 * ALTO} stroke={TINTA} strokeWidth="3" />

      {lista.map((g, i) => {
        const t0 = 6 + i * 22;
        const k = suave(tramo(frame, t0, t0 + 26));
        const largo = (g.meses / maxMeses) * ANCHO_MAX * k;
        const y = Y0 + i * ALTO;
        const termina = tramo(frame, t0 + 22, t0 + 34);
        const rojo = g.fin === "despedido";
        const abierta = g.fin === "sigue";
        return (
          <g key={g.nombre}>
            <text
              x={X0 - 30}
              y={y + 52}
              textAnchor="end"
              fill={TINTA}
              fontFamily={FONT.mono}
              fontWeight="500"
              fontSize="32"
              opacity={suave(tramo(frame, t0 - 2, t0 + 8))}
            >
              {g.nombre}
            </text>
            <rect x={X0} y={y + 14} width={largo} height="54" fill={rojo ? ACENTO : TINTA} />
            {abierta ? (
              // la barra de quien sigue no tiene final: se deshilacha
              <rect
                x={X0 + largo}
                y={y + 14}
                width={64 * termina}
                height="54"
                fill="none"
                stroke={TINTA}
                strokeWidth="3"
                strokeDasharray="10 8"
              />
            ) : null}
            <text
              x={X0 + largo + (abierta ? 84 : 22)}
              y={y + 52}
              fill={rojo ? ACENTO : TINTA}
              fontFamily={FONT.mono}
              fontWeight="500"
              fontSize="26"
              letterSpacing="3"
              opacity={termina}
            >
              {ETIQUETA_FIN[g.fin]}
              {g.cuando ? ` · ${g.cuando.toUpperCase()}` : ""}
            </text>
            <text
              x={X0 + 18}
              y={y + 53}
              fill={PAPEL}
              fontFamily={FONT.mono}
              fontWeight="500"
              fontSize="30"
              opacity={suave(tramo(frame, t0 + 14, t0 + 26))}
            >
              {g.meses < 12 ? `${g.meses}` : `${g.meses}`}
            </text>
          </g>
        );
      })}
      {/* una silla vacia al final de la fila, si falta alguien por llegar */}
      {n < spec.gobernadores.length ? (
        <g opacity={0.5 + 0.5 * Math.sin(frame / (fps * 0.18))}>
          <text
            x={X0 + 24}
            y={Y0 + n * ALTO + 54}
            fill={APAGADO}
            fontFamily={FONT.mono}
            fontSize="26"
            letterSpacing="4"
          >
            ¿QUIÉN SIGUE?
          </text>
        </g>
      ) : null}
    </svg>
  );
};

/* ================================================================== */
/* tijera: tipos que bajan, precios que suben                          */
/* ================================================================== */
export type EspecTijera = {
  desde: string;
  hasta: string;
  tipos: { x: number; y: number }[];
  inflacion: { x: number; y: number }[];
  etiquetaTipos?: string;
  etiquetaInflacion?: string;
};

export const TijeraTiposPrecios: React.FC<{ spec: EspecTijera }> = ({ spec }) => {
  const frame = useFrame();
  const X0 = 300;
  const X1 = 1470;
  const Y_ARRIBA = 190;
  const Y_ABAJO = 700;
  const maxY = 100;
  const px = (x: number) => X0 + x * (X1 - X0);
  const py = (y: number) => Y_ABAJO - (y / maxY) * (Y_ABAJO - Y_ARRIBA);

  const k = suave(tramo(frame, 8, 70));
  const cierra = suave(tramo(frame, 60, 90));

  // Recorta la serie hasta el punto que toca por la fraccion de animacion.
  const hasta = (pts: { x: number; y: number }[], f: number) => {
    const xTope = f;
    const out: string[] = [];
    for (let i = 0; i < pts.length; i++) {
      if (pts[i].x <= xTope) out.push(`${px(pts[i].x)},${py(pts[i].y)}`);
      else {
        const a = pts[i - 1];
        const b = pts[i];
        if (a) {
          const t = (xTope - a.x) / (b.x - a.x);
          out.push(`${px(xTope)},${py(a.y + (b.y - a.y) * t)}`);
        }
        break;
      }
    }
    return out.join(" ");
  };

  // Los tipos bajan en escalones (cada decision es un salto); la inflacion
  // une dos fechas con una recta discontinua, porque entre ellas no se dibuja
  // un dato que no se ha verificado.
  const escalones = (pts: { x: number; y: number }[], f: number) => {
    const out: string[] = [];
    for (let i = 0; i < pts.length; i++) {
      if (pts[i].x > f) break;
      if (i > 0) out.push(`${px(pts[i].x)},${py(pts[i - 1].y)}`);
      out.push(`${px(pts[i].x)},${py(pts[i].y)}`);
    }
    if (pts[pts.length - 1].x > f) {
      const ult = [...pts].reverse().find((p) => p.x <= f);
      if (ult) out.push(`${px(f)},${py(ult.y)}`);
    }
    return out.join(" ");
  };

  const ptsTipos = escalones(spec.tipos, k);
  const ptsInfl = hasta(spec.inflacion, k);
  const finT = spec.tipos[spec.tipos.length - 1];
  const finI = spec.inflacion[spec.inflacion.length - 1];
  const iniT = spec.tipos[0];
  const iniI = spec.inflacion[0];

  return (
    <svg style={lienzo} viewBox={VB}>
      {/* ejes */}
      <line x1={X0} y1={Y_ABAJO} x2={X1} y2={Y_ABAJO} stroke={TINTA} strokeWidth="3" />
      {[0, 25, 50, 75].map((v) => (
        <g key={v}>
          <line x1={X0} y1={py(v)} x2={X1} y2={py(v)} stroke={APAGADO} strokeWidth="1.5" opacity="0.28" />
          <text x={X0 - 22} y={py(v) + 9} textAnchor="end" fill={APAGADO} fontFamily={FONT.mono} fontSize="24">
            {v} %
          </text>
        </g>
      ))}
      <text x={X0} y={Y_ABAJO + 54} fill={APAGADO} fontFamily={FONT.mono} fontSize="26" letterSpacing="3">
        {spec.desde.toUpperCase()}
      </text>
      <text x={X1} y={Y_ABAJO + 54} textAnchor="end" fill={APAGADO} fontFamily={FONT.mono} fontSize="26" letterSpacing="3">
        {spec.hasta.toUpperCase()}
      </text>

      {/* el hueco entre las dos: es lo que se abre */}
      {k > 0.02 ? (
        <polygon
          points={`${ptsInfl} ${[...ptsTipos.split(" ")].reverse().join(" ")}`}
          fill={ACENTO}
          opacity={0.12 * cierra}
        />
      ) : null}

      <polyline
        points={ptsTipos}
        fill="none"
        stroke={TINTA}
        strokeWidth="9"
        strokeLinejoin="miter"
      />
      <polyline
        points={ptsInfl}
        fill="none"
        stroke={ACENTO}
        strokeWidth="9"
        strokeDasharray="22 12"
        strokeLinecap="butt"
      />

      {/* extremos */}
      {[iniT, iniI].map((p, i) => (
        <circle key={i} cx={px(p.x)} cy={py(p.y)} r="12" fill={i === 0 ? TINTA : ACENTO} />
      ))}
      <g opacity={cierra}>
        <circle cx={px(finT.x)} cy={py(finT.y)} r="14" fill={TINTA} />
        <circle cx={px(finI.x)} cy={py(finI.y)} r="14" fill={ACENTO} />
        <text x={px(finT.x) + 34} y={py(finT.y) + 12} fill={TINTA} fontFamily={FONT.mono} fontWeight="500" fontSize="46">
          {String(finT.y).replace(".", ",")} %
        </text>
        <text x={px(finI.x) + 34} y={py(finI.y) + 12} fill={ACENTO} fontFamily={FONT.mono} fontWeight="500" fontSize="46">
          {String(finI.y).replace(".", ",")} %
        </text>
        <text x={px(finT.x) + 34} y={py(finT.y) + 52} fill={APAGADO} fontFamily={FONT.mono} fontSize="24" letterSpacing="3">
          {(spec.etiquetaTipos ?? "TIPOS").toUpperCase()}
        </text>
        <text x={px(finI.x) + 34} y={py(finI.y) + 52} fill={APAGADO} fontFamily={FONT.mono} fontSize="24" letterSpacing="3">
          {(spec.etiquetaInflacion ?? "INFLACIÓN").toUpperCase()}
        </text>
      </g>
      <g opacity={suave(tramo(frame, 10, 24))}>
        <text x={px(iniT.x) + 26} y={py(iniT.y) + 52} textAnchor="start" fill={TINTA} fontFamily={FONT.mono} fontSize="30" fontWeight="500">
          {String(iniT.y).replace(".", ",")} %
        </text>
        <text x={px(iniI.x) + 26} y={py(iniI.y) - 26} textAnchor="start" fill={ACENTO} fontFamily={FONT.mono} fontSize="30" fontWeight="500">
          {String(iniI.y).replace(".", ",")} %
        </text>
      </g>
    </svg>
  );
};

/* ================================================================== */
/* marcador: cuantas liras cuesta un dolar, de etapa en etapa          */
/* ================================================================== */
export type EspecMarcador = {
  unidad?: string;
  etapas: { etiqueta: string; valor: number; nota?: string; sentido?: "pierde" | "rebota" }[];
};

export const MarcadorDolar: React.FC<{ spec: EspecMarcador }> = ({ spec }) => {
  const frame = useFrame();
  const { durationInFrames } = useVideoConfig();
  const n = spec.etapas.length;
  // Cada etapa se reparte el tiempo; el cambio de cifra dura medio segundo.
  const paso = Math.max(30, Math.floor((durationInFrames - 8) / n));
  const idx = Math.min(n - 1, Math.floor(Math.max(0, frame - 4) / paso));
  const local = (frame - 4) - idx * paso;
  const previo = idx === 0 ? 0 : spec.etapas[idx - 1].valor;
  const meta = spec.etapas[idx].valor;
  const t = suave(tramo(local, 0, 14));
  const valor = idx === 0 ? meta * suave(tramo(frame, 4, 24)) : previo + (meta - previo) * t;
  const sube = meta >= previo;
  const etapa = spec.etapas[idx];

  const entra = suave(tramo(frame, 0, 10));

  return (
    <svg style={lienzo} viewBox={VB}>
      <g opacity={entra}>
        <rect x="260" y="170" width="1400" height="520" fill={REALCE} stroke={TINTA} strokeWidth="4" />
        <rect x="260" y="170" width="1400" height="62" fill={TINTA} />
        <text x="296" y="213" fill={PAPEL} fontFamily={FONT.mono} fontSize="28" fontWeight="500" letterSpacing="5">
          {(spec.unidad ?? "LIRAS POR UN DÓLAR").toUpperCase()}
        </text>

        <text
          x="960"
          y="492"
          textAnchor="middle"
          fill={sube ? ACENTO : TINTA}
          fontFamily={FONT.mono}
          fontWeight="500"
          fontSize="260"
          letterSpacing="-6"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {valor.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </text>

        <text x="960" y="574" textAnchor="middle" fill={TINTA} fontFamily={FONT.mono} fontWeight="500" fontSize="40" letterSpacing="4">
          {etapa.etiqueta.toUpperCase()}
        </text>
        <text x="960" y="622" textAnchor="middle" fill={APAGADO} fontFamily={FONT.mono} fontSize="28" letterSpacing="3">
          {(etapa.nota ?? "").toUpperCase()}
        </text>

        {/* las etapas, como puntos */}
        {spec.etapas.map((_, i) => (
          <circle
            key={i}
            cx={960 + (i - (n - 1) / 2) * 52}
            cy={662}
            r={i === idx ? 11 : 7}
            fill={i <= idx ? ACENTO : APAGADO}
            opacity={i <= idx ? 1 : 0.4}
          />
        ))}
        {etapa.sentido ? (
          <text
            x="1620"
            y="213"
            textAnchor="end"
            fill={PAPEL}
            fontFamily={FONT.mono}
            fontSize="26"
            fontWeight="500"
            letterSpacing="4"
          >
            {etapa.sentido === "pierde" ? "▲ LA LIRA PIERDE" : "▼ LA LIRA REBOTA"}
          </text>
        ) : null}
      </g>
    </svg>
  );
};
