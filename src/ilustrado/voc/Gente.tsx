import React from "react";
import { useCurrentFrame } from "remotion";
import { Cabeza, PIELES, PELOS, type Rasgos } from "../../piloto/Personajes";
import { C, osc, rnd } from "./comun";

/**
 * Gente de la VOC, 1595-1799: mercaderes con jubon negro y gola, mujeres con
 * cofia, marineros con gorro de lana, soldados, regentes del XVIII con peluca
 * y casaca, y gente de Banda, Java, China y Japon con su ropa. Las caras son
 * la `Cabeza` del piloto, para que el canal tenga un solo estilo.
 */

export type Traje =
  | "burgues"
  | "mujer"
  | "marinero"
  | "soldado"
  | "peluca"
  | "banda"
  | "bandaMujer"
  | "java"
  | "chino"
  | "japones"
  | "trabajador"
  | "moderno"
  | "moderna";

export type PoseV = "quieto" | "habla" | "senala" | "lee" | "escribe" | "brazos" | "carga" | "ofrece" | "manos" | "cuenta";

const NEGROS = ["#1E1E22", "#26221F", "#2A2B2E", "#33281F", "#1F2526"];
const CASACAS = ["#5A4A3A", "#3E4A5A", "#6A3A34", "#4A5A4A", "#56483B", "#3A3A44"];
const LANAS = [C.carmin, "#2F4A7A", "#5A5048", "#7A6A3A"];
const BATIK = ["#7A4A2A", "#3E3A5A", "#5A3A2A", "#2F4A3F", "#8A6A3A"];
const ROPA_CLARA = ["#E8E0CC", "#D9CDB2", "#EAD9B0", "#CFC6B2"];

type Opc = { traje: Traje; semilla: number; rasgos?: Rasgos; nino?: boolean; cofia?: boolean; capa?: boolean; sombrero?: boolean };

/** Rasgos de la cara segun el traje (piel, pelo, barba) desde la semilla. */
export const rasgosVoc = (traje: Traje, s: number, nino?: boolean, extra: Rasgos = {}): Rasgos => {
  const asia = traje === "banda" || traje === "bandaMujer" || traje === "java" || traje === "trabajador" || traje === "chino" || traje === "japones";
  const mujer = traje === "mujer" || traje === "bandaMujer" || traje === "moderna";
  const e0 = rnd(s, 1);
  const edad: Rasgos["edad"] = nino ? "joven" : e0 < 0.3 ? "joven" : e0 < 0.72 ? "maduro" : "mayor";
  let piel = PIELES[Math.floor(rnd(s, 3) * 3)];
  if (traje === "banda" || traje === "bandaMujer" || traje === "java") piel = PIELES[3 + Math.floor(rnd(s, 3) * 3)];
  if (traje === "trabajador") piel = PIELES[3 + Math.floor(rnd(s, 3) * 3)];
  if (traje === "chino" || traje === "japones") piel = PIELES[1 + Math.floor(rnd(s, 3) * 2)];
  if (traje === "moderno" || traje === "moderna") piel = PIELES[Math.floor(rnd(s, 3) * 6)];
  const pelo = asia ? (edad === "mayor" ? PELOS[4] : PELOS[0]) : edad === "mayor" ? PELOS[4 + Math.floor(rnd(s, 2) * 2)] : PELOS[Math.floor(rnd(s, 2) * 4)];
  const bigotes: Rasgos["bigote"][] = ["fino", "ninguno", "fino", "cepillo", "ninguno"];
  const barbas: Rasgos["barba"][] = ["perilla", "ninguna", "perilla", "ninguna", "completa"];
  const sinPelo = mujer || nino || traje === "peluca" || traje === "japones";
  return {
    piel,
    pelo,
    edad,
    peinado: traje === "japones" ? "calvo" : mujer ? "ondulado" : edad === "mayor" && rnd(s, 4) > 0.6 ? "calvo" : (["raya", "corto", "ondulado"] as const)[Math.floor(rnd(s, 5) * 3)],
    bigote: sinPelo || traje === "moderno" ? "ninguno" : bigotes[Math.floor(rnd(s, 7) * bigotes.length)],
    barba: sinPelo || traje === "moderno" ? "ninguna" : barbas[Math.floor(rnd(s, 8) * barbas.length)],
    gafas: !nino && (traje === "burgues" || traje === "peluca" || traje === "moderno") && rnd(s, 9) > 0.85,
    sombrero: "ninguno",
    ...extra,
  };
};

