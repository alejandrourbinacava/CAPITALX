import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../../theme";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, osc, rr } from "./comun";
import { Barra } from "./moneda";

/**
 * Insertos de objeto a pantalla completa, para los datos: el real de a ocho,
 * la barra de plata con sus marcas, el mapa antiguo de las rutas de la plata,
 * el libro de cuentas y el documento manuscrito (o impreso, o con el escudo).
 */

const sat = (t: number) => Math.max(0, Math.min(1, t));

/** Mesa de madera oscura con veta, fondo comun de los insertos. */
const MesaFondo: React.FC<{ ancho?: number; tono?: string }> = ({ ancho = 1920, tono = "#4A3426" }) => (
  <g>
    <rect x={-100} y={-100} width={ancho + 200} height={1300} fill={tono} />
    {Array.from({ length: 26 }).map((_, i) => (
      <path key={i} d={`M -100 ${i * 46 + rr(i, 2) * 20} Q ${ancho * 0.3} ${i * 46 + rr(i, 3) * 30} ${ancho * 0.6} ${i * 46 + rr(i, 4) * 20} T ${ancho + 100} ${i * 46}`} stroke={osc(tono, 0.82)} strokeWidth={2 + rr(i, 5) * 3} fill="none" opacity={0.6} />
    ))}
    <rect x={-100} y={-100} width={ancho + 200} height={1300} fill={"url(#pot-vineta)"} />
    <defs>
      <radialGradient id="pot-vineta" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.45" />
      </radialGradient>
    </defs>
  </g>
);

/** Parte un texto en lineas de unos n caracteres. */
const partir = (t: string, n: number) => {
  const pal = t.split(/\s+/);
  const lin: string[] = [];
  let cur = "";
  for (const p of pal) {
    if ((cur + " " + p).trim().length > n && cur) {
      lin.push(cur);
      cur = p;
    } else cur = (cur + " " + p).trim();
  }
  if (cur) lin.push(cur);
  return lin;
};

/* ------------------------------------------------------------------ */
/* pot/moneda8                                                          */
/* ------------------------------------------------------------------ */

const Castillo: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
    <rect x={-30} y={-20} width={60} height={44} />
    <rect x={-34} y={-42} width={16} height={24} />
    <rect x={-8} y={-50} width={16} height={32} />
    <rect x={18} y={-42} width={16} height={24} />
    <path d="M -8 24 V 6 Q 0 -4 8 6 V 24 Z" fill={osc(c, 0.6)} />
  </g>
);

const Leon: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M -30 30 L -24 0 Q -30 -20 -18 -34 Q -6 -46 8 -38 Q 18 -30 14 -18 L 24 -22 L 20 -8 L 30 0 L 22 6 L 28 30 L 16 30 L 12 12 L -6 14 L -12 30 Z"
    fill={c}
  />
);

