import React from "react";
import { interpolate } from "remotion";
import { PAPEL } from "../theme";
import { usePlantilla, useFrame, useTemblor } from "../estilo";

/**
 * El corte entre una escena y la siguiente.
 *
 * Hasta ahora todos los cortes del canal eran el mismo: corte seco, con su
 * whoosh encima. Funciona -es lo que hace el montaje de documental- pero
 * cuando es lo unico que hay durante once minutos, el video entero suena a
 * metronomo. Aqui hay cinco maneras de entrar en una escena, y la plantilla
 * elige una y la repite: eso es tener un estilo de montaje, en vez de tener
 * un solo recurso.
 *
 * Todas duran menos de un cuarto de segundo. Una transicion que se nota es una
 * transicion mal puesta; lo que tiene que notarse es el ritmo.
 */
export const Transicion: React.FC<{
  /** Indice de la escena dentro del plano, para variar el temblor. */
  orden?: number;
  children: React.ReactNode;
}> = ({ orden = 0, children }) => {
  const frame = useFrame();
  const p = usePlantilla();
  const t = useTemblor(orden);

  // El temblor de archivo se aplica al plano entero, no a la transicion: es un
  // caracter permanente de la plantilla, no un efecto de entrada.
  const base: React.CSSProperties = p.temblor
    ? {
        transform: `translate(${t.x}px, ${t.y}px) rotate(${t.giro}deg) scale(1.012)`,
        filter: `brightness(${t.brillo})`,
      }
    : {};

  if (p.transicion === "corte") {
    return <div style={{ position: "absolute", inset: 0, ...base }}>{children}</div>;
  }

  if (p.transicion === "desliza") {
    const k = interpolate(frame, [0, 5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (x) => 1 - Math.pow(1 - x, 3),
    });
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...base,
          transform: `${base.transform ?? ""} translateX(${(1 - k) * 74}px)`,
          opacity: k,
        }}
      >
        {children}
      </div>
    );
  }

  if (p.transicion === "barrido") {
    const k = interpolate(frame, [0, 6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (x) => 1 - Math.pow(1 - x, 2),
    });
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...base,
          clipPath: `inset(0 ${(1 - k) * 100}% 0 0)`,
        }}
      >
        {children}
      </div>
    );
  }

  if (p.transicion === "flash") {
    // El destello es corto y duro: dos fotogramas de papel a plena opacidad y
    // se va. Es el corte del montaje brutalista.
    const velo = interpolate(frame, [0, 1, 4], [0.85, 0.5, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <div style={{ position: "absolute", inset: 0, ...base }}>
        {children}
        {velo > 0.01 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: PAPEL,
              opacity: velo,
              zIndex: 60,
              pointerEvents: "none",
            }}
          />
        ) : null}
      </div>
    );
  }

  // negro: entra desde oscuro
  const k = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", inset: 0, ...base }}>
      {children}
      {k < 0.99 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            opacity: 1 - k,
            zIndex: 60,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
};
