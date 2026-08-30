import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/**
 * El recorte de revista: el mecanismo Vox aplicado a una foto cualquiera.
 *
 * Sujeto recortado del fondo, tratado en tinta, con una copia plana desplazada
 * por detras en carmin u ocre. Eso ya viene hecho en el PNG.
 *
 * Lo que se hace aqui es maquetarlo, y esa es la parte que faltaba: un recorte
 * solo, centrado en medio del cuadro, se ve pobre por muy bien tratado que
 * este. Va a un lado, y en el otro entra el texto que lo explica, escalonado
 * detras de la figura. Es una pagina de revista, no una foto pegada.
 */
export const Recorte: React.FC<{
  spec: {
    fichero?: string;
    lado?: "izq" | "der" | "centro";
    escala?: number;
    nota?: string;
    titular?: string;
    apoyo?: string;
    cifra?: string;
  };
}> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  if (!spec?.fichero) return null;

  const k = spring({ frame: frame - 2, fps, config: { damping: 14, mass: 0.7, stiffness: 150 } });
  const respira = interpolate(frame, [0, durationInFrames], [1, 1.05], { extrapolateRight: "clamp" });
  const escala = (spec.escala ?? 1) * respira;

  const hayTexto = !!(spec.titular || spec.apoyo || spec.cifra);
  // Con texto al lado, la figura se aparta; sola, se queda en el centro.
  const lado = spec.lado ?? (hayTexto ? "der" : "centro");
  const x = lado === "izq" ? "27%" : lado === "der" ? "70%" : "50%";
  const desde = lado === "der" ? 90 : lado === "izq" ? -90 : 0;

  // El texto entra despues de la figura, y cada linea detras de la anterior.
  const linea = (i: number) =>
    spring({ frame: frame - 12 - i * 7, fps, config: { damping: 200, mass: 0.55 } });

  // El filete se traza durante toda la escena: es lo que sigue pasando.
  const filete = interpolate(frame, [16, durationInFrames * 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* mancha de color debajo, para que el recorte no flote sobre nada */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: "56%",
          width: 940,
          height: 940,
          marginLeft: -470,
          marginTop: -470,
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
          height: hayTexto ? "76%" : "82%",
        }}
      >
        <Img src={staticFile(spec.fichero)} style={{ height: "100%", width: "auto" }} />
      </div>

      {hayTexto ? (
        <div
          style={{
            position: "absolute",
            left: lado === "der" ? 128 : "auto",
            right: lado === "der" ? "auto" : 128,
            top: "26%",
            width: 700,
            textAlign: lado === "der" ? "left" : "right",
          }}
        >
          {spec.cifra ? (
            <div
              style={{
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: 128,
                lineHeight: 0.95,
                letterSpacing: "-0.05em",
                color: C.carmin,
                fontVariantNumeric: "tabular-nums",
                opacity: linea(0),
                transform: `translateY(${interpolate(linea(0), [0, 1], [26, 0])}px)`,
              }}
            >
              {spec.cifra}
            </div>
          ) : null}

          {spec.titular ? (
            <div
              style={{
                fontFamily: FONT.sans,
                fontWeight: 700,
                fontSize: 74,
                lineHeight: 1.06,
                letterSpacing: "-0.035em",
                color: C.ink,
                marginTop: spec.cifra ? 18 : 0,
                opacity: linea(1),
                transform: `translateY(${interpolate(linea(1), [0, 1], [26, 0])}px)`,
              }}
            >
              {spec.titular}
            </div>
          ) : null}

          {/* filete bajo el titular, trazandose */}
          <div
            style={{
              height: 7,
              width: `${filete * 100}%`,
              marginLeft: lado === "der" ? 0 : `${(1 - filete) * 100}%`,
              background: C.carmin,
              marginTop: 22,
            }}
          />

          {spec.apoyo ? (
            <div
              style={{
                fontFamily: FONT.sans,
                fontWeight: 500,
                fontSize: 38,
                lineHeight: 1.3,
                color: C.muted,
                marginTop: 26,
                opacity: linea(2),
                transform: `translateY(${interpolate(linea(2), [0, 1], [20, 0])}px)`,
              }}
            >
              {spec.apoyo}
            </div>
          ) : null}
        </div>
      ) : null}

      {spec.nota ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 96,
            textAlign: "center",
            fontFamily: FONT.mono,
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
