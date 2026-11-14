import React from "react";
import { useCurrentFrame } from "remotion";
import { loadFont as loadFraktur } from "@remotion/google-fonts/UnifrakturMaguntia";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { FONT } from "../../theme";
import type { Enc, Toma } from "../tipos";

/**
 * Piezas comunes del video de Weimar (Berlin y el Ruhr, 1914-1924): paleta,
 * texturas, cielo, humo, billetes y fajos, ventanas, lamparas, relojes,
 * rotulos en Fraktur y la cuenta de las cifras que se disparan.
 */

const fraktur = loadFraktur("normal", { weights: ["400"] });
const oswald = loadOswald("normal", { weights: ["400", "600"] });

export const FUENTE = {
  fraktur: fraktur.fontFamily,
  moderna: oswald.fontFamily,
  sans: FONT.sans,
  serif: FONT.serif,
  mono: FONT.mono,
};

export const W = {
  cielo1: "#DCD6C6",
  cielo2: "#EFEADD",
  tarde1: "#D9A77C",
  tarde2: "#F0D6AE",
  noche1: "#1A2230",
  noche2: "#33394A",
  nube: "#F8F4EA",
  piedra: "#D6CCB6",
  piedraLuz: "#E6DECB",
  piedraMedia: "#C4B89E",
  piedraSombra: "#A99C82",
  piedraOscura: "#867A63",
  revoco: "#CDBFA2",
  revocoLuz: "#DCCFB3",
  revocoSombra: "#B2A486",
  ocreFachada: "#C9AE7E",
  ladrillo: "#94664E",
  ladrilloJunta: "#7A5240",
  ladrilloOscuro: "#6E4A3A",
  hollin: "#5E564C",
  cristal: "#3A4443",
  cristalLuz: "#71827C",
  marco: "#E6DECC",
  adoquin: "#8A8476",
  adoquinJunta: "#757063",
  acera: "#C2B8A2",
  madera: "#5A3D2B",
  maderaMedia: "#6E4C35",
  maderaLuz: "#8A6544",
  maderaClara: "#B08A5E",
  hierro: "#2A2E30",
  hierroLuz: "#4A5052",
  laton: "#C9A23A",
  latonLuz: "#E2C46A",
  pizarra: "#2B3330",
  tiza: "#EEEBE2",
  papel: "#EFE7D2",
  papelSombra: "#D9CDB0",
  billete: "#D9CFA8",
  billeteSombra: "#B9AE84",
  billeteAzul: "#A9B6B4",
  billeteRosa: "#D8B4A0",
  carmin: "#C8402C",
  ocre: "#E8B33C",
  verde: "#2E5A4E",
  verdeOscuro: "#22443B",
  azulHorizonte: "#7E8EA4",
  azulHorizonteOsc: "#66768C",
  tinta: "#14181A",
  humo: "#8C8578",
  fuego: "#E8913C",
};

/** Ruido determinista 0..1. */
export const rr = (i: number, k = 1) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export const sv = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

export const oscurecer = (hex: string, f = 0.82) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
};

/**
 * Toma con la camara recortada al mundo: a zoom z el encuadre mide
 * 1920/z x 1080/z y su centro no puede acercarse al borde mas de la mitad.
 */
export const toma = (de: [number, number, number], a: [number, number, number], desc: string, ancho = 1920): Toma => {
  const fija = ([x, y, z]: [number, number, number]): Enc => {
    const zz = Math.max(1, z);
    const mx = 960 / zz;
    const my = 540 / zz;
    return { x: Math.max(mx, Math.min(ancho - mx, x)), y: Math.max(my, Math.min(1080 - my, y)), z: zz };
  };
  return { de: fija(de), a: fija(a), desc };
};

/* ------------------------------------------------------------------ */
/* Cifras                                                              */
/* ------------------------------------------------------------------ */

