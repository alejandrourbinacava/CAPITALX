import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { Cielo, Defs, FUENTE, Humo, Rotulo, VentanaFachada, W, oscurecer, rr, toma } from "./base";
import { Andante, Figura, type Lleva, type Ropa } from "./gente";

/** Bandera que ondea. `franjas` de arriba abajo (o de izquierda a derecha si `vertical`). */
export const Bandera: React.FC<{ x: number; y: number; w?: number; h?: number; franjas: string[]; vertical?: boolean; mastil?: number; fase?: number }> = ({
  x,
  y,
  w = 150,
  h = 96,
  franjas,
  vertical,
  mastil = 300,
  fase = 0,
}) => {
  const f = useCurrentFrame();
  const n = 8;
  const onda = (k: number) => Math.sin(f * 0.15 + k * 1.1 + fase) * 8 * (k / n);
  const tira = (a: number, b: number) => {
    // banda entre las fracciones a y b del alto (horizontal) o del ancho (vertical)
    const pts: string[] = [];
    if (!vertical) {
      for (let k = 0; k <= n; k++) pts.push(`${x + (w * k) / n},${y + h * a + onda(k)}`);
      for (let k = n; k >= 0; k--) pts.push(`${x + (w * k) / n},${y + h * b + onda(k)}`);
    } else {
      const k0 = Math.round(a * n);
      const k1 = Math.round(b * n);
      for (let k = k0; k <= k1; k++) pts.push(`${x + (w * k) / n},${y + onda(k)}`);
      for (let k = k1; k >= k0; k--) pts.push(`${x + (w * k) / n},${y + h + onda(k)}`);
    }
    return pts.join(" ");
  };
  return (
    <g>
      <rect x={x - 6} y={y - 10} width={8} height={mastil} fill={W.hierro} />
      <circle cx={x - 2} cy={y - 12} r={7} fill={W.laton} />
      {franjas.map((c, i) => (
        <polygon key={i} points={tira(i / franjas.length, (i + 1) / franjas.length)} fill={c} />
      ))}
    </g>
  );
};

export const WEIMAR = ["#1A1A1A", "#C8402C", "#E8B33C"];
export const FRANCIA = ["#2F4A8A", "#F2EFE6", "#C8402C"];

