import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../../theme";
import { suaveM, type Decorado, type PropsDecorado } from "../tipos";
import { C, Defs, Monograma, osc, rnd } from "./comun";
import { Figura, type Traje } from "./Gente";

/* ------------------------------------------------------------------ */
/* Piezas de interior holandes                                          */
/* ------------------------------------------------------------------ */

/** Pared encalada con friso de madera y suelo de baldosa blanca y negra. */
export const Sala: React.FC<{ suelo: number; ancho?: number; pared?: string; friso?: number }> = ({ suelo, ancho = 2400, pared = "#E6DCC6", friso = 200 }) => (
  <g>
    <rect x={-300} y={-100} width={ancho + 600} height={suelo + 100} fill={pared} />
    <rect x={-300} y={-100} width={ancho + 600} height={60} fill={osc(pared, 0.9)} />
    <rect x={-300} y={-40} width={ancho + 600} height={10} fill={osc(pared, 0.8)} />
    <rect x={-300} y={suelo - friso} width={ancho + 600} height={friso} fill={C.maderaMedia} />
    {Array.from({ length: Math.ceil((ancho + 600) / 160) }).map((_, i) => (
      <rect key={i} x={-280 + i * 160} y={suelo - friso + 22} width={130} height={friso - 44} fill="none" stroke={C.madera} strokeWidth={4} />
    ))}
    <rect x={-300} y={suelo - friso - 12} width={ancho + 600} height={14} fill={C.maderaLuz} />
    {/* suelo en perspectiva simple: baldosas que se agrandan hacia delante */}
    <rect x={-300} y={suelo} width={ancho + 600} height={1200 - suelo} fill={"#D8CFBB"} />
    {Array.from({ length: 6 }).map((_, fila) => {
      const y0 = suelo + fila * (18 + fila * 10);
      const h = 18 + fila * 10;
      const w = 60 + fila * 24;
      return Array.from({ length: Math.ceil((ancho + 800) / w) }).map((__, k) =>
        (k + fila) % 2 ? <rect key={`${fila}-${k}`} x={-300 + k * w - (fila % 2) * w * 0.5} y={y0} width={w} height={h} fill={"#2E2A26"} opacity={0.88} /> : null
      );
    })}
  </g>
);

/** Ventana emplomada con cuarterones, postigos y luz que entra. */
export const VentanaEmplomada: React.FC<{ x: number; y: number; w: number; h: number; luz?: boolean; exterior?: "cielo" | "gris" | "gabletes" }> = ({ x, y, w, h, luz = true, exterior = "cielo" }) => {
  const f = useCurrentFrame();
  const fondo = exterior === "gris" ? "#9AA09A" : "#CFD8D0";
  return (
    <g>
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill={C.maderaOsc} />
      <rect x={x} y={y} width={w} height={h} fill={fondo} />
      {exterior === "gabletes" ? (
        <g fill={"#A88A74"} opacity={0.8}>
          <path d={`M ${x} ${y + h * 0.5} h ${w * 0.3} v -40 l 20 -30 l 20 30 v 40 h ${w * 0.25} v -60 h ${w * 0.3} V ${y + h} H ${x} Z`} />
        </g>
      ) : null}
      {/* plomos en rombo */}
      <g stroke={"#5A5248"} strokeWidth={1.4} opacity={0.7}>
        {Array.from({ length: Math.ceil(w / 22) + Math.ceil(h / 22) }).map((_, i) => (
          <g key={i}>
            <path d={`M ${x + i * 22} ${y} L ${x + i * 22 - h} ${y + h}`} />
            <path d={`M ${x + i * 22 - h} ${y} L ${x + i * 22} ${y + h}`} />
          </g>
        ))}
      </g>
      <rect x={x - 14} y={y - 14} width={14} height={h + 28} fill={C.maderaOsc} />
      <rect x={x + w} y={y - 14} width={14} height={h + 28} fill={C.maderaOsc} />
      <rect x={x + w / 2 - 6} y={y} width={12} height={h} fill={C.maderaOsc} />
      <rect x={x} y={y + h * 0.42} width={w} height={12} fill={C.maderaOsc} />
      <rect x={x - 22} y={y + h + 10} width={w + 44} height={14} fill={C.maderaLuz} />
      {luz ? (
        <polygon
          points={`${x},${y} ${x + w},${y} ${x + w + 520},${y + h + 520} ${x + 300},${y + h + 520}`}
          fill="url(#vocLuzVentana)"
          opacity={0.7 + Math.sin(f * 0.02) * 0.08}
        />
      ) : null}
    </g>
  );
};

