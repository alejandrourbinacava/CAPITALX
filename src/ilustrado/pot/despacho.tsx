import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../../theme";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, Cordillera, TexturasPot, Vela, osc, rr } from "./comun";
import { Frente } from "./Gente";
import { Balanza } from "./moneda";

/**
 * Un despacho del siglo XVI-XVII en tres versiones:
 *  - "virrey" (por defecto): el virrey Francisco de Toledo en su mesa, con el
 *    secretario que escribe y un oidor de pie; tapiz, mapa y ventana.
 *  - "declaracion": 1572, un cuarto encalado; el anciano don Diego Gualpa
 *    declara y un clerigo escribe su testimonio a la luz de la vela.
 *  - "inquisidor": el visitador Nestares Marin ante las monedas falsas, la
 *    balanza y un mercader de plata de pie.
 */

const Tapiz: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const f = useCurrentFrame();
  const onda = Math.sin(f * 0.05) * 3;
  return (
    <g>
      <rect x={x - 10} y={y - 14} width={w + 20} height={14} fill={C.madera} />
      <path d={`M ${x} ${y} L ${x + w} ${y} L ${x + w + onda} ${y + h} L ${x + onda} ${y + h} Z`} fill={"#6A2E2A"} />
      <rect x={x + 20} y={y + 20} width={w - 40} height={h - 40} fill={"#8A4A34"} />
      <rect x={x + 34} y={y + 34} width={w - 68} height={h - 68} fill="none" stroke={C.ocre} strokeWidth={4} />
      {/* escena tejida: arboles y un jinete sugeridos */}
      <path d={`M ${x + 50} ${y + h - 60} Q ${x + w / 2} ${y + h - 120} ${x + w - 50} ${y + h - 60}`} fill={"#5A6A48"} />
      {[0.25, 0.7].map((k) => (
        <g key={k}>
          <rect x={x + w * k - 5} y={y + h - 180} width={10} height={90} fill={"#5A3D2B"} />
          <ellipse cx={x + w * k} cy={y + h - 190} rx={40} ry={34} fill={"#4A5A3E"} />
        </g>
      ))}
      <path d={`M ${x + w * 0.42} ${y + h - 110} q 30 -40 70 -10 l 10 30 Z`} fill={"#C9A86A"} />
      {Array.from({ length: Math.floor(w / 18) }).map((_, i) => (
        <rect key={i} x={x + i * 18 + onda} y={y + h} width={8} height={18} fill={C.ocre} />
      ))}
    </g>
  );
};

const Crucifijo: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-8} y={-80} width={16} height={180} fill={C.madera} />
    <rect x={-60} y={-50} width={120} height={14} fill={C.madera} />
    <path d="M -50 -44 L 0 -40 L 50 -44 L 4 -30 L 6 40 L -6 40 L -4 -30 Z" fill={"#E2D2B4"} />
    <circle cx={0} cy={-56} r={8} fill={"#E2D2B4"} />
  </g>
);

