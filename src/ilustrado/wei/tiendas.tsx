import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { Billete, Defs, FUENTE, Fajo, Lampara, Monton, Reloj, Rotulo, SueloInterior, VentanaInterior, W, cifraEn, oscurecer, puntos, rr, sv, toma } from "./base";
import { Andante, Carretilla, CestoBilletes, Figura } from "./gente";

/** Mostrador de madera con cuarterones; la tapa queda en `y`. */
export const Mostrador: React.FC<{ x: number; y: number; w: number; h?: number; tono?: string; tapa?: string }> = ({ x, y, w, h = 190, tono = W.maderaMedia, tapa = W.maderaLuz }) => {
  const n = Math.max(2, Math.round(w / 170));
  const paso = w / n;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={tono} />
      {Array.from({ length: n }).map((_, i) => (
        <g key={i}>
          <rect x={x + i * paso + 16} y={y + 30} width={paso - 32} height={h - 54} rx={4} fill={oscurecer(tono, 0.9)} />
          <rect x={x + i * paso + 26} y={y + 40} width={paso - 52} height={h - 74} rx={3} fill="none" stroke={oscurecer(tono, 0.75)} strokeWidth={3} />
        </g>
      ))}
      <rect x={x - 14} y={y - 16} width={w + 28} height={22} fill={tapa} />
      <rect x={x - 14} y={y + 4} width={w + 28} height={6} fill={oscurecer(tapa, 0.7)} />
      <rect x={x} y={y + h - 14} width={w} height={14} fill={oscurecer(tono, 0.7)} />
    </g>
  );
};

/** Pizarra de precios en tiza con la cifra que cambia. */
const PizarraPrecio: React.FC<{ x: number; y: number; w: number; h: number; titulo: string; producto: string; cifra: string; unidad: string; fecha?: string; tachados?: string[] }> = ({
  x,
  y,
  w,
  h,
  titulo,
  producto,
  cifra,
  unidad,
  fecha,
  tachados = [],
}) => {
  const tam = cifra.length > 13 ? 50 : cifra.length > 9 ? 62 : 80;
  return (
    <g>
      <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} rx={6} fill={W.madera} />
      <rect x={x} y={y} width={w} height={h} fill={W.pizarra} />
      <path d={`M ${x + 30} ${y + h - 40} Q ${x + 120} ${y + h - 60} ${x + 240} ${y + h - 30}`} stroke={"#fff"} strokeWidth={14} opacity={0.04} fill="none" />
      <text x={x + w / 2} y={y + 56} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={46} fill={W.tiza}>
        {titulo}
      </text>
      <line x1={x + 40} x2={x + w - 40} y1={y + 74} y2={y + 74} stroke={W.tiza} strokeWidth={2} opacity={0.6} />
      <text x={x + w / 2} y={y + 120} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={36} fill={"#CFD5CC"}>
        {producto}
      </text>
      {tachados.map((t, i) => (
        <g key={i} opacity={0.55}>
          <text x={x + w / 2} y={y + 170 + i * 40} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={32} fill={W.tiza}>
            {t}
          </text>
          <line x1={x + w / 2 - t.length * 8} x2={x + w / 2 + t.length * 8} y1={y + 160 + i * 40} y2={y + 160 + i * 40} stroke={W.tiza} strokeWidth={3} />
        </g>
      ))}
      <text x={x + w / 2} y={y + h - 92} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={tam} fill={W.tiza}>
        {cifra}
      </text>
      <text x={x + w / 2} y={y + h - 46} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={34} fill={"#E7C979"}>
        {unidad}
      </text>
      {fecha ? (
        <text x={x + w - 24} y={y + h - 14} textAnchor="end" fontFamily={FUENTE.serif} fontSize={24} fill={"#BFC6BE"}>
          {fecha}
        </text>
      ) : null}
      <rect x={x - 10} y={y + h + 8} width={w + 20} height={10} fill={W.maderaLuz} />
      <rect x={x + w - 80} y={y + h + 2} width={36} height={7} fill={W.tiza} />
    </g>
  );
};

