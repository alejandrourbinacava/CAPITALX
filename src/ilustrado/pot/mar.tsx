import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloAndes, Humo, Mula, TexturasPot, mezcla, osc, rr } from "./comun";
import { Frente, Perfil } from "./Gente";
import { Balanza, Barra } from "./moneda";

/**
 * El mar de la plata: los galeones de la flota, el puerto de Arica, el pecio
 * en el fondo del mar; Sevilla con la Torre del Oro y el Arenal; y Manila,
 * donde el galeon se encuentra con los juncos chinos y la plata se cambia por
 * seda y porcelana.
 */

/** Galeon de perfil, que se mece. Proa hacia la derecha (dir 1). */
export const Galeon: React.FC<{ x: number; y: number; s?: number; dir?: 1 | -1; semilla?: number; v?: number; velas?: boolean; tinte?: (c: string) => string }> = ({
  x,
  y,
  s = 1,
  dir = 1,
  semilla = 1,
  v = 0,
  velas = true,
  tinte = (c) => c,
}) => {
  const f = useCurrentFrame();
  const fase = rr(semilla, 3) * 6.28;
  const balanceo = Math.sin(f * 0.04 + fase) * 1.6;
  const bote = Math.sin(f * 0.05 + fase) * 4;
  const ond = Math.sin(f * 0.15 + fase);
  const casco = tinte("#5A3A28");
  const cascoL = tinte("#7A5034");
  const vela = tinte("#EDE3C8");
  const velaS = tinte("#D6C9A8");
  const VelaCuadra = ({ cx, cy, w, h }: { cx: number; cy: number; w: number; h: number }) => (
    <g>
      <path d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + 12} ${cx + w / 2} ${cy} L ${cx + w / 2 + 6} ${cy + h} Q ${cx} ${cy + h + 22 + ond * 4} ${cx - w / 2 - 6} ${cy + h} Z`} fill={vela} />
      <path d={`M ${cx + w * 0.2} ${cy + 4} L ${cx + w / 2 + 6} ${cy + h} Q ${cx + w * 0.3} ${cy + h + 14} ${cx + w * 0.2} ${cy + h + 12} Z`} fill={velaS} />
    </g>
  );
  return (
    <g transform={`translate(${x + v * f} ${y + bote}) scale(${s * dir} ${s}) rotate(${balanceo})`}>
      {/* mastiles y velas */}
      {[-150, 20, 170].map((mx, i) => (
        <rect key={mx} x={mx - 6} y={i === 1 ? -560 : -440} width={12} height={i === 1 ? 560 : 440} fill={tinte("#4A3020")} />
      ))}
      <path d="M 170 -420 L 330 -40" stroke={tinte("#4A3020")} strokeWidth={8} />
      {velas ? (
        <g>
          <VelaCuadra cx={20} cy={-520} w={190} h={120} />
          <VelaCuadra cx={20} cy={-370} w={260} h={170} />
          <VelaCuadra cx={170} cy={-400} w={170} h={110} />
          <VelaCuadra cx={170} cy={-270} w={210} h={130} />
          <path d={`M -150 -420 L -150 -170 L ${-280 - ond * 6} -180 Z`} fill={vela} />
          {/* cruz de Borgona en la vela mayor */}
          <path d="M -40 -340 L 80 -230 M 80 -340 L -40 -230" stroke={tinte(C.carmin)} strokeWidth={14} strokeLinecap="round" />
          <path d={`M 290 -100 L 390 -60 L 300 -40 Z`} fill={vela} />
        </g>
      ) : null}
      {/* banderas */}
      {[[20, -560], [-150, -440], [170, -440]].map(([fx, fy], i) => (
        <path key={i} d={`M ${fx} ${fy} L ${fx + 50} ${fy + 6 + ond * 4} L ${fx + 46} ${fy + 22} L ${fx} ${fy + 20} Z`} fill={tinte(i === 0 ? C.carmin : "#EDE3C8")} />
      ))}
      {/* casco con castillos de popa y proa */}
      <path d="M -300 -40 L -290 -170 L -170 -170 L -160 -110 L 180 -110 L 190 -150 L 300 -140 L 340 -60 Q 300 30 160 40 L -160 40 Q -280 20 -300 -40 Z" fill={casco} />
      <path d="M -296 -90 L 330 -80 L 334 -66 L -298 -74 Z" fill={tinte(C.ocre)} opacity={0.8} />
      <path d="M -300 -40 Q -280 20 -160 40 L 160 40 Q 300 30 340 -60 L 330 -40 Q 290 14 160 22 L -160 22 Q -270 6 -296 -50 Z" fill={osc(casco, 0.7)} />
      <rect x={-290} y={-170} width={130} height={60} fill={cascoL} />
      {[-270, -230, -190].map((wx) => (
        <rect key={wx} x={wx} y={-156} width={20} height={26} fill={tinte("#E9C77A")} opacity={0.8} />
      ))}
      {[-120, -60, 0, 60, 120].map((px) => (
        <rect key={px} x={px} y={-56} width={22} height={18} fill={tinte("#2A1A12")} />
      ))}
      <path d="M -296 -176 L -160 -176" stroke={tinte(C.oro)} strokeWidth={6} />
      <path d="M 300 -140 L 420 -180" stroke={tinte("#4A3020")} strokeWidth={10} />
    </g>
  );
};

/** Junco chino con velas de esteras y listones. */
export const Junco: React.FC<{ x: number; y: number; s?: number; dir?: 1 | -1; semilla?: number }> = ({ x, y, s = 1, dir = 1, semilla = 1 }) => {
  const f = useCurrentFrame();
  const fase = rr(semilla, 3) * 6.28;
  const bal = Math.sin(f * 0.045 + fase) * 1.8;
  const bote = Math.sin(f * 0.05 + fase) * 4;
  const vela = ["#A8542E", "#8E4A2C", "#B8703E"][Math.floor(rr(semilla, 4) * 3)];
  return (
    <g transform={`translate(${x} ${y + bote}) scale(${s * dir} ${s}) rotate(${bal})`}>
      {[[-80, -420, 200, 300], [90, -340, 160, 240]].map(([vx, vy, w, h], i) => (
        <g key={i}>
          <rect x={vx + w / 2 - 6} y={vy - 20} width={10} height={-vy + 40} fill={"#4A3020"} />
          <path d={`M ${vx} ${vy} Q ${vx + w / 2} ${vy - 40} ${vx + w} ${vy} L ${vx + w + 10} ${vy + h} L ${vx - 10} ${vy + h} Z`} fill={vela} />
          {Array.from({ length: 7 }).map((_, k) => (
            <path key={k} d={`M ${vx - 4} ${vy + 30 + k * (h / 7)} H ${vx + w + 6}`} stroke={osc(vela, 0.65)} strokeWidth={5} />
          ))}
        </g>
      ))}
      <path d="M -260 -110 L -200 -60 L 220 -60 L 280 -130 L 260 -20 Q 200 30 0 30 Q -200 30 -240 -10 Z" fill={"#6A4228"} />
      <path d="M -260 -110 L -220 -150 L -150 -150 L -150 -60 L -200 -60 Z" fill={"#7A5034"} />
      <path d="M -240 -40 L 260 -40" stroke={"#C8402C"} strokeWidth={8} />
      <circle cx={232} cy={-80} r={14} fill={"#EDE3C8"} />
      <circle cx={236} cy={-80} r={6} fill={C.tinta} />
    </g>
  );
};

/** Mar con olas animadas desde y0 hasta abajo. */
const Mar: React.FC<{ y0: number; ancho: number; t: (c: string) => string }> = ({ y0, ancho, t }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <rect x={-200} y={y0} width={ancho + 400} height={1200 - y0} fill={t(C.mar)} />
      {Array.from({ length: 9 }).map((_, fila) => {
        const y = y0 + 20 + fila * fila * 9;
        const k = 0.4 + fila * 0.12;
        return (
          <path
            key={fila}
            d={Array.from({ length: Math.ceil((ancho + 400) / (90 * k)) })
              .map((_, i) => {
                const x = -200 + i * 90 * k + ((f * (0.6 + fila * 0.15)) % (90 * k));
                return `M ${x} ${y} q ${22 * k} ${-8 * k} ${45 * k} 0`;
              })
              .join(" ")}
            stroke={t(fila % 2 ? C.marLuz : "#87A3A6")}
            strokeWidth={2 + fila * 0.5}
            fill="none"
            opacity={0.8}
          />
        );
      })}
    </g>
  );
};

const Gaviota: React.FC<{ x0: number; y: number; v: number; s?: number }> = ({ x0, y, v, s = 1 }) => {
  const f = useCurrentFrame();
  const a = Math.sin(f * 0.3 + x0) * 10;
  return <path transform={`translate(${x0 + v * f} ${y + Math.sin(f * 0.05 + x0) * 10}) scale(${s})`} d={`M -20 ${a * 0.4} Q -10 ${-8 - a} 0 0 Q 10 ${-8 - a} 20 ${a * 0.4}`} stroke={C.tinta} strokeWidth={3} fill="none" />;
};

/* ------------------------------------------------------------------ */
/* pot/flota                                                            */
/* ------------------------------------------------------------------ */

const DibujoFlota: React.FC<PropsDecorado> = ({ e }) => {
  const f = useCurrentFrame();
  const hora = e.hora ?? "dia";
  const sem = e.semilla ?? 3;
  const v = e.variante ?? "mar";
  const t = (c: string) => (hora === "noche" ? mezcla(c, "#1A2030", 0.55) : hora === "tarde" ? mezcla(c, "#E0A060", 0.18) : c);
  if (v === "fondo") {
    return (
      <g>
        <defs>
          <linearGradient id="pot-fondo-mar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3E6A70" />
            <stop offset="1" stopColor="#14282C" />
          </linearGradient>
        </defs>
        <rect x={-100} y={-100} width={2120} height={1300} fill="url(#pot-fondo-mar)" />
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={i} d={`M ${200 + i * 320 + Math.sin(f * 0.02 + i) * 30} -100 L ${300 + i * 320} 900 L ${360 + i * 320} 900 L ${260 + i * 320 + Math.sin(f * 0.02 + i) * 30} -100 Z`} fill={"#BFD8D0"} opacity={0.06} />
        ))}
        <path d="M -100 860 Q 500 820 1000 860 Q 1500 900 2020 840 L 2020 1200 L -100 1200 Z" fill={"#8A8068"} />
        <path d="M -100 940 Q 600 900 1200 950 L 2020 920 L 2020 1200 L -100 1200 Z" fill={"#6E6650"} />
        {/* el pecio */}
        <g transform="translate(980 880) rotate(-12)">
          <path d="M -420 -40 L -400 -200 L -260 -190 L -250 -140 L 260 -140 L 380 -60 Q 300 20 160 30 L -300 30 Z" fill={"#3A2E24"} />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={-380 + i * 60} y={-140} width={14} height={170} fill={"#2A2018"} />
          ))}
          <path d="M -100 -140 L 400 -460" stroke={"#3A2E24"} strokeWidth={22} />
          <path d="M -60 -150 L 120 -260" stroke={"#3A2E24"} strokeWidth={10} />
        </g>
        {/* cofres y monedas esparcidas */}
        <g transform="translate(560 940)">
          <path d="M -80 0 L -80 -70 L 80 -70 L 80 0 Z" fill={"#4A3A2A"} />
          <path d="M -84 -70 Q 0 -120 84 -70 L 70 -110 Q 0 -150 -70 -110 Z" fill={"#5A4A36"} transform="rotate(-20 -84 -70)" />
        </g>
        {Array.from({ length: 40 }).map((_, i) => {
          const tw = Math.max(0, Math.sin(f * 0.1 + i));
          return <ellipse key={i} cx={400 + rr(i, 3) * 1000} cy={900 + rr(i, 4) * 120} rx={14} ry={5} fill={i % 3 ? "#9A9C94" : "#C8C9C0"} opacity={0.8 + tw * 0.2} />;
        })}
        {/* peces */}
        {Array.from({ length: 7 }).map((_, i) => {
          const x = ((rr(i, 7) * 2400 + f * (0.8 + rr(i, 8))) % 2400) - 200;
          const y = 200 + rr(i, 9) * 500;
          return (
            <g key={i} transform={`translate(${x} ${y + Math.sin(f * 0.1 + i) * 6})`}>
              <ellipse cx={0} cy={0} rx={24} ry={9} fill={"#7AA0A0"} />
              <path d="M -22 0 L -40 -10 L -40 10 Z" fill={"#7AA0A0"} />
            </g>
          );
        })}
        {Array.from({ length: 10 }).map((_, i) => {
          const tt = (f * 0.01 + i / 10) % 1;
          return <circle key={i} cx={900 + rr(i, 11) * 300} cy={800 - tt * 900} r={4 + rr(i, 12) * 5} fill="none" stroke={"#BFD8D0"} strokeWidth={2} opacity={0.5} />;
        })}
      </g>
    );
  }
  const puerto = v === "puerto";
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={1920} id="flota" nubes={5} />
      {puerto ? (
        <g>
          {/* el Morro de Arica y la costa del desierto */}
          <path d="M 1100 600 Q 1300 600 1420 330 Q 1500 300 1600 320 Q 1760 340 2020 300 L 2020 640 L 1100 640 Z" fill={t("#A8784E")} />
          <path d="M 1420 330 Q 1500 300 1600 320 L 1580 600 L 1400 610 Z" fill={t("#8E6440")} />
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={i} d={`M ${1440 + i * 18} ${360 + i * 20} h 60`} stroke={t("#7A5236")} strokeWidth={4} />
          ))}
          <path d="M 1500 640 Q 1700 620 2020 630 L 2020 760 L 1500 760 Z" fill={t("#D9C29A")} />
          {/* el pueblo */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={1620 + i * 70} y={600 - (i % 2) * 20} width={56} height={40 + (i % 2) * 20} fill={t(C.cal)} />
          ))}
          <rect x={1980} y={560} width={30} height={80} fill={t(C.cal)} />
        </g>
      ) : null}
      <Mar y0={600} ancho={1920} t={t} />
      {puerto ? null : <Galeon x={1700} y={640} s={0.22} semilla={sem + 3} v={0.12} tinte={t} />}
      <Galeon x={240} y={660} s={0.32} semilla={sem + 1} v={0.2} tinte={t} />
      {puerto ? null : <Galeon x={1260} y={680} s={0.4} semilla={sem + 2} v={0.25} tinte={t} />}
      <Galeon x={760} y={860} s={1} semilla={sem} v={puerto ? 0 : 0.3} tinte={t} />
      {puerto ? (
        <g>
          {/* la chalupa que lleva las barras al galeon */}
          <g transform={`translate(${1260 - f * 0.6} ${900 + Math.sin(f * 0.07) * 6})`}>
            <path d="M -140 -30 L 140 -30 L 120 20 L -120 20 Z" fill={t("#6A4A30")} />
            {[0, 1, 2].map((i) => (
              <Barra key={i} x={-60 + i * 50} y={-34 - (i % 2) * 14} s={0.4} />
            ))}
            <Perfil traje="andino" semilla={sem + 30} x0={70} y={-20} s={0.36} pose="rema" dir={-1} />
            <Perfil traje="espanol" semilla={sem + 31} x0={-110} y={-20} s={0.36} pose="quieto" />
          </g>
          <Mula x0={1720} y={720} v={-0.3} s={0.3} semilla={sem} carga="plata" />
          <Mula x0={1820} y={724} v={-0.3} s={0.3} semilla={sem + 1} carga="plata" />
        </g>
      ) : null}
      <Gaviota x0={300} y={300} v={0.8} />
      <Gaviota x0={600} y={240} v={0.7} s={0.8} />
      <Gaviota x0={1400} y={380} v={-0.6} s={0.9} />
      {hora === "noche" ? <rect x={-100} y={-100} width={2120} height={1300} fill={"#0A1020"} opacity={0.15} /> : null}
    </g>
  );
};

export const FLOTA: Decorado = {
  desc: "Galeones de la flota de la plata en alta mar, con la cruz de Borgona en la vela mayor, meciendose entre olas y gaviotas. Variante 'puerto': el Morro de Arica y la costa del desierto, una chalupa lleva barras de plata al galeon fondeado y mulas cargadas bajan a la playa. Variante 'fondo': el pecio de un galeon en el fondo del mar, con cofres y monedas esparcidas, peces y rayos de luz.",
  admite: "variante ('mar' | 'puerto' | 'fondo'), hora, semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 1000, y: 540, z: 1.06 }, desc: "el mar con la flota (o el puerto, o el fondo)" },
    galeon: { de: { x: 820, y: 620, z: 1.7 }, a: { x: 860, y: 600, z: 1.85 }, desc: "el galeon grande de cerca (o el pecio)" },
    velas: { de: { x: 800, y: 420, z: 2.2 }, a: { x: 820, y: 400, z: 2.4 }, desc: "las velas con la cruz de Borgona (o el mastil del pecio)" },
    detalle: { de: { x: 1180, y: 840, z: 2.4 }, a: { x: 1120, y: 840, z: 2.6 }, desc: "la chalupa con las barras (puerto) o las monedas del fondo" },
    lejos: { de: { x: 1300, y: 560, z: 1.6 }, a: { x: 1340, y: 540, z: 1.7 }, desc: "los otros galeones, o el Morro de Arica" },
  },
  dibujo: DibujoFlota,
};

/* ------------------------------------------------------------------ */
/* pot/sevilla                                                          */
/* ------------------------------------------------------------------ */

const TorreOro: React.FC<{ x: number; y: number; t: (c: string) => string }> = ({ x, y, t }) => (
  <g>
    <rect x={x - 130} y={y - 380} width={260} height={380} fill={t("#D9B878")} />
    {[-90, -30, 30, 90].map((dx, i) => (
      <rect key={dx} x={x + dx - 4} y={y - 380} width={8} height={380} fill={t(i % 2 ? "#C9A866" : "#E4C88A")} />
    ))}
    <rect x={x - 140} y={y - 400} width={280} height={24} fill={t("#C9A866")} />
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={x - 136 + i * 28} y={y - 424} width={16} height={26} fill={t("#C9A866")} />
    ))}
    <rect x={x - 76} y={y - 560} width={152} height={160} fill={t("#E4C88A")} />
    {[-40, 0, 40].map((dx) => (
      <path key={dx} d={`M ${x + dx - 10} ${y - 470} V ${y - 510} Q ${x + dx} ${y - 524} ${x + dx + 10} ${y - 510} V ${y - 470} Z`} fill={t("#5A4A3A")} />
    ))}
    <rect x={x - 40} y={y - 640} width={80} height={80} fill={t("#D9B878")} />
    <path d={`M ${x - 46} ${y - 640} Q ${x} ${y - 720} ${x + 46} ${y - 640} Z`} fill={t("#E8C24A")} />
    {[-80, 0, 80].map((dx) => (
      <path key={dx} d={`M ${x + dx - 14} ${y - 200} V ${y - 250} Q ${x + dx} ${y - 270} ${x + dx + 14} ${y - 250} V ${y - 200} Z`} fill={t("#5A4A3A")} />
    ))}
  </g>
);

const Giralda: React.FC<{ x: number; y: number; t: (c: string) => string }> = ({ x, y, t }) => (
  <g>
    <rect x={x - 50} y={y - 520} width={100} height={520} fill={t("#C9A47A")} />
    {Array.from({ length: 6 }).map((_, i) => (
      <path key={i} d={`M ${x - 30} ${y - 80 - i * 70} h 60 v 40 h -60 Z`} fill="none" stroke={t("#B08A60")} strokeWidth={4} />
    ))}
    <rect x={x - 40} y={y - 620} width={80} height={100} fill={t("#E2D2B4")} />
    <rect x={x - 26} y={y - 700} width={52} height={80} fill={t("#E2D2B4")} />
    <path d={`M ${x - 20} ${y - 700} Q ${x} ${y - 760} ${x + 20} ${y - 700} Z`} fill={t("#C9A866")} />
    <rect x={x - 3} y={y - 790} width={6} height={50} fill={t("#5A5A5A")} />
  </g>
);

const DibujoSevilla: React.FC<PropsDecorado> = ({ e }) => {
  const f = useCurrentFrame();
  const hora = e.hora ?? "dia";
  const sem = e.semilla ?? 7;
  const gente = e.gente ?? 0.8;
  const W = 2400;
  const t = (c: string) => (hora === "noche" ? mezcla(c, "#1A2030", 0.55) : hora === "tarde" ? mezcla(c, "#E0A060", 0.2) : c);
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={W} id="sevilla" nubes={5} alto={1080} />
      {/* la ciudad al fondo */}
      <rect x={-100} y={500} width={W + 200} height={200} fill={t("#E6D8BC")} />
      {Array.from({ length: 34 }).map((_, i) => (
        <g key={i}>
          <rect x={-100 + i * 76} y={520 - rr(i, 3) * 80} width={70} height={200} fill={t(i % 3 ? "#EDE3CE" : "#E2CDA8")} />
          <path d={`M ${-104 + i * 76} ${520 - rr(i, 3) * 80} h 78 l -8 -16 h -62 Z`} fill={t(C.teja)} />
          <rect x={-80 + i * 76} y={560 - rr(i, 3) * 80} width={14} height={20} fill={t("#5A4A3A")} />
        </g>
      ))}
      {/* la catedral y la Giralda */}
      <rect x={1300} y={420} width={520} height={260} fill={t("#D2BC96")} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M ${1310 + i * 88} 420 L ${1350 + i * 88} 360 L ${1390 + i * 88} 420 Z`} fill={t("#C9AE86")} />
      ))}
      <Giralda x={1900} y={700} t={t} />
      {/* el Arenal y el muelle */}
      <rect x={-100} y={680} width={W + 200} height={120} fill={t("#C9B48A")} />
      <rect x={-100} y={790} width={W + 200} height={20} fill={t(C.piedraSombra)} />
      {/* el rio */}
      <rect x={-100} y={808} width={W + 200} height={400} fill={t("#7E9A8E")} />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={((rr(i, 5) * W + f * 0.8) % (W + 200)) - 100} y={830 + rr(i, 6) * 220} width={60 + rr(i, 7) * 120} height={4} fill={t("#A9C2B8")} opacity={0.8} />
      ))}
      <TorreOro x={300} y={800} t={t} />
      <Galeon x={1000} y={980} s={0.75} semilla={sem} velas={false} tinte={t} />
      <Galeon x={1700} y={1000} s={0.6} semilla={sem + 1} velas={false} dir={-1} tinte={t} />
      {/* la descarga: cajas y barras hacia las carretas */}
      <g transform="translate(1380 800)">
        <path d="M -180 0 L -150 -70 L 150 -70 L 180 0 Z" fill={t(C.maderaMedia)} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-140 + i * 90} y={-120} width={80} height={50} fill={t(C.madera)} />
        ))}
        <circle cx={-110} cy={0} r={40} fill="none" stroke={t(C.madera)} strokeWidth={10} />
        <circle cx={110} cy={0} r={40} fill="none" stroke={t(C.madera)} strokeWidth={10} />
      </g>
      {[0, 1, 2, 3].slice(0, Math.round(1 + gente * 3)).map((i) => (
        <Perfil key={i} traje="espanol" semilla={sem + 10 + i} x0={600 + i * 150} y={790} v={0.6} s={0.48} pose="carga" espalda="costal" color={["#6A5A48", "#4A4A3A", "#5A4A3A", "#3E4E5A"][i]} gorro="ninguno" />
      ))}
      <Frente traje="mercader" semilla={sem + 20} x={1560} y={800} s={0.62} pose="lee" gesto="serio" />
      <Frente traje="espanol" semilla={sem + 21} x={1700} y={800} s={0.6} pose="habla" />
      <Frente traje="europea" semilla={sem + 22} x={2100} y={796} s={0.58} pose="quieto" />
      <g transform="translate(520 790)">
        {[0, 1, 2].map((i) => (
          <Barra key={i} x={i * 60} y={-i * 6} s={0.4} />
        ))}
      </g>
      <Gaviota x0={600} y={260} v={0.6} />
      <Gaviota x0={1500} y={320} v={-0.5} s={0.8} />
    </g>
  );
};

