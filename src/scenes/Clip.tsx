import React from "react";
import { OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";

/**
 * Metraje de archivo pasado por el mismo filtro que todo lo demas.
 *
 * Un clip de stock sin tratar canta a kilometros y rompe el canal entero: de
 * repente parece otro video. Asi que se le quita el color, se le sube el
 * contraste hasta casi el grabado, y se tine con la tinta y el papel de la
 * casa. Encima va la trama de puntos y un velo de grano, que es lo que hace
 * que se lea como una fotografia impresa y no como un video pegado.
 *
 * El resultado no es "un clip bonito": es una textura que respira entre dos
 * graficos. Si se nota que es de banco de imagenes, esta mal tratado.
 */
export const Clip: React.FC<{
  spec: { fichero?: string; desde?: number; encuadre?: "amplio" | "corto" };
  tono?: "ocre" | "carmin";
}> = ({ spec, tono = "ocre" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  if (!spec?.fichero) return null;

  // Empuje lento, para que la imagen nunca se quede del todo quieta.
  const zoom = interpolate(frame, [0, durationInFrames], [1.06, 1.14], {
    extrapolateRight: "clamp",
  });
  const entrada = interpolate(frame, [0, 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const color = tono === "carmin" ? C.carmin : C.ocre;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: entrada }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})` }}>
        <OffthreadVideo
          src={staticFile(spec.fichero)}
          startFrom={Math.round((spec.desde ?? 0) * fps)}
          muted
          // El clip casi nunca dura lo que el plano: se congela el ultimo
          // fotograma antes que dejar negro.
          endAt={undefined}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(1) contrast(1.5) brightness(1.06)",
          }}
        />
      </div>

      {/* la tinta de la casa, por encima del gris */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.ink,
          mixBlendMode: "color",
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: color,
          mixBlendMode: "overlay",
          opacity: 0.3,
        }}
      />

      {/* trama de impresion */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, rgba(20,24,26,0.22) 0 1px, transparent 1px 3px)`,
          mixBlendMode: "multiply",
        }}
      />

      {/* viñeta: centra la mirada y disimula los bordes del recorte */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 42%, rgba(20,24,26,0.5) 100%)`,
        }}
      />
    </div>
  );
};
