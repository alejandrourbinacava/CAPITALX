import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { Agua, Bandera, C, CieloVoc, Defs, Gaviotas, Humo, Retourschip, rnd } from "./comun";
import { Figura, Paseante, type Traje } from "./Gente";

/* ------------------------------------------------------------------ */
/* Vegetacion y casas del tropico                                      */
/* ------------------------------------------------------------------ */

export const Palmera: React.FC<{ x: number; y: number; s?: number; semilla?: number; inclina?: number }> = ({ x, y, s = 1, semilla = 1, inclina = 8 }) => {
  const f = useCurrentFrame();
  const m = Math.sin(f * 0.04 + semilla) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -8 0 Q ${inclina * 3} -200 ${inclina * 5} -380 L ${inclina * 5 + 12} -380 Q ${inclina * 3 + 14} -200 8 0 Z`} fill={"#7A6450"} />
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M ${inclina * 5 - 4} ${-380 + i * 40} h 18`} stroke={"#5E4A38"} strokeWidth={3} />
      ))}
      <g transform={`translate(${inclina * 5 + 6} -384) rotate(${m})`}>
        {[-160, -125, -90, -55, -20, 15, 200, 165].map((a, i) => (
          <g key={i} transform={`rotate(${a})`}>
            <path d="M 0 0 Q 70 -30 150 14 Q 70 -8 0 6 Z" fill={i % 2 ? C.hoja : C.hojaOsc} />
            <path d="M 10 2 Q 80 -16 146 12" stroke={C.hojaLuz} strokeWidth={2} fill="none" />
          </g>
        ))}
        <circle cx={-6} cy={8} r={9} fill={"#6A5A2A"} />
        <circle cx={8} cy={10} r={9} fill={"#7A6A3A"} />
      </g>
    </g>
  );
};

/** Arbol de la nuez moscada: copa densa y oscura con frutos amarillos; alguno abierto con el macis rojo. */
export const Moscadero: React.FC<{ x: number; y: number; s?: number; semilla?: number }> = ({ x, y, s = 1, semilla = 1 }) => {
  const f = useCurrentFrame();
  const m = Math.sin(f * 0.035 + semilla) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-10} y={-120} width={20} height={120} fill={"#5E4A38"} />
      <g transform={`translate(${m} 0)`}>
        <path d="M 0 -440 Q 120 -380 130 -240 Q 140 -130 0 -110 Q -140 -130 -130 -240 Q -120 -380 0 -440 Z" fill={C.hojaOsc} />
        <path d="M 0 -440 Q -120 -380 -130 -240 Q -140 -130 -40 -114 Q -70 -250 0 -440 Z" fill={C.hoja} />
        {Array.from({ length: 14 }).map((_, i) => {
          const fx = -90 + rnd(i, semilla) * 180;
          const fy = -390 + rnd(i, semilla + 1) * 250;
          const abierto = rnd(i, semilla + 2) > 0.6;
          return (
            <g key={i}>
              <circle cx={fx} cy={fy} r={13} fill={"#E2C46A"} />
              {abierto ? (
                <g>
                  <path d={`M ${fx - 8} ${fy - 2} Q ${fx} ${fy + 14} ${fx + 8} ${fy - 2}`} fill={C.macis} />
                  <circle cx={fx} cy={fy + 3} r={4} fill={C.nuez} />
                </g>
              ) : (
                <path d={`M ${fx} ${fy - 11} V ${fy + 11}`} stroke={"#C9A84A"} strokeWidth={1.5} />
              )}
            </g>
          );
        })}
      </g>
    </g>
  );
};

