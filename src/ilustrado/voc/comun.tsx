import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../../theme";

/**
 * Piezas comunes del video de la VOC: paleta, texturas, agua, cielo,
 * barcos de la Compania y el monograma. Los personajes van en Gente.tsx.
 */

export const C = {
  cielo1: "#DCD3BC",
  cielo2: "#F2ECDD",
  nube: "#FBF7EE",
  papel: "#F0E8D4",
  papelOscuro: "#E2D5B6",
  pergamino: "#E9DBB6",
  tinta: "#1E1A16",
  tintaSepia: "#4A3424",
  ladrillo: "#8E5A44",
  ladrilloOsc: "#734634",
  ladrilloJunta: "#6A3F2F",
  ladrilloClaro: "#A8705A",
  piedra: "#DCD2BC",
  piedraLuz: "#EAE2D0",
  piedraMedia: "#C8BDA4",
  piedraSombra: "#ADA185",
  piedraOscura: "#8C8068",
  madera: "#5C3E2C",
  maderaMedia: "#6E4B35",
  maderaLuz: "#87603F",
  maderaOsc: "#3E2A1E",
  cristal: "#3E4847",
  cristalLuz: "#7E8D86",
  agua: "#7F978F",
  aguaOsc: "#6A8079",
  aguaLuz: "#A7BAB1",
  marAbierto: "#5F7C80",
  verde: "#2E5A4E",
  verdeOsc: "#22443B",
  hoja: "#3F6B4A",
  hojaOsc: "#2C4E36",
  hojaLuz: "#5E8A5A",
  arena: "#E3D3A8",
  tierra: "#9A7650",
  carmin: "#C8402C",
  ocre: "#E8B33C",
  laton: "#C9A23A",
  naranja: "#D9772B",
  azulBandera: "#2F4A7A",
  macis: "#B8402A",
  nuez: "#7A4E2E",
  pimienta: "#3A2E26",
  lona: "#E8DFC8",
  lonaSombra: "#CFC3A6",
};

/** Ruido determinista. */
export const rnd = (i: number, k = 1) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export const osc = (hex: string, f = 0.82) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
};

