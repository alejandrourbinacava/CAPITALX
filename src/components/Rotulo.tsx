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
        {parts.map((p, i) =>
          i % 2 === 1 ? (
            <span key={i} style={{ position: "relative", whiteSpace: "nowrap" }}>
              <span
                style={{
                  position: "absolute",
                  left: "-0.09em",
                  right: "-0.09em",
                  top: "0.1em",
                  bottom: "0.07em",
                  background: C.ocre,
                  transform: `scaleX(${slab})`,
                  transformOrigin: "left center",
                }}
              />
              <span style={{ position: "relative", color: C.ink }}>{p}</span>
            </span>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
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

/** Tarjeta de frase: el corte a negro que remata una idea. */
export const Statement: React.FC<{ text: string; night?: boolean }> = ({ text, night = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 3, fps, config: { damping: 200, mass: 0.7 } });
  const parts = text.split("*");
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 200px",
      }}
    >
      <div
        style={{
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: T.headline,
          lineHeight: 1.06,
          letterSpacing: "-0.035em",
          textAlign: "center",
          color: night ? C.paper : C.ink,
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [22, 0])}px)`,
        }}
      >
        {parts.map((p, i) =>
          i % 2 === 1 ? (
            <span key={i} style={{ background: C.ocre, color: C.ink, padding: "0 0.09em" }}>
              {p}
            </span>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </div>
    </div>
  );
};
