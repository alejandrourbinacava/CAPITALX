import React from "react";
import type { Decorado, PropsDecorado } from "../tipos";
import { BanderaUSA, C, CieloNubes, Coche, Columna, Defs, Farola, Papeles, T, rr } from "./comun";
import { Andante, Figura, type Atuendo } from "./gente";

/**
 * Broad Street y Wall Street, 1929: el Federal Hall con la estatua de
 * Washington, la esquina de la casa Morgan (numero 23 de Wall Street) y la
 * fachada de la Bolsa de Nueva York con sus seis columnas. Variante "jueves":
 * la multitud del Jueves Negro llena la calle y las escalinatas, con policia.
 */

const SUELO = 900;

const Rascacielos: React.FC<{ noche: boolean }> = ({ noche }) => {
  const tono = noche ? "#3A4250" : "#CFC4AC";
  const ventana = noche ? "#E9C77A" : "#B8AD95";
  const torres = [
    { x: -80, w: 260, top: -40 },
    { x: 960, w: 240, top: 60 },
    { x: 2380, w: 300, top: -80 },
    { x: 1820, w: 220, top: -120 },
  ];
  return (
    <g>
      {torres.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={t.top} width={t.w} height={SUELO - t.top} fill={tono} />
          {Array.from({ length: Math.floor(t.w / 50) }).map((_, c) =>
            Array.from({ length: 10 }).map((__, fl) => (
              <rect key={`${c}-${fl}`} x={t.x + 18 + c * 50} y={t.top + 30 + fl * 70} width={22} height={40} fill={ventana} opacity={noche && rr(c * 13 + fl, i) > 0.55 ? 0.95 : noche ? 0.15 : 0.9} />
            ))
          )}
        </g>
      ))}
      {/* Bankers Trust: la piramide escalonada */}
      <g fill={noche ? "#353C49" : "#C6BBA2"}>
        <rect x={1870} y={-120} width={120} height={60} />
        <polygon points="1870,-120 1930,-200 1990,-120" />
      </g>
    </g>
  );
};

const FederalHall: React.FC = () => {
  const base = 700;
  return (
    <g>
      {/* cuerpo y frontis */}
      <rect x={140} y={250} width={820} height={base - 250} fill={C.piedraSombra} />
      <rect x={180} y={330} width={740} height={base - 330} fill={"#9E927A"} />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect x={300 + k * 230} y={480} width={90} height={190} fill={C.cristal} />
          <rect x={290 + k * 230} y={466} width={110} height={14} fill={C.piedra} />
        </g>
      ))}
      {Array.from({ length: 8 }).map((_, i) => {
        const cx = 180 + i * 106;
        return (
          <g key={i}>
            <rect x={cx - 26} y={330} width={52} height={base - 330} fill={C.piedraLuz} />
            {[0.2, 0.4, 0.6, 0.8].map((k) => (
              <rect key={k} x={cx - 26 + 52 * k - 1} y={334} width={2} height={base - 340} fill={C.piedraMedia} opacity={0.7} />
            ))}
            <rect x={cx + 10} y={330} width={16} height={base - 330} fill={C.piedraMedia} opacity={0.5} />
            <rect x={cx - 34} y={318} width={68} height={14} fill={C.piedra} />
          </g>
        );
      })}
      <rect x={130} y={262} width={840} height={58} fill={C.piedra} />
      <rect x={130} y={300} width={840} height={8} fill={C.piedraMedia} />
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x={146 + i * 41.5} y={270} width={16} height={26} fill={C.piedraMedia} opacity={0.6} />
      ))}
      <polygon points="120,262 550,140 980,262" fill={C.piedra} stroke={C.piedraMedia} strokeWidth={12} />
      {/* escalinata */}
      {Array.from({ length: 10 }).map((_, i) => (
        <g key={i}>
          <rect x={110 - i * 6} y={base + i * 20} width={880 + i * 12} height={20} fill={i % 2 ? C.piedraMedia : C.piedra} />
          <rect x={110 - i * 6} y={base + i * 20 + 17} width={880 + i * 12} height={3} fill={C.piedraSombra} />
        </g>
      ))}
      {/* Washington en su pedestal */}
      <g transform="translate(550 0)">
        <rect x={-70} y={790} width={140} height={110} fill={C.piedraOscura} />
        <rect x={-80} y={780} width={160} height={16} fill={C.piedraMedia} />
        <rect x={-58} y={804} width={116} height={80} fill={"#9A8E74"} />
        <T x={0} y={852} tam={20} fam="serif" color={C.piedraLuz} esp={3}>
          WASHINGTON
        </T>
        <g fill={"#4D5A4C"}>
          <path d="M -34 780 L -30 660 Q -30 630 0 626 Q 30 630 32 660 L 38 780 Z" />
          <path d="M -40 700 Q -48 740 -30 780 L 40 780 Q 52 730 36 690 Z" fill={"#435046"} />
          <path d="M 30 650 L 66 690 L 60 700 L 26 668 Z" />
          <circle cx={0} cy={606} r={22} />
          <rect x={-16} y={584} width={32} height={10} />
        </g>
      </g>
    </g>
  );
};

