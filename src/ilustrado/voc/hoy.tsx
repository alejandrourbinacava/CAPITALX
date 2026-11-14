import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../../theme";
import { suaveM, type Decorado, type PropsDecorado } from "../tipos";
import { Agua, C, CieloVoc, Defs, Gaviotas, rnd } from "./comun";
import { Figura, Paseante, rasgosVoc, type Traje } from "./Gente";
import { CasaGablete, Hilera, Olmo } from "./canal";
import { PIELES, type Rasgos } from "../../piloto/Personajes";

/** Rasgos de las personas reales que salen en la sala de hoy (por `variante`). */
const CONOCIDOS: Record<string, Rasgos> = {
  balkenende: { abrigo: "#2A3036", piel: PIELES[0], pelo: "#5E4330", peinado: "raya", gafas: true, edad: "maduro", bigote: "ninguno", barba: "ninguna", sombrero: "ninguno" },
  marijnissen: { abrigo: "#2A3036", piel: PIELES[0], pelo: "#A8988A", peinado: "corto", gafas: false, edad: "mayor", bigote: "ninguno", barba: "ninguna", sombrero: "ninguno" },
  rutte: { abrigo: "#2A3036", piel: PIELES[0], pelo: "#7A5E44", peinado: "corto", gafas: false, edad: "maduro", bigote: "ninguno", barba: "ninguna", sombrero: "ninguno" },
  schalk: { piel: PIELES[1], pelo: "#5E4330", peinado: "corto", gafas: false, edad: "joven", bigote: "ninguno", barba: "ninguna", sombrero: "ninguno" },
};

/* ------------------------------------------------------------------ */
/* Bicicletas                                                          */
/* ------------------------------------------------------------------ */

const Rueda: React.FC<{ x: number; y: number; r: number; giro: number }> = ({ x, y, r, giro }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="none" stroke={"#1E1E22"} strokeWidth={6} />
    <g transform={`rotate(${giro})`} stroke={"#8A8A8A"} strokeWidth={1.5}>
      {[0, 30, 60, 90, 120, 150].map((a) => (
        <path key={a} d={`M ${-r} 0 H ${r}`} transform={`rotate(${a})`} />
      ))}
    </g>
    <circle r={5} fill={"#4A4A4A"} />
  </g>
);

/** Bicicleta holandesa aparcada o con ciclista. `x0` posicion inicial, `v` px/fotograma. */
const Bici: React.FC<{ x0: number; y: number; v?: number; s?: number; color?: string; semilla?: number; ciclista?: boolean }> = ({ x0, y, v = 0, s = 1, color = "#2A2A2A", semilla = 1, ciclista }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  const giro = f * v * 3;
  const dir = v < 0 ? -1 : 1;
  const r = rasgosVoc(rnd(semilla, 2) > 0.5 ? "moderno" : "moderna", semilla);
  const ropa = ["#C8402C", "#2F4A7A", "#E8B33C", "#3A3A44", "#5E8A5A"][Math.floor(rnd(semilla, 3) * 5)];
  const pedal = Math.sin(f * 0.25 * Math.abs(v) + semilla);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      <Rueda x={-70} y={-46} r={46} giro={giro} />
      <Rueda x={70} y={-46} r={46} giro={giro} />
      <path d="M -70 -46 L -20 -46 L 30 -120 L -40 -120 Z M -20 -46 L -40 -130 M 30 -120 L 70 -46 M 30 -120 L 40 -150" fill="none" stroke={color} strokeWidth={7} strokeLinejoin="round" />
      <rect x={-56} y={-138} width={36} height={8} rx={4} fill={"#3A2E24"} />
      <path d="M 26 -152 L 56 -150" stroke={"#1E1E22"} strokeWidth={6} />
      <rect x={58} y={-110} width={34} height={22} fill={"#3A3430"} opacity={0.8} />
      {ciclista ? (
        <g>
          <path d={`M -36 -136 L ${-10 + pedal * 20} -70 L ${-20 + pedal * 20} -46`} stroke={"#2F3A50"} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d={`M -36 -136 L ${-10 - pedal * 20} -76 L ${-20 - pedal * 20} -50`} stroke={"#26303F"} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d="M -50 -140 Q -46 -230 -10 -250 L 10 -244 Q 0 -190 -14 -140 Z" fill={ropa} />
          <path d="M 0 -232 L 40 -160" stroke={ropa} strokeWidth={16} strokeLinecap="round" />
          <circle cx={42} cy={-156} r={8} fill={r.piel} />
          <g transform="translate(-4 -290) scale(0.62)">
            <path d="M -28 -16 Q -30 -44 0 -46 Q 26 -44 28 -18 L 30 -6 L 40 6 L 30 10 L 30 20 Q 26 36 6 38 Q -20 36 -26 18 Z" fill={r.piel} />
            <path d="M -30 -10 Q -34 -46 0 -50 Q 24 -48 28 -26 Q 10 -34 -6 -30 Q -16 -24 -18 -8 Z" fill={r.pelo} />
            <circle cx={18} cy={-8} r={3} fill={"#2A2420"} />
          </g>
        </g>
      ) : null}
    </g>
  );
};

