import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../../theme";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloAndes, Humo, TexturasPot, mezcla, rr } from "./comun";
import { Frente, Perfil } from "./Gente";
import { Balanza } from "./moneda";

/**
 * China Ming: la oficina del distrito donde los campesinos pagan el impuesto
 * en plata, pesada en una balanza. Y una calle de mercado europea hacia 1600,
 * con la pizarra de precios de la panaderia y los albaniles cobrando el jornal.
 */

/* ------------------------------------------------------------------ */
/* pot/china                                                            */
/* ------------------------------------------------------------------ */

const Tejado: React.FC<{ x: number; y: number; w: number; t: (c: string) => string }> = ({ x, y, w, t }) => (
  <g>
    <path d={`M ${x - 80} ${y} Q ${x - 40} ${y - 10} ${x} ${y - 70} L ${x + w} ${y - 70} Q ${x + w + 40} ${y - 10} ${x + w + 80} ${y} Q ${x + w + 90} ${y - 30} ${x + w + 70} ${y - 40} L ${x + w} ${y - 120} L ${x} ${y - 120} L ${x - 70} ${y - 40} Q ${x - 90} ${y - 30} ${x - 80} ${y} Z`} fill={t("#3E4A4A")} />
    {Array.from({ length: Math.floor(w / 22) + 6 }).map((_, i) => (
      <path key={i} d={`M ${x - 50 + i * 22} ${y - 20} L ${x - 30 + i * 22} ${y - 110}`} stroke={t("#2E3838")} strokeWidth={4} />
    ))}
    <rect x={x - 10} y={y - 132} width={w + 20} height={16} fill={t("#2E3838")} />
  </g>
);

