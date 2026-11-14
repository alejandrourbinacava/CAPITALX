import React from "react";
import { useCurrentFrame } from "remotion";
import { Cabeza, PELOS, PIELES, rasgosDe, type Rasgos } from "../../piloto/Personajes";
import { C, oscurecer, rr } from "./comun";

/**
 * Gente de 1925-1934 para el video del crack: trajes de tres piezas con
 * fedora o canotier, corredores con chaqueta de parque, obreros con gorra,
 * granjeros con peto, mujeres con vestido y sombrero cloche, policias y
 * ninos. Las caras son la `Cabeza` del piloto, para que todo el canal tenga
 * el mismo estilo; el vestuario y los sombreros son propios.
 */

export type Atuendo = "traje" | "banquero" | "corredor" | "obrero" | "granjero" | "mujer" | "policia" | "nino" | "repartidor" | "moderno" | "moderna";
export type Gorro = "fedora" | "canotier" | "bombin" | "gorra" | "cloche" | "paja" | "policia" | "ninguno";
export type Pose29 = "quieto" | "habla" | "senala" | "lee" | "escribe" | "brazos" | "telefono" | "alza" | "manos" | "carga" | "movil";

const TRAJES = ["#2B3236", "#3A3530", "#4A4F52", "#2F3A40", "#4B3D33", "#3D3A45", "#56483B", "#5B5446", "#454C48"];
const VESTIDOS = ["#7A3B34", "#2F4A5A", "#5C5A3A", "#6B4A5E", "#3F5A4E", "#8A6A48", "#4A4A5E", "#9A7A5A"];
const CAMISAS = ["#D9D2BF", "#B8C0C4", "#CDBB9A", "#A9B39A", "#C9B8A6"];

export type Look = {
  r: Rasgos;
  atuendo: Atuendo;
  gorro: Gorro;
  traje: string;
  pantalon: string;
  camisa: string;
  vestido: string;
  mujer: boolean;
};

/** Rasgos y ropa a partir de una semilla. */
export const look = (s: number, atuendo: Atuendo, extra: Partial<Rasgos> = {}, gorro?: Gorro): Look => {
  const base = rasgosDe(s);
  const mujer = atuendo === "mujer" || atuendo === "moderna";
  const nino = atuendo === "nino";
  const pielR = rr(s, 40);
  const piel = pielR < 0.8 ? PIELES[Math.floor(rr(s, 41) * 3)] : PIELES[3 + Math.floor(rr(s, 42) * 3)];
  const bigotes: Rasgos["bigote"][] = ["ninguno", "ninguno", "fino", "cepillo", "ninguno", "morsa", "ninguno"];
  const edad: Rasgos["edad"] = nino ? "joven" : base.edad;
  const r: Rasgos = {
    ...base,
    piel,
    edad,
    pelo: (mujer && edad !== "mayor") || nino ? PELOS[Math.floor(rr(s, 43) * 4)] : base.pelo,
    bigote: mujer || nino ? "ninguno" : bigotes[Math.floor(rr(s, 44) * bigotes.length)],
    barba: mujer || nino ? "ninguna" : rr(s, 45) > 0.92 ? "perilla" : "ninguna",
    peinado: mujer ? "corto" : nino ? (rr(s, 54) > 0.5 ? "corto" : "raya") : base.peinado,
    gafas: nino ? false : base.gafas,
    ...extra,
  };
  const g: Gorro =
    gorro ??
    (atuendo === "traje"
      ? (["fedora", "fedora", "fedora", "canotier", "bombin", "fedora", "ninguno"] as Gorro[])[Math.floor(rr(s, 46) * 7)]
      : atuendo === "mujer"
      ? rr(s, 47) > 0.25
        ? "cloche"
        : "ninguno"
      : atuendo === "obrero" || atuendo === "repartidor" || atuendo === "nino"
      ? "gorra"
      : atuendo === "granjero"
      ? "paja"
      : atuendo === "policia"
      ? "policia"
      : "ninguno");
  const traje = atuendo === "corredor" ? (["#D8D0BC", "#CBC6B4", "#B9C0B8"] as string[])[Math.floor(rr(s, 48) * 3)] : TRAJES[Math.floor(rr(s, 49) * TRAJES.length)];
  return {
    r,
    atuendo,
    gorro: g,
    traje: atuendo === "nino" ? (["#7A5A3A", "#4A5A6A", "#6A4A4A", "#5A6A4A"] as string[])[Math.floor(rr(s, 55) * 4)] : atuendo === "policia" ? "#22304A" : atuendo === "obrero" ? (["#4A4237", "#3E4A4A", "#5A4A3A", "#3A3A3A"] as string[])[Math.floor(rr(s, 50) * 4)] : traje,
    pantalon: atuendo === "granjero" ? "#3F5A78" : atuendo === "policia" ? "#1C2638" : oscurecer(TRAJES[Math.floor(rr(s, 51) * TRAJES.length)], 0.85),
    camisa: CAMISAS[Math.floor(rr(s, 52) * CAMISAS.length)],
    vestido: VESTIDOS[Math.floor(rr(s, 53) * VESTIDOS.length)],
    mujer,
  };
};

