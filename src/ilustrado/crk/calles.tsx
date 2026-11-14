import React from "react";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloNubes, Coche, Columna, Defs, Farola, Humo, Papeles, Rotulo, T, Ventana, rr } from "./comun";
import { Andante, Figura, type Atuendo } from "./gente";

/* ------------------------------------------------------------------ */
/* Edificio de ladrillo de Nueva York con escalera de incendios        */
/* ------------------------------------------------------------------ */

export const Bloque: React.FC<{ x: number; w: number; top: number; suelo: number; tienda?: string; color?: string; sem?: number; noche?: boolean }> = ({
  x,
  w,
  top,
  suelo,
  tienda,
  color,
  sem = 1,
  noche,
}) => {
  const cols = Math.max(2, Math.floor(w / 110));
  const pisos = Math.max(2, Math.floor((suelo - top - 200) / 130));
  return (
    <g>
      <rect x={x} y={top} width={w} height={suelo - top} fill={color ?? "url(#crk-ladrillo)"} />
      <rect x={x - 10} y={top - 20} width={w + 20} height={26} fill={C.piedraMedia} />
      {Array.from({ length: cols }).map((_, c) =>
        Array.from({ length: pisos }).map((__, p) => {
          const vx = x + 30 + c * ((w - 60) / cols);
          const vy = top + 40 + p * 130;
          const vw = (w - 60) / cols - 34;
          const luz = noche && rr(c * 7 + p, sem) > 0.5;
          return <Ventana key={`${c}-${p}`} x={vx} y={vy} w={vw} h={80} luz={luz} />;
        })
      )}
      {/* escalera de incendios */}
      <g stroke={"#2A2A28"} strokeWidth={4} fill="none">
        {Array.from({ length: pisos }).map((_, p) => (
          <g key={p}>
            <rect x={x + w * 0.3} y={top + 130 + p * 130} width={w * 0.4} height={6} fill={"#2A2A28"} />
            <path d={`M ${x + w * 0.3} ${top + 130 + p * 130} v -40 M ${x + w * 0.7} ${top + 130 + p * 130} v -40 M ${x + w * 0.3} ${top + 96 + p * 130} h ${w * 0.4}`} />
            {p < pisos - 1 ? <path d={`M ${x + w * 0.35} ${top + 136 + p * 130} L ${x + w * 0.62} ${top + 260 + p * 130}`} /> : null}
          </g>
        ))}
      </g>
      {/* planta baja con tienda */}
      <rect x={x} y={suelo - 200} width={w} height={200} fill={"#4A3A2E"} />
      <rect x={x + 20} y={suelo - 150} width={w - 140} height={130} fill={noche ? "#C9A86A" : C.cristal} />
      <rect x={x + 20} y={suelo - 150} width={(w - 140) * 0.4} height={130} fill={C.cristalLuz} opacity={0.3} />
      <rect x={x + w - 100} y={suelo - 170} width={70} height={170} fill={"#2A2018"} />
      {tienda ? <Rotulo x={x + 16} y={suelo - 196} w={w - 32} h={40} texto={tienda} tam={22} fondo={["#2F4A3F", "#5A2A22", "#2A3442", "#4A3A22"][sem % 4]} /> : null}
      {/* toldo */}
      <path d={`M ${x + 10} ${suelo - 156} L ${x + w - 120} ${suelo - 156} L ${x + w - 100} ${suelo - 126} L ${x - 10} ${suelo - 126} Z`} fill={sem % 2 ? C.carmin : C.verde} opacity={0.9} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Banco de barrio: la corrida y el cierre                            */
/* ------------------------------------------------------------------ */

const DibujoBanco: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 8;
  const v = e.variante ?? "normal";
  const corrida = v === "corrida";
  const cerrado = v === "cerrado";
  const gente = e.gente ?? (corrida ? 1 : cerrado ? 0.6 : 0.4);
  const noche = e.hora === "noche";
  const nombre = (e.textos?.nombre ?? "CITIZENS BANK").toUpperCase();
  const aviso = e.textos?.aviso ?? "CLOSED";
  const SUELO = 860;
  const BX = 700;
  const BW = 640;
  return (
    <g>
      <Defs />
      <CieloNubes ancho={2200} alto={SUELO} hora={e.hora} gris={cerrado} sem={sem} />
      <Bloque x={-180} w={860} top={120} suelo={SUELO} tienda={e.textos?.tienda ?? "DELICATESSEN"} sem={sem} noche={noche} />
      <Bloque x={1360} w={760} top={60} suelo={SUELO} tienda={e.textos?.tienda2 ?? "HARDWARE"} sem={sem + 1} noche={noche} color={"#A9917A"} />
      {/* el banco: templo pequeno de piedra */}
      <rect x={BX} y={240} width={BW} height={SUELO - 240} fill="url(#crk-sillar)" />
      <rect x={BX - 20} y={230} width={BW + 40} height={70} fill={C.piedra} />
      <rect x={BX - 20} y={290} width={BW + 40} height={10} fill={C.piedraMedia} />
      <T x={BX + BW / 2} y={278} tam={nombre.length > 18 ? 28 : 34} fam="serif" color={C.piedraOscura} esp={nombre.length > 18 ? 3 : 6}>
        {nombre}
      </T>
      <polygon points={`${BX - 30},230 ${BX + BW / 2},120 ${BX + BW + 30},230`} fill={C.piedra} stroke={C.piedraMedia} strokeWidth={10} />
      <circle cx={BX + BW / 2} cy={190} r={22} fill={C.piedraMedia} />
      <rect x={BX + 170} y={330} width={300} height={420} fill={"#2A2420"} />
      {/* puertas de bronce */}
      <g>
        <rect x={BX + 190} y={460} width={130} height={290} fill={cerrado ? "#4A3A26" : "#1A1612"} />
        <rect x={BX + 320} y={460} width={130} height={290} fill={cerrado ? "#4A3A26" : "#1A1612"} />
        {cerrado ? (
          <g>
            {[0, 1].map((k) => (
              <g key={k}>
                <rect x={BX + 205 + k * 130} y={480} width={100} height={110} fill="none" stroke={C.laton} strokeWidth={4} />
                <rect x={BX + 205 + k * 130} y={610} width={100} height={110} fill="none" stroke={C.laton} strokeWidth={4} />
              </g>
            ))}
            {/* aviso pegado en la puerta */}
            <g transform={`translate(${BX + 320} 560) rotate(-2)`}>
              <rect x={-90} y={-60} width={180} height={150} fill={"#F2ECDD"} />
              <T x={0} y={-14} tam={aviso.length > 10 ? 22 : 34} color={C.carmin}>
                {aviso}
              </T>
              {[10, 30, 50, 70].map((y, i) => (
                <rect key={y} x={-70} y={y} width={i === 3 ? 90 : 140} height={6} fill={"#B6AD96"} />
              ))}
            </g>
          </g>
        ) : (
          <rect x={BX + 200} y={480} width={240} height={270} fill={"#C9A86A"} opacity={0.25} />
        )}
        <rect x={BX + 170} y={330} width={300} height={120} fill={"#3A3026"} />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={BX + 175 + i * 50} y={335} width={42} height={110} fill={C.cristal} />
        ))}
      </g>
      <Columna x={BX + 100} y={SUELO - 40} h={540} w={60} />
      <Columna x={BX + BW - 100} y={SUELO - 40} h={540} w={60} />
      <rect x={BX - 30} y={SUELO - 40} width={BW + 60} height={40} fill={C.piedraMedia} />
      {/* reloj del banco en la acera */}
      <g transform={`translate(${BX + BW + 60} ${SUELO})`}>
        <rect x={-8} y={-300} width={16} height={300} fill={"#2A3230"} />
        <circle cx={0} cy={-320} r={44} fill={"#2A3230"} />
        <circle cx={0} cy={-320} r={34} fill={"#F2ECDD"} />
        <rect x={-2} y={-346} width={4} height={28} fill={C.tinta} transform={`rotate(${f * 3} 0 -320)`} />
        <rect x={-2} y={-338} width={4} height={20} fill={C.tinta} transform={`rotate(${110 + f * 0.25} 0 -320)`} />
      </g>
      {/* acera y calle */}
      <rect x={-200} y={SUELO} width={2400} height={36} fill={C.acera} />
      <rect x={-200} y={SUELO + 36} width={2400} height={300} fill={C.asfalto} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-200 + i * 220} y={SUELO + 150} width={120} height={8} fill={"#8E8A80"} />
      ))}
      <Farola x={300} y={SUELO + 20} encendida={noche} />
      {corrida || cerrado ? (
        <g>
          {/* la cola, de perfil, mirando a la puerta */}
          {Array.from({ length: Math.round(16 * gente) + 4 }).map((_, i) => {
            const k = sem * 60 + i;
            const at: Atuendo[] = ["mujer", "traje", "obrero", "mujer", "traje", "traje", "obrero", "mujer", "nino"];
            const lado = i % 2 === 0;
            const x = lado ? BX + 120 - i * 52 : BX + BW - 120 + i * 52;
            return (
              <Andante
                key={i}
                x0={x}
                y={SUELO + 30 + (i % 3) * 8}
                v={0}
                dir={lado ? 1 : -1}
                escala={0.62}
                semilla={k}
                atuendo={at[i % at.length]}
                lleva={rr(k, 2) > 0.7 ? "bolso" : "nada"}
                cabizbajo={rr(k, 3) > 0.6}
              />
            );
          })}
          {/* primera fila de frente, mirando la puerta */}
          {Array.from({ length: Math.round(7 * gente) + 2 }).map((_, i) => {
            const k = sem * 90 + i;
            const at: Atuendo[] = ["mujer", "traje", "obrero", "traje", "mujer", "repartidor"];
            return (
              <Figura
                key={i}
                x={180 + i * 230 + rr(k, 1) * 60}
                y={1150}
                escala={0.75}
                semilla={k}
                atuendo={at[i % at.length]}
                cuerpo="busto"
                gesto={rr(k, 2) > 0.5 ? "inquieto" : "serio"}
                mirada={180 + i * 230 < BX + BW / 2 ? 0.7 : -0.7}
                pose={rr(k, 3) > 0.7 ? "senala" : "quieto"}
              />
            );
          })}
          <Figura x={BX + 520} y={SUELO + 40} escala={0.66} semilla={sem + 400} atuendo="policia" pose={corrida ? "senala" : "quieto"} gesto="serio" />
        </g>
      ) : (
        <g>
          {Array.from({ length: Math.round(8 * gente) + 2 }).map((_, i) => {
            const at: Atuendo[] = ["traje", "mujer", "traje", "obrero", "mujer"];
            return <Andante key={i} x0={-300 + ((i * 431 + sem * 97) % 2500)} y={SUELO + 28} v={(i % 2 ? -1 : 1) * 1.2} escala={0.62} semilla={sem * 20 + i} atuendo={at[i % at.length]} />;
          })}
          <Coche x0={-400} y={SUELO + 200} v={2.6} s={0.9} color={"#2F3A40"} />
        </g>
      )}
      {cerrado ? <Papeles n={6} x0={200} x1={1800} y0={SUELO - 40} y1={SUELO + 200} sem={sem} tam={16} vel={0.6} color={"#D9D0BC"} /> : null}
    </g>
  );
};

