import React from "react";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloNubes, Coche, Defs, Humo, T, Ventana, rr } from "./comun";
import { Andante, Figura, type Atuendo } from "./gente";

/* ------------------------------------------------------------------ */
/* Detroit: la cadena de montaje                                       */
/* ------------------------------------------------------------------ */

const Chasis: React.FC<{ x: number; y: number; s?: number; fase: number }> = ({ x, y, s = 1, fase }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-10} y={-70} width={370} height={14} fill={"#15181A"} />
    <rect x={250} y={-120} width={100} height={50} fill={"#2A2E30"} />
    <rect x={346} y={-130} width={14} height={56} fill={C.laton} />
    {[56, 304].map((cx) => (
      <g key={cx} transform={`translate(${cx} -46) rotate(${fase})`}>
        <circle r={46} fill={"#15181A"} />
        <circle r={34} fill={"#8A7A5C"} />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={-2} y={-34} width={4} height={68} fill={"#3A3026"} transform={`rotate(${i * 18})`} />
        ))}
      </g>
    ))}
  </g>
);

const DibujoFabrica: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 4;
  const parada = e.variante === "parada";
  const gente = e.gente ?? (parada ? 0.2 : 0.9);
  const v = parada ? 0 : 0.9;
  const SUELO = 860;
  const desliza = (f * v) % 520;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-200} width={2320} height={SUELO + 200} fill="url(#crk-ladrillo)" />
      {/* ventanales de fabrica */}
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <rect x={60 + k * 380} y={150} width={300} height={360} fill={"#9EA69E"} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={60 + k * 380 + i * 50} y={150} width={4} height={360} fill={"#4A4F4C"} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={60 + k * 380} y={150 + i * 45} width={300} height={4} fill={"#4A4F4C"} />
          ))}
          <rect x={60 + k * 380} y={150} width={300} height={360} fill="url(#crk-luzVentana)" opacity={parada ? 0.2 : 1} />
        </g>
      ))}
      {/* cerchas del techo */}
      <rect x={-200} y={-200} width={2320} height={280} fill={"#3A3A36"} />
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} stroke={"#2A2A28"} strokeWidth={10} fill="none">
          <path d={`M ${-100 + i * 200} 80 L ${0 + i * 200} -20 L ${100 + i * 200} 80`} />
          <path d={`M ${-100 + i * 200} 80 L ${100 + i * 200} 80`} />
        </g>
      ))}
      {/* rotulo */}
      <rect x={760} y={92} width={400} height={50} fill={C.tinta} />
      <T x={960} y={128} tam={30} color={C.ocre} esp={6}>
        {(e.textos?.rotulo ?? "LINE No. 3").toUpperCase()}
      </T>
      {/* via aerea con carrocerias que bajan */}
      <rect x={-200} y={230} width={2320} height={16} fill={"#2A2A28"} />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const x = -400 + k * 520 + desliza;
        const baja = Math.max(0, Math.min(1, (x - 640) / 300));
        if (x > 960) return null;
        return (
          <g key={k}>
            <rect x={x + 160} y={246} width={8} height={120 + baja * 230} fill={"#2A2A28"} />
            <g transform={`translate(${x} ${430 + baja * 230})`}>
              <path d="M 40 0 L 40 -70 Q 44 -80 60 -80 L 200 -80 L 210 0 Z" fill={["#1E2426", "#2F3A40", "#3A2A24"][k % 3]} />
              <path d="M 44 -80 L 52 -150 Q 120 -160 196 -150 L 204 -80 Z" fill={"#1A1C1E"} />
              <rect x={64} y={-140} width={58} height={48} fill={C.cristal} />
              <rect x={132} y={-140} width={56} height={48} fill={C.cristal} />
            </g>
          </g>
        );
      })}
      {/* suelo y cinta transportadora */}
      <rect x={-200} y={SUELO} width={2320} height={500} fill={"#6E6A60"} />
      <rect x={-200} y={SUELO - 30} width={2320} height={30} fill={"#3A3A36"} />
      {Array.from({ length: 50 }).map((_, i) => (
        <rect key={i} x={-200 + ((i * 50 + desliza) % 2400)} y={SUELO - 30} width={6} height={30} fill={"#2A2A28"} />
      ))}
      {/* coches en la cadena */}
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const x = -400 + k * 520 + desliza;
        return x > 980 ? (
          <Coche key={k} x0={x} y={SUELO - 30} v={0} parado s={0.9} color={["#1E2426", "#2F3A40", "#3A2A24"][k % 3]} />
        ) : (
          <Chasis key={k} x={x} y={SUELO - 30} s={0.9} fase={f * v * 0.6} />
        );
      })}
      {/* obreros a los dos lados de la cadena */}
      {Array.from({ length: Math.round(8 * gente) + 1 }).map((_, i) => {
        const k = sem * 20 + i;
        return (
          <Figura
            key={i}
            x={80 + i * 230 + rr(k, 1) * 40}
            y={SUELO + 150 + (i % 2) * 40}
            escala={0.78}
            semilla={k}
            atuendo={rr(k, 2) > 0.3 ? "obrero" : "granjero"}
            gorro="gorra"
            pose={parada ? (rr(k, 3) > 0.5 ? "brazos" : "quieto") : rr(k, 3) > 0.4 ? "escribe" : "carga"}
            papel={"#5A5A54"}
            gesto={parada ? "serio" : "neutro"}
            mirada={rr(k, 4) - 0.5}
            espejo={i % 2 === 1}
          />
        );
      })}
      {/* primer termino: bancos de piezas */}
      <rect x={-200} y={1030} width={2320} height={60} fill={"#4A4842"} />
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={-180 + i * 170} y={1000} width={110} height={34} rx={4} fill={"#5E5A50"} />
      ))}
      {parada ? <rect x={-200} y={-200} width={2320} height={1500} fill={"#1A1C20"} opacity={0.22} /> : <Humo x={1700} y={300} s={0.8} color={"#B9B2A2"} n={5} />}
    </g>
  );
};

