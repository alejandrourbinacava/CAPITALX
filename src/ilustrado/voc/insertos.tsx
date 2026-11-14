import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../../theme";
import { suaveM, type Decorado, type PropsDecorado } from "../tipos";
import { C, Defs, Monograma, rnd } from "./comun";

/**
 * Insertos a pantalla completa: el recibo de 1606, el libro de suscripcion,
 * un documento con sello, el bodegon de especias y monedas, y el mapa de la
 * ruta de Texel a Batavia. Los textos son parametrizables.
 */

/** Mesa de madera oscura con veta, fondo de todos los insertos. */
const MesaFondo: React.FC<{ tono?: string }> = ({ tono = "#4A3426" }) => (
  <g>
    <rect x={-200} y={-200} width={2320} height={1480} fill={tono} />
    {Array.from({ length: 28 }).map((_, i) => (
      <path key={i} d={`M -200 ${-150 + i * 48 + rnd(i, 2) * 10} Q 600 ${-170 + i * 48 + rnd(i, 3) * 40} 1200 ${-150 + i * 48} T 2200 ${-160 + i * 48 + rnd(i, 4) * 30}`} stroke={"#3A281C"} strokeWidth={2 + rnd(i, 5) * 3} fill="none" opacity={0.6} />
    ))}
    <rect x={-200} y={-200} width={2320} height={1480} fill="url(#vocVineta)" />
  </g>
);

/** Hoja de papel con bordes irregulares. */
const Hoja: React.FC<{ x: number; y: number; w: number; h: number; color?: string; semilla?: number }> = ({ x, y, w, h, color = C.pergamino, semilla = 1 }) => {
  const pts: string[] = [];
  const n = 18;
  for (let i = 0; i <= n; i++) pts.push(`${x + (i / n) * w},${y + rnd(i, semilla) * 6}`);
  for (let i = 0; i <= n; i++) pts.push(`${x + w - rnd(i, semilla + 1) * 6},${y + (i / n) * h}`);
  for (let i = n; i >= 0; i--) pts.push(`${x + (i / n) * w},${y + h - rnd(i, semilla + 2) * 6}`);
  for (let i = n; i >= 0; i--) pts.push(`${x + rnd(i, semilla + 3) * 6},${y + (i / n) * h}`);
  return (
    <g>
      <rect x={x + 14} y={y + 18} width={w} height={h} fill={"#000"} opacity={0.3} />
      <polygon points={pts.join(" ")} fill={color} />
      <polygon points={pts.join(" ")} fill="url(#vocPapel)" opacity={0.35} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={"#C9B48A"} strokeWidth={10} opacity={0.25} />
    </g>
  );
};

const Escribe: React.FC<{ x: number; y: number; t: string; avance: number; size?: number; anchor?: "start" | "middle"; color?: string; peso?: number }> = ({ x, y, t, avance, size = 40, anchor = "start", color = C.tintaSepia, peso = 400 }) => (
  <text x={x} y={y} fontFamily={FONT.serif} fontStyle="italic" fontWeight={peso} fontSize={size} fill={color} textAnchor={anchor}>
    {t.slice(0, Math.round(t.length * Math.max(0, Math.min(1, avance))))}
  </text>
);

const Sello: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.carmin }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 0 Q -64 -40 -30 -56 Q 0 -70 34 -54 Q 66 -36 60 4 Q 58 44 20 58 Q -20 68 -46 44 Q -66 26 -60 0 Z" fill={color} />
    <circle r={38} fill="none" stroke={"#00000033"} strokeWidth={4} />
    <Monograma x={0} y={6} s={0.5} color={"#7A2418"} />
  </g>
);

/* ------------------------------------------------------------------ */
/* 1. El recibo de 1606                                                */
/* ------------------------------------------------------------------ */