/** Texturas comunes, con prefijo propio para no chocar con otros videos. */
export const Defs: React.FC = () => (
  <defs>
    <pattern id="vocLadrillo" width="40" height="20" patternUnits="userSpaceOnUse">
      <rect width="40" height="20" fill={C.ladrillo} />
      <path d="M0 10 H40 M0 0 H40 M20 0 V10 M0 10 V20 M40 10 V20" stroke={C.ladrilloJunta} strokeWidth="1.6" />
    </pattern>
    <pattern id="vocLadrilloOsc" width="40" height="20" patternUnits="userSpaceOnUse">
      <rect width="40" height="20" fill={C.ladrilloOsc} />
      <path d="M0 10 H40 M0 0 H40 M20 0 V10 M0 10 V20 M40 10 V20" stroke={"#5A3428"} strokeWidth="1.6" />
    </pattern>
    <pattern id="vocSillar" width="120" height="44" patternUnits="userSpaceOnUse">
      <rect width="120" height="44" fill={C.piedra} />
      <path d="M0 0 H120 M0 22 H120 M60 0 V22 M0 22 V44 M120 22 V44" stroke={C.piedraMedia} strokeWidth="1.6" />
    </pattern>
    <pattern id="vocAdoquin" width="36" height="18" patternUnits="userSpaceOnUse">
      <rect width="36" height="18" fill={"#7C7466"} />
      <rect x="1.5" y="1.5" width="15" height="6.5" rx="2" fill={"#948B7B"} />
      <rect x="19" y="1.5" width="15" height="6.5" rx="2" fill={"#8E8575"} />
      <rect x="-8" y="10.5" width="15" height="6.5" rx="2" fill={"#948B7B"} />
      <rect x="10" y="10.5" width="15" height="6.5" rx="2" fill={"#8A8172"} />
      <rect x="28" y="10.5" width="15" height="6.5" rx="2" fill={"#948B7B"} />
    </pattern>
    <pattern id="vocTablas" width="160" height="34" patternUnits="userSpaceOnUse">
      <rect width="160" height="34" fill={C.maderaMedia} />
      <path d="M0 0 H160 M0 17 H160 M70 0 V17 M20 17 V34 M130 17 V34" stroke={C.madera} strokeWidth="2" />
      <path d="M8 8 H50 M90 26 H120" stroke={C.maderaLuz} strokeWidth="1" opacity="0.5" />
    </pattern>
    <pattern id="vocBaldosa" width="80" height="80" patternUnits="userSpaceOnUse">
      <rect width="80" height="80" fill={"#E2D9C4"} />
      <rect width="40" height="40" fill={"#2E2A26"} />
      <rect x="40" y="40" width="40" height="40" fill={"#2E2A26"} />
    </pattern>
    <pattern id="vocLinoMantel" width="24" height="24" patternUnits="userSpaceOnUse">
      <rect width="24" height="24" fill={"#2F4A3F"} />
      <path d="M0 12 H24 M12 0 V24" stroke={"#365447"} strokeWidth="1" />
    </pattern>
    <pattern id="vocPapel" width="200" height="200" patternUnits="userSpaceOnUse">
      <rect width="200" height="200" fill={C.papel} />
      <circle cx="30" cy="40" r="1.4" fill={C.papelOscuro} />
      <circle cx="140" cy="90" r="1.1" fill={C.papelOscuro} />
      <circle cx="90" cy="160" r="1.6" fill={C.papelOscuro} />
      <path d="M0 120 Q 60 116 120 122 T 200 118" stroke={C.papelOscuro} strokeWidth="0.8" fill="none" opacity="0.6" />
    </pattern>
    <linearGradient id="vocCielo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.cielo1} />
      <stop offset="1" stopColor={C.cielo2} />
    </linearGradient>
    <linearGradient id="vocCieloTarde" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={"#C9A27E"} />
      <stop offset="1" stopColor={"#F0D7A6"} />
    </linearGradient>
    <linearGradient id="vocCieloNoche" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={"#1E2830"} />
      <stop offset="1" stopColor={"#3A4A50"} />
    </linearGradient>
    <linearGradient id="vocCieloTropico" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={"#BFD0CB"} />
      <stop offset="1" stopColor={"#F1EBD6"} />
    </linearGradient>
    <linearGradient id="vocCieloTormenta" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={"#5E6668"} />
      <stop offset="1" stopColor={"#A3A79E"} />
    </linearGradient>
    <linearGradient id="vocLuzVentana" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stopColor="#FFF3D2" stopOpacity="0.5" />
      <stop offset="1" stopColor="#FFF3D2" stopOpacity="0" />
    </linearGradient>
    <radialGradient id="vocVela" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#FFE2A0" stopOpacity="0.6" />
      <stop offset="1" stopColor="#FFE2A0" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="vocVineta" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.6" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.35" />
    </radialGradient>
  </defs>
);

/* ------------------------------------------------------------------ */
/* Cielo                                                               */
/* ------------------------------------------------------------------ */