/** Hogaza, panecillo o pretzel. */
const Pan: React.FC<{ x: number; y: number; tipo: number; s?: number }> = ({ x, y, tipo, s = 1 }) => {
  const t = tipo % 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {t === 0 ? (
        <g>
          <ellipse cx={0} cy={-18} rx={44} ry={22} fill={"#8E5A32"} />
          <ellipse cx={-6} cy={-24} rx={34} ry={12} fill={"#A86E3E"} />
          <path d="M -24 -24 L -16 -14 M -6 -28 L 2 -16 M 12 -26 L 20 -16" stroke={"#C9925A"} strokeWidth={3} />
        </g>
      ) : t === 1 ? (
        <g>
          <ellipse cx={0} cy={-12} rx={22} ry={14} fill={"#C08A4E"} />
          <path d="M -10 -18 Q 0 -8 10 -18" stroke={"#8E5A32"} strokeWidth={3} fill="none" />
        </g>
      ) : (
        <path d="M -24 -6 Q -30 -36 -6 -30 Q 6 -22 0 -10 Q -6 -22 6 -30 Q 30 -36 24 -6 Q 10 4 0 -10 Q -10 4 -24 -6 Z" fill="none" stroke={"#9A6236"} strokeWidth={8} />
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Panaderia                                                           */
/* ------------------------------------------------------------------ */

const Panaderia: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const s = e.semilla ?? 3;
  const gente = e.gente ?? 0.7;
  const precio = cifraEn(e.valores, f, dur, [250, 69000]);
  const unidad = e.textos?.unidad ?? "Mark";
  const producto = e.textos?.producto ?? "Roggenbrot 1 kg";
  const fecha = e.textos?.fecha;
  const cifra = e.textos?.cifra ?? puntos(precio);
  const suelo = 860;
  const nCola = Math.round(1 + gente * 3);
  const fajoX = 900 - sv((f - 30) / 60) * 120;
  return (
    <g>
      <Defs />
      {/* pared: azulejo abajo, papel arriba */}
      <rect x={-200} y={-100} width={2320} height={1300} fill="url(#w-papelPintado)" />
      <rect x={-200} y={420} width={2320} height={460} fill="url(#w-azulejo)" />
      <rect x={-200} y={410} width={2320} height={14} fill={W.maderaMedia} />
      {/* ventana a la calle a la izquierda */}
      <VentanaInterior x={60} y={130} w={340} h={360} hora={e.hora} cortinas={"#6B4A30"} />
      {/* estanterias de pan */}
      <g>
        <rect x={760} y={70} width={720} height={560} fill={W.madera} />
        {[0, 1, 2, 3].map((k) => (
          <g key={k}>
            <rect x={780} y={90 + k * 132} width={680} height={112} fill={"#4A3222"} />
            <rect x={770} y={198 + k * 132} width={700} height={14} fill={W.maderaLuz} />
            {Array.from({ length: k === 0 ? 7 : 6 }).map((_, i) =>
              rr(i + k * 9, s) > 0.18 + (e.variante === "vacia" ? 0.6 : 0) ? <Pan key={i} x={830 + i * (k === 0 ? 96 : 110)} y={200 + k * 132} tipo={k + i} s={k === 0 ? 0.8 : 1} /> : null
            )}
          </g>
        ))}
        <rect x={750} y={50} width={740} height={30} fill={W.maderaLuz} />
        <Rotulo x={860} y={6} w={520} h={46} texto="Brot und Backwaren" fondo={W.madera} />
      </g>
      {/* pizarra de precios */}
      <PizarraPrecio x={1540} y={90} w={330} h={400} titulo="Preise" producto={producto} cifra={cifra} unidad={unidad} fecha={fecha} tachados={e.textos?.antes ? e.textos.antes.split("|") : []} />
      <Reloj x={600} y={220} r={56} rapido={3} />
      <Lampara x={1120} y={20} largo={60} tipo="tulipa" />
      <SueloInterior y={suelo} tipo="baldosa" />
      {/* panadero tras el mostrador */}
      <Figura x={1180} y={870} semilla={s + 11} ropa="panadero" cuerpo="busto" pose="habla" mirada={-0.7} gesto="inquieto" escala={1.02} />
      <Figura x={1400} y={870} semilla={s + 12} ropa="mujer" tocado="ninguno" cuerpo="busto" pose="cuenta" mirada={-0.4} gesto="serio" escala={0.98}
        enManos={<g><Billete x={-30} y={20} w={70} giro={-8} tono={1} /><Billete x={26} y={18} w={70} giro={10} tono={2} /></g>} />
      <Mostrador x={700} y={700} w={1300} h={170} />
      {/* caja registradora, balanza y fajos */}
      <g transform="translate(1720 684)">
        <path d="M -70 0 L 70 0 L 60 -90 L -60 -90 Z" fill={W.laton} />
        <rect x={-50} y={-130} width={100} height={44} fill={"#B08A2A"} />
        <rect x={-36} y={-124} width={72} height={30} fill={"#F2ECDA"} />
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i} cx={-44 + (i % 6) * 18} cy={-60 + Math.floor(i / 6) * 22} r={6} fill={"#F2ECDA"} />
        ))}
      </g>
      <g transform="translate(980 684)">
        <rect x={-6} y={-90} width={12} height={90} fill={W.hierro} />
        <rect x={-90} y={-96} width={180} height={8} fill={W.hierro} transform={`rotate(${Math.sin(f * 0.05) * 3} 0 -92)`} />
        <path d="M -110 -88 L -50 -88 L -60 -70 L -100 -70 Z" fill={W.laton} />
        <path d="M 50 -88 L 110 -88 L 100 -70 L 60 -70 Z" fill={W.laton} />
      </g>
      <Fajo x={fajoX} y={684} w={110} alto={34} tono={0} />
      <Fajo x={fajoX + 30} y={652} w={100} alto={26} tono={2} />
      <Pan x={1300} y={690} tipo={0} />
      {/* cola de clientas con cestos de billetes */}
      {Array.from({ length: nCola }).map((_, i) => (
        <Andante key={i} x0={560 - i * 170} y={1040 - (i % 2) * 8} v={0} escala={0.92} semilla={s * 13 + i} ropa={i % 3 === 1 ? "obrero" : "mujer"} lleva={i % 2 ? "bolso" : "cesto"} />
      ))}
    </g>
  );
};