export const SEVILLA: Decorado = {
  desc: "Sevilla hacia 1590: el Guadalquivir con galeones amarrados, la Torre del Oro a la izquierda, la ciudad de casas blancas con la catedral y la Giralda al fondo; en el Arenal, porteadores que bajan la plata hacia una carreta, barras en el muelle y mercaderes con sus papeles.",
  ancho: 2400,
  admite: "hora, gente, semilla",
  tomas: {
    general: { de: { x: 1000, y: 540, z: 1 }, a: { x: 1400, y: 540, z: 1.04 }, desc: "el rio, la torre, los galeones y la ciudad" },
    torre: { de: { x: 570, y: 520, z: 1.7 }, a: { x: 590, y: 500, z: 1.85 }, desc: "la Torre del Oro" },
    descarga: { de: { x: 900, y: 700, z: 2.2 }, a: { x: 1000, y: 700, z: 2.3 }, desc: "los porteadores con la carga en el Arenal" },
    mercaderes: { de: { x: 1640, y: 640, z: 2.6 }, a: { x: 1620, y: 630, z: 2.9 }, desc: "los mercaderes con sus papeles" },
    giralda: { de: { x: 1800, y: 480, z: 1.6 }, a: { x: 1860, y: 460, z: 1.7 }, desc: "la catedral y la Giralda" },
  },
  dibujo: DibujoSevilla,
};

