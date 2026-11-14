import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { Billete, BilletesCayendo, Defs, FUENTE, Fajo, Humo, Lampara, Monton, Reloj, Rotulo, SueloInterior, VentanaInterior, W, oscurecer, rr, sv, toma } from "./base";
import { Andante, Figura, Fajito } from "./gente";
import { Mostrador } from "./tiendas";

/* ------------------------------------------------------------------ */
/* Imprenta de billetes                                                */
/* ------------------------------------------------------------------ */

/** Cilindro de rotativa que gira. */
const Cilindro: React.FC<{ x: number; y: number; r: number; v?: number; tono?: string }> = ({ x, y, r, v = 4, tono = "#8E9496" }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={tono} />
      <circle r={r * 0.82} fill={oscurecer(tono, 0.86)} />
      <g transform={`rotate(${(f * v) % 360})`}>
        {[0, 60, 120].map((a) => (
          <rect key={a} x={-r * 0.8} y={-3} width={r * 1.6} height={6} fill={oscurecer(tono, 0.66)} transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r={r * 0.2} fill={W.hierro} />
    </g>
  );
};

/** Rotativa: bobina de papel, torre de cilindros y salida de pliegos. */
const Rotativa: React.FC<{ x: number; y: number; s?: number; semilla?: number }> = ({ x, y, s = 1, semilla = 1 }) => {
  const f = useCurrentFrame();
  const avance = (f * 6) % 60;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* bancada */}
      <rect x={-40} y={-40} width={760} height={40} fill={W.hierro} />
      {/* bobina */}
      <g>
        <rect x={20} y={-200} width={14} height={160} fill={W.hierro} />
        <circle cx={60} cy={-170} r={90} fill={"#EDE6D3"} />
        <circle cx={60} cy={-170} r={84} fill="none" stroke={"#D9CFB4"} strokeWidth={3} />
        <circle cx={60} cy={-170} r={60} fill="none" stroke={"#D9CFB4"} strokeWidth={2} />
        <circle cx={60} cy={-170} r={16} fill={W.hierroLuz} />
      </g>
      {/* banda de papel */}
      <path d="M 60 -260 L 260 -400 L 520 -400 L 620 -150" fill="none" stroke={"#E8E0CA"} strokeWidth={14} />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={260 + ((i * 60 + avance) % 260)} y={-406} width={34} height={12} fill={W.billeteAzul} opacity={0.8} />
      ))}
      {/* bastidor de la torre */}
      <rect x={220} y={-520} width={340} height={480} fill={"#3C4446"} />
      <rect x={236} y={-504} width={308} height={448} fill={"#4A5456"} />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <Cilindro x={320} y={-440 + k * 130} r={46} v={5 + k} tono={k === 1 ? "#A3AAAC" : "#8E9496"} />
          <Cilindro x={460} y={-440 + k * 130} r={46} v={-(5 + k)} tono={"#B9A06A"} />
        </g>
      ))}
      {/* engranajes y volante */}
      <Cilindro x={600} y={-300} r={70} v={-3} tono={"#5A6264"} />
      <rect x={210} y={-540} width={360} height={24} fill={W.hierro} />
      <text x={390} y={-523} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={16} fill={"#C9CCCD"} letterSpacing={3}>
        KOENIG &amp; BAUER
      </text>
      {/* salida: pliegos de billetes */}
      <rect x={580} y={-150} width={170} height={110} fill={W.maderaMedia} />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={590} y={-160 - i * 6} width={150} height={6} fill={i % 2 ? W.billete : W.billeteAzul} />
      ))}
      <BilletesCayendo x={600} y={-260} w={120} h={110} n={5} semilla={semilla} />
    </g>
  );
};

