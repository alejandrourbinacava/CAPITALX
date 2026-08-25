import React from "react";
import { Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/**
 * Retrato en recorte de periódico.
 *
 * Cuando el guion nombra a una persona, aparece aquí: blanco y negro, trama de
 * semitono, dentro de un recorte de prensa con su pie.
 *
 * Dos caminos, según lo que exista:
 *   - `foto`: una imagen con licencia libre, tratada en código. La atribución
 *     se imprime en el propio recorte, que es lo que exigen las CC BY.
 *   - sin foto: una silueta dibujada con el mismo tratamiento. No es un
 *     retrato falso: se lee como el icono genérico que pone un periódico
 *     cuando no tiene imagen del protagonista.
 */

const CLIP = { x: 560, y: 170, w: 800, h: 700 };

/** Trama de puntos: lo que convierte una imagen en algo impreso. */
const Semitono: React.FC<{ x: number; y: number; w: number; h: number; paso?: number }> = ({
  x, y, w, h, paso = 7,
}) => {
  const puntos: React.ReactNode[] = [];
  const cols = Math.ceil(w / paso);
  const filas = Math.ceil(h / paso);
  for (let c = 0; c < cols; c++) {
    for (let f = 0; f < filas; f++) {
      puntos.push(
        <circle
          key={`${c}-${f}`}
          cx={x + c * paso + paso / 2}
          cy={y + f * paso + paso / 2}
          r={paso * 0.34}
          fill={C.ink}
        />
      );
    }
  }
  return <g opacity="0.22">{puntos}</g>;
};

/** Busto genérico, con volumen dado por bandas de trama. */
const Busto: React.FC = () => {
  const cx = CLIP.x + CLIP.w / 2;
  const base = CLIP.y + CLIP.h - 70;
  return (
    <g>
      <path
        d={`M${cx} ${CLIP.y + 130} C${cx + 96} ${CLIP.y + 130} ${cx + 102} ${CLIP.y + 218} ${cx + 102} ${CLIP.y + 262} C${cx + 102} ${CLIP.y + 330} ${cx + 62} ${CLIP.y + 392} ${cx} ${CLIP.y + 392} C${cx - 62} ${CLIP.y + 392} ${cx - 102} ${CLIP.y + 330} ${cx - 102} ${CLIP.y + 262} C${cx - 102} ${CLIP.y + 218} ${cx - 96} ${CLIP.y + 130} ${cx} ${CLIP.y + 130} Z`}
        fill={C.ink}
      />
      <path
        d={`M${cx - 210} ${base} C${cx - 210} ${base - 210} ${cx - 140} ${base - 268} ${cx - 62} ${base - 288} L${cx + 62} ${base - 288} C${cx + 140} ${base - 268} ${cx + 210} ${base - 210} ${cx + 210} ${base} Z`}
        fill={C.ink}
      />
      {/* cuello y camisa, en negativo */}
      <path d={`M${cx - 58} ${base - 288} L${cx} ${base - 178} L${cx + 58} ${base - 288} L${cx + 34} ${base - 300} L${cx} ${base - 222} L${cx - 34} ${base - 300} Z`} fill="#EFEADC" />
    </g>
  );
};

export const Retrato: React.FC<{
  spec: {
    nombre: string;
    papel?: string;
    fecha?: string;
    /** ruta dentro de public/, p. ej. "retratos/krugman.png" */
    foto?: string;
    /** obligatorio si la foto lleva licencia CC BY o CC BY-SA */
    credito?: string;
    titular?: string;
  };
}> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: frame - 2, fps, config: { damping: 18, mass: 0.7, stiffness: 140 } });
  const giro = interpolate(entra, [0, 1], [-4.5, -1.6]);

  // motas de papel viejo dentro del recorte
  const motas = React.useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: CLIP.x + random(`mx${i}`) * CLIP.w,
        y: CLIP.y + random(`my${i}`) * (CLIP.h + 190),
        r: 0.8 + random(`mr${i}`) * 2.4,
        o: 0.06 + random(`mo${i}`) * 0.2,
      })),
    []
  );

  return (
    <>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
        <g
          transform={`rotate(${giro} ${CLIP.x + CLIP.w / 2} ${CLIP.y + CLIP.h / 2})`}
          opacity={entra}
        >
          {/* sombra plana del recorte */}
          <rect x={CLIP.x + 18} y={CLIP.y + 18} width={CLIP.w} height={CLIP.h + 190} fill={C.carmin} opacity="0.5" />
          {/* el papel del recorte */}
          <rect x={CLIP.x} y={CLIP.y} width={CLIP.w} height={CLIP.h + 190} fill="#EFEADC" stroke={C.ink} strokeWidth="3" />

          {/* cabecera del recorte */}
          <line x1={CLIP.x + 34} y1={CLIP.y + 62} x2={CLIP.x + CLIP.w - 34} y2={CLIP.y + 62} stroke={C.ink} strokeWidth="2" />
          <text x={CLIP.x + 34} y={CLIP.y + 48} fill={C.muted} fontFamily={FONT.mono} fontSize="20" letterSpacing="4">
            {(spec.fecha ?? "ARCHIVO").toUpperCase()}
          </text>

          {/* la imagen: foto tratada o silueta */}
          <g clipPath="url(#clipRetrato)">
            {spec.foto ? null : <Busto />}
            <Semitono x={CLIP.x} y={CLIP.y + 80} w={CLIP.w} h={CLIP.h - 110} />
          </g>
          <defs>
            <clipPath id="clipRetrato">
              <rect x={CLIP.x + 34} y={CLIP.y + 84} width={CLIP.w - 68} height={CLIP.h - 130} />
            </clipPath>
          </defs>
          <rect
            x={CLIP.x + 34}
            y={CLIP.y + 84}
            width={CLIP.w - 68}
            height={CLIP.h - 130}
            fill="none"
            stroke={C.ink}
            strokeWidth="2"
          />

          {/* pie de foto */}
          <text x={CLIP.x + 34} y={CLIP.y + CLIP.h + 26} fill={C.ink} fontFamily={FONT.sans} fontWeight="700" fontSize="46">
            {spec.nombre}
          </text>
          {spec.papel ? (
            <text x={CLIP.x + 34} y={CLIP.y + CLIP.h + 74} fill={C.muted} fontFamily={FONT.mono} fontSize="24" letterSpacing="1.5">
              {spec.papel}
            </text>
          ) : null}
          {spec.credito ? (
            <text x={CLIP.x + 34} y={CLIP.y + CLIP.h + 150} fill={C.muted} fontFamily={FONT.mono} fontSize="17" letterSpacing="1">
              {spec.credito}
            </text>
          ) : null}

          {motas.map((m, i) => (
            <circle key={i} cx={m.x} cy={m.y} r={m.r} fill={C.ink} opacity={m.o} />
          ))}
        </g>
      </svg>

      {/* la foto va como capa HTML para poder tratarla con filtros */}
      {spec.foto ? (
        <div
          style={{
            position: "absolute",
            left: `${((CLIP.x + 34) / 1920) * 100}%`,
            top: `${((CLIP.y + 84) / 1080) * 100}%`,
            width: `${((CLIP.w - 68) / 1920) * 100}%`,
            height: `${((CLIP.h - 130) / 1080) * 100}%`,
            overflow: "hidden",
            opacity: entra,
            transform: `rotate(${giro}deg)`,
            transformOrigin: `${CLIP.w / 2 - 34}px ${CLIP.h / 2 - 42}px`,
          }}
        >
          <Img
            src={staticFile(spec.foto)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(1) contrast(1.45) brightness(1.05)",
            }}
          />
          {/* trama encima: es lo que la convierte en prensa impresa */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(20,24,26,0.55) 34%, transparent 36%)",
              backgroundSize: "7px 7px",
              mixBlendMode: "multiply",
            }}
          />
        </div>
      ) : null}

      {spec.titular ? (
        <div
          style={{
            position: "absolute",
            left: 128,
            top: 250,
            width: 380,
            fontFamily: FONT.serif,
            fontSize: 74,
            lineHeight: 1.06,
            color: C.ink,
            opacity: interpolate(entra, [0.4, 1], [0, 1], { extrapolateLeft: "clamp" }),
          }}
        >
          {spec.titular}
        </div>
      ) : null}
    </>
  );
};
