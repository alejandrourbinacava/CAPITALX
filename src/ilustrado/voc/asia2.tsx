import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { Agua, Bandera, C, CieloVoc, Defs, Gaviotas, Humo, Retourschip, osc, rnd } from "./comun";
import { Figura, Paseante, type Traje } from "./Gente";
import { CasaGablete } from "./canal";
import { Fuerte, Palmera } from "./asia";

/* ------------------------------------------------------------------ */
/* Puesto de mercado                                                   */
/* ------------------------------------------------------------------ */

const Puesto: React.FC<{ x: number; y: number; w: number; toldo: string; genero: "porcelana" | "telas" | "frutas" | "especias"; cerrado?: boolean }> = ({ x, y, w, toldo, genero, cerrado }) => {
  const f = useCurrentFrame();
  const ond = Math.sin(f * 0.07 + x) * 3;
  return (
    <g>
      <rect x={x + 6} y={y - 230} width={8} height={230} fill={"#5E4A38"} />
      <rect x={x + w - 14} y={y - 230} width={8} height={230} fill={"#5E4A38"} />
      <path d={`M ${x - 10} ${y - 230} L ${x + w + 10} ${y - 230} L ${x + w + 24} ${y - 180 + ond} L ${x - 24} ${y - 180 + ond} Z`} fill={toldo} />
      {Array.from({ length: Math.floor(w / 40) }).map((_, i) => (
        <path key={i} d={`M ${x - 10 + i * 40 + 20} ${y - 230} L ${x - 24 + i * 42 + 22} ${y - 180 + ond}`} stroke={osc(toldo, 0.8)} strokeWidth={10} />
      ))}
      <path d={`M ${x - 24} ${y - 180 + ond} q 12 14 24 0 q 12 14 24 0 q 12 14 24 0 q 12 14 24 0 q 12 14 24 0 q 12 14 24 0 q 12 14 24 0 q 12 14 24 0 q 12 14 24 0 q 12 14 24 0 q 12 14 24 0`} fill={toldo} />
      <rect x={x} y={y - 90} width={w} height={90} fill={"#7A5A3C"} />
      <rect x={x - 6} y={y - 96} width={w + 12} height={12} fill={"#87603F"} />
      {cerrado ? (
        <g>
          <rect x={x} y={y - 180} width={w} height={86} fill={"#5E4A38"} />
          {Array.from({ length: Math.floor(w / 24) }).map((_, i) => (
            <path key={i} d={`M ${x + i * 24 + 12} ${y - 180} V ${y - 94}`} stroke={"#4A3A2C"} strokeWidth={3} />
          ))}
        </g>
      ) : genero === "porcelana" ? (
        Array.from({ length: Math.floor(w / 46) }).map((_, i) => (
          <g key={i} transform={`translate(${x + 26 + i * 46} ${y - 96})`}>
            <path d="M -14 0 Q -20 -30 -8 -44 L -8 -54 L 8 -54 L 8 -44 Q 20 -30 14 0 Z" fill={"#EEF0EA"} />
            <path d="M -12 -22 Q 0 -30 12 -22 M -10 -12 Q 0 -6 10 -12" stroke={"#2F4A7A"} strokeWidth={3} fill="none" />
          </g>
        ))
      ) : genero === "telas" ? (
        Array.from({ length: Math.floor(w / 36) }).map((_, i) => (
          <rect key={i} x={x + 8 + i * 36} y={y - 140 + (i % 2) * 10} width={30} height={44 - (i % 2) * 10} rx={6} fill={["#B8402A", "#2F4A7A", "#E8B33C", "#2E5A4E", "#7A3A5A"][i % 5]} />
        ))
      ) : genero === "frutas" ? (
        Array.from({ length: Math.floor(w / 30) }).map((_, i) => (
          <circle key={i} cx={x + 16 + i * 30} cy={y - 108 - (i % 2) * 10} r={13} fill={["#E2B24A", "#8AA04A", "#C8602A", "#6A8A3A"][i % 4]} />
        ))
      ) : (
        Array.from({ length: Math.floor(w / 60) }).map((_, i) => (
          <g key={i} transform={`translate(${x + 32 + i * 60} ${y - 96})`}>
            <path d="M -26 0 Q -30 -30 -20 -40 L 20 -40 Q 30 -30 26 0 Z" fill={"#D3C29A"} />
            <ellipse cx={0} cy={-40} rx={20} ry={7} fill={[C.pimienta, C.macis, C.nuez, "#6A3A2A"][i % 4]} />
          </g>
        ))
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 1. Batavia                                                          */
/* ------------------------------------------------------------------ */

const DibujoBatavia: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  const vacia = e.variante === "vacia";
  const gente = vacia ? 0 : e.gente ?? 0.8;
  return (
    <g>
      <Defs />
      <CieloVoc hora={e.hora} tipo="tropico" ancho={3800} nubes={4} />
      {/* montañas azules de Java al fondo */}
      <path d="M -400 520 L 200 470 L 700 360 L 1000 430 L 1400 380 L 1800 300 L 2200 420 L 2700 400 L 3400 500 L 3400 600 L -400 600 Z" fill={"#9AAAA4"} />
      <path d="M -400 560 Q 600 520 1400 545 Q 2200 520 3400 560 L 3400 700 L -400 700 Z" fill={"#7E9A78"} />
      {vacia ? <Humo x={1900} y={520} s={1.4} color={"#A8A49A"} /> : null}
      {/* el castillo de Batavia */}
      <Fuerte x={330} y={690} s={0.85} fase={1} />
      <rect x={-400} y={688} width={1000} height={20} fill={"#A49880"} />
      {/* casas a lo largo del canal: encaladas, con gablete */}
      {[
        [700, 150, 300, "escalon"],
        [856, 130, 260, "campana"],
        [992, 160, 320, "cuello"],
        [1158, 140, 280, "punta"],
        [1304, 170, 330, "escalon"],
        [1480, 150, 300, "cornisa"],
        [1636, 140, 290, "campana"],
        [1782, 160, 310, "escalon"],
        [1948, 150, 300, "punta"],
        [2104, 150, 280, "cuello"],
      ].map(([x, w, h, t], i) => (
        <CasaGablete key={i} x={x as number} base={690} w={w as number} h={h as number} tipo={t as "escalon"} semilla={s * 13 + i} tono={i % 2 ? 3 : 0} />
      ))}
      {/* ayuntamiento con cupula */}
      <g transform="translate(2420 690)">
        <rect x={-180} y={-260} width={360} height={260} fill={"#EFE8D8"} />
        <rect x={-190} y={-270} width={380} height={18} fill={"#D9D0BC"} />
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i}>
            <rect x={-160 + i * 56} y={-230} width={34} height={70} fill={"#3A4846"} />
            <rect x={-160 + i * 56} y={-130} width={34} height={70} fill={"#3A4846"} />
          </g>
        ))}
        <path d="M -200 -270 L 0 -340 L 200 -270 Z" fill={"#9A4A34"} />
        <rect x={-30} y={-400} width={60} height={70} fill={"#EFE8D8"} />
        <path d="M -40 -400 Q 0 -460 40 -400 Z" fill={"#9A4A34"} />
        <rect x={-30} y={-80} width={60} height={80} fill={"#3A2E24"} />
      </g>
      {[620, 1460, 2240].map((px, i) => (
        <Palmera key={px} x={px} y={700} s={0.7} semilla={i + 3} />
      ))}
      {/* el canal */}
      <rect x={-400} y={700} width={3800} height={14} fill={C.piedraMedia} />
      <Agua y={714} ancho={3800} alto={110} color={"#7A8A70"} />
      {!vacia ? (
        <g>
          <g transform={`translate(${900 + f * 0.6} 770)`}>
            <path d="M -110 -10 L 110 -10 Q 130 -10 120 6 L 100 20 L -100 20 Q -120 6 -110 -10 Z" fill={"#5A3F2E"} />
            <path d="M -60 -10 Q 0 -60 60 -10 Z" fill={"#A88A54"} />
            <circle cx={90} cy={-34} r={12} fill={"#C38E68"} />
            <rect x={80} y={-22} width={20} height={14} fill={"#2F3A50"} />
          </g>
        </g>
      ) : null}
      <rect x={-400} y={822} width={3800} height={12} fill={C.piedraMedia} />
      {/* estanques de peces junto a la costa, con bruma y mosquitos */}
      <g>
        <rect x={2620} y={600} width={900} height={500} fill={"#8A9A70"} />
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <rect x={2660 + k * 0} y={620 + k * 140} width={600} height={110} fill={"#7A948C"} />
            <rect x={2660} y={612 + k * 140} width={600} height={10} fill={"#9A8A6A"} />
          </g>
        ))}
        {Array.from({ length: 30 }).map((_, i) => (
          <g key={i} transform={`translate(${2680 + rnd(i, 1) * 560 + Math.sin(f * 0.3 + i) * 8} ${600 + rnd(i, 2) * 380 + Math.cos(f * 0.25 + i) * 8})`}><circle r={2.6} fill={"#2A2420"} /><path d={`M -5 ${-2 - (f % 4)} L 0 0 L 5 ${-2 - (f % 4)}`} stroke={"#2A2420"} strokeWidth={1} fill="none" opacity={0.6} /></g>
        ))}
        <rect x={2600} y={560} width={900} height={500} fill={"#F2EFE6"} opacity={0.18 + Math.sin(f * 0.03) * 0.05} />
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d={`M ${2640 + i * 60} 1000 q -6 -60 4 -100 M ${2650 + i * 60} 1000 q 10 -50 18 -80`} stroke={"#5E7A50"} strokeWidth={4} fill="none" />
        ))}
      </g>
      {/* la calle del mercado */}
      <rect x={-400} y={834} width={3020} height={300} fill={"#B9A88A"} />
      <rect x={-400} y={834} width={3020} height={300} fill="url(#vocAdoquin)" opacity={0.35} />
      <Puesto x={620} y={1000} w={260} toldo={"#B8402A"} genero="porcelana" cerrado={vacia} />
      <Puesto x={1060} y={990} w={220} toldo={"#2E5A4E"} genero="frutas" cerrado={vacia} />
      <Puesto x={1460} y={1000} w={260} toldo={"#E8B33C"} genero="telas" cerrado={vacia} />
      <Puesto x={1900} y={990} w={240} toldo={"#7A3A5A"} genero="especias" cerrado={vacia} />
      {vacia ? (
        <g>
          <path d="M 940 1050 l 40 -8 l 26 14 l -50 8 Z" fill={"#B08A54"} />
          <circle cx={1004} cy={1052} r={8} fill={"#E2B24A"} />
          <circle cx={1400} cy={1060} r={8} fill={"#C8602A"} />
          <rect x={1760} y={1040} width={50} height={14} fill={"#A88A54"} transform="rotate(20 1785 1047)" />
        </g>
      ) : null}
      {/* gente del mercado */}
      {Array.from({ length: Math.round(9 * gente) }).map((_, i) => {
        const trajes: Traje[] = ["chino", "java", "bandaMujer", "burgues", "chino", "java", "mujer", "soldado", "bandaMujer"];
        const tr = trajes[(i + s) % trajes.length];
        if (i % 3 === 2)
          return <Paseante key={i} x0={500 + i * 220} y={1060} v={(i % 2 ? -1 : 1) * 0.7} escala={0.6} traje={tr} semilla={s * 41 + i} carga={tr === "java" ? "saco" : "ninguna"} />;
        return (
          <Figura
            key={i}
            x={720 + i * 160 + (i % 2) * 30}
            y={1050 + (i % 2) * 20}
            escala={0.62}
            traje={tr}
            semilla={s * 41 + i}
            pose={i % 4 === 0 ? "habla" : i % 4 === 1 ? "ofrece" : "quieto"}
            mirada={i % 2 ? -0.7 : 0.7}
          />
        );
      })}
      {!vacia ? <Gaviotas n={3} x0={400} y0={180} ancho={1800} /> : null}
    </g>
  );
};

