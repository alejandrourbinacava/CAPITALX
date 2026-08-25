import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/**
 * Mapa de Europa muy simplificado.
 *
 * No busca precision cartografica: busca que se reconozca de un vistazo el
 * pais del que hablamos. Los contornos estan dibujados a mano en coordenadas
 * del lienzo, no proyectados, porque a este tamaño una proyeccion real no
 * aporta nada y complica el sistema.
 */

import EUROPA from "../data/europa.json";
import NORTEAMERICA from "../data/norteamerica.json";
import ASIA from "../data/asia.json";

/**
 * Contornos reales de Natural Earth (dominio publico), proyectados con
 * Mercator y recortados al encuadre de Europa occidental. Se generan una vez
 * y viven en src/data/europa.json ya en coordenadas del lienzo, asi que
 * dibujarlos no cuesta nada en tiempo de render.
 */
type Pais = { d: string; cx: number; cy: number; nombre: string };

/** Cada region es su propia proyeccion, encuadrada a su parte del mundo. */
const REGIONES: Record<string, Record<string, Pais>> = {
  europa: EUROPA as any,
  norteamerica: NORTEAMERICA as any,
  asia: ASIA as any,
};

/** Etiqueta con guia, para que los paises pequenos se sigan leyendo. */
const EtiquetaPais: React.FC<{ cx: number; cy: number; nombre: string; k: number }> = ({
  cx, cy, nombre, k,
}) => {
  const ancho = nombre.length * 22 + 64;
  const izquierda = cx < 760;
  const lx = izquierda ? cx - 60 - ancho : cx + 60;
  const ly = cy - 96;
  return (
    <g opacity={k}>
      <line
        x1={cx}
        y1={cy}
        x2={izquierda ? lx + ancho : lx}
        y2={ly + 30}
        stroke={C.ink}
        strokeWidth="3"
      />
      <circle cx={cx} cy={cy} r="9" fill={C.ink} />
      <rect x={lx} y={ly} width={ancho} height={60} fill={C.ink} />
      <text
        x={lx + ancho / 2}
        y={ly + 42}
        textAnchor="middle"
        fill={C.paper}
        fontFamily={FONT.sans}
        fontWeight="700"
        fontSize="34"
      >
        {nombre}
      </text>
    </g>
  );
};

