import React from "react";
import { interpolate } from "remotion";
import { FONT } from "../theme";
import { useFrameFluido, usePlantilla } from "../estilo";

/**
 * Tarjeta de capitulo: el titulo que abre cada bloque de un documental.
 *
 * Es lo que separa un documental de un video con muchas imagenes: el espectador
 * sabe donde esta y cuanto queda. Sobre fondo oscuro, un filete dorado que se
 * dibuja, el numero en versalitas, el titulo en serifa y, opcionalmente, una
 * linea de lugar y fecha. Nada se mueve despues de entrar.
 */
export type EspecCapitulo = {
  /** "I", "II"... o "Capitulo 3". Se pone tal cual. */
  numero?: string;
  titulo: string;
  /** Lugar y fecha, p. ej. "Sevilla, 1545". */
  sub?: string;
};

export const Capitulo: React.FC<{ spec: EspecCapitulo }> = ({ spec }) => {
  const frame = useFrameFluido();
  const p = usePlantilla();
  if (!spec?.titulo) return null;

  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const k = (a: number, b: number) =>
    interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

  const filete = k(4, 26);
  const numero = k(10, 28);
  const titulo = k(18, 44);
  const sub = k(34, 58);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 220px",
        background: `radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.05), transparent 60%), ${p.papel}`,
      }}
    >
      {spec.numero ? (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 30,
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: p.acento,
            opacity: numero,
            transform: `translateY(${(1 - numero) * 14}px)`,
          }}
        >
          {/^[IVXLC]+$|^\d+$/.test(spec.numero) ? `Capítulo ${spec.numero}` : spec.numero}
        </div>
      ) : null}

      <div
        style={{
          height: 2,
          width: 220,
          margin: "26px 0 34px",
          background: p.acento,
          transformOrigin: "left center",
          transform: `scaleX(${filete})`,
        }}
      />

      <div
        style={{
          fontFamily: FONT.serif,
          fontWeight: 400,
          fontSize: 118,
          lineHeight: 1.04,
          letterSpacing: "-0.012em",
          color: p.tinta,
          maxWidth: 1380,
          opacity: titulo,
          transform: `translateY(${(1 - titulo) * 22}px)`,
        }}
      >
        {spec.titulo}
      </div>

      {spec.sub ? (
        <div
          style={{
            marginTop: 34,
            fontFamily: FONT.mono,
            fontSize: 28,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: p.apagado,
            opacity: sub,
          }}
        >
          {spec.sub}
        </div>
      ) : null}
    </div>
  );
};
