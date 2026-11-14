import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../../theme";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloAndes, Humo, Mula, TexturasPot, mezcla, osc, rr } from "./comun";
import { Frente, Perfil, TINTES } from "./Gente";

/**
 * La plaza de la Villa Imperial hacia 1600: iglesia de portada barroca labrada
 * en piedra, casas con balcones de madera, el cabildo con sus portales, tiendas
 * de mercaderes y, en el suelo, las vendedoras andinas con los cestos de coca,
 * papas y chuno. Al fondo, el Cerro. En un extremo, la Casa de Moneda.
 */

/** Balcon de cajon, de madera tallada, con celosia. */
const Balcon: React.FC<{ x: number; y: number; w: number; t: (c: string) => string; gente?: number; semilla: number }> = ({ x, y, w, t, gente = 0, semilla }) => (
  <g>
    <rect x={x - 8} y={y - 10} width={w + 16} height={14} fill={t(C.madera)} />
    <rect x={x} y={y + 4} width={w} height={80} fill={t(C.maderaMedia)} />
    {Array.from({ length: Math.floor(w / 22) }).map((_, i) => (
      <rect key={i} x={x + 6 + i * 22} y={y + 10} width={12} height={50} fill={t(C.madera)} />
    ))}
    <rect x={x - 6} y={y + 60} width={w + 12} height={12} fill={t(C.maderaLuz)} />
    <rect x={x - 10} y={y + 84} width={w + 20} height={10} fill={t(C.madera)} />
    {[0.15, 0.85].map((k) => (
      <path key={k} d={`M ${x + w * k} ${y + 94} l -10 40 l 20 0 Z`} fill={t(C.madera)} />
    ))}
    <path d={`M ${x - 12} ${y - 10} L ${x + w / 2} ${y - 46} L ${x + w + 12} ${y - 10} Z`} fill={t(C.teja)} />
  </g>
);

/** Casa senorial de dos plantas con balcon, portada y tejado. */
const CasaBalcon: React.FC<{ x: number; y: number; w: number; t: (c: string) => string; semilla: number; rotulo?: string; noche: boolean; gente: number }> = ({ x, y, w, t, semilla, rotulo, noche, gente }) => {
  const muro = [C.cal, "#E6D8BC", "#DCC6A2", "#EADFC8"][Math.floor(rr(semilla, 1) * 4)];
  const h = 400;
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={t(muro)} />
      <rect x={x} y={y - h} width={w} height={22} fill={t(osc(muro, 0.85))} />
      <path d={`M ${x - 16} ${y - h} L ${x + w + 16} ${y - h} L ${x + w} ${y - h - 40} L ${x} ${y - h - 40} Z`} fill={t(C.teja)} />
      <path d={`M ${x - 16} ${y - h} L ${x + w + 16} ${y - h} L ${x + w} ${y - h - 40} L ${x} ${y - h - 40} Z`} fill="url(#pot-tejado)" opacity={0.6} />
      {/* zocalo de piedra */}
      <rect x={x} y={y - 60} width={w} height={60} fill={t(C.piedraSombra)} />
      {/* planta baja: tienda o portada */}
      <path d={`M ${x + 30} ${y} L ${x + 30} ${y - 170} Q ${x + 90} ${y - 210} ${x + 150} ${y - 170} L ${x + 150} ${y} Z`} fill={t(noche ? "#2A1E16" : "#3A2A20")} />
      <path d={`M ${x + 22} ${y} L ${x + 22} ${y - 172} Q ${x + 90} ${y - 222} ${x + 158} ${y - 172} L ${x + 158} ${y}`} fill="none" stroke={t(C.piedraSombra)} strokeWidth={14} />
      {noche ? <rect x={x + 40} y={y - 150} width={100} height={150} fill={"#E9A850"} opacity={0.35} /> : null}
      <rect x={x + w - 130} y={y - 200} width={90} height={110} fill={t("#3A3530")} />
      {Array.from({ length: 4 }).map((_, i) => (
        <rect key={i} x={x + w - 124 + i * 22} y={y - 200} width={5} height={110} fill={t("#1E1E1E")} />
      ))}
      {rotulo ? (
        <g>
          <rect x={x + 10} y={y - 262} width={w - 20} height={44} fill={t("#2F3A30")} />
          <rect x={x + 14} y={y - 258} width={w - 28} height={36} fill="none" stroke={t(C.oro)} strokeWidth={2} />
          <text x={x + w / 2} y={y - 232} textAnchor="middle" fontFamily={FONT.serif} fontSize={22} letterSpacing={2} fill={t(C.oro)}>
            {rotulo}
          </text>
        </g>
      ) : null}
      {/* planta alta con balcon */}
      <Balcon x={x + 40} y={y - 360} w={w - 80} t={t} gente={gente} semilla={semilla + 7} />
      {noche ? <rect x={x + 60} y={y - 346} width={w - 120} height={40} fill={"#E9C070"} opacity={0.25} /> : null}
    </g>
  );
};