const DibujoRecibo: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const t = e.textos ?? {};
  const a = (k: number) => suaveM((f - 10 - k * 18) / 30);
  const flota = Math.sin(f * 0.03) * 4;
  const luz = ((f / Math.max(1, dur)) * 2400) - 400;
  return (
    <g>
      <Defs />
      <MesaFondo />
      <g transform={`translate(0 ${flota}) rotate(-2 960 540)`}>
        <Hoja x={420} y={150} w={1080} h={780} semilla={3} />
        <Monograma x={960} y={280} s={1.2} camara={t.letra ?? "E"} color={"#5A3A24"} />
        <Escribe x={960} y={390} t={t.camara ?? "Camer van Enckhuysen"} avance={a(0)} size={44} anchor="middle" />
        <path d="M 600 420 H 1320" stroke={"#B9A27E"} strokeWidth={2} />
        <Escribe x={520} y={500} t={t.linea1 ?? "Ontfangen van"} avance={a(1)} size={38} />
        <Escribe x={760} y={500} t={t.nombre ?? "Pieter Harmensz"} avance={a(2)} size={46} peso={700} color={C.tinta} />
        <Escribe x={520} y={590} t={t.linea2 ?? "de somme van"} avance={a(3)} size={38} />
        <Escribe x={760} y={590} t={t.cantidad ?? "hondert vijftich gulden"} avance={a(4)} size={46} peso={700} color={C.tinta} />
        <Escribe x={520} y={680} t={t.linea3 ?? "voor de leste paye"} avance={a(5)} size={38} />
        <Escribe x={520} y={790} t={t.fecha ?? "9 september 1606"} avance={a(6)} size={40} />
        {/* firma */}
        <path
          d="M 1080 800 q 20 -60 40 -10 t 40 0 q 20 -40 30 10 q 10 30 40 -20 q 20 -20 60 -10"
          fill="none"
          stroke={C.tintaSepia}
          strokeWidth={4}
          strokeDasharray={600}
          strokeDashoffset={600 * (1 - a(7))}
        />
        <Sello x={1340} y={820} s={0.9} />
        {/* manchas y doblez */}
        <path d="M 960 160 V 920" stroke={"#C9B48A"} strokeWidth={3} opacity={0.5} />
        <circle cx={600} cy={860} r={40} fill={"#C9A86A"} opacity={0.18} />
      </g>
      <rect x={luz} y={-200} width={260} height={1480} fill={"#FFF6DD"} opacity={0.08} transform="skewX(-12)" />
    </g>
  );
};

export const recibo: Decorado = {
  desc: "Inserto: el recibo de 1606 de la camara de Enkhuizen, manuscrito en neerlandes antiguo sobre papel viejo, con el monograma VOC, la firma que se traza y un sello de lacre",
  admite: "textos.camara, letra (de la camara sobre el monograma, 'E'), nombre, cantidad, fecha, linea1..3 (todo con valores por defecto del recibo de Pieter Harmensz)",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1.0 }, a: { x: 960, y: 540, z: 1.08 }, desc: "el recibo entero" },
    nombre: { de: { x: 820, y: 540, z: 1.9 }, a: { x: 860, y: 550, z: 2.2 }, desc: "el nombre y la cantidad" },
    firma: { de: { x: 1200, y: 780, z: 2.0 }, a: { x: 1240, y: 790, z: 2.3 }, desc: "la firma y el sello" },
  },
  dibujo: DibujoRecibo,
};

/* ------------------------------------------------------------------ */
/* 2. El libro de suscripcion                                          */
/* ------------------------------------------------------------------ */