const Imprenta: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 9;
  const gente = e.gente ?? 0.8;
  const rotulo = e.textos?.rotulo ?? "Reichsdruckerei";
  const ANCHO = 2400;
  const suelo = 900;
  const nCont = Math.round(2 + gente * 2);
  return (
    <g>
      <Defs />
      <rect x={-200} y={-100} width={ANCHO + 400} height={1300} fill="url(#w-ladrillo)" />
      <rect x={-200} y={-100} width={ANCHO + 400} height={1300} fill={"#2A2420"} opacity={0.25} />
      {/* ventanales de fabrica */}
      {[0, 1, 2, 3].map((i) => {
        const vx = 60 + i * 600;
        return (
          <g key={i}>
            <path d={`M ${vx} 520 L ${vx} 140 Q ${vx + 200} 40 ${vx + 400} 140 L ${vx + 400} 520 Z`} fill={"#D9DCCF"} />
            {Array.from({ length: 5 }).map((_, k) => (
              <rect key={k} x={vx + k * 80} y={60} width={6} height={460} fill={W.hierro} />
            ))}
            {Array.from({ length: 6 }).map((_, k) => (
              <rect key={k} x={vx} y={160 + k * 64} width={400} height={5} fill={W.hierro} />
            ))}
            <rect x={vx - 14} y={516} width={428} height={16} fill={W.piedraMedia} />
            <polygon points={`${vx},150 ${vx + 400},150 ${vx + 700},${suelo + 100} ${vx + 200},${suelo + 100}`} fill="url(#w-luz)" opacity={0.6} />
          </g>
        );
      })}
      <Rotulo x={ANCHO / 2 - 300} y={20} w={600} h={64} texto={rotulo} fondo={W.hierro} letra={"#E2DCC8"} />
      {/* ejes de transmision con correas */}
      <rect x={-200} y={600} width={ANCHO + 400} height={10} fill={W.hierro} />
      {[300, 1100, 1900].map((px) => (
        <g key={px}>
          <Cilindro x={px} y={605} r={30} v={8} tono={"#6A7072"} />
          <path d={`M ${px - 30} 605 L ${px - 20} 760 M ${px + 30} 605 L ${px + 20} 760`} stroke={"#3A2E22"} strokeWidth={6} />
        </g>
      ))}
      <SueloInterior y={suelo} ancho={ANCHO} tipo="tablas" />
      <rect x={-200} y={suelo} width={ANCHO + 400} height={400} fill={"#3A3028"} opacity={0.35} />
      {/* rotativas */}
      <Rotativa x={40} y={suelo + 40} s={1.05} semilla={s} />
      <Rotativa x={1720} y={suelo + 40} s={1.05} semilla={s + 2} />
      {/* impresores */}
      <Figura x={900} y={suelo + 130} escala={0.95} semilla={s + 50} ropa="obrero" tocado="ninguno" pose="brazos" mirada={-0.5} gesto="serio" />
      <Figura x={2340} y={suelo + 130} escala={0.95} semilla={s + 51} ropa="obrero" tocado="gorra" pose="senala" mirada={-0.6} espejo />
      {/* mesa de contadoras */}
      <g>
        {Array.from({ length: nCont }).map((_, i) => (
          <Figura key={i} x={1110 + i * 150} y={1080} escala={0.9} semilla={s * 7 + i} ropa="mujer" tocado={i % 2 ? "panuelo" : "ninguno"} cuerpo="busto" pose="cuenta" mirada={(i % 2 ? -1 : 1) * 0.4} gesto={i % 3 === 0 ? "serio" : "neutro"}
            enManos={<g><Billete x={-26} y={18} w={56} giro={-14} tono={i} /><Billete x={24} y={14} w={56} giro={10} tono={i + 1} /></g>} />
        ))}
        <Mostrador x={1010} y={960} w={nCont * 150 + 120} h={140} tono={W.maderaLuz} tapa={W.maderaClara} />
        <Monton x={1080} y={946} n={6} w={70} semilla={s + 4} />
        <Monton x={1060 + nCont * 150} y={946} n={5} w={70} semilla={s + 5} ancho={2} />
      </g>
      {/* carro con fajos */}
      <g transform={`translate(${30 + sv(f / 300) * 60} 1060)`}>
        <rect x={0} y={-100} width={200} height={70} fill={W.maderaMedia} />
        <Monton x={100} y={-100} n={7} w={60} semilla={s + 9} ancho={3} />
        <circle cx={30} cy={-20} r={20} fill={W.hierro} />
        <circle cx={170} cy={-20} r={20} fill={W.hierro} />
      </g>
      <Lampara x={960} y={380} largo={380} tipo="verde" />
      <Lampara x={1500} y={380} largo={380} tipo="verde" />
    </g>
  );
};