export const CieloVoc: React.FC<{ hora?: string; tipo?: "norte" | "tropico" | "tormenta"; nubes?: number; x0?: number; ancho?: number }> = ({
  hora = "dia",
  tipo = "norte",
  nubes = 5,
  x0 = -400,
  ancho = 3600,
}) => {
  const f = useCurrentFrame();
  const id = tipo === "tormenta" ? "vocCieloTormenta" : hora === "noche" ? "vocCieloNoche" : hora === "tarde" ? "vocCieloTarde" : tipo === "tropico" ? "vocCieloTropico" : "vocCielo";
  const nube = tipo === "tormenta" ? "#7C8282" : hora === "noche" ? "#46555A" : hora === "tarde" ? "#F6E3BE" : C.nube;
  return (
    <g>
      <rect x={x0} y={-300} width={ancho} height={1500} fill={`url(#${id})`} />
      {hora === "noche"
        ? Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={x0 + rnd(i, 3) * ancho} cy={rnd(i, 4) * 420} r={1 + rnd(i, 5) * 1.6} fill="#F4EBCF" opacity={0.4 + 0.5 * Math.abs(Math.sin(f * 0.05 + i))} />
          ))
        : null}
      {Array.from({ length: nubes }).map((_, i) => {
        const span = ancho + 600;
        const x = ((rnd(i, 2) * span + f * (0.25 + rnd(i, 3) * 0.35) * (tipo === "tormenta" ? 3 : 1)) % span) + x0 - 300;
        const y = 40 + rnd(i, 4) * 260;
        const s = 0.8 + rnd(i, 5) * 1.0;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.92}>
            <rect x={0} y={22} width={240} height={34} rx={17} fill={nube} />
            <rect x={36} y={2} width={120} height={44} rx={22} fill={nube} />
            <rect x={120} y={10} width={86} height={36} rx={18} fill={nube} />
            <rect x={10} y={46} width={200} height={10} rx={5} fill={osc(nube, 0.94)} />
          </g>
        );
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Agua                                                                */
/* ------------------------------------------------------------------ */

/** Agua con olas que se mueven: canal (calma) o mar. */
export const Agua: React.FC<{ y: number; x0?: number; ancho?: number; alto?: number; color?: string; mar?: boolean; fuerza?: number }> = ({
  y,
  x0 = -400,
  ancho = 3600,
  alto = 700,
  color = C.agua,
  mar,
  fuerza = 1,
}) => {
  const f = useCurrentFrame();
  const filas = mar ? 14 : 9;
  return (
    <g>
      <rect x={x0} y={y} width={ancho} height={alto} fill={color} />
      <rect x={x0} y={y} width={ancho} height={10} fill={osc(color, 1.12)} opacity={0.6} />
      {Array.from({ length: filas }).map((_, i) => {
        const yy = y + 18 + i * (alto / filas) * (0.5 + i * 0.05);
        const paso = 70 + i * 18;
        const desp = ((f * (0.6 + rnd(i, 7)) * fuerza + rnd(i, 3) * 200) % paso) * (i % 2 ? 1 : -1);
        const n = Math.ceil(ancho / paso) + 2;
        return (
          <g key={i} opacity={0.55}>
            {Array.from({ length: n }).map((_, k) => {
              const xx = x0 + k * paso + desp + rnd(k, i + 11) * 30;
              const w = 18 + rnd(k, i + 4) * (16 + i * 3);
              return (
                <path
                  key={k}
                  d={`M ${xx} ${yy} q ${w / 2} ${-4 - i * 0.4 * fuerza} ${w} 0`}
                  stroke={k % 3 === 0 ? osc(color, 0.82) : osc(color, 1.18)}
                  strokeWidth={2 + i * 0.25}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Banderas y monograma                                                */
/* ------------------------------------------------------------------ */

/** Bandera neerlandesa del XVII (naranja, blanco, azul) que ondea. */
export const Bandera: React.FC<{ x: number; y: number; w?: number; h?: number; fase?: number; voc?: boolean; colores?: string[] }> = ({
  x,
  y,
  w = 90,
  h = 60,
  fase = 0,
  voc = true,
  colores = [C.naranja, "#F2EEE4", C.azulBandera],
}) => {
  const f = useCurrentFrame();
  const n = 6;
  const franja = (k: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const xx = (i / n) * w;
      const ond = Math.sin(f * 0.18 + fase + i * 0.9) * (i / n) * 7;
      pts.push(`${x + xx},${y + (k * h) / 3 + ond}`);
    }
    for (let i = n; i >= 0; i--) {
      const xx = (i / n) * w;
      const ond = Math.sin(f * 0.18 + fase + i * 0.9) * (i / n) * 7;
      pts.push(`${x + xx},${y + ((k + 1) * h) / 3 + ond}`);
    }
    return pts.join(" ");
  };
  const ondC = Math.sin(f * 0.18 + fase + 3 * 0.9) * 0.5 * 7;
  return (
    <g>
      {colores.map((c, k) => (
        <polygon key={k} points={franja(k)} fill={c} />
      ))}
      {voc ? (
        <text x={x + w / 2} y={y + h / 2 + ondC + h * 0.12} textAnchor="middle" fontFamily={FONT.serif} fontWeight={700} fontSize={h * 0.36} fill={C.tinta}>
          VOC
        </text>
      ) : null}
    </g>
  );
};

/**
 * Monograma de la Compania: una V grande con la O y la C sobre sus brazos, y
 * encima la letra de la camara (A de Amsterdam, E de Enkhuizen...).
 */
export const Monograma: React.FC<{ x: number; y: number; s?: number; color?: string; camara?: string }> = ({ x, y, s = 1, color = C.tinta, camara }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeLinecap="round">
    <path d="M -40 -34 L 0 40 L 40 -34" strokeWidth={9} />
    <circle cx={-26} cy={-6} r={15} strokeWidth={6} />
    <path d="M 40 -16 A 15 15 0 1 0 40 8" strokeWidth={6} />
    {camara ? (
      <text x={0} y={-44} textAnchor="middle" fontFamily={FONT.serif} fontWeight={700} fontSize={34} fill={color} stroke="none">
        {camara}
      </text>
    ) : null}
  </g>
);

/* ------------------------------------------------------------------ */
/* Barcos                                                              */
/* ------------------------------------------------------------------ */

/**
 * Retourschip de la Compania, de perfil (proa a la derecha), con tres
 * palos, velas cuadras, castillo de popa alto, portas de canon y banderas.
 * `(x, y)` es la linea de flotacion en el centro. Mide unos 900 px de eslora
 * y 820 de alto a escala 1. `velas`: "llenas" | "recogidas".
 */
export const Retourschip: React.FC<{
  x: number;
  y: number;
  s?: number;
  velas?: "llenas" | "recogidas";
  fase?: number;
  espejo?: boolean;
  balanceo?: number;
  casco?: string;
  rota?: boolean;
}> = ({ x, y, s = 1, velas = "llenas", fase = 0, espejo, balanceo = 1, casco = "#4A3322", rota }) => {
  const f = useCurrentFrame();
  const rot = Math.sin(f * 0.05 + fase) * 1.6 * balanceo;
  const dy = Math.sin(f * 0.07 + fase) * 5 * balanceo;
  const palo = (px: number, h: number, ancho: number) => (
    <g>
      <rect x={px - 6} y={-h} width={12} height={h - 60} fill={"#3A2A1E"} />
      {velas === "llenas" ? (
        <g>
          {[0, 1, 2].map((k) => {
            const top = -h + 40 + k * (h * 0.28);
            const w = ancho * (1 - k * -0.12) * (k === 0 ? 0.72 : 1);
            const vh = h * 0.24;
            const comba = 16 + Math.sin(f * 0.08 + fase + k) * 4;
            return (
              <g key={k}>
                <rect x={px - w / 2 - 8} y={top - 6} width={w + 16} height={6} fill={"#3A2A1E"} />
                <path d={`M ${px - w / 2} ${top} L ${px + w / 2} ${top} Q ${px + w / 2 + comba} ${top + vh / 2} ${px + w / 2} ${top + vh} L ${px - w / 2} ${top + vh} Q ${px - w / 2 + comba} ${top + vh / 2} ${px - w / 2} ${top} Z`} fill={C.lona} />
                <path d={`M ${px - w / 2} ${top + vh} L ${px + w / 2} ${top + vh} Q ${px + w / 2 + comba} ${top + vh / 2} ${px + w / 2} ${top} L ${px + w / 2 - 12} ${top} Q ${px + w / 2 + comba - 14} ${top + vh / 2} ${px + w / 2 - 12} ${top + vh} Z`} fill={C.lonaSombra} />
                {rota && k === 1 ? <path d={`M ${px - 20} ${top + 10} L ${px + 10} ${top + vh * 0.6} L ${px + 30} ${top + 20}`} stroke={"#8A7E66"} strokeWidth={3} fill="none" /> : null}
              </g>
            );
          })}
        </g>
      ) : (
        [0, 1, 2].map((k) => {
          const top = -h + 40 + k * (h * 0.28);
          const w = ancho * (k === 0 ? 0.72 : 1);
          return (
            <g key={k}>
              <rect x={px - w / 2} y={top - 6} width={w} height={6} fill={"#3A2A1E"} />
              <rect x={px - w / 2 + 6} y={top} width={w - 12} height={12} rx={6} fill={C.lonaSombra} />
            </g>
          );
        })
      )}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + dy}) scale(${(espejo ? -1 : 1) * s} ${s}) rotate(${rot})`}>
      {/* jarcia */}
      <g stroke={"#3A2E24"} strokeWidth={1.6} opacity={0.75}>
        <path d="M -360 -60 L -250 -600 M -300 -60 L -250 -600 M -150 -60 L -40 -760 M -60 -60 L -40 -760 M 120 -60 L 210 -640 M 200 -60 L 210 -640" />
        <path d="M -40 -760 L 210 -640 L 470 -120 M -40 -760 L -250 -600 L -430 -150" fill="none" />
      </g>
      {palo(-250, 600, 230)}
      {palo(-40, 760, 300)}
      {palo(210, 640, 260)}
      {/* baupres y cebadera */}
      <path d="M 380 -110 L 560 -230" stroke={"#3A2A1E"} strokeWidth={12} />
      {velas === "llenas" ? <path d="M 430 -170 L 520 -220 L 530 -150 L 440 -110 Z" fill={C.lona} /> : null}
      {/* casco */}
      <path d="M -460 -230 L -330 -230 L -330 -150 L 360 -120 Q 450 -130 470 -90 L 420 20 Q 0 70 -380 20 L -440 -60 Z" fill={casco} />
      <path d="M -440 -60 L 470 -90 L 455 -60 L -430 -30 Z" fill={osc(casco, 0.75)} />
      <path d="M -380 20 Q 0 70 420 20 L 410 40 Q 0 92 -370 40 Z" fill={"#2A1F18"} />
      {/* franjas y portas */}
      <path d="M -440 -110 L 420 -100" stroke={C.ocre} strokeWidth={6} opacity={0.85} />
      <path d="M -420 -10 L 440 -20" stroke={"#2E2018"} strokeWidth={5} />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={-300 + i * 76} y={-86} width={26} height={22} fill={"#1A120D"} stroke={C.carmin} strokeWidth={3} />
      ))}
      {/* castillo de popa decorado */}
      <path d="M -470 -330 L -340 -330 L -330 -230 L -460 -230 Z" fill={osc(casco, 1.1)} />
      <rect x={-464} y={-312} width={118} height={10} fill={C.ocre} opacity={0.8} />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={-450 + k * 36} y={-290} width={24} height={34} fill={"#E3C88A"} opacity={0.75} />
      ))}
      <path d="M -470 -330 Q -480 -360 -450 -360 L -350 -350 L -340 -330 Z" fill={C.laton} opacity={0.9} />
      <rect x={-330} y={-180} width={690} height={10} fill={osc(casco, 1.3)} />
      {/* farol de popa */}
      <rect x={-470} y={-392} width={20} height={32} fill={C.laton} />
      {/* banderas */}
      <rect x={-46} y={-830} width={4} height={70} fill={"#3A2A1E"} />
      <Bandera x={-42} y={-830} w={80} h={48} fase={fase} />
      <rect x={-490} y={-420} width={4} height={60} fill={"#3A2A1E"} />
      <Bandera x={-576} y={-420} w={86} h={54} fase={fase + 1} voc={false} />
      {/* gallardete */}
      <path d={`M 210 -700 L 300 ${-694 + Math.sin(f * 0.2 + fase) * 6} L 210 -688 Z`} fill={C.carmin} />
    </g>
  );
};

/** Barcaza de canal con un barquero y carga de sacos o toneles. */
export const Barcaza: React.FC<{ x0: number; y: number; v?: number; s?: number; carga?: "sacos" | "toneles" }> = ({ x0, y, v = 0.6, s = 1, carga = "sacos" }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  const dy = Math.sin(f * 0.08) * 2;
  return (
    <g transform={`translate(${x} ${y + dy}) scale(${s})`}>
      <path d="M -220 -40 L 220 -40 Q 250 -40 240 -14 L 220 10 L -210 10 Q -250 -10 -220 -40 Z" fill={"#4E3626"} />
      <path d="M -220 -40 L 220 -40 L 224 -28 L -224 -28 Z" fill={"#6E4B35"} />
      {carga === "sacos"
        ? [-140, -80, -20, 40, 100, -110, -50, 10, 70].map((sx, i) => (
            <ellipse key={i} cx={sx} cy={i < 5 ? -58 : -88} rx={34} ry={22} fill={i % 2 ? "#CDBB92" : "#D9C9A2"} stroke={"#A8956C"} strokeWidth={2} />
          ))
        : [-140, -70, 0, 70].map((sx, i) => (
            <g key={i}>
              <rect x={sx - 28} y={-104} width={56} height={66} rx={10} fill={"#7A5A3C"} />
              <rect x={sx - 28} y={-92} width={56} height={6} fill={"#3A2E24"} />
              <rect x={sx - 28} y={-58} width={56} height={6} fill={"#3A2E24"} />
            </g>
          ))}
      {/* barquero con percha */}
      <g transform="translate(180 -40)">
        <rect x={-12} y={-120} width={24} height={80} fill={"#3B3A44"} />
        <rect x={-14} y={-50} width={28} height={50} fill={"#2C2A28"} />
        <circle cx={0} cy={-138} r={18} fill={"#D6A47E"} />
        <path d="M -20 -146 Q 0 -170 20 -146 Z" fill={C.carmin} />
        <path d={`M ${10} -110 L ${-60 + Math.sin(f * 0.05) * 20} 40`} stroke={"#5C3E2C"} strokeWidth={6} />
      </g>
    </g>
  );
};

/** Gaviota que planea. */
export const Gaviotas: React.FC<{ n?: number; x0?: number; y0?: number; ancho?: number }> = ({ n = 4, x0 = 0, y0 = 120, ancho = 1920 }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const x = x0 + ((rnd(i, 6) * ancho + f * (1.2 + rnd(i, 7))) % (ancho + 200)) - 100;
        const y = y0 + rnd(i, 8) * 200 + Math.sin(f * 0.04 + i) * 14;
        const a = Math.sin(f * 0.25 + i * 2) * 8;
        return (
          <path key={i} d={`M ${x - 22} ${y + a} Q ${x - 10} ${y - 8} ${x} ${y} Q ${x + 10} ${y - 8} ${x + 22} ${y + a}`} fill="none" stroke={"#3E4446"} strokeWidth={3} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

/** Humo que sube (chimenea, pipa, hoguera). */
export const Humo: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#CFC8BA" }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: 6 }).map((_, i) => {
        const t = ((f * 0.6 + i * 22) % 132) / 132;
        return (
          <circle key={i} cx={x + Math.sin(t * 6 + i) * 14 * s + t * 40 * s} cy={y - t * 180 * s} r={(10 + t * 30) * s} fill={color} opacity={(1 - t) * 0.45} />
        );
      })}
    </g>
  );
};

/** Texto manuscrito: serif cursiva con tinta sepia. */
export const Manuscrito: React.FC<{ x: number; y: number; t: string; size?: number; color?: string; anchor?: "start" | "middle" | "end"; peso?: number }> = ({
  x,
  y,
  t,
  size = 28,
  color = C.tintaSepia,
  anchor = "start",
  peso = 400,
}) => (
  <text x={x} y={y} fontFamily={FONT.serif} fontStyle="italic" fontWeight={peso} fontSize={size} fill={color} textAnchor={anchor}>
    {t}
  </text>
);