export const FABRICA: Decorado = {
  desc: "Detroit: nave de una fabrica de coches con cerchas, ventanales, carrocerias que bajan de la via aerea sobre los chasis y obreros con gorra a los lados de la cadena.",
  admite: "textos.rotulo (cartel de la nave); variante 'parada' (la cadena quieta, pocos obreros, luz apagada); gente; semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 1000, y: 560, z: 1.08 }, desc: "la nave con la cadena en marcha" },
    cadena: { de: { x: 760, y: 680, z: 1.7 }, a: { x: 860, y: 680, z: 1.8 }, desc: "los chasis avanzando y la carroceria que baja" },
    obrero: { de: { x: 560, y: 760, z: 2.6 }, a: { x: 560, y: 740, z: 2.9 }, desc: "un obrero de la cadena, de cerca" },
    coche: { de: { x: 1500, y: 720, z: 2.0 }, a: { x: 1560, y: 720, z: 2.2 }, desc: "coches terminados saliendo de la cadena" },
    rotulo: { de: { x: 960, y: 200, z: 2.2 }, a: { x: 960, y: 230, z: 2.4 }, desc: "el cartel de la nave y la via aerea" },
  },
  dibujo: DibujoFabrica,
};

/* ------------------------------------------------------------------ */
/* El campo: granja con tierra seca, molino, tractor y subasta         */
/* ------------------------------------------------------------------ */

