import React, { useMemo } from "react";
import { random, useCurrentFrame } from "remotion";
import { C, FONT, T } from "../theme";
import { usePlantilla, type Plantilla } from "../estilo";

/** ¿Este papel es oscuro? Decide si la textura se dibuja en claro o en oscuro. */
export const esOscuro = (hex: string) => {
  const h = hex.replace("#", "");
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
};

/**
 * La textura del fondo.
 *
 * Es lo primero que se ve y lo que mas dice de que clase de video es esto. El
 * papel milimetrado era el unico que habia y por eso los dieciseis videos
 * arrancaban igual. Ahora hay seis, y cada plantilla trae la suya.
 */
const Textura: React.FC<{ p: Plantilla; oscuro: boolean }> = ({ p, oscuro }) => {
  const fino = oscuro ? "#FFFFFF" : p.tinta;
  const opFino = oscuro ? 0.075 : 0.14;
  const opFuerte = oscuro ? 0.13 : 0.24;

  if (p.textura === "liso") return null;

  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 1920 1080"
    >
      <defs>
        {/* Papel milimetrado: dos densidades, como en un cuaderno. */}
        <pattern id="tx-rejilla-f" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0 L0 0 0 64" fill="none" stroke={fino} strokeWidth="1.6" opacity={opFino} />
        </pattern>
        <pattern id="tx-rejilla-g" width="320" height="320" patternUnits="userSpaceOnUse">
          <path d="M320 0 L0 0 0 320" fill="none" stroke={fino} strokeWidth="2.2" opacity={opFuerte} />
        </pattern>

        {/* Puntos: la rejilla sin las lineas. Respira mucho mas. */}
        <pattern id="tx-puntos" width="48" height="48" patternUnits="userSpaceOnUse">
          <circle cx="24" cy="24" r="2" fill={fino} opacity={opFuerte} />
        </pattern>

        {/* Corondeles: las lineas que separan columnas en un periodico. */}
        <pattern id="tx-rayas" width="384" height="1080" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="1080" stroke={fino} strokeWidth="1.4" opacity={opFino} />
        </pattern>

        {/* Plano de obra: rejilla fina con cruces en los cruces principales. */}
        <pattern id="tx-planos" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0 L0 0 0 80" fill="none" stroke={fino} strokeWidth="1" opacity={opFino} />
        </pattern>
        <pattern id="tx-planos-cruz" width="400" height="400" patternUnits="userSpaceOnUse">
          <path
            d="M200 188 L200 212 M188 200 L212 200"
            fill="none"
            stroke={fino}
            strokeWidth="1.8"
            opacity={opFuerte}
          />
        </pattern>

        {/* Trama de medios tonos: el punto de imprenta, a la vista. */}
        <pattern id="tx-trama" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="3.4" fill={fino} opacity={oscuro ? 0.09 : 0.12} />
          <circle cx="0" cy="0" r="3.4" fill={fino} opacity={oscuro ? 0.09 : 0.12} />
        </pattern>
      </defs>

      {p.textura === "rejilla" ? (
        <>
          <rect width="1920" height="1080" fill="url(#tx-rejilla-f)" />
          <rect width="1920" height="1080" fill="url(#tx-rejilla-g)" />
        </>
      ) : null}
      {p.textura === "puntos" ? <rect width="1920" height="1080" fill="url(#tx-puntos)" /> : null}
      {p.textura === "rayas" ? <rect width="1920" height="1080" fill="url(#tx-rayas)" /> : null}
      {p.textura === "planos" ? (
        <>
          <rect width="1920" height="1080" fill="url(#tx-planos)" />
          <rect width="1920" height="1080" fill="url(#tx-planos-cruz)" />
        </>
      ) : null}
      {p.textura === "trama" ? <rect width="1920" height="1080" fill="url(#tx-trama)" /> : null}
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

  if (opacity <= 0) return null;

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

/**
 * El mobiliario de marco.
 *
 * Cuatro opciones, y cada una encuadra el plano de una manera distinta:
 * escuadras de cuaderno, caja completa de plano tecnico, rail lateral con el
 * numero de hoja, o nada.
 */
const Marco: React.FC<{ p: Plantilla; oscuro: boolean }> = ({ p, oscuro }) => {
  const c = oscuro ? "#FFFFFF" : p.tinta;
  const op = oscuro ? 0.3 : 0.42;

  if (p.marco === "ninguno") return null;

  if (p.marco === "caja") {
    return (
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 1920 1080"
      >
        <rect
          x="72"
          y="68"
          width="1776"
          height="944"
          fill="none"
          stroke={c}
          strokeWidth="2"
          opacity={op}
        />
        <rect
          x="84"
          y="80"
          width="1752"
          height="920"
          fill="none"
          stroke={c}
          strokeWidth="1"
          opacity={op * 0.5}
        />
      </svg>
    );
  }

  if (p.marco === "rail") {
    return (
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 1920 1080"
      >
        {/* El rail del archivador: una linea vertical y las marcas de perforado. */}
        <line x1="86" y1="70" x2="86" y2="1010" stroke={c} strokeWidth="2" opacity={op} />
        {[260, 540, 820].map((y) => (
          <circle key={y} cx="86" cy={y} r="9" fill="none" stroke={c} strokeWidth="2" opacity={op * 0.8} />
        ))}
        <line x1="86" y1="1010" x2="1834" y2="1010" stroke={c} strokeWidth="1.4" opacity={op * 0.6} />
      </svg>
    );
  }

  // escuadras: las marcas de esquina de siempre
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
      {P.map((q, i) => (
        <g key={i}>
          <path
            d={`M${q[0] + q[2] * 62} ${q[1]} L${q[0]} ${q[1]} L${q[0]} ${q[1] + q[3] * 62}`}
            fill="none"
            stroke={c}
            strokeWidth="2.4"
            opacity={op * 0.62}
          />
          <circle cx={q[0]} cy={q[1]} r="4.5" fill="none" stroke={c} strokeWidth="1.4" opacity={op * 0.5} />
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
}> = ({ night, grid = true, frame = true, children }) => {
  const p = usePlantilla();
  const oscuroPapel = esOscuro(p.papel);
  // Un plano de noche sobre una plantilla ya oscura se queda con su papel: no
  // tiene sentido oscurecer lo que ya lo esta.
  const fondo = night && !oscuroPapel ? C.night : p.papel;
  const oscuro = night || oscuroPapel;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: fondo,
        overflow: "hidden",
      }}
    >
      {grid ? <Textura p={p} oscuro={oscuro} /> : null}
      {children}
      {frame ? <Marco p={p} oscuro={oscuro} /> : null}
      <Grain opacity={oscuro ? p.grano * 0.62 : p.grano} />
    </div>
  );
};

export const Kicker: React.FC<{ children: React.ReactNode; night?: boolean }> = ({
  children,
  night,
}) => {
  const p = usePlantilla();
  return (
    <div
      style={{
        position: "absolute",
        // Con rail lateral el rotulillo se aparta, o se monta encima de la linea.
        left: p.marco === "rail" ? 148 : 128,
        top: 96,
        fontFamily: FONT.mono,
        fontSize: T.kicker,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: night ? C.mutedNight : p.apagado,
      }}
    >
      {children}
    </div>
  );
};

export const Source: React.FC<{ children: React.ReactNode; night?: boolean }> = ({
  children,
  night,
}) => {
  const p = usePlantilla();
  return (
    <div
      style={{
        position: "absolute",
        right: 128,
        // Con el rotulo en barra, la franja ocupa el pie del cuadro entero y
        // la fuente quedaba escrita dentro de ella.
        bottom: p.rotulo === "barra" ? 232 : 92,
        textAlign: "right",
        fontFamily: FONT.mono,
        fontSize: T.source,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: night ? C.paleDim : p.apagado,
        opacity: 0.85,
      }}
    >
      {children}
    </div>
  );
};

/** Compatibilidad: el marco y la rejilla ya viven dentro de Surface. */
export const Grid: React.FC<{ night?: boolean }> = () => null;
export const Frame: React.FC<{ night?: boolean }> = () => null;
