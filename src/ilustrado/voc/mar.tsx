import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { Agua, Bandera, C, CieloVoc, Defs, Gaviotas, Humo, Retourschip, rnd } from "./comun";
import { Figura, Paseante } from "./Gente";

/** Molino de viento en el horizonte, con aspas que giran. */
export const Molino: React.FC<{ x: number; y: number; s?: number; fase?: number }> = ({ x, y, s = 1, fase = 0 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -40 0 L -26 -150 L 26 -150 L 40 0 Z" fill={"#8A7E6A"} />
      <path d="M -30 -150 Q 0 -190 30 -150 Z" fill={"#6A5E4E"} />
      <rect x={-8} y={-40} width={16} height={40} fill={"#4A3E30"} />
      <g transform={`translate(0 -160) rotate(${f * 1.2 + fase})`}>
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <rect x={-3} y={-130} width={6} height={130} fill={"#4A3E30"} />
            <rect x={3} y={-126} width={22} height={100} fill={"#E8DFC8"} stroke={"#4A3E30"} strokeWidth={1.5} />
          </g>
        ))}
        <circle r={8} fill={"#3A2E24"} />
      </g>
    </g>
  );
};

/** Chalupa de remos con marineros. */
const Chalupa: React.FC<{ x0: number; y: number; v?: number; s?: number; semilla?: number }> = ({ x0, y, v = 0.5, s = 1, semilla = 1 }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  const remo = Math.sin(f * 0.15 + semilla) * 20;
  return (
    <g transform={`translate(${x} ${y + Math.sin(f * 0.09 + semilla) * 3}) scale(${s})`}>
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${-60 + k * 60} -30)`}>
          <rect x={-12} y={-50} width={24} height={50} fill={["#E8E0CC", "#D9CDB2", "#CFC6B2"][k]} />
          <circle cx={0} cy={-64} r={14} fill={["#E2B892", "#D6A47E", "#EBC9A6"][k]} />
          <path d="M -14 -68 Q 0 -86 14 -68 Z" fill={[C.carmin, "#2F4A7A", "#5A5048"][k]} />
          <path d={`M 6 -30 L ${50 + remo} 40`} stroke={"#5C3E2C"} strokeWidth={5} />
        </g>
      ))}
      <path d="M -130 -20 L 130 -20 Q 150 -20 140 0 L 120 20 L -110 20 Q -140 0 -130 -20 Z" fill={"#5A3F2E"} />
      <path d="M -130 -20 L 130 -20 L 132 -10 L -132 -10 Z" fill={"#76563F"} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 1. El puerto: la rada de Texel                                      */
/* ------------------------------------------------------------------ */

const DibujoPuerto: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  const vuelta = e.variante === "vuelta";
  const gente = e.gente ?? 0.8;
  const dir = vuelta ? -1 : 1;
  return (
    <g>
      <Defs />
      <CieloVoc hora={e.hora} ancho={3800} nubes={7} />
      {/* costa baja de Texel con dunas y molinos */}
      <path d="M -400 520 Q 200 470 700 500 Q 1200 480 1700 505 Q 2300 470 3400 500 L 3400 540 L -400 540 Z" fill={"#B9B08F"} />
      <path d="M -400 528 Q 600 506 1400 520 Q 2400 500 3400 520 L 3400 540 L -400 540 Z" fill={"#A49A78"} />
      <Molino x={1700} y={512} s={0.35} />
      <Molino x={2500} y={506} s={0.3} fase={40} />
      <path d="M 2050 505 L 2050 470 L 2090 470 L 2090 505 Z M 2045 470 L 2070 440 L 2095 470 Z" fill={"#8A7E6A"} />
      <Agua y={530} ancho={3800} alto={600} color={C.marAbierto} mar fuerza={1.2} />
      {/* barcos lejanos y medianos */}
      <Retourschip x={vuelta ? 2600 - 0.2 * f : 300 + 0.2 * f} y={580} s={0.22} fase={1} espejo={vuelta} />
      <Retourschip x={vuelta ? 400 - 0.15 * f : 2500 + 0.15 * f} y={560} s={0.16} fase={2} espejo={vuelta} velas="llenas" />
      <Retourschip x={2200 + 0.3 * f * dir} y={680} s={0.42} fase={3} espejo={vuelta} />
      {/* el barco grande */}
      <Retourschip x={1300 + 0.45 * f * dir} y={850} s={0.72} fase={0} espejo={vuelta} />
      <Chalupa x0={600} y={960} v={0.6 * dir} s={0.8} semilla={s} />
      {/* muelle de madera con la despedida */}
      <g>
        <rect x={-400} y={880} width={1000} height={34} fill={"#6E4B35"} />
        <rect x={-400} y={874} width={1000} height={8} fill={"#87603F"} />
        {[-360, -200, -40, 120, 280, 440, 580].map((px) => (
          <rect key={px} x={px} y={910} width={22} height={200} fill={"#4A3326"} />
        ))}
        {Array.from({ length: Math.round(7 * gente) }).map((_, i) => {
          const trajes = ["mujer", "burgues", "mujer", "marinero", "mujer", "burgues", "marinero"] as const;
          const tr = trajes[i % 7];
          const nino = i === 4;
          return (
            <Figura
              key={i}
              x={-160 + i * 105}
              y={882}
              escala={nino ? 0.38 : 0.6}
              traje={tr}
              nino={nino}
              semilla={s * 19 + i}
              pose={i % 2 === 0 ? "senala" : i % 3 === 0 ? "manos" : "quieto"}
              mirada={0.9}
              gesto={vuelta ? "sorpresa" : i % 2 ? "serio" : "neutro"}
            />
          );
        })}
      </g>
      {/* toneles y fardos en el muelle */}
      {[520, 560].map((bx, i) => (
        <g key={bx}>
          <rect x={bx - 24} y={826 - i * 50} width={48} height={56} rx={10} fill={"#7A5A3C"} />
          <rect x={bx - 24} y={836 - i * 50} width={48} height={5} fill={"#3A2E24"} />
        </g>
      ))}
      <Gaviotas n={6} x0={-200} y0={80} ancho={3000} />
    </g>
  );
};

export const puerto: Decorado = {
  desc: "La rada de Texel: retourschepen de tres palos con banderas de la VOC salen a la mar; costa baja con molinos al fondo; en un muelle de madera, mujeres con cofia, un niño y marineros despiden (o reciben) a la flota; chalupa de remos",
  ancho: 2880,
  admite: "variante 'vuelta' (los barcos vuelven hacia la izquierda y la gente los recibe); gente; hora; semilla",
  tomas: {
    general: { de: { x: 1100, y: 560, z: 1.0 }, a: { x: 1250, y: 560, z: 1.06 }, desc: "la flota y el muelle" },
    barco: { de: { x: 1300, y: 560, z: 1.6 }, a: { x: 1420, y: 540, z: 1.7 }, desc: "el retourschip con las velas llenas" },
    banderas: { de: { x: 1290, y: 300, z: 2.8 }, a: { x: 1340, y: 300, z: 3.0 }, desc: "las velas y la bandera VOC en lo alto" },
    despedida: { de: { x: 260, y: 700, z: 1.8 }, a: { x: 200, y: 680, z: 2.0 }, desc: "las mujeres y el niño en el muelle" },
    salida: { de: { x: 980, y: 560, z: 1.15 }, a: { x: 1900, y: 540, z: 1.15 }, desc: "paneo siguiendo al barco que sale" },
  },
  dibujo: DibujoPuerto,
};

/* ------------------------------------------------------------------ */
/* 2. El barco por dentro: cubierta, entrepuente y bodega               */
/* ------------------------------------------------------------------ */

const Hamaca: React.FC<{ x: number; y: number; semilla: number }> = ({ x, y, semilla }) => {
  const f = useCurrentFrame();
  const m = Math.sin(f * 0.05 + semilla) * 4;
  const piel = ["#EBC9A6", "#E2B892", "#D6A47E"][Math.floor(rnd(semilla, 1) * 3)];
  return (
    <g transform={`translate(${x + m} ${y})`}>
      <path d="M -90 -40 Q 0 30 90 -40" stroke={"#8A7E6A"} strokeWidth={3} fill="none" />
      <path d="M -86 -36 Q 0 34 86 -36 Q 0 8 -86 -36 Z" fill={"#CFC3A6"} />
      <path d="M -60 -18 Q 0 18 60 -18 Q 10 0 -60 -18 Z" fill={["#5C6B66", "#6A3A34", "#4A4F52"][semilla % 3]} />
      <circle cx={-56} cy={-24} r={16} fill={piel} />
      <path d="M -70 -30 Q -56 -44 -42 -30" fill={"#5E4330"} />
      <path d="M -62 -22 q 4 2 8 0" stroke={"#5A3A30"} strokeWidth={1.5} fill="none" />
    </g>
  );
};

const Saco: React.FC<{ x: number; y: number; s?: number; tono?: number; texto?: string }> = ({ x, y, s = 1, tono = 0, texto }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 0 Q -54 -60 -36 -84 L -26 -96 L 26 -96 L 36 -84 Q 54 -60 46 0 Z" fill={["#D3C29A", "#C9B48A", "#DCCDA8"][tono % 3]} />
    <path d="M -26 -96 L -18 -110 L 18 -110 L 26 -96 Z" fill={"#B5A27A"} />
    <path d="M -30 -92 H 30" stroke={"#8A7650"} strokeWidth={3} />
    <path d="M -36 -40 Q 0 -30 36 -40" stroke={"#B5A27A"} strokeWidth={2} fill="none" />
    {texto ? (
      <text x={0} y={-48} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize={18} fill={"#5A3A24"}>
        {texto}
      </text>
    ) : null}
  </g>
);

const Tonel: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 0 Q -50 -50 -40 -100 L 40 -100 Q 50 -50 40 0 Z" fill={"#7A5A3C"} />
    {[-86, -60, -40, -14].map((yy) => (
      <rect key={yy} x={-46} y={yy} width={92} height={6} fill={"#3A2E24"} />
    ))}
    <path d="M -20 -100 V 0 M 10 -100 V 0" stroke={"#6A4A30"} strokeWidth={2} />
  </g>
);

export { Saco, Tonel };

const DibujoBarco: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  const rot = Math.sin(f * 0.04) * 1.4;
  const enfermos = e.variante === "escorbuto";
  return (
    <g>
      <Defs />
      <CieloVoc hora={e.hora} ancho={2800} nubes={6} />
      <Agua y={420} ancho={2800} alto={700} color={C.marAbierto} mar />
      <g transform={`rotate(${rot} 960 600)`}>
        {/* palos y velas que salen por arriba */}
        {[520, 1060, 1500].map((px, i) => (
          <g key={px}>
            <rect x={px - 12} y={-300} width={24} height={740} fill={"#3A2A1E"} />
            <path d={`M ${px - 260} ${-60 + i * 30} L ${px + 260} ${-60 + i * 30} Q ${px + 290 + Math.sin(f * 0.08 + i) * 8} ${110 + i * 30} ${px + 260} ${260 + i * 20} L ${px - 260} ${260 + i * 20} Q ${px - 230} ${110 + i * 30} ${px - 260} ${-60 + i * 30} Z`} fill={C.lona} />
            <rect x={px - 270} y={-70 + i * 30} width={540} height={10} fill={"#3A2A1E"} />
          </g>
        ))}
        <g stroke={"#3A2E24"} strokeWidth={2} opacity={0.7}>
          {[120, 220, 320, 1700, 1780, 1860].map((rx, i) => (
            <path key={rx} d={`M ${rx} 440 L ${i < 3 ? 520 : 1500} 0`} />
          ))}
        </g>
        {/* casco en corte */}
        <path d="M 40 440 L 1880 440 L 1840 760 Q 960 1000 80 760 Z" fill={"#4A3322"} />
        <path d="M 80 452 L 1840 452 L 1810 740 Q 960 960 110 740 Z" fill={"#2E2219"} />
        {/* entrepuente (cubierta de batería) */}
        <rect x={86} y={452} width={1748} height={210} fill={"#3A2A1E"} />
        <rect x={86} y={452} width={1748} height={210} fill="url(#vocTablas)" opacity={0.35} />
        {/* vigas */}
        {[200, 420, 640, 860, 1080, 1300, 1520, 1720].map((vx) => (
          <rect key={vx} x={vx} y={452} width={18} height={420} fill={"#2A1E14"} />
        ))}
        <rect x={86} y={662} width={1748} height={16} fill={"#5C3E2C"} />
        {/* bodega */}
        <path d="M 96 678 L 1824 678 L 1806 740 Q 960 950 114 740 Z" fill={"#241A12"} />
        {/* hamacas y enfermos */}
        {[260, 560, 830].map((hx, i) => (
          <g key={hx} transform={`translate(${hx} 560) scale(1.5) translate(${-hx} -560)`}><Hamaca x={hx} y={560} semilla={s * 3 + i} /></g>
        ))}
        {/* marineros sentados tras sus cofres */}
        <defs>
          <clipPath id="vocEntrepuente">
            <rect x={86} y={452} width={1748} height={212} />
          </clipPath>
        </defs>
        <g clipPath="url(#vocEntrepuente)">
        {[1000, 1220, 1440, 1660].map((mx, i) => (
          <g key={mx}>
            <Figura x={mx} y={660} escala={0.42} traje="marinero" semilla={s * 7 + i} cuerpo="busto" cansado={enfermos || i % 2 === 0} gesto={enfermos ? "inquieto" : "neutro"} pose={i === 1 ? "cuenta" : "quieto"} />
            <rect x={mx - 60} y={600} width={120} height={62} fill={"#6E4B35"} />
            <rect x={mx - 60} y={600} width={120} height={10} fill={"#87603F"} />
            <rect x={mx - 6} y={616} width={12} height={14} fill={C.laton} />
          </g>
        ))}
        </g>
        {/* farol que oscila */}
        <g transform={`rotate(${-rot * 4} 960 470)`}>
          <path d="M 960 470 V 520" stroke={"#2A2420"} strokeWidth={3} />
          <rect x={946} y={520} width={28} height={36} fill={"#E9C77A"} stroke={"#2A2420"} strokeWidth={4} />
          <circle cx={960} cy={540} r={90} fill="url(#vocVela)" />
        </g>
        {/* sacos de pimienta y toneles en la bodega */}
        {Array.from({ length: 16 }).map((_, i) => {
          const sx = 260 + i * 90 + (i % 2) * 20;
          if (sx > 1720) return null;
          return <Saco key={i} x={sx} y={800 - Math.abs(i - 8) * 6 + 30} s={0.8} tono={i} texto={i % 4 === 1 ? "VOC" : undefined} />;
        })}
        {[180, 1760].map((tx) => (
          <Tonel key={tx} x={tx} y={770} s={0.8} />
        ))}
        {/* cubierta superior con marineros */}
        <rect x={30} y={420} width={1860} height={24} fill={"#87603F"} />
        <rect x={30} y={404} width={1860} height={16} fill={"#5C3E2C"} />
        <Figura x={330} y={420} escala={0.5} traje="marinero" semilla={s * 11 + 1} pose="carga" objeto="saco" />
        <Paseante x0={700} y={420} v={0.7} escala={0.5} traje="marinero" semilla={s * 11 + 2} carga="barril" />
        <Figura x={1250} y={420} escala={0.5} traje="burgues" semilla={s * 11 + 3} pose="lee" objeto="papel" sombrero />
        <Figura x={1640} y={420} escala={0.5} traje="soldado" semilla={s * 11 + 4} objeto="mosquete" />
        <Paseante x0={1500} y={420} v={-0.5} escala={0.5} traje="marinero" semilla={s * 11 + 5} cansado={enfermos} />
        {/* rotulo de nivel con agua delante */}
      </g>
      <g opacity={0.85}>
        <Agua y={860} ancho={2800} alto={300} color={C.marAbierto} mar />
      </g>
      <Gaviotas n={3} />
    </g>
  );
};

export const barco: Decorado = {
  desc: "Un retourschip cortado por la mitad: en cubierta marineros cargando, un soldado y el sobrecargo con papeles; en el entrepuente hamacas y marineros sentados tras sus cofres, farol que oscila; en la bodega, sacos de pimienta con la marca VOC y toneles. El barco se mece",
  admite: "variante 'escorbuto' (marineros cansados y enfermos, sin sangre); semilla",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1.0 }, a: { x: 960, y: 560, z: 1.05 }, desc: "el barco en corte" },
    cubierta: { de: { x: 800, y: 320, z: 2.0 }, a: { x: 1200, y: 320, z: 2.0 }, desc: "marineros en cubierta" },
    entrepuente: { de: { x: 520, y: 560, z: 2.4 }, a: { x: 600, y: 560, z: 2.6 }, desc: "hamacas con marineros enfermos o agotados" },
    cofres: { de: { x: 1330, y: 560, z: 2.3 }, a: { x: 1360, y: 560, z: 2.6 }, desc: "marineros sentados tras sus cofres" },
    bodega: { de: { x: 800, y: 760, z: 2.3 }, a: { x: 1100, y: 760, z: 2.3 }, desc: "los sacos de pimienta en la bodega" },
  },
  dibujo: DibujoBarco,
};

/* ------------------------------------------------------------------ */
/* 3. El Cabo: la bahia de la Mesa                                     */
/* ------------------------------------------------------------------ */

const DibujoCabo: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  const tormenta = e.variante === "tormenta";
  const llegada = e.variante === "llegada";
  return (
    <g>
      <Defs />
      <CieloVoc hora={e.hora} tipo={tormenta ? "tormenta" : "tropico"} ancho={3800} nubes={tormenta ? 10 : 4} />
      {/* la montaña de la Mesa */}
      <path d="M -400 600 L 100 560 L 360 300 Q 380 250 440 245 L 1360 238 Q 1420 240 1440 290 L 1620 470 L 1800 420 L 2000 500 L 2400 560 L 3400 600 Z" fill={tormenta ? "#5E6662" : "#7E8C86"} />
      <path d="M 440 245 L 1360 238 L 1356 270 L 444 278 Z" fill={tormenta ? "#4E5652" : "#6A7872"} />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M ${470 + i * 76} 278 L ${450 + i * 76 + rnd(i, 3) * 20} 520`} stroke={tormenta ? "#4E5652" : "#6E7C76"} strokeWidth={6} />
      ))}
      {!tormenta ? <path d={`M 500 ${236 + Math.sin(f * 0.03) * 3} Q 900 ${210} 1300 ${232} L 1300 250 L 500 252 Z`} fill={"#F2EFE6"} opacity={0.85} /> : null}
      {/* ladera y playa */}
      <path d="M -400 620 Q 400 560 1000 600 Q 1600 620 2200 600 L 3400 620 L 3400 700 L -400 700 Z" fill={tormenta ? "#6E7A5A" : "#8E9A6A"} />
      <path d="M -400 690 Q 800 650 1800 680 Q 2600 690 3400 670 L 3400 760 L -400 760 Z" fill={C.arena} />
      {/* el fuerte de tierra y las primeras casas */}
      <g transform="translate(1580 690)">
        <path d="M -200 0 L -160 -70 L 160 -70 L 200 0 Z" fill={"#9A8A6A"} />
        <path d="M -160 -70 L -190 -90 L -130 -90 Z M 160 -70 L 190 -90 L 130 -90 Z" fill={"#8A7A5A"} />
        <rect x={-90} y={-120} width={180} height={50} fill={"#E2D6BC"} />
        <path d="M -100 -120 L 0 -160 L 100 -120 Z" fill={"#7A5A3C"} />
        <rect x={-6} y={-220} width={6} height={100} fill={"#3A2A1E"} />
        <Bandera x={0} y={-220} w={70} h={44} fase={2} />
      </g>
      {[1960, 2120].map((hx) => (
        <g key={hx} transform={`translate(${hx} 690)`}>
          <rect x={-50} y={-50} width={100} height={50} fill={"#E2D6BC"} />
          <path d="M -60 -50 L 0 -90 L 60 -50 Z" fill={"#A88A54"} />
        </g>
      ))}
      <Humo x={2120} y={600} s={0.5} />
      {/* bahia */}
      <Agua y={740} ancho={3800} alto={400} color={tormenta ? "#4E6466" : C.marAbierto} mar fuerza={tormenta ? 3 : 1} />
      {tormenta ? (
        <g>
          <Retourschip x={700} y={880} s={0.45} velas="recogidas" balanceo={4} fase={1} rota />
          <Retourschip x={1500} y={830} s={0.32} velas="recogidas" balanceo={5} fase={2} />
          <Retourschip x={2300} y={860} s={0.38} velas="recogidas" balanceo={6} fase={3} rota />
          <g stroke={"#C9D0CC"} strokeWidth={2} opacity={0.5}>
            {Array.from({ length: 160 }).map((_, i) => {
              const x = (rnd(i, 1) * 3600 + f * 9) % 3600 - 400;
              const y = (rnd(i, 2) * 1100 + f * 26) % 1100 - 20;
              return <path key={i} d={`M ${x} ${y} l -14 28`} />;
            })}
          </g>
          {Array.from({ length: 8 }).map((_, i) => {
            const x = -300 + i * 450 + Math.sin(f * 0.05 + i) * 40;
            return <path key={i} d={`M ${x} 1000 Q ${x + 80} ${900 + Math.sin(f * 0.1 + i) * 30} ${x + 200} 990 Z`} fill={"#E6ECE8"} opacity={0.5} />;
          })}
        </g>
      ) : (
        <g>
          <Retourschip x={600} y={860} s={0.4} velas="recogidas" fase={1} />
          <Retourschip x={2400} y={820} s={0.3} velas="recogidas" fase={2} espejo />
          <Retourschip x={1300} y={800} s={0.22} velas="recogidas" fase={3} />
          {/* desembarco */}
          <g transform={`translate(${1100 + Math.min(1, f / 150) * 160} 0)`}>
            <path d="M -130 960 L 130 960 Q 150 960 140 980 L 120 1000 L -110 1000 Q -140 980 -130 960 Z" fill={"#5A3F2E"} />
          </g>
          <path d="M 1280 1090 Q 1400 992 1620 986 Q 2100 976 2520 1004 L 2640 1090 Z" fill={C.arena} />
          <path d="M 1300 1000 Q 1500 990 1640 994" stroke={"#F2EAD2"} strokeWidth={4} fill="none" opacity={0.7} />
          {Array.from({ length: llegada ? 6 : 4 }).map((_, i) => {
            const tr = llegada ? (["trabajador", "bandaMujer", "trabajador", "trabajador", "bandaMujer", "soldado"] as const)[i] : (["burgues", "soldado", "marinero", "marinero"] as const)[i];
            return (
              <Figura
                key={i}
                x={1500 + i * 110}
                y={1040 + (i % 2) * 20}
                escala={0.62}
                traje={tr}
                semilla={s * 23 + i}
                pose={!llegada && i === 0 ? "senala" : llegada ? "manos" : "quieto"}
                gesto={llegada ? "serio" : "neutro"}
                cansado={llegada && i < 5}
                mirada={-0.6}
                sombrero={!llegada && i === 0}
              />
            );
          })}
        </g>
      )}
      <Gaviotas n={tormenta ? 0 : 5} y0={360} />
    </g>
  );
};