export const imprenta: Decorado = {
  desc: "Imprenta de billetes del Reichsbank: nave de ladrillo con ventanales, dos rotativas con cilindros que giran y la banda de papel con billetes, pliegos que caen, ejes con correas, impresores y una mesa de mujeres contando fajos.",
  ancho: 2400,
  admite: "textos.rotulo (rotulo de la nave, por defecto 'Reichsdruckerei'); gente (cuantas contadoras)",
  tomas: {
    general: toma([1200, 540, 1], [1200, 540, 1.05], "la nave entera", 2400),
    paneo: toma([700, 600, 1.4], [1700, 600, 1.4], "paneo por las rotativas", 2400),
    rotativa: toma([420, 650, 2.1], [400, 640, 2.5], "los cilindros girando", 2400),
    contadoras: toma([1300, 780, 2], [1340, 800, 2.2], "mujeres contando billetes", 2400),
    fajos: toma([1120, 900, 2.6], [1160, 900, 3], "fajos sobre la mesa", 2400),
    impresor: toma([900, 640, 2.4], [900, 600, 2.8], "el impresor de brazos cruzados", 2400),
  },
  dibujo: Imprenta,
};

/* ------------------------------------------------------------------ */
/* Cocina obrera                                                       */
/* ------------------------------------------------------------------ */