export const BANCO: Decorado = {
  desc: "Calle de un barrio de Nueva York con un banco pequeno de piedra (frontis, dos columnas, puertas de bronce, reloj en la acera) entre edificios de ladrillo con escaleras de incendios y tiendas. Variantes: 'corrida' (cola de depositantes y policia), 'cerrado' (puertas cerradas con aviso pegado).",
  ancho: 2000,
  admite: "textos.nombre (nombre del banco en el friso, por defecto CITIZENS BANK), textos.aviso (cartel de la puerta, por defecto CLOSED), textos.tienda / textos.tienda2 (rotulos de las tiendas); variante normal|corrida|cerrado; gente; hora; semilla",
  tomas: {
    general: { de: { x: 1020, y: 540, z: 1 }, a: { x: 1040, y: 560, z: 1.06 }, desc: "la calle y el banco" },
    fachada: { de: { x: 1020, y: 330, z: 1.8 }, a: { x: 1020, y: 360, z: 2.0 }, desc: "el friso con el nombre del banco" },
    puerta: { de: { x: 1020, y: 620, z: 2.2 }, a: { x: 1020, y: 610, z: 2.5 }, desc: "la puerta (con el aviso, si esta cerrado)" },
    cola: { de: { x: 560, y: 740, z: 1.9 }, a: { x: 660, y: 740, z: 2.0 }, desc: "la cola de depositantes en la acera" },
    caras: { de: { x: 760, y: 860, z: 2.0 }, a: { x: 820, y: 860, z: 2.2 }, desc: "caras de la gente que espera (corrida o cerrado)" },
  },
  dibujo: DibujoBanco,
};

