import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloAndes, Cordillera, Humo, Llama, Mula, TexturasPot, mezcla, osc, rr } from "./comun";
import { Frente, Perfil } from "./Gente";

/**
 * El pueblo de origen de los mitayos y el camino a Potosi. La despedida: el
 * mitayo con su costal, su mujer con el nino a la espalda en la lliclla, los
 * abuelos, el curaca leyendo la lista; y la larga marcha de familias y llamas
 * por el altiplano. Con dignidad: cansancio y despedida, nada mas.
 */

const Ichu: React.FC<{ x: number; y: number; s?: number; c: string }> = ({ x, y, s = 1, c }) => {
  const f = useCurrentFrame();
  const v = Math.sin(f * 0.05 + x * 0.01) * 3;
  return <path transform={`translate(${x} ${y}) scale(${s})`} d={`M -16 0 L ${-22 + v} -26 L -10 -4 L ${-8 + v} -34 L -2 -4 L ${4 + v} -36 L 6 -4 L ${16 + v} -28 L 14 0 Z`} fill={c} />;
};

/** Casa andina de adobe con techo de paja (ichu) a dos aguas. */
const CasaPaja: React.FC<{ x: number; y: number; s: number; semilla: number; humo?: boolean; tinte: (c: string) => string }> = ({ x, y, s, semilla, humo, tinte }) => {
  const w = 220 + rr(semilla, 1) * 80;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={0} y={-150} width={w} height={150} fill={tinte(C.adobe)} />
      <rect x={0} y={-150} width={w} height={150} fill="url(#pot-adobe)" opacity={0.7} />
      <rect x={w * 0.7} y={-150} width={w * 0.3} height={150} fill={tinte(C.adobeSombra)} opacity={0.5} />
      <path d={`M -24 -140 L ${w / 2} -250 L ${w + 24} -140 Z`} fill={tinte(C.paja)} />
      <path d={`M -24 -140 L ${w / 2} -250 L ${w + 24} -140 Z`} fill="url(#pot-paja)" opacity={0.6} />
      <path d={`M -24 -140 L ${w + 24} -140`} stroke={tinte(C.pajaSombra)} strokeWidth={8} />
      <path d={`M ${w * 0.3} 0 L ${w * 0.3} -96 L ${w * 0.48} -96 L ${w * 0.48} 0 Z`} fill={tinte("#3A2A20")} />
      <rect x={w * 0.28} y={-104} width={w * 0.22} height={10} fill={tinte(C.madera)} />
      <rect x={w * 0.66} y={-110} width={34} height={30} fill={tinte("#3A2A20")} />
      {humo ? <Humo x={w * 0.5} y={-250} s={0.9} n={5} semilla={semilla} color={"#D8D2C8"} /> : null}
    </g>
  );
};

/** Muro de pirca: piedras sueltas apiladas. */
const Pirca: React.FC<{ x: number; y: number; w: number; tinte: (c: string) => string }> = ({ x, y, w, tinte }) => (
  <g>
    {Array.from({ length: Math.floor(w / 26) }).map((_, i) =>
      [0, 1, 2].map((fila) => (
        <ellipse key={`${i}-${fila}`} cx={x + i * 26 + (fila % 2) * 13} cy={y - 10 - fila * 16} rx={15} ry={9} fill={tinte(fila === 2 ? C.piedraSombra : i % 3 ? C.piedra : C.piedraOscura)} />
      ))
    )}
  </g>
);

