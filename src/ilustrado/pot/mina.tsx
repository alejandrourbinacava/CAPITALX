import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, TexturasPot, Vela, osc, rr } from "./comun";
import { Frente, Perfil } from "./Gente";

/**
 * El interior de la mina, en corte: una galeria alta por la que los apiris
 * salen encorvados con el mineral a la espalda, un pozo con escaleras de cuero
 * por el que suben con la vela, y la galeria de abajo donde los barreteros
 * pican la veta. Oscuridad, velas, polvo y cansancio; nada de sangre.
 * Variante "azogue": la mina de mercurio de Huancavelica, de roca rojiza.
 */

/** Escalera de cuero: dos sogas trenzadas con travesanos de madera. */
const EscaleraCuero: React.FC<{ x: number; y0: number; y1: number; ancho?: number }> = ({ x, y0, y1, ancho = 90 }) => {
  const f = useCurrentFrame();
  const vaiven = Math.sin(f * 0.05 + x) * 3;
  const n = Math.floor((y1 - y0) / 46);
  return (
    <g transform={`translate(${vaiven} 0)`}>
      <path d={`M ${x - ancho / 2} ${y0} Q ${x - ancho / 2 - 6} ${(y0 + y1) / 2} ${x - ancho / 2} ${y1}`} stroke={"#7A5A3A"} strokeWidth={7} fill="none" />
      <path d={`M ${x + ancho / 2} ${y0} Q ${x + ancho / 2 + 6} ${(y0 + y1) / 2} ${x + ancho / 2} ${y1}`} stroke={"#7A5A3A"} strokeWidth={7} fill="none" />
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={x - ancho / 2} y={y0 + 20 + i * 46} width={ancho} height={7} rx={3} fill={"#8A6A44"} />
      ))}
      {Array.from({ length: n }).map((_, i) => (
        <g key={i} stroke={"#5A4028"} strokeWidth={2}>
          <path d={`M ${x - ancho / 2 - 4} ${y0 + 18 + i * 46} l 8 8`} />
          <path d={`M ${x + ancho / 2 - 4} ${y0 + 18 + i * 46} l 8 8`} />
        </g>
      ))}
    </g>
  );
};

/** Entibo: dos postes y un cabezal de madera. */
const Entibo: React.FC<{ x: number; y0: number; y1: number; w?: number }> = ({ x, y0, y1, w = 140 }) => (
  <g>
    <rect x={x - w / 2} y={y0} width={18} height={y1 - y0} fill={C.maderaMedia} />
    <rect x={x + w / 2 - 18} y={y0} width={18} height={y1 - y0} fill={C.madera} />
    <rect x={x - w / 2 - 14} y={y0 - 4} width={w + 28} height={22} fill={C.maderaLuz} />
    <rect x={x - w / 2 - 14} y={y0 + 12} width={w + 28} height={6} fill={C.madera} />
  </g>
);

/** Halo de luz de vela sobre la roca. */
const Halo: React.FC<{ x: number; y: number; r: number; k?: number }> = ({ x, y, r, k = 1 }) => {
  const f = useCurrentFrame();
  const t = 1 + Math.sin(f * 0.5 + x) * 0.04;
  return (
    <g>
      <circle cx={x} cy={y} r={r * t} fill={"url(#pot-halo)"} opacity={k} />
    </g>
  );
};