const Molino: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -50 0 L -10 -420 L 10 -420 L 50 0" fill="none" stroke={"#5A4A3A"} strokeWidth={8} />
    {[0.25, 0.5, 0.75].map((k) => (
      <path key={k} d={`M ${-50 + 40 * k} ${-420 * k} L ${50 - 40 * k} ${-420 * k}`} stroke={"#5A4A3A"} strokeWidth={5} />
    ))}
    <path d="M -46 -30 L 40 -380 M 46 -30 L -40 -380" stroke={"#6A5A48"} strokeWidth={3} />
    <g transform={`translate(0 -430) rotate(${f * 2.4})`}>
      {Array.from({ length: 16 }).map((_, i) => (
        <path key={i} d="M 0 0 L -10 -90 L 10 -90 Z" fill={"#B9AE96"} transform={`rotate(${i * 22.5})`} />
      ))}
      <circle r={12} fill={"#3A3026"} />
    </g>
    <path d="M 10 -430 L 120 -440 L 120 -400 Z" fill={"#8A7A62"} />
  </g>
);

const Tractor: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={120} cy={0} rx={170} ry={10} fill="#000" opacity={0.15} />
    <rect x={40} y={-170} width={200} height={70} rx={8} fill={"#5E6A5A"} />
    <rect x={220} y={-190} width={40} height={90} fill={"#4A5446"} />
    <rect x={150} y={-240} width={12} height={70} fill={"#2A2A2A"} />
    <rect x={20} y={-210} width={40} height={20} fill={"#3A3A36"} />
    <rect x={30} y={-190} width={14} height={60} fill={"#3A3A36"} />
    <g transform="translate(70 -90)">
      <circle r={90} fill={"#3A2E24"} />
      <circle r={70} fill={"#6E5A44"} />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={-6} y={-96} width={12} height={14} fill={"#2A2018"} transform={`rotate(${i * 22.5})`} />
      ))}
      <circle r={16} fill={"#2A2018"} />
    </g>
    <g transform="translate(250 -50)">
      <circle r={50} fill={"#3A2E24"} />
      <circle r={36} fill={"#6E5A44"} />
      <circle r={10} fill={"#2A2018"} />
    </g>
  </g>
);