const DibujoChina: React.FC<PropsDecorado> = ({ e }) => {
  const f = useCurrentFrame();
  const hora = e.hora ?? "dia";
  const sem = e.semilla ?? 21;
  const gente = e.gente ?? 0.8;
  const t = (c: string) => (hora === "noche" ? mezcla(c, "#1A2030", 0.55) : hora === "tarde" ? mezcla(c, "#E0A060", 0.18) : c);
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={1920} id="china" nubes={3} />
      {/* montes y pagoda al fondo */}
      <path d="M -100 520 Q 200 300 420 420 Q 640 260 900 420 Q 1200 280 1500 400 Q 1760 300 2020 420 L 2020 600 L -100 600 Z" fill={t("#9AA79A")} />
      <g transform="translate(1640 460)">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={-40 + i * 6} y={-60 - i * 60} width={80 - i * 12} height={60} fill={t("#C9B48A")} />
            <path d={`M ${-70 + i * 8} ${-60 - i * 60} L ${70 - i * 8} ${-60 - i * 60} L ${50 - i * 8} ${-80 - i * 60} L ${-50 + i * 8} ${-80 - i * 60} Z`} fill={t("#3E4A4A")} />
          </g>
        ))}
      </g>
      {/* el patio de la oficina */}
      <rect x={-100} y={560} width={2120} height={600} fill={t("#C9BEA6")} />
      {Array.from({ length: 12 }).map((_, r) =>
        Array.from({ length: 16 }).map((_, c) => <rect key={`${r}-${c}`} x={-100 + c * 140 + (r % 2) * 70} y={560 + r * 50} width={136} height={46} fill={t((r + c) % 2 ? "#D2C7B0" : "#C4B89E")} />)
      )}
      {/* el pabellon */}
      <rect x={300} y={300} width={1320} height={300} fill={t("#E6D8BC")} />
      <Tejado x={300} y={320} w={1320} t={t} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={320 + i * 210} y={320} width={34} height={300} fill={t("#A8302A")} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={364 + i * 210} y={340} width={156} height={220} fill={t("#5A3A2A")} />
          {Array.from({ length: 5 }).map((_, k) => (
            <path key={k} d={`M ${364 + i * 210} ${370 + k * 40} h 156`} stroke={t("#7A5A3A")} strokeWidth={4} />
          ))}
        </g>
      ))}
      <rect x={280} y={600} width={1360} height={30} fill={t("#8A7A62")} />
      <rect x={260} y={626} width={1400} height={20} fill={t("#7A6A52")} />
      {/* farolillos */}
      {[420, 960, 1500].map((x) => (
        <g key={x} transform={`rotate(${Math.sin(f * 0.05 + x) * 4} ${x} 300)`}>
          <path d={`M ${x} 300 V 330`} stroke={t(C.tinta)} strokeWidth={2} />
          <ellipse cx={x} cy={352} rx={20} ry={26} fill={t(C.carmin)} />
          <rect x={x - 8} y={374} width={16} height={8} fill={t(C.ocre)} />
        </g>
      ))}
      {/* la mesa del funcionario */}
      <Frente traje="chino" semilla={sem} edad="mayor" x={960} y={920} s={0.92} cuerpo="busto" pose="lee" gesto="serio" color={"#2E3E5A"} mirada={-0.5} />
      <Frente traje="chino" semilla={sem + 1} x={1280} y={910} s={0.86} cuerpo="busto" pose="escribe" objeto="pluma" color={"#3E4E3E"} mirada={-1} />
      <rect x={700} y={740} width={760} height={24} fill={t(C.madera)} />
      <path d="M 710 764 L 1450 764 L 1450 1100 L 710 1100 Z" fill={t("#7A2E2A")} />
      <path d="M 740 800 H 1420 M 740 1000 H 1420" stroke={t(C.ocre)} strokeWidth={6} />
      {/* rollo y pincel */}
      <rect x={1180} y={724} width={200} height={16} fill={t("#EDE3C8")} />
      <rect x={1172} y={720} width={14} height={24} rx={4} fill={t(C.madera)} />
      <rect x={1374} y={720} width={14} height={24} rx={4} fill={t(C.madera)} />
      {/* la balanza con la plata */}
      <Balanza x={820} y={740} s={0.62} color={"#8A6A3A"} izq={<g>{[0, 1, 2].map((k) => <path key={k} d={`M ${-24 + k * 16} -4 q 8 -16 16 0 Z`} fill={C.plata} />)}</g>} der={<g>{[0, 1].map((k) => <rect key={k} x={-14} y={-12 - k * 12} width={28} height={12} fill={"#5A5A5E"} />)}</g>} />
      {/* lingotes de plata (sycee) en una caja */}
      <g transform="translate(1040 740)">
        <rect x={-70} y={-30} width={140} height={30} fill={t(C.madera)} />
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M ${-56 + k * 40} -30 Q ${-50 + k * 40} -54 ${-36 + k * 40} -40 Q ${-26 + k * 40} -56 ${-20 + k * 40} -30 Z`} fill={C.plata} stroke={C.plataSombra} strokeWidth={2} />
        ))}
      </g>
      {/* los campesinos que esperan con su plata */}
      <Frente traje="campesino" semilla={sem + 2} x={480} y={1040} s={0.92} pose="ofrece" objeto="bolsa" gesto="serio" mirada={1} color={"#5A4A3A"} />
      {gente > 0.3 ? <Frente traje="campesino" semilla={sem + 3} x={260} y={1010} s={0.86} pose="frio" color={"#3E4E5A"} mirada={1} /> : null}
      {gente > 0.5 ? <Frente traje="campesino" semilla={sem + 4} x={80} y={990} s={0.8} pose="quieto" color={"#4A5A3E"} gorro="ninguno" mirada={1} /> : null}
      {gente > 0.5 ? <Perfil traje="campesino" semilla={sem + 5} x0={1800} y={760} v={-0.7} s={0.5} espalda="costal" /> : null}
      <Humo x={1640} y={140} s={0.4} n={3} semilla={5} color={"#D8D2C8"} />
    </g>
  );
};

export const CHINA: Decorado = {
  desc: "China Ming hacia 1580: el patio de la oficina del distrito, un pabellon con tejado de aleros curvos, columnas rojas y farolillos, una pagoda al fondo. Un funcionario mayor con tunica azul revisa el registro y un escribano escribe con pincel; en la mesa una balanza pesa trozos de plata y una caja con lingotes; los campesinos con sombrero de paja esperan con su bolsa de plata para pagar el impuesto.",
  admite: "hora, gente, semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 560, z: 1.06 }, desc: "el pabellon, la mesa y la fila" },
    balanza: { de: { x: 860, y: 660, z: 2.6 }, a: { x: 880, y: 650, z: 2.9 }, desc: "la balanza con la plata y los lingotes" },
    funcionario: { de: { x: 1080, y: 600, z: 2.2 }, a: { x: 1060, y: 590, z: 2.5 }, desc: "el funcionario y el escribano" },
    campesinos: { de: { x: 455, y: 720, z: 2.15 }, a: { x: 470, y: 710, z: 2.2 }, desc: "los campesinos que pagan en plata" },
  },
  dibujo: DibujoChina,
};

/* ------------------------------------------------------------------ */
/* pot/mercado (Europa, hacia 1600)                                     */
/* ------------------------------------------------------------------ */

const CasaEntramado: React.FC<{ x: number; y: number; w: number; h: number; semilla: number; t: (c: string) => string }> = ({ x, y, w, h, semilla, t }) => {
  const muro = ["#EDE3CE", "#E2D2B4", "#E8DCC4"][Math.floor(rr(semilla, 1) * 3)];
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={t(muro)} />
      {/* entramado de madera */}
      {Array.from({ length: Math.floor(w / 60) + 1 }).map((_, i) => (
        <rect key={i} x={x + i * 60} y={y - h} width={10} height={h - 180} fill={t("#4A3424")} />
      ))}
      {[0, 1, 2].map((k) => (
        <rect key={k} x={x} y={y - h + k * ((h - 180) / 2)} width={w} height={10} fill={t("#4A3424")} />
      ))}
      {Array.from({ length: Math.floor(w / 120) }).map((_, i) => (
        <path key={i} d={`M ${x + i * 120 + 10} ${y - 190} L ${x + i * 120 + 60} ${y - h + 10}`} stroke={t("#4A3424")} strokeWidth={8} />
      ))}
      {Array.from({ length: Math.floor(w / 120) }).map((_, i) => (
        <rect key={i} x={x + i * 120 + 70} y={y - h + 40} width={40} height={50} fill={t("#4A5A5A")} />
      ))}
      <path d={`M ${x - 20} ${y - h} L ${x + w / 2} ${y - h - 140} L ${x + w + 20} ${y - h} Z`} fill={t("#7A5A4A")} />
      <rect x={x} y={y - 180} width={w} height={180} fill={t(C.piedra)} />
    </g>
  );
};

const DibujoMercado: React.FC<PropsDecorado> = ({ e, dur }) => {
  const f = useCurrentFrame();
  const hora = e.hora ?? "dia";
  const sem = e.semilla ?? 31;
  const gente = e.gente ?? 0.8;
  const t = (c: string) => (hora === "noche" ? mezcla(c, "#1A2030", 0.55) : hora === "tarde" ? mezcla(c, "#E0A060", 0.18) : c);
  const titulo = e.textos?.pizarra ?? "PAN";
  const unidad = e.textos?.unidad ?? "";
  const vals = e.valores && e.valores.length ? e.valores : null;
  const v0 = vals ? vals[0] : 0;
  const v1 = vals ? vals[vals.length - 1] : 0;
  const k = interpolate(f, [dur * 0.15, dur * 0.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const valor = v0 + (v1 - v0) * k;
  const dec = Math.abs(v1) < 10 && !Number.isInteger(v1) ? 1 : 0;
  const cifra = vals ? valor.toLocaleString("es-ES", { maximumFractionDigits: dec, minimumFractionDigits: dec }) + (unidad ? ` ${unidad}` : "") : "";
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={1920} id="mercado" nubes={4} />
      <CasaEntramado x={-60} y={760} w={560} h={600} semilla={sem} t={t} />
      <CasaEntramado x={520} y={760} w={480} h={540} semilla={sem + 1} t={t} />
      <CasaEntramado x={1020} y={760} w={520} h={620} semilla={sem + 2} t={t} />
      <CasaEntramado x={1560} y={760} w={460} h={560} semilla={sem + 3} t={t} />
      {/* la panaderia con su pizarra */}
      <g>
        <rect x={60} y={600} width={360} height={160} fill={t("#3A2A20")} />
        <rect x={40} y={560} width={400} height={44} fill={t("#5A3D2B")} />
        <text x={240} y={592} textAnchor="middle" fontFamily={FONT.serif} fontSize={28} letterSpacing={4} fill={t(C.ocre)}>
          {e.textos?.tienda ?? "PANADERÍA"}
        </text>
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={120 + i * 110} cy={720} rx={46} ry={22} fill={t("#C98A4A")} />
        ))}
        {[0, 1].map((i) => (
          <ellipse key={i} cx={170 + i * 110} cy={694} rx={40} ry={18} fill={t("#B87A3E")} />
        ))}
        {/* pizarra de precios */}
        <g transform="translate(470 560)">
          <rect x={0} y={0} width={300} height={220} fill={t(C.madera)} />
          <rect x={12} y={12} width={276} height={196} fill={"#2B3330"} />
          <text x={150} y={62} textAnchor="middle" fontFamily={FONT.serif} fontSize={34} fill={"#EEEBE2"} letterSpacing={2}>
            {titulo}
          </text>
          <path d="M 40 80 H 260" stroke={"#EEEBE2"} strokeWidth={2} opacity={0.6} />
          <text x={150} y={150} textAnchor="middle" fontFamily={FONT.serif} fontSize={Math.min(vals ? 50 : 30, 470 / Math.max(1, (vals ? cifra : e.textos?.precio ?? "").length))} fill={vals && k > 0.02 ? "#F2C46A" : "#EEEBE2"}>
            {vals ? cifra : e.textos?.precio ?? ""}
          </text>
          {vals && k > 0.05 ? <path d={`M 240 ${180 - k * 30} l 14 -14 l 14 14`} stroke={C.carmin} strokeWidth={6} fill="none" /> : null}
          <rect x={270} y={20} width={8} height={30} fill={"#EEEBE2"} opacity={0.4} />
        </g>
      </g>
      {/* calle */}
      <rect x={-100} y={760} width={2120} height={420} fill={t(C.piedraOscura)} />
      <rect x={-100} y={760} width={2120} height={420} fill="url(#pot-empedrado)" opacity={0.6} />
      {/* sacos de grano y un puesto */}
      <g transform="translate(1320 930)">
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-120 + i * 90} 0 Q ${-130 + i * 90} -90 ${-90 + i * 90} -100 L ${-60 + i * 90} -100 Q ${-30 + i * 90} -90 ${-40 + i * 90} 0 Z`} fill={t(i % 2 ? "#C2AE84" : "#B8A47C")} />
        ))}
        <ellipse cx={-80} cy={-100} rx={30} ry={8} fill={t("#D9B860")} />
      </g>
      {/* el maestro paga y el albanil mira las monedas */}
      <Frente traje="espanol" semilla={sem + 5} x={1640} y={1060} s={1} pose="ofrece" objeto="bolsa" color={"#3A2E28"} gesto="neutro" mirada={-1} gorro="ala" />
      <Frente traje="artesano" semilla={sem + 6} x={1000} y={1070} s={1} pose="ofrece" objeto="moneda" color={"#8A7A62"} color2={"#6A5A48"} gesto="inquieto" mirada={0.6} barba="completa" bigote="morsa" />
      {/* andamio con cal */}
      <g>
        <rect x={1100} y={300} width={12} height={460} fill={t("#7A5A3A")} />
        <rect x={1400} y={300} width={12} height={460} fill={t("#7A5A3A")} />
        <rect x={1090} y={460} width={330} height={14} fill={t("#8A6A44")} />
        <Perfil traje="espanol" semilla={sem + 7} x0={1240} y={460} s={0.45} pose="martillo" herramienta="martillo" ritmo={0.7} color={"#6A5A48"} gorro="ninguno" />
      </g>
      {gente > 0.3 ? <Frente traje="europea" semilla={sem + 8} x={860} y={1030} s={0.92} pose="habla" mirada={-1} /> : null}
      {gente > 0.5 ? (
        <g>
          <Perfil traje="europea" semilla={sem + 9} x0={-100} y={860} v={1} s={0.5} espalda="bulto" />
          <Perfil traje="espanol" semilla={sem + 10} x0={2000} y={850} v={-1} s={0.5} />
          <Perfil traje="clerigo" semilla={sem + 11} x0={1500} y={840} v={-0.7} s={0.46} />
        </g>
      ) : null}
      {/* polvo de cal que cae del andamio */}
      {Array.from({ length: 6 }).map((_, i) => {
        const tt = (f * 0.01 + i / 6) % 1;
        return <circle key={i} cx={1260 + Math.sin(i * 3) * 30} cy={470 + tt * 280} r={3} fill={"#F2EDE2"} opacity={1 - tt} />;
      })}
      <Humo x={300} y={40} s={0.7} n={4} semilla={7} color={"#D8D2C8"} />
    </g>
  );
};