/** Capilla de pueblo con espadana y cruz en el atrio. */
const Capilla: React.FC<{ x: number; y: number; s: number; tinte: (c: string) => string }> = ({ x, y, s, tinte }) => {
  const f = useCurrentFrame();
  const cam = Math.sin(f * 0.08) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-40} y={-230} width={360} height={230} fill={tinte(C.cal)} />
      <rect x={200} y={-230} width={120} height={230} fill={tinte(C.calSombra)} />
      <path d="M -60 -220 L 140 -300 L 340 -220 Z" fill={tinte(C.paja)} />
      <path d="M -60 -220 L 140 -300 L 340 -220 Z" fill="url(#pot-paja)" opacity={0.6} />
      {/* espadana */}
      <path d="M -60 -230 L -60 -380 Q 10 -420 80 -380 L 80 -230 Z" fill={tinte(C.cal)} />
      <path d="M -40 -300 V -340 Q -20 -362 0 -340 V -300 Z M 20 -300 V -340 Q 40 -362 60 -340 V -300 Z" fill={tinte("#3A3530")} />
      <g transform={`rotate(${cam} -20 -340)`}>
        <path d="M -30 -332 Q -20 -350 -10 -332 L -6 -312 L -34 -312 Z" fill={tinte(C.oro)} />
      </g>
      <path d="M 10 -400 V -440 M -4 -426 H 24" stroke={tinte(C.madera)} strokeWidth={6} />
      <path d="M 90 0 V -120 Q 140 -170 190 -120 V 0 Z" fill={tinte(C.madera)} />
      <path d="M 90 -120 Q 140 -170 190 -120" stroke={tinte(C.piedraSombra)} strokeWidth={10} fill="none" />
      {/* cruz del atrio */}
      <rect x={430} y={-40} width={70} height={40} fill={tinte(C.piedra)} />
      <rect x={458} y={-200} width={14} height={160} fill={tinte(C.piedraOscura)} />
      <rect x={426} y={-168} width={78} height={14} fill={tinte(C.piedraOscura)} />
    </g>
  );
};

/** Queñua, el arbol de la puna, retorcido. */
const Quenua: React.FC<{ x: number; y: number; s: number; tinte: (c: string) => string }> = ({ x, y, s, tinte }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -8 0 Q -14 -60 -2 -110 Q 10 -150 -6 -190 L 6 -190 Q 22 -150 12 -110 Q 4 -60 10 0 Z" fill={tinte("#7A4A34")} />
    {[[-40, -200, 60], [30, -220, 64], [-6, -250, 56], [50, -170, 44], [-60, -160, 40]].map(([cx, cy, r], i) => (
      <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.7} fill={tinte(i % 2 ? "#5A6A48" : "#4A5A3E")} />
    ))}
  </g>
);