const DibujoGranja: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 6;
  const subasta = e.variante === "subasta";
  const gente = e.gente ?? (subasta ? 0.9 : 0.3);
  const HORIZ = 620;
  const viento = Math.sin(f * 0.05);
  const cartel = e.textos?.cartel ?? "FARM AUCTION";
  return (
    <g>
      <Defs />
      <CieloNubes ancho={2400} alto={HORIZ} hora={e.hora} gris sem={sem} nubes={4} />
      {/* campos secos */}
      <rect x={-200} y={HORIZ} width={2800} height={700} fill="url(#crk-tierra)" />
      {Array.from({ length: 14 }).map((_, i) => (
        <path key={i} d={`M ${-200 + i * 200} 1080 L ${900 + i * 30} ${HORIZ}`} stroke={"#A6845A"} strokeWidth={3} opacity={0.6} />
      ))}
      <rect x={-200} y={HORIZ - 6} width={2800} height={12} fill={"#9E8458"} />
      {/* polvo que arrastra el viento */}
      {Array.from({ length: 6 }).map((_, i) => (
        <ellipse key={i} cx={((i * 500 + f * 3) % 2800) - 300} cy={HORIZ + 40 + (i % 3) * 30} rx={260} ry={26} fill={"#D9C49A"} opacity={0.35} />
      ))}
      {/* granero rojo y silo */}
      <g transform="translate(1340 0)">
        <rect x={0} y={330} width={420} height={HORIZ - 330 + 40} fill={"#8E3A2E"} />
        <polygon points={`-30,340 210,180 450,340`} fill={"#5A2A22"} />
        <rect x={150} y={420} width={120} height={HORIZ - 420 + 40} fill={"#6E2A22"} />
        <path d={`M 150 420 L 270 ${HORIZ + 40} M 270 420 L 150 ${HORIZ + 40}`} stroke={"#E9DFC6"} strokeWidth={6} />
        <rect x={180} y={260} width={60} height={50} fill={"#3A2A24"} />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={i * 42} y={330} width={3} height={HORIZ - 290} fill={"#7A3026"} />
        ))}
        <rect x={470} y={200} width={120} height={HORIZ - 160} fill={"#B9AE96"} />
        <path d="M 470 200 Q 530 140 590 200 Z" fill={"#8C8068"} />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={470} y={240 + i * 50} width={120} height={3} fill={"#9E927A"} />
        ))}
      </g>
      {/* casa de madera con porche */}
      <g transform="translate(260 0)">
        <rect x={0} y={330} width={480} height={330} fill={"#D9CFB8"} />
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={0} y={340 + i * 23} width={480} height={2} fill={"#B9AE96"} />
        ))}
        <polygon points="-30,340 240,200 510,340" fill={"#5A4A3E"} />
        <rect x={360} y={230} width={40} height={80} fill={"#7A5A4A"} />
        <Ventana x={60} y={400} w={90} h={120} marco={"#F2ECDD"} />
        <Ventana x={330} y={400} w={90} h={120} marco={"#F2ECDD"} />
        <rect x={200} y={480} width={80} height={180} fill={"#5A3F2E"} />
        <rect x={-20} y={540} width={520} height={14} fill={"#8A7A62"} />
        {[0, 120, 240, 360, 480].map((px) => (
          <rect key={px} x={px - 4} y={550} width={10} height={110} fill={"#B9AE96"} />
        ))}
        <rect x={-20} y={650} width={520} height={20} fill={"#8A7A62"} />
      </g>
      <Molino x={1060} y={HORIZ + 30} f={f} s={0.9} />
      <Tractor x={1760} y={HORIZ + 270} s={1} />
      {/* arbol seco */}
      <g stroke={"#5A4A3A"} strokeWidth={12} fill="none" strokeLinecap="round">
        <path d="M 130 820 L 140 560 M 138 640 L 70 560 M 140 600 L 210 520 M 76 568 L 40 530 M 200 530 L 230 480" />
      </g>
      {/* valla */}
      {Array.from({ length: 24 }).map((_, i) => (
        <rect key={i} x={-200 + i * 120} y={HORIZ + 80} width={10} height={70} fill={"#7A6A54"} />
      ))}
      <rect x={-200} y={HORIZ + 96} width={2800} height={6} fill={"#7A6A54"} />
      <rect x={-200} y={HORIZ + 124} width={2800} height={6} fill={"#7A6A54"} />
      {subasta ? (
        <g>
          {/* el subastador en un carro y el cartel */}
          <rect x={720} y={760} width={300} height={70} fill={"#6E5038"} />
          {[760, 980].map((cx) => (
            <circle key={cx} cx={cx} cy={840} r={40} fill={"#3A2E24"} />
          ))}
          <Figura x={870} y={764} escala={0.7} semilla={sem * 3} atuendo="traje" gorro="fedora" pose="habla" />
          <g transform={`translate(1040 ${600}) rotate(${viento * 2})`}>
            <rect x={-6} y={0} width={12} height={240} fill={"#5A4A3A"} />
            <rect x={-150} y={-10} width={300} height={110} fill={"#F2ECDD"} stroke={"#3A3026"} strokeWidth={6} />
            <T x={0} y={40} tam={30} color={C.carmin}>
              {cartel}
            </T>
            <rect x={-110} y={60} width={220} height={6} fill={"#B6AD96"} />
            <rect x={-80} y={76} width={160} height={6} fill={"#B6AD96"} />
          </g>
          {Array.from({ length: Math.round(12 * gente) + 3 }).map((_, i) => {
            const k = sem * 40 + i;
            const at: Atuendo[] = ["granjero", "granjero", "mujer", "granjero", "traje", "nino", "granjero"];
            return (
              <Figura
                key={i}
                x={140 + i * 120 + rr(k, 1) * 50}
                y={930 + (i % 3) * 50}
                escala={0.62}
                semilla={k}
                atuendo={at[i % at.length]}
                pose={rr(k, 2) > 0.7 ? "brazos" : "quieto"}
                gesto="serio"
                mirada={i * 120 < 700 ? 0.6 : -0.6}
                espejo={rr(k, 3) > 0.5}
              />
            );
          })}
        </g>
      ) : (
        <g>
          <Figura x={520} y={1000} escala={0.8} semilla={sem * 5} atuendo="granjero" pose="brazos" gesto="serio" mirada={0.4} />
          <Figura x={660} y={1010} escala={0.74} semilla={sem * 5 + 1} atuendo="mujer" gorro="ninguno" pose="manos" gesto="serio" />
          <Figura x={770} y={1020} escala={0.8} semilla={sem * 5 + 2} atuendo="nino" gorro="ninguno" pose="quieto" />
          {gente > 0.5 ? <Andante x0={1400} y={1000} v={0} dir={-1} escala={0.8} semilla={sem * 5 + 3} atuendo="granjero" /> : null}
        </g>
      )}
    </g>
  );
};

