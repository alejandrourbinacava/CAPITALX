import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { ACENTO } from "../theme";
import { usePlantilla, useFrame, useFrameFluido } from "../estilo";

/**
 * Como entra una cosa en pantalla.
 *
 * Todo el canal entraba igual: subir veintiseis pixeles con un desvanecido,
 * escalonado por un muelle. Da igual que el papel sea milimetrado o manila y
 * que la letra sea Archivo o mecanografiada: si las cuarenta cosas que
 * aparecen en un video aparecen todas de la misma forma, el montaje es el
 * mismo montaje. Por eso siete plantillas seguian pareciendo una.
 *
 * Aqui hay seis mecanicas y no se parecen entre ellas. Tres no llevan
 * desvanecido, dos no llevan desplazamiento y una no lleva animacion
 * ninguna, que es la mas dificil de aceptar y la que mas cambia el
 * caracter: en el montaje de periodico las cosas no entran, estan.
 */

/** La direccion de la que viene algo, cuando la mecanica la usa. */
export type Dir = "izq" | "der" | "arriba" | "abajo";

const DESDE_DIR: Record<Dir, [number, number]> = {
  izq: [-1, 0],
  der: [1, 0],
  arriba: [0, -1],
  abajo: [0, 1],
};

const INSET: Record<Dir, (k: number) => string> = {
  izq: (k) => `inset(0 0 0 ${(1 - k) * 100}%)`,
  der: (k) => `inset(0 ${(1 - k) * 100}% 0 0)`,
  arriba: (k) => `inset(${(1 - k) * 100}% 0 0 0)`,
  abajo: (k) => `inset(0 0 ${(1 - k) * 100}% 0)`,
};

/** Cuanto se separa una pieza de la siguiente, segun la mecanica. */
const ESCALON: Record<string, number> = {
  sube: 7,
  mascara: 5,
  golpe: 4,
  maquina: 3,
  escala: 5,
  desmonta: 6,
};