/** Colores de la ropa por traje y semilla. */
const ropa = (traje: Traje, s: number) => {
  switch (traje) {
    case "burgues":
      return { cuerpo: NEGROS[Math.floor(rnd(s, 11) * NEGROS.length)], manga: NEGROS[Math.floor(rnd(s, 11) * NEGROS.length)], bajo: NEGROS[Math.floor(rnd(s, 12) * NEGROS.length)], media: rnd(s, 13) > 0.5 ? "#2A2A2A" : "#5A5048" };
    case "mujer":
      return { cuerpo: NEGROS[Math.floor(rnd(s, 11) * NEGROS.length)], manga: NEGROS[Math.floor(rnd(s, 11) * NEGROS.length)], bajo: ["#3A3530", "#5A3A34", "#2F3A40", "#4A4237"][Math.floor(rnd(s, 12) * 4)], media: "#2A2A2A" };
    case "marinero":
      return { cuerpo: ROPA_CLARA[Math.floor(rnd(s, 11) * 4)], manga: ROPA_CLARA[Math.floor(rnd(s, 11) * 4)], bajo: ["#5C6B66", "#4A4F52", "#6B5A48", "#3B3A44"][Math.floor(rnd(s, 12) * 4)], media: "#8A7E6A" };
    case "soldado":
      return { cuerpo: "#A07A4A", manga: "#8A6A40", bajo: "#4A3F35", media: "#3A3A3A" };
    case "peluca":
      return { cuerpo: CASACAS[Math.floor(rnd(s, 11) * CASACAS.length)], manga: CASACAS[Math.floor(rnd(s, 11) * CASACAS.length)], bajo: CASACAS[Math.floor(rnd(s, 12) * CASACAS.length)], media: "#E8E2D4" };
    case "banda":
    case "java":
    case "trabajador":
      return { cuerpo: traje === "java" ? "#3A3530" : ROPA_CLARA[Math.floor(rnd(s, 11) * 4)], manga: traje === "java" ? "#3A3530" : ROPA_CLARA[Math.floor(rnd(s, 11) * 4)], bajo: BATIK[Math.floor(rnd(s, 12) * BATIK.length)], media: "" };
    case "bandaMujer":
      return { cuerpo: ["#C9B48A", "#B86A4A", "#E2D5B6", "#6A7A5A"][Math.floor(rnd(s, 11) * 4)], manga: "#C9B48A", bajo: BATIK[Math.floor(rnd(s, 12) * BATIK.length)], media: "" };
    case "chino":
      return { cuerpo: ["#2F3A50", "#3A3A44", "#4A4F52", "#2C3532"][Math.floor(rnd(s, 11) * 4)], manga: "#2F3A50", bajo: "#2F3A50", media: "#E8E2D4" };
    case "japones":
      return { cuerpo: ["#4A4F52", "#3E4A5A", "#5A5048"][Math.floor(rnd(s, 11) * 3)], manga: "#3E4A5A", bajo: ["#5A5048", "#3A3A44", "#6B5A48"][Math.floor(rnd(s, 12) * 3)], media: "#F2EEE4" };
    case "moderno":
      return { cuerpo: ["#2F3A50", "#3A3A44", "#5A5048", "#A04A3A", "#4A5A4A"][Math.floor(rnd(s, 11) * 5)], manga: "#2F3A50", bajo: ["#2F3A50", "#3A3530", "#4A4F52"][Math.floor(rnd(s, 12) * 3)], media: "" };
    case "moderna":
      return { cuerpo: ["#C8402C", "#2F4A7A", "#E8B33C", "#3A3A44", "#5E8A5A"][Math.floor(rnd(s, 11) * 5)], manga: "#2F3A50", bajo: ["#2F3A50", "#3A3530", "#4A4F52"][Math.floor(rnd(s, 12) * 3)], media: "" };
  }
};

/* ------------------------------------------------------------------ */
/* Tocados y pelo, sobre la Cabeza (centro 0,0; coronilla en y -54)     */
/* ------------------------------------------------------------------ */

const PeloDetras: React.FC<{ traje: Traje; r: Rasgos; s: number }> = ({ traje, r, s }) => {
  const pelo = r.pelo ?? PELOS[0];
  if (traje === "peluca")
    return (
      <g fill={rnd(s, 15) > 0.5 ? "#E6E0D2" : "#C9BFAE"}>
        <path d="M -52 -30 Q -66 20 -58 70 Q -40 84 -30 60 L -30 -10 Z" />
        <path d="M 52 -30 Q 66 20 58 70 Q 40 84 30 60 L 30 -10 Z" />
        {[-58, -48, 48, 58].map((cx, i) => [0, 22, 44].map((cy) => <circle key={`${i}${cy}`} cx={cx} cy={cy} r={11} />))}
      </g>
    );
  if (traje === "burgues" && rnd(s, 16) > 0.45 && r.peinado !== "calvo")
    return <path d="M -38 -20 Q -48 30 -36 52 L -24 40 L -26 0 Z M 38 -20 Q 48 30 36 52 L 24 40 L 26 0 Z" fill={pelo} />;
  if (traje === "mujer" || traje === "bandaMujer" || traje === "moderna")
    return traje === "moderna" ? <path d="M -40 -20 Q -48 40 -34 60 L 34 60 Q 48 40 40 -20 Z" fill={pelo} /> : null;
  return null;
};