const CasaMorgan: React.FC = () => (
  <g>
    <rect x={970} y={380} width={230} height={SUELO - 380} fill={"#E4DCCB"} />
    <rect x={960} y={360} width={250} height={26} fill={C.piedraMedia} />
    {[0, 1].map((k) => (
      <g key={k}>
        <rect x={1000 + k * 110} y={430} width={60} height={170} fill={C.cristal} />
        <rect x={1000 + k * 110} y={430} width={60} height={20} fill={C.piedraMedia} />
        <rect x={1000 + k * 110} y={660} width={60} height={110} fill={C.cristal} />
      </g>
    ))}
    <rect x={1040} y={800} width={90} height={100} fill={"#2A2420"} />
    <T x={1085} y={792} tam={18} fam="serif" color={C.piedraOscura}>
      23
    </T>
    {/* marcas de metralla de 1920, sutiles */}
    {[0, 1, 2, 3].map((k) => (
      <circle key={k} cx={990 + rr(k, 4) * 190} cy={620 + rr(k, 5) * 120} r={3} fill={C.piedraSombra} />
    ))}
  </g>
);

const Bolsa: React.FC<{ noche: boolean }> = ({ noche }) => {
  const x0 = 1220;
  const w = 1220;
  return (
    <g>
      <rect x={x0} y={150} width={w} height={SUELO - 150} fill="url(#crk-sillar)" />
      <rect x={x0 + 70} y={250} width={w - 140} height={560} fill={C.piedraSombra} />
      <rect x={x0 + 120} y={290} width={w - 240} height={360} fill={noche ? "#5A5236" : C.cristal} />
      {Array.from({ length: 13 }).map((_, i) => (
        <rect key={i} x={x0 + 120 + i * ((w - 240) / 12)} y={290} width={5} height={360} fill={C.piedraMedia} />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={x0 + 120} y={290 + i * 72} width={w - 240} height={4} fill={C.piedraMedia} />
      ))}
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <rect x={x0 + 150 + k * 205} y={680} width={110} height={120} fill={"#17130F"} />
          <rect x={x0 + 140 + k * 205} y={668} width={130} height={12} fill={C.piedraMedia} />
        </g>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <Columna key={i} x={x0 + 110 + i * 200} y={810} h={560} w={74} />
      ))}
      <rect x={x0 - 20} y={168} width={w + 40} height={64} fill={C.piedra} />
      <rect x={x0 - 20} y={220} width={w + 40} height={10} fill={C.piedraMedia} />
      <T x={x0 + w / 2} y={208} tam={30} fam="serif" color={C.piedraOscura} esp={10}>
        NEW YORK STOCK EXCHANGE
      </T>
      <polygon points={`${x0 - 40},168 ${x0 + w / 2},20 ${x0 + w + 40},168`} fill={C.piedra} stroke={C.piedraMedia} strokeWidth={14} />
      {Array.from({ length: 11 }).map((_, i) => {
        const fx = x0 + 270 + i * 68;
        const alto = 30 + (1 - Math.abs(i - 5) / 5) * 80;
        return (
          <g key={i} fill={C.piedraMedia}>
            <circle cx={fx} cy={160 - alto + 10} r={10} />
            <rect x={fx - 12} y={160 - alto + 20} width={24} height={alto - 20} rx={7} />
          </g>
        );
      })}
      <rect x={x0 - 30} y={810} width={w + 60} height={90} fill={C.piedraMedia} />
      <rect x={x0 - 30} y={810} width={w + 60} height={10} fill={C.piedraSombra} />
      <BanderaUSA x={x0 + 40} y={-160} s={0.9} mastil={330} />
      <BanderaUSA x={x0 + w - 60} y={-160} s={0.9} mastil={330} />
    </g>
  );
};