/** Arbol de sombra (kenari) alto, que cubre los moscaderos. */
const Kenari: React.FC<{ x: number; y: number; s?: number; semilla?: number }> = ({ x, y, s = 1, semilla = 1 }) => {
  const f = useCurrentFrame();
  const m = Math.sin(f * 0.025 + semilla) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -26 0 Q -14 -300 -6 -560 L 6 -560 Q 14 -300 26 0 Z" fill={"#8A7A64"} />
      <path d="M -26 0 L -60 10 M 26 0 L 60 10" stroke={"#8A7A64"} strokeWidth={12} />
      <g transform={`translate(${m} 0)`}>
        <ellipse cx={0} cy={-620} rx={260} ry={110} fill={"#3A5E44"} />
        <ellipse cx={-150} cy={-580} rx={150} ry={70} fill={C.hoja} />
        <ellipse cx={160} cy={-600} rx={140} ry={70} fill={C.hojaOsc} />
        <ellipse cx={40} cy={-680} rx={140} ry={60} fill={C.hojaLuz} opacity={0.6} />
      </g>
    </g>
  );
};

/** Casa sobre pilotes con tejado de palma. */
export const CasaPilotes: React.FC<{ x: number; y: number; s?: number; semilla?: number; vacia?: boolean }> = ({ x, y, s = 1, semilla = 1, vacia }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-90, -30, 30, 90].map((px) => (
      <rect key={px} x={px - 6} y={-110} width={12} height={110} fill={"#5E4A38"} />
    ))}
    <rect x={-110} y={-120} width={220} height={14} fill={"#7A6450"} />
    <rect x={-100} y={-230} width={200} height={110} fill={"#C9B48A"} />
    {Array.from({ length: 10 }).map((_, i) => (
      <path key={i} d={`M ${-100 + i * 20} -230 V -120`} stroke={"#B09A6E"} strokeWidth={2} />
    ))}
    <rect x={-30} y={-210} width={50} height={90} fill={vacia ? "#2A2420" : "#4A3A2C"} />
    {vacia ? <path d="M -30 -210 L 0 -200 L 0 -120 L -30 -120 Z" fill={"#6E5A44"} /> : null}
    <rect x={40} y={-200} width={40} height={30} fill={"#4A3A2C"} />
    <path d="M -140 -220 L 0 -330 L 140 -220 Z" fill={"#A88A54"} />
    {Array.from({ length: 7 }).map((_, i) => (
      <path key={i} d={`M ${-120 + i * 40} -224 L ${-20 + i * 7} -310`} stroke={"#8A6A3A"} strokeWidth={2} />
    ))}
    <path d="M -144 -218 L 144 -218" stroke={"#8A6A3A"} strokeWidth={6} />
    {/* escalera */}
    <path d="M 30 0 L 0 -120 M 56 0 L 26 -120" stroke={"#5E4A38"} strokeWidth={5} />
    {[0, 1, 2, 3].map((k) => (
      <path key={k} d={`M ${26 - k * 7} ${-24 - k * 26} h 28`} stroke={"#5E4A38"} strokeWidth={4} />
    ))}
    {rnd(semilla, 4) > 0.5 && !vacia ? <path d="M -96 -116 l 40 -26 l 40 26" fill={"#C9B48A"} /> : null}
  </g>
);