/** Lampara de laton de brazos, que se mece un poco. */
export const Lampara: React.FC<{ x: number; y: number; s?: number; encendida?: boolean }> = ({ x, y, s = 1, encendida }) => {
  const f = useCurrentFrame();
  const a = Math.sin(f * 0.04) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a} 0 -400) scale(${s})`}>
      <rect x={-2} y={-400} width={4} height={330} fill={"#5A4A30"} />
      <circle cx={0} cy={-60} r={22} fill={C.laton} />
      <circle cx={0} cy={-20} r={30} fill={C.laton} />
      <circle cx={0} cy={18} r={14} fill={osc(C.laton, 0.8)} />
      {[-120, -70, 70, 120].map((bx) => (
        <g key={bx}>
          <path d={`M 0 -20 Q ${bx * 0.6} 10 ${bx} -30`} stroke={C.laton} strokeWidth={6} fill="none" />
          <rect x={bx - 10} y={-38} width={20} height={8} fill={C.laton} />
          <rect x={bx - 4} y={-66} width={8} height={30} fill={"#F2EEE4"} />
          {encendida ? (
            <g>
              <ellipse cx={bx} cy={-76} rx={5} ry={9 + Math.sin(f * 0.5 + bx) * 2} fill={"#F2C35A"} />
              <circle cx={bx} cy={-74} r={40} fill="url(#vocVela)" />
            </g>
          ) : null}
        </g>
      ))}
    </g>
  );
};

/** Mapa mural de Asia al estilo de Blaeu: costas, rosas de los vientos, cartela. */
export const MapaMural: React.FC<{ x: number; y: number; w: number; h: number; titulo?: string }> = ({ x, y, w, h, titulo = "INDIAE ORIENTALIS" }) => {
  const sx = w / 600;
  const sy = h / 400;
  return (
    <g>
      <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} fill={C.maderaOsc} />
      <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} fill={C.laton} opacity={0.6} />
      <rect x={x} y={y} width={w} height={h} fill={"#E9DFC2"} />
      <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
        <rect x={0} y={0} width={600} height={400} fill={"#D9E0CF"} opacity={0.6} />
        {/* India, Indochina, archipielago */}
        <path d="M 0 40 L 120 30 Q 150 60 140 110 L 170 200 Q 180 240 160 250 L 140 180 Q 120 150 100 160 L 60 120 L 0 110 Z" fill={"#E2CFA0"} stroke={"#8A7650"} strokeWidth={2} />
        <path d="M 200 20 L 400 10 L 420 90 Q 380 120 360 160 L 340 250 Q 320 270 310 230 L 300 160 Q 260 150 250 110 L 220 120 Z" fill={"#E2CFA0"} stroke={"#8A7650"} strokeWidth={2} />
        <path d="M 260 270 Q 300 260 330 300 Q 320 320 290 310 Q 260 300 260 270 Z" fill={"#E2CFA0"} stroke={"#8A7650"} strokeWidth={2} />
        <path d="M 330 320 L 450 330 L 448 340 L 330 334 Z" fill={"#E2CFA0"} stroke={"#8A7650"} strokeWidth={2} />
        <path d="M 360 250 Q 420 240 440 290 Q 400 300 370 280 Z" fill={"#E2CFA0"} stroke={"#8A7650"} strokeWidth={2} />
        <path d="M 470 260 Q 490 250 500 280 Q 480 290 470 260 Z M 520 300 Q 540 290 545 310 Q 530 318 520 300 Z" fill={"#E2CFA0"} stroke={"#8A7650"} strokeWidth={2} />
        <path d="M 470 40 Q 520 60 540 120 Q 520 130 500 90 Z" fill={"#E2CFA0"} stroke={"#8A7650"} strokeWidth={2} />
        {/* rumbos */}
        <g stroke={"#8A7650"} strokeWidth={0.8} opacity={0.5}>
          {Array.from({ length: 16 }).map((_, i) => (
            <path key={i} d={`M 200 330 L ${200 + Math.cos((i * Math.PI) / 8) * 400} ${330 + Math.sin((i * Math.PI) / 8) * 400}`} />
          ))}
        </g>
        <g transform="translate(200 330)">
          <polygon points="0,-30 6,0 0,30 -6,0" fill={C.carmin} />
          <polygon points="-30,0 0,6 30,0 0,-6" fill={"#2F4A7A"} />
          <circle r={6} fill={C.laton} />
        </g>
        {/* barquitos y cartela */}
        <path d="M 120 300 l 30 0 l -6 8 l -18 0 Z M 134 300 v -22 l 14 18 Z" fill={"#6A5A44"} />
        <path d="M 470 180 l 30 0 l -6 8 l -18 0 Z M 484 180 v -22 l 14 18 Z" fill={"#6A5A44"} />
        <rect x={420} y={340} width={170} height={50} fill={"#F2EAD2"} stroke={"#8A7650"} strokeWidth={2} />
      </g>
      <text x={x + w * 0.84} y={y + h * 0.92} textAnchor="middle" fontFamily={FONT.serif} fontSize={Math.max(10, h * 0.04)} fill={"#5A4A30"} letterSpacing={2}>
        {titulo}
      </text>
    </g>
  );
};

/** Cuadro con marco: un paisaje marino oscuro. */
const Cuadro: React.FC<{ x: number; y: number; w: number; h: number; tipo?: "mar" | "retrato" }> = ({ x, y, w, h, tipo = "mar" }) => (
  <g>
    <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} fill={"#2A1E14"} />
    <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} fill={C.laton} opacity={0.5} />
    <rect x={x} y={y} width={w} height={h} fill={tipo === "mar" ? "#7A8070" : "#3A3026"} />
    {tipo === "mar" ? (
      <g>
        <rect x={x} y={y + h * 0.62} width={w} height={h * 0.38} fill={"#4E5A52"} />
        <path d={`M ${x + w * 0.3} ${y + h * 0.62} l ${w * 0.3} 0 l -${w * 0.05} ${h * 0.08} l -${w * 0.2} 0 Z`} fill={"#2E2A26"} />
        <path d={`M ${x + w * 0.45} ${y + h * 0.62} V ${y + h * 0.2} M ${x + w * 0.38} ${y + h * 0.3} h ${w * 0.14}`} stroke={"#2E2A26"} strokeWidth={3} />
        <path d={`M ${x + w * 0.4} ${y + h * 0.32} h ${w * 0.1} v ${h * 0.14} h -${w * 0.1} Z`} fill={"#D8CFB6"} />
      </g>
    ) : (
      <g>
        <circle cx={x + w / 2} cy={y + h * 0.4} r={w * 0.18} fill={"#C9A27E"} />
        <ellipse cx={x + w / 2} cy={y + h * 0.58} rx={w * 0.26} ry={h * 0.06} fill={"#EDE7DA"} />
        <path d={`M ${x + w * 0.2} ${y + h} Q ${x + w / 2} ${y + h * 0.55} ${x + w * 0.8} ${y + h} Z`} fill={"#1E1E22"} />
      </g>
    )}
  </g>
);

/** Libro de cuentas abierto (visto desde arriba), con renglones y texto que se escribe. */
export const LibroAbierto: React.FC<{ x: number; y: number; w: number; lineas?: string[]; escribe?: number; rojo?: boolean; inclina?: number }> = ({ x, y, w, lineas = [], escribe = 1, rojo, inclina = 1 }) => {
  const h = w * 0.66;
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${inclina}) translate(${-x} ${-y})`}>
      <rect x={x - 10} y={y - 8} width={w + 20} height={h + 16} rx={6} fill={"#5A3A24"} />
      <path d={`M ${x} ${y} Q ${x + w * 0.25} ${y - 10} ${x + w / 2} ${y + 4} L ${x + w / 2} ${y + h} Q ${x + w * 0.25} ${y + h - 10} ${x} ${y + h} Z`} fill={"#F1E7CC"} />
      <path d={`M ${x + w} ${y} Q ${x + w * 0.75} ${y - 10} ${x + w / 2} ${y + 4} L ${x + w / 2} ${y + h} Q ${x + w * 0.75} ${y + h - 10} ${x + w} ${y + h} Z`} fill={"#EDE2C4"} />
      <rect x={x + w / 2 - 3} y={y + 4} width={6} height={h - 4} fill={"#D8CBA6"} />
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} stroke={"#C9B88E"} strokeWidth={1}>
          <path d={`M ${x + 14} ${y + 30 + i * (h - 50) / 12} H ${x + w / 2 - 14}`} />
          <path d={`M ${x + w / 2 + 14} ${y + 30 + i * (h - 50) / 12} H ${x + w - 14}`} />
        </g>
      ))}
      <path d={`M ${x + w * 0.38} ${y + 14} V ${y + h - 10} M ${x + w * 0.88} ${y + 14} V ${y + h - 10}`} stroke={"#C98A6A"} strokeWidth={1.2} />
      {lineas.map((l, i) => {
        const izq = i < 6;
        const lx = izq ? x + 18 : x + w / 2 + 18;
        const ly = y + 30 + (i % 6) * 2 * ((h - 50) / 12) - 4;
        const visible = Math.max(0, Math.min(1, escribe * lineas.length - i));
        const largo = Math.round(l.length * visible);
        return (
          <text key={i} x={lx} y={ly} fontFamily={FONT.serif} fontStyle="italic" fontSize={w * 0.028} fill={rojo && i === lineas.length - 1 ? C.carmin : C.tintaSepia}>
            {l.slice(0, largo)}
          </text>
        );
      })}
    </g>
  );
};

