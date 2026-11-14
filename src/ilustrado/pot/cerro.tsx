import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloAndes, Cordillera, Humo, Llama, TexturasPot, mezcla, osc, rr } from "./comun";
import { Frente, Perfil } from "./Gente";

/**
 * El Cerro Rico: el cono rojizo de 4.782 metros con sus bocaminas, sus
 * desmontes y los caminos en zigzag, la Villa Imperial a sus pies y, de noche,
 * las guayras encendidas en las laderas. Y el mismo cerro hoy, horadado.
 */

/** Silueta del cerro: cumbre en (cx, cy), base de x0 a x1 en yb. */
const perfilCerro = (cx: number, cy: number, x0: number, x1: number, yb: number) =>
  `M ${x0} ${yb} L ${x0 + 120} ${yb - 60} Q ${cx - 380} ${cy + 330} ${cx - 170} ${cy + 130} L ${cx - 90} ${cy + 46} Q ${cx - 40} ${cy - 6} ${cx} ${cy} Q ${cx + 44} ${cy + 2} ${cx + 84} ${cy + 52} L ${cx + 170} ${cy + 140} Q ${cx + 400} ${cy + 340} ${x1 - 120} ${yb - 60} L ${x1} ${yb} Z`;

/** Punto de la ladera a una altura dada (aprox.): para colocar bocaminas. */
const ladera = (cx: number, cy: number, yb: number, lado: -1 | 1, t: number, ancho: number) => {
  const y = cy + 40 + t * (yb - cy - 100);
  const x = cx + lado * (40 + t * ancho);
  return { x, y };
};