/** Fuerte de piedra con baluartes y bandera. */
export const Fuerte: React.FC<{ x: number; y: number; s?: number; bandera?: boolean; fase?: number }> = ({ x, y, s = 1, bandera = true, fase = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -300 0 L -260 -140 L 260 -140 L 300 0 Z" fill={"#B9AC91"} />
    <path d="M -300 0 L -260 -140 L -200 -140 L -230 0 Z" fill={"#A49880"} />
    {[-360, 300].map((bx) => (
      <g key={bx}>
        <path d={`M ${bx} 0 L ${bx + 20} -170 L ${bx + 60} -190 L ${bx + 100} -170 L ${bx + 120} 0 Z`} fill={"#C8BDA4"} transform={`translate(${bx < 0 ? 0 : -60} 0)`} />
      </g>
    ))}
    <rect x={-270} y={-160} width={540} height={22} fill={"#C8BDA4"} />
    {Array.from({ length: 14 }).map((_, i) => (
      <rect key={i} x={-266 + i * 40} y={-176} width={22} height={18} fill={"#C8BDA4"} />
    ))}
    {[-180, -60, 60, 180].map((cx) => (
      <rect key={cx} x={cx - 8} y={-120} width={16} height={12} fill={"#2A2420"} />
    ))}
    <path d="M -50 0 L -50 -70 Q 0 -110 50 -70 L 50 0 Z" fill={"#3A2E24"} />
    <rect x={-120} y={-260} width={240} height={100} fill={"#E2D6BC"} />
    <path d="M -140 -260 L 0 -320 L 140 -260 Z" fill={"#8A4A34"} />
    {[-80, -20, 40].map((wx) => (
      <rect key={wx} x={wx} y={-240} width={30} height={40} fill={"#3A4846"} />
    ))}
    {bandera ? (
      <g>
        <rect x={-4} y={-450} width={7} height={140} fill={"#3A2A1E"} />
        <Bandera x={3} y={-450} w={110} h={70} fase={fase} />
      </g>
    ) : null}
  </g>
);

/** Prao o kora-kora: canoa con balancines. */
const Prao: React.FC<{ x0: number; y: number; v?: number; s?: number; semilla?: number; gente?: boolean }> = ({ x0, y, v = 0.3, s = 1, semilla = 1, gente = true }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  return (
    <g transform={`translate(${x} ${y + Math.sin(f * 0.08 + semilla) * 3}) scale(${s})`}>
      <path d="M -160 -10 L 160 -10 Q 200 -30 210 -50 Q 190 10 150 14 L -150 14 Q -190 10 -210 -50 Q -200 -30 -160 -10 Z" fill={"#6A4A30"} />
      <path d="M -120 20 L -150 50 M 120 20 L 150 50" stroke={"#5E4A38"} strokeWidth={5} />
      <path d="M -190 50 H 190" stroke={"#5E4A38"} strokeWidth={8} />
      {gente
        ? [-80, 0, 80].map((px, i) => (
            <g key={px} transform={`translate(${px} -10)`}>
              <rect x={-12} y={-46} width={24} height={46} fill={["#E8E0CC", "#C9B48A", "#B86A4A"][i]} />
              <circle cx={0} cy={-60} r={13} fill={["#A56F4E", "#7E5139", "#C38E68"][(i + semilla) % 3]} />
              <path d="M -14 -64 Q 0 -80 14 -64 Z" fill={["#7A4A2A", "#3E3A5A", "#2F4A3F"][i]} />
              <path d={`M 6 -30 L ${40 + Math.sin(f * 0.15 + i) * 16} 30`} stroke={"#5C3E2C"} strokeWidth={4} />
            </g>
          ))
        : null}
      <rect x={-4} y={-200} width={6} height={190} fill={"#5E4A38"} />
      <path d={`M 2 -196 L ${90 + Math.sin(f * 0.07) * 6} -110 L 2 -40 Z`} fill={"#D9C9A2"} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 1. Las islas de Banda                                               */
/* ------------------------------------------------------------------ */

const DibujoBanda: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  const v = e.variante ?? "";
  const flota = v === "flota";
  const vacia = v === "vacia";
  const gente = vacia ? 0 : e.gente ?? 0.8;
  return (
    <g>
      <Defs />
      <CieloVoc hora={e.hora} tipo="tropico" ancho={3800} nubes={5} />
      {/* Gunung Api, el volcan */}
      <path d="M 120 600 Q 420 520 600 220 L 660 196 L 720 200 Q 900 480 1260 600 Z" fill={"#5E7060"} />
      <path d="M 600 220 L 660 196 L 720 200 Q 760 330 820 380 Q 700 300 640 260 Z" fill={"#4E5E50"} />
      <path d="M 200 590 Q 500 500 600 380 Q 640 500 900 560 Q 1100 590 1240 600 Z" fill={C.hojaOsc} />
      <Humo x={660} y={190} s={1.2} color={"#D8D2C4"} />
      {/* Banda Neira con los fuertes */}
      <path d="M 1300 600 Q 1500 520 1800 520 Q 2100 470 2300 400 Q 2500 420 2700 520 Q 2900 560 3300 600 Z" fill={"#6E8A64"} />
      <path d="M 1300 600 Q 1700 560 2100 580 Q 2600 560 3300 600 L 3300 620 L 1300 620 Z" fill={C.arena} />
      <Fuerte x={2300} y={420} s={0.32} fase={1} />
      <Fuerte x={1840} y={600} s={0.38} fase={2} />
      {[1500, 2600, 2760, 2050].map((px, i) => (
        <Palmera key={px} x={px} y={600} s={0.36} semilla={i} />
      ))}
      <Agua y={600} ancho={3800} alto={500} color={"#5E8A88"} mar />
      {/* flota armada fondeada */}
      {flota ? (
        <g>
          <Retourschip x={1700} y={760} s={0.42} velas="recogidas" fase={1} espejo />
          <Retourschip x={2250} y={720} s={0.34} velas="recogidas" fase={2} espejo />
          <Retourschip x={2650} y={780} s={0.46} velas="recogidas" fase={3} espejo />
          <Retourschip x={1350} y={690} s={0.24} velas="recogidas" fase={4} espejo />
          <Retourschip x={2000} y={660} s={0.2} velas="recogidas" fase={5} espejo />
        </g>
      ) : (
        <g>
          <Prao x0={1500} y={760} v={0.35} s={0.5} semilla={s} />
          <Prao x0={2400} y={700} v={-0.25} s={0.36} semilla={s + 1} />
          <Retourschip x={2500} y={680} s={0.24} velas="recogidas" fase={2} espejo />
        </g>
      )}
      {/* playa y aldea en primer termino */}
      <path d="M -400 880 Q 400 840 1000 860 Q 1400 870 1620 920 L 1700 1100 L -400 1100 Z" fill={C.arena} />
      <path d="M -400 880 Q 400 840 1000 860 Q 1400 870 1620 920" stroke={"#F2EAD2"} strokeWidth={6} fill="none" />
      <Palmera x={-60} y={960} s={1.1} semilla={1} inclina={10} />
      <Palmera x={1420} y={950} s={0.95} semilla={2} inclina={-8} />
      <CasaPilotes x={260} y={920} s={0.9} semilla={s} vacia={vacia} />
      <CasaPilotes x={720} y={900} s={0.8} semilla={s + 1} vacia={vacia} />
      <CasaPilotes x={1100} y={910} s={0.7} semilla={s + 2} vacia={vacia} />
      {!vacia ? <Humo x={940} y={840} s={0.5} /> : null}
      {/* nuez puesta a secar en esteras */}
      {!vacia
        ? [460, 900].map((mx) => (
            <g key={mx}>
              <rect x={mx - 70} y={980} width={140} height={20} fill={"#C9A27E"} />
              {Array.from({ length: 12 }).map((_, i) => (
                <circle key={i} cx={mx - 60 + i * 11} cy={986 + (i % 2) * 6} r={5} fill={i % 3 ? C.nuez : C.macis} />
              ))}
            </g>
          ))
        : (
          <g>
            <rect x={400} y={990} width={140} height={14} fill={"#B9A27E"} transform="rotate(-8 470 997)" />
            <path d="M 860 1000 l 40 -6 l 30 10 l -50 6 Z" fill={"#A88A54"} />
          </g>
        )}
      {Array.from({ length: Math.round(6 * gente) }).map((_, i) => {
        const tr: Traje = (["bandaMujer", "banda", "banda", "bandaMujer", "banda", "bandaMujer"] as const)[i % 6];
        return i % 3 === 2 ? (
          <Paseante key={i} x0={200 + i * 180} y={1040} v={(i % 2 ? -1 : 1) * 0.6} escala={0.62} traje={tr} semilla={s * 29 + i} carga={i % 2 ? "cesta" : "ninguna"} />
        ) : (
          <Figura key={i} x={120 + i * 210} y={1050 - (i % 2) * 24} escala={0.66} traje={tr} semilla={s * 29 + i} pose={i === 0 ? "habla" : i === 1 ? "manos" : "quieto"} objeto={i === 3 ? "cesta" : undefined} mirada={i % 2 ? -0.5 : 0.5} />
        );
      })}
      <Gaviotas n={3} x0={1200} y0={200} ancho={1500} />
    </g>
  );
};

export const banda: Decorado = {
  desc: "Las islas de Banda: el volcan Gunung Api humeando, Banda Neira con el fuerte Nassau en la orilla y el Belgica en la colina, palmeras, praos; en primer termino una aldea de casas sobre pilotes con nuez y macis secandose y gente de Banda",
  ancho: 2880,
  admite: "variante 'flota' (la flota armada de la Compañia fondeada frente a las islas) o 'vacia' (la aldea vacia: puertas abiertas, nadie, esteras volcadas); gente; semilla",
  tomas: {
    general: { de: { x: 1100, y: 560, z: 1.0 }, a: { x: 1300, y: 560, z: 1.05 }, desc: "las islas y la aldea" },
    volcan: { de: { x: 700, y: 400, z: 1.8 }, a: { x: 680, y: 380, z: 2.0 }, desc: "el volcan humeando" },
    fuertes: { de: { x: 2050, y: 520, z: 1.8 }, a: { x: 2200, y: 500, z: 1.9 }, desc: "Banda Neira y sus fuertes" },
    mar: { de: { x: 1900, y: 640, z: 1.5 }, a: { x: 2150, y: 640, z: 1.5 }, desc: "el mar frente a Neira (con la flota si variante 'flota')" },
    aldea: { de: { x: 600, y: 800, z: 1.8 }, a: { x: 760, y: 790, z: 1.9 }, desc: "la aldea y su gente" },
    flota: { de: { x: 2150, y: 680, z: 1.9 }, a: { x: 2250, y: 670, z: 2.0 }, desc: "los barcos frente a Neira (la flota si variante 'flota')" },
    playa: { de: { x: 360, y: 820, z: 2.3 }, a: { x: 300, y: 810, z: 2.5 }, desc: "de cerca, la playa y las casas" },
    costa: { de: { x: 900, y: 600, z: 1.3 }, a: { x: 2000, y: 600, z: 1.3 }, desc: "paneo del volcan a los fuertes" },
  },
  dibujo: DibujoBanda,
};

/* ------------------------------------------------------------------ */
/* 2. Un perk: huerto de nuez moscada trabajado por esclavos            */
/* ------------------------------------------------------------------ */

const DibujoPerken: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  return (
    <g>
      <Defs />
      <CieloVoc hora={e.hora} tipo="tropico" ancho={2800} nubes={3} />
      <path d="M -400 520 Q 400 470 1000 500 Q 1600 470 2400 510 L 2400 700 L -400 700 Z" fill={"#6E8A64"} />
      <rect x={-400} y={640} width={2800} height={460} fill={"#8A7A50"} />
      <rect x={-400} y={640} width={2800} height={460} fill={"#7E8A50"} opacity={0.5} />
      {Array.from({ length: 30 }).map((_, i) => (
        <path key={i} d={`M ${-300 + rnd(i, 4) * 2600} ${700 + rnd(i, 5) * 380} q 6 -14 12 0`} stroke={"#5E6A3A"} strokeWidth={3} fill="none" />
      ))}
      {/* arboles de sombra al fondo */}
      <Kenari x={200} y={700} s={0.9} semilla={1} />
      <Kenari x={1500} y={690} s={1.0} semilla={2} />
      {/* moscaderos */}
      {[120, 520, 980, 1420, 1820].map((tx, i) => (
        <Moscadero key={tx} x={tx} y={760 + (i % 2) * 20} s={1.0} semilla={i + s} />
      ))}
      {/* secadero con humo, y almacen con la marca */}
      <g transform="translate(1680 660)">
        <rect x={-150} y={-160} width={300} height={160} fill={"#C9B48A"} />
        <path d="M -180 -150 L 0 -250 L 180 -150 Z" fill={"#A88A54"} />
        <rect x={-130} y={-120} width={260} height={10} fill={"#8A6A3A"} />
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={-120 + i * 18} cy={-128} r={6} fill={C.nuez} />
        ))}
        <rect x={-40} y={-90} width={80} height={90} fill={"#3A2E24"} />
        <text x={0} y={-180} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize={28} fill={"#5A3A24"}>
          VOC
        </text>
      </g>
      <Humo x={1640} y={480} s={0.6} />
      {/* el perkenier bajo su sombrilla, vigilando */}
      <g>
        <path d={`M 1280 ${760} L 1280 560`} stroke={"#3A2A1E"} strokeWidth={6} />
        <path d="M 1150 580 Q 1280 470 1410 580 Z" fill={"#E8DFC8"} />
        <path d="M 1150 580 Q 1215 560 1280 580 Q 1345 560 1410 580" stroke={"#B9A27E"} strokeWidth={3} fill="none" />
        <Figura x={1250} y={880} escala={0.62} traje="burgues" semilla={s * 31 + 1} pose="brazos" gesto="serio" mirada={-0.8} sombrero />
        <Figura x={1390} y={890} escala={0.6} traje="soldado" semilla={s * 31 + 2} objeto="mosquete" mirada={-0.7} />
      </g>
      {/* trabajadores esclavizados: recogen, cargan cestas, separan el macis */}
      {(() => {
        const vara = Math.sin(f * 0.08) * 6;
        return (
          <g>
            <path d={`M 470 940 L ${560 + vara} 480`} stroke={"#6A4A30"} strokeWidth={6} />
            <path d={`M ${548 + vara} 470 l 30 0 l -6 34 l -20 0 Z`} fill={"#B08A54"} />
          </g>
        );
      })()}
      <Figura x={460} y={960} escala={0.7} traje="trabajador" semilla={s * 37 + 1} pose="senala" cansado gesto="serio" mirada={0.4} />
      <Figura x={760} y={990} escala={0.66} traje="bandaMujer" semilla={s * 37 + 2} pose="manos" objeto="cesta" cansado gesto="serio" mirada={0.2} />
      <Paseante x0={180} y={1030} v={0.45} escala={0.7} traje="trabajador" semilla={s * 37 + 3} carga="cesta" cansado />
      <Paseante x0={1100} y={1050} v={-0.4} escala={0.72} traje="trabajador" semilla={s * 37 + 4} carga="saco" cansado />
      {/* mesa donde se separa el macis */}
      <g>
        <rect x={880} y={900} width={240} height={14} fill={"#7A5A3C"} />
        {Array.from({ length: 16 }).map((_, i) => (
          <circle key={i} cx={898 + i * 13} cy={894 - (i % 3) * 3} r={6} fill={i % 2 ? C.macis : C.nuez} />
        ))}
        <Figura x={1000} y={1060} escala={0.62} traje="trabajador" semilla={s * 37 + 5} cuerpo="busto" pose="cuenta" cansado gesto="serio" />
        <rect x={870} y={906} width={260} height={110} fill={"#6E4B35"} />
        <rect x={870} y={906} width={260} height={14} fill={"#87603F"} />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={886 + k * 82} y={930} width={68} height={74} fill="none" stroke={"#4A3326"} strokeWidth={4} />
        ))}
        <ellipse cx={1000} cy={1018} rx={140} ry={8} fill={"#000"} opacity={0.15} />
      </g>
    </g>
  );
};

export const perken: Decorado = {
  desc: "Un perk de Banda: huerto de moscaderos bajo grandes arboles de sombra; personas esclavizadas recogen la nuez con varas, cargan cestas y separan el macis en una mesa, cansadas; un colono neerlandes bajo una sombrilla y un soldado vigilan; secadero con humo y almacen VOC. Sin violencia",
  admite: "semilla; hora",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1.0 }, a: { x: 960, y: 560, z: 1.06 }, desc: "el huerto y quienes lo trabajan" },
    recogida: { de: { x: 520, y: 700, z: 1.9 }, a: { x: 560, y: 680, z: 2.1 }, desc: "un hombre recoge la nuez con una vara" },
    vigilancia: { de: { x: 1320, y: 640, z: 2.0 }, a: { x: 1300, y: 630, z: 2.3 }, desc: "el colono y el soldado vigilando" },
    mesa: { de: { x: 980, y: 820, z: 2.3 }, a: { x: 1000, y: 820, z: 2.6 }, desc: "separando el macis de la nuez" },
    frutos: { de: { x: 980, y: 520, z: 3.0 }, a: { x: 1000, y: 540, z: 3.6 }, desc: "los frutos abiertos con el macis rojo" },
  },
  dibujo: DibujoPerken,
};