const DibujoMoneda8: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const v = e.variante ?? "macuquina";
  const ceca = e.textos?.ceca ?? "P";
  const ens = e.textos?.ensayador ?? "";
  const val = e.textos?.valor ?? "8";
  const ano = e.textos?.ano ?? "";
  const leyenda = e.textos?.leyenda ?? (v === "columnario" ? "VTRAQUE · VNUM" : "HISPANIARVM · ET · INDIARVM · REX");
  const cx = 960;
  const cy = 540;
  const R = 360;
  const entra = sat(f / 20);
  const brillo = ((f * 6) % 1400) - 400;
  const plata = v === "rochuna" ? "#B9B4A6" : "#D3D6D6";
  const plataS = v === "rochuna" ? "#8E8878" : "#9EA4A6";
  // borde irregular de la macuquina
  const pts = Array.from({ length: 22 }).map((_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const r = v === "columnario" ? R : R * (0.86 + rr(i + (e.semilla ?? 3), 4) * 0.16);
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  });
  const sello = v === "contramarca" ? sat((f - dur * 0.45) / 6) : 0;
  return (
    <g>
      <MesaFondo tono={"#2F3A34"} />
      {/* monedas de fondo */}
      {[[260, 220, 120], [1680, 860, 150], [1660, 200, 90], [240, 880, 100]].map(([x, y, r], i) => (
        <g key={i} opacity={0.75}>
          <ellipse cx={x} cy={y + 10} rx={r} ry={r * 0.96} fill="#000" opacity={0.3} />
          <circle cx={x} cy={y} r={r} fill={plataS} />
          <circle cx={x} cy={y} r={r * 0.82} fill="none" stroke={osc(plataS, 0.8)} strokeWidth={4} />
          <path d={`M ${x - r * 0.3} ${y} H ${x + r * 0.3} M ${x} ${y - r * 0.3} V ${y + r * 0.3}`} stroke={osc(plataS, 0.7)} strokeWidth={8} />
        </g>
      ))}
      <g transform={`translate(${cx} ${cy}) scale(${0.92 + entra * 0.08}) rotate(${(1 - entra) * -8 + Math.sin(f * 0.02) * 1.2}) translate(${-cx} ${-cy})`} opacity={entra}>
        <polygon points={pts.join(" ")} fill="#000" opacity={0.35} transform="translate(14 22)" />
        <polygon points={pts.join(" ")} fill={plata} />
        <defs>
          <clipPath id={`pot-m8-${v}`}>
            <polygon points={pts.join(" ")} />
          </clipPath>
        </defs>
        <g clipPath={`url(#pot-m8-${v})`}>
          <circle cx={cx} cy={cy} r={R * 0.9} fill="none" stroke={plataS} strokeWidth={6} strokeDasharray="4 10" />
          <path id="pot-m8-arco" d={`M ${cx - R * 0.78} ${cy} A ${R * 0.78} ${R * 0.78} 0 1 1 ${cx + R * 0.78} ${cy}`} fill="none" />
          <text fontFamily={FONT.serif} fontSize={46} fill={osc(plataS, 0.8)} letterSpacing={6}>
            <textPath href="#pot-m8-arco" startOffset="50%" textAnchor="middle">
              {leyenda}
            </textPath>
          </text>
          {v === "columnario" ? (
            <g>
              {/* dos hemisferios entre las columnas, sobre el mar */}
              <circle cx={cx - 70} cy={cy - 10} r={70} fill="none" stroke={plataS} strokeWidth={8} />
              <circle cx={cx + 70} cy={cy - 10} r={70} fill="none" stroke={plataS} strokeWidth={8} />
              <path d={`M ${cx - 140} ${cy - 10} H ${cx} M ${cx} ${cy - 10} H ${cx + 140}`} stroke={plataS} strokeWidth={4} />
              {[-200, 200].map((dx) => (
                <g key={dx}>
                  <rect x={cx + dx - 18} y={cy - 170} width={36} height={300} fill={plataS} />
                  <rect x={cx + dx - 30} y={cy - 190} width={60} height={24} fill={plataS} />
                  <rect x={cx + dx - 30} y={cy + 126} width={60} height={20} fill={plataS} />
                  <path d={`M ${cx + dx - 34} ${cy - 210} L ${cx + dx - 20} ${cy - 236} L ${cx + dx} ${cy - 216} L ${cx + dx + 20} ${cy - 236} L ${cx + dx + 34} ${cy - 210} Z`} fill={plataS} />
                </g>
              ))}
              <path d={`M ${cx - 250} ${cy - 60} Q ${cx - 200} ${cy - 90} ${cx - 150} ${cy - 60}`} stroke={plataS} strokeWidth={14} fill="none" />
              <text x={cx - 200} y={cy - 74} textAnchor="middle" fontFamily={FONT.serif} fontSize={20} fill={plata}>
                PLVS
              </text>
              <path d={`M ${cx + 150} ${cy - 60} Q ${cx + 200} ${cy - 90} ${cx + 250} ${cy - 60}`} stroke={plataS} strokeWidth={14} fill="none" />
              <text x={cx + 200} y={cy - 74} textAnchor="middle" fontFamily={FONT.serif} fontSize={20} fill={plata}>
                VLTRA
              </text>
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M ${cx - 220} ${cy + 170 + i * 18} q 30 -12 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`} stroke={plataS} strokeWidth={4} fill="none" />
              ))}
              {ano ? (
                <text x={cx} y={cy + 250} textAnchor="middle" fontFamily={FONT.serif} fontSize={56} fill={osc(plataS, 0.75)}>
                  {ano}
                </text>
              ) : null}
            </g>
          ) : (
            <g>
              {/* cruz potenzada con castillos y leones en los cuarteles */}
              <path d={`M ${cx - 26} ${cy - 250} H ${cx + 26} V ${cy - 26} H ${cx + 250} V ${cy + 26} H ${cx + 26} V ${cy + 250} H ${cx - 26} V ${cy + 26} H ${cx - 250} V ${cy - 26} H ${cx - 26} Z`} fill={plataS} />
              {[[0, -250], [0, 250], [-250, 0], [250, 0]].map(([dx, dy], i) => (
                <rect key={i} x={cx + dx - (dx ? 14 : 50)} y={cy + dy - (dy ? 14 : 50)} width={dx ? 28 : 100} height={dy ? 28 : 100} fill={plataS} />
              ))}
              <Castillo x={cx - 110} y={cy - 110} s={1.15} c={plataS} />
              <Castillo x={cx + 110} y={cy + 110} s={1.15} c={plataS} />
              <Leon x={cx + 110} y={cy - 110} s={1.3} c={plataS} />
              <Leon x={cx - 110} y={cy + 110} s={1.3} c={plataS} />
            </g>
          )}
          {/* ceca, valor y ensayador */}
          {v !== "columnario" ? (
            <g fontFamily={FONT.serif} fill={osc(plataS, 0.6)} fontWeight={700}>
              <text x={cx - 210} y={cy + 230} fontSize={80} textAnchor="middle">
                {ceca}
              </text>
              <text x={cx + 210} y={cy + 230} fontSize={80} textAnchor="middle">
                {val}
              </text>
              {ens ? (
                <text x={cx + 195} y={cy - 140} fontSize={56} textAnchor="middle">
                  {ens}
                </text>
              ) : null}
              {ano ? (
                <text x={cx - 195} y={cy - 140} fontSize={46} textAnchor="middle">
                  {ano}
                </text>
              ) : null}
            </g>
          ) : null}
          {/* desgaste y brillo */}
          {Array.from({ length: 30 }).map((_, i) => (
            <path key={i} d={`M ${cx - R + rr(i, 7) * 2 * R} ${cy - R + rr(i, 8) * 2 * R} l ${10 + rr(i, 9) * 30} ${rr(i, 10) * 10}`} stroke={plataS} strokeWidth={2} opacity={0.5} />
          ))}
          <rect x={brillo + cx - R} y={cy - R - 100} width={120} height={2 * R + 200} fill="#FFFFFF" opacity={0.25} transform={`rotate(20 ${cx} ${cy})`} />
        </g>
        {/* contramarca: una corona sobre una letra, estampada a media escena */}
        {v === "contramarca" && sello > 0 ? (
          <g transform={`translate(${cx + 40} ${cy - 30}) scale(${2.2 - sello * 1.2})`} opacity={sello}>
            <circle r={78} fill={osc(plata, 0.88)} stroke={plataS} strokeWidth={6} />
            <path d="M -44 -6 L -36 -40 L -16 -20 L 0 -46 L 16 -20 L 36 -40 L 44 -6 Z" fill={plataS} />
            <text y={56} textAnchor="middle" fontFamily={FONT.serif} fontWeight={700} fontSize={56} fill={osc(plataS, 0.6)}>
              {e.textos?.marca ?? "F"}
            </text>
          </g>
        ) : null}
      </g>
    </g>
  );
};

export const MONEDA8: Decorado = {
  desc: "Inserto: un real de a ocho de plata sobre la mesa, enorme, con brillo que lo recorre. 'macuquina' (por defecto): borde irregular, cruz con castillos y leones, la P de Potosi y el 8. 'columnario': moneda redonda de Carlos III con las dos columnas, los dos mundos y PLVS VLTRA. 'contramarca': a media escena se estampa una contramarca (corona sobre una letra). 'rochuna': plata mas pobre y apagada.",
  admite: "variante ('macuquina' | 'columnario' | 'contramarca' | 'rochuna'), textos.ceca (P), textos.valor (8), textos.ensayador (letra), textos.ano, textos.leyenda, textos.marca (letra de la contramarca), semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 540, z: 1.08 }, desc: "la moneda entera" },
    detalle: { de: { x: 820, y: 680, z: 2 }, a: { x: 780, y: 700, z: 2.3 }, desc: "la P y la cruz de cerca" },
    marca: { de: { x: 1000, y: 520, z: 1.7 }, a: { x: 1000, y: 510, z: 2 }, desc: "el centro (la contramarca)" },
  },
  dibujo: DibujoMoneda8,
};

/* ------------------------------------------------------------------ */
/* pot/lingote                                                          */
/* ------------------------------------------------------------------ */

const DibujoLingote: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const marcas = [e.textos?.marca1 ?? "", e.textos?.marca2 ?? "", e.textos?.marca3 ?? ""];
  const golpe = sat((f - dur * 0.5) / 5);
  const martillo = interpolate(f, [dur * 0.3, dur * 0.48, dur * 0.5, dur * 0.7], [-260, -60, 0, -260], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brillo = ((f * 7) % 2000) - 400;
  return (
    <g>
      <MesaFondo />
      <g transform="translate(960 640)">
        <ellipse cx={0} cy={90} rx={470} ry={40} fill="#000" opacity={0.35} />
        <path d="M -420 60 L -360 -90 L 360 -90 L 420 60 Z" fill={"#D9DCDB"} />
        <path d="M -420 60 L 420 60 L 404 120 L -404 120 Z" fill={"#9EA4A6"} />
        <path d="M 360 -90 L 420 60 L 404 120 L 352 -40 Z" fill={"#8A9092"} opacity={0.6} />
        {Array.from({ length: 40 }).map((_, i) => (
          <ellipse key={i} cx={-380 + rr(i, 3) * 760} cy={-80 + rr(i, 4) * 130} rx={3 + rr(i, 5) * 6} ry={2 + rr(i, 6) * 3} fill={"#B9BEBF"} opacity={0.8} />
        ))}
        {/* marcas grabadas: escudo, la P y la corona */}
        <g fill="none" stroke={"#8A9092"} strokeWidth={6}>
          <path d="M -300 -60 H -200 V 0 Q -200 30 -250 40 Q -300 30 -300 0 Z" />
          <rect x={160} y={-62} width={140} height={84} rx={8} />
        </g>
        <text x={-130} y={10} fontFamily={FONT.serif} fontWeight={700} fontSize={80} fill={"#8A9092"} textAnchor="middle">
          P
        </text>
        {marcas.map((m, i) =>
          m ? (
            <text key={i} x={[-250, 230, 60][i]} y={i === 2 ? -30 : 2} textAnchor="middle" fontFamily={FONT.serif} fontWeight={700} fontSize={i === 2 ? 40 : 46} fill={"#7A8082"}>
              {m}
            </text>
          ) : null
        )}
        <defs>
          <clipPath id="pot-lingote-clip">
            <path d="M -420 60 L -360 -90 L 360 -90 L 420 60 L 404 120 L -404 120 Z" />
          </clipPath>
        </defs>
        <rect x={brillo - 700} y={-200} width={90} height={400} fill="#FFFFFF" opacity={0.3} transform="rotate(25)" clipPath="url(#pot-lingote-clip)" />
        {/* el sello del quinto que se estampa: una corona */}
        {golpe > 0 ? (
          <g transform={`translate(-30 -40) scale(${3.4 - golpe * 1.4})`} opacity={golpe}>
            <path d="M -14 0 L -11 -12 L -5 -5 L 0 -15 L 5 -5 L 11 -12 L 14 0 Z" fill={"#7A8082"} />
            <rect x={-14} y={0} width={28} height={5} fill={"#7A8082"} />
          </g>
        ) : null}
      </g>
      {/* otras barras al fondo */}
      {[[260, 300], [1650, 280]].map(([bx, by], i) => (
        <g key={i} transform={`translate(${bx} ${by}) scale(1.6)`} opacity={0.8}>
          <Barra x={0} y={0} s={1} />
        </g>
      ))}
      {/* el punzon y el martillo */}
      <g transform={`translate(930 ${560 + martillo})`}>
        <rect x={-14} y={-200} width={28} height={200} fill={"#5A5A5E"} />
        <rect x={-120} y={-260 + Math.min(0, martillo * 0.2)} width={160} height={60} rx={8} fill={"#3A3A3E"} />
        <rect x={20} y={-246} width={260} height={24} fill={C.maderaMedia} />
      </g>
      {golpe > 0 && golpe < 1
        ? Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M 930 600 l ${Math.cos(i) * 60} ${-Math.abs(Math.sin(i)) * 60}`} stroke={C.ocre} strokeWidth={4} />)
        : null}
      {e.textos?.etiqueta ? (
        <g transform="translate(1440 860) rotate(-4)">
          <rect x={-200} y={-50} width={400} height={100} fill={"#EDE3C8"} />
          <text x={0} y={14} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={36} fill={C.tinta}>
            {e.textos.etiqueta}
          </text>
          <path d="M -200 0 L -260 -40" stroke={"#8A774F"} strokeWidth={3} />
        </g>
      ) : null}
    </g>
  );
};

