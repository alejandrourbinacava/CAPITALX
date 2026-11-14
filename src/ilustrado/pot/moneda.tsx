import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../../theme";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, TexturasPot, Vela, osc, rr } from "./comun";
import { Frente, Perfil } from "./Gente";

/**
 * La Caja Real y los talleres de la Casa de Moneda de Potosi: el arca de tres
 * llaves, las barras apiladas, la romana que pesa la barra, los oficiales
 * reales con el libro del quinto; y al otro lado, los que cortan la barra en
 * trozos, el que golpea la moneda entre dos cunos y el ensayador con su
 * balanza.
 */

/** Balanza de platillos que oscila hasta equilibrarse. */
export const Balanza: React.FC<{ x: number; y: number; s?: number; izq?: React.ReactNode; der?: React.ReactNode; color?: string }> = ({ x, y, s = 1, izq, der, color = "#B08A3A" }) => {
  const f = useCurrentFrame();
  const a = Math.sin(f * 0.08) * 8 * Math.exp(-f / 160);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-60} y={-8} width={120} height={14} rx={4} fill={osc(color, 0.7)} />
      <rect x={-6} y={-240} width={12} height={236} fill={color} />
      <circle cx={0} cy={-240} r={10} fill={osc(color, 0.8)} />
      <g transform={`rotate(${a} 0 -240)`}>
        <rect x={-150} y={-246} width={300} height={10} rx={4} fill={color} />
        {[-140, 140].map((px) => {
          const contenido = px < 0 ? izq : der;
          return (
            <g key={px} transform={`translate(${px} -240) rotate(${-a})`}>
              <path d="M 0 0 L -50 110 M 0 0 L 50 110" stroke={osc(color, 0.8)} strokeWidth={3} />
              <path d="M -60 110 Q 0 140 60 110 Z" fill={color} />
              <g transform="translate(0 112)">{contenido}</g>
            </g>
          );
        })}
      </g>
    </g>
  );
};