const DibujoDespedida: React.FC<PropsDecorado> = ({ e }) => {
  const hora = e.hora ?? "dia";
  const sem = e.semilla ?? 5;
  const gente = e.gente ?? 0.8;
  const lago = e.variante === "lago";
  const tinte = (c: string) => (hora === "noche" ? mezcla(c, "#1A2030", 0.55) : hora === "tarde" ? mezcla(c, "#E0A060", 0.18) : c);
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={2200} id="pueblo" nubes={4} />
      <Cordillera y={560} ancho={2200} semilla={11} color={tinte("#B7B2A8")} alto={260} />
      {lago ? (
        <g>
          <rect x={-100} y={540} width={2400} height={90} fill={tinte(C.agua)} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={rr(i, 3) * 2000} y={556 + rr(i, 4) * 60} width={60 + rr(i, 5) * 120} height={3} fill={tinte(C.aguaLuz)} />
          ))}
          <path d="M 1500 600 q 40 -14 90 0 q -45 10 -90 0 Z" fill={tinte(C.paja)} />
        </g>
      ) : null}
      <path d="M -100 640 Q 500 560 1100 610 Q 1700 650 2300 590 L 2300 1080 L -100 1080 Z" fill={tinte(C.punaLuz)} />
      <path d="M -100 700 Q 700 660 1300 700 Q 1800 730 2300 690 L 2300 1080 L -100 1080 Z" fill={tinte(C.puna)} />
      {/* el pueblo */}
      <CasaPaja x={60} y={720} s={0.62} semilla={sem} humo tinte={tinte} />
      <Capilla x={560} y={700} s={0.6} tinte={tinte} />
      <CasaPaja x={1260} y={712} s={0.56} semilla={sem + 1} tinte={tinte} />
      <CasaPaja x={1500} y={726} s={0.66} semilla={sem + 2} humo tinte={tinte} />
      <CasaPaja x={1820} y={716} s={0.6} semilla={sem + 3} tinte={tinte} />
      <Quenua x={1160} y={730} s={0.8} tinte={tinte} />
      <Pirca x={-40} y={780} w={700} tinte={tinte} />
      <Pirca x={1380} y={790} w={900} tinte={tinte} />
      {/* el camino que sale del pueblo */}
      <path d="M 900 1080 Q 1100 900 1500 840 Q 1900 790 2300 780 L 2300 820 Q 1900 830 1540 880 Q 1200 940 1080 1080 Z" fill={tinte(C.tierraLuz)} />
      {/* los que ya se van, por el camino */}
      {gente > 0.2
        ? [0, 1, 2, 3].map((i) => (
            <g key={i}>
              <Perfil traje={i % 2 ? "andina" : "andino"} semilla={sem + 30 + i} x0={1540 + i * 150} y={860 - i * 18} v={0.7} s={0.42 - i * 0.03} espalda={i % 2 ? "bulto" : "costal"} pose={i % 2 ? "anda" : "carga"} />
              <Llama x0={1610 + i * 150} y={856 - i * 18} v={0.7} s={0.36 - i * 0.03} semilla={sem + i} />
            </g>
          ))
        : null}
      {/* la familia que se despide */}
      <Llama x0={1240} y={1000} s={0.8} semilla={sem + 7} dir={-1} />
      <Frente traje="andino" semilla={sem + 11} x={760} y={1020} s={1.05} pose="despide" espalda="costal" gesto="serio" mirada={1} />
      <Frente traje="andina" semilla={sem + 12} x={980} y={1030} s={1} pose="quieto" espalda="nino" gesto="inquieto" mirada={-1} />
      <Frente traje="andina" semilla={sem + 13} edad="mayor" x={1130} y={1010} s={0.92} pose="frio" gesto="serio" mirada={-1} />
      <Frente traje="andino" semilla={sem + 14} edad="nino" x={880} y={1050} s={1} pose="quieto" mirada={-1} />
      {/* el curaca con su vara y la lista */}
      {gente > 0.4 ? (
        <g>
          <Frente traje="andino" semilla={sem + 15} edad="mayor" x={320} y={990} s={0.95} pose="habla" objeto="papel" gorro="ala" color={"#3A2E28"} color2={"#6A2A26"} gesto="serio" />
          <rect x={254} y={600} width={9} height={392} fill={tinte(C.madera)} />
          <rect x={250} y={594} width={17} height={24} fill={tinte(C.plata)} />
          <Frente traje="andino" semilla={sem + 16} x={120} y={970} s={0.86} pose="brazos" espalda="costal" gesto="serio" />
          <Frente traje="andino" semilla={sem + 17} x={470} y={960} s={0.82} pose="quieto" espalda="costal" />
        </g>
      ) : null}
      {Array.from({ length: 16 }).map((_, i) => (
        <Ichu key={i} x={rr(i, 41) * 2200} y={1040 + rr(i, 42) * 40} s={1 + rr(i, 43)} c={tinte(i % 2 ? C.punaSombra : "#B09A60")} />
      ))}
    </g>
  );
};

export const DESPEDIDA: Decorado = {
  desc: "Un pueblo andino de las provincias de mita: casas de adobe con techo de paja, capilla con espadana, pircas y queñuas. En primer termino una familia se despide: el mitayo con el costal a la espalda levanta la mano, su mujer lleva al nino en la lliclla, la abuela y un nino; a la izquierda el curaca con su vara lee la lista y otros hombres esperan con su carga; al fondo, familias y llamas ya se van por el camino.",
  ancho: 2200,
  admite: "variante 'lago' (el Titicaca al fondo, para Chucuito), hora, gente, semilla",
  tomas: {
    general: { de: { x: 1000, y: 540, z: 1 }, a: { x: 1200, y: 540, z: 1.05 }, desc: "el pueblo y la familia" },
    familia: { de: { x: 1030, y: 750, z: 1.9 }, a: { x: 1010, y: 740, z: 2 }, desc: "la familia que se despide" },
    cara: { de: { x: 790, y: 600, z: 3.4 }, a: { x: 800, y: 590, z: 3.8 }, desc: "primer plano del mitayo con el costal" },
    madre: { de: { x: 1110, y: 600, z: 3.2 }, a: { x: 1100, y: 600, z: 3.5 }, desc: "la madre con el nino a la espalda" },
    salida: { de: { x: 1700, y: 760, z: 2 }, a: { x: 1720, y: 740, z: 2.1 }, desc: "las familias y las llamas que ya se van" },
    curaca: { de: { x: 440, y: 720, z: 2.35 }, a: { x: 440, y: 700, z: 2.5 }, desc: "el curaca con la vara y la lista" },
  },
  dibujo: DibujoDespedida,
};

