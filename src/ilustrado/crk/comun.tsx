import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../../theme";

/**
 * Piezas comunes del video del crack del 29: paleta, texturas, cielo, nubes,
 * ventanas, coches de los veinte y rotulos. Los personajes van en gente.tsx.
 */

export const C = {
  cielo1: "#DDD3BC",
  cielo2: "#F3ECDC",
  nube: "#FBF7EE",
  papel: "#F2ECDD",
  papelViejo: "#E9DFC6",
  tinta: "#14181A",
  tintaSuave: "#3A3530",
  piedra: "#DCD2BC",
  piedraLuz: "#EAE2D0",
  piedraMedia: "#C8BDA4",
  piedraSombra: "#ADA185",
  piedraOscura: "#8C8068",
  junta: "#C2B79E",
  ladrillo: "#9C6E58",
  ladrilloOsc: "#86584A",
  ladrilloJunta: "#7A5040",
  cristal: "#3E4847",
  cristalLuz: "#7E8D86",
  marco: "#E9E2D2",
  asfalto: "#77736A",
  acera: "#C6BBA4",
  madera: "#5C3E2C",
  maderaMedia: "#6E4B35",
  maderaLuz: "#87603F",
  maderaOsc: "#3E2A1E",
  laton: "#C9A23A",
  latonOsc: "#9C7C26",
  pizarra: "#2B3330",
  tiza: "#EEEBE2",
  carmin: "#C8402C",
  carminOsc: "#9E2F20",
  ocre: "#E8B33C",
  verde: "#2E5A4E",
  verdeOsc: "#22443B",
  verdeBanco: "#2F4A3F",
  azulNoche: "#2A3442",
  tierra: "#C9A878",
  tierraSeca: "#B89466",
  hierba: "#8E9A62",
  agua: "#7F978F",
  aguaOsc: "#6A8079",
  aguaLuz: "#A7BAB1",
};

/** Ruido determinista. */
export const rr = (i: number, k = 1) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export const lim = (t: number) => Math.max(0, Math.min(1, t));
export const suave = (t: number) => {
  const c = lim(t);
  return c * c * (3 - 2 * c);
};

export const oscurecer = (hex: string, f = 0.82) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
};

/** Cifra con separador de miles a la española. */
export const miles = (n: number, dec = 0) => {
  const s = Math.abs(n).toFixed(dec);
  const [ent, fr] = s.split(".");
  const e = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (n < 0 ? "-" : "") + e + (fr ? "," + fr : "");
};

