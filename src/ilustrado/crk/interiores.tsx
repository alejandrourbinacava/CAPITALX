import React from "react";
import { interpolate } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, Defs, T, Ventana, oscurecer, rr, suave } from "./comun";
import { Espalda, Figura } from "./gente";

/* ------------------------------------------------------------------ */
/* Oficina de un corredor: la pizarra de cotizaciones y los clientes   */
/* ------------------------------------------------------------------ */

/** Maquina de teletipo con su campana de cristal y la cinta que sale. */
export const Teletipo: React.FC<{ x: number; y: number; s?: number; f: number; cinta?: string }> = ({ x, y, s = 1, f, cinta = "" }) => {
  const largo = 260;
  const mov = (f * 2.2) % 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* pedestal */}
      <rect x={-14} y={-300} width={28} height={300} fill={C.maderaOsc} />
      <rect x={-70} y={-12} width={140} height={12} fill={C.maderaOsc} />
      <rect x={-60} y={-320} width={120} height={22} fill={C.maderaMedia} />
      {/* mecanismo */}
      <rect x={-46} y={-380} width={92} height={60} fill={"#2C2A26"} />
      <circle cx={-14} cy={-350} r={16} fill={C.laton} />
      <circle cx={-14} cy={-350} r={6} fill={"#2C2A26"} transform={`rotate(${f * 12} -14 -350)`} />
      <rect x={6} y={-366} width={30} height={10} fill={C.latonOsc} />
      {/* campana de cristal */}
      <path d="M -56 -320 L -56 -400 Q -56 -460 0 -462 Q 56 -460 56 -400 L 56 -320 Z" fill={"#CFE0DC"} opacity={0.35} />
      <path d="M -40 -330 L -40 -400 Q -40 -440 -10 -446" fill="none" stroke={"#FFFFFF"} strokeWidth={4} opacity={0.5} />
      <rect x={-6} y={-470} width={12} height={10} fill={C.laton} />
      {/* la cinta cae en curva hasta una cesta */}
      <path d={`M 40 -340 Q 110 -330 120 -250 Q 130 -120 90 -40`} fill="none" stroke={"#F2EAD2"} strokeWidth={14} />
      <g>
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={100 + ((i * 7) % 12)} y={-330 + ((i * 40 + mov) % largo)} width={4} height={6} fill={C.tintaSuave} opacity={0.7} />
        ))}
      </g>
      <path d="M 40 -60 L 150 -60 L 140 0 L 50 0 Z" fill={"#7A5A3A"} />
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M ${56 + i * 14} -60 Q ${70 + i * 10} ${-90 - (i % 3) * 10} ${90 + i * 6} -60`} fill="none" stroke={"#F2EAD2"} strokeWidth={8} />
      ))}
      {cinta ? (
        <T x={124} y={-200} tam={10} fam="mono" color={C.tintaSuave}>
          {""}
        </T>
      ) : null}
    </g>
  );
};

const PIZ_X = 180;
/** Trazos de tiza que parecen cifras escritas deprisa, sin serlo. */
/** Rayas de tiza horizontales: marcan la casilla sin inventar cifras. */
const PIZ_W = 1560;

const DibujoOficina: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const sem = e.semilla ?? 5;
  const gente = e.gente ?? 0.8;
  const panico = e.variante === "panico";
  const tx = e.textos ?? {};
  const cols = (tx.valores ?? "RCA|GEN MOTORS|U.S. STEEL|A.T.&T.|ANACONDA|GEN ELEC.").split("|");
  const v = e.valores ?? [];
  const t = suave(f / Math.max(1, dur * 0.75));
  const cifra = tx.cifra ?? (v.length >= 2 ? String(Math.round(interpolate(t, [0, 1], [v[0], v[1]]))) : v.length === 1 ? String(v[0]) : "");
  const cinta = tx.cinta ?? "";
  const anchoCol = PIZ_W / cols.length;
  const desliza = (f * 3) % 2400;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-200} width={2320} height={1500} fill="url(#crk-papelpintado)" />
      <rect x={-200} y={760} width={2320} height={500} fill="url(#crk-parquet)" />
      <rect x={-200} y={740} width={2320} height={24} fill={C.maderaOsc} />
      {/* banda de cotizaciones proyectada (Trans-Lux) */}
      <rect x={PIZ_X - 20} y={30} width={PIZ_W + 40} height={74} fill={C.maderaOsc} />
      <rect x={PIZ_X} y={42} width={PIZ_W} height={50} fill={"#14201C"} />
      <g>
        <clipPath id="crk-banda">
          <rect x={PIZ_X} y={42} width={PIZ_W} height={50} />
        </clipPath>
        <g clipPath="url(#crk-banda)">
          {cinta ? (
            <T x={PIZ_X + 500 - ((f * 4) % 3000)} y={78} tam={30} fam="mono" color={"#E9DFA8"} anc="start" esp={4}>
              {cinta + "     " + cinta}
            </T>
          ) : (
            Array.from({ length: 30 }).map((_, i) => (
              <rect key={i} x={PIZ_X + ((i * 90 - desliza * 0.6 + 4000) % (PIZ_W + 100)) - 50} y={58} width={50 + (i % 3) * 14} height={18} fill={"#9EA88A"} opacity={0.6} />
            ))
          )}
        </g>
      </g>
      {/* la pizarra */}
      <rect x={PIZ_X - 24} y={120} width={PIZ_W + 48} height={470} fill={C.maderaMedia} />
      <rect x={PIZ_X} y={140} width={PIZ_W} height={430} fill={C.pizarra} />
      {cols.map((n, i) => (
        <g key={i}>
          <rect x={PIZ_X + i * anchoCol} y={140} width={anchoCol - 4} height={50} fill={"#E9E2CE"} />
          <T x={PIZ_X + i * anchoCol + anchoCol / 2} y={174} tam={cols.length > 5 ? 22 : 26} color={C.tinta}>
            {n}
          </T>
          {i > 0 ? <rect x={PIZ_X + i * anchoCol - 3} y={140} width={3} height={430} fill={"#5A625E"} /> : null}
          {/* columnas de tiza: trazos, no cifras */}
          {Array.from({ length: 8 }).map((_, k) => {
            const tachado = panico && rr(i * 8 + k, sem) > 0.5;
            return (
              <g key={k}>
                {[0].map((d) => (
                  <path
                    key={d}
                    d={`M ${PIZ_X + i * anchoCol + 36} ${218 + k * 44} q ${(40 + rr(i * 31 + k * 7, sem + 5) * (anchoCol - 110)) / 2} ${rr(i + k, 9) * 4 - 2} ${40 + rr(i * 31 + k * 7, sem + 5) * (anchoCol - 110)} 0`}
                    fill="none"
                    stroke={C.tiza}
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={0.75}
                  />
                ))}
                {tachado ? <path d={`M ${PIZ_X + i * anchoCol + 34} ${226 + k * 44} L ${PIZ_X + i * anchoCol + 150} ${210 + k * 44}`} stroke={C.tiza} strokeWidth={2} opacity={0.8} /> : null}
              </g>
            );
          })}
        </g>
      ))}
      {cifra ? (
        <g>
          <rect x={PIZ_X + 10} y={420} width={anchoCol - 24} height={70} fill={C.pizarra} />
          <T x={PIZ_X + anchoCol / 2} y={474} tam={56} fam="serif" color={C.tiza}>
            {cifra}
          </T>
        </g>
      ) : null}
      <rect x={PIZ_X - 24} y={570} width={PIZ_W + 48} height={14} fill={C.maderaLuz} />
      {/* pasarela y chicos de la pizarra */}
      <rect x={PIZ_X - 20} y={600} width={PIZ_W + 40} height={14} fill={C.maderaOsc} />
      {[0, 1].map((k) => {
        const ox = PIZ_X + 120 + k * 760 + Math.sin(f * 0.02 + k) * 60;
        return <Figura key={k} x={ox} y={604} escala={0.62} semilla={sem * 7 + k} atuendo="obrero" gorro="ninguno" rasgos={{ edad: "joven", bigote: "ninguno" }} pose="escribe" espejo={k === 1} />;
      })}
      {/* teletipo */}
      <Teletipo x={1810} y={900} s={0.95} f={f} />
      {/* filas de sillas con clientes de espaldas */}
      {[0, 1, 2].map((fila) => {
        const y = 790 + fila * 120;
        const s = 0.62 + fila * 0.16;
        const n = 7 - fila;
        return (
          <g key={fila}>
            {Array.from({ length: n }).map((_, i) => {
              const k = sem * 100 + fila * 13 + i;
              const x = 140 + (i + 0.5) * (1560 / n) + (fila % 2) * 40;
              const ocupada = rr(k, 2) < 0.4 + 0.6 * gente;
              const levantado = panico && rr(k, 3) > 0.6;
              return (
                <g key={i}>
                  {ocupada ? <Espalda x={x} y={y - (levantado ? 60 : 0)} escala={s} semilla={k} atuendo={rr(k, 4) > 0.8 ? "mujer" : "traje"} giro={levantado ? 6 : 0} /> : null}
                  {/* respaldo de la silla */}
                  <g transform={`translate(${x} ${y}) scale(${s})`}>
                    <rect x={-70} y={-60} width={140} height={70} rx={8} fill={C.maderaMedia} />
                    <rect x={-60} y={-50} width={120} height={8} fill={C.maderaLuz} />
                    {[-40, 0, 40].map((b) => (
                      <rect key={b} x={b - 6} y={-42} width={12} height={46} fill={C.madera} />
                    ))}
                  </g>
                </g>
              );
            })}
          </g>
        );
      })}
      {/* cliente de pie, de frente, a la derecha */}
      <Figura x={1560} y={1180} escala={1.15} semilla={sem * 3 + 1} atuendo="traje" pose={panico ? "lee" : "brazos"} gesto={panico ? "inquieto" : "serio"} mirada={-0.6} cuerpo="busto" />
    </g>
  );
};

export const OFICINA: Decorado = {
  desc: "Sala de una agencia de bolsa de 1929: banda de cotizaciones proyectada, gran pizarra con los valores, chicos que escriben con tiza en la pasarela, teletipo con su campana y filas de clientes sentados de espaldas.",
  admite:
    "textos.valores ('RCA|GEN MOTORS|...' cabeceras de la pizarra), textos.cifra (cifra grande en la primera columna) o valores [de, a] (la cifra cuenta), textos.cinta (texto que corre por la banda); variante 'panico' (cifras tachadas, gente que se levanta); gente; semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 560, z: 1.08 }, desc: "la sala entera: pizarra, banda y clientes" },
    pizarra: { de: { x: 420, y: 330, z: 2.1 }, a: { x: 400, y: 360, z: 2.4 }, desc: "la primera columna de la pizarra y el chico de la tiza" },
    banda: { de: { x: 700, y: 140, z: 2.6 }, a: { x: 1100, y: 140, z: 2.6 }, desc: "la banda de cotizaciones que corre (textos.cinta)" },
    clientes: { de: { x: 800, y: 700, z: 1.6 }, a: { x: 900, y: 720, z: 1.75 }, desc: "las filas de clientes mirando la pizarra" },
    teletipo: { de: { x: 1820, y: 640, z: 2.6 }, a: { x: 1800, y: 600, z: 2.9 }, desc: "el teletipo y la cinta en la cesta" },
    cara: { de: { x: 1580, y: 760, z: 2.8 }, a: { x: 1580, y: 760, z: 3.2 }, desc: "primer plano del cliente de pie" },
  },
  dibujo: DibujoOficina,
};

/* ------------------------------------------------------------------ */
/* Sala de estar de los veinte: la radio, la familia, la chimenea      */
/* ------------------------------------------------------------------ */

const Radio: React.FC<{ x: number; y: number; f: number; encendida: boolean }> = ({ x, y, f, encendida }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-380} width={220} height={380} rx={10} fill={C.madera} />
    <path d="M -100 -370 Q 0 -440 100 -370 L 100 -200 L -100 -200 Z" fill={C.maderaLuz} />
    <path d="M -80 -360 Q 0 -414 80 -360 L 80 -220 L -80 -220 Z" fill={"#C9B48E"} />
    {Array.from({ length: 7 }).map((_, i) => (
      <rect key={i} x={-70 + i * 22} y={-380} width={6} height={160} fill={C.madera} />
    ))}
    <rect x={-60} y={-180} width={120} height={40} rx={6} fill={"#2A1E16"} />
    <rect x={-50} y={-172} width={100} height={24} rx={4} fill={encendida ? "#F2CE7A" : "#6A5A40"} />
    <rect x={-20 + Math.sin(f * 0.01) * 4} y={-172} width={3} height={24} fill={C.carmin} />
    {[-60, 0, 60].map((k) => (
      <circle key={k} cx={k} cy={-100} r={14} fill={"#2A1E16"} />
    ))}
    <rect x={-100} y={-40} width={200} height={30} fill={C.maderaOsc} />
    {encendida
      ? [0, 1, 2].map((k) => {
          const t = ((f * 0.02 + k / 3) % 1);
          return <path key={k} d={`M ${-60 - t * 80} ${-420 - t * 40} Q 0 ${-470 - t * 90} ${60 + t * 80} ${-420 - t * 40}`} fill="none" stroke={"#F2E2B4"} strokeWidth={4} opacity={(1 - t) * 0.6} />;
        })
      : null}
  </g>
);

const DibujoSalon: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 2;
  const noche = e.hora === "noche" || e.variante === "charla";
  const charla = e.variante === "charla";
  const lata = e.variante === "lata";
  const tx = e.textos ?? {};
  const fuego = Math.sin(f * 0.4) * 0.5 + Math.sin(f * 0.23) * 0.5;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-200} width={2320} height={1100} fill="url(#crk-papelpintado)" />
      {noche ? <rect x={-200} y={-200} width={2320} height={1100} fill={"#1E1A22"} opacity={0.35} /> : null}
      <rect x={-200} y={640} width={2320} height={30} fill={C.maderaLuz} />
      <rect x={-200} y={670} width={2320} height={600} fill="url(#crk-tablas)" />
      {/* alfombra */}
      <path d="M 280 800 L 1640 800 L 1760 1080 L 160 1080 Z" fill={"#7A3B34"} />
      <path d="M 320 820 L 1600 820 L 1700 1060 L 220 1060 Z" fill="none" stroke={"#C9A86A"} strokeWidth={6} />
      {/* ventana con cortinas */}
      <g>
        <Ventana x={190} y={150} w={300} h={380} marco={"#E9E2D2"} cristal={noche ? "#2A3442" : "#C9D3CF"} />
        {noche ? null : (
          <g opacity={0.6}>
            <rect x={200} y={360} width={120} height={170} fill={"#A99A80"} />
            <rect x={340} y={300} width={140} height={230} fill={"#B9AB90"} />
          </g>
        )}
        <path d="M 160 120 Q 220 340 170 560 L 120 560 L 120 120 Z" fill={"#6E2A22"} />
        <path d="M 520 120 Q 460 340 510 560 L 560 560 L 560 120 Z" fill={"#6E2A22"} />
        <rect x={110} y={108} width={460} height={16} fill={C.laton} />
      </g>
      {/* chimenea */}
      <g transform="translate(960 0)">
        <rect x={-230} y={330} width={460} height={320} fill={"#B9AE96"} />
        <rect x={-250} y={310} width={500} height={30} fill={C.maderaLuz} />
        <rect x={-130} y={430} width={260} height={220} fill={"#2A221E"} />
        <path d="M -130 430 Q 0 380 130 430 Z" fill={"#B9AE96"} />
        {noche || charla ? (
          <g>
            <ellipse cx={0} cy={590} rx={210} ry={120} fill="url(#crk-fuego)" />
            <path d={`M -70 640 Q -60 ${560 - fuego * 20} -20 ${520 - fuego * 30} Q 0 ${580} 20 ${510 + fuego * 20} Q 60 ${560} 70 640 Z`} fill={"#E8862C"} />
            <path d={`M -40 640 Q -30 ${590 - fuego * 10} 0 ${560 - fuego * 20} Q 30 ${590} 40 640 Z`} fill={"#F6C85A"} />
          </g>
        ) : null}
        <rect x={-90} y={620} width={180} height={20} fill={"#3A2A1E"} />
        {/* repisa: reloj y fotos */}
        <g transform="translate(0 270)">
          <rect x={-40} y={-30} width={80} height={70} rx={30} fill={C.madera} />
          <circle cx={0} cy={0} r={22} fill={"#F2ECDD"} />
          <rect x={-1.5} y={-16} width={3} height={17} fill={C.tinta} transform={`rotate(${f * 2})`} />
          <rect x={-1.5} y={-11} width={3} height={12} fill={C.tinta} transform={`rotate(${200 + f * 0.2})`} />
        </g>
        {[-180, -120, 130].map((px, i) => (
          <g key={i}>
            <rect x={px} y={240 + (i % 2) * 14} width={48} height={66 - (i % 2) * 14} fill={C.laton} />
            <rect x={px + 6} y={246 + (i % 2) * 14} width={36} height={54 - (i % 2) * 14} fill={"#8E8270"} />
          </g>
        ))}
        {/* cuadro sobre la chimenea */}
        <rect x={-150} y={70} width={300} height={170} fill={C.laton} />
        <rect x={-138} y={82} width={276} height={146} fill={"#8E9A82"} />
        <path d="M -138 200 Q -60 150 0 180 Q 70 130 138 170 L 138 228 L -138 228 Z" fill={"#6E7A62"} />
      </g>
      {/* lampara de pie */}
      <g transform="translate(1440 650)">
        <rect x={-6} y={-380} width={12} height={380} fill={"#2A2420"} />
        <rect x={-40} y={-10} width={80} height={10} fill={"#2A2420"} />
        <path d="M -70 -380 L 70 -380 L 40 -460 L -40 -460 Z" fill={noche ? "#F2D592" : "#D9C49A"} />
        {noche ? <circle cx={0} cy={-380} r={200} fill="url(#crk-lampara)" /> : null}
      </g>
      {/* la radio */}
      <Radio x={1720} y={720} f={f} encendida={charla || tx.radio === "1"} />
      {/* mesita con revista o lata de cafe */}
      <g transform="translate(560 860)">
        <ellipse cx={0} cy={-120} rx={140} ry={26} fill={C.maderaLuz} />
        <rect x={-10} y={-120} width={20} height={120} fill={C.madera} />
        <rect x={-60} y={-8} width={120} height={10} fill={C.madera} />
        {lata ? (
          <g transform="translate(-30 -128)">
            <rect x={-40} y={-90} width={80} height={90} rx={6} fill={"#8E2A22"} />
            <rect x={-40} y={-90} width={80} height={14} fill={"#B9A27A"} />
            <rect x={-40} y={-50} width={80} height={24} fill={"#E9DFC6"} />
            <T x={0} y={-32} tam={14} color={"#8E2A22"}>
              COFFEE
            </T>
            {[0, 1, 2].map((k) => (
              <rect key={k} x={-30 + k * 12} y={-110 - k * 6} width={40} height={22} fill={"#9DB08A"} transform={`rotate(${-20 + k * 18} ${-10 + k * 12} ${-100})`} />
            ))}
          </g>
        ) : (
          <g transform="translate(-20 -128)">
            <path d="M -70 -6 L 60 -14 L 84 10 L -46 18 Z" fill={"#E9DFC6"} />
            <path d="M -66 -4 L 60 -12 L 66 -6 L -60 2 Z" fill={C.carmin} />
            <T x={8} y={11} tam={11} color={C.tinta}>
              {tx.revista ?? "LADIES' HOME JOURNAL"}
            </T>
          </g>
        )}
      </g>
      {/* sofa con la familia */}
      <g>
        <rect x={680} y={700} width={600} height={90} rx={30} fill={"#6B7B6A"} />
        <rect x={700} y={760} width={560} height={150} rx={30} fill={"#5A6A5A"} />
        <Figura x={820} y={940} escala={0.72} semilla={sem * 11 + 1} atuendo="mujer" cuerpo="sentado" pose="manos" gesto={charla ? "serio" : "neutro"} mirada={0.8} gorro="ninguno" />
        <Figura x={980} y={940} escala={0.78} semilla={sem * 11 + 2} atuendo="traje" gorro="ninguno" cuerpo="sentado" pose={charla ? "manos" : "lee"} gesto={charla ? "serio" : "neutro"} mirada={0.8} />
        <Figura x={1140} y={940} escala={0.7} semilla={sem * 11 + 3} atuendo="mujer" cuerpo="sentado" pose="manos" mirada={0.8} gorro="ninguno" rasgos={{ edad: "mayor", pelo: "#D9D4CC" }} />
        <rect x={660} y={760} width={70} height={190} rx={24} fill={"#4E5D4E"} />
        <rect x={1250} y={760} width={70} height={190} rx={24} fill={"#4E5D4E"} />
        <rect x={700} y={870} width={560} height={70} rx={10} fill={"#4E5D4E"} />
        {/* ninos en la alfombra, delante */}
        <Figura x={1330} y={1040} escala={0.9} semilla={sem * 11 + 4} atuendo="nino" gorro="ninguno" pose="quieto" mirada={0.8} />
        <Figura x={1470} y={1050} escala={0.85} semilla={sem * 11 + 5} atuendo="nino" gorro="ninguno" rasgos={{ pelo: "#7A5E44" }} pose="manos" mirada={0.8} />
      </g>
      {noche ? <rect x={-200} y={-200} width={2320} height={1500} fill={"#2A1A10"} opacity={0.12} /> : null}
    </g>
  );
};

export const SALON: Decorado = {
  desc: "Sala de estar de una familia de los veinte: ventana con cortinas, chimenea con reloj y fotos, lampara, radio de capilla, mesita con revista, sofa con la familia y los ninos en la alfombra.",
  admite:
    "variante 'charla' (noche, fuego y radio encendida: la charla de Roosevelt junto a la chimenea), 'lata' (lata de cafe con billetes en la mesita); textos.revista (titulo de la revista), textos.radio='1' (radio encendida); hora; semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 1000, y: 560, z: 1.08 }, desc: "la sala entera con la familia" },
    familia: { de: { x: 1000, y: 700, z: 1.9 }, a: { x: 1040, y: 700, z: 2.1 }, desc: "la familia en el sofa, escuchando" },
    radio: { de: { x: 1560, y: 680, z: 1.75 }, a: { x: 1600, y: 660, z: 1.9 }, desc: "la radio y los ninos" },
    chimenea: { de: { x: 960, y: 400, z: 1.8 }, a: { x: 960, y: 440, z: 2.0 }, desc: "la chimenea, el reloj y las fotos" },
    mesa: { de: { x: 560, y: 720, z: 3.0 }, a: { x: 540, y: 720, z: 3.4 }, desc: "la mesita: la revista o la lata de cafe" },
  },
  dibujo: DibujoSalon,
};
