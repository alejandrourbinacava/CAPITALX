import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";

/**
 * Biblioteca de objetos recortados.
 *
 * Cada uno es una silueta de tinta sobre una mancha ocre, con una copia plana
 * en carmin desplazada por detras. Es el mecanismo del canal aplicado a cosas
 * en vez de a personas: la sombra entra despues del objeto, nunca a la vez.
 */

type Props = { children: React.ReactNode; sx?: number; sy?: number };

/** Envuelve una silueta y le pone la sombra plana desplazada. */
const ConSombra: React.FC<Props> = ({ children, sx = 22, sy = 22 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: frame - 4, fps, config: { damping: 18, mass: 0.6, stiffness: 150 } });
  return (
    <>
      <g fill={C.carmin} transform={`translate(${sx * k} ${sy * k})`} opacity={k}>
        {children}
      </g>
      <g fill={C.ink}>{children}</g>
    </>
  );
};

const Mancha: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame, fps, config: { damping: 200, mass: 0.6 } });
  return <circle cx={cx} cy={cy} r={r * k} fill={C.ocre} />;
};

/* ---------- siluetas ---------- */

const contable = (
  <>
    <path d="M760 300 C760 250 800 214 860 214 C920 214 960 250 960 300 C960 344 936 380 900 392 L900 420 L820 420 L820 392 C784 380 760 344 760 300 Z" />
    <path d="M700 760 C700 560 760 470 830 448 L890 448 C960 470 1020 560 1020 760 Z" />
    <rect x="1030" y="470" width="230" height="170" rx="8" />
    <rect x="1060" y="440" width="170" height="34" rx="6" />
    <rect x="990" y="520" width="70" height="34" />
  </>
);

const carpeta = (
  <>
    <path d="M560 420 L820 420 L860 470 L1360 470 L1360 760 L560 760 Z" />
    <rect x="600" y="360" width="300" height="70" rx="8" />
    <rect x="1180" y="300" width="200" height="150" rx="10" />
    <path d="M1080 380 L1160 380 L1160 350 L1220 400 L1160 450 L1160 420 L1080 420 Z" />
  </>
);

const sala = (
  <>
    <ellipse cx="960" cy="600" rx="420" ry="110" />
    <rect x="540" y="600" width="840" height="26" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={620 + i * 170} y={430} width={90} height={130} rx={12} />
    ))}
    <rect x="500" y="200" width="920" height="150" rx="10" />
    <rect x="540" y="240" width="840" height="70" fill={C.paper} />
  </>
);

const grua = (
  <>
    <rect x="880" y="240" width="42" height="560" />
    <rect x="480" y="230" width="900" height="34" />
    <path d="M901 240 L780 130 L1030 130 Z" />
    <rect x="600" y="264" width="14" height="200" />
    <rect x="540" y="464" width="134" height="90" rx="8" />
    <rect x="760" y="800" width="400" height="34" />
    <rect x="1180" y="600" width="180" height="234" />
    <rect x="1220" y="640" width="40" height="46" fill={C.paper} />
    <rect x="1290" y="640" width="40" height="46" fill={C.paper} />
  </>
);

const habitacion = (
  <>
    <path d="M560 400 L960 210 L1360 400 L1360 800 L560 800 Z" />
    <rect x="640" y="500" width="360" height="230" rx="10" fill={C.paper} />
    <rect x="660" y="520" width="320" height="70" />
    <rect x="1080" y="560" width="200" height="170" rx="8" fill={C.paper} />
    <rect x="1100" y="590" width="160" height="14" />
    <rect x="1100" y="626" width="120" height="14" />
  </>
);

const carta = (
  <>
    <rect x="540" y="260" width="840" height="540" rx="8" />
    <rect x="600" y="330" width="720" height="410" fill={C.paper} />
    <rect x="640" y="380" width="420" height="26" />
    <rect x="640" y="450" width="640" height="16" />
    <rect x="640" y="496" width="600" height="16" />
    <rect x="640" y="542" width="560" height="16" />
    <rect x="640" y="606" width="300" height="46" />
    <circle cx="1220" cy="650" r="66" />
    <circle cx="1220" cy="650" r="48" fill={C.paper} />
  </>
);