/** Tintero con pluma, que se mueve un poco. */
const Tintero: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-18} y={-26} width={36} height={26} rx={6} fill={"#2A2420"} />
      <path d={`M 4 -24 Q ${30 + Math.sin(f * 0.1) * 3} -80 ${46 + Math.sin(f * 0.1) * 4} -110`} stroke={"#F2EEE4"} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** Montones de monedas. */
export const Monedas: React.FC<{ x: number; y: number; n?: number; s?: number; plata?: boolean }> = ({ x, y, n = 5, s = 1, plata }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }).map((_, k) => (
      <g key={k} transform={`translate(${k * 34 - n * 17} 0)`}>
        {Array.from({ length: 3 + ((k * 7) % 5) }).map((__, j) => (
          <g key={j}>
            <ellipse cx={0} cy={-j * 7} rx={15} ry={5} fill={plata ? "#B9B8B0" : C.laton} />
            <ellipse cx={0} cy={-j * 7 - 1.5} rx={15} ry={4} fill={plata ? "#D6D5CC" : "#DDBB5A"} />
          </g>
        ))}
      </g>
    ))}
  </g>
);

/** Cofre de hierro de la caja. */
const Cofre: React.FC<{ x: number; y: number; s?: number; abierto?: number; vacio?: boolean }> = ({ x, y, s = 1, abierto = 1, vacio }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-110} width={220} height={110} fill={"#4A3A2C"} />
    {[-110, -40, 30, 100].map((bx) => (
      <rect key={bx} x={bx} y={-110} width={10} height={110} fill={"#2A2420"} />
    ))}
    <rect x={-110} y={-20} width={220} height={10} fill={"#2A2420"} />
    {!vacio ? <Monedas x={0} y={-104} n={6} s={0.9} plata /> : <g><rect x={-100} y={-112} width={200} height={8} fill={"#2A2420"} /><Monedas x={-20} y={-106} n={2} s={0.6} plata /></g>}
    <g transform={`translate(0 -110) scale(1 ${-0.3 - 0.7 * abierto})`}>
      <rect x={-112} y={0} width={224} height={70} fill={"#3E3024"} />
      <rect x={-112} y={0} width={224} height={8} fill={"#2A2420"} />
    </g>
    <rect x={-14} y={-90} width={28} height={30} fill={C.laton} />
  </g>
);

