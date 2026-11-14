import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { Cielo, Defs, FUENTE, Humo, Litfass, Rotulo, VentanaFachada, W, oscurecer, rr, toma } from "./base";
import { Andante, Figura, type Lleva, type Ropa } from "./gente";

/* ------------------------------------------------------------------ */
/* Casa berlinesa de la Gruenderzeit con tienda en la planta baja       */
/* ------------------------------------------------------------------ */

export const Casa: React.FC<{
  x: number;
  suelo: number;
  w: number;
  h: number;
  tono: string;
  tienda?: string;
  toldo?: string;
  semilla?: number;
  noche?: boolean;
  escaparate?: React.ReactNode;
}> = ({ x, suelo, w, h, tono, tienda, toldo = W.carmin, semilla = 1, noche, escaparate }) => {
  const plantas = 4;
  const bajo = 190;
  const alto = (h - bajo - 60) / plantas;
  const cols = Math.max(3, Math.round(w / 130));
  const paso = w / cols;
  const luz = oscurecer(tono, 1.08);
  return (
    <g>
      {/* cuerpo */}
      <rect x={x} y={suelo - h} width={w} height={h} fill={tono} />
      <rect x={x} y={suelo - h} width={w} height={h} fill="url(#w-revoco)" opacity={0.35} />
      {/* cornisa con dentellones */}
      <rect x={x - 12} y={suelo - h - 8} width={w + 24} height={26} fill={luz} />
      <rect x={x - 6} y={suelo - h + 18} width={w + 12} height={8} fill={oscurecer(tono, 0.82)} />
      {Array.from({ length: Math.floor(w / 22) }).map((_, i) => (
        <rect key={i} x={x + 4 + i * 22} y={suelo - h + 26} width={10} height={10} fill={oscurecer(tono, 0.86)} />
      ))}
      {/* tejado de zinc y buhardillas */}
      <path d={`M ${x - 8} ${suelo - h - 8} L ${x + 30} ${suelo - h - 70} L ${x + w - 30} ${suelo - h - 70} L ${x + w + 8} ${suelo - h - 8} Z`} fill={"#6E6E6A"} />
      {Array.from({ length: Math.max(1, cols - 2) }).map((_, i) => (
        <g key={i}>
          <rect x={x + paso * (i + 1.25)} y={suelo - h - 62} width={44} height={44} fill={"#7E7E78"} />
          <rect x={x + paso * (i + 1.25) + 8} y={suelo - h - 54} width={28} height={30} fill={noche && rr(i, semilla) > 0.6 ? "#D9BE7E" : W.cristal} />
        </g>
      ))}
      <rect x={x + w * 0.7} y={suelo - h - 120} width={30} height={60} fill={W.ladrilloOscuro} />
      {/* impostas entre plantas */}
      {Array.from({ length: plantas }).map((_, p) => (
        <rect key={p} x={x} y={suelo - bajo - (p + 1) * alto - 6} width={w} height={8} fill={oscurecer(tono, 0.88)} />
      ))}
      {/* ventanas */}
      {Array.from({ length: plantas }).map((_, p) =>
        Array.from({ length: cols }).map((_, c) => {
          const vx = x + c * paso + paso * 0.24;
          const vy = suelo - bajo - (p + 1) * alto + alto * 0.18;
          const encendida = noche ? rr(p * 7 + c, semilla) > 0.45 : false;
          return (
            <VentanaFachada
              key={`${p}-${c}`}
              x={vx}
              y={vy}
              w={paso * 0.52}
              h={alto * 0.62}
              luz={encendida}
              tono={luz}
              frontis={p === 1 ? (c % 2 ? "curvo" : "triangulo") : "recto"}
              cortina={rr(p * 5 + c, semilla + 2) > 0.35}
            />
          );
        })
      )}
      {/* balcon de hierro en la primera planta */}
      <g>
        <rect x={x + paso * 0.8} y={suelo - bajo - alto + alto * 0.8} width={paso * 1.4} height={10} fill={oscurecer(tono, 0.75)} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={x + paso * 0.82 + i * (paso * 1.36) / 11} y={suelo - bajo - alto + alto * 0.62} width={3} height={alto * 0.18} fill={W.hierro} />
        ))}
        <rect x={x + paso * 0.8} y={suelo - bajo - alto + alto * 0.6} width={paso * 1.4} height={5} fill={W.hierro} />
      </g>
      {/* planta baja: tienda */}
      <rect x={x} y={suelo - bajo} width={w} height={bajo} fill={oscurecer(tono, 0.9)} />
      <rect x={x} y={suelo - bajo} width={w} height={bajo} fill="url(#w-sillar)" opacity={0.25} />
      <rect x={x + 20} y={suelo - bajo + 70} width={w * 0.62} height={bajo - 80} fill={W.cristal} />
      <rect x={x + 20} y={suelo - bajo + 70} width={w * 0.62} height={bajo - 80} fill={noche ? "#D9BE7E" : W.cristalLuz} opacity={noche ? 0.7 : 0.25} />
      {escaparate}
      <rect x={x + 20} y={suelo - bajo + 70} width={w * 0.62} height={bajo - 80} fill="none" stroke={W.madera} strokeWidth={6} />
      <rect x={x + 20 + w * 0.31 - 3} y={suelo - bajo + 70} width={6} height={bajo - 80} fill={W.madera} />
      {/* puerta */}
      <rect x={x + w * 0.72} y={suelo - bajo + 50} width={w * 0.2} height={bajo - 50} fill={W.madera} />
      <rect x={x + w * 0.74} y={suelo - bajo + 64} width={w * 0.16} height={60} fill={W.cristal} />
      <circle cx={x + w * 0.88} cy={suelo - 70} r={4} fill={W.laton} />
      {tienda ? <Rotulo x={x + 14} y={suelo - bajo + 4} w={w - 28} h={50} texto={tienda} /> : null}
      {/* toldo a rayas */}
      <path d={`M ${x + 14} ${suelo - bajo + 56} L ${x + w * 0.66} ${suelo - bajo + 56} L ${x + w * 0.66 + 20} ${suelo - bajo + 100} L ${x - 6} ${suelo - bajo + 100} Z`} fill={toldo} />
      {Array.from({ length: Math.floor(w / 50) }).map((_, i) =>
        x + 14 + i * 40 < x + w * 0.66 ? <rect key={i} x={x + 14 + i * 40} y={suelo - bajo + 56} width={18} height={44} fill={"#F2EBD8"} opacity={0.45} /> : null
      )}
      <rect x={x} y={suelo - 14} width={w} height={14} fill={oscurecer(tono, 0.7)} />
    </g>
  );
};