/** Iglesia de portada barroca labrada (estilo mestizo andino). */
const IglesiaBarroca: React.FC<{ x: number; y: number; t: (c: string) => string; noche: boolean }> = ({ x, y, t, noche }) => {
  const f = useCurrentFrame();
  const cam = Math.sin(f * 0.07) * 12;
  const piedra = t("#D8C3A0");
  const piedraS = t("#B89E78");
  return (
    <g>
      {/* nave */}
      <rect x={x + 60} y={y - 480} width={440} height={480} fill={piedra} />
      <rect x={x + 380} y={y - 480} width={120} height={480} fill={piedraS} />
      <path d={`M ${x + 50} ${y - 480} L ${x + 280} ${y - 560} L ${x + 510} ${y - 480} Z`} fill={t(C.teja)} />
      {/* cupula */}
      <rect x={x + 330} y={y - 600} width={140} height={60} fill={piedra} />
      <path d={`M ${x + 330} ${y - 600} Q ${x + 400} ${y - 720} ${x + 470} ${y - 600} Z`} fill={t("#C9AE86")} />
      <path d={`M ${x + 400} ${y - 660} V ${y - 600}`} stroke={piedraS} strokeWidth={4} />
      <rect x={x + 394} y={y - 740} width={12} height={40} fill={piedraS} />
      {/* torre */}
      <rect x={x - 80} y={y - 620} width={150} height={620} fill={piedra} />
      <rect x={x - 80} y={y - 620} width={40} height={620} fill={t("#E4D2B2")} />
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={x - 90} y={y - 420 - i * 200} width={170} height={16} fill={piedraS} />
          <path d={`M ${x - 50} ${y - 470 - i * 200} V ${y - 520 - i * 200} Q ${x - 5} ${y - 570 - i * 200} ${x + 40} ${y - 520 - i * 200} V ${y - 470 - i * 200} Z`} fill={t(noche ? "#2A2018" : "#3A3026")} />
        </g>
      ))}
      <g transform={`rotate(${cam} ${x - 5} ${y - 720})`}>
        <path d={`M ${x - 25} ${y - 700} Q ${x - 5} ${y - 744} ${x + 15} ${y - 700} L ${x + 20} ${y - 676} L ${x - 30} ${y - 676} Z`} fill={t(C.oro)} />
      </g>
      <path d={`M ${x - 86} ${y - 620} Q ${x - 5} ${y - 720} ${x + 76} ${y - 620} Z`} fill={piedraS} />
      <path d={`M ${x - 5} ${y - 700} V ${y - 760} M ${x - 20} ${y - 744} H ${x + 10}`} stroke={t("#5A4A3A")} strokeWidth={5} />
      {/* portada labrada */}
      <g>
        <rect x={x + 130} y={y - 420} width={260} height={420} fill={t("#CDB28A")} />
        {[x + 146, x + 352].map((cx) => (
          <g key={cx}>
            <rect x={cx} y={y - 380} width={22} height={380} fill={piedraS} />
            {Array.from({ length: 10 }).map((_, i) => (
              <path key={i} d={`M ${cx} ${y - 360 + i * 36} q 11 -14 22 0 q -11 14 -22 0`} fill={t("#E4CDA4")} />
            ))}
          </g>
        ))}
        {/* relieves: hojas, flores y sirenas sugeridas */}
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={x + 186 + (i % 6) * 30} cy={y - 400 + Math.floor(i / 6) * 30} r={9} fill={i % 2 ? t("#E4CDA4") : piedraS} />
        ))}
        <path d={`M ${x + 190} ${y} L ${x + 190} ${y - 200} Q ${x + 260} ${y - 280} ${x + 330} ${y - 200} L ${x + 330} ${y} Z`} fill={t(noche ? "#2A1E16" : C.madera)} />
        <path d={`M ${x + 260} ${y - 246} V ${y}`} stroke={t("#3A2A1E")} strokeWidth={4} />
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={x + 210 + (i % 2) * 100} cy={y - 170 + Math.floor(i / 2) * 40} r={4} fill={t(C.oro)} />
        ))}
        <path d={`M ${x + 230} ${y - 330} Q ${x + 260} ${y - 370} ${x + 290} ${y - 330} Z`} fill={t("#5A4A3A")} />
        <path d={`M ${x + 120} ${y - 420} L ${x + 260} ${y - 470} L ${x + 400} ${y - 420} Z`} fill={piedraS} />
      </g>
      {/* atrio */}
      <rect x={x - 100} y={y - 10} width={620} height={24} fill={t(C.piedraOscura)} />
    </g>
  );
};