/** Automovil de los anos veinte, de perfil. */
export const Auto: React.FC<{ x0: number; y: number; v: number; s?: number; tono?: string }> = ({ x0, y, v, s = 1, tono = "#2A2E30" }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  const giro = (f * v * 3) % 360;
  const rueda = (cx: number) => (
    <g transform={`translate(${cx} -34) rotate(${giro})`}>
      <circle r={34} fill={"#111"} />
      <circle r={20} fill={"#B9B4A6"} />
      {[0, 45, 90, 135].map((a) => (
        <rect key={a} x={-1.5} y={-20} width={3} height={40} fill={"#555"} transform={`rotate(${a})`} />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (v < 0 ? -1 : 1)} ${s})`}>
      <path d="M 0 -50 L 0 -110 Q 0 -120 20 -120 L 120 -120 L 140 -190 L 300 -190 Q 316 -190 320 -170 L 330 -120 L 420 -110 Q 440 -106 440 -80 L 440 -50 Z" fill={tono} />
      <rect x={156} y={-178} width={64} height={52} fill={W.cristalLuz} />
      <rect x={232} y={-178} width={80} height={52} fill={W.cristalLuz} />
      <path d="M 0 -60 Q 60 -70 100 -50 L 340 -50 Q 380 -70 440 -60" fill="none" stroke={oscurecer(tono, 0.7)} strokeWidth={8} />
      <rect x={420} y={-110} width={20} height={36} fill={"#C9CCCD"} />
      <circle cx={430} cy={-120} r={10} fill={"#F2D88A"} />
      {rueda(90)}
      {rueda(360)}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* El Ruhr: mina, acerias y soldados franceses                          */
/* ------------------------------------------------------------------ */

const ANCHO_RUHR = 2600;

const Ruhr: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 15;
  const v = e.variante ?? "ocupada";
  const trabaja = v === "trabajo";
  const soldados = v !== "trabajo";
  const humo = trabaja || v === "humo";
  const rotulo = e.textos?.rotulo ?? "Zeche Victoria";
  const cartel = e.textos?.cartel;
  const gente = e.gente ?? 0.7;
  const suelo = 820;
  const giro = trabaja ? f * 3 : 0;
  return (
    <g>
      <Defs />
      <Cielo hora={e.hora ?? "dia"} ancho={ANCHO_RUHR} nubes={humo ? 3 : 6} />
      {humo ? <rect x={-200} y={-100} width={ANCHO_RUHR + 400} height={700} fill={"#8C8070"} opacity={0.25} /> : null}
      {/* escombrera y naves lejanas */}
      <path d={`M -200 ${suelo - 120} L 300 ${suelo - 330} L 700 ${suelo - 140} Z`} fill={"#6E665A"} />
      <path d={`M 2000 ${suelo - 100} L 2350 ${suelo - 260} L 2800 ${suelo - 90} Z`} fill={"#7A7266"} />
      <g fill={"#9A9080"}>
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i}>
            <rect x={760 + i * 190} y={suelo - 300} width={180} height={300} />
            <path d={`M ${760 + i * 190} ${suelo - 300} L ${790 + i * 190} ${suelo - 350} L ${790 + i * 190} ${suelo - 300} L ${850 + i * 190} ${suelo - 350} L ${850 + i * 190} ${suelo - 300} L ${910 + i * 190} ${suelo - 350} L ${910 + i * 190} ${suelo - 300} Z`} />
          </g>
        ))}
      </g>
      {/* chimeneas */}
      {[900, 1040, 1180, 1320, 1700].map((cx, i) => (
        <g key={cx}>
          <path d={`M ${cx - 20} ${suelo - 200} L ${cx - 13} ${suelo - 640 - (i % 2) * 60} L ${cx + 13} ${suelo - 640 - (i % 2) * 60} L ${cx + 20} ${suelo - 200} Z`} fill={W.ladrilloOscuro} />
          <rect x={cx - 16} y={suelo - 650 - (i % 2) * 60} width={32} height={14} fill={W.hierro} />
          {humo ? <Humo x={cx} y={suelo - 660 - (i % 2) * 60} s={1.2} color={"#5E564C"} semilla={s + i} opacidad={0.6} viento={0.8} /> : null}
        </g>
      ))}
      {/* alto horno */}
      <g transform={`translate(1500 ${suelo})`}>
        <path d="M -60 0 L -80 -260 L -50 -380 L 50 -380 L 80 -260 L 60 0 Z" fill={"#4A4440"} />
        <rect x={-90} y={-270} width={180} height={18} fill={W.hierro} />
        <path d="M 50 -360 L 220 -500 L 236 -486 L 66 -346 Z" fill={W.hierro} />
        {humo ? <circle cx={0} cy={-120} r={30} fill={W.fuego} opacity={0.5 + Math.sin(f * 0.3) * 0.2} /> : null}
      </g>
      {/* castillete de la mina */}
      <g transform={`translate(420 ${suelo - 160})`}>
        <rect x={-150} y={-60} width={300} height={220} fill="url(#w-ladrillo)" />
        <path d="M -160 -60 L 0 -140 L 160 -60 Z" fill={W.ladrilloOscuro} />
        <g stroke={"#3A4244"} strokeWidth={14} fill="none">
          <path d="M -100 -60 L -40 -470 M 100 -60 L 40 -470 M -40 -470 L 40 -470" />
          <path d="M -86 -150 L 86 -150 M -70 -260 L 70 -260 M -56 -370 L 56 -370" strokeWidth={8} />
          <path d="M -86 -150 L 70 -260 M 86 -150 L -70 -260 M -70 -260 L 56 -370 M 70 -260 L -56 -370" strokeWidth={5} />
          <path d="M 40 -470 L 270 -60 M 26 -400 L 220 -60" strokeWidth={10} />
        </g>
        {[-30, 30].map((wx) => (
          <g key={wx} transform={`translate(${wx} -480) rotate(${(wx > 0 ? 1 : -1) * giro})`}>
            <circle r={48} fill="none" stroke={"#3A4244"} strokeWidth={8} />
            {[0, 45, 90, 135].map((a) => (
              <rect key={a} x={-2} y={-46} width={4} height={92} fill={"#3A4244"} transform={`rotate(${a})`} />
            ))}
          </g>
        ))}
      </g>
      {/* vagones de carbon parados */}
      <g>
        <rect x={-200} y={suelo + 6} width={ANCHO_RUHR + 400} height={8} fill={"#6E6A60"} />
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={i} transform={`translate(${1880 + i * 190} ${suelo})`}>
            <path d="M 0 -110 L 170 -110 L 160 -20 L 10 -20 Z" fill={"#4A3A32"} />
            <path d="M 4 -110 Q 40 -150 85 -132 Q 130 -152 166 -110 Z" fill={"#1E1E1E"} />
            <circle cx={40} cy={-10} r={16} fill={W.hierro} />
            <circle cx={130} cy={-10} r={16} fill={W.hierro} />
          </g>
        ))}
      </g>
      {/* muro de la fabrica con la puerta */}
      <g>
        <rect x={-200} y={suelo - 160} width={1060} height={160} fill="url(#w-ladrillo)" />
        <rect x={-200} y={suelo - 172} width={1060} height={14} fill={W.piedraMedia} />
        <rect x={1280} y={suelo - 160} width={560} height={160} fill="url(#w-ladrillo)" />
        <rect x={1280} y={suelo - 172} width={560} height={14} fill={W.piedraMedia} />
        {/* pilares y arco de la puerta */}
        {[860, 1240].map((px) => (
          <g key={px}>
            <rect x={px} y={suelo - 300} width={50} height={300} fill="url(#w-ladrilloOsc)" />
            <rect x={px - 8} y={suelo - 316} width={66} height={20} fill={W.piedraMedia} />
          </g>
        ))}
        <path d={`M 910 ${suelo - 250} Q 1075 ${suelo - 330} 1240 ${suelo - 250}`} fill="none" stroke={W.hierro} strokeWidth={10} />
        <Rotulo x={940} y={suelo - 300} w={270} h={44} texto={rotulo} fondo={W.hierro} letra={"#E2DCC8"} />
        {/* verja abierta */}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={914 + i * 12} y={suelo - 220} width={4} height={220} fill={W.hierro} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={1150 + i * 12} y={suelo - 220} width={4} height={220} fill={W.hierro} />
        ))}
        {soldados ? <Bandera x={1236} y={suelo - 520} franjas={FRANCIA} vertical mastil={220} fase={1} /> : null}
        {cartel ? (
          <g transform={`translate(560 ${suelo - 90}) rotate(-2)`}>
            <rect x={-150} y={-50} width={300} height={100} fill={"#F2ECDA"} />
            <text x={0} y={-12} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={26} fill={W.tinta}>
              Bekanntmachung
            </text>
            <text x={0} y={28} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={cartel.length > 16 ? 20 : 28} fill={W.carmin}>
              {cartel}
            </text>
          </g>
        ) : null}
      </g>
      {/* suelo */}
      <rect x={-200} y={suelo} width={ANCHO_RUHR + 400} height={400} fill={"#8A8070"} />
      <rect x={-200} y={suelo} width={ANCHO_RUHR + 400} height={400} fill="url(#w-adoquin)" opacity={0.5} />
      {/* mineros y obreros, de brazos cruzados */}
      {Array.from({ length: Math.round(2 + gente * 4) }).map((_, i) => (
        <Figura
          key={i}
          x={140 + i * 120 + (i % 2) * 20}
          y={1000 + (i % 2) * 40}
          escala={0.78}
          semilla={s * 5 + i}
          ropa={i % 3 === 2 ? "obrero" : "minero"}
          pose={trabaja ? (i % 2 ? "lampara" : "quieto") : i % 2 ? "brazos" : "lampara"}
          mirada={0.6}
          gesto={trabaja ? "neutro" : "serio"}
        />
      ))}
      {/* soldados franceses de guardia */}
      {soldados
        ? Array.from({ length: Math.round(2 + gente * 3) }).map((_, i) => (
            <Figura key={i} x={1000 + i * 110} y={990 + (i % 2) * 34} escala={0.78} semilla={s * 9 + i} ropa="soldado" pose="fusil" mirada={-0.5} gesto="serio" />
          ))
        : null}
      {soldados ? (
        <g>
          {Array.from({ length: 4 }).map((_, i) => (
            <Andante key={i} x0={1900 + i * 120} y={1060} v={-1.2} escala={0.8} semilla={s * 11 + i} ropa="soldado" />
          ))}
        </g>
      ) : (
        <g>
          {Array.from({ length: 3 }).map((_, i) => (
            <Andante key={i} x0={1500 + i * 260} y={1060} v={-1.4} escala={0.8} semilla={s * 11 + i} ropa="obrero" lleva="nada" />
          ))}
        </g>
      )}
    </g>
  );
};

export const ruhr: Decorado = {
  desc: "El Ruhr: castillete de mina, alto horno, chimeneas, naves y vagones de carbon; la puerta de la fabrica con su rotulo; mineros con lampara y obreros de brazos cruzados; soldados franceses con casco Adrian y la bandera francesa.",
  ancho: ANCHO_RUHR,
  admite:
    "variante 'ocupada' (soldados, chimeneas apagadas; por defecto), 'humo' (soldados y chimeneas humeando), 'trabajo' (sin soldados, humo y la rueda del castillete girando); textos.rotulo (rotulo de la puerta), textos.cartel (cartel 'Bekanntmachung' en el muro); gente",
  tomas: {
    general: toma([1100, 540, 1], [1150, 540, 1.06], "la zona industrial entera", ANCHO_RUHR),
    paneo: toma([900, 560, 1.2], [1700, 560, 1.2], "paneo de los mineros a los soldados", ANCHO_RUHR),
    soldados: toma([1180, 760, 2], [1200, 740, 2.3], "los soldados franceses en la puerta", ANCHO_RUHR),
    mineros: toma([420, 780, 2], [440, 760, 2.3], "los mineros esperando", ANCHO_RUHR),
    castillete: toma([420, 380, 1.7], [440, 340, 1.9], "el castillete y la escombrera", ANCHO_RUHR),
    chimeneas: toma([1200, 300, 1.6], [1300, 280, 1.8], "las chimeneas y el alto horno", ANCHO_RUHR),
  },
  dibujo: Ruhr,
};

/* ------------------------------------------------------------------ */
/* Estacion de tren                                                    */
/* ------------------------------------------------------------------ */

const ANCHO_EST = 2400;

const Locomotora: React.FC<{ x: number; y: number; arranca?: boolean }> = ({ x, y, arranca }) => {
  const f = useCurrentFrame();
  const dx = arranca ? Math.max(0, f - 60) ** 1.6 * 0.02 : 0;
  const giro = arranca ? dx * 1.5 : 0;
  return (
    <g transform={`translate(${x + dx} ${y})`}>
      <Humo x={150} y={-420} s={1.4} color={"#E8E4D8"} semilla={3} opacidad={0.7} viento={-0.3} n={7} />
      {/* caldera */}
      <rect x={60} y={-340} width={400} height={170} rx={30} fill={"#24282A"} />
      <rect x={130} y={-420} width={50} height={90} fill={"#24282A"} />
      <ellipse cx={270} cy={-345} rx={30} ry={20} fill={"#2E3436"} />
      <rect x={460} y={-400} width={200} height={230} fill={"#2E3436"} />
      <rect x={490} y={-370} width={70} height={70} fill={"#D9CFA8"} opacity={0.6} />
      <rect x={440} y={-410} width={240} height={20} fill={"#1A1E20"} />
      <rect x={30} y={-180} width={660} height={30} fill={W.carmin} />
      <path d="M 60 -150 L 0 -60 L 60 -60 Z" fill={"#1A1E20"} />
      {[150, 280, 410].map((cx) => (
        <g key={cx} transform={`translate(${cx} -84) rotate(${giro})`}>
          <circle r={64} fill={W.carmin} />
          <circle r={54} fill={"#1A1E20"} />
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <rect key={a} x={-3} y={-54} width={6} height={108} fill={W.carmin} transform={`rotate(${a})`} />
          ))}
        </g>
      ))}
      <rect x={140} y={-92} width={280} height={12} fill={"#9A9E9E"} />
      {/* ténder y vagones */}
      <rect x={700} y={-300} width={260} height={200} fill={"#24282A"} />
      {[0, 1].map((k) => (
        <g key={k}>
          <rect x={980 + k * 560} y={-360} width={540} height={260} rx={8} fill={"#3E4E3A"} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={1000 + k * 560 + i * 86} y={-330} width={64} height={70} fill={W.cristal} />
          ))}
          <rect x={980 + k * 560} y={-240} width={540} height={8} fill={W.ocre} />
          <rect x={990 + k * 560} y={-104} width={520} height={14} fill={"#1A1E20"} />
          {[1040, 1110, 1390, 1460].map((wx) => (
            <g key={wx}>
              <circle cx={wx + k * 560} cy={-70} r={30} fill={"#2A2E30"} />
              <circle cx={wx + k * 560} cy={-70} r={10} fill={"#8E9496"} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
};

const Estacion: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 17;
  const v = e.variante ?? "salida";
  const rotulo = e.textos?.rotulo ?? "Essen Hbf";
  const gente = e.gente ?? 0.8;
  const anden = 900;
  const n = Math.round(3 + gente * 7);
  const ropas: Ropa[] = v === "tropas" ? ["soldado"] : ["mujer", "obrero", "traje", "mujer", "nino", "abrigo", "obrero"];
  const llevas: Lleva[] = v === "tropas" ? ["nada"] : ["maleta", "fardo", "maleta", "bolso", "nada", "maleta", "fardo"];
  return (
    <g>
      <Defs />
      <rect x={-200} y={-100} width={ANCHO_EST + 400} height={1300} fill={"#CFC8B6"} />
      {/* boveda de hierro y cristal */}
      {Array.from({ length: 5 }).map((_, i) => {
        const cx = i * 600;
        return (
          <g key={i}>
            <path d={`M ${cx - 300} 520 Q ${cx} -120 ${cx + 300} 520`} fill="none" stroke={"#4A5254"} strokeWidth={18} />
            <path d={`M ${cx - 240} 520 Q ${cx} -40 ${cx + 240} 520`} fill="none" stroke={"#5A6264"} strokeWidth={6} />
          </g>
        );
      })}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={-200 + i * 200} y={-100} width={4} height={560} fill={"#6E7678"} opacity={0.6} />
      ))}
      <rect x={-200} y={-100} width={ANCHO_EST + 400} height={300} fill={"#E9E6DA"} opacity={0.5} />
      {/* muro del fondo con arcos */}
      <rect x={-200} y={440} width={ANCHO_EST + 400} height={260} fill="url(#w-sillar)" />
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M ${-100 + i * 340} 700 L ${-100 + i * 340} 560 Q ${-20 + i * 340} 480 ${60 + i * 340} 560 L ${60 + i * 340} 700 Z`} fill={"#5A5E5A"} />
      ))}
      <Humo x={300} y={420} s={1.6} color={"#F2EFE6"} semilla={s} opacidad={0.4} viento={0.5} />
      {/* cartel de la estacion y reloj */}
      <g transform="translate(1600 250)">
        <rect x={-4} y={-250} width={8} height={170} fill={W.hierro} />
        <rect x={-260} y={-90} width={520} height={86} fill={"#F2EFE6"} stroke={W.hierro} strokeWidth={8} />
        <text x={0} y={-30} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={58} fill={W.tinta}>
          {rotulo}
        </text>
        <circle cx={0} cy={60} r={66} fill={"#F2EFE6"} stroke={W.hierro} strokeWidth={10} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-2} y={2} width={4} height={10} fill={W.tinta} transform={`rotate(${i * 30} 0 60) translate(0 -2)`} />
        ))}
        <rect x={-3} y={20} width={6} height={42} fill={W.tinta} transform={`rotate(${120 + f * 0.05} 0 60)`} />
        <rect x={-2} y={8} width={4} height={54} fill={W.tinta} transform={`rotate(${f * 0.6} 0 60)`} />
      </g>
      {/* via y tren */}
      <rect x={-200} y={700} width={ANCHO_EST + 400} height={200} fill={"#6E685E"} />
      <rect x={-200} y={810} width={ANCHO_EST + 400} height={8} fill={"#9A9E9E"} />
      <Locomotora x={-60} y={830} arranca={v === "arranca"} />
      {/* anden */}
      <rect x={-200} y={anden - 20} width={ANCHO_EST + 400} height={24} fill={W.piedraMedia} />
      <rect x={-200} y={anden} width={ANCHO_EST + 400} height={300} fill={W.acera} />
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={-200 + i * 100} y={anden} width={3} height={200} fill={oscurecer(W.acera, 0.9)} />
      ))}
      {/* gente en el anden */}
      {Array.from({ length: n }).map((_, i) => {
        const ropa = ropas[i % ropas.length];
        const lleva = llevas[i % llevas.length];
        const dir = v === "tropas" ? 1 : -1;
        return (
          <Andante
            key={i}
            x0={v === "tropas" ? -300 + i * 150 : 400 + ((i * 313 + s * 41) % 2000)}
            y={1010 + (i % 3) * 22}
            v={dir * (v === "tropas" ? 1.5 : 0.8 + (i % 3) * 0.3)}
            escala={ropa === "nino" ? 0.58 : 0.8}
            semilla={s * 7 + i}
            ropa={ropa}
            lleva={lleva}
          />
        );
      })}
      {/* revisor */}
      <Figura x={2200} y={1060} escala={0.86} semilla={s + 90} ropa="policia" tocado="gorra" pose={v === "arranca" ? "senala" : "quieto"} mirada={-0.6} gesto="serio" />
    </g>
  );
};