/** Tranvia de Berlin de los anos veinte, con trole y cable. */
export const Tranvia: React.FC<{ x0: number; y: number; v: number; s?: number; linea?: string }> = ({ x0, y, v, s = 1, linea = "12" }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  const bamboleo = Math.sin(f * 0.4) * 1.2;
  return (
    <g transform={`translate(${x} ${y + bamboleo}) scale(${s})`}>
      {/* trole */}
      <path d="M 300 -300 L 420 -470" stroke={W.hierro} strokeWidth={6} />
      <circle cx={420} cy={-470} r={8} fill={W.hierro} />
      {/* caja */}
      <rect x={0} y={-300} width={640} height={30} rx={14} fill={"#D9CFB0"} />
      <rect x={-10} y={-272} width={660} height={190} rx={10} fill={"#E8D58E"} />
      <rect x={-10} y={-120} width={660} height={60} fill={"#C9B46A"} />
      <rect x={-10} y={-180} width={660} height={8} fill={"#8A6A2A"} />
      {/* ventanas con gente dentro */}
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i}>
          <rect x={20 + i * 88} y={-256} width={72} height={70} rx={4} fill={W.cristal} />
          <circle cx={56 + i * 88} cy={-212} r={14} fill={["#D6A47E", "#E2B892", "#C38E68"][i % 3]} />
          <rect x={42 + i * 88} y={-198} width={28} height={12} fill={["#3A3530", "#4A4F52", "#6B2E2A"][i % 3]} />
          <rect x={20 + i * 88} y={-256} width={72} height={24} fill={"#FFFFFF"} opacity={0.08} />
        </g>
      ))}
      <rect x={260} y={-166} width={120} height={36} fill={"#F2EBD8"} />
      <text x={320} y={-140} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={22} fill={W.tinta}>
        BVG
      </text>
      {/* indicador de linea */}
      <rect x={560} y={-330} width={70} height={36} fill={W.tinta} />
      <text x={595} y={-303} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={26} fill={"#F2EBD8"}>
        {linea}
      </text>
      {/* plataformas */}
      <rect x={-30} y={-250} width={24} height={170} fill={"#C9B46A"} />
      <rect x={646} y={-250} width={24} height={170} fill={"#C9B46A"} />
      {/* bastidor y ruedas */}
      <rect x={20} y={-62} width={600} height={24} fill={W.hierro} />
      {[110, 520].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={-28} r={30} fill={W.hierro} />
          <circle cx={cx} cy={-28} r={10} fill={W.hierroLuz} />
        </g>
      ))}
    </g>
  );
};