/* ------------------------------------------------------------------ */
/* pot/manila                                                           */
/* ------------------------------------------------------------------ */

const Palmera: React.FC<{ x: number; y: number; s: number; t: (c: string) => string }> = ({ x, y, s, t }) => {
  const f = useCurrentFrame();
  const v = Math.sin(f * 0.05 + x) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -8 0 Q 0 -150 20 -300 L 30 -300 Q 12 -150 8 0 Z" fill={t("#7A5A3A")} />
      {[-60, -20, 20, 60, 100, 150].map((a, i) => (
        <path key={i} d={`M 25 -300 Q ${25 + Math.cos((a * Math.PI) / 180) * 80} ${-330 + v} ${25 + Math.cos((a * Math.PI) / 180) * 160} ${-280 + Math.abs(Math.sin((a * Math.PI) / 180)) * 40 + v}`} stroke={t("#4A6A3E")} strokeWidth={18} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

const Porcelana: React.FC<{ x: number; y: number; s?: number; tipo: number }> = ({ x, y, s = 1, tipo }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {tipo === 0 ? (
      <g>
        <path d="M -30 0 Q -50 -50 -26 -86 L -16 -100 L 16 -100 L 26 -86 Q 50 -50 30 0 Z" fill={"#F2F0EA"} />
        <path d="M -38 -50 Q 0 -40 38 -50 M -30 -80 H 30" stroke={"#3E5A9A"} strokeWidth={5} fill="none" />
        <path d="M -16 -66 q 16 -12 32 0 q -16 12 -32 0" fill={"#3E5A9A"} />
      </g>
    ) : (
      <g>
        <ellipse cx={0} cy={-6} rx={46} ry={14} fill={"#F2F0EA"} />
        <ellipse cx={0} cy={-8} rx={30} ry={8} fill="none" stroke={"#3E5A9A"} strokeWidth={4} />
      </g>
    )}
  </g>
);

const DibujoManila: React.FC<PropsDecorado> = ({ e }) => {
  const hora = e.hora ?? "dia";
  const sem = e.semilla ?? 11;
  const gente = e.gente ?? 0.8;
  const W = 2400;
  const t = (c: string) => (hora === "noche" ? mezcla(c, "#1A2030", 0.55) : hora === "tarde" ? mezcla(c, "#E0A060", 0.2) : c);
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={W} id="manila" nubes={6} />
      <path d="M -100 520 Q 600 470 1200 500 Q 1800 530 2500 480 L 2500 560 L -100 560 Z" fill={t("#6A8A6A")} />
      <Mar y0={540} ancho={W} t={t} />
      {/* la bahia: el galeon y los juncos */}
      <Galeon x={460} y={760} s={0.62} semilla={sem} velas={false} tinte={t} />
      <Junco x={1500} y={700} s={0.5} semilla={sem + 1} dir={-1} />
      <Junco x={1900} y={660} s={0.36} semilla={sem + 2} dir={-1} />
      <Junco x={2240} y={720} s={0.55} semilla={sem + 3} dir={-1} />
      <Junco x={1150} y={640} s={0.28} semilla={sem + 4} />
      {/* la orilla con el Parian */}
      <path d="M -100 800 Q 1200 770 2500 800 L 2500 1200 L -100 1200 Z" fill={t("#D9C29A")} />
      <g>
        <rect x={1600} y={560} width={760} height={250} fill={t(C.cal)} />
        <path d="M 1580 570 Q 1700 520 1980 520 Q 2260 520 2380 570 Z" fill={t("#6A3A2A")} />
        <path d="M 1580 570 Q 1560 540 1600 530 M 2380 570 Q 2400 540 2360 530" stroke={t("#6A3A2A")} strokeWidth={10} fill="none" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={1620 + i * 150} y={620} width={20} height={190} fill={t(C.carmin)} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={1650 + i * 150} y={680} width={110} height={130} fill={t("#3A2A20")} />
            <path d={`M ${1650 + i * 150} 680 h 110`} stroke={t(C.oro)} strokeWidth={6} />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path d={`M ${1700 + i * 220} 600 L ${1700 + i * 220} 640`} stroke={t(C.tinta)} strokeWidth={2} />
            <ellipse cx={1700 + i * 220} cy={652} rx={16} ry={20} fill={t(C.carmin)} />
          </g>
        ))}
      </g>
      <Palmera x={60} y={810} s={1.1} t={t} />
      <Palmera x={1480} y={800} s={0.9} t={t} />
      {/* el trato: seda y porcelana contra plata */}
      <g>
        <rect x={720} y={860} width={560} height={24} fill={t(C.maderaLuz)} />
        <rect x={730} y={884} width={540} height={220} fill={t(C.maderaMedia)} />
        {["#B0347A", "#E8B33C", "#3E4E8A", "#C8402C"].map((c, i) => (
          <g key={c}>
            <rect x={760 + i * 60} y={800} width={54} height={60} rx={6} fill={t(c)} />
            <path d={`M ${760 + i * 60} 820 h 54 M ${760 + i * 60} 840 h 54`} stroke={t(C.ocre)} strokeWidth={2} />
          </g>
        ))}
        <Porcelana x={1050} y={860} s={0.9} tipo={0} />
        <Porcelana x={1130} y={860} s={0.7} tipo={1} />
        <Balanza x={1200} y={860} s={0.38} izq={<ellipse cx={0} cy={-6} rx={22} ry={6} fill={C.plata} />} der={<rect x={-14} y={-12} width={28} height={12} fill={"#5A5A5E"} />} />
        {/* cofre de reales */}
        <g transform="translate(1420 1020)">
          <rect x={-90} y={-90} width={180} height={90} fill={t(C.madera)} />
          <path d="M -94 -90 L 94 -90 L 80 -150 L -80 -150 Z" fill={t(C.maderaLuz)} />
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse key={i} cx={-70 + (i % 6) * 28} cy={-96 - Math.floor(i / 6) * 8} rx={14} ry={6} fill={i % 2 ? C.plata : C.plataLuz} />
          ))}
        </g>
      </g>
      <Frente traje="chino" semilla={sem + 10} x={620} y={1060} s={0.95} pose="ofrece" objeto="seda" gesto="neutro" mirada={1} />
      <Frente traje="espanol" semilla={sem + 11} x={1620} y={1060} s={0.95} pose="ofrece" objeto="moneda" gesto="neutro" mirada={-1} />
      {gente > 0.4 ? <Frente traje="chino" semilla={sem + 12} x={360} y={1000} s={0.82} pose="brazos" mirada={1} color={"#5A3A2E"} /> : null}
      {gente > 0.6 ? (
        <g>
          <Perfil traje="chino" semilla={sem + 13} x0={1900} y={880} v={-0.7} s={0.5} espalda="bulto" />
          <Perfil traje="campesino" semilla={sem + 14} x0={2200} y={870} v={-0.8} s={0.48} espalda="costal" />
          <Perfil traje="espanol" semilla={sem + 15} x0={200} y={860} v={0.6} s={0.45} />
        </g>
      ) : null}
      <Humo x={2000} y={520} s={0.6} n={4} semilla={2} color={"#D8D2C8"} />
    </g>
  );
};

