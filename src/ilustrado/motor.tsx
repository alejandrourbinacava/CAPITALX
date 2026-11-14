import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../theme";
import { DECORADOS } from "./registro";

/**
 * Motor de escenas ilustradas.
 *
 * El piloto v4 montaba cada toma a mano en un fichero. Aqui el guion pide la
 * escena por su nombre -"wei/panaderia", toma "mostrador"- con unos pocos
 * datos (textos, cifras, gente, hora) y el motor la pinta: decorado dibujado
 * en codigo, personajes con cara y una camara que se mueve dentro del dibujo.
 *
 * Un decorado es un mundo de 1920x1080 (o mas ancho, para panear) y declara
 * sus tomas: encuadres de camara con nombre. Con quince decorados por video y
 * cuatro o cinco tomas cada uno salen planos muy distintos sin repetir.
 */

import { type Decorado, type EspecEscena, type Toma, suaveM } from "./tipos";
export * from "./tipos";

const GENERAL: Toma = { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 540, z: 1.05 } };

/** Escoge la toma: la explicita, la pedida o la primera del decorado. */
export const tomaDe = (d: Decorado, e: EspecEscena): Toma => {
  if (e.camara) return e.camara;
  const nombres = Object.keys(d.tomas);
  return (e.toma && d.tomas[e.toma]) || d.tomas[nombres[0]] || GENERAL;
};

const Aviso: React.FC<{ texto: string }> = ({ texto }) => (
  <AbsoluteFill style={{ background: "#1C2A2C", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: FONT.sans, fontSize: 40, color: "#D9D2BF" }}>{texto}</div>
  </AbsoluteFill>
);

/** Rotulo de lugar y fecha, el mismo para todos los decorados. */
const LugarFecha: React.FC<{ lugar?: string; fecha?: string; f: number }> = ({ lugar, fecha, f }) => {
  if (!lugar && !fecha) return null;
  const t = suaveM((f - 8) / 14);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 60,
        opacity: t,
        transform: `translateY(${(1 - t) * -16}px)`,
        fontFamily: FONT.sans,
        color: "#F2EFE6",
        // Sobre un decorado claro (piedra, papel, cielo) el texto suelto no se
        // leia: va sobre una placa oscura con el filo carmin del rotulo.
        background: "rgba(20,24,26,0.84)",
        borderLeft: "6px solid #C8402C",
        padding: "12px 24px 14px",
      }}
    >
      {lugar ? <div style={{ fontWeight: 700, fontSize: 44, letterSpacing: 2 }}>{lugar.toUpperCase()}</div> : null}
      {fecha ? (
        <div style={{ fontWeight: 600, fontSize: 28, letterSpacing: 6, color: "#E8B33C", marginTop: 4 }}>{fecha.toUpperCase()}</div>
      ) : null}
    </div>
  );
};

/** Una escena ilustrada completa: decorado, camara y rotulo de lugar. */
export const EscenaIlustrada: React.FC<{ spec: EspecEscena }> = ({ spec }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const d = DECORADOS[spec.decorado];
  if (!d) return <Aviso texto={`Falta el decorado ${spec.decorado}`} />;
  const toma = tomaDe(d, spec);
  const t = suaveM(f / Math.max(1, durationInFrames - 1));
  const x = toma.de.x + (toma.a.x - toma.de.x) * t;
  const y = toma.de.y + (toma.a.y - toma.de.y) * t;
  const z = toma.de.z + (toma.a.z - toma.de.z) * t;
  const Dibujo = d.dibujo;
  return (
    <AbsoluteFill style={{ background: "#1C2A2C" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(960 540) scale(${z}) translate(${-x} ${-y})`}>
          <Dibujo e={spec} f={f} dur={durationInFrames} />
        </g>
      </svg>
      <LugarFecha lugar={spec.lugar} fecha={spec.fecha} f={f} />
    </AbsoluteFill>
  );
};