export const useEntrada = (
  i = 0,
  desde = 0,
  dir: Dir = "abajo"
): React.CSSProperties => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const p = usePlantilla();
  const t0 = desde + i * (ESCALON[p.entrada] ?? 6);
  const f = frame - t0;

  if (p.entrada === "mascara") {
    // Un borde que barre y descubre. Sin opacidad: lo que se ve, se ve
    // entero, y lo que no, todavia no existe. Es el recurso mas limpio que
    // hay y por eso es el del montaje suizo.
    const k = interpolate(f, [0, 9], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (x) => 1 - Math.pow(1 - x, 3),
    });
    const [dx, dy] = DESDE_DIR[dir];
    return {
      clipPath: INSET[dir](k),
      transform: `translate(${dx * (1 - k) * 14}px, ${dy * (1 - k) * 14}px)`,
    };
  }

  if (p.entrada === "golpe") {
    // Ni entra ni deja de entrar: aparece. El unico gesto es un golpe de
    // escala de tres fotogramas, que es lo que evita que parezca un fallo.
    if (f < 0) return { opacity: 0 };
    const k = interpolate(f, [0, 3], [1.035, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { transform: `scale(${k})` };
  }

  if (p.entrada === "maquina") {
    // Para un bloque, la maquina de escribir se comporta como el golpe: lo
    // que se escribe es el texto, y de eso se encarga TextoEntra.
    if (f < 0) return { opacity: 0 };
    return {};
  }

  if (p.entrada === "escala") {
    const k = spring({ frame: f, fps, config: { damping: 11, mass: 0.62, stiffness: 140 } });
    return {
      opacity: interpolate(f, [0, 4], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      transform: `scale(${interpolate(k, [0, 1], [0.68, 1])})`,
    };
  }

  if (p.entrada === "desmonta") {
    // Cada pieza llega de un borde distinto. La pantalla se monta delante de
    // ti, como quien va dejando papeles encima de una mesa.
    const lados: Dir[] = ["izq", "arriba", "der", "abajo"];
    const [dx, dy] = DESDE_DIR[lados[i % 4]];
    const k = spring({ frame: f, fps, config: { damping: 200, mass: 0.8 } });
    return {
      opacity: interpolate(f, [0, 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      transform: `translate(${dx * (1 - k) * 150}px, ${dy * (1 - k) * 150}px)`,
    };
  }

  // sube: la de siempre
  const k = spring({ frame: f, fps, config: { damping: 200, mass: 0.6 } });
  return { opacity: k, transform: `translateY(${interpolate(k, [0, 1], [26, 0])}px)` };
};

export const Entrada: React.FC<{
  i?: number;
  desde?: number;
  dir?: Dir;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ i = 0, desde = 0, dir = "abajo", style, children }) => {
  const e = useEntrada(i, desde, dir);
  return <div style={{ ...style, ...e }}>{children}</div>;
};

/**
 * Texto que llega segun la mecanica de la plantilla.
 *
 * Palabra a palabra desde detras de un borde -lo que ya hacia el canal-,
 * caracter a caracter con cursor, o de golpe. No es el mismo titular con otra
 * fuente: es otro gesto.
 */
export const TextoEntra: React.FC<{
  texto: string;
  desde?: number;
  style?: React.CSSProperties;
}> = ({ texto, desde = 8, style }) => {
  const frame = useFrame();
  const p = usePlantilla();

  // ---- maquina: caracter a caracter, con cursor ----
  if (p.entrada === "maquina") {
    const porFotograma = 1.6;
    const n = Math.max(0, Math.floor((frame - desde) * porFotograma));
    const visible = texto.slice(0, n);
    const acabado = n >= texto.length;
    // El cursor parpadea a medio segundo, y desaparece cuando termina.
    const parpadeo = Math.floor(frame / 8) % 2 === 0;
    return (
      <div style={style}>
        <span style={{ whiteSpace: "pre-wrap" }}>{visible}</span>
        {!acabado || parpadeo ? (
          <span
            style={{
              display: "inline-block",
              width: "0.52em",
              height: "0.82em",
              background: ACENTO,
              verticalAlign: "-0.08em",
              marginLeft: "0.06em",
              opacity: acabado ? 0.55 : 1,
            }}
          />
        ) : null}
      </div>
    );
  }

  // ---- golpe: el titular esta o no esta ----
  if (p.entrada === "golpe") {
    return <div style={{ ...style, opacity: frame >= desde ? 1 : 0 }}>{texto}</div>;
  }

  // ---- escala: la frase entera crece de golpe, no palabra a palabra ----
  if (p.entrada === "escala") {
    const k = interpolate(frame, [desde, desde + 7], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (x) => 1 - Math.pow(1 - x, 4),
    });
    return (
      <div
        style={{
          ...style,
          opacity: k,
          transform: `scale(${interpolate(k, [0, 1], [0.86, 1])})`,
          transformOrigin: "left center",
        }}
      >
        {texto}
      </div>
    );
  }

  // ---- mascara y desmonta y sube: palabra a palabra ----
  const palabras = texto.split(" ");
  const enMascara = p.entrada === "mascara";

  return (
    <div style={style}>
      {palabras.map((palabra, i) => {
        const t = interpolate(frame, [desde + i * 2.2, desde + i * 2.2 + 11], [0, 1], {
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
              // El alto de linea recorta: la palabra vive dentro de su caja.
              clipPath: enMascara
                ? `inset(0 ${(1 - t) * 100}% 0 0)`
                : "inset(-0.18em 0 -0.02em 0)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: enMascara ? "none" : `translateY(${(1 - t) * 105}%)`,
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

/**
 * Lo que pasa durante la escena, cuando ya ha entrado todo.
 *
 * Devuelve un desplazamiento para la figura y otro para el texto. Iguales, es
 * una imagen quieta; distintos, hay profundidad; y el reencuadre los mueve de
 * golpe a mitad de escena en vez de poco a poco, que es un gesto de montaje y
 * no un efecto.
 */
export const useSostener = (): { figura: string; texto: string } => {
  // Mueve figuras y bloques ya colocados: va fluido por el mismo motivo que
  // la camara. El escalonado es para lo que entra, no para lo que se mueve.
  const frame = useFrameFluido();
  const { durationInFrames } = useVideoConfig();
  const p = usePlantilla();
  const t = frame / Math.max(durationInFrames - 1, 1);

  if (p.sostener === "parallax") {
    return {
      figura: `translateX(${interpolate(t, [0, 1], [18, -18])}px)`,
      texto: `translateX(${interpolate(t, [0, 1], [-7, 7])}px)`,
    };
  }

  if (p.sostener === "reencuadre") {
    // Un solo salto, a mitad de escena. Antes y despues no se mueve nada.
    const k = interpolate(frame, [durationInFrames * 0.46, durationInFrames * 0.46 + 7], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (x) => 1 - Math.pow(1 - x, 3),
    });
    return {
      figura: `translateX(${k * 44}px) scale(${1 + k * 0.045})`,
      texto: `translateX(${k * -30}px)`,
    };
  }

  return { figura: "none", texto: "none" };
};
