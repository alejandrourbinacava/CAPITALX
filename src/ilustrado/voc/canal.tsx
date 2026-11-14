import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../../theme";
import type { Decorado, PropsDecorado } from "../tipos";
import { Agua, Barcaza, C, CieloVoc, Defs, Gaviotas, Humo, rnd } from "./comun";
import { Figura, Paseante } from "./Gente";

/* ------------------------------------------------------------------ */
/* Casa de gablete de Amsterdam                                        */
/* ------------------------------------------------------------------ */

export type Gablete = "escalon" | "campana" | "cuello" | "punta" | "cornisa";

export const CasaGablete: React.FC<{
  x: number;
  base: number;
  w: number;
  h: number;
  tipo: Gablete;
  semilla: number;
  luz?: boolean;
  tono?: number;
  moderna?: boolean;
}> = ({ x, base, w, h, tipo, semilla, luz, tono = 0, moderna }) => {
  const s = semilla;
  const pisos = Math.max(2, Math.floor(h / 105));
  const altoPiso = h / pisos;
  const cols = w > 170 ? 3 : 2;
  const relleno = tono === 1 ? "url(#vocLadrilloOsc)" : tono === 2 ? "#5E5650" : tono === 3 ? "#C9B48A" : "url(#vocLadrillo)";
  const piedra = "#EFE8D8";
  const contraventana = rnd(s, 3) > 0.5 ? C.verdeOsc : "#7A2A22";
  const top = base - h;
  const cx = x + w / 2;
  const gable = (() => {
    if (tipo === "escalon") {
      const n = 4;
      const pts: string[] = [`${x},${top}`];
      for (let i = 0; i < n; i++) {
        const xi = x + (i * w) / (2 * n + 1);
        pts.push(`${xi},${top - i * 36}`, `${xi},${top - (i + 1) * 36}`);
      }
      const pico = x + (n * w) / (2 * n + 1);
      pts.push(`${pico},${top - n * 36 - 20}`, `${x + w - (n * w) / (2 * n + 1)},${top - n * 36 - 20}`);
      for (let i = n - 1; i >= 0; i--) {
        const xi = x + w - (i * w) / (2 * n + 1);
        pts.push(`${xi},${top - (i + 1) * 36}`, `${xi},${top - i * 36}`);
      }
      pts.push(`${x + w},${top}`);
      return (
        <g>
          <polygon points={pts.join(" ")} fill={relleno} />
          {Array.from({ length: n }).map((_, i) => (
            <g key={i}>
              <rect x={x + (i * w) / (2 * n + 1) - 2} y={top - (i + 1) * 36 - 5} width={w / (2 * n + 1) + 4} height={6} fill={piedra} />
              <rect x={x + w - ((i + 1) * w) / (2 * n + 1) - 2} y={top - (i + 1) * 36 - 5} width={w / (2 * n + 1) + 4} height={6} fill={piedra} />
            </g>
          ))}
          <rect x={cx - w / (2 * (2 * n + 1)) - 4} y={top - n * 36 - 24} width={w / (2 * n + 1) + 8} height={6} fill={piedra} />
          <rect x={cx - 16} y={top - 110} width={32} height={46} fill={C.cristal} stroke={piedra} strokeWidth={4} />
          {/* viga de la polea */}
          <rect x={cx - 5} y={top - n * 36 - 4} width={10} height={30} fill={"#3A2A1E"} />
          <path d={`M ${cx} ${top - n * 36 + 26} v 30`} stroke={"#3A2A1E"} strokeWidth={2} />
        </g>
      );
    }
    if (tipo === "campana" || tipo === "cuello") {
      const cuello = tipo === "cuello";
      const nw = cuello ? w * 0.38 : w * 0.62;
      const altoG = cuello ? 150 : 120;
      return (
        <g>
          <path
            d={
              cuello
                ? `M ${x} ${top} L ${cx - nw / 2 - 30} ${top} Q ${cx - nw / 2} ${top - 10} ${cx - nw / 2} ${top - 50} L ${cx - nw / 2} ${top - altoG} L ${cx + nw / 2} ${top - altoG} L ${cx + nw / 2} ${top - 50} Q ${cx + nw / 2} ${top - 10} ${cx + nw / 2 + 30} ${top} L ${x + w} ${top} Z`
                : `M ${x} ${top} Q ${x + 10} ${top - 70} ${cx - nw / 2} ${top - 80} Q ${cx - nw / 2 - 10} ${top - altoG} ${cx} ${top - altoG - 14} Q ${cx + nw / 2 + 10} ${top - altoG} ${cx + nw / 2} ${top - 80} Q ${x + w - 10} ${top - 70} ${x + w} ${top} Z`
            }
            fill={relleno}
          />
          {cuello ? (
            <g fill={piedra}>
              <path d={`M ${cx - nw / 2 - 34} ${top} Q ${cx - nw / 2 - 6} ${top - 8} ${cx - nw / 2 - 4} ${top - 48} L ${cx - nw / 2 + 4} ${top - 48} Q ${cx - nw / 2 + 2} ${top + 2} ${cx - nw / 2 - 34} ${top + 6} Z`} />
              <path d={`M ${cx + nw / 2 + 34} ${top} Q ${cx + nw / 2 + 6} ${top - 8} ${cx + nw / 2 + 4} ${top - 48} L ${cx + nw / 2 - 4} ${top - 48} Q ${cx + nw / 2 - 2} ${top + 2} ${cx + nw / 2 + 34} ${top + 6} Z`} />
              <path d={`M ${cx - nw / 2 - 6} ${top - altoG} L ${cx + nw / 2 + 6} ${top - altoG} L ${cx} ${top - altoG - 34} Z`} />
              <rect x={cx - nw / 2 - 6} y={top - altoG - 2} width={nw + 12} height={8} />
            </g>
          ) : (
            <path
              d={`M ${x} ${top} Q ${x + 10} ${top - 70} ${cx - nw / 2} ${top - 80} Q ${cx - nw / 2 - 10} ${top - altoG} ${cx} ${top - altoG - 14} Q ${cx + nw / 2 + 10} ${top - altoG} ${cx + nw / 2} ${top - 80} Q ${x + w - 10} ${top - 70} ${x + w} ${top}`}
              fill="none"
              stroke={piedra}
              strokeWidth={7}
            />
          )}
          <rect x={cx - 18} y={top - altoG + 26} width={36} height={56} fill={C.cristal} stroke={piedra} strokeWidth={4} />
          <rect x={cx - 5} y={top - altoG + 6} width={10} height={24} fill={"#3A2A1E"} />
        </g>
      );
    }
    if (tipo === "punta")
      return (
        <g>
          <polygon points={`${x},${top} ${cx},${top - w * 0.62} ${x + w},${top}`} fill={relleno} />
          <polyline points={`${x - 4},${top + 2} ${cx},${top - w * 0.62 - 4} ${x + w + 4},${top + 2}`} fill="none" stroke={piedra} strokeWidth={7} />
          <rect x={cx - 15} y={top - w * 0.36} width={30} height={42} fill={C.cristal} stroke={piedra} strokeWidth={4} />
        </g>
      );
    return (
      <g>
        <rect x={x - 8} y={top - 22} width={w + 16} height={22} fill={piedra} />
        <rect x={x - 12} y={top - 30} width={w + 24} height={10} fill={"#D9D0BC"} />
        <path d={`M ${cx - 40} ${top - 30} Q ${cx} ${top - 80} ${cx + 40} ${top - 30} Z`} fill={piedra} />
      </g>
    );
  })();
  const ventanas: React.ReactNode[] = [];
  for (let p = 0; p < pisos; p++) {
    const vy = top + p * altoPiso + altoPiso * 0.18;
    const vh = altoPiso * (p === pisos - 1 ? 0.62 : 0.58);
    for (let k = 0; k < cols; k++) {
      if (p === pisos - 1 && k === (cols === 3 ? 1 : 0)) continue;
      const vw = (w - 30) / cols - 18;
      const vx = x + 15 + k * ((w - 30) / cols) + 9;
      const encendida = luz && rnd(s * 7 + p, k + 1) > 0.45;
      ventanas.push(
        <g key={`${p}-${k}`}>
          <rect x={vx - 3} y={vy - 3} width={vw + 6} height={vh + 6} fill={piedra} />
          <rect x={vx} y={vy} width={vw} height={vh} fill={encendida ? "#E9C77A" : C.cristal} />
          {!encendida ? <rect x={vx} y={vy} width={vw * 0.45} height={vh} fill={C.cristalLuz} opacity={0.22} /> : null}
          <path d={`M ${vx + vw / 2} ${vy} V ${vy + vh} M ${vx} ${vy + vh * 0.4} H ${vx + vw}`} stroke={piedra} strokeWidth={2.5} />
          {p >= pisos - 2 && !moderna ? (
            <g>
              <rect x={vx - 13} y={vy + vh * 0.4} width={10} height={vh * 0.6} fill={contraventana} />
              <rect x={vx + vw + 3} y={vy + vh * 0.4} width={10} height={vh * 0.6} fill={contraventana} />
            </g>
          ) : null}
          <rect x={vx - 5} y={vy - 8} width={vw + 10} height={5} fill={"#D9D0BC"} />
        </g>
      );
    }
  }
  return (
    <g>
      {gable}
      <rect x={x} y={top} width={w} height={h} fill={relleno} />
      <rect x={x + w - 8} y={top} width={8} height={h} fill={"#000"} opacity={0.12} />
      {Array.from({ length: pisos - 1 }).map((_, p) => (
        <rect key={p} x={x} y={top + (p + 1) * altoPiso - 5} width={w} height={5} fill={piedra} opacity={0.85} />
      ))}
      {ventanas}
      {/* puerta con escalinata */}
      {(() => {
        const dx = cols === 3 ? cx - 22 : x + w - 64;
        const dh = altoPiso * 0.66;
        return (
          <g>
            <rect x={dx - 6} y={base - dh - 26} width={56} height={dh + 26} fill={piedra} />
            <rect x={dx} y={base - dh - 20} width={44} height={16} fill={"#E9C77A"} opacity={luz ? 0.9 : 0.4} />
            <rect x={dx} y={base - dh} width={44} height={dh} fill={rnd(s, 5) > 0.5 ? "#2E4A3E" : "#3A2A1E"} />
            <rect x={dx + 4} y={base - dh + 6} width={16} height={dh - 12} fill="none" stroke={"#00000033"} strokeWidth={2} />
            <rect x={dx + 24} y={base - dh + 6} width={16} height={dh - 12} fill="none" stroke={"#00000033"} strokeWidth={2} />
            <rect x={dx - 10} y={base - 6} width={64} height={6} fill={C.piedraMedia} />
          </g>
        );
      })()}
      {/* anclas de hierro y fecha en la fachada */}
      {!moderna ? (
        <g fill={"#2A2420"}>
          <rect x={x + 10} y={top + altoPiso - 26} width={5} height={18} />
          <rect x={x + w - 15} y={top + altoPiso - 26} width={5} height={18} />
        </g>
      ) : null}
    </g>
  );
};

