import React from "react";
import { interpolate } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { BanderaUSA, C, Defs, Papeles, T, oscurecer, rr, suave } from "./comun";
import { Figura } from "./gente";

/**
 * El parque de la Bolsa de Nueva York: el gran salon con sus ventanales, los
 * tableros anunciadores de las paredes, los corros (puestos de negociacion)
 * con el nombre de los valores en lo alto, corredores con chaqueta clara y
 * el suelo que se va llenando de papeles.
 */

const ANCHO = 2400;
const SUELO = 640;

const Ventanal: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 10} y={40} width={300} height={470} fill={"#A89C80"} />
    <rect x={x} y={50} width={280} height={450} fill={"#D9D2BB"} />
    <rect x={x} y={50} width={280} height={450} fill="url(#crk-luzVentana)" />
    {Array.from({ length: 5 }).map((_, i) => (
      <rect key={i} x={x + i * 70} y={50} width={4} height={450} fill={"#8C8068"} />
    ))}
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={x} y={50 + i * 56} width={280} height={4} fill={"#8C8068"} />
    ))}
    <path d={`M ${x} 50 Q ${x + 140} -20 ${x + 280} 50`} fill={"#A89C80"} />
  </g>
);

/** Tablero anunciador: casillas numeradas que se encienden para llamar a los corredores. */
const Anunciador: React.FC<{ x: number; y: number; f: number; sem: number }> = ({ x, y, f, sem }) => (
  <g>
    <rect x={x - 12} y={y - 12} width={444} height={204} fill={C.maderaOsc} />
    <rect x={x} y={y} width={420} height={180} fill={"#1E2321"} />
    {Array.from({ length: 60 }).map((_, i) => {
      const c = i % 12;
      const fl = Math.floor(i / 12);
      const on = rr(i + Math.floor(f / 9) * 61, sem) > 0.82;
      return (
        <g key={i}>
          <rect x={x + 8 + c * 34} y={y + 8 + fl * 34} width={28} height={28} fill={on ? C.ocre : "#2E3532"} />
          <T x={x + 22 + c * 34} y={y + 27 + fl * 34} tam={11} color={on ? C.tinta : "#5A625E"} fam="mono">
            {fl * 12 + c + 1}
          </T>
        </g>
      );
    })}
  </g>
);

/** Corro: el puesto de negociacion con los valores en lo alto. */
const Corro: React.FC<{ x: number; s: number; nombres: string[]; precio?: string; f: number }> = ({ x, s, nombres, precio, f }) => (
  <g transform={`translate(${x} ${SUELO + 60}) scale(${s})`}>
    {/* pilar y marquesina */}
    <rect x={-22} y={-470} width={44} height={350} fill={C.maderaMedia} />
    <rect x={-210} y={-560} width={420} height={110} fill={C.maderaOsc} />
    <rect x={-200} y={-552} width={400} height={94} fill={"#2C2622"} />
    {nombres.map((n, i) => (
      <g key={i}>
        <rect x={-196 + i * (400 / nombres.length)} y={-548} width={400 / nombres.length - 6} height={40} fill={"#F0E8D4"} />
        <T x={-196 + i * (400 / nombres.length) + (400 / nombres.length - 6) / 2} y={-520} tam={nombres.length > 2 ? 18 : 24} color={C.tinta}>
          {n}
        </T>
        <rect x={-196 + i * (400 / nombres.length)} y={-502} width={400 / nombres.length - 6} height={38} fill={"#151917"} />
        {precio && i === 0 ? (
          <T x={-196 + (400 / nombres.length - 6) / 2} y={-473} tam={28} color={C.ocre} fam="mono">
            {precio}
          </T>
        ) : (
          <g>
            {[0, 1, 2].map((k) => (
              <rect key={k} x={-180 + i * (400 / nombres.length) + k * 22} y={-490} width={14} height={16} fill={(Math.floor(f / 20) + k + i) % 4 === 0 ? C.ocre : "#3A403C"} />
            ))}
          </g>
        )}
      </g>
    ))}
    <rect x={-230} y={-578} width={460} height={20} fill={C.maderaLuz} />
    {/* mostrador en herradura */}
    <rect x={-250} y={-150} width={500} height={150} rx={30} fill={C.maderaMedia} />
    <rect x={-250} y={-150} width={500} height={18} rx={9} fill={C.maderaLuz} />
    {Array.from({ length: 5 }).map((_, i) => (
      <rect key={i} x={-220 + i * 100} y={-120} width={70} height={100} rx={6} fill={oscurecer(C.maderaMedia, 0.88)} />
    ))}
    {/* empleados del corro detras del mostrador */}
    <Figura x={-120} y={-30} escala={0.55} semilla={x + 11} atuendo="corredor" cuerpo="busto" largo={180} pose="escribe" />
    <Figura x={110} y={-30} escala={0.55} semilla={x + 12} atuendo="corredor" cuerpo="busto" largo={180} />
    <rect x={-250} y={-104} width={500} height={104} rx={20} fill={C.maderaMedia} />
    <rect x={-250} y={-104} width={500} height={14} rx={7} fill={C.maderaLuz} />
  </g>
);

