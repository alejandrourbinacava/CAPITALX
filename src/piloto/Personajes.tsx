import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * Personajes con cara para el montaje ilustrado.
 *
 * Dos vistas: de frente (`Persona`, para planos medios y primeros planos) y de
 * perfil (`Transeunte`, para la gente que cruza la calle). Ninguno es una
 * persona real: son tipos de 1914 -corredores, oficinistas, banqueros,
 * vendedores de periodicos- con rasgos sacados de una semilla, para que una
 * multitud no parezca clonada.
 */

export const PIELES = ["#EBC9A6", "#E2B892", "#D6A47E", "#C38E68", "#A56F4E", "#7E5139"];
export const PELOS = ["#2A201B", "#3F2E24", "#5E4330", "#7A5E44", "#A8988A", "#D9D4CC"];
export const TELAS = ["#262C30", "#3A3530", "#4A4F52", "#2F3A40", "#4B3D33", "#3D3A45", "#56483B", "#2C3532"];

const rr = (i: number, k = 1) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

const oscurecer = (hex: string, f = 0.82) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
};

export type Rasgos = {
  piel?: string;
  pelo?: string;
  peinado?: "raya" | "calvo" | "ondulado" | "corto";
  bigote?: "ninguno" | "morsa" | "manillar" | "fino" | "cepillo";
  barba?: "ninguna" | "perilla" | "completa" | "patillas";
  edad?: "joven" | "maduro" | "mayor";
  gafas?: boolean;
  sombrero?: "bombin" | "chistera" | "gorra" | "canotier" | "ninguno";
  abrigo?: string;
  chaleco?: string;
  pantalon?: string;
  corbata?: string;
  /** Uniforme de portero de la Bolsa: levita azul con cuello rojo y galon en el sombrero. */
  librea?: boolean;
};

/** Rasgos variados a partir de una semilla. */
export const rasgosDe = (s: number, extra: Rasgos = {}): Rasgos => {
  const edadR = rr(s, 1);
  const edad: Rasgos["edad"] = edadR < 0.3 ? "joven" : edadR < 0.75 ? "maduro" : "mayor";
  const pelo = edad === "mayor" ? PELOS[4 + Math.floor(rr(s, 2) * 2)] : PELOS[Math.floor(rr(s, 2) * 4)];
  const bigotes: Rasgos["bigote"][] = ["morsa", "manillar", "fino", "cepillo", "ninguno", "morsa"];
  const barbas: Rasgos["barba"][] = ["ninguna", "ninguna", "ninguna", "perilla", "completa", "patillas"];
  const peinados: Rasgos["peinado"][] = ["raya", "raya", "corto", "ondulado"];
  const sombreros: Rasgos["sombrero"][] = ["bombin", "chistera", "bombin", "canotier", "gorra"];
  return {
    piel: PIELES[Math.floor(rr(s, 3) * 3)],
    pelo,
    peinado: edad === "mayor" && rr(s, 4) > 0.5 ? "calvo" : peinados[Math.floor(rr(s, 5) * peinados.length)],
    bigote: edad === "joven" && rr(s, 6) > 0.5 ? "ninguno" : bigotes[Math.floor(rr(s, 7) * bigotes.length)],
    barba: barbas[Math.floor(rr(s, 8) * barbas.length)],
    edad,
    gafas: rr(s, 9) > 0.78,
    sombrero: sombreros[Math.floor(rr(s, 10) * sombreros.length)],
    abrigo: TELAS[Math.floor(rr(s, 11) * TELAS.length)],
    chaleco: TELAS[Math.floor(rr(s, 12) * TELAS.length)],
    pantalon: oscurecer(TELAS[Math.floor(rr(s, 13) * TELAS.length)], 0.85),
    corbata: ["#5B1F1C", "#1F2B3C", "#2A2A2A", "#3D4A2E"][Math.floor(rr(s, 14) * 4)],
    ...extra,
  };
};

