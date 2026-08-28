import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT, VIDEO, framesForWords } from "./theme";
import { Kicker, Source, Surface } from "./components/Surface";
import { Rotulo, Statement } from "./components/Rotulo";
import { Beat, SketchRing, Tag, type Anim } from "./components/Beat";
import { DublinNight } from "./scenes/DublinNight";
import { PeopleGrid } from "./scenes/PeopleGrid";
import { Towers } from "./scenes/Towers";
import { Barras, Lineas } from "./scenes/Barras";
import { Objeto } from "./scenes/Objeto";
import { Cierre, Lista, Mapa } from "./scenes/Mapa";
import { Retrato } from "./scenes/Retrato";
import { Clip } from "./scenes/Clip";


type TagSpec = {
  t: string;
  x: number;
  y: number;
  in: number;
  out?: number;
  tone?: "ocre" | "carmin" | "ink" | "paper";
  anim?: Anim;
  size?: number;
};

/**
 * La parte visual, sin nada de audio.
 *
 * Un plano dura lo que dura su locucion, y eso son once segundos de media:
 * demasiado para quedarse mirando el mismo dibujo. Asi que un plano puede
 * traer varias `escenas`, que se reparten esa duracion. La voz sigue siendo
 * una sola frase continua, con su entonacion intacta, pero por debajo la
 * imagen cambia cada dos o tres segundos. Es como funciona el montaje al que
 * nos parecemos: el texto manda y la imagen le va siguiendo el paso.
 */
export type Visual = {
  tipo: string;
  night?: boolean;
  encuadre?: "amplio" | "corto";
  camara?: "push" | "pull" | "panL" | "panR" | "estatico";
  kicker?: string;
  fuente?: string;
  texto?: string;
  estatico?: boolean;
  tags?: TagSpec[];
  anillo?: { cx: number; cy: number; rx: number; ry: number };
  gente?: {
    total: number;
    destacados: number;
    escala: number;
    etiqueta?: string;
    etiquetaDestacados?: string;
  };
  de?: { valor: number; etiqueta: string };
  a?: { valor: number; etiqueta: string };
  objeto?: string;
  amanecer?: boolean;
  barras?: any;
  lineas?: any;
  mapa?: any;
  lista?: any;
  cierre?: any;
  retrato?: any;
  clip?: { buscar?: string; fichero?: string; desde?: number; tono?: "ocre" | "carmin" };
  rotulo?: { kicker?: string; texto: string };
};

/** Una escena dentro de un plano. `peso` reparte la duracion; por defecto 1. */
export type Escena = Visual & { peso?: number };

export type Plano = {
  id: string;
  tipo: string;
  escenas?: Escena[];
  night?: boolean;
  encuadre?: "amplio" | "corto";
  camara?: "push" | "pull" | "panL" | "panR" | "estatico";
  kicker?: string;
  fuente?: string;
  vo: string;
  texto?: string;
  estatico?: boolean;
  tags?: TagSpec[];
  anillo?: { cx: number; cy: number; rx: number; ry: number };
  gente?: {
    total: number;
    destacados: number;
    escala: number;
    etiqueta?: string;
    etiquetaDestacados?: string;
  };
  de?: { valor: number; etiqueta: string };
  a?: { valor: number; etiqueta: string };
  objeto?: string;
  amanecer?: boolean;
  barras?: any;
  lineas?: any;
  mapa?: any;
  lista?: any;
  cierre?: any;
  retrato?: any;
  voz?: { speed?: number };
  rotulo?: { kicker?: string; texto: string };
};

export type Tiempos = Record<string, { audio: string; duration: number }>;
export type Guion = { slug: string; wpm?: number; bloques: { planos: Plano[] }[] };

/** Cola de aire tras cada frase para que el corte no pise la ultima silaba. */
const COLA = 0.34;

export const planosDe = (g: Guion): Plano[] => g.bloques.flatMap((b) => b.planos);

/**
 * Duracion de cada plano. Manda el audio real; si un plano todavia no esta
 * locutado se estima por palabras para poder previsualizar.
 */