export const LINGOTE: Decorado = {
  desc: "Inserto: una barra de plata enorme sobre la mesa, con sus marcas grabadas y un brillo que la recorre; a media escena un punzon y un martillo estampan la marca del quinto real (una corona) y saltan chispas.",
  admite: "textos.marca1/marca2/marca3 (letras grabadas sobre la barra, opcionales), textos.etiqueta (papel atado, opcional)",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1 }, a: { x: 960, y: 560, z: 1.06 }, desc: "la barra entera" },
    marca: { de: { x: 930, y: 520, z: 2.2 }, a: { x: 930, y: 520, z: 2.5 }, desc: "el punzon sobre la barra" },
  },
  dibujo: DibujoLingote,
};

/* ------------------------------------------------------------------ */
/* pot/mapa                                                             */
/* ------------------------------------------------------------------ */

const MW = 2880;
/** Proyeccion del mapa: longitudes de 95 E a 5 E dando la vuelta por el Pacifico. */
const P = (lon: number, lat: number): [number, number] => {
  const l = lon < 0 ? lon + 360 : lon < 90 ? lon + 360 : lon;
  return [(l - 95) * (MW / 270), (52 - lat) * 12];
};
const poli = (pts: [number, number][]) => "M " + pts.map(([lo, la]) => P(lo, la).join(" ")).join(" L ") + " Z";