/** Papeles y objetos de la mesa. */
const Mesa: React.FC<{ x: number; y: number; w: number; tela: string; documento: string; rico: boolean }> = ({ x, y, w, tela, documento, rico }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <rect x={x} y={y} width={w} height={26} fill={rico ? osc(tela, 1.15) : C.maderaLuz} />
      <path d={`M ${x} ${y + 26} L ${x + w} ${y + 26} L ${x + w} 1100 L ${x} 1100 Z`} fill={rico ? tela : C.maderaMedia} />
      {rico ? null : <path d={`M ${x + 30} ${y + 60} H ${x + w - 30} V ${y + 200} H ${x + 30} Z M ${x + 30} ${y + 230} H ${x + w - 30}`} fill="none" stroke={C.madera} strokeWidth={6} />}
      {rico ? <path d={`M ${x} ${y + 140} H ${x + w}`} stroke={C.ocre} strokeWidth={6} /> : null}
      {rico ? Array.from({ length: Math.floor(w / 24) }).map((_, i) => <rect key={i} x={x + i * 24 + 6} y={y + 146} width={10} height={16} fill={C.ocre} />) : null}

      {/* documento con su titulo */}
      <g transform={`translate(${x + w * 0.42} ${y + 6}) rotate(-4)`}>
        <rect x={-110} y={-18} width={220} height={22} fill={"#EDE3C8"} />
        <rect x={-110} y={-26} width={220} height={10} fill={"#E2D6B8"} />
        <text x={0} y={-30} textAnchor="middle" fontFamily={FONT.serif} fontSize={18} fontStyle="italic" fill={C.tinta}>
          {documento}
        </text>
      </g>
      {/* tintero y pluma */}
      <g transform={`translate(${x + w * 0.72} ${y})`}>
        <rect x={-16} y={-24} width={32} height={24} rx={4} fill={"#2A2A2C"} />
        <path d={`M 4 -22 L ${24 + Math.sin(f * 0.05) * 2} -90 Q 40 -100 30 -70 Z`} fill={"#F2EDE2"} />
      </g>
      {/* legajo atado */}
      <g transform={`translate(${x + w * 0.12} ${y})`}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-50} y={-12 - i * 10} width={100} height={10} fill={i % 2 ? "#E2D6B8" : "#EDE3C8"} />
        ))}
        <rect x={-6} y={-52} width={12} height={52} fill={C.carmin} />
      </g>
    </g>
  );
};