/** 4200000000000 -> "4.200.000.000.000" (a la alemana). */
export const puntos = (n: number) => {
  // cifras pequenas con decimales: 4,20 / 0,28
  if (n < 1000 && Math.abs(n - Math.round(n)) > 0.001) return n.toFixed(2).replace(".", ",");
  const s = Math.round(n).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/** Sube de `a` a `b` en escala logaritmica: asi se ve el disparo de 1923. */
export const subeLog = (a: number, b: number, t: number) => {
  const c = Math.max(0, Math.min(1, t));
  if (a <= 0 || b <= 0) return a + (b - a) * c;
  const v = Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * c);
  // redondeo a tres cifras significativas para que no tiemble
  if (v < 100) return Math.round(v * 100) / 100;
  const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(v)) - 2));
  return Math.round(v / mag) * mag;
};

/** Cifra que corre entre los `valores` del guion durante la escena. */
export const cifraEn = (valores: number[] | undefined, f: number, dur: number, defecto: number[], desde = 0.12, hasta = 0.8) => {
  const v = valores && valores.length ? valores : defecto;
  if (v.length === 1) return v[0];
  const t = sv((f / Math.max(1, dur) - desde) / (hasta - desde));
  const tramos = v.length - 1;
  const i = Math.min(tramos - 1, Math.floor(t * tramos));
  const tt = t * tramos - i;
  return subeLog(v[i], v[i + 1], tt);
};

/* ------------------------------------------------------------------ */
/* Texturas                                                            */
/* ------------------------------------------------------------------ */

export const Defs: React.FC = () => (
  <defs>
    <pattern id="w-ladrillo" width="44" height="22" patternUnits="userSpaceOnUse">
      <rect width="44" height="22" fill={W.ladrillo} />
      <path d="M0 11 H44 M0 0 H44 M22 0 V11 M0 11 V22 M44 11 V22" stroke={W.ladrilloJunta} strokeWidth="2" />
    </pattern>
    <pattern id="w-ladrilloOsc" width="44" height="22" patternUnits="userSpaceOnUse">
      <rect width="44" height="22" fill={W.ladrilloOscuro} />
      <path d="M0 11 H44 M0 0 H44 M22 0 V11 M0 11 V22 M44 11 V22" stroke={"#5A3C2F"} strokeWidth="2" />
    </pattern>
    <pattern id="w-sillar" width="110" height="40" patternUnits="userSpaceOnUse">
      <rect width="110" height="40" fill={W.piedra} />
      <path d="M0 0 H110 M0 20 H110 M55 0 V20 M0 20 V40 M110 20 V40" stroke={W.piedraMedia} strokeWidth="1.6" />
    </pattern>
    <pattern id="w-revoco" width="160" height="56" patternUnits="userSpaceOnUse">
      <rect width="160" height="56" fill={W.revoco} />
      <path d="M0 0 H160 M0 28 H160" stroke={W.revocoSombra} strokeWidth="1.4" opacity="0.6" />
    </pattern>
    <pattern id="w-adoquin" width="36" height="18" patternUnits="userSpaceOnUse">
      <rect width="36" height="18" fill={W.adoquinJunta} />
      <rect x="1.5" y="1.5" width="15" height="6.5" rx="2" fill={W.adoquin} />
      <rect x="19" y="1.5" width="15" height="6.5" rx="2" fill={W.adoquin} />
      <rect x="-7.5" y="10.5" width="15" height="6.5" rx="2" fill={W.adoquin} />
      <rect x="10.5" y="10.5" width="15" height="6.5" rx="2" fill={W.adoquin} />
      <rect x="28.5" y="10.5" width="15" height="6.5" rx="2" fill={W.adoquin} />
    </pattern>
    <pattern id="w-parquet" width="64" height="32" patternUnits="userSpaceOnUse">
      <rect width="64" height="32" fill={W.maderaMedia} />
      <path d="M0 16 H64 M32 0 V16 M0 16 V32" stroke={W.madera} strokeWidth="2" />
    </pattern>
    <pattern id="w-tablas" width="300" height="26" patternUnits="userSpaceOnUse">
      <rect width="300" height="26" fill={W.maderaLuz} />
      <path d="M0 0 H300 M120 0 V26" stroke={W.maderaMedia} strokeWidth="2" />
    </pattern>
    <pattern id="w-baldosa" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill={"#D9D0BC"} />
      <rect width="30" height="30" fill={"#B9AE96"} />
      <rect x="30" y="30" width="30" height="30" fill={"#B9AE96"} />
    </pattern>
    <pattern id="w-papelPintado" width="60" height="80" patternUnits="userSpaceOnUse">
      <rect width="60" height="80" fill={"#B9A57E"} />
      <path d="M30 8 Q38 20 30 32 Q22 20 30 8 Z M0 48 Q8 60 0 72 M60 48 Q52 60 60 72" fill={"#A99468"} />
      <path d="M15 0 V80 M45 0 V80" stroke={"#AE9A70"} strokeWidth="1.2" />
    </pattern>
    <pattern id="w-papelVerde" width="56" height="70" patternUnits="userSpaceOnUse">
      <rect width="56" height="70" fill={"#7E8C74"} />
      <circle cx="28" cy="20" r="5" fill={"#72806A"} />
      <circle cx="0" cy="55" r="5" fill={"#72806A"} />
      <circle cx="56" cy="55" r="5" fill={"#72806A"} />
    </pattern>
    <pattern id="w-azulejo" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill={"#E8E4D8"} />
      <path d="M0 0 H40 M0 0 V40" stroke={"#C9C3B2"} strokeWidth="2" />
    </pattern>
    <linearGradient id="w-cielo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={W.cielo1} />
      <stop offset="1" stopColor={W.cielo2} />
    </linearGradient>
    <linearGradient id="w-cieloTarde" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={W.tarde1} />
      <stop offset="1" stopColor={W.tarde2} />
    </linearGradient>
    <linearGradient id="w-cieloNoche" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={W.noche1} />
      <stop offset="1" stopColor={W.noche2} />
    </linearGradient>
    <linearGradient id="w-luz" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stopColor="#FFF3D2" stopOpacity="0.5" />
      <stop offset="1" stopColor="#FFF3D2" stopOpacity="0" />
    </linearGradient>
    <radialGradient id="w-lampara" cx="0.5" cy="0.4" r="0.6">
      <stop offset="0" stopColor="#FFE3A0" stopOpacity="0.5" />
      <stop offset="1" stopColor="#FFE3A0" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="w-fuego" cx="0.5" cy="0.6" r="0.6">
      <stop offset="0" stopColor="#FFD27A" stopOpacity="0.85" />
      <stop offset="1" stopColor="#E8913C" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="w-sombraSuelo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity="0.18" />
      <stop offset="1" stopColor="#000" stopOpacity="0" />
    </linearGradient>
  </defs>
);