const Cocina: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 11;
  const v = e.variante ?? "sueldo";
  const calendario = e.textos?.calendario ?? "1923";
  const hora = e.hora ?? "tarde";
  const suelo = 860;
  const llama = 0.8 + Math.sin(f * 0.6) * 0.15 + Math.sin(f * 1.7) * 0.08;
  const echa = v === "quema" ? sv(((f % 90) - 10) / 40) : 0;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-100} width={2320} height={1300} fill={"#C9BFA4"} />
      <rect x={-200} y={-100} width={2320} height={1300} fill="url(#w-revoco)" opacity={0.4} />
      <rect x={-200} y={560} width={2320} height={300} fill={"#8A9A86"} />
      <rect x={-200} y={552} width={2320} height={10} fill={"#6E7E6A"} />
      {/* ventana */}
      <VentanaInterior x={1360} y={150} w={300} h={330} hora={hora} cortinas={"#B9A57E"} fuera="fabrica" />
      {/* estante con cacharros */}
      <rect x={120} y={200} width={420} height={14} fill={W.maderaLuz} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={140 + i * 80} y={150} width={50} height={50} rx={6} fill={["#E8E4D8", "#C8402C", "#E8E4D8", "#4A6A8A", "#E8E4D8"][i]} />
          <rect x={140 + i * 80} y={164} width={50} height={6} fill={"#2A4A6A"} opacity={0.6} />
        </g>
      ))}
      <rect x={120} y={300} width={420} height={14} fill={W.maderaLuz} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={180 + i * 130} cy={290} r={10} fill={W.hierro} />
      ))}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${150 + i * 130} 300 Q ${180 + i * 130} 360 ${210 + i * 130} 300`} fill={["#B07A42", "#8E9496", "#6E4B35"][i]} />
      ))}
      {/* calendario */}
      <g transform="translate(700 180)">
        <rect x={0} y={0} width={150} height={190} fill={"#EFE7D2"} />
        <rect x={0} y={0} width={150} height={44} fill={W.carmin} />
        <text x={75} y={32} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={26} fill={"#F2EBD8"}>
          {calendario}
        </text>
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={12 + (i % 5) * 26} y={60 + Math.floor(i / 5) * 30} width={18} height={14} fill={i === 13 ? W.carmin : "#9A9078"} opacity={0.7} />
        ))}
      </g>
      <Reloj x={1060} y={230} r={50} rapido={2} />
      {/* fogon de carbon */}
      <g transform="translate(220 860)">
        <rect x={0} y={-320} width={60} height={320} fill={"#3A3E40"} />
        <rect x={10} y={-900} width={40} height={600} fill={"#3A3E40"} />
        <rect x={0} y={-300} width={420} height={300} fill={"#2E3234"} />
        <rect x={-10} y={-316} width={440} height={22} fill={"#4A5052"} />
        {/* puerta del hogar abierta con fuego */}
        <rect x={60} y={-250} width={150} height={110} fill={"#1A1A1A"} />
        <ellipse cx={135} cy={-180} rx={70 * llama} ry={46 * llama} fill={W.fuego} opacity={0.9} />
        <ellipse cx={135} cy={-170} rx={40 * llama} ry={26 * llama} fill={"#F6D27A"} />
        <circle cx={135} cy={-190} r={150} fill="url(#w-fuego)" opacity={0.6} />
        <rect x={30} y={-256} width={30} height={120} fill={"#4A5052"} transform="rotate(-50 60 -256)" />
        {v === "quema" ? (
          <g>
            <Billete x={135 - echa * 20} y={-200 + echa * 10} w={60} giro={-20 + echa * 60} tono={0} />
            <Billete x={110} y={-170} w={50} giro={30} tono={2} />
          </g>
        ) : null}
        <rect x={240} y={-250} width={150} height={110} fill={"#3A3E40"} />
        <circle cx={380} cy={-200} r={8} fill={W.laton} />
        <rect x={0} y={-60} width={420} height={20} fill={"#24282A"} />
        {/* olla con vapor */}
        <path d="M 250 -316 L 250 -400 Q 300 -410 350 -400 L 350 -316 Z" fill={"#6E7678"} />
        <rect x={244} y={-408} width={112} height={12} rx={4} fill={"#5A6264"} />
      </g>
      <Humo x={520} y={440} s={0.5} color={"#F2EFE6"} opacidad={0.5} n={5} viento={0.2} semilla={s} />
      <SueloInterior y={suelo} tipo="tablas" />
      {/* mesa familiar */}
      <g>
        {v === "quema" ? (
          <Figura x={520} y={1040} escala={0.98} semilla={s + 60} ropa="mujer" tocado="panuelo" pose="carga" mirada={-0.8} gesto="serio"
            enManos={<g><Fajito x={-20} y={0} /><Fajito x={20} y={-6} tono={1} /></g>} />
        ) : null}
        <Figura x={1060} y={1000} escala={0.98} semilla={s + 61} ropa="obrero" tocado="ninguno" cuerpo="busto" pose={v === "sueldo" ? "cuenta" : "mesa"} mirada={0.5} gesto="inquieto"
          enManos={v === "sueldo" ? <g><rect x={-40} y={0} width={80} height={50} fill={"#C9B07A"} /><Billete x={0} y={-10} w={64} giro={-6} tono={1} /></g> : undefined} />
        {v !== "quema" ? (
          <Figura x={1360} y={1000} escala={0.95} semilla={s + 62} ropa="mujer" tocado="ninguno" cuerpo="busto" pose={v === "sueldo" ? "habla" : "mesa"} mirada={-0.6} gesto="serio" />
        ) : null}
        <Figura x={1610} y={1010} escala={0.82} semilla={s + 63} ropa="nino" tocado="ninguno" cuerpo="busto" pose="mesa" mirada={-0.4} />
        <rect x={880} y={800} width={900} height={24} fill={W.maderaLuz} />
        <rect x={900} y={824} width={860} height={14} fill={oscurecer(W.maderaLuz, 0.8)} />
        <rect x={920} y={838} width={24} height={210} fill={W.madera} />
        <rect x={1716} y={838} width={24} height={210} fill={W.madera} />
        <path d="M 870 800 L 1790 800 L 1800 1046 L 860 1046 Z" fill={"#E8E0CC"} />
        <path d="M 870 800 L 1790 800 L 1792 830 L 868 830 Z" fill={"#D9CFB4"} />
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M ${920 + i * 100} 840 Q ${930 + i * 100} 940 ${915 + i * 100} 1046`} stroke={"#D2C8AE"} strokeWidth={3} fill="none" />
        ))}
        <path d="M 860 1000 L 1800 1000" stroke={W.carmin} strokeWidth={6} opacity={0.5} />
        {[1060, 1360, 1610].map((px) => (
          <g key={px}>
            <ellipse cx={px} cy={796} rx={56} ry={14} fill={"#E8E4D8"} />
            <ellipse cx={px} cy={794} rx={40} ry={9} fill={"#C9A86A"} />
          </g>
        ))}
        <rect x={1180} y={740} width={70} height={56} rx={8} fill={"#8E9496"} />
        <Fajo x={1500} y={796} w={90} alto={22} tono={0} />
      </g>
    </g>
  );
};

export const cocina: Decorado = {
  desc: "Cocina obrera: fogon de carbon con el hogar encendido y la olla humeando, estante con cacharros, calendario, reloj, ventana a las chimeneas; familia a la mesa (obrero, mujer, nino).",
  admite:
    "variante 'sueldo' (el obrero cuenta el sobre del jornal, la mujer le habla), 'quema' (la mujer echa billetes al fuego del fogon), 'cena'; textos.calendario (ano o mes en el calendario); hora",
  tomas: {
    general: toma([960, 540, 1], [960, 560, 1.06], "la cocina entera"),
    mesa: toma([1230, 680, 1.8], [1260, 680, 2], "la familia a la mesa"),
    obrero: toma([1060, 640, 2.4], [1060, 620, 2.8], "primer plano del obrero"),
    fogon: toma([380, 680, 2.2], [360, 700, 2.6], "el fuego del fogon"),
    ventana: toma([1300, 320, 2], [1260, 300, 2.1], "la ventana, el reloj y el calendario"),
  },
  dibujo: Cocina,
};

