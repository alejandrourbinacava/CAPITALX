import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * Piezas comunes del video de Potosi: paleta, cielo de los Andes, cordilleras,
 * humo, velas, llamas y mulas. Todo en ilustracion plana, sin contornos.
 */

export const C = {
  papel: "#F2ECDD",
  cielo1: "#C9D3D0",
  cielo2: "#EEE8D8",
  tarde1: "#E3B98A",
  tarde2: "#F3DDB4",
  noche1: "#151D2A",
  noche2: "#2F3646",
  nube: "#FAF6EC",
  cerro: "#B5583A",
  cerroLuz: "#C96D48",
  cerroSombra: "#8E4330",
  cerroOscuro: "#6E3326",
  monte: "#9A9384",
  monteLejos: "#B9B3A4",
  nieve: "#F4F1EA",
  puna: "#B9A878",
  punaLuz: "#CDBE8E",
  punaSombra: "#9C8C5E",
  tierra: "#B49A78",
  tierraLuz: "#C9B08C",
  tierraSombra: "#937A5A",
  adobe: "#C9A27E",
  adobeLuz: "#D9B892",
  adobeSombra: "#A9845F",
  cal: "#EDE6D6",
  calSombra: "#D4CBB6",
  piedra: "#CFC4AD",
  piedraLuz: "#E0D7C3",
  piedraSombra: "#ACA088",
  piedraOscura: "#857963",
  paja: "#C9AE6A",
  pajaSombra: "#A88D4E",
  teja: "#A5553B",
  tejaSombra: "#86432E",
  madera: "#5A3D2B",
  maderaMedia: "#6E4C35",
  maderaLuz: "#8A6544",
  plata: "#C9CCCD",
  plataLuz: "#EEF0EF",
  plataSombra: "#8E9496",
  oro: "#C9A23A",
  ocre: "#E8B33C",
  carmin: "#C8402C",
  verde: "#2E5A4E",
  tinta: "#14181A",
  agua: "#7F9FA3",
  aguaLuz: "#A9C2C2",
  aguaOscura: "#5E7E84",
  mar: "#6F8F96",
  marLuz: "#9DB6B6",
  azogue: "#B7BEC2",
  roca: "#5B4A40",
  rocaLuz: "#76604F",
  rocaOscura: "#3A2E28",
  vela: "#FFD27A",
};

/** Ruido determinista. */
export const rr = (i: number, k = 1) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export const osc = (hex: string, f = 0.82) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
};

export const sat = (t: number) => Math.max(0, Math.min(1, t));

/** Interpolacion lineal entre colores hex. */
export const mezcla = (a: string, b: string, t: number) => {
  const na = parseInt(a.slice(1), 16);
  const nb = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((na >> s) & 255) * (1 - t) + ((nb >> s) & 255) * t);
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
};

export type Hora = "dia" | "tarde" | "noche";