/* ------------------------------------------------------------------ */
/* pot/camino                                                           */
/* ------------------------------------------------------------------ */

const DibujoCamino: React.FC<PropsDecorado> = ({ e }) => {
  const f = useCurrentFrame();
  const hora = e.hora ?? "dia";
  const sem = e.semilla ?? 9;
  const gente = e.gente ?? 0.8;
  const plata = e.variante === "plata";
  const lago = !plata && e.variante !== "puna";
  const noche = hora === "noche";
  const W = 2880;
  const tinte = (c: string) => (noche ? mezcla(c, "#1A2030", 0.6) : hora === "tarde" ? mezcla(c, "#E0A060", 0.2) : c);
  const v = 1.1;
  const caminantes = Math.round(6 + gente * 12);
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={W} id="camino" nubes={6} />
      <Cordillera y={600} ancho={W} semilla={plata ? 21 : 13} color={tinte(plata ? "#C9B48E" : "#B7B2A8")} alto={plata ? 200 : 300} nieve={!plata} />
      {lago ? (
        <g>
          <path d="M -100 600 L 3000 600 L 3000 690 Q 1500 670 -100 700 Z" fill={tinte(C.agua)} />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={((rr(i, 3) * W + f * 0.3) % (W + 200)) - 100} y={612 + rr(i, 4) * 60} width={60 + rr(i, 5) * 160} height={3} fill={tinte(C.aguaLuz)} />
          ))}
          <path d="M 2100 640 q 50 -16 110 0 q -55 12 -110 0 Z" fill={tinte(C.paja)} />
          <path d="M 2150 640 v -30 l 20 10 Z" fill={tinte(C.paja)} />
        </g>
      ) : null}
      {plata ? (
        <g>
          {/* el desierto baja hacia el mar de Arica */}
          <rect x={-100} y={590} width={W + 200} height={60} fill={tinte(C.mar)} />
          <rect x={-100} y={590} width={W + 200} height={8} fill={tinte(C.marLuz)} />
          <path d="M -100 650 Q 800 610 1500 640 Q 2200 670 3000 620 L 3000 1080 L -100 1080 Z" fill={tinte("#D2B48A")} />
          <path d="M 2300 620 Q 2380 520 2460 540 L 2520 620 Z" fill={tinte("#B89A70")} />
        </g>
      ) : null}
      <path d={`M -100 ${plata ? 700 : 690} Q 900 650 1700 690 Q 2300 720 3000 680 L 3000 1080 L -100 1080 Z`} fill={tinte(plata ? "#C9A57A" : C.punaLuz)} />
      <path d="M -100 900 Q 1200 860 3000 900 L 3000 1080 L -100 1080 Z" fill={tinte(plata ? "#B8946A" : C.puna)} />
      {/* el camino */}
      <path d="M -100 820 Q 1400 780 3000 820 L 3000 880 Q 1400 840 -100 880 Z" fill={tinte(plata ? "#DCC4A0" : C.tierraLuz)} />
      {/* apacheta: monton de piedras de los caminantes */}
      <g transform="translate(2380 830)">
        {[[-40, 0, 30], [0, 0, 34], [36, 0, 26], [-20, -30, 26], [18, -30, 24], [0, -56, 20], [0, -76, 12]].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill={tinte(i % 2 ? C.piedraSombra : C.piedra)} />
        ))}
      </g>
      {/* la marcha */}
      {Array.from({ length: caminantes }).map((_, i) => {
        const x = -200 + i * (W / caminantes) + rr(i, sem) * 60;
        const y = 850 + (i % 3) * 8;
        if (plata) {
          return i % 3 === 2 ? (
            <Perfil key={i} traje={i % 6 === 2 ? "espanol" : "andino"} semilla={sem + i} x0={x} y={y + 6} v={v} s={0.48} />
          ) : (
            <Mula key={i} x0={x} y={y} v={v} s={0.5} semilla={sem + i} carga={i % 4 ? "plata" : "fardos"} />
          );
        }
        const k = i % 4;
        return k === 0 ? (
          <Perfil key={i} traje="andino" semilla={sem + i} x0={x} y={y} v={v} s={0.5} pose="carga" espalda="costal" />
        ) : k === 1 ? (
          <Perfil key={i} traje="andina" semilla={sem + i} x0={x} y={y} v={v} s={0.48} espalda={i % 8 === 1 ? "nino" : "bulto"} />
        ) : k === 2 ? (
          <Llama key={i} x0={x} y={y} v={v} s={0.5} semilla={sem + i} />
        ) : (
          <g key={i}>
            <Llama x0={x} y={y} v={v} s={0.46} semilla={sem + i + 50} />
            <Perfil traje="andino" semilla={sem + i + 60} x0={x - 70} y={y + 4} v={v} s={0.32} edad="nino" />
          </g>
        );
      })}
      {/* primer termino: un alto en el camino, con fuego */}
      <g>
        <Humo x={1700} y={1000} s={1.2} n={6} semilla={sem} color={noche ? "#4A4A56" : "#D8D2C8"} />
        <g transform="translate(1700 1010)">
          <circle r={noche ? 140 : 60} fill={C.vela} opacity={noche ? 0.18 : 0.1} />
          {[-30, -10, 10, 30].map((x, i) => (
            <rect key={i} x={x - 4} y={-6} width={50} height={10} rx={4} fill={tinte(C.madera)} transform={`rotate(${i * 40 - 60} ${x} 0)`} />
          ))}
          <path d={`M -20 0 Q -10 ${-50 - Math.sin(f * 0.5) * 8} 0 -30 Q 10 ${-60 - Math.sin(f * 0.7) * 8} 20 0 Z`} fill={"#F2A23C"} />
          <path d={`M -8 0 Q 0 ${-30 - Math.sin(f * 0.6) * 6} 8 0 Z`} fill={"#FFE08A"} />
        </g>
        {plata ? (
          <g>
            <Frente traje="espanol" semilla={sem + 90} x={1460} y={1060} s={0.95} pose="habla" />
            <Frente traje="andino" semilla={sem + 91} x={1940} y={1066} s={0.98} pose="frio" />
          </g>
        ) : (
          <g>
            <Frente traje="andino" semilla={sem + 90} x={1470} y={1064} s={0.98} pose="frio" gesto="serio" espalda="costal" />
            <Frente traje="andina" semilla={sem + 91} x={1940} y={1070} s={0.94} pose="quieto" espalda="nino" gesto="serio" mirada={-1} />
            <Frente traje="andina" semilla={sem + 92} edad="nino" x={2100} y={1074} s={1} pose="frio" mirada={-1} />
          </g>
        )}
      </g>
      {Array.from({ length: 24 }).map((_, i) => (
        <Ichu key={i} x={rr(i, 51) * W} y={940 + rr(i, 52) * 130} s={1 + rr(i, 53) * 0.8} c={tinte(plata ? "#A88A60" : i % 2 ? C.punaSombra : "#B09A60")} />
      ))}
      {noche ? <rect x={-100} y={-100} width={W + 200} height={1280} fill={"#0A1020"} opacity={0.15} /> : null}
    </g>
  );
};

