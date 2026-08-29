import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";

/**
 * El recorte de revista: el mecanismo Vox aplicado a una foto cualquiera.
 *
 * Sujeto recortado del fondo, tratado en tinta, con una copia plana desplazada
 * por detras en carmin u ocre. Eso ya viene hecho en el PNG; aqui solo se
 * coloca y se le da entrada.
 *
 * Entra de golpe, con un rebote corto, y luego respira despacio. Un recorte
 * que aparece con un fundido parece un pase de diapositivas: tiene que dar la
 * sensacion de que alguien lo ha puesto encima de la mesa.
 */
export const Recorte: React.FC<{
  spec: { fichero?: string; lado?: "izq" | "der" | "centro"; escala?: number; nota?: string };
}> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  if (!spec?.fichero) return null;

  const k = spring({ frame: frame - 2, fps, config: { damping: 14, mass: 0.7, stiffness: 150 } });
  const respira = interpolate(frame, [0, durationInFrames], [1, 1.045], {
    extrapolateRight: "clamp",
  });
  const escala = (spec.escala ?? 1) * respira;

  const lado = spec.lado ?? "centro";
  const x = lado === "izq" ? "30%" : lado === "der" ? "70%" : "50%";
  // Entra desde el lado por el que se queda: asi el movimiento tiene direccion.
  const desde = lado === "der" ? 90 : lado === "izq" ? -90 : 0;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* mancha de color debajo, para que el recorte no flote sobre nada */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: "56%",
          width: 980,
          height: 980,
          marginLeft: -490,
          marginTop: -490,
          borderRadius: "50%",
          background: C.ocre,
          opacity: 0.16 * k,
          transform: `scale(${interpolate(k, [0, 1], [0.7, 1])})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: x,
          top: "54%",
          transform: `translate(-50%, -50%) translateX(${interpolate(k, [0, 1], [desde, 0])}px) translateY(${interpolate(k, [0, 1], [40, 0])}px) scale(${escala})`,
          opacity: Math.min(1, k * 1.6),
          height: "82%",
        }}
      >
        <Img src={staticFile(spec.fichero)} style={{ height: "100%", width: "auto" }} />
      </div>

      {spec.nota ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 96,
            textAlign: "center",
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 24,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.muted,
            opacity: interpolate(k, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }),
          }}
        >
          {spec.nota}
        </div>
      ) : null}
    </div>
  );
};