/* ------------------------------------------------------------------ */
/* Cielo, nubes y humo                                                 */
/* ------------------------------------------------------------------ */

export const Cielo: React.FC<{ hora?: string; ancho?: number; alto?: number; nubes?: number }> = ({ hora = "dia", ancho = 1920, alto = 1080, nubes = 5 }) => {
  const f = useCurrentFrame();
  const id = hora === "noche" ? "w-cieloNoche" : hora === "tarde" ? "w-cieloTarde" : "w-cielo";
  return (
    <g>
      <rect x={-300} y={-100} width={ancho + 600} height={alto + 100} fill={`url(#${id})`} />
      {hora === "noche"
        ? Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={rr(i, 3) * ancho} cy={rr(i, 4) * alto * 0.5} r={1 + rr(i, 5) * 1.5} fill={"#F2EBD8"} opacity={0.4 + 0.4 * Math.sin(f * 0.1 + i)} />
          ))
        : Array.from({ length: nubes }).map((_, i) => {
            const nx = ((rr(i, 2) * (ancho + 600) + f * (0.25 + rr(i, 3) * 0.3)) % (ancho + 700)) - 400;
            const ny = 50 + rr(i, 4) * 200;
            const s = 0.7 + rr(i, 5) * 0.8;
            return (
              <g key={i} transform={`translate(${nx} ${ny}) scale(${s})`} opacity={hora === "tarde" ? 0.6 : 0.85}>
                <rect x={0} y={20} width={240} height={34} rx={17} fill={hora === "tarde" ? "#F6DEC0" : W.nube} />
                <rect x={44} y={0} width={120} height={44} rx={22} fill={hora === "tarde" ? "#F6DEC0" : W.nube} />
                <rect x={120} y={10} width={80} height={34} rx={17} fill={hora === "tarde" ? "#F6DEC0" : W.nube} />
              </g>
            );
          })}
    </g>
  );
};