/** El cabildo, con portales de arcos y balconada corrida. */
const Cabildo: React.FC<{ x: number; y: number; w: number; t: (c: string) => string; gente: number }> = ({ x, y, w, t, gente }) => {
  const n = Math.floor(w / 110);
  return (
    <g>
      <rect x={x} y={y - 420} width={w} height={420} fill={t("#E2D2B4")} />
      <path d={`M ${x - 16} ${y - 420} L ${x + w + 16} ${y - 420} L ${x + w} ${y - 460} L ${x} ${y - 460} Z`} fill={t(C.teja)} />
      <rect x={x} y={y - 220} width={w} height={220} fill={t("#5A4A3A")} opacity={0.75} />
      {Array.from({ length: n + 1 }).map((_, i) => (
        <g key={i}>
          <rect x={x + i * (w / n) - 14} y={y - 220} width={28} height={220} fill={t(C.piedra)} />
          {i < n ? <path d={`M ${x + i * (w / n) + 14} ${y - 180} Q ${x + (i + 0.5) * (w / n)} ${y - 240} ${x + (i + 1) * (w / n) - 14} ${y - 180} L ${x + (i + 1) * (w / n) - 14} ${y - 220} L ${x + i * (w / n) + 14} ${y - 220} Z`} fill={t(C.piedra)} /> : null}
        </g>
      ))}
      <rect x={x - 10} y={y - 236} width={w + 20} height={18} fill={t(C.piedraSombra)} />
      <Balcon x={x + 30} y={y - 380} w={w - 60} t={t} gente={gente} semilla={77} />
      <path d={`M ${x + w / 2 - 50} ${y - 450} L ${x + w / 2} ${y - 490} L ${x + w / 2 + 50} ${y - 450} Z`} fill={t(C.piedraSombra)} />
      <circle cx={x + w / 2} cy={y - 462} r={12} fill={t(C.oro)} />
    </g>
  );
};