const Mesa: React.FC<{ x0: number; x1: number; y: number; tapete?: boolean; alto?: number }> = ({ x0, x1, y, tapete = true, alto = 260 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={alto} fill={tapete ? "url(#vocLinoMantel)" : C.maderaMedia} />
    <rect x={x0 - 10} y={y - 14} width={x1 - x0 + 20} height={20} fill={tapete ? "#26403A" : C.maderaLuz} />
    {tapete ? (
      <g>
        {Array.from({ length: Math.floor((x1 - x0) / 40) }).map((_, i) => (
          <path key={i} d={`M ${x0 + 20 + i * 40} ${y + alto - 30} l 10 30 l 10 -30`} fill={C.laton} opacity={0.6} />
        ))}
        <rect x={x0} y={y + alto - 34} width={x1 - x0} height={6} fill={C.laton} opacity={0.6} />
      </g>
    ) : null}
  </g>
);

/* ------------------------------------------------------------------ */
/* 1. La oficina de suscripcion de la Casa de las Indias, 1602         */
/* ------------------------------------------------------------------ */

const DibujoOficina: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const s = e.semilla ?? 2;
  const t = e.textos ?? {};
  const nombre = t.nombre ?? "Pieter Harmensz";
  const cantidad = t.cantidad ?? "ƒ 150";
  const avance = suaveM((f - 10) / Math.max(30, dur * 0.7));
  const lineas = [
    "Jan Pietersz ........ ƒ 3.000",
    "Weduwe Claes ........ ƒ 150",
    "Isaac le Maire ...... ƒ 85.000",
    "Hans Thijs .......... ƒ 12.000",
    "Grietje Jans ........ ƒ 300",
    "Dirck van Os ........ ƒ 6.000",
    "Aert Gerritsz ....... ƒ 600",
    "Cornelis Bas ........ ƒ 9.000",
    `${nombre} ... ${cantidad}`,
  ];
  return (
    <g>
      <Defs />
      <Sala suelo={880} ancho={1920} />
      <VentanaEmplomada x={80} y={170} w={300} h={430} exterior="gabletes" />
      <MapaMural x={1300} y={150} w={460} h={300} />
      <g transform="translate(860 250)">
        <rect x={-130} y={-70} width={260} height={150} fill={"#F2EAD2"} stroke={C.maderaOsc} strokeWidth={10} />
        <Monograma x={0} y={14} s={0.9} camara="A" />
      </g>
      <Lampara x={960} y={10} s={0.8} />
      {/* armario de libros */}
      <rect x={480} y={360} width={210} height={520} fill={C.madera} />
      {[0, 1, 2, 3].map((k) => (
        <g key={k}>
          <rect x={492} y={380 + k * 120} width={186} height={104} fill={"#2E2219"} />
          {Array.from({ length: 7 }).map((_, b) => (
            <rect key={b} x={498 + b * 25} y={392 + k * 120 + (b % 3) * 4} width={20} height={88 - (b % 3) * 4} fill={["#6A3A34", "#3E4A5A", "#5A4A3A", "#7A6A3A"][(b + k) % 4]} />
          ))}
        </g>
      ))}
      {/* el contable tras el mostrador */}
      <Figura x={1000} y={880} escala={0.95} traje="burgues" semilla={s * 5 + 1} cuerpo="busto" pose="escribe" mirada={-0.3} sombrero={false} />
      <Figura x={1250} y={880} escala={0.88} traje="burgues" semilla={s * 5 + 2} cuerpo="busto" pose="brazos" gesto="serio" mirada={-0.6} />
      {/* mostrador */}
      <rect x={640} y={640} width={760} height={30} fill={C.maderaLuz} />
      <rect x={660} y={670} width={720} height={240} fill={C.madera} />
      {[680, 860, 1040, 1220].map((px) => (
        <rect key={px} x={px} y={690} width={150} height={190} fill="none" stroke={C.maderaOsc} strokeWidth={5} />
      ))}
      <rect x={650} y={622} width={740} height={22} fill={C.maderaLuz} opacity={0.6} />
      <LibroAbierto x={850} y={572} w={300} lineas={lineas} escribe={0.75 + 0.25 * avance} inclina={0.5} />
      <Tintero x={1180} y={640} s={1} />
      <Monedas x={760} y={640} n={4} s={0.8} plata />
      <Cofre x={1520} y={930} s={0.9} />
      {/* la cola de suscriptores */}
      <Figura x={450} y={1010} escala={1.02} traje="mujer" semilla={s * 7 + 3} pose="ofrece" mirada={0.8} gesto="neutro" />
      <Figura x={250} y={1060} escala={1.08} traje="marinero" semilla={s * 7 + 4} pose="manos" mirada={0.6} />
      <Figura x={1720} y={1050} escala={1.1} traje="burgues" semilla={s * 7 + 5} capa sombrero pose="habla" mirada={-0.8} />
      <Figura x={70} y={1080} escala={1.14} traje="burgues" semilla={s * 7 + 6} pose="lee" mirada={0.4} />
    </g>
  );
};