/** Una fila de gente de frente, quieta, mirando hacia la Bolsa. */
const Fila: React.FC<{ n: number; x0: number; x1: number; y: number; s: number; sem: number; mezcla?: Atuendo[]; busto?: boolean; gesto?: "inquieto" | "serio" | "sorpresa" | "neutro" }> = ({
  n,
  x0,
  x1,
  y,
  s,
  sem,
  mezcla = ["traje", "traje", "traje", "obrero", "mujer", "traje", "repartidor"],
  busto,
  gesto = "inquieto",
}) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const k = sem + i * 7;
      const at = mezcla[Math.floor(rr(k, 3) * mezcla.length)];
      const x = x0 + ((i + 0.5) / n) * (x1 - x0) + (rr(k, 4) - 0.5) * 30;
      const pose = rr(k, 5) > 0.85 ? "senala" : rr(k, 5) > 0.75 ? "lee" : rr(k, 5) > 0.65 ? "habla" : "quieto";
      return (
        <Figura
          key={i}
          x={x}
          y={y + (rr(k, 6) - 0.5) * 8}
          escala={s}
          semilla={k}
          atuendo={at}
          pose={pose}
          mirada={rr(k, 7) - 0.5}
          gesto={rr(k, 8) > 0.5 ? gesto : "serio"}
          cuerpo={busto ? "busto" : "entero"}
          espejo={rr(k, 9) > 0.5}
        />
      );
    })}
  </g>
);

