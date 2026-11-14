import React from "react";
import { useCurrentFrame } from "remotion";
import { Cabeza, PIELES, PELOS, TELAS, type Rasgos } from "../../piloto/Personajes";
import { W, oscurecer, rr } from "./base";

/**
 * Gente de los anos veinte para el video de Weimar, con las mismas caras que
 * el resto del canal (la `Cabeza` del piloto) y vestuario propio: trajes con
 * sombrero flexible, obreros con gorra, mujeres con abrigo y cloche o
 * panuelo, ninos, soldados franceses con casco Adrian, mineros, panaderos,
 * oficinistas en mangas de camisa y policias con chaco.
 */

export type Ropa = "traje" | "obrero" | "mujer" | "nino" | "nina" | "soldado" | "minero" | "panadero" | "oficinista" | "policia" | "abrigo";
export type Tocado = "bombin" | "flexible" | "gorra" | "cloche" | "adrian" | "panuelo" | "chaco" | "gorro" | "chistera" | "ninguno";
export type PoseW = "quieto" | "habla" | "senala" | "lee" | "brazos" | "cuenta" | "carga" | "mesa" | "escribe" | "lampara" | "fusil" | "puno";

const ABRIGOS_MUJER = ["#6B2E2A", "#2F4A3F", "#5A4636", "#3E4458", "#7A5C3A", "#4A3A48", "#8A6A4A", "#5C5F52"];
const FIELTROS = ["#3A3530", "#4A4237", "#2A2E30", "#5A4E40", "#6A6458", "#3B3A44"];
const CLOCHES = ["#6B2E2A", "#2F3A40", "#7A5C3A", "#4A3A48", "#3A3530", "#8A6A4A", "#2F4A3F"];
const OBRERO = ["#3C4248", "#4B4238", "#3E463E", "#504A42", "#2F3640", "#5A5048"];

export type Look = {
  ropa: Ropa;
  tocado: Tocado;
  rasgos: Rasgos;
  tela: string;
  tela2: string;
  sombrero: string;
  mujer: boolean;
  nino: boolean;
};

/** Vestuario y cara a partir de la semilla. */
export const lookDe = (semilla: number, ropa: Ropa = "traje", extra: Partial<Rasgos> = {}, tocado?: Tocado): Look => {
  const s = semilla;
  const mujer = ropa === "mujer" || ropa === "nina";
  const nino = ropa === "nino" || ropa === "nina";
  const edadR = rr(s, 1);
  const edad: Rasgos["edad"] = nino ? "joven" : edadR < 0.32 ? "joven" : edadR < 0.74 ? "maduro" : "mayor";
  const pelo = edad === "mayor" ? PELOS[4 + Math.floor(rr(s, 2) * 2)] : PELOS[Math.floor(rr(s, 2) * 4)];
  const bigotes: Rasgos["bigote"][] = ["cepillo", "fino", "ninguno", "morsa", "ninguno", "cepillo"];
  const barbas: Rasgos["barba"][] = ["ninguna", "ninguna", "ninguna", "ninguna", "perilla", "completa"];
  const peinados: Rasgos["peinado"][] = ["raya", "corto", "corto", "ondulado"];
  const rasgos: Rasgos = {
    piel: PIELES[Math.floor(rr(s, 3) * 4)],
    pelo,
    peinado: mujer ? "corto" : edad === "mayor" && rr(s, 4) > 0.5 ? "calvo" : peinados[Math.floor(rr(s, 5) * peinados.length)],
    bigote: mujer || nino ? "ninguno" : edad === "joven" && rr(s, 6) > 0.4 ? "ninguno" : bigotes[Math.floor(rr(s, 7) * bigotes.length)],
    barba: mujer || nino || ropa === "soldado" ? "ninguna" : barbas[Math.floor(rr(s, 8) * barbas.length)],
    edad,
    gafas: !nino && rr(s, 9) > 0.8,
    sombrero: "ninguno",
    corbata: ["#5B1F1C", "#1F2B3C", "#2A2A2A", "#3D4A2E", "#6A4A2A"][Math.floor(rr(s, 14) * 5)],
    ...extra,
  };
  let toc: Tocado = tocado ?? "ninguno";
  if (!tocado) {
    if (ropa === "traje") toc = (["flexible", "bombin", "flexible", "gorra", "flexible", "ninguno"] as Tocado[])[Math.floor(rr(s, 10) * 6)];
    else if (ropa === "abrigo") toc = (["flexible", "bombin", "flexible", "chistera"] as Tocado[])[Math.floor(rr(s, 10) * 4)];
    else if (ropa === "obrero" || ropa === "minero" || ropa === "nino") toc = "gorra";
    else if (ropa === "mujer") toc = (["cloche", "cloche", "panuelo", "cloche", "ninguno"] as Tocado[])[Math.floor(rr(s, 10) * 5)];
    else if (ropa === "nina") toc = rr(s, 10) > 0.5 ? "panuelo" : "ninguno";
    else if (ropa === "soldado") toc = "adrian";
    else if (ropa === "panadero") toc = "gorro";
    else if (ropa === "policia") toc = "chaco";
    else toc = "ninguno";
  }
  const tela =
    ropa === "soldado"
      ? W.azulHorizonte
      : ropa === "policia"
      ? "#2E3B47"
      : ropa === "panadero"
      ? "#EDE8DC"
      : mujer
      ? ABRIGOS_MUJER[Math.floor(rr(s, 11) * ABRIGOS_MUJER.length)]
      : ropa === "obrero" || ropa === "minero" || ropa === "nino"
      ? OBRERO[Math.floor(rr(s, 11) * OBRERO.length)]
      : TELAS[Math.floor(rr(s, 11) * TELAS.length)];
  const tela2 = ropa === "soldado" ? W.azulHorizonteOsc : oscurecer(TELAS[Math.floor(rr(s, 13) * TELAS.length)], 0.85);
  const sombrero = toc === "cloche" ? CLOCHES[Math.floor(rr(s, 15) * CLOCHES.length)] : toc === "panuelo" ? ["#8A3A30", "#4A5A6A", "#7A6A3A", "#5A4A5A"][Math.floor(rr(s, 15) * 4)] : FIELTROS[Math.floor(rr(s, 15) * FIELTROS.length)];
  return { ropa, tocado: toc, rasgos, tela, tela2, sombrero, mujer, nino };
};