export const oficina: Decorado = {
  desc: "1602, la oficina de la Casa de las Indias Orientales: el contable apunta suscripciones en el gran libro tras un mostrador, un director vigila; en cola, una mujer con cofia (pequeña ahorradora), un marinero y un gran comerciante con capa; cofre de monedas, mapa y monograma VOC",
  admite: "textos.nombre y textos.cantidad (ultima linea que se escribe en el libro, p. ej. 'Pieter Harmensz' / 'ƒ 150'); semilla",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1.02 }, a: { x: 960, y: 540, z: 1.1 }, desc: "la oficina entera" },
    mostrador: { de: { x: 960, y: 600, z: 2.6 }, a: { x: 1000, y: 610, z: 2.9 }, desc: "el contable escribe en el libro; monedas y tintero" },
    ahorradora: { de: { x: 520, y: 600, z: 2.2 }, a: { x: 480, y: 580, z: 2.5 }, desc: "la pequeña ahorradora ofrece su dinero" },
    comerciante: { de: { x: 1600, y: 600, z: 2.0 }, a: { x: 1660, y: 580, z: 2.3 }, desc: "el gran comerciante con capa" },
    contable: { de: { x: 1080, y: 470, z: 2.1 }, a: { x: 1060, y: 480, z: 2.4 }, desc: "el contable y el director" },
  },
  dibujo: DibujoOficina,
};

/* ------------------------------------------------------------------ */
/* 2. La sala de los Diecisiete Señores                                */
/* ------------------------------------------------------------------ */

const DeEspaldas: React.FC<{ x: number; y: number; s: number; semilla: number; peluca?: boolean }> = ({ x, y, s, semilla, peluca }) => {
  const f = useCurrentFrame();
  const m = Math.sin(f * 0.05 + semilla) * 2;
  const pelo = ["#2A201B", "#3F2E24", "#7A5E44", "#A8988A"][Math.floor(rnd(semilla, 2) * 4)];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -90 0 Q -96 -150 -60 -200 Q 0 -222 60 -200 Q 96 -150 90 0 Z" fill={"#1E1E22"} />
      {peluca ? (
        <g fill={"#DAD3C3"}>
          <path d={`M -54 ${-300 + m} Q -60 -190 -40 -180 L 40 -180 Q 60 -190 54 ${-300 + m} Q 0 ${-330 + m} -54 ${-300 + m} Z`} />
        </g>
      ) : (
        <g>
          <ellipse cx={0} cy={-206} rx={60} ry={18} fill={"#F2EEE4"} />
          <ellipse cx={0} cy={-262 + m} rx={40} ry={46} fill={pelo} />
          {rnd(semilla, 3) > 0.4 ? (
            <g>
              <ellipse cx={0} cy={-286 + m} rx={74} ry={12} fill={"#17191B"} />
              <path d={`M -34 ${-288 + m} Q -34 ${-344 + m} 0 ${-346 + m} Q 34 ${-344 + m} 34 ${-288 + m} Z`} fill={"#17191B"} />
            </g>
          ) : null}
        </g>
      )}
    </g>
  );
};

const DibujoHeeren: React.FC<PropsDecorado> = ({ e }) => {
  const s = e.semilla ?? 3;
  const siglo18 = e.variante === "siglo18";
  const traje: Traje = siglo18 ? "peluca" : "burgues";
  return (
    <g>
      <Defs />
      <Sala suelo={760} ancho={1920} pared={"#D9CDB0"} friso={180} />
      <VentanaEmplomada x={60} y={130} w={220} h={380} />
      <VentanaEmplomada x={1640} y={130} w={220} h={380} />
      <MapaMural x={560} y={70} w={800} h={420} />
      <Cuadro x={330} y={160} w={170} h={220} tipo="retrato" />
      <Cuadro x={1420} y={160} w={170} h={220} tipo="mar" />
      <Lampara x={960} y={-30} s={1} encendida={e.hora === "noche" || e.hora === "tarde"} />
      {/* once directores tras la mesa */}
      {Array.from({ length: 11 }).map((_, i) => {
        const px = 260 + i * 140;
        const hablaEl = i === 5;
        return (
          <Figura
            key={i}
            x={px}
            y={830 + (i % 2) * 6}
            escala={0.7}
            traje={traje}
            semilla={s * 17 + i}
            cuerpo="busto"
            pose={hablaEl ? "habla" : i % 4 === 1 ? "lee" : i % 4 === 3 ? "escribe" : "quieto"}
            mirada={(5 - i) * 0.15}
            gesto={i % 3 === 0 ? "serio" : "neutro"}
            sombrero={!siglo18 && i % 3 === 1}
          />
        );
      })}
      <Mesa x0={180} x1={1740} y={720} />
      {/* objetos sobre la mesa */}
      {[330, 620, 900, 1180, 1460].map((px, i) => (
        <g key={px}>
          <rect x={px - 50} y={694} width={100} height={18} fill={"#F2EAD2"} transform={`rotate(${(i % 2 ? 3 : -4)} ${px} 700)`} />
          <rect x={px + 50} y={690} width={20} height={16} rx={4} fill={"#2A2420"} />
        </g>
      ))}
      {[480, 1340].map((px) => (
        <g key={px}>
          <rect x={px - 8} y={630} width={16} height={74} fill={C.laton} />
          <rect x={px - 4} y={600} width={8} height={30} fill={"#F2EEE4"} />
          <ellipse cx={px} cy={594} rx={4} ry={8} fill={"#F2C35A"} />
        </g>
      ))}
      <rect x={930} y={680} width={60} height={30} fill={"#5A3A24"} />
      <Monograma x={960} y={820} s={0.8} color={C.laton} />
      {/* seis de espaldas, en primer termino */}
      {[140, 470, 800, 1120, 1450, 1780].map((px, i) => (
        <DeEspaldas key={px} x={px} y={1200} s={1.05} semilla={s * 3 + i} peluca={siglo18} />
      ))}
    </g>
  );
};

