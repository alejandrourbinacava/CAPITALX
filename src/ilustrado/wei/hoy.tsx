import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { Cielo, Defs, FUENTE, W, cifraEn, oscurecer, rr, toma } from "./base";
import { Andante, Figura, lookDe, type Look } from "./gente";

/** Ropa de hoy: chaqueta o abrigo de colores, sin sombrero. */
const lookHoy = (s: number, mujer: boolean): Look => {
  const L = lookDe(s, mujer ? "mujer" : "obrero", {}, "ninguno");
  const telas = ["#3E6A8A", "#8A3A3A", "#4A6A4A", "#C9A24A", "#5A5A6A", "#2E4A6A", "#9A6A4A", "#6A4A7A"];
  return { ...L, tela: telas[Math.floor(rr(s, 51) * telas.length)], tela2: ["#2A3A5A", "#3A3A3A", "#4A4A5A"][Math.floor(rr(s, 52) * 3)] };
};

/** Formato de precio hispano: 1234567.5 -> "1.234.567,50" (sin decimales si es entero grande). */
const precioEs = (n: number, dec = 2) => {
  const [ent, frac] = n.toFixed(dec).split(".");
  const e = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return dec ? `${e},${frac}` : e;
};

/* ------------------------------------------------------------------ */
/* Supermercado                                                        */
/* ------------------------------------------------------------------ */

const Producto: React.FC<{ x: number; y: number; tipo: number; c: string }> = ({ x, y, tipo, c }) =>
  tipo % 3 === 0 ? (
    <g>
      <rect x={x} y={y - 70} width={44} height={70} rx={4} fill={c} />
      <rect x={x + 6} y={y - 50} width={32} height={22} fill={"#F2EFE6"} opacity={0.8} />
    </g>
  ) : tipo % 3 === 1 ? (
    <g>
      <rect x={x + 6} y={y - 80} width={28} height={80} rx={10} fill={c} />
      <rect x={x + 13} y={y - 94} width={14} height={16} fill={oscurecer(c, 0.7)} />
      <rect x={x + 6} y={y - 50} width={28} height={18} fill={"#F2EFE6"} opacity={0.7} />
    </g>
  ) : (
    <g>
      <rect x={x} y={y - 48} width={40} height={48} rx={6} fill={c} />
      <ellipse cx={x + 20} cy={y - 48} rx={20} ry={5} fill={oscurecer(c, 0.8)} />
    </g>
  );

const COLORES = ["#C8402C", "#2E6A9A", "#E8B33C", "#4A8A5A", "#E8E4D8", "#8A3A6A", "#E87A3C", "#3A4A8A"];

