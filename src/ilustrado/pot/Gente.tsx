import React from "react";
import { useCurrentFrame } from "remotion";
import { Cabeza, type Rasgos } from "../../piloto/Personajes";
import { C, osc, rr } from "./comun";

/**
 * Gente de Potosi, siglos XVI-XVII (y de hoy). Las caras son la `Cabeza` del
 * piloto, para que todo el canal tenga el mismo estilo; el vestuario es propio:
 *
 *  - andinos: unku (camiseta) con franja de tocapus, yacolla (manta) anudada,
 *    calzon, ojotas y chullo o montera;
 *  - andinas: aqsu (falda larga) con chumpi (faja), lliclla (manta de hombros)
 *    prendida con un tupu de plata, trenzas y montera;
 *  - espanoles: jubon, gola, greguescos, calzas, capa y sombrero de ala;
 *    clerigos con sotana y bonete; mercaderes y oficiales;
 *  - mercaderes chinos de la dinastia Ming, con su tunica y su gorro;
 *  - mineros de cooperativa de hoy, con casco y lampara.
 *
 * Nadie es una persona real: los rasgos salen de una semilla.
 */

export type Traje =
  | "andino"
  | "andina"
  | "espanol"
  | "noble"
  | "clerigo"
  | "mercader"
  | "chino"
  | "minero"
  | "cholita"
  | "moderno"
  | "europea"
  | "campesino"
  | "artesano";

const PIEL_ANDINA = ["#C38E68", "#A56F4E", "#B07A55", "#8E5E40", "#7E5139", "#9C6A49"];
const PIEL_EUROPEA = ["#EBC9A6", "#E2B892", "#D6A47E", "#DDB08A"];
const PIEL_CHINA = ["#E2BC92", "#D9AE84", "#E8C49C"];
const PELO_NEGRO = ["#1C1816", "#241D19", "#2A201B", "#1F1A1A"];
const PELO_EUROPEO = ["#2A201B", "#3F2E24", "#5E4330", "#7A5E44"];
const CANAS = ["#A8A29A", "#C9C4BC", "#D9D4CC"];

/** Tintes de la ropa andina: grana, anil, nogal, verde, ocre. */
export const TINTES = ["#8E2F2A", "#3E4E6B", "#6B5236", "#2F4A3F", "#9A6A2A", "#5A2E44", "#7A3A26", "#46504E"];
const FAJAS = ["#C8402C", "#E8B33C", "#2E5A4E", "#B0347A", "#3E4E8A", "#D97A2C"];

export type Persona = {
  traje: Traje;
  semilla: number;
  edad?: "nino" | "joven" | "maduro" | "mayor";
  /** Sombrero o gorro. Por defecto el del traje. */
  gorro?: "chullo" | "montera" | "ninguno" | "ala" | "bonete" | "ming" | "casco" | "bombin" | "toca" | "paja" | "gorra";
  color?: string;
  color2?: string;
  barba?: Rasgos["barba"];
  bigote?: Rasgos["bigote"];
  gafas?: boolean;
  calvo?: boolean;
  cruz?: boolean;
};

const tono = (lista: string[], s: number, k: number) => lista[Math.floor(rr(s, k) * lista.length) % lista.length];

/** Rasgos de la cabeza a partir del traje y la semilla. */
export const rasgosPot = (p: Persona): Rasgos & { mujer: boolean } => {
  const s = p.semilla;
  const mujer = p.traje === "andina" || p.traje === "cholita" || p.traje === "europea";
  const edadR = rr(s, 1);
  const edad = p.edad ?? (edadR < 0.35 ? "joven" : edadR < 0.8 ? "maduro" : "mayor");
  const andino = ["andino", "andina", "minero", "cholita", "moderno"].includes(p.traje);
  const chino = p.traje === "chino" || p.traje === "campesino";
  const piel = andino ? tono(PIEL_ANDINA, s, 3) : chino ? tono(PIEL_CHINA, s, 3) : tono(PIEL_EUROPEA, s, 3);
  const pelo = edad === "mayor" ? tono(CANAS, s, 2) : andino || chino ? tono(PELO_NEGRO, s, 2) : tono(PELO_EUROPEO, s, 2);
  const europeo = ["espanol", "noble", "mercader", "clerigo", "europea", "artesano"].includes(p.traje);
  return {
    mujer,
    piel,
    pelo,
    edad: edad === "nino" ? "joven" : edad,
    peinado: p.calvo ? "calvo" : mujer ? "raya" : andino ? "corto" : europeo && edad === "mayor" && rr(s, 4) > 0.6 ? "calvo" : "corto",
    bigote:
      p.bigote ??
      (mujer || edad === "nino"
        ? "ninguno"
        : europeo
          ? (["manillar", "fino", "manillar", "morsa"] as const)[Math.floor(rr(s, 7) * 4)]
          : chino
            ? "fino"
            : rr(s, 7) > 0.85
              ? "fino"
              : "ninguno"),
    barba:
      p.barba ??
      (mujer || edad === "nino"
        ? "ninguna"
        : europeo
          ? p.traje === "clerigo" && rr(s, 8) > 0.4
            ? "ninguna"
            : (["perilla", "completa", "perilla"] as const)[Math.floor(rr(s, 8) * 3)]
          : chino
            ? "perilla"
            : "ninguna"),
    gafas: p.gafas ?? false,
    sombrero: "ninguno",
  };
};

/* ------------------------------------------------------------------ */
/* Sombreros (en coordenadas de la cabeza de frente)                    */
/* ------------------------------------------------------------------ */

