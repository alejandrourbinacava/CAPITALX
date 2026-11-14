import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../theme";

/**
 * Piezas de ilustracion plana para el piloto de montaje ilustrado.
 *
 * Todo es SVG dibujado a mano en codigo: nada de imagenes. Las figuras son
 * siluetas planas sin cara (no queremos caricaturas de personas reales) y la
 * paleta es la del canal rebajada para que el dibujo no compita con los
 * rotulos.
 */

export const P = {
  cieloAlto: "#E4D8BF",
  cieloBajo: "#F3ECDC",
  nube: "#FBF7EE",
  piedra: "#D8CDB6",
  piedraLuz: "#E6DCC7",
  piedraSombra: "#B9AC91",
  piedraOscura: "#8F8369",
  ladrillo: "#A88E77",
  ladrilloOscuro: "#8A735F",
  ventana: "#39403F",
  ventanaLuz: "#E9C77A",
  acera: "#C9BEA6",
  calzada: "#8E8878",
  calzadaLinea: "#A49E8D",
  tinta: "#14181A",
  carmin: "#C8402C",
  ocre: "#E8B33C",
  verde: "#2E5A4E",
  verdeOscuro: "#22443B",
  mar: "#AFC2BC",
  marOscuro: "#9AB0A9",
  tierra: "#E6DBC3",
  costa: "#C9BA98",
  madera: "#5A3F2E",
  maderaLuz: "#76563F",
  piel: "#D9AE8A",
  abrigos: ["#2B3236", "#4A3F35", "#5C6B66", "#3B3A44", "#6B5A48"],
};

/** Ruido determinista. */
export const r = (i: number, k = 1) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export const suave = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

/* ------------------------------------------------------------------ */
/* Cielo y nubes                                                       */
/* ------------------------------------------------------------------ */