/** Texturas compartidas. Ids con prefijo para no chocar con otros videos. */
export const Defs: React.FC = () => (
  <defs>
    <pattern id="crk-ladrillo" width="48" height="24" patternUnits="userSpaceOnUse">
      <rect width="48" height="24" fill={C.ladrillo} />
      <path d="M0 12 H48 M0 0 H48 M24 0 V12 M0 12 V24 M48 12 V24" stroke={C.ladrilloJunta} strokeWidth="2" />
    </pattern>
    <pattern id="crk-sillar" width="120" height="44" patternUnits="userSpaceOnUse">
      <rect width="120" height="44" fill={C.piedra} />
      <path d="M0 0 H120 M0 22 H120 M60 0 V22 M0 22 V44 M120 22 V44" stroke={C.junta} strokeWidth="1.6" />
    </pattern>
    <pattern id="crk-adoquin" width="38" height="20" patternUnits="userSpaceOnUse">
      <rect width="38" height="20" fill="#7A7468" />
      <rect x="1.5" y="1.5" width="16" height="7" rx="2" fill="#8F887A" />
      <rect x="20" y="1.5" width="16" height="7" rx="2" fill="#8F887A" />
      <rect x="-8" y="11.5" width="16" height="7" rx="2" fill="#8F887A" />
      <rect x="11" y="11.5" width="16" height="7" rx="2" fill="#8F887A" />
      <rect x="30" y="11.5" width="16" height="7" rx="2" fill="#8F887A" />
    </pattern>
    <pattern id="crk-parquet" width="60" height="30" patternUnits="userSpaceOnUse">
      <rect width="60" height="30" fill={C.maderaMedia} />
      <path d="M0 15 H60 M30 0 V15 M0 15 V30" stroke={C.madera} strokeWidth="2" />
    </pattern>
    <pattern id="crk-baldosa" width="80" height="80" patternUnits="userSpaceOnUse">
      <rect width="80" height="80" fill="#D9CFB8" />
      <rect width="40" height="40" fill="#C9BDA2" />
      <rect x="40" y="40" width="40" height="40" fill="#C9BDA2" />
    </pattern>
    <pattern id="crk-tablas" width="200" height="26" patternUnits="userSpaceOnUse">
      <rect width="200" height="26" fill="#8A6A4C" />
      <path d="M0 0 H200 M120 0 V26" stroke="#6E523A" strokeWidth="2" />
    </pattern>
    <pattern id="crk-papelpintado" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill="#B9A783" />
      <path d="M30 10 Q36 20 30 30 Q24 20 30 10 Z M0 40 Q6 50 0 60 M60 40 Q54 50 60 60" fill="#AA9774" />
    </pattern>
    <pattern id="crk-tierra" width="90" height="30" patternUnits="userSpaceOnUse">
      <rect width="90" height="30" fill={C.tierraSeca} />
      <path d="M0 22 L20 18 L34 24 M50 8 L64 12 L80 6" stroke="#9E7B52" strokeWidth="2" fill="none" />
    </pattern>
    <linearGradient id="crk-cielo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.cielo1} />
      <stop offset="1" stopColor={C.cielo2} />
    </linearGradient>
    <linearGradient id="crk-cieloTarde" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#C9A98A" />
      <stop offset="1" stopColor="#F1D9B0" />
    </linearGradient>
    <linearGradient id="crk-cieloNoche" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1F2733" />
      <stop offset="1" stopColor="#3A4555" />
    </linearGradient>
    <linearGradient id="crk-cieloGris" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#A9A79C" />
      <stop offset="1" stopColor="#D2CEC0" />
    </linearGradient>
    <linearGradient id="crk-luzVentana" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stopColor="#FFF3D2" stopOpacity="0.5" />
      <stop offset="1" stopColor="#FFF3D2" stopOpacity="0" />
    </linearGradient>
    <radialGradient id="crk-lampara" cx="0.5" cy="0.4" r="0.6">
      <stop offset="0" stopColor="#FFE7AE" stopOpacity="0.6" />
      <stop offset="1" stopColor="#FFE7AE" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="crk-fuego" cx="0.5" cy="0.6" r="0.6">
      <stop offset="0" stopColor="#FFC66B" stopOpacity="0.7" />
      <stop offset="1" stopColor="#FFC66B" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/** Cielo con nubes que pasan despacio. `hora` cambia el degradado. */
export const CieloNubes: React.FC<{ ancho?: number; alto?: number; hora?: string; nubes?: number; gris?: boolean; sem?: number }> = ({
  ancho = 1920,
  alto = 800,
  hora = "dia",
  nubes = 5,
  gris,
  sem = 1,
}) => {
  const f = useCurrentFrame();
  const fondo = gris ? "url(#crk-cieloGris)" : hora === "noche" ? "url(#crk-cieloNoche)" : hora === "tarde" ? "url(#crk-cieloTarde)" : "url(#crk-cielo)";
  const color = hora === "noche" ? "#4A5566" : gris ? "#BDBAAE" : hora === "tarde" ? "#F6E3C4" : C.nube;
  return (
    <g>
      <rect x={-200} y={-200} width={ancho + 400} height={alto + 200} fill={fondo} />
      {hora === "noche"
        ? Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={rr(i, sem + 3) * ancho} cy={rr(i, sem + 4) * alto * 0.6} r={1 + rr(i, 5) * 1.5} fill="#E9E4D4" opacity={0.4 + 0.4 * Math.sin(f * 0.05 + i)} />
          ))
        : null}
      {Array.from({ length: nubes }).map((_, i) => {
        const x = ((rr(i, sem) * (ancho + 600) + f * (0.25 + rr(i, sem + 1) * 0.35)) % (ancho + 600)) - 400;
        const y = 50 + rr(i, sem + 2) * alto * 0.3;
        const s = 0.7 + rr(i, 5) * 0.8;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.85}>
            <rect x={0} y={20} width={240} height={36} rx={18} fill={color} />
            <rect x={44} y={0} width={120} height={46} rx={23} fill={color} />
            <rect x={120} y={10} width={84} height={38} rx={19} fill={color} />
          </g>
        );
      })}
    </g>
  );
};