/* ------------------------------------------------------------------ */
/* Sombreros (sobre la cabeza de frente, centro de la cara en 0,0)     */
/* ------------------------------------------------------------------ */

export const SombreroFrente: React.FC<{ g: Gorro; color?: string }> = ({ g, color }) => {
  if (g === "fedora") {
    const c = color ?? "#2E2A26";
    return (
      <g>
        <path d="M -28 -48 Q -30 -78 -18 -86 Q 0 -78 18 -86 Q 30 -78 28 -48 Z" fill={c} />
        <path d="M -6 -84 Q 0 -74 6 -84" fill="none" stroke={oscurecer(c, 0.7)} strokeWidth={3} />
        <rect x={-28} y={-58} width={56} height={9} fill={"#1A1714"} />
        <path d="M -48 -46 Q 0 -58 48 -46 Q 44 -40 0 -44 Q -44 -40 -48 -46 Z" fill={oscurecer(c, 0.9)} />
      </g>
    );
  }
  if (g === "cloche") {
    const c = color ?? "#6B3A3A";
    return (
      <g>
        <path d="M -40 -14 Q -44 -72 0 -74 Q 44 -72 40 -14 Q 34 -24 22 -26 L -22 -26 Q -34 -24 -40 -14 Z" fill={c} />
        <rect x={-38} y={-38} width={76} height={8} fill={oscurecer(c, 0.7)} />
        <circle cx={24} cy={-34} r={6} fill={C.ocre} opacity={0.8} />
      </g>
    );
  }
  if (g === "paja") {
    return (
      <g>
        <ellipse cx={0} cy={-46} rx={62} ry={10} fill={"#C9AE6E"} />
        <path d="M -28 -46 Q -28 -82 0 -82 Q 28 -82 28 -46 Z" fill={"#D8BE7E"} />
        <rect x={-28} y={-56} width={56} height={7} fill={"#7A5A34"} />
      </g>
    );
  }
  if (g === "policia") {
    return (
      <g>
        <path d="M -32 -46 L -36 -80 Q 0 -92 36 -80 L 32 -46 Z" fill={"#1C2638"} />
        <rect x={-32} y={-54} width={64} height={8} fill={"#141A26"} />
        <path d="M -30 -46 Q 0 -30 30 -46 L 30 -42 Q 0 -26 -30 -42 Z" fill={"#0E1118"} />
        <path d="M 0 -78 L 8 -70 L 0 -60 L -8 -70 Z" fill={C.laton} />
      </g>
    );
  }
  return null;
};

/** Melena corta de los veinte, por encima de la cara. */
const Melena: React.FC<{ pelo: string }> = ({ pelo }) => (
  <g fill={pelo}>
    <path d="M -36 -10 Q -46 -52 -6 -56 Q 40 -58 38 -10 L 40 16 Q 34 20 30 14 L 30 -20 Q 10 -36 -14 -34 Q -30 -30 -30 -20 L -30 14 Q -34 20 -40 16 Z" />
  </g>
);