/** Bocanadas de humo que suben de (x, y) y se deshacen. */
export const Humo: React.FC<{ x: number; y: number; s?: number; color?: string; n?: number; viento?: number; semilla?: number; opacidad?: number }> = ({
  x,
  y,
  s = 1,
  color = W.humo,
  n = 6,
  viento = 0.6,
  semilla = 1,
  opacidad = 0.55,
}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const ciclo = 150;
        const t = ((f + (i * ciclo) / n + semilla * 37) % ciclo) / ciclo;
        const px = x + t * 220 * viento * s + Math.sin(t * 6 + i) * 10 * s;
        const py = y - t * 300 * s;
        const r = (16 + t * 60) * s;
        return <circle key={i} cx={px} cy={py} r={r} fill={color} opacity={opacidad * (1 - t) * Math.min(1, t * 6)} />;
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Billetes                                                            */
/* ------------------------------------------------------------------ */

const TONOS_BILLETE = [W.billete, W.billeteAzul, W.billeteRosa, "#C9C0A0", "#B8C2A8"];

/** Un billete pequeno visto de frente (para las mesas y las manos). */
export const Billete: React.FC<{ x: number; y: number; w?: number; giro?: number; tono?: number; cifra?: string }> = ({ x, y, w = 90, giro = 0, tono = 0, cifra }) => {
  const h = w * 0.52;
  const c = TONOS_BILLETE[tono % TONOS_BILLETE.length];
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={c} />
      <rect x={-w / 2 + 4} y={-h / 2 + 4} width={w - 8} height={h - 8} fill="none" stroke={oscurecer(c, 0.72)} strokeWidth={1.6} />
      <circle cx={-w * 0.25} cy={0} r={h * 0.25} fill={oscurecer(c, 0.85)} />
      {cifra ? (
        <text x={w * 0.14} y={h * 0.12} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={h * 0.36} fill={oscurecer(c, 0.5)}>
          {cifra}
        </text>
      ) : (
        <rect x={0} y={-h * 0.12} width={w * 0.34} height={h * 0.22} fill={oscurecer(c, 0.75)} />
      )}
    </g>
  );
};

/** Fajo de billetes atado con su faja de papel. Visto de lado y un poco desde arriba. */
export const Fajo: React.FC<{ x: number; y: number; w?: number; alto?: number; tono?: number; faja?: string }> = ({ x, y, w = 110, alto = 26, tono = 0, faja = W.papel }) => {
  const c = TONOS_BILLETE[tono % TONOS_BILLETE.length];
  const p = w * 0.22;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* cara de arriba */}
      <path d={`M ${-w / 2} ${-alto} L ${w / 2 - p * 0.4} ${-alto} L ${w / 2} ${-alto - p * 0.5} L ${-w / 2 + p * 0.4} ${-alto - p * 0.5} Z`} fill={c} />
      {/* canto de los billetes */}
      <rect x={-w / 2} y={-alto} width={w - p * 0.4} height={alto} fill={oscurecer(c, 0.9)} />
      {Array.from({ length: Math.max(2, Math.floor(alto / 5)) }).map((_, i) => (
        <line key={i} x1={-w / 2} x2={w / 2 - p * 0.4} y1={-alto + 3 + i * 5} y2={-alto + 3 + i * 5} stroke={oscurecer(c, 0.78)} strokeWidth={1} />
      ))}
      <path d={`M ${w / 2 - p * 0.4} 0 L ${w / 2} ${-p * 0.5} L ${w / 2} ${-alto - p * 0.5} L ${w / 2 - p * 0.4} ${-alto} Z`} fill={oscurecer(c, 0.75)} />
      {/* faja */}
      <rect x={-w * 0.08} y={-alto - 0.5} width={w * 0.16} height={alto + 1} fill={faja} />
      <path d={`M ${-w * 0.08 + p * 0.2} ${-alto - p * 0.5} L ${w * 0.08 + p * 0.2} ${-alto - p * 0.5} L ${w * 0.08} ${-alto} L ${-w * 0.08} ${-alto} Z`} fill={oscurecer(faja, 0.92)} />
    </g>
  );
};

