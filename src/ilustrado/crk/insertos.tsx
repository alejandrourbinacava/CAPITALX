import React from "react";
import { interpolate } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, Defs, Humo, T, miles, oscurecer, rr, suave } from "./comun";

/**
 * Insertos a pantalla completa: la cinta del teletipo, un certificado de
 * acciones, la portada de un periodico, un certificado de oro con monedas y
 * un aviso impreso. Llevan los datos del plano en sus textos.
 */

const Mesa: React.FC<{ tono?: string }> = ({ tono = "#6E4B35" }) => (
  <g>
    <rect x={-200} y={-200} width={2320} height={1500} fill={tono} />
    {Array.from({ length: 22 }).map((_, i) => (
      <path key={i} d={`M -200 ${-150 + i * 70} Q 600 ${-170 + i * 70 + (i % 3) * 14} 2120 ${-140 + i * 70}`} stroke={oscurecer(tono, 0.86)} strokeWidth={3} fill="none" />
    ))}
  </g>
);

const Guilloche: React.FC<{ x: number; y: number; w: number; h: number; color: string }> = ({ x, y, w, h, color }) => (
  <g fill="none" stroke={color}>
    <rect x={x} y={y} width={w} height={h} strokeWidth={10} />
    <rect x={x + 18} y={y + 18} width={w - 36} height={h - 36} strokeWidth={2} />
    {Array.from({ length: Math.floor(w / 24) }).map((_, i) => (
      <g key={i}>
        <circle cx={x + 12 + i * 24} cy={y + 9} r={9} strokeWidth={1.5} />
        <circle cx={x + 12 + i * 24} cy={y + h - 9} r={9} strokeWidth={1.5} />
      </g>
    ))}
    {Array.from({ length: Math.floor(h / 24) }).map((_, i) => (
      <g key={i}>
        <circle cx={x + 9} cy={y + 12 + i * 24} r={9} strokeWidth={1.5} />
        <circle cx={x + w - 9} cy={y + 12 + i * 24} r={9} strokeWidth={1.5} />
      </g>
    ))}
  </g>
);

/* ------------------------------------------------------------------ */
/* La cinta del teletipo                                               */
/* ------------------------------------------------------------------ */