export const panaderia: Decorado = {
  desc: "Panaderia berlinesa: estanterias de hogazas, mostrador con caja registradora y balanza, panadero que habla, dependienta que cuenta billetes, cola de clientas con cestos y la pizarra de precios en tiza.",
  admite:
    "valores [de, a, ...] precio que corre en la pizarra (en marcos); textos.producto ('Roggenbrot 1 kg'), textos.unidad ('Mark' o 'Pfennig'), textos.cifra (texto fijo en lugar de la cifra), textos.fecha ('Januar 1923'), textos.antes (precios tachados separados por |); variante 'vacia' (estantes casi vacios); gente 0..1",
  tomas: {
    general: toma([960, 540, 1], [960, 560, 1.07], "la tienda entera"),
    pizarra: toma([1660, 330, 1.9], [1705, 290, 2.4], "la pizarra con el precio"),
    panadero: toma([1180, 600, 2.2], [1190, 560, 2.7], "primer plano del panadero"),
    mostrador: toma([1100, 620, 1.9], [1000, 640, 2.2], "billetes y caja sobre el mostrador"),
    cola: toma([500, 700, 1.6], [620, 680, 1.8], "la cola de clientas con cestos"),
  },
  dibujo: Panaderia,
};

/* ------------------------------------------------------------------ */
/* Casa de cambio                                                      */
/* ------------------------------------------------------------------ */