const GorroFrente: React.FC<{ g: NonNullable<Persona["gorro"]>; color: string; color2: string; mujer: boolean }> = ({ g, color, color2, mujer }) => {
  if (g === "chullo")
    return (
      <g>
        <path d="M -38 -6 Q -42 -60 0 -62 Q 42 -60 38 -6 L 38 26 Q 33 32 28 26 L 29 -10 Q 0 -24 -29 -10 L -28 26 Q -33 32 -38 26 Z" fill={color} />
        <path d="M -40 -34 Q 0 -48 40 -34 L 40 -26 Q 0 -40 -40 -26 Z" fill={color2} />
        {[-24, -8, 8, 24].map((x) => (
          <path key={x} d={`M ${x - 5} -46 L ${x} -54 L ${x + 5} -46 Z`} fill={color2} />
        ))}
        <path d="M -40 -16 Q 0 -30 40 -16" stroke={"#EDE3C8"} strokeWidth={3} fill="none" />
        <path d="M -33 30 L -35 46 M 33 30 L 35 46" stroke={color2} strokeWidth={3} />
        <circle cx={-35} cy={48} r={4} fill={color2} />
        <circle cx={35} cy={48} r={4} fill={color2} />
        <circle cx={0} cy={-64} r={7} fill={color2} />
      </g>
    );
  if (g === "montera")
    return (
      <g>
        <ellipse cx={0} cy={-44} rx={mujer ? 60 : 56} ry={10} fill={osc(color, 0.8)} />
        <path d="M -34 -46 Q -36 -74 0 -76 Q 36 -74 34 -46 Z" fill={color} />
        <rect x={-34} y={-56} width={68} height={8} fill={color2} />
        {mujer ? <path d="M -60 -44 Q -62 -36 -56 -34 L 56 -34 Q 62 -36 60 -44 Z" fill={C.carmin} opacity={0.9} /> : null}
        {mujer ? (
          <g fill={C.ocre}>
            {[-48, -32, -16, 0, 16, 32, 48].map((x) => (
              <circle key={x} cx={x} cy={-32} r={2.4} />
            ))}
          </g>
        ) : null}
      </g>
    );
  if (g === "ala")
    return (
      <g>
        <ellipse cx={0} cy={-46} rx={72} ry={12} fill={osc(color, 0.85)} />
        <path d="M -30 -48 Q -32 -84 0 -86 Q 32 -84 30 -48 Z" fill={color} />
        <rect x={-30} y={-58} width={60} height={8} fill={color2} />
        <path d="M 24 -58 Q 58 -74 52 -98 Q 46 -76 22 -66 Z" fill={"#EDE6D6"} opacity={0.9} />
      </g>
    );
  if (g === "bonete")
    return (
      <g>
        <path d="M -32 -40 L -30 -84 L 30 -84 L 32 -40 Z" fill={"#1A1A1C"} />
        <path d="M -12 -84 L -10 -44 M 12 -84 L 10 -44" stroke={"#2C2C30"} strokeWidth={4} />
        <circle cx={0} cy={-88} r={6} fill={"#1A1A1C"} />
      </g>
    );
  if (g === "ming")
    return (
      <g>
        <path d="M -32 -36 L -34 -96 L 34 -96 L 32 -36 Z" fill={"#18191C"} />
        <path d="M -34 -96 L 34 -96 L 30 -88 L -30 -88 Z" fill={"#2A2C30"} />
        <path d="M -32 -46 L 32 -46" stroke={"#2A2C30"} strokeWidth={3} />
      </g>
    );
  if (g === "casco")
    return (
      <g>
        <path d="M -40 -34 Q -42 -84 0 -86 Q 42 -84 40 -34 Z" fill={color} />
        <rect x={-50} y={-38} width={100} height={8} rx={4} fill={osc(color, 0.82)} />
        <path d="M -6 -84 L -4 -38 M 6 -84 L 4 -38" stroke={osc(color, 0.88)} strokeWidth={4} />
        <rect x={-13} y={-66} width={26} height={20} rx={5} fill={"#2A2C2E"} />
        <circle cx={0} cy={-56} r={7} fill={"#FFF2C4"} />
      </g>
    );
  if (g === "toca")
    return (
      <g>
        <path d="M -42 10 Q -48 -58 0 -62 Q 48 -58 42 10 L 34 14 Q 36 -40 0 -46 Q -36 -40 -34 14 Z" fill={"#F2EDE2"} />
        <path d="M -42 10 Q -46 30 -36 40 L -30 14 Z M 42 10 Q 46 30 36 40 L 30 14 Z" fill={"#E6DFD0"} />
      </g>
    );
  if (g === "paja")
    return (
      <g>
        <path d="M -78 -36 L 0 -104 L 78 -36 Q 0 -24 -78 -36 Z" fill={"#C9AE6A"} />
        <path d="M -40 -70 L 40 -70 M -60 -52 L 60 -52" stroke={"#A88D4E"} strokeWidth={3} />
      </g>
    );
  if (g === "gorra")
    return (
      <g>
        <path d="M -40 -30 Q -44 -70 0 -72 Q 44 -70 40 -30 Z" fill={color} />
        <rect x={-42} y={-38} width={84} height={10} fill={osc(color, 0.8)} />
      </g>
    );
  if (g === "bombin")
    return (
      <g>
        <path d="M -24 -50 Q -25 -86 0 -88 Q 25 -86 24 -50 Z" fill={color} />
        <rect x={-24} y={-58} width={48} height={6} fill={color2} />
        <ellipse cx={0} cy={-50} rx={34} ry={6} fill={color} />
      </g>
    );
  return null;
};

/* ------------------------------------------------------------------ */
/* Persona de frente                                                    */
/* ------------------------------------------------------------------ */

export type PoseFrente = "quieto" | "habla" | "senala" | "lee" | "escribe" | "brazos" | "despide" | "carga" | "vela" | "ofrece" | "frio";

/**
 * Persona de frente con los pies en (x, y); a escala 1 mide unos 450 px.
 * `cuerpo: "busto"` la pinta detras de una mesa: el cuerpo sigue hasta abajo.
 */
export const Frente: React.FC<
  Persona & {
    x: number;
    y: number;
    s?: number;
    pose?: PoseFrente;
    mirada?: number;
    gesto?: "neutro" | "inquieto" | "serio" | "sorpresa";
    habla?: boolean;
    cuerpo?: "entero" | "busto";
    /** Lo que lleva en la mano derecha. */
    objeto?: "vela" | "papel" | "pluma" | "bolsa" | "moneda" | "seda" | "ninguno";
    /** Fardo o costal a la espalda, o un nino en la lliclla. */
    espalda?: "costal" | "bulto" | "nino" | "ninguno";
  }