export const duracionesDe = (g: Guion, t: Tiempos) =>
  planosDe(g).map((p) =>
    t[p.id]
      ? Math.round((t[p.id].duration + COLA) * VIDEO.fps)
      : framesForWords(p.vo, g.wpm ?? 145)
  );

export const duracionTotalDe = (g: Guion, t: Tiempos) =>
  duracionesDe(g, t).reduce((a, b) => a + b, 0);

/** Lo que dura como poco una escena. Por debajo de esto no se lee nada. */
const MINIMO = Math.round(1.1 * VIDEO.fps);

/**
 * Reparte la duracion del plano entre sus escenas.
 *
 * El reparto va por `peso`, y los restos de la division se le dan a la
 * ultima, para que la suma cuadre al fotograma con la locucion. Si alguna
 * escena saliera demasiado corta para leerse, se descartan las sobrantes
 * antes que dejar parpadeos.
 */
export const repartir = (
  p: Plano,
  total: number
): { escena: Visual; desde: number; largo: number; solo: boolean }[] => {
  const es = p.escenas ?? [];
  if (es.length < 2) return [{ escena: es[0] ?? p, desde: 0, largo: total, solo: true }];

  const caben = Math.max(1, Math.min(es.length, Math.floor(total / MINIMO)));
  const usadas = es.slice(0, caben);
  if (usadas.length < 2) return [{ escena: usadas[0], desde: 0, largo: total, solo: true }];

  const pesos = usadas.map((e) => Math.max(0.4, e.peso ?? 1));
  const suma = pesos.reduce((a, b) => a + b, 0);

  const out = [];
  let desde = 0;
  for (let i = 0; i < usadas.length; i++) {
    const largo =
      i === usadas.length - 1 ? total - desde : Math.max(MINIMO, Math.round((pesos[i] / suma) * total));
    out.push({ escena: usadas[i], desde, largo, solo: false });
    desde += largo;
  }
  return out;
};

/** Un efecto disparado en el segundo `at` dentro del plano. */
const Sfx: React.FC<{ at: number; src: string; vol?: number }> = ({ at, src, vol = 0.3 }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.max(0, Math.round(at * fps))} name={`sfx-${src}`}>
      <Audio src={staticFile(`sfx/${src}.wav`)} volume={vol} />
    </Sequence>
  );
};

/** ¿El resalte del rotulo marca una cifra? Entonces es un dato, no una frase. */
const resaltaCifra = (texto?: string) => !!texto && /\d/.test(texto.split("*")[1] ?? "");

/**
 * Efectos por defecto de cada plano. Nada entra en pantalla sin que se oiga.
 *
 * El reparto:
 *   whoosh  el corte entre escenas, siempre
 *   papel   se suma al corte cuando entramos a un plano sobre papel
 *   pixel   cada vez que aparece una cifra
 *   buzz    cuando cae un dato importante
 *   tick    las etiquetas pequenas
 */
const sfxDePlano = (p: Plano): { at: number; src: string; vol: number }[] => {
  const out: { at: number; src: string; vol: number }[] = [];
  const sobrePapel = !(p.tipo === "dublin" || (p.tipo === "frase" && p.night));
  if (p.tipo === "retrato") out.push({ at: 0.12, src: "papel", vol: 0.3 });
  if (p.tipo === "clip") out.push({ at: 0.05, src: "buzz", vol: 0.2 });

  // 1. el corte
  out.push({ at: 0, src: "whoosh", vol: 0.3 });
  if (p.tipo === "frase") out.push({ at: 0.04, src: "buzz", vol: 0.26 });
  else if (sobrePapel) out.push({ at: 0.07, src: "papel", vol: 0.24 });

  // 2. las etiquetas
  for (const t of p.tags ?? []) out.push({ at: t.in, src: "tick", vol: 0.26 });

  // 3. el rotulo: si resalta una cifra es un dato, si no es una frase
  if (p.rotulo)
    out.push(
      resaltaCifra(p.rotulo.texto)
        ? { at: 0.26, src: "buzz", vol: 0.3 }
        : { at: 0.24, src: "slab", vol: 0.3 }
    );

  // 4. las cifras en pantalla
  if (p.tipo === "contador") out.push({ at: p.estatico ? 0.14 : 0.32, src: "pixel", vol: 0.32 });
  if (p.tipo === "barras" || p.tipo === "lineas") out.push({ at: 0.3, src: "pixel", vol: 0.3 });
  if (p.tipo === "lista") {
    const n = (p.lista?.puntos ?? []).length;
    for (let i = 0; i < n; i++) out.push({ at: 0.3 + i * 0.24, src: "tick", vol: 0.22 });
  }
  if (p.tipo === "cierre") out.push({ at: 0.16, src: "buzz", vol: 0.3 });
  if (p.tipo === "gente") {
    out.push({ at: 0.26, src: "pixel", vol: 0.26 });
    out.push({ at: 1.9, src: "buzz", vol: 0.28 });
  }

  // 5. remates
  if (p.tipo === "frase" && (p.texto ?? "").includes("*"))
    out.push({ at: 0.2, src: "slab", vol: 0.3 });
  if (p.anillo) out.push({ at: 0.72, src: "buzz", vol: 0.26 });

  return out;
};