const Dibujo: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const sem = e.semilla ?? 3;
  const gente = e.gente ?? 0.8;
  const panico = e.variante === "panico";
  const tx = e.textos ?? {};
  const v = e.valores ?? [];
  const t = suave(f / Math.max(1, dur * 0.8));
  const precio =
    tx.precio ??
    (v.length >= 2 ? String(Math.round(interpolate(t, [0, 1], [v[0], v[1]]))) : v.length === 1 ? String(v[0]) : undefined);
  const poste = tx.poste ?? "U.S. STEEL";
  return (
    <g>
      <Defs />
      {/* el salon */}
      <rect x={-200} y={-200} width={ANCHO + 400} height={SUELO + 200} fill={"#CDBF9F"} />
      <rect x={-200} y={-200} width={ANCHO + 400} height={60} fill={"#B7A985"} />
      {[560, 1560].map((x) => (
        <Ventanal key={x} x={x} />
      ))}
      {[240, 2160].map((x, i) => (
        <g key={x} transform={`translate(${x} 170)`}>
          <circle r={86} fill={C.maderaOsc} />
          <circle r={72} fill={"#F2ECDD"} />
          {Array.from({ length: 12 }).map((_, k) => (
            <rect key={k} x={-2} y={-66} width={4} height={12} fill={C.tinta} transform={`rotate(${k * 30})`} />
          ))}
          <rect x={-3} y={-44} width={6} height={46} fill={C.tinta} transform={`rotate(${300 + i * 20 + f * 0.05})`} />
          <rect x={-2} y={-60} width={4} height={62} fill={C.carmin} transform={`rotate(${f * 6})`} />
          <circle r={6} fill={C.laton} />
        </g>
      ))}
      {/* pilastras */}
      {[60, 460, 860, 1540, 1940, 2340].map((x) => (
        <g key={x}>
          <rect x={x - 24} y={0} width={48} height={SUELO} fill={"#BFB08F"} />
          <rect x={x - 32} y={0} width={64} height={22} fill={"#A89C80"} />
        </g>
      ))}
      {/* la gran bandera colgada en el centro */}
      <g transform="translate(940 40) scale(3.4)">
        <BanderaUSA x={0} y={-6} s={1} mastil={0} />
      </g>
      <Anunciador x={30} y={300} f={f + 7} sem={sem + 1} />
      <Anunciador x={1950} y={300} f={f + 3} sem={sem + 2} />
      {/* galeria de visitantes */}
      <rect x={-200} y={560} width={ANCHO + 400} height={14} fill={C.maderaOsc} />
      {/* suelo */}
      <rect x={-200} y={SUELO} width={ANCHO + 400} height={1080 - SUELO + 200} fill="url(#crk-parquet)" />
      <rect x={-200} y={SUELO} width={ANCHO + 400} height={10} fill={C.maderaOsc} />
      {/* corros del fondo */}
      <Corro x={420} s={0.75} nombres={["RCA", "GEN MOTORS"]} f={f} />
      <Corro x={1980} s={0.75} nombres={["A.T.&T.", "ANACONDA", "GEN ELEC."]} f={f + 5} />
      {/* corredores del fondo */}
      {Array.from({ length: Math.round(18 * gente) + 4 }).map((_, i) => {
        const k = sem * 40 + i;
        return (
          <Figura
            key={i}
            x={-60 + ((i * 263 + sem * 71) % (ANCHO + 120))}
            y={SUELO + 120 + rr(k, 2) * 20}
            escala={0.4}
            semilla={k}
            atuendo={rr(k, 3) > 0.35 ? "corredor" : "traje"}
            gorro="ninguno"
            pose={rr(k, 4) > 0.5 ? "alza" : rr(k, 4) > 0.3 ? "habla" : "quieto"}
            gesto={panico ? "inquieto" : "neutro"}
            espejo={rr(k, 5) > 0.5}
          />
        );
      })}
      {/* el corro principal */}
      <Corro x={1200} s={1} nombres={[poste, "BETHLEHEM", "U.S. RUBBER"]} precio={precio} f={f} />
      {/* papeles en el suelo */}
      {Array.from({ length: Math.round((panico ? 160 : 60) * (0.5 + 0.5 * t)) }).map((_, i) => (
        <rect
          key={i}
          x={-100 + rr(i, sem + 9) * (ANCHO + 200)}
          y={SUELO + 140 + rr(i, sem + 10) * 380}
          width={18 + rr(i, 3) * 10}
          height={10 + rr(i, 4) * 6}
          fill={rr(i, 5) > 0.3 ? "#EEE8D8" : "#E4D3A8"}
          transform={`rotate(${rr(i, 6) * 80 - 40} ${-100 + rr(i, sem + 9) * (ANCHO + 200)} ${SUELO + 140 + rr(i, sem + 10) * 380})`}
        />
      ))}
      {/* corredores del primer termino, alrededor del corro */}
      {Array.from({ length: Math.round(9 * gente) + 3 }).map((_, i) => {
        const k = sem * 90 + i;
        const x = 760 + i * 95 + (rr(k, 1) - 0.5) * 40;
        return (
          <Figura
            key={i}
            x={x}
            y={SUELO + 300 + rr(k, 2) * 30}
            escala={0.6}
            semilla={k}
            atuendo={rr(k, 3) > 0.3 ? "corredor" : "traje"}
            gorro="ninguno"
            pose={rr(k, 4) > 0.45 ? "alza" : rr(k, 4) > 0.25 ? "habla" : "senala"}
            gesto={panico ? (rr(k, 5) > 0.5 ? "sorpresa" : "inquieto") : "neutro"}
            mirada={x < 1200 ? 0.6 : -0.6}
            espejo={x > 1200}
          />
        );
      })}
      {/* Whitney: alto, traje oscuro, pujando en el corro */}
      {tx.whitney ? (
        <Figura x={1330} y={SUELO + 360} escala={0.72} semilla={1929} atuendo="traje" gorro="ninguno" traje="#1F2428" rasgos={{ bigote: "ninguno", gafas: false, edad: "maduro", peinado: "raya", pelo: "#3F2E24", piel: "#E2B892" }} pose="alza" habla gesto="serio" />
      ) : null}
      {/* primera fila, cortada por el borde inferior */}
      {Array.from({ length: 6 }).map((_, i) => {
        const k = sem * 130 + i;
        return (
          <Figura
            key={i}
            x={-80 + i * 470 + rr(k, 1) * 80}
            y={1300}
            escala={0.95}
            semilla={k}
            atuendo={i % 2 ? "corredor" : "traje"}
            gorro="ninguno"
            cuerpo="busto"
            pose={i % 3 === 0 ? "alza" : "habla"}
            gesto={panico ? "inquieto" : "neutro"}
            mirada={0.4}
          />
        );
      })}
      {panico ? <Papeles n={20} x0={0} x1={ANCHO} y0={-60} y1={1000} sem={sem} tam={16} vel={2.6} /> : null}
    </g>
  );
};