const Supermercado: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const s = e.semilla ?? 31;
  const precio = cifraEn(e.valores, f, dur, [1000, 1062]);
  const moneda = e.textos?.moneda ?? "$";
  const producto = e.textos?.producto ?? "Leche 1 L";
  const cartel = e.textos?.cartel ?? "OFERTAS";
  const decimales = precio >= 10000 ? 0 : 2;
  const cifra = e.textos?.precio ?? `${moneda} ${precioEs(precio, decimales)}`;
  const suelo = 900;
  const parpadeo = Math.floor(f / 8) % 2;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-100} width={2320} height={1300} fill={"#EDEBE4"} />
      {/* techo con tubos de luz */}
      <rect x={-200} y={-100} width={2320} height={160} fill={"#D9D7D0"} />
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i}>
          <rect x={-60 + i * 380} y={40} width={260} height={16} rx={6} fill={"#FFFDF4"} />
          <rect x={-60 + i * 380} y={56} width={260} height={30} fill={"#FFF8E0"} opacity={0.25} />
        </g>
      ))}
      {/* cartel colgante */}
      <g transform="translate(960 150)">
        <rect x={-2} y={-90} width={4} height={50} fill={"#888"} />
        <rect x={-220} y={-40} width={440} height={80} rx={8} fill={W.carmin} />
        <text x={0} y={20} textAnchor="middle" fontFamily={FUENTE.moderna} fontWeight={600} fontSize={52} letterSpacing={4} fill={"#FFFFFF"}>
          {cartel}
        </text>
      </g>
      {/* estanterias */}
      {[0, 1].map((lado) => {
        const x0 = lado ? 1220 : 0;
        return (
          <g key={lado}>
            <rect x={x0 - 60} y={230} width={760} height={660} fill={"#C9CDD0"} />
            {[0, 1, 2, 3].map((k) => (
              <g key={k}>
                <rect x={x0 - 60} y={380 + k * 140} width={760} height={14} fill={"#9AA0A4"} />
                {Array.from({ length: 14 }).map((_, i) => (
                  <Producto key={i} x={x0 - 40 + i * 52} y={380 + k * 140} tipo={i + k + lado} c={COLORES[Math.floor(rr(i + k * 14 + lado * 60, s) * COLORES.length)]} />
                ))}
                {Array.from({ length: 4 }).map((_, i) => (
                  <g key={i}>
                    <rect x={x0 - 30 + i * 180} y={394 + k * 140} width={64} height={26} fill={"#F6E04A"} />
                    <rect x={x0 - 24 + i * 180} y={402 + k * 140} width={40} height={8} fill={"#222"} opacity={0.6} />
                  </g>
                ))}
              </g>
            ))}
          </g>
        );
      })}
      {/* etiqueta grande del producto, en el centro */}
      <g transform="translate(960 560)">
        <rect x={-230} y={-170} width={460} height={340} rx={14} fill={"#FFFFFF"} />
        <rect x={-230} y={-170} width={460} height={70} rx={14} fill={"#F6E04A"} />
        <text x={0} y={-120} textAnchor="middle" fontFamily={FUENTE.moderna} fontWeight={600} fontSize={40} fill={"#222"}>
          {producto}
        </text>
        <rect x={-200} y={-80} width={400} height={150} rx={8} fill={"#14181A"} />
        <text x={0} y={30} textAnchor="middle" fontFamily={FUENTE.mono} fontSize={cifra.length > 12 ? 52 : 72} fill={"#F6E04A"}>
          {cifra}
        </text>
        <circle cx={180} cy={-60} r={8} fill={W.carmin} opacity={parpadeo ? 1 : 0.25} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={-190 + i * 20} y={100} width={i % 3 ? 6 : 12} height={46} fill={"#222"} />
        ))}
        <text x={180} y={140} textAnchor="end" fontFamily={FUENTE.sans} fontSize={22} fill={"#666"}>
          precio por unidad
        </text>
      </g>
      {/* suelo brillante */}
      <rect x={-200} y={suelo} width={2320} height={400} fill={"#D9D6CC"} />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={-200 + i * 160} y={suelo} width={2} height={400} fill={"#C9C6BC"} />
      ))}
      <rect x={-200} y={suelo} width={2320} height={40} fill={"#FFFFFF"} opacity={0.3} />
      {/* clienta con carrito, mirando el movil */}
      <g>
        <Figura x={420} y={1060} escala={0.98} semilla={s + 1} look={lookHoy(s + 1, true)} pose="carga" mirada={0.4} gesto="serio" enManos={<g><rect x={-16} y={-28} width={32} height={56} rx={6} fill={"#1E1E1E"} /><rect x={-12} y={-23} width={24} height={44} fill={"#6AA0C8"} /></g>} />
        <g transform="translate(480 1060)">
          <path d="M 0 -200 L 260 -200 L 240 -60 L 30 -60 Z" fill="none" stroke={"#8A9096"} strokeWidth={8} />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1={20 + i * 42} y1={-200} x2={34 + i * 36} y2={-60} stroke={"#8A9096"} strokeWidth={3} />
          ))}
          <rect x={60} y={-190} width={60} height={70} fill={COLORES[1]} />
          <rect x={130} y={-180} width={40} height={60} fill={COLORES[2]} />
          <circle cx={50} cy={-20} r={18} fill={"#333"} />
          <circle cx={230} cy={-20} r={18} fill={"#333"} />
        </g>
      </g>
      {/* cajera y caja */}
      <Figura x={1700} y={980} escala={0.95} semilla={s + 2} look={{ ...lookHoy(s + 2, true), tela: "#2E6A9A" }} cuerpo="busto" pose="mesa" mirada={-0.5} />
      <g>
        <rect x={1460} y={820} width={600} height={180} fill={"#5A5E62"} />
        <rect x={1460} y={800} width={600} height={24} fill={"#2A2E30"} />
        <rect x={1500} y={760} width={70} height={46} rx={6} fill={"#222"} />
        <rect x={1508} y={768} width={54} height={22} fill={"#7AC0A0"} />
        <rect x={1860} y={720} width={90} height={80} fill={"#222"} />
        <rect x={1868} y={728} width={74} height={48} fill={"#3A6A8A"} />
      </g>
      {Array.from({ length: 2 }).map((_, i) => (
        <Andante key={i} x0={i ? 2000 : -100} y={1070} v={i ? -1.1 : 1.1} escala={0.9} semilla={s * 7 + i} ropa={i ? "mujer" : "obrero"} tocado="ninguno" lleva="bolso" />
      ))}
    </g>
  );
};