/** Movimiento de camara del plano completo. Nunca dos seguidos iguales. */
const Camara: React.FC<{ modo: Visual["camara"]; children: React.ReactNode }> = ({
  modo = "estatico",
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / Math.max(durationInFrames - 1, 1);

  let transform = "none";
  if (modo === "push") transform = `scale(${interpolate(p, [0, 1], [1, 1.075])})`;
  if (modo === "pull") transform = `scale(${interpolate(p, [0, 1], [1.085, 1])})`;
  if (modo === "panL") transform = `scale(1.09) translateX(${interpolate(p, [0, 1], [26, -26])}px)`;
  if (modo === "panR") transform = `scale(1.09) translateX(${interpolate(p, [0, 1], [-26, 26])}px)`;

  return (
    <div style={{ position: "absolute", inset: 0, transform, transformOrigin: "50% 50%" }}>
      {children}
    </div>
  );
};

const Contador: React.FC<{ p: Visual }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = p.estatico
    ? 1
    : interpolate(frame, [10, Math.min(durationInFrames - 8, 74)], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: (x) => 1 - Math.pow(1 - x, 3),
      });
  const shown = Math.round(p.de!.valor + (p.a!.valor - p.de!.valor) * t);

  return (
    <>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
        <line x1="300" y1="780" x2="1620" y2="780" stroke="#B4BBB2" strokeWidth="3" />
        <line x1="300" y1="780" x2={300 + 1320 * t} y2="780" stroke={C.carmin} strokeWidth="9" />
        <circle cx={300 + 1320 * t} cy="780" r="15" fill={C.carmin} />
        <text x="300" y="836" fill={C.muted} fontFamily={FONT.mono} fontSize="26" letterSpacing="3">
          {p.de!.etiqueta}
        </text>
        <text x="1620" y="836" textAnchor="end" fill={C.muted} fontFamily={FONT.mono} fontSize="26" letterSpacing="3">
          {p.a!.etiqueta}
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 290,
          textAlign: "center",
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 300,
          lineHeight: 0.9,
          letterSpacing: "-0.05em",
          color: C.ink,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {shown.toLocaleString("es-ES")}
      </div>
    </>
  );
};