const Tocado: React.FC<{ traje: Traje; r: Rasgos; s: number; sombrero: boolean; cofia: boolean }> = ({ traje, r, s, sombrero, cofia }) => {
  const f = useCurrentFrame();
  if (traje === "burgues" || traje === "soldado") {
    if (!sombrero) return null;
    const alto = traje === "soldado" ? 34 : 46 + rnd(s, 17) * 14;
    return (
      <g>
        <path d={`M -30 -46 Q -30 ${-46 - alto} 0 ${-50 - alto} Q 30 ${-46 - alto} 30 -46 Z`} fill={"#17191B"} />
        <rect x={-30} y={-62} width={60} height={9} fill={traje === "soldado" ? C.naranja : "#2E3032"} />
        <ellipse cx={0} cy={-47} rx={traje === "soldado" ? 70 : 62} ry={10} fill={"#17191B"} />
        {traje === "soldado" ? <path d={`M 22 -64 Q 60 ${-110 + Math.sin(f * 0.1 + s) * 4} 80 -88 Q 50 -80 30 -60 Z`} fill={"#F2EEE4"} /> : null}
      </g>
    );
  }
  if (traje === "peluca") {
    const peluca = rnd(s, 15) > 0.5 ? "#E6E0D2" : "#C9BFAE";
    return (
      <g>
        <path d="M -40 -12 Q -46 -60 0 -62 Q 46 -60 40 -12 Q 34 -44 0 -48 Q -34 -44 -40 -12 Z" fill={peluca} />
        {[-34, -18, 0, 18, 34].map((cx) => (
          <circle key={cx} cx={cx} cy={-52 + Math.abs(cx) * 0.3} r={10} fill={peluca} />
        ))}
        {sombrero ? (
          <g>
            <path d="M -66 -52 Q 0 -40 66 -52 L 40 -96 Q 0 -80 -40 -96 Z" fill={"#17191B"} />
            <path d="M -66 -52 Q 0 -40 66 -52" stroke={C.laton} strokeWidth={3} fill="none" />
          </g>
        ) : null}
      </g>
    );
  }
  if (traje === "mujer") {
    if (!cofia) return null;
    return (
      <g>
        <path d="M -40 8 Q -46 -58 0 -60 Q 46 -58 40 8 L 32 4 Q 34 -40 0 -44 Q -34 -40 -32 4 Z" fill={"#F7F3EA"} />
        <path d="M -30 -40 Q 0 -52 30 -40" stroke={"#DCD4C2"} strokeWidth={2} fill="none" />
        <path d="M -40 8 L -32 4 L -28 12 Z M 40 8 L 32 4 L 28 12 Z" fill={"#E6DFD0"} />
      </g>
    );
  }
  if (traje === "marinero") {
    const lana = LANAS[Math.floor(rnd(s, 18) * LANAS.length)];
    return (
      <g>
        <path d="M -36 -26 Q -38 -70 0 -72 Q 38 -70 36 -26 Z" fill={lana} />
        <rect x={-38} y={-34} width={76} height={12} rx={5} fill={osc(lana, 0.8)} />
        {[-24, -8, 8, 24].map((x) => (
          <path key={x} d={`M ${x} -60 V -36`} stroke={osc(lana, 0.85)} strokeWidth={2} />
        ))}
      </g>
    );
  }
  if (traje === "banda" || traje === "java" || traje === "trabajador") {
    const tela = BATIK[Math.floor(rnd(s, 19) * BATIK.length)];
    if (traje === "trabajador" && rnd(s, 20) > 0.5) return null;
    return (
      <g>
        <path d="M -38 -18 Q -40 -62 0 -64 Q 40 -62 38 -18 Q 30 -30 0 -32 Q -30 -30 -38 -18 Z" fill={tela} />
        <path d="M -36 -30 Q 0 -46 36 -30" stroke={osc(tela, 1.35)} strokeWidth={3} fill="none" strokeDasharray="6 5" />
        {traje === "java" ? <path d="M 30 -40 L 48 -52 L 44 -30 Z" fill={osc(tela, 0.8)} /> : <path d="M -34 -40 L -50 -30 L -36 -24 Z" fill={osc(tela, 0.8)} />}
      </g>
    );
  }
  if (traje === "bandaMujer") {
    const pelo = r.pelo ?? PELOS[0];
    return (
      <g>
        <circle cx={0} cy={-58} r={18} fill={pelo} />
        <rect x={-14} y={-62} width={28} height={4} fill={C.ocre} />
      </g>
    );
  }
  if (traje === "chino")
    return (
      <g>
        <path d="M -34 -30 Q -34 -66 0 -68 Q 34 -66 34 -30 Z" fill={"#1E1E22"} />
        <rect x={-34} y={-36} width={68} height={8} fill={"#2E2E34"} />
        <rect x={-6} y={-76} width={12} height={10} rx={3} fill={"#1E1E22"} />
      </g>
    );
  if (traje === "japones") {
    const pelo = r.pelo ?? PELOS[0];
    return (
      <g>
        <path d="M -6 -50 Q 0 -56 6 -50 L 4 -36 L -4 -36 Z" fill={pelo} />
        <rect x={-5} y={-64} width={10} height={20} rx={4} fill={pelo} transform="rotate(-80 0 -50)" />
      </g>
    );
  }
  return null;
};

/** Cuello: gola de lechuguilla, valona plana, pañuelo, corbata... */
const Cuello: React.FC<{ traje: Traje; s: number }> = ({ traje, s }) => {
  if (traje === "burgues") {
    if (rnd(s, 21) > 0.45)
      return (
        <g>
          <ellipse cx={0} cy={-338} rx={50} ry={17} fill={"#F7F3EA"} />
          {Array.from({ length: 11 }).map((_, i) => (
            <path key={i} d={`M ${-44 + i * 8.8} -350 Q ${-40 + i * 8.8} -338 ${-44 + i * 8.8} -326`} stroke={"#D7CFBD"} strokeWidth={1.6} fill="none" />
          ))}
        </g>
      );
    return <path d="M -54 -338 Q 0 -350 54 -338 L 46 -300 Q 0 -290 -46 -300 Z" fill={"#F2EEE4"} />;
  }
  if (traje === "mujer") return <path d="M -66 -334 Q 0 -350 66 -334 L 58 -282 Q 0 -266 -58 -282 Z" fill={"#F7F3EA"} />;
  if (traje === "peluca")
    return (
      <g>
        <path d="M -12 -340 L 12 -340 L 8 -296 L 0 -290 L -8 -296 Z" fill={"#F2EEE4"} />
        <path d="M -8 -300 Q 0 -286 8 -300" stroke={"#DCD4C2"} strokeWidth={2} fill="none" />
      </g>
    );
  if (traje === "soldado") return <path d="M -40 -338 Q 0 -346 40 -338 L 34 -318 Q 0 -312 -34 -318 Z" fill={"#ECE6D8"} />;
  if (traje === "marinero") return <path d="M -16 -340 L 0 -306 L 16 -340" fill={"#C9A27E"} stroke={osc(ROPA_CLARA[0], 0.8)} strokeWidth={2} />;
  if (traje === "moderno") return <path d="M -14 -340 L 0 -320 L 14 -340 Z" fill={"#F2EEE4"} />;
  return null;
};

/* ------------------------------------------------------------------ */
/* Figura de frente                                                    */
/* ------------------------------------------------------------------ */

/**
 * Persona de frente con los pies en (x, y). A escala 1 mide unos 450 px.
 * `cuerpo: "busto"` la dibuja tras una mesa: el cuerpo sigue fuera de cuadro.
 */