const DibujoCinta: React.FC<PropsDecorado> = ({ e, f }) => {
  const texto = e.textos?.cinta ?? "";
  const hora = e.textos?.hora ?? "";
  const avance = f * 4;
  const piezas = texto ? Array.from({ length: 4 }).map(() => texto).join("   ·   ") : "";
  return (
    <g>
      <Defs />
      <Mesa />
      {/* la maquina, a la izquierda */}
      <g transform="translate(220 540)">
        <rect x={-180} y={-150} width={300} height={300} rx={20} fill={"#2C2A26"} />
        <circle cx={-30} cy={0} r={90} fill={C.laton} />
        <circle cx={-30} cy={0} r={60} fill={"#3A3630"} />
        <g transform={`rotate(${f * 8} -30 0)`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={-34} y={-58} width={8} height={30} fill={C.latonOsc} transform={`rotate(${i * 45} -30 0)`} />
          ))}
        </g>
        <path d="M -200 -230 L -200 -150 L 140 -150 L 140 -230 Q -30 -330 -200 -230 Z" fill={"#CFE0DC"} opacity={0.25} />
      </g>
      {/* la cinta sale y cruza la pantalla */}
      <path d="M 340 520 L 2200 520 L 2200 600 L 340 600 Z" fill={"#F2EAD2"} />
      <path d="M 340 520 L 2200 520" stroke={"#D9CFB0"} strokeWidth={3} />
      <path d="M 340 600 L 2200 600" stroke={"#D9CFB0"} strokeWidth={3} />
      <clipPath id="crk-cinta">
        <rect x={340} y={520} width={1860} height={80} />
      </clipPath>
      <g clipPath="url(#crk-cinta)">
        {piezas ? (
          <T x={360 + avance - 1200} y={575} tam={40} fam="mono" color={"#2A2420"} anc="start" esp={4}>
            {piezas}
          </T>
        ) : (
          Array.from({ length: 40 }).map((_, i) => <rect key={i} x={360 + ((i * 70 + avance) % 2000)} y={548} width={30 + (i % 4) * 10} height={22} fill={"#5A524A"} opacity={0.5} />)
        )}
      </g>
      {/* rizos de cinta sobre la mesa */}
      {Array.from({ length: 5 }).map((_, i) => (
        <path key={i} d={`M ${500 + i * 280} 700 q 120 ${120 + (i % 2) * 60} 240 ${20 + i * 10} t 200 ${80 + i * 10}`} stroke={"#F2EAD2"} strokeWidth={60} fill="none" opacity={0.9} />
      ))}
      {hora ? (
        <g transform="translate(1600 220)">
          <circle r={130} fill={C.maderaOsc} />
          <circle r={110} fill={"#F2ECDD"} />
          {Array.from({ length: 12 }).map((_, k) => (
            <rect key={k} x={-2} y={-104} width={4} height={14} fill={C.tinta} transform={`rotate(${k * 30})`} />
          ))}

          <rect x={-3} y={-70} width={6} height={72} fill={C.tinta} transform={`rotate(${210 + f * 0.05})`} />
          <rect x={-2} y={-96} width={4} height={98} fill={C.carmin} transform={`rotate(${f * 6})`} />
          <circle r={7} fill={C.laton} />
          <rect x={-120} y={146} width={240} height={56} rx={6} fill={"#F2ECDD"} />
          <T x={0} y={186} tam={34} fam="serif" color={C.tinta}>
            {hora}
          </T>
        </g>
      ) : null}
    </g>
  );
};

export const CINTA: Decorado = {
  desc: "Inserto: la cinta del teletipo saliendo de la maquina y cruzando la pantalla, con rizos de papel sobre la mesa. Opcional: un reloj con la hora.",
  admite: "textos.cinta (lo que va impreso en la cinta, que corre), textos.hora (texto bajo el reloj, p. ej. '7:08 P.M.')",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 540, z: 1.06 }, desc: "la maquina y la cinta" },
    cinta: { de: { x: 1000, y: 560, z: 2.0 }, a: { x: 1200, y: 560, z: 2.0 }, desc: "la cinta de cerca, con su texto" },
    reloj: { de: { x: 1500, y: 360, z: 1.7 }, a: { x: 1550, y: 330, z: 1.9 }, desc: "el reloj y la cinta (si textos.hora)" },
  },
  dibujo: DibujoCinta,
};

/* ------------------------------------------------------------------ */
/* Certificado de acciones                                             */
/* ------------------------------------------------------------------ */