export const PARQUE: Decorado = {
  desc: "El parque de la Bolsa de Nueva York: ventanales, la gran bandera, tableros anunciadores, corros con los valores en lo alto, corredores con chaqueta clara y papeles por el suelo.",
  ancho: ANCHO,
  admite:
    "textos.poste (valor del corro principal, por defecto U.S. STEEL), textos.precio (cifra fija en el indicador) o valores [de, a] (el indicador cuenta), textos.whitney='1' (Richard Whitney pujando en el corro); variante 'panico' (gestos de miedo, papeles volando); gente; semilla",
  tomas: {
    general: { de: { x: 1200, y: 540, z: 1 }, a: { x: 1240, y: 560, z: 1.08 }, desc: "el parque entero con los corros y la bandera" },
    corro: { de: { x: 1200, y: 420, z: 1.6 }, a: { x: 1220, y: 470, z: 1.85 }, desc: "el corro principal con su indicador de precio" },
    indicador: { de: { x: 1080, y: 200, z: 3.2 }, a: { x: 1080, y: 200, z: 3.6 }, desc: "detalle del rotulo del valor y su precio" },
    puja: { de: { x: 1300, y: 640, z: 2.2 }, a: { x: 1330, y: 640, z: 2.6 }, desc: "corredores pujando junto al corro (Whitney si textos.whitney)" },
    anunciador: { de: { x: 230, y: 420, z: 2.5 }, a: { x: 250, y: 430, z: 2.8 }, desc: "el tablero anunciador con casillas que se encienden" },
    suelo: { de: { x: 600, y: 860, z: 1.8 }, a: { x: 760, y: 820, z: 1.9 }, desc: "el suelo lleno de papeles y la gente" },
  },
  dibujo: Dibujo,
};