/* ------------------------------------------------------------------ */
/* Cola del pan y comedor social                                       */
/* ------------------------------------------------------------------ */

const DibujoComedor: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 9;
  const gente = e.gente ?? 0.9;
  const invierno = e.variante === "invierno";
  const cartel = e.textos?.cartel ?? "FREE SOUP & BREAD";
  const SUELO = 860;
  return (
    <g>
      <Defs />
      <CieloNubes ancho={2400} alto={SUELO} gris sem={sem} hora={e.hora} />
      <Bloque x={-200} w={2700} top={60} suelo={SUELO} sem={sem} color={"#8E6A58"} />
      {/* cartel pintado en la pared */}
      <rect x={300} y={420} width={1100} height={120} fill={"#E9DFC6"} />
      <rect x={312} y={432} width={1076} height={96} fill="none" stroke={C.tinta} strokeWidth={4} />
      <T x={850} y={505} tam={cartel.length > 22 ? 46 : 60} fam="serif" color={C.tinta} esp={4}>
        {cartel}
      </T>
      <rect x={-200} y={SUELO} width={2800} height={36} fill={C.acera} />
      <rect x={-200} y={SUELO + 36} width={2800} height={300} fill={C.asfalto} />
      {/* mesa con las ollas en la puerta */}
      <g transform="translate(1880 0)">
        <rect x={-40} y={SUELO - 160} width={320} height={22} fill={C.maderaLuz} />
        <rect x={-30} y={SUELO - 140} width={14} height={150} fill={C.madera} />
        <rect x={250} y={SUELO - 140} width={14} height={150} fill={C.madera} />
        <rect x={0} y={SUELO - 240} width={110} height={80} rx={10} fill={"#5E605A"} />
        <rect x={140} y={SUELO - 220} width={100} height={60} rx={10} fill={"#6E706A"} />
        <Humo x={50} y={SUELO - 240} s={0.5} color={"#E9E4D4"} n={5} />
        <Humo x={190} y={SUELO - 220} s={0.4} color={"#E9E4D4"} n={4} />
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cx={20 + (i % 4) * 60} cy={SUELO - 166} rx={22} ry={8} fill={"#D9D2BF"} />
        ))}
        <Figura x={60} y={SUELO + 30} escala={0.66} semilla={sem * 2 + 1} atuendo="mujer" gorro="ninguno" pose="escribe" cuerpo="entero" mirada={-0.6} />
        <Figura x={210} y={SUELO + 30} escala={0.64} semilla={sem * 2 + 2} atuendo="traje" gorro="ninguno" pose="carga" papel={"#D9D2BF"} mirada={-0.6} />
        <rect x={-40} y={SUELO - 140} width={320} height={90} fill={"#F2ECDD"} />
        <rect x={-40} y={SUELO - 140} width={320} height={10} fill={"#D9CFB8"} />
      </g>
      {/* la cola: hombres con gorra y abrigo, junto a la pared */}
      {Array.from({ length: Math.round(22 * gente) + 4 }).map((_, i) => {
        const k = sem * 70 + i;
        const at: Atuendo[] = ["obrero", "obrero", "traje", "obrero", "traje", "obrero", "repartidor", "obrero", "mujer"];
        return (
          <Andante
            key={i}
            x0={1800 - i * 78 - rr(k, 1) * 16}
            y={SUELO + 26}
            v={0}
            dir={1}
            escala={0.66}
            semilla={k}
            atuendo={at[i % at.length]}
            gorro={at[i % at.length] === "traje" ? "fedora" : undefined}
            lleva="nada"
            cabizbajo={rr(k, 2) > 0.4}
          />
        );
      })}
      {/* caras en primer termino */}
      {Array.from({ length: 5 }).map((_, i) => {
        const k = sem * 110 + i;
        return (
          <Figura
            key={i}
            x={250 + i * 380 + rr(k, 1) * 60}
            y={1180}
            escala={0.85}
            semilla={k}
            atuendo={i === 2 ? "traje" : "obrero"}
            gorro={i === 2 ? "fedora" : "gorra"}
            cuerpo="busto"
            gesto="serio"
            mirada={0.8}
          />
        );
      })}
      {invierno ? <Papeles n={60} x0={-100} x1={2300} y0={-40} y1={1100} sem={sem} tam={7} vel={1.4} color={"#F4F2EC"} /> : null}
    </g>
  );
};