const DibujoLibro: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const t = e.textos ?? {};
  const lineas = (t.lineas ?? "Jan Pietersz|ƒ 3.000|Weduwe Claes|ƒ 150|Hans Thijs|ƒ 12.000|Grietje Jans|ƒ 300|Dirck van Os|ƒ 6.000|Aert Gerritsz|ƒ 600").split("|");
  const pares: [string, string][] = [];
  for (let i = 0; i < lineas.length; i += 2) pares.push([lineas[i], lineas[i + 1] ?? ""]);
  const avance = suaveM(f / Math.max(1, dur * 0.85));
  const pluma = Math.min(pares.length - 1, Math.floor(avance * pares.length));
  return (
    <g>
      <Defs />
      <MesaFondo />
      <rect x={160} y={110} width={1600} height={880} rx={14} fill={"#4A2E1E"} />
      <path d="M 190 140 Q 560 110 950 150 L 950 970 Q 560 940 190 965 Z" fill={"#F1E7CC"} />
      <path d="M 1730 140 Q 1360 110 970 150 L 970 970 Q 1360 940 1730 965 Z" fill={"#EDE2C4"} />
      <rect x={946} y={150} width={28} height={820} fill={"#D8CBA6"} />
      {Array.from({ length: 16 }).map((_, i) => (
        <g key={i} stroke={"#CDBB90"} strokeWidth={1.4}>
          <path d={`M 230 ${290 + i * 42} H 920`} />
          <path d={`M 1000 ${290 + i * 42} H 1690`} />
        </g>
      ))}
      <path d="M 720 200 V 940 M 1490 200 V 940" stroke={"#C98A6A"} strokeWidth={2} />
      <text x={570} y={240} textAnchor="middle" fontFamily={FONT.serif} fontSize={44} fill={C.tinta}>
        {t.titulo ?? "Capitaelboeck · Camer Amsterdam"}
      </text>
      <text x={1340} y={240} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={36} fill={C.tintaSepia}>
        {t.subtitulo ?? "Anno 1602"}
      </text>
      {pares.map(([n, c], i) => {
        const izq = i < 8;
        const y = 330 + (i % 8) * 84;
        const vis = Math.max(0, Math.min(1, avance * pares.length - i));
        return (
          <g key={i}>
            <Escribe x={izq ? 240 : 1010} y={y} t={n} avance={vis * 1.4} size={40} />
            <Escribe x={izq ? 900 : 1680} y={y} t={c} avance={(vis - 0.3) * 1.6} size={40} anchor="start" color={C.tinta} />
          </g>
        );
      })}
      {/* la pluma que escribe */}
      {(() => {
        const izq = pluma < 8;
        const px = (izq ? 520 : 1290) + Math.sin(f * 0.6) * 40;
        const py = 330 + (pluma % 8) * 84;
        return (
          <g transform={`translate(${px} ${py})`}>
            <path d="M 0 0 L 160 -260 Q 190 -300 200 -280 Q 160 -200 14 4 Z" fill={"#F2EEE4"} />
            <path d="M 0 0 L 160 -260" stroke={"#C9C2B2"} strokeWidth={2} />
          </g>
        );
      })()}
    </g>
  );
};

export const libro: Decorado = {
  desc: "Inserto: el libro de capital de la camara de Amsterdam abierto a doble pagina; los nombres de los socios y sus cantidades se van escribiendo con una pluma",
  admite: "textos.titulo, textos.subtitulo, textos.lineas ('nombre|cantidad|nombre|cantidad...', hasta 16 parejas)",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1.0 }, a: { x: 960, y: 540, z: 1.06 }, desc: "el libro abierto" },
    izquierda: { de: { x: 560, y: 520, z: 1.7 }, a: { x: 580, y: 560, z: 1.9 }, desc: "la pagina izquierda" },
    derecha: { de: { x: 1340, y: 520, z: 1.7 }, a: { x: 1320, y: 560, z: 1.9 }, desc: "la pagina derecha" },
  },
  dibujo: DibujoLibro,
};

/* ------------------------------------------------------------------ */
/* 3. Un documento con sello: la carta, un memorial, un placarte       */
/* ------------------------------------------------------------------ */