const Bocamina: React.FC<{ x: number; y: number; s?: number; hoy?: boolean; desmonte?: string }> = ({ x, y, s = 1, hoy, desmonte }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -10 0 L 70 ${hoy ? 70 : 54} L -60 ${hoy ? 74 : 56} Z`} fill={desmonte ?? (hoy ? "#9C9488" : "#C49A74")} opacity={0.95} />
    <path d="M -16 0 L -16 -18 Q 0 -32 16 -18 L 16 0 Z" fill={"#1E1612"} />
    <path d="M -20 0 L -20 -20 Q 0 -38 20 -20 L 20 0" fill="none" stroke={hoy ? "#6A5A48" : C.madera} strokeWidth={4} />
  </g>
);

/** Guayra: horno de barro con agujeros, encendido de noche. */
const Guayra: React.FC<{ x: number; y: number; s?: number; noche: boolean; semilla: number }> = ({ x, y, s = 1, noche, semilla }) => {
  const f = useCurrentFrame();
  const fl = 0.7 + 0.3 * Math.sin(f * 0.4 + semilla * 1.7) * Math.sin(f * 0.13 + semilla);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {noche ? <circle cx={0} cy={-14} r={15} fill={"#FF9A3C"} opacity={0.3 * fl} /> : null}
      <path d="M -10 0 L -6 -26 Q 0 -30 6 -26 L 10 0 Z" fill={noche ? "#5A3A2A" : "#8A6A50"} />
      {[-16, -8].map((yy) => (
        <circle key={yy} cx={0} cy={yy} r={2} fill={noche ? "#FFC266" : "#3A2A20"} opacity={noche ? fl : 1} />
      ))}
      {noche ? <path d={`M -4 -28 Q 0 ${-40 - fl * 8} 4 -28 Z`} fill={"#FFB04A"} /> : null}
    </g>
  );
};

/** Puntos de un camino en zigzag que no se sale de la ladera. */
const zig = (cx: number, cy: number, yb: number, lado: -1 | 1): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 7; i++) {
    const y = yb - 30 - i * ((yb - cy - 160) / 6);
    const half = (y - cy) * 0.9;
    pts.push([cx + lado * half * (i % 2 ? 0.25 : 0.7), y]);
  }
  return pts;
};

/** Pedregal: rayitas de canchal sobre la ladera. */
const Canchal: React.FC<{ cx: number; cy: number; yb: number; color: string }> = ({ cx, cy, yb, color }) => (
  <g stroke={color} strokeWidth={2} opacity={0.5}>
    {Array.from({ length: 160 }).map((_, i) => {
      const y = cy + 30 + rr(i, 31) * (yb - cy - 40);
      const half = (y - cy) * 0.85;
      const x = cx + (rr(i, 32) * 2 - 1) * half;
      return <path key={i} d={`M ${x} ${y} l ${6 + rr(i, 33) * 10} ${2 + rr(i, 34) * 3}`} />;
    })}
  </g>
);

/** Una casa de la villa: muro encalado o de adobe, tejado, puerta y ventana. */
const Casa: React.FC<{ x: number; y: number; w: number; h: number; s: number; semilla: number; noche: boolean; hoy?: boolean }> = ({ x, y, w, h, s, semilla, noche, hoy }) => {
  const muro = hoy
    ? ["#B8673E", "#C27A4E", "#D9CFC0", "#A85E3A", "#E0D2B8"][Math.floor(rr(semilla, 1) * 5)]
    : ["#EDE6D6", "#E2D6BE", "#D9B892", "#E8DFCC", "#C9A27E"][Math.floor(rr(semilla, 1) * 5)];
  const tejado = rr(semilla, 2) > 0.35 && !hoy;
  const W = w * s;
  const H = h * s;
  const luz = noche && rr(semilla, 3) > 0.45;
  return (
    <g>
      <rect x={x} y={y - H} width={W} height={H} fill={muro} />
      <rect x={x + W * 0.72} y={y - H} width={W * 0.28} height={H} fill={osc(muro, 0.88)} />
      {tejado ? (
        <path d={`M ${x - 4 * s} ${y - H} L ${x + W / 2} ${y - H - 22 * s} L ${x + W + 4 * s} ${y - H} Z`} fill={osc(C.teja, 0.95)} />
      ) : (
        <rect x={x - 2 * s} y={y - H - 5 * s} width={W + 4 * s} height={6 * s} fill={hoy ? "#8A8A86" : C.tejaSombra} />
      )}
      {hoy && rr(semilla, 6) > 0.6 ? <rect x={x + W * 0.1} y={y - H - 18 * s} width={W * 0.5} height={14 * s} fill={osc(muro, 0.9)} /> : null}
      <rect x={x + W * 0.2} y={y - H * 0.42} width={W * 0.16} height={H * 0.42} fill={hoy ? "#3A3530" : C.madera} />
      <rect x={x + W * 0.5} y={y - H * 0.78} width={W * 0.16} height={H * 0.22} fill={luz ? "#FFD27A" : "#4A403A"} />
      {h > 70 ? <rect x={x + W * 0.46} y={y - H * 0.54} width={W * 0.24} height={4 * s} fill={C.madera} /> : null}
    </g>
  );
};

const Iglesia: React.FC<{ x: number; y: number; s: number; noche: boolean; cupula?: boolean }> = ({ x, y, s, noche, cupula = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-110} width={150} height={110} fill={C.piedra} />
    <path d="M -64 -110 L 15 -150 L 94 -110 Z" fill={C.teja} />
    {cupula ? (
      <g>
        <rect x={40} y={-150} width={50} height={30} fill={C.piedraLuz} />
        <path d="M 40 -150 Q 65 -196 90 -150 Z" fill={C.teja} />
        <rect x={63} y={-204} width={4} height={14} fill={C.piedraOscura} />
      </g>
    ) : null}
    <rect x={-100} y={-200} width={46} height={200} fill={C.piedraLuz} />
    <rect x={-100} y={-200} width={14} height={200} fill={C.piedra} />
    {[-178, -140].map((yy) => (
      <path key={yy} d={`M -90 ${yy + 24} V ${yy + 6} Q -77 ${yy - 8} -64 ${yy + 6} V ${yy + 24} Z`} fill={noche ? "#3A3026" : "#4A403A"} />
    ))}
    <rect x={-106} y={-206} width={58} height={8} fill={C.piedraOscura} />
    <path d="M -100 -206 Q -77 -246 -54 -206 Z" fill={C.piedraSombra} />
    <path d="M -77 -246 V -262 M -84 -256 H -70" stroke={C.piedraOscura} strokeWidth={3} />
    <path d="M -2 0 V -60 Q 15 -78 32 -60 V 0 Z" fill={C.madera} />
    <circle cx={15} cy={-88} r={10} fill={noche ? "#E9B060" : "#5A4A40"} />
  </g>
);

const Ichu: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = C.punaSombra }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M -16 0 L -22 -26 L -10 -4 L -8 -34 L -2 -4 L 4 -36 L 6 -4 L 16 -28 L 14 0 Z"
    fill={c}
  />
);

/** Camino que sube en zigzag con caminantes diminutos que van y vienen. */
const Zigzag: React.FC<{ pts: [number, number][]; gente: number; semilla: number; noche: boolean }> = ({ pts, gente, semilla, noche }) => {
  const f = useCurrentFrame();
  const d = "M " + pts.map((p) => p.join(" ")).join(" L ");
  const segs = pts.slice(1).map((p, i) => ({ a: pts[i], b: p }));
  const n = Math.round(gente * 4);
  return (
    <g>
      <path d={d} fill="none" stroke={noche ? "#5A3A30" : "#D9A882"} strokeWidth={5} opacity={0.8} />
      {noche
        ? null
        : Array.from({ length: n }).map((_, i) => {
            const sg = segs[(i + semilla) % segs.length];
            const t = (rr(semilla + i, 4) + f * 0.0016) % 1;
            const px = sg.a[0] + (sg.b[0] - sg.a[0]) * t;
            const py = sg.a[1] + (sg.b[1] - sg.a[1]) * t;
            return (
              <Perfil
                key={i}
                traje="andino"
                semilla={semilla * 7 + i}
                x0={px}
                y={py}
                s={0.075}
                pose="carga"
                espalda="costal"
                dir={sg.b[0] > sg.a[0] ? 1 : -1}
              />
            );
          })}
    </g>
  );
};

/** La villa al pie del cerro: tejados, torres y humo. */
const Villa: React.FC<{ y0: number; x0: number; x1: number; noche: boolean; hoy?: boolean; semilla: number }> = ({ y0, x0, x1, noche, hoy, semilla }) => {
  const filas: React.ReactNode[] = [];
  for (let fila = 0; fila < 6; fila++) {
    const y = y0 + fila * 30;
    const s = 0.55 + fila * 0.12;
    let x = x0 - 40 + rr(fila, semilla) * 40;
    let k = 0;
    while (x < x1) {
      const w = 60 + rr(fila * 50 + k, semilla + 1) * 50;
      const h = 34 + rr(fila * 50 + k, semilla + 2) * (hoy ? 70 : 34);
      filas.push(<Casa key={`${fila}-${k}`} x={x} y={y} w={w} h={h} s={s} semilla={fila * 97 + k + semilla} noche={noche} hoy={hoy} />);
      x += w * s + 2;
      k++;
    }
    if (fila === 1 || fila === 3)
      [0.18, 0.47, 0.76].forEach((p, i) =>
        filas.push(<Iglesia key={`ig-${fila}-${i}`} x={x0 + (x1 - x0) * (p + fila * 0.03)} y={y - 2} s={0.45 + fila * 0.08} noche={noche} cupula={i !== 1} />)
      );
  }
  return <g>{filas}</g>;
};

/* ------------------------------------------------------------------ */
/* pot/cerro                                                            */
/* ------------------------------------------------------------------ */

const DibujoCerro: React.FC<PropsDecorado> = ({ e, f }) => {
  const hora = e.hora ?? "dia";
  const noche = hora === "noche";
  const sem = e.semilla ?? 1;
  const gente = e.gente ?? 0.6;
  const v1545 = e.variante === "1545";
  const guayras = noche || e.variante === "guayras";
  const W = 2400;
  const cx = 1200;
  const cy = 170;
  const yb = 790;
  const tinte = (c: string) => (noche ? mezcla(c, "#1A2030", 0.62) : hora === "tarde" ? mezcla(c, "#E09A5A", 0.18) : c);
  const bocas = [
    [-1, 0.18, 120], [1, 0.22, 140], [-1, 0.36, 260], [1, 0.4, 250], [-1, 0.55, 380], [1, 0.58, 400], [1, 0.75, 540], [-1, 0.72, 500], [-1, 0.86, 610], [1, 0.9, 640],
  ] as const;
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={W} id="cerro" nubes={5} />
      <Cordillera y={700} ancho={W} semilla={3} color={tinte("#B4ADA0")} alto={260} />
      <Cordillera y={760} ancho={W} semilla={7} color={tinte("#A39A86")} alto={150} nieve={false} />
      {/* Huaina Potosi, el cerro chico */}
      <path d={`M 1640 800 Q 1760 610 1830 600 Q 1900 610 2060 800 Z`} fill={tinte("#9E5A40")} />
      {/* el Cerro Rico */}
      <path d={perfilCerro(cx, cy, 480, 1920, yb)} fill={tinte(C.cerroLuz)} />
      <path d={`M ${cx} ${cy} Q ${cx + 30} ${cy + 2} ${cx + 64} ${cy + 40} L ${cx + 170} ${cy + 140} Q ${cx + 400} ${cy + 340} ${1800} ${yb - 60} L 1920 ${yb} L ${cx + 60} ${yb} Q ${cx + 160} 560 ${cx + 40} 400 Q ${cx - 20} 300 ${cx} ${cy} Z`} fill={tinte(C.cerroSombra)} />
      <Canchal cx={cx} cy={cy} yb={yb} color={tinte(C.cerroOscuro)} />
      {/* vetas y canchales */}
      {Array.from({ length: 14 }).map((_, i) => {
        const t = 0.1 + i * 0.065;
        const y = cy + 40 + t * (yb - cy);
        const half = 40 + t * 640;
        return (
          <path
            key={i}
            d={`M ${cx - half * (0.3 + rr(i, 3) * 0.5)} ${y} Q ${cx} ${y - 10 - rr(i, 4) * 30} ${cx + half * (0.2 + rr(i, 5) * 0.5)} ${y + 14}`}
            stroke={tinte(i % 3 === 0 ? "#D88A5C" : C.cerroOscuro)}
            strokeWidth={2 + rr(i, 6) * 4}
            fill="none"
            opacity={0.55}
          />
        );
      })}
      {/* cumbre: la huaca, un monticulo de piedras con ofrendas */}
      <g transform={`translate(${cx} ${cy + 2})`}>
        <path d="M -22 0 L -14 -16 L -4 -22 L 8 -18 L 18 -8 L 24 0 Z" fill={tinte("#8A7A6A")} />
        <path d="M -8 -22 L -4 -34 L 2 -22 Z" fill={tinte("#A89A88")} />
        {v1545 ? <path d="M 14 -18 l 4 -14 l 4 14 Z" fill={tinte(C.carmin)} /> : null}
      </g>
      {/* caminos, bocaminas y desmontes */}
      {v1545 ? null : (
        <g>
          <Zigzag pts={zig(cx, cy, yb, -1)} gente={gente} semilla={sem} noche={noche} />
          <Zigzag pts={zig(cx, cy, yb, 1)} gente={gente} semilla={sem + 3} noche={noche} />
          {bocas.map(([lado, t, an], i) => {
            const p = ladera(cx, cy, yb, lado, t, an);
            return <Bocamina key={i} x={p.x} y={p.y} s={0.5 + t * 0.6} desmonte={tinte("#C49A74")} />;
          })}
        </g>
      )}
      {/* guayras encendidas en las laderas */}
      {guayras && !v1545
        ? Array.from({ length: 70 }).map((_, i) => {
            const lado = i % 2 ? 1 : -1;
            const t = 0.2 + rr(i, 11) * 0.75;
            const p = ladera(cx, cy, yb, lado as 1 | -1, t, 120 + t * 560 * rr(i, 12));
            return <Guayra key={i} x={p.x} y={p.y + rr(i, 13) * 20} s={0.7 + t * 0.6} noche={noche} semilla={i} />;
          })
        : null}
      {guayras && !v1545
        ? [0, 1, 2, 3, 4, 5].map((i) => (
            <Humo key={i} x={cx - 420 + i * 170} y={420 + rr(i, 3) * 200} s={1.2} n={5} semilla={i} color={noche ? "#4A4A56" : "#D8D0C4"} />
          ))
        : null}
      {/* la Villa Imperial a los pies */}
      {v1545 ? null : (
        <g>
          <Villa y0={790} x0={360} x1={2100} noche={noche} semilla={sem} />
          {[0, 1, 2, 3].map((i) => (
            <Humo key={i} x={520 + i * 420} y={800} s={0.6} n={4} semilla={i + 9} color={noche ? "#3A3A46" : "#CFC9BE"} />
          ))}
        </g>
      )}
      {/* la puna en primer termino */}
      <path d={`M -100 1080 L -100 930 Q 600 880 1200 920 Q 1800 960 2500 900 L 2500 1080 Z`} fill={tinte(C.puna)} />
      <path d={`M -100 1080 L -100 990 Q 700 960 1300 1000 Q 1900 1030 2500 990 L 2500 1080 Z`} fill={tinte(C.punaSombra)} />
      <path d="M 200 1080 Q 600 990 1100 985 Q 1600 980 2300 1080" fill="none" stroke={tinte(C.tierraLuz)} strokeWidth={26} />
      {Array.from({ length: 40 }).map((_, i) => (
        <Ichu key={i} x={rr(i, 21) * W} y={940 + rr(i, 22) * 140} s={0.8 + rr(i, 23) * 0.9} c={tinte(i % 2 ? C.punaSombra : "#B09A60")} />
      ))}
      {/* recua de llamas en el camino */}
      {gente > 0.15 && !noche ? (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <Llama key={i} x0={420 + i * 120 + rr(sem + i, 2) * 30} y={1010 - i * 4} v={0.55} s={0.42} semilla={sem + i} carga={v1545 ? "ninguna" : "costales"} />
          ))}
          <Perfil traje={v1545 ? "andino" : "andino"} semilla={sem + 20} x0={360} y={1014} v={0.55} s={0.32} />
          {v1545 ? null : <Perfil traje="andina" semilla={sem + 21} x0={1000} y={1000} v={0.5} s={0.3} espalda="bulto" />}
        </g>
      ) : null}
      {noche ? <rect x={-100} y={-100} width={W + 200} height={1280} fill={"#0A1020"} opacity={0.12} /> : null}
    </g>
  );
};

export const CERRO: Decorado = {
  desc: "El Cerro Rico de Potosi, cono rojizo con bocaminas, desmontes y caminos en zigzag por los que suben indios cargados; la Villa Imperial a sus pies con torres de iglesias y humo; la puna delante con una recua de llamas. De noche, las guayras encendidas en las laderas.",
  ancho: 2400,
  admite: "hora (dia|tarde|noche: de noche arden las guayras), variante ('1545': el cerro sin explotar y sin ciudad, con la huaca en la cumbre; 'guayras': hornos de dia), gente (gente en los caminos), semilla",
  tomas: {
    general: { de: { x: 1100, y: 540, z: 1 }, a: { x: 1300, y: 540, z: 1.06 }, desc: "el cerro entero con la villa y la puna" },
    cumbre: { de: { x: 1200, y: 360, z: 2.1 }, a: { x: 1200, y: 320, z: 2.5 }, desc: "la cumbre y la huaca" },
    laderas: { de: { x: 950, y: 520, z: 2.3 }, a: { x: 1060, y: 500, z: 2.5 }, desc: "bocaminas, desmontes y cargadores en el zigzag" },
    villa: { de: { x: 1100, y: 770, z: 1.8 }, a: { x: 1320, y: 770, z: 1.9 }, desc: "los tejados y las torres de la villa al pie del cerro" },
    guayras: { de: { x: 1500, y: 560, z: 2 }, a: { x: 1440, y: 520, z: 2.3 }, desc: "la ladera derecha (de noche, las guayras)" },
    caravana: { de: { x: 640, y: 830, z: 2.2 }, a: { x: 820, y: 830, z: 2.2 }, desc: "la recua de llamas en la puna" },
  },
  dibujo: DibujoCerro,
};

/* ------------------------------------------------------------------ */
/* pot/hoy: el cerro y la ciudad en 2026                               */
/* ------------------------------------------------------------------ */

const Camion: React.FC<{ x0: number; y: number; v: number; s: number; color: string }> = ({ x0, y, v, s, color }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  return (
    <g transform={`translate(${x} ${y}) scale(${(v < 0 ? -1 : 1) * s} ${s})`}>
      <rect x={-60} y={-46} width={80} height={36} fill={color} />
      <path d="M -60 -46 L -50 -60 L 14 -60 L 20 -46 Z" fill={"#8A7A6A"} />
      <rect x={22} y={-50} width={34} height={40} rx={4} fill={osc(color, 0.8)} />
      <rect x={34} y={-46} width={18} height={14} fill={"#A9C2C2"} />
      {[-40, 0, 40].map((cx) => (
        <circle key={cx} cx={cx} cy={-8} r={9} fill={"#1E1E20"} />
      ))}
    </g>
  );
};

/** Vagoneta en los rieles, empujada por dos mineros. */
const Vagoneta: React.FC<{ x: number; y: number; s: number; f: number; sem: number }> = ({ x, y, s, f, sem }) => {
  const avance = (Math.sin(f * 0.02) + 1) * 30;
  return (
    <g transform={`translate(${x + avance} ${y}) scale(${s})`}>
      <path d="M -110 -150 L 110 -150 L 90 -40 L -90 -40 Z" fill={"#6A6E70"} />
      <path d="M -110 -150 L 110 -150 L 106 -134 L -106 -134 Z" fill={"#8A8E90"} />
      <path d="M -100 -170 Q -40 -200 0 -168 Q 50 -196 100 -168 L 104 -150 L -104 -150 Z" fill={"#8E7E6A"} />
      {[-60, 60].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={-26} r={22} fill={"#2A2A2C"} />
          <circle cx={cx} cy={-26} r={8} fill={"#6A6E70"} />
        </g>
      ))}
      <Perfil traje="minero" semilla={sem} x0={-190} y={0} s={1.05} pose="carga" dir={1} />
    </g>
  );
};

const DibujoHoy: React.FC<PropsDecorado> = ({ e, f }) => {
  const hora = e.hora ?? "dia";
  const noche = hora === "noche";
  const sem = e.semilla ?? 3;
  const gente = e.gente ?? 0.6;
  const W = 2400;
  const cx = 1200;
  const cy = 200;
  const yb = 760;
  const tinte = (c: string) => (noche ? mezcla(c, "#1A2030", 0.6) : hora === "tarde" ? mezcla(c, "#E09A5A", 0.16) : c);
  const desmontes = ["#B9A88A", "#9C9488", "#C9A86A", "#8E8478", "#B87A4E"];
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={W} id="hoy" nubes={4} />
      <Cordillera y={680} ancho={W} semilla={5} color={tinte("#B4ADA0")} alto={220} />
      <path d={perfilCerro(cx, cy, 500, 1900, yb)} fill={tinte("#A8603E")} />
      <path d={`M ${cx} ${cy} Q ${cx + 30} ${cy + 2} ${cx + 64} ${cy + 40} L ${cx + 170} ${cy + 140} Q ${cx + 400} ${cy + 340} 1780 ${yb - 60} L 1900 ${yb} L ${cx + 90} ${yb} Q ${cx + 40} 420 ${cx} ${cy} Z`} fill={tinte("#86472E")} />
      {/* desmontes de colores y caminos de tierra */}
      {Array.from({ length: 22 }).map((_, i) => {
        const lado = (i % 2 ? 1 : -1) as 1 | -1;
        const t = 0.15 + rr(i, 3) * 0.8;
        const p = ladera(cx, cy, yb, lado, t, 120 + t * 500 * rr(i, 4));
        return <Bocamina key={i} x={p.x} y={p.y} s={0.5 + t * 0.7} hoy desmonte={tinte(desmontes[i % desmontes.length])} />;
      })}
      <path d={`M 600 ${yb} L 900 ${yb - 120} L 760 ${yb - 200} L 1080 ${yb - 330} L 980 ${yb - 400} L 1160 ${yb - 500}`} fill="none" stroke={tinte("#C9B08C")} strokeWidth={8} />
      <path d={`M 1800 ${yb} L 1500 ${yb - 110} L 1640 ${yb - 210} L 1340 ${yb - 340} L 1420 ${yb - 420}`} fill="none" stroke={tinte("#C9B08C")} strokeWidth={8} />
      <Camion x0={760} y={yb - 196} v={0.3} s={0.4} color={tinte("#D9A43A")} />
      <Camion x0={1600} y={yb - 210} v={-0.25} s={0.4} color={tinte("#3E6A8A")} />
      {/* hundimientos en la parte alta */}
      {[[-40, 70, 34], [50, 100, 26], [-90, 140, 22], [90, 160, 30], [0, 130, 18]].map(([dx, dy, r], i) => (
        <g key={i}>
          <ellipse cx={cx + dx} cy={cy + dy} rx={r} ry={r * 0.45} fill={tinte("#3A2620")} />
          <path d={`M ${cx + dx - r} ${cy + dy} Q ${cx + dx} ${cy + dy - r * 0.7} ${cx + dx + r} ${cy + dy}`} fill="none" stroke={tinte("#C98A62")} strokeWidth={3} />
        </g>
      ))}
      {/* antena en la cumbre */}
      <path d={`M ${cx - 6} ${cy} L ${cx} ${cy - 60} L ${cx + 6} ${cy} M ${cx - 4} ${cy - 20} H ${cx + 4} M ${cx - 3} ${cy - 40} H ${cx + 3}`} stroke={tinte("#4A4A4E")} strokeWidth={3} fill="none" />
      {/* la ciudad de hoy */}
      <Villa y0={770} x0={300} x1={2140} noche={noche} hoy semilla={sem} />
      {[0, 1].map((i) => (
        <Iglesia key={i} x={700 + i * 900} y={860} s={0.9} noche={noche} />
      ))}
      {/* tendido electrico */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={200 + i * 520} y={720} width={6} height={200} fill={tinte("#5A5650")} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${203 + i * 520} 726 Q ${463 + i * 520} 770 ${723 + i * 520} 726`} stroke={tinte("#3A3A3A")} strokeWidth={2} fill="none" />
      ))}
      {/* primer termino: bocamina de una cooperativa */}
      <path d="M -100 1080 L -100 900 Q 500 860 1100 900 Q 1700 940 2500 880 L 2500 1080 Z" fill={tinte("#9C8A72")} />
      <path d="M -100 1080 L -100 960 Q 700 940 1300 980 L 2500 960 L 2500 1080 Z" fill={tinte("#857360")} />
      <g transform="translate(330 1000)">
        <path d="M -260 -380 L 300 -380 L 300 80 L -260 80 Z" fill={tinte("#7A5A44")} />
        <path d="M -200 0 L -200 -250 Q 0 -340 200 -250 L 200 0 Z" fill={"#141010"} />
        <rect x={-220} y={-270} width={30} height={270} fill={tinte(C.maderaMedia)} />
        <rect x={190} y={-270} width={30} height={270} fill={tinte(C.maderaMedia)} />
        <rect x={-240} y={-290} width={480} height={34} fill={tinte(C.madera)} />
        <text x={0} y={-264} textAnchor="middle" fontFamily="sans-serif" fontWeight={700} fontSize={22} fill={tinte("#E8DFC8")} letterSpacing={3}>
          {e.textos?.cartel ?? "COOPERATIVA MINERA"}
        </text>
        {/* rieles */}
        <path d="M -150 0 L -260 90 M 150 0 L 380 90" stroke={tinte("#4A4A4E")} strokeWidth={8} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-180 - i * 30} y={20 + i * 24} width={380 + i * 80} height={8} fill={tinte(C.madera)} />
        ))}
      </g>
      <Vagoneta x={720} y={1040} s={0.9} f={f} sem={sem + 1} />
      {gente > 0.3 ? (
        <g>
          <Frente traje="minero" semilla={sem + 4} x={1180} y={1060} s={1.05} pose="quieto" gesto="serio" />
          <Frente traje="minero" semilla={sem + 5} x={1400} y={1050} s={0.98} pose="habla" />
          <Frente traje="cholita" semilla={sem + 6} x={1660} y={1040} s={0.9} pose="quieto" />
          <Perfil traje="minero" semilla={sem + 7} x0={2100} y={1000} v={-0.9} s={0.7} />
        </g>
      ) : null}
    </g>
  );
};