export const supermercado: Decorado = {
  desc: "Supermercado de hoy: tubos de luz, estanterias llenas de productos con etiquetas amarillas, un cartel colgante, una gran etiqueta electronica con el precio que sube, clienta con carrito mirando el movil y la cajera.",
  admite:
    "valores [de, a] precio que sube en la etiqueta; textos.moneda ('$', 'Bs.', '€'), textos.producto ('Leche 1 L'), textos.precio (texto fijo en vez de la cifra), textos.cartel (cartel colgante, por defecto 'OFERTAS')",
  tomas: {
    general: toma([960, 540, 1], [960, 560, 1.06], "el supermercado entero"),
    etiqueta: toma([960, 560, 2.2], [960, 560, 2.6], "la etiqueta con el precio"),
    clienta: toma([520, 760, 1.8], [560, 740, 2], "la clienta con el carrito"),
    caja: toma([1700, 700, 2], [1720, 700, 2.2], "la cajera y la caja"),
    pasillo: toma([600, 500, 1.4], [1300, 500, 1.4], "paneo por las estanterias"),
  },
  dibujo: Supermercado,
};

/* ------------------------------------------------------------------ */
/* Calle latinoamericana con casa de cambio                            */
/* ------------------------------------------------------------------ */

const ANCHO_LA = 2400;