const DibujoCertificado: React.FC<PropsDecorado> = ({ e, f }) => {
  const empresa = (e.textos?.empresa ?? "").toUpperCase();
  const acciones = e.textos?.acciones ?? "";
  const valor = e.textos?.valor ?? "";
  const sello = e.textos?.sello ?? "";
  const tinta = e.variante === "verde" ? "#2E5A4E" : e.variante === "azul" ? "#2A3F6A" : "#7A3B2A";
  const brillo = ((f * 9) % 2600) - 400;
  return (
    <g>
      <Defs />
      <Mesa tono={"#4A3A2E"} />
      <g transform="translate(960 540) rotate(-2) translate(-960 -540)">
        <rect x={180} y={130} width={1560} height={840} fill={"#000"} opacity={0.25} transform="translate(14 16)" />
        <rect x={180} y={130} width={1560} height={840} fill={"#F2EAD2"} />
        <Guilloche x={210} y={160} w={1500} h={780} color={tinta} />
        {/* vineta alegorica */}
        <g transform="translate(960 330)">
          <ellipse rx={260} ry={120} fill={oscurecer("#F2EAD2", 0.92)} stroke={tinta} strokeWidth={4} />
          <path d="M -200 60 Q -100 -40 0 30 Q 100 -60 200 50" fill="none" stroke={tinta} strokeWidth={3} />
          <path d="M -40 70 L -30 -40 Q 0 -80 30 -40 L 40 70 Z" fill={tinta} opacity={0.6} />
          <circle cx={0} cy={-62} r={18} fill={tinta} opacity={0.6} />
          <path d="M 30 -30 L 120 -90" stroke={tinta} strokeWidth={6} opacity={0.6} />
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M ${-260 + i * 65} 100 L ${-230 + i * 65} 0`} stroke={tinta} strokeWidth={1.5} opacity={0.4} />
          ))}
        </g>
        <T x={960} y={530} tam={empresa.length > 24 ? 50 : 64} fam="serif" color={tinta} esp={4}>
          {empresa}
        </T>
        <rect x={500} y={560} width={920} height={3} fill={tinta} opacity={0.5} />
        <T x={960} y={620} tam={30} fam="serif" color={C.tintaSuave} esp={6}>
          CAPITAL STOCK
        </T>
        {/* casillas de numero y acciones */}
        {[300, 1420].map((cx, k) => (
          <g key={k} transform={`translate(${cx} 300)`}>
            <rect x={-80} y={-60} width={200} height={120} fill={"#F7F1E0"} stroke={tinta} strokeWidth={4} />
            <T x={20} y={-22} tam={18} color={tinta} esp={4}>
              {k === 0 ? "No." : "SHARES"}
            </T>
            <T x={20} y={34} tam={k === 1 && acciones ? 40 : 30} fam="serif" color={C.tinta}>
              {k === 1 ? acciones : ""}
            </T>
          </g>
        ))}
        {valor ? (
          <g transform="translate(960 730)">
            <rect x={-200} y={-50} width={400} height={84} rx={8} fill={"#F7F1E0"} stroke={tinta} strokeWidth={3} />
            <T x={0} y={12} tam={46} fam="serif" color={C.tinta}>
              {valor}
            </T>
          </g>
        ) : null}
        {/* firmas y sello */}
        <path d="M 360 860 q 40 -40 80 0 t 80 -10 t 60 10" stroke={C.tintaSuave} strokeWidth={3} fill="none" />
        <rect x={340} y={872} width={300} height={2} fill={C.tintaSuave} />
        <path d="M 1300 860 q 30 -30 70 0 t 70 -20 t 80 10" stroke={C.tintaSuave} strokeWidth={3} fill="none" />
        <rect x={1280} y={872} width={300} height={2} fill={C.tintaSuave} />
        <g transform="translate(960 860)">
          <circle r={60} fill={C.carmin} opacity={0.85} />
          <circle r={48} fill="none" stroke={"#F2EAD2"} strokeWidth={3} />
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x={-2} y={-60} width={4} height={10} fill={"#F2EAD2"} transform={`rotate(${i * 22.5})`} />
          ))}
        </g>
        {sello ? (
          <g transform="translate(1200 480) rotate(-14)">
            <rect x={-260} y={-60} width={520} height={120} fill="none" stroke={C.carmin} strokeWidth={10} opacity={0.85} />
            <T x={0} y={24} tam={70} color={C.carmin} esp={6} op={0.85}>
              {sello}
            </T>
          </g>
        ) : null}
        {/* reflejo que pasa */}
        <rect x={brillo} y={130} width={120} height={840} fill={"#FFFFFF"} opacity={0.08} transform={`skewX(-20)`} />
      </g>
    </g>
  );
};

export const CERTIFICADO: Decorado = {
  desc: "Inserto: un certificado de acciones de los veinte sobre una mesa: orla guilloche, vineta alegorica, nombre de la empresa, casillas de numero y acciones, firmas y sello rojo; un reflejo de luz lo recorre.",
  admite: "textos.empresa (nombre de la sociedad), textos.acciones (cifra en la casilla SHARES), textos.valor (cifra en el centro, p. ej. '$104'), textos.sello (sello estampado en diagonal); variante granate (por defecto) | verde | azul",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1.02 }, a: { x: 960, y: 540, z: 1.1 }, desc: "el certificado entero" },
    nombre: { de: { x: 960, y: 480, z: 1.8 }, a: { x: 960, y: 500, z: 2.0 }, desc: "el nombre de la empresa y la vineta" },
    valor: { de: { x: 1100, y: 640, z: 1.7 }, a: { x: 1060, y: 680, z: 1.9 }, desc: "el valor y el sello" },
  },
  dibujo: DibujoCertificado,
};

/* ------------------------------------------------------------------ */
/* Portada de periodico                                                */
/* ------------------------------------------------------------------ */

const DibujoPeriodico: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const cab = e.textos?.cabecera ?? "THE MORNING LEDGER";
  const titular = (e.textos?.titular ?? "").toUpperCase();
  const sub = e.textos?.sub ?? "";
  const fecha = e.textos?.fecha ?? "";
  const lineas = titular.split("|");
  const t = suave(f / Math.max(1, dur * 0.25));
  const giro = interpolate(t, [0, 1], [-8, -2]);
  const esc = interpolate(t, [0, 1], [1.15, 1]);
  return (
    <g>
      <Defs />
      <Mesa tono={"#5A4636"} />
      {/* taza de cafe */}
      <g transform="translate(1720 860)">
        <ellipse cx={0} cy={0} rx={150} ry={40} fill={"#E9E2D2"} />
        <path d="M -90 -120 L 90 -120 L 76 0 L -76 0 Z" fill={"#F2ECDD"} />
        <ellipse cx={0} cy={-120} rx={90} ry={22} fill={"#4A2E1E"} />
        <path d="M 90 -100 Q 150 -90 130 -40 Q 110 -20 80 -30" fill="none" stroke={"#F2ECDD"} strokeWidth={16} />
        <Humo x={0} y={-140} s={0.6} color={"#F2ECDD"} n={5} />
      </g>
      <g transform={`translate(900 540) rotate(${giro}) scale(${esc}) translate(-900 -540)`}>
        <rect x={260} y={20} width={1280} height={1100} fill={"#000"} opacity={0.25} transform="translate(16 18)" />
        <rect x={260} y={20} width={1280} height={1100} fill={"#EFE8D6"} />
        <T x={900} y={150} tam={cab.length > 20 ? 84 : 100} fam="serif" color={C.tinta}>
          {cab}
        </T>
        <rect x={300} y={180} width={1200} height={4} fill={C.tinta} />
        <rect x={300} y={220} width={1200} height={2} fill={C.tinta} />
        <T x={300} y={210} tam={20} fam="serif" color={C.tintaSuave} anc="start" esp={2}>
          {fecha}
        </T>
        <T x={1500} y={210} tam={20} fam="serif" color={C.tintaSuave} anc="end" esp={2}>
          {"LATE CITY EDITION"}
        </T>
        {lineas.map((l, i) => (
          <T key={i} x={900} y={330 + i * 112} tam={l.length > 22 ? 78 : 100} color={C.tinta} esp={1}>
            {l}
          </T>
        ))}
        {sub ? (
          <T x={900} y={330 + lineas.length * 112 - 20} tam={34} fam="serif" color={C.tintaSuave}>
            {sub}
          </T>
        ) : null}
        <rect x={300} y={330 + lineas.length * 112} width={1200} height={3} fill={C.tinta} />
        {/* columnas de texto ilegible y una foto */}
        {Array.from({ length: 6 }).map((_, c) => (
          <g key={c}>
            {c === 2 || c === 3 ? null : (
              Array.from({ length: 30 }).map((__, l) => (
                <rect key={l} x={310 + c * 200} y={360 + lineas.length * 112 + l * 18} width={l % 7 === 6 ? 100 : 176} height={7} fill={"#A89E88"} />
              ))
            )}
            {c > 0 ? <rect x={300 + c * 200} y={350 + lineas.length * 112} width={2} height={560} fill={"#A89E88"} /> : null}
          </g>
        ))}
        <rect x={710} y={370 + lineas.length * 112} width={380} height={260} fill={"#8E8778"} />
        <rect x={730} y={390 + lineas.length * 112} width={340} height={220} fill={"#A39C8C"} />
        <path d={`M 730 ${590 + lineas.length * 112} L 830 ${480 + lineas.length * 112} L 900 ${540 + lineas.length * 112} L 980 ${450 + lineas.length * 112} L 1070 ${590 + lineas.length * 112} Z`} fill={"#7A7466"} />
        {Array.from({ length: 12 }).map((_, l) => (
          <rect key={l} x={710} y={650 + lineas.length * 112 + l * 18} width={l % 5 === 4 ? 200 : 380} height={7} fill={"#A89E88"} />
        ))}
      </g>
    </g>
  );
};

export const PERIODICO: Decorado = {
  desc: "Inserto: la portada de un periodico de la epoca sobre una mesa, con taza de cafe humeando. El titular grande, la cabecera, la fecha y columnas de texto ilegible con una foto. Entra girando un poco.",
  admite: "textos.titular (lineas separadas por '|'), textos.sub (subtitulo), textos.cabecera (por defecto THE MORNING LEDGER), textos.fecha",
  tomas: {
    general: { de: { x: 960, y: 540, z: 0.98 }, a: { x: 940, y: 520, z: 1.06 }, desc: "la portada entera" },
    titular: { de: { x: 900, y: 360, z: 1.5 }, a: { x: 900, y: 360, z: 1.7 }, desc: "el titular de cerca" },
    cabecera: { de: { x: 760, y: 180, z: 2.2 }, a: { x: 1040, y: 180, z: 2.2 }, desc: "la cabecera y la fecha" },
  },
  dibujo: DibujoPeriodico,
};

/* ------------------------------------------------------------------ */
/* Certificado de oro y monedas                                        */
/* ------------------------------------------------------------------ */

const Moneda: React.FC<{ x: number; y: number; s?: number; canto?: boolean }> = ({ x, y, s = 1, canto }) =>
  canto ? (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={70} ry={16} fill={"#B88A2A"} />
      <rect x={-70} y={-12} width={140} height={12} fill={"#9C7420"} />
      <ellipse cx={0} cy={-12} rx={70} ry={16} fill={"#E0B54A"} />
      <ellipse cx={0} cy={-12} rx={56} ry={11} fill="none" stroke={"#B88A2A"} strokeWidth={2} />
    </g>
  ) : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={70} fill={"#C99A34"} />
      <circle r={62} fill={"#E0B54A"} />
      <circle r={52} fill="none" stroke={"#B88A2A"} strokeWidth={3} />
      <path d="M -24 30 L -20 -10 Q -10 -36 10 -30 Q 26 -24 22 0 L 26 30 Z" fill={"#C99A34"} />
      {Array.from({ length: 13 }).map((_, i) => (
        <circle key={i} cx={Math.cos((i / 13) * Math.PI * 2) * 44} cy={Math.sin((i / 13) * Math.PI * 2) * 44} r={3} fill={"#B88A2A"} />
      ))}
    </g>
  );

const DibujoBillete: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const valor = e.textos?.valor ?? "";
  const tipo = (e.textos?.tipo ?? "GOLD CERTIFICATE").toUpperCase();
  const precio = e.textos?.precio ?? "";
  const v = e.valores ?? [];
  const t = suave(f / Math.max(1, dur * 0.8));
  const cifra = precio || (v.length >= 2 ? `$${miles(interpolate(t, [0, 1], [v[0], v[1]]), 2)}` : "");
  const caen = Math.min(9, Math.floor(f / 10));
  return (
    <g>
      <Defs />
      <Mesa tono={"#2F4A3F"} />
      {/* el certificado de oro */}
      <g transform="translate(720 480) rotate(-6)">
        <rect x={-520} y={-240} width={1040} height={480} fill={"#000"} opacity={0.25} transform="translate(12 14)" />
        <rect x={-520} y={-240} width={1040} height={480} fill={"#EFE3C0"} />
        <Guilloche x={-500} y={-220} w={1000} h={440} color={"#B07A1E"} />
        <rect x={-480} y={-200} width={960} height={400} fill={"#E8B33C"} opacity={0.18} />
        <T x={0} y={-120} tam={50} fam="serif" color={"#8A5A12"} esp={6}>
          {tipo}
        </T>
        <T x={0} y={-60} tam={24} fam="serif" color={C.tintaSuave} esp={4}>
          THE UNITED STATES OF AMERICA
        </T>
        {valor
          ? [
              [-400, -150],
              [400, -150],
              [-400, 160],
              [400, 160],
            ].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r={50} fill={"#F7EED2"} stroke={"#B07A1E"} strokeWidth={4} />
                <T x={cx} y={cy + 16} tam={valor.length > 3 ? 30 : 44} fam="serif" color={"#8A5A12"}>
                  {valor}
                </T>
              </g>
            ))
          : null}
        <g transform="translate(0 70)">
          <ellipse rx={120} ry={90} fill={"#F7EED2"} stroke={"#B07A1E"} strokeWidth={4} />
          <path d="M -50 80 Q -56 -10 -20 -40 Q 0 -60 24 -40 Q 56 -10 50 80 Z" fill={"#B07A1E"} opacity={0.5} />
          <circle cx={0} cy={-34} r={30} fill={"#B07A1E"} opacity={0.5} />
        </g>
        <rect x={-300} y={190} width={600} height={4} fill={"#B07A1E"} opacity={0.6} />
      </g>
      {/* monedas que caen sobre la pila */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Moneda key={i} x={1480} y={900 - i * 14} s={1.1} canto />
      ))}
      {Array.from({ length: caen }).map((_, i) => (
        <Moneda key={i} x={1480} y={900 - (10 + i) * 14} s={1.1} canto />
      ))}
      {f % 10 < 8 && caen < 9 ? <Moneda x={1480} y={900 - (10 + caen) * 14 - (8 - (f % 10)) * 30} s={1.1} canto /> : null}
      <Moneda x={1720} y={720} s={1.3} />
      <Moneda x={1260} y={960} s={1.0} />
      {cifra ? (
        <g transform="translate(1560 330)">
          <rect x={-250} y={-80} width={500} height={150} rx={10} fill={"#F2ECDD"} />
          <T x={0} y={-30} tam={24} color={C.tintaSuave} esp={4}>
            {e.textos?.etiqueta ?? "ONZA DE ORO"}
          </T>
          <T x={0} y={44} tam={64} fam="serif" color={C.tinta}>
            {cifra}
          </T>
        </g>
      ) : null}
      {Array.from({ length: 6 }).map((_, i) => (
        <circle key={i} cx={1300 + rr(i, 3) * 400} cy={600 + rr(i, 4) * 300} r={4 + 3 * Math.abs(Math.sin(f * 0.1 + i))} fill={"#FFF6D0"} opacity={0.6 * Math.abs(Math.sin(f * 0.08 + i * 2))} />
      ))}
    </g>
  );
};

export const BILLETE: Decorado = {
  desc: "Inserto: un certificado de oro sobre un tapete verde con monedas de oro que caen sobre una pila; opcional, una etiqueta con el precio de la onza (fija o contando).",
  admite: "textos.tipo (por defecto GOLD CERTIFICATE), textos.valor (cifra de las esquinas, p. ej. '20'), textos.precio (cifra fija de la etiqueta) o valores [de, a] (la etiqueta cuenta en dolares), textos.etiqueta (por defecto ONZA DE ORO)",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 980, y: 540, z: 1.06 }, desc: "el certificado y las monedas" },
    certificado: { de: { x: 720, y: 480, z: 1.6 }, a: { x: 720, y: 480, z: 1.8 }, desc: "el certificado de oro de cerca" },
    monedas: { de: { x: 1520, y: 640, z: 1.8 }, a: { x: 1520, y: 600, z: 2.0 }, desc: "la pila de monedas y la etiqueta del precio" },
  },
  dibujo: DibujoBillete,
};

/* ------------------------------------------------------------------ */
/* Aviso impreso pegado en una pared                                   */
/* ------------------------------------------------------------------ */

const DibujoAviso: React.FC<PropsDecorado> = ({ e, f }) => {
  const titulo = (e.textos?.titulo ?? "").toUpperCase();
  const cuerpo = (e.textos?.cuerpo ?? "").split("|").filter(Boolean);
  const pie = e.textos?.pie ?? "";
  const madera = e.variante === "madera";
  const ondea = Math.sin(f * 0.12) * 6;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-200} width={2320} height={1500} fill={madera ? "url(#crk-tablas)" : "url(#crk-ladrillo)"} />
      {/* restos de carteles viejos */}
      <rect x={60} y={120} width={300} height={420} fill={"#D9CFB8"} opacity={0.5} transform="rotate(-4 210 330)" />
      <rect x={1580} y={600} width={280} height={380} fill={"#C9B898"} opacity={0.5} transform="rotate(5 1720 790)" />
      <g transform="translate(960 540) rotate(-1.5)">
        <rect x={-520} y={-480} width={1040} height={960} fill={"#000"} opacity={0.25} transform="translate(12 14)" />
        <path d={`M -520 -480 L 520 -480 L 520 ${440 + ondea} L ${480 + ondea} 480 L -520 480 Z`} fill={"#F2ECDD"} />
        <rect x={-480} y={-440} width={960} height={4} fill={C.tinta} />
        <T x={0} y={-330} tam={titulo.length > 22 ? 56 : 80} color={C.tinta} esp={2}>
          {titulo}
        </T>
        <rect x={-480} y={-290} width={960} height={4} fill={C.tinta} />
        {cuerpo.map((l, i) => (
          <T key={i} x={0} y={-190 + i * 76} tam={l.length > 34 ? 36 : 46} fam="serif" color={i === 0 ? C.carmin : C.tinta}>
            {l}
          </T>
        ))}
        {Array.from({ length: 6 }).map((_, l) => (
          <rect key={l} x={-400} y={-170 + cuerpo.length * 76 + l * 26} width={l % 3 === 2 ? 500 : 800} height={8} fill={"#B6AD96"} />
        ))}
        {pie ? (
          <T x={0} y={410} tam={28} fam="serif" color={C.tintaSuave} esp={3}>
            {pie}
          </T>
        ) : null}
        {[
          [-500, -460],
          [500, -460],
          [-500, 460],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={9} fill={"#6E6A60"} />
        ))}
      </g>
    </g>
  );
};

export const AVISO: Decorado = {
  desc: "Inserto: un aviso oficial impreso pegado con chinchetas en una pared de ladrillo (o de tablas), con titulo grande, lineas de texto y pie; una esquina se mueve con el aire.",
  admite: "textos.titulo, textos.cuerpo (lineas separadas por '|'; la primera en rojo), textos.pie; variante 'madera' (pared de tablas)",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 540, z: 1.06 }, desc: "el aviso entero en la pared" },
    titulo: { de: { x: 960, y: 260, z: 1.7 }, a: { x: 960, y: 280, z: 1.85 }, desc: "el titulo de cerca" },
    texto: { de: { x: 960, y: 520, z: 1.5 }, a: { x: 960, y: 560, z: 1.65 }, desc: "las lineas del aviso" },
  },
  dibujo: DibujoAviso,
};