/* ------------------------------------------------------------------ */
/* Cabeza de frente                                                    */
/* ------------------------------------------------------------------ */

export const Cabeza: React.FC<{
  r: Rasgos;
  semilla: number;
  mirada?: number;
  habla?: boolean;
  gesto?: "neutro" | "inquieto" | "serio" | "sorpresa";
  sinSombrero?: boolean;
}> = ({ r, semilla, mirada = 0, habla, gesto = "neutro", sinSombrero }) => {
  const f = useCurrentFrame();
  const piel = r.piel ?? PIELES[0];
  const sombra = oscurecer(piel, 0.86);
  const pelo = r.pelo ?? PELOS[0];
  // parpadeo: cerrado 4 fotogramas cada 90-140
  const ciclo = 90 + Math.floor(rr(semilla, 21) * 50);
  const fase = (f + Math.floor(rr(semilla, 22) * ciclo)) % ciclo;
  const parpado = fase < 2 ? 0.5 : fase < 4 ? 1 : 0;
  const boca = habla ? Math.max(0, Math.sin(f * 0.9 + semilla) * 0.6 + Math.sin(f * 0.37) * 0.5) : 0;
  const ceja =
    gesto === "inquieto" ? { a: 14, y: -3 } : gesto === "serio" ? { a: -12, y: 2 } : gesto === "sorpresa" ? { a: 4, y: -7 } : { a: 0, y: 0 };
  const ojo = gesto === "sorpresa" ? 1.25 : 1;
  const px = mirada * 3;
  return (
    <g>
      {/* orejas */}
      <ellipse cx={-35} cy={2} rx={8} ry={12} fill={sombra} />
      <ellipse cx={35} cy={2} rx={8} ry={12} fill={sombra} />
      <path d="M -37 -3 Q -33 2 -37 8" fill="none" stroke={oscurecer(piel, 0.72)} strokeWidth={2} />
      <path d="M 37 -3 Q 33 2 37 8" fill="none" stroke={oscurecer(piel, 0.72)} strokeWidth={2} />
      {/* cara */}
      <path d="M -33 -14 Q -34 -46 0 -48 Q 34 -46 33 -14 L 31 14 Q 26 40 0 46 Q -26 40 -31 14 Z" fill={piel} />
      {/* sombra lateral: la luz viene de la izquierda */}
      <path d="M 14 -46 Q 34 -44 33 -14 L 31 14 Q 26 40 0 46 Q 22 30 22 6 Q 24 -24 14 -46 Z" fill={sombra} opacity={0.7} />
      {/* arrugas */}
      {r.edad !== "joven" ? (
        <g stroke={oscurecer(piel, 0.75)} strokeWidth={1.6} fill="none" opacity={r.edad === "mayor" ? 0.9 : 0.5}>
          <path d="M -14 -33 Q 0 -36 14 -33" />
          {r.edad === "mayor" ? <path d="M -12 -28 Q 0 -30 12 -28" /> : null}
          <path d="M -18 16 Q -20 22 -16 28" />
          <path d="M 18 16 Q 20 22 16 28" />
        </g>
      ) : null}
      {/* pelo */}
      {r.peinado === "calvo" ? (
        <g fill={pelo}>
          <path d="M -34 -20 Q -36 -6 -32 6 L -28 4 Q -30 -8 -28 -20 Z" />
          <path d="M 34 -20 Q 36 -6 32 6 L 28 4 Q 30 -8 28 -20 Z" />
        </g>
      ) : r.peinado === "ondulado" ? (
        <path d="M -36 -8 Q -42 -40 -18 -54 Q 4 -62 22 -54 Q 42 -44 36 -8 Q 32 -30 18 -36 Q 0 -44 -14 -38 Q -30 -30 -36 -8 Z" fill={pelo} />
      ) : r.peinado === "corto" ? (
        <path d="M -34 -12 Q -36 -46 0 -52 Q 36 -46 34 -12 Q 32 -34 0 -40 Q -32 -34 -34 -12 Z" fill={pelo} />
      ) : (
        <path d="M -35 -10 Q -38 -48 -6 -53 Q 34 -54 35 -14 Q 30 -36 -2 -42 L -10 -38 Q -26 -36 -35 -10 Z" fill={pelo} />
      )}
      {r.barba === "patillas" || r.barba === "completa" ? (
        <g fill={pelo}>
          <path d="M -33 -4 L -27 -4 L -24 24 L -31 16 Z" />
          <path d="M 33 -4 L 27 -4 L 24 24 L 31 16 Z" />
        </g>
      ) : null}
      {/* cejas */}
      <rect x={-22} y={-24 + ceja.y} width={16} height={4.5} rx={2} fill={pelo} transform={`rotate(${ceja.a} -14 ${-22 + ceja.y})`} />
      <rect x={6} y={-24 + ceja.y} width={16} height={4.5} rx={2} fill={pelo} transform={`rotate(${-ceja.a} 14 ${-22 + ceja.y})`} />
      {/* ojos */}
      {[-14, 14].map((ox) => (
        <g key={ox}>
          <ellipse cx={ox} cy={-11} rx={7 * ojo} ry={5 * ojo} fill={"#F6F1E6"} />
          <circle cx={ox + px} cy={-11} r={3.8} fill={"#2A2420"} />
          <circle cx={ox + px + 1.2} cy={-12.4} r={1.1} fill={"#FFFFFF"} />
          <rect x={ox - 8} y={-17} width={16} height={12 * parpado} fill={piel} />
          <path d={`M ${ox - 7} -14 Q ${ox} -18 ${ox + 7} -14`} fill="none" stroke={oscurecer(piel, 0.6)} strokeWidth={1.5} />
        </g>
      ))}
      {r.gafas ? (
        <g fill="none" stroke={"#3A3026"} strokeWidth={2}>
          <circle cx={-14} cy={-11} r={10} />
          <circle cx={14} cy={-11} r={10} />
          <path d="M -4 -12 Q 0 -15 4 -12" />
        </g>
      ) : null}
      {/* nariz */}
      <path d="M -1 -8 Q -6 6 -6 10 Q -2 14 4 11" fill="none" stroke={oscurecer(piel, 0.7)} strokeWidth={2} strokeLinecap="round" />
      <path d="M 2 -6 Q 7 6 5 11 L 1 12 Z" fill={sombra} opacity={0.6} />
      {/* boca */}
      {boca > 0.05 ? (
        <ellipse cx={0} cy={24} rx={8} ry={1.5 + boca * 6} fill={"#5A2620"} />
      ) : (
        <path d={gesto === "serio" || gesto === "inquieto" ? "M -8 25 Q 0 22 8 25" : "M -8 23 Q 0 26 8 23"} fill="none" stroke={"#7A3E33"} strokeWidth={2.4} strokeLinecap="round" />
      )}
      {/* bigote y barba */}
      {r.bigote === "morsa" ? (
        <path d="M -16 20 Q -10 12 0 15 Q 10 12 16 20 Q 12 24 6 21 Q 0 19 -6 21 Q -12 24 -16 20 Z" fill={pelo} />
      ) : r.bigote === "manillar" ? (
        <path d="M -20 12 Q -18 20 -10 18 Q -4 14 0 16 Q 4 14 10 18 Q 18 20 20 12 Q 16 18 10 14 Q 4 11 0 13 Q -4 11 -10 14 Q -16 18 -20 12 Z" fill={pelo} />
      ) : r.bigote === "fino" ? (
        <path d="M -11 17 Q 0 13 11 17 Q 0 16 -11 17 Z" fill={pelo} stroke={pelo} strokeWidth={2} />
      ) : r.bigote === "cepillo" ? (
        <rect x={-7} y={13} width={14} height={6} rx={2} fill={pelo} />
      ) : null}
      {r.barba === "perilla" ? <path d="M -7 30 Q 0 46 7 30 Q 0 34 -7 30 Z" fill={pelo} /> : null}
      {r.barba === "completa" ? <path d="M -30 10 Q -28 44 0 52 Q 28 44 30 10 Q 22 30 8 32 Q 0 30 -8 32 Q -22 30 -30 10 Z" fill={pelo} /> : null}
      {/* sombrero */}
      {sinSombrero || r.sombrero === "ninguno" ? null : r.sombrero === "chistera" ? (
        <g>
          <rect x={-29} y={-104} width={58} height={56} rx={4} fill={"#16191B"} />
          <rect x={-29} y={-60} width={58} height={8} fill={r.librea ? "#C9A23A" : "#2A2E30"} />
          <ellipse cx={0} cy={-49} rx={44} ry={7} fill={"#16191B"} />
        </g>
      ) : r.sombrero === "bombin" ? (
        <g>
          <path d="M -27 -48 Q -28 -86 0 -88 Q 28 -86 27 -48 Z" fill={"#1B1E20"} />
          <rect x={-27} y={-56} width={54} height={6} fill={"#2C3032"} />
          <ellipse cx={0} cy={-48} rx={42} ry={7} fill={"#1B1E20"} />
        </g>
      ) : r.sombrero === "canotier" ? (
        <g>
          <rect x={-28} y={-72} width={56} height={22} fill={"#D9C58E"} />
          <rect x={-28} y={-60} width={56} height={7} fill={"#2C2A28"} />
          <ellipse cx={0} cy={-50} rx={48} ry={7} fill={"#CDB878"} />
          <ellipse cx={0} cy={-72} rx={28} ry={4} fill={"#E3D19E"} />
        </g>
      ) : (
        <path d="M -34 -38 Q -30 -64 2 -64 Q 30 -62 34 -42 L 46 -38 Q 20 -34 -34 -38 Z" fill={"#4A4237"} />
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Persona de frente                                                   */
/* ------------------------------------------------------------------ */

export type Pose = "quieto" | "habla" | "senala" | "lee" | "escribe" | "brazos" | "telegrama";

/**
 * Persona de frente, con los pies en (x, y). A escala 1 mide unos 430 px.
 * `cuerpo: "busto"` dibuja solo de la cintura para arriba (detras de una mesa).
 */
export const Persona: React.FC<{
  x: number;
  y: number;
  escala?: number;
  semilla: number;
  rasgos?: Rasgos;
  pose?: Pose;
  mirada?: number;
  gesto?: "neutro" | "inquieto" | "serio" | "sorpresa";
  habla?: boolean;
  cuerpo?: "entero" | "busto";
  espejo?: boolean;
}> = ({ x, y, escala = 1, semilla, rasgos, pose = "quieto", mirada = 0, gesto = "neutro", habla, cuerpo = "entero", espejo }) => {
  const f = useCurrentFrame();
  const r = rasgos ?? rasgosDe(semilla);
  const abrigo = r.librea ? "#1F2E52" : r.abrigo ?? TELAS[0];
  const solapa = oscurecer(abrigo, 0.78);
  const chaleco = r.chaleco ?? TELAS[2];
  const pantalon = r.pantalon ?? "#25292B";
  const piel = r.piel ?? PIELES[0];
  const respira = Math.sin(f * 0.07 + semilla) * 1.2;
  const hablaAhora = habla ?? pose === "habla";
  const gestoBrazo = pose === "habla" ? Math.sin(f * 0.18 + semilla) * 14 - 24 : 0;
  // brazos: angulo en el hombro (0 = colgando) y del antebrazo
  let brazoI = 6, anteI = 0, brazoD = -6, anteD = 0;
  // angulo positivo = horario. El brazo izquierdo (x<0) va hacia dentro con
  // angulos negativos; el derecho (x>0), con positivos.
  if (pose === "habla") { brazoD = 10; anteD = 40 - gestoBrazo; }
  if (pose === "senala") { brazoD = -112; anteD = -6; }
  if (pose === "lee" || pose === "telegrama") { brazoI = -24; anteI = -78; brazoD = 24; anteD = 78; }
  if (pose === "escribe") { brazoD = 20; anteD = 66 + Math.sin(f * 0.5) * 6; brazoI = -16; anteI = -60; }
  if (pose === "brazos") { brazoI = -16; anteI = -100; brazoD = 16; anteD = 100; }

  const brazo = (lado: 1 | -1, ang: number, ante: number) => (
    <g transform={`translate(${lado * -58} -318) rotate(${ang})`}>
      <rect x={-13} y={-4} width={26} height={84} rx={12} fill={abrigo} />
      <g transform={`translate(0 76) rotate(${ante})`}>
        <rect x={-12} y={-6} width={24} height={78} rx={11} fill={abrigo} />
        <rect x={-12} y={62} width={24} height={9} fill={"#EFE9DC"} />
        <ellipse cx={0} cy={80} rx={11} ry={13} fill={piel} />
      </g>
    </g>
  );

  const torso = (
    <g transform={`translate(0 ${respira * 0.4})`}>
      {/* levita */}
      <path d="M -62 -322 Q 0 -340 62 -322 L 58 -230 Q 62 -190 66 -150 L 6 -150 L 0 -240 L -6 -150 L -66 -150 Q -62 -190 -58 -230 Z" fill={abrigo} />
      {/* chaleco y camisa */}
      <path d="M -24 -326 L 24 -326 L 18 -236 L 0 -228 L -18 -236 Z" fill={chaleco} />
      <path d="M -14 -332 L 14 -332 L 0 -296 Z" fill={"#F2EDE2"} />
      {pose === "lee" || pose === "telegrama" ? null : (
        <path d="M -9 -318 Q 0 -318 9 -318 Q 0 -324 -9 -318" fill={"#EDE7DA"} />
      )}
      {/* corbata */}
      <path d="M -6 -322 L 6 -322 L 4 -304 L 0 -296 L -4 -304 Z" fill={r.corbata} />
      {/* botones y cadena de reloj */}
      {[-286, -270, -254].map((by) => (
        <circle key={by} cx={0} cy={by} r={2.6} fill={oscurecer(chaleco, 0.6)} />
      ))}
      <path d="M -16 -262 Q -4 -250 12 -266" fill="none" stroke={"#C9A23A"} strokeWidth={2.2} />
      {/* solapas */}
      <path d="M -26 -332 L -10 -330 L -2 -270 L -20 -300 Z" fill={solapa} />
      <path d="M 26 -332 L 10 -330 L 2 -270 L 20 -300 Z" fill={solapa} />
      {r.librea ? (
        <g>
          <rect x={-26} y={-336} width={52} height={12} fill={"#A8302A"} />
          {[-286, -258, -230].map((by) => (
            <g key={by}>
              <circle cx={-30} cy={by} r={4} fill={"#C9A23A"} />
              <circle cx={30} cy={by} r={4} fill={"#C9A23A"} />
            </g>
          ))}
        </g>
      ) : null}
      {/* bolsillo con pañuelo */}
      <rect x={28} y={-296} width={20} height={4} fill={solapa} />
      {rr(semilla, 31) > 0.6 ? <path d="M 32 -296 L 36 -304 L 40 -297 L 44 -303 L 46 -296 Z" fill={"#EDE7DA"} /> : null}
      {/* cuello */}
      <rect x={-12} y={-352} width={24} height={22} fill={oscurecer(piel, 0.9)} />
      <path d="M -16 -336 L 0 -328 L 16 -336 L 14 -344 L 0 -338 L -14 -344 Z" fill={"#F7F2E8"} />
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${(espejo ? -1 : 1) * escala} ${escala})`}>
      {cuerpo === "busto" ? (
        <g>
          {/* el cuerpo no acaba en la cintura: sigue hasta fuera del cuadro */}
          <rect x={-64} y={-170} width={128} height={900} fill={abrigo} />
          <rect x={-6} y={-240} width={12} height={970} fill={oscurecer(abrigo, 0.85)} />
        </g>
      ) : null}
      {cuerpo === "entero" ? (
        <g>
          <ellipse cx={0} cy={0} rx={70} ry={10} fill={"#000"} opacity={0.18} />
          <rect x={-34} y={-200} width={29} height={192} fill={pantalon} />
          <rect x={5} y={-200} width={29} height={192} fill={pantalon} />
          <rect x={-8} y={-200} width={4} height={190} fill={oscurecer(pantalon, 0.8)} />
          <ellipse cx={-24} cy={-6} rx={24} ry={10} fill={"#141618"} />
          <ellipse cx={24} cy={-6} rx={24} ry={10} fill={"#141618"} />
          <ellipse cx={-30} cy={-10} rx={8} ry={3} fill={"#3A3E40"} />
        </g>
      ) : null}
      {brazo(1, brazoI, anteI)}
      {torso}
      {brazo(-1, brazoD, anteD)}
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
      {pose === "telegrama" ? (
        <g transform="translate(0 -258) rotate(4)">
          <rect x={-56} y={-40} width={112} height={80} fill={"#F2E7C4"} />
          <rect x={-48} y={-32} width={96} height={10} fill={"#8E7B4F"} />
          {Array.from({ length: 4 }).map((_, i) => (
            <rect key={i} x={-48} y={-14 + i * 12} width={i === 3 ? 60 : 96} height={5} fill={"#3A3530"} opacity={0.7} />
          ))}
        </g>
      ) : null}
      <g transform={`translate(0 ${-396 + respira})`}>
        <Cabeza r={r} semilla={semilla} mirada={mirada} habla={hablaAhora} gesto={gesto} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Transeunte de perfil                                                */
/* ------------------------------------------------------------------ */

/**
 * Gente que cruza la calle, de perfil, con nariz, ojo, bigote y su
 * sombrero. `x0` es la posicion en el fotograma 0 y `v` px por fotograma.
 */
export const Transeunte: React.FC<{
  x0: number;
  y: number;
  v: number;
  escala?: number;
  semilla: number;
  rasgos?: Rasgos;
  baston?: boolean;
  periodico?: boolean;
  falda?: boolean;
}> = ({ x0, y, v, escala = 1, semilla, rasgos, baston, periodico, falda }) => {
  const f = useCurrentFrame();
  const r = rasgos ?? rasgosDe(semilla);
  const abrigo = r.abrigo ?? TELAS[0];
  const piel = r.piel ?? PIELES[0];
  const pelo = r.pelo ?? PELOS[0];
  const fase = rr(semilla, 9) * 6.28;
  const anda = v !== 0;
  const paso = anda ? Math.sin(f * 0.3 * Math.min(1.6, Math.abs(v) / 1.6) + fase) : 0;
  const bote = anda ? Math.abs(Math.cos(f * 0.3 + fase)) * 3 : 0;
  const px = x0 + v * f;
  const dir = v < 0 ? -1 : 1;
  const pierna = (ang: number, color: string) => (
    <g transform={`rotate(${ang} 0 -190)`}>
      <rect x={-11} y={-192} width={22} height={186} rx={6} fill={color} />
      <path d="M -12 -10 L 22 -10 Q 30 -2 22 2 L -12 2 Z" fill={"#141618"} />
    </g>
  );
  return (
    <g transform={`translate(${px} ${y - bote}) scale(${escala * dir} ${escala})`}>
      <ellipse cx={0} cy={2} rx={44} ry={7} fill={"#000"} opacity={0.16} />
      {falda ? (
        <path d={`M -36 -150 L 36 -150 L ${48 + paso * 6} -4 L ${-48 + paso * 6} -4 Z`} fill={abrigo} />
      ) : (
        <g>
          {pierna(-paso * 24, oscurecer(r.pantalon ?? "#25292B", 0.85))}
          {pierna(paso * 24, r.pantalon ?? "#25292B")}
        </g>
      )}
      {/* brazo de atras */}
      <g transform={`rotate(${paso * 20} 0 -318)`}>
        <rect x={-11} y={-322} width={22} height={150} rx={10} fill={oscurecer(abrigo, 0.8)} />
      </g>
      {/* levita de perfil con faldon */}
      <path d={`M -30 -330 Q 4 -342 30 -326 L 32 -230 Q 30 -170 ${38 - paso * 6} -136 L -26 -136 Q -34 -200 -30 -330 Z`} fill={abrigo} />
      <path d="M 20 -330 L 30 -326 L 32 -280 L 18 -300 Z" fill={oscurecer(abrigo, 0.78)} />
      <path d="M 18 -338 L 34 -332 L 30 -322 L 16 -328 Z" fill={"#F2EDE2"} />
      {/* brazo de delante */}
      <g transform={`rotate(${-paso * 20 + (periodico ? -40 : 0)} 0 -318)`}>
        <rect x={-12} y={-324} width={24} height={150} rx={11} fill={abrigo} />
        <ellipse cx={0} cy={-170} rx={11} ry={12} fill={piel} />
        {periodico ? <rect x={-10} y={-200} width={46} height={34} fill={"#EDE6D3"} transform="rotate(30 0 -180)" /> : null}
        {baston ? <rect x={-3} y={-176} width={6} height={170} fill={"#2A1E16"} /> : null}
      </g>
      {/* cabeza de perfil */}
      <g transform="translate(4 -380)">
        <rect x={-8} y={20} width={18} height={26} fill={oscurecer(piel, 0.88)} />
        <path d="M -28 -16 Q -30 -44 0 -46 Q 26 -44 28 -18 L 30 -6 L 40 6 L 30 10 L 30 20 Q 26 36 6 38 Q -20 36 -26 18 Z" fill={piel} />
        <path d="M -30 -10 Q -34 -46 0 -50 Q 24 -48 28 -26 Q 10 -34 -6 -30 Q -16 -24 -18 -8 Z" fill={pelo} />
        <ellipse cx={-6} cy={0} rx={6} ry={9} fill={oscurecer(piel, 0.82)} />
        <circle cx={18} cy={-8} r={2.8} fill={"#2A2420"} />
        <rect x={12} y={-18} width={14} height={3.5} rx={1.5} fill={pelo} />
        {r.bigote && r.bigote !== "ninguno" ? <path d="M 22 14 Q 32 10 38 18 Q 30 20 22 18 Z" fill={pelo} /> : null}
        {r.barba === "completa" ? <path d="M -16 14 Q -8 40 14 38 Q 30 30 30 18 Q 18 26 4 24 Z" fill={pelo} /> : null}
        <path d="M 22 26 L 32 25" stroke={"#7A3E33"} strokeWidth={2} />
        {r.sombrero === "chistera" ? (
          <g>
            <rect x={-26} y={-102} width={50} height={56} rx={3} fill={"#16191B"} />
            <ellipse cx={0} cy={-46} rx={40} ry={6} fill={"#16191B"} />
          </g>
        ) : r.sombrero === "canotier" ? (
          <g>
            <rect x={-26} y={-70} width={50} height={22} fill={"#D9C58E"} />
            <rect x={-26} y={-58} width={50} height={6} fill={"#2C2A28"} />
            <ellipse cx={0} cy={-48} rx={44} ry={6} fill={"#CDB878"} />
          </g>
        ) : r.sombrero === "gorra" ? (
          <path d="M -30 -34 Q -26 -60 4 -60 Q 30 -58 30 -38 L 46 -34 Q 20 -30 -30 -34 Z" fill={"#4A4237"} />
        ) : (
          <g>
            <path d="M -24 -44 Q -26 -82 2 -84 Q 28 -82 26 -44 Z" fill={"#1B1E20"} />
            <ellipse cx={0} cy={-45} rx={38} ry={6} fill={"#1B1E20"} />
          </g>
        )}
      </g>
    </g>
  );
};