/** Cabeza de frente con el sombrero de la epoca. */
export const Cabeza29: React.FC<{ L: Look; semilla: number; mirada?: number; habla?: boolean; gesto?: "neutro" | "inquieto" | "serio" | "sorpresa" }> = ({
  L,
  semilla,
  mirada,
  habla,
  gesto,
}) => {
  const propio = L.gorro === "fedora" || L.gorro === "cloche" || L.gorro === "paja" || L.gorro === "policia" || L.gorro === "ninguno";
  const r: Rasgos = { ...L.r, sombrero: propio ? "ninguno" : (L.gorro as Rasgos["sombrero"]) };
  return (
    <g>
      <Cabeza r={r} semilla={semilla} mirada={mirada} habla={habla} gesto={gesto} sinSombrero={propio} />
      {L.mujer ? (
        <g>
          <Melena pelo={L.r.pelo ?? PELOS[0]} />
          <ellipse cx={0} cy={24} rx={7} ry={2.6} fill={"#A8443A"} opacity={0.85} />
          <path d="M -21 -15 L -24 -18 M 21 -15 L 24 -18" stroke={"#2A2420"} strokeWidth={1.6} />
        </g>
      ) : null}
      {propio ? <SombreroFrente g={L.gorro} color={L.mujer ? oscurecer(L.vestido, 0.8) : undefined} /> : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Persona de frente                                                   */
/* ------------------------------------------------------------------ */

/**
 * Persona de frente con los pies en (x, y). A escala 1 mide unos 430 px.
 * `cuerpo`: "entero", "busto" (sigue fuera de cuadro o tras una mesa) o
 * "sentado" (la silla la pone el decorado; el asiento queda a 120 px).
 */
export const Figura: React.FC<{
  x: number;
  y: number;
  escala?: number;
  semilla: number;
  atuendo?: Atuendo;
  gorro?: Gorro;
  rasgos?: Partial<Rasgos>;
  pose?: Pose29;
  mirada?: number;
  gesto?: "neutro" | "inquieto" | "serio" | "sorpresa";
  habla?: boolean;
  cuerpo?: "entero" | "busto" | "sentado";
  espejo?: boolean;
  traje?: string;
  papel?: string;
  /** en "busto", hasta donde baja el cuerpo por debajo de la cintura (px a escala 1) */
  largo?: number;
}> = ({ x, y, escala = 1, semilla, atuendo = "traje", gorro, rasgos, pose = "quieto", mirada = 0, gesto = "neutro", habla, cuerpo = "entero", espejo, traje, papel, largo = 900 }) => {
  const f = useCurrentFrame();
  const L = look(semilla, atuendo, rasgos, gorro);
  if (traje) L.traje = traje;
  const nino = atuendo === "nino";
  const mujer = L.mujer;
  const piel = L.r.piel ?? PIELES[0];
  const chaqueta = mujer ? L.vestido : atuendo === "granjero" ? L.camisa : L.traje;
  const manga = mujer ? L.vestido : atuendo === "granjero" ? "#B9A88A" : chaqueta;
  const solapa = oscurecer(chaqueta, 0.78);
  const respira = Math.sin(f * 0.07 + semilla) * 1.2;
  const hablaAhora = habla ?? pose === "habla";
  const gestoBrazo = pose === "habla" ? Math.sin(f * 0.18 + semilla) * 14 - 24 : 0;
  let brazoI = 6,
    anteI = 0,
    brazoD = -6,
    anteD = 0;
  if (pose === "habla") {
    brazoD = 10;
    anteD = 40 - gestoBrazo;
  }
  if (pose === "senala") {
    brazoD = -112;
    anteD = -6;
  }
  if (pose === "lee" || pose === "carga") {
    brazoI = -24;
    anteI = -78;
    brazoD = 24;
    anteD = 78;
  }
  if (pose === "escribe") {
    brazoD = 20;
    anteD = 66 + Math.sin(f * 0.5) * 6;
    brazoI = -16;
    anteI = -60;
  }
  if (pose === "brazos") {
    brazoI = -16;
    anteI = -100;
    brazoD = 16;
    anteD = 100;
  }
  if (pose === "manos") {
    brazoI = -10;
    anteI = -42;
    brazoD = 10;
    anteD = 42;
  }
  if (pose === "telefono") {
    brazoD = 18;
    anteD = 150;
    brazoI = -20;
    anteI = -70;
  }
  if (pose === "movil") {
    brazoD = 14;
    anteD = 118;
    brazoI = -16;
    anteI = -86;
  }
  if (pose === "alza") {
    brazoD = -160 + Math.sin(f * 0.35 + semilla) * 10;
    anteD = -12;
  }
  const ancho = mujer ? 0.86 : 1;
  const brazo = (lado: 1 | -1, ang: number, ante: number, mano?: React.ReactNode) => (
    <g transform={`translate(${lado * -58 * ancho} -318) rotate(${ang})`}>
      <rect x={-13} y={-4} width={mujer ? 22 : 26} height={84} rx={12} fill={manga} />
      <g transform={`translate(0 76) rotate(${ante})`}>
        <rect x={-12} y={-6} width={mujer ? 20 : 24} height={78} rx={11} fill={mujer && atuendo !== "moderna" ? piel : manga} />
        {mujer || atuendo === "granjero" || atuendo === "obrero" ? null : <rect x={-12} y={62} width={24} height={9} fill={"#EFE9DC"} />}
        <ellipse cx={0} cy={80} rx={11} ry={13} fill={piel} />
        {mano}
      </g>
    </g>
  );

  const torsoHombre = (
    <g>
      <path d="M -60 -322 Q 0 -338 60 -322 L 62 -160 Q 30 -150 4 -150 L 0 -250 L -4 -150 Q -30 -150 -62 -160 Z" fill={chaqueta} />
      {atuendo === "policia" ? (
        <g>
          <rect x={-62} y={-200} width={124} height={14} fill={"#121722"} />
          <rect x={-10} y={-202} width={20} height={18} fill={C.laton} />
          {[-300, -270, -240, -214].map((by) => (
            <g key={by}>
              <circle cx={-16} cy={by} r={3.4} fill={C.laton} />
              <circle cx={16} cy={by} r={3.4} fill={C.laton} />
            </g>
          ))}
          <path d="M -40 -290 L -30 -296 L -20 -290 L -22 -276 L -30 -270 L -38 -276 Z" fill={C.laton} />
          <path d="M -16 -334 L 16 -334 L 10 -320 L -10 -320 Z" fill={"#141A26"} />
        </g>
      ) : atuendo === "granjero" ? (
        <g>
          <path d="M -40 -290 L 40 -290 L 46 -150 L -46 -150 Z" fill={L.pantalon} />
          <rect x={-30} y={-280} width={60} height={40} fill={oscurecer(L.pantalon, 0.9)} />
          <path d="M -42 -290 L -48 -330 M 42 -290 L 48 -330" stroke={L.pantalon} strokeWidth={12} />
          <circle cx={-40} cy={-288} r={4} fill={C.laton} />
          <circle cx={40} cy={-288} r={4} fill={C.laton} />
          <path d="M -12 -334 L 12 -334 L 0 -318 Z" fill={oscurecer(L.camisa, 0.85)} />
        </g>
      ) : atuendo === "obrero" || atuendo === "repartidor" || atuendo === "nino" ? (
        <g>
          <path d="M -22 -330 L 22 -330 L 18 -150 L -18 -150 Z" fill={L.camisa} />
          <path d="M -10 -334 L 10 -334 L 0 -314 Z" fill={oscurecer(L.camisa, 0.8)} />
          {[-300, -270, -240, -210].map((by) => (
            <circle key={by} cx={0} cy={by} r={2.4} fill={oscurecer(L.camisa, 0.6)} />
          ))}
          {atuendo === "repartidor" ? (
            <g>
              <path d="M -50 -322 L 46 -196" stroke={"#5A4030"} strokeWidth={5} />
              <rect x={30} y={-206} width={50} height={56} rx={4} fill={"#6E5038"} />
              <rect x={34} y={-216} width={42} height={14} fill={"#EDE6D3"} />
            </g>
          ) : null}
          <path d="M -26 -332 L -14 -330 L -10 -280 L -24 -300 Z" fill={solapa} />
          <path d="M 26 -332 L 14 -330 L 10 -280 L 24 -300 Z" fill={solapa} />
          <rect x={28} y={-232} width={22} height={18} fill={solapa} />
        </g>
      ) : atuendo === "moderno" ? (
        <g>
          <path d="M -22 -330 L 22 -330 L 14 -150 L -14 -150 Z" fill={"#E8ECEE"} />
          <path d="M -10 -334 L 10 -334 L 0 -320 Z" fill={"#C9D0D4"} />
          <path d="M -26 -332 L -10 -330 L -2 -250 L -22 -290 Z" fill={solapa} />
          <path d="M 26 -332 L 10 -330 L 2 -250 L 22 -290 Z" fill={solapa} />
        </g>
      ) : (
        <g>
          <path d="M -24 -326 L 24 -326 L 18 -230 L 0 -222 L -18 -230 Z" fill={atuendo === "corredor" ? "#4A4F52" : oscurecer(chaqueta, 0.9)} />
          <path d="M -14 -332 L 14 -332 L 0 -296 Z" fill={"#F2EDE2"} />
          <path d="M -6 -322 L 6 -322 L 4 -300 L 0 -290 L -4 -300 Z" fill={["#5B1F1C", "#1F2B3C", "#2A2A2A", "#3D4A2E", "#7A5A2A"][Math.floor(rr(semilla, 14) * 5)]} />
          {[-286, -268, -250].map((by) => (
            <circle key={by} cx={0} cy={by} r={2.4} fill={oscurecer(chaqueta, 0.55)} />
          ))}
          {atuendo !== "corredor" ? <path d="M -16 -262 Q -4 -250 12 -266" fill="none" stroke={C.laton} strokeWidth={2} /> : null}
          <path d="M -26 -332 L -10 -330 L -2 -262 L -22 -296 Z" fill={solapa} />
          <path d="M 26 -332 L 10 -330 L 2 -262 L 22 -296 Z" fill={solapa} />
          <rect x={28} y={-296} width={20} height={4} fill={solapa} />
          {rr(semilla, 31) > 0.5 && atuendo !== "corredor" ? <path d="M 32 -296 L 36 -304 L 40 -297 L 44 -303 L 46 -296 Z" fill={"#EDE7DA"} /> : null}
          {atuendo === "corredor" ? (
            <g>
              <rect x={-52} y={-300} width={30} height={22} rx={3} fill={"#F2EDE2"} />
              <text x={-37} y={-283} textAnchor="middle" fontSize={14} fontWeight={700} fill={C.tinta} fontFamily="sans-serif">
                {100 + Math.floor(rr(semilla, 60) * 800)}
              </text>
              <rect x={24} y={-250} width={28} height={30} fill={oscurecer(chaqueta, 0.85)} />
              <rect x={28} y={-262} width={18} height={16} fill={"#F2EDE2"} />
            </g>
          ) : null}
        </g>
      )}
      <rect x={-12} y={-352} width={24} height={22} fill={oscurecer(piel, 0.9)} />
      {atuendo === "obrero" || atuendo === "granjero" || atuendo === "repartidor" || atuendo === "moderno" || atuendo === "nino" ? null : (
        <path d="M -16 -336 L 0 -328 L 16 -336 L 14 -344 L 0 -338 L -14 -344 Z" fill={"#F7F2E8"} />
      )}
    </g>
  );

  const torsoMujer = (
    <g>
      <path d="M -50 -322 Q 0 -336 50 -322 L 46 -230 L 54 -150 L -54 -150 L -46 -230 Z" fill={L.vestido} />
      <path d="M -50 -230 L 50 -230 L 50 -218 L -50 -218 Z" fill={oscurecer(L.vestido, 0.75)} />
      <path d="M -18 -334 L 0 -306 L 18 -334 Z" fill={atuendo === "moderna" ? "#E8ECEE" : "#EFE6D6"} />
      {atuendo === "moderna" ? null : (
        <g>
          {[0, 1, 2, 3, 4].map((k) => (
            <circle key={k} cx={-14 + k * 7} cy={-312 + Math.abs(k - 2) * -3} r={2.6} fill={"#F4EFE4"} />
          ))}
        </g>
      )}
      <rect x={-10} y={-352} width={20} height={22} fill={oscurecer(piel, 0.9)} />
    </g>
  );

  const piernas =
    cuerpo === "entero" ? (
      mujer ? (
        <g>
          <ellipse cx={0} cy={0} rx={56} ry={9} fill={"#000"} opacity={0.18} />
          <rect x={-26} y={-110} width={17} height={104} fill={oscurecer(piel, 0.88)} />
          <rect x={9} y={-110} width={17} height={104} fill={oscurecer(piel, 0.88)} />
          <path d="M -32 -10 L -6 -10 L -6 0 L -34 0 Z" fill={"#2A1E18"} />
          <path d="M 6 -10 L 32 -10 L 34 0 L 6 0 Z" fill={"#2A1E18"} />
          <path d={`M -52 -230 L 52 -230 L ${66} -96 Q 0 -86 ${-66} -96 Z`} fill={L.vestido} />
          <path d="M -60 -110 Q 0 -100 60 -110 L 64 -98 Q 0 -88 -64 -98 Z" fill={oscurecer(L.vestido, 0.8)} />
        </g>
      ) : (
        <g>
          <ellipse cx={0} cy={0} rx={70} ry={10} fill={"#000"} opacity={0.18} />
          <rect x={-34} y={-200} width={29} height={192} fill={L.pantalon} />
          <rect x={5} y={-200} width={29} height={192} fill={L.pantalon} />
          <rect x={-8} y={-200} width={4} height={190} fill={oscurecer(L.pantalon, 0.8)} />
          {nino ? (
            <g>
              <rect x={-34} y={-90} width={29} height={84} fill={"#D9CFBE"} />
              <rect x={5} y={-90} width={29} height={84} fill={"#D9CFBE"} />
            </g>
          ) : null}
          <ellipse cx={-24} cy={-6} rx={24} ry={10} fill={atuendo === "granjero" ? "#4A3424" : "#141618"} />
          <ellipse cx={24} cy={-6} rx={24} ry={10} fill={atuendo === "granjero" ? "#4A3424" : "#141618"} />
        </g>
      )
    ) : cuerpo === "sentado" ? (
      <g>
        {mujer ? (
          <g>
            <rect x={-26} y={-104} width={17} height={98} fill={oscurecer(piel, 0.88)} />
            <rect x={9} y={-104} width={17} height={98} fill={oscurecer(piel, 0.88)} />
            <path d="M -60 -136 L 60 -136 L 64 -90 L -64 -90 Z" fill={L.vestido} />
            <path d="M -32 -10 L -6 -10 L -6 0 L -34 0 Z" fill={"#2A1E18"} />
            <path d="M 6 -10 L 32 -10 L 34 0 L 6 0 Z" fill={"#2A1E18"} />
          </g>
        ) : (
          <g>
            <rect x={-38} y={-100} width={30} height={92} fill={L.pantalon} />
            <rect x={8} y={-100} width={30} height={92} fill={L.pantalon} />
            <rect x={-44} y={-132} width={42} height={42} rx={8} fill={oscurecer(L.pantalon, 1.1)} />
            <rect x={2} y={-132} width={42} height={42} rx={8} fill={oscurecer(L.pantalon, 1.1)} />
            <ellipse cx={-23} cy={-6} rx={22} ry={9} fill={"#141618"} />
            <ellipse cx={23} cy={-6} rx={22} ry={9} fill={"#141618"} />
          </g>
        )}
      </g>
    ) : (
      <g>
        <rect x={-62 * ancho} y={-170} width={124 * ancho} height={largo} fill={mujer ? L.vestido : chaqueta} />
        <rect x={-6} y={-240} width={12} height={largo + 70} fill={oscurecer(mujer ? L.vestido : chaqueta, 0.88)} opacity={mujer ? 0 : 1} />
      </g>
    );

  // en "sentado" el cuerpo baja 80 px: la cadera queda a la altura del asiento
  const baja = cuerpo === "sentado" ? 60 : 0;
  const manoD =
    pose === "telefono" ? (
      <g transform="translate(0 78) rotate(-20)">
        <rect x={-6} y={-30} width={12} height={46} rx={5} fill={"#1A1A1A"} />
      </g>
    ) : pose === "alza" ? (
      <rect x={-14} y={78} width={34} height={24} fill={papel ?? "#F2EDE0"} transform="rotate(12 0 90)" />
    ) : pose === "movil" ? (
      <rect x={-14} y={60} width={26} height={44} rx={4} fill={"#15191C"} stroke={"#555"} strokeWidth={2} />
    ) : null;
  const cabezaEsc = nino ? 1.18 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${(espejo ? -1 : 1) * escala * (nino ? 0.64 : 1)} ${escala * (nino ? 0.64 : 1)})`}>
      {cuerpo === "sentado" ? null : piernas}
      <g transform={`translate(0 ${baja})`}>
        {brazo(1, brazoI, anteI)}
        {mujer ? torsoMujer : torsoHombre}
        {brazo(-1, brazoD, anteD, manoD)}
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
        {pose === "carga" ? (
          <g transform="translate(0 -250)">
            <rect x={-70} y={-40} width={140} height={84} fill={papel ?? "#A88A5E"} />
            <rect x={-70} y={-40} width={140} height={12} fill={oscurecer(papel ?? "#A88A5E", 0.8)} />
          </g>
        ) : null}
        <g transform={`translate(0 ${-396 + respira}) scale(${cabezaEsc})`}>
          <Cabeza29 L={L} semilla={semilla} mirada={mirada} habla={hablaAhora} gesto={gesto} />
        </g>
      </g>
      {cuerpo === "sentado" ? piernas : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Gente de perfil: camina (v != 0) o espera en una cola (v = 0)       */
/* ------------------------------------------------------------------ */

const SombreroPerfil: React.FC<{ g: Gorro; color?: string }> = ({ g, color }) => {
  if (g === "fedora")
    return (
      <g>
        <path d="M -24 -44 Q -26 -76 -10 -82 Q 4 -74 14 -82 Q 28 -76 26 -44 Z" fill={color ?? "#2E2A26"} />
        <rect x={-24} y={-54} width={50} height={8} fill={"#1A1714"} />
        <path d="M -40 -42 Q 0 -50 44 -46 Q 36 -38 0 -40 Q -30 -38 -40 -42 Z" fill={oscurecer(color ?? "#2E2A26", 0.9)} />
      </g>
    );
  if (g === "canotier")
    return (
      <g>
        <rect x={-26} y={-70} width={50} height={22} fill={"#D9C58E"} />
        <rect x={-26} y={-58} width={50} height={6} fill={"#2C2A28"} />
        <ellipse cx={0} cy={-48} rx={44} ry={6} fill={"#CDB878"} />
      </g>
    );
  if (g === "bombin")
    return (
      <g>
        <path d="M -24 -44 Q -26 -82 2 -84 Q 28 -82 26 -44 Z" fill={"#1B1E20"} />
        <ellipse cx={0} cy={-45} rx={38} ry={6} fill={"#1B1E20"} />
      </g>
    );
  if (g === "gorra") return <path d="M -30 -34 Q -26 -60 4 -60 Q 30 -58 30 -38 L 48 -32 Q 20 -28 -30 -34 Z" fill={color ?? "#4A4237"} />;
  if (g === "cloche")
    return (
      <g>
        <path d="M -34 -4 Q -38 -64 0 -64 Q 34 -62 32 -16 Q 20 -24 6 -24 L -18 -20 Q -30 -12 -34 -4 Z" fill={color ?? "#6B3A3A"} />
        <rect x={-34} y={-34} width={66} height={7} fill={oscurecer(color ?? "#6B3A3A", 0.7)} />
      </g>
    );
  if (g === "paja")
    return (
      <g>
        <ellipse cx={2} cy={-44} rx={58} ry={8} fill={"#C9AE6E"} />
        <path d="M -24 -44 Q -24 -78 2 -78 Q 28 -78 28 -44 Z" fill={"#D8BE7E"} />
        <rect x={-24} y={-54} width={52} height={7} fill={"#7A5A34"} />
      </g>
    );
  if (g === "policia")
    return (
      <g>
        <path d="M -28 -44 L -30 -76 Q 0 -86 30 -76 L 28 -44 Z" fill={"#1C2638"} />
        <path d="M 10 -44 L 46 -40 L 40 -34 L 10 -38 Z" fill={"#0E1118"} />
        <path d="M 20 -72 L 26 -66 L 20 -58 L 14 -66 Z" fill={C.laton} />
      </g>
    );
  return null;
};

export const Andante: React.FC<{
  x0: number;
  y: number;
  v: number;
  escala?: number;
  semilla: number;
  atuendo?: Atuendo;
  gorro?: Gorro;
  /** con v = 0, hacia donde mira: 1 derecha, -1 izquierda */
  dir?: 1 | -1;
  lleva?: "periodico" | "baston" | "maleta" | "bolso" | "nada";
  cabizbajo?: boolean;
}> = ({ x0, y, v, escala = 1, semilla, atuendo = "traje", gorro, dir: dirQuieto = 1, lleva, cabizbajo }) => {
  const f = useCurrentFrame();
  const L = look(semilla, atuendo, {}, gorro);
  const mujer = L.mujer;
  const piel = L.r.piel ?? PIELES[0];
  const pelo = L.r.pelo ?? PELOS[0];
  const abrigo = mujer ? L.vestido : atuendo === "granjero" ? L.pantalon : L.traje;
  const fase = rr(semilla, 9) * 6.28;
  const anda = v !== 0;
  const paso = anda ? Math.sin(f * 0.3 * Math.min(1.6, Math.abs(v) / 1.6) + fase) : 0;
  const bote = anda ? Math.abs(Math.cos(f * 0.3 + fase)) * 3 : Math.sin(f * 0.04 + fase) * 1.2;
  const px = x0 + v * f;
  const dir = anda ? (v < 0 ? -1 : 1) : dirQuieto;
  const nino = atuendo === "nino";
  const s = escala * (nino ? 0.64 : 1);
  const carga = lleva ?? (rr(semilla, 61) > 0.8 ? "periodico" : "nada");
  const pierna = (ang: number, color: string) => (
    <g transform={`rotate(${ang} 0 -190)`}>
      <rect x={-11} y={-192} width={22} height={186} rx={6} fill={color} />
      <path d="M -12 -10 L 22 -10 Q 30 -2 22 2 L -12 2 Z" fill={atuendo === "granjero" ? "#4A3424" : "#141618"} />
    </g>
  );
  const piernaMujer = (ang: number) => (
    <g transform={`rotate(${ang} 0 -110)`}>
      <rect x={-8} y={-112} width={16} height={106} rx={5} fill={oscurecer(piel, 0.88)} />
      <path d="M -10 -8 L 18 -8 Q 24 -2 18 2 L -10 2 Z" fill={"#2A1E18"} />
    </g>
  );
  const inclina = cabizbajo ? 8 : 0;
  return (
    <g transform={`translate(${px} ${y - bote}) scale(${s * dir} ${s})`}>
      <ellipse cx={0} cy={2} rx={44} ry={7} fill={"#000"} opacity={0.16} />
      {mujer ? (
        <g>
          {piernaMujer(-paso * 20)}
          {piernaMujer(paso * 20)}
        </g>
      ) : (
        <g>
          {pierna(-paso * 24, oscurecer(L.pantalon, 0.85))}
          {pierna(paso * 24, L.pantalon)}
        </g>
      )}
      {/* brazo de atras */}
      <g transform={`rotate(${paso * 20} 0 -318)`}>
        <rect x={-11} y={-322} width={22} height={150} rx={10} fill={oscurecer(abrigo, 0.8)} />
      </g>
      {/* cuerpo */}
      {mujer ? (
        <g>
          <path d={`M -26 -330 Q 4 -340 26 -326 L 30 -220 L ${40 - paso * 6} -100 L ${-38 - paso * 4} -100 L -30 -220 Z`} fill={abrigo} />
          <rect x={-30} y={-232} width={60} height={10} fill={oscurecer(abrigo, 0.75)} />
        </g>
      ) : atuendo === "obrero" || atuendo === "repartidor" ? (
        <g>
          <path d={`M -28 -330 Q 4 -342 28 -326 L 30 -200 L 32 -168 L -26 -168 Q -32 -220 -28 -330 Z`} fill={abrigo} />
          <path d="M 16 -334 L 30 -326 L 26 -300 L 14 -316 Z" fill={L.camisa} />
          <rect x={-28} y={-200} width={58} height={34} fill={oscurecer(L.pantalon, 0.9)} />
        </g>
      ) : atuendo === "granjero" ? (
        <g>
          <path d="M -28 -330 Q 4 -342 28 -326 L 30 -200 L -26 -200 Z" fill={L.camisa} />
          <path d="M -24 -290 L 26 -290 L 30 -180 L -26 -180 Z" fill={L.pantalon} />
          <path d="M -10 -330 L 0 -290" stroke={L.pantalon} strokeWidth={10} />
        </g>
      ) : (
        <g>
          <path d={`M -30 -330 Q 4 -342 30 -326 L 32 -230 Q 30 -180 ${34 - paso * 6} -160 L -28 -160 Q -34 -210 -30 -330 Z`} fill={abrigo} />
          <path d="M 20 -330 L 30 -326 L 32 -280 L 18 -300 Z" fill={oscurecer(abrigo, 0.78)} />
          <path d="M 18 -338 L 34 -332 L 30 -322 L 16 -328 Z" fill={atuendo === "policia" ? "#141A26" : "#F2EDE2"} />
          {atuendo === "policia" ? <rect x={-30} y={-210} width={62} height={10} fill={"#121722"} /> : null}
          {atuendo === "policia" ? <circle cx={22} cy={-292} r={5} fill={C.laton} /> : null}
        </g>
      )}
      {/* brazo de delante */}
      <g transform={`rotate(${-paso * 20 + (carga === "periodico" ? -40 : 0)} 0 -318)`}>
        <rect x={-12} y={-324} width={mujer ? 20 : 24} height={150} rx={11} fill={abrigo} />
        <ellipse cx={0} cy={-170} rx={11} ry={12} fill={piel} />
        {carga === "periodico" ? <rect x={-10} y={-200} width={46} height={34} fill={"#EDE6D3"} transform="rotate(30 0 -180)" /> : null}
        {carga === "baston" ? <rect x={-3} y={-176} width={6} height={170} fill={"#2A1E16"} /> : null}
        {carga === "maleta" ? (
          <g>
            <rect x={-30} y={-170} width={64} height={48} rx={4} fill={"#5A3F2A"} />
            <rect x={-6} y={-178} width={16} height={10} fill="none" stroke={"#3A2A1E"} strokeWidth={4} />
          </g>
        ) : null}
        {carga === "bolso" ? <rect x={-14} y={-176} width={30} height={26} rx={6} fill={"#2A1E18"} /> : null}
      </g>
      {/* cabeza de perfil */}
      <g transform={`translate(4 -380) rotate(${inclina}) scale(${nino ? 1.18 : 1})`}>
        <rect x={-8} y={20} width={18} height={26} fill={oscurecer(piel, 0.88)} />
        <path d="M -28 -16 Q -30 -44 0 -46 Q 26 -44 28 -18 L 30 -6 L 40 6 L 30 10 L 30 20 Q 26 36 6 38 Q -20 36 -26 18 Z" fill={piel} />
        {mujer ? (
          <path d="M -32 -10 Q -36 -50 0 -52 Q 26 -50 30 -26 Q 12 -34 -2 -30 L -6 18 Q -24 22 -34 14 Z" fill={pelo} />
        ) : (
          <path d="M -30 -10 Q -34 -46 0 -50 Q 24 -48 28 -26 Q 10 -34 -6 -30 Q -16 -24 -18 -8 Z" fill={pelo} />
        )}
        {mujer ? null : <ellipse cx={-6} cy={0} rx={6} ry={9} fill={oscurecer(piel, 0.82)} />}
        <circle cx={18} cy={-8} r={2.8} fill={"#2A2420"} />
        <rect x={12} y={-18} width={14} height={3.5} rx={1.5} fill={pelo} />
        {L.r.gafas ? <circle cx={20} cy={-8} r={8} fill="none" stroke={"#3A3026"} strokeWidth={2} /> : null}
        {L.r.bigote && L.r.bigote !== "ninguno" ? <path d="M 22 14 Q 32 10 38 18 Q 30 20 22 18 Z" fill={pelo} /> : null}
        <path d="M 22 26 L 32 25" stroke={mujer ? "#A8443A" : "#7A3E33"} strokeWidth={mujer ? 3 : 2} />
        <SombreroPerfil g={L.gorro} color={mujer ? oscurecer(L.vestido, 0.8) : undefined} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* De espaldas: publico sentado mirando la pizarra o la radio          */
/* ------------------------------------------------------------------ */

/** Persona vista de espaldas. (x, y) es la base del torso, que tapa una silla o el borde del cuadro. */
export const Espalda: React.FC<{ x: number; y: number; escala?: number; semilla: number; atuendo?: Atuendo; gorro?: Gorro; giro?: number }> = ({
  x,
  y,
  escala = 1,
  semilla,
  atuendo = "traje",
  gorro,
  giro = 0,
}) => {
  const f = useCurrentFrame();
  const L = look(semilla, atuendo, {}, gorro);
  const piel = L.r.piel ?? PIELES[0];
  const pelo = L.r.pelo ?? PELOS[0];
  const ropa = L.mujer ? L.vestido : L.traje;
  const mueve = Math.sin(f * 0.04 + semilla) * 2 + giro;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <path d="M -66 0 L -62 -150 Q -60 -176 -30 -182 L 30 -182 Q 60 -176 62 -150 L 66 0 Z" fill={ropa} />
      <path d="M -2 -182 L 2 -182 L 4 0 L -4 0 Z" fill={oscurecer(ropa, 0.85)} />
      {L.mujer ? null : <path d="M -16 -186 L 16 -186 L 12 -176 L -12 -176 Z" fill={"#F2EDE2"} />}
      <g transform={`translate(${mueve} -228) rotate(${mueve * 0.8})`}>
        <ellipse cx={-34} cy={4} rx={8} ry={12} fill={oscurecer(piel, 0.86)} />
        <ellipse cx={34} cy={4} rx={8} ry={12} fill={oscurecer(piel, 0.86)} />
        <ellipse cx={0} cy={0} rx={33} ry={44} fill={piel} />
        {L.r.peinado === "calvo" ? (
          <path d="M -33 -6 Q -30 30 0 40 Q 30 30 33 -6 Q 20 10 0 12 Q -20 10 -33 -6 Z" fill={pelo} />
        ) : (
          <path d={L.mujer ? "M -38 -10 Q -40 -50 0 -50 Q 40 -50 38 -10 L 38 24 Q 0 34 -38 24 Z" : "M -34 -4 Q -36 -46 0 -48 Q 36 -46 34 -4 Q 30 26 0 30 Q -30 26 -34 -4 Z"} fill={pelo} />
        )}
        <g transform="translate(0 4)">
          <SombreroFrente g={L.gorro === "canotier" || L.gorro === "bombin" || L.gorro === "gorra" ? "fedora" : L.gorro} color={L.mujer ? oscurecer(L.vestido, 0.8) : undefined} />
        </g>
      </g>
    </g>
  );
};