/** La Casa de Moneda del siglo XVIII: fachada de piedra con portada y rejas. */
export const CasaMonedaFachada: React.FC<{ x: number; y: number; w: number; t: (c: string) => string; rotulo?: string }> = ({ x, y, w, t, rotulo }) => (
  <g>
    <rect x={x} y={y - 460} width={w} height={460} fill={t("#C9B08A")} />
    <rect x={x} y={y - 460} width={w} height={460} fill="url(#pot-sillar)" opacity={0.45} />
    <rect x={x - 12} y={y - 480} width={w + 24} height={26} fill={t(C.piedraSombra)} />
    {Array.from({ length: Math.floor(w / 30) }).map((_, i) => (
      <rect key={i} x={x + i * 30} y={y - 500} width={16} height={22} fill={t(C.piedraSombra)} />
    ))}
    {/* ventanas con rejas */}
    {Array.from({ length: Math.floor((w - 120) / 140) }).map((_, i) => {
      const vx = x + 60 + i * 140;
      if (Math.abs(vx + 40 - (x + w / 2)) < 140) return null;
      return (
        <g key={i}>
          <rect x={vx} y={y - 380} width={80} height={120} fill={t("#3A3530")} />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={vx + 8 + k * 20} y={y - 380} width={5} height={120} fill={t("#1A1A1A")} />
          ))}
          <rect x={vx - 10} y={y - 392} width={100} height={12} fill={t(C.piedraSombra)} />
          <rect x={vx} y={y - 200} width={80} height={110} fill={t("#3A3530")} />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={vx + 8 + k * 20} y={y - 200} width={5} height={110} fill={t("#1A1A1A")} />
          ))}
        </g>
      );
    })}
    {/* portada */}
    <g>
      <rect x={x + w / 2 - 130} y={y - 470} width={260} height={470} fill={t("#B89A72")} />
      <path d={`M ${x + w / 2 - 70} ${y} L ${x + w / 2 - 70} ${y - 240} Q ${x + w / 2} ${y - 320} ${x + w / 2 + 70} ${y - 240} L ${x + w / 2 + 70} ${y} Z`} fill={t(C.madera)} />
      {[-110, 90].map((dx) => (
        <rect key={dx} x={x + w / 2 + dx} y={y - 400} width={20} height={400} fill={t("#A88A62")} />
      ))}
      <rect x={x + w / 2 - 60} y={y - 420} width={120} height={70} fill={t("#A88A62")} />
      <text x={x + w / 2} y={y - 376} textAnchor="middle" fontFamily={FONT.serif} fontSize={20} fill={t("#4A3A2A")} letterSpacing={1}>
        {rotulo ?? "CASA DE MONEDA"}
      </text>
      <path d={`M ${x + w / 2 - 30} ${y - 440} Q ${x + w / 2} ${y - 470} ${x + w / 2 + 30} ${y - 440}`} stroke={t("#7A5A3A")} strokeWidth={6} fill="none" />
    </g>
  </g>
);