const DibujoCarta: React.FC<PropsDecorado> = ({ e, f }) => {
  const t = e.textos ?? {};
  const titulo = t.titulo ?? "OCTROY";
  const sub = t.subtitulo ?? "";
  const cuerpo = (t.cuerpo ?? "").split("|").filter(Boolean);
  const fecha = t.fecha ?? "";
  const a = (k: number) => suaveM((f - 8 - k * 14) / 26);
  const placarte = e.variante === "placarte";
  const pergamino = !placarte;
  return (
    <g>
      <Defs />
      <MesaFondo tono={placarte ? "#5A5048" : "#4A3426"} />
      <g transform={`rotate(${placarte ? 0 : 1.5} 960 540) translate(0 ${Math.sin(f * 0.03) * 3})`}>
        <Hoja x={360} y={70} w={1200} h={920} color={pergamino ? "#E6D4A8" : "#EFE8D6"} semilla={7} />
        {/* orla */}
        <rect x={420} y={130} width={1080} height={800} fill="none" stroke={pergamino ? "#9A7A4A" : "#3A3026"} strokeWidth={4} />
        <rect x={432} y={142} width={1056} height={776} fill="none" stroke={pergamino ? "#9A7A4A" : "#3A3026"} strokeWidth={1.5} />
        {/* letra capital y titulo */}
        <text x={960} y={250} textAnchor="middle" fontFamily={FONT.serif} fontWeight={700} fontSize={titulo.length > 22 ? 52 : 74} letterSpacing={6} fill={C.tinta} opacity={a(0)}>
          {titulo}
        </text>
        {sub ? (
          <text x={960} y={316} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={sub.length > 50 ? 28 : 36} fill={C.tintaSepia} opacity={a(1)}>
            {sub}
          </text>
        ) : null}
        <path d="M 640 350 Q 960 330 1280 350" stroke={"#9A7A4A"} strokeWidth={3} fill="none" opacity={a(1)} />
        {cuerpo.map((l, i) => (
          <Escribe key={i} x={500} y={430 + i * 64} t={l} avance={a(2 + i) * 1.2} size={40} color={C.tinta} />
        ))}
        {/* renglones de relleno, como texto ilegible */}
        {Array.from({ length: Math.max(0, 7 - cuerpo.length) }).map((_, i) => (
          <g key={i} opacity={0.4 * a(2 + cuerpo.length + i)}>
            <path d={`M 500 ${430 + (cuerpo.length + i) * 64 - 12} h ${800 - (i % 3) * 140}`} stroke={"#6A5A44"} strokeWidth={6} strokeDasharray="40 8 22 10 60 8" />
          </g>
        ))}
        {fecha ? <Escribe x={1440} y={860} t={fecha} avance={a(9)} size={38} anchor="middle" /> : null}
        {/* sello colgante con cinta */}
        {pergamino ? (
          <g>
            <path d="M 760 980 L 740 1100 M 800 980 L 820 1100" stroke={"#C8402C"} strokeWidth={14} />
            <Sello x={780} y={1010} s={1.2} />
          </g>
        ) : (
          <g>
            <Sello x={600} y={860} s={0.9} color={"#8A2A1E"} />
            {[440, 1480].map((cx) => (
              <circle key={cx} cx={cx} cy={110} r={10} fill={"#7A7A7A"} />
            ))}
          </g>
        )}
      </g>
    </g>
  );
};

export const carta: Decorado = {
  desc: "Inserto: un documento solemne con orla y sello (la carta u octrooi de 1602, un memorial, una prohibicion, el decreto de 1796, una letra de cambio): titulo, subtitulo y lineas manuscritas que van apareciendo",
  admite:
    "textos.titulo (mayusculas, p. ej. 'OCTROY'), textos.subtitulo, textos.cuerpo (lineas separadas por '|'), textos.fecha; variante 'placarte' (papel impreso clavado, en vez de pergamino con sello colgante). Solo datos que diga la locucion",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1.0 }, a: { x: 960, y: 540, z: 1.06 }, desc: "el documento entero" },
    titulo: { de: { x: 960, y: 320, z: 1.8 }, a: { x: 960, y: 340, z: 2.0 }, desc: "el titulo" },
    texto: { de: { x: 860, y: 520, z: 1.6 }, a: { x: 920, y: 600, z: 1.75 }, desc: "las lineas del texto" },
    sello: { de: { x: 820, y: 860, z: 2.0 }, a: { x: 800, y: 900, z: 2.3 }, desc: "el sello" },
  },
  dibujo: DibujoCarta,
};

/* ------------------------------------------------------------------ */
/* 4. Bodegon: nuez moscada, macis, pimienta, clavo y monedas          */
/* ------------------------------------------------------------------ */