export const MANILA: Decorado = {
  desc: "Manila hacia 1600: en la bahia el galeon de Manila y varios juncos chinos con velas de esteras; en la orilla el Parian de los sangleyes, con aleros curvos, columnas rojas y farolillos, y palmeras; en primer termino un mercader chino Ming ofrece seda a un mercader espanol que tiende una moneda de plata; sobre la mesa piezas de seda, porcelana azul y blanca, una balanza y un cofre de reales de a ocho.",
  ancho: 2400,
  admite: "hora, gente, semilla",
  tomas: {
    general: { de: { x: 1000, y: 540, z: 1 }, a: { x: 1300, y: 540, z: 1.04 }, desc: "la bahia, los barcos, el Parian y el trato" },
    juncos: { de: { x: 1800, y: 560, z: 1.8 }, a: { x: 1860, y: 540, z: 1.9 }, desc: "los juncos chinos y el Parian" },
    trato: { de: { x: 1120, y: 740, z: 1.6 }, a: { x: 1120, y: 740, z: 1.65 }, desc: "el mercader chino y el espanol frente a frente" },
    seda: { de: { x: 960, y: 820, z: 2.8 }, a: { x: 990, y: 810, z: 3.1 }, desc: "seda, porcelana y la balanza" },
    plata: { de: { x: 1460, y: 840, z: 2.6 }, a: { x: 1440, y: 830, z: 2.9 }, desc: "el cofre de reales y la mano con la moneda" },
    galeon: { de: { x: 580, y: 520, z: 1.7 }, a: { x: 600, y: 500, z: 1.8 }, desc: "el galeon de Manila fondeado" },
  },
  dibujo: DibujoManila,
};