/** Kiosco de periodicos con el cartel del titular. */
export const Kiosco: React.FC<{ x: number; y: number; titular: string; cabecera?: string }> = ({ x, y, titular, cabecera = "Berliner Tageblatt" }) => {
  const f = useCurrentFrame();
  const palabras = titular.split(" ");
  const lineas: string[] = [];
  let l = "";
  for (const p of palabras) {
    if ((l + " " + p).trim().length > 16 && l) {
      lineas.push(l);
      l = p;
    } else l = (l + " " + p).trim();
  }
  if (l) lineas.push(l);
  const tam = lineas.length > 3 ? 24 : 30;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-130} y={-330} width={260} height={330} fill={W.verdeOscuro} />
      <rect x={-120} y={-250} width={240} height={160} fill={"#3A403C"} />
      {/* periodicos colgados */}
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i} transform={`translate(${-104 + i * 40} -244) rotate(${Math.sin(f * 0.08 + i) * 2})`}>
          <rect x={0} y={0} width={34} height={46} fill={i % 2 ? "#EDE6D3" : "#E3DAC2"} />
          <rect x={3} y={4} width={28} height={6} fill={W.tinta} opacity={0.7} />
          <rect x={3} y={14} width={28} height={3} fill={"#9A9078"} />
          <rect x={3} y={20} width={20} height={3} fill={"#9A9078"} />
        </g>
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={-110 + i * 46} y={-186} width={40} height={30} fill={["#EDE6D3", "#C8402C", "#E3DAC2", "#E8B33C", "#EDE6D3"][i]} />
      ))}
      <rect x={-130} y={-90} width={260} height={10} fill={W.verde} />
      {/* tejadillo */}
      <path d="M -160 -330 L 0 -400 L 160 -330 Z" fill={W.verde} />
      <rect x={-166} y={-338} width={332} height={14} fill={W.verdeOscuro} />
      <Rotulo x={-120} y={-322} w={240} h={40} texto="Zeitungen" fondo={W.verdeOscuro} />
      {/* cartel del titular */}
      <g transform="translate(150 -380)">
        <rect x={0} y={-30} width={10} height={410} fill={W.hierro} />
        <rect x={110} y={-30} width={10} height={410} fill={W.hierro} />
        <rect x={-50} y={-250} width={220} height={226} fill={"#F2ECDA"} stroke={W.hierro} strokeWidth={6} />
        <text x={60} y={-216} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={21} fill={W.tinta}>
          {cabecera}
        </text>
        <rect x={-40} y={-206} width={200} height={3} fill={W.tinta} />
        {lineas.slice(0, 5).map((ln, i) => (
          <text key={i} x={60} y={-170 + i * (tam + 6)} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={tam} fill={i === 0 ? W.carmin : W.tinta}>
            {ln}
          </text>
        ))}
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Decorado: calle de Berlin                                           */
/* ------------------------------------------------------------------ */

const ANCHO = 2700;
const SUELO = 790;