const Dibujo: React.FC<PropsDecorado> = ({ e, f }) => {
  const noche = e.hora === "noche";
  const jueves = e.variante === "jueves";
  const gente = e.gente ?? (jueves ? 1 : 0.5);
  const sem = e.semilla ?? 1;
  return (
    <g>
      <Defs />
      <CieloNubes ancho={2600} alto={SUELO} hora={e.hora} gris={jueves && !noche} sem={sem} />
      <Rascacielos noche={noche} />
      <FederalHall />
      <CasaMorgan />
      <Bolsa noche={noche} />
      {/* acera y calzada de Broad Street */}
      <rect x={-200} y={SUELO} width={3000} height={26} fill={C.acera} />
      <rect x={-200} y={SUELO + 26} width={3000} height={300} fill="url(#crk-adoquin)" />
      <Farola x={1150} y={SUELO + 10} s={0.95} encendida={noche} />
      <Farola x={2480} y={SUELO + 10} s={0.95} encendida={noche} />
      {jueves ? (
        <g>
          {/* gente en la escalinata del Federal Hall */}
          {Array.from({ length: 4 }).map((_, fila) => (
            <Fila key={fila} n={Math.round(7 * gente) + fila} x0={170 + fila * 10} x1={950 - fila * 10} y={760 + fila * 40} s={0.34 + fila * 0.02} sem={sem * 50 + fila * 31} busto={false} />
          ))}
          {/* la calle llena: tres filas, delante mas grandes */}
          <Fila n={Math.round(16 * gente) + 4} x0={1000} x1={2560} y={960} s={0.42} sem={sem * 70 + 3} />
          <Fila n={Math.round(13 * gente) + 3} x0={980} x1={2580} y={1010} s={0.5} sem={sem * 70 + 17} />
          <Fila n={Math.round(10 * gente) + 3} x0={-40} x1={1040} y={1010} s={0.5} sem={sem * 70 + 29} />
          <Fila n={Math.round(11 * gente) + 2} x0={-60} x1={2640} y={1110} s={0.6} sem={sem * 70 + 41} busto />
          {/* policia en primera fila */}
          {[1320, 1760, 2180, 420].map((px, i) => (
            <Figura key={i} x={px} y={1060} escala={0.58} semilla={900 + i} atuendo="policia" pose={i === 1 ? "senala" : "quieto"} gesto="serio" />
          ))}
          <Papeles n={14} x0={1100} x1={2500} y0={-50} y1={SUELO} sem={sem + 5} tam={14} vel={1.6} />
        </g>
      ) : (
        <g>
          {Array.from({ length: Math.round(10 * gente) + 3 }).map((_, i) => {
            const at: Atuendo[] = ["traje", "traje", "mujer", "traje", "repartidor", "traje", "mujer", "obrero"];
            return (
              <Andante
                key={i}
                x0={-300 + ((i * 397 + sem * 113) % 3000)}
                y={SUELO + 22}
                v={(i % 2 ? -1 : 1) * (1.1 + rr(i, sem) * 0.5)}
                escala={0.62}
                semilla={sem * 30 + i}
                atuendo={at[i % at.length]}
              />
            );
          })}
          <Coche x0={-500} y={SUELO + 150} v={3.2} s={0.95} color={"#22302C"} />
          <Coche x0={2900} y={SUELO + 170} v={-2.6} s={1} color={"#3A2A24"} />
          <Fila n={Math.round(7 * gente) + 2} x0={-40} x1={2640} y={1110} s={0.6} sem={sem * 70 + 41} busto gesto="neutro" />
        </g>
      )}
      {f < 0 ? null : null}
    </g>
  );
};

export const BOLSA: Decorado = {
  desc: "Broad Street y Wall Street en 1929: Federal Hall con la estatua de Washington, la casa Morgan (Wall St. 23) y la fachada de la Bolsa de Nueva York. Variante 'jueves': multitud del Jueves Negro con policia y gente en la escalinata.",
  ancho: 2600,
  admite: "variante 'jueves' (multitud y policia) o normal (transeuntes y coches); gente 0..1; hora dia|tarde|noche; semilla",
  tomas: {
    general: { de: { x: 1640, y: 540, z: 1 }, a: { x: 1450, y: 560, z: 1.06 }, desc: "plano general de la Bolsa y la esquina, paneo lento" },
    fachada: { de: { x: 1830, y: 470, z: 1.25 }, a: { x: 1830, y: 520, z: 1.4 }, desc: "la fachada de la Bolsa, de cerca" },
    federal: { de: { x: 560, y: 640, z: 1.45 }, a: { x: 640, y: 680, z: 1.6 }, desc: "Federal Hall, la escalinata y Washington" },
    esquina: { de: { x: 1100, y: 600, z: 1.5 }, a: { x: 1180, y: 640, z: 1.7 }, desc: "la esquina de la casa Morgan, Wall Street 23" },
    multitud: { de: { x: 1700, y: 860, z: 2.2 }, a: { x: 1900, y: 860, z: 2.4 }, desc: "caras de la multitud en la calle (mejor con variante jueves)" },
    cara: { de: { x: 1760, y: 820, z: 3.4 }, a: { x: 1760, y: 830, z: 3.8 }, desc: "primer plano de un policia y la gente detras" },
  },
  dibujo: Dibujo,
};