const Cambio: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const s = e.semilla ?? 5;
  const gente = e.gente ?? 0.7;
  const valor = cifraEn(e.valores, f, dur, [7260, 49000]);
  const moneda = e.textos?.moneda ?? "1 Dollar";
  const titulo = e.textos?.titulo ?? "Devisenkurse";
  const fecha = e.textos?.fecha ?? "Berlin";
  const otras = (e.textos?.otras ?? "1 Pfund|1 Gulden|1 Franken").split("|");
  const cifra = e.textos?.cifra ?? puntos(valor);
  const parpadeo = Math.floor(f / 6) % 2;
  const suelo = 880;
  const n = Math.round(2 + gente * 4);
  return (
    <g>
      <Defs />
      <rect x={-200} y={-100} width={2320} height={1300} fill={"#5E4A38"} />
      <rect x={-200} y={-100} width={2320} height={1300} fill="url(#w-papelVerde)" opacity={0.35} />
      {/* boiserie */}
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={i}>
          <rect x={-160 + i * 260} y={600} width={230} height={280} rx={6} fill={W.maderaMedia} />
          <rect x={-146 + i * 260} y={614} width={202} height={252} rx={4} fill="none" stroke={W.madera} strokeWidth={4} />
        </g>
      ))}
      {/* tablero de cotizaciones */}
      <g>
        <rect x={420} y={40} width={1080} height={520} rx={8} fill={W.madera} />
        <rect x={440} y={60} width={1040} height={480} fill={"#1E2422"} />
        <text x={960} y={124} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={62} fill={W.tiza}>
          {titulo}
        </text>
        <text x={960} y={164} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={30} fill={"#BFC6BE"} letterSpacing={4}>
          {fecha}
        </text>
        <line x1={480} x2={1440} y1={184} y2={184} stroke={W.tiza} strokeWidth={2} opacity={0.5} />
        {/* fila principal */}
        <rect x={470} y={204} width={980} height={130} fill={"#2C3431"} />
        <text x={500} y={290} fontFamily={FUENTE.serif} fontSize={58} fill={W.ocre}>
          {moneda}
        </text>
        <text x={1430} y={290} textAnchor="end" fontFamily={FUENTE.mono} fontSize={cifra.length > 16 ? 44 : 60} fill={W.tiza}>
          {cifra}
        </text>
        <text x={1430} y={322} textAnchor="end" fontFamily={FUENTE.serif} fontSize={24} fill={"#BFC6BE"}>
          Mark
        </text>
        <circle cx={1456} cy={220} r={7} fill={W.carmin} opacity={parpadeo ? 1 : 0.3} />
        {otras.slice(0, 3).map((o, i) => (
          <g key={i}>
            <text x={500} y={392 + i * 54} fontFamily={FUENTE.serif} fontSize={38} fill={"#CFD5CC"}>
              {o}
            </text>
            <rect x={1080} y={364 + i * 54} width={340} height={34} fill={"#2C3431"} />
            {Array.from({ length: 8 }).map((_, k) => (
              <rect key={k} x={1100 + k * 40} y={372 + i * 54} width={26} height={18} fill={"#4A524E"} />
            ))}
          </g>
        ))}
        <rect x={430} y={548} width={1060} height={14} fill={W.maderaLuz} />
      </g>
      <Reloj x={1700} y={200} r={64} rapido={4} />
      <Lampara x={250} y={30} largo={80} tipo="verde" />
      <Lampara x={1700} y={420} largo={420} tipo="verde" />
      <SueloInterior y={suelo} tipo="parquet" />
      {/* cajeros tras la reja */}
      <Figura x={760} y={990} semilla={s + 20} ropa="oficinista" cuerpo="busto" pose="cuenta" mirada={0.6} gesto="serio" escala={0.95}
        enManos={<g><Billete x={-34} y={18} w={70} giro={-12} tono={0} /><Billete x={30} y={14} w={70} giro={8} tono={1} /></g>} />
      <Figura x={1180} y={990} semilla={s + 21} ropa="oficinista" cuerpo="busto" pose="escribe" mirada={-0.4} gesto="inquieto" escala={0.95} />
      <Mostrador x={420} y={760} w={1080} h={232} />
      {/* reja de laton */}
      <g>
        <rect x={420} y={560} width={1080} height={10} fill={W.laton} />
        {Array.from({ length: 28 }).map((_, i) =>
          i % 9 === 4 ? null : <rect key={i} x={430 + i * 38.5} y={570} width={4} height={180} fill={W.laton} opacity={0.9} />
        )}
        {[600, 1000, 1360].map((vx) => (
          <path key={vx} d={`M ${vx} 750 L ${vx} 690 Q ${vx + 60} 650 ${vx + 120} 690 L ${vx + 120} 750 Z`} fill="none" stroke={W.laton} strokeWidth={6} />
        ))}
      </g>
      <Monton x={640} y={750} n={5} w={80} semilla={s} ancho={3} />
      <Fajo x={1300} y={750} w={90} alto={30} tono={1} />
      {/* clientes */}
      {Array.from({ length: n }).map((_, i) => {
        const izq = i % 2 === 0;
        return (
          <Andante key={i} x0={izq ? 120 + i * 60 : 1780 - i * 60} y={1050 + (i % 3) * 8} v={izq ? 0 : -0.0001} escala={0.95} semilla={s * 17 + i} ropa={(["traje", "mujer", "abrigo", "obrero"] as const)[i % 4]} lleva={i === 1 ? "cesto" : "nada"} />
        );
      })}
    </g>
  );
};