/** Monton de fajos apilados en desorden. */
export const Monton: React.FC<{ x: number; y: number; n?: number; w?: number; semilla?: number; ancho?: number }> = ({ x, y, n = 12, w = 100, semilla = 1, ancho = 3 }) => {
  const piezas: React.ReactNode[] = [];
  let k = 0;
  for (let fila = 0; k < n; fila++) {
    const enFila = Math.max(1, ancho - Math.floor(fila / 2));
    for (let c = 0; c < enFila && k < n; c++, k++) {
      const off = (fila % 2) * w * 0.4;
      piezas.push(<Fajo key={k} x={x + (c - (enFila - 1) / 2) * w * 0.95 + off * 0.3 + (rr(k, semilla) - 0.5) * 10} y={y - fila * 24} w={w} alto={22} tono={Math.floor(rr(k, semilla + 3) * 5)} />);
    }
  }
  return <g>{piezas}</g>;
};

/** Billetes que caen revoloteando por toda una zona (para la imprenta). */
export const BilletesCayendo: React.FC<{ x: number; y: number; w: number; h: number; n?: number; semilla?: number }> = ({ x, y, w, h, n = 14, semilla = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const ciclo = 120 + rr(i, semilla) * 80;
        const t = ((f + rr(i, semilla + 1) * ciclo) % ciclo) / ciclo;
        const px = x + rr(i, semilla + 2) * w + Math.sin(t * 9 + i) * 30;
        const py = y + t * h;
        return <Billete key={i} x={px} y={py} w={56} giro={Math.sin(t * 7 + i) * 50} tono={i} />;
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Arquitectura                                                        */
/* ------------------------------------------------------------------ */

/** Ventana de fachada berlinesa con recercado, alfeizar y cortina. */
export const VentanaFachada: React.FC<{ x: number; y: number; w: number; h: number; luz?: boolean; frontis?: "triangulo" | "curvo" | "recto"; cortina?: boolean; tono?: string }> = ({
  x,
  y,
  w,
  h,
  luz,
  frontis = "recto",
  cortina = true,
  tono = W.piedraLuz,
}) => (
  <g>
    <rect x={x - 9} y={y - 9} width={w + 18} height={h + 18} fill={oscurecer(tono, 0.9)} />
    <rect x={x} y={y} width={w} height={h} fill={luz ? "#D9BE7E" : W.cristal} />
    <rect x={x} y={y} width={w * 0.45} height={h} fill={luz ? "#E8D39C" : W.cristalLuz} opacity={0.25} />
    {cortina ? <path d={`M ${x} ${y} L ${x + w * 0.3} ${y} Q ${x + w * 0.16} ${y + h * 0.5} ${x + w * 0.22} ${y + h} L ${x} ${y + h} Z`} fill={"#E9E1CC"} opacity={0.75} /> : null}
    <path d={`M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h * 0.36} H ${x + w}`} stroke={W.marco} strokeWidth={4} />
    <rect x={x - 14} y={y + h + 6} width={w + 28} height={9} fill={tono} />
    <rect x={x - 10} y={y + h + 15} width={w + 20} height={5} fill={oscurecer(tono, 0.8)} />
    {frontis === "triangulo" ? (
      <polygon points={`${x - 16},${y - 11} ${x + w / 2},${y - 40} ${x + w + 16},${y - 11}`} fill={tono} />
    ) : frontis === "curvo" ? (
      <path d={`M ${x - 16} ${y - 11} Q ${x + w / 2} ${y - 50} ${x + w + 16} ${y - 11} Z`} fill={tono} />
    ) : (
      <rect x={x - 14} y={y - 22} width={w + 28} height={11} fill={tono} />
    )}
  </g>
);

/** Ventana de interior con la calle al fondo y la luz entrando. */
export const VentanaInterior: React.FC<{ x: number; y: number; w: number; h: number; hora?: string; cortinas?: string; fuera?: "ciudad" | "fabrica" }> = ({
  x,
  y,
  w,
  h,
  hora = "dia",
  cortinas = "#8A3A30",
  fuera = "ciudad",
}) => {
  const fondo = hora === "noche" ? "#26303F" : hora === "tarde" ? "#E6BE90" : "#DCE0D6";
  const casas = hora === "noche" ? "#1B2230" : "#B9B3A2";
  return (
    <g>
      <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} fill={W.maderaLuz} />
      <rect x={x} y={y} width={w} height={h} fill={fondo} />
      <g>
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={Math.max(x, x + i * (w / 5) - 20)} y={y + h * (0.45 + rr(i, 7) * 0.2)} width={Math.min(w / 5 + 10, x + w - Math.max(x, x + i * (w / 5) - 20))} height={h * (0.55 - rr(i, 7) * 0.2)} fill={casas} />
        ))}
        {fuera === "fabrica"
          ? [0.3, 0.6].map((k) => <rect key={k} x={x + w * k} y={y + h * 0.15} width={18} height={h * 0.85} fill={casas} />)
          : null}
        {hora === "noche"
          ? Array.from({ length: 8 }).map((_, i) => <rect key={i} x={x + 20 + rr(i, 9) * (w - 40)} y={y + h * (0.55 + rr(i, 10) * 0.35)} width={10} height={14} fill={"#E8C77A"} opacity={0.8} />)
          : null}
      </g>
      <path d={`M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h * 0.33} H ${x + w}`} stroke={W.marco} strokeWidth={8} />
      <rect x={x - 26} y={y + h + 12} width={w + 52} height={16} fill={W.maderaMedia} />
      {/* cortinas recogidas */}
      <path d={`M ${x - 40} ${y - 40} L ${x + w * 0.18} ${y - 40} Q ${x + w * 0.05} ${y + h * 0.5} ${x + w * 0.12} ${y + h + 20} L ${x - 40} ${y + h + 20} Z`} fill={cortinas} />
      <path d={`M ${x + w + 40} ${y - 40} L ${x + w * 0.82} ${y - 40} Q ${x + w * 0.95} ${y + h * 0.5} ${x + w * 0.88} ${y + h + 20} L ${x + w + 40} ${y + h + 20} Z`} fill={cortinas} />
      <rect x={x - 50} y={y - 50} width={w + 100} height={14} rx={6} fill={W.laton} />
    </g>
  );
};