/* ------------------------------------------------------------------ */
/* Tocados y pelo de mujer, de frente (coordenadas de la Cabeza)        */
/* ------------------------------------------------------------------ */

const PeloMujer: React.FC<{ color: string; atras?: boolean }> = ({ color, atras }) =>
  atras ? (
    <path d="M -42 -20 Q -46 -58 0 -60 Q 46 -58 42 -20 L 40 24 Q 30 30 26 20 L -26 20 Q -30 30 -40 24 Z" fill={color} />
  ) : (
    <g fill={color}>
      <path d="M -36 -20 Q -38 -54 0 -56 Q 38 -54 36 -20 Q 26 -40 6 -40 Q -4 -32 -20 -34 Q -32 -30 -36 -20 Z" />
      <path d="M -40 -26 Q -44 4 -38 22 L -28 20 Q -32 0 -31 -26 Z" />
      <path d="M 40 -26 Q 44 4 38 22 L 28 20 Q 32 0 31 -26 Z" />
    </g>
  );

const TocadoFrente: React.FC<{ t: Tocado; color: string }> = ({ t, color }) => {
  switch (t) {
    case "flexible":
      return (
        <g>
          <path d="M -28 -44 Q -32 -86 -8 -88 Q 0 -80 8 -88 Q 32 -86 28 -44 Z" fill={color} />
          <rect x={-28} y={-56} width={56} height={9} fill={oscurecer(color, 0.6)} />
          <path d="M -50 -42 Q 0 -54 50 -42 Q 46 -36 0 -40 Q -46 -36 -50 -42 Z" fill={oscurecer(color, 0.9)} />
        </g>
      );
    case "bombin":
      return (
        <g>
          <path d="M -27 -46 Q -28 -86 0 -88 Q 28 -86 27 -46 Z" fill={"#1B1E20"} />
          <rect x={-27} y={-56} width={54} height={6} fill={"#2C3032"} />
          <ellipse cx={0} cy={-46} rx={42} ry={7} fill={"#1B1E20"} />
        </g>
      );
    case "chistera":
      return (
        <g>
          <rect x={-29} y={-104} width={58} height={56} rx={4} fill={"#16191B"} />
          <rect x={-29} y={-60} width={58} height={8} fill={"#2A2E30"} />
          <ellipse cx={0} cy={-49} rx={44} ry={7} fill={"#16191B"} />
        </g>
      );
    case "gorra":
      return (
        <g>
          <path d="M -38 -36 Q -40 -70 0 -70 Q 40 -70 38 -36 Z" fill={color} />
          <path d="M -36 -38 Q 0 -30 36 -38 L 40 -30 Q 0 -22 -40 -30 Z" fill={oscurecer(color, 0.7)} />
          <circle cx={0} cy={-68} r={4} fill={oscurecer(color, 0.75)} />
        </g>
      );
    case "cloche":
      return (
        <g>
          <path d="M -40 -10 Q -44 -70 0 -72 Q 44 -70 40 -10 Q 34 -18 30 -26 Q 0 -36 -30 -26 Q -34 -18 -40 -10 Z" fill={color} />
          <path d="M -38 -34 Q 0 -46 38 -34 L 38 -26 Q 0 -38 -38 -26 Z" fill={oscurecer(color, 0.65)} />
          <circle cx={26} cy={-34} r={7} fill={oscurecer(color, 0.55)} />
        </g>
      );
    case "panuelo":
      return (
        <g>
          <path d="M -40 -2 Q -46 -64 0 -64 Q 46 -64 40 -2 L 32 28 Q 36 -4 30 -26 Q 0 -40 -30 -26 Q -36 -4 -32 28 Z" fill={color} />
          <path d="M -14 -60 Q -4 -82 2 -64 Q 10 -84 16 -60 Q 0 -54 -14 -60 Z" fill={oscurecer(color, 0.8)} />
          {[-20, 0, 20].map((k) => (
            <circle key={k} cx={k} cy={-50} r={3} fill={"#F2EBD8"} opacity={0.5} />
          ))}
        </g>
      );
    case "adrian":
      return (
        <g>
          <ellipse cx={0} cy={-40} rx={48} ry={8} fill={W.azulHorizonteOsc} />
          <path d="M -34 -40 Q -36 -86 0 -88 Q 36 -86 34 -40 Z" fill={W.azulHorizonte} />
          <path d="M -5 -96 Q 0 -102 5 -96 L 4 -44 L -4 -44 Z" fill={W.azulHorizonteOsc} />
          <circle cx={0} cy={-60} r={7} fill={W.azulHorizonteOsc} />
          <path d="M -34 -40 Q -30 -70 -14 -84" fill="none" stroke={"#9AAAC0"} strokeWidth={4} opacity={0.6} />
        </g>
      );
    case "chaco":
      return (
        <g>
          <path d="M -30 -46 L -26 -100 L 26 -100 L 30 -46 Z" fill={"#24313B"} />
          <rect x={-30} y={-58} width={60} height={10} fill={"#1A242C"} />
          <path d="M -32 -46 Q 0 -36 32 -46 L 36 -38 Q 0 -28 -36 -38 Z" fill={"#111"} />
          <circle cx={0} cy={-78} r={9} fill={"#C8CCCC"} />
        </g>
      );
    case "gorro":
      return (
        <g>
          <path d="M -34 -40 Q -44 -96 0 -96 Q 44 -96 34 -40 Z" fill={"#F4F1EA"} />
          <rect x={-34} y={-52} width={68} height={12} fill={"#E4DED0"} />
        </g>
      );
    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/* Persona de frente                                                   */
/* ------------------------------------------------------------------ */

/**
 * Persona de frente con los pies en (x, y). A escala 1 mide unos 430 px.
 * `cuerpo: "busto"`: detras de una mesa o mostrador, el cuerpo sigue hasta
 * fuera del cuadro en vez de acabar en la cintura.
 */
export const Figura: React.FC<{
  x: number;
  y: number;
  escala?: number;
  semilla: number;
  ropa?: Ropa;
  tocado?: Tocado;
  rasgos?: Partial<Rasgos>;
  look?: Look;
  pose?: PoseW;
  mirada?: number;
  gesto?: "neutro" | "inquieto" | "serio" | "sorpresa";
  habla?: boolean;
  cuerpo?: "entero" | "busto";
  espejo?: boolean;
  /** Lo que lleva en las manos, dibujado en coordenadas de la figura a la altura de las manos. */
  enManos?: React.ReactNode;
}> = ({ x, y, escala = 1, semilla, ropa = "traje", tocado, rasgos, look, pose = "quieto", mirada = 0, gesto = "neutro", habla, cuerpo = "entero", espejo, enManos }) => {
  const f = useCurrentFrame();
  const L = look ?? lookDe(semilla, ropa, rasgos ?? {}, tocado);
  const r = L.rasgos;
  const piel = r.piel ?? PIELES[0];
  const tela = L.tela;
  const solapa = oscurecer(tela, 0.78);
  const respira = Math.sin(f * 0.07 + semilla) * 1.2;
  const hablaAhora = habla ?? pose === "habla";
  const gestoBrazo = pose === "habla" ? Math.sin(f * 0.18 + semilla) * 14 - 24 : 0;
  let bI = 6, aI = 0, bD = -6, aD = 0;
  if (pose === "habla") { bD = 10; aD = 40 - gestoBrazo; }
  if (pose === "senala") { bD = -112; aD = -6; }
  // codo doblado y puno a la altura de la cabeza: protesta, nunca brazo extendido
  if (pose === "puno") { bD = -62; aD = -104 + Math.sin(f * 0.25 + semilla) * 10; }
  if (pose === "lee") { bI = -24; aI = -78; bD = 24; aD = 78; }
  if (pose === "brazos") { bI = -16; aI = -100; bD = 16; aD = 100; }
  if (pose === "cuenta") { bI = -18; aI = -72 + Math.sin(f * 0.5 + semilla) * 8; bD = 18; aD = 72 - Math.sin(f * 0.5 + semilla + 1) * 8; }
  if (pose === "carga") { bI = -8; aI = -58; bD = 8; aD = 58; }
  if (pose === "mesa") { bI = -14; aI = -50; bD = 14; aD = 50; }
  if (pose === "escribe") { bD = 20; aD = 66 + Math.sin(f * 0.5) * 6; bI = -16; aI = -60; }
  if (pose === "lampara") { bD = -4; aD = 10; }
  if (pose === "fusil") { bD = 12; aD = 30; }
  const manga = L.ropa === "oficinista" || L.ropa === "panadero" ? "#EEE9DD" : tela;
  const brazo = (lado: 1 | -1, ang: number, ante: number) => (
    <g transform={`translate(${lado * -58} -318) rotate(${ang})`}>
      <rect x={-13} y={-4} width={26} height={84} rx={12} fill={manga} />
      {L.ropa === "oficinista" ? <rect x={-13} y={40} width={26} height={7} fill={"#8A3A30"} /> : null}
      <g transform={`translate(0 76) rotate(${ante})`}>
        <rect x={-12} y={-6} width={24} height={78} rx={11} fill={manga} />
        {L.ropa === "soldado" || L.ropa === "minero" || L.ropa === "obrero" ? null : <rect x={-12} y={62} width={24} height={8} fill={"#EFE9DC"} />}
        <ellipse cx={0} cy={80} rx={11} ry={13} fill={L.ropa === "soldado" ? oscurecer(piel, 0.95) : piel} />
      </g>
    </g>
  );

  // cuerpo segun la ropa
  const largoAbrigo = L.mujer ? -96 : L.ropa === "soldado" ? -90 : L.ropa === "abrigo" ? -100 : -150;
  const torso = (
    <g transform={`translate(0 ${respira * 0.4})`}>
      {L.mujer ? (
        <g>
          <path d={`M -58 -322 Q 0 -338 58 -322 L 60 -230 Q 70 -160 78 ${largoAbrigo} L -78 ${largoAbrigo} Q -70 -160 -60 -230 Z`} fill={tela} />
          <path d={`M 0 -320 L 12 -300 L 6 ${largoAbrigo} L -2 ${largoAbrigo} L -6 -300 Z`} fill={solapa} />
          <rect x={-64} y={-232} width={128} height={12} fill={solapa} />
          <circle cx={10} cy={-270} r={4} fill={oscurecer(tela, 0.55)} />
          <circle cx={10} cy={-190} r={4} fill={oscurecer(tela, 0.55)} />
          {/* cuello de piel o de tela */}
          <path d="M -40 -336 Q 0 -310 40 -336 L 30 -300 Q 0 -290 -30 -300 Z" fill={rr(semilla, 40) > 0.5 ? "#6E5A48" : solapa} />
        </g>
      ) : L.ropa === "soldado" ? (
        <g>
          <path d={`M -62 -322 Q 0 -338 62 -322 L 64 -230 Q 70 -160 76 ${largoAbrigo} L -76 ${largoAbrigo} Q -70 -160 -64 -230 Z`} fill={tela} />
          <path d={`M -62 -322 L -4 -232 L -4 ${largoAbrigo} L -16 ${largoAbrigo} L -16 -240 Z`} fill={solapa} opacity={0.5} />
          <rect x={-64} y={-236} width={128} height={14} fill={"#5A4632"} />
          <rect x={-8} y={-238} width={16} height={18} fill={W.laton} opacity={0.7} />
          {[-280, -200, -150].map((by) => (
            <circle key={by} cx={20} cy={by} r={4} fill={"#C9B47A"} />
          ))}
          <path d="M -26 -334 L 26 -334 L 18 -316 L -18 -316 Z" fill={solapa} />
          <path d="M -60 -330 L 40 -200" stroke={"#5A4632"} strokeWidth={8} />
        </g>
      ) : L.ropa === "panadero" ? (
        <g>
          <path d="M -60 -322 Q 0 -338 60 -322 L 60 -150 L -60 -150 Z" fill={"#EEE9DD"} />
          <path d="M -48 -260 L 48 -260 L 56 -120 L -56 -120 Z" fill={"#F7F4EC"} />
          <path d="M -48 -260 L 48 -260" stroke={"#D9D2C2"} strokeWidth={4} />
          {[-300, -280].map((by) => (
            <circle key={by} cx={0} cy={by} r={3} fill={"#C9C2B2"} />
          ))}
          <path d="M -14 -334 L 14 -334 L 0 -310 Z" fill={"#F7F4EC"} />
        </g>
      ) : L.ropa === "oficinista" ? (
        <g>
          <path d="M -58 -322 Q 0 -338 58 -322 L 56 -150 L -56 -150 Z" fill={"#EEE9DD"} />
          <path d="M -36 -326 L 36 -326 L 34 -160 L -34 -160 Z" fill={L.tela} />
          <path d="M -14 -332 L 14 -332 L 0 -296 Z" fill={"#F2EDE2"} />
          <path d="M -6 -322 L 6 -322 L 4 -300 L 0 -292 L -4 -300 Z" fill={r.corbata} />
          {[-280, -255, -230, -205].map((by) => (
            <circle key={by} cx={0} cy={by} r={2.6} fill={oscurecer(L.tela, 0.6)} />
          ))}
          <path d="M -16 -240 Q -4 -228 12 -244" fill="none" stroke={W.laton} strokeWidth={2.2} />
        </g>
      ) : L.ropa === "obrero" || L.ropa === "minero" || L.ropa === "nino" ? (
        <g>
          <path d="M -60 -322 Q 0 -338 60 -322 L 60 -150 L -60 -150 Z" fill={tela} />
          <path d="M -22 -330 L 22 -330 L 12 -236 L -12 -236 Z" fill={L.ropa === "minero" ? "#5A564E" : "#CFC6B0"} />
          <path d="M -26 -332 L -6 -326 L -2 -246 L -22 -290 Z" fill={solapa} />
          <path d="M 26 -332 L 6 -326 L 2 -246 L 22 -290 Z" fill={solapa} />
          {rr(semilla, 41) > 0.55 ? <path d="M -24 -340 Q 0 -324 24 -340 L 18 -326 Q 0 -316 -18 -326 Z" fill={["#7A2E26", "#2F4A5A", "#5A5A3A"][Math.floor(rr(semilla, 42) * 3)]} /> : null}
          <rect x={30} y={-290} width={22} height={18} fill={solapa} />
          {L.ropa === "minero" ? <rect x={-60} y={-180} width={120} height={8} fill={"#2A2420"} /> : null}
          <rect x={-60} y={-200} width={14} height={50} fill={"#000"} opacity={0.08} />
        </g>
      ) : L.ropa === "policia" ? (
        <g>
          <path d="M -62 -322 Q 0 -338 62 -322 L 60 -150 L -60 -150 Z" fill={tela} />
          <rect x={-62} y={-230} width={124} height={14} fill={"#1A1A1A"} />
          <rect x={-8} y={-232} width={16} height={18} fill={"#C8CCCC"} />
          {[-300, -270, -250, -190].map((by) => (
            <circle key={by} cx={0} cy={by} r={4} fill={"#C8CCCC"} />
          ))}
          <path d="M -24 -336 L 24 -336 L 20 -318 L -20 -318 Z" fill={"#1F2A34"} />
        </g>
      ) : (
        <g>
          <path d={`M -62 -322 Q 0 -340 62 -322 L 58 -230 Q 62 -190 66 ${largoAbrigo} L 6 ${largoAbrigo} L 0 -240 L -6 ${largoAbrigo} L -66 ${largoAbrigo} Q -62 -190 -58 -230 Z`} fill={tela} />
          <path d="M -24 -326 L 24 -326 L 18 -236 L 0 -228 L -18 -236 Z" fill={L.tela2} />
          <path d="M -14 -332 L 14 -332 L 0 -296 Z" fill={"#F2EDE2"} />
          <path d="M -6 -322 L 6 -322 L 4 -304 L 0 -296 L -4 -304 Z" fill={r.corbata} />
          {[-286, -270, -254].map((by) => (
            <circle key={by} cx={0} cy={by} r={2.6} fill={oscurecer(L.tela2, 0.6)} />
          ))}
          <path d="M -26 -332 L -10 -330 L -2 -270 L -20 -300 Z" fill={solapa} />
          <path d="M 26 -332 L 10 -330 L 2 -270 L 20 -300 Z" fill={solapa} />
          <rect x={28} y={-296} width={20} height={4} fill={solapa} />
          {rr(semilla, 31) > 0.6 ? <path d="M 32 -296 L 36 -304 L 40 -297 L 44 -303 L 46 -296 Z" fill={"#EDE7DA"} /> : null}
        </g>
      )}
      <rect x={-12} y={-352} width={24} height={22} fill={oscurecer(piel, 0.9)} />
      {L.ropa === "traje" || L.ropa === "abrigo" ? <path d="M -16 -336 L 0 -328 L 16 -336 L 14 -344 L 0 -338 L -14 -344 Z" fill={"#F7F2E8"} /> : null}
    </g>
  );

  const piernas = () => {
    if (L.mujer) {
      return (
        <g>
          <rect x={-26} y={-110} width={16} height={104} fill={"#B49A84"} />
          <rect x={10} y={-110} width={16} height={104} fill={"#B49A84"} />
          <path d="M -32 -10 L -6 -10 L -4 0 L -34 0 Z" fill={"#2A1E18"} />
          <path d="M 6 -10 L 32 -10 L 34 0 L 4 0 Z" fill={"#2A1E18"} />
        </g>
      );
    }
    const pant = L.ropa === "soldado" ? W.azulHorizonteOsc : L.ropa === "panadero" ? "#D9D2C2" : L.ropa === "policia" ? "#24313B" : L.tela2;
    return (
      <g>
        <rect x={-34} y={-200} width={29} height={192} fill={pant} />
        <rect x={5} y={-200} width={29} height={192} fill={pant} />
        <rect x={-8} y={-200} width={4} height={190} fill={oscurecer(pant, 0.8)} />
        {L.ropa === "soldado" ? (
          <g fill={"#5E6A78"}>
            <rect x={-36} y={-90} width={33} height={80} />
            <rect x={3} y={-90} width={33} height={80} />
            {[-80, -60, -40, -20].map((k) => (
              <path key={k} d={`M -36 ${k} L -3 ${k - 8} M 3 ${k} L 36 ${k - 8}`} stroke={"#4E5A68"} strokeWidth={2} />
            ))}
          </g>
        ) : null}
        {L.nino ? (
          <g>
            <rect x={-34} y={-110} width={29} height={100} fill={piel} />
            <rect x={5} y={-110} width={29} height={100} fill={piel} />
            <rect x={-34} y={-80} width={29} height={70} fill={"#8E8676"} />
            <rect x={5} y={-80} width={29} height={70} fill={"#8E8676"} />
          </g>
        ) : null}
        <ellipse cx={-24} cy={-6} rx={24} ry={10} fill={"#141618"} />
        <ellipse cx={24} cy={-6} rx={24} ry={10} fill={"#141618"} />
        <ellipse cx={-30} cy={-10} rx={8} ry={3} fill={"#3A3E40"} />
      </g>
    );
  };

  // ninos: cuerpo mas corto y cabeza un poco mayor
  const kCuerpo = L.nino ? 0.72 : 1;
  const cabezaY = -396 * kCuerpo + (L.nino ? 6 : 0);
  return (
    <g transform={`translate(${x} ${y}) scale(${(espejo ? -1 : 1) * escala} ${escala})`}>
      <g transform={`scale(1 ${kCuerpo})`}>
        {cuerpo === "busto" ? (
          <g>
            {/* el cuerpo sigue hasta los pies (y), que quedan tapados por la mesa o fuera de cuadro */}
            <rect x={-64} y={-170} width={128} height={172} fill={L.ropa === "panadero" ? "#F7F4EC" : tela} />
            <rect x={-6} y={-240} width={12} height={242} fill={oscurecer(tela, 0.85)} opacity={L.mujer || L.ropa === "panadero" || L.ropa === "oficinista" ? 0 : 1} />
          </g>
        ) : (
          <g>
            <ellipse cx={0} cy={0} rx={70} ry={10} fill={"#000"} opacity={0.18} />
            {piernas()}
          </g>
        )}
        {brazo(1, bI, aI)}
        {torso}
        {brazo(-1, bD, aD)}
        {pose === "lee" ? (
          <g transform="translate(0 -262) rotate(-3)">
            <rect x={-78} y={-58} width={156} height={112} fill={"#EDE6D3"} />
            <rect x={-70} y={-50} width={140} height={14} fill={"#3A3530"} />
            {Array.from({ length: 6 }).map((_, i) => (
              <rect key={i} x={-70} y={-28 + i * 12} width={i % 3 === 2 ? 90 : 140} height={5} fill={"#B6AD96"} />
            ))}
            <line x1={0} y1={-58} x2={0} y2={54} stroke={"#CFC6AF"} strokeWidth={2} />
          </g>
        ) : null}
        {pose === "lampara" ? (
          <g transform="translate(62 -150)">
            <rect x={-2} y={-20} width={4} height={24} fill={"#2A2420"} />
            <path d="M -14 4 L 14 4 L 12 40 L -12 40 Z" fill={W.laton} />
            <rect x={-10} y={10} width={20} height={20} fill={"#F2D88A"} />
            <rect x={-16} y={40} width={32} height={8} fill={"#7A6A3A"} />
          </g>
        ) : null}
        {pose === "fusil" ? (
          <g transform="translate(52 -180) rotate(-12)">
            <rect x={-4} y={-250} width={8} height={300} fill={"#3A2E22"} />
            <rect x={-3} y={-300} width={5} height={60} fill={"#2A2E30"} />
          </g>
        ) : null}
        {enManos ? <g transform={`translate(0 ${pose === "carga" ? -200 : -250})`}>{enManos}</g> : null}
      </g>
      <g transform={`translate(0 ${cabezaY + respira})`}>
        {L.mujer ? <PeloMujer color={r.pelo ?? PELOS[1]} atras /> : null}
        <Cabeza r={r} semilla={semilla} mirada={mirada} habla={hablaAhora} gesto={gesto} sinSombrero />
        {L.mujer ? (
          <g>
            {L.tocado !== "cloche" && L.tocado !== "panuelo" ? <PeloMujer color={r.pelo ?? PELOS[1]} /> : null}
            {L.tocado === "cloche" ? (
              <g fill={r.pelo ?? PELOS[1]}>
                <path d="M -40 -20 Q -44 4 -36 20 L -28 18 Q -32 0 -31 -20 Z" />
                <path d="M 40 -20 Q 44 4 36 20 L 28 18 Q 32 0 31 -20 Z" />
              </g>
            ) : null}
            <path d="M -7 23 Q 0 27 7 23 Q 0 21 -7 23 Z" fill={"#A2463A"} stroke={"#A2463A"} strokeWidth={2} />
            <path d="M -21 -15 L -24 -18 M 21 -15 L 24 -18" stroke={"#2A2420"} strokeWidth={1.6} />
          </g>
        ) : null}
        <TocadoFrente t={L.tocado} color={L.sombrero} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Persona de perfil que anda                                          */
/* ------------------------------------------------------------------ */

const TocadoPerfil: React.FC<{ t: Tocado; color: string }> = ({ t, color }) => {
  switch (t) {
    case "flexible":
      return (
        <g>
          <path d="M -24 -42 Q -28 -82 0 -84 Q 6 -78 10 -84 Q 28 -80 26 -42 Z" fill={color} />
          <rect x={-25} y={-54} width={52} height={8} fill={oscurecer(color, 0.6)} />
          <path d="M -40 -40 Q 0 -50 46 -44 Q 40 -38 0 -38 Q -36 -36 -40 -40 Z" fill={oscurecer(color, 0.9)} />
        </g>
      );
    case "bombin":
      return (
        <g>
          <path d="M -24 -44 Q -26 -82 2 -84 Q 28 -82 26 -44 Z" fill={"#1B1E20"} />
          <ellipse cx={0} cy={-45} rx={38} ry={6} fill={"#1B1E20"} />
        </g>
      );
    case "chistera":
      return (
        <g>
          <rect x={-26} y={-102} width={50} height={56} rx={3} fill={"#16191B"} />
          <ellipse cx={0} cy={-46} rx={40} ry={6} fill={"#16191B"} />
        </g>
      );
    case "gorra":
      return <path d="M -30 -34 Q -28 -64 4 -62 Q 32 -60 30 -38 L 48 -32 Q 22 -26 -30 -34 Z" fill={color} />;
    case "cloche":
      return <path d="M -34 0 Q -40 -60 2 -62 Q 36 -60 34 -14 Q 30 -22 26 -26 Q 0 -30 -18 -20 Q -26 -10 -34 0 Z" fill={color} />;
    case "panuelo":
      return <path d="M -34 6 Q -40 -58 2 -58 Q 34 -56 30 -16 Q 6 -30 -16 -20 L -10 20 Q -26 30 -34 6 Z" fill={color} />;
    case "adrian":
      return (
        <g>
          <path d="M -44 -36 Q 0 -46 46 -36 Q 0 -30 -44 -36 Z" fill={W.azulHorizonteOsc} />
          <path d="M -30 -36 Q -32 -80 0 -82 Q 32 -80 32 -36 Z" fill={W.azulHorizonte} />
          <path d="M -24 -78 Q 0 -96 24 -78 L 20 -74 Q 0 -88 -20 -74 Z" fill={W.azulHorizonteOsc} />
        </g>
      );
    case "chaco":
      return (
        <g>
          <path d="M -24 -40 L -20 -96 L 24 -96 L 28 -40 Z" fill={"#24313B"} />
          <path d="M 20 -42 L 46 -34 L 22 -32 Z" fill={"#111"} />
          <circle cx={24} cy={-72} r={6} fill={"#C8CCCC"} />
        </g>
      );
    default:
      return null;
  }
};

export type Lleva = "nada" | "cesto" | "carretilla" | "maleta" | "fardo" | "periodico" | "baston" | "bolso" | "fusil" | "lampara";

/**
 * Gente de perfil que cruza el cuadro. `x0` en el fotograma 0, `v` px por
 * fotograma (negativo, hacia la izquierda). `lleva` le pone un cesto de
 * billetes, una carretilla, una maleta...
 */
export const Andante: React.FC<{
  x0: number;
  y: number;
  v: number;
  escala?: number;
  semilla: number;
  ropa?: Ropa;
  tocado?: Tocado;
  lleva?: Lleva;
  rasgos?: Partial<Rasgos>;
}> = ({ x0, y, v, escala = 1, semilla, ropa = "traje", tocado, lleva = "nada", rasgos }) => {
  const f = useCurrentFrame();
  const L = lookDe(semilla, ropa, rasgos ?? {}, tocado);
  const r = L.rasgos;
  const tela = L.tela;
  const piel = r.piel ?? PIELES[0];
  const pelo = r.pelo ?? PELOS[0];
  const fase = rr(semilla, 9) * 6.28;
  const anda = v !== 0;
  const vel = lleva === "carretilla" ? 0.22 : 0.3;
  const paso = anda ? Math.sin(f * vel * Math.min(1.6, Math.abs(v) / 1.6) + fase) : 0;
  const bote = anda ? Math.abs(Math.cos(f * vel + fase)) * 3 : 0;
  const px = x0 + v * f;
  const dir = v < 0 ? -1 : 1;
  const k = L.nino ? 0.72 : 1;
  const pant = L.ropa === "soldado" ? W.azulHorizonteOsc : L.tela2;
  const pierna = (ang: number, color: string) => (
    <g transform={`rotate(${ang} 0 -190)`}>
      <rect x={-11} y={-192} width={22} height={186} rx={6} fill={color} />
      {L.ropa === "soldado" ? <rect x={-12} y={-90} width={24} height={80} fill={"#5E6A78"} /> : null}
      <path d="M -12 -10 L 22 -10 Q 30 -2 22 2 L -12 2 Z" fill={"#141618"} />
    </g>
  );
  const piernaMujer = (ang: number) => (
    <g transform={`rotate(${ang} 0 -110)`}>
      <rect x={-7} y={-112} width={14} height={106} fill={"#B49A84"} />
      <path d="M -9 -8 L 18 -8 Q 22 0 16 2 L -9 2 Z" fill={"#2A1E18"} />
    </g>
  );
  const empuja = lleva === "carretilla" || lleva === "cesto";
  const brazoDelante = empuja ? -62 : lleva === "periodico" ? -40 - paso * 10 : lleva === "maleta" ? -paso * 6 : -paso * 20;
  return (
    <g transform={`translate(${px} ${y - bote}) scale(${escala * dir} ${escala})`}>
      <ellipse cx={lleva === "carretilla" ? 90 : 0} cy={2} rx={lleva === "carretilla" ? 150 : 44} ry={7} fill={"#000"} opacity={0.16} />
      {lleva === "carretilla" ? <Carretilla x={70} y={0} semilla={semilla} /> : null}
      <g transform={`scale(1 ${k})`}>
        {L.mujer ? (
          <g>
            {piernaMujer(-paso * 20)}
            {piernaMujer(paso * 20)}
          </g>
        ) : (
          <g>
            {pierna(-paso * 24, oscurecer(pant, 0.85))}
            {pierna(paso * 24, pant)}
          </g>
        )}
        {/* brazo de atras */}
        <g transform={`rotate(${empuja ? -58 : paso * 20} 0 -318)`}>
          <rect x={-11} y={-322} width={22} height={150} rx={10} fill={oscurecer(tela, 0.8)} />
        </g>
        {/* cuerpo */}
        {L.mujer || L.ropa === "soldado" || L.ropa === "abrigo" ? (
          <path d={`M -30 -330 Q 4 -342 30 -326 L 34 -230 Q 40 -150 ${48 - paso * 6} -96 L -40 -96 Q -36 -200 -30 -330 Z`} fill={tela} />
        ) : (
          <path d={`M -30 -330 Q 4 -342 30 -326 L 32 -230 Q 30 -170 ${36 - paso * 4} -146 L -28 -146 Q -34 -200 -30 -330 Z`} fill={tela} />
        )}
        {L.ropa === "soldado" ? <rect x={-34} y={-236} width={70} height={12} fill={"#5A4632"} /> : null}
        {L.mujer ? <path d="M 16 -336 Q 34 -332 34 -310 L 14 -300 Z" fill={rr(semilla, 40) > 0.5 ? "#6E5A48" : oscurecer(tela, 0.78)} /> : <path d="M 18 -338 L 34 -332 L 30 -322 L 16 -328 Z" fill={L.ropa === "traje" || L.ropa === "abrigo" ? "#F2EDE2" : oscurecer(tela, 0.7)} />}
        {L.ropa === "soldado" ? (
          <g>
            <rect x={-46} y={-320} width={30} height={90} rx={8} fill={"#6A5A44"} />
            <rect x={-8} y={-430} width={7} height={300} fill={"#3A2E22"} transform="rotate(-8 0 -300)" />
          </g>
        ) : null}
        {/* brazo de delante */}
        <g transform={`rotate(${brazoDelante} 0 -318)`}>
          <rect x={-12} y={-324} width={24} height={150} rx={11} fill={tela} />
          <ellipse cx={0} cy={-170} rx={11} ry={12} fill={piel} />
          {lleva === "periodico" ? <rect x={-10} y={-200} width={46} height={34} fill={"#EDE6D3"} transform="rotate(30 0 -180)" /> : null}
          {lleva === "baston" ? <rect x={-3} y={-176} width={6} height={170} fill={"#2A1E16"} /> : null}
        </g>
        {lleva === "maleta" ? (
          <g transform={`translate(${-paso * 18} 0)`}>
            <rect x={-28} y={-150} width={70} height={52} rx={6} fill={["#6E4B35", "#4A3A2A", "#5A4A3A"][semilla % 3]} />
            <rect x={-6} y={-162} width={26} height={14} rx={5} fill="none" stroke={"#2A1E16"} strokeWidth={4} />
            <rect x={-28} y={-130} width={70} height={5} fill={"#3A2A1E"} />
          </g>
        ) : null}
        {lleva === "fardo" ? (
          <g>
            <ellipse cx={-26} cy={-310} rx={42} ry={36} fill={["#8A7A5A", "#7A6A5A", "#9A8462"][semilla % 3]} />
            <path d="M -60 -320 Q -26 -300 10 -326" stroke={"#5A4A3A"} strokeWidth={4} fill="none" />
          </g>
        ) : null}
        {lleva === "bolso" ? <rect x={14} y={-196} width={34} height={28} rx={5} fill={"#3A2A22"} /> : null}
        {lleva === "cesto" ? (
          <g transform="translate(58 -210)">
            <path d="M -40 -30 L 40 -30 L 32 30 L -32 30 Z" fill={"#A88A58"} />
            {[-20, 0, 20].map((yy) => (
              <line key={yy} x1={-38} x2={38} y1={yy - 6} y2={yy - 6} stroke={"#8A6E42"} strokeWidth={3} />
            ))}
            <Fajito x={-18} y={-34} />
            <Fajito x={12} y={-38} />
            <Fajito x={-4} y={-50} />
          </g>
        ) : null}
        {/* cabeza de perfil */}
        <g transform="translate(4 -380)">
          <rect x={-8} y={20} width={18} height={26} fill={oscurecer(piel, 0.88)} />
          {L.mujer ? <path d="M -34 -16 Q -38 -50 0 -52 Q 30 -50 30 -20 L 30 0 L -20 30 Q -34 20 -34 -16 Z" fill={pelo} /> : null}
          <path d="M -28 -16 Q -30 -44 0 -46 Q 26 -44 28 -18 L 30 -6 L 40 6 L 30 10 L 30 20 Q 26 36 6 38 Q -20 36 -26 18 Z" fill={piel} />
          {L.mujer ? (
            <path d="M -34 -14 Q -36 -52 2 -52 Q 30 -50 30 -24 Q 10 -36 -8 -28 Q -14 -10 -12 22 L -28 26 Q -36 10 -34 -14 Z" fill={pelo} />
          ) : (
            <path d="M -30 -10 Q -34 -46 0 -50 Q 24 -48 28 -26 Q 10 -34 -6 -30 Q -16 -24 -18 -8 Z" fill={pelo} />
          )}
          {L.mujer ? null : <ellipse cx={-6} cy={0} rx={6} ry={9} fill={oscurecer(piel, 0.82)} />}
          <circle cx={18} cy={-8} r={2.8} fill={"#2A2420"} />
          <rect x={12} y={-18} width={14} height={3.5} rx={1.5} fill={pelo} />
          {r.bigote && r.bigote !== "ninguno" ? <path d="M 22 14 Q 32 10 38 18 Q 30 20 22 18 Z" fill={pelo} /> : null}
          {r.barba === "completa" ? <path d="M -16 14 Q -8 40 14 38 Q 30 30 30 18 Q 18 26 4 24 Z" fill={pelo} /> : null}
          <path d="M 22 26 L 32 25" stroke={L.mujer ? "#A2463A" : "#7A3E33"} strokeWidth={2.4} />
          <TocadoPerfil t={L.tocado} color={L.sombrero} />
        </g>
      </g>
    </g>
  );
};

/** Fajito suelto para cestos y carretillas. */
export const Fajito: React.FC<{ x: number; y: number; tono?: number }> = ({ x, y, tono = 0 }) => {
  const c = [W.billete, W.billeteAzul, W.billeteRosa][tono % 3];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-24} y={-8} width={48} height={16} fill={c} />
      <rect x={-24} y={-2} width={48} height={3} fill={oscurecer(c, 0.8)} />
      <rect x={-5} y={-8} width={10} height={16} fill={W.papel} />
    </g>
  );
};

/** Carretilla de madera cargada de fajos, con la rueda girando. */
export const Carretilla: React.FC<{ x: number; y: number; semilla?: number; quieta?: boolean }> = ({ x, y, semilla = 1, quieta }) => {
  const f = useCurrentFrame();
  const giro = quieta ? 0 : (f * 6) % 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* varas */}
      <path d="M -40 -150 L 150 -70" stroke={W.madera} strokeWidth={8} />
      {/* caja */}
      <path d="M 20 -150 L 200 -150 L 180 -70 L 40 -70 Z" fill={W.maderaLuz} />
      <path d="M 20 -150 L 200 -150" stroke={W.madera} strokeWidth={6} />
      {[60, 110, 150].map((k) => (
        <line key={k} x1={k} y1={-150} x2={k - 4} y2={-70} stroke={W.maderaMedia} strokeWidth={3} />
      ))}
      {/* carga */}
      {Array.from({ length: 9 }).map((_, i) => (
        <Fajito key={i} x={50 + (i % 4) * 38 + (Math.floor(i / 4) % 2) * 18} y={-158 - Math.floor(i / 4) * 16} tono={i + semilla} />
      ))}
      {/* pata y rueda */}
      <rect x={60} y={-72} width={8} height={70} fill={W.madera} />
      <g transform={`translate(190 -38) rotate(${giro})`}>
        <circle r={36} fill={W.hierro} />
        <circle r={28} fill={W.maderaMedia} />
        {[0, 45, 90, 135].map((a) => (
          <rect key={a} x={-2.5} y={-28} width={5} height={56} fill={W.madera} transform={`rotate(${a})`} />
        ))}
        <circle r={6} fill={W.hierro} />
      </g>
    </g>
  );
};

/** Cesto de la ropa lleno de billetes, en el suelo o en un mostrador. */
export const CestoBilletes: React.FC<{ x: number; y: number; s?: number; semilla?: number }> = ({ x, y, s = 1, semilla = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={90} ry={10} fill={"#000"} opacity={0.15} />
    {Array.from({ length: 10 }).map((_, i) => (
      <Fajito key={i} x={-56 + (i % 5) * 28} y={-92 - Math.floor(i / 5) * 12 - (i % 2) * 4} tono={i + semilla} />
    ))}
    <path d="M -86 -86 L 86 -86 L 70 0 L -70 0 Z" fill={"#B39462"} />
    {[-66, -46, -26].map((yy) => (
      <line key={yy} x1={-82} x2={82} y1={yy} y2={yy} stroke={"#8E7244"} strokeWidth={4} />
    ))}
    {[-50, -20, 10, 40].map((xx) => (
      <line key={xx} x1={xx} x2={xx * 0.85} y1={-86} y2={0} stroke={"#9E8050"} strokeWidth={3} />
    ))}
    <rect x={-92} y={-92} width={184} height={10} rx={5} fill={"#9E8050"} />
  </g>
);