const TIERRAS: [number, number][][] = [
  // Sudamerica
  [[-77.5, 8.5], [-75.5, 10.5], [-72, 11.8], [-68, 10.6], [-62, 10.6], [-57, 6], [-52, 5], [-50, 0], [-44, -2.5], [-35, -5.5], [-38.5, -13], [-40.5, -21.5], [-48, -26], [-53, -34], [-57.5, -38], [-62, -39], [-62, -45], [-74, -45], [-73.5, -37], [-71.5, -30], [-70.5, -23.5], [-70.3, -18.5], [-75.5, -15], [-77.2, -12], [-79.5, -7.5], [-81.2, -5], [-80, -1], [-80, 1], [-78.8, 2], [-77.5, 4], [-77.5, 7]],
  // Norteamerica y Centroamerica
  [[-77.5, 8.5], [-79.5, 9.6], [-81.8, 9], [-83.6, 10.8], [-83.5, 15], [-88, 15.8], [-88.3, 18.5], [-87.2, 21.5], [-90.4, 21.2], [-91, 18.6], [-94, 18.3], [-96, 19.2], [-97.6, 22], [-97.2, 26], [-94, 29.5], [-89, 30.2], [-84, 30], [-82.6, 27.5], [-80.6, 25.2], [-80, 27], [-81, 31], [-76, 35], [-74, 40], [-70, 42], [-66, 44.5], [-60, 46], [-55, 52], [-130, 52], [-124.5, 48], [-124, 40], [-120.5, 34.5], [-117, 32.5], [-114.7, 30], [-112.5, 29], [-110, 24], [-105.7, 22.5], [-105.3, 20], [-101.5, 17.8], [-99.9, 16.8], [-95, 15.8], [-92.2, 14.5], [-88, 13.2], [-86, 12], [-85.7, 11], [-83.5, 8.6], [-80, 7.3]],
  // Cuba, La Espanola, Jamaica, Puerto Rico
  [[-85, 21.9], [-82, 23.1], [-77, 21.6], [-74.2, 20.2], [-77.5, 19.9], [-81, 21.6]],
  [[-74.4, 19.8], [-68.5, 18.6], [-71.5, 17.8], [-74.4, 18.4]],
  [[-78.3, 18.4], [-76.2, 18], [-77.5, 17.8]],
  [[-67.2, 18.5], [-65.6, 18.3], [-67, 18]],
  // Europa y Africa
  [[5, 52], [2, 51], [-1.5, 49.6], [-4.7, 48.4], [-1.2, 46], [-1.6, 43.4], [-9, 43.2], [-8.8, 38.7], [-8.9, 37], [-6.3, 36.6], [-5.6, 36], [-2, 36.7], [0, 38.7], [0.6, 40.6], [3.2, 42], [5, 43.2], [5, 37], [-1, 35.3], [-6, 35.8], [-9.8, 31], [-13.2, 27.5], [-17, 21], [-17.5, 14.7], [-16.7, 12], [-13.2, 8.5], [-8, 4.4], [-2, 4.8], [5, 5], [5, -38], [5, -38]],
  // Asia
  [[95, 52], [140, 52], [135, 48], [132, 43], [129.5, 41], [129.4, 35.5], [126.5, 34.4], [126.2, 37.6], [124.6, 40], [121.5, 40.8], [121.6, 39], [118, 39.1], [117.7, 38.4], [119, 37.2], [122.5, 37.3], [120.5, 36], [119.4, 35], [120.8, 32], [121.9, 30.6], [121, 28], [119.6, 25.6], [117, 23.6], [113.5, 22.2], [110.4, 21], [108, 21.6], [106.5, 20], [105.7, 18.9], [107, 16.5], [109, 13], [109, 11.5], [107, 10.4], [105, 8.6], [104.8, 10.2], [103.3, 10.5], [102.5, 12], [100.9, 13.4], [99.2, 10.5], [99.5, 7.5], [100.4, 6], [101, 3], [103.4, 1.4], [104.2, 1.6], [103.5, 3.8], [103.2, 6], [102, 6.2], [101, 6.9], [100, 9], [98.5, 9], [98.3, 12], [97.6, 16.5], [95, 16]],
  // Japon, Taiwan, Luzon, Mindanao, Borneo, Sumatra, Java, Nueva Guinea, Australia
  [[130, 31.5], [131.5, 31.5], [132, 33.5], [135, 33.6], [136.8, 34.5], [139.8, 35], [140.8, 36], [141, 38.3], [142, 40], [141.4, 41.4], [140, 40.8], [139.8, 40], [139, 38], [136.8, 37], [136, 35.6], [133, 35.5], [131, 34.4], [129.8, 33.3]],
  [[140, 41.6], [141.5, 42.6], [145.5, 43.3], [143.5, 44.2], [141.7, 45.4], [140.2, 43.2]],
  [[120.1, 23], [121, 25.2], [121.9, 24.9], [120.8, 22]],
  [[120.5, 18.5], [122.2, 18.5], [122.5, 17], [121.6, 15.7], [122, 14], [124, 13.8], [124, 12.5], [122.5, 13.2], [121, 13.6], [120.6, 14.5], [120, 16], [120.4, 18.2]],
  [[123.5, 11.2], [124.1, 10.6], [124, 9.6], [123.3, 10.2]],
  [[122, 8], [126, 9.2], [126.5, 7], [125.5, 5.8], [124, 6.5], [122, 7]],
  [[109, 1.5], [111, 2.9], [116, 6.9], [119, 5], [118, 1], [117, -1], [116, -3.8], [111, -3], [110, -1.5]],
  [[95.3, 5.6], [98, 4], [104, -1.5], [106, -5.9], [102, -4], [99, -1], [95.5, 2.8]],
  [[105.5, -6.8], [114.5, -7.7], [114.3, -8.7], [106, -7.7]],
  [[131, -1], [141, -2.6], [150, -6], [147, -10.2], [143, -9], [141, -9.1], [138, -8], [134, -4]],
  [[130, -11.8], [137, -12], [136, -15.6], [141, -17], [142.4, -10.7], [146, -19], [153, -26.5], [153, -38], [114, -38], [115, -34], [113.5, -26], [114, -22], [122, -17.5], [125.5, -14.5], [129, -14.8]],
];

const CIUDADES: Record<string, [number, number]> = {
  Potosí: [-65.75, -19.6],
  Arica: [-70.3, -18.5],
  Callao: [-77.15, -12.05],
  Lima: [-77.03, -12.05],
  Huancavelica: [-75, -12.8],
  Chucuito: [-69.9, -15.9],
  Panamá: [-79.5, 9],
  "Nombre de Dios": [-79.47, 9.58],
  Portobelo: [-79.65, 9.55],
  Cartagena: [-75.5, 10.4],
  "La Habana": [-82.4, 23.1],
  Sanlúcar: [-6.35, 36.8],
  Sevilla: [-6, 37.4],
  Almadén: [-4.8, 38.8],
  Acapulco: [-99.9, 16.85],
  "Ciudad de México": [-99.1, 19.4],
  Manila: [121, 14.6],
  Cebú: [123.9, 10.3],
  Cantón: [113.3, 23.1],
  "Buenos Aires": [-58.4, -34.6],
  Antofagasta: [-70.4, -23.6],
  Japón: [138, 36],
  Corea: [127.5, 36.5],
  Pachuca: [-98.7, 20.1],
};