export const batavia: Decorado = {
  desc: "Batavia: el castillo con baluartes y bandera, casas encaladas con gablete a lo largo del canal, el ayuntamiento con cupula, palmeras, montañas de Java; en primer termino el mercado con puestos de porcelana, fruta, telas y especias, y gente china, javanesa y neerlandesa; a la derecha, estanques de peces con bruma y mosquitos",
  ancho: 2880,
  admite: "variante 'vacia' (mercado cerrado y vacio, cestas abandonadas, humo a lo lejos: para 1740, sin violencia); gente; semilla",
  tomas: {
    general: { de: { x: 1100, y: 560, z: 1.0 }, a: { x: 1300, y: 560, z: 1.05 }, desc: "Batavia: castillo, canal y mercado" },
    castillo: { de: { x: 420, y: 520, z: 1.8 }, a: { x: 380, y: 500, z: 2.0 }, desc: "el castillo de Batavia" },
    canal: { de: { x: 1300, y: 600, z: 1.7 }, a: { x: 1600, y: 600, z: 1.7 }, desc: "las casas a lo largo del canal" },
    mercado: { de: { x: 1250, y: 800, z: 1.8 }, a: { x: 1450, y: 790, z: 1.9 }, desc: "el mercado y su gente" },
    estanques: { de: { x: 2560, y: 760, z: 1.8 }, a: { x: 2620, y: 740, z: 2.0 }, desc: "los estanques de peces con mosquitos" },
    calle: { de: { x: 900, y: 760, z: 1.4 }, a: { x: 1900, y: 760, z: 1.4 }, desc: "paneo por la calle del mercado" },
    puestos: { de: { x: 760, y: 860, z: 2.6 }, a: { x: 800, y: 860, z: 2.9 }, desc: "el puesto de porcelana, de cerca" },
  },
  dibujo: DibujoBatavia,
};