/** Texturas con prefijo propio para no chocar con otros videos. */
export const TexturasPot: React.FC = () => (
  <defs>
    <pattern id="pot-adobe" width="64" height="28" patternUnits="userSpaceOnUse">
      <rect width="64" height="28" fill={C.adobe} />
      <path d="M0 14 H64 M0 0 H64 M32 0 V14 M0 14 V28 M64 14 V28" stroke={C.adobeSombra} strokeWidth="1.6" opacity="0.6" />
    </pattern>
    <pattern id="pot-sillar" width="110" height="46" patternUnits="userSpaceOnUse">
      <rect width="110" height="46" fill={C.piedra} />
      <path d="M0 0 H110 M0 23 H110 M55 0 V23 M0 23 V46 M110 23 V46" stroke={C.piedraSombra} strokeWidth="1.6" />
    </pattern>
    <pattern id="pot-empedrado" width="44" height="22" patternUnits="userSpaceOnUse">
      <rect width="44" height="22" fill={C.piedraOscura} />
      <ellipse cx="11" cy="6" rx="9" ry="4.5" fill={C.piedraSombra} />
      <ellipse cx="33" cy="6" rx="9" ry="4.5" fill={C.piedra} opacity="0.8" />
      <ellipse cx="0" cy="17" rx="9" ry="4.5" fill={C.piedra} opacity="0.8" />
      <ellipse cx="22" cy="17" rx="9" ry="4.5" fill={C.piedraSombra} />
      <ellipse cx="44" cy="17" rx="9" ry="4.5" fill={C.piedra} opacity="0.8" />
    </pattern>
    <pattern id="pot-tablas" width="120" height="34" patternUnits="userSpaceOnUse">
      <rect width="120" height="34" fill={C.maderaMedia} />
      <path d="M0 17 H120 M0 0 H120 M70 0 V17 M20 17 V34" stroke={C.madera} strokeWidth="2" />
    </pattern>
    <pattern id="pot-roca" width="90" height="70" patternUnits="userSpaceOnUse">
      <rect width="90" height="70" fill={C.roca} />
      <path d="M0 20 L30 14 L52 26 L90 18 M10 70 L24 44 L60 50 L74 70 M52 26 L60 50" stroke={C.rocaOscura} strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M8 34 L22 30 M64 36 L80 32 M36 60 L46 56" stroke={C.rocaLuz} strokeWidth="2" opacity="0.6" />
    </pattern>
    <pattern id="pot-tejado" width="26" height="22" patternUnits="userSpaceOnUse">
      <rect width="26" height="22" fill={C.teja} />
      <path d="M0 0 Q 6.5 8 13 0 Q 19.5 8 26 0" fill="none" stroke={C.tejaSombra} strokeWidth="2" />
      <path d="M13 0 V22" stroke={C.tejaSombra} strokeWidth="1.4" opacity="0.6" />
    </pattern>
    <pattern id="pot-paja" width="18" height="16" patternUnits="userSpaceOnUse">
      <rect width="18" height="16" fill={C.paja} />
      <path d="M2 0 L4 16 M8 0 L9 16 M14 0 L13 16" stroke={C.pajaSombra} strokeWidth="1.4" />
    </pattern>
  </defs>
);

/** Cielo de altura: limpio y alto de dia, calido de tarde, estrellado de noche. */
export const CieloAndes: React.FC<{ hora?: Hora; ancho?: number; alto?: number; nubes?: number; id: string }> = ({
  hora = "dia",
  ancho = 1920,
  alto = 1080,
  nubes = 4,
  id,
}) => {
  const f = useCurrentFrame();
  const a = hora === "noche" ? C.noche1 : hora === "tarde" ? C.tarde1 : C.cielo1;
  const b = hora === "noche" ? C.noche2 : hora === "tarde" ? C.tarde2 : C.cielo2;
  return (
    <g>
      <defs>
        <linearGradient id={`pot-cielo-${id}-${hora}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect x={-200} y={-100} width={ancho + 400} height={alto + 200} fill={`url(#pot-cielo-${id}-${hora})`} />
      {hora === "noche"
        ? Array.from({ length: Math.round(ancho / 16) }).map((_, i) => (
            <circle
              key={i}
              cx={rr(i, 2) * ancho}
              cy={rr(i, 3) * alto * 0.55}
              r={0.8 + rr(i, 4) * 1.8}
              fill="#F4EEDC"
              opacity={0.35 + 0.5 * Math.abs(Math.sin(f * 0.05 + i))}
            />
          ))
        : Array.from({ length: nubes }).map((_, i) => {
            const x = ((rr(i, 2) * (ancho + 600) + f * (0.2 + rr(i, 3) * 0.3)) % (ancho + 700)) - 400;
            const y = 60 + rr(i, 4) * 200;
            const s = 0.6 + rr(i, 5) * 0.9;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={hora === "tarde" ? 0.7 : 0.85}>
                <rect x={0} y={22} width={260} height={30} rx={15} fill={hora === "tarde" ? "#F7E3C3" : C.nube} />
                <rect x={50} y={4} width={120} height={38} rx={19} fill={hora === "tarde" ? "#F7E3C3" : C.nube} />
                <rect x={130} y={12} width={90} height={30} rx={15} fill={hora === "tarde" ? "#F7E3C3" : C.nube} />
              </g>
            );
          })}
    </g>
  );
};

/** Cordillera de fondo con cumbres nevadas. */
export const Cordillera: React.FC<{ y: number; ancho?: number; semilla?: number; color?: string; nieve?: boolean; alto?: number }> = ({
  y,
  ancho = 1920,
  semilla = 1,
  color = C.monteLejos,
  nieve = true,
  alto = 220,
}) => {
  const pts: [number, number][] = [];
  let x = -300;
  let i = 0;
  while (x < ancho + 300) {
    pts.push([x, y - (0.25 + rr(i, semilla) * 0.75) * alto]);
    x += 90 + rr(i, semilla + 1) * 160;
    i++;
  }
  const d = `M -300 ${y + 400} ` + pts.map(([px, py]) => `L ${px} ${py}`).join(" ") + ` L ${ancho + 300} ${y + 400} Z`;
  return (
    <g>
      <path d={d} fill={color} />
      {nieve
        ? pts.map(([px, py], k) =>
            py < y - alto * 0.62 ? (
              <path key={k} d={`M ${px - 34} ${py + 30} L ${px} ${py} L ${px + 34} ${py + 30} L ${px + 14} ${py + 24} L ${px} ${py + 34} L ${px - 12} ${py + 22} Z`} fill={C.nieve} opacity={0.9} />
            ) : null
          )
        : null}
    </g>
  );
};

/** Humo que sube y se deshace. */
export const Humo: React.FC<{ x: number; y: number; s?: number; color?: string; n?: number; semilla?: number; viento?: number }> = ({
  x,
  y,
  s = 1,
  color = "#CFC8BC",
  n = 6,
  semilla = 1,
  viento = 0.6,
}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const vida = 90;
        const t = ((f + (i * vida) / n + rr(semilla, i) * 20) % vida) / vida;
        const r = (10 + t * 34) * s;
        return (
          <circle
            key={i}
            cx={x + (t * 60 * viento + Math.sin(t * 6 + i) * 6) * s}
            cy={y - t * 170 * s}
            r={r}
            fill={color}
            opacity={(1 - t) * 0.55}
          />
        );
      })}
    </g>
  );
};