export const COMEDOR: Decorado = {
  desc: "La cola del pan: una larga fila de hombres con gorra y abrigo junto a una pared de ladrillo con un cartel pintado, hasta una mesa en la acera donde dos voluntarios sirven sopa caliente. Caras serias, con dignidad.",
  ancho: 2400,
  admite: "textos.cartel (cartel pintado, por defecto FREE SOUP & BREAD); variante 'invierno' (nieve); gente; semilla",
  tomas: {
    general: { de: { x: 1100, y: 540, z: 1 }, a: { x: 1300, y: 560, z: 1.05 }, desc: "la cola a lo largo de la pared" },
    cola: { de: { x: 900, y: 700, z: 1.8 }, a: { x: 1100, y: 700, z: 1.9 }, desc: "la cola de perfil, de cerca" },
    caras: { de: { x: 1000, y: 880, z: 2.2 }, a: { x: 1060, y: 880, z: 2.4 }, desc: "caras de los hombres que esperan" },
    mesa: { de: { x: 2000, y: 700, z: 2.2 }, a: { x: 2020, y: 700, z: 2.4 }, desc: "la mesa de la sopa con su vapor" },
    cartel: { de: { x: 850, y: 480, z: 1.7 }, a: { x: 850, y: 500, z: 1.85 }, desc: "el cartel pintado en la pared" },
  },
  dibujo: DibujoComedor,
};

/* ------------------------------------------------------------------ */
/* Hooverville: chabolas junto al rio                                  */
/* ------------------------------------------------------------------ */

