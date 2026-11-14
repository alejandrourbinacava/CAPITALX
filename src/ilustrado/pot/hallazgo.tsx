import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloAndes, Cordillera, Humo, Llama, mezcla, rr } from "./comun";
import { Frente, Perfil } from "./Gente";

/**
 * La leyenda del hallazgo: de noche, en la ladera del cerro, un pastor joven
 * enciende una hoguera junto a su llama; al amanecer, entre las cenizas,
 * brillan hilos de plata fundida. Variante "viento": la cumbre con viento
 * fuerte, el hombre apoyado en las manos sobre el mineral, junto a la huaca.
 */

const DibujoHallazgo: React.FC<PropsDecorado> = ({ e }) => {
  const f = useCurrentFrame();
  const viento = e.variante === "viento";
  const hora = e.hora ?? (viento ? "dia" : "noche");
  const noche = hora === "noche";
  const sem = e.semilla ?? 15;
  const t = (c: string) => (noche ? mezcla(c, "#141C2C", 0.62) : hora === "tarde" ? mezcla(c, "#E09A5A", 0.25) : c);
  const llamita = Math.sin(f * 0.5) * 8;
  const rafaga = viento ? Math.sin(f * 0.2) * 6 : 0;
  return (
    <g>
      <CieloAndes hora={hora} ancho={1920} id="hallazgo" nubes={viento ? 7 : 3} />
      <Cordillera y={560} ancho={1920} semilla={23} color={t("#A8A296")} alto={240} />
      {/* la ladera rojiza del cerro */}
      <path d="M -100 1180 L -100 520 Q 400 420 900 360 Q 1300 330 2020 470 L 2020 1180 Z" fill={t(C.cerroLuz)} />
      <path d="M 900 360 Q 1300 330 2020 470 L 2020 1180 L 1100 1180 Q 1200 700 900 360 Z" fill={t(C.cerroSombra)} />
      {Array.from({ length: 50 }).map((_, i) => (
        <path key={i} d={`M ${rr(i, 2) * 1920} ${560 + rr(i, 3) * 500} l ${8 + rr(i, 4) * 14} 3`} stroke={t(C.cerroOscuro)} strokeWidth={3} opacity={0.6} />
      ))}
      {viento ? (
        <g>
          {/* la huaca de la cumbre con ofrendas */}
          <g transform="translate(1300 420)">
            {[[-60, 0, 40], [0, 0, 46], [56, 0, 36], [-30, -40, 34], [26, -40, 32], [0, -76, 26]].map(([x, y, r], i) => (
              <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill={t(i % 2 ? "#8A7A6A" : "#A89A88")} />
            ))}
            <path d="M 70 -10 l 8 -30 l 8 30 Z" fill={t(C.carmin)} />
            <circle cx={-80} cy={10} r={8} fill={t("#5E7A3E")} />
          </g>
          {/* rafagas de viento */}
          {Array.from({ length: 10 }).map((_, i) => {
            const x = ((f * 14 + i * 260) % 2400) - 300;
            return <path key={i} d={`M ${x} ${200 + i * 60} q 80 -20 160 0 t 160 0`} stroke={"#F2EDE2"} strokeWidth={4} fill="none" opacity={0.5} />;
          })}
          {/* el hombre apoyado en el mineral */}
          <g transform={`rotate(${rafaga * 0.3} 820 900)`}>
            <Perfil traje="andino" semilla={sem} x0={820} y={900} s={1.2} pose="agacha" gorro="chullo" />
          </g>
          {Array.from({ length: 8 }).map((_, i) => {
            const tw = Math.max(0, Math.sin(f * 0.12 + i));
            return <path key={i} d={`M ${930 + i * 22} ${890 + (i % 3) * 8} l 18 -4`} stroke={C.plataLuz} strokeWidth={4} opacity={0.4 + tw * 0.6} />;
          })}
        </g>
      ) : (
        <g>
          {/* la hoguera: de noche arde, al amanecer las cenizas con hilos de plata */}
          <g transform="translate(960 860)">
            <circle r={noche ? 260 : 0} fill={"#FFB04A"} opacity={0.14} />
            <circle r={noche ? 130 : 0} fill={"#FFB04A"} opacity={0.18} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ellipse key={i} cx={Math.cos(i) * 70} cy={Math.sin(i) * 16 + 10} rx={22} ry={14} fill={t("#6E5A4A")} />
            ))}
            <ellipse cx={0} cy={10} rx={64} ry={18} fill={noche ? "#5A3A2A" : "#8E8478"} />
            {noche ? (
              <g>
                <path d={`M -40 6 Q -30 ${-80 - llamita} 0 -40 Q 20 ${-110 + llamita} 40 6 Z`} fill={"#F2A23C"} />
                <path d={`M -18 6 Q 0 ${-60 - llamita} 18 6 Z`} fill={"#FFE08A"} />
                <Humo x={0} y={-80} s={1} n={5} semilla={3} color={"#3A3A46"} />
              </g>
            ) : (
              <g>
                {/* hilos de plata fundida entre las cenizas */}
                {Array.from({ length: 9 }).map((_, i) => {
                  const tw = Math.max(0, Math.sin(f * 0.1 + i * 1.7));
                  return <path key={i} d={`M ${-50 + i * 12} ${4 + (i % 3) * 6} q 10 -8 20 -2 t 18 4`} stroke={C.plataLuz} strokeWidth={4} fill="none" opacity={0.5 + tw * 0.5} />;
                })}
                <Humo x={0} y={0} s={0.6} n={3} semilla={4} color={"#C9C2B6"} />
              </g>
            )}
          </g>
          <Llama x0={1300} y={900} s={1.1} semilla={sem + 2} carga="ninguna" dir={-1} />
          <Frente traje="andino" semilla={sem + 1} edad="joven" x={680} y={1000} s={1.05} pose={noche ? "frio" : "senala"} gesto={noche ? "neutro" : "sorpresa"} mirada={1} gorro="chullo" />
        </g>
      )}
      {noche ? <rect x={-100} y={-100} width={2120} height={1300} fill={"#0A1020"} opacity={0.12} /> : null}
    </g>
  );
};

export const HALLAZGO: Decorado = {
  desc: "La leyenda del hallazgo en la ladera rojiza del cerro: de noche (por defecto) un pastor joven junto a una hoguera y su llama; de dia ('hora': 'dia' o 'tarde') el amanecer, las cenizas con hilos de plata que brillan y el pastor que senala sorprendido. Variante 'viento': la cumbre azotada por el viento, la huaca con ofrendas y el hombre agachado con las manos sobre el mineral que brilla.",
  admite: "hora ('noche' por defecto: la hoguera; 'dia' o 'tarde': las cenizas con plata), variante ('viento': la cumbre y la huaca), semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 560, z: 1.08 }, desc: "la ladera, la hoguera, el pastor y la llama" },
    hoguera: { de: { x: 960, y: 800, z: 2.6 }, a: { x: 960, y: 820, z: 3.2 }, desc: "la hoguera (o las cenizas con plata, o las manos sobre el mineral)" },
    cara: { de: { x: 700, y: 620, z: 2.8 }, a: { x: 690, y: 610, z: 3.2 }, desc: "el pastor de cerca" },
    llama: { de: { x: 1200, y: 720, z: 2.2 }, a: { x: 1240, y: 720, z: 2.4 }, desc: "la llama (o la huaca de la cumbre)" },
  },
  dibujo: DibujoHallazgo,
};