export const estacion: Decorado = {
  desc: "Estacion de tren: boveda de hierro y cristal, locomotora de vapor echando humo con sus vagones, cartel con el nombre y reloj, anden con gente que se marcha con maletas y fardos (o tropas francesas), un revisor.",
  ancho: ANCHO_EST,
  admite: "variante 'salida' (gente con maletas y fardos; por defecto), 'tropas' (soldados franceses desfilando), 'arranca' (el tren se pone en marcha); textos.rotulo (nombre de la estacion); gente",
  tomas: {
    general: toma([1200, 540, 1], [1200, 540, 1.05], "la estacion entera", ANCHO_EST),
    locomotora: toma([420, 640, 1.9], [480, 640, 2.1], "la locomotora echando humo", ANCHO_EST),
    anden: toma([900, 820, 1.7], [1300, 820, 1.7], "la gente en el anden", ANCHO_EST),
    reloj: toma([1600, 280, 2], [1600, 260, 2.3], "el cartel y el reloj", ANCHO_EST),
    revisor: toma([2160, 760, 2.3], [2170, 730, 2.6], "el revisor", ANCHO_EST),
  },
  dibujo: Estacion,
};

/* ------------------------------------------------------------------ */
/* El Reichstag                                                        */
/* ------------------------------------------------------------------ */

