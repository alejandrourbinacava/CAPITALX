import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import { Persona, Transeunte, rasgosDe } from "./Personajes";

/**
 * Decorados detallados de 1914 para el montaje ilustrado. Cada uno es un
 * escenario de 1920x1080 que admite varios encuadres (plano general, medio y
 * corto) moviendo la camara, para sacar varias tomas de un mismo dibujo.
 *
 * Los edificios estan simplificados a partir de su aspecto real: el muro
 * ciego de Soane del Banco de Inglaterra, el portico de ocho columnas del
 * Royal Exchange con la estatua de Wellington delante, la entrada de la Bolsa
 * en Throgmorton Street y la fachada de seis columnas de la Bolsa de Nueva
 * York en Broad Street.
 */

export const D = {
  cielo1: "#E7DCC2",
  cielo2: "#F4EDDD",
  bruma: "#E9DFC8",
  piedra: "#DCD2BC",
  piedraLuz: "#EAE2D0",
  piedraMedia: "#C8BDA4",
  piedraSombra: "#ADA185",
  piedraOscura: "#8C8068",
  junta: "#C2B79E",
  ladrillo: "#9C7A62",
  ladrilloJunta: "#86684F",
  hollin: "#6F6355",
  cristal: "#3E4847",
  cristalLuz: "#7E8D86",
  marco: "#E9E2D2",
  adoquin: "#8F887A",
  adoquinJunta: "#7A7468",
  acera: "#C6BBA4",
  bronce: "#4D5A4C",
  bronceLuz: "#66756A",
  madera: "#5C3E2C",
  maderaMedia: "#6E4B35",
  maderaLuz: "#87603F",
  verdeBanco: "#2F4A3F",
  laton: "#C9A23A",
  pizarra: "#2B3330",
  tiza: "#EEEBE2",
  carmin: "#C8402C",
  tinta: "#14181A",
};

/* ------------------------------------------------------------------ */
/* Piezas comunes                                                      */
/* ------------------------------------------------------------------ */

/** Patrones de textura: ladrillo, sillares y adoquin. */
export const Texturas: React.FC = () => (
  <defs>
    <pattern id="ladrillo" width="48" height="24" patternUnits="userSpaceOnUse">
      <rect width="48" height="24" fill={D.ladrillo} />
      <path d="M0 12 H48 M0 0 H48 M24 0 V12 M0 12 V24 M48 12 V24" stroke={D.ladrilloJunta} strokeWidth="2" />
    </pattern>
    <pattern id="sillar" width="120" height="44" patternUnits="userSpaceOnUse">
      <rect width="120" height="44" fill={D.piedra} />
      <path d="M0 0 H120 M0 22 H120 M60 0 V22 M0 22 V44 M120 22 V44" stroke={D.junta} strokeWidth="1.6" />
    </pattern>
    <pattern id="adoquin" width="38" height="20" patternUnits="userSpaceOnUse">
      <rect width="38" height="20" fill={D.adoquinJunta} />
      <rect x="1.5" y="1.5" width="16" height="7" rx="2" fill={D.adoquin} />
      <rect x="20" y="1.5" width="16" height="7" rx="2" fill={D.adoquin} />
      <rect x="-8" y="11.5" width="16" height="7" rx="2" fill={D.adoquin} />
      <rect x="11" y="11.5" width="16" height="7" rx="2" fill={D.adoquin} />
      <rect x="30" y="11.5" width="16" height="7" rx="2" fill={D.adoquin} />
    </pattern>
    <pattern id="parquet" width="60" height="30" patternUnits="userSpaceOnUse">
      <rect width="60" height="30" fill={D.maderaMedia} />
      <path d="M0 15 H60 M30 0 V15 M0 15 V30" stroke={D.madera} strokeWidth="2" />
    </pattern>
    <linearGradient id="luzVentana" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stopColor="#FFF3D2" stopOpacity="0.55" />
      <stop offset="1" stopColor="#FFF3D2" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={D.cielo1} />
      <stop offset="1" stopColor={D.cielo2} />
    </linearGradient>
    <radialGradient id="lampara" cx="0.5" cy="0.4" r="0.6">
      <stop offset="0" stopColor="#FFE7AE" stopOpacity="0.55" />
      <stop offset="1" stopColor="#FFE7AE" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/** Columna corintia simplificada: fuste estriado, capitel con hojas, basa. */
export const Columna: React.FC<{ x: number; y: number; h: number; w?: number }> = ({ x, y, h, w = 46 }) => (
  <g>
    <rect x={x - w / 2 - 8} y={y - 16} width={w + 16} height={16} fill={D.piedraMedia} />
    <rect x={x - w / 2 - 4} y={y - 26} width={w + 8} height={10} fill={D.piedra} />
    <rect x={x - w / 2} y={y - h} width={w} height={h - 26} fill={D.piedraLuz} />
    {[0.25, 0.5, 0.75].map((k) => (
      <rect key={k} x={x - w / 2 + w * k - 1.5} y={y - h + 6} width={3} height={h - 36} fill={D.piedraMedia} opacity={0.7} />
    ))}
    <rect x={x + w / 2 - w * 0.28} y={y - h} width={w * 0.28} height={h - 26} fill={D.piedraMedia} opacity={0.55} />
    {/* capitel */}
    <path
      d={`M ${x - w / 2 - 2} ${y - h} Q ${x - w / 2 - 14} ${y - h - 22} ${x - w / 2 - 18} ${y - h - 36} L ${x + w / 2 + 18} ${y - h - 36} Q ${x + w / 2 + 14} ${y - h - 22} ${x + w / 2 + 2} ${y - h} Z`}
      fill={D.piedra}
    />
    {[-0.3, 0, 0.3].map((k) => (
      <path key={k} d={`M ${x + w * k - 7} ${y - h} Q ${x + w * k} ${y - h - 26} ${x + w * k + 7} ${y - h}`} fill={D.piedraMedia} />
    ))}
    <rect x={x - w / 2 - 20} y={y - h - 44} width={w + 40} height={10} fill={D.piedraMedia} />
  </g>
);

/** Ventana de guillotina con su recercado. */
export const Ventana: React.FC<{ x: number; y: number; w: number; h: number; luz?: boolean; frontis?: boolean }> = ({ x, y, w, h, luz, frontis }) => (
  <g>
    <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill={D.piedraMedia} />
    <rect x={x} y={y} width={w} height={h} fill={luz ? "#C9B27A" : D.cristal} />
    <rect x={x} y={y} width={w * 0.5} height={h} fill={luz ? "#D9C48E" : D.cristalLuz} opacity={0.25} />
    <path d={`M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h / 2} H ${x + w} M ${x} ${y + h / 4} H ${x + w} M ${x} ${y + (3 * h) / 4} H ${x + w}`} stroke={D.marco} strokeWidth={3} />
    <rect x={x - 12} y={y + h + 6} width={w + 24} height={8} fill={D.piedra} />
    {frontis ? <polygon points={`${x - 14},${y - 10} ${x + w / 2},${y - 38} ${x + w + 14},${y - 10}`} fill={D.piedra} /> : <rect x={x - 12} y={y - 18} width={w + 24} height={10} fill={D.piedra} />}
  </g>
);

/** Farola de gas de la City. */
export const Farola: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-24} width={28} height={24} fill={"#1E2224"} />
    <rect x={-6} y={-300} width={12} height={280} fill={"#1E2224"} />
    <rect x={-10} y={-200} width={20} height={8} fill={"#1E2224"} />
    <rect x={-26} y={-312} width={52} height={6} fill={"#1E2224"} />
    <path d="M -22 -306 L 22 -306 L 16 -358 L -16 -358 Z" fill={"#E6CD8E"} opacity={0.9} />
    <path d="M -22 -306 L 22 -306 L 16 -358 L -16 -358 Z" fill="none" stroke={"#1E2224"} strokeWidth={4} />
    <path d="M 0 -306 V -358" stroke={"#1E2224"} strokeWidth={3} />
    <polygon points="-24,-358 0,-382 24,-358" fill={"#1E2224"} />
  </g>
);