export const cabo: Decorado = {
  desc: "La bahia de la Mesa, en el Cabo: la montaña de mesa con su mantel de nubes, el fuerte de tierra con la bandera, casitas, barcos fondeados y un grupo que desembarca en la playa",
  ancho: 2880,
  admite: "variante 'tormenta' (temporal: barcos zarandeados, lluvia, olas; sin naufragos) o 'llegada' (personas esclavizadas que llegan cansadas, custodiadas por un soldado, con dignidad); semilla",
  tomas: {
    general: { de: { x: 1100, y: 560, z: 1.0 }, a: { x: 1250, y: 560, z: 1.05 }, desc: "la bahia y la montaña" },
    montana: { de: { x: 900, y: 420, z: 1.6 }, a: { x: 1000, y: 400, z: 1.7 }, desc: "la montaña de la Mesa" },
    fuerte: { de: { x: 1700, y: 640, z: 2.0 }, a: { x: 1760, y: 640, z: 2.2 }, desc: "el fuerte y las primeras casas" },
    playa: { de: { x: 1700, y: 820, z: 2.0 }, a: { x: 1760, y: 800, z: 2.1 }, desc: "el grupo en la playa" },
    barcos: { de: { x: 700, y: 760, z: 1.8 }, a: { x: 1000, y: 760, z: 1.8 }, desc: "barcos fondeados en la bahia" },
  },
  dibujo: DibujoCabo,
};