export const GRANJA: Decorado = {
  desc: "Granja del Medio Oeste con la tierra seca: casa de madera con porche, granero rojo, silo, molino que gira, tractor parado, arbol seco, valla y polvo que arrastra el viento. Variante 'subasta': subastador en un carro, cartel y vecinos.",
  ancho: 2400,
  admite: "variante 'subasta'; textos.cartel (cartel de la subasta, por defecto FARM AUCTION); gente; semilla",
  tomas: {
    general: { de: { x: 1100, y: 540, z: 1 }, a: { x: 1300, y: 560, z: 1.06 }, desc: "la granja entera, paneo lento" },
    casa: { de: { x: 560, y: 680, z: 1.7 }, a: { x: 580, y: 700, z: 1.85 }, desc: "la casa y la familia (o la subasta)" },
    molino: { de: { x: 1080, y: 340, z: 2.0 }, a: { x: 1080, y: 380, z: 2.2 }, desc: "el molino girando contra el cielo" },
    tractor: { de: { x: 1920, y: 760, z: 1.9 }, a: { x: 1950, y: 760, z: 2.1 }, desc: "el tractor parado y el granero" },
    subasta: { de: { x: 900, y: 760, z: 1.7 }, a: { x: 920, y: 760, z: 1.9 }, desc: "el subastador, el cartel y los vecinos (variante subasta)" },
    cara: { de: { x: 540, y: 740, z: 3.2 }, a: { x: 540, y: 740, z: 3.6 }, desc: "primer plano del granjero" },
  },
  dibujo: DibujoGranja,
};

/* ------------------------------------------------------------------ */
/* El puerto de Nueva York con los barcos parados                      */
/* ------------------------------------------------------------------ */

const Carguero: React.FC<{ x: number; y: number; s?: number; f: number; nombre?: string; humo?: boolean }> = ({ x, y, s = 1, f, nombre, humo }) => {
  const mece = Math.sin(f * 0.04 + x) * 3;
  return (
    <g transform={`translate(${x} ${y + mece}) scale(${s}) rotate(${mece * 0.15})`}>
      <path d="M 0 0 L 40 120 L 960 120 L 1020 0 Z" fill={"#2A2E30"} />
      <rect x={30} y={80} width={950} height={14} fill={"#8E2A22"} />
      <rect x={60} y={-60} width={140} height={60} fill={"#3A3E40"} />
      <rect x={380} y={-150} width={260} height={150} fill={"#E4DCCB"} />
      {Array.from({ length: 6 }).map((_, i) => (
        <circle key={i} cx={410 + i * 40} cy={-110} r={10} fill={C.cristal} />
      ))}
      <rect x={360} y={-170} width={300} height={22} fill={"#C9BEA6"} />
      <rect x={480} y={-320} width={70} height={150} fill={"#1E2224"} />
      <rect x={480} y={-300} width={70} height={30} fill={"#8E2A22"} />
      {humo ? <g transform="translate(515 -330)"><Humo x={0} y={0} s={0.8} color={"#9A968C"} n={5} /></g> : null}
      <rect x={200} y={-260} width={10} height={260} fill={"#3A3026"} />
      <rect x={820} y={-260} width={10} height={260} fill={"#3A3026"} />
      <path d="M 205 -250 L 120 -40 M 825 -250 L 900 -40" stroke={"#3A3026"} strokeWidth={4} />
      <rect x={700} y={-50} width={200} height={50} fill={"#3A3E40"} />
      {nombre ? (
        <T x={870} y={50} tam={26} fam="serif" color={"#E9E2D2"} esp={3}>
          {nombre}
        </T>
      ) : null}
    </g>
  );
};