export const Mapa: React.FC<{
  spec: {
    destaca?: string[];
    region?: "europa" | "norteamerica" | "asia";
    etiqueta?: string;
    puntos?: { nombre: string; valor: string }[];
    flecha?: { hacia: string; valor: string };
  };
}> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const destaca = spec.destaca ?? [];
  const PAISES = REGIONES[spec.region ?? "europa"];

  const arco = interpolate(frame, [0.5 * fps, Math.min(durationInFrames - 6, 2.2 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
      {/* el continente entero, en tinta muy baja */}
      {Object.entries(PAISES).map(([k, p]) => (
        <path
          key={k}
          d={p.d}
          fill={C.ink}
          opacity={destaca.includes(k) ? 0 : 0.14}
          stroke={C.ink}
          strokeWidth="1.6"
          strokeOpacity="0.3"
        />
      ))}

      {destaca.map((k, i) => {
        const p = PAISES[k];
        if (!p) return null;
        const s = spring({ frame: frame - 3 - i * 5, fps, config: { damping: 16, mass: 0.6, stiffness: 160 } });
        return (
          <g key={k} opacity={s}>
            <path d={p.d} fill={C.carmin} transform={`translate(${16 * s} ${16 * s})`} opacity="0.5" />
            <path d={p.d} fill={C.ocre} stroke={C.ink} strokeWidth="3.5" />
            <EtiquetaPais
              cx={p.cx}
              cy={p.cy}
              nombre={p.nombre}
              k={interpolate(s, [0.55, 1], [0, 1], { extrapolateLeft: "clamp" })}
            />
          </g>
        );
      })}

      {/* puntos con dato colgando */}
      {(spec.puntos ?? []).map((pt, i) => {
        const x = 300 + i * 190;
        const y = 560 + i * 90;
        const s = spring({ frame: frame - 12 - i * 9, fps, config: { damping: 200, mass: 0.5 } });
        return (
          <g key={pt.nombre} opacity={s}>
            <circle cx={x} cy={y} r="12" fill={C.carmin} />
            <line x1={x} y1={y} x2={x} y2={y + 70 * s} stroke={C.carmin} strokeWidth="3" />
            <rect x={x - 92} y={y + 70} width="184" height="62" fill={C.ink} />
            <text x={x} y={y + 112} textAnchor="middle" fill={C.paper} fontFamily={FONT.sans} fontWeight="700" fontSize="34">
              {pt.nombre} {pt.valor}
            </text>
          </g>
        );
      })}

      {/* flecha larga hacia un destino fuera del mapa */}
      {spec.flecha ? (
        <g>
          <path
            d={`M528 439 C760 200 1300 300 ${528 + 1300 * arco} ${439 + 330 * Math.pow(arco, 1.7)}`}
            fill="none"
            stroke={C.carmin}
            strokeWidth="8"
            strokeDasharray="18 14"
            strokeLinecap="round"
          />
          <g opacity={arco > 0.85 ? 1 : 0}>
            <rect x="1420" y="700" width="380" height="110" fill={C.ink} />
            <text x="1610" y="748" textAnchor="middle" fill={C.ocre} fontFamily={FONT.mono} fontSize="24" letterSpacing="4">
              {spec.flecha.hacia.toUpperCase()}
            </text>
            <text x="1610" y="792" textAnchor="middle" fill={C.paper} fontFamily={FONT.sans} fontWeight="700" fontSize="42">
              {spec.flecha.valor}
            </text>
          </g>
        </g>
      ) : null}
    </svg>
  );
};

/** Lista de puntos que entran uno a uno; opcionalmente uno queda activo. */
export const Lista: React.FC<{
  spec: { titulo?: string; puntos: string[]; activo?: number };
  night?: boolean;
}> = ({ spec, night }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tinta = night ? C.paper : C.ink;
  const numerada = spec.activo !== undefined;

  return (
    <div style={{ position: "absolute", left: 200, top: 240, right: 200 }}>
      {spec.titulo ? (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 28,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: night ? C.mutedNight : C.muted,
            marginBottom: 40,
          }}
        >
          {spec.titulo}
        </div>
      ) : null}
      {spec.puntos.map((p, i) => {
        const k = spring({ frame: frame - 8 - i * 7, fps, config: { damping: 200, mass: 0.55 } });
        const activo = spec.activo === i;
        const apagado = numerada && !activo;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 28,
              marginBottom: numerada ? 34 : 22,
              opacity: k * (apagado ? 0.26 : 1),
              transform: `translateX(${interpolate(k, [0, 1], [-40, 0])}px)`,
            }}
          >
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: numerada ? 40 : 30,
                color: activo ? C.carmin : night ? C.mutedNight : C.muted,
                minWidth: 70,
              }}
            >
              {numerada ? `0${i + 1}` : "—"}
            </span>
            <span
              style={{
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: numerada ? 74 : 46,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: activo ? C.ink : tinta,
                background: activo ? C.ocre : "transparent",
                padding: activo ? "2px 16px" : 0,
              }}
            >
              {p}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/** Tarjeta final: el siguiente vídeo y la llamada a suscribirse. */
export const Cierre: React.FC<{ spec: { siguiente?: string; sub?: string; suscribete?: boolean } }> = ({
  spec,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: frame - 4, fps, config: { damping: 200, mass: 0.6 } });

  if (spec.suscribete) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          opacity: k,
        }}
      >
        <div style={{ fontFamily: FONT.serif, fontSize: 130, color: C.ink, letterSpacing: "-0.01em" }}>
          Capital X
        </div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 58,
            background: C.carmin,
            color: C.paper,
            padding: "18px 54px",
            transform: `scale(${interpolate(k, [0, 1], [0.9, 1])})`,
          }}
        >
          Suscríbete
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 26, letterSpacing: "0.22em", color: C.muted }}>
          CÓMO SE ROMPEN LOS PAÍSES RICOS
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", opacity: k, transform: `translateY(${interpolate(k, [0, 1], [26, 0])}px)` }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 28, letterSpacing: "0.28em", color: C.muted, marginBottom: 30 }}>
          EN EL PRÓXIMO VÍDEO
        </div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 168,
            letterSpacing: "-0.04em",
            color: C.ink,
            background: C.ocre,
            display: "inline-block",
            padding: "6px 44px",
          }}
        >
          {spec.siguiente}
        </div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 46, color: C.ink, marginTop: 40, maxWidth: 1300 }}>
          {spec.sub}
        </div>
      </div>
    </div>
  );
};