const balanza = (
  <>
    <rect x="944" y="250" width="32" height="470" />
    <rect x="800" y="720" width="320" height="34" />
    <rect x="560" y="290" width="800" height="20" />
    <rect x="580" y="310" width="14" height="120" />
    <rect x="1326" y="310" width="14" height="80" />
    <path d="M460 430 L720 430 L660 540 L520 540 Z" />
    <path d="M1200 390 L1460 390 L1400 500 L1260 500 Z" />
    <rect x="520" y="330" width="140" height="90" rx="6" fill={C.paper} />
    <rect x="540" y="352" width="100" height="12" />
    <rect x="540" y="378" width="70" height="12" />
  </>
);

const aeropuerto = (
  <>
    {[0, 1, 2, 3].map((i) => {
      const x = 470 + i * 260;
      const s = 1 - i * 0.06;
      return (
        <g key={i} transform={`translate(${x} ${790}) scale(${s})`}>
          <circle cx="0" cy="-330" r="52" />
          <path d="M-84 0 C-84 -190 -56 -246 -22 -260 L22 -260 C56 -246 84 -190 84 0 Z" />
          <rect x="90" y="-150" width="130" height="150" rx="10" />
          <rect x="132" y="-176" width="46" height="30" rx="6" />
        </g>
      );
    })}
    <rect x="300" y="790" width="1320" height="20" />
  </>
);

const plano = (
  <>
    <rect x="440" y="250" width="1040" height="560" rx="10" />
    <rect x="490" y="300" width="940" height="460" fill={C.paper} />
    <rect x="540" y="350" width="300" height="200" />
    <rect x="880" y="350" width="200" height="120" />
    <rect x="880" y="510" width="500" height="90" />
    <rect x="540" y="600" width="300" height="120" />
    <rect x="1120" y="350" width="260" height="120" />
  </>
);

const interrogante = (
  <>
    <path d="M860 300 C860 236 906 196 968 196 C1032 196 1078 238 1078 300 C1078 356 1042 380 1002 408 C972 430 962 448 962 486 L890 486 C890 424 906 396 946 366 C978 342 998 328 998 300 C998 274 984 260 962 260 C938 260 924 278 924 306 Z" />
    <rect x="890" y="530" width="72" height="72" rx="10" />
  </>
);

const dosIrlandas = (
  <>
    <path d="M300 380 L470 300 L620 400 L760 340 L880 430 L910 620 L780 720 L620 690 L520 800 L360 760 L280 620 Z" />
    <path d="M1040 380 L1210 300 L1360 400 L1500 340 L1620 430 L1650 620 L1520 720 L1360 690 L1260 800 L1100 760 L1020 620 Z" />
  </>
);

const dosEpocas = (
  <>
    <rect x="240" y="330" width="620" height="420" rx="10" />
    <rect x="280" y="380" width="540" height="330" fill={C.paper} />
    <rect x="1060" y="330" width="620" height="420" rx="10" />
    <rect x="1100" y="380" width="540" height="330" fill={C.paper} />
    <rect x="944" y="300" width="32" height="480" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <circle cx={380 + i * 150} cy={520} r="34" />
        <path d={`M${346 + i * 150} 700 C${346 + i * 150} 600 ${360 + i * 150} 566 ${380 + i * 150} 560 C${400 + i * 150} 566 ${414 + i * 150} 600 ${414 + i * 150} 700 Z`} />
      </g>
    ))}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <circle cx={1200 + i * 150} cy={520} r="34" />
        <path d={`M${1166 + i * 150} 700 C${1166 + i * 150} 600 ${1180 + i * 150} 566 ${1200 + i * 150} 560 C${1220 + i * 150} 566 ${1234 + i * 150} 600 ${1234 + i * 150} 700 Z`} />
      </g>
    ))}
  </>
);


const villa = (
  <>
    <path d="M420 470 L760 300 L1100 470 L1100 780 L420 780 Z" />
    <rect x="1100" y="560" width="360" height="220" />
    <path d="M1080 570 L1280 460 L1480 570 Z" />
    <rect x="520" y="560" width="130" height="150" fill={C.paper} />
    <rect x="700" y="560" width="130" height="150" fill={C.paper} />
    <rect x="880" y="600" width="120" height="180" fill={C.paper} />
    <rect x="1150" y="620" width="90" height="90" fill={C.paper} />
    <rect x="1310" y="620" width="90" height="90" fill={C.paper} />
    <rect x="400" y="780" width="1120" height="26" />
    {/* terraza y balaustrada: lo que separa una villa de una casa */}
    <rect x="400" y="694" width="1140" height="16" />
  </>
);