/** Ventana de guillotina con recercado de piedra. */
export const Ventana: React.FC<{ x: number; y: number; w: number; h: number; luz?: boolean; marco?: string; cristal?: string }> = ({
  x,
  y,
  w,
  h,
  luz,
  marco = C.piedraMedia,
  cristal,
}) => (
  <g>
    <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill={marco} />
    <rect x={x} y={y} width={w} height={h} fill={cristal ?? (luz ? "#D9BF7E" : C.cristal)} />
    <rect x={x} y={y} width={w * 0.45} height={h} fill={luz ? "#E9D59C" : C.cristalLuz} opacity={0.28} />
    <path d={`M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h / 2} H ${x + w}`} stroke={C.marco} strokeWidth={3} />
    <rect x={x - 12} y={y + h + 6} width={w + 24} height={8} fill={C.piedra} />
    <rect x={x - 12} y={y - 18} width={w + 24} height={10} fill={C.piedra} />
  </g>
);

/** Columna clasica con fuste estriado. */
export const Columna: React.FC<{ x: number; y: number; h: number; w?: number; tono?: string }> = ({ x, y, h, w = 46, tono = C.piedraLuz }) => (
  <g>
    <rect x={x - w / 2 - 8} y={y - 16} width={w + 16} height={16} fill={C.piedraMedia} />
    <rect x={x - w / 2 - 4} y={y - 26} width={w + 8} height={10} fill={C.piedra} />
    <rect x={x - w / 2} y={y - h} width={w} height={h - 26} fill={tono} />
    {[0.25, 0.5, 0.75].map((k) => (
      <rect key={k} x={x - w / 2 + w * k - 1.5} y={y - h + 6} width={3} height={h - 36} fill={C.piedraMedia} opacity={0.7} />
    ))}
    <rect x={x + w / 2 - w * 0.28} y={y - h} width={w * 0.28} height={h - 26} fill={C.piedraMedia} opacity={0.55} />
    <path
      d={`M ${x - w / 2 - 2} ${y - h} Q ${x - w / 2 - 14} ${y - h - 22} ${x - w / 2 - 18} ${y - h - 36} L ${x + w / 2 + 18} ${y - h - 36} Q ${x + w / 2 + 14} ${y - h - 22} ${x + w / 2 + 2} ${y - h} Z`}
      fill={C.piedra}
    />
    {[-0.3, 0, 0.3].map((k) => (
      <path key={k} d={`M ${x + w * k - 7} ${y - h} Q ${x + w * k} ${y - h - 26} ${x + w * k + 7} ${y - h}`} fill={C.piedraMedia} />
    ))}
    <rect x={x - w / 2 - 20} y={y - h - 44} width={w + 40} height={10} fill={C.piedraMedia} />
  </g>
);