const DibujoPuerto: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 7;
  const gente = e.gente ?? 0.5;
  const MUELLE = 760;
  return (
    <g>
      <Defs />
      <CieloNubes ancho={2400} alto={520} hora={e.hora} gris={e.variante !== "activo"} sem={sem} />
      {/* skyline del bajo Manhattan al fondo */}
      <g fill={"#B9B2A2"}>
        {[[100, 300], [260, 220], [380, 340], [520, 180], [640, 260], [1500, 200], [1640, 320], [1800, 240], [1960, 150], [2100, 280]].map(([x, h], i) => (
          <rect key={i} x={x} y={520 - h} width={110} height={h} />
        ))}
        <rect x={545} y={250} width={60} height={90} />
        <polygon points="545,250 575,200 605,250" />
      </g>
      {/* agua */}
      <rect x={-200} y={520} width={2800} height={300} fill={C.agua} />
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={((i * 160 + f * 0.8) % 2800) - 200} y={540 + (i % 6) * 40} width={80} height={4} fill={C.aguaLuz} opacity={0.7} />
      ))}
      <Carguero x={40} y={560} s={0.8} f={f} nombre={e.textos?.barco ?? "AMERICAN TRADER"} />
      <Carguero x={1300} y={500} s={0.55} f={f + 40} />
      {/* muelle de tablas */}
      <rect x={-200} y={MUELLE} width={2800} height={400} fill="url(#crk-tablas)" />
      <rect x={-200} y={MUELLE} width={2800} height={16} fill={"#5A4A3A"} />
      {Array.from({ length: 16 }).map((_, i) => (
        <g key={i}>
          <rect x={-180 + i * 180} y={MUELLE - 30} width={30} height={40} rx={10} fill={"#3A3026"} />
        </g>
      ))}
      {/* grua quieta */}
      <g transform="translate(1180 0)">
        <rect x={0} y={260} width={30} height={MUELLE - 260} fill={"#4A4237"} />
        <rect x={140} y={260} width={30} height={MUELLE - 260} fill={"#4A4237"} />
        <path d={`M 0 ${MUELLE} L 170 300 M 170 ${MUELLE} L 0 300`} stroke={"#4A4237"} strokeWidth={8} />
        <rect x={-20} y={230} width={420} height={40} fill={"#4A4237"} />
        <rect x={340} y={270} width={6} height={260} fill={"#2A2420"} />
        <rect x={310} y={530} width={66} height={30} fill={"#2A2420"} />
      </g>
      {/* almacen con cartel */}
      <g transform="translate(1560 0)">
        <rect x={0} y={420} width={700} height={MUELLE - 420} fill={"#9E8A70"} />
        <polygon points="-20,430 350,340 720,430" fill={"#6E5E4A"} />
        <rect x={120} y={500} width={180} height={MUELLE - 500} fill={"#2A2420"} />
        <rect x={400} y={500} width={180} height={MUELLE - 500} fill={"#3A3026"} />
        <rect x={180} y={380} width={340} height={56} fill={"#F2ECDD"} />
        <T x={350} y={420} tam={30} color={C.tinta} esp={4}>
          {e.textos?.cartel ?? "PIER 17"}
        </T>
      </g>
      {/* cajas y fardos apilados */}
      {Array.from({ length: 12 }).map((_, i) => {
        const cx = 120 + (i % 6) * 120 + (i > 5 ? 60 : 0);
        const cy = MUELLE + 150 - (i > 5 ? 90 : 0);
        return (
          <g key={i}>
            <rect x={cx} y={cy - 90} width={110} height={90} fill={i % 3 ? "#A88A5E" : "#9A7A50"} />
            <path d={`M ${cx} ${cy - 90} L ${cx + 110} ${cy} M ${cx + 110} ${cy - 90} L ${cx} ${cy}`} stroke={"#7A5E3E"} strokeWidth={4} />
            <rect x={cx} y={cy - 90} width={110} height={90} fill="none" stroke={"#7A5E3E"} strokeWidth={6} />
          </g>
        );
      })}
      <T x={420} y={MUELLE + 110} tam={22} fam="mono" color={"#3A2A1E"}>
        {e.textos?.cajas ?? "IMPORT"}
      </T>
      {/* estibadores sin trabajo */}
      {Array.from({ length: Math.round(6 * gente) + 2 }).map((_, i) => {
        const k = sem * 30 + i;
        return (
          <Figura
            key={i}
            x={980 + i * 150 + rr(k, 1) * 40}
            y={MUELLE + 250 + (i % 2) * 30}
            escala={0.7}
            semilla={k}
            atuendo="obrero"
            pose={rr(k, 2) > 0.5 ? "brazos" : "quieto"}
            gesto="serio"
            mirada={rr(k, 3) - 0.5}
            espejo={i % 2 === 1}
          />
        );
      })}
      {/* gaviotas */}
      {[0, 1, 2].map((i) => {
        const gx = ((i * 700 + f * 1.6) % 2600) - 200;
        const gy = 180 + i * 60 + Math.sin(f * 0.08 + i) * 10;
        const ala = Math.sin(f * 0.3 + i) * 8;
        return <path key={i} d={`M ${gx - 20} ${gy - ala} Q ${gx - 10} ${gy - 10} ${gx} ${gy} Q ${gx + 10} ${gy - 10} ${gx + 20} ${gy - ala}`} fill="none" stroke={"#3A3A36"} strokeWidth={3} />;
      })}
    </g>
  );
};

