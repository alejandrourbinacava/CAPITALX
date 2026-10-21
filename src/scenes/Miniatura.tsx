import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT } from "../theme";

/**
 * La miniatura de YouTube.
 *
 * El fondo lo dibuja un modelo de imagen (scripts/miniatura.mjs) sin una sola
 * letra: los modelos de imagen estropean los acentos y las enes, y una
 * miniatura con una errata no se corrige despues de publicada sin perder el
 * historial de clics. El texto se pone aqui, con la tipografia del canal.
 *
 * Los colores son los del documental, no una paleta nueva: papel calido para
 * el texto, el amarillo de la plata para la palabra que pega.
 */

export const MINIATURA = { width: 1280, height: 720 };

const PAPEL = "#F2EFE6";
const PLATA = "#F2C14E";
const SOMBRA = "rgba(8, 6, 4, 0.92)";

export type MiniaturaProps = {
  /** Ruta dentro de public/, p. ej. "miniaturas/revolucion-francesa.png". Vacio = fondo liso. */
  fondo: string;
  /** El titular, en mayusculas, con \n para partir lineas. Dos a cuatro palabras. */
  texto: string;
  /** La palabra (o palabras) del titular que va en amarillo. */
  resalte?: string;
};

function tamano(lineas: string[]): number {
  const largo = Math.max(...lineas.map((l) => l.length), 1);
  // 700 px de ancho util; Archivo en negrita ocupa ~0.6 de su altura por letra
  const porAncho = 700 / (largo * 0.6);
  const porAlto = 560 / (lineas.length * 1.02);
  return Math.floor(Math.min(230, porAncho, porAlto));
}

export const Miniatura: React.FC<MiniaturaProps> = ({ fondo, texto, resalte }) => {
  const lineas = texto.toUpperCase().split("\n");
  const fs = tamano(lineas);
  const marca = (resalte ?? "").toUpperCase().trim();

  const pintar = (linea: string) => {
    if (!marca || !linea.includes(marca)) return linea;
    const i = linea.indexOf(marca);
    return (
      <>
        {linea.slice(0, i)}
        <span style={{ color: PLATA }}>{marca}</span>
        {linea.slice(i + marca.length)}
      </>
    );
  };

  return (
    <AbsoluteFill style={{ background: "#0E0B08", overflow: "hidden" }}>
      {fondo ? (
        <Img
          src={staticFile(fondo)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}

      {/* Oscurece el lado del texto para que se lea aunque el fondo sea claro */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(8,6,4,0.94) 0%, rgba(8,6,4,0.80) 34%, rgba(8,6,4,0.18) 66%, rgba(8,6,4,0) 100%)",
        }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(0deg, rgba(8,6,4,0.55) 0%, rgba(8,6,4,0) 32%)" }}
      />

      <div
        style={{
          position: "absolute",
          left: 56,
          top: 44,
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 8,
          color: PLATA,
          textShadow: `0 2px 12px ${SOMBRA}`,
        }}
      >
        CAPITAL X
      </div>

      <div
        style={{
          position: "absolute",
          left: 56,
          top: 0,
          bottom: 0,
          width: 760,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 120, height: 8, background: PLATA, marginBottom: 26 }} />
        {lineas.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: fs,
              lineHeight: 0.98,
              letterSpacing: -2,
              color: PAPEL,
              textShadow: `0 4px 0 ${SOMBRA}, 0 8px 28px ${SOMBRA}`,
              whiteSpace: "nowrap",
            }}
          >
            {pintar(l)}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
