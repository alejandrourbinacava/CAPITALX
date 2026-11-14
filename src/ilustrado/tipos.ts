import React from "react";

/** Encuadre de camara: centro (x, y) en coordenadas del mundo y zoom. */
export type Enc = { x: number; y: number; z: number };
export type Toma = { de: Enc; a: Enc; desc?: string };

export type EspecEscena = {
  /** "<codigo>/<nombre>", p. ej. "wei/panaderia". */
  decorado: string;
  /** Nombre de una de las tomas del decorado. Por defecto la primera. */
  toma?: string;
  /** Encuadre explicito; manda sobre `toma`. */
  camara?: { de: Enc; a: Enc };
  /** Rotulo de lugar y fecha arriba a la izquierda. */
  lugar?: string;
  fecha?: string;
  /** Textos dentro del dibujo: el cartel, la pizarra, el titular. Cada decorado dice cuales lee. */
  textos?: Record<string, string>;
  /** Cifras que el decorado anima (de, a, ...). Cada decorado dice cuales lee. */
  valores?: number[];
  /** Cuanta gente: 0 vacio, 1 lleno. */
  gente?: number;
  hora?: "dia" | "tarde" | "noche";
  /** Cambia los rasgos de la gente y el desorden del decorado. */
  semilla?: number;
  /** Variante del decorado cuando tiene varias (p. ej. "cerrada"). */
  variante?: string;
};

export type PropsDecorado = { e: EspecEscena; f: number; dur: number };

export type Decorado = {
  /** Lo que se ve, para el guionista. */
  desc: string;
  /** Ancho del mundo (por defecto 1920). El alto es siempre 1080. */
  ancho?: number;
  /** Encuadres con nombre. La primera es la toma por defecto. */
  tomas: Record<string, Toma>;
  /** Que `textos`, `valores` y `variante` entiende, para el guionista. */
  admite?: string;
  /** El dibujo. Recibe el fotograma relativo a la escena y su duracion. */
  dibujo: React.FC<PropsDecorado>;
};

export const suaveM = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