const PlanoView: React.FC<{ p: Visual }> = ({ p }) => {
  const night =
    p.tipo === "dublin" ||
    p.tipo === "clip" ||
    ((p.tipo === "frase" || p.tipo === "lista") && !!p.night);

  return (
    <Surface night={night} grid={p.tipo !== "dublin" && p.tipo !== "mapa" && p.tipo !== "clip"} frame>
      <Camara modo={p.camara}>
        {p.tipo === "dublin" ? <DublinNight encuadre={p.encuadre} dawn={p.amanecer} /> : null}
        {p.tipo === "torres" ? <Towers /> : null}
        {p.tipo === "gente" ? (
          <PeopleGrid
            total={p.gente!.total}
            destacados={p.gente!.destacados}
            escala={p.gente!.escala}
            etiqueta={p.gente!.etiqueta}
            etiquetaDestacados={p.gente!.etiquetaDestacados}
          />
        ) : null}
        {p.tipo === "contador" ? <Contador p={p} /> : null}
        {p.tipo === "barras" ? <Barras spec={p.barras} /> : null}
        {p.tipo === "lineas" ? <Lineas spec={p.lineas} /> : null}
        {p.tipo === "mapa" ? <Mapa spec={p.mapa} /> : null}
        {p.tipo === "objeto" ? <Objeto nombre={p.objeto!} /> : null}
        {p.tipo === "retrato" ? <Retrato spec={p.retrato} /> : null}
        {p.tipo === "clip" ? <Clip spec={p.clip ?? {}} tono={p.clip?.tono} /> : null}
      </Camara>

      {p.tipo === "frase" ? <Statement text={p.texto ?? ""} night={p.night} /> : null}
      {p.tipo === "lista" ? <Lista spec={p.lista} night={night} /> : null}
      {p.tipo === "cierre" ? <Cierre spec={p.cierre} /> : null}

      {p.anillo ? (
        <SketchRing cx={p.anillo.cx} cy={p.anillo.cy} rx={p.anillo.rx} ry={p.anillo.ry} delay={0.7} />
      ) : null}

      {/* Velo inferior: el rotulo tiene que leerse sobre cualquier dibujo,
          tanto en papel como en noche. */}
      {p.rotulo && !["frase", "contador", "lista", "cierre", "barras", "lineas"].includes(p.tipo) ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "44%",
            background: night
              ? `linear-gradient(to top, ${C.night} 6%, rgba(10,18,16,0.88) 34%, rgba(10,18,16,0) 100%)`
              : `linear-gradient(to top, ${C.paper} 10%, rgba(242,239,230,0.92) 38%, rgba(242,239,230,0) 100%)`,
            zIndex: 20,
          }}
        />
      ) : null}

      {(p.tags ?? []).map((t, i) => (
        <Beat
          key={i}
          in={t.in}
          out={t.out}
          anim={t.anim ?? "pop"}
          style={{ left: `${t.x}%`, top: `${t.y}%`, zIndex: 30 }}
        >
          <Tag tone={t.tone} size={t.size}>
            {t.t}
          </Tag>
        </Beat>
      ))}

      {p.kicker ? <Kicker night={night}>{p.kicker}</Kicker> : null}
      {p.fuente ? <Source night={night}>{p.fuente}</Source> : null}
      {p.rotulo ? <Rotulo kicker={p.rotulo.kicker} text={p.rotulo.texto} night={night} /> : null}
    </Surface>
  );
};

export const CapitalXVideo: React.FC<{ guion: Guion; tiempos: Tiempos }> = ({
  guion,
  tiempos,
}) => {
  const { durationInFrames, fps } = useVideoConfig();
  const planos = planosDe(guion);
  const duraciones = duracionesDe(guion, tiempos);
  let cursor = 0;
  const musicLoops = Math.ceil(durationInFrames / (32 * fps)) + 1;

  return (
    <AbsoluteFill style={{ background: C.night }}>
      {planos.map((p, i) => {
        const from = cursor;
        cursor += duraciones[i];
        return (
          <Sequence key={p.id} from={from} durationInFrames={duraciones[i]} name={p.id}>
            {/* La locucion y los efectos van al plano entero; la imagen se
                trocea por debajo sin tocar el audio. */}
            {repartir(p, duraciones[i]).map((t, k) => (
              <Sequence
                key={k}
                from={t.desde}
                durationInFrames={t.largo}
                name={t.solo ? p.id : `${p.id}.${k + 1}`}
              >
                <PlanoView p={t.escena} />
                {/* cada cambio de imagen suena, o el corte se nota vacio */}
                {k > 0 ? <Sfx at={0} src="papel" vol={0.22} /> : null}
              </Sequence>
            ))}
            {tiempos[p.id] ? <Audio src={staticFile(tiempos[p.id].audio)} /> : null}
            {sfxDePlano(p).map((s, k) => (
              <Sfx key={k} at={s.at} src={s.src} vol={s.vol} />
            ))}
          </Sequence>
        );
      })}

      {Array.from({ length: musicLoops }).map((_, i) => (
        <Sequence key={`m${i}`} from={i * 32 * fps} durationInFrames={32 * fps} name={`musica-${i}`}>
          <Audio src={staticFile("music/mystery.wav")} volume={0.085} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