const DibujoMina: React.FC<PropsDecorado> = ({ e }) => {
  const f = useCurrentFrame();
  const sem = e.semilla ?? 4;
  const gente = e.gente ?? 0.8;
  const azogue = e.variante === "azogue";
  const roca = azogue ? "#634038" : C.roca;
  const hueco = azogue ? "#3A221E" : "#2A201B";
  const vetaC = azogue ? "#8E5A48" : "#9EA4A6";
  const vetaL = azogue ? "#C9A090" : C.plataLuz;
  // galerias: alta (y 120-400), pozo (x 1240-1440), baja (y 520-900)
  const alta = "M -20 400 L -20 150 Q 300 120 700 140 Q 1000 128 1250 150 L 1250 400 Q 900 412 600 404 Q 300 414 -20 400 Z";
  const baja = "M 160 900 L 160 560 Q 500 520 900 540 Q 1300 524 1700 548 Q 1820 560 1840 620 L 1860 900 Z";
  const pozo = "M 1250 120 L 1450 110 L 1440 1100 L 1250 1100 Z";
  return (
    <g>
      <TexturasPot />
      <defs>
        <radialGradient id="pot-halo">
          <stop offset="0" stopColor="#FFD9A0" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#E8A860" stopOpacity="0.18" />
          <stop offset="1" stopColor="#E8A860" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-100} y={-100} width={2120} height={1280} fill={roca} />
      <rect x={-100} y={-100} width={2120} height={1280} fill="url(#pot-roca)" opacity={azogue ? 0.5 : 0.9} />
      {/* vetas en la roca */}
      {Array.from({ length: 9 }).map((_, i) => (
        <path
          key={i}
          d={`M ${rr(i, 2) * 1900} ${rr(i, 3) * 1080} q ${60 + rr(i, 4) * 80} ${-20 - rr(i, 5) * 40} ${160 + rr(i, 6) * 120} ${10 + rr(i, 7) * 20}`}
          stroke={vetaC}
          strokeWidth={3 + rr(i, 8) * 4}
          fill="none"
          opacity={0.45}
        />
      ))}
      {/* huecos */}
      <path d={alta} fill={hueco} />
      <path d={baja} fill={hueco} />
      <path d={pozo} fill={osc(hueco, 0.8)} />
      {/* suelos */}
      <path d="M -20 400 Q 300 388 600 394 Q 900 402 1250 392 L 1250 412 Q 900 420 600 414 Q 300 424 -20 418 Z" fill={osc(roca, 0.75)} />
      <path d="M 160 900 L 1860 900 L 1860 920 L 160 920 Z" fill={osc(roca, 0.75)} />
      {[300, 700, 1050].map((x) => (
        <Entibo key={x} x={x} y0={150} y1={400} w={160} />
      ))}
      {[420, 980].map((x) => (
        <Entibo key={x} x={x} y0={545} y1={900} w={180} />
      ))}
      {/* el pozo con sus escaleras de cuero */}
      <EscaleraCuero x={1300} y0={130} y1={1080} />
      <EscaleraCuero x={1395} y0={130} y1={1080} ancho={70} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1250} y={300 + i * 300} width={200} height={14} fill={C.madera} />
      ))}
      {/* la veta grande al fondo de la galeria baja */}
      <g>
        <path d="M 1700 560 Q 1760 620 1800 700 Q 1830 800 1850 900 L 1800 900 Q 1780 800 1740 720 Q 1700 640 1660 580 Z" fill={vetaC} opacity={0.6} />
        {Array.from({ length: 10 }).map((_, i) => {
          const tw = Math.max(0, Math.sin(f * 0.15 + i * 1.3));
          return <circle key={i} cx={1700 + rr(i, 9) * 130} cy={600 + rr(i, 10) * 290} r={2 + tw * 4} fill={vetaL} opacity={0.4 + tw * 0.6} />;
        })}
      </g>
      {/* velas en nichos y una cruz de los mineros */}
      <Halo x={560} y={600} r={260} />
      <Halo x={1560} y={640} r={300} />
      <Halo x={160} y={260} r={220} />
      <Halo x={1000} y={260} r={200} />
      <Halo x={1340} y={640} r={200} k={0.8} />
      <g>
        <path d="M 600 640 L 600 600 Q 620 580 640 600 L 640 640 Z" fill={"#1A1210"} />
        <Vela x={620} y={612} s={0.9} semilla={2} halo={0} />
        <path d="M 1540 600 V 650 M 1526 614 H 1554" stroke={"#8A6A44"} strokeWidth={6} />
        <Vela x={1590} y={650} s={0.9} semilla={5} halo={0} />
        <Vela x={170} y={290} s={0.8} semilla={7} halo={0} />
      </g>
      {/* galeria alta: salen encorvados con el mineral */}
      {Array.from({ length: Math.round(1 + gente * 3) }).map((_, i) => (
        <Perfil key={i} traje="andino" semilla={sem + i} x0={120 + i * 260} y={402} v={0.45} s={0.52} pose="carga" espalda="costal" ritmo={0.7} />
      ))}
      <Vela x={1000} y={300} s={0.8} semilla={8} halo={0} />
      {/* subiendo por el pozo, con la vela */}
      <Perfil traje="andino" semilla={sem + 10} x0={1300} y={1000} vy={-0.55} s={0.55} pose="sube" espalda="costal" herramienta="vela" ritmo={0.5} dir={-1} />
      {gente > 0.4 ? <Perfil traje="andino" semilla={sem + 11} x0={1395} y={640} vy={-0.5} s={0.5} pose="sube" espalda="costal" ritmo={0.55} dir={1} /> : null}
      {/* galeria baja: barreteros en la veta, apiris llenando costales */}
      <Perfil traje="andino" semilla={sem + 20} x0={1590} y={902} s={0.78} pose="pica" herramienta="barreta" ritmo={0.9} gorro="montera" />
      {gente > 0.3 ? <Perfil traje="andino" semilla={sem + 21} x0={1400} y={904} s={0.72} pose="agacha" gorro="chullo" /> : null}
      {/* polvo de los golpes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const t = ((f * 0.02 + i / 8) % 1);
        return <circle key={i} cx={1700 + t * 60 + rr(i, 3) * 40} cy={760 - t * 120 + rr(i, 4) * 60} r={4 + t * 10} fill={"#C9B8A0"} opacity={(1 - t) * 0.25} />;
      })}
      <g>
        <path d="M 1120 900 Q 1120 820 1180 800 Q 1250 810 1250 900 Z" fill={vetaC} opacity={0.5} />
        <path d="M 1110 900 Q 1110 850 1150 840 Q 1200 846 1210 900 Z" fill={"#9C8C78"} />
      </g>
      {/* el apiri que mira a camara con su vela */}
      <Frente traje="andino" semilla={sem + 30} x={560} y={902} s={0.74} pose="vela" objeto="vela" espalda="costal" gesto="serio" mirada={0.6} />
      {gente > 0.5 ? <Frente traje="andino" semilla={sem + 31} x={790} y={904} s={0.7} pose="frio" espalda="costal" gesto="inquieto" mirada={-0.6} /> : null}
      {/* oscuridad general */}
      <rect x={-100} y={-100} width={2120} height={1280} fill={"#0A0806"} opacity={0.22} />
      {azogue
        ? Array.from({ length: 6 }).map((_, i) => {
            const t = (f * 0.004 + i / 6) % 1;
            return <ellipse key={i} cx={200 + i * 300 + t * 80} cy={700 - t * 200} rx={180} ry={30} fill={"#C9CFC6"} opacity={0.08} />;
          })
        : null}
    </g>
  );
};

