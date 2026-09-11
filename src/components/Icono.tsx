import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";

/**
 * Iconos de trazo que se dibujan solos.
 *
 * El recorte era foto mas texto y nada mas: profesional a medias, porque el
 * texto entraba con un desvanecido y ya. Un icono que se traza delante del
 * titular da el golpe de entrada que faltaba, y como es un solo path se puede
 * animar con stroke-dashoffset sin librerias.
 *
 * Trazo, nunca relleno: relleno compite con el recorte de la foto, que ya es
 * la mancha fuerte del cuadro.
 */
export type NombreIcono =
  | "baja"
  | "sube"
  | "casa"
  | "moneda"
  | "reloj"
  | "persona"
  | "fabrica"
  | "barco"
  | "documento"
  | "aviso"
  | "candado"
  | "balanza";

/** Cada icono en un lienzo de 100x100, con el largo aproximado de su trazo. */
const ICONOS: Record<NombreIcono, { d: string; largo: number }> = {
  baja: { d: "M20 30 L45 58 L60 44 L82 70 M82 70 L82 50 M82 70 L62 70", largo: 190 },
  sube: { d: "M20 74 L45 46 L60 60 L82 32 M82 32 L82 52 M82 32 L62 32", largo: 190 },
  casa: { d: "M18 50 L50 22 L82 50 M28 46 L28 80 L72 80 L72 46 M42 80 L42 58 L58 58 L58 80", largo: 250 },
  moneda: { d: "M50 16 A34 34 0 1 1 49.9 16 M50 30 L50 70 M38 40 A12 9 0 0 1 62 40 M38 60 A12 9 0 0 0 62 60", largo: 300 },
  reloj: { d: "M50 14 A36 36 0 1 1 49.9 14 M50 30 L50 52 L68 62", largo: 270 },
  persona: { d: "M50 16 A15 15 0 1 1 49.9 16 M20 86 C20 62 34 52 50 52 C66 52 80 62 80 86", largo: 230 },
  fabrica: { d: "M16 84 L16 44 L38 58 L38 44 L60 58 L60 30 L84 30 L84 84 Z M30 84 L30 70 M48 84 L48 70 M70 84 L70 70", largo: 320 },
  barco: { d: "M14 74 C30 84 70 84 86 74 M24 74 L24 46 L76 46 L68 74 M50 46 L50 18 M50 30 L74 42", largo: 260 },
  documento: { d: "M28 12 L62 12 L76 28 L76 88 L28 88 Z M62 12 L62 28 L76 28 M40 46 L64 46 M40 60 L64 60 M40 74 L54 74", largo: 330 },
  aviso: { d: "M50 14 L88 84 L12 84 Z M50 40 L50 62 M50 72 L50 74", largo: 240 },
  candado: { d: "M24 46 L76 46 L76 88 L24 88 Z M36 46 L36 32 A14 14 0 0 1 64 32 L64 46 M50 62 L50 74", largo: 270 },
  balanza: { d: "M50 16 L50 84 M24 84 L76 84 M18 34 L82 34 M18 34 L6 60 A14 10 0 0 0 30 60 Z M82 34 L70 60 A14 10 0 0 0 94 60 Z", largo: 340 },
};

export const Icono: React.FC<{
  nombre: NombreIcono;
  tamano?: number;
  tono?: "carmin" | "ink" | "ocre" | "verde";
  /** Fotograma en el que empieza a trazarse. */
  desde?: number;
  /** Cuántos fotogramas tarda en completarse. */
  dura?: number;
}> = ({ nombre, tamano = 92, tono = "carmin", desde = 4, dura = 18 }) => {
  const frame = useCurrentFrame();
  const icono = ICONOS[nombre];
  if (!icono) return null;

  const t = interpolate(frame, [desde, desde + dura], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  // Un pelin de rebote al asentarse: el trazo termina y el icono respira.
  const escala = interpolate(frame, [desde + dura, desde + dura + 7], [1.06, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const color = tono === "ink" ? C.ink : tono === "ocre" ? C.ocre : tono === "verde" ? C.verde : C.carmin;

  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 100 100"
      style={{ display: "block", transform: `scale(${escala})`, transformOrigin: "0% 50%" }}
    >
      <path
        d={icono.d}
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={icono.largo}
        strokeDashoffset={icono.largo * (1 - t)}
      />
    </svg>
  );
};

/**
 * Titular que entra palabra a palabra desde debajo de una línea de corte.
 *
 * Antes el bloque entero subía veintiséis píxeles con un desvanecido: se leía
 * como "texto que aparece", no como titular montado. Con la máscara cada
 * palabra sale de detrás del borde, que es el recurso de toda la televisión
 * desde hace treinta años y el que hace que se vea hecho a propósito.
 */
export const PorPalabras: React.FC<{
  texto: string;
  desde?: number;
  /** Retardo entre palabra y palabra, en fotogramas. */
  paso?: number;
  style?: React.CSSProperties;
}> = ({ texto, desde = 8, paso = 2.2, style }) => {
  const frame = useCurrentFrame();
  const palabras = texto.split(" ");

  return (
    <div style={{ ...style }}>
      {palabras.map((palabra, i) => {
        const t = interpolate(frame, [desde + i * paso, desde + i * paso + 11], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: (x) => 1 - Math.pow(1 - x, 4),
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "bottom",
              // El alto de línea recorta: la palabra vive dentro de su caja.
              clipPath: "inset(-0.18em 0 -0.02em 0)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - t) * 105}%)`,
              }}
            >
              {palabra}
            </span>
            {i < palabras.length - 1 ? <span>&nbsp;</span> : null}
          </span>
        );
      })}
    </div>
  );
};
