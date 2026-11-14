import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import { EscenaIlustrada } from "./motor";
import { DECORADOS } from "./registro";
import type { EspecEscena } from "./tipos";

/**
 * Pruebas del motor ilustrado.
 *
 *   npx remotion still escena-prueba out/x.png --frame=90 --props="{\"spec\":{\"decorado\":\"wei/panaderia\",\"toma\":\"mostrador\"}}"
 *   npx remotion still escena-hoja out/hoja.png --frame=90 --props="{\"codigo\":\"wei\"}"
 *
 * La hoja pinta TODAS las tomas de todos los decorados de un codigo, cada una
 * en su encuadre de llegada, con su nombre debajo.
 */

export const PruebaEscena: React.FC<{ spec: EspecEscena }> = ({ spec }) => <EscenaIlustrada spec={spec} />;

export const HojaEscenas: React.FC<{ codigo: string; solo?: string; dur?: number }> = ({ codigo, solo, dur = 300 }) => {
  const f = useCurrentFrame();
  const casillas: { clave: string; toma: string }[] = [];
  for (const [clave, d] of Object.entries(DECORADOS)) {
    if (!clave.startsWith(codigo + "/")) continue;
    if (solo && clave !== solo) continue;
    for (const toma of Object.keys(d.tomas)) casillas.push({ clave, toma });
  }
  const cols = casillas.length <= 4 ? 2 : casillas.length <= 9 ? 3 : casillas.length <= 16 ? 4 : casillas.length <= 30 ? 5 : 6;
  const filas = Math.max(1, Math.ceil(casillas.length / cols));
  const w = 1920 / cols;
  const h = w * (1080 / 1920);
  const alto = Math.max(1080, filas * (h + 30));
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${Math.min(1, 1080 / alto)})`, transformOrigin: "0 0" }}>
        {casillas.map((c, i) => {
          const d = DECORADOS[c.clave];
          const t = d.tomas[c.toma];
          const z = t.a.z;
          const Dibujo = d.dibujo;
          return (
            <div key={i} style={{ position: "absolute", left: (i % cols) * w, top: Math.floor(i / cols) * (h + 30), width: w, height: h + 30 }}>
              <svg viewBox="0 0 1920 1080" width={w - 6} height={h - 4} style={{ background: "#1C2A2C" }}>
                <g transform={`translate(960 540) scale(${z}) translate(${-t.a.x} ${-t.a.y})`}>
                  <Dibujo e={{ decorado: c.clave, toma: c.toma }} f={f} dur={dur} />
                </g>
              </svg>
              <div style={{ fontFamily: FONT.mono, fontSize: 20, color: "#ddd", paddingLeft: 4 }}>
                {c.clave} · {c.toma}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