/** Rutas: listas de puntos [lon, lat] o nombres de ciudad; tierra = tramo por tierra (punteado). */
type Tramo = { pts: (string | [number, number])[]; tierra?: boolean };
const RUTAS: Record<string, Tramo[]> = {
  atlantico: [
    { pts: ["Potosí", "Arica"], tierra: true },
    { pts: ["Arica", [-73, -17.5], [-77.5, -13], "Callao"] },
    { pts: ["Callao", [-81.5, -6], [-81, -1], [-80, 5], "Panamá"] },
    { pts: ["Panamá", "Portobelo"], tierra: true },
    { pts: ["Portobelo", [-77, 10.6], "Cartagena"] },
    { pts: ["Cartagena", [-78, 14], [-83, 19], [-84.5, 21.5], "La Habana"] },
    { pts: ["La Habana", [-79.5, 25.5], [-70, 32], [-50, 37], [-30, 38.5], [-15, 37.5], "Sanlúcar", "Sevilla"] },
  ],
  pacifico: [
    { pts: ["Acapulco", [-115, 13.5], [-150, 13], [175, 13], [145, 13.4], [130, 13.6], "Manila"] },
    { pts: ["Manila", [119, 18], "Cantón"] },
  ],
  tornaviaje: [{ pts: ["Cebú", [128, 15], [137, 28], [150, 37], [175, 38.5], [-150, 38], [-128, 34], [-112, 24], "Acapulco"] }],
  andes: [
    { pts: ["Huancavelica", [-72, -15], "Potosí"], tierra: true },
    { pts: ["Chucuito", "Potosí"], tierra: true },
    { pts: ["Potosí", "Arica"], tierra: true },
  ],
  mercurio: [
    { pts: ["Almadén", "Sevilla"], tierra: true },
    { pts: ["Sevilla", [-15, 36], [-35, 30], [-60, 18], "Cartagena", "Portobelo"] },
    { pts: ["Huancavelica", [-72, -15], "Potosí"], tierra: true },
  ],
  hoy: [
    { pts: ["Potosí", "Antofagasta"], tierra: true },
    { pts: ["Antofagasta", [-90, -25], [-140, -15], [170, 5], [140, 20], "Corea"] },
    { pts: [[170, 5], [135, 30], "Japón"] },
    { pts: [[140, 20], "Cantón"] },
  ],
};