/** Llama de vela con parpadeo y halo. */
export const Vela: React.FC<{ x: number; y: number; s?: number; semilla?: number; halo?: number }> = ({ x, y, s = 1, semilla = 1, halo = 1 }) => {
  const f = useCurrentFrame();
  const t = Math.sin(f * 0.6 + semilla) * 0.5 + Math.sin(f * 1.7 + semilla * 3) * 0.3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {halo > 0 ? <circle cx={0} cy={-14} r={70 + t * 6} fill={C.vela} opacity={0.12 * halo} /> : null}
      {halo > 0 ? <circle cx={0} cy={-14} r={34 + t * 3} fill={C.vela} opacity={0.18 * halo} /> : null}
      <rect x={-5} y={0} width={10} height={26} rx={2} fill={"#EDE3C8"} />
      <path d={`M 0 ${-26 - t * 3} Q ${7 + t} -10 0 0 Q ${-7 + t} -10 0 ${-26 - t * 3} Z`} fill={C.vela} />
      <path d={`M 0 ${-16 - t * 2} Q 3 -6 0 -1 Q -3 -6 0 ${-16 - t * 2} Z`} fill={"#FFF6DC"} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Animales de carga                                                    */
/* ------------------------------------------------------------------ */

const LANAS = ["#EFE7D6", "#8A5E3C", "#D9C7A8", "#4A372B", "#B98A5E", "#F2EDE3"];
const BORLAS = ["#C8402C", "#E8B33C", "#2E5A4E", "#B0347A", "#3E4E8A"];

/**
 * Llama de perfil, con los pies en (x0 + v*f, y). Mira a la derecha (v>=0) o a
 * la izquierda. Puede llevar costales y las borlas de colores en las orejas.
 */
export const Llama: React.FC<{
  x0: number;
  y: number;
  v?: number;
  s?: number;
  semilla?: number;
  carga?: "costales" | "plata" | "ninguna";
  dir?: 1 | -1;
}> = ({ x0, y, v = 0, s = 1, semilla = 1, carga = "costales", dir }) => {
  const f = useCurrentFrame();
  const lana = LANAS[Math.floor(rr(semilla, 1) * LANAS.length)];
  const mancha = rr(semilla, 2) > 0.6 ? LANAS[(Math.floor(rr(semilla, 3) * LANAS.length) + 1) % LANAS.length] : null;
  const sombra = osc(lana, 0.8);
  const borla = BORLAS[Math.floor(rr(semilla, 4) * BORLAS.length)];
  const anda = v !== 0;
  const fase = rr(semilla, 5) * 6.28;
  const paso = anda ? Math.sin(f * 0.32 + fase) : 0;
  const cabeceo = anda ? Math.sin(f * 0.32 + fase) * 3 : Math.sin(f * 0.04 + fase) * 4;
  const d = dir ?? (v < 0 ? -1 : 1);
  const px = x0 + v * f;
  const pata = (lx: number, ang: number, c: string) => (
    <g transform={`rotate(${ang} ${lx} -70)`}>
      <rect x={lx - 7} y={-72} width={14} height={66} rx={6} fill={c} />
      <ellipse cx={lx + 2} cy={-4} rx={9} ry={5} fill={osc(c, 0.6)} />
    </g>
  );
  return (
    <g transform={`translate(${px} ${y}) scale(${d * s} ${s})`}>
      <ellipse cx={0} cy={0} rx={70} ry={8} fill="#000" opacity={0.15} />
      {pata(-44, paso * 18, sombra)}
      {pata(38, -paso * 18, sombra)}
      {/* cuerpo lanudo */}
      <path d="M -70 -110 Q -78 -150 -40 -152 L 40 -156 Q 74 -156 72 -116 Q 70 -76 40 -72 L -44 -70 Q -72 -74 -70 -110 Z" fill={lana} />
      {mancha ? <path d="M -30 -150 Q 0 -160 26 -150 Q 30 -118 0 -110 Q -26 -116 -30 -150 Z" fill={mancha} opacity={0.85} /> : null}
      <path d="M -66 -96 Q -40 -80 40 -78 Q 66 -82 70 -100 L 70 -86 Q 64 -72 40 -70 L -44 -68 Q -68 -74 -66 -96 Z" fill={sombra} />
      {/* cola */}
      <path d="M -70 -136 Q -88 -130 -84 -110 Q -76 -118 -68 -120 Z" fill={lana} />
      {pata(-30, -paso * 18, lana)}
      {pata(52, paso * 18, lana)}
      {/* cuello y cabeza */}
      <g transform={`rotate(${cabeceo} 56 -140)`}>
        <path d="M 44 -146 Q 46 -210 56 -246 L 84 -246 Q 82 -200 76 -140 Z" fill={lana} />
        <path d="M 70 -240 Q 78 -200 74 -140 L 76 -140 Q 84 -200 84 -246 Z" fill={sombra} />
        <path d="M 52 -250 Q 54 -272 80 -272 Q 104 -270 114 -254 Q 116 -244 104 -240 L 60 -236 Q 52 -240 52 -250 Z" fill={lana} />
        <ellipse cx={110} cy={-250} rx={5} ry={4} fill={osc(lana, 0.55)} />
        <circle cx={84} cy={-258} r={3.6} fill={C.tinta} />
        <path d="M 60 -268 L 54 -296 Q 62 -292 68 -270 Z" fill={lana} />
        <path d="M 72 -270 L 70 -298 Q 80 -292 80 -270 Z" fill={lana} />
        <circle cx={56} cy={-292} r={5} fill={borla} />
        <circle cx={72} cy={-294} r={5} fill={borla} />
        <path d="M 54 -226 Q 66 -222 80 -228" stroke={borla} strokeWidth={4} fill="none" />
      </g>
      {/* carga */}
      {carga === "costales" ? (
        <g>
          <rect x={-46} y={-182} width={86} height={34} rx={12} fill={"#B8A47C"} />
          <path d="M -46 -170 H 40" stroke={"#8A774F"} strokeWidth={3} />
          <rect x={-40} y={-176} width={74} height={70} rx={14} fill={"#A88F62"} />
          <path d="M -40 -150 H 34 M -40 -126 H 34" stroke={"#8A774F"} strokeWidth={3} opacity={0.6} />
          <rect x={-6} y={-180} width={8} height={80} fill={borla} opacity={0.8} />
        </g>
      ) : carga === "plata" ? (
        <g>
          <rect x={-44} y={-178} width={84} height={20} rx={4} fill={C.maderaMedia} />
          <rect x={-40} y={-172} width={76} height={60} rx={6} fill={"#7A5A3A"} />
          <rect x={-34} y={-160} width={64} height={14} rx={2} fill={C.plata} />
          <rect x={-34} y={-140} width={64} height={14} rx={2} fill={C.plataSombra} />
          <path d="M -40 -114 H 36" stroke={C.madera} strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};

/** Mula de carga de perfil, con su albarda. */
export const Mula: React.FC<{ x0: number; y: number; v?: number; s?: number; semilla?: number; carga?: "plata" | "fardos" }> = ({
  x0,
  y,
  v = 0,
  s = 1,
  semilla = 1,
  carga = "plata",
}) => {
  const f = useCurrentFrame();
  const pelo = ["#5A4434", "#3E3029", "#7A6450", "#6A5546"][Math.floor(rr(semilla, 1) * 4)];
  const sombra = osc(pelo, 0.78);
  const fase = rr(semilla, 5) * 6.28;
  const paso = v !== 0 ? Math.sin(f * 0.3 + fase) : 0;
  const d = v < 0 ? -1 : 1;
  const px = x0 + v * f;
  const pata = (lx: number, ang: number, c: string) => (
    <g transform={`rotate(${ang} ${lx} -100)`}>
      <rect x={lx - 8} y={-102} width={16} height={96} rx={6} fill={c} />
      <rect x={lx - 9} y={-12} width={18} height={10} rx={2} fill={C.tinta} />
    </g>
  );
  return (
    <g transform={`translate(${px} ${y}) scale(${d * s} ${s})`}>
      <ellipse cx={0} cy={0} rx={96} ry={9} fill="#000" opacity={0.15} />
      {pata(-62, paso * 16, sombra)}
      {pata(56, -paso * 16, sombra)}
      <path d="M -92 -150 Q -96 -190 -56 -192 L 60 -194 Q 96 -192 96 -150 Q 94 -104 60 -100 L -60 -98 Q -92 -104 -92 -150 Z" fill={pelo} />
      <path d="M -94 -170 Q -110 -150 -104 -110 L -98 -112 Q -100 -146 -90 -160 Z" fill={osc(pelo, 0.6)} />
      {pata(-44, -paso * 16, pelo)}
      {pata(74, paso * 16, pelo)}
      <g transform={`rotate(${paso * 2} 84 -170)`}>
        <path d="M 70 -186 Q 100 -232 128 -236 L 150 -176 Q 120 -168 96 -150 Z" fill={pelo} />
        <path d="M 120 -244 L 172 -196 Q 176 -180 160 -176 L 132 -186 Z" fill={pelo} />
        <path d="M 112 -240 L 102 -290 L 120 -246 Z M 124 -246 L 122 -292 L 132 -246 Z" fill={pelo} />
        <circle cx={136} cy={-222} r={3.6} fill={C.tinta} />
        <path d="M 120 -236 L 164 -190" stroke={"#6A3A22"} strokeWidth={4} />
      </g>
      {/* albarda */}
      <path d="M -60 -200 Q 0 -214 60 -202 L 64 -150 L -64 -150 Z" fill={"#8A6A44"} />
      <path d="M -60 -168 H 62" stroke={"#6A4E30"} strokeWidth={4} />
      {carga === "plata" ? (
        <g>
          <rect x={-58} y={-232} width={116} height={30} rx={3} fill={"#6A4A30"} />
          <rect x={-50} y={-226} width={100} height={8} fill={C.plata} />
          <rect x={-66} y={-196} width={52} height={70} rx={4} fill={"#6A4A30"} />
          <rect x={-60} y={-188} width={40} height={10} fill={C.plataSombra} />
          <rect x={-60} y={-170} width={40} height={10} fill={C.plata} />
          <path d="M -66 -150 H -14" stroke={C.madera} strokeWidth={3} />
        </g>
      ) : (
        <g>
          <rect x={-64} y={-236} width={124} height={40} rx={10} fill={"#C2AE84"} />
          <path d="M -40 -236 V -196 M 0 -236 V -196 M 40 -236 V -196" stroke={"#8A774F"} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

/** Texto con contorno claro para rotulos dibujados dentro de la escena. */
export const TxtRot: React.FC<{
  x: number;
  y: number;
  s: number;
  children: React.ReactNode;
  color?: string;
  fuente: string;
  ancla?: "start" | "middle" | "end";
  peso?: number;
  esp?: number;
  italica?: boolean;
}> = ({ x, y, s, children, color = C.tinta, fuente, ancla = "middle", peso = 400, esp = 0, italica }) => (
  <text x={x} y={y} fontSize={s} fill={color} fontFamily={fuente} textAnchor={ancla} fontWeight={peso} letterSpacing={esp} fontStyle={italica ? "italic" : undefined}>
    {children}
  </text>
);