/** Hilera de casas con gabletes variados, de x0 a x1. */
export const Hilera: React.FC<{ x0: number; x1: number; base: number; semilla: number; luz?: boolean; escala?: number; moderna?: boolean }> = ({
  x0,
  x1,
  base,
  semilla,
  luz,
  escala = 1,
  moderna,
}) => {
  const casas: React.ReactNode[] = [];
  let x = x0;
  let i = 0;
  const tipos: Gablete[] = ["escalon", "campana", "cuello", "punta", "escalon", "cornisa", "cuello"];
  while (x < x1) {
    const w = (140 + rnd(i, semilla) * 70) * escala;
    const h = (300 + rnd(i, semilla + 1) * 160) * escala;
    casas.push(
      <CasaGablete key={i} x={x} base={base} w={w} h={h} tipo={tipos[Math.floor(rnd(i, semilla + 2) * tipos.length)]} semilla={semilla * 31 + i} luz={luz} tono={Math.floor(rnd(i, semilla + 3) * 4) % 4} moderna={moderna} />
    );
    x += w + 2;
    i++;
  }
  return <g>{casas}</g>;
};

/** Olmo del muelle, con la copa que se mece. */
export const Olmo: React.FC<{ x: number; y: number; s?: number; semilla?: number }> = ({ x, y, s = 1, semilla = 1 }) => {
  const f = useCurrentFrame();
  const m = Math.sin(f * 0.03 + semilla) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -10 0 L -6 -180 Q 0 -200 6 -180 L 10 0 Z" fill={"#4A3A2C"} />
      <path d="M -4 -150 L -40 -210 M 4 -140 L 44 -200" stroke={"#4A3A2C"} strokeWidth={7} />
      <g transform={`translate(${m} 0)`}>
        <ellipse cx={0} cy={-250} rx={96} ry={80} fill={C.hojaOsc} />
        <ellipse cx={-50} cy={-220} rx={60} ry={48} fill={C.hoja} />
        <ellipse cx={40} cy={-280} rx={64} ry={50} fill={C.hoja} />
        <ellipse cx={20} cy={-210} rx={50} ry={36} fill={C.hojaLuz} opacity={0.6} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Decorado: canal de Amsterdam y el Puente Nuevo                       */
/* ------------------------------------------------------------------ */

const DibujoCanal: React.FC<PropsDecorado> = ({ e, f }) => {
  const hora = e.hora ?? "dia";
  const luz = hora !== "dia";
  const gente = e.gente ?? 0.7;
  const s = e.semilla ?? 1;
  const lluvia = e.variante === "lluvia";
  return (
    <g>
      <Defs />
      <CieloVoc hora={hora} tipo={lluvia ? "tormenta" : "norte"} ancho={3800} x0={-400} />
      {/* torre de la Oude Kerk y mastiles del Damrak al fondo */}
      <g fill={"#B9AE96"}>
        <rect x={2380} y={170} width={90} height={460} />
        <rect x={2360} y={150} width={130} height={30} />
        <path d="M 2385 150 L 2425 40 L 2465 150 Z" />
        <rect x={2410} y={10} width={30} height={40} />
        <circle cx={2425} cy={240} r={30} fill={"#D8CDB6"} />
      </g>
      {[1960, 2120, 2600, 2760, 2900].map((mx, i) => (
        <g key={mx} fill={"#8F8573"}>
          <rect x={mx} y={260 + i * 12} width={7} height={380} />
          <rect x={mx - 60} y={330 + i * 12} width={127} height={5} />
          <rect x={mx - 44} y={420 + i * 12} width={95} height={5} />
        </g>
      ))}
      {/* casas del muelle de enfrente */}
      <Hilera x0={-300} x1={1820} base={600} semilla={3 + (s % 5)} luz={luz} />
      <Hilera x0={2520} x1={3300} base={610} semilla={9} luz={luz} escala={0.8} />
      {/* muelle del fondo */}
      <rect x={-400} y={600} width={2240} height={50} fill="url(#vocAdoquin)" />
      <rect x={-400} y={642} width={2240} height={12} fill={C.piedraMedia} />
      {[60, 520, 980, 1440].map((tx, i) => (
        <Olmo key={tx} x={tx} y={648} s={0.8} semilla={i} />
      ))}
      {Array.from({ length: Math.round(6 * gente) }).map((_, i) => (
        <Paseante key={i} x0={-100 + rnd(i, s + 1) * 1900} y={646} v={(rnd(i, s + 2) > 0.5 ? 1 : -1) * (0.5 + rnd(i, 3) * 0.6)} escala={0.36} traje={(["burgues", "mujer", "marinero", "burgues", "mujer"] as const)[i % 5]} semilla={s * 50 + i} />
      ))}
      {/* agua del canal */}
      <Agua y={654} ancho={3800} alto={430} color={hora === "noche" ? "#4A5A5A" : C.agua} />
      {/* reflejos de las casas: franjas que tiemblan */}
      <g opacity={0.16}>
        {Array.from({ length: 22 }).map((_, i) => (
          <rect key={i} x={-200 + i * 92 + Math.sin(f * 0.06 + i) * 6} y={664 + (i % 4) * 14} width={40 + (i % 3) * 20} height={6} rx={3} fill={C.ladrilloOsc} />
        ))}
      </g>
      <Barcaza x0={200 + rnd(s, 4) * 200} y={790} v={0.7} s={0.8} carga={s % 2 ? "sacos" : "toneles"} />
      {/* el Puente Nuevo: arcos de ladrillo y piedra sobre el agua */}
      <g>
        <rect x={1840} y={640} width={940} height={50} fill={C.piedraMedia} />
        <rect x={1840} y={690} width={940} height={150} fill="url(#vocLadrillo)" />
        {[1900, 2120, 2340, 2560].map((ax) => (
          <path key={ax} d={`M ${ax} 840 L ${ax} 760 Q ${ax + 80} 690 ${ax + 160} 760 L ${ax + 160} 840 Z`} fill={"#33403D"} />
        ))}
        {[1900, 2120, 2340, 2560].map((ax) => (
          <path key={ax} d={`M ${ax - 6} 760 Q ${ax + 80} 684 ${ax + 166} 760`} fill="none" stroke={C.piedraLuz} strokeWidth={8} />
        ))}
        <rect x={1840} y={622} width={940} height={22} fill={C.piedra} />
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x={1850 + i * 39} y={590} width={10} height={34} fill={C.piedraSombra} />
        ))}
        <rect x={1840} y={584} width={940} height={10} fill={C.piedra} />
        {/* mercaderes sobre el puente */}
        {Array.from({ length: Math.round(9 * Math.max(0.4, gente)) }).map((_, i) => {
          const px = 1900 + i * 96 + rnd(i, s + 5) * 30;
          const trajes = ["burgues", "burgues", "peluca", "burgues", "mujer"] as const;
          return (
            <Figura key={i} x={px} y={628} escala={0.42} traje={i % 7 === 4 ? "mujer" : trajes[i % 2 === 0 ? 0 : 1]} semilla={s * 13 + i * 3} pose={i % 3 === 0 ? "habla" : i % 3 === 1 ? "lee" : "quieto"} mirada={i % 2 ? -0.8 : 0.8} />
          );
        })}
      </g>
      {/* muelle de delante */}
      <rect x={-400} y={880} width={2250} height={220} fill="url(#vocAdoquin)" />
      <rect x={-400} y={872} width={2250} height={16} fill={C.piedra} />
      <rect x={1830} y={872} width={20} height={220} fill={C.piedraMedia} />
      {[120, 560, 1000, 1440].map((bx) => (
        <g key={bx}>
          <rect x={bx - 10} y={850} width={20} height={34} rx={6} fill={"#2A2420"} />
        </g>
      ))}
      {Array.from({ length: Math.round(5 * gente) }).map((_, i) => (
        <Paseante
          key={i}
          x0={-200 + rnd(i, s + 7) * 2000}
          y={1040 - (i % 2) * 30}
          v={(i % 2 ? -1 : 1) * (0.9 + rnd(i, 8) * 0.6)}
          escala={0.82 - (i % 2) * 0.08}
          traje={(["burgues", "mujer", "marinero", "burgues", "soldado"] as const)[(i + s) % 5]}
          semilla={s * 70 + i}
          carga={i === 2 ? "saco" : "ninguna"}
        />
      ))}
      <Gaviotas n={4} x0={0} y0={60} ancho={2880} />
      {hora !== "noche" && !lluvia ? <Humo x={820} y={140} s={0.6} /> : null}
      {lluvia ? (
        <g stroke={"#DCE2E0"} strokeWidth={2} opacity={0.5}>
          {Array.from({ length: 140 }).map((_, i) => {
            const x = (rnd(i, 1) * 3400 + f * 3) % 3400 - 300;
            const y = (rnd(i, 2) * 1100 + f * 22) % 1100 - 20;
            return <path key={i} d={`M ${x} ${y} l -6 26`} />;
          })}
        </g>
      ) : null}
    </g>
  );
};