const DibujoMapa: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const v = e.variante ?? "atlantico";
  const rutas = v === "mundo" ? [...RUTAS.atlantico, ...RUTAS.pacifico] : RUTAS[v] ?? RUTAS.atlantico;
  const progreso = interpolate(f, [dur * 0.08, dur * 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nombres = new Set<string>();
  rutas.forEach((r) => r.pts.forEach((p) => typeof p === "string" && nombres.add(p)));
  const total = rutas.length;
  const titulo = e.textos?.titulo ?? "";
  const tinta = "#4A3A2A";
  const pt = (p: string | [number, number]) => (typeof p === "string" ? P(...CIUDADES[p]) : P(p[0], p[1]));
  return (
    <g>
      <defs>
        <radialGradient id="pot-pergamino" cx="0.5" cy="0.5" r="0.8">
          <stop offset="0" stopColor="#EFE3C4" />
          <stop offset="0.8" stopColor="#E0CDA0" />
          <stop offset="1" stopColor="#C9AE78" />
        </radialGradient>
      </defs>
      <rect x={-100} y={-100} width={MW + 200} height={1300} fill="url(#pot-pergamino)" />
      {/* mar con rayado de grabado */}
      {Array.from({ length: 60 }).map((_, i) => (
        <path key={i} d={`M -100 ${i * 20} H ${MW + 100}`} stroke={"#C9B48A"} strokeWidth={1} opacity={0.5} />
      ))}
      {/* meridianos y paralelos */}
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d={`M ${i * 320} -100 V 1200`} stroke={"#B89A6A"} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.6} />
      ))}
      <path d={`M -100 ${P(0, 0)[1]} H ${MW + 100}`} stroke={"#A8784E"} strokeWidth={2.5} strokeDasharray="12 8" />
      {[23.4, -23.4].map((la) => (
        <path key={la} d={`M -100 ${P(0, la)[1]} H ${MW + 100}`} stroke={"#B89A6A"} strokeWidth={1.5} strokeDasharray="4 8" />
      ))}
      {/* tierras */}
      {TIERRAS.map((t, i) => (
        <g key={i}>
          <path d={poli(t)} fill={"#D9C49A"} stroke={tinta} strokeWidth={3} strokeLinejoin="round" />
          <path d={poli(t)} fill="none" stroke={"#B89A6A"} strokeWidth={10} opacity={0.35} transform="translate(0 0)" />
        </g>
      ))}
      {/* los Andes, como montes de grabado */}
      {Array.from({ length: 18 }).map((_, i) => {
        const la = 6 - i * 2.4;
        const lo = -76.5 + Math.max(0, -la - 5) * 0.25 - (la < -10 ? -3 + (la + 10) * -0.1 : 0);
        const [x, y] = P(lo + 1.5, la);
        return <path key={i} d={`M ${x - 12} ${y + 8} L ${x} ${y - 12} L ${x + 12} ${y + 8}`} fill={"#C9AE78"} stroke={tinta} strokeWidth={2} />;
      })}
      {/* rotulos de mares */}
      <g fontFamily={FONT.serif} fontStyle="italic" fill={tinta} opacity={0.75}>
        <text x={P(-140, 0)[0]} y={P(-140, 0)[1] + 60} fontSize={46} letterSpacing={10} textAnchor="middle">
          MAR DEL SUR
        </text>
        <text x={P(-40, 25)[0]} y={P(-40, 25)[1]} fontSize={42} letterSpacing={8} textAnchor="middle">
          MAR DEL NORTE
        </text>
      </g>
      {/* rosa de los vientos */}
      <g transform={`translate(${P(-120, -25)[0]} ${P(-120, -25)[1]}) rotate(${f * 0.05})`}>
        <circle r={90} fill="none" stroke={tinta} strokeWidth={2} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
          <path key={a} d={`M 0 ${i % 2 ? -60 : -110} L 12 0 L 0 ${i % 2 ? 60 : 110} L -12 0 Z`} fill={i % 2 ? "#C9AE78" : C.carmin} opacity={0.8} transform={`rotate(${a})`} />
        ))}
      </g>
      {/* rutas */}
      {rutas.map((r, i) => {
        const tp = sat(progreso * total - i);
        if (tp <= 0) return null;
        const ps = r.pts.map(pt);
        let largo = 0;
        for (let k = 1; k < ps.length; k++) largo += Math.hypot(ps[k][0] - ps[k - 1][0], ps[k][1] - ps[k - 1][1]);
        // el tramo ya recorrido
        const objetivo = largo * tp;
        const parte: [number, number][] = [ps[0]];
        let acum = 0;
        for (let k = 1; k < ps.length; k++) {
          const seg = Math.hypot(ps[k][0] - ps[k - 1][0], ps[k][1] - ps[k - 1][1]);
          if (acum + seg >= objetivo) {
            const q = (objetivo - acum) / Math.max(1, seg);
            parte.push([ps[k - 1][0] + (ps[k][0] - ps[k - 1][0]) * q, ps[k - 1][1] + (ps[k][1] - ps[k - 1][1]) * q]);
            break;
          }
          acum += seg;
          parte.push(ps[k]);
        }
        const d = "M " + parte.map((p) => p.join(" ")).join(" L ");
        const punta = parte[parte.length - 1];
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={"#FFF6DC"} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" opacity={0.7} />
            <path d={d} fill="none" stroke={C.carmin} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={r.tierra ? "3 14" : undefined} />
            {tp < 1 ? <circle cx={punta[0]} cy={punta[1]} r={10} fill={C.carmin} /> : null}
          </g>
        );
      })}
      {/* ciudades */}
      {[...nombres].map((n, i) => {
        const [x, y] = P(...CIUDADES[n]);
        const izq = ["Callao", "Arica", "Panamá", "Acapulco", "Huancavelica", "Antofagasta", "La Habana", "Portobelo", "Nombre de Dios"].includes(n);
        const arriba = ["Portobelo", "Nombre de Dios", "Sevilla", "Almadén"].includes(n);
        return (
          <g key={n}>
            <circle cx={x} cy={y} r={11} fill={n === "Potosí" ? C.carmin : tinta} stroke={"#F2E6C8"} strokeWidth={3} />
            <text
              x={x + (izq ? -18 : 18)}
              y={y + (arriba ? -18 : 10) + (n === "Sanlúcar" ? 34 : 0) + (n === "Panamá" ? 24 : 0)}
              textAnchor={izq ? "end" : "start"}
              fontFamily={FONT.serif}
              fontSize={n === "Potosí" ? 40 : 30}
              fontWeight={n === "Potosí" ? 700 : 400}
              fill={tinta}
              stroke={"#EFE3C4"}
              strokeWidth={6}
              paintOrder="stroke"
            >
              {n}
            </text>
          </g>
        );
      })}
      {/* un galeon diminuto que recorre la ultima ruta dibujada */}
      {titulo ? (
        <g>
          <path d={`M ${MW / 2 - 420} 70 H ${MW / 2 + 420} L ${MW / 2 + 380} 150 H ${MW / 2 - 380} Z`} fill={"#E6D2A6"} stroke={tinta} strokeWidth={3} />
          <text x={MW / 2} y={124} textAnchor="middle" fontFamily={FONT.serif} fontSize={44} fontStyle="italic" fill={tinta}>
            {titulo}
          </text>
        </g>
      ) : null}
    </g>
  );
};

export const MAPA: Decorado = {
  desc: "Inserto: mapa antiguo en pergamino, del Pacifico (China, Filipinas, Japon) a Espana pasando por toda America, con rosa de los vientos, MAR DEL SUR y MAR DEL NORTE. Las rutas de la plata se dibujan en carmin durante la escena (por tierra, punteadas) y las ciudades de la ruta aparecen rotuladas.",
  ancho: MW,
  admite: "variante: 'atlantico' (Potosi-Arica-Callao-Panama-Portobelo-Cartagena-La Habana-Sanlucar-Sevilla), 'pacifico' (Acapulco-Manila-Canton), 'mundo' (las dos), 'tornaviaje' (Cebu-Acapulco por el norte), 'andes' (Huancavelica y Chucuito a Potosi, Potosi-Arica), 'mercurio' (Almaden-Sevilla-America y Huancavelica-Potosi), 'hoy' (Potosi-Antofagasta-Asia: Corea, Japon, Canton); textos.titulo (cartela arriba, opcional)",
  tomas: {
    general: { de: { x: 1700, y: 540, z: 1 }, a: { x: 1900, y: 540, z: 1 }, desc: "America y el Atlantico" },
    pacifico: { de: { x: 960, y: 540, z: 1 }, a: { x: 1160, y: 540, z: 1 }, desc: "el Pacifico, de Asia a America" },
    andes: { de: { x: 2040, y: 800, z: 2.2 }, a: { x: 2060, y: 810, z: 2.5 }, desc: "el virreinato del Peru y Potosi de cerca" },
    caribe: { de: { x: 1960, y: 460, z: 1.9 }, a: { x: 1990, y: 450, z: 2.1 }, desc: "Panama, Cartagena y La Habana" },
    europa: { de: { x: 2290, y: 330, z: 1.7 }, a: { x: 2320, y: 330, z: 1.75 }, desc: "el Atlantico hasta Sevilla" },
    asia: { de: { x: 600, y: 460, z: 1.6 }, a: { x: 620, y: 470, z: 1.75 }, desc: "Manila, China y Japon" },
  },
  dibujo: DibujoMapa,
};

/* ------------------------------------------------------------------ */
/* pot/libro                                                            */
/* ------------------------------------------------------------------ */