const NuezAbierta: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={40} rx={110} ry={20} fill={"#000"} opacity={0.25} />
    <path d="M -100 0 Q -100 -110 0 -112 Q 20 -40 0 40 Q -96 40 -100 0 Z" fill={"#E2C46A"} />
    <path d="M 100 0 Q 100 -110 6 -112 Q 30 -40 6 40 Q 96 40 100 0 Z" fill={"#D9B85A"} />
    <path d="M -84 -10 Q -80 -90 -10 -96" stroke={"#F2DC90"} strokeWidth={6} fill="none" />
    <ellipse cx={4} cy={-36} rx={46} ry={56} fill={C.nuez} />
    {/* arilo de macis en red */}
    {[-30, -14, 0, 16, 30].map((k, i) => (
      <path key={i} d={`M ${4 + k} -92 Q ${4 + k * 1.8} -40 ${4 + k * 0.6} 18`} stroke={C.macis} strokeWidth={9} fill="none" strokeLinecap="round" />
    ))}
    <path d="M -40 -50 Q 4 -30 48 -54 M -36 -10 Q 4 4 44 -14" stroke={C.macis} strokeWidth={7} fill="none" />
  </g>
);

const Moneda: React.FC<{ x: number; y: number; r: number; anverso?: boolean; texto?: string }> = ({ x, y, r, anverso = true, texto }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 4} fill={"#6E6A60"} />
    <circle r={r} fill={"#C9C6BA"} />
    <circle r={r * 0.86} fill="none" stroke={"#9A968A"} strokeWidth={3} strokeDasharray="4 4" />
    {anverso ? <Monograma x={0} y={r * 0.08} s={r / 90} color={"#6E6A60"} /> : <path d={`M ${-r * 0.4} ${-r * 0.3} L 0 ${-r * 0.6} L ${r * 0.4} ${-r * 0.3} L ${r * 0.3} ${r * 0.4} L ${-r * 0.3} ${r * 0.4} Z`} fill="none" stroke={"#6E6A60"} strokeWidth={4} />}
    {texto ? (
      <text y={r * 0.78} textAnchor="middle" fontFamily={FONT.serif} fontSize={r * 0.22} fill={"#5A564C"}>
        {texto}
      </text>
    ) : null}
  </g>
);