> = (props) => {
  const { x, y, s = 1, pose = "quieto", mirada = 0, gesto = "neutro", habla, cuerpo = "entero", objeto = "ninguno", espalda = "ninguno" } = props;
  const f = useCurrentFrame();
  const sem = props.semilla;
  const r = rasgosPot(props);
  const t = props.traje;
  const nino = props.edad === "nino";
  const color = props.color ?? (t === "andino" || t === "andina" || t === "cholita" ? tono(TINTES, sem, 11) : t === "chino" ? tono(["#3E4E6B", "#5A3A2E", "#2F4A3F", "#4A3F5A", "#6B5236"], sem, 11) : t === "minero" ? tono(["#C8622C", "#2F4A6B", "#5A5A3A", "#3A4A4A"], sem, 11) : t === "clerigo" ? "#1C1C20" : t === "noble" ? "#18181C" : tono(["#2A2A30", "#3A2E28", "#2E3A34", "#4A2E2A", "#2E2E3E"], sem, 11));
  const color2 = props.color2 ?? (t === "andino" || t === "andina" || t === "cholita" ? tono(TINTES, sem + 3, 12) : t === "minero" ? "#2A2C2E" : tono(["#8A6A3A", "#6A2A26", "#3E4E6B", "#5A5A4A"], sem, 12));
  const faja = tono(FAJAS, sem, 13);
  const piel = r.piel ?? "#C38E68";
  const respira = Math.sin(f * 0.07 + sem) * 1.2;
  const gorro: NonNullable<Persona["gorro"]> =
    props.gorro ??
    (t === "andino"
      ? rr(sem, 15) > 0.5
        ? "chullo"
        : "montera"
      : t === "andina"
        ? rr(sem, 15) > 0.35
          ? "montera"
          : "ninguno"
        : t === "espanol" || t === "noble" || t === "mercader"
          ? "ala"
          : t === "clerigo"
            ? "bonete"
            : t === "chino"
              ? "ming"
              : t === "minero"
                ? "casco"
                : t === "cholita"
                  ? "bombin"
                  : t === "europea"
                    ? "toca"
                    : t === "campesino"
                      ? "paja"
                      : t === "artesano"
                        ? "gorra"
                        : "ninguno");
  const colorGorro =
    gorro === "chullo" ? tono(["#C8402C", "#E8B33C", "#3E4E8A", "#EDE3C8", "#2E5A4E"], sem, 16) : gorro === "montera" ? tono(["#2A2622", "#3A2E28", "#4A3A2E"], sem, 16) : gorro === "casco" ? tono(["#E8B33C", "#EDE6D6", "#D97A2C"], sem, 16) : gorro === "bombin" ? tono(["#3A2E28", "#2A2622", "#5A4A3A"], sem, 16) : "#1A1A1C";
  const colorGorro2 = gorro === "chullo" ? tono(["#2E5A4E", "#8E2F2A", "#EDE3C8", "#E8B33C"], sem, 17) : gorro === "montera" ? faja : "#3A3A3E";

  // brazos: angulo en el hombro y del antebrazo (0 = colgando)
  let bI = 6, aI = 0, bD = -6, aD = 0;
  const g = Math.sin(f * 0.18 + sem) * 14;
  if (pose === "habla") { bD = 10; aD = 64 - g; }
  if (pose === "senala") { bD = -112; aD = -6; }
  if (pose === "lee") { bI = -24; aI = -78; bD = 24; aD = 78; }
  if (pose === "escribe") { bD = 20; aD = 66 + Math.sin(f * 0.5) * 6; bI = -16; aI = -60; }
  if (pose === "brazos" || pose === "frio") { bI = -16; aI = -100; bD = 16; aD = 100; }
  if (pose === "carga") { bI = -14; aI = -128; bD = 14; aD = 128; }
  if (pose === "despide") { bD = -150 + Math.sin(f * 0.12 + sem) * 8; aD = -14 + Math.sin(f * 0.24 + sem) * 22; }
  if (pose === "vela") { bD = -36; aD = -112; }
  if (pose === "ofrece") { bD = -20; aD = -70; }

  const esAndino = t === "andino";
  const falda = t === "andina" || t === "cholita" || t === "europea";
  const tunica = t === "clerigo" || t === "chino";
  const manga = esAndino ? color2 : falda ? color2 : t === "minero" ? color : t === "moderno" ? color : color;
  const puno = t === "espanol" || t === "noble" || t === "mercader" ? "#EFE9DC" : t === "minero" ? osc(color, 0.7) : osc(manga, 0.8);

  const Objeto = ({ angulo }: { angulo: number }) => {
    if (objeto === "vela")
      return (
        <g transform={`rotate(${-angulo})`}>
          <rect x={-5} y={-26} width={10} height={30} fill={"#EDE3C8"} />
          <g transform="translate(0 -26)">
            <circle r={40} fill={C.vela} opacity={0.15} />
            <path d={`M 0 ${-22 - Math.sin(f * 0.7) * 3} Q 7 -6 0 0 Q -7 -6 0 ${-22 - Math.sin(f * 0.7) * 3} Z`} fill={C.vela} />
          </g>
        </g>
      );
    if (objeto === "papel")
      return (
        <g transform={`rotate(${-angulo})`}>
          <rect x={-30} y={-46} width={56} height={70} fill={"#EDE3C8"} transform="rotate(-6)" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={-24} y={-38 + i * 11} width={i === 4 ? 26 : 44} height={3} fill={"#6A5A44"} transform="rotate(-6)" />
          ))}
        </g>
      );
    if (objeto === "pluma") return <path d={`M 0 0 L 6 -46 Q 18 -60 10 -30 Z`} fill={"#F2EDE2"} transform={`rotate(${-angulo})`} />;
    if (objeto === "bolsa")
      return (
        <g transform={`rotate(${-angulo})`}>
          <path d="M -18 6 Q -26 40 0 44 Q 26 40 18 6 Q 0 -2 -18 6 Z" fill={"#8A6A44"} />
          <path d="M -12 6 L 12 6" stroke={"#5A3D2B"} strokeWidth={4} />
        </g>
      );
    if (objeto === "moneda")
      return (
        <g transform={`rotate(${-angulo})`}>
          <circle cx={0} cy={-8} r={13} fill={C.plata} stroke={C.plataSombra} strokeWidth={2} />
        </g>
      );
    if (objeto === "seda")
      return (
        <g transform={`rotate(${-angulo})`}>
          <path d="M -40 -10 L 40 -16 L 44 30 Q 0 40 -44 34 Z" fill={"#B0347A"} />
          <path d="M -40 2 L 42 -4 M -42 18 L 43 12" stroke={C.ocre} strokeWidth={3} />
        </g>
      );
    return null;
  };

  const brazo = (lado: 1 | -1, ang: number, ante: number, conObjeto: boolean) => (
    <g transform={`translate(${lado * -58} -318) rotate(${ang})`}>
      <rect x={-14} y={-4} width={28} height={84} rx={13} fill={manga} />
      <g transform={`translate(0 76) rotate(${ante})`}>
        <rect x={-13} y={-6} width={26} height={76} rx={12} fill={tunica && t === "chino" ? manga : manga} />
        {t === "chino" ? <path d="M -20 40 L 20 40 L 26 76 L -26 76 Z" fill={manga} /> : null}
        <rect x={-13} y={62} width={26} height={9} fill={puno} />
        <ellipse cx={0} cy={80} rx={11} ry={13} fill={piel} />
        {conObjeto ? (
          <g transform="translate(0 82)">
            <Objeto angulo={ang + ante} />
          </g>
        ) : null}
      </g>
    </g>
  );

  /* ----- piernas y pies ----- */
  const piernas = () => {
    if (falda) {
      const ancho = t === "cholita" ? 100 : 74;
      return (
        <g>
          <ellipse cx={-20} cy={-6} rx={18} ry={7} fill={"#3A2A20"} />
          <ellipse cx={20} cy={-6} rx={18} ry={7} fill={"#3A2A20"} />
          <path d={`M -54 -236 L 54 -236 L ${ancho} -14 Q 0 -6 ${-ancho} -14 Z`} fill={t === "cholita" ? color : osc(color, 0.6)} />
          {t === "europea" ? (
            <path d="M -40 -230 L 40 -230 L 52 -60 L -52 -60 Z" fill={"#EDE6D6"} />
          ) : t === "cholita" ? (
            [0, 1, 2, 3].map((i) => <path key={i} d={`M ${-60 - i * 10} ${-150 + i * 34} H ${60 + i * 10}`} stroke={osc(color, 0.8)} strokeWidth={4} />)
          ) : (
            <g>
              <path d={`M ${-ancho + 4} -30 L ${ancho - 4} -30 L ${ancho} -14 Q 0 -6 ${-ancho} -14 Z`} fill={faja} opacity={0.9} />
              <path d={`M ${-ancho + 8} -44 H ${ancho - 8}`} stroke={C.ocre} strokeWidth={3} />
            </g>
          )}
        </g>
      );
    }
    if (tunica)
      return (
        <g>
          <ellipse cx={-20} cy={-6} rx={22} ry={8} fill={"#141618"} />
          <ellipse cx={20} cy={-6} rx={22} ry={8} fill={"#141618"} />
          <path d="M -60 -240 L 60 -240 L 70 -14 L -70 -14 Z" fill={color} />
          <path d="M 0 -240 L 0 -14" stroke={osc(color, 0.8)} strokeWidth={4} />
        </g>
      );
    if (esAndino || (nino && !falda))
      return (
        <g>
          {/* ojotas */}
          <ellipse cx={-22} cy={-5} rx={20} ry={6} fill={"#4A3326"} />
          <ellipse cx={22} cy={-5} rx={20} ry={6} fill={"#4A3326"} />
          <rect x={-33} y={-118} width={22} height={112} rx={8} fill={piel} />
          <rect x={11} y={-118} width={22} height={112} rx={8} fill={osc(piel, 0.9)} />
          <path d="M -34 -12 L -12 -16 M 12 -16 L 34 -12" stroke={"#4A3326"} strokeWidth={4} />
          {/* calzon de lana */}
          <rect x={-36} y={-210} width={30} height={100} fill={"#2E2A26"} />
          <rect x={6} y={-210} width={30} height={100} fill={"#26221F"} />
        </g>
      );
    if (t === "minero")
      return (
        <g>
          <rect x={-36} y={-210} width={30} height={160} fill={"#2E3236"} />
          <rect x={6} y={-210} width={30} height={160} fill={"#2A2E32"} />
          <rect x={-40} y={-62} width={36} height={58} rx={4} fill={"#1A1C1E"} />
          <rect x={4} y={-62} width={36} height={58} rx={4} fill={"#1A1C1E"} />
          <ellipse cx={-22} cy={-6} rx={24} ry={8} fill={"#141618"} />
          <ellipse cx={22} cy={-6} rx={24} ry={8} fill={"#141618"} />
        </g>
      );
    if (t === "campesino")
      return (
        <g>
          <rect x={-34} y={-210} width={29} height={180} fill={osc(color, 0.7)} />
          <rect x={5} y={-210} width={29} height={180} fill={osc(color, 0.65)} />
          <rect x={-32} y={-40} width={25} height={34} fill={piel} />
          <rect x={7} y={-40} width={25} height={34} fill={piel} />
          <ellipse cx={-20} cy={-5} rx={20} ry={6} fill={"#4A3326"} />
          <ellipse cx={20} cy={-5} rx={20} ry={6} fill={"#4A3326"} />
        </g>
      );
    if (t === "moderno")
      return (
        <g>
          <rect x={-34} y={-210} width={29} height={200} fill={"#3A4A5E"} />
          <rect x={5} y={-210} width={29} height={200} fill={"#34445A"} />
          <ellipse cx={-22} cy={-6} rx={22} ry={8} fill={"#2A2420"} />
          <ellipse cx={22} cy={-6} rx={22} ry={8} fill={"#2A2420"} />
        </g>
      );
    // espanol, noble, mercader: calzas, greguescos y zapatos
    return (
      <g>
        <ellipse cx={-22} cy={-6} rx={22} ry={8} fill={"#141618"} />
        <ellipse cx={22} cy={-6} rx={22} ry={8} fill={"#141618"} />
        <rect x={-31} y={-170} width={22} height={162} rx={8} fill={osc(color, 0.75)} />
        <rect x={9} y={-170} width={22} height={162} rx={8} fill={osc(color, 0.7)} />
        <path d="M -48 -230 Q -56 -170 -34 -160 L -4 -160 L -2 -230 Z" fill={color2} />
        <path d="M 48 -230 Q 56 -170 34 -160 L 4 -160 L 2 -230 Z" fill={osc(color2, 0.9)} />
        {[-38, -24, 24, 38].map((px) => (
          <path key={px} d={`M ${px} -228 L ${px} -162`} stroke={osc(color2, 0.7)} strokeWidth={3} />
        ))}
      </g>
    );
  };

  /* ----- torso ----- */
  const torso = () => {
    if (esAndino || (nino && !falda && t !== "minero" && t !== "moderno"))
      return (
        <g>
          {/* unku con franja de tocapus */}
          <path d="M -60 -334 Q 0 -344 60 -334 L 64 -148 L -64 -148 Z" fill={color} />
          <path d="M -60 -334 Q -40 -336 -36 -334 L -40 -148 L -64 -148 Z" fill={osc(color, 0.88)} />
          <g>
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={i} x={-62 + i * 15.5} y={-262} width={15.5} height={18} fill={i % 2 ? C.ocre : "#EDE3C8"} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={i} x={-58 + i * 15.5} y={-258} width={7} height={10} fill={i % 2 ? color : C.carmin} />
            ))}
          </g>
          <path d="M -64 -160 H 64" stroke={osc(color, 0.7)} strokeWidth={6} />
          <path d="M -12 -338 L 0 -310 L 12 -338" fill={osc(piel, 0.85)} />
          {/* yacolla anudada al pecho */}
          <path d="M -64 -336 Q -30 -330 -6 -306 L -16 -296 Q -40 -316 -66 -318 Z" fill={color2} />
          <path d="M 64 -336 Q 30 -330 6 -306 L 16 -296 Q 40 -316 66 -318 Z" fill={osc(color2, 0.9)} />
          <circle cx={0} cy={-302} r={9} fill={osc(color2, 0.75)} />
        </g>
      );
    if (t === "europea")
      return (
        <g>
          <path d="M -54 -334 Q 0 -344 54 -334 L 56 -232 L -56 -232 Z" fill={"#EDE6D6"} />
          <path d="M -44 -320 L 44 -320 L 40 -228 L -40 -228 Z" fill={color2} />
          {[-310, -290, -270, -250].map((by) => (
            <path key={by} d={`M -10 ${by} L 10 ${by + 10} M 10 ${by} L -10 ${by + 10}`} stroke={"#EDE6D6"} strokeWidth={2} />
          ))}
          <path d="M -66 -340 Q 0 -350 66 -340 L 60 -316 Q 0 -300 -60 -316 Z" fill={osc(color, 0.85)} />
        </g>
      );
    if (t === "campesino")
      return (
        <g>
          <path d="M -58 -334 Q 0 -344 58 -334 L 62 -190 L -62 -190 Z" fill={color} />
          <path d="M -30 -340 Q -6 -310 24 -250 L 32 -256 Q 6 -308 -14 -342 Z" fill={osc(color, 0.75)} />
          <rect x={-62} y={-214} width={124} height={14} fill={osc(color, 0.6)} />
        </g>
      );
    if (falda)
      return (
        <g>
          {/* blusa */}
          <path d="M -54 -334 Q 0 -344 54 -334 L 56 -232 L -56 -232 Z" fill={t === "cholita" ? "#EDE6D6" : osc(color2, 0.85)} />
          {/* chumpi, la faja */}
          <rect x={-58} y={-246} width={116} height={18} fill={faja} />
          {[-48, -28, -8, 12, 32].map((px) => (
            <path key={px} d={`M ${px} -244 l 8 7 l -8 7 l -8 -7 Z`} fill={C.ocre} opacity={0.9} />
          ))}
          {/* lliclla sobre los hombros, prendida con un tupu */}
          <path d="M -70 -340 Q 0 -350 70 -340 L 76 -262 Q 40 -276 6 -300 L -6 -300 Q -40 -276 -76 -262 Z" fill={color2} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-72 + i * 2} ${-322 + i * 18} Q -30 ${-316 + i * 14} -4 ${-298 + i * 2}`} stroke={i === 1 ? C.ocre : osc(color2, 0.7)} strokeWidth={4} fill="none" />
          ))}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${72 - i * 2} ${-322 + i * 18} Q 30 ${-316 + i * 14} 4 ${-298 + i * 2}`} stroke={i === 1 ? C.ocre : osc(color2, 0.7)} strokeWidth={4} fill="none" />
          ))}
          <circle cx={0} cy={-300} r={8} fill={C.plata} stroke={C.plataSombra} strokeWidth={2} />
          <path d="M 0 -300 L 0 -330" stroke={C.plataSombra} strokeWidth={2} />
        </g>
      );
    if (t === "clerigo")
      return (
        <g>
          <path d="M -58 -334 Q 0 -344 58 -334 L 62 -232 L -62 -232 Z" fill={color} />
          {[-320, -300, -280, -260].map((by) => (
            <circle key={by} cx={0} cy={by} r={2.6} fill={"#3A3A40"} />
          ))}
          <rect x={-16} y={-344} width={32} height={10} fill={"#F2EDE2"} />
          <path d="M -6 -300 L 6 -300 M 0 -306 L 0 -284" stroke={"#C9A23A"} strokeWidth={3} />
        </g>
      );
    if (t === "chino")
      return (
        <g>
          <path d="M -60 -334 Q 0 -346 60 -334 L 62 -232 L -62 -232 Z" fill={color} />
          <path d="M -40 -340 Q -10 -320 22 -270 L 30 -276 Q 4 -318 -20 -342 Z" fill={osc(color, 0.75)} />
          <rect x={-62} y={-242} width={124} height={12} fill={osc(color, 0.6)} />
          <rect x={-10} y={-242} width={20} height={34} fill={C.ocre} opacity={0.85} />
          <path d="M -14 -342 Q 0 -336 14 -342" stroke={"#EDE6D6"} strokeWidth={4} fill="none" />
        </g>
      );
    if (t === "minero")
      return (
        <g>
          <path d="M -60 -334 Q 0 -344 60 -334 L 62 -200 L -62 -200 Z" fill={color} />
          <rect x={-62} y={-268} width={124} height={10} fill={"#E8E0C8"} opacity={0.85} />
          <path d="M 0 -334 V -200" stroke={osc(color, 0.7)} strokeWidth={4} />
          <rect x={-64} y={-214} width={128} height={16} fill={"#2A2420"} />
          <rect x={30} y={-218} width={30} height={34} rx={4} fill={"#3A3C3E"} />
          <path d="M 44 -218 Q 70 -260 40 -320" stroke={"#1A1A1A"} strokeWidth={4} fill="none" />
        </g>
      );
    if (t === "moderno")
      return (
        <g>
          <path d="M -58 -334 Q 0 -344 58 -334 L 60 -200 L -60 -200 Z" fill={color} />
          <path d="M -12 -338 L 0 -320 L 12 -338" fill={"#EDE6D6"} />
          <path d="M 0 -320 V -204" stroke={osc(color, 0.7)} strokeWidth={3} />
        </g>
      );
    // espanol, noble, mercader: jubon con botonadura, faldones y gola
    return (
      <g>
        <path d="M -58 -334 Q 0 -344 58 -334 L 54 -240 L 0 -216 L -54 -240 Z" fill={color} />
        <path d="M -54 -240 L 0 -216 L 54 -240 L 58 -214 L 0 -196 L -58 -214 Z" fill={osc(color, 0.85)} />
        {[-322, -304, -286, -268, -250, -232].map((by) => (
          <circle key={by} cx={0} cy={by} r={3} fill={t === "noble" ? C.oro : osc(color, 0.6)} />
        ))}
        <path d="M -40 -334 L -46 -244 M 40 -334 L 46 -244" stroke={osc(color, 0.75)} strokeWidth={3} />
        {props.cruz ? <path d="M -34 -296 h 14 v -14 h 8 v 14 h 14 v 8 h -14 v 14 h -8 v -14 h -14 Z" fill={"#2E7A4E"} /> : null}
        {t === "noble" || t === "mercader" ? (
          <path d="M -30 -330 Q -20 -270 0 -262 Q 20 -270 30 -330" stroke={C.oro} strokeWidth={3} fill="none" />
        ) : null}
      </g>
    );
  };

  const capa = () =>
    t === "espanol" || t === "noble" ? (
      <path d="M -66 -338 Q -94 -230 -80 -150 L -50 -160 L -56 -320 Z M 66 -338 Q 94 -230 80 -150 L 50 -160 L 56 -320 Z" fill={osc(color, 0.8)} />
    ) : esAndino ? (
      <path d="M -66 -338 Q -86 -240 -78 -172 L -54 -172 L -56 -320 Z M 66 -338 Q 86 -240 78 -172 L 54 -172 L 56 -320 Z" fill={osc(color2, 0.85)} />
    ) : null;

  const cuello = () => {
    if (t === "espanol" || t === "noble" || t === "mercader")
      return (
        <g>
          {Array.from({ length: 11 }).map((_, i) => (
            <ellipse key={i} cx={-40 + i * 8} cy={-344} rx={7} ry={10} fill={i % 2 ? "#F7F2E8" : "#E9E2D2"} />
          ))}
          <ellipse cx={0} cy={-352} rx={44} ry={6} fill={"#F7F2E8"} />
        </g>
      );
    return null;
  };

  const espaldaCarga = () => {
    if (espalda === "costal")
      return (
        <g>
          <path d="M -80 -330 Q -100 -380 -78 -414 Q -48 -440 -20 -420 Q 0 -396 4 -330 Z" fill={"#9A8458"} />
          <path d="M -88 -380 Q -50 -392 -6 -380 M -90 -352 Q -50 -362 -2 -352" stroke={"#7A6A44"} strokeWidth={4} fill="none" />
          <path d="M -70 -418 Q -60 -436 -40 -430" stroke={"#5A4A30"} strokeWidth={6} fill="none" />
        </g>
      );
    if (espalda === "bulto" || espalda === "nino")
      return (
        <g>
          <path d="M -64 -420 Q -70 -360 -60 -300 L 60 -300 Q 70 -360 64 -420 Q 0 -436 -64 -420 Z" fill={tono(TINTES, sem + 5, 18)} />
          <path d="M -60 -400 H 60 M -62 -370 H 62" stroke={C.ocre} strokeWidth={4} opacity={0.8} />
        </g>
      );
    return null;
  };

  const cabezaY = -396 + respira;
  const mujer = r.mujer;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (nino ? 0.62 : 1)})`}>
      {cuerpo === "busto" ? <rect x={-64} y={-200} width={128} height={1000} fill={falda ? osc(color, 0.6) : tunica ? color : esAndino ? color : osc(color, 0.92)} /> : null}
      {cuerpo === "entero" ? <ellipse cx={0} cy={0} rx={70} ry={10} fill={"#000"} opacity={0.18} /> : null}
      {espaldaCarga()}
      {capa()}
      {cuerpo === "entero" ? piernas() : null}
      {brazo(1, bI, aI, false)}
      <g transform={`translate(0 ${respira * 0.4})`}>
        {torso()}
        <rect x={-12} y={-356} width={24} height={24} fill={osc(piel, 0.88)} />
        {cuello()}
      </g>
      {espalda === "costal" ? <path d="M -46 -330 Q 0 -280 46 -330" stroke={"#6A5A3A"} strokeWidth={8} fill="none" /> : null}
      {brazo(-1, bD, aD, objeto !== "ninguno")}
      {pose === "lee" ? (
        <g transform="translate(0 -262) rotate(-3)">
          <rect x={-74} y={-54} width={148} height={104} fill={"#EDE3C8"} />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={-64} y={-42 + i * 12} width={i % 3 === 2 ? 80 : 128} height={4} fill={"#7A6A50"} />
          ))}
          <line x1={0} y1={-54} x2={0} y2={50} stroke={"#CFC6AF"} strokeWidth={2} />
        </g>
      ) : null}
      <g transform={`translate(0 ${cabezaY})`}>
        {mujer ? <path d="M -40 -20 Q -46 10 -40 30 L -30 30 L -30 -20 Z M 40 -20 Q 46 10 40 30 L 30 30 L 30 -20 Z" fill={r.pelo} /> : null}
        {t === "chino" ? <ellipse cx={0} cy={-52} rx={14} ry={10} fill={r.pelo} /> : null}
        {espalda === "nino" ? (
          <g transform="translate(-50 -10) scale(0.42)">
            <Cabeza r={{ ...rasgosPot({ traje: "andino", semilla: sem + 40, edad: "nino" }), peinado: "corto" }} semilla={sem + 40} />
          </g>
        ) : null}
        <Cabeza r={r} semilla={sem} mirada={mirada} habla={habla ?? pose === "habla"} gesto={gesto} sinSombrero />
        {mujer ? (
          <g fill={r.pelo}>
            <path d="M -36 10 Q -46 60 -40 120 L -30 120 Q -36 60 -28 14 Z" />
            <path d="M 36 10 Q 46 60 40 120 L 30 120 Q 36 60 28 14 Z" />
            {[30, 54, 78, 102].map((by) => (
              <g key={by} stroke={osc(r.pelo ?? "#222", 0.6)} strokeWidth={2}>
                <path d={`M -42 ${by} l 8 6`} />
                <path d={`M 42 ${by} l -8 6`} />
              </g>
            ))}
            <circle cx={-35} cy={124} r={5} fill={faja} />
            <circle cx={35} cy={124} r={5} fill={faja} />
          </g>
        ) : null}
        <GorroFrente g={gorro} color={colorGorro} color2={colorGorro2} mujer={mujer} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Persona de perfil, articulada                                        */
/* ------------------------------------------------------------------ */

export type PosePerfil = "anda" | "quieto" | "carga" | "pica" | "martillo" | "pisa" | "sube" | "rema" | "agacha";

/**
 * Figura de perfil articulada (cadera, rodillas, hombros, codos), con los
 * pies en (x0 + v*f, y). Mira hacia donde anda (o hacia `dir`).
 */
export const Perfil: React.FC<
  Persona & {
    x0: number;
    y: number;
    v?: number;
    vy?: number;
    s?: number;
    pose?: PosePerfil;
    dir?: 1 | -1;
    espalda?: "costal" | "bulto" | "nino" | "ninguno";
    herramienta?: "barreta" | "martillo" | "vela" | "pala" | "ninguna";
    lampara?: boolean;
    ritmo?: number;
  }
> = (props) => {
  const { x0, y, v = 0, vy = 0, s = 1, pose = v !== 0 ? "anda" : "quieto", espalda = "ninguno", herramienta = "ninguna", ritmo = 1 } = props;
  const f = useCurrentFrame();
  const sem = props.semilla;
  const r = rasgosPot(props);
  const t = props.traje;
  const nino = props.edad === "nino";
  const color = props.color ?? (t === "andino" || t === "andina" ? tono(TINTES, sem, 11) : t === "minero" ? tono(["#C8622C", "#2F4A6B", "#5A5A3A", "#3A4A4A"], sem, 11) : t === "chino" ? tono(["#3E4E6B", "#5A3A2E", "#2F4A3F", "#4A3F5A"], sem, 11) : t === "clerigo" ? "#1C1C20" : tono(["#2A2A30", "#3A2E28", "#2E3A34", "#4A2E2A", "#2E2E3E"], sem, 11));
  const color2 = props.color2 ?? (t === "andino" || t === "andina" ? tono(TINTES, sem + 3, 12) : tono(["#8A6A3A", "#6A2A26", "#3E4E6B", "#5A5A4A"], sem, 12));
  const piel = r.piel ?? "#C38E68";
  const pelo = r.pelo ?? "#1C1816";
  const fase = rr(sem, 9) * 6.28;
  const d = props.dir ?? (v < 0 ? -1 : 1);
  const w = f * 0.3 * ritmo + fase;
  const sn = Math.sin(w);

  // angulos: muslo/espinilla de cada pierna, brazo/antebrazo, inclinacion
  let lean = 3, mA = 0, eA = 0, mB = 0, eB = 0, bA = 4, aA = -10, bB = -4, aB = -10, alza = 0;
  if (pose === "anda" || pose === "carga") {
    mA = -sn * 24; eA = Math.max(0, sn) * 34;
    mB = sn * 24; eB = Math.max(0, -sn) * 34;
    bA = sn * 20; aA = -18; bB = -sn * 20; aB = -18;
    alza = Math.abs(Math.cos(w)) * 3;
  }
  if (pose === "carga") { lean = 22; bA = -50; aA = -80; bB = -40; aB = -90; }
  if (pose === "pica" || pose === "martillo") {
    const golpe = (Math.sin(f * 0.16 * ritmo + fase) + 1) / 2; // 0 abajo, 1 arriba
    const g2 = Math.pow(golpe, 0.6);
    lean = pose === "pica" ? 16 - g2 * 10 : 10 - g2 * 6;
    mA = -20; eA = 14; mB = 18; eB = 6;
    bA = -60 - g2 * 110; aA = -30 + g2 * 10;
    bB = -50 - g2 * 110; aB = -40 + g2 * 10;
  }
  if (pose === "pisa") {
    const a = Math.max(0, sn), b = Math.max(0, -sn);
    mA = -a * 40; eA = a * 60; mB = -b * 40; eB = b * 60;
    lean = 4; bA = 12 + sn * 8; aA = -24; bB = -8 - sn * 8; aB = -20;
    alza = (a + b) * 4;
  }
  if (pose === "sube") {
    const a = (sn + 1) / 2;
    mA = -60 * a; eA = 80 * a; mB = -60 * (1 - a); eB = 80 * (1 - a);
    lean = -2; bA = -170 + a * 20; aA = 0; bB = -150 - a * 20; aB = 0;
  }
  if (pose === "agacha") { lean = 34; mA = -50; eA = 70; mB = -20; eB = 60; bA = -40; aA = -30; bB = -30; aB = -40; }
  if (pose === "rema") { lean = 10 + sn * 10; bA = -70 + sn * 30; aA = -20; bB = -60 + sn * 30; aB = -30; }
  if (pose === "quieto") { lean = 2 + Math.sin(f * 0.05 + fase) * 1; }

  const falda = t === "andina" || t === "cholita" || t === "clerigo" || t === "chino" || t === "europea";
  const esAndino = t === "andino";
  const espanol = t === "espanol" || t === "noble" || t === "mercader";
  const pantalon = esAndino ? "#2B2724" : t === "minero" ? "#2E3236" : espanol ? osc(color, 0.7) : "#2B2724";
  const pieColor = esAndino || t === "andina" ? "#4A3326" : "#141618";

  const pierna = (m: number, e: number, delante: boolean) => (
    <g transform={`rotate(${m} 0 -196)`}>
      {esAndino || nino ? (
        <g>
          <rect x={-13} y={-200} width={26} height={70} rx={8} fill={delante ? pantalon : osc(pantalon, 0.85)} />
          <rect x={-10} y={-138} width={20} height={44} rx={8} fill={delante ? piel : osc(piel, 0.88)} />
        </g>
      ) : t === "minero" ? (
        <rect x={-13} y={-200} width={26} height={108} rx={8} fill={delante ? pantalon : osc(pantalon, 0.85)} />
      ) : (
        <rect x={-12} y={-200} width={24} height={108} rx={8} fill={delante ? pantalon : osc(pantalon, 0.85)} />
      )}
      <g transform={`rotate(${e} 0 -98)`}>
        <rect x={-10} y={-104} width={20} height={98} rx={8} fill={esAndino || nino || t === "andina" ? (delante ? piel : osc(piel, 0.88)) : delante ? pantalon : osc(pantalon, 0.85)} />
        {t === "minero" ? <rect x={-13} y={-56} width={26} height={50} rx={4} fill={"#1A1C1E"} /> : null}
        <path d="M -12 -10 L 24 -10 Q 32 -2 24 3 L -12 3 Z" fill={pieColor} />
      </g>
    </g>
  );

  const brazo = (b: number, a: number, delante: boolean, conHerr: boolean) => (
    <g transform={`translate(0 -116) rotate(${b})`}>
      <rect x={-11} y={-4} width={22} height={74} rx={10} fill={delante ? (esAndino || t === "andina" ? color2 : color) : osc(esAndino || t === "andina" ? color2 : color, 0.8)} />
      <g transform={`translate(0 68) rotate(${a})`}>
        <rect x={-10} y={-4} width={20} height={64} rx={9} fill={delante ? (esAndino || t === "andina" ? color2 : color) : osc(esAndino || t === "andina" ? color2 : color, 0.8)} />
        <ellipse cx={0} cy={66} rx={10} ry={11} fill={delante ? piel : osc(piel, 0.88)} />
        {conHerr && herramienta === "barreta" ? <rect x={-4} y={30} width={8} height={170} rx={2} fill={"#4A4A4E"} /> : null}
        {conHerr && herramienta === "martillo" ? (
          <g transform="translate(0 66) rotate(-90)">
            <rect x={-4} y={-6} width={8} height={80} fill={C.maderaMedia} />
            <rect x={-16} y={64} width={32} height={22} rx={3} fill={"#4A4A4E"} />
          </g>
        ) : null}
        {conHerr && herramienta === "pala" ? (
          <g transform="translate(0 66) rotate(-70)">
            <rect x={-4} y={-40} width={8} height={130} fill={C.maderaMedia} />
            <path d="M -18 86 L 18 86 L 14 130 Q 0 140 -14 130 Z" fill={"#5A5A5E"} />
          </g>
        ) : null}
        {conHerr && herramienta === "vela" ? (
          <g transform={`translate(0 66) rotate(${-(b + a + lean)})`}>
            <rect x={-4} y={-24} width={8} height={26} fill={"#EDE3C8"} />
            <circle cx={0} cy={-30} r={36} fill={C.vela} opacity={0.16} />
            <path d={`M 0 ${-46 - Math.sin(f * 0.8 + sem) * 3} Q 6 -32 0 -24 Q -6 -32 0 ${-46 - Math.sin(f * 0.8 + sem) * 3} Z`} fill={C.vela} />
          </g>
        ) : null}
      </g>
    </g>
  );

  /* cuerpo, en coordenadas de la cadera (0, -196) */
  const cuerpo = () => (
    <g>
      {/* espalda: carga */}
      {espalda === "costal" ? (
        <g>
          <path d="M -24 -150 Q -86 -150 -88 -60 Q -84 6 -20 0 Q -8 -70 -24 -150 Z" fill={"#A88F62"} />
          <path d="M -80 -110 Q -50 -100 -24 -110 M -84 -60 Q -50 -50 -20 -60" stroke={"#8A774F"} strokeWidth={4} fill="none" />
          <path d="M -26 -146 Q 0 -150 18 -114" stroke={"#6A5A3A"} strokeWidth={7} fill="none" />
        </g>
      ) : espalda === "bulto" || espalda === "nino" ? (
        <g>
          <path d="M -24 -130 Q -78 -126 -76 -60 Q -72 -10 -20 -16 Z" fill={tono(TINTES, sem + 5, 18)} />
          <path d="M -70 -100 H -24 M -74 -70 H -22" stroke={C.ocre} strokeWidth={4} />
          {espalda === "nino" ? (
            <g transform="translate(-50 -150) scale(0.4)">
              <Cabeza r={{ ...rasgosPot({ traje: "andino", semilla: sem + 40, edad: "nino" }) }} semilla={sem + 40} sinSombrero />
            </g>
          ) : null}
        </g>
      ) : null}
      {/* manta por detras */}
      {esAndino ? <path d="M -26 -128 Q -44 -60 -34 -20 L -14 -24 Z" fill={osc(color2, 0.85)} /> : null}
      {espanol ? <path d="M -26 -128 Q -54 -50 -40 8 L -8 0 L -10 -120 Z" fill={osc(color, 0.78)} /> : null}
      {/* tronco */}
      {esAndino ? (
        <g>
          <path d="M -28 -132 Q 4 -142 30 -128 L 34 76 L -32 76 Z" fill={color} />
          <rect x={-30} y={-58} width={63} height={14} fill={C.ocre} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-26 + i * 16} y={-55} width={7} height={8} fill={i % 2 ? C.carmin : "#EDE3C8"} />
          ))}
          <path d="M -32 66 H 34" stroke={osc(color, 0.7)} strokeWidth={5} />
        </g>
      ) : t === "andina" || t === "cholita" || t === "europea" ? (
        <g>
          <path d="M -26 -132 Q 4 -142 28 -128 L 30 -40 L -28 -40 Z" fill={osc(color2, 0.85)} />
          <rect x={-30} y={-48} width={62} height={14} fill={tono(FAJAS, sem, 13)} />
          <path d="M -34 -142 Q 4 -150 36 -134 L 38 -70 Q 4 -60 -38 -80 Z" fill={color2} />
          <path d="M -34 -120 Q 0 -112 36 -114 M -36 -96 Q 0 -86 37 -92" stroke={C.ocre} strokeWidth={3} fill="none" />
        </g>
      ) : t === "clerigo" || t === "chino" ? (
        <path d="M -28 -132 Q 4 -142 30 -128 L 32 -40 L -30 -40 Z" fill={color} />
      ) : t === "minero" ? (
        <g>
          <path d="M -28 -132 Q 4 -142 30 -128 L 32 8 L -30 8 Z" fill={color} />
          <rect x={-30} y={-62} width={62} height={8} fill={"#E8E0C8"} opacity={0.85} />
          <rect x={-32} y={-6} width={66} height={14} fill={"#2A2420"} />
          <rect x={-46} y={-12} width={20} height={30} rx={4} fill={"#3A3C3E"} />
        </g>
      ) : (
        <g>
          <path d="M -26 -132 Q 4 -142 28 -128 L 30 -20 L -28 -20 Z" fill={color} />
          <path d="M -30 -20 L 34 -20 L 36 0 L -30 0 Z" fill={osc(color, 0.85)} />
          <path d="M -28 0 Q -34 30 -20 40 L 24 40 Q 36 30 32 0 Z" fill={osc(color, 0.9)} />
          {[-110, -92, -74, -56, -38].map((by) => (
            <circle key={by} cx={26} cy={by} r={2.6} fill={osc(color, 0.6)} />
          ))}
        </g>
      )}
      {/* falda y tunicas largas: tapan las piernas */}
      {falda ? (
        <path
          d={`M -30 ${t === "clerigo" || t === "chino" ? -44 : -40} L 30 -40 L ${44 + Math.sin(w) * 8} 188 L ${-46 + Math.sin(w) * 8} 188 Z`}
          fill={t === "andina" ? osc(color, 0.6) : color}
        />
      ) : null}
      {t === "andina" ? <path d={`M ${-44 + Math.sin(w) * 8} 170 L ${44 + Math.sin(w) * 8} 170 L ${44 + Math.sin(w) * 8} 188 L ${-46 + Math.sin(w) * 8} 188 Z`} fill={tono(FAJAS, sem, 13)} /> : null}
      {/* gola */}
      {espanol ? <ellipse cx={8} cy={-140} rx={24} ry={9} fill={"#F2EDE2"} /> : null}
      {/* cabeza de perfil */}
      <g transform="translate(4 -184)">
        <rect x={-8} y={20} width={18} height={28} fill={osc(piel, 0.88)} />
        <path d="M -28 -16 Q -30 -44 0 -46 Q 26 -44 28 -18 L 30 -6 L 39 6 L 30 10 L 30 20 Q 26 36 6 38 Q -20 36 -26 18 Z" fill={piel} />
        <path d="M -30 -10 Q -34 -46 0 -50 Q 24 -48 28 -26 Q 10 -34 -6 -30 Q -16 -24 -18 -8 Z" fill={pelo} />
        {r.mujer ? (
          <g fill={pelo}>
            <path d="M -30 -10 Q -36 20 -30 40 L -20 40 Q -24 16 -18 -8 Z" />
            <path d="M -26 34 Q -34 80 -28 120 L -20 120 Q -26 80 -18 36 Z" />
          </g>
        ) : null}
        <ellipse cx={-6} cy={0} rx={6} ry={9} fill={osc(piel, 0.82)} />
        {(() => {
          const ciclo = 100 + Math.floor(rr(sem, 21) * 40);
          const cerr = (f + Math.floor(rr(sem, 22) * ciclo)) % ciclo < 3;
          return cerr ? <path d="M 14 -8 H 22" stroke={C.tinta} strokeWidth={2} /> : <circle cx={18} cy={-8} r={2.8} fill={"#2A2420"} />;
        })()}
        <rect x={12} y={-18} width={14} height={3.5} rx={1.5} fill={pelo} />
        {r.bigote && r.bigote !== "ninguno" ? <path d="M 22 14 Q 32 10 38 18 Q 30 20 22 18 Z" fill={pelo} /> : null}
        {r.barba === "completa" ? <path d="M -16 14 Q -8 40 14 38 Q 30 30 30 18 Q 18 26 4 24 Z" fill={pelo} /> : null}
        {r.barba === "perilla" ? <path d="M 16 28 Q 22 46 30 30 Z" fill={pelo} /> : null}
        <path d="M 22 26 L 31 25" stroke={"#7A3E33"} strokeWidth={2} />
        {(() => {
          const g = props.gorro ?? (esAndino ? (rr(sem, 15) > 0.5 ? "chullo" : "montera") : t === "andina" ? (rr(sem, 15) > 0.35 ? "montera" : "ninguno") : espanol ? "ala" : t === "clerigo" ? "bonete" : t === "chino" ? "ming" : t === "minero" ? "casco" : t === "europea" ? "toca" : t === "campesino" ? "paja" : "ninguno");
          const cg = g === "chullo" ? tono(["#C8402C", "#E8B33C", "#3E4E8A", "#EDE3C8", "#2E5A4E"], sem, 16) : g === "casco" ? tono(["#E8B33C", "#EDE6D6", "#D97A2C"], sem, 16) : g === "montera" ? tono(["#2A2622", "#3A2E28", "#4A3A2E"], sem, 16) : "#1A1A1C";
          if (g === "chullo")
            return (
              <g>
                <path d="M -32 -8 Q -36 -54 0 -56 Q 30 -54 30 -20 L 26 -16 Q 0 -30 -22 -12 L -20 24 Q -26 28 -30 22 Z" fill={cg} />
                <path d="M -34 -32 Q 0 -44 30 -30" stroke={tono(["#2E5A4E", "#8E2F2A", "#EDE3C8", "#E8B33C"], sem, 17)} strokeWidth={6} fill="none" />
                <path d="M -28 26 L -30 40" stroke={cg} strokeWidth={3} />
                <circle cx={-30} cy={42} r={4} fill={cg} />
              </g>
            );
          if (g === "montera")
            return (
              <g>
                <path d="M -26 -42 Q -26 -70 2 -72 Q 28 -70 28 -42 Z" fill={cg} />
                <rect x={-26} y={-52} width={54} height={7} fill={tono(FAJAS, sem, 13)} />
                <ellipse cx={2} cy={-42} rx={48} ry={7} fill={osc(cg, 0.8)} />
              </g>
            );
          if (g === "ala")
            return (
              <g>
                <ellipse cx={2} cy={-44} rx={62} ry={9} fill={"#202022"} />
                <path d="M -26 -46 Q -28 -80 2 -82 Q 30 -80 28 -46 Z" fill={"#1A1A1C"} />
                <rect x={-26} y={-56} width={54} height={7} fill={"#3A3A3E"} />
              </g>
            );
          if (g === "bonete") return <path d="M -28 -38 L -26 -80 L 28 -80 L 30 -38 Z" fill={"#1A1A1C"} />;
          if (g === "toca") return <path d="M -32 -8 Q -36 -54 0 -56 Q 30 -54 30 -20 L 24 -16 Q 0 -40 -22 -6 L -20 24 Q -28 26 -32 20 Z" fill={"#F2EDE2"} />;
          if (g === "paja") return <path d="M -70 -30 L 2 -92 L 74 -30 Q 2 -22 -70 -30 Z" fill={"#C9AE6A"} />;
          if (g === "ming") return <path d="M -28 -34 L -30 -92 L 30 -92 L 28 -34 Z" fill={"#18191C"} />;
          if (g === "casco")
            return (
              <g>
                <path d="M -34 -30 Q -36 -76 0 -78 Q 34 -76 34 -30 Z" fill={cg} />
                <rect x={-36} y={-34} width={84} height={7} rx={3} fill={osc(cg, 0.8)} />
                <rect x={30} y={-62} width={12} height={18} rx={3} fill={"#2A2C2E"} />
                {props.lampara ? <path d="M 42 -54 L 400 -140 L 400 60 Z" fill={"#FFF2C4"} opacity={0.12} /> : null}
                <circle cx={42} cy={-53} r={5} fill={"#FFF2C4"} />
              </g>
            );
          return null;
        })()}
      </g>
    </g>
  );

  const px = x0 + v * f;
  const py = y + vy * f;
  return (
    <g transform={`translate(${px} ${py - alza}) scale(${d * s * (nino ? 0.62 : 1)} ${s * (nino ? 0.62 : 1)})`}>
      <ellipse cx={0} cy={2} rx={44} ry={7} fill={"#000"} opacity={0.16} />
      {pierna(mB, eB, false)}
      <g transform={`translate(0 -196) rotate(${lean})`}>{brazo(bB, aB, false, herramienta === "barreta" || herramienta === "martillo" ? false : false)}</g>
      {pierna(mA, eA, true)}
      <g transform={`translate(0 -196) rotate(${lean})`}>
        {cuerpo()}
        {brazo(bA, aA, true, herramienta !== "ninguna")}
      </g>
    </g>
  );
};