export const canal: Decorado = {
  desc: "Amsterdam en el XVII: canal con casas de gablete, olmos, barcaza, muelle con gente y, a la derecha, el Puente Nuevo con mercaderes tratando sobre el; al fondo la torre de la Oude Kerk y mastiles",
  ancho: 2880,
  admite: "hora (dia|tarde|noche), gente, semilla; variante 'lluvia'",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 1060, y: 540, z: 1.06 }, desc: "el canal y las casas" },
    paseo: { de: { x: 960, y: 560, z: 1.05 }, a: { x: 1880, y: 560, z: 1.05 }, desc: "paneo del canal al puente" },
    puente: { de: { x: 2240, y: 560, z: 1.6 }, a: { x: 2300, y: 540, z: 1.9 }, desc: "los mercaderes sobre el Puente Nuevo" },
    casas: { de: { x: 700, y: 380, z: 2.1 }, a: { x: 900, y: 360, z: 2.2 }, desc: "detalle de los gabletes" },
    muelle: { de: { x: 760, y: 760, z: 1.7 }, a: { x: 940, y: 760, z: 1.75 }, desc: "gente en el muelle y la barcaza" },
  },
  dibujo: DibujoCanal,
};

/* rotulo de comercio reutilizable */
export const Letrero: React.FC<{ x: number; y: number; w: number; t: string; fondo?: string; color?: string; size?: number }> = ({ x, y, w, t, fondo = C.verdeOsc, color = C.laton, size = 24 }) => (
  <g>
    <rect x={x} y={y} width={w} height={size * 1.7} fill={fondo} />
    <rect x={x + 4} y={y + 4} width={w - 8} height={size * 1.7 - 8} fill="none" stroke={color} strokeWidth={2} />
    <text x={x + w / 2} y={y + size * 1.2} textAnchor="middle" fontFamily={FONT.serif} fontSize={size} letterSpacing={3} fill={color}>
      {t}
    </text>
  </g>
);

