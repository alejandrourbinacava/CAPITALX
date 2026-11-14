import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../../theme";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloVoc, Defs, Monograma, rnd } from "./comun";
import { Figura, Paseante, type Traje } from "./Gente";
import { Saco, Tonel } from "./mar";

/* ------------------------------------------------------------------ */
/* 1. La Bolsa de Hendrick de Keyser, 1611                             */
/* ------------------------------------------------------------------ */

/** Reloj con agujas que giran (hora de partida en horas). */
const Reloj: React.FC<{ x: number; y: number; r: number; hora?: number }> = ({ x, y, r, hora = 11 }) => {
  const f = useCurrentFrame();
  const min = (hora % 1) * 60 + f * 0.25;
  const h = Math.floor(hora) + min / 60;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 10} fill={C.laton} />
      <circle r={r} fill={"#F2EEE4"} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-2} y={-r + 4} width={4} height={i % 3 === 0 ? 14 : 8} fill={C.tinta} transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-3} y={-r * 0.5} width={6} height={r * 0.5} fill={C.tinta} transform={`rotate(${(h % 12) * 30})`} />
      <rect x={-2} y={-r * 0.8} width={4} height={r * 0.8} fill={C.tinta} transform={`rotate(${(min % 60) * 6})`} />
      <circle r={5} fill={C.tinta} />
    </g>
  );
};