const Chabola: React.FC<{ x: number; y: number; s?: number; sem: number }> = ({ x, y, s = 1, sem }) => {
  const tonos = ["#8A7A62", "#6E6A60", "#9E8A70", "#7A6A58", "#5E5A50"];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={i * 40} y={-200 + (i % 2) * 6} width={42} height={200 - (i % 2) * 6} fill={tonos[(i + sem) % tonos.length]} />
      ))}
      <path d={`M -20 -190 L 260 -230 L 270 -200 L -10 -165 Z`} fill={"#7E8086"} />
      <path d="M 0 -190 L 250 -226" stroke={"#5E6066"} strokeWidth={4} />
      <rect x={90} y={-120} width={60} height={120} fill={"#2A2420"} />
      <rect x={170} y={-150} width={50} height={40} fill={"#3E4847"} />
      <rect x={20} y={-110} width={50} height={30} fill={"#C9B8A6"} />
      <rect x={200} y={-300} width={14} height={90} fill={"#3A3A36"} />
      <Humo x={207} y={-300} s={0.45} color={"#B9B2A2"} n={5} />
    </g>
  );
};

const DibujoHooverville: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 10;
  const gente = e.gente ?? 0.6;
  const HORIZ = 560;
  const fuego = Math.sin(f * 0.5) * 0.5 + Math.sin(f * 0.31) * 0.5;
  const cartel = e.textos?.cartel ?? "HOOVERVILLE";
  return (
    <g>
      <Defs />
      <CieloNubes ancho={2400} alto={HORIZ} hora={e.hora} gris sem={sem} />
      {/* skyline y puente al fondo */}
      <g fill={"#B4AE9E"}>
        {[[1300, 260], [1420, 340], [1560, 200], [1680, 400], [1820, 300], [1960, 240], [2080, 360]].map(([x, h], i) => (
          <rect key={i} x={x} y={HORIZ - h} width={100} height={h} />
        ))}
        <rect x={1700} y={HORIZ - 470} width={40} height={80} />
      </g>
      <g stroke={"#8C887E"} strokeWidth={10} fill="none">
        <path d={`M -200 ${HORIZ - 120} L 1100 ${HORIZ - 120}`} />
        <path d={`M 100 ${HORIZ - 120} L 100 ${HORIZ - 330} M 700 ${HORIZ - 120} L 700 ${HORIZ - 330}`} strokeWidth={26} />
        <path d={`M -200 ${HORIZ - 140} Q 100 ${HORIZ - 340} 100 ${HORIZ - 330} Q 400 ${HORIZ - 140} 700 ${HORIZ - 330} Q 900 ${HORIZ - 200} 1100 ${HORIZ - 150}`} strokeWidth={5} />
        {Array.from({ length: 20 }).map((_, i) => (
          <path key={i} d={`M ${-180 + i * 60} ${HORIZ - 120} v ${-40 - Math.abs(Math.sin(i * 0.5)) * 100}`} strokeWidth={2} />
        ))}
      </g>
      {/* rio */}
      <rect x={-200} y={HORIZ} width={2800} height={120} fill={C.agua} />
      {Array.from({ length: 18 }).map((_, i) => (
        <rect key={i} x={((i * 170 + f * 0.6) % 2700) - 200} y={HORIZ + 20 + (i % 4) * 24} width={70} height={4} fill={C.aguaLuz} opacity={0.7} />
      ))}
      {/* descampado */}
      <rect x={-200} y={HORIZ + 110} width={2800} height={600} fill={"#9E9272"} />
      <path d={`M -200 ${HORIZ + 120} Q 600 ${HORIZ + 90} 1400 ${HORIZ + 130} T 2600 ${HORIZ + 110} L 2600 ${HORIZ + 160} L -200 ${HORIZ + 160} Z`} fill={"#8A7E60"} />
      {/* chabolas */}
      <Chabola x={80} y={HORIZ + 260} s={0.8} sem={sem} />
      <Chabola x={560} y={HORIZ + 240} s={0.7} sem={sem + 1} />
      <Chabola x={1500} y={HORIZ + 250} s={0.8} sem={sem + 2} />
      <Chabola x={1900} y={HORIZ + 280} s={0.9} sem={sem + 3} />
      <Chabola x={260} y={HORIZ + 420} s={1.05} sem={sem + 4} />
      {/* cartel pintado a mano */}
      <g transform={`translate(1200 ${HORIZ + 250}) rotate(-4)`}>
        <rect x={-6} y={-10} width={12} height={150} fill={"#5A4A3A"} />
        <rect x={-150} y={-90} width={300} height={80} fill={"#C9B8A0"} />
        <T x={0} y={-36} tam={34} color={"#3A2A1E"} fam="serif">
          {cartel}
        </T>
      </g>
      {/* tendedero */}
      <path d={`M 880 ${HORIZ + 330} Q 1100 ${HORIZ + 360} 1320 ${HORIZ + 330}`} stroke={"#3A3026"} strokeWidth={3} fill="none" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={920 + i * 100} y={HORIZ + 340 + Math.sin(i) * 4} width={60} height={70} fill={["#C9C2B0", "#8E5A4A", "#7A8A9A", "#D9D2BF"][i]} transform={`rotate(${Math.sin(f * 0.06 + i) * 4} ${950 + i * 100} ${HORIZ + 340})`} />
      ))}
      <Figura x={1360} y={HORIZ + 470} escala={0.62} semilla={sem * 3} atuendo="mujer" gorro="ninguno" pose="lee" papel={"#C9C2B0"} />
      {/* bidon con fuego y hombres calentandose */}
      <g transform={`translate(760 ${HORIZ + 470})`}>
        <ellipse cx={0} cy={-120} rx={140} ry={90} fill="url(#crk-fuego)" />
        <rect x={-50} y={-110} width={100} height={110} fill={"#4A4237"} />
        <rect x={-50} y={-80} width={100} height={6} fill={"#3A3430"} />
        <path d={`M -36 -110 Q -30 ${-170 - fuego * 20} -6 ${-190 - fuego * 20} Q 6 -150 20 ${-180 + fuego * 16} Q 34 -140 36 -110 Z`} fill={"#E8862C"} />
        <path d={`M -20 -110 Q -10 ${-150 - fuego * 10} 6 -150 Q 20 -130 20 -110 Z`} fill={"#F6C85A"} />
        <Humo x={0} y={-200} s={0.5} color={"#8E8A80"} n={5} />
      </g>
      {Array.from({ length: Math.round(4 * gente) + 2 }).map((_, i) => {
        const k = sem * 20 + i;
        const xs = [560, 960, 640, 880, 500, 1020];
        return <Figura key={i} x={xs[i % xs.length]} y={HORIZ + 480 + (i % 2) * 40} escala={0.66} semilla={k} atuendo={i % 3 === 2 ? "traje" : "obrero"} pose="manos" gesto="serio" mirada={xs[i % xs.length] < 760 ? 0.7 : -0.7} />;
      })}
      <Figura x={1700} y={HORIZ + 520} escala={0.6} semilla={sem * 4} atuendo="nino" pose="quieto" />
      <Figura x={1800} y={HORIZ + 520} escala={0.68} semilla={sem * 4 + 1} atuendo="obrero" pose="brazos" gesto="serio" />
      {/* primer termino */}
      <rect x={-200} y={1020} width={2800} height={80} fill={"#8A7E60"} />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={-150 + i * 270} y={1000 + (i % 3) * 10} width={60 + (i % 2) * 40} height={14} rx={4} fill={"#6E6450"} transform={`rotate(${(i % 3) * 8 - 8} ${-150 + i * 270} 1000)`} />
      ))}
    </g>
  );
};