const Calle: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 1;
  const hora = e.hora ?? "dia";
  const noche = hora === "noche";
  const gente = e.gente ?? 0.7;
  const titular = e.textos?.titular ?? "Der Dollar steigt!";
  const carteles = (e.textos?.carteles ?? "Kino|Theater|Varieté").split("|");
  const precio = e.textos?.precio ?? "";
  const variante = e.variante ?? "1923";
  const n = Math.round(4 + gente * 10);
  const ropas: Ropa[] = variante === "1914" ? ["traje", "abrigo", "mujer", "traje", "obrero", "mujer"] : ["obrero", "mujer", "traje", "mujer", "abrigo", "nino", "obrero", "mujer"];
  const llevas: Lleva[] = variante === "1923" ? ["cesto", "nada", "bolso", "carretilla", "nada", "periodico", "nada", "maleta"] : ["nada", "periodico", "bolso", "baston", "nada"];
  return (
    <g>
      <Defs />
      <Cielo hora={hora} ancho={ANCHO} />
      {/* ciudad lejana: tejados, cupula y chimeneas */}
      <g fill={noche ? "#2A3242" : "#C9C0AC"}>
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={-200 + i * 160} y={SUELO - 720 - ((i * 53) % 90)} width={150} height={400} />
        ))}
        <path d="M 1780 120 Q 1840 40 1900 120 Z" />
        <rect x={1770} y={120} width={140} height={200} />
        <rect x={1834} y={10} width={12} height={40} />
        <rect x={900} y={60} width={26} height={160} />
        <rect x={2300} y={80} width={26} height={160} />
      </g>
      <Humo x={913} y={60} s={0.9} semilla={s} color={noche ? "#4A4F5A" : "#A8A092"} />
      <Humo x={2313} y={80} s={0.8} semilla={s + 3} color={noche ? "#4A4F5A" : "#A8A092"} />
      {/* fachadas */}
      <Casa x={-40} suelo={SUELO} w={560} h={590} tono={"#CDBB98"} tienda="Bäckerei" semilla={s} noche={noche} toldo={W.carmin}
        escaparate={
          <g>
            {Array.from({ length: 6 }).map((_, i) => (
              <ellipse key={i} cx={20 + 40 + i * 50} cy={SUELO - 60} rx={22} ry={12} fill={"#B07A42"} />
            ))}
            {precio ? (
              <g>
                <rect x={60} y={SUELO - 108} width={240} height={46} fill={"#F2ECDA"} />
                <text x={180} y={SUELO - 76} textAnchor="middle" fontFamily={FUENTE.sans} fontWeight={700} fontSize={22} fill={W.carmin}>
                  {precio}
                </text>
              </g>
            ) : null}
          </g>
        }
      />
      <Casa x={540} suelo={SUELO} w={520} h={620} tono={"#B9A98C"} tienda="Kolonialwaren" semilla={s + 1} noche={noche} toldo={W.verde} />
      <Casa x={1080} suelo={SUELO} w={600} h={570} tono={"#D3C4A4"} tienda="Wechselstube" semilla={s + 2} noche={noche} toldo={"#2F3A55"} />
      <Casa x={1700} suelo={SUELO} w={520} h={610} tono={"#C2AE8A"} tienda="Zigarren" semilla={s + 3} noche={noche} toldo={W.ocre} />
      <Casa x={2240} suelo={SUELO} w={520} h={580} tono={"#CFC0A0"} tienda="Kaufhaus" semilla={s + 4} noche={noche} toldo={W.carmin} />
      {/* cable del tranvia */}
      <line x1={-100} y1={642} x2={ANCHO + 100} y2={642} stroke={W.hierro} strokeWidth={3} />
      {[300, 1500, 2500].map((px) => (
        <line key={px} x1={px} y1={642} x2={px + 40} y2={420} stroke={W.hierro} strokeWidth={2} />
      ))}
      {/* acera */}
      <rect x={-100} y={SUELO} width={ANCHO + 200} height={50} fill={W.acera} />
      {Array.from({ length: 40 }).map((_, i) => (
        <rect key={i} x={-100 + i * 72} y={SUELO} width={2} height={50} fill={oscurecer(W.acera, 0.9)} />
      ))}
      <rect x={-100} y={SUELO + 50} width={ANCHO + 200} height={10} fill={W.piedraOscura} />
      <rect x={-100} y={SUELO + 60} width={ANCHO + 200} height={400} fill="url(#w-adoquin)" />
      {/* carriles */}
      {[960, 1000].map((ry) => (
        <rect key={ry} x={-100} y={ry} width={ANCHO + 200} height={6} fill={"#B9B4A6"} />
      ))}
      {/* farolas */}
      {[480, 1320, 2160].map((fx) => (
        <g key={fx}>
          <rect x={fx - 6} y={SUELO - 300} width={12} height={326} fill={W.hierro} />
          <rect x={fx - 14} y={SUELO + 4} width={28} height={22} fill={W.hierro} />
          <path d={`M ${fx - 22} ${SUELO - 300} L ${fx + 22} ${SUELO - 300} L ${fx + 16} ${SUELO - 350} L ${fx - 16} ${SUELO - 350} Z`} fill={noche ? "#F2D88A" : "#E6CD8E"} />
          <polygon points={`${fx - 24},${SUELO - 350} ${fx},${SUELO - 372} ${fx + 24},${SUELO - 350}`} fill={W.hierro} />
          {noche ? <circle cx={fx} cy={SUELO - 320} r={120} fill="url(#w-lampara)" /> : null}
        </g>
      ))}
      <Litfass x={1560} y={SUELO + 26} s={0.95} carteles={carteles} />
      <Kiosco x={860} y={SUELO + 30} titular={titular} />
      {/* vendedor de periodicos junto al kiosco */}
      <Figura x={700} y={SUELO + 36} escala={0.62} semilla={s + 70} ropa="obrero" pose="lee" mirada={0.4} />
      {/* gente en la acera */}
      {Array.from({ length: n }).map((_, i) => {
        const ropa = ropas[i % ropas.length];
        const lleva = ropa === "nino" ? "nada" : llevas[(i + s) % llevas.length];
        const v = (i % 2 ? -1 : 1) * (1.3 + (i % 3) * 0.35) * (lleva === "carretilla" ? 0.6 : 1);
        return (
          <Andante
            key={i}
            x0={-200 + ((i * 397 + s * 91) % (ANCHO + 200))}
            y={SUELO + 40 + (i % 3) * 4}
            v={v}
            escala={ropa === "nino" ? 0.5 : 0.62}
            semilla={s * 31 + i}
            ropa={ropa}
            lleva={lleva}
          />
        );
      })}
      {variante === "1914" ? (
        <g>
          {Array.from({ length: 6 }).map((_, i) => (
            <Andante key={`m${i}`} x0={-300 + i * 110} y={1060} v={1.6} escala={0.78} semilla={900 + i} ropa="traje" tocado="flexible" lleva="maleta" />
          ))}
        </g>
      ) : null}
      {/* tranvia */}
      <Tranvia x0={variante === "1914" ? 1700 : 150} y={1040} v={variante === "1914" ? -1.4 : 1.8} s={0.85} linea={String(10 + (s % 80))} />
      {noche ? <rect x={-200} y={-200} width={ANCHO + 400} height={1500} fill={"#0E1420"} opacity={0.28} /> : null}
    </g>
  );
};