/** Rotulo de comercio de la epoca. */
const RotuloTienda: React.FC<{ x: number; y: number; w: number; texto: string; fondo?: string }> = ({ x, y, w, texto, fondo = "#1F3A30" }) => (
  <g>
    <rect x={x} y={y} width={w} height={44} fill={fondo} />
    <rect x={x + 4} y={y + 4} width={w - 8} height={36} fill="none" stroke={D.laton} strokeWidth={2} />
    <text x={x + w / 2} y={y + 31} textAnchor="middle" fontFamily={FONT.serif} fontSize={26} letterSpacing={4} fill={D.laton}>
      {texto}
    </text>
  </g>
);

/** Omnibus B de la London General, de perfil, con su escalera y anuncios. */
export const OmnibusB: React.FC<{ x0: number; y: number; v: number; s?: number }> = ({ x0, y, v, s = 1 }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  const giro = (f * v * 2.4) % 360;
  const rueda = (cx: number) => (
    <g transform={`translate(${cx} -40)`}>
      <circle r={42} fill={"#15181A"} />
      <circle r={30} fill={"#7A2A22"} />
      <g transform={`rotate(${giro})`}>
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <rect key={a} x={-2.5} y={-30} width={5} height={60} fill={"#15181A"} transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r={8} fill={"#C9A23A"} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={200} cy={0} rx={240} ry={12} fill="#000" opacity={0.2} />
      {/* pasajeros del imperial, detras del panel de anuncios */}
      {[30, 130, 230, 330].map((px, i) => (
        <g key={px} transform={`translate(${px} -262) scale(0.42)`}>
          <Persona x={0} y={60} semilla={300 + i} cuerpo="busto" />
        </g>
      ))}
      <rect x={0} y={-220} width={420} height={164} rx={8} fill={"#B23526"} />
      <rect x={0} y={-110} width={420} height={10} fill={"#8E271C"} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={22 + i * 74} y={-206} width={60} height={70} rx={4} fill={D.cristal} />
          <rect x={22 + i * 74} y={-206} width={24} height={70} rx={4} fill={D.cristalLuz} opacity={0.35} />
          <circle cx={46 + i * 74} cy={-178} r={10} fill={"#E2B892"} />
          <rect x={36 + i * 74} y={-212} width={20} height={10} rx={4} fill={"#1B1E20"} />
        </g>
      ))}
      <rect x={0} y={-130} width={420} height={16} fill={"#EFE3C4"} />
      <text x={210} y={-117} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={13} fill={"#B23526"} letterSpacing={4}>
        GENERAL
      </text>
      {/* imperial descubierto con sus anuncios */}
      <rect x={-6} y={-262} width={432} height={44} fill={"#EFE3C4"} />
      <rect x={-6} y={-262} width={432} height={6} fill={"#B23526"} />
      <text x={110} y={-232} textAnchor="middle" fontFamily={FONT.serif} fontSize={22} fill={"#2A3B5A"}>
        BANK · CHARING CROSS
      </text>
      <text x={320} y={-232} textAnchor="middle" fontFamily={FONT.serif} fontSize={22} fill={"#7A2A22"}>
        TEA · COCOA
      </text>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={i * 70} y={-300} width={5} height={40} fill={"#15181A"} />
      ))}
      <rect x={-6} y={-302} width={432} height={5} fill={"#15181A"} />
      {/* escalera trasera y plataforma */}
      <path d="M -6 -60 L -34 -60 Q -46 -160 -10 -262" fill="none" stroke={"#15181A"} strokeWidth={6} />
      <rect x={-40} y={-66} width={46} height={10} fill={"#15181A"} />
      {/* capo y radiador */}
      <rect x={420} y={-130} width={60} height={74} rx={6} fill={"#3A3E40"} />
      <rect x={474} y={-126} width={10} height={66} fill={D.laton} />
      {rueda(80)}
      {rueda(380)}
    </g>
  );
};