const ANCHO_RT = 2400;

const Reichstag: React.FC<PropsDecorado> = ({ e }) => {
  const s = e.semilla ?? 19;
  const gente = e.gente ?? 0.6;
  const inscripcion = e.textos?.inscripcion ?? "DEM DEUTSCHEN VOLKE";
  const suelo = 820;
  const cx = 1200;
  return (
    <g>
      <Defs />
      <Cielo hora={e.hora ?? "dia"} ancho={ANCHO_RT} />
      {/* arboles del Tiergarten */}
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={-100 + i * 200} cy={suelo - 160 - (i % 3) * 20} r={110} fill={i % 2 ? "#7E8A6A" : "#8A9474"} />
      ))}
      {/* edificio, a escala para que quepan la cupula y las banderas */}
      <g transform={`translate(${cx} ${suelo}) scale(0.74) translate(${-cx} ${-suelo})`}>
        <rect x={cx - 900} y={suelo - 420} width={1800} height={420} fill="url(#w-sillar)" />
        <rect x={cx - 910} y={suelo - 440} width={1820} height={26} fill={W.piedraMedia} />
        {/* torres de esquina */}
        {[-900, 700].map((dx) => (
          <g key={dx}>
            <rect x={cx + dx} y={suelo - 600} width={200} height={600} fill="url(#w-sillar)" />
            <rect x={cx + dx - 10} y={suelo - 620} width={220} height={26} fill={W.piedraMedia} />
            <rect x={cx + dx + 20} y={suelo - 680} width={160} height={60} fill={W.piedra} />
            {[0, 1].map((k) => (
              <VentanaFachada key={k} x={cx + dx + 60} y={suelo - 540 + k * 200} w={80} h={120} frontis="triangulo" cortina={false} />
            ))}
          </g>
        ))}
        {/* ventanas de los cuerpos laterales */}
        {Array.from({ length: 10 }).map((_, i) =>
          i >= 4 && i <= 5 ? null : (
            <g key={i}>
              <VentanaFachada x={cx - 660 + i * 136} y={suelo - 360} w={64} h={110} frontis={i % 2 ? "curvo" : "triangulo"} cortina={false} />
              <VentanaFachada x={cx - 660 + i * 136} y={suelo - 190} w={64} h={110} cortina={false} />
            </g>
          )
        )}
        {/* cupula de hierro y cristal */}
        <g>
          <rect x={cx - 230} y={suelo - 640} width={460} height={100} fill={W.piedra} />
          <path d={`M ${cx - 200} ${suelo - 640} Q ${cx - 200} ${suelo - 860} ${cx} ${suelo - 880} Q ${cx + 200} ${suelo - 860} ${cx + 200} ${suelo - 640} Z`} fill={"#7E8A86"} />
          {[-140, -70, 0, 70, 140].map((k) => (
            <path key={k} d={`M ${cx + k} ${suelo - 640} Q ${cx + k * 0.7} ${suelo - 820} ${cx} ${suelo - 880}`} fill="none" stroke={"#4A5452"} strokeWidth={5} />
          ))}
          {[0.25, 0.5, 0.75].map((k) => (
            <path key={k} d={`M ${cx - 200 * (1 - k * 0.4)} ${suelo - 640 - k * 200} L ${cx + 200 * (1 - k * 0.4)} ${suelo - 640 - k * 200}`} stroke={"#4A5452"} strokeWidth={4} />
          ))}
          <rect x={cx - 10} y={suelo - 930} width={20} height={56} fill={"#4A5452"} />
        </g>
        {/* portico */}
        <rect x={cx - 330} y={suelo - 520} width={660} height={520} fill={W.piedraSombra} />
        {Array.from({ length: 6 }).map((_, i) => {
          const px = cx - 290 + i * 116;
          return (
            <g key={i}>
              <rect x={px} y={suelo - 470} width={50} height={420} fill={W.piedraLuz} />
              <rect x={px + 36} y={suelo - 470} width={14} height={420} fill={W.piedraMedia} />
              <rect x={px - 10} y={suelo - 486} width={70} height={18} fill={W.piedra} />
            </g>
          );
        })}
        {[0, 1, 2].map((k) => (
          <rect key={k} x={cx - 210 + k * 160} y={suelo - 250} width={80} height={200} fill={"#2A2F2E"} />
        ))}
        <rect x={cx - 350} y={suelo - 560} width={700} height={70} fill={W.piedra} />
        <text x={cx} y={suelo - 512} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={40} letterSpacing={10} fill={W.piedraOscura}>
          {inscripcion}
        </text>
        <polygon points={`${cx - 370},${suelo - 560} ${cx},${suelo - 680} ${cx + 370},${suelo - 560}`} fill={W.piedra} stroke={W.piedraMedia} strokeWidth={12} />
        {/* escalinata */}
        {[0, 1, 2, 3, 4].map((k) => (
          <rect key={k} x={cx - 360 - k * 20} y={suelo - 50 + k * 12} width={720 + k * 40} height={12} fill={k % 2 ? W.piedraMedia : W.piedra} />
        ))}
        <Bandera x={cx + 750} y={suelo - 900} franjas={WEIMAR} mastil={300} />
        <Bandera x={cx - 750} y={suelo - 900} franjas={WEIMAR} mastil={300} fase={2} />
      </g>
      {/* plaza */}
      <rect x={-200} y={suelo + 10} width={ANCHO_RT + 400} height={400} fill={"#B9AE94"} />
      <rect x={-200} y={suelo + 120} width={ANCHO_RT + 400} height={300} fill={"#8E9A74"} />
      <Auto x0={-500} y={suelo + 110} v={2} s={0.7} />
      <Auto x0={2600} y={suelo + 110} v={-1.6} s={0.7} tono={"#4A3A30"} />
      {Array.from({ length: Math.round(3 + gente * 8) }).map((_, i) => (
        <Andante key={i} x0={((i * 331 + s * 23) % (ANCHO_RT + 200)) - 100} y={suelo + 230 + (i % 3) * 30} v={(i % 2 ? -1 : 1) * (0.8 + (i % 3) * 0.3)} escala={0.62} semilla={s * 3 + i} ropa={(["traje", "abrigo", "mujer", "obrero"] as Ropa[])[i % 4]} lleva={i % 3 === 0 ? "periodico" : "nada"} />
      ))}
    </g>
  );
};

