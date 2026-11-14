import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { Billete, Defs, FUENTE, W, cifraEn, oscurecer, puntos, rr, sv, toma } from "./base";

/**
 * Insertos a pantalla completa: el billete, el periodico, la libreta de
 * ahorros, el sello de correos y el documento oficial. Son los que llevan
 * el dato dentro de la escena.
 */

/** Mesa de fondo: madera o pano verde, con una luz calida que se mueve. */
const Mesa: React.FC<{ tipo?: "madera" | "pano" | "cuero" }> = ({ tipo = "madera" }) => {
  const f = useCurrentFrame();
  const base = tipo === "pano" ? "#2F4A3F" : tipo === "cuero" ? "#5A3A2A" : "#6E4C35";
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill={base} />
      {tipo === "madera"
        ? Array.from({ length: 16 }).map((_, i) => (
            <path key={i} d={`M -200 ${i * 80 + 20} Q 600 ${i * 80 + (i % 2 ? 40 : 0)} 1200 ${i * 80 + 30} T 2200 ${i * 80 + 10}`} stroke={oscurecer(base, 0.88)} strokeWidth={6} fill="none" />
          ))
        : null}
      <circle cx={700 + Math.sin(f * 0.01) * 120} cy={380} r={900} fill="url(#w-lampara)" opacity={0.8} />
      <rect x={-200} y={-200} width={2320} height={1480} fill={"#000"} opacity={0.12} />
    </g>
  );
};