export const Cielo: React.FC<{ alto?: string; bajo?: string; nubes?: number }> = ({
  alto = P.cieloAlto,
  bajo = P.cieloBajo,
  nubes = 4,
}) => {
  const f = useCurrentFrame();
  return (
    <g>
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={alto} />
          <stop offset="1" stopColor={bajo} />
        </linearGradient>
      </defs>
      <rect x={-400} y={0} width={2720} height={1080} fill="url(#cielo)" />
      {Array.from({ length: nubes }).map((_, i) => {
        const x = ((r(i, 2) * 2400 + f * (0.25 + r(i, 3) * 0.35)) % 2600) - 400;
        const y = 70 + r(i, 4) * 210;
        const s = 0.7 + r(i, 5) * 0.8;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
            <rect x={0} y={20} width={220} height={36} rx={18} fill={P.nube} />
            <rect x={40} y={0} width={110} height={44} rx={22} fill={P.nube} />
            <rect x={110} y={10} width={80} height={36} rx={18} fill={P.nube} />
          </g>
        );
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Edificios                                                           */
/* ------------------------------------------------------------------ */

/** Fila de casas victorianas de fondo, en una sola tinta. */
export const FilaFondo: React.FC<{ y: number; color?: string; semilla?: number; ancho?: number }> = ({
  y,
  color = P.piedraSombra,
  semilla = 1,
  ancho = 2700,
}) => {
  const casas: React.ReactNode[] = [];
  let x = -400;
  let i = 0;
  while (x < ancho) {
    const w = 140 + r(i, semilla) * 160;
    const h = 260 + r(i, semilla + 1) * 260;
    casas.push(
      <g key={i}>
        <rect x={x} y={y - h} width={w} height={h} fill={color} />
        {r(i, semilla + 2) > 0.5 ? (
          <polygon points={`${x},${y - h} ${x + w / 2},${y - h - 50} ${x + w},${y - h}`} fill={color} />
        ) : (
          <rect x={x + w * 0.2} y={y - h - 40} width={24} height={40} fill={color} />
        )}
      </g>
    );
    x += w + 6;
    i++;
  }
  return <g>{casas}</g>;
};

/** Edificio de oficinas de la City, con ventanas. */
export const Oficinas: React.FC<{ x: number; y: number; w: number; h: number; tono?: string; semilla?: number }> = ({
  x,
  y,
  w,
  h,
  tono = P.ladrillo,
  semilla = 3,
}) => {
  const cols = Math.max(2, Math.floor(w / 70));
  const filas = Math.max(2, Math.floor((h - 60) / 95));
  const ventanas: React.ReactNode[] = [];
  for (let c = 0; c < cols; c++)
    for (let fl = 0; fl < filas; fl++) {
      const vx = x + 24 + c * ((w - 48) / cols);
      const vy = y - h + 50 + fl * 95;
      ventanas.push(
        <rect key={`${c}-${fl}`} x={vx} y={vy} width={(w - 48) / cols - 22} height={58} fill={P.ventana} opacity={0.85} />
      );
    }
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={tono} />
      <rect x={x - 8} y={y - h - 16} width={w + 16} height={18} fill={P.ladrilloOscuro} />
      {ventanas}
      <rect x={x} y={y - 18} width={w} height={18} fill={P.ladrilloOscuro} />
    </g>
  );
};

/**
 * Fachada clasica: frontis con columnas, como la Bolsa de Nueva York o el
 * Banco de Inglaterra. Las puertas se cierran con `cierre` de 0 a 1.
 */
export const Templo: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  columnas?: number;
  frontis?: boolean;
  cierre?: number;
  rotulo?: string;
}> = ({ x, y, w, h, columnas = 6, frontis = true, cierre = 0, rotulo }) => {
  const zocalo = 70;
  const cornisa = 60;
  const base = y - zocalo;
  const altoCol = h - zocalo - cornisa;
  const paso = (w - 120) / (columnas - 1);
  const anchoCol = Math.min(56, paso * 0.42);
  const puertaW = Math.min(150, paso * 0.7);
  const puertaH = altoCol * 0.55;
  const cols: React.ReactNode[] = [];
  for (let i = 0; i < columnas; i++) {
    const cx = x + 60 + i * paso;
    cols.push(
      <g key={i}>
        <rect x={cx - anchoCol / 2} y={base - altoCol} width={anchoCol} height={altoCol} fill={P.piedraLuz} />
        <rect x={cx - anchoCol / 2} y={base - altoCol} width={anchoCol * 0.28} height={altoCol} fill={P.piedra} />
        <rect x={cx - anchoCol / 2 - 10} y={base - altoCol - 18} width={anchoCol + 20} height={18} fill={P.piedra} />
        <rect x={cx - anchoCol / 2 - 8} y={base - 14} width={anchoCol + 16} height={14} fill={P.piedra} />
      </g>
    );
  }
  const puertas: React.ReactNode[] = [];
  for (let i = 0; i < columnas - 1; i++) {
    if (i % 2 === 1 && columnas > 4) continue;
    const px = x + 60 + i * paso + paso / 2 - puertaW / 2;
    const py = base - puertaH;
    const hoja = (puertaW / 2) * (0.12 + 0.88 * cierre);
    puertas.push(
      <g key={i}>
        <rect x={px} y={py} width={puertaW} height={puertaH} fill={P.ventana} />
        <rect x={px} y={py} width={hoja} height={puertaH} fill={P.verdeOscuro} />
        <rect x={px + puertaW - hoja} y={py} width={hoja} height={puertaH} fill={P.verdeOscuro} />
        <rect x={px - 10} y={py - 12} width={puertaW + 20} height={12} fill={P.piedraSombra} />
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={base - altoCol - 20} width={w} height={altoCol + 20} fill={P.piedraSombra} />
      {puertas}
      {cols}
      <rect x={x - 20} y={base - altoCol - 18 - cornisa} width={w + 40} height={cornisa} fill={P.piedra} />
      <rect x={x - 30} y={base - altoCol - 18 - cornisa - 14} width={w + 60} height={16} fill={P.piedraOscura} />
      {rotulo ? (
        <text
          x={x + w / 2}
          y={base - altoCol - 18 - cornisa / 2 + 10}
          textAnchor="middle"
          fontFamily={FONT.serif}
          fontSize={30}
          letterSpacing={6}
          fill={P.piedraOscura}
        >
          {rotulo}
        </text>
      ) : null}
      {frontis ? (
        <polygon
          points={`${x - 30},${base - altoCol - 18 - cornisa - 14} ${x + w / 2},${base - altoCol - 18 - cornisa - 150} ${
            x + w + 30
          },${base - altoCol - 18 - cornisa - 14}`}
          fill={P.piedra}
          stroke={P.piedraOscura}
          strokeWidth={10}
        />
      ) : null}
      <rect x={x - 40} y={base} width={w + 80} height={zocalo} fill={P.piedraOscura} />
      <rect x={x - 60} y={base + zocalo - 22} width={w + 120} height={22} fill={P.piedraSombra} />
    </g>
  );
};

/** Muro ciego con hornacinas: el Banco de Inglaterra de Soane. */
export const MuroBanco: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const paso = 150;
  const n = Math.floor(w / paso);
  const piezas: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const cx = x + 40 + i * paso;
    piezas.push(
      <g key={i}>
        <rect x={cx} y={y - h + 70} width={36} height={h - 120} fill={P.piedraLuz} />
        <rect x={cx + 58} y={y - h * 0.62} width={54} height={h * 0.36} rx={27} fill={P.piedraSombra} />
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={P.piedra} />
      {piezas}
      <rect x={x - 12} y={y - h - 10} width={w + 24} height={36} fill={P.piedraSombra} />
      <rect x={x - 12} y={y - h - 22} width={w + 24} height={14} fill={P.piedraOscura} />
      <rect x={x} y={y - 40} width={w} height={40} fill={P.piedraSombra} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Calle                                                               */
/* ------------------------------------------------------------------ */

export const Calle: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={-400} y={y} width={2720} height={60} fill={P.acera} />
    <rect x={-400} y={y + 60} width={2720} height={1080 - y - 60} fill={P.calzada} />
    {Array.from({ length: 30 }).map((_, i) => (
      <rect key={i} x={-400 + i * 110} y={y + 60 + (1080 - y - 60) / 2} width={60} height={8} fill={P.calzadaLinea} />
    ))}
    <rect x={-400} y={y + 54} width={2720} height={8} fill={P.piedraOscura} />
  </g>
);

export const Farola: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 5} y={y - 250} width={10} height={250} fill={P.tinta} />
    <rect x={x - 18} y={y - 290} width={36} height={44} fill={P.tinta} />
    <rect x={x - 12} y={y - 284} width={24} height={32} fill={P.ventanaLuz} opacity={0.75} />
    <polygon points={`${x - 22},${y - 290} ${x},${y - 312} ${x + 22},${y - 290}`} fill={P.tinta} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Gente y vehiculos                                                   */
/* ------------------------------------------------------------------ */

type Sombrero = "bombin" | "chistera" | "gorra";

/**
 * Peaton plano. `x` en el instante 0 y velocidad en px por fotograma: anda
 * solo. Si la velocidad es 0 se queda quieto con un leve vaiven.
 */
export const Peaton: React.FC<{
  x: number;
  y: number;
  v?: number;
  escala?: number;
  semilla?: number;
  sombrero?: Sombrero;
  periodico?: boolean;
}> = ({ x, y, v = 0, escala = 1, semilla = 1, sombrero, periodico }) => {
  const f = useCurrentFrame();
  const abrigo = P.abrigos[Math.floor(r(semilla, 7) * P.abrigos.length)];
  const som: Sombrero = sombrero ?? (["bombin", "chistera", "gorra"] as Sombrero[])[Math.floor(r(semilla, 8) * 3)];
  const fase = r(semilla, 9) * 6.28;
  const anda = v !== 0;
  const paso = anda ? Math.sin(f * 0.32 + fase) : 0;
  const bote = anda ? Math.abs(Math.cos(f * 0.32 + fase)) * 3 : Math.sin(f * 0.05 + fase) * 1.2;
  const px = x + v * f;
  const dir = v < 0 ? -1 : 1;
  return (
    <g transform={`translate(${px} ${y - bote}) scale(${escala * dir} ${escala})`}>
      {/* piernas */}
      <g transform={`rotate(${paso * 22} 0 -78)`}>
        <rect x={-7} y={-80} width={13} height={80} fill={P.tinta} />
        <rect x={-7} y={-6} width={22} height={7} rx={3} fill={P.tinta} />
      </g>
      <g transform={`rotate(${-paso * 22} 0 -78)`}>
        <rect x={-7} y={-80} width={13} height={80} fill={"#22282A"} />
        <rect x={-7} y={-6} width={22} height={7} rx={3} fill={"#22282A"} />
      </g>
      {/* abrigo */}
      <path d="M -24 -160 Q 0 -172 24 -160 L 30 -66 L -30 -66 Z" fill={abrigo} />
      {/* brazo */}
      <g transform={`rotate(${-paso * 18} 0 -150)`}>
        <rect x={-6} y={-152} width={12} height={70} rx={6} fill={abrigo} />
        {periodico ? <rect x={-2} y={-96} width={30} height={22} fill={"#EFE8D6"} /> : null}
      </g>
      {/* cabeza */}
      <circle cx={0} cy={-184} r={17} fill={P.piel} />
      {som === "bombin" ? (
        <g>
          <ellipse cx={0} cy={-196} rx={24} ry={5} fill={P.tinta} />
          <path d="M -15 -196 Q -15 -218 0 -218 Q 15 -218 15 -196 Z" fill={P.tinta} />
        </g>
      ) : som === "chistera" ? (
        <g>
          <ellipse cx={0} cy={-197} rx={24} ry={5} fill={P.tinta} />
          <rect x={-14} y={-236} width={28} height={40} fill={P.tinta} />
        </g>
      ) : (
        <path d="M -18 -194 Q -12 -212 8 -210 L 24 -198 L -18 -194 Z" fill={"#4A4237"} />
      )}
    </g>
  );
};

/** Omnibus de dos pisos de 1914, de perfil. */
export const Omnibus: React.FC<{ x: number; y: number; v: number; escala?: number }> = ({ x, y, v, escala = 1 }) => {
  const f = useCurrentFrame();
  const px = x + v * f;
  const giro = (f * v * 2.2) % 360;
  const rueda = (cx: number) => (
    <g transform={`translate(${cx} -38) rotate(${giro})`}>
      <circle r={38} fill={P.tinta} />
      <circle r={24} fill={"#6B6458"} />
      {[0, 45, 90, 135].map((a) => (
        <rect key={a} x={-2} y={-24} width={4} height={48} fill={P.tinta} transform={`rotate(${a})`} />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${px} ${y}) scale(${escala})`}>
      <rect x={-10} y={-210} width={420} height={150} rx={10} fill={P.carmin} />
      <rect x={0} y={-198} width={390} height={22} fill={"#EFE3C4"} />
      <text x={195} y={-181} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={17} fill={P.carmin} letterSpacing={3}>
        GENERAL
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={30 + i * 70} y={-160} width={54} height={52} fill={P.ventana} />
      ))}
      {/* piso de arriba descubierto */}
      <rect x={-10} y={-262} width={420} height={12} fill={P.carmin} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={0 + i * 72} y={-300} width={6} height={40} fill={P.tinta} />
      ))}
      <rect x={-10} y={-304} width={420} height={6} fill={P.tinta} />
      {[0, 1, 2].map((i) => (
        <Peaton key={i} x={60 + i * 120} y={-250} escala={0.42} semilla={40 + i} />
      ))}
      {/* escalera trasera */}
      <path d="M -10 -60 L -40 -60 L -40 -262 L -10 -262" fill="none" stroke={P.tinta} strokeWidth={6} />
      <rect x={340} y={-250} width={70} height={40} fill={P.carmin} />
      {rueda(70)}
      {rueda(330)}
    </g>
  );
};

/** Coche de punto (cab) con caballo. */
export const Cab: React.FC<{ x: number; y: number; v: number; escala?: number }> = ({ x, y, v, escala = 1 }) => {
  const f = useCurrentFrame();
  const px = x + v * f;
  const trote = Math.sin(f * 0.45);
  const giro = (f * v * 2.6) % 360;
  return (
    <g transform={`translate(${px} ${y}) scale(${escala * (v < 0 ? -1 : 1)} ${escala})`}>
      {/* caballo */}
      <g transform={`translate(250 ${-Math.abs(trote) * 4})`}>
        <rect x={0} y={-160} width={150} height={70} rx={32} fill={"#4B3628"} />
        <path d="M 128 -152 L 168 -214 L 192 -204 L 158 -132 Z" fill={"#4B3628"} />
        <rect x={168} y={-222} width={40} height={30} rx={12} fill={"#4B3628"} />
        <path d="M 4 -146 Q -26 -130 -18 -96" fill="none" stroke={"#3A2A1F"} strokeWidth={10} strokeLinecap="round" />
        {[14, 44, 104, 132].map((lx, i) => (
          <rect
            key={lx}
            x={lx}
            y={-96}
            width={13}
            height={78}
            rx={5}
            fill={"#3A2A1F"}
            transform={`rotate(${(i % 2 === 0 ? 1 : -1) * trote * 16} ${lx + 6} -96)`}
          />
        ))}
      </g>
      {/* coche */}
      <rect x={20} y={-210} width={170} height={120} rx={12} fill={P.verdeOscuro} />
      <rect x={40} y={-196} width={70} height={56} fill={P.ventana} />
      <rect x={180} y={-130} width={90} height={8} fill={P.tinta} />
      <Peaton x={150} y={-208} escala={0.5} semilla={77} sombrero="chistera" />
      <g transform={`translate(110 -50) rotate(${giro})`}>
        <circle r={52} fill="none" stroke={P.tinta} strokeWidth={8} />
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <rect key={a} x={-2} y={-50} width={4} height={100} fill={P.tinta} transform={`rotate(${a})`} />
        ))}
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Rotulos                                                             */
/* ------------------------------------------------------------------ */

/** El rotulo de lugar y fecha de abajo a la izquierda, con su reloj. */
export const LugarFecha: React.FC<{ lugar: string; fecha: string; desde?: number }> = ({ lugar, fecha, desde = 8 }) => {
  const f = useCurrentFrame();
  const t = suave((f - desde) / 14);
  const aguja = f * 3;
  return (
    <g transform={`translate(${70 - (1 - t) * 40} 950)`} opacity={t}>
      <circle cx={34} cy={0} r={30} fill={P.nube} stroke={P.tinta} strokeWidth={5} />
      <rect x={32} y={-22} width={4} height={24} fill={P.tinta} transform={`rotate(${aguja} 34 0)`} />
      <rect x={32} y={-14} width={4} height={16} fill={P.carmin} transform={`rotate(${aguja / 12} 34 0)`} />
      <text x={84} y={-6} fontFamily={FONT.sans} fontWeight={700} fontSize={38} letterSpacing={2} fill={P.nube} stroke={P.tinta} strokeWidth={5} paintOrder="stroke">
        {lugar.toUpperCase()}
      </text>
      <text x={86} y={30} fontFamily={FONT.sans} fontWeight={600} fontSize={24} letterSpacing={3} fill={P.ocre} stroke={P.tinta} strokeWidth={4} paintOrder="stroke">
        {fecha.toUpperCase()}
      </text>
    </g>
  );
};

/** Sello que cae sobre la escena ("CERRADA"). */
export const Sello: React.FC<{ texto: string; sub?: string; x: number; y: number; desde: number; giro?: number }> = ({
  texto,
  sub,
  x,
  y,
  desde,
  giro = -8,
}) => {
  const f = useCurrentFrame();
  const t = f - desde;
  if (t < 0) return null;
  const s = interpolate(t, [0, 6, 10], [2.2, 0.94, 1], { extrapolateRight: "clamp" });
  const o = interpolate(t, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${s})`} opacity={o}>
      <rect x={-300} y={-80} width={600} height={sub ? 170 : 130} rx={10} fill="none" stroke={P.carmin} strokeWidth={10} />
      <text x={0} y={18} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={92} letterSpacing={10} fill={P.carmin}>
        {texto}
      </text>
      {sub ? (
        <text x={0} y={70} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={30} letterSpacing={3} fill={P.carmin}>
          {sub}
        </text>
      ) : null}
    </g>
  );
};

/** Lienzo SVG con camara: `pan` desplaza la escena en x a lo largo de la escena. */
export const Lienzo: React.FC<{ children: React.ReactNode; fondo?: string }> = ({ children, fondo = P.cieloBajo }) => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0, background: fondo }}>
    {children}
  </svg>
);

/** Capa con parallax: se mueve `recorrido` px a lo largo de la escena. */
export const Capa: React.FC<{ recorrido: number; dur: number; children: React.ReactNode; zoom?: number }> = ({ recorrido, dur, children, zoom = 0 }) => {
  const f = useCurrentFrame();
  const t = f / Math.max(1, dur);
  const s = 1 + zoom * t;
  return <g transform={`translate(${960 - recorrido * t} 540) scale(${s}) translate(-960 -540)`}>{children}</g>;
};