/** Lampara colgante con su cono de luz. */
export const Lampara: React.FC<{ x: number; y: number; largo?: number; tipo?: "tulipa" | "verde" | "bombilla" }> = ({ x, y, largo = 200, tipo = "tulipa" }) => {
  const f = useCurrentFrame();
  const vaiven = Math.sin(f * 0.04 + x) * 1.2;
  return (
    <g transform={`rotate(${vaiven} ${x} ${y - largo})`}>
      <rect x={x - 2} y={y - largo} width={4} height={largo} fill={W.hierro} />
      {tipo === "verde" ? (
        <path d={`M ${x - 50} ${y + 34} L ${x + 50} ${y + 34} L ${x + 24} ${y} L ${x - 24} ${y} Z`} fill={W.verde} />
      ) : tipo === "bombilla" ? (
        <circle cx={x} cy={y + 14} r={14} fill={"#F8E2A2"} />
      ) : (
        <path d={`M ${x - 44} ${y + 36} Q ${x} ${y - 20} ${x + 44} ${y + 36} Z`} fill={"#EADFC2"} />
      )}
      <ellipse cx={x} cy={y + 36} rx={36} ry={6} fill={"#FFE3A0"} />
      <circle cx={x} cy={y + 120} r={170} fill="url(#w-lampara)" />
    </g>
  );
};

/** Reloj de pared con agujas que se mueven. */
export const Reloj: React.FC<{ x: number; y: number; r?: number; rapido?: number }> = ({ x, y, r = 60, rapido = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 12} fill={W.madera} />
      <circle r={r} fill={"#F2ECDD"} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-1.6} y={-r + 4} width={3.2} height={r * 0.14} fill={W.tinta} transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-2.5} y={-r * 0.55} width={5} height={r * 0.6} fill={W.tinta} transform={`rotate(${100 + f * 0.05 * rapido})`} />
      <rect x={-1.6} y={-r * 0.82} width={3.2} height={r * 0.86} fill={W.tinta} transform={`rotate(${f * 0.6 * rapido})`} />
      <circle r={4} fill={W.laton} />
    </g>
  );
};