export const HOOVERVILLE: Decorado = {
  desc: "Un Hooverville: chabolas de tablas y chapa junto al rio, con el puente y los rascacielos al fondo, tubos de estufa humeando, tendedero, un bidon con fuego donde se calientan los hombres y un cartel pintado a mano.",
  ancho: 2400,
  admite: "textos.cartel (cartel pintado, por defecto HOOVERVILLE); gente; hora; semilla",
  tomas: {
    general: { de: { x: 1000, y: 540, z: 1 }, a: { x: 1300, y: 560, z: 1.05 }, desc: "el campamento entero con la ciudad al fondo" },
    hoguera: { de: { x: 760, y: 860, z: 2.2 }, a: { x: 770, y: 860, z: 2.5 }, desc: "los hombres alrededor del fuego" },
    chabolas: { de: { x: 400, y: 800, z: 1.7 }, a: { x: 460, y: 800, z: 1.85 }, desc: "las chabolas de cerca" },
    ciudad: { de: { x: 1500, y: 420, z: 1.5 }, a: { x: 1600, y: 420, z: 1.6 }, desc: "el puente y la ciudad al otro lado del rio" },
    cartel: { de: { x: 1150, y: 760, z: 2.1 }, a: { x: 1150, y: 760, z: 2.3 }, desc: "el cartel pintado y el tendedero" },
  },
  dibujo: DibujoHooverville,
};

/* ------------------------------------------------------------------ */
/* Florida 1925: venta de parcelas                                     */
/* ------------------------------------------------------------------ */

