import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, T } from "../theme";

/**
 * Rotulo inferior izquierdo. Es la constante visual del canal: misma posicion
 * en todos los planos, con la palabra clave resaltada en ocre. Sustituye al
 * subtitulo, que se quito porque competia con la imagen.
 */
export const Rotulo: React.FC<{
  kicker?: string;
  /** El texto puede llevar *asteriscos* alrededor de lo que va resaltado. */
  text: string;
  night?: boolean;
  delay?: number;
}> = ({ kicker, text, night, delay = 6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.6 },
  });
  const y = interpolate(enter, [0, 1], [26, 0]);
  const slab = spring({
    frame: frame - delay - 5,
    fps,
    config: { damping: 200, mass: 0.5 },
  });

  const parts = text.split("*");

  return (
    <div
      style={{
        position: "absolute",
        left: 128,
        bottom: 88,
        maxWidth: 1080,
        zIndex: 40,
        opacity: enter,
        transform: `translateY(${y}px)`,
      }}
    >
      {kicker ? (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: T.rotuloKicker,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: night ? C.mutedNight : C.muted,
            marginBottom: 16,
          }}
        >
          {kicker}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: T.rotulo,
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          color: night ? C.paper : C.ink,
        }}
      >
        {parts.map((p, i) => {
          const resaltado = i % 2 === 1;
          if (!resaltado) return <span key={i}>{p}</span>;
          // Palabra a palabra: un solo rectangulo para toda la frase se
          // quedaba en la primera linea cuando el texto partia.
          const palabras = p.split(" ");
          return (
            <React.Fragment key={i}>
              {palabras.map((w, j) => (
                <React.Fragment key={j}>
                  <span style={{ position: "relative", display: "inline-block" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "-0.17em",
                        right: "-0.17em",
                        top: "0.1em",
                        bottom: "0.07em",
                        background: C.ocre,
                        transform: `scaleX(${slab})`,
                        transformOrigin: "left center",
                      }}
                    />
                    <span style={{ position: "relative", color: C.ink }}>{w}</span>
                  </span>
                  {j < palabras.length - 1 ? " " : ""}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/** Cifra grande con resalte ocre y conteo ascendente opcional. */
export const BigNumber: React.FC<{
  value: number;
  suffix?: string;
  countFrom?: number;
  countFrames?: number;
  left?: number;
  top?: number;
  size?: number;
  format?: (n: number) => string;
}> = ({
  value,
  suffix,
  countFrom,
  countFrames = 40,
  left = 128,
  top = 300,
  size = T.mega,
  format,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slab = spring({ frame: frame - 4, fps, config: { damping: 200, mass: 0.5 } });

  const shown =
    countFrom === undefined
      ? value
      : Math.round(
          interpolate(
            frame,
            [6, 6 + countFrames],
            [countFrom, value],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) }
          )
        );

  const label = format ? format(shown) : shown.toLocaleString("es-ES");

  return (
    <div style={{ position: "absolute", left, top }}>
      {/* El hueco lo fija el valor final: asi el resalte ocre no cambia de
          ancho mientras la cifra sube. */}
      <span style={{ position: "relative", display: "inline-block" }}>
        <span
          aria-hidden
          style={{
            visibility: "hidden",
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 0.88,
            letterSpacing: "-0.05em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {format ? format(value) : value.toLocaleString("es-ES")}
          {suffix ? <span style={{ fontSize: "0.42em" }}>{suffix}</span> : null}
        </span>
        <span
          style={{
            position: "absolute",
            left: "-0.06em",
            right: "-0.06em",
            top: "0.16em",
            bottom: "0.12em",
            background: C.ocre,
            transform: `scaleX(${slab})`,
            transformOrigin: "left center",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 0.88,
            letterSpacing: "-0.05em",
            color: C.ink,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {label}
          {suffix ? <span style={{ fontSize: "0.42em" }}>{suffix}</span> : null}
        </span>
      </span>
    </div>
  );
};

/**
 * Tarjeta de frase.
 *
 * Nada aqui es estatico: el bloque entero empuja hacia la camara durante todo
 * el plano, cada palabra sube escalonada, y el resalte ocre se despliega de
 * izquierda a derecha por debajo del texto en vez de aparecer de golpe.
 */
export const Statement: React.FC<{ text: string; night?: boolean }> = ({ text, night = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // empuje continuo: el texto nunca se queda quieto
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.055], {
    extrapolateRight: "clamp",
  });

  const parts = text.split("*");
  let wordIndex = 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 200px",
        transform: `scale(${zoom})`,
      }}
    >
      <div
        style={{
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: T.headline,
          lineHeight: 1.1,
          letterSpacing: "-0.035em",
          textAlign: "center",
          color: night ? C.paper : C.ink,
        }}
      >
        {parts.map((p, i) => {
          const resaltado = i % 2 === 1;
          const palabras = p.split(" ");

          return (
            <React.Fragment key={i}>
              {palabras.map((w, j) => {
                if (w === "") return null;
                const idx = wordIndex++;
                const k = spring({
                  frame: frame - 3 - idx * 2.6,
                  fps,
                  config: { damping: 200, mass: 0.55 },
                });
                // el resalte va por palabra, no por frase: asi nunca se corta
                // al partir la linea, que es lo que pasaba antes
                const kSlab = spring({
                  frame: frame - 1 - idx * 2.6,
                  fps,
                  config: { damping: 20, mass: 0.6, stiffness: 130 },
                });
                return (
                  <React.Fragment key={j}>
                    <span
                      style={{
                        position: "relative",
                        display: "inline-block",
                        opacity: k,
                        transform: `translateY(${interpolate(k, [0, 1], [30, 0])}px)`,
                      }}
                    >
                      {resaltado ? (
                        <span
                          style={{
                            position: "absolute",
                            left: "-0.17em",
                            right: "-0.17em",
                            top: "0.14em",
                            bottom: "0.1em",
                            background: C.ocre,
                            transform: `scaleX(${kSlab})`,
                            transformOrigin: "left center",
                          }}
                        />
                      ) : null}
                      <span style={{ position: "relative", color: resaltado ? C.ink : undefined }}>
                        {w}
                      </span>
                    </span>
                    {j < palabras.length - 1 ? " " : ""}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};