export const heeren: Decorado = {
  desc: "La sala de los Heeren XVII: once directores tras una larga mesa de tapete verde y seis de espaldas en primer termino (17), gran mapa de Asia al fondo, lampara de laton, ventanas emplomadas",
  admite: "variante 'siglo18' (pelucas: los regentes de 1780); hora 'tarde' enciende las velas; semilla",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1.0 }, a: { x: 960, y: 540, z: 1.06 }, desc: "la sala y los diecisiete" },
    mesa: { de: { x: 620, y: 620, z: 1.9 }, a: { x: 1300, y: 620, z: 1.9 }, desc: "paneo a lo largo de la mesa" },
    cabecera: { de: { x: 960, y: 560, z: 2.4 }, a: { x: 960, y: 550, z: 2.7 }, desc: "el director que habla" },
    mapa: { de: { x: 960, y: 290, z: 2.0 }, a: { x: 1060, y: 300, z: 2.3 }, desc: "el mapa de Asia en la pared" },
  },
  dibujo: DibujoHeeren,
};

/* ------------------------------------------------------------------ */
/* 3. Despacho de un mercader (o de un autor) con mapas y globo        */
/* ------------------------------------------------------------------ */

const Globo: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const f = useCurrentFrame();
  const giro = (f * 0.6) % 120;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-50} y={0} width={100} height={14} fill={C.maderaOsc} />
      <path d="M -10 0 L -30 -60 L 30 -60 L 10 0 Z" fill={C.madera} />
      <defs>
        <clipPath id="vocGloboClip">
          <circle cx={0} cy={-170} r={100} />
        </clipPath>
      </defs>
      <circle cx={0} cy={-170} r={100} fill={"#D9DFC9"} />
      <g clipPath="url(#vocGloboClip)">
        {[-240, -120, 0, 120].map((k) => (
          <g key={k} transform={`translate(${k + giro} 0)`}>
            <path d="M -40 -240 Q 0 -250 20 -200 Q 10 -160 30 -120 Q 0 -100 -20 -140 Q -50 -170 -40 -240 Z" fill={"#D9C08A"} />
            <path d="M 40 -210 Q 70 -220 80 -180 Q 60 -170 40 -210 Z" fill={"#D9C08A"} />
          </g>
        ))}
        {[-60, -20, 20, 60].map((k) => (
          <ellipse key={k} cx={0} cy={-170} rx={Math.abs(k) * 1.6 + 6} ry={100} fill="none" stroke={"#9A8A6A"} strokeWidth={1} opacity={0.5} />
        ))}
      </g>
      <circle cx={0} cy={-170} r={112} fill="none" stroke={C.laton} strokeWidth={8} />
      <circle cx={-34} cy={-206} r={30} fill="#FFF" opacity={0.15} />
    </g>
  );
};

const DibujoDespacho: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const s = e.semilla ?? 4;
  const t = e.textos ?? {};
  const traje: Traje = e.variante === "siglo18" ? "peluca" : "burgues";
  const titulo = t.titulo ?? "";
  const noche = e.hora === "noche" || e.hora === "tarde";
  const avance = suaveM(f / Math.max(1, dur * 0.8));
  return (
    <g>
      <Defs />
      <Sala suelo={900} ancho={1920} pared={"#E2D6BC"} friso={190} />
      <VentanaEmplomada x={120} y={150} w={300} h={440} exterior="gabletes" luz={!noche} />
      <MapaMural x={620} y={110} w={640} h={380} titulo={t.mapa ?? "INDIAE ORIENTALIS"} />
      {/* estanteria con libros y rollos */}
      <rect x={1430} y={160} width={380} height={740} fill={C.madera} />
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <rect x={1444} y={180 + k * 140} width={352} height={122} fill={"#2E2219"} />
          {Array.from({ length: 12 }).map((_, b) => (
            <rect key={b} x={1450 + b * 28} y={196 + k * 140 + ((b * 3 + k) % 4) * 5} width={22} height={100 - ((b * 3 + k) % 4) * 5} fill={["#6A3A34", "#3E4A5A", "#5A4A3A", "#7A6A3A", "#E2D6BC"][(b + k) % 5]} />
          ))}
        </g>
      ))}
      <Globo x={300} y={900} s={1.2} />
      {/* el hombre tras su escritorio */}
      <Figura x={960} y={900} escala={1.05} traje={traje} semilla={s * 9 + 2} cuerpo="busto" pose={e.variante === "lee" ? "lee" : "escribe"} mirada={-0.2} sombrero={false} gesto={e.variante === "inquieto" ? "inquieto" : "neutro"} />
      <rect x={560} y={690} width={860} height={26} fill={C.maderaLuz} />
      <rect x={580} y={716} width={820} height={300} fill={C.madera} />
      <rect x={610} y={740} width={360} height={150} fill="none" stroke={C.maderaOsc} strokeWidth={5} />
      <rect x={1010} y={740} width={360} height={150} fill="none" stroke={C.maderaOsc} strokeWidth={5} />
      {/* sobre la mesa */}
      <LibroAbierto x={810} y={612} w={300} lineas={["Den 12 Augusti 1602", "ontfangen ..........", "betaelt ............", "............"]} escribe={avance} inclina={0.45} />
      <Tintero x={1160} y={692} s={1.1} />
      <g transform="translate(680 690)">
        <rect x={-70} y={-60} width={110} height={60} fill={"#5A3A24"} />
        <rect x={-66} y={-80} width={102} height={20} fill={"#6A4A30"} />
        <rect x={-62} y={-96} width={94} height={16} fill={"#3E4A5A"} />
      </g>
      {titulo ? (
        <g transform="translate(1270 690) rotate(-4)">
          <rect x={-90} y={-130} width={180} height={130} fill={"#F2EAD2"} stroke={"#8A7650"} strokeWidth={3} />
          <text x={0} y={-90} textAnchor="middle" fontFamily={FONT.serif} fontWeight={700} fontSize={titulo.length > 16 ? 15 : 20} fill={C.tinta}>
            {titulo.split("|")[0]}
          </text>
          <text x={0} y={-62} textAnchor="middle" fontFamily={FONT.serif} fontSize={14} fill={C.tintaSepia}>
            {titulo.split("|")[1] ?? ""}
          </text>
          <path d="M -50 -40 H 50 M -40 -26 H 40" stroke={"#9A8A6A"} strokeWidth={2} />
        </g>
      ) : (
        <Monedas x={1300} y={690} n={3} s={0.8} />
      )}
      {noche ? (
        <g>
          <rect x={1340} y={600} width={14} height={80} fill={"#F2EEE4"} />
          <rect x={1326} y={680} width={42} height={12} fill={C.laton} />
          <ellipse cx={1347} cy={592} rx={6} ry={12 + Math.sin(f * 0.5) * 2} fill={"#F2C35A"} />
          <circle cx={1347} cy={594} r={160} fill="url(#vocVela)" />
          <rect x={-300} y={-100} width={2520} height={1300} fill={"#1A1410"} opacity={0.25} />
        </g>
      ) : null}
    </g>
  );
};