const Palmera: React.FC<{ x: number; y: number; s?: number; f: number; viento?: number }> = ({ x, y, s = 1, f, viento = 0 }) => {
  const mece = Math.sin(f * 0.05 + x) * (4 + viento * 14) + viento * 80;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -10 0 Q ${-6 + mece * 0.4} -200 ${mece} -420 L ${mece + 18} -420 Q ${10 + mece * 0.4} -200 12 0 Z`} fill={"#7A6248"} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-10 + (mece * i) / 12} y={-30 - i * 33} width={22} height={4} fill={"#5E4A36"} />
      ))}
      <g transform={`translate(${mece + 9} -420)`}>
        {[-150, -110, -70, -30, 10, 50, 90, 130].map((a, i) => (
          <path key={i} d="M 0 0 Q 70 -30 150 20 Q 80 -6 0 6 Z" fill={i % 2 ? "#3F6B4A" : "#4E7A56"} transform={`rotate(${a + 90 + Math.sin(f * 0.07 + i) * (3 + viento * 12) + viento * 20})`} />
        ))}
        <circle r={14} fill={"#5E4A36"} />
      </g>
    </g>
  );
};

const DibujoFlorida: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 11;
  const huracan = e.variante === "huracan";
  const gente = e.gente ?? (huracan ? 0 : 0.8);
  const HORIZ = 600;
  const cartel = e.textos?.cartel ?? "LOTS FOR SALE";
  const precio = e.textos?.precio ?? "";
  const lluvia = huracan ? 1 : 0;
  return (
    <g>
      <Defs />
      {huracan ? (
        <rect x={-200} y={-200} width={2800} height={HORIZ + 200} fill={"#5A6066"} />
      ) : (
        <g>
          <rect x={-200} y={-200} width={2800} height={HORIZ + 200} fill={"#CFE0DC"} />
          <rect x={-200} y={HORIZ - 260} width={2800} height={260} fill={"#E9E6D2"} opacity={0.6} />
          <circle cx={1900} cy={180} r={70} fill={"#F6E3A8"} />
        </g>
      )}
      {/* mar */}
      <rect x={-200} y={HORIZ} width={2800} height={160} fill={huracan ? "#4E6466" : "#7FA8A4"} />
      {Array.from({ length: 24 }).map((_, i) => (
        <path
          key={i}
          d={`M ${((i * 140 + f * (huracan ? 4 : 0.8)) % 2800) - 200} ${HORIZ + 20 + (i % 5) * 28} q 30 ${huracan ? -18 : -6} 60 0`}
          stroke={"#E9F0EC"}
          strokeWidth={huracan ? 6 : 3}
          fill="none"
          opacity={0.8}
        />
      ))}
      {/* arena */}
      <rect x={-200} y={HORIZ + 150} width={2800} height={600} fill={huracan ? "#B9A988" : "#E6D6B0"} />
      {/* estacas de las parcelas */}
      {Array.from({ length: 16 }).map((_, i) => (
        <g key={i}>
          <rect x={60 + i * 150} y={HORIZ + 190 + (i % 2) * 30} width={6} height={50} fill={"#7A6248"} />
          <path d={`M 66 ${HORIZ + 190 + (i % 2) * 30} l 26 8 l -26 8 Z`} transform={`translate(${i * 150} 0)`} fill={C.carmin} />
        </g>
      ))}
      <Palmera x={120} y={HORIZ + 250} s={1.1} f={f} viento={lluvia} />
      <Palmera x={1260} y={HORIZ + 200} s={0.85} f={f + 20} viento={lluvia} />
      <Palmera x={2200} y={HORIZ + 260} s={1.15} f={f + 40} viento={lluvia} />
      {/* oficina de la inmobiliaria */}
      <g transform={`translate(1500 ${HORIZ + 260})`}>
        <rect x={0} y={-260} width={460} height={260} fill={"#F2ECDD"} />
        <rect x={-20} y={-280} width={500} height={30} fill={"#C8402C"} />
        <path d={`M -20 -250 L 480 -250 L 500 -200 L -40 -200 Z`} fill={huracan ? "#7A3A30" : "#D9705A"} />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={-30 + i * 66} y={-250} width={30} height={50} fill={"#F2ECDD"} opacity={0.6} />
        ))}
        <rect x={40} y={-170} width={140} height={110} fill={C.cristal} />
        <rect x={260} y={-170} width={90} height={170} fill={"#5A3F2E"} />
        <T x={230} y={-258} tam={22} color={"#F2ECDD"} esp={3}>
          {e.textos?.oficina ?? "CORAL REALTY CO."}
        </T>
      </g>
      {/* valla publicitaria */}
      <g transform={`translate(560 ${HORIZ + 120}) rotate(${huracan ? 8 + Math.sin(f * 0.3) * 2 : 0})`}>
        <rect x={40} y={0} width={14} height={150} fill={"#7A6248"} />
        <rect x={500} y={0} width={14} height={150} fill={"#7A6248"} />
        <rect x={0} y={-230} width={560} height={240} fill={huracan ? "#C9C2B0" : "#F2ECDD"} stroke={"#3A3026"} strokeWidth={8} />
        <T x={280} y={-150} tam={cartel.length > 16 ? 44 : 56} color={C.carmin} esp={2}>
          {cartel}
        </T>
        {precio ? (
          <T x={280} y={-80} tam={54} color={C.tinta} fam="serif">
            {precio}
          </T>
        ) : (
          <rect x={120} y={-100} width={320} height={10} fill={"#B6AD96"} />
        )}
        <path d="M 40 -30 L 520 -30" stroke={C.verde} strokeWidth={8} />
      </g>
      {/* plano de parcelas en su caballete */}
      <g transform={`translate(1060 ${HORIZ + 330})`}>
        <path d="M 0 0 L 40 -260 M 220 0 L 180 -260 M 110 0 L 110 -250" stroke={"#5A4A3A"} strokeWidth={8} />
        <rect x={-20} y={-300} width={260} height={200} fill={"#F4EFDF"} stroke={"#5A4A3A"} strokeWidth={6} />
        {Array.from({ length: 24 }).map((_, i) => {
          const vendida = rr(i, sem) > 0.45;
          return (
            <g key={i}>
              <rect x={-6 + (i % 6) * 40} y={-286 + Math.floor(i / 6) * 44} width={34} height={38} fill={vendida ? "#E8B9A8" : "#E6E0CC"} stroke={"#8E8270"} strokeWidth={2} />
              {vendida ? <path d={`M ${-2 + (i % 6) * 40} ${-282 + Math.floor(i / 6) * 44} l 26 30`} stroke={C.carmin} strokeWidth={3} /> : null}
            </g>
          );
        })}
      </g>
      {!huracan ? (
        <g>
          <Figura x={960} y={HORIZ + 400} escala={0.72} semilla={sem * 3} atuendo="traje" gorro="canotier" traje={"#E9E2D2"} pose="senala" habla gesto="neutro" mirada={0.5} />
          {Array.from({ length: Math.round(7 * gente) + 1 }).map((_, i) => {
            const k = sem * 30 + i;
            const at: Atuendo[] = ["traje", "mujer", "traje", "mujer", "traje", "traje", "mujer"];
            return (
              <Figura
                key={i}
                x={1240 + i * 120 + rr(k, 1) * 30}
                y={HORIZ + 440 + (i % 2) * 40}
                escala={0.66}
                semilla={k}
                atuendo={at[i % at.length]}
                gorro={at[i % at.length] === "traje" ? "canotier" : undefined}
                pose={rr(k, 2) > 0.7 ? "lee" : "quieto"}
                mirada={-0.7}
                espejo
              />
            );
          })}
          <Coche x0={-160} y={HORIZ + 380} v={0} parado s={0.8} color={"#4A2A24"} capota={false} />
        </g>
      ) : (
        <g>
          {Array.from({ length: 90 }).map((_, i) => {
            const x = ((rr(i, 3) * 2800 + f * 14) % 2800) - 200;
            const y = ((rr(i, 4) * 1200 + f * 40) % 1200) - 100;
            return <path key={i} d={`M ${x} ${y} l 30 60`} stroke={"#D9E0E0"} strokeWidth={2} opacity={0.5} />;
          })}
          <Papeles n={14} x0={-100} x1={2300} y0={-40} y1={1000} sem={sem} tam={22} vel={6} color={"#C9B8A0"} />
        </g>
      )}
    </g>
  );
};

export const FLORIDA: Decorado = {
  desc: "Miami 1925: playa con palmeras, estacas con banderitas marcando parcelas, valla publicitaria, oficina inmobiliaria con toldo, plano de parcelas vendidas y un vendedor de traje blanco y canotier ante los compradores. Variante 'huracan': cielo negro, lluvia, palmeras dobladas y la valla torcida.",
  ancho: 2400,
  admite: "textos.cartel (valla, por defecto LOTS FOR SALE), textos.precio (cifra en la valla), textos.oficina (rotulo de la inmobiliaria); variante 'huracan'; gente; semilla",
  tomas: {
    general: { de: { x: 1000, y: 540, z: 1 }, a: { x: 1300, y: 560, z: 1.05 }, desc: "la playa, la valla y la oficina" },
    valla: { de: { x: 840, y: 600, z: 1.9 }, a: { x: 840, y: 620, z: 2.1 }, desc: "la valla publicitaria de cerca" },
    plano: { de: { x: 1080, y: 760, z: 2.0 }, a: { x: 1080, y: 760, z: 2.3 }, desc: "el vendedor y el plano de parcelas" },
    compradores: { de: { x: 1500, y: 780, z: 1.9 }, a: { x: 1560, y: 780, z: 2.1 }, desc: "los compradores con canotier y cloche" },
    playa: { de: { x: 1900, y: 560, z: 1.6 }, a: { x: 2000, y: 560, z: 1.7 }, desc: "la playa, las palmeras y el mar" },
  },
  dibujo: DibujoFlorida,
};