/* ------------------------------------------------------------------ */
/* 2. Dejima, frente a Nagasaki                                        */
/* ------------------------------------------------------------------ */

const Kura: React.FC<{ x: number; y: number; w: number; s?: number }> = ({ x, y, w, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={-70} width={w} height={70} fill={"#F2EEE4"} />
    <rect x={0} y={-18} width={w} height={18} fill={"#3A3A3A"} />
    {Array.from({ length: Math.floor(w / 14) }).map((_, i) => (
      <path key={i} d={`M ${i * 14 + 7} -18 L ${i * 14} 0`} stroke={"#F2EEE4"} strokeWidth={2} />
    ))}
    <rect x={w * 0.4} y={-56} width={w * 0.2} height={20} fill={"#3A3A3A"} />
    <path d={`M -14 -70 L ${w + 14} -70 L ${w - 10} -104 L 10 -104 Z`} fill={"#3E4448"} />
    <path d={`M -14 -70 L ${w + 14} -70`} stroke={"#2A2E30"} strokeWidth={5} />
    {Array.from({ length: Math.floor(w / 12) }).map((_, i) => (
      <path key={i} d={`M ${i * 12 + 4} -72 L ${i * 11 + 14} -102`} stroke={"#2E3438"} strokeWidth={2} />
    ))}
  </g>
);

const BarcoJapones: React.FC<{ x0: number; y: number; v?: number; s?: number; fase?: number }> = ({ x0, y, v = 0.3, s = 1, fase = 0 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x0 + v * f} ${y + Math.sin(f * 0.07 + fase) * 3}) scale(${s})`}>
      <path d="M -150 -20 L 140 -20 Q 180 -40 190 -70 L 170 10 L -130 10 Q -160 0 -150 -20 Z" fill={"#6A4A30"} />
      <rect x={-130} y={-60} width={140} height={40} fill={"#7A5A3C"} />
      <path d="M -120 -60 L 0 -60 L -10 -80 L -110 -80 Z" fill={"#4A4A4A"} />
      <rect x={20} y={-300} width={8} height={280} fill={"#5E4A38"} />
      <rect x={-50} y={-290} width={150} height={190} fill={"#EDE4CC"} />
      {[0, 1, 2, 3, 4].map((k) => (
        <path key={k} d={`M ${-50 + k * 30} -290 V -100`} stroke={"#B9A27E"} strokeWidth={2} />
      ))}
    </g>
  );
};

const DibujoDejima: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  return (
    <g>
      <Defs />
      <CieloVoc hora={e.hora} ancho={3400} nubes={4} />
      {/* colinas de Nagasaki con pinos y terrazas */}
      <path d="M -400 600 L -200 360 Q 0 260 300 300 Q 600 200 900 290 Q 1200 220 1500 320 Q 1900 260 2300 380 L 2800 600 Z" fill={"#6E8A64"} />
      {Array.from({ length: 6 }).map((_, k) => (
        <path key={k} d={`M ${-300 + k * 40} ${420 + k * 30} Q 800 ${360 + k * 30} ${2000 - k * 40} ${420 + k * 30}`} stroke={"#5E7A56"} strokeWidth={3} fill="none" />
      ))}
      {Array.from({ length: 18 }).map((_, i) => {
        const px = -200 + rnd(i, 3) * 2600;
        const py = 330 + rnd(i, 4) * 180;
        return (
          <g key={i} transform={`translate(${px} ${py})`}>
            <rect x={-3} y={-10} width={6} height={30} fill={"#4A3A2C"} />
            <ellipse cx={0} cy={-18} rx={26} ry={10} fill={C.hojaOsc} />
            <ellipse cx={4} cy={-30} rx={18} ry={8} fill={C.hojaOsc} />
          </g>
        );
      })}
      {/* tejados de la ciudad junto a la orilla */}
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} transform={`translate(${-300 + i * 100} ${600 - (i % 3) * 12})`}>
          <rect x={0} y={-40} width={90} height={40} fill={"#E8E2D4"} />
          <path d="M -10 -40 L 100 -40 L 80 -66 L 10 -66 Z" fill={"#4A5054"} />
        </g>
      ))}
      <rect x={-400} y={598} width={1500} height={20} fill={"#9A8A6A"} />
      <Agua y={610} ancho={3400} alto={500} color={"#6A8A8A"} mar />
      {/* el puente a tierra con la caseta de guardia */}
      <g>
        <path d="M 700 640 L 980 680 L 980 696 L 700 656 Z" fill={"#6E4B35"} />
        {[740, 800, 860, 920].map((px, i) => (
          <rect key={px} x={px} y={650 + i * 8} width={8} height={40} fill={"#4A3326"} />
        ))}
        <g transform="translate(680 610)">
          <rect x={-40} y={-50} width={80} height={50} fill={"#E8E2D4"} />
          <path d="M -54 -50 L 54 -50 L 36 -80 L -36 -80 Z" fill={"#3E4448"} />
        </g>
        <Figura x={760} y={652} escala={0.16} traje="japones" semilla={s * 3 + 1} />
        <Figura x={880} y={672} escala={0.16} traje="burgues" semilla={s * 3 + 2} />
      </g>
      {/* la isla en abanico */}
      <path d="M 960 650 Q 1500 610 2040 650 L 2160 780 Q 1500 740 840 780 Z" fill={"#B9AC91"} />
      <path d="M 840 780 Q 1500 740 2160 780 L 2160 806 Q 1500 766 840 806 Z" fill={"#8C8068"} />
      {Array.from({ length: 20 }).map((_, i) => (
        <path key={i} d={`M ${860 + i * 66} ${784 - Math.sin((i / 19) * Math.PI) * 38} v 22`} stroke={"#6E6250"} strokeWidth={2} />
      ))}
      <path d="M 960 650 Q 1500 610 2040 650 L 2060 664 Q 1500 624 940 664 Z" fill={"#9A8E74"} />
      <Kura x={1000} y={700} w={150} />
      <Kura x={1180} y={690} w={170} />
      <Kura x={1560} y={690} w={160} />
      <Kura x={1750} y={700} w={150} />
      <Kura x={1100} y={770} w={160} s={1.05} />
      <Kura x={1700} y={770} w={170} s={1.05} />
      {/* casa del jefe de la factoria, con galeria */}
      <g transform="translate(1440 760)">
        <rect x={-80} y={-110} width={160} height={110} fill={"#E2D6BC"} />
        <rect x={-90} y={-60} width={180} height={10} fill={"#6E4B35"} />
        {[-70, -35, 0, 35, 70].map((px) => (
          <rect key={px} x={px - 3} y={-60} width={6} height={60} fill={"#6E4B35"} />
        ))}
        <path d="M -100 -110 L 100 -110 L 70 -150 L -70 -150 Z" fill={"#3E4448"} />
      </g>
      <rect x={1396} y={480} width={6} height={200} fill={"#3A2A1E"} />
      <Bandera x={1402} y={480} w={90} h={56} fase={2} voc={false} />
      {[1300, 1640].map((px, i) => (
        <Figura key={px} x={px} y={742} escala={0.14} traje={i ? "japones" : "burgues"} semilla={s * 5 + i} />
      ))}
      {/* barcos */}
      <Retourschip x={2400} y={850} s={0.42} velas="recogidas" fase={1} espejo />
      <BarcoJapones x0={300} y={900} v={0.4} s={0.6} />
      <BarcoJapones x0={2000} y={700} v={-0.25} s={0.35} fase={2} />
      {/* muelle en primer termino: el trato */}
      <g>
        <rect x={-400} y={960} width={1300} height={140} fill={"#6E4B35"} />
        <rect x={-400} y={954} width={1300} height={8} fill={"#87603F"} />
        {/* lingotes de cobre, cajas de plata y fardos de seda */}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={340 + (i % 3) * 34} y={940 - Math.floor(i / 3) * 14} width={30} height={12} fill={"#B87333"} />
        ))}
        <rect x={150} y={900} width={110} height={60} fill={"#5A3A24"} />
        <rect x={150} y={900} width={110} height={10} fill={"#7A5A3C"} />
        <circle cx={205} cy={932} r={13} fill="none" stroke={"#E8E2D4"} strokeWidth={3} />
        <path d="M 197 932 h 16 M 205 924 v 16" stroke={"#E8E2D4"} strokeWidth={3} />
        {[560, 620].map((bx, i) => (
          <g key={bx}>
            <rect x={bx} y={900 + i * 10} width={56} height={60 - i * 10} rx={10} fill={["#C8402C", "#E8D8A8"][i]} />
            <path d={`M ${bx} ${920 + i * 10} h 56`} stroke={"#6A4A30"} strokeWidth={3} />
          </g>
        ))}
        <Figura x={20} y={1070} escala={0.7} traje="japones" semilla={s * 7 + 1} pose="habla" mirada={0.7} />
        <Figura x={-110} y={1080} escala={0.68} traje="japones" semilla={s * 7 + 3} pose="lee" objeto="papel" mirada={0.5} />
        <Figura x={800} y={1070} escala={0.7} traje="burgues" semilla={s * 7 + 2} pose="manos" mirada={-0.7} sombrero />
      </g>
      <Gaviotas n={4} x0={600} y0={120} ancho={1800} />
    </g>
  );
};

export const dejima: Decorado = {
  desc: "Dejima: la isla artificial en abanico frente a Nagasaki, con almacenes de paredes blancas y tejado oscuro, la casa del jefe y la bandera neerlandesa, unida a tierra por un puente con caseta de guardia; colinas con pinos y terrazas, barco de la VOC fondeado y barcos japoneses; en primer termino, un muelle donde oficiales japoneses y un mercader neerlandes tratan junto a lingotes de cobre, plata y seda",
  ancho: 2400,
  admite: "semilla; hora",
  tomas: {
    general: { de: { x: 1100, y: 560, z: 1.0 }, a: { x: 1300, y: 560, z: 1.04 }, desc: "la bahia de Nagasaki y Dejima" },
    isla: { de: { x: 1450, y: 680, z: 1.9 }, a: { x: 1500, y: 670, z: 2.1 }, desc: "la isla en abanico y sus almacenes" },
    puente: { de: { x: 820, y: 600, z: 2.8 }, a: { x: 840, y: 590, z: 3.1 }, desc: "el puente y la caseta de guardia" },
    trato: { de: { x: 380, y: 800, z: 1.9 }, a: { x: 360, y: 790, z: 2.1 }, desc: "oficiales japoneses y un mercader con cobre, plata y seda" },
    bahia: { de: { x: 1800, y: 700, z: 1.5 }, a: { x: 2000, y: 690, z: 1.5 }, desc: "el barco de la Compañia fondeado" },
  },
  dibujo: DibujoDejima,
};