/* ------------------------------------------------------------------ */
/* Salon burgues                                                       */
/* ------------------------------------------------------------------ */

const Salon: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 13;
  const v = e.variante ?? "ahorros";
  const cartel = e.textos?.cartel ?? "Zimmer zu vermieten";
  const libreta = e.textos?.libreta ?? "Sparkassenbuch";
  const suelo = 870;
  const pendulo = Math.sin(f * 0.1) * 12;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-100} width={2320} height={1300} fill="url(#w-papelVerde)" />
      <rect x={-200} y={-100} width={2320} height={60} fill={"#E8E0CC"} />
      <rect x={-200} y={-40} width={2320} height={14} fill={"#C9BFA4"} />
      {/* zocalo de madera */}
      <rect x={-200} y={600} width={2320} height={270} fill={W.maderaMedia} />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={-160 + i * 240} y={630} width={200} height={200} rx={4} fill="none" stroke={W.madera} strokeWidth={4} />
      ))}
      <rect x={-200} y={592} width={2320} height={12} fill={W.maderaLuz} />
      {/* ventana con visillos */}
      <VentanaInterior x={140} y={110} w={360} h={420} hora={e.hora} cortinas={"#7A2E2A"} />
      <rect x={140} y={110} width={360} height={420} fill={"#F2EFE6"} opacity={0.35} />
      {/* cuadro con marco dorado */}
      <g transform="translate(700 130)">
        <rect x={-14} y={-14} width={388} height={288} fill={W.laton} />
        <rect x={0} y={0} width={360} height={260} fill={"#B9C2B0"} />
        <rect x={0} y={150} width={360} height={110} fill={"#7E8E6A"} />
        <path d="M 0 160 Q 90 110 180 150 Q 260 120 360 150 L 360 180 L 0 180 Z" fill={"#9AA68A"} />
        <circle cx={280} cy={60} r={24} fill={"#E8D9A8"} />
        <rect x={60} y={120} width={14} height={60} fill={"#5A4A3A"} />
        <circle cx={67} cy={110} r={30} fill={"#5E6E4A"} />
        <rect x={-14} y={-14} width={388} height={288} fill="none" stroke={"#A8862A"} strokeWidth={6} />
      </g>
      <rect x={870} y={20} width={4} height={100} fill={W.laton} />
      {/* reloj de pie */}
      <g transform="translate(1260 870)">
        <rect x={-60} y={-640} width={120} height={640} fill={W.madera} />
        <rect x={-70} y={-660} width={140} height={30} fill={W.maderaMedia} />
        <circle cx={0} cy={-560} r={46} fill={"#F2ECDD"} />
        <rect x={-2} y={-596} width={4} height={36} fill={W.tinta} transform={`rotate(${f * 0.6} 0 -560)`} />
        <rect x={-2} y={-584} width={4} height={24} fill={W.tinta} transform={`rotate(200 0 -560)`} />
        <rect x={-40} y={-490} width={80} height={300} fill={"#2A1E16"} />
        <g transform={`rotate(${pendulo} 0 -490)`}>
          <rect x={-2} y={-490} width={4} height={220} fill={W.laton} />
          <circle cx={0} cy={-262} r={22} fill={W.laton} />
        </g>
      </g>
      {/* librero */}
      <g transform="translate(1440 120)">
        <rect x={0} y={0} width={420} height={750} fill={W.madera} />
        {[0, 1, 2, 3].map((k) => (
          <g key={k}>
            <rect x={14} y={14 + k * 150} width={392} height={136} fill={"#3A2A1E"} />
            {Array.from({ length: 13 }).map((_, i) => (
              <rect key={i} x={20 + i * 29} y={30 + k * 150 + (rr(i + k * 13, 3) * 30)} width={24} height={120 - rr(i + k * 13, 3) * 30} fill={["#7A2E2A", "#2F4A3F", "#5A4636", "#3E4458", "#8A6A3A"][(i + k) % 5]} />
            ))}
          </g>
        ))}
        <rect x={14} y={620} width={392} height={116} fill={W.maderaMedia} />
      </g>
      <SueloInterior y={suelo} tipo="parquet" />
      {/* alfombra */}
      <path d="M 300 900 L 1500 900 L 1700 1080 L 100 1080 Z" fill={"#7A2E2A"} />
      <path d="M 340 920 L 1460 920 L 1640 1070 L 160 1070 Z" fill="none" stroke={W.ocre} strokeWidth={6} opacity={0.6} />
      {/* sillon con el jubilado */}
      <g>
        <path d="M 380 1000 L 380 640 Q 380 600 440 600 L 700 600 Q 760 600 760 640 L 760 1000 Z" fill={"#4A5A3A"} />
        <Figura x={570} y={1000} escala={1} semilla={s + 70} ropa="traje" tocado="ninguno" rasgos={{ edad: "mayor", gafas: true, peinado: "calvo", bigote: "morsa", pelo: "#D9D4CC" }} cuerpo="busto" pose="lee" mirada={0.2} gesto="inquieto" />
        <rect x={340} y={760} width={90} height={240} rx={30} fill={"#3E4E30"} />
        <rect x={710} y={760} width={90} height={240} rx={30} fill={"#3E4E30"} />
        <rect x={380} y={900} width={380} height={100} fill={"#3E4E30"} />
        <rect x={400} y={1000} width={20} height={40} fill={W.madera} />
        <rect x={720} y={1000} width={20} height={40} fill={W.madera} />
      </g>
      {/* mesita con te y la libreta */}
      <g transform="translate(940 1040)">
        <rect x={-10} y={-200} width={20} height={200} fill={W.madera} />
        <ellipse cx={0} cy={-200} rx={140} ry={26} fill={W.maderaLuz} />
        <rect x={-80} y={-250} width={40} height={44} rx={8} fill={"#E8E4D8"} />
        <ellipse cx={30} cy={-210} rx={30} ry={8} fill={"#E8E4D8"} />
        <g transform="rotate(-8 60 -230)">
          <rect x={20} y={-246} width={90} height={60} fill={"#5A2E22"} />
          <text x={65} y={-212} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={12} fill={W.laton}>
            {libreta}
          </text>
        </g>
      </g>
      {/* esposa de pie */}
      <Figura x={1080} y={1060} escala={0.98} semilla={s + 71} ropa="mujer" tocado="ninguno" rasgos={{ edad: "mayor", pelo: "#A8988A" }} pose={v === "subarriendo" ? "habla" : "carga"} mirada={-0.7} gesto="serio" />
      {/* puerta con el cartel y el inquilino */}
      {v === "subarriendo" ? (
        <g>
          <rect x={1700} y={300} width={260} height={570} fill={"#2A1E16"} />
          <rect x={1880} y={300} width={80} height={570} fill={W.maderaMedia} />
          <g transform="translate(1590 360) rotate(-3)">
            <rect x={-110} y={-40} width={220} height={80} fill={"#F2ECDA"} />
            <text x={0} y={10} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={cartel.length > 18 ? 22 : 28} fill={W.tinta}>
              {cartel}
            </text>
          </g>
          <Andante x0={1820} y={1050} v={-0.0001} escala={0.98} semilla={s + 72} ropa="traje" tocado="flexible" lleva="maleta" />
        </g>
      ) : null}
    </g>
  );
};

export const salon: Decorado = {
  desc: "Salon de un piso burgues: papel pintado, ventana con cortinas, cuadro con marco dorado, reloj de pie con pendulo, librero, alfombra; un jubilado en el sillon con su libreta de ahorros y su mujer de pie.",
  admite: "variante 'ahorros' (por defecto) o 'subarriendo' (puerta abierta, cartel y un inquilino con maleta); textos.cartel ('Zimmer zu vermieten'), textos.libreta (rotulo de la libreta); hora",
  tomas: {
    general: toma([960, 540, 1], [960, 560, 1.05], "el salon entero"),
    jubilado: toma([570, 640, 2.3], [570, 610, 2.7], "el jubilado leyendo"),
    pareja: toma([800, 700, 1.6], [850, 700, 1.75], "el matrimonio"),
    reloj: toma([1100, 330, 2], [1150, 320, 2.2], "el cuadro y el reloj de pie"),
    puerta: toma([1500, 600, 1.6], [1560, 600, 1.8], "la puerta, el cartel y el inquilino (solo con variante subarriendo)"),
  },
  dibujo: Salon,
};