/** Coche de punto (hansom) con su caballo, hacia la izquierda si v < 0. */
export const Hansom: React.FC<{ x0: number; y: number; v: number; s?: number }> = ({ x0, y, v, s = 1 }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  const trote = Math.sin(f * 0.42);
  const giro = (f * v * 2.4) % 360;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (v < 0 ? -1 : 1)} ${s})`}>
      <ellipse cx={150} cy={0} rx={220} ry={10} fill="#000" opacity={0.18} />
      {/* caballo */}
      <g transform={`translate(230 ${-Math.abs(trote) * 4})`}>
        <path d="M 0 -150 Q 10 -176 60 -172 L 130 -168 Q 160 -164 160 -132 L 158 -104 Q 120 -94 70 -100 Q 10 -100 4 -118 Z" fill={"#5A3B28"} />
        <path d="M 140 -164 Q 160 -200 182 -232 L 206 -224 Q 196 -190 168 -132 Z" fill={"#5A3B28"} />
        <path d="M 182 -232 Q 214 -236 222 -214 L 214 -202 Q 196 -204 188 -210 Z" fill={"#5A3B28"} />
        <path d="M 150 -196 Q 160 -230 178 -236" fill="none" stroke={"#2A1A10"} strokeWidth={8} />
        <circle cx={204} cy={-222} r={3} fill={"#111"} />
        <path d="M 4 -140 Q -24 -126 -18 -86" fill="none" stroke={"#2A1A10"} strokeWidth={10} strokeLinecap="round" />
        {[20, 46, 112, 136].map((lx, i) => (
          <g key={lx} transform={`rotate(${(i % 2 === 0 ? 1 : -1) * trote * 14} ${lx + 6} -104)`}>
            <rect x={lx} y={-106} width={13} height={60} rx={5} fill={"#4A3020"} />
            <rect x={lx + 1} y={-50} width={11} height={44} rx={4} fill={"#4A3020"} />
            <rect x={lx - 1} y={-10} width={15} height={8} fill={"#1A1A1A"} />
          </g>
        ))}
        <path d="M 60 -172 L 70 -100" stroke={"#2A1A10"} strokeWidth={5} />
      </g>
      {/* cochero en el pescante de atras */}
      <g transform="translate(6 -224) scale(0.5)">
        <Persona x={0} y={20} semilla={77} cuerpo="busto" rasgos={rasgosDe(77, { sombrero: "chistera", abrigo: "#3A3530" })} />
      </g>
      {/* coche */}
      <path d="M 20 -230 L 150 -230 Q 170 -230 170 -200 L 170 -110 L 20 -110 Q 6 -170 20 -230 Z" fill={"#20302A"} />
      <rect x={34} y={-214} width={76} height={60} rx={6} fill={D.cristal} />
      <rect x={34} y={-214} width={30} height={60} rx={6} fill={D.cristalLuz} opacity={0.35} />
      <rect x={170} y={-128} width={84} height={6} fill={"#15181A"} />
      <path d="M 120 -110 L 160 -110 L 170 -60 L 130 -60 Z" fill={"#20302A"} />
      <g transform={`translate(110 -56) rotate(${giro})`}>
        <circle r={56} fill="none" stroke={"#15181A"} strokeWidth={8} />
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <rect key={a} x={-2} y={-54} width={4} height={108} fill={"#15181A"} transform={`rotate(${a})`} />
        ))}
        <circle r={7} fill={D.laton} />
      </g>
    </g>
  );
};

/** Chico de los periodicos con su cartel de ultima hora. */
export const Vendedor: React.FC<{ x: number; y: number; s?: number; cartel: string }> = ({ x, y, s = 1, cartel }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Persona x={0} y={0} escala={0.82} semilla={88} pose="habla" rasgos={rasgosDe(88, { sombrero: "gorra", edad: "joven", bigote: "ninguno", barba: "ninguna", abrigo: "#4A4237" })} />
    <g transform="translate(70 -10)">
      <rect x={0} y={-150} width={110} height={150} fill={"#2A1E16"} />
      <rect x={6} y={-144} width={98} height={138} fill={"#F2EDE0"} />
      <text x={55} y={-110} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={22} fill={D.tinta}>
        {cartel.split(" ")[0]}
      </text>
      <text x={55} y={-80} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={22} fill={D.carmin}>
        {cartel.split(" ").slice(1).join(" ")}
      </text>
      <rect x={14} y={-60} width={82} height={4} fill={"#B6AD96"} />
      <rect x={14} y={-48} width={60} height={4} fill={"#B6AD96"} />
    </g>
  </g>
);

/* ------------------------------------------------------------------ */
/* 1. El cruce del Banco: Banco de Inglaterra y Royal Exchange          */
/* ------------------------------------------------------------------ */

export const CruceBanco: React.FC<{ gente?: boolean }> = ({ gente = true }) => {
  const f = useCurrentFrame();
  const suelo = 820;
  return (
    <g>
      <Texturas />
      <rect x={-600} y={0} width={3200} height={suelo} fill="url(#cielo)" />
      {/* nubes */}
      {Array.from({ length: 5 }).map((_, i) => {
        const nx = ((i * 520 + f * 0.4) % 3000) - 600;
        return (
          <g key={i} transform={`translate(${nx} ${70 + (i % 3) * 60})`} opacity={0.8}>
            <rect x={0} y={20} width={260} height={34} rx={17} fill={"#FBF6EA"} />
            <rect x={50} y={0} width={130} height={44} rx={22} fill={"#FBF6EA"} />
          </g>
        );
      })}
      {/* ciudad lejana con chimeneas y la cupula de San Pablo */}
      <g fill={"#D6CAB0"}>
        {Array.from({ length: 22 }).map((_, i) => (
          <rect key={i} x={-600 + i * 150} y={suelo - 380 - ((i * 37) % 120)} width={140} height={400} />
        ))}
        <ellipse cx={1640} cy={300} rx={90} ry={80} />
        <rect x={1550} y={300} width={180} height={140} />
        <rect x={1632} y={170} width={16} height={60} />
      </g>
      {/* Banco de Inglaterra: el muro ciego de Soane */}
      <g>
        <rect x={-600} y={suelo - 420} width={1260} height={420} fill="url(#sillar)" />
        <rect x={-610} y={suelo - 440} width={1280} height={26} fill={D.piedraMedia} />
        <rect x={-610} y={suelo - 456} width={1280} height={18} fill={D.piedraSombra} />
        {Array.from({ length: 26 }).map((_, i) => (
          <rect key={i} x={-600 + i * 48} y={suelo - 490} width={14} height={34} fill={D.piedraMedia} />
        ))}
        <rect x={-610} y={suelo - 500} width={1280} height={12} fill={D.piedraSombra} />
        {Array.from({ length: 6 }).map((_, i) => {
          const cx = -480 + i * 210;
          return (
            <g key={i}>
              <Columna x={cx} y={suelo - 30} h={330} w={40} />
              <Columna x={cx + 70} y={suelo - 30} h={330} w={40} />
              <path d={`M ${cx + 112} ${suelo - 140} L ${cx + 112} ${suelo - 260} Q ${cx + 142} ${suelo - 300} ${cx + 172} ${suelo - 260} L ${cx + 172} ${suelo - 140} Z`} fill={D.piedraSombra} />
            </g>
          );
        })}
        <rect x={-610} y={suelo - 34} width={1280} height={34} fill={D.piedraSombra} />
      </g>
      {/* Royal Exchange: portico de ocho columnas y frontis con relieve */}
      <g>
        <rect x={720} y={suelo - 560} width={960} height={560} fill="url(#sillar)" />
        <rect x={760} y={suelo - 70} width={880} height={70} fill={D.piedraMedia} />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={740 + k * 10} y={suelo - 70 + k * 16} width={920 - k * 20} height={16} fill={k % 2 ? D.piedraSombra : D.piedraMedia} />
        ))}
        <rect x={800} y={suelo - 470} width={800} height={400} fill={D.piedraSombra} />
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <rect x={900 + k * 220} y={suelo - 300} width={100} height={230} fill={"#2A2F2E"} />
            <path d={`M ${900 + k * 220} ${suelo - 300} Q ${950 + k * 220} ${suelo - 350} ${1000 + k * 220} ${suelo - 300} Z`} fill={"#2A2F2E"} />
          </g>
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <Columna key={i} x={820 + i * 108} y={suelo - 70} h={400} w={52} />
        ))}
        <rect x={770} y={suelo - 520} width={860} height={44} fill={D.piedra} />
        <text x={1200} y={suelo - 488} textAnchor="middle" fontFamily={FONT.serif} fontSize={26} letterSpacing={10} fill={D.piedraOscura}>
          ROYAL EXCHANGE
        </text>
        <rect x={750} y={suelo - 538} width={900} height={20} fill={D.piedraMedia} />
        <polygon points={`740,${suelo - 538} 1200,${suelo - 700} 1660,${suelo - 538}`} fill={D.piedra} stroke={D.piedraMedia} strokeWidth={14} />
        {/* relieve del frontis: figuras alineadas */}
        {Array.from({ length: 13 }).map((_, i) => {
          const fx = 860 + i * 52;
          const alto = 40 + (1 - Math.abs(i - 6) / 6) * 60;
          return (
            <g key={i} fill={D.piedraMedia}>
              <circle cx={fx} cy={suelo - 550 - alto + 8} r={8} />
              <rect x={fx - 9} y={suelo - 550 - alto + 16} width={18} height={alto - 16} rx={5} />
            </g>
          );
        })}
      </g>
      {/* estatua ecuestre de Wellington */}
      <g transform={`translate(560 ${suelo + 20})`}>
        <rect x={-90} y={-60} width={180} height={60} fill={D.piedraMedia} />
        <rect x={-70} y={-220} width={140} height={160} fill={D.piedra} />
        <rect x={-80} y={-232} width={160} height={14} fill={D.piedraMedia} />
        <g fill={D.bronce}>
          <path d="M -70 -300 Q -60 -330 -10 -326 L 50 -322 Q 76 -318 78 -294 L 76 -268 Q 40 -260 -10 -264 Q -60 -264 -66 -280 Z" />
          <path d="M 60 -318 Q 76 -350 90 -372 L 110 -364 Q 100 -336 80 -296 Z" />
          <path d="M 90 -372 Q 118 -376 124 -356 L 116 -346 Q 100 -350 94 -354 Z" />
          {[-56, -32, 40, 62].map((lx, i) => (
            <rect key={lx} x={lx} y={-270} width={11} height={40} rx={4} transform={`rotate(${i === 3 ? -28 : 0} ${lx + 5} -268)`} />
          ))}
          <path d="M -66 -294 Q -90 -280 -86 -246" fill="none" stroke={D.bronce} strokeWidth={9} />
          {/* jinete */}
          <rect x={-6} y={-376} width={30} height={60} rx={10} />
          <circle cx={9} cy={-390} r={13} />
          <path d="M -8 -398 L 26 -398 L 20 -412 L -2 -412 Z" />
          <rect x={0} y={-332} width={11} height={36} rx={4} transform="rotate(16 5 -330)" />
        </g>
        <path d="M -60 -300 Q -40 -312 0 -310" fill="none" stroke={D.bronceLuz} strokeWidth={3} />
      </g>
      {/* edificio de oficinas a la derecha, con tienda en la planta baja */}
      <g>
        <rect x={1700} y={suelo - 640} width={700} height={640} fill="url(#ladrillo)" />
        <rect x={1690} y={suelo - 660} width={720} height={24} fill={D.piedraMedia} />
        {Array.from({ length: 4 }).map((_, c) =>
          Array.from({ length: 4 }).map((_, fl) => <Ventana key={`${c}-${fl}`} x={1740 + c * 160} y={suelo - 620 + fl * 120} w={80} h={84} frontis={fl === 0} />)
        )}
        <rect x={1700} y={suelo - 150} width={700} height={150} fill={"#2C2A26"} />
        <RotuloTienda x={1730} y={suelo - 200} w={420} texto="WINE & SPIRITS" />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={1730 + k * 140} y={suelo - 130} width={110} height={110} fill={D.cristal} />
        ))}
        <path d={`M 1700 ${suelo - 160} L 2400 ${suelo - 160} L 2380 ${suelo - 110} L 1720 ${suelo - 110} Z`} fill={"#7A2A22"} />
        {Array.from({ length: 12 }).map((_, k) => (
          <rect key={k} x={1720 + k * 56} y={suelo - 160} width={28} height={50} fill={"#E9DCC0"} opacity={0.5} />
        ))}
      </g>
      {/* acera y calzada de adoquin */}
      <rect x={-600} y={suelo} width={3200} height={30} fill={D.acera} />
      <rect x={-600} y={suelo + 30} width={3200} height={8} fill={D.piedraOscura} />
      <rect x={-600} y={suelo + 38} width={3200} height={300} fill="url(#adoquin)" />
      <rect x={-600} y={suelo + 38} width={3200} height={300} fill={"#000"} opacity={0.08} />
      {/* farolas */}
      {[-300, 440, 1660, 2200].map((fx) => (
        <Farola key={fx} x={fx} y={suelo + 26} />
      ))}
      {gente ? (
        <g>
          {Array.from({ length: 10 }).map((_, i) => (
            <Transeunte key={`b${i}`} x0={-400 + ((i * 263) % 2600)} y={suelo + 22} v={(i % 2 ? -1 : 1) * (1.4 + (i % 3) * 0.3)} escala={0.62} semilla={100 + i} periodico={i % 4 === 1} baston={i % 5 === 3} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 2. Sala del banco con la pizarra del tipo                           */
/* ------------------------------------------------------------------ */

/**
 * Sala de un banco con la pizarra del dia. `cifra` es lo escrito con tiza y
 * `escrito` (0-1) cuanto de esa cifra ha escrito ya el oficinista.
 */
export const SalaBanco: React.FC<{
  titulo: string;
  sub: string;
  cifra: string;
  escrito: number;
  fecha?: string;
  tono?: "londres" | "nuevayork";
  publico?: number;
}> = ({ titulo, sub, cifra, escrito, fecha, tono = "londres", publico = 0 }) => {
  const f = useCurrentFrame();
  const pared = tono === "londres" ? "#5E4A38" : "#4B4A3E";
  return (
    <g>
      <Texturas />
      <rect x={-600} y={-200} width={3200} height={1500} fill={pared} />
      {/* boiserie */}
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i}>
          <rect x={-560 + i * 280} y={560} width={250} height={300} rx={6} fill={D.maderaMedia} />
          <rect x={-540 + i * 280} y={580} width={210} height={260} rx={4} fill="none" stroke={D.madera} strokeWidth={4} />
        </g>
      ))}
      {/* ventanales con la luz entrando */}
      {[-380, 1820].map((vx) => (
        <g key={vx}>
          <rect x={vx} y={40} width={300} height={460} fill={"#E9D9AE"} />
          <path d={`M ${vx} 40 Q ${vx + 150} -60 ${vx + 300} 40 Z`} fill={"#E9D9AE"} />
          <path d={`M ${vx + 150} -20 V 500 M ${vx} 200 H ${vx + 300} M ${vx} 350 H ${vx + 300}`} stroke={D.madera} strokeWidth={8} />
          <rect x={vx - 14} y={490} width={328} height={20} fill={D.maderaLuz} />
        </g>
      ))}
      <polygon points="-380,40 -80,40 900,1080 120,1080" fill="url(#luzVentana)" />
      {/* motas de polvo en la luz */}
      {Array.from({ length: 26 }).map((_, i) => {
        const px = -200 + ((i * 97 + f * 0.6) % 900);
        const py = 160 + ((i * 53 + f * 0.9) % 760);
        return <circle key={i} cx={px + (py - 160) * 0.5} cy={py} r={1.8 + (i % 3)} fill={"#FFF3D2"} opacity={0.35} />;
      })}
      {/* reloj de pared */}
      <g transform="translate(1560 210)">
        <circle r={84} fill={D.madera} />
        <circle r={70} fill={"#F2ECDD"} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-2} y={-64} width={4} height={10} fill={D.tinta} transform={`rotate(${i * 30})`} />
        ))}
        <rect x={-3} y={-44} width={6} height={46} fill={D.tinta} transform={`rotate(${110 + f * 0.05})`} />
        <rect x={-2} y={-58} width={4} height={60} fill={D.tinta} transform={`rotate(${f * 0.6})`} />
        <circle r={6} fill={D.laton} />
      </g>
      {/* pizarra */}
      <g>
        <rect x={420} y={90} width={1000} height={560} rx={8} fill={D.madera} />
        <rect x={440} y={110} width={960} height={520} fill={D.pizarra} />
        <rect x={440} y={110} width={960} height={520} fill={"#FFFFFF"} opacity={0.03} />
        <path d="M 470 560 Q 600 540 720 570 M 1100 160 Q 1200 150 1350 175" stroke={"#FFFFFF"} strokeWidth={10} opacity={0.04} fill="none" />
        <text x={920} y={190} textAnchor="middle" fontFamily={FONT.serif} fontSize={56} letterSpacing={8} fill={D.tiza}>
          {titulo}
        </text>
        <text x={920} y={240} textAnchor="middle" fontFamily={FONT.serif} fontSize={32} letterSpacing={4} fill={"#BFC6BE"}>
          {sub}
        </text>
        <line x1={540} y1={262} x2={1300} y2={262} stroke={D.tiza} strokeWidth={3} opacity={0.6} />
        <defs>
          <clipPath id="tizaEscrita">
            <rect x={440} y={260} width={960 * escrito} height={300} />
          </clipPath>
        </defs>
        <text x={920} y={500} textAnchor="middle" fontFamily={FONT.serif} fontSize={230} fill={D.tiza} clipPath="url(#tizaEscrita)">
          {cifra}
        </text>
        {fecha ? (
          <text x={920} y={600} textAnchor="middle" fontFamily={FONT.serif} fontSize={38} letterSpacing={6} fill={"#E7C979"}>
            {fecha}
          </text>
        ) : null}
        <rect x={430} y={632} width={980} height={14} fill={D.maderaLuz} />
        <rect x={1240} y={624} width={50} height={10} fill={D.tiza} />
      </g>
      {/* lamparas colgantes */}
      {[200, 920, 1640].map((lx) => (
        <g key={lx}>
          <rect x={lx - 2} y={-200} width={4} height={250} fill={"#1E2224"} />
          <path d={`M ${lx - 46} 70 L ${lx + 46} 70 L ${lx + 24} 40 L ${lx - 24} 40 Z`} fill={D.verdeBanco} />
          <ellipse cx={lx} cy={72} rx={40} ry={6} fill={"#FFE7AE"} />
          <circle cx={lx} cy={160} r={160} fill="url(#lampara)" />
        </g>
      ))}
      {/* suelo y mostrador */}
      <rect x={-600} y={860} width={3200} height={400} fill="url(#parquet)" />
      <rect x={-600} y={860} width={3200} height={10} fill={D.madera} />
      {/* publico que mira la pizarra, de espaldas a la camara no: de frente, mirando arriba */}
      {Array.from({ length: publico }).map((_, i) => (
        <Persona
          key={i}
          x={140 + i * (1640 / Math.max(1, publico - 1))}
          y={1120 + (i % 2) * 30}
          escala={1.05}
          semilla={500 + i}
          pose={i % 4 === 1 ? "senala" : i % 4 === 2 ? "lee" : "quieto"}
          gesto={i % 3 === 0 ? "inquieto" : "sorpresa"}
          habla={i % 3 === 1}
          mirada={i % 2 ? 0.6 : -0.6}
        />
      ))}
    </g>
  );
};

/** Escalera y oficinista que escribe en la pizarra. */
export const Escribiente: React.FC<{ x: number; y: number; s?: number; semilla?: number }> = ({ x, y, s = 1, semilla = 41 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g stroke={D.maderaLuz} strokeWidth={14}>
      <line x1={-110} y1={0} x2={-40} y2={-560} />
      <line x1={40} y1={0} x2={-10} y2={-560} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={-104 + i * 7.5} y1={-50 - i * 58} x2={34 - i * 5.4} y2={-50 - i * 58} />
      ))}
    </g>
    <Persona x={-20} y={-300} semilla={semilla} pose="senala" escala={0.95} espejo rasgos={rasgosDe(semilla, { sombrero: "ninguno", abrigo: "#2A2E30", chaleco: "#4A4F52" })} mirada={0.8} />
  </g>
);

/* ------------------------------------------------------------------ */
/* 3. Throgmorton Street: la puerta de la Bolsa de Londres              */
/* ------------------------------------------------------------------ */

export const PuertaBolsa: React.FC<{ cierre: number; aviso: number; corredores?: number }> = ({ cierre, aviso, corredores = 7 }) => {
  const suelo = 860;
  const hoja = 150 * (0.06 + 0.94 * cierre);
  return (
    <g>
      <Texturas />
      <rect x={-600} y={-200} width={3200} height={1300} fill="url(#cielo)" />
      {/* calle estrecha: edificios altos a ambos lados */}
      <rect x={-600} y={-200} width={700} height={suelo + 200} fill="url(#ladrillo)" />
      <rect x={1820} y={-200} width={700} height={suelo + 200} fill="url(#ladrillo)" />
      {[-560, -380, -200].map((vx) =>
        [-120, 80, 280, 480].map((vy) => <Ventana key={`${vx}${vy}`} x={vx} y={vy} w={110} h={130} />)
      )}
      {[1880, 2060, 2240].map((vx) =>
        [-120, 80, 280, 480].map((vy) => <Ventana key={`${vx}${vy}`} x={vx} y={vy} w={110} h={130} />)
      )}
      {/* fachada de piedra de la Bolsa */}
      <rect x={100} y={-200} width={1720} height={suelo + 200} fill="url(#sillar)" />
      {[260, 1460].map((vx) => (
        <g key={vx}>
          <Ventana x={vx} y={-60} w={150} h={210} frontis />
          <Ventana x={vx} y={260} w={150} h={210} />
        </g>
      ))}
      <rect x={90} y={-30} width={1740} height={22} fill={D.piedraMedia} />
      {/* gran portada con arco */}
      <g>
        <rect x={600} y={60} width={720} height={suelo - 60} fill={D.piedraMedia} />
        <path d={`M 660 ${suelo} L 660 330 Q 960 80 1260 330 L 1260 ${suelo} Z`} fill={"#2A2724"} />
        <Columna x={630} y={suelo} h={640} w={56} />
        <Columna x={1290} y={suelo} h={640} w={56} />
        <rect x={580} y={170} width={760} height={46} fill={D.piedra} />
        <text x={960} y={203} textAnchor="middle" fontFamily={FONT.serif} fontSize={30} letterSpacing={12} fill={D.piedraOscura}>
          THE STOCK EXCHANGE
        </text>
        {/* puertas de roble: dos hojas que se cierran */}
        <rect x={810} y={460} width={300} height={suelo - 460} fill={"#141210"} />
        <g>
          <rect x={810} y={460} width={hoja} height={suelo - 460} fill={"#4A3020"} />
          <rect x={1110 - hoja} y={460} width={hoja} height={suelo - 460} fill={"#4A3020"} />
          {cierre > 0.5
            ? [0, 1].map((k) => (
                <g key={k} transform={`translate(${k === 0 ? 810 : 1110 - hoja} 0)`}>
                  {[0, 1, 2].map((q) => (
                    <rect key={q} x={14} y={480 + q * 128} width={hoja - 28} height={108} fill="none" stroke={"#2E1C12"} strokeWidth={6} />
                  ))}
                </g>
              ))
            : null}
          <circle cx={950} cy={660} r={7} fill={D.laton} opacity={cierre > 0.9 ? 1 : 0} />
          <circle cx={970} cy={660} r={7} fill={D.laton} opacity={cierre > 0.9 ? 1 : 0} />
        </g>
        {/* aviso clavado en la puerta */}
        <g opacity={aviso} transform={`translate(960 ${590 - (1 - aviso) * 20})`}>
          <rect x={-110} y={-70} width={220} height={150} fill={"#F3EDDC"} />
          <text x={0} y={-24} textAnchor="middle" fontFamily={FONT.serif} fontSize={22} fill={D.tinta}>
            NOTICE
          </text>
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT.serif} fontSize={40} fill={D.carmin}>
            CLOSED
          </text>
          <rect x={-80} y={42} width={160} height={4} fill={"#B6AD96"} />
          <rect x={-60} y={54} width={120} height={4} fill={"#B6AD96"} />
          <circle cx={-100} cy={-60} r={4} fill={D.laton} />
          <circle cx={100} cy={-60} r={4} fill={D.laton} />
        </g>
      </g>
      {/* escalinata */}
      {[0, 1, 2].map((k) => (
        <rect key={k} x={560 - k * 20} y={suelo + k * 14} width={800 + k * 40} height={14} fill={k % 2 ? D.piedraSombra : D.piedraMedia} />
      ))}
      <rect x={-600} y={suelo + 42} width={3200} height={300} fill="url(#adoquin)" />
      {/* corredores a la puerta */}
      {Array.from({ length: corredores }).map((_, i) => {
        const lado = i % 2 ? 1 : -1;
        const px = 960 + lado * (330 + Math.floor(i / 2) * 170);
        return (
          <Persona
            key={i}
            x={px}
            y={1060 + (i % 3) * 18}
            escala={1.12}
            semilla={600 + i}
            pose={i === 1 ? "lee" : i === 2 ? "habla" : i === 4 ? "brazos" : i === 5 ? "telegrama" : "quieto"}
            gesto={i % 2 ? "inquieto" : "serio"}
            mirada={lado * -0.7}
          />
        );
      })}
    </g>
  );
};

/** El portero de la Bolsa, con librea. */
export const Portero: React.FC<{ x: number; y: number; s?: number; pose?: "quieto" | "senala" | "brazos" }> = ({ x, y, s = 1, pose = "quieto" }) => (
  <Persona x={x} y={y} escala={s} semilla={9} pose={pose} gesto="serio" rasgos={rasgosDe(9, { librea: true, sombrero: "chistera", bigote: "morsa", edad: "mayor" })} />
);

/* ------------------------------------------------------------------ */
/* 4. Broad Street: la Bolsa de Nueva York                             */
/* ------------------------------------------------------------------ */

export const BolsaNuevaYork: React.FC<{ cierre: number }> = ({ cierre }) => {
  const f = useCurrentFrame();
  const suelo = 880;
  return (
    <g>
      <Texturas />
      <rect x={-600} y={-300} width={3200} height={1400} fill={"#E4DCC9"} />
      {/* rascacielos de Wall Street al fondo */}
      <g fill={"#CFC4AC"}>
        <rect x={-500} y={-300} width={360} height={suelo + 300} />
        <rect x={1900} y={-260} width={420} height={suelo + 260} />
        <rect x={-120} y={-120} width={200} height={suelo + 120} />
      </g>
      {[-480, -380, -280].map((vx) =>
        Array.from({ length: 9 }).map((_, k) => <rect key={`${vx}${k}`} x={vx} y={-260 + k * 110} width={60} height={70} fill={"#B8AD95"} />)
      )}
      {/* la fachada de 1903 */}
      <rect x={180} y={-80} width={1560} height={suelo + 80} fill="url(#sillar)" />
      <rect x={260} y={70} width={1400} height={suelo - 140} fill={D.piedraSombra} />
      {/* ventanal de cristal tras las columnas */}
      <rect x={340} y={120} width={1240} height={520} fill={D.cristal} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={340 + i * 103} y={120} width={6} height={520} fill={D.piedraMedia} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={340} y={120 + i * 86} width={1240} height={5} fill={D.piedraMedia} />
      ))}
      {/* puertas bajo el ventanal */}
      {[0, 1, 2, 3, 4].map((k) => {
        const dx = 400 + k * 240;
        const hoja = 60 * (0.08 + 0.92 * cierre);
        return (
          <g key={k}>
            <rect x={dx} y={660} width={120} height={160} fill={"#141210"} />
            <rect x={dx} y={660} width={hoja} height={160} fill={"#3A2A1E"} />
            <rect x={dx + 120 - hoja} y={660} width={hoja} height={160} fill={"#3A2A1E"} />
          </g>
        );
      })}
      {Array.from({ length: 6 }).map((_, i) => (
        <Columna key={i} x={330 + i * 252} y={suelo - 60} h={720} w={84} />
      ))}
      <rect x={160} y={-120} width={1600} height={60} fill={D.piedra} />
      <polygon points={`150,-120 960,-330 1770,-120`} fill={D.piedra} stroke={D.piedraMedia} strokeWidth={18} />
      {/* grupo escultorico del frontis */}
      {Array.from({ length: 11 }).map((_, i) => {
        const fx = 520 + i * 88;
        const alto = 50 + (1 - Math.abs(i - 5) / 5) * 90;
        return (
          <g key={i} fill={D.piedraMedia}>
            <circle cx={fx} cy={-130 - alto + 12} r={12} />
            <rect x={fx - 14} y={-130 - alto + 24} width={28} height={alto - 24} rx={8} />
          </g>
        );
      })}
      {/* banderas */}
      {[200, 1720].map((bx, k) => {
        const ond = Math.sin(f * 0.15 + k) * 6;
        return (
          <g key={bx}>
            <rect x={bx} y={-420} width={8} height={320} fill={"#2A2E30"} />
            <path d={`M ${bx + 8} -410 Q ${bx + 80} ${-420 + ond} ${bx + 150} -410 L ${bx + 150} -320 Q ${bx + 80} ${-330 + ond} ${bx + 8} -320 Z`} fill={"#B23526"} />
            {[0, 2, 4].map((st) => (
              <path key={st} d={`M ${bx + 8} ${-410 + st * 16 + 8} Q ${bx + 80} ${-420 + st * 16 + 8 + ond} ${bx + 150} ${-410 + st * 16 + 8} L ${bx + 150} ${-410 + st * 16 + 16} Q ${bx + 80} ${-420 + st * 16 + 16 + ond} ${bx + 8} ${-410 + st * 16 + 16} Z`} fill={"#F2EDE2"} />
            ))}
            <rect x={bx + 8} y={-410} width={60} height={46} fill={"#23365E"} />
          </g>
        );
      })}
      <rect x={140} y={suelo - 60} width={1640} height={60} fill={D.piedraMedia} />
      <rect x={-600} y={suelo} width={3200} height={30} fill={D.acera} />
      <rect x={-600} y={suelo + 30} width={3200} height={300} fill="url(#adoquin)" />
      {Array.from({ length: 9 }).map((_, i) => (
        <Transeunte key={i} x0={-300 + ((i * 331) % 2400)} y={suelo + 26} v={(i % 2 ? -1 : 1) * 1.3} escala={0.7} semilla={700 + i} periodico={i % 3 === 0} />
      ))}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Despacho: calendario, reloj, telefono                             */
/* ------------------------------------------------------------------ */

const MESES = ["AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER", "JANUARY"];

export const Despacho: React.FC<{ mes: number; hoja: number; anio?: string; mapa?: boolean; cable?: boolean }> = ({ mes, hoja, anio, mapa, cable }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <Texturas />
      <rect x={-600} y={-200} width={3200} height={1400} fill={"#6B5644"} />
      {/* papel pintado con rayas */}
      {Array.from({ length: 60 }).map((_, i) => (
        <rect key={i} x={-600 + i * 56} y={-200} width={20} height={800} fill={"#755F4B"} />
      ))}
      <rect x={-600} y={600} width={3200} height={20} fill={D.maderaLuz} />
      <rect x={-600} y={620} width={3200} height={600} fill={D.maderaMedia} />
      {/* ventana con la City */}
      <g>
        <rect x={1280} y={60} width={480} height={460} fill={"#D8CDB4"} />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={1300 + k * 115} y={300 - (k % 2) * 80} width={100} height={220 + (k % 2) * 80} fill={"#BFB298"} />
        ))}
        <path d="M 1520 60 V 520 M 1280 290 H 1760" stroke={"#3A2A1E"} strokeWidth={14} />
        <rect x={1264} y={44} width={512} height={492} fill="none" stroke={"#3A2A1E"} strokeWidth={18} />
        <path d="M 1250 40 Q 1300 300 1250 560 L 1210 560 L 1210 40 Z" fill={"#6E2A22"} />
        <path d="M 1790 40 Q 1740 300 1790 560 L 1830 560 L 1830 40 Z" fill={"#6E2A22"} />
      </g>
      {/* calendario de taco */}
      <g transform="translate(300 120)">
        <rect x={-10} y={-10} width={300} height={380} fill={"#3A2A1E"} />
        <rect x={0} y={0} width={280} height={360} fill={"#F4EEDF"} />
        <rect x={0} y={0} width={280} height={84} fill={D.carmin} />
        <text x={140} y={58} textAnchor="middle" fontFamily={FONT.serif} fontSize={38} letterSpacing={4} fill={"#F4EEDF"}>
          {MESES[mes]}
        </text>
        <text x={140} y={250} textAnchor="middle" fontFamily={FONT.serif} fontSize={150} fill={D.tinta}>
          {anio ?? "1914"}
        </text>
        {hoja > 0 && hoja < 1 ? (
          <g transform={`translate(${hoja * 260} ${-hoja * 180}) rotate(${hoja * 50})`} opacity={1 - hoja}>
            <rect x={0} y={0} width={280} height={360} fill={"#F4EEDF"} />
            <rect x={0} y={0} width={280} height={84} fill={D.carmin} />
          </g>
        ) : null}
      </g>
      {/* reloj */}
      <g transform="translate(860 230)">
        <circle r={96} fill={"#3A2A1E"} />
        <circle r={80} fill={"#F2ECDD"} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-2} y={-74} width={4} height={12} fill={D.tinta} transform={`rotate(${i * 30})`} />
        ))}
        <rect x={-3} y={-50} width={6} height={52} fill={D.tinta} transform={`rotate(${f * 4})`} />
        <rect x={-2} y={-66} width={4} height={68} fill={D.carmin} transform={`rotate(${f * 48})`} />
        <circle r={7} fill={D.laton} />
      </g>
      {mapa ? (
        <g transform="translate(-40 60)">
          <rect x={-200} y={0} width={420} height={300} fill={"#E7DCC2"} stroke={"#3A2A1E"} strokeWidth={12} />
          <path d="M -180 60 Q -120 40 -90 120 Q -110 200 -160 260 L -190 260 Z" fill={"#C9B994"} />
          <path d="M 120 40 Q 180 20 200 80 L 200 220 Q 150 240 130 170 Q 110 120 120 40 Z" fill={"#C9B994"} />
          <path d="M -120 150 Q 20 40 150 110" fill="none" stroke={D.carmin} strokeWidth={5} strokeDasharray="12 8" />
          <circle cx={-120} cy={150} r={8} fill={D.tinta} />
          <circle cx={150} cy={110} r={8} fill={D.tinta} />
        </g>
      ) : null}
      {/* mesa de despacho */}
      <rect x={-200} y={760} width={2300} height={40} fill={D.maderaLuz} />
      <rect x={-200} y={800} width={2300} height={400} fill={D.madera} />
      {/* telefono de candelero */}
      <g transform="translate(1180 760)">
        <rect x={-34} y={-8} width={68} height={8} fill={"#15181A"} />
        <rect x={-8} y={-150} width={16} height={142} fill={"#15181A"} />
        <path d="M -26 -170 L 26 -170 L 18 -150 L -18 -150 Z" fill={"#15181A"} />
        <rect x={20} y={-120} width={14} height={60} rx={6} fill={"#15181A"} />
      </g>
      {/* tintero, papeles, libro mayor */}
      <rect x={420} y={730} width={240} height={34} fill={"#3E2B1E"} />
      <rect x={430} y={724} width={220} height={10} fill={"#E9E1CE"} />
      <rect x={700} y={744} width={180} height={18} fill={"#F2EDE0"} transform="rotate(-4 790 750)" />
      <g transform="translate(940 742)">
        <rect x={-18} y={-20} width={36} height={22} fill={"#1E2224"} />
        <rect x={-3} y={-70} width={3} height={52} fill={"#E9E1CE"} transform="rotate(16)" />
      </g>
      {cable ? (
        <g transform="translate(140 760)">
          <rect x={-90} y={-14} width={180} height={14} fill={"#3A2A1E"} />
          <rect x={-70} y={-56} width={60} height={42} fill={D.laton} />
          <rect x={10} y={-34} width={70} height={10} fill={"#15181A"} transform={`rotate(${Math.sin(f * 1.6) > 0.6 ? -6 : 0} 10 -30)`} />
          <circle cx={74} cy={-36} r={8} fill={"#15181A"} />
          <path d={`M -10 -20 Q -60 ${20 + (f % 40)} -140 40`} fill="none" stroke={"#F2E7C4"} strokeWidth={14} />
        </g>
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 6. Sala de juntas                                                   */
/* ------------------------------------------------------------------ */

export const SalaJuntas: React.FC<{ cifra: string; giro: number; hablando?: boolean }> = ({ cifra, giro, hablando }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <Texturas />
      <rect x={-600} y={-200} width={3200} height={1400} fill={"#3B2C24"} />
      {Array.from({ length: 14 }).map((_, i) => (
        <g key={i}>
          <rect x={-580 + i * 230} y={-180} width={200} height={760} rx={4} fill={"#46342A"} />
          <rect x={-560 + i * 230} y={-160} width={160} height={720} rx={4} fill="none" stroke={"#33251D"} strokeWidth={4} />
        </g>
      ))}
      {/* retratos de los fundadores en la pared */}
      {[140, 1560].map((px, k) => (
        <g key={px} transform={`translate(${px} 120)`}>
          <rect x={-120} y={-150} width={240} height={300} fill={D.laton} />
          <rect x={-104} y={-134} width={208} height={268} fill={"#3E3A30"} />
          <clipPath id={`retrato${k}`}>
            <rect x={-104} y={-134} width={208} height={268} />
          </clipPath>
          <g clipPath={`url(#retrato${k})`}>
          <g transform="translate(0 150) scale(0.62)">
            <Persona x={0} y={0} semilla={900 + k} cuerpo="busto" rasgos={rasgosDe(900 + k, { edad: "mayor", sombrero: "ninguno", barba: k ? "completa" : "patillas" })} />
          </g>
          </g>
        </g>
      ))}
      {/* tablero con el cambio */}
      <g transform="translate(560 130)">
        <rect x={-300} y={-110} width={600} height={210} rx={10} fill={"#1E2224"} />
        <text x={-250} y={30} fontFamily={FONT.serif} fontSize={90} fill={D.tiza}>
          £1 = $
        </text>
        <g transform={`translate(110 0) scale(1 ${Math.max(0.05, Math.abs(Math.cos(giro * Math.PI)))})`}>
          <text x={0} y={30} fontFamily={FONT.mono} fontSize={110} fill={"#E7C979"}>
            {cifra}
          </text>
        </g>
      </g>
      {/* lampara de techo */}
      <rect x={958} y={-200} width={4} height={420} fill={"#1E2224"} />
      <path d="M 880 230 L 1040 230 L 1000 190 L 920 190 Z" fill={D.verdeBanco} />
      <polygon points="960,230 420,1080 1500,1080" fill={"#FFE7AE"} opacity={0.08} />
      {/* banqueros alrededor de la mesa: los de atras de frente, el que habla de pie */}
      {[620, 820, 1100, 1300].map((bx, i) => (
        <Persona key={bx} x={bx} y={900} escala={1.15} semilla={950 + i} cuerpo="busto" gesto={i === 1 ? "serio" : "neutro"} mirada={bx < 960 ? 0.7 : -0.7} rasgos={rasgosDe(950 + i, { sombrero: "ninguno" })} />
      ))}
      <Persona x={1560} y={1060} escala={1.25} semilla={960} pose={hablando ? "habla" : "quieto"} gesto="serio" mirada={-0.8} rasgos={rasgosDe(960, { sombrero: "ninguno", edad: "mayor", bigote: "morsa" })} />
      <rect x={380} y={760} width={1100} height={40} rx={8} fill={D.maderaLuz} />
      <rect x={410} y={800} width={1040} height={300} fill={D.madera} />
      {[540, 760, 1040, 1260].map((px, i) => (
        <rect key={px} x={px} y={742} width={130} height={20} fill={"#EFE8D6"} transform={`rotate(${(i % 2 ? 1 : -1) * 4} ${px + 65} 752)`} />
      ))}
      <g transform="translate(760 754)">
        <ellipse cx={0} cy={0} rx={30} ry={8} fill={"#2A2E30"} />
        <rect x={20} y={-8} width={44} height={8} rx={4} fill={"#6B4A2E"} />
        <circle cx={64} cy={-4} r={4} fill={"#E8823A"} />
      </g>
      {/* humo de puro */}
      {Array.from({ length: 8 }).map((_, i) => {
        const t = ((f + i * 18) % 140) / 140;
        return <circle key={i} cx={824 + Math.sin(t * 6 + i) * 30} cy={740 - t * 400} r={18 + t * 40} fill={"#D9D2C4"} opacity={0.18 * (1 - t)} />;
      })}
    </g>
  );
};