const Arcada: React.FC<{ x0: number; x1: number; base: number; alto: number; paso: number; numeros?: boolean; semilla?: number }> = ({ x0, x1, base, alto, paso, numeros }) => {
  const n = Math.floor((x1 - x0) / paso);
  return (
    <g>
      <rect x={x0} y={base - alto} width={x1 - x0} height={alto} fill={"#3A3430"} />
      {Array.from({ length: n }).map((_, i) => {
        const cx = x0 + i * paso + paso / 2;
        return (
          <g key={i}>
            <path d={`M ${cx - paso / 2} ${base - alto} H ${cx + paso / 2} V ${base} H ${cx + paso / 2 - 18} V ${base - alto * 0.62} Q ${cx} ${base - alto * 0.98} ${cx - paso / 2 + 18} ${base - alto * 0.62} V ${base} H ${cx - paso / 2} Z`} fill={"url(#vocSillar)"} />
            <path d={`M ${cx - paso / 2 + 18} ${base - alto * 0.62} Q ${cx} ${base - alto * 0.98} ${cx + paso / 2 - 18} ${base - alto * 0.62}`} fill="none" stroke={C.piedraOscura} strokeWidth={5} />
            <rect x={cx - 6} y={base - alto * 0.97} width={12} height={18} fill={C.piedraMedia} />
          </g>
        );
      })}
      {/* columnas entre arcos */}
      {Array.from({ length: n + 1 }).map((_, i) => {
        const px = x0 + i * paso;
        return (
          <g key={i}>
            <rect x={px - 18} y={base - alto * 0.66} width={36} height={alto * 0.66} fill={C.piedraLuz} />
            <rect x={px + 6} y={base - alto * 0.66} width={12} height={alto * 0.66} fill={C.piedraMedia} />
            <rect x={px - 26} y={base - alto * 0.66 - 12} width={52} height={14} fill={C.piedra} />
            <rect x={px - 24} y={base - 14} width={48} height={14} fill={C.piedraMedia} />
            {numeros && i > 0 && i < n ? (
              <g>
                <rect x={px - 16} y={base - alto * 0.4} width={32} height={26} fill={"#F2EAD2"} />
                <text x={px} y={base - alto * 0.4 + 20} textAnchor="middle" fontFamily={FONT.serif} fontSize={20} fill={C.tinta}>
                  {i + 3}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

const DibujoBolsa: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  const v = e.variante ?? "";
  const panico = v === "panico";
  const noticia = v === "noticia" || panico;
  const gente = e.gente ?? 0.9;
  const nota = e.textos?.nota ?? "";
  const gesto = panico ? "inquieto" : "neutro";
  return (
    <g>
      <Defs />
      <CieloVoc hora={e.hora} ancho={2800} nubes={4} />
      {/* torre del reloj */}
      <g transform="translate(960 0)">
        <rect x={-90} y={60} width={180} height={300} fill={C.piedra} />
        <rect x={-90} y={60} width={180} height={300} fill="url(#vocLadrillo)" opacity={0.25} />
        <Reloj x={0} y={160} r={56} hora={11.1} />
        <rect x={-110} y={44} width={220} height={20} fill={C.piedraMedia} />
        <path d="M -70 44 L -70 -20 Q 0 -60 70 -20 L 70 44 Z" fill={"#5A6A62"} />
        <rect x={-30} y={-90} width={60} height={70} fill={"#5A6A62"} />
        {[-18, 6].map((wx) => (
          <rect key={wx} x={wx} y={-80} width={12} height={40} fill={"#2A3230"} />
        ))}
        <path d="M -36 -90 L 0 -200 L 36 -90 Z" fill={"#4A5A52"} />
        <rect x={-3} y={-250} width={6} height={60} fill={C.laton} />
        <circle cx={0} cy={-250} r={10} fill={C.laton} />
      </g>
      {/* galeria superior y arcada del fondo */}
      <rect x={-300} y={340} width={2520} height={200} fill={C.piedra} />
      {Array.from({ length: 16 }).map((_, i) => (
        <g key={i}>
          <rect x={-240 + i * 150} y={370} width={70} height={110} fill={C.cristal} />
          <rect x={-240 + i * 150} y={370} width={30} height={110} fill={C.cristalLuz} opacity={0.3} />
          <path d={`M ${-240 + i * 150} 425 h 70 M ${-205 + i * 150} 370 v 110`} stroke={"#E9E2D2"} strokeWidth={3} />
          <path d={`M ${-250 + i * 150} 370 Q ${-205 + i * 150} 340 ${-160 + i * 150} 370`} fill={C.piedraMedia} />
        </g>
      ))}
      <rect x={-300} y={520} width={2520} height={20} fill={C.piedraMedia} />
      <rect x={-300} y={332} width={2520} height={14} fill={C.piedraOscura} />
      {Array.from({ length: 26 }).map((_, i) => (
        <rect key={i} x={-290 + i * 98} y={300} width={22} height={34} fill={C.piedraMedia} />
      ))}
      <Arcada x0={-300} x1={2220} base={820} alto={290} paso={210} numeros semilla={s} />
      {/* rotulo del pilar de las acciones */}
      <g transform="translate(1065 640)">
        <rect x={-52} y={-30} width={104} height={60} fill={"#F2EAD2"} stroke={C.maderaOsc} strokeWidth={4} />
        <Monograma x={0} y={4} s={0.42} />
      </g>
      {/* patio enlosado */}
      <rect x={-300} y={820} width={2520} height={300} fill={"#CFC4AC"} />
      {Array.from({ length: 7 }).map((_, k) => (
        <path key={k} d={`M -300 ${840 + k * (14 + k * 6)} H 2220`} stroke={"#B9AC91"} strokeWidth={2} />
      ))}
      {Array.from({ length: 30 }).map((_, k) => (
        <path key={k} d={`M ${-300 + k * 90} 820 L ${-300 + k * 90 + (k * 90 - 1260) * 0.25} 1100`} stroke={"#B9AC91"} strokeWidth={1.6} />
      ))}
      {/* mercaderes del fondo, bajo la arcada */}
      {Array.from({ length: Math.round(12 * gente) }).map((_, i) => (
        <Figura key={i} x={-120 + i * 190 + rnd(i, s) * 50} y={830} escala={0.36} traje={(["burgues", "burgues", "peluca", "burgues"] as const)[i % (e.variante === "siglo18" ? 3 : 2)]} semilla={s * 43 + i} pose={i % 3 === 0 ? "habla" : "quieto"} mirada={rnd(i, 3) - 0.5} gesto={gesto} />
      ))}
      {/* corrillos en primer termino */}
      {Array.from({ length: Math.round(7 * gente) }).map((_, i) => {
        const grupo = [140, 330, 760, 920, 1260, 1460, 1760][i];
        const tr: Traje = e.variante === "siglo18" ? "peluca" : i === 4 ? "mujer" : "burgues";
        return (
          <Figura
            key={i}
            x={grupo}
            y={1010 + (i % 2) * 40}
            escala={0.72 + (i % 2) * 0.06}
            traje={tr}
            semilla={s * 47 + i}
            pose={i % 3 === 0 ? "habla" : i % 3 === 1 ? "lee" : panico ? "brazos" : "manos"}
            mirada={i % 2 ? -0.7 : 0.7}
            gesto={panico ? (i % 2 ? "sorpresa" : "inquieto") : i % 2 ? "serio" : "neutro"}
            objeto={i === 1 ? "papel" : undefined}
          />
        );
      })}
      {/* corredores que cruzan */}
      <Paseante x0={-100} y={950} v={1.2} escala={0.64} traje={e.variante === "siglo18" ? "peluca" : "burgues"} semilla={s * 53 + 1} />
      <Paseante x0={2100} y={970} v={-0.9} escala={0.66} traje="burgues" semilla={s * 53 + 2} />
      {noticia ? <Paseante x0={2200} y={1060} v={-3.2} escala={0.74} traje="marinero" semilla={s * 53 + 3} /> : null}
      {/* la nota del corredor, en primer plano */}
      {nota ? (
        <g transform={`translate(560 760) rotate(${-6 + Math.sin(f * 0.05) * 1.5})`}>
          <rect x={-120} y={-80} width={240} height={160} fill={"#F2EAD2"} stroke={"#B9A27E"} strokeWidth={3} />
          <path d="M -100 -44 H 100 M -100 46 H 60" stroke={"#C9B88E"} strokeWidth={2} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={nota.length > 12 ? 30 : 44} fill={C.tintaSepia}>
            {nota}
          </text>
          <ellipse cx={-130} cy={60} rx={30} ry={34} fill={"#E2B892"} />
        </g>
      ) : null}
      {/* palomas en el patio */}
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${1100 + k * 60 + Math.sin(f * 0.05 + k) * 10} ${1050 + k * 6})`}>
          <ellipse cx={0} cy={0} rx={14} ry={9} fill={"#8A8E90"} />
          <circle cx={12 * (k % 2 ? 1 : -1)} cy={-8 + Math.abs(Math.sin(f * 0.2 + k)) * 4} r={6} fill={"#7A7E80"} />
        </g>
      ))}
    </g>
  );
};

export const bolsa: Decorado = {
  desc: "La Bolsa de Hendrick de Keyser (1611): patio porticado con columnas numeradas y el pilar de las acciones con el monograma VOC, galeria superior, torre del reloj (las agujas corren hacia las doce), corrillos de mercaderes y corredores, palomas",
  admite:
    "textos.nota (la nota del corredor en primer termino: p. ej. '114 %' o 'VOC 290'); variante 'noticia' (un mensajero entra corriendo), 'panico' (gestos de alarma), 'siglo18' (pelucas); gente; semilla",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1.0 }, a: { x: 960, y: 540, z: 1.06 }, desc: "el patio de la Bolsa" },
    reloj: { de: { x: 960, y: 300, z: 1.9 }, a: { x: 960, y: 480, z: 1.25 }, desc: "del reloj de la torre al patio con los mercaderes" },
    pilar: { de: { x: 1060, y: 700, z: 2.0 }, a: { x: 1000, y: 720, z: 2.2 }, desc: "el pilar de las acciones y los corredores" },
    corrillo: { de: { x: 300, y: 740, z: 1.9 }, a: { x: 420, y: 730, z: 2.0 }, desc: "un corrillo de mercaderes" },
    nota: { de: { x: 560, y: 760, z: 2.6 }, a: { x: 570, y: 760, z: 3.0 }, desc: "la nota del corredor (pide textos.nota)" },
    arcada: { de: { x: 700, y: 680, z: 1.5 }, a: { x: 1300, y: 680, z: 1.5 }, desc: "paneo por la arcada" },
  },
  dibujo: DibujoBolsa,
};

/* ------------------------------------------------------------------ */
/* 2. El almacen de especias en Amsterdam                              */
/* ------------------------------------------------------------------ */

const Balanza: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const f = useCurrentFrame();
  const a = Math.sin(f * 0.06) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-10} y={-560} width={20} height={560} fill={C.maderaOsc} />
      <rect x={-200} y={-570} width={400} height={20} fill={C.maderaOsc} />
      <g transform={`translate(0 -470) rotate(${a})`}>
        <rect x={-260} y={-8} width={520} height={16} fill={"#3A3430"} />
        <circle r={14} fill={C.laton} />
        {[-1, 1].map((l) => (
          <g key={l} transform={`translate(${l * 240} 0) rotate(${-a})`}>
            <path d="M 0 0 L -90 200 M 0 0 L 90 200" stroke={"#3A3430"} strokeWidth={4} />
            <path d="M -110 200 L 110 200 L 90 230 L -90 230 Z" fill={C.laton} />
            {l < 0 ? (
              <Saco x={0} y={200} s={0.95} tono={1} texto="VOC" />
            ) : (
              <g>
                {[0, 1, 2].map((k) => (
                  <rect key={k} x={-50 + k * 34} y={170 - (k % 2) * 16} width={30} height={30 + (k % 2) * 16} fill={"#4A4A4A"} />
                ))}
              </g>
            )}
          </g>
        ))}
      </g>
    </g>
  );
};

const DibujoAlmacen: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  const medio = e.variante === "medio";
  const aviso = e.textos?.aviso ?? "";
  const lleno = medio ? 0.35 : 1;
  return (
    <g>
      <Defs />
      <rect x={-300} y={-100} width={2520} height={1300} fill={"#5E4A3A"} />
      {/* muro de ladrillo y vigas */}
      <rect x={-300} y={0} width={2520} height={900} fill="url(#vocLadrilloOsc)" opacity={0.85} />
      {[0, 260, 520].map((vy) => (
        <rect key={vy} x={-300} y={vy} width={2520} height={30} fill={"#3E2A1E"} />
      ))}
      {[-200, 300, 800, 1300, 1800].map((vx) => (
        <g key={vx}>
          <rect x={vx} y={0} width={40} height={900} fill={"#4A3326"} />
          <path d={`M ${vx + 40} 120 L ${vx + 140} 30 M ${vx} 120 L ${vx - 100} 30`} stroke={"#4A3326"} strokeWidth={22} />
        </g>
      ))}
      {/* portalon abierto al muelle, con luz */}
      <rect x={820} y={180} width={300} height={540} fill={"#D9DCD2"} />
      <path d="M 820 400 h 300 M 820 560 h 300" stroke={"#B9BCB2"} strokeWidth={3} />
      <rect x={820} y={600} width={300} height={120} fill={"#9AAAA4"} />
      {[860, 1000, 1080].map((mx, i) => (
        <g key={mx} fill={"#8E8A80"}>
          <rect x={mx} y={250 + i * 40} width={6} height={360 - i * 40} />
          <rect x={mx - 40} y={320 + i * 40} width={86} height={4} />
        </g>
      ))}
      <path d="M 840 600 L 1000 600 L 980 620 L 860 620 Z" fill={"#6E5A48"} />
      <rect x={812} y={170} width={316} height={16} fill={"#3E2A1E"} />
      <polygon points="820,720 1120,720 1500,1100 520,1100" fill="url(#vocLuzVentana)" opacity={0.6} />
      {/* polea con su cuerda que sube un saco */}
      <g>
        <circle cx={1180} cy={110} r={26} fill={"#3A3430"} />
        <path d={`M 1180 110 V ${300 - ((f * 1.2) % 160)}`} stroke={"#8A7650"} strokeWidth={5} />
        <Saco x={1180} y={360 - ((f * 1.2) % 160)} s={0.8} tono={2} />
      </g>
      {/* suelo de tablas */}
      <rect x={-300} y={880} width={2520} height={300} fill="url(#vocTablas)" />
      {/* montones de sacos y toneles */}
      {Array.from({ length: Math.round(18 * lleno) }).map((_, i) => {
        const fila = Math.floor(i / 6);
        const px = -150 + (i % 6) * 100 + fila * 50;
        return <Saco key={i} x={px} y={900 - fila * 70} s={1.0} tono={i} texto={i % 5 === 0 ? "VOC" : undefined} />;
      })}
      {Array.from({ length: Math.round(12 * lleno) }).map((_, i) => {
        const fila = Math.floor(i / 4);
        return <Tonel key={i} x={1400 + (i % 4) * 100 + fila * 40} y={910 - fila * 90} s={1.0} />;
      })}
      {medio ? (
        <g opacity={0.6}>
          <rect x={200} y={880} width={300} height={8} fill={"#3E2A1E"} />
          <path d="M 1500 900 l 30 -4 l 20 6" stroke={"#3E2A1E"} strokeWidth={3} fill="none" />
        </g>
      ) : null}
      {/* aviso clavado en la pared */}
      {aviso ? (
        <g transform="translate(580 300)">
          <rect x={-140} y={-90} width={280} height={180} fill={"#F2EAD2"} />
          <circle cx={-124} cy={-76} r={5} fill={C.laton} />
          <circle cx={124} cy={-76} r={5} fill={C.laton} />
          <Monograma x={0} y={-40} s={0.5} />
          {aviso.split("|").map((l, i) => (
            <text key={i} x={0} y={20 + i * 34} textAnchor="middle" fontFamily={FONT.serif} fontSize={26} fill={C.tinta}>
              {l}
            </text>
          ))}
        </g>
      ) : null}
      {/* la gran balanza con los pesadores */}
      <Balanza x={960} y={1000} s={0.9} />
      <Figura x={540} y={1060} escala={0.78} traje="marinero" semilla={s * 59 + 1} pose="brazos" mirada={0.6} />
      <Figura x={1360} y={1060} escala={0.8} traje="burgues" semilla={s * 59 + 2} pose="escribe" objeto="libro" mirada={-0.6} sombrero={false} />
      <Paseante x0={-200} y={1070} v={0.9} escala={0.8} traje="marinero" semilla={s * 59 + 3} carga="saco" />
      <Paseante x0={2100} y={1060} v={-0.7} escala={0.78} traje="marinero" semilla={s * 59 + 4} carga="barril" />
      {/* polvo de especias en el haz de luz */}
      {Array.from({ length: 24 }).map((_, i) => (
        <circle key={i} cx={760 + rnd(i, 1) * 500 + Math.sin(f * 0.02 + i) * 20} cy={(rnd(i, 2) * 700 + 300 - f * 0.3 * (1 + rnd(i, 3))) % 900 + 200} r={2 + rnd(i, 4) * 2} fill={"#F2DDA0"} opacity={0.45} />
      ))}
    </g>
  );
};

export const almacen: Decorado = {
  desc: "Un almacen de especias de la Compañia en Amsterdam: muro de ladrillo y vigas, portalon abierto con luz y polvo dorado, montones de sacos VOC y toneles, una polea que sube un saco, la gran balanza con un pesador y un escribano que apunta",
  admite: "textos.aviso (aviso clavado en la pared, lineas con '|', p. ej. 'Dividend|in foelie|1610'); variante 'medio' (almacen medio vacio, para el declive); semilla",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1.0 }, a: { x: 960, y: 540, z: 1.06 }, desc: "el almacen" },
    balanza: { de: { x: 960, y: 620, z: 1.9 }, a: { x: 960, y: 600, z: 2.1 }, desc: "pesando un saco en la balanza" },
    sacos: { de: { x: 200, y: 740, z: 2.0 }, a: { x: 360, y: 740, z: 2.0 }, desc: "montones de sacos con la marca" },
    escribano: { de: { x: 1340, y: 660, z: 2.3 }, a: { x: 1330, y: 640, z: 2.6 }, desc: "el escribano apuntando el peso" },
    polea: { de: { x: 1050, y: 300, z: 2.0 }, a: { x: 1080, y: 260, z: 2.2 }, desc: "la polea sube un saco por el portalon" },
  },
  dibujo: DibujoAlmacen,
};