/** Rotulo de comercio con marco de laton. */
export const Rotulo: React.FC<{ x: number; y: number; w: number; h?: number; texto: string; fondo?: string; color?: string; tam?: number; serif?: boolean }> = ({
  x,
  y,
  w,
  h = 44,
  texto,
  fondo = C.verdeOsc,
  color = C.laton,
  tam = 26,
  serif = true,
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={fondo} />
    <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill="none" stroke={color} strokeWidth={2} />
    <text
      x={x + w / 2}
      y={y + h / 2 + tam * 0.36}
      textAnchor="middle"
      fontFamily={serif ? FONT.serif : FONT.sans}
      fontWeight={serif ? 400 : 700}
      fontSize={tam}
      letterSpacing={3}
      fill={color}
    >
      {texto}
    </text>
  </g>
);

/** Farola de Nueva York de los veinte. */
export const Farola: React.FC<{ x: number; y: number; s?: number; encendida?: boolean }> = ({ x, y, s = 1, encendida }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-16} y={-30} width={32} height={30} fill={"#2A3230"} />
    <rect x={-7} y={-330} width={14} height={300} fill={"#2A3230"} />
    <rect x={-11} y={-120} width={22} height={10} fill={"#2A3230"} />
    <path d="M -7 -330 Q -7 -360 30 -362 L 30 -354 Q 4 -352 4 -330 Z" fill={"#2A3230"} />
    <path d="M 14 -356 L 46 -356 L 40 -330 L 20 -330 Z" fill={encendida ? "#F4D78C" : "#E8DDBF"} />
    <rect x={16} y={-360} width={28} height={6} fill={"#2A3230"} />
  </g>
);