export const despacho: Decorado = {
  desc: "Despacho de un mercader o autor del XVII: escritorio con libro de cuentas que se va escribiendo, tintero y pluma, globo terraqueo que gira, mapa de Blaeu en la pared, estanteria de libros, ventana emplomada; un hombre escribe tras la mesa",
  admite: "textos.titulo ('Titulo|subtitulo', papel sobre la mesa: p. ej. 'Itinerario|Linschoten, 1596'), textos.mapa (cartela del mapa); variante 'siglo18' (peluca), 'lee', 'inquieto'; hora 'noche' (vela); semilla cambia la cara",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1.0 }, a: { x: 960, y: 540, z: 1.08 }, desc: "el despacho" },
    retrato: { de: { x: 960, y: 560, z: 2.2 }, a: { x: 960, y: 540, z: 2.6 }, desc: "el hombre escribiendo, de cerca" },
    escritorio: { de: { x: 1080, y: 650, z: 2.4 }, a: { x: 1120, y: 650, z: 2.8 }, desc: "el libro, la pluma y el papel con el titulo" },
    globo: { de: { x: 360, y: 700, z: 2.2 }, a: { x: 320, y: 700, z: 2.5 }, desc: "el globo que gira junto a la ventana" },
    mapa: { de: { x: 860, y: 300, z: 2.3 }, a: { x: 1060, y: 300, z: 2.5 }, desc: "el mapa de Asia" },
  },
  dibujo: DibujoDespacho,
};

/* ------------------------------------------------------------------ */
/* 4. La oficina del declive, siglo XVIII                              */
/* ------------------------------------------------------------------ */