/** Fondos: van detrás de la mancha y no llevan sombra. */
const FONDOS: Record<string, React.ReactNode> = {
  villa: (
    <g fill={C.ink} opacity="0.16">
      <path d="M120 520 L360 180 L540 420 L700 240 L940 520 Z" />
      <path d="M760 520 L980 260 L1180 520 Z" />
    </g>
  ),
};

const fabrica = (
  <>
    <rect x="440" y="440" width="560" height="340" />
    <path d="M1000 560 L1180 460 L1180 780 L1000 780 Z" />
    <path d="M1180 560 L1360 460 L1360 780 L1180 780 Z" />
    <rect x="520" y="240" width="80" height="200" />
    <rect x="500" y="210" width="120" height="40" />
    <rect x="500" y="510" width="90" height="90" fill={C.paper} />
    <rect x="640" y="510" width="90" height="90" fill={C.paper} />
    <rect x="780" y="510" width="90" height="90" fill={C.paper} />
    <rect x="500" y="650" width="90" height="90" fill={C.paper} />
    <rect x="640" y="650" width="90" height="90" fill={C.paper} />
    <rect x="780" y="650" width="90" height="90" fill={C.paper} />
    <rect x="400" y="780" width="1000" height="26" />
  </>
);

const casa = (
  <>
    <path d="M600 480 L960 260 L1320 480 L1320 780 L600 780 Z" />
    <rect x="690" y="560" width="150" height="150" fill={C.paper} />
    <rect x="1080" y="560" width="150" height="150" fill={C.paper} />
    <rect x="890" y="620" width="140" height="160" fill={C.paper} />
    <circle cx="1000" cy="700" r="10" />
    <rect x="1180" y="300" width="70" height="140" />
    <rect x="560" y="780" width="800" height="26" />
  </>
);

const maletero = (
  <>
    <circle cx="820" cy="230" r="66" />
    <path d="M700 700 C700 460 738 396 782 380 L858 380 C902 396 940 460 940 700 Z" />
    <rect x="946" y="470" width="42" height="230" />
    <rect x="946" y="440" width="230" height="40" rx="8" />
    <rect x="1000" y="480" width="260" height="230" rx="12" />
    <rect x="1090" y="440" width="80" height="46" rx="8" />
    <rect x="1040" y="540" width="180" height="16" fill={C.paper} />
    <rect x="1040" y="600" width="180" height="16" fill={C.paper} />
    <rect x="620" y="700" width="700" height="24" />
  </>
);

const SILUETAS: Record<string, React.ReactNode> = {
  villa,
  fabrica,
  casa,
  maletero,
  contable,
  carpeta,
  sala,
  grua,
  habitacion,
  carta,
  balanza,
  aeropuerto,
  plano,
  interrogante,
  dosIrlandas,
  dosEpocas,
};

const MANCHA: Record<string, { cx: number; cy: number; r: number }> = {
  villa: { cx: 900, cy: 500, r: 350 },
  fabrica: { cx: 860, cy: 490, r: 340 },
  casa: { cx: 960, cy: 500, r: 330 },
  maletero: { cx: 880, cy: 460, r: 330 },
  contable: { cx: 880, cy: 480, r: 330 },
  carpeta: { cx: 960, cy: 540, r: 300 },
  sala: { cx: 960, cy: 500, r: 340 },
  grua: { cx: 900, cy: 460, r: 330 },
  habitacion: { cx: 960, cy: 520, r: 320 },
  carta: { cx: 960, cy: 520, r: 320 },
  balanza: { cx: 960, cy: 470, r: 330 },
  aeropuerto: { cx: 880, cy: 500, r: 340 },
  plano: { cx: 960, cy: 520, r: 330 },
  interrogante: { cx: 968, cy: 390, r: 250 },
  dosIrlandas: { cx: 960, cy: 540, r: 0 },
  dosEpocas: { cx: 960, cy: 540, r: 0 },
};

export const Objeto: React.FC<{ nombre: string }> = ({ nombre }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const flota = Math.sin((frame / Math.max(durationInFrames, 1)) * Math.PI * 2) * 6;

  const silueta = SILUETAS[nombre];
  if (!silueta) return null;
  const m = MANCHA[nombre] ?? { cx: 960, cy: 520, r: 320 };

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
      {FONDOS[nombre] ?? null}
      {m.r > 0 ? <Mancha cx={m.cx} cy={m.cy} r={m.r} /> : null}
      <g transform={`translate(0 ${flota})`}>
        <ConSombra>{silueta}</ConSombra>
      </g>
    </svg>
  );
};