const Moto: React.FC<{ x0: number; y: number; v: number; s?: number; semilla: number }> = ({ x0, y, v, s = 1, semilla }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (v < 0 ? -1 : 1)} ${s})`}>
      {[0, 220].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={-40} r={40} fill={"#222"} />
          <circle cx={cx} cy={-40} r={16} fill={"#9A9E9E"} />
        </g>
      ))}
      <path d="M 0 -60 L 60 -120 L 170 -120 L 220 -60 L 160 -60 L 120 -90 L 60 -90 Z" fill={"#C8402C"} />
      <rect x={40} y={-140} width={110} height={24} rx={10} fill={"#222"} />
      <path d="M 200 -110 L 230 -170" stroke={"#333"} strokeWidth={8} />
      <g transform="translate(110 -130)">
        <rect x={-24} y={-130} width={48} height={120} rx={14} fill={["#3E6A8A", "#4A6A4A", "#8A3A3A"][semilla % 3]} />
        <circle cx={6} cy={-160} r={34} fill={["#E8E4D8", "#2A2E30", "#C8402C"][semilla % 3]} />
        <rect x={10} y={-176} width={30} height={20} rx={6} fill={"#333"} opacity={0.6} />
        <path d="M 10 -100 L 90 -40" stroke={["#3E6A8A", "#4A6A4A", "#8A3A3A"][semilla % 3]} strokeWidth={20} strokeLinecap="round" />
        <path d="M -10 -10 L 40 40 L 60 100" stroke={"#2A3A5A"} strokeWidth={22} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
};

const Casacambio: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const s = e.semilla ?? 33;
  const valor = cifraEn(e.valores, f, dur, [100, 106]);
  const moneda = e.textos?.moneda ?? "DÓLAR";
  const rotulo = e.textos?.rotulo ?? "CASA DE CAMBIO";
  const cifra = e.textos?.cifra ?? precioEs(valor, valor >= 10000 ? 0 : 2);
  // dos columnas propias (p. ej. 'MES|AÑO' y '6,2 %|377 %') en vez de compra y venta
  const etiquetas = (e.textos?.etiquetas ?? "COMPRA|VENTA").split("|");
  const cifras = e.textos?.cifras ? e.textos.cifras.split("|") : [precioEs(valor * 0.98, valor >= 10000 ? 0 : 2), cifra];
  const gente = e.gente ?? 0.7;
  const suelo = 820;
  const fachadas = ["#E8C9A0", "#A9CBB8", "#E8A890", "#C9B8E0", "#F0D890", "#A0C0D8"];
  const parpadeo = Math.floor(f / 10) % 2;
  return (
    <g>
      <Defs />
      <Cielo hora={e.hora ?? "dia"} ancho={ANCHO_LA} />
      <rect x={-200} y={-100} width={ANCHO_LA + 400} height={500} fill={"#BFD3D8"} opacity={0.35} />
      {/* cerros al fondo */}
      <path d={`M -200 ${suelo - 420} Q 300 ${suelo - 640} 800 ${suelo - 460} Q 1300 ${suelo - 700} 1800 ${suelo - 480} Q 2200 ${suelo - 600} ${ANCHO_LA + 200} ${suelo - 440} L ${ANCHO_LA + 200} ${suelo} L -200 ${suelo} Z`} fill={"#9AAE8E"} />
      {Array.from({ length: 40 }).map((_, i) => (
        <rect key={i} x={-150 + rr(i, 3) * (ANCHO_LA + 300)} y={suelo - 420 - rr(i, 4) * 160} width={30} height={22} fill={["#D9C9A8", "#C9A890", "#E8D8B8"][i % 3]} />
      ))}
      {/* fachadas */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = -100 + i * 440;
        const h = 400 + (i % 2) * 60;
        const c = fachadas[i % fachadas.length];
        return (
          <g key={i}>
            <rect x={x} y={suelo - h} width={430} height={h} fill={c} />
            <rect x={x - 6} y={suelo - h - 14} width={442} height={18} fill={oscurecer(c, 0.85)} />
            {[0, 1, 2].map((k) => (
              <g key={k}>
                <rect x={x + 40 + k * 130} y={suelo - h + 50} width={80} height={110} fill={"#5A6A6E"} />
                <rect x={x + 30 + k * 130} y={suelo - h + 160} width={100} height={10} fill={oscurecer(c, 0.8)} />
                {Array.from({ length: 6 }).map((_, b) => (
                  <rect key={b} x={x + 34 + k * 130 + b * 17} y={suelo - h + 130} width={3} height={30} fill={"#333"} />
                ))}
              </g>
            ))}
            {i % 2 === 0 ? <rect x={x + 330} y={suelo - h + 180} width={70} height={46} fill={"#E8E8E4"} /> : null}
            <rect x={x + 30} y={suelo - 200} width={i === 2 ? 0 : 220} height={200} fill={i === 2 ? "none" : "#4A5458"} />
            <rect x={x + 290} y={suelo - 220} width={100} height={220} fill={oscurecer(c, 0.6)} />
          </g>
        );
      })}
      {/* casa de cambio con su tablero de leds */}
      <g transform={`translate(780 ${suelo})`}>
        <rect x={0} y={-240} width={380} height={240} fill={"#2A3A4A"} />
        <rect x={20} y={-200} width={220} height={200} fill={"#C9D8DC"} opacity={0.7} />
        <rect x={-20} y={-300} width={420} height={60} fill={"#1E5A3A"} />
        <text x={190} y={-258} textAnchor="middle" fontFamily={FUENTE.moderna} fontWeight={600} fontSize={36} letterSpacing={3} fill={"#FFFFFF"}>
          {rotulo}
        </text>
        <g transform="translate(260 -560)">
          <rect x={-150} y={0} width={420} height={250} rx={8} fill={"#14181A"} />
          <text x={60} y={44} textAnchor="middle" fontFamily={FUENTE.moderna} fontSize={30} fill={"#F2EFE6"}>
            {moneda}
          </text>
          <text x={-120} y={92} fontFamily={FUENTE.sans} fontSize={22} fill={"#9AA"}>
            {etiquetas[0]}
          </text>
          <text x={240} y={92} textAnchor="end" fontFamily={FUENTE.sans} fontSize={22} fill={"#9AA"}>
            {etiquetas[1] ?? ""}
          </text>
          <text x={-120} y={160} fontFamily={FUENTE.mono} fontSize={(cifras[0] ?? "").length > 8 ? 34 : 44} fill={"#F6E04A"}>
            {cifras[0]}
          </text>
          <text x={240} y={160} textAnchor="end" fontFamily={FUENTE.mono} fontSize={(cifras[1] ?? "").length > 8 ? 34 : 44} fill={"#7AE0A0"}>
            {cifras[1] ?? ""}
          </text>
          <circle cx={250} cy={24} r={7} fill={W.carmin} opacity={parpadeo ? 1 : 0.25} />
          <rect x={-130} y={200} width={380} height={4} fill={"#333"} />
          <rect x={30} y={250} width={8} height={70} fill={"#333"} />
        </g>
      </g>
      {/* cables y postes */}
      {[300, 1500, 2300].map((px) => (
        <rect key={px} x={px} y={suelo - 600} width={14} height={620} fill={"#6A6A64"} />
      ))}
      <path d={`M -200 ${suelo - 560} Q 400 ${suelo - 500} 1000 ${suelo - 560} Q 1600 ${suelo - 500} ${ANCHO_LA + 200} ${suelo - 560}`} stroke={"#333"} strokeWidth={3} fill="none" />
      <path d={`M -200 ${suelo - 530} Q 400 ${suelo - 470} 1000 ${suelo - 530} Q 1600 ${suelo - 470} ${ANCHO_LA + 200} ${suelo - 530}`} stroke={"#333"} strokeWidth={2} fill="none" />
      {/* arbol */}
      <g transform={`translate(1900 ${suelo})`}>
        <rect x={-12} y={-260} width={24} height={260} fill={"#6A4A32"} />
        {[[-60, -300, 90], [50, -320, 100], [0, -380, 100], [-20, -260, 70], [60, -250, 70]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx + Math.sin(f * 0.05 + i) * 3} cy={cy} r={r} fill={i % 2 ? "#5E8A4E" : "#6E9A5A"} />
        ))}
      </g>
      {/* acera y calzada */}
      <rect x={-200} y={suelo} width={ANCHO_LA + 400} height={60} fill={"#C9C2B2"} />
      <rect x={-200} y={suelo + 60} width={ANCHO_LA + 400} height={400} fill={"#6E6E6A"} />
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={-200 + i * 220} y={suelo + 180} width={110} height={8} fill={"#E8E4D8"} />
      ))}
      {/* gente con el movil */}
      {Array.from({ length: Math.round(3 + gente * 6) }).map((_, i) => (
        <Andante key={i} x0={((i * 357 + s * 19) % (ANCHO_LA + 200)) - 100} y={suelo + 50 + (i % 2) * 6} v={(i % 2 ? -1 : 1) * (0.9 + (i % 3) * 0.3)} escala={0.62} semilla={s * 3 + i} ropa={i % 3 === 1 ? "mujer" : "obrero"} tocado="ninguno" lleva={i % 2 ? "bolso" : "nada"} />
      ))}
      <Figura x={1050} y={suelo + 56} escala={0.66} semilla={s + 9} look={lookHoy(s + 9, false)} pose="carga" mirada={0.3} gesto="inquieto" enManos={<g><rect x={-16} y={-28} width={32} height={56} rx={6} fill={"#1E1E1E"} /><rect x={-12} y={-23} width={24} height={44} fill={"#6AA0C8"} /></g>} />
      <Moto x0={-300} y={suelo + 230} v={4} s={0.8} semilla={s} />
      <Moto x0={ANCHO_LA + 200} y={suelo + 250} v={-3.2} s={0.8} semilla={s + 1} />
    </g>
  );
};

export const casacambio: Decorado = {
  desc: "Calle latinoamericana de hoy: fachadas de colores con balcones y aparatos de aire, cerros con casas al fondo, cables, un arbol; casa de cambio con tablero de leds (compra y venta del dolar); gente con el movil y motos que pasan.",
  ancho: ANCHO_LA,
  admite: "valores [de, a] tipo de venta que corre en el tablero; textos.etiquetas y textos.cifras (dos columnas propias separadas por |, p. ej. 'MES|AÑO' y '6,2 %|377 %'); textos.moneda (cabecera del tablero, p. ej. 'DÓLAR · BOLÍVARES'), textos.rotulo ('CASA DE CAMBIO'), textos.cifra (texto fijo); gente; hora",
  tomas: {
    general: toma([1200, 540, 1], [1200, 540, 1.06], "la calle entera", ANCHO_LA),
    tablero: toma([1100, 380, 2.1], [1110, 360, 2.4], "el tablero del cambio", ANCHO_LA),
    gente: toma([700, 700, 1.7], [1300, 700, 1.7], "la gente en la acera", ANCHO_LA),
    moto: toma([1200, 860, 1.5], [1500, 860, 1.5], "las motos por la calzada", ANCHO_LA),
  },
  dibujo: Casacambio,
};