export const calle: Decorado = {
  desc: "Calle de Berlin: casas de cuatro plantas con molduras, panaderia, ultramarinos, casa de cambio y estanco; kiosco con cartel del titular, columna de anuncios, farolas, tranvia que pasa y gente con cestos y carretillas de billetes.",
  ancho: ANCHO,
  admite:
    "textos.titular (cartel del kiosco, en aleman o castellano), textos.carteles (carteles de la columna separados por |), textos.precio (cartel en el escaparate de la panaderia); variante '1923' (cestos y carretillas), '1914' (hombres con maleta que se van); hora dia|tarde|noche; gente 0..1",
  tomas: {
    general: toma([1350, 540, 1], [1350, 540, 1.08], "toda la calle", ANCHO),
    paneo: toma([960, 560, 1.15], [1740, 560, 1.15], "paneo lateral por las fachadas", ANCHO),
    kiosco: toma([980, 420, 1.7], [1070, 320, 2.4], "el cartel del titular del kiosco", ANCHO),
    columna: toma([1560, 620, 1.9], [1560, 600, 2.3], "la columna de anuncios", ANCHO),
    gente: toma([600, 700, 1.7], [900, 700, 1.8], "gente con cestos por la acera", ANCHO),
    escaparate: toma([200, 700, 2.4], [230, 690, 2.8], "escaparate de la panaderia con el precio", ANCHO),
    tranvia: toma([700, 800, 1.5], [1200, 800, 1.5], "el tranvia pasando", ANCHO),
  },
  dibujo: Calle,
};