/** Barco turistico de techo de cristal. */
const BarcoCristal: React.FC<{ x0: number; y: number; v?: number; s?: number }> = ({ x0, y, v = 0.8, s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x0 + v * f} ${y + Math.sin(f * 0.07) * 2}) scale(${s})`}>
      <path d="M -300 -30 L 300 -30 Q 340 -30 320 0 L 290 20 L -280 20 Q -320 0 -300 -30 Z" fill={"#2F3A50"} />
      <rect x={-280} y={-90} width={540} height={60} rx={20} fill={"#9AB0B4"} opacity={0.85} />
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={i}>
          <path d={`M ${-260 + i * 60} -90 V -30`} stroke={"#5A6A70"} strokeWidth={3} />
          <circle cx={-230 + i * 60} cy={-58} r={10} fill={["#EBC9A6", "#C38E68", "#E2B892", "#7E5139"][i % 4]} />
        </g>
      ))}
      <rect x={-300} y={-36} width={600} height={8} fill={"#F2EEE4"} />
    </g>
  );
};

/** Estatua de bronce sobre pedestal (un tipo con jubon y sombrero en la mano). */
const Estatua: React.FC<{ x: number; y: number; s?: number; placa?: string }> = ({ x, y, s = 1, placa }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-80} width={300} height={80} fill={"#B9AC91"} />
    <rect x={-120} y={-420} width={240} height={340} fill={"#C8BDA4"} />
    <rect x={-136} y={-440} width={272} height={26} fill={"#B9AC91"} />
    <rect x={-136} y={-100} width={272} height={22} fill={"#B9AC91"} />
    {placa ? (
      <g>
        <rect x={-90} y={-300} width={180} height={90} fill={"#5E6A5E"} />
        <text x={0} y={-244} textAnchor="middle" fontFamily={FONT.serif} fontSize={34} fill={"#D9D0BC"}>
          {placa}
        </text>
      </g>
    ) : null}
    <g fill={"#4D5A4C"}>
      <path d="M -60 -440 L -50 -620 L 50 -620 L 60 -440 Z" />
      <path d="M -40 -620 L -70 -800 Q 0 -830 70 -800 L 40 -620 Z" />
      <path d="M -70 -800 L -120 -680 L -96 -670 L -52 -760 Z" />
      <path d="M 70 -800 L 130 -730 L 120 -710 L 60 -760 Z" />
      <ellipse cx={0} cy={-806} rx={60} ry={16} fill={"#66756A"} />
      <circle cx={0} cy={-850} r={36} />
      <path d="M 116 -726 Q 150 -760 170 -720 Q 150 -700 116 -726 Z" />
    </g>
    <path d="M -40 -620 L -70 -800 L -50 -800 L -24 -620 Z" fill={"#66756A"} />
  </g>
);

/* ------------------------------------------------------------------ */
/* 1. Amsterdam y Hoorn, noviembre de 2026                             */
/* ------------------------------------------------------------------ */

const DibujoHoy: React.FC<PropsDecorado> = ({ e }) => {
  const s = e.semilla ?? 1;
  const gente = e.gente ?? 0.8;
  const placa = e.textos?.placa ?? "J.P. COEN";
  return (
    <g>
      <Defs />
      <CieloVoc hora={e.hora ?? "dia"} ancho={4600} nubes={8} />
      {/* --- Amsterdam: las mismas casas, hoy --- */}
      <Hilera x0={-300} x1={1900} base={600} semilla={5} moderna luz={e.hora === "tarde" || e.hora === "noche"} />
      <rect x={-400} y={600} width={2320} height={50} fill={"#8E8A80"} />
      {[160, 760, 1360].map((tx, i) => (
        <Olmo key={tx} x={tx} y={648} s={0.8} semilla={i + 4} />
      ))}
      {/* bicis aparcadas en la barandilla */}
      {Array.from({ length: 16 }).map((_, i) => (
        <Bici key={i} x0={-100 + i * 70 + (i > 7 ? 500 : 0)} y={650} s={0.32} color={["#2A2A2A", "#7A2A22", "#2F4A7A", "#5A5048"][i % 4]} semilla={i} />
      ))}
      <rect x={-400} y={630} width={2320} height={4} fill={"#2A2A2A"} />
      {Array.from({ length: 40 }).map((_, i) => (
        <rect key={i} x={-380 + i * 58} y={612} width={4} height={22} fill={"#2A2A2A"} />
      ))}
      <Agua y={654} ancho={2400} alto={240} color={"#6E8480"} />
      <BarcoCristal x0={-200} y={780} v={0.9} s={0.8} />
      {/* muelle de delante con ciclistas y gente */}
      <rect x={-400} y={880} width={2320} height={220} fill={"#9A948A"} />
      <rect x={-400} y={872} width={2320} height={14} fill={C.piedra} />
      <rect x={-400} y={960} width={2320} height={70} fill={"#B8604A"} opacity={0.75} />
      {Array.from({ length: Math.round(4 * gente) }).map((_, i) => (
        <Bici key={i} x0={-300 + i * 520} y={1010} v={i % 2 ? -2.2 : 2.6} s={0.95} semilla={s * 7 + i} ciclista color={["#2A2A2A", "#7A2A22", "#2F4A7A"][i % 3]} />
      ))}
      {Array.from({ length: Math.round(4 * gente) }).map((_, i) => (
        <Paseante key={i} x0={200 + i * 420} y={940} v={(i % 2 ? 1 : -1) * 0.8} escala={0.6} traje={i % 2 ? "moderna" : "moderno"} semilla={s * 11 + i} />
      ))}
      {/* --- Hoorn: el Roode Steen con la estatua --- */}
      <rect x={1920} y={-300} width={20} height={1400} fill={"#000"} opacity={0} />
      <CasaGablete x={1960} base={720} w={260} h={420} tipo="escalon" semilla={41} tono={1} moderna />
      <CasaGablete x={2224} base={720} w={200} h={380} tipo="campana" semilla={42} tono={3} moderna />
      {/* la Waag de Hoorn */}
      <g transform="translate(2700 720)">
        <rect x={-260} y={-360} width={520} height={360} fill="url(#vocSillar)" />
        <path d="M -280 -360 L 0 -480 L 280 -360 Z" fill={"#6A4A3A"} />
        {[-200, -100, 0, 100, 200].map((wx) => (
          <g key={wx}>
            <rect x={wx - 30} y={-320} width={60} height={110} fill={C.cristal} />
            <path d={`M ${wx - 36} -320 Q ${wx} -350 ${wx + 36} -320`} fill={C.piedraMedia} />
          </g>
        ))}
        {[-160, 0, 160].map((ax) => (
          <path key={ax} d={`M ${ax - 50} 0 L ${ax - 50} -120 Q ${ax} -170 ${ax + 50} -120 L ${ax + 50} 0 Z`} fill={"#3A3430"} />
        ))}
      </g>
      <CasaGablete x={2980} base={720} w={220} h={400} tipo="cuello" semilla={43} moderna />
      <CasaGablete x={3204} base={720} w={190} h={360} tipo="punta" semilla={44} tono={1} moderna />
      <rect x={1900} y={720} width={1600} height={400} fill="url(#vocAdoquin)" />
      <Estatua x={2560} y={980} s={0.6} placa={placa} />
      {Array.from({ length: Math.round(5 * gente) }).map((_, i) => {
        const tr: Traje = i % 2 ? "moderna" : "moderno";
        return i % 2 ? (
          <Paseante key={i} x0={2000 + i * 300} y={1050} v={(i % 3 ? 1 : -1) * 0.7} escala={0.68} traje={tr} semilla={s * 17 + i} />
        ) : (
          <Figura key={i} x={[2040, 2950, 3250][i / 2]} y={1060} escala={0.68} traje={tr} semilla={s * 17 + i} pose={i === 2 ? "lee" : "quieto"} mirada={i % 3 ? 0.5 : -0.5} />
        );
      })}
      <Bici x0={3100} y={1000} s={0.6} semilla={3} />
      <Gaviotas n={5} x0={0} y0={100} ancho={3800} />
    </g>
  );
};

export const hoy: Decorado = {
  desc: "2026: un canal de Amsterdam con las mismas casas de gablete, bicis aparcadas, ciclistas y un barco de cristal; y (a la derecha del mundo) la plaza del Roode Steen de Hoorn con la Waag y la estatua de Coen en su pedestal",
  ancho: 3840,
  admite: "textos.placa (placa del pedestal; por defecto 'J.P. COEN'); gente; hora; semilla",
  tomas: {
    canal: { de: { x: 960, y: 560, z: 1.0 }, a: { x: 1060, y: 560, z: 1.06 }, desc: "Amsterdam hoy: canal, bicis y barco" },
    bicis: { de: { x: 700, y: 840, z: 2.2 }, a: { x: 900, y: 840, z: 2.2 }, desc: "ciclistas pasando" },
    fachadas: { de: { x: 600, y: 380, z: 1.9 }, a: { x: 800, y: 380, z: 2.0 }, desc: "las casas de siempre" },
    plaza: { de: { x: 2700, y: 560, z: 1.0 }, a: { x: 2760, y: 560, z: 1.05 }, desc: "Hoorn: la plaza, la Waag y la estatua" },
    estatua: { de: { x: 2560, y: 560, z: 2.0 }, a: { x: 2560, y: 500, z: 2.4 }, desc: "la estatua de Coen en su pedestal" },
    olmos: { de: { x: 760, y: 500, z: 1.7 }, a: { x: 900, y: 520, z: 1.8 }, desc: "los olmos y las bicis del canal" },
  },
  dibujo: DibujoHoy,
};

/* ------------------------------------------------------------------ */
/* 2. Interiores de hoy: pantallas, atril y archivo                    */
/* ------------------------------------------------------------------ */

const Pantalla: React.FC<{ x: number; y: number; w: number; h: number; titulo: string; cifra: string; serie: number[]; color?: string }> = ({ x, y, w, h, titulo, cifra, serie, color = "#5EC27A" }) => {
  const f = useCurrentFrame();
  const n = serie.length;
  const vis = Math.min(n, 2 + Math.floor(f / 4));
  const max = Math.max(...serie);
  const min = Math.min(...serie);
  const pts = serie.slice(0, vis).map((v, i) => `${x + 20 + (i / (n - 1)) * (w - 40)},${y + h - 20 - ((v - min) / Math.max(1, max - min)) * (h - 110)}`);
  return (
    <g>
      <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} rx={6} fill={"#1E1E22"} />
      <rect x={x} y={y} width={w} height={h} fill={"#121A1E"} />
      <text x={x + 20} y={y + 44} fontFamily={FONT.sans} fontWeight={700} fontSize={30} fill={"#D9DCD2"}>
        {titulo}
      </text>
      <text x={x + w - 20} y={y + 44} textAnchor="end" fontFamily={FONT.mono} fontSize={30} fill={color}>
        {cifra}
      </text>
      {[0.3, 0.5, 0.7].map((k) => (
        <path key={k} d={`M ${x + 10} ${y + h * k + 20} H ${x + w - 10}`} stroke={"#2A3438"} strokeWidth={1.5} />
      ))}
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={4} />
    </g>
  );
};

const DibujoSala: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  const t = e.textos ?? {};
  const serie = Array.from({ length: 30 }).map((_, i) => 100 + Math.sin(i * 0.7 + s) * 6 + i * 1.2 + rnd(i, s) * 5);
  const serie2 = Array.from({ length: 30 }).map((_, i) => 100 + Math.cos(i * 0.5 + s) * 8 + i * 0.8 + rnd(i, s + 3) * 6);
  const rotulo = t.rotulo ?? "";
  const aparece = suaveM(f / 30);
  return (
    <g>
      <Defs />
      {/* --- zona 1: oficina con pantallas (x 0..1920) --- */}
      <rect x={-300} y={-200} width={6000} height={1500} fill={"#2E3236"} />
      <rect x={-300} y={-200} width={2240} height={1300} fill={"#3A4044"} />
      {/* ventanal con la ciudad */}
      <rect x={60} y={80} width={1800} height={500} fill={"#8EA0A8"} />
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={80 + i * 130} y={360 - (i % 4) * 50} width={110} height={220 + (i % 4) * 50} fill={"#6A7C84"} />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={60 + i * 225} y={80} width={10} height={500} fill={"#2A2E30"} />
      ))}
      <Pantalla x={140} y={300} w={760} h={360} titulo={t.indice ?? "AEX"} cifra={t.cifra ?? ""} serie={serie} />
      <Pantalla x={1020} y={300} w={760} h={360} titulo={t.empresa ?? ""} cifra={t.cifra2 ?? ""} serie={serie2} color={"#E8B33C"} />
      <rect x={-300} y={700} width={2240} height={500} fill={"#4A4E52"} />
      <rect x={60} y={760} width={1800} height={30} fill={"#D9D6CC"} />
      <rect x={60} y={790} width={1800} height={300} fill={"#5A5E62"} />
      {[300, 760, 1220, 1680].map((px, i) => (
        <Figura key={px} x={px} y={900} escala={0.6} traje={i % 2 ? "moderna" : "moderno"} semilla={s * 3 + i} cuerpo="busto" pose={i % 2 ? "escribe" : "quieto"} mirada={i % 2 ? 0.4 : -0.4} />
      ))}
      <rect x={60} y={760} width={1800} height={30} fill={"#D9D6CC"} />
      {[300, 760, 1220, 1680].map((px, i) => (
        <g key={px}>
          <path d={`M ${px + 70} 760 L ${px + 80} 704 L ${px + 170} 704 L ${px + 160} 760 Z`} fill={"#2A2E30"} />
          <rect x={px + 84} y={710} width={80} height={44} fill={i % 2 ? "#3A5A4A" : "#3A4A5A"} transform={`skewX(-8)`} opacity={0.0} />
          <rect x={px + 60} y={756} width={120} height={6} fill={"#1E1E22"} />
          <rect x={px - 120} y={748} width={60} height={12} fill={"#F2EEE4"} />
          <rect x={px - 40} y={744} width={22} height={16} rx={4} fill={["#C8402C", "#E8B33C", "#2F4A7A", "#F2EEE4"][i]} />
        </g>
      ))}
      {/* --- zona 2: atril para un discurso (x 2000..3900) --- */}
      <rect x={1980} y={-200} width={1960} height={1400} fill={"#D9D2C2"} />
      <rect x={1980} y={-200} width={1960} height={1400} fill="url(#vocSillar)" opacity={0.25} />
      {/* bandera y fondo */}
      <g>
        <rect x={2660} y={120} width={600} height={360} fill={"#2E3A44"} />
        <text x={2960} y={320} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={rotulo.length > 18 ? 40 : 54} fill={"#F2EEE4"} opacity={aparece}>
          {rotulo}
        </text>
        <rect x={2440} y={80} width={8} height={640} fill={"#9A9A9A"} />
        {[C.carmin, "#F2EEE4", "#2F4A7A"].map((c, k) => (
          <path key={k} d={`M 2448 ${100 + k * 60} q 60 ${10 + Math.sin(f * 0.05) * 6} 120 0 v 60 q -60 ${10 + Math.sin(f * 0.05) * 6} -120 0 Z`} fill={c} />
        ))}
      </g>
      <rect x={1980} y={720} width={1960} height={500} fill={"#8A7A64"} />
      {/* el orador tras el atril */}
      <Figura x={2960} y={870} escala={0.95} traje="moderno" semilla={s * 5 + 9} rasgos={CONOCIDOS[e.variante ?? ""] ?? rasgosVoc("moderno", s * 5 + 9, false, { piel: PIELES[Math.floor(rnd(s, 7) * 3)] })} cuerpo="busto" pose="habla" gesto="serio" mirada={0.1} />
      <g>
        <path d="M 2860 640 L 3060 640 L 3040 1000 L 2880 1000 Z" fill={"#5A4636"} />
        <rect x={2850} y={630} width={220} height={20} fill={"#6E5A48"} />
        <path d="M 2900 630 Q 2890 600 2905 580" stroke={"#1E1E22"} strokeWidth={5} fill="none" />
        <ellipse cx={2907} cy={574} rx={7} ry={11} fill={"#1E1E22"} />
      </g>
      {/* publico de espaldas */}
      {Array.from({ length: 7 }).map((_, i) => {
        const r = rasgosVoc(i % 2 ? "moderna" : "moderno", s * 9 + i);
        return (
          <g key={i} transform={`translate(${2200 + i * 260} ${1060 + (i % 2) * 20})`}>
            <path d="M -110 60 Q -116 -110 -70 -150 Q 0 -170 70 -150 Q 116 -110 110 60 Z" fill={["#2F3A50", "#5A5048", "#3A3A44", "#6A3A34"][i % 4]} />
            <ellipse cx={0} cy={-210} rx={52} ry={60} fill={r.pelo} />
          </g>
        );
      })}
      {/* --- zona 3: el archivo (x 4000..5900) --- */}
      <rect x={3960} y={-200} width={2000} height={1400} fill={"#C9C6BC"} />
      {Array.from({ length: 6 }).map((_, k) => (
        <g key={k} transform={`translate(${4040 + k * 300} 0)`}>
          <rect x={0} y={100} width={260} height={860} fill={"#8A8E90"} />
          {Array.from({ length: 6 }).map((_, j) => (
            <g key={j}>
              <rect x={10} y={120 + j * 140} width={240} height={120} fill={"#3A3430"} />
              {Array.from({ length: 7 }).map((__, b) => (
                <g key={b}>
                  <rect x={16 + b * 33} y={130 + j * 140 + (b % 2) * 4} width={30} height={108 - (b % 2) * 4} fill={["#6A4A30", "#5A3A24", "#7A5A3C", "#4A3426"][(b + j + k) % 4]} />
                  <rect x={20 + b * 33} y={160 + j * 140} width={22} height={12} fill={"#E8DFC8"} />
                </g>
              ))}
            </g>
          ))}
          <rect x={0} y={960} width={260} height={30} fill={"#5A5E62"} />
          <circle cx={130} cy={530} r={16} fill={"#5A5E62"} />
        </g>
      ))}
      <rect x={3960} y={990} width={2000} height={300} fill={"#9A968C"} />
      <g transform="translate(4950 860)">
        <rect x={-200} y={0} width={400} height={20} fill={"#D9D6CC"} />
        <rect x={-180} y={20} width={14} height={120} fill={"#5A5E62"} />
        <rect x={166} y={20} width={14} height={120} fill={"#5A5E62"} />
        <path d="M -150 0 L -20 -10 L -10 -60 L -140 -50 Z" fill={"#E6D4A8"} />
        <path d="M 0 -10 L 150 0 L 140 -50 L 10 -60 Z" fill={"#EADCB4"} />
        <path d="M -120 -40 h 90 M -120 -28 h 80 M 30 -40 h 90 M 30 -28 h 70" stroke={"#6A5A44"} strokeWidth={3} />
      </g>
      <Figura x={5180} y={1060} escala={0.7} traje={e.variante === "schalk" ? "moderno" : "moderna"} rasgos={e.variante === "schalk" ? CONOCIDOS.schalk : undefined} semilla={s * 13 + 1} pose="lee" objeto="papel" mirada={-0.5} />
    </g>
  );
};

export const sala2026: Decorado = {
  desc: "Interiores de hoy, en tres zonas: una oficina con pantallas de cotizaciones frente a un ventanal; una sala con atril, bandera neerlandesa, un orador y publico de espaldas; y un archivo con estanterias de legajos antiguos y una investigadora",
  ancho: 5900,
  admite:
    "variante del orador (persona real): balkenende | marijnissen | rutte; variante 'schalk' pone en el archivo a un estudiante joven; textos.indice y cifra (pantalla izquierda: p. ej. 'AEX' / '1.140'), textos.empresa y cifra2 (pantalla derecha: p. ej. 'ASML'); textos.rotulo (el panel tras el atril); semilla cambia al orador",
  tomas: {
    pantallas: { de: { x: 960, y: 520, z: 1.0 }, a: { x: 960, y: 500, z: 1.08 }, desc: "la oficina con las pantallas" },
    indice: { de: { x: 520, y: 470, z: 2.0 }, a: { x: 540, y: 480, z: 2.3 }, desc: "la pantalla del indice" },
    empresa: { de: { x: 1400, y: 470, z: 2.0 }, a: { x: 1380, y: 480, z: 2.3 }, desc: "la pantalla de la empresa" },
    atril: { de: { x: 2960, y: 560, z: 1.0 }, a: { x: 2960, y: 540, z: 1.1 }, desc: "la sala con el atril y el publico" },
    orador: { de: { x: 2960, y: 560, z: 2.0 }, a: { x: 2960, y: 560, z: 2.4 }, desc: "el orador hablando" },
    archivo: { de: { x: 4800, y: 540, z: 1.05 }, a: { x: 5000, y: 540, z: 1.1 }, desc: "el archivo con los legajos de la VOC" },
    publico: { de: { x: 2960, y: 760, z: 1.6 }, a: { x: 2960, y: 700, z: 1.8 }, desc: "el publico escucha al orador" },
    legajos: { de: { x: 4560, y: 400, z: 2.2 }, a: { x: 4700, y: 420, z: 2.4 }, desc: "legajos antiguos en las estanterias" },
  },
  dibujo: DibujoSala,
};