export const cambio: Decorado = {
  desc: "Casa de cambio (Wechselstube): tablero negro de cotizaciones con el dolar que corre, cajeros en mangas de camisa tras la reja de laton contando billetes, fajos en el mostrador, clientes a los lados.",
  admite:
    "valores [de, a, ...] marcos por la moneda principal; textos.moneda ('1 Dollar'), textos.titulo ('Devisenkurse'), textos.fecha (subtitulo, p. ej. 'Berlin, Januar 1923'), textos.otras (otras filas separadas por |), textos.cifra (texto fijo); gente",
  tomas: {
    general: toma([960, 540, 1], [960, 540, 1.06], "la sala con el tablero"),
    tablero: toma([960, 300, 1.6], [960, 270, 1.9], "el tablero con la cotizacion"),
    cifra: toma([1180, 270, 2.3], [1220, 270, 2.6], "la cifra del dolar"),
    cajero: toma([760, 660, 2.2], [770, 640, 2.5], "el cajero tras la reja"),
    clientes: toma([300, 700, 1.7], [1600, 700, 1.7], "los clientes esperando"),
  },
  dibujo: Cambio,
};

/* ------------------------------------------------------------------ */
/* Ventanilla: banco, caja de ahorros o correos                        */
/* ------------------------------------------------------------------ */