export const PUERTO: Decorado = {
  desc: "Muelle del puerto de Nueva York con los barcos parados: cargueros amarrados, grua quieta, almacen con cartel, cajas de importacion apiladas, estibadores sin trabajo y el bajo Manhattan al fondo.",
  ancho: 2400,
  admite: "textos.barco (nombre del carguero), textos.cartel (cartel del almacen, por defecto PIER 17), textos.cajas (estarcido de las cajas, por defecto IMPORT); variante 'activo' (cielo claro); gente; semilla",
  tomas: {
    general: { de: { x: 1000, y: 540, z: 1 }, a: { x: 1300, y: 540, z: 1.04 }, desc: "el puerto entero, paneo" },
    barco: { de: { x: 500, y: 520, z: 1.6 }, a: { x: 560, y: 540, z: 1.75 }, desc: "el carguero amarrado" },
    muelle: { de: { x: 1300, y: 820, z: 1.9 }, a: { x: 1360, y: 820, z: 2.1 }, desc: "los estibadores parados en el muelle" },
    cajas: { de: { x: 460, y: 820, z: 2.2 }, a: { x: 440, y: 820, z: 2.4 }, desc: "las cajas de importacion apiladas" },
    almacen: { de: { x: 1900, y: 560, z: 1.7 }, a: { x: 1920, y: 560, z: 1.85 }, desc: "el almacen y su cartel" },
  },
  dibujo: DibujoPuerto,
};
