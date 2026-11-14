import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import MUNDO from "../data/mundo.json";
import { Lienzo, P, Peaton, r, suave } from "./Piezas";

/**
 * Motion graphics del piloto ilustrado: tipografia que golpea, mapas que se
 * encienden, pilas de monedas, calendarios y tableros. Todo con la misma
 * paleta plana que las calles.
 */

type Pt = { x: number; y: number };
type Vista = { d: string; lugares: Record<string, Pt> };
const VISTAS = MUNDO as unknown as Record<string, Vista>;

/** Escala con rebote para algo que "cae" en pantalla en el fotograma `en`. */
export const golpe = (f: number, en: number) =>
  interpolate(f - en, [0, 5, 9, 13], [2.0, 0.92, 1.04, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const aparece = (f: number, en: number, largo = 6) => interpolate(f - en, [0, largo], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
/** Temblor corto de camara tras un golpe. */
export const temblor = (f: number, en: number) => {
  const t = f - en;
  if (t < 0 || t > 10) return 0;
  return Math.sin(t * 2.7) * (10 - t) * 1.6;
};

/* ------------------------------------------------------------------ */

/** Lineas de texto que caen una a una. */
export const TextoGolpe: React.FC<{
  lineas: { texto: string; en: number; tam?: number; color?: string; serif?: boolean }[];
  fondo?: string;
  y?: number;
  velo?: boolean;
}> = ({ lineas, fondo, y = 540, velo }) => {
  const f = useCurrentFrame();
  const sacudida = lineas.reduce((n, l) => n + temblor(f, l.en), 0);
  const alto = lineas.reduce((n, l) => n + (l.tam ?? 140) * 1.05, 0);
  let cursor = y - alto / 2;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      {fondo ? <rect x={0} y={0} width={1920} height={1080} fill={fondo} /> : null}
      {velo ? <rect x={0} y={0} width={1920} height={1080} fill={P.tinta} opacity={0.55 * aparece(f, 0, 8)} /> : null}
      <g transform={`translate(${sacudida} 0)`}>
        {lineas.map((l, i) => {
          const tam = l.tam ?? 140;
          cursor += tam * 1.05;
          const s = golpe(f, l.en);
          const o = aparece(f, l.en, 3);
          return (
            <g key={i} transform={`translate(960 ${cursor - tam * 0.25}) scale(${s})`} opacity={o}>
              <text
                textAnchor="middle"
                fontFamily={l.serif ? FONT.serif : FONT.sans}
                fontWeight={l.serif ? 400 : 700}
                fontSize={tam}
                fill={l.color ?? "#F2EFE6"}
                letterSpacing={l.serif ? 0 : 2}
              >
                {l.texto}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */

/** Londres, banquero del mundo: lineas de credito que salen hacia todas partes. */
export const MapaLondres: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const v = VISTAS.mundo;
  const lon = v.lugares["Londres"];
  const destinos = ["Nueva York", "Buenos Aires", "El Cairo", "Pekín", "Cantón", "Lima", "México", "Luanda", "Constantinopla", "Lisboa", "Goa", "Manila"]
    .map((n) => v.lugares[n])
    .filter(Boolean);
  const zoom = interpolate(f, [0, dur], [1.0, 1.18]);
  return (
    <Lienzo fondo={P.mar}>
      <g transform={`translate(${lon.x} ${lon.y}) scale(${zoom}) translate(${-lon.x} ${-lon.y}) translate(0 120)`}>
        <path d={v.d} fill={P.tierra} stroke={P.costa} strokeWidth={1.5} />
        {destinos.map((d, i) => {
          const t = suave((f - 4 - i * 3) / 14);
          const cx = (lon.x + d.x) / 2;
          const cy = Math.min(lon.y, d.y) - 60 - Math.abs(lon.x - d.x) * 0.12;
          const largo = Math.hypot(d.x - lon.x, d.y - lon.y) * 1.35;
          return (
            <g key={i}>
              <path
                d={`M ${lon.x} ${lon.y} Q ${cx} ${cy} ${d.x} ${d.y}`}
                fill="none"
                stroke={P.carmin}
                strokeWidth={3.5}
                strokeDasharray={largo}
                strokeDashoffset={largo * (1 - t)}
                opacity={0.85}
              />
              <circle cx={d.x} cy={d.y} r={7 * t} fill={P.tinta} />
            </g>
          );
        })}
        {[0, 1, 2].map((k) => {
          const ph = ((f + k * 14) % 42) / 42;
          return <circle key={k} cx={lon.x} cy={lon.y} r={10 + ph * 70} fill="none" stroke={P.ocre} strokeWidth={4} opacity={1 - ph} />;
        })}
        <circle cx={lon.x} cy={lon.y} r={12} fill={P.ocre} stroke={P.tinta} strokeWidth={4} />
      </g>
      <g opacity={aparece(f, 10, 10)}>
        <rect x={70} y={70} width={720} height={140} fill={P.tinta} />
        <text x={100} y={130} fontFamily={FONT.sans} fontWeight={700} fontSize={50} fill={"#F2EFE6"}>
          LONDRES
        </text>
        <text x={100} y={180} fontFamily={FONT.sans} fontWeight={600} fontSize={30} letterSpacing={2} fill={P.ocre}>
          EL CENTRO DEL CRÉDITO MUNDIAL
        </text>
      </g>
    </Lienzo>
  );
};

/* ------------------------------------------------------------------ */

/** Barras del tipo de descuento a pantalla completa; cada una cae en su fotograma. */
export const BarrasTipos: React.FC<{ caen: number[] }> = ({ caen }) => {
  const f = useCurrentFrame();
  const dias = [
    { d: "29 JUL", v: 3 },
    { d: "30 JUL", v: 4 },
    { d: "31 JUL", v: 8 },
    { d: "1 AGO", v: 10 },
  ];
  const sacudida = caen.reduce((n, c) => n + temblor(f, c + 4), 0);
  return (
    <Lienzo fondo={"#1C2A2C"}>
      <g transform={`translate(${sacudida} ${sacudida * 0.4})`}>
        <text x={160} y={150} fontFamily={FONT.sans} fontWeight={600} fontSize={34} letterSpacing={6} fill={"#9FB0A8"}>
          TIPO DE DESCUENTO DEL BANCO DE INGLATERRA
        </text>
        <line x1={160} y1={900} x2={1760} y2={900} stroke={"#E9DCC6"} strokeWidth={5} />
        {dias.map((d, i) => {
          const t = interpolate(f - caen[i], [0, 7, 11], [0, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const h = d.v * 62 * t;
          const x = 260 + i * 380;
          const rojo = d.v >= 8;
          return (
            <g key={d.d}>
              <rect x={x} y={900 - h} width={230} height={h} fill={rojo ? P.carmin : "#E9DCC6"} />
              <text x={x + 115} y={960} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={36} fill={"#E9DCC6"}>
                {d.d}
              </text>
              <g transform={`translate(${x + 115} ${900 - h - 30}) scale(${golpe(f, caen[i] + 3)})`} opacity={aparece(f, caen[i] + 3, 2)}>
                <text textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={rojo ? 110 : 80} fill={rojo ? P.carmin : "#F2EFE6"}>
                  {d.v} %
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </Lienzo>
  );
};

/* ------------------------------------------------------------------ */

const Moneda: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={8} rx={70} ry={20} fill={"#B88A22"} />
    <rect x={-70} y={-8} width={140} height={16} fill={"#B88A22"} />
    <ellipse cx={0} cy={-8} rx={70} ry={20} fill={P.ocre} />
    <ellipse cx={0} cy={-8} rx={48} ry={12} fill="none" stroke={"#C9971E"} strokeWidth={4} />
  </g>
);

/** De 3 a 10: dos pilas de monedas, la segunda crece moneda a moneda. */
export const PilasTriple: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const n2 = Math.min(10, Math.floor(f / 3) + 1);
  return (
    <Lienzo fondo={P.cieloBajo}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Moneda key={i} x={620} y={860 - i * 34} />
      ))}
      {Array.from({ length: n2 }).map((_, i) => (
        <Moneda key={i} x={1300} y={860 - i * 34} />
      ))}
      <text x={620} y={960} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={44} fill={P.tinta}>
        29 JUL · 3 %
      </text>
      <text x={1300} y={960} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={44} fill={P.carmin}>
        1 AGO · 10 %
      </text>
      <g transform={`translate(960 ${250}) scale(${golpe(f, 32)})`} opacity={aparece(f, 32, 3)}>
        <text textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={120} fill={P.tinta}>
          MÁS DEL TRIPLE
        </text>
        <text y={80} textAnchor="middle" fontFamily={FONT.serif} fontSize={58} fill={P.carmin}>
          en cuatro días
        </text>
      </g>
      <text x={1880} y={1050} textAnchor="end" fontFamily={FONT.mono} fontSize={20} fill={P.piedraOscura} opacity={f / Math.max(1, dur) > 0.1 ? 1 : 0}>
        Fuente: Banco de Inglaterra; Grady (1927)
      </text>
    </Lienzo>
  );
};

/* ------------------------------------------------------------------ */

/** Taco de calendario que se arranca del 30 al 31 de julio. */
export const HojaCalendario: React.FC = () => {
  const f = useCurrentFrame();
  const arranque = suave((f - 12) / 16);
  const hoja = (dia: string, semana: string) => (
    <g>
      <rect x={-260} y={-320} width={520} height={600} rx={14} fill={"#FBF7EE"} />
      <rect x={-260} y={-320} width={520} height={130} rx={14} fill={P.carmin} />
      <rect x={-260} y={-210} width={520} height={20} fill={P.carmin} />
      <text y={-235} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={56} letterSpacing={6} fill={"#FBF7EE"}>
        JULIO 1914
      </text>
      <text y={120} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={300} fill={P.tinta}>
        {dia}
      </text>
      <text y={220} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={52} letterSpacing={8} fill={P.piedraOscura}>
        {semana}
      </text>
    </g>
  );
  return (
    <Lienzo fondo={P.madera}>
      <g transform={`translate(960 560) rotate(-2)`}>
        <rect x={-270} y={-330} width={540} height={630} rx={16} fill={"#3C2B1F"} />
        {hoja("31", "VIERNES")}
        <g transform={`translate(${arranque * 900} ${-arranque * 260}) rotate(${arranque * 40})`} opacity={1 - arranque * 0.6}>
          {hoja("30", "JUEVES")}
        </g>
      </g>
    </Lienzo>
  );
};

/* ------------------------------------------------------------------ */

/** Un contador grande que sube hasta `hasta`, con su leyenda. */
export const ContadorGrande: React.FC<{ hasta: number; sufijo: string; leyenda: string; fondo?: string; color?: string }> = ({
  hasta,
  sufijo,
  leyenda,
  fondo = "#1C2A2C",
  color = P.ocre,
}) => {
  const f = useCurrentFrame();
  const v = Math.round(hasta * suave(f / 30));
  return (
    <Lienzo fondo={fondo}>
      <g transform={`translate(960 560) scale(${golpe(f, 30)})`}>
        <text textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={320} fill={color}>
          {v}
        </text>
        <text y={130} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={90} letterSpacing={10} fill={"#F2EFE6"}>
          {sufijo}
        </text>
      </g>
      <text x={960} y={900} textAnchor="middle" fontFamily={FONT.serif} fontSize={56} fill={"#D9D2BF"} opacity={aparece(f, 34, 10)}>
        {leyenda}
      </text>
    </Lienzo>
  );
};

/** 1873: diez dias de cierre, casilla a casilla. */
export const DiezDias: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Lienzo fondo={P.cieloBajo}>
      <text x={960} y={240} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={80} fill={P.tinta}>
        NUEVA YORK, 1873
      </text>
      <text x={960} y={310} textAnchor="middle" fontFamily={FONT.serif} fontSize={50} fill={P.piedraOscura}>
        el único cierre anterior
      </text>
      {Array.from({ length: 10 }).map((_, i) => {
        const en = 10 + i * 4;
        const s = golpe(f, en);
        return (
          <g key={i} transform={`translate(${330 + i * 140} 560) scale(${s})`} opacity={aparece(f, en, 2)}>
            <rect x={-56} y={-56} width={112} height={112} rx={10} fill={P.carmin} />
            <text y={22} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={56} fill={"#FBF7EE"}>
              {i + 1}
            </text>
          </g>
        );
      })}
      <g transform={`translate(960 820) scale(${golpe(f, 56)})`} opacity={aparece(f, 56, 3)}>
        <text textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={120} fill={P.carmin}>
          10 DÍAS
        </text>
      </g>
    </Lienzo>
  );
};

/* ------------------------------------------------------------------ */

/** Un periodico que entra girando. Sin titulares inventados: solo la cabecera. */
export const Periodico: React.FC = () => {
  const f = useCurrentFrame();
  const t = suave(f / 22);
  const giro = (1 - t) * 540;
  const s = 0.15 + t * 0.85;
  return (
    <Lienzo fondo={"#2B2F2E"}>
      <g transform={`translate(960 560) rotate(${giro - 4}) scale(${s})`}>
        <rect x={-560} y={-400} width={1120} height={800} fill={"#EFE8D6"} />
        <text y={-290} textAnchor="middle" fontFamily={FONT.serif} fontSize={120} fill={P.tinta}>
          EXTRA
        </text>
        <rect x={-500} y={-260} width={1000} height={6} fill={P.tinta} />
        <text y={-220} textAnchor="middle" fontFamily={FONT.mono} fontSize={26} fill={P.tinta}>
          LONDRES · 1 DE AGOSTO DE 1914
        </text>
        <rect x={-500} y={-180} width={1000} height={100} fill={"#CFC6B0"} />
        {Array.from({ length: 3 }).map((_, c) =>
          Array.from({ length: 12 }).map((_, k) => (
            <rect key={`${c}-${k}`} x={-500 + c * 345} y={-40 + k * 34} width={300 - (k % 4 === 3 ? 90 : 0)} height={14} fill={"#BDB49E"} />
          ))
        )}
      </g>
      <TextoGolpe lineas={[{ texto: "EL PÁNICO", en: 24, tam: 170, color: P.carmin }]} y={560} />
    </Lienzo>
  );
};

/* ------------------------------------------------------------------ */

/** Nueva York debe a Londres: monedas que cruzan el Atlantico y el contador. */
export const MapaMonedas: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const v = VISTAS.atlantico_norte;
  const ny = v.lugares["Nueva York"];
  const lon = v.lugares["Londres"];
  const c = { x: (ny.x + lon.x) / 2, y: Math.min(ny.y, lon.y) - 300 };
  const t = suave((f - 6) / 30);
  const largo = 1400;
  const cuenta = Math.round(580 * suave((f - 10) / 50));
  const zoom = 1 + 0.08 * (f / dur);
  const punto = (u: number) => ({
    x: (1 - u) * (1 - u) * ny.x + 2 * (1 - u) * u * c.x + u * u * lon.x,
    y: (1 - u) * (1 - u) * ny.y + 2 * (1 - u) * u * c.y + u * u * lon.y,
  });
  return (
    <Lienzo fondo={P.mar}>
      <g transform={`translate(960 540) scale(${zoom}) translate(-960 -540)`}>
        <path d={v.d} fill={P.tierra} stroke={P.costa} strokeWidth={2} />
        <path
          d={`M ${ny.x} ${ny.y} Q ${c.x} ${c.y} ${lon.x} ${lon.y}`}
          fill="none"
          stroke={P.carmin}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={largo}
          strokeDashoffset={largo * (1 - t)}
        />
        {t > 0.95
          ? Array.from({ length: 6 }).map((_, k) => {
              const u = ((f / 40 + k / 6) % 1);
              const p = punto(u);
              return (
                <g key={k} transform={`translate(${p.x} ${p.y}) scale(0.32)`}>
                  <ellipse rx={70} ry={70} fill={P.ocre} stroke={"#B88A22"} strokeWidth={14} />
                  <text y={26} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={80} fill={"#8A6512"}>
                    $
                  </text>
                </g>
              );
            })
          : null}
        {[ny, lon].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={16} fill={P.tinta} />
            <circle cx={p.x} cy={p.y} r={7} fill={P.ocre} />
          </g>
        ))}
        <text x={ny.x + 30} y={ny.y + 48} fontFamily={FONT.sans} fontWeight={700} fontSize={34} fill={P.tinta}>
          NUEVA YORK
        </text>
        <text x={lon.x - 20} y={lon.y - 30} textAnchor="end" fontFamily={FONT.sans} fontWeight={700} fontSize={34} fill={P.tinta}>
          LONDRES
        </text>
      </g>
      <g transform={`translate(960 880) scale(${golpe(f, 8)})`} opacity={aparece(f, 8, 3)}>
        <rect x={-450} y={-80} width={900} height={150} rx={12} fill={"#F2EFE6"} stroke={P.tinta} strokeWidth={4} />
        <text x={0} y={2} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={72} fill={P.carmin}>
          {cuenta} millones de $
        </text>
        <text x={0} y={50} textAnchor="middle" fontFamily={FONT.sans} fontSize={28} fill={P.tinta}>
          lo que EE. UU. debía a Londres a corto plazo
        </text>
      </g>
      <text x={1880} y={1050} textAnchor="end" fontFamily={FONT.mono} fontSize={20} fill={P.tinta} opacity={0.7}>
        Fuente: Bogart (1920)
      </text>
    </Lienzo>
  );
};

/* ------------------------------------------------------------------ */

/** Cifra de tablero de paletas. */
export const Paleta: React.FC<{ texto: string; cambio: number; x: number; y: number; escala?: number }> = ({ texto, cambio, x, y, escala = 1 }) => {
  const f = useCurrentFrame();
  const t = f - cambio;
  const giro = t >= 0 && t < 8 ? Math.cos((t / 8) * Math.PI) : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      {texto.split("").map((ch, i) => (
        <g key={i} transform={`translate(${i * 118} 0)`}>
          <rect x={0} y={-160} width={108} height={190} rx={10} fill={"#1E2224"} />
          <line x1={0} y1={-65} x2={108} y2={-65} stroke={"#0E1112"} strokeWidth={4} />
          <g transform={`translate(54 -65) scale(1 ${Math.max(0.05, Math.abs(giro))}) translate(-54 65)`}>
            <text x={54} y={0} textAnchor="middle" fontFamily={FONT.mono} fontWeight={500} fontSize={150} fill={"#F2EFE6"}>
              {ch}
            </text>
          </g>
        </g>
      ))}
    </g>
  );
};

/** La libra se dispara: tablero arriba y la linea del cambio que pega el salto. */
export const LibraDisparada: React.FC<{ a7: number }> = ({ a7 }) => {
  const f = useCurrentFrame();
  const subida = suave((f - a7) / 14);
  const valor = f >= a7 ? "7,00" : "4,87";
  const y487 = 820;
  const y7 = 520;
  const xs = Array.from({ length: 30 }).map((_, i) => 160 + i * 55);
  const linea = xs
    .map((x, i) => {
      const base = y487 + Math.sin(i * 1.7) * 6;
      const y = i < 24 ? base : base + (y7 - base) * subida * Math.min(1, (i - 23) / 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const alarma = f >= a7 ? 0.25 + 0.25 * Math.sin(f * 0.6) : 0;
  return (
    <Lienzo fondo={"#2B2F2E"}>
      <rect x={0} y={0} width={1920} height={1080} fill={P.carmin} opacity={alarma * 0.35} />
      <text x={160} y={150} fontFamily={FONT.sans} fontWeight={600} fontSize={36} letterSpacing={6} fill={"#CFC7B4"}>
        CUÁNTOS DÓLARES CUESTA UNA LIBRA · NUEVA YORK
      </text>
      <g transform="translate(1040 400) scale(0.8)">
        <text x={-560} y={0} fontFamily={FONT.sans} fontWeight={700} fontSize={110} fill={"#F2EFE6"}>
          1 £ =
        </text>
        <Paleta texto={valor} cambio={a7} x={-200} y={0} />
        <text x={300} y={-10} fontFamily={FONT.sans} fontWeight={700} fontSize={110} fill={"#F2EFE6"}>
          $
        </text>
      </g>
      <line x1={160} y1={y487} x2={1760} y2={y487} stroke={"#5A605E"} strokeWidth={2} strokeDasharray="10 10" />
      <path d={linea} fill="none" stroke={f >= a7 ? P.carmin : P.ocre} strokeWidth={8} strokeLinejoin="round" />
      <text x={170} y={y487 + 50} fontFamily={FONT.mono} fontSize={26} fill={"#CFC7B4"}>
        4,87 $ antes de la guerra
      </text>
      {f >= a7 ? (
        <g transform={`translate(1500 ${y7 - 40}) scale(${golpe(f, a7 + 6)})`}>
          <text textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={48} fill={P.carmin}>
            1 DE AGOSTO
          </text>
        </g>
      ) : null}
      <text x={1880} y={1050} textAnchor="end" fontFamily={FONT.mono} fontSize={20} fill={"#CFC7B4"} opacity={0.8}>
        Fuente: Bogart (1920), citando al Commercial and Financial Chronicle
      </text>
    </Lienzo>
  );
};

/** Los banqueros de Nueva York, alrededor de la mesa, fijan el precio. */
export const Banqueros: React.FC = () => {
  const f = useCurrentFrame();
  const cambio = 24;
  return (
    <Lienzo fondo={"#20191A"}>
      {/* lampara y su cono de luz */}
      <polygon points="960,140 520,820 1400,820" fill={"#E9C77A"} opacity={0.12} />
      <rect x={955} y={0} width={10} height={130} fill={P.tinta} />
      <path d="M 900 130 L 1020 130 L 990 170 L 930 170 Z" fill={P.verde} />
      {/* banqueros: siluetas detras de la mesa */}
      {[600, 790, 980, 1170, 1360].map((x, i) => (
        <Peaton key={x} x={x} y={1000} escala={1.9} semilla={60 + i} sombrero={i % 2 ? "bombin" : "chistera"} />
      ))}
      {/* mesa: tablero y faldon, tapan las piernas */}
      <rect x={400} y={760} width={1120} height={36} rx={8} fill={P.maderaLuz} />
      <rect x={430} y={796} width={1060} height={284} fill={P.madera} />
      {[640, 900, 1180].map((x, i) => (
        <rect key={i} x={x} y={742} width={120} height={20} fill={"#EFE8D6"} transform={`rotate(${(r(i, 3) - 0.5) * 10} ${x + 60} 752)`} />
      ))}
      {/* tablero en la pared */}
      <g transform="translate(1180 340) scale(0.55)">
        <rect x={-260} y={-230} width={1040} height={300} rx={14} fill={"#14181A"} />
        <text x={-220} y={-10} fontFamily={FONT.sans} fontWeight={700} fontSize={110} fill={"#F2EFE6"}>
          £ =
        </text>
        <Paleta texto={f >= cambio ? "5,00" : "7,00"} cambio={cambio} x={60} y={0} />
      </g>
      <g transform={`translate(560 300) scale(${golpe(f, cambio + 8)})`} opacity={aparece(f, cambio + 8, 3)}>
        <text textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={64} fill={P.ocre}>
          PRECIO POLÍTICO
        </text>
        <text y={60} textAnchor="middle" fontFamily={FONT.serif} fontSize={42} fill={"#D9D2BF"}>
          fijado por los bancos de Nueva York
        </text>
      </g>
    </Lienzo>
  );
};