const Ventanilla: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 7;
  const gente = e.gente ?? 0.8;
  const v = e.variante ?? "banco";
  const rotulo = e.textos?.rotulo ?? (v === "correos" ? "Reichspost" : v === "caja" ? "Sparkasse" : v === "paro" ? "Arbeitsamt" : "Reichsbank");
  const ventanas =
    v === "correos"
      ? ["Briefmarken", "Pakete", "Postanweisung"]
      : v === "caja"
      ? ["Einzahlung", "Auszahlung", "Sparbücher"]
      : v === "paro"
      ? ["Meldestelle", "Arbeitsnachweis", "Unterstützung"]
      : ["Kasse", "Auszahlung", "Wechsel"];
  const aviso = e.textos?.aviso;
  const suelo = 880;
  const n = Math.round(2 + gente * 5);
  const ANCHO = 2400;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-100} width={ANCHO + 400} height={1300} fill={W.piedra} />
      <rect x={-200} y={-100} width={ANCHO + 400} height={1300} fill="url(#w-sillar)" opacity={0.5} />
      {/* pilastras y arcos */}
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i}>
          <rect x={60 + i * 440} y={60} width={60} height={820} fill={W.piedraLuz} />
          <rect x={50 + i * 440} y={50} width={80} height={24} fill={W.piedraMedia} />
        </g>
      ))}
      <rect x={-200} y={30} width={ANCHO + 400} height={30} fill={W.piedraMedia} />
      <rect x={-200} y={-100} width={ANCHO + 400} height={130} fill={W.piedraSombra} />
      {/* gran rotulo */}
      <text x={ANCHO / 2} y={112} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={70} letterSpacing={18} fill={W.piedraOscura}>
        {rotulo.toUpperCase()}
      </text>
      {/* ventanillas */}
      {ventanas.map((t, i) => {
        const vx = 330 + i * 640;
        return (
          <g key={i}>
            <rect x={vx} y={300} width={460} height={420} fill={W.maderaMedia} />
            <rect x={vx + 20} y={340} width={420} height={320} fill={"#4A3A2C"} />
            <Rotulo x={vx + 60} y={250} w={340} h={50} texto={t} fondo={W.verdeOscuro} />
            <Lampara x={vx + 230} y={190} largo={50} tipo="verde" />
          </g>
        );
      })}
      {/* empleados tras las ventanillas */}
      <Figura x={560} y={860} semilla={s + 40} ropa="oficinista" cuerpo="busto" pose="cuenta" mirada={0.5} gesto="serio" escala={0.9}
        enManos={<g><Billete x={-30} y={18} w={64} giro={-12} tono={0} /><Billete x={28} y={14} w={64} giro={8} tono={2} /></g>} />
      <Figura x={1200} y={860} semilla={s + 41} ropa={v === "correos" ? "traje" : "oficinista"} tocado="ninguno" cuerpo="busto" pose="escribe" mirada={-0.3} gesto="inquieto" escala={0.9} />
      <Figura x={1840} y={860} semilla={s + 42} ropa="mujer" tocado="ninguno" cuerpo="busto" pose="cuenta" mirada={0.2} gesto="neutro" escala={0.9}
        enManos={<g><Billete x={-30} y={18} w={64} giro={-8} tono={1} /><Billete x={28} y={16} w={64} giro={10} tono={0} /></g>} />
      {/* rejas */}
      {ventanas.map((_, i) => {
        const vx = 330 + i * 640;
        return (
          <g key={i}>
            {Array.from({ length: 12 }).map((_, k) =>
              k === 5 || k === 6 ? null : <rect key={k} x={vx + 30 + k * 36} y={340} width={4} height={320} fill={W.laton} />
            )}
            <path d={`M ${vx + 190} 660 L ${vx + 190} 600 Q ${vx + 230} 570 ${vx + 270} 600 L ${vx + 270} 660 Z`} fill="none" stroke={W.laton} strokeWidth={5} />
          </g>
        );
      })}
      <Mostrador x={250} y={680} w={1900} h={200} tono={W.madera} tapa={"#7A5A3E"} />
      {v === "correos" ? (
        <g>
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={480 + k * 30} y={640} width={26} height={32} fill={[W.carmin, W.verde, W.ocre, "#3E4458"][k]} stroke={"#F2ECDA"} strokeWidth={2} strokeDasharray="3 2" />
          ))}
          <rect x={1300} y={636} width={120} height={36} fill={"#E3DAC2"} />
        </g>
      ) : v === "paro" ? (
        <g>
          {[480, 1120, 1780].map((px) => (
            <rect key={px} x={px} y={646} width={110} height={26} fill={"#E3DAC2"} transform={`rotate(-4 ${px} 660)`} />
          ))}
        </g>
      ) : (
        <g>
          <Monton x={520} y={668} n={6} w={70} semilla={s} />
          <Monton x={1860} y={668} n={4} w={70} semilla={s + 2} />
        </g>
      )}
      {aviso ? (
        <g transform="translate(1160 470)">
          <rect x={-200} y={-60} width={400} height={120} fill={"#F2ECDA"} />
          <text x={0} y={-12} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={34} fill={W.tinta}>
            Bekanntmachung
          </text>
          <text x={0} y={34} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={aviso.length > 18 ? 24 : 32} fill={W.carmin}>
            {aviso}
          </text>
        </g>
      ) : null}
      <SueloInterior y={suelo} tipo="baldosa" ancho={ANCHO} />
      {/* cola con cestos y carretillas */}
      {v === "paro" || v === "correos" ? null : <CestoBilletes x={900} y={1010} s={0.85} semilla={s} />}
      {v === "paro" || v === "correos" ? null : <Carretilla x={1500} y={1060} semilla={s} quieta />}
      {Array.from({ length: n }).map((_, i) => (
        <Andante
          key={i}
          x0={[150, 760, 1080, 1330, 1990, 2250, 420][i % 7]}
          y={1040 + (i % 2) * 14}
          v={i === n - 1 ? 0.6 : 0}
          escala={0.95}
          semilla={s * 19 + i}
          ropa={(["mujer", "traje", "obrero", "mujer", "abrigo", "nino", "traje"] as const)[i % 7]}
          lleva={v === "paro" || v === "correos" ? (i % 2 ? "periodico" : "nada") : i % 3 === 0 ? "cesto" : i % 3 === 1 ? "fardo" : "nada"}
        />
      ))}
    </g>
  );
};

export const ventanilla: Decorado = {
  desc: "Sala de ventanillas con rejas de laton (Reichsbank, caja de ahorros o correos): empleados contando billetes, montones de fajos, cola de gente con cestos, fardos y una carretilla de billetes.",
  ancho: 2400,
  admite: "variante 'banco' | 'caja' | 'correos' | 'paro' (oficina de empleo, sin billetes); textos.rotulo (rotulo grande de la sala), textos.aviso (cartel 'Bekanntmachung' con una linea); gente",
  tomas: {
    general: toma([1200, 540, 1], [1200, 540, 1.06], "la sala entera", 2400),
    ventanilla: toma([560, 560, 2.2], [560, 540, 2.6], "el cajero contando tras la reja", 2400),
    cola: toma([500, 760, 1.5], [1000, 760, 1.5], "la cola con cestos", 2400),
    carretilla: toma([1560, 880, 2.1], [1620, 880, 2.4], "la carretilla de billetes", 2400),
    rotulo: toma([1200, 330, 1.6], [1200, 300, 1.8], "el rotulo de la sala y las ventanillas", 2400),
  },
  dibujo: Ventanilla,
};