const Etiqueta: React.FC<{ x: number; y: number; t: string; rot?: number }> = ({ x, y, t, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M -70 -24 L 60 -24 L 80 0 L 60 24 L -70 24 Z" fill={"#F2EAD2"} />
    <circle cx={64} cy={0} r={5} fill={"#4A3426"} />
    <text x={-4} y={10} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={28} fill={C.tintaSepia}>
      {t}
    </text>
  </g>
);

const DibujoEspecias: React.FC<PropsDecorado> = ({ e, f }) => {
  const t = e.textos ?? {};
  const gira = Math.sin(f * 0.02) * 3;
  return (
    <g>
      <Defs />
      <MesaFondo tono={"#3E2C20"} />
      {/* luz de ventana */}
      <polygon points="-200,-200 900,-200 1600,1280 300,1280" fill="#FFF3D2" opacity={0.06} />
      {/* cuenco de pimienta */}
      <g transform="translate(420 380)">
        <ellipse cx={0} cy={30} rx={250} ry={50} fill={"#000"} opacity={0.25} />
        <path d="M -230 -20 Q -220 90 0 100 Q 220 90 230 -20 Z" fill={"#8A6A4A"} />
        <ellipse cx={0} cy={-20} rx={230} ry={50} fill={"#6A4A30"} />
        {Array.from({ length: 140 }).map((_, i) => (
          <circle key={i} cx={-200 + rnd(i, 1) * 400} cy={-40 + rnd(i, 2) * 44} r={8} fill={i % 7 ? C.pimienta : "#5A4A3A"} />
        ))}
      </g>
      <Etiqueta x={420} y={520} t={t.pimienta ?? "peper"} rot={-4} />
      {/* nuez abierta y nueces sueltas */}
      <NuezAbierta x={1040} y={560} s={1.5} />
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i} transform={`translate(${760 + i * 70 + rnd(i, 3) * 30} ${780 + rnd(i, 4) * 60})`}>
          <ellipse cx={0} cy={0} rx={30} ry={24} fill={C.nuez} />
          <path d="M -20 -6 Q 0 -14 20 -6" stroke={"#5A3A20"} strokeWidth={3} fill="none" />
        </g>
      ))}
      <Etiqueta x={1040} y={890} t={t.nuez ?? "nooten"} rot={3} />
      {/* macis seco */}
      <g transform="translate(1560 360)">
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M ${-120 + rnd(i, 5) * 240} ${-60 + rnd(i, 6) * 120} q 20 -30 40 0 q 10 30 -30 40 Z`} fill={i % 3 ? C.macis : "#D86A3A"} />
        ))}
      </g>
      <Etiqueta x={1560} y={500} t={t.macis ?? "foelie"} rot={-3} />
      {/* clavo */}
      <g transform="translate(300 830)">
        {Array.from({ length: 22 }).map((_, i) => (
          <g key={i} transform={`translate(${rnd(i, 7) * 260 - 130} ${rnd(i, 8) * 80 - 40}) rotate(${rnd(i, 9) * 360})`}>
            <rect x={-3} y={0} width={6} height={36} fill={"#5A3A2A"} />
            <circle cx={0} cy={0} r={7} fill={"#6A4A3A"} />
          </g>
        ))}
      </g>
      <Etiqueta x={300} y={960} t={t.clavo ?? "nagelen"} rot={5} />
      {/* monedas */}
      <g transform={`rotate(${gira} 1580 820)`}>
        <Moneda x={1520} y={800} r={90} texto={t.moneda} />
        <Moneda x={1700} y={880} r={70} anverso={false} />
        <Moneda x={1440} y={940} r={60} />
      </g>
    </g>
  );
};

export const especias: Decorado = {
  desc: "Inserto: bodegon sobre la mesa: cuenco de pimienta, una nuez moscada abierta con el macis rojo en red, nueces sueltas, macis seco, clavo y monedas con el monograma VOC; etiquetas manuscritas",
  admite: "textos.pimienta, nuez, macis, clavo (etiquetas; por defecto en neerlandes: peper, nooten, foelie, nagelen), textos.moneda (leyenda de la moneda grande)",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1.0 }, a: { x: 960, y: 540, z: 1.06 }, desc: "el bodegon" },
    nuez: { de: { x: 1040, y: 560, z: 2.0 }, a: { x: 1040, y: 520, z: 2.4 }, desc: "la nuez abierta con el macis" },
    macis: { de: { x: 1500, y: 420, z: 2.2 }, a: { x: 1560, y: 420, z: 2.5 }, desc: "el macis y su etiqueta" },
    monedas: { de: { x: 1580, y: 860, z: 2.2 }, a: { x: 1560, y: 840, z: 2.5 }, desc: "monedas con el monograma" },
    pimienta: { de: { x: 400, y: 440, z: 2.0 }, a: { x: 430, y: 420, z: 2.3 }, desc: "la pimienta" },
  },
  dibujo: DibujoEspecias,
};

/* ------------------------------------------------------------------ */
/* 5. Mapa antiguo de la ruta Texel - Cabo - Batavia                   */
/* ------------------------------------------------------------------ */

const P = (lon: number, lat: number): [number, number] => [100 + (lon + 20) * 11, 80 + (60 - lat) * 9.2];
const poli = (pts: number[][]) => pts.map(([lo, la]) => P(lo, la).join(",")).join(" ");

const TIERRAS: number[][][] = [
  // Africa
  [[-17, 21], [-17, 14], [-12, 7], [-8, 4], [0, 5], [9, 4], [10, -2], [12, -6], [13, -12], [12, -17], [15, -27], [18, -34], [20, -35], [26, -34], [32, -29], [35, -24], [40, -15], [40, -10], [43, -1], [51, 12], [44, 11], [39, 16], [33, 28], [30, 31], [20, 32], [10, 37], [0, 35], [-6, 35], [-10, 30], [-17, 21]],
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
  // Europa
  [[-9, 37], [-9, 43], [-2, 44], [-5, 48], [2, 51], [5, 53], [8, 54], [9, 57], [11, 58], [12, 56], [18, 55], [21, 57], [24, 60], [40, 60], [40, 45], [30, 45], [28, 41], [26, 40], [23, 37], [20, 40], [18, 40], [15, 38], [12, 42], [8, 44], [3, 43], [0, 39], [-6, 36]],
  [[-5, 50], [1, 51], [2, 53], [-3, 56], [-6, 58], [-5, 55], [-3, 54], [-5, 52]],
  // Asia con Arabia e India
  [[40, 60], [140, 60], [140, 40], [132, 33], [122, 30], [122, 24], [115, 22], [108, 21], [106, 17], [109, 12], [105, 9], [103, 10], [100, 13], [100, 7], [103, 1], [101, 3], [98, 8], [98, 16], [94, 17], [92, 22], [88, 22], [80, 16], [80, 10], [77, 8], [73, 16], [72, 21], [67, 24], [57, 25], [56, 27], [50, 30], [48, 29], [55, 22], [59, 22], [52, 16], [43, 13], [40, 15], [35, 28], [33, 31], [36, 36], [30, 37], [27, 41], [40, 45]],
  [[80, 10], [82, 7], [81, 6], [79, 8]],
  [[95, 5], [98, 4], [104, -3], [106, -6], [102, -4], [95, 3]],
  [[105, -6], [114, -7], [114, -8.5], [106, -7]],
  [[109, 2], [113, 5], [118, 7], [119, 1], [116, -4], [111, -3], [109, -1]],
  [[119, -5], [120, 1], [124, 1], [121, -1], [123, -5]],
  [[131, -1], [138, -2], [140, -3], [140, -8], [134, -4]],
  [[130, 31], [132, 34], [136, 35], [140, 36], [141, 40], [140, 41], [135, 36], [131, 34]],
  [[120, 22], [121, 25], [122, 24]],
  [[120, 18], [122, 18], [126, 7], [122, 7], [120, 14]],
  [[114, -22], [122, -17], [130, -12], [137, -12], [140, -17], [140, -38], [115, -34]],
];

const RUTA: number[][] = [[4.8, 53], [-4, 47], [-14, 36], [-18, 20], [-20, 5], [-14, -10], [0, -24], [12, -32], [18.4, -33.9], [30, -37], [50, -38], [80, -36], [100, -30], [106, -15], [106.8, -6.1]];

const LUGARES: { n: string; p: [number, number]; dx: number; dy: number }[] = [
  { n: "Texel", p: [4.8, 53], dx: 18, dy: -10 },
  { n: "Kaap de Goede Hoop", p: [18.4, -33.9], dx: 18, dy: 30 },
  { n: "Batavia", p: [106.8, -6.1], dx: -20, dy: 34 },
  { n: "Banda", p: [129.9, -4.5], dx: 14, dy: 30 },
  { n: "Nagasaki", p: [129.9, 32.7], dx: -150, dy: -6 },
];

const DibujoMapa: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const t = e.textos ?? {};
  const pts = RUTA.map(([a, b]) => P(a, b));
  const largos = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = largos.reduce((a, b) => a + b, 0);
  const avance = suaveM(f / Math.max(1, dur * 0.92));
  let resto = avance * total;
  let barco = pts[0];
  let ang = 0;
  for (let i = 0; i < largos.length; i++) {
    if (resto <= largos[i]) {
      const k = resto / largos[i];
      barco = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
      ang = (Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) * 180) / Math.PI;
      break;
    }
    resto -= largos[i];
    barco = pts[i + 1];
  }
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const marcados = (t.lugares ?? "Texel|Kaap de Goede Hoop|Batavia").split("|");
  return (
    <g>
      <Defs />
      <rect x={-200} y={-200} width={2320} height={1480} fill={"#3E2C20"} />
      <rect x={40} y={30} width={1840} height={1020} fill={"#E9DDB8"} />
      <rect x={40} y={30} width={1840} height={1020} fill="url(#vocPapel)" opacity={0.4} />
      <rect x={60} y={50} width={1800} height={980} fill="none" stroke={"#7A6040"} strokeWidth={6} />
      <rect x={74} y={64} width={1772} height={952} fill="none" stroke={"#7A6040"} strokeWidth={2} />
      {/* rumbos */}
      <g stroke={"#9A8460"} strokeWidth={1} opacity={0.45}>
        {[P(60, 0), P(0, 20)].map(([cx, cy], k) =>
          Array.from({ length: 16 }).map((_, i) => <path key={`${k}-${i}`} d={`M ${cx} ${cy} L ${cx + Math.cos((i * Math.PI) / 8) * 1400} ${cy + Math.sin((i * Math.PI) / 8) * 1400}`} />)
        )}
      </g>
      {/* mar con trazos */}
      {Array.from({ length: 40 }).map((_, i) => (
        <path key={i} d={`M ${120 + rnd(i, 1) * 1680} ${120 + rnd(i, 2) * 860} q 10 -6 20 0 q 10 6 20 0`} stroke={"#9AA6A0"} strokeWidth={2} fill="none" />
      ))}
      {TIERRAS.map((p, i) => (
        <g key={i}>
          <polygon points={poli(p)} fill={"#D9C390"} stroke={"#7A6040"} strokeWidth={3} strokeLinejoin="round" />
          <polygon points={poli(p)} fill="none" stroke={"#C9B07A"} strokeWidth={14} opacity={0.35} strokeLinejoin="round" />
        </g>
      ))}
      {/* ruta */}
      <path d={d} fill="none" stroke={C.carmin} strokeWidth={5} strokeDasharray="14 10" opacity={0.35} />
      <path d={d} fill="none" stroke={C.carmin} strokeWidth={6} strokeDasharray={`${avance * total} ${total + 10}`} />
      {LUGARES.filter((l) => marcados.includes(l.n)).map((l) => {
        const [x, y] = P(l.p[0], l.p[1]);
        return (
          <g key={l.n}>
            <circle cx={x} cy={y} r={10} fill={C.tinta} />
            <circle cx={x} cy={y} r={18} fill="none" stroke={C.tinta} strokeWidth={2} />
            <text x={x + l.dx} y={y + l.dy} fontFamily={FONT.serif} fontStyle="italic" fontSize={34} fill={C.tinta}>
              {l.n}
            </text>
          </g>
        );
      })}
      {/* barquito */}
      <g transform={`translate(${barco[0]} ${barco[1]}) rotate(${Math.abs(ang) > 90 ? 0 : 0})`}>
        <path d="M -30 0 L 30 0 L 22 12 L -22 12 Z" fill={"#5A3A24"} />
        <path d="M -4 0 V -46 M -2 -44 L 22 -14 L -2 -10 Z M -6 -40 L -26 -12 L -6 -12 Z" fill={"#F2EEE4"} stroke={"#5A3A24"} strokeWidth={2} />
      </g>
      {/* rosa de los vientos y cartela */}
      <g transform={`translate(${P(50, -28)[0]} ${P(50, -28)[1]}) rotate(${f * 0.1}) scale(0.8)`}>
        <polygon points="0,-90 14,0 0,90 -14,0" fill={C.carmin} />
        <polygon points="-90,0 0,14 90,0 0,-14" fill={"#2F4A7A"} />
        <circle r={14} fill={C.laton} />
      </g>
      <g transform={`translate(${P(78, -12)[0]} ${P(78, -12)[1]})`}>
        <rect x={-210} y={-70} width={420} height={140} fill={"#F2EAD2"} stroke={"#7A6040"} strokeWidth={4} />
        <text x={0} y={-12} textAnchor="middle" fontFamily={FONT.serif} fontSize={34} fill={C.tinta}>
          {t.titulo ?? "Oost-Indische Vaart"}
        </text>
        <text x={0} y={36} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={26} fill={C.tintaSepia}>
          {t.subtitulo ?? ""}
        </text>
      </g>
    </g>
  );
};

export const mapa: Decorado = {
  desc: "Inserto: mapa antiguo dibujado de Europa, Africa y Asia con la ruta de Texel al Cabo y a Batavia, que se traza mientras un barquito la recorre; rosa de los vientos y cartela",
  admite: "textos.titulo y subtitulo (cartela), textos.lugares (nombres a marcar separados por '|' entre: Texel, Kaap de Goede Hoop, Batavia, Banda, Nagasaki)",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1.0 }, a: { x: 960, y: 540, z: 1.04 }, desc: "el mapa y la ruta" },
    europa: { de: { x: 560, y: 330, z: 1.9 }, a: { x: 580, y: 500, z: 1.7 }, desc: "de Texel hacia el sur" },
    cabo: { de: { x: 520, y: 720, z: 1.9 }, a: { x: 640, y: 760, z: 1.9 }, desc: "doblando el Cabo" },
    asia: { de: { x: 1300, y: 560, z: 1.7 }, a: { x: 1360, y: 600, z: 1.8 }, desc: "el archipielago, Batavia y Banda" },
  },
  dibujo: DibujoMapa,
};