export const HOY: Decorado = {
  desc: "Potosi en 2026: el Cerro Rico horadado, con hundimientos en la cumbre, desmontes de colores, caminos de tierra con camiones y una antena; la ciudad de ladrillo con torres coloniales; en primer termino la bocamina de una cooperativa con rieles, vagoneta y mineros con casco y lampara.",
  ancho: 2400,
  admite: "textos.cartel (rotulo de la bocamina), hora, gente, semilla",
  tomas: {
    general: { de: { x: 1180, y: 540, z: 1 }, a: { x: 1260, y: 540, z: 1.05 }, desc: "cerro, ciudad y bocamina" },
    cumbre: { de: { x: 1200, y: 360, z: 2.4 }, a: { x: 1200, y: 330, z: 2.8 }, desc: "los hundimientos de la parte alta" },
    ciudad: { de: { x: 1500, y: 760, z: 1.9 }, a: { x: 1300, y: 760, z: 2 }, desc: "la ciudad de ladrillo y las torres" },
    bocamina: { de: { x: 550, y: 760, z: 1.7 }, a: { x: 590, y: 770, z: 1.8 }, desc: "la bocamina, la vagoneta y los rieles" },
    mineros: { de: { x: 1360, y: 780, z: 1.9 }, a: { x: 1300, y: 760, z: 2.1 }, desc: "mineros de cooperativa con casco" },
    minero: { de: { x: 1180, y: 690, z: 3.2 }, a: { x: 1180, y: 670, z: 3.6 }, desc: "primer plano de un minero con casco y lampara" },
  },
  dibujo: DibujoHoy,
};