export const MERCADO: Decorado = {
  desc: "Una calle de mercado en Europa hacia 1600: casas de entramado de madera, una panaderia con hogazas y una pizarra de precios (la cifra puede subir durante la escena), sacos de grano, un andamio con un albanil trabajando; en primer termino un maestro de obras paga y un albanil mira las monedas de su jornal, una mujer habla, gente que pasa.",
  admite: "textos.pizarra (titulo de la pizarra), textos.precio (texto fijo de la pizarra si no hay valores), textos.unidad (sufijo de la cifra), textos.tienda (rotulo), valores [de, a] (la cifra de la pizarra sube de uno a otro), hora, gente, semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 560, z: 1.06 }, desc: "la calle entera" },
    pizarra: { de: { x: 560, y: 660, z: 2.6 }, a: { x: 610, y: 670, z: 3 }, desc: "la pizarra de precios de la panaderia" },
    jornal: { de: { x: 1100, y: 740, z: 2.4 }, a: { x: 1060, y: 720, z: 2.7 }, desc: "el albanil mira las monedas del jornal" },
    calle: { de: { x: 1300, y: 640, z: 1.6 }, a: { x: 1220, y: 640, z: 1.7 }, desc: "el maestro que paga, el andamio y la gente" },
  },
  dibujo: DibujoMercado,
};