const DibujoDespacho: React.FC<PropsDecorado> = ({ e }) => {
  const f = useCurrentFrame();
  const v = e.variante ?? "virrey";
  const sem = e.semilla ?? 14;
  const declaracion = v === "declaracion";
  const inquisidor = v === "inquisidor";
  const documento = e.textos?.documento ?? (declaracion ? "Declaración de don Diego Gualpa" : inquisidor ? "Visita de la Casa de Moneda" : "Ordenanzas de minas");
  const muro = declaracion ? C.cal : "#E6D8BC";
  return (
    <g>
      <TexturasPot />
      <rect x={-100} y={-100} width={2120} height={1300} fill={muro} />
      {declaracion ? null : <rect x={-100} y={-100} width={2120} height={1300} fill="url(#pot-sillar)" opacity={0.25} />}
      {/* techo */}
      <rect x={-100} y={-100} width={2120} height={180} fill={C.maderaMedia} />
      {Array.from({ length: 18 }).map((_, i) => (
        <rect key={i} x={-80 + i * 120} y={-100} width={36} height={190} fill={C.madera} />
      ))}
      <rect x={-100} y={70} width={2120} height={22} fill={C.madera} />
      {/* zocalo y suelo de ladrillo */}
      <rect x={-100} y={700} width={2120} height={140} fill={declaracion ? C.calSombra : "#7A2E2A"} opacity={declaracion ? 1 : 0.85} />
      <rect x={-100} y={830} width={2120} height={400} fill={"#A86A4A"} />
      {Array.from({ length: 12 }).map((_, r) =>
        Array.from({ length: 24 }).map((_, c) => (
          <path key={`${r}-${c}`} d={`M ${-100 + c * 90 + (r % 2) * 45} ${830 + r * 26} h 86 v 24 h -86 Z`} fill={(r + c) % 3 ? "#B07250" : "#9A5E40"} />
        ))
      )}
      {/* ventana con la cordillera */}
      <g>
        <rect x={1480} y={170} width={320} height={420} fill={"#C9D3D0"} />
        <g transform="translate(1480 170)">
          <svg width={320} height={420} viewBox="0 0 320 420" overflow="hidden">
            <rect width={320} height={420} fill={"#D2DAD6"} />
            <g transform="translate(-400 0) scale(0.6)">
              <Cordillera y={460} ancho={1400} semilla={9} color={"#B4ADA0"} alto={200} />
            </g>
            <rect y={300} width={320} height={120} fill={"#B9A878"} />
          </svg>
        </g>
        <path d="M 1640 170 V 590 M 1480 380 H 1800" stroke={C.madera} strokeWidth={12} />
        <rect x={1460} y={150} width={360} height={24} fill={C.madera} />
        <rect x={1460} y={586} width={360} height={24} fill={C.maderaLuz} />
        <path d="M 1480 590 L 1800 590 L 1960 840 L 1300 840 Z" fill={"#FFF3D2"} opacity={0.14} />
        {/* cortinas */}
        <path d={`M 1440 150 L 1500 150 Q ${1490 + Math.sin(f * 0.04) * 6} 400 1520 640 L 1440 640 Z`} fill={declaracion ? "#C9B48A" : "#6A2E2A"} />
        <path d={`M 1840 150 L 1780 150 Q ${1790 + Math.sin(f * 0.04 + 1) * 6} 400 1760 640 L 1840 640 Z`} fill={declaracion ? "#C9B48A" : "#6A2E2A"} />
      </g>
      {declaracion ? (
        <g>
          <Crucifijo x={980} y={300} s={1.2} />
          {/* hornacina con una imagen y banco */}
          <path d="M 260 520 V 300 Q 340 230 420 300 V 520 Z" fill={C.calSombra} />
          <path d="M 320 500 L 330 340 Q 340 320 350 340 L 360 500 Z" fill={"#3E4E6B"} />
          <circle cx={340} cy={326} r={14} fill={"#E2C49A"} />
        </g>
      ) : (
        <g>
          <Tapiz x={140} y={170} w={520} h={420} />
          <Crucifijo x={1000} y={260} s={0.9} />
          {/* mapa del virreinato colgado */}
          <g transform="translate(1100 200)">
            <rect x={0} y={0} width={300} height={220} fill={"#E8DCC0"} />
            <rect x={0} y={0} width={300} height={220} fill="none" stroke={C.madera} strokeWidth={8} />
            <path d="M 60 20 Q 90 60 80 110 Q 120 150 140 210 L 300 210 L 300 20 Z" fill={"#D2C29E"} />
            <path d="M 60 20 Q 90 60 80 110 Q 120 150 140 210" fill="none" stroke={"#8A7A5A"} strokeWidth={3} />
            <path d="M 150 40 L 190 90 L 180 140 L 220 180" stroke={C.carmin} strokeWidth={3} strokeDasharray="8 6" fill="none" />
            {[[150, 40], [190, 90], [220, 180]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={6} fill={C.carmin} />
            ))}
          </g>
        </g>
      )}
      {/* las personas */}
      {declaracion ? (
        <g>
          <Frente traje="andino" semilla={sem} edad="mayor" x={760} y={1000} s={1} cuerpo="busto" pose="habla" gesto="serio" mirada={0.5} gorro="montera" />
          <Frente traje="clerigo" semilla={sem + 1} x={1180} y={990} s={0.98} cuerpo="busto" pose="escribe" objeto="pluma" gesto="serio" mirada={-1} />
          <Frente traje="espanol" semilla={sem + 2} x={1640} y={1060} s={1} pose="brazos" gesto="serio" mirada={-1} color={"#2E2E3E"} />
          <Mesa x={560} y={800} w={820} tela={"#5A3D2B"} documento={documento} rico={false} />
          <Vela x={1300} y={796} s={1} semilla={3} />
        </g>
      ) : inquisidor ? (
        <g>
          <Frente traje="clerigo" semilla={sem + 3} edad="mayor" x={980} y={990} s={1} cuerpo="busto" pose="senala" gesto="serio" mirada={1} barba="completa" />
          <Frente traje="espanol" semilla={sem + 4} x={360} y={1060} s={1} pose="lee" gesto="serio" color={"#1E1E22"} />
          <Frente traje="mercader" semilla={sem + 5} x={1620} y={1070} s={1} pose="quieto" gesto="inquieto" mirada={-1} />
          <Mesa x={600} y={800} w={760} tela={"#2F4A3F"} documento={documento} rico />
          {/* monedas falsas, sacos y la balanza */}
          <g transform="translate(1160 800)">
            {Array.from({ length: 18 }).map((_, i) => (
              <ellipse key={i} cx={-60 + (i % 6) * 26} cy={-6 - Math.floor(i / 6) * 9} rx={14 + rr(i, 2) * 4} ry={6} fill={i % 2 ? C.plata : "#B8B0A0"} />
            ))}
            <path d="M 110 0 Q 96 -60 130 -70 Q 164 -60 150 0 Z" fill={"#8A6A44"} />
          </g>
          <Balanza x={820} y={800} s={0.5} izq={<ellipse cx={0} cy={-6} rx={22} ry={6} fill={C.plata} />} der={<rect x={-10} y={-16} width={20} height={16} fill={"#5A5A5E"} />} />
        </g>
      ) : (
        <g>
          <Frente traje="noble" semilla={sem + 6} edad="mayor" x={980} y={990} s={1} cuerpo="busto" pose="habla" gesto="serio" cruz barba="completa" bigote="morsa" mirada={-0.4} gorro="ninguno" calvo />
          <Frente traje="espanol" semilla={sem + 7} x={360} y={1060} s={1} pose="lee" gesto="neutro" mirada={1} color={"#2E2E3E"} gorro="ninguno" />
          <Frente traje="clerigo" semilla={sem + 8} x={1620} y={1070} s={1} pose="lee" gesto="serio" mirada={-1} gorro="ala" />
          <Mesa x={600} y={800} w={760} tela={"#6A2E2A"} documento={documento} rico />
          <Vela x={700} y={796} s={1} semilla={4} />
          <Vela x={1280} y={796} s={1} semilla={5} />
        </g>
      )}
    </g>
  );
};