export const reichstag: Decorado = {
  desc: "El Reichstag por fuera: portico de seis columnas con la inscripcion, cupula de hierro y cristal, torres de esquina, banderas negro-rojo-oro ondeando, la plaza con gente y coches de los anos veinte.",
  ancho: ANCHO_RT,
  admite: "textos.inscripcion (por defecto 'DEM DEUTSCHEN VOLKE'); gente; hora",
  tomas: {
    general: toma([1200, 540, 1], [1200, 520, 1.08], "el edificio entero", ANCHO_RT),
    portico: toma([1200, 520, 1.8], [1200, 500, 2.1], "el portico y la inscripcion", ANCHO_RT),
    cupula: toma([1200, 300, 1.8], [1200, 270, 2.1], "la cupula", ANCHO_RT),
    bandera: toma([1800, 260, 2.2], [1830, 240, 2.5], "la bandera ondeando", ANCHO_RT),
    plaza: toma([800, 860, 1.8], [1300, 860, 1.8], "la gente en la plaza", ANCHO_RT),
  },
  dibujo: Reichstag,
};

/* ------------------------------------------------------------------ */
/* Mercado y trueque                                                    */
/* ------------------------------------------------------------------ */

const Puesto: React.FC<{ x: number; y: number; w: number; toldo: string; genero: number; cartel?: string; detras?: React.ReactNode }> = ({ x, y, w, toldo, genero, cartel, detras }) => (
  <g>
    {detras}
    <rect x={x + 10} y={y - 440} width={8} height={440} fill={W.madera} />
    <rect x={x + w - 18} y={y - 440} width={8} height={440} fill={W.madera} />
    <path d={`M ${x - 20} ${y - 440} L ${x + w + 20} ${y - 440} L ${x + w + 40} ${y - 380} L ${x - 40} ${y - 380} Z`} fill={toldo} />
    {Array.from({ length: Math.floor((w + 60) / 40) }).map((_, i) => (
      <rect key={i} x={x - 30 + i * 40} y={y - 440} width={18} height={60} fill={"#F2EBD8"} opacity={0.35} />
    ))}
    <rect x={x} y={y - 130} width={w} height={130} fill={W.maderaLuz} />
    <rect x={x - 10} y={y - 140} width={w + 20} height={16} fill={W.maderaClara} />
    {Array.from({ length: Math.floor(w / 46) }).map((_, i) =>
      genero === 0 ? (
        <g key={i}>
          <ellipse cx={x + 30 + i * 46} cy={y - 150} rx={20} ry={14} fill={"#B08A5A"} />
          <ellipse cx={x + 52 + i * 46} cy={y - 166} rx={18} ry={12} fill={"#A27A4A"} />
        </g>
      ) : genero === 1 ? (
        <g key={i}>
          <circle cx={x + 30 + i * 46} cy={y - 160} r={22} fill={"#8EA46A"} />
          <path d={`M ${x + 14 + i * 46} ${y - 160} Q ${x + 30 + i * 46} ${y - 180} ${x + 46 + i * 46} ${y - 160}`} fill={"#A8BC80"} />
        </g>
      ) : (
        <g key={i}>
          <ellipse cx={x + 30 + i * 46} cy={y - 156} rx={10} ry={13} fill={"#F2EBD8"} />
          <ellipse cx={x + 46 + i * 46} cy={y - 154} rx={10} ry={13} fill={"#E8D9B8"} />
          <path d={`M ${x + 24 + i * 46} ${y - 330} L ${x + 24 + i * 46} ${y - 230}`} stroke={"#8A3A2A"} strokeWidth={10} strokeLinecap="round" />
        </g>
      )
    )}
    {cartel ? (
      <g>
        <path d={`M ${x + 70} ${y - 380} L ${x + 70} ${y - 350} M ${x + 190} ${y - 380} L ${x + 190} ${y - 350}`} stroke={W.hierro} strokeWidth={3} />
        <rect x={x + 40} y={y - 350} width={180} height={50} fill={W.pizarra} />
        <text x={x + 130} y={y - 315} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={cartel.length > 12 ? 22 : 28} fill={W.tiza}>
          {cartel}
        </text>
      </g>
    ) : null}
  </g>
);