/** Barra de plata con sus marcas. */
export const Barra: React.FC<{ x: number; y: number; s?: number; giro?: number }> = ({ x, y, s = 1, giro = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${giro})`}>
    <path d="M -80 0 L -70 -26 L 70 -26 L 80 0 Z" fill={C.plataLuz} />
    <path d="M -80 0 L 80 0 L 76 10 L -76 10 Z" fill={C.plataSombra} />
    <rect x={-50} y={-22} width={18} height={14} rx={2} fill="none" stroke={C.plataSombra} strokeWidth={2} />
    <circle cx={0} cy={-15} r={7} fill="none" stroke={C.plataSombra} strokeWidth={2} />
    <rect x={26} y={-22} width={22} height={14} rx={2} fill="none" stroke={C.plataSombra} strokeWidth={2} />
  </g>
);

/** Escudo real simplificado: cuartelado con castillos y leones sugeridos. */
const Escudo: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 -60 L 60 -60 L 60 20 Q 60 70 0 86 Q -60 70 -60 20 Z" fill={"#EDE3C8"} stroke={C.oro} strokeWidth={5} />
    <rect x={-60} y={-60} width={60} height={70} fill={"#B2392A"} />
    <rect x={0} y={10} width={60} height={60} fill={"#B2392A"} />
    {/* castillos */}
    {[[-30, -20], [30, 46]].map(([cx, cy], i) => (
      <g key={i} fill={C.ocre}>
        <rect x={cx - 16} y={cy - 10} width={32} height={22} />
        <rect x={cx - 18} y={cy - 22} width={8} height={12} />
        <rect x={cx - 4} y={cy - 26} width={8} height={16} />
        <rect x={cx + 10} y={cy - 22} width={8} height={12} />
      </g>
    ))}
    {/* leones sugeridos */}
    {[[30, -24], [-30, 44]].map(([cx, cy], i) => (
      <path key={i} d={`M ${cx - 16} ${cy + 16} L ${cx - 12} ${cy - 6} Q ${cx - 6} ${cy - 20} ${cx + 6} ${cy - 16} L ${cx + 14} ${cy - 6} L ${cx + 8} ${cy} L ${cx + 14} ${cy + 16} Z`} fill={"#7A3A8A"} />
    ))}
    <path d="M -40 -64 L -30 -90 L -14 -74 L 0 -96 L 14 -74 L 30 -90 L 40 -64 Z" fill={C.oro} />
  </g>
);

/** Arca de tres llaves. */
const Arca: React.FC<{ x: number; y: number; s?: number; abierta?: boolean }> = ({ x, y, s = 1, abierta }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-160} y={-140} width={320} height={140} fill={C.madera} />
    <rect x={-160} y={-140} width={320} height={140} fill="url(#pot-tablas)" opacity={0.5} />
    {[-150, -50, 50, 140].map((bx) => (
      <rect key={bx} x={bx} y={-140} width={12} height={140} fill={"#3A3A3E"} />
    ))}
    {[-90, 0, 90].map((lx) => (
      <g key={lx}>
        <rect x={lx - 16} y={-110} width={32} height={40} rx={4} fill={C.oro} />
        <path d={`M ${lx} -98 v 14`} stroke={"#2A2A2A"} strokeWidth={4} />
        <circle cx={lx} cy={-100} r={4} fill={"#2A2A2A"} />
      </g>
    ))}
    {abierta ? (
      <g>
        <path d="M -164 -140 L 164 -140 L 150 -220 L -150 -220 Z" fill={osc(C.madera, 1.1)} />
        {Array.from({ length: 16 }).map((_, i) => (
          <ellipse key={i} cx={-130 + (i % 8) * 36} cy={-146 - Math.floor(i / 8) * 10} rx={16} ry={7} fill={i % 2 ? C.plata : C.plataLuz} />
        ))}
      </g>
    ) : (
      <path d="M -164 -140 Q 0 -190 164 -140 L 164 -150 Q 0 -200 -164 -150 Z" fill={osc(C.madera, 1.15)} />
    )}
  </g>
);

const DibujoMoneda: React.FC<PropsDecorado> = ({ e }) => {
  const f = useCurrentFrame();
  const sem = e.semilla ?? 12;
  const gente = e.gente ?? 0.8;
  const fraude = e.variante === "fraude";
  const libro = e.textos?.libro ?? "LIBRO DEL QUINTO REAL";
  const W = 2400;
  // el golpe del martillo, el mismo calculo que la figura
  const ritmo = 0.8;
  const semM = sem + 20;
  const golpe = (Math.sin(f * 0.16 * ritmo + rr(semM, 9) * 6.28) + 1) / 2;
  const chispa = golpe < 0.12;
  return (
    <g>
      <TexturasPot />
      {/* muros y techo de vigas */}
      <rect x={-100} y={-100} width={W + 200} height={1300} fill={C.cal} />
      <rect x={-100} y={-100} width={W + 200} height={170} fill={C.maderaMedia} />
      {Array.from({ length: 22 }).map((_, i) => (
        <rect key={i} x={-80 + i * 120} y={-100} width={40} height={180} fill={C.madera} />
      ))}
      <rect x={-100} y={60} width={W + 200} height={24} fill={C.madera} />
      <rect x={-100} y={800} width={W + 200} height={400} fill={C.piedraSombra} />
      <rect x={-100} y={800} width={W + 200} height={400} fill="url(#pot-sillar)" opacity={0.4} />
      <rect x={-100} y={790} width={W + 200} height={14} fill={C.piedraOscura} />
      <rect x={1150} y={84} width={60} height={716} fill={C.calSombra} />
      {/* ---------------- la Caja Real ---------------- */}
      <Escudo x={560} y={260} s={1.2} />
      <rect x={120} y={180} width={180} height={240} fill={"#3A4A4A"} />
      <rect x={120} y={180} width={180} height={240} fill={"#A9C2C2"} opacity={0.35} />
      <path d="M 210 180 V 420 M 120 300 H 300" stroke={C.madera} strokeWidth={8} />
      <path d="M 120 420 L 300 420 L 520 800 L 200 800 Z" fill={"#FFF3D2"} opacity={0.18} />
      {/* mesa de los oficiales */}
      <Frente traje="noble" semilla={sem + 1} x={640} y={900} s={0.78} cuerpo="busto" pose="escribe" objeto="pluma" gesto="serio" />
      <Frente traje="espanol" semilla={sem + 2} x={860} y={900} s={0.76} cuerpo="busto" pose="lee" gesto="serio" color={"#2E2E3E"} />
      <rect x={480} y={690} width={520} height={22} fill={C.maderaLuz} />
      <rect x={490} y={712} width={500} height={110} fill={C.maderaMedia} />
      <rect x={500} y={720} width={480} height={50} fill={"#2F4A3F"} />
      <g transform="translate(560 690)">
        <path d="M -60 0 L 0 -10 L 60 0 L 60 -8 L 0 -18 L -60 -8 Z" fill={"#EDE3C8"} />
        <rect x={-60} y={-8} width={120} height={8} fill={"#7A2E2A"} />
        <text x={0} y={-24} textAnchor="middle" fontFamily={FONT.serif} fontSize={13} fill={C.tinta}>
          {libro}
        </text>
      </g>
      <Vela x={940} y={672} s={0.8} semilla={3} />
      {/* el arca y las barras */}
      <Arca x={260} y={900} s={0.9} abierta={fraude} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Barra key={i} x={120 + (i % 3) * 170 + Math.floor(i / 3) * 85} y={1010 - Math.floor(i / 3) * 34} s={0.9} />
      ))}
      {/* la romana con una barra */}
      <Balanza x={1020} y={1000} s={0.95} izq={<Barra x={0} y={0} s={0.55} />} der={<g>{[0, 1, 2].map((k) => <rect key={k} x={-22} y={-14 - k * 14} width={44} height={14} fill={"#5A5A5E"} />)}</g>} />
      {/* el que marca el quinto en la barra */}
      {gente > 0.4 ? (
        <g>
          <Perfil traje="espanol" semilla={sem + 3} x0={150} y={1060} s={0.8} pose="martillo" herramienta="martillo" ritmo={0.6} color={"#4A3A2E"} />
          <rect x={250} y={980} width={120} height={80} fill={C.madera} />
          <rect x={244} y={972} width={132} height={12} fill={C.maderaLuz} />
          <Barra x={310} y={972} s={0.7} />
        </g>
      ) : null}
      {/* ---------------- los talleres de acunacion ---------------- */}
      <rect x={1500} y={170} width={260} height={300} fill={"#3A4A4A"} />
      <rect x={1500} y={170} width={260} height={300} fill={"#C9D3D0"} />
      <path d="M 1530 470 Q 1600 300 1630 290 Q 1660 300 1730 470 Z" fill={C.cerroLuz} />
      <path d="M 1630 170 V 470 M 1500 320 H 1760" stroke={C.madera} strokeWidth={10} />
      <path d="M 1500 470 L 1760 470 L 1960 800 L 1400 800 Z" fill={"#FFF3D2"} opacity={0.16} />
      {/* cortadores de la barra */}
      <rect x={1240} y={860} width={200} height={70} fill={C.maderaMedia} />
      <rect x={1240} y={850} width={200} height={14} fill={C.maderaLuz} />
      <Barra x={1330} y={850} s={0.8} />
      <Perfil traje="andino" semilla={sem + 10} x0={1210} y={1000} s={0.82} pose="martillo" herramienta="martillo" ritmo={1.1} gorro="montera" />
      {/* el yunque con los cunos y el acunador */}
      <g transform="translate(1900 1010)">
        <path d="M -60 0 L -40 -150 L 40 -150 L 60 0 Z" fill={C.madera} />
        <rect x={-50} y={-180} width={100} height={34} fill={"#4A4A4E"} />
        <rect x={-14} y={-200} width={28} height={22} fill={"#6A6A6E"} />
        <ellipse cx={0} cy={-202} rx={18} ry={5} fill={C.plataLuz} />
        {chispa
          ? Array.from({ length: 7 }).map((_, i) => (
              <path key={i} d={`M 0 -206 l ${Math.cos(i) * 40} ${-Math.abs(Math.sin(i)) * 40}`} stroke={C.ocre} strokeWidth={3} />
            ))
          : null}
      </g>
      <Perfil traje="andino" semilla={semM} x0={1740} y={1010} s={0.86} pose="martillo" herramienta="martillo" ritmo={ritmo} gorro="chullo" />
      {/* cesto de macuquinas */}
      <g transform="translate(2120 1030)">
        <path d="M -80 0 L -90 -80 L 90 -80 L 80 0 Z" fill={"#A88A5A"} />
        {[0, 1, 2].map((r) => (
          <path key={r} d={`M -88 ${-20 - r * 20} H 88`} stroke={"#7A6040"} strokeWidth={3} />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <ellipse key={i} cx={-70 + (i % 7) * 23} cy={-84 - Math.floor(i / 7) * 8} rx={12 + rr(i, 3) * 4} ry={5} fill={i % 3 ? C.plata : C.plataLuz} />
        ))}
      </g>
      {/* el ensayador con su balanza */}
      <rect x={1980} y={690} width={420} height={20} fill={C.maderaLuz} />
      <rect x={1990} y={710} width={400} height={100} fill={C.maderaMedia} />
      <Frente traje="espanol" semilla={sem + 30} x={2200} y={900} s={0.76} cuerpo="busto" pose={fraude ? "habla" : "lee"} gesto={fraude ? "inquieto" : "serio"} gafas mirada={-1} color={"#2A2A30"} />
      <Balanza x={2060} y={690} s={0.42} color={"#C9A23A"} izq={<ellipse cx={0} cy={-6} rx={22} ry={6} fill={C.plata} />} der={<rect x={-10} y={-16} width={20} height={16} fill={"#5A5A5E"} />} />
      <rect x={2300} y={668} width={50} height={22} fill={"#2A2A2C"} />
      <Vela x={2370} y={666} s={0.7} semilla={9} />
      {fraude ? <Frente traje="mercader" semilla={sem + 31} x={2330} y={1060} s={0.8} pose="ofrece" objeto="bolsa" gesto="inquieto" mirada={-1} /> : null}
      {/* polvo de luz */}
      {Array.from({ length: 12 }).map((_, i) => {
        const t = (f * 0.004 + i / 12) % 1;
        return <circle key={i} cx={1560 + rr(i, 4) * 300 + t * 60} cy={500 + t * 280} r={2} fill={"#FFF3D2"} opacity={0.6 * (1 - t)} />;
      })}
    </g>
  );
};

export const MONEDA: Decorado = {
  desc: "La Caja Real y la Casa de Moneda de Potosi (siglos XVI-XVII). Izquierda: escudo real, ventana con luz, los oficiales reales en la mesa con el libro del quinto, el arca de tres llaves, barras de plata apiladas, la romana pesando una barra y un hombre marcando una barra a martillo. Derecha: ventana con el Cerro, un indio corta la barra en trozos, otro golpea la moneda en el yunque entre dos cunos (saltan chispas), un cesto de macuquinas y el ensayador con su balanza y una vela.",
  ancho: 2400,
  admite: "textos.libro (titulo del libro de la mesa), variante ('fraude': el arca abierta llena de monedas, el ensayador inquieto y un mercader que le tiende una bolsa), gente, semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 1440, y: 540, z: 1 }, desc: "de la Caja Real a los talleres, paneando" },
    caja: { de: { x: 620, y: 600, z: 1.6 }, a: { x: 660, y: 580, z: 1.75 }, desc: "los oficiales reales, el escudo, el arca y las barras" },
    arca: { de: { x: 380, y: 860, z: 2.6 }, a: { x: 390, y: 860, z: 2.9 }, desc: "el arca de tres llaves y las barras" },
    oficial: { de: { x: 660, y: 640, z: 2.6 }, a: { x: 640, y: 620, z: 3 }, desc: "el oficial real escribe en el libro" },
    acunacion: { de: { x: 1780, y: 640, z: 1.7 }, a: { x: 1820, y: 620, z: 1.85 }, desc: "el taller: cortadores, acunador y cesto de monedas" },
    martillo: { de: { x: 1880, y: 820, z: 3 }, a: { x: 1890, y: 830, z: 3.4 }, desc: "el golpe del martillo sobre el cuno" },
    ensayador: { de: { x: 1990, y: 660, z: 2.4 }, a: { x: 2030, y: 640, z: 2.7 }, desc: "el ensayador con su balanza" },
  },
  dibujo: DibujoMoneda,
};