export const DESPACHO: Decorado = {
  desc: "Un despacho de los siglos XVI-XVII. 'virrey' (por defecto): el virrey Francisco de Toledo, de barba gris y cruz de Alcantara, en su mesa de terciopelo con documentos, velas y tintero; un secretario escribe en un atril, un oidor lee de pie; tapiz, crucifijo, mapa del virreinato y ventana con la cordillera. 'declaracion': cuarto encalado de 1572, el anciano don Diego Gualpa declara, un clerigo escribe su testimonio, un testigo espanol de pie, una vela. 'inquisidor': el visitador Nestares Marin senala las monedas falsas sobre la mesa, con una balanza; un mercader de plata, inquieto, de pie.",
  admite: "variante ('virrey' | 'declaracion' | 'inquisidor'), textos.documento (titulo del documento de la mesa), semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 560, z: 1.08 }, desc: "el despacho entero" },
    figura: { de: { x: 980, y: 640, z: 2.4 }, a: { x: 980, y: 620, z: 2.8 }, desc: "el personaje sentado a la mesa" },
    escribano: { de: { x: 1140, y: 680, z: 2.4 }, a: { x: 1120, y: 660, z: 2.6 }, desc: "el que escribe (o el clerigo, en la declaracion)" },
    izquierda: { de: { x: 440, y: 640, z: 2.2 }, a: { x: 420, y: 630, z: 2.4 }, desc: "la figura de pie de la izquierda (secretario, o el de la izquierda)" },
    mesa: { de: { x: 900, y: 840, z: 3 }, a: { x: 940, y: 850, z: 3.4 }, desc: "los papeles, el tintero y la vela sobre la mesa" },
    ventana: { de: { x: 1380, y: 520, z: 1.8 }, a: { x: 1420, y: 500, z: 2 }, desc: "la ventana y el que esta de pie junto a ella" },
  },
  dibujo: DibujoDespacho,
};