const DibujoDeudas: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const s = e.semilla ?? 5;
  const t = e.textos ?? {};
  const v = e.valores ?? [];
  const avance = suaveM((f - 15) / Math.max(30, dur * 0.7));
  const cifra = v.length >= 2 ? Math.round(v[0] + (v[1] - v[0]) * avance) : null;
  const total = t.cifra ?? (cifra !== null ? `ƒ ${cifra.toLocaleString("de-DE")}` : "");
  const lineas = [t.linea1 ?? "Wisselbrief ........ ƒ", t.linea2 ?? "Obligatie .......... ƒ", t.linea3 ?? "Lening Bank ........ ƒ", "....................", total ? `${t.etiqueta ?? "Schuld"}: ${total}` : "Schuld ............."];
  const nacional = e.variante === "comite";
  return (
    <g>
      <Defs />
      <Sala suelo={900} ancho={1920} pared={"#CFC6B2"} friso={200} />
      <VentanaEmplomada x={90} y={150} w={300} h={440} exterior="gris" luz={false} />
      {/* estantes con legajos atados: deudas */}
      <rect x={1380} y={120} width={460} height={780} fill={C.madera} />
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <rect x={1394} y={140} width={432} height={0} />
          <rect x={1394} y={140 + k * 150} width={432} height={132} fill={"#2E2219"} />
          {Array.from({ length: 5 }).map((_, b) => (
            <g key={b}>
              <rect x={1404 + b * 84} y={190 + k * 150 - (b % 2) * 10} width={74} height={80 + (b % 2) * 10} fill={"#E2D5B6"} />
              <path d={`M ${1404 + b * 84} ${226 + k * 150} h 74`} stroke={C.carmin} strokeWidth={4} />
              <rect x={1414 + b * 84} y={200 + k * 150 - (b % 2) * 10} width={54} height={14} fill={"#F2EAD2"} />
            </g>
          ))}
        </g>
      ))}
      <Cuadro x={520} y={150} w={240} h={180} tipo="mar" />
      {nacional ? (
        <g transform="translate(980 250)">
          <rect x={-170} y={-90} width={340} height={180} fill={"#F2EAD2"} stroke={C.maderaOsc} strokeWidth={10} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT.serif} fontSize={26} fill={C.tinta}>
            BATAAFSCHE
          </text>
          <text x={0} y={6} textAnchor="middle" fontFamily={FONT.serif} fontSize={26} fill={C.tinta}>
            REPUBLIEK
          </text>
          <text x={0} y={52} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={22} fill={C.carmin}>
            1 maart 1796
          </text>
        </g>
      ) : (
        <g transform="translate(980 250)">
          <rect x={-130} y={-80} width={260} height={160} fill={"#E2D6BC"} stroke={C.maderaOsc} strokeWidth={10} />
          <Monograma x={0} y={10} s={0.9} camara="A" color={"#6A5A44"} />
        </g>
      )}
      {/* el contable con peluca y su escritorio */}
      <Figura x={880} y={900} escala={1.0} traje="peluca" semilla={s * 11 + 1} cuerpo="busto" pose="escribe" gesto="inquieto" mirada={-0.3} sombrero={false} />
      {nacional ? <Figura x={660} y={890} escala={0.95} traje="peluca" semilla={s * 11 + 9} cuerpo="busto" pose="brazos" gesto="serio" mirada={-0.7} sombrero /> : null}
      <rect x={560} y={690} width={860} height={26} fill={C.maderaLuz} />
      <rect x={580} y={716} width={820} height={300} fill={C.madera} />
      <g>
        <path d="M 1150 690 L 1200 470 L 1560 470 L 1600 690 Z" fill={C.maderaOsc} />
        <rect x={1160} y={640} width={430} height={50} fill={C.madera} />
      </g>
      <LibroAbierto x={1200} y={430} w={360} lineas={lineas} escribe={0.6 + 0.4 * avance} rojo inclina={0.85} />
      <Tintero x={1110} y={692} />
      {/* montones de papeles sobre la mesa */}
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <rect key={k} x={600 + (k % 2) * 8} y={680 - k * 10} width={150} height={10} fill={k % 2 ? "#F2EAD2" : "#E2D5B6"} stroke={"#B9AC91"} strokeWidth={1} />
      ))}
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} x={1240 - (k % 2) * 6} y={680 - k * 10} width={140} height={10} fill={k % 2 ? "#F2EAD2" : "#E2D5B6"} stroke={"#B9AC91"} strokeWidth={1} />
      ))}
      <Cofre x={380} y={1000} s={1.0} abierto={0.4 + 0.6 * suaveM(f / 60)} vacio />
      {/* legajos atados junto al cofre y una vela sobre la mesa */}
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect x={520 + (k % 2) * 10} y={980 - k * 26} width={120} height={24} fill={k % 2 ? "#F2EAD2" : "#E2D5B6"} stroke={"#B9AC91"} />
          <path d={`M ${580 + (k % 2) * 10} ${980 - k * 26} v 24`} stroke={C.carmin} strokeWidth={4} />
        </g>
      ))}
      <rect x={734} y={600} width={14} height={80} fill={"#F2EEE4"} />
      <rect x={722} y={680} width={38} height={10} fill={C.laton} />
      <ellipse cx={741} cy={592} rx={6} ry={12 + Math.sin(f * 0.5) * 2} fill={"#F2C35A"} />
      <circle cx={741} cy={594} r={150} fill="url(#vocVela)" />
      {/* papel que cae */}
      <g transform={`translate(${520 + Math.sin(f * 0.05) * 60} ${((f * 1.6) % 900) + 100}) rotate(${Math.sin(f * 0.08) * 30})`} opacity={0.9}>
        <rect x={-30} y={-20} width={60} height={40} fill={"#F2EAD2"} stroke={"#B9AC91"} />
      </g>
    </g>
  );
};

export const deudas: Decorado = {
  desc: "Oficina de la Compañia en el XVIII, en declive: un contable con peluca escribe la deuda en rojo en el libro, legajos atados de deudas en los estantes, cofre vacio, ventana gris, un papel que cae",
  admite:
    "valores [de, a] anima la cifra de la ultima linea (en florines; sale 'ƒ 91.000.000'); o textos.cifra fijo ('ƒ 91 millones'); textos.etiqueta (por defecto 'Schuld'), linea1..3; variante 'comite' (cartel de la Republica Batava, 1 maart 1796, y un comisario)",
  tomas: {
    general: { de: { x: 960, y: 560, z: 1.0 }, a: { x: 960, y: 540, z: 1.08 }, desc: "la oficina" },
    libro: { de: { x: 1380, y: 540, z: 2.7 }, a: { x: 1390, y: 560, z: 3.1 }, desc: "la cifra de la deuda en el libro del atril" },
    contable: { de: { x: 900, y: 520, z: 2.2 }, a: { x: 940, y: 520, z: 2.5 }, desc: "el contable con peluca, preocupado" },
    legajos: { de: { x: 1600, y: 420, z: 2.2 }, a: { x: 1600, y: 560, z: 2.2 }, desc: "estantes de deudas atadas con cinta roja" },
    cofre: { de: { x: 560, y: 700, z: 1.9 }, a: { x: 620, y: 690, z: 2.0 }, desc: "el cofre vacio y abierto junto al contable y los papeles" },
  },
  dibujo: DibujoDeudas,
};