export const Figura: React.FC<{
  x: number;
  y: number;
  escala?: number;
  traje?: Traje;
  semilla: number;
  rasgos?: Rasgos;
  pose?: PoseV;
  mirada?: number;
  gesto?: "neutro" | "inquieto" | "serio" | "sorpresa";
  habla?: boolean;
  cuerpo?: "entero" | "busto";
  nino?: boolean;
  capa?: boolean;
  sombrero?: boolean;
  cofia?: boolean;
  objeto?: "saco" | "cesta" | "libro" | "bolsa" | "pluma" | "mosquete" | "papel" | "ninguno";
  cansado?: boolean;
}> = ({
  x,
  y,
  escala = 1,
  traje = "burgues",
  semilla,
  rasgos,
  pose = "quieto",
  mirada = 0,
  gesto = "neutro",
  habla,
  cuerpo = "entero",
  nino,
  capa,
  sombrero,
  cofia = true,
  objeto,
  cansado,
}) => {
  const f = useCurrentFrame();
  const s = semilla;
  const r = rasgos ?? rasgosVoc(traje, s, nino);
  const c0 = ropa(traje, s);
  // un traje moderno puede pedir color de chaqueta (los politicos, de oscuro)
  const c = (traje === "moderno" || traje === "moderna") && r.abrigo ? { ...c0, cuerpo: r.abrigo, manga: r.abrigo } : c0;
  const piel = r.piel ?? PIELES[0];
  const conSombrero = sombrero ?? (traje === "soldado" || (traje === "burgues" && rnd(s, 22) > 0.35) || (traje === "peluca" && rnd(s, 23) > 0.6));
  const conCapa = capa ?? (traje === "burgues" && rnd(s, 24) > 0.6);
  const respira = Math.sin(f * 0.07 + s) * 1.2;
  const caida = cansado ? 10 : 0;
  const hablaAhora = habla ?? pose === "habla";
  const g = pose === "habla" ? Math.sin(f * 0.18 + s) * 14 - 24 : 0;
  let bI = 6,
    aI = 0,
    bD = -6,
    aD = 0;
  if (pose === "habla") {
    bD = 10;
    aD = 40 - g;
  }
  if (pose === "senala") {
    bD = -112;
    aD = -6;
  }
  if (pose === "lee") {
    bI = -24;
    aI = -78;
    bD = 24;
    aD = 78;
  }
  if (pose === "escribe") {
    bD = 20;
    aD = 66 + Math.sin(f * 0.5) * 6;
    bI = -16;
    aI = -60;
  }
  if (pose === "brazos") {
    bI = -16;
    aI = -100;
    bD = 16;
    aD = 100;
  }
  if (pose === "carga") {
    bI = 150;
    aI = 40;
    bD = -150;
    aD = -40;
  }
  if (pose === "ofrece") {
    bD = 30;
    aD = 70 + Math.sin(f * 0.05 + s) * 4;
  }
  if (pose === "manos") {
    bI = -14;
    aI = -50;
    bD = 14;
    aD = 50;
  }
  if (pose === "cuenta") {
    bI = -20;
    aI = -60;
    bD = 22;
    aD = 62 + Math.sin(f * 0.35 + s) * 8;
  }
  if (cansado && pose === "quieto") {
    bI = 2;
    bD = -2;
  }
  const mangaLarga = traje === "chino" || traje === "japones";
  const brazoCorto = traje === "trabajador" || traje === "banda";
  const puno = traje === "burgues" || traje === "mujer" ? "#F2EEE4" : traje === "peluca" ? osc(c.cuerpo, 0.8) : null;
  const brazo = (lado: 1 | -1, ang: number, ante: number) => (
    <g transform={`translate(${lado * -58} -318) rotate(${ang})`}>
      <rect x={mangaLarga ? -18 : -13} y={-4} width={mangaLarga ? 36 : 26} height={84} rx={12} fill={c.manga} />
      <g transform={`translate(0 76) rotate(${ante})`}>
        <rect x={-12} y={-6} width={24} height={78} rx={11} fill={brazoCorto ? piel : c.manga} />
        {mangaLarga ? <path d="M -20 -6 L 20 -6 L 22 60 L -22 60 Z" fill={c.manga} /> : null}
        {puno ? <rect x={-14} y={60} width={28} height={traje === "peluca" ? 14 : 9} fill={puno} /> : null}
        <ellipse cx={0} cy={80} rx={11} ry={13} fill={piel} />
      </g>
    </g>
  );

  const asia = traje === "banda" || traje === "java" || traje === "trabajador" || traje === "bandaMujer";
  const falda = traje === "mujer" || traje === "bandaMujer" || traje === "chino" || traje === "moderna";

  const piernas = () => {
    if (traje === "mujer")
      return (
        <g>
          <ellipse cx={0} cy={0} rx={80} ry={10} fill={"#000"} opacity={0.18} />
          <path d="M -58 -214 L 58 -214 L 84 -10 Q 0 4 -84 -10 Z" fill={c.bajo} />
          <path d="M 20 -214 L 58 -214 L 84 -10 Q 50 -4 40 -6 Z" fill={osc(c.bajo, 0.85)} />
          {rnd(s, 25) > 0.4 ? <path d="M -40 -214 L 40 -214 L 50 -40 L -50 -40 Z" fill={"#ECE6D8"} /> : null}
          <ellipse cx={-22} cy={-4} rx={18} ry={7} fill={"#141618"} />
          <ellipse cx={22} cy={-4} rx={18} ry={7} fill={"#141618"} />
        </g>
      );
    if (traje === "bandaMujer" || traje === "moderna")
      return (
        <g>
          <ellipse cx={0} cy={0} rx={70} ry={10} fill={"#000"} opacity={0.18} />
          <path d="M -50 -214 L 50 -214 L 56 -14 L -56 -14 Z" fill={c.bajo} />
          {traje === "bandaMujer"
            ? [0, 1, 2, 3, 4].map((k) => <path key={k} d={`M -52 ${-190 + k * 38} H 52`} stroke={osc(c.bajo, 1.4)} strokeWidth={4} strokeDasharray="8 6" />)
            : null}
          <ellipse cx={-20} cy={-6} rx={16} ry={7} fill={traje === "moderna" ? "#2A2A2A" : piel} />
          <ellipse cx={20} cy={-6} rx={16} ry={7} fill={traje === "moderna" ? "#2A2A2A" : piel} />
        </g>
      );
    if (traje === "chino")
      return (
        <g>
          <ellipse cx={0} cy={0} rx={70} ry={10} fill={"#000"} opacity={0.18} />
          <path d="M -60 -230 L 60 -230 L 62 -22 L -62 -22 Z" fill={c.bajo} />
          <path d="M 0 -230 L 2 -22" stroke={osc(c.bajo, 0.8)} strokeWidth={4} />
          <rect x={-40} y={-24} width={30} height={16} fill={"#ECE6D8"} />
          <rect x={10} y={-24} width={30} height={16} fill={"#ECE6D8"} />
          <ellipse cx={-24} cy={-6} rx={22} ry={8} fill={"#1E1E22"} />
          <ellipse cx={24} cy={-6} rx={22} ry={8} fill={"#1E1E22"} />
        </g>
      );
    if (traje === "japones")
      return (
        <g>
          <ellipse cx={0} cy={0} rx={74} ry={10} fill={"#000"} opacity={0.18} />
          <path d="M -54 -210 L 54 -210 L 72 -14 L -72 -14 Z" fill={c.bajo} />
          {[-40, -14, 14, 40].map((px) => (
            <path key={px} d={`M ${px * 0.8} -200 L ${px * 1.3} -16`} stroke={osc(c.bajo, 0.78)} strokeWidth={3} />
          ))}
          <ellipse cx={-22} cy={-6} rx={18} ry={7} fill={c.media} />
          <ellipse cx={22} cy={-6} rx={18} ry={7} fill={c.media} />
        </g>
      );
    if (asia)
      return (
        <g>
          <ellipse cx={0} cy={0} rx={66} ry={10} fill={"#000"} opacity={0.18} />
          <path d={`M -48 -210 L 48 -210 L 52 ${traje === "trabajador" ? -80 : -30} L -52 ${traje === "trabajador" ? -80 : -30} Z`} fill={c.bajo} />
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M -50 ${-186 + k * 40} H 50`} stroke={osc(c.bajo, 1.45)} strokeWidth={4} strokeDasharray={k % 2 ? "4 8" : "12 6"} />
          ))}
          <rect x={-34} y={traje === "trabajador" ? -82 : -32} width={22} height={traje === "trabajador" ? 74 : 24} fill={piel} />
          <rect x={12} y={traje === "trabajador" ? -82 : -32} width={22} height={traje === "trabajador" ? 74 : 24} fill={piel} />
          <ellipse cx={-24} cy={-6} rx={18} ry={7} fill={osc(piel, 0.85)} />
          <ellipse cx={24} cy={-6} rx={18} ry={7} fill={osc(piel, 0.85)} />
        </g>
      );
    if (traje === "moderno")
      return (
        <g>
          <ellipse cx={0} cy={0} rx={70} ry={10} fill={"#000"} opacity={0.18} />
          <rect x={-34} y={-200} width={29} height={192} fill={c.bajo} />
          <rect x={5} y={-200} width={29} height={192} fill={c.bajo} />
          <ellipse cx={-24} cy={-6} rx={24} ry={10} fill={rnd(s, 26) > 0.5 ? "#EDEAE2" : "#2A2A2A"} />
          <ellipse cx={24} cy={-6} rx={24} ry={10} fill={rnd(s, 26) > 0.5 ? "#EDEAE2" : "#2A2A2A"} />
        </g>
      );
    // calzas hasta la rodilla y medias
    const ancho = traje === "marinero" ? 46 : 40;
    const rod = traje === "marinero" ? -86 : -112;
    return (
      <g>
        <ellipse cx={0} cy={0} rx={70} ry={10} fill={"#000"} opacity={0.18} />
        <rect x={-30} y={rod} width={22} height={-rod - 6} fill={traje === "marinero" ? piel : c.media} />
        <rect x={8} y={rod} width={22} height={-rod - 6} fill={traje === "marinero" ? piel : c.media} />
        <path d={`M -6 -214 L ${-ancho} -214 Q ${-ancho - 6} ${rod + 30} ${-34} ${rod} L -4 ${rod} Z`} fill={c.bajo} />
        <path d={`M 6 -214 L ${ancho} -214 Q ${ancho + 6} ${rod + 30} ${34} ${rod} L 4 ${rod} Z`} fill={osc(c.bajo, 0.9)} />
        {traje !== "marinero" ? (
          <g fill={traje === "soldado" ? C.naranja : "#3A3530"}>
            <rect x={-34} y={rod - 4} width={30} height={7} />
            <rect x={4} y={rod - 4} width={30} height={7} />
          </g>
        ) : null}
        <ellipse cx={-22} cy={-6} rx={22} ry={9} fill={"#141618"} />
        <ellipse cx={22} cy={-6} rx={22} ry={9} fill={"#141618"} />
        {traje === "burgues" || traje === "peluca" ? (
          <g fill={traje === "peluca" ? C.laton : "#3A3530"}>
            <circle cx={-20} cy={-12} r={6} />
            <circle cx={20} cy={-12} r={6} />
          </g>
        ) : null}
      </g>
    );
  };

  const torso = (
    <g transform={`translate(0 ${respira * 0.4 + caida * 0.3})`}>
      {conCapa ? <path d="M -70 -330 Q 0 -350 70 -330 L 84 -160 L -84 -160 Z" fill={osc(c.cuerpo, 0.85)} /> : null}
      {traje === "peluca" ? (
        <g>
          <path d="M -62 -324 Q 0 -340 62 -324 L 70 -120 L 8 -120 L 0 -260 L -8 -120 L -70 -120 Z" fill={c.cuerpo} />
          <path d="M -24 -326 L 24 -326 L 20 -170 L -20 -170 Z" fill={osc(c.cuerpo, 1.25)} />
          {[-300, -270, -240, -210, -180].map((by) => (
            <circle key={by} cx={0} cy={by} r={3} fill={C.laton} />
          ))}
          <rect x={-60} y={-200} width={36} height={8} fill={osc(c.cuerpo, 0.75)} />
          <rect x={24} y={-200} width={36} height={8} fill={osc(c.cuerpo, 0.75)} />
        </g>
      ) : traje === "japones" ? (
        <g>
          <path d="M -60 -326 Q 0 -340 60 -326 L 56 -200 L -56 -200 Z" fill={c.cuerpo} />
          <path d="M -20 -334 L 0 -270 L 20 -334" fill="none" stroke={"#F2EEE4"} strokeWidth={8} />
          <path d="M -96 -330 L -30 -334 L -40 -270 Z M 96 -330 L 30 -334 L 40 -270 Z" fill={c.bajo} />
          <rect x={-56} y={-222} width={112} height={18} fill={osc(c.bajo, 0.8)} />
        </g>
      ) : traje === "chino" ? (
        <g>
          <path d="M -60 -326 Q 0 -340 60 -326 L 62 -220 L -62 -220 Z" fill={c.cuerpo} />
          <path d="M -10 -336 Q 30 -300 50 -300" stroke={osc(c.cuerpo, 0.7)} strokeWidth={4} fill="none" />
          <rect x={-60} y={-232} width={120} height={10} fill={"#1E1E22"} />
        </g>
      ) : traje === "bandaMujer" || traje === "moderna" ? (
        <g>
          <path d="M -54 -326 Q 0 -340 54 -326 L 52 -206 L -52 -206 Z" fill={c.cuerpo} />
          <path d="M -16 -336 L 0 -296 L 16 -336" fill={piel} />
        </g>
      ) : traje === "mujer" ? (
        <g>
          <path d="M -56 -326 Q 0 -340 56 -326 L 44 -210 L -44 -210 Z" fill={c.cuerpo} />
          <path d="M -18 -280 L 18 -280 L 0 -214 Z" fill={osc(c.cuerpo, 1.3)} />
        </g>
      ) : (
        <g>
          <path d="M -62 -322 Q 0 -340 62 -322 L 58 -230 Q 54 -214 46 -200 L -46 -200 Q -54 -214 -58 -230 Z" fill={c.cuerpo} />
          {traje === "burgues"
            ? [-300, -284, -268, -252, -236, -220].map((by) => <circle key={by} cx={0} cy={by} r={2.4} fill={osc(c.cuerpo, 1.8)} />)
            : null}
          {traje === "burgues" ? <path d="M -60 -214 L 60 -214 L 66 -190 L -66 -190 Z" fill={osc(c.cuerpo, 0.85)} /> : null}
          {traje === "soldado" ? (
            <g>
              <path d="M -62 -320 L 52 -214 L 62 -230 L -48 -330 Z" fill={C.naranja} />
              <path d="M 58 -320 L -50 -214 L -60 -226 L 46 -328 Z" fill={"#4A3020"} />
              {[0, 1, 2, 3].map((k) => (
                <rect key={k} x={30 - k * 26} y={-296 + k * 24} width={10} height={16} fill={"#C9BFAE"} />
              ))}
            </g>
          ) : null}
          {traje === "marinero" ? (
            rnd(s, 27) > 0.5 ? (
              <path d="M -60 -322 L -26 -326 L -22 -206 L -48 -204 Z M 60 -322 L 26 -326 L 22 -206 L 48 -204 Z" fill={["#5C6B66", "#4A4F52", "#6A3A34"][Math.floor(rnd(s, 28) * 3)]} />
            ) : (
              <rect x={-58} y={-216} width={116} height={12} fill={"#5A4A3A"} />
            )
          ) : null}
          {traje === "java" ? <path d="M -58 -232 L 58 -232 L 58 -206 L -58 -206 Z" fill={BATIK[Math.floor(rnd(s, 29) * BATIK.length)]} /> : null}
          {traje === "moderno" ? <path d="M -26 -330 L -10 -330 L -2 -270 L -20 -300 Z M 26 -330 L 10 -330 L 2 -270 L 20 -300 Z" fill={osc(c.cuerpo, 0.75)} /> : null}
        </g>
      )}
      <rect x={-12} y={-352} width={24} height={22} fill={osc(piel, 0.9)} />
      <Cuello traje={traje} s={s} />
    </g>
  );

  const objetoMano = (() => {
    if (!objeto || objeto === "ninguno") return null;
    if (objeto === "saco")
      return (
        <g transform={`translate(0 ${-470 + respira})`}>
          <ellipse cx={0} cy={0} rx={78} ry={40} fill={"#D3C29A"} />
          <path d="M -60 -10 Q 0 -30 60 -10" stroke={"#B5A27A"} strokeWidth={3} fill="none" />
          <path d="M 64 -12 L 86 -24 L 82 2 Z" fill={"#C2AF86"} />
        </g>
      );
    if (objeto === "cesta")
      return (
        <g transform={`translate(0 ${-480 + respira})`}>
          <path d="M -70 -10 L 70 -10 L 54 34 L -54 34 Z" fill={"#B08A54"} />
          {[-50, -25, 0, 25, 50].map((cx) => (
            <path key={cx} d={`M ${cx} -10 L ${cx * 0.8} 34`} stroke={"#8A6A3A"} strokeWidth={3} />
          ))}
          {[-40, -15, 10, 35].map((cx, i) => (
            <circle key={cx} cx={cx} cy={-16 - (i % 2) * 6} r={12} fill={i % 2 ? C.macis : C.nuez} />
          ))}
        </g>
      );
    if (objeto === "libro")
      return (
        <g transform="translate(0 -262) rotate(-3)">
          <rect x={-74} y={-50} width={148} height={100} fill={"#EDE4CC"} />
          <rect x={-78} y={-54} width={8} height={108} fill={"#5A3A24"} />
          <rect x={70} y={-54} width={8} height={108} fill={"#5A3A24"} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={-64} y={-36 + i * 13} width={i % 3 === 2 ? 50 : 56} height={4} fill={"#9A8A6A"} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={8} y={-36 + i * 13} width={i % 2 ? 40 : 56} height={4} fill={"#9A8A6A"} />
          ))}
        </g>
      );
    if (objeto === "papel")
      return (
        <g transform="translate(0 -262) rotate(4)">
          <rect x={-54} y={-64} width={108} height={128} fill={"#F2E8CC"} />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={-44} y={-50 + i * 14} width={i === 6 ? 50 : 88} height={4} fill={"#6A5A44"} opacity={0.7} />
          ))}
          <circle cx={30} cy={44} r={10} fill={C.carmin} />
        </g>
      );
    if (objeto === "mosquete") return <rect x={-74} y={-560} width={8} height={500} fill={"#3A2A1E"} transform="rotate(4 -70 -300)" />;
    return null;
  })();

  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <g transform="scale(1 1)">
        {cuerpo === "busto" ? (
          <g>
            <rect x={-64} y={-200} width={128} height={900} fill={falda ? c.cuerpo : c.bajo} />
            <rect x={-64} y={-200} width={128} height={60} fill={c.cuerpo} />
          </g>
        ) : (
          piernas()
        )}
        {objeto === "mosquete" ? objetoMano : null}
        {brazo(1, bI, aI)}
        {torso}
        {brazo(-1, bD, aD)}
        {objeto && objeto !== "mosquete" ? objetoMano : null}
        <g transform={`translate(0 ${-396 + respira + caida}) rotate(${cansado ? 6 : 0})`}>
          <PeloDetras traje={traje} r={r} s={s} />
          <Cabeza r={r} semilla={s} mirada={mirada} habla={hablaAhora} gesto={gesto} sinSombrero />
          <Tocado traje={traje} r={r} s={s} sombrero={conSombrero} cofia={cofia} />
        </g>
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Paseante de perfil                                                  */
/* ------------------------------------------------------------------ */

/**
 * Gente que cruza, de perfil. `x0` es la posicion en el fotograma 0 y `v` px
 * por fotograma (negativo: hacia la izquierda). Con v = 0 esta de pie.
 */
export const Paseante: React.FC<{
  x0: number;
  y: number;
  v: number;
  escala?: number;
  traje?: Traje;
  semilla: number;
  carga?: "saco" | "cesta" | "barril" | "ninguna";
  cansado?: boolean;
}> = ({ x0, y, v, escala = 1, traje = "burgues", semilla, carga = "ninguna", cansado }) => {
  const f = useCurrentFrame();
  const s = semilla;
  const r = rasgosVoc(traje, s);
  const c = ropa(traje, s);
  const piel = r.piel ?? PIELES[0];
  const pelo = r.pelo ?? PELOS[0];
  const fase = rnd(s, 9) * 6.28;
  const anda = v !== 0;
  const vel = cansado ? 0.18 : 0.3;
  const paso = anda ? Math.sin(f * vel * Math.min(1.6, Math.abs(v) / 1.6 + 0.4) + fase) : 0;
  const bote = anda ? Math.abs(Math.cos(f * vel + fase)) * 3 : 0;
  const px = x0 + v * f;
  const dir = v < 0 ? -1 : 1;
  const falda = traje === "mujer" || traje === "bandaMujer" || traje === "chino" || traje === "japones";
  const asia = traje === "banda" || traje === "java" || traje === "trabajador";
  const pierna = (ang: number, color: string) => (
    <g transform={`rotate(${ang} 0 -200)`}>
      {traje === "burgues" || traje === "peluca" || traje === "soldado" ? (
        <g>
          <rect x={-11} y={-110} width={22} height={104} fill={traje === "peluca" ? "#E8E2D4" : "#2A2A2A"} />
          <path d="M -18 -204 L 18 -204 Q 22 -150 14 -110 L -14 -110 Q -22 -150 -18 -204 Z" fill={color} />
        </g>
      ) : traje === "marinero" ? (
        <g>
          <rect x={-10} y={-90} width={20} height={84} fill={piel} />
          <path d="M -20 -204 L 20 -204 Q 26 -140 16 -88 L -16 -88 Q -24 -140 -20 -204 Z" fill={color} />
        </g>
      ) : asia ? (
        <rect x={-10} y={-204} width={20} height={198} fill={piel} />
      ) : (
        <rect x={-11} y={-204} width={22} height={198} rx={6} fill={color} />
      )}
      <path d="M -12 -10 L 22 -10 Q 30 -2 22 2 L -12 2 Z" fill={asia ? osc(piel, 0.85) : "#141618"} />
    </g>
  );
  const inclina = cansado ? 8 : carga === "saco" ? 6 : 0;
  return (
    <g transform={`translate(${px} ${y - bote}) scale(${escala * dir} ${escala})`}>
      <ellipse cx={0} cy={2} rx={44} ry={7} fill={"#000"} opacity={0.16} />
      {falda ? (
        <g>
          <path d={`M -38 -214 L 38 -214 L ${52 + paso * 6} -6 L ${-50 + paso * 6} -6 Z`} fill={c.bajo} />
          {traje === "mujer" && rnd(s, 25) > 0.4 ? <path d={`M 20 -214 L 40 -214 L ${54 + paso * 6} -30 L 34 -30 Z`} fill={"#ECE6D8"} /> : null}
          <path d="M 4 -8 L 30 -8 Q 36 -2 30 2 L 4 2 Z" fill={"#141618"} />
        </g>
      ) : (
        <g>
          {pierna(-paso * 22, osc(c.bajo, 0.85))}
          {asia ? <path d={`M -30 -214 L 30 -214 L ${34} ${traje === "trabajador" ? -110 : -40} L -34 ${traje === "trabajador" ? -110 : -40} Z`} fill={c.bajo} /> : null}
          {pierna(paso * 22, c.bajo)}
        </g>
      )}
      <g transform={`rotate(${inclina} 0 -210)`}>
        {/* brazo de atras */}
        <g transform={`rotate(${carga === "saco" ? -150 : paso * 20} 0 -318)`}>
          <rect x={-11} y={-322} width={22} height={140} rx={10} fill={osc(c.manga, 0.8)} />
        </g>
        {/* cuerpo de perfil */}
        <path d={`M -30 -334 Q 4 -346 30 -330 L 32 -240 Q 30 -214 ${traje === "peluca" ? 40 : 30} ${traje === "peluca" ? -130 : -200} L -28 ${traje === "peluca" ? -130 : -200} Q -34 -260 -30 -334 Z`} fill={c.cuerpo} />
        {traje === "burgues" ? <ellipse cx={8} cy={-340} rx={30} ry={12} fill={"#F7F3EA"} /> : null}
        {traje === "mujer" ? <path d="M -30 -340 Q 8 -350 40 -336 L 36 -300 Q 0 -294 -32 -304 Z" fill={"#F7F3EA"} /> : null}
        {traje === "soldado" ? <path d="M -28 -330 L 30 -220" stroke={C.naranja} strokeWidth={14} /> : null}
        {/* carga */}
        {carga === "saco" ? (
          <g transform="translate(-34 -352)">
            <ellipse cx={0} cy={0} rx={62} ry={34} fill={"#D3C29A"} />
            <path d="M -50 -8 Q 0 -26 50 -8" stroke={"#B5A27A"} strokeWidth={3} fill="none" />
          </g>
        ) : null}
        {carga === "barril" ? (
          <g transform="translate(40 -250)">
            <rect x={-30} y={-40} width={60} height={80} rx={12} fill={"#7A5A3C"} />
            <rect x={-30} y={-26} width={60} height={6} fill={"#3A2E24"} />
            <rect x={-30} y={20} width={60} height={6} fill={"#3A2E24"} />
          </g>
        ) : null}
        {/* brazo de delante */}
        <g transform={`rotate(${carga === "saco" ? -160 : carga === "barril" ? -40 : carga === "cesta" ? -10 : -paso * 20} 0 -318)`}>
          <rect x={-12} y={-324} width={24} height={140} rx={11} fill={asia ? piel : c.manga} />
          <ellipse cx={0} cy={-178} rx={11} ry={12} fill={piel} />
          {carga === "cesta" ? (
            <g transform="translate(0 -160)">
              <path d="M -40 -6 L 40 -6 L 30 30 L -30 30 Z" fill={"#B08A54"} />
              <circle cx={-14} cy={-10} r={9} fill={C.nuez} />
              <circle cx={10} cy={-12} r={9} fill={C.macis} />
            </g>
          ) : null}
        </g>
        {/* cabeza de perfil */}
        <g transform={`translate(4 -386) rotate(${cansado ? 10 : 0})`}>
          {traje === "peluca" ? <path d="M -40 -30 Q -50 30 -30 50 L 0 40 L 0 -40 Z" fill={"#E6E0D2"} /> : null}
          <rect x={-8} y={20} width={18} height={26} fill={osc(piel, 0.88)} />
          <path d="M -28 -16 Q -30 -44 0 -46 Q 26 -44 28 -18 L 30 -6 L 40 6 L 30 10 L 30 20 Q 26 36 6 38 Q -20 36 -26 18 Z" fill={piel} />
          {traje !== "japones" ? <path d="M -30 -10 Q -34 -46 0 -50 Q 24 -48 28 -26 Q 10 -34 -6 -30 Q -16 -24 -18 -8 Z" fill={traje === "peluca" ? "#E6E0D2" : pelo} /> : <path d="M -30 -10 Q -34 -30 -20 -30 L -18 -8 Z" fill={pelo} />}
          {traje === "burgues" && rnd(s, 16) > 0.45 ? <path d="M -30 -10 Q -36 20 -24 34 L -14 24 L -18 -8 Z" fill={pelo} /> : null}
          <ellipse cx={-6} cy={0} rx={6} ry={9} fill={osc(piel, 0.82)} />
          <circle cx={18} cy={-8} r={2.8} fill={"#2A2420"} />
          <rect x={12} y={-18} width={14} height={3.5} rx={1.5} fill={pelo} />
          {r.bigote && r.bigote !== "ninguno" ? <path d="M 22 14 Q 32 10 38 18 Q 30 20 22 18 Z" fill={pelo} /> : null}
          {r.barba === "perilla" ? <path d="M 18 30 Q 26 44 32 30 Z" fill={pelo} /> : null}
          {r.barba === "completa" ? <path d="M -16 14 Q -8 40 14 38 Q 30 30 30 18 Q 18 26 4 24 Z" fill={pelo} /> : null}
          <path d="M 22 26 L 32 25" stroke={"#7A3E33"} strokeWidth={2} />
          {traje === "burgues" && rnd(s, 22) > 0.35 ? (
            <g>
              <path d="M -24 -44 Q -24 -96 2 -98 Q 26 -96 26 -44 Z" fill={"#17191B"} />
              <ellipse cx={0} cy={-45} rx={58} ry={8} fill={"#17191B"} />
            </g>
          ) : null}
          {traje === "soldado" ? (
            <g>
              <path d="M -24 -44 Q -24 -84 2 -86 Q 26 -84 26 -44 Z" fill={"#17191B"} />
              <ellipse cx={0} cy={-45} rx={62} ry={8} fill={"#17191B"} />
              <path d="M -10 -80 Q -50 -110 -60 -80 Q -40 -80 -20 -70 Z" fill={"#F2EEE4"} />
            </g>
          ) : null}
          {traje === "mujer" ? <path d="M -34 10 Q -40 -54 0 -56 Q 30 -54 30 -30 L 18 -34 Q 0 -44 -20 -30 Q -28 -10 -24 10 Z" fill={"#F7F3EA"} /> : null}
          {traje === "marinero" ? <path d="M -30 -24 Q -30 -64 4 -64 Q 30 -60 28 -26 Z" fill={LANAS[Math.floor(rnd(s, 18) * LANAS.length)]} /> : null}
          {traje === "peluca" && rnd(s, 23) > 0.5 ? <path d="M -50 -46 Q 0 -36 50 -46 L 24 -84 Q 0 -70 -24 -84 Z" fill={"#17191B"} /> : null}
          {asia ? <path d="M -32 -18 Q -34 -58 0 -58 Q 30 -56 28 -24 Q 0 -34 -32 -18 Z" fill={BATIK[Math.floor(rnd(s, 19) * BATIK.length)]} /> : null}
          {traje === "chino" ? <path d="M -28 -26 Q -28 -62 0 -62 Q 28 -60 28 -28 Z" fill={"#1E1E22"} /> : null}
          {traje === "japones" ? <rect x={-14} y={-60} width={10} height={22} rx={4} fill={pelo} transform="rotate(-70 -10 -50)" /> : null}
        </g>
      </g>
    </g>
  );
};