export const CAMINO: Decorado = {
  desc: "El camino por el altiplano: una larga fila de mitayos con costales, mujeres con bultos y ninos, y llamas cargadas, con el lago Titicaca y la cordillera nevada al fondo y una apacheta junto al camino; en primer termino, una familia descansa junto a un fuego. Variante 'plata': la recua de mulas cargadas de barras baja por el desierto hacia el mar de Arica.",
  ancho: 2880,
  admite: "variante ('plata': recua de mulas con barras hacia Arica; 'puna': sin lago), hora (de noche, el fuego), gente, semilla",
  tomas: {
    general: { de: { x: 1000, y: 540, z: 1 }, a: { x: 1500, y: 540, z: 1.04 }, desc: "la marcha entera, paneando" },
    fila: { de: { x: 900, y: 760, z: 2 }, a: { x: 1200, y: 760, z: 2 }, desc: "la fila de cerca, acompanando a los caminantes" },
    llamas: { de: { x: 700, y: 780, z: 2.6 }, a: { x: 980, y: 780, z: 2.6 }, desc: "llamas (o mulas) cargadas" },
    fuego: { de: { x: 1700, y: 790, z: 1.9 }, a: { x: 1720, y: 800, z: 2.1 }, desc: "la familia junto al fuego" },
    lejos: { de: { x: 1900, y: 540, z: 1.25 }, a: { x: 2000, y: 540, z: 1.3 }, desc: "el lago (o el mar) y la cordillera" },
  },
  dibujo: DibujoCamino,
};