/** Coche de los veinte (tipo Ford T), de perfil. Hacia la izquierda si v < 0. */
export const Coche: React.FC<{ x0: number; y: number; v: number; s?: number; color?: string; capota?: boolean; parado?: boolean }> = ({
  x0,
  y,
  v,
  s = 1,
  color = "#1E2426",
  capota = true,
  parado,
}) => {
  const f = useCurrentFrame();
  const x = x0 + (parado ? 0 : v * f);
  const giro = parado ? 0 : (f * v * 3) % 360;
  const rueda = (cx: number) => (
    <g transform={`translate(${cx} -46)`}>
      <circle r={46} fill={"#15181A"} />
      <circle r={34} fill={"#8A7A5C"} />
      <g transform={`rotate(${giro})`}>
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={-2} y={-34} width={4} height={68} fill={"#3A3026"} transform={`rotate(${i * 18})`} />
        ))}
      </g>
      <circle r={9} fill={"#2A2A2A"} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (v < 0 ? -1 : 1)} ${s})`}>
      <ellipse cx={170} cy={0} rx={220} ry={10} fill="#000" opacity={0.18} />
      {/* chasis y estribo */}
      <rect x={-10} y={-70} width={370} height={12} fill={"#15181A"} />
      <path d="M 70 -76 L 290 -76 L 300 -70 L 60 -70 Z" fill={"#2A2E30"} />
      {/* guardabarros */}
      <path d="M 0 -60 Q 10 -112 60 -110 Q 104 -108 110 -64" fill="none" stroke={color} strokeWidth={12} />
      <path d="M 250 -60 Q 260 -112 306 -110 Q 350 -108 356 -64" fill="none" stroke={color} strokeWidth={12} />
      {/* carroceria */}
      <path d="M 40 -78 L 40 -150 Q 44 -160 60 -160 L 200 -160 L 210 -78 Z" fill={color} />
      <path d="M 210 -78 L 204 -140 L 330 -128 Q 352 -124 352 -100 L 352 -80 Z" fill={color} />
      <rect x={346} y={-140} width={14} height={60} rx={3} fill={C.laton} />
      <rect x={348} y={-136} width={10} height={52} fill={"#4A4A44"} />
      {/* capota y parabrisas */}
      {capota ? (
        <g>
          <path d="M 44 -160 L 52 -246 Q 120 -258 196 -244 L 204 -160 Z" fill={"#1A1C1E"} />
          <rect x={64} y={-236} width={58} height={56} rx={4} fill={C.cristal} />
          <rect x={132} y={-236} width={56} height={56} rx={4} fill={C.cristal} />
          <rect x={64} y={-236} width={22} height={56} fill={C.cristalLuz} opacity={0.35} />
        </g>
      ) : null}
      <path d="M 200 -160 L 210 -230" stroke={"#3A3E40"} strokeWidth={5} />
      <rect x={120} y={-120} width={20} height={4} fill={"#55595A"} />
      <circle cx={342} cy={-150} r={10} fill={"#E8DDBF"} stroke={"#2A2E30"} strokeWidth={3} />
      {rueda(56)}
      {rueda(304)}
    </g>
  );
};

/** Bandera de Estados Unidos (48 estrellas sugeridas) que ondea. */
export const BanderaUSA: React.FC<{ x: number; y: number; s?: number; mastil?: number }> = ({ x, y, s = 1, mastil = 300 }) => {
  const f = useCurrentFrame();
  const ond = (k: number) => Math.sin(f * 0.15 + k) * 6;
  const franjas = Array.from({ length: 7 }).map((_, i) => {
    const y0 = i * 2 * 9;
    return (
      <path
        key={i}
        d={`M 0 ${y0} Q 60 ${y0 + ond(0)} 150 ${y0} L 150 ${y0 + 9} Q 60 ${y0 + 9 + ond(0)} 0 ${y0 + 9} Z`}
        fill={C.carmin}
      />
    );
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-5} y={0} width={8} height={mastil} fill={"#2A2E30"} />
      <circle cx={-1} cy={-4} r={7} fill={C.laton} />
      <g transform="translate(3 6)">
        <path d={`M 0 0 Q 60 ${ond(0)} 150 0 L 150 117 Q 60 ${117 + ond(0)} 0 117 Z`} fill={"#F2EDE2"} />
        {franjas}
        <rect x={0} y={0} width={64} height={63} fill={"#23365E"} />
        {Array.from({ length: 20 }).map((_, i) => (
          <circle key={i} cx={7 + (i % 5) * 12.5} cy={8 + Math.floor(i / 5) * 15} r={2} fill={"#F2EDE2"} />
        ))}
      </g>
    </g>
  );
};

/** Papelitos o billetes que caen dando vueltas. */
export const Papeles: React.FC<{ n: number; x0: number; x1: number; y0: number; y1: number; sem?: number; color?: string; tam?: number; vel?: number }> = ({
  n,
  x0,
  x1,
  y0,
  y1,
  sem = 3,
  color = "#F2EDE0",
  tam = 18,
  vel = 2.2,
}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const alto = y1 - y0;
        const yy = y0 + ((rr(i, sem) * alto + f * vel * (0.6 + rr(i, sem + 1) * 0.8)) % alto);
        const xx = x0 + rr(i, sem + 2) * (x1 - x0) + Math.sin(f * 0.06 + i) * 24;
        const giro = f * (2 + rr(i, 7) * 4) + i * 40;
        return (
          <rect
            key={i}
            x={-tam / 2}
            y={-tam * 0.31}
            width={tam}
            height={tam * 0.62}
            fill={color}
            opacity={0.9}
            transform={`translate(${xx} ${yy}) rotate(${giro}) scale(1 ${0.35 + 0.65 * Math.abs(Math.sin(f * 0.1 + i))})`}
          />
        );
      })}
    </g>
  );
};

/** Humo que sube en volutas. */
export const Humo: React.FC<{ x: number; y: number; s?: number; color?: string; n?: number }> = ({ x, y, s = 1, color = "#CFC8B8", n = 7 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: n }).map((_, i) => {
        const t = ((f * 0.9 + i * (160 / n)) % 160) / 160;
        return (
          <circle
            key={i}
            cx={Math.sin(t * 6 + i) * 14 + t * 60}
            cy={-t * 260}
            r={14 + t * 40}
            fill={color}
            opacity={(1 - t) * 0.55}
          />
        );
      })}
    </g>
  );
};

/** Texto de época centrado. */
export const T: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  tam?: number;
  color?: string;
  fam?: "serif" | "sans" | "mono";
  peso?: number;
  anc?: "start" | "middle" | "end";
  esp?: number;
  op?: number;
}> = ({ x, y, children, tam = 24, color = C.tinta, fam = "sans", peso, anc = "middle", esp = 0, op }) => (
  <text
    x={x}
    y={y}
    textAnchor={anc}
    fontFamily={fam === "serif" ? FONT.serif : fam === "mono" ? FONT.mono : FONT.sans}
    fontWeight={peso ?? (fam === "sans" ? 700 : 400)}
    fontSize={tam}
    letterSpacing={esp}
    fill={color}
    opacity={op}
  >
    {children}
  </text>
);