const Mercado: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 21;
  const gente = e.gente ?? 0.7;
  const carteles = (e.textos?.carteles ?? "Kartoffeln|Kohl|Eier").split("|");
  const suelo = 760;
  const ofrece = Math.sin(f * 0.08) * 6;
  return (
    <g>
      <Defs />
      <Cielo hora={e.hora ?? "dia"} />
      {/* casas e iglesia del fondo */}
      <g>
        <rect x={-200} y={suelo - 420} width={2400} height={420} fill={"#C9BC9C"} />
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i}>
            <path d={`M ${-200 + i * 240} ${suelo - 420} L ${-80 + i * 240} ${suelo - 540} L ${40 + i * 240} ${suelo - 420} Z`} fill={i % 2 ? "#9A5A42" : "#8A4E3A"} />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={-170 + i * 240 + k * 70} y={suelo - 380} width={40} height={60} fill={W.cristal} />
            ))}
            {[0, 1, 2].map((k) => (
              <rect key={k} x={-170 + i * 240 + k * 70} y={suelo - 260} width={40} height={60} fill={W.cristal} />
            ))}
          </g>
        ))}
        <rect x={1300} y={suelo - 760} width={120} height={400} fill={W.piedraMedia} />
        <path d={`M 1290 ${suelo - 760} L 1360 ${suelo - 960} L 1430 ${suelo - 760} Z`} fill={"#5E6E66"} />
        <circle cx={1360} cy={suelo - 680} r={30} fill={"#F2ECDD"} />
      </g>
      <rect x={-200} y={suelo} width={2400} height={400} fill="url(#w-adoquin)" />
      {/* puestos */}
      <Puesto x={60} y={suelo + 60} w={420} toldo={W.verde} genero={0} cartel={carteles[0]}
        detras={<Figura x={360} y={suelo + 60} escala={0.85} semilla={s + 1} ropa="obrero" tocado="flexible" rasgos={{ edad: "mayor", barba: "completa" }} cuerpo="busto" pose="brazos" mirada={0.7} gesto="serio" />} />
      <Puesto x={1340} y={suelo + 60} w={400} toldo={W.carmin} genero={1} cartel={carteles[1]}
        detras={<Figura x={1630} y={suelo + 60} escala={0.85} semilla={s + 2} ropa="mujer" tocado="panuelo" cuerpo="busto" pose="mesa" mirada={-0.6} />} />
      <Puesto x={1500 + 260} y={suelo + 60} w={300} toldo={"#2F3A55"} genero={2} cartel={carteles[2]} />
      {/* trueque: un senor ofrece su reloj, una senora un abrigo */}
      <g>
        <Figura x={760} y={1040} escala={1} semilla={s + 3} ropa="traje" tocado="bombin" pose="carga" mirada={0.6} gesto="inquieto"
          enManos={<g transform={`translate(0 ${ofrece - 20})`}><path d="M 0 -30 Q -30 -60 -20 -90" stroke={W.laton} strokeWidth={3} fill="none" /><circle r={30} fill={W.laton} /><circle r={24} fill={"#F2ECDD"} /><rect x={-2} y={-18} width={4} height={18} fill={W.tinta} /><rect x={-2} y={-2} width={14} height={4} fill={W.tinta} /><circle cy={-32} r={6} fill={W.laton} /></g>} />
        <Figura x={1040} y={1050} escala={1} semilla={s + 4} ropa="obrero" tocado="gorra" rasgos={{ edad: "maduro" }} pose="habla" mirada={-0.7} />
        <Figura x={1220} y={1060} escala={0.98} semilla={s + 5} ropa="mujer" pose="carga" mirada={0.6} gesto="serio"
          enManos={<g transform={`translate(0 ${ofrece})`}><path d="M -50 -10 L 50 -10 L 60 70 L -60 70 Z" fill={"#5A4636"} /><rect x={-10} y={-10} width={20} height={80} fill={"#4A3A2C"} /></g>} />
      </g>
      {Array.from({ length: Math.round(2 + gente * 5) }).map((_, i) => (
        <Andante key={i} x0={((i * 421 + s * 31) % 2200) - 100} y={suelo + 120 + (i % 2) * 20} v={(i % 2 ? -1 : 1) * 1} escala={0.62} semilla={s * 13 + i} ropa={(["mujer", "obrero", "abrigo", "nino", "mujer"] as Ropa[])[i % 5]} lleva={i % 2 ? "fardo" : "bolso"} />
      ))}
    </g>
  );
};

export const mercado: Decorado = {
  desc: "Mercado en una plaza: puestos con toldo de patatas, coles, huevos y salchichas, campesinos tras los puestos, casas con tejado rojo e iglesia; en primer plano un trueque: un senor ofrece su reloj de bolsillo, una mujer un abrigo, un obrero negocia.",
  admite: "textos.carteles (pizarras de los puestos separadas por |, por defecto 'Kartoffeln|Kohl|Eier'); gente",
  tomas: {
    general: toma([960, 540, 1], [960, 540, 1.06], "el mercado entero"),
    trueque: toma([960, 700, 1.8], [980, 690, 2.05], "el trueque en primer plano"),
    reloj: toma([780, 760, 2.4], [770, 760, 2.8], "el senor que ofrece su reloj de bolsillo"),
    puesto: toma([300, 640, 1.9], [330, 620, 2.2], "el campesino y su puesto de patatas"),
    campesina: toma([1560, 640, 1.9], [1600, 620, 2.2], "la campesina y su puesto"),
  },
  dibujo: Mercado,
};