/** Sello de goma que cae en el fotograma `desde`. */
const Estampa: React.FC<{ x: number; y: number; texto: string; sub?: string; desde: number; giro?: number; color?: string; tam?: number }> = ({
  x,
  y,
  texto,
  sub,
  desde,
  giro = -12,
  color = W.carmin,
  tam = 88,
}) => {
  const f = useCurrentFrame();
  const t = f - desde;
  if (t < 0) return null;
  const s = t < 6 ? 2 - t * 0.18 : 0.94 + Math.min(1, (t - 6) / 4) * 0.06;
  const o = Math.min(1, t / 4);
  const w = Math.max(texto.length * tam * 0.55, (sub ?? "").length * tam * 0.3) + 80;
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${s})`} opacity={o * 0.9}>
      <rect x={-w / 2} y={-tam * 0.9} width={w} height={sub ? tam * 1.9 : tam * 1.4} rx={10} fill="none" stroke={color} strokeWidth={9} />
      <text x={0} y={tam * 0.2} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={tam} fill={color} letterSpacing={2}>
        {texto}
      </text>
      {sub ? (
        <text x={0} y={tam * 0.8} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={600} fontSize={tam * 0.38} fill={color} letterSpacing={2}>
          {sub}
        </text>
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Billete                                                             */
/* ------------------------------------------------------------------ */

const ESTILOS: Record<string, { papel: string; tinta: string; acento: string; cabecera: string; pie: string }> = {
  papiermark: { papel: "#E3D9B4", tinta: "#4A3A5A", acento: "#7A5A8A", cabecera: "Reichsbanknote", pie: "Reichsbankdirektorium" },
  luto: { papel: "#E6DECA", tinta: "#1A1A1A", acento: "#1A1A1A", cabecera: "Darlehenskassenschein", pie: "Reichsschuldenverwaltung" },
  rentenmark: { papel: "#C9D8C8", tinta: "#1F4A3A", acento: "#3A6A5A", cabecera: "Rentenbankschein", pie: "Deutsche Rentenbank" },
  reichsmark: { papel: "#D8CCB8", tinta: "#3A2A1A", acento: "#7A4A2A", cabecera: "Reichsbanknote", pie: "Reichsbankdirektorium" },
  notgeld: { papel: "#E8D2B0", tinta: "#6A2A1A", acento: "#A84A2A", cabecera: "Notgeld", pie: "Der Magistrat" },
};

const BilleteGrande: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const s = e.semilla ?? 41;
  const v = e.variante ?? "papiermark";
  const st = ESTILOS[v] ?? ESTILOS.papiermark;
  const unidad = e.textos?.unidad ?? (v === "rentenmark" ? "Rentenmark" : v === "reichsmark" ? "Reichsmark" : "Mark");
  const valor = e.valores && e.valores.length ? cifraEn(e.valores, f, dur, [1000]) : null;
  const cifra = e.textos?.cifra ?? (valor !== null ? puntos(valor) : v === "luto" ? "50" : v === "rentenmark" ? "1" : "1000");
  const palabras = e.textos?.palabras ?? "";
  const fecha = e.textos?.fecha ?? (v === "rentenmark" ? "Berlin, den 1. November 1923" : "Berlin, den 15. Dezember 1922");
  const emisor = e.textos?.emisor;
  const resello = e.textos?.resello;
  const x0 = 210;
  const y0 = 170;
  const w = 1500;
  const h = 740;
  const tamCifra = cifra.length > 13 ? 96 : cifra.length > 9 ? 120 : 180;
  const entra = sv(f / 24);
  return (
    <g>
      <Defs />
      <Mesa tipo={v === "notgeld" ? "madera" : "pano"} />
      {/* otros billetes debajo */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Billete key={i} x={200 + i * 380 + rr(i, s) * 60} y={i % 2 ? 1000 : 90} w={420} giro={(rr(i, s + 1) - 0.5) * 40} tono={i} />
      ))}
      <g transform={`translate(0 ${(1 - entra) * 40}) rotate(${-1.5 + Math.sin(f * 0.02) * 0.4} 960 540)`}>
        <rect x={x0 + 16} y={y0 + 20} width={w} height={h} fill={"#000"} opacity={0.3} />
        <rect x={x0} y={y0} width={w} height={h} fill={st.papel} />
        {/* guilloche */}
        {Array.from({ length: 34 }).map((_, i) => (
          <path key={i} d={`M ${x0 + 30} ${y0 + 40 + i * 20} Q ${x0 + w / 4} ${y0 + 20 + i * 20 + Math.sin(i) * 14} ${x0 + w / 2} ${y0 + 40 + i * 20} T ${x0 + w - 30} ${y0 + 40 + i * 20}`} stroke={st.acento} strokeWidth={1.2} fill="none" opacity={0.18} />
        ))}
        {v === "luto" ? <rect x={x0 + 8} y={y0 + 8} width={w - 16} height={h - 16} fill="none" stroke={"#111"} strokeWidth={34} /> : null}
        <rect x={x0 + 34} y={y0 + 34} width={w - 68} height={h - 68} fill="none" stroke={st.tinta} strokeWidth={6} />
        <rect x={x0 + 50} y={y0 + 50} width={w - 100} height={h - 100} fill="none" stroke={st.acento} strokeWidth={2} />
        {/* rosetas en las esquinas */}
        {[[x0 + 120, y0 + 120], [x0 + w - 120, y0 + 120], [x0 + 120, y0 + h - 120], [x0 + w - 120, y0 + h - 120]].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={56} fill={oscurecer(st.papel, 0.92)} stroke={st.tinta} strokeWidth={3} />
            {Array.from({ length: 12 }).map((_, k) => (
              <ellipse key={k} cx={cx} cy={cy - 30} rx={8} ry={24} fill="none" stroke={st.acento} strokeWidth={1.6} transform={`rotate(${k * 30} ${cx} ${cy})`} />
            ))}
            <text x={cx} y={cy + 14} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={cifra.length > 6 ? 22 : 40} fill={st.tinta}>
              {cifra.length > 6 ? "" : cifra}
            </text>
          </g>
        ))}
        {/* cabecera */}
        <text x={960} y={y0 + 150} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={84} fill={st.tinta}>
          {emisor ?? st.cabecera}
        </text>
        {/* medallon con perfil (un tipo cualquiera, no un retrato) */}
        <g transform={`translate(${x0 + 330} ${y0 + 380})`}>
          <ellipse cx={0} cy={0} rx={130} ry={160} fill={oscurecer(st.papel, 0.88)} stroke={st.tinta} strokeWidth={4} />
          {/* alegoria de perfil, con corona de laurel */}
          <path d="M -70 150 Q -60 90 -20 70 L -10 40 Q -40 30 -44 -10 Q -50 -70 0 -86 Q 50 -92 64 -50 L 62 -30 L 78 -8 L 64 -2 L 66 14 Q 62 30 40 34 L 30 44 L 34 70 Q 70 86 80 150 Z" fill={st.acento} opacity={0.5} />
          <path d="M -44 -10 Q -64 -80 0 -96 Q 46 -100 64 -56 Q 30 -70 6 -60 Q -10 -40 -16 -14 Q -30 0 -44 -10 Z" fill={st.tinta} opacity={0.55} />
          <ellipse cx={-48} cy={-14} rx={22} ry={18} fill={st.tinta} opacity={0.5} />
          {Array.from({ length: 7 }).map((_, k) => (
            <ellipse key={k} cx={-30 + k * 14} cy={-82 + Math.abs(k - 3) * 4} rx={6} ry={12} fill={"#7A8A5A"} opacity={0.7} transform={`rotate(${-40 + k * 14} ${-30 + k * 14} ${-82 + Math.abs(k - 3) * 4})`} />
          ))}
          <ellipse cx={0} cy={0} rx={130} ry={160} fill="none" stroke={st.acento} strokeWidth={1.5} strokeDasharray="4 6" />
        </g>
        {/* cifra */}
        <text x={1160} y={y0 + 400} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={tamCifra} fill={st.tinta}>
          {cifra}
        </text>
        <text x={1160} y={y0 + 470} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={60} fill={st.tinta}>
          {palabras || unidad}
        </text>
        <text x={1160} y={y0 + 540} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={30} fill={st.tinta} opacity={0.8}>
          {fecha}
        </text>
        {/* firmas */}
        <text x={1160} y={y0 + 600} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={30} fill={st.tinta}>
          {st.pie}
        </text>
        {[1000, 1160, 1320].map((fx, i) => (
          <path key={fx} d={`M ${fx - 60} ${y0 + 640} q 20 -24 40 0 t 40 -6 t 30 4`} stroke={st.tinta} strokeWidth={2.5} fill="none" opacity={0.8 - i * 0.1} />
        ))}
        {/* numero de serie */}
        <text x={x0 + 90} y={y0 + h - 60} fontFamily={FUENTE.mono} fontSize={28} fill={W.carmin}>
          {`N° ${String(100000 + Math.floor(rr(s, 7) * 899999))}`}
        </text>
        <text x={x0 + w - 200} y={y0 + 100} textAnchor="end" fontFamily={FUENTE.mono} fontSize={28} fill={W.carmin}>
          {`${String.fromCharCode(65 + (s % 20))}·${String(10000 + Math.floor(rr(s, 8) * 89999))}`}
        </text>
        {/* resello rojo */}
        {resello ? <Estampa x={1060} y={y0 + 330} texto={resello} desde={Math.round(dur * 0.35)} giro={-14} tam={resello.length > 14 ? 74 : 96} /> : null}
      </g>
    </g>
  );
};

export const billete: Decorado = {
  desc: "Inserto: un billete grande sobre la mesa, con guilloches, rosetas, medallon, cabecera en Fraktur, cifra, fecha, firmas y numero de serie; puede llevar un resello rojo que cae a mitad de escena.",
  admite:
    "variante 'papiermark' (por defecto), 'luto' (borde negro), 'rentenmark', 'reichsmark', 'notgeld' (dinero de emergencia); textos.cifra ('1000', '50'...), textos.palabras (cifra en letra, p. ej. 'Tausend Mark'), textos.unidad, textos.fecha, textos.emisor (cabecera, p. ej. 'Stadt Essen'), textos.resello (sello rojo, p. ej. 'Eine Milliarde Mark'); valores [de, a] hacen correr la cifra",
  tomas: {
    entero: toma([960, 540, 1], [960, 540, 1.08], "el billete entero"),
    cifra: toma([1160, 520, 1.9], [1160, 500, 2.2], "la cifra y la fecha"),
    resello: toma([1060, 480, 1.6], [1060, 480, 1.9], "el resello rojo sobre la cifra"),
    medallon: toma([600, 560, 2.2], [560, 550, 2.6], "el medallon y la roseta"),
  },
  dibujo: BilleteGrande,
};

/* ------------------------------------------------------------------ */
/* Periodico                                                           */
/* ------------------------------------------------------------------ */

const partir = (t: string, max: number) => {
  const out: string[] = [];
  let l = "";
  for (const p of t.split(" ")) {
    if ((l + " " + p).trim().length > max && l) {
      out.push(l);
      l = p;
    } else l = (l + " " + p).trim();
  }
  if (l) out.push(l);
  return out;
};

const Periodico: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 43;
  const cabecera = e.textos?.cabecera ?? "Berliner Tageblatt";
  const fecha = e.textos?.fecha ?? "Berlin, 1923";
  const titular = e.textos?.titular ?? "Der Dollar steigt";
  const sub = e.textos?.sub ?? "";
  const precio = e.textos?.precio;
  const lineas = partir(titular, 22).slice(0, 3);
  const tam = lineas.length > 2 ? 78 : 98;
  // donde empieza el cuerpo: justo debajo del titular y del subtitulo
  const cuerpo = 330 + (lineas.length - 1) * (tam + 10) + (sub ? 90 : 40);
  const x0 = 360;
  const w = 1200;
  return (
    <g>
      <Defs />
      <Mesa tipo="madera" />
      {/* taza de cafe */}
      <g transform="translate(1720 900)">
        <ellipse cx={0} cy={0} rx={150} ry={50} fill={"#E8E4D8"} />
        <ellipse cx={0} cy={-20} rx={90} ry={30} fill={"#E8E4D8"} />
        <ellipse cx={0} cy={-22} rx={70} ry={22} fill={"#4A2E1E"} />
      </g>
      <g transform={`rotate(${-2 + Math.sin(f * 0.015) * 0.5} 960 540)`}>
        <rect x={x0 + 20} y={40} width={w} height={1100} fill={"#000"} opacity={0.3} />
        <rect x={x0} y={20} width={w} height={1100} fill={"#EDE6D0"} />
        <rect x={x0 + w / 2 - 2} y={20} width={4} height={1100} fill={"#D9CFB4"} />
        <text x={960} y={160} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={110} fill={W.tinta}>
          {cabecera}
        </text>
        <rect x={x0 + 50} y={190} width={w - 100} height={4} fill={W.tinta} />
        <rect x={x0 + 50} y={232} width={w - 100} height={2} fill={W.tinta} />
        <text x={x0 + 60} y={222} fontFamily={FUENTE.serif} fontSize={26} fill={W.tinta}>
          {fecha}
        </text>
        <text x={x0 + w - 60} y={222} textAnchor="end" fontFamily={FUENTE.serif} fontSize={26} fill={W.tinta}>
          {precio ?? "Morgen-Ausgabe"}
        </text>
        {lineas.slice(0, 3).map((l, i) => (
          <text key={i} x={960} y={330 + i * (tam + 10)} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={tam} fill={W.tinta}>
            {l}
          </text>
        ))}
        {sub ? (
          <text x={960} y={330 + (lineas.length - 1) * (tam + 10) + 70} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={44} fill={"#3A3530"}>
            {sub}
          </text>
        ) : null}
        <rect x={x0 + 50} y={400 + (cuerpo - 400)} width={w - 100} height={3} fill={W.tinta} />
        {/* columnas de texto e ilustracion */}
        {Array.from({ length: 4 }).map((_, c) =>
          Array.from({ length: 16 }).map((_, k) => {
            const y = 430 + (cuerpo - 400) + k * 22;
            if (c === 1 && k < 8) return null;
            return <rect key={`${c}-${k}`} x={x0 + 60 + c * 275} y={y} width={rr(c * 16 + k, s) > 0.85 ? 140 : 240} height={8} fill={"#8E8676"} opacity={0.7} />;
          })
        )}
        <rect x={x0 + 335} y={430 + (cuerpo - 400)} width={240} height={160} fill={"#BDB49C"} />
        <path d={`M ${x0 + 345} ${580 + (cuerpo - 400)} L ${x0 + 420} ${520 + (cuerpo - 400)} L ${x0 + 480} ${560 + (cuerpo - 400)} L ${x0 + 565} ${490 + (cuerpo - 400)}`} stroke={"#6E6656"} strokeWidth={6} fill="none" />
      </g>
    </g>
  );
};

export const periodico: Decorado = {
  desc: "Inserto: la portada de un periodico aleman sobre la mesa del cafe: cabecera en Fraktur, fecha, gran titular, subtitulo y columnas.",
  admite: "textos.cabecera ('Berliner Tageblatt', 'Vossische Zeitung'...), textos.fecha, textos.titular (en aleman o castellano; se parte solo), textos.sub, textos.precio (precio del ejemplar, arriba a la derecha)",
  tomas: {
    entero: toma([960, 540, 1], [960, 520, 1.1], "la portada entera"),
    titular: toma([960, 380, 1.7], [960, 360, 1.95], "el titular"),
    cabecera: toma([960, 210, 1.9], [980, 200, 2.1], "la cabecera y la fecha"),
  },
  dibujo: Periodico,
};

/* ------------------------------------------------------------------ */
/* Libreta de ahorros                                                  */
/* ------------------------------------------------------------------ */

const Libreta: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const titulo = e.textos?.titulo ?? "Sparkassenbuch";
  const lineas = (e.textos?.lineas ?? "1913|Einzahlung|10.000 Mark").split(";").map((l) => l.split("|"));
  const sello = e.textos?.sello;
  const nombre = e.textos?.nombre ?? "Städtische Sparkasse Berlin";
  const visibles = Math.min(lineas.length, Math.floor(1 + sv(f / (dur * 0.6)) * lineas.length));
  return (
    <g>
      <Defs />
      <Mesa tipo="cuero" />
      {/* gafas */}
      <g transform="translate(1660 900) rotate(-14)" fill="none" stroke={"#3A3026"} strokeWidth={6}>
        <circle cx={-60} cy={0} r={52} />
        <circle cx={60} cy={0} r={52} />
        <path d="M -10 -6 Q 0 -16 10 -6 M -112 0 L -200 -30 M 112 0 L 180 -40" />
      </g>
      <g transform="rotate(-1.5 960 540)">
        <rect x={250} y={110} width={1420} height={860} rx={10} fill={"#5A2E22"} />
        <rect x={270} y={130} width={680} height={820} fill={"#EFE7D2"} />
        <rect x={970} y={130} width={680} height={820} fill={"#EDE4CC"} />
        <rect x={950} y={130} width={20} height={820} fill={"#C9BC9A"} />
        {/* pagina izquierda: portadilla */}
        <text x={610} y={260} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={70} fill={W.tinta}>
          {titulo}
        </text>
        <text x={610} y={330} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={32} fill={"#3A3530"}>
          {nombre}
        </text>
        <circle cx={610} cy={540} r={110} fill="none" stroke={"#3A4A6A"} strokeWidth={6} opacity={0.6} />
        <text x={610} y={552} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={36} fill={"#3A4A6A"} opacity={0.7}>
          Sparkasse
        </text>
        {[0, 1, 2].map((k) => (
          <rect key={k} x={360} y={720 + k * 50} width={500} height={3} fill={"#9A9078"} />
        ))}
        <path d="M 400 760 q 30 -30 60 0 t 60 -10 t 50 6" stroke={"#1F2B5C"} strokeWidth={3} fill="none" />
        {/* pagina derecha: los asientos */}
        <g>
          {["Datum", "Buchung", "Guthaben"].map((c, i) => (
            <text key={c} x={[1000, 1190, 1630][i]} y={200} textAnchor={i === 2 ? "end" : "start"} fontFamily={FUENTE.serif} fontSize={30} fill={"#3A3530"}>
              {c}
            </text>
          ))}
          <rect x={990} y={214} width={650} height={3} fill={W.tinta} />
          {[1170, 1420].map((cx) => (
            <rect key={cx} x={cx} y={170} width={2} height={760} fill={"#C9A8A0"} />
          ))}
          {Array.from({ length: 12 }).map((_, k) => (
            <rect key={k} x={990} y={280 + k * 56} width={650} height={1.5} fill={"#B9C8D8"} />
          ))}
          {lineas.slice(0, visibles).map((l, k) => (
            <g key={k}>
              <text x={1000} y={268 + k * 112} fontFamily={FUENTE.serif} fontSize={36} fill={"#1F2B5C"}>
                {l[0] ?? ""}
              </text>
              <text x={1190} y={268 + k * 112} fontFamily={FUENTE.serif} fontSize={30} fill={"#1F2B5C"}>
                {l[1] ?? ""}
              </text>
              <text x={1630} y={268 + k * 112} textAnchor="end" fontFamily={FUENTE.serif} fontSize={l[2] && l[2].length > 14 ? 28 : 36} fill={"#1F2B5C"}>
                {l[2] ?? ""}
              </text>
            </g>
          ))}
        </g>
        {sello ? <Estampa x={1310} y={720} texto={sello} desde={Math.round(dur * 0.55)} giro={-10} tam={sello.length > 12 ? 60 : 80} /> : null}
      </g>
    </g>
  );
};

export const libreta: Decorado = {
  desc: "Inserto: una libreta de ahorros abierta sobre cuero, con la portadilla de la caja, los asientos escritos a pluma que van apareciendo y unas gafas al lado; puede caer un sello rojo.",
  admite:
    "textos.lineas (asientos separados por ';', cada uno 'fecha|concepto|saldo', p. ej. '1913|Einzahlung|10.000 Mark;1923|Guthaben|0,00 Mark'), textos.titulo ('Sparkassenbuch'), textos.nombre (la caja), textos.sello (sello rojo, p. ej. 'ENTWERTET')",
  tomas: {
    entero: toma([960, 540, 1], [960, 540, 1.08], "la libreta abierta"),
    asientos: toma([1300, 420, 1.7], [1310, 400, 1.85], "los asientos"),
    portadilla: toma([610, 420, 1.9], [610, 440, 2.1], "la portadilla de la caja"),
  },
  dibujo: Libreta,
};

/* ------------------------------------------------------------------ */
/* Sello de correos sobre un sobre                                     */
/* ------------------------------------------------------------------ */

const SelloPostal: React.FC<{ x: number; y: number; w: number; valor: string; color: string; resello?: string; giro?: number }> = ({ x, y, w, valor, color, resello, giro = 0 }) => {
  const h = w * 1.2;
  const dientes = Math.round(w / 14);
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={"#F2ECDA"} />
      {Array.from({ length: dientes }).map((_, i) => (
        <g key={i} fill={"#00000000"}>
          <circle cx={-w / 2 + (i + 0.5) * (w / dientes)} cy={-h / 2} r={w / dientes / 3} fill={"#C9BC9A"} />
          <circle cx={-w / 2 + (i + 0.5) * (w / dientes)} cy={h / 2} r={w / dientes / 3} fill={"#C9BC9A"} />
        </g>
      ))}
      <rect x={-w / 2 + w * 0.08} y={-h / 2 + w * 0.08} width={w * 0.84} height={h - w * 0.16} fill={color} />
      <text x={0} y={-h / 2 + w * 0.28} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={w * 0.14} fill={"#F2ECDA"}>
        Deutsches Reich
      </text>
      <circle cx={0} cy={0} r={w * 0.22} fill="none" stroke={"#F2ECDA"} strokeWidth={w * 0.02} />
      <path d={`M ${-w * 0.12} ${w * 0.1} Q 0 ${-w * 0.2} ${w * 0.12} ${w * 0.1}`} stroke={"#F2ECDA"} strokeWidth={w * 0.03} fill="none" />
      <text x={0} y={h / 2 - w * 0.16} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={w * 0.2} fill={"#F2ECDA"}>
        {valor}
      </text>
      {resello ? (
        <g>
          <rect x={-w * 0.46} y={-w * 0.12} width={w * 0.92} height={w * 0.26} fill={"#14181A"} opacity={0.85} />
          <text x={0} y={w * 0.06} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={w * (resello.length > 12 ? 0.08 : 0.12)} fill={"#F2ECDA"}>
            {resello}
          </text>
        </g>
      ) : null}
    </g>
  );
};

const Sobre: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const s = e.semilla ?? 45;
  const valor = e.textos?.valor ?? "50 Mark";
  const resello = e.textos?.resello;
  const matasellos = e.textos?.matasellos ?? "BERLIN · 1.12.23";
  const muchos = e.variante === "muchos";
  const golpe = Math.round(dur * 0.45);
  return (
    <g>
      <Defs />
      <Mesa tipo="madera" />
      <g transform="rotate(-3 960 540)">
        <rect x={250} y={170} width={1420} height={780} fill={"#000"} opacity={0.3} transform="translate(16 20)" />
        <rect x={250} y={170} width={1420} height={780} fill={"#E6DCC0"} />
        <path d="M 250 170 L 960 600 L 1670 170" stroke={"#D2C6A6"} strokeWidth={4} fill="none" />
        {/* direccion a pluma */}
        {["Herrn", "Wilhelm Krause", "Kastanienallee 12", "Berlin N."].map((t, i) => (
          <text key={i} x={520} y={620 + i * 68} fontFamily={FUENTE.fraktur} fontSize={i === 1 ? 58 : 48} fill={"#1F2B5C"}>
            {t}
          </text>
        ))}
        {/* sellos */}
        {muchos
          ? Array.from({ length: 12 }).map((_, i) => (
              <SelloPostal key={i} x={420 + (i % 6) * 190} y={290 + Math.floor(i / 6) * 220} w={150} valor={["100", "500", "1000", "5000", "20000", "50000"][i % 6]} color={["#3A6A4A", "#8A3A3A", "#3A4A7A", "#7A5A2A", "#5A3A6A", "#2A5A6A"][i % 6]} giro={(rr(i, s) - 0.5) * 6} />
            ))
          : null}
        <SelloPostal x={1460} y={330} w={muchos ? 210 : 260} valor={valor} color={"#3A4A7A"} resello={resello} giro={2} />
        {/* matasellos */}
        {f >= golpe ? (
          <g transform="translate(1300 350)" opacity={0.75}>
            <circle r={110} fill="none" stroke={W.tinta} strokeWidth={6} />
            <circle r={80} fill="none" stroke={W.tinta} strokeWidth={3} />
            <text x={0} y={10} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={24} fill={W.tinta}>
              {matasellos}
            </text>
            {[0, 1, 2, 3].map((k) => (
              <path key={k} d={`M 120 ${-40 + k * 26} q 40 -16 80 0 t 80 0 t 80 0`} stroke={W.tinta} strokeWidth={5} fill="none" />
            ))}
          </g>
        ) : null}
      </g>
    </g>
  );
};

export const sello: Decorado = {
  desc: "Inserto: un sobre de 1923 sobre la mesa, con la direccion a pluma, el sello de correos con su valor (y un resello negro) y el matasellos que cae a mitad de escena; con variante 'muchos', el sobre va lleno de sellos.",
  admite: "textos.valor (valor del sello, p. ej. '50 Mark'), textos.resello (sobreimpresion, p. ej. '100 Milliarden'), textos.matasellos ('BERLIN · 1.12.23'); variante 'muchos'",
  tomas: {
    sobre: toma([960, 540, 1], [960, 540, 1.08], "el sobre entero"),
    sello: toma([1420, 360, 2.4], [1440, 350, 2.8], "el sello y su valor"),
    direccion: toma([800, 700, 1.7], [820, 700, 1.9], "la direccion escrita a pluma"),
  },
  dibujo: Sobre,
};

/* ------------------------------------------------------------------ */
/* Documento oficial                                                   */
/* ------------------------------------------------------------------ */

const Documento: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const titulo = e.textos?.titulo ?? "Reichsgesetzblatt";
  const sub = e.textos?.sub ?? "";
  const lineas = (e.textos?.lineas ?? "").split("|").filter(Boolean);
  const sello = e.textos?.sello;
  const pie = e.textos?.pie ?? "";
  const visibles = Math.min(lineas.length, Math.floor(1 + sv(f / (dur * 0.6)) * lineas.length));
  const tam = lineas.some((l) => l.length > 34) ? 40 : 48;
  const ley = e.variante === "ley";
  return (
    <g>
      <Defs />
      <Mesa tipo="pano" />
      {/* pluma y tintero */}
      <g transform="translate(1720 860)">
        <rect x={-50} y={-60} width={100} height={70} rx={8} fill={W.tinta} />
        <rect x={-6} y={-260} width={8} height={220} fill={"#EFE7D2"} transform="rotate(18 0 -60)" />
      </g>
      <g transform={`rotate(${-1 + Math.sin(f * 0.015) * 0.4} 960 540)`}>
        <rect x={420} y={30} width={1080} height={1100} fill={"#000"} opacity={0.3} transform="translate(16 20)" />
        <rect x={420} y={30} width={1080} height={1100} fill={"#F0EADA"} />
        <rect x={470} y={80} width={980} height={1000} fill="none" stroke={"#9A9078"} strokeWidth={2} />
        <text x={960} y={190} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={titulo.length > 22 ? 62 : 80} fill={W.tinta}>
          {titulo}
        </text>
        {sub ? (
          <text x={960} y={250} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={36} fill={"#3A3530"}>
            {sub}
          </text>
        ) : null}
        <rect x={620} y={280} width={680} height={3} fill={W.tinta} />
        {lineas.slice(0, visibles).map((l, k) => (
          <g key={k}>
            {ley ? (
              <text x={540} y={380 + k * 92} fontFamily={FUENTE.serif} fontSize={tam} fill={W.tinta}>
                {`§ ${k + 1}`}
              </text>
            ) : null}
            <text x={ley ? 640 : 540} y={380 + k * 92} fontFamily={FUENTE.serif} fontSize={tam} fill={W.tinta}>
              {l}
            </text>
          </g>
        ))}
        {Array.from({ length: Math.max(0, 6 - lineas.length) }).map((_, k) => (
          <rect key={k} x={540} y={370 + (lineas.length + k) * 92} width={k % 2 ? 640 : 820} height={8} fill={"#B6AD96"} />
        ))}
        {pie ? (
          <text x={1380} y={980} textAnchor="end" fontFamily={FUENTE.serif} fontSize={32} fill={"#3A3530"}>
            {pie}
          </text>
        ) : null}
        <path d="M 1080 1030 q 30 -40 60 0 t 60 -10 t 60 6" stroke={"#1F2B5C"} strokeWidth={3} fill="none" />
        {/* sello de lacre con cinta */}
        <path d="M 600 960 L 560 1120 L 610 1090 L 640 1130 L 660 970 Z" fill={W.carmin} opacity={0.85} />
        <circle cx={620} cy={960} r={56} fill={"#A8302A"} />
        <circle cx={620} cy={960} r={40} fill="none" stroke={"#7A2420"} strokeWidth={4} />
        {sello ? <Estampa x={1180} y={760} texto={sello} desde={Math.round(dur * 0.6)} giro={-8} tam={sello.length > 12 ? 60 : 80} /> : null}
      </g>
    </g>
  );
};

export const documento: Decorado = {
  desc: "Inserto: un documento oficial sobre pano verde (ley, decreto, tratado, plan): titulo en Fraktur, subtitulo, articulos que van apareciendo, firma, lacre con cinta y un sello que puede caer; pluma y tintero al lado.",
  admite:
    "textos.titulo ('Reichsgesetzblatt', 'Friedensvertrag', 'Dawes-Plan'...), textos.sub, textos.lineas (articulos separados por |, cortos: cada uno es una linea), textos.pie (fecha o lugar al pie), textos.sello (sello rojo); variante 'ley' numera los articulos con §",
  tomas: {
    entero: toma([960, 540, 1], [960, 540, 1.08], "el documento entero"),
    titulo: toma([960, 240, 2], [960, 230, 2.3], "el titulo"),
    articulos: toma([900, 480, 1.5], [900, 560, 1.6], "los articulos"),
    sello: toma([820, 900, 1.8], [900, 880, 2], "la firma y el lacre"),
  },
  dibujo: Documento,
};