export const MINA: Decorado = {
  desc: "Interior de la mina en corte: arriba una galeria entibada por la que salen apiris encorvados con costales de mineral; en el centro un pozo con escaleras de cuero por el que suben con la vela; abajo, los barreteros pican la veta a la luz de las velas, entre polvo; en primer termino un apiri con su vela y su costal mira a camara. Variante 'azogue': la mina de mercurio de Huancavelica, roca rojiza y vapores.",
  admite: "variante ('azogue': Huancavelica), gente, semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 540, z: 1.06 }, desc: "el corte de la mina entero" },
    veta: { de: { x: 1500, y: 720, z: 2.4 }, a: { x: 1540, y: 700, z: 2.7 }, desc: "el barretero picando la veta" },
    escalera: { de: { x: 1340, y: 820, z: 2.2 }, a: { x: 1340, y: 620, z: 2.3 }, desc: "subiendo por las escaleras de cuero, la camara acompana" },
    cara: { de: { x: 600, y: 650, z: 3.3 }, a: { x: 600, y: 640, z: 3.7 }, desc: "primer plano del apiri con la vela" },
    galeria: { de: { x: 500, y: 300, z: 2 }, a: { x: 700, y: 290, z: 2.1 }, desc: "la galeria alta, cargadores encorvados" },
    apiris: { de: { x: 680, y: 720, z: 2 }, a: { x: 660, y: 710, z: 2.2 }, desc: "los dos apiris de la galeria baja" },
  },
  dibujo: DibujoMina,
};