/** Rotulo de comercio con letras en Fraktur o antigua. */
export const Rotulo: React.FC<{ x: number; y: number; w: number; h?: number; texto: string; fondo?: string; letra?: string; fraktur?: boolean; tam?: number }> = ({
  x,
  y,
  w,
  h = 54,
  texto,
  fondo = W.verdeOscuro,
  letra = W.laton,
  fraktur = true,
  tam,
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={fondo} />
    <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} fill="none" stroke={letra} strokeWidth={2} opacity={0.8} />
    <text
      x={x + w / 2}
      y={y + h * 0.7}
      textAnchor="middle"
      fontFamily={fraktur ? FUENTE.fraktur : FUENTE.serif}
      fontSize={tam ?? h * 0.62}
      letterSpacing={fraktur ? 1 : 4}
      fill={letra}
    >
      {texto}
    </text>
  </g>
);

/** Columna de anuncios (Litfasssaule) con carteles. */
export const Litfass: React.FC<{ x: number; y: number; s?: number; carteles?: string[] }> = ({ x, y, s = 1, carteles = ["Theater", "Kino"] }) => {
  const tonos = ["#E8D9A8", "#C8402C", "#2E5A4E", "#E8B33C", "#EFE7D2"];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-70} y={-24} width={140} height={24} fill={W.verdeOscuro} />
      <rect x={-62} y={-400} width={124} height={376} fill={"#D9CFB4"} />
      {/* carteles */}
      {carteles.slice(0, 3).map((c, i) => {
        const fondo = tonos[i % tonos.length];
        const claro = fondo === "#C8402C" || fondo === "#2E5A4E";
        return (
          <g key={i}>
            <rect x={-60} y={-392 + i * 122} width={120} height={116} fill={fondo} />
            <rect x={-60} y={-392 + i * 122} width={30} height={116} fill={"#000"} opacity={0.08} />
            <text x={0} y={-392 + i * 122 + 50} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={c.length > 9 ? 18 : 24} fill={claro ? "#F2EBD8" : W.tinta}>
              {c}
            </text>
            <rect x={-40} y={-392 + i * 122 + 70} width={80} height={5} fill={claro ? "#F2EBD8" : W.tinta} opacity={0.5} />
            <rect x={-30} y={-392 + i * 122 + 84} width={60} height={5} fill={claro ? "#F2EBD8" : W.tinta} opacity={0.5} />
          </g>
        );
      })}
      <rect x={-62} y={-400} width={22} height={376} fill={"#000"} opacity={0.1} />
      <rect x={40} y={-400} width={22} height={376} fill={"#000"} opacity={0.14} />
      <path d="M -76 -400 Q 0 -440 76 -400 Z" fill={W.verdeOscuro} />
      <rect x={-80} y={-406} width={160} height={10} fill={W.verde} />
      <path d="M -30 -430 Q 0 -470 30 -430 Z" fill={W.verdeOscuro} />
      <circle cx={0} cy={-470} r={8} fill={W.verdeOscuro} />
    </g>
  );
};

/** Texto en lineas, para pizarras y papeles. */
export const Lineas: React.FC<{ x: number; y: number; lineas: string[]; tam: number; color: string; fuente?: string; ancla?: "start" | "middle" | "end"; inter?: number }> = ({
  x,
  y,
  lineas,
  tam,
  color,
  fuente = FUENTE.serif,
  ancla = "start",
  inter = 1.25,
}) => (
  <g>
    {lineas.map((l, i) => (
      <text key={i} x={x} y={y + i * tam * inter} fontFamily={fuente} fontSize={tam} fill={color} textAnchor={ancla}>
        {l}
      </text>
    ))}
  </g>
);

/** Suelo de interior: parquet, tablas o baldosa, con sombra junto a la pared. */
export const SueloInterior: React.FC<{ y: number; ancho?: number; tipo?: "parquet" | "tablas" | "baldosa" }> = ({ y, ancho = 1920, tipo = "parquet" }) => (
  <g>
    <rect x={-200} y={y} width={ancho + 400} height={1300 - y} fill={`url(#w-${tipo})`} />
    <rect x={-200} y={y} width={ancho + 400} height={60} fill="url(#w-sombraSuelo)" />
    <rect x={-200} y={y - 22} width={ancho + 400} height={22} fill={W.madera} />
  </g>
);