const DibujoLibro: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const titulo = e.textos?.titulo ?? "";
  const lineas = ["l1", "l2", "l3", "l4", "l5", "l6"].map((k) => e.textos?.[k]).filter(Boolean) as string[];
  const total = e.textos?.total ?? "";
  const n = lineas.length + (total ? 1 : 0);
  const prog = interpolate(f, [dur * 0.06, dur * 0.8], [0, n], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tinta = "#2E2418";
  const filaY = (i: number) => 360 + i * 84;
  const actual = Math.min(n - 1, Math.floor(prog));
  const plumaX = 1060 + ((prog % 1) * 640);
  return (
    <g>
      <MesaFondo />
      {/* libro abierto */}
      <path d="M 180 160 Q 560 120 950 170 L 950 980 Q 560 930 180 970 Z" fill={"#EFE6CE"} />
      <path d="M 970 170 Q 1360 120 1740 160 L 1740 970 Q 1360 930 970 980 Z" fill={"#F2EAD4"} />
      <path d="M 950 170 Q 960 160 970 170 L 970 980 Q 960 990 950 980 Z" fill={"#C9B48A"} />
      <path d="M 170 980 Q 560 940 960 994 Q 1360 940 1750 980 L 1750 1000 Q 1360 960 960 1014 Q 560 960 170 1000 Z" fill={"#8A6A44"} />
      {/* pautas */}
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={i}>
          <path d={`M 230 ${filaY(i) + 18} Q 560 ${filaY(i) + 6} 920 ${filaY(i) + 22}`} stroke={"#C9B48A"} strokeWidth={2} fill="none" />
          <path d={`M 1000 ${filaY(i) + 22} Q 1360 ${filaY(i) + 6} 1700 ${filaY(i) + 18}`} stroke={"#C9B48A"} strokeWidth={2} fill="none" />
        </g>
      ))}
      <path d="M 1500 300 V 940" stroke={"#C8402C"} strokeWidth={2} opacity={0.6} />
      {/* pagina izquierda: el titulo y unas lineas ya escritas, ilegibles */}
      <text x={565} y={270} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={titulo.length > 28 ? 40 : 52} fill={tinta}>
        {titulo}
      </text>
      <path d="M 300 300 H 830" stroke={tinta} strokeWidth={2} />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M 250 ${filaY(i) + 12} q 20 -10 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 ${i % 2 ? "t 40 0 t 40 0 t 40 0" : ""}`} stroke={tinta} strokeWidth={2} fill="none" opacity={0.35} />
      ))}
      {/* pagina derecha: los asientos que se escriben */}
      {lineas.map((l, i) => {
        const [concepto, cifra] = l.split("|").map((s) => s.trim());
        const vis = sat(prog - i);
        const nC = Math.round((concepto ?? "").length * vis);
        return (
          <g key={i}>
            <text x={1020} y={filaY(i) + 10} fontFamily={FONT.serif} fontStyle="italic" fontSize={34} fill={tinta}>
              {(concepto ?? "").slice(0, nC)}
            </text>
            {cifra && vis > 0.95 ? (
              <text x={1690} y={filaY(i) + 10} textAnchor="end" fontFamily={FONT.serif} fontSize={36} fill={tinta}>
                {cifra}
              </text>
            ) : null}
          </g>
        );
      })}
      {total ? (
        <g opacity={sat(prog - lineas.length)}>
          <path d={`M 1300 ${filaY(lineas.length) - 30} H 1700`} stroke={tinta} strokeWidth={3} />
          <text x={1690} y={filaY(lineas.length) + 14} textAnchor="end" fontFamily={FONT.serif} fontWeight={700} fontSize={42} fill={C.carmin}>
            {total}
          </text>
        </g>
      ) : null}
      {/* la pluma que escribe */}
      {prog < n ? (
        <g transform={`translate(${plumaX} ${filaY(actual) + 6 + Math.sin(f * 0.9) * 3}) rotate(-35)`}>
          <path d="M 0 0 L 8 -20 L 30 -220 Q 60 -260 46 -180 L 12 -16 Z" fill={"#F2EDE2"} />
          <path d="M 8 -20 L 40 -200" stroke={"#C9C2B0"} strokeWidth={2} />
          <path d="M 0 0 L 4 -10 L 10 -8 Z" fill={tinta} />
        </g>
      ) : null}
      {/* tintero */}
      <g transform="translate(1780 900)">
        <rect x={-50} y={-70} width={100} height={70} rx={10} fill={"#2A2A2C"} />
        <rect x={-30} y={-90} width={60} height={24} rx={6} fill={"#3A3A3E"} />
      </g>
    </g>
  );
};

export const LIBRO: Decorado = {
  desc: "Inserto: un libro de cuentas abierto sobre la mesa. En la pagina izquierda el titulo y lineas ya escritas; en la derecha, una pluma escribe los asientos uno a uno (concepto a la izquierda, cantidad a la derecha) y al final, si se pide, el total en carmin.",
  admite: "textos.titulo, textos.l1..l6 (cada uno 'concepto | cantidad'; la cantidad es opcional), textos.total (opcional)",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1 }, a: { x: 960, y: 560, z: 1.05 }, desc: "el libro abierto" },
    asientos: { de: { x: 1340, y: 560, z: 1.7 }, a: { x: 1360, y: 580, z: 1.85 }, desc: "la pagina de los asientos" },
    titulo: { de: { x: 600, y: 420, z: 1.8 }, a: { x: 600, y: 440, z: 2 }, desc: "el titulo del libro" },
  },
  dibujo: DibujoLibro,
};

/* ------------------------------------------------------------------ */
/* pot/documento                                                        */
/* ------------------------------------------------------------------ */

const EscudoPotosi: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* corona imperial */}
    <path d="M -90 -250 L -70 -320 L -36 -280 L 0 -340 L 36 -280 L 70 -320 L 90 -250 Z" fill={C.oro} />
    <rect x={-92} y={-256} width={184} height={20} fill={"#B08A2A"} />
    {/* columnas del Plus Ultra */}
    {[-200, 200].map((dx) => (
      <g key={dx}>
        <rect x={dx - 20} y={-160} width={40} height={340} fill={"#C9C4B4"} />
        <rect x={dx - 32} y={-180} width={64} height={24} fill={"#B0AA98"} />
        <rect x={dx - 32} y={176} width={64} height={22} fill={"#B0AA98"} />
        <path d={`M ${dx - 50} ${-40} Q ${dx} ${-70} ${dx + 50} ${-40} L ${dx + 50} ${-10} Q ${dx} ${-40} ${dx - 50} ${-10} Z`} fill={C.carmin} />
      </g>
    ))}
    <text x={-200} y={-28} textAnchor="middle" fontFamily={FONT.serif} fontSize={22} fill={"#F2EAD4"}>
      PLVS
    </text>
    <text x={200} y={-28} textAnchor="middle" fontFamily={FONT.serif} fontSize={22} fill={"#F2EAD4"}>
      VLTRA
    </text>
    {/* el escudo con el cerro */}
    <path d="M -140 -220 H 140 V 60 Q 140 180 0 220 Q -140 180 -140 60 Z" fill={"#E8DCC0"} stroke={C.oro} strokeWidth={10} />
    <path d="M -120 160 Q -60 40 -10 -150 Q 0 -170 12 -150 Q 60 40 120 160 Z" fill={C.cerroLuz} />
    <path d="M 0 -160 Q 40 0 120 160 L 40 160 Q 20 0 0 -160 Z" fill={C.cerroSombra} />
    {[[-30, 0], [30, 40], [-50, 90], [10, -70]].map(([bx, by], i) => (
      <path key={i} d={`M ${bx - 8} ${by + 8} V ${by} Q ${bx} ${by - 8} ${bx + 8} ${by} V ${by + 8} Z`} fill={"#3A2A20"} />
    ))}
  </g>
);

const DibujoDocumento: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const v = e.variante ?? "manuscrito";
  const impreso = v === "impreso";
  const escudo = v === "escudo";
  const enc = e.textos?.encabezado ?? "";
  const cuerpo = e.textos?.cuerpo ?? "";
  const firma = e.textos?.firma ?? "";
  const fecha = e.textos?.fecha ?? "";
  const lineas = partir(cuerpo, impreso ? 40 : escudo ? 42 : 36);
  const prog = interpolate(f, [dur * 0.06, dur * 0.7], [0, lineas.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tinta = impreso ? "#1E1A16" : "#3A2A1A";
  const papel = impreso ? "#EFE8D4" : "#EADCB8";
  const fs = impreso ? 46 : 50;
  const y0 = escudo ? 690 : enc ? 360 : 260;
  const sello = sat((f - dur * 0.72) / 8);
  return (
    <g>
      <MesaFondo />
      <g transform={`rotate(${-1.5 + Math.sin(f * 0.01) * 0.3} 960 540)`}>
        <rect x={400} y={50} width={1120} height={1080} fill="#000" opacity={0.3} transform="translate(16 18)" />
        <path d="M 400 50 L 1520 50 L 1520 1130 L 400 1130 Z" fill={papel} />
        {/* manchas y bordes gastados */}
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx={420 + rr(i, 2) * 1080} cy={70 + rr(i, 3) * 1000} r={20 + rr(i, 4) * 60} fill={"#C9B48A"} opacity={0.15} />
        ))}
        <rect x={400} y={50} width={1120} height={1080} fill="none" stroke={"#C9B48A"} strokeWidth={10} opacity={0.5} />
        {impreso ? <rect x={470} y={120} width={980} height={940} fill="none" stroke={tinta} strokeWidth={2} /> : null}
        {escudo ? <EscudoPotosi x={960} y={360} s={0.75} /> : null}
        {enc ? (
          partir(enc, impreso ? 30 : 34).map((l, i) => (
            <text key={i} x={960} y={(escudo ? 610 : 190) + i * 58} textAnchor="middle" fontFamily={FONT.serif} fontSize={impreso ? 48 : 52} fontStyle={impreso ? undefined : "italic"} fontWeight={impreso ? 700 : 400} fill={tinta} letterSpacing={impreso ? 3 : 0}>
              {l}
            </text>
          ))
        ) : null}
        {lineas.map((l, i) => {
          const vis = sat(prog - i);
          const nC = impreso ? (vis > 0 ? l.length : 0) : Math.round(l.length * vis);
          return (
            <text key={i} x={impreso ? 960 : 480} y={y0 + (enc && !escudo ? Math.max(0, partir(enc, impreso ? 30 : 34).length - 1) * 58 : 0) + i * (fs + 18)} textAnchor={impreso ? "middle" : "start"} fontFamily={FONT.serif} fontStyle={impreso ? undefined : "italic"} fontSize={fs} fill={tinta} opacity={impreso ? vis : 1}>
              {l.slice(0, nC)}
            </text>
          );
        })}
        {fecha ? (
          <text x={1440} y={960} textAnchor="end" fontFamily={FONT.serif} fontStyle="italic" fontSize={40} fill={tinta} opacity={sat(prog - lineas.length + 0.5)}>
            {fecha}
          </text>
        ) : null}
        {firma ? (
          <g opacity={sat(prog - lineas.length + 0.3)}>
            <text x={1300} y={1040} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={44} fill={tinta}>
              {firma}
            </text>
            <path d="M 1100 1060 q 60 30 120 0 t 120 0 t 120 -10" stroke={tinta} strokeWidth={3} fill="none" />
          </g>
        ) : null}
        {/* sello de lacre */}
        {!impreso && sello > 0 ? (
          <g transform={`translate(620 1010) scale(${1.6 - sello * 0.6})`} opacity={sello}>
            <path d="M -60 0 Q -64 -40 -30 -58 Q 0 -70 34 -56 Q 66 -36 60 0 Q 62 40 30 56 Q 0 68 -34 56 Q -62 36 -60 0 Z" fill={"#9A2A22"} />
            <circle r={36} fill={"#B2392A"} />
            <path d="M -18 -8 L -12 -22 L -4 -12 L 0 -26 L 4 -12 L 12 -22 L 18 -8 Z M -18 -6 H 18 V 2 H -18 Z" fill={"#7A1E18"} />
          </g>
        ) : null}
      </g>
    </g>
  );
};

export const DOCUMENTO: Decorado = {
  desc: "Inserto: una hoja sobre la mesa. 'manuscrito' (por defecto): papel antiguo, el texto se escribe linea a linea en cursiva y al final cae un sello de lacre. 'impreso': pagina de libro impreso con recuadro, titulo en versalitas y lineas que aparecen. 'escudo': el escudo de Potosi (el cerro, la corona y las columnas del Plus Ultra) con el lema debajo.",
  admite: "variante ('manuscrito' | 'impreso' | 'escudo'), textos.encabezado, textos.cuerpo (se parte en lineas solo), textos.firma, textos.fecha",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1.02 }, a: { x: 960, y: 540, z: 1.1 }, desc: "la hoja entera" },
    texto: { de: { x: 900, y: 460, z: 1.6 }, a: { x: 960, y: 520, z: 1.75 }, desc: "el texto de cerca, siguiendo la lectura" },
    arriba: { de: { x: 960, y: 360, z: 1.5 }, a: { x: 960, y: 380, z: 1.65 }, desc: "el encabezado (o el escudo)" },
  },
  dibujo: DibujoDocumento,
};
