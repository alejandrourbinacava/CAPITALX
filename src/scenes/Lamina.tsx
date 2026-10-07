import React from "react";
import { Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { FONT, PAPEL, TINTA } from "../theme";
import { useFrameFluido } from "../estilo";

/**
 * Una lámina de archivo: un cuadro, un grabado o un mapa antiguo de dominio
 * público, con un empuje lento encima.
 *
 * Es el material de los vídeos de historia, donde no hay metraje de stock que
 * valga: nadie filmó el puerto de Londres en 1780. No se pasa a blanco y negro
 * como el clip, porque aquí el color ES la imagen; se le baja la saturación y
 * se le añade un velo de papel para que se lea como una página de libro y no
 * como una foto pegada.
 *
 * Un panorámico llena el cuadro. Un retrato o un óleo casi cuadrado, si se
 * recortara a 16:9, perdería justo la cara: se pone entero sobre su propio
 * fondo desenfocado.
 */
export type EspecLamina = {
  fichero?: string;
  /** Pie de la lámina: qué es y de cuándo, en castellano. Opcional. */
  pie?: string;
  /** Medidas de la imagen elegida, para decidir cómo encuadrarla. */
  elegido?: { ancho?: number; alto?: number };
  /** Hacia dónde deriva la cámara por dentro de la lámina. */
  deriva?: "izq" | "der" | "arriba" | "abajo" | "centro";
};

export const Lamina: React.FC<{ spec: EspecLamina }> = ({ spec }) => {
  const frame = useFrameFluido();
  const { durationInFrames } = useVideoConfig();
  if (!spec?.fichero) return null;

  const razon = spec.elegido?.ancho && spec.elegido?.alto ? spec.elegido.ancho / spec.elegido.alto : 1.6;
  const llena = razon >= 1.5;
  const p = Math.min(1, frame / Math.max(durationInFrames - 1, 1));
  const entrada = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const deriva = spec.deriva ?? "der";
  const dx = deriva === "izq" ? -1 : deriva === "der" ? 1 : 0;
  const dy = deriva === "arriba" ? -1 : deriva === "abajo" ? 1 : 0;
  const zoom = interpolate(p, [0, 1], [1.07, 1.17]);
  const mueve = `translate(${dx * interpolate(p, [0, 1], [-18, 18])}px, ${
    dy * interpolate(p, [0, 1], [-14, 14])
  }px) scale(${zoom})`;

  const src = staticFile(spec.fichero);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: entrada, background: PAPEL }}>
      {!llena ? (
        <>
          {/* el fondo: la misma imagen, ampliada, desenfocada y apagada */}
          <Img
            src={src}
            style={{
              position: "absolute",
              inset: -60,
              width: "calc(100% + 120px)",
              height: "calc(100% + 120px)",
              objectFit: "cover",
              filter: "blur(38px) saturate(0.7) brightness(0.62)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: TINTA, opacity: 0.18 }} />
        </>
      ) : null}

      <div style={{ position: "absolute", inset: 0, transform: mueve, transformOrigin: "50% 50%" }}>
        <Img
          src={src}
          style={{
            position: "absolute",
            top: llena ? 0 : "6%",
            left: llena ? 0 : "50%",
            width: llena ? "100%" : "auto",
            height: llena ? "100%" : "88%",
            transform: llena ? undefined : "translateX(-50%)",
            objectFit: llena ? "cover" : "contain",
            filter: "saturate(0.82) contrast(1.05) sepia(0.14)",
            boxShadow: llena ? undefined : "0 18px 60px rgba(10,14,16,0.55)",
          }}
        />
      </div>

      {/* velo de papel: baja el brillo del óleo hasta el tono de la casa */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: PAPEL,
          mixBlendMode: "multiply",
          opacity: 0.2,
        }}
      />
      {/* viñeta */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(14,18,20,0.46) 100%)",
        }}
      />

      {spec.pie ? (
        <div
          style={{
            position: "absolute",
            left: 128,
            bottom: 92,
            maxWidth: 1100,
            fontFamily: FONT.mono,
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#f2ede1",
            textShadow: "0 1px 6px rgba(0,0,0,0.75)",
            zIndex: 25,
          }}
        >
          {spec.pie}
        </div>
      ) : null}
    </div>
  );
};