/** Vendedora sentada en el suelo, con su manta extendida y su mercancia. */
const Vendedora: React.FC<{ x: number; y: number; s: number; semilla: number; mercancia: "coca" | "papas" | "chuno" | "lana"; id: string }> = ({ x, y, s, semilla, mercancia, id }) => {
  const falda = TINTES[Math.floor(rr(semilla, 4) * TINTES.length)];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`pot-vend-${id}`}>
          <rect x={-200} y={-600} width={400} height={480} />
        </clipPath>
      </defs>
      <g clipPath={`url(#pot-vend-${id})`}>
        <Frente traje="andina" semilla={semilla} x={0} y={140} cuerpo="busto" pose={rr(semilla, 5) > 0.5 ? "habla" : "quieto"} mirada={rr(semilla, 6) > 0.5 ? 1 : -1} />
      </g>
      <path d="M -120 0 Q -130 -110 -60 -130 L 60 -130 Q 130 -110 120 0 Z" fill={osc(falda, 0.7)} />
      <path d="M -110 -30 Q 0 -10 110 -30" stroke={C.ocre} strokeWidth={4} fill="none" />
      {/* manta con la mercancia */}
      <path d="M 80 -10 L 300 -20 L 320 20 L 70 26 Z" fill={TINTES[Math.floor(rr(semilla, 7) * TINTES.length)]} />
      <path d="M 82 0 L 306 -8 M 76 14 L 314 8" stroke={C.ocre} strokeWidth={3} />
      {mercancia === "coca" ? (
        <g>
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${150 + k * 100} -14)`}>
              <path d="M -40 0 L -34 -50 L 34 -50 L 40 0 Z" fill={"#A88A5A"} />
              {[0, 1, 2].map((r) => (
                <path key={r} d={`M -36 ${-12 - r * 14} H 36`} stroke={"#7A6040"} strokeWidth={3} />
              ))}
              <ellipse cx={0} cy={-52} rx={36} ry={12} fill={"#5E7A3E"} />
              {[-20, -6, 8, 22].map((lx) => (
                <ellipse key={lx} cx={lx} cy={-56} rx={8} ry={4} fill={"#78944E"} transform={`rotate(${lx} ${lx} -56)`} />
              ))}
            </g>
          ))}
        </g>
      ) : (
        <g>
          {Array.from({ length: 14 }).map((_, i) => (
            <ellipse
              key={i}
              cx={110 + (i % 7) * 26 + (Math.floor(i / 7) * 12)}
              cy={-12 - Math.floor(i / 7) * 16}
              rx={13}
              ry={10}
              fill={mercancia === "papas" ? (i % 3 ? "#B88A5A" : "#8A5A44") : mercancia === "chuno" ? (i % 2 ? "#EDE6D6" : "#3A3230") : "#E8DFC8"}
            />
          ))}
        </g>
      )}
    </g>
  );
};

/** Puesto de un mercader: mesa con sedas, vidrio y hierro. */
const Puesto: React.FC<{ x: number; y: number; s: number; semilla: number; t: (c: string) => string }> = ({ x, y, s, semilla, t }) => {
  const f = useCurrentFrame();
  const onda = Math.sin(f * 0.08) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* toldo */}
      <rect x={-200} y={-460} width={10} height={460} fill={t(C.madera)} />
      <rect x={190} y={-460} width={10} height={460} fill={t(C.madera)} />
      <path d={`M -220 -470 L 220 -470 L 230 ${-410 + onda} L -230 ${-410 - onda} Z`} fill={t("#C8B48A")} />
      {[-180, -100, -20, 60, 140].map((sx) => (
        <path key={sx} d={`M ${sx} -470 L ${sx + 40} -470 L ${sx + 42} ${-414 + onda * 0.2} L ${sx - 2} ${-414 - onda * 0.2} Z`} fill={t(C.carmin)} opacity={0.8} />
      ))}
      <Frente traje="mercader" semilla={semilla} x={0} y={-60} s={0.92} cuerpo="busto" pose="habla" mirada={-1} />
      {/* mesa */}
      <rect x={-210} y={-200} width={420} height={24} fill={t(C.maderaLuz)} />
      <rect x={-200} y={-176} width={400} height={176} fill={t(C.maderaMedia)} />
      <rect x={-196} y={-170} width={392} height={60} fill={t("#7A2E2A")} />
      {/* sedas en piezas */}
      {["#B0347A", "#E8B33C", "#3E4E8A", "#2E5A4E"].map((c, i) => (
        <g key={c}>
          <rect x={-190 + i * 56} y={-262} width={50} height={62} rx={8} fill={t(c)} />
          <path d={`M ${-190 + i * 56} -244 h 50 M ${-190 + i * 56} -222 h 50`} stroke={t(C.ocre)} strokeWidth={2} />
        </g>
      ))}
      {/* vidrio veneciano */}
      {[50, 90, 130].map((gx, i) => (
        <g key={gx}>
          <path d={`M ${gx} -200 L ${gx - 10} -230 Q ${gx} -270 ${gx + 10} -230 Z`} fill={t(i === 1 ? "#7FA8A0" : "#A9C8C0")} opacity={0.85} />
          <rect x={gx - 3} y={-280} width={6} height={30} fill={t(i === 1 ? "#7FA8A0" : "#A9C8C0")} opacity={0.85} />
        </g>
      ))}
      {/* hierro: herraduras y barretas */}
      <path d="M 160 -204 a 16 16 0 1 1 26 0" stroke={t("#4A4A4E")} strokeWidth={6} fill="none" />
      <rect x={-208} y={-160} width={130} height={8} fill={t("#4A4A4E")} transform="rotate(-6 -150 -160)" />
    </g>
  );
};

const Botijas: React.FC<{ x: number; y: number; s: number; t: (c: string) => string }> = ({ x, y, s, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[[-60, 0], [0, 0], [60, 0], [-30, -70], [30, -70]].map(([bx, by], i) => (
      <g key={i}>
        <path d={`M ${bx - 26} ${by} Q ${bx - 34} ${by - 40} ${bx - 14} ${by - 66} L ${bx + 14} ${by - 66} Q ${bx + 34} ${by - 40} ${bx + 26} ${by} Z`} fill={t(i % 2 ? "#A86A44" : "#B8784E")} />
        <rect x={bx - 10} y={by - 76} width={20} height={12} fill={t("#8A5A3A")} />
      </g>
    ))}
  </g>
);

const DibujoPlaza: React.FC<PropsDecorado> = ({ e }) => {
  const hora = e.hora ?? "dia";
  const noche = hora === "noche";
  const sem = e.semilla ?? 2;
  const gente = e.gente ?? 0.8;
  const bandos = e.variante === "bandos";
  const W = 2800;
  const yb = 760;
  const t = (c: string) => (noche ? mezcla(c, "#1A2030", 0.55) : hora === "tarde" ? mezcla(c, "#E0A060", 0.15) : c);
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={W} id="plaza" nubes={4} />
      {/* el cerro detras */}
      <path d={`M 500 ${yb - 200} Q 900 300 1180 150 Q 1240 128 1300 150 Q 1600 300 2100 ${yb - 200} Z`} fill={t(C.cerroLuz)} />
      <path d={`M 1240 135 Q 1300 150 1340 180 Q 1600 320 2100 ${yb - 200} L 1400 ${yb - 200} Q 1380 400 1240 135 Z`} fill={t(C.cerroSombra)} />
      {[[-200, 320], [-80, 240], [120, 260], [260, 380]].map(([dx, dy], i) => (
        <path key={i} d={`M ${1240 + dx} ${dy} q 10 -14 20 0 Z`} fill={t("#2A1A14")} />
      ))}
      {/* fachadas */}
      <CasaBalcon x={-40} y={yb} w={420} t={t} semilla={sem} rotulo={e.textos?.tienda ?? "MERCADERÍAS DE CASTILLA"} noche={noche} gente={gente} />
      <IglesiaBarroca x={560} y={yb} t={t} noche={noche} />
      <Cabildo x={1120} y={yb} w={480} t={t} gente={gente} />
      <CasaBalcon x={1620} y={yb} w={380} t={t} semilla={sem + 5} rotulo={e.textos?.pulperia ?? "PULPERÍA"} noche={noche} gente={gente} />
      <CasaMonedaFachada x={2030} y={yb} w={760} t={t} />
      {/* el suelo de la plaza */}
      <rect x={-100} y={yb} width={W + 200} height={1080 - yb + 40} fill={t(C.piedraOscura)} />
      <rect x={-100} y={yb} width={W + 200} height={1080 - yb + 40} fill="url(#pot-empedrado)" opacity={0.7} />
      <rect x={-100} y={yb} width={W + 200} height={14} fill={t(C.piedraSombra)} />
      {/* la pila */}
      <g transform="translate(1340 900)">
        <ellipse cx={0} cy={0} rx={150} ry={34} fill={t(C.piedraSombra)} />
        <rect x={-150} y={-60} width={300} height={60} fill={t(C.piedra)} />
        <ellipse cx={0} cy={-60} rx={150} ry={30} fill={t(C.piedraLuz)} />
        <ellipse cx={0} cy={-60} rx={130} ry={22} fill={t(C.agua)} />
        <rect x={-14} y={-190} width={28} height={130} fill={t(C.piedra)} />
        <ellipse cx={0} cy={-190} rx={50} ry={12} fill={t(C.piedraLuz)} />
        <WaterJets />
      </g>
      {/* gente que cruza la plaza */}
      {gente > 0.2
        ? [
            { tr: "espanol" as const, x: -100, v: 1.2, y: 850, es: undefined },
            { tr: "clerigo" as const, x: 900, v: -0.9, y: 830, es: undefined },
            { tr: "andino" as const, x: 400, v: 1, y: 870, es: "costal" as const },
            { tr: "andina" as const, x: 2200, v: -1, y: 860, es: "nino" as const },
            { tr: "mercader" as const, x: 1500, v: 0.8, y: 820, es: undefined },
            { tr: "andino" as const, x: 2500, v: -1.1, y: 840, es: undefined },
          ]
            .slice(0, Math.round(2 + gente * 4))
            .map((p, i) => <Perfil key={i} traje={p.tr} semilla={sem + 20 + i} x0={p.x} y={p.y} v={p.v} s={0.5} espalda={p.es} />)
        : null}
      {gente > 0.5 && !bandos ? <Mula x0={2300} y={830} v={-0.8} s={0.44} semilla={sem} carga="fardos" /> : null}
      {bandos ? (
        <g>
          {/* vascos a la izquierda, vicunas a la derecha: tension, sin armas */}
          {[0, 1, 2, 3].map((i) => (
            <Frente key={`v${i}`} traje="espanol" semilla={sem + 50 + i} x={700 + i * 130} y={1000 + (i % 2) * 30} s={0.86} pose={i === 1 ? "senala" : "brazos"} gesto="serio" color={"#1E1E22"} color2={"#2E2E34"} mirada={1} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Frente key={`c${i}`} traje="espanol" semilla={sem + 60 + i} x={1640 + i * 130} y={1000 + (i % 2) * 30} s={0.86} pose={i === 0 ? "habla" : "brazos"} gesto="inquieto" color={["#6A5236", "#4A3A2E", "#5A4A3A", "#7A5A3A"][i]} color2={"#8A6A3A"} mirada={-1} gorro="ala" />
          ))}
        </g>
      ) : (
        <g>
          {/* el mercado */}
          <Vendedora x={180} y={1010} s={0.82} semilla={sem + 11} mercancia="coca" id={`a${sem}`} />
          <Vendedora x={640} y={1040} s={0.86} semilla={sem + 12} mercancia="papas" id={`b${sem}`} />
          <Vendedora x={1020} y={990} s={0.74} semilla={sem + 13} mercancia="chuno" id={`c${sem}`} />
          <Puesto x={1820} y={1040} s={0.92} semilla={sem + 14} t={t} />
          <Botijas x={2160} y={1040} s={0.9} t={t} />
        </g>
      )}
      {noche ? (
        <g>
          {[300, 1100, 1700].map((x) => (
            <g key={x}>
              <circle cx={x} cy={600} r={60} fill={C.vela} opacity={0.15} />
              <rect x={x - 10} y={590} width={20} height={26} fill={"#FFD27A"} />
            </g>
          ))}
          <rect x={-100} y={-100} width={W + 200} height={1280} fill={"#0A1020"} opacity={0.15} />
        </g>
      ) : null}
      <Humo x={300} y={300} s={0.6} n={4} semilla={3} color={"#D8D2C8"} />
    </g>
  );
};

const WaterJets: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <g>
      {[-1, 1].map((d) => (
        <path key={d} d={`M 0 -186 Q ${d * 60} ${-200 + Math.sin(f * 0.3) * 4} ${d * 90} -70`} stroke={C.aguaLuz} strokeWidth={5} fill="none" opacity={0.8} />
      ))}
    </g>
  );
};

export const PLAZA: Decorado = {
  desc: "La plaza de la Villa Imperial hacia 1600: iglesia de portada barroca labrada y torre de campanas, casas con balcones de madera, el cabildo con portales de arcos, una pila; vendedoras andinas sentadas con cestos de coca, papas y chuno; un mercader espanol bajo un toldo con sedas, vidrio y hierro; botijas de vino; gente que cruza (espanoles, clerigos, indios cargados, una mula). Al fondo, el Cerro Rico. En el extremo derecho, la fachada de la Casa de Moneda.",
  ancho: 2800,
  admite: "textos.tienda (rotulo de la tienda), textos.pulperia, variante ('bandos': vascos y vicunas frente a frente, sin armas), hora, gente, semilla",
  tomas: {
    general: { de: { x: 1000, y: 540, z: 1 }, a: { x: 1400, y: 540, z: 1.04 }, desc: "la plaza entera con el cerro" },
    mercado: { de: { x: 560, y: 790, z: 1.9 }, a: { x: 590, y: 790, z: 2 }, desc: "las vendedoras de coca y papas" },
    coca: { de: { x: 296, y: 870, z: 3.3 }, a: { x: 295, y: 860, z: 3.4 }, desc: "la vendedora y los cestos de coca" },
    iglesia: { de: { x: 820, y: 400, z: 1.5 }, a: { x: 840, y: 390, z: 1.65 }, desc: "la iglesia barroca y su torre" },
    balcones: { de: { x: 1270, y: 300, z: 2 }, a: { x: 1320, y: 300, z: 2.2 }, desc: "el cabildo y los balcones de madera" },
    tienda: { de: { x: 1900, y: 760, z: 2 }, a: { x: 1880, y: 760, z: 2.2 }, desc: "el mercader con sedas, vidrio y botijas" },
    casamoneda: { de: { x: 2180, y: 520, z: 1.6 }, a: { x: 2200, y: 510, z: 1.7 }, desc: "la fachada de la Casa de Moneda" },
  },
  dibujo: DibujoPlaza,
};
