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
import contenido from "../content/irlanda.json";
import tiempos from "../content/irlanda.timings.json";

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

export type Plano = {
  id: string;
  tipo: string;
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
  rotulo?: { kicker?: string; texto: string };
};

const T: Record<string, { audio: string; duration: number }> = tiempos as any;

export const planos: Plano[] = (contenido as any).bloques.flatMap((b: any) => b.planos);

/** Cola de aire tras cada frase para que el corte no pise la ultima silaba. */
const COLA = 0.34;

export const duraciones = planos.map((p) =>
  T[p.id]
    ? Math.round((T[p.id].duration + COLA) * VIDEO.fps)
    : framesForWords(p.vo, (contenido as any).wpm)
);
export const duracionTotal = duraciones.reduce((a, b) => a + b, 0);

/** Movimiento de camara del plano completo. Nunca dos seguidos iguales. */
const Camara: React.FC<{ modo: Plano["camara"]; children: React.ReactNode }> = ({
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

const Contador: React.FC<{ p: Plano }> = ({ p }) => {
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

const PlanoView: React.FC<{ p: Plano }> = ({ p }) => {
  const night = p.tipo === "dublin" || (p.tipo === "frase" && p.night);

  return (
    <Surface night={night} grid={p.tipo !== "dublin"} frame>
      <Camara modo={p.camara}>
        {p.tipo === "dublin" ? <DublinNight encuadre={p.encuadre} /> : null}
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
      </Camara>

      {p.tipo === "frase" ? <Statement text={p.texto ?? ""} night={p.night} /> : null}

      {p.anillo ? (
        <SketchRing cx={p.anillo.cx} cy={p.anillo.cy} rx={p.anillo.rx} ry={p.anillo.ry} delay={0.7} />
      ) : null}

      {/* Velo inferior: el rotulo tiene que leerse sobre cualquier dibujo,
          tanto en papel como en noche. */}
      {p.rotulo && p.tipo !== "frase" && p.tipo !== "contador" ? (
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

export const CapitalXVideo: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  let cursor = 0;
  const musicLoops = Math.ceil(durationInFrames / (32 * fps)) + 1;

  return (
    <AbsoluteFill style={{ background: C.night }}>
      {planos.map((p, i) => {
        const from = cursor;
        cursor += duraciones[i];
        return (
          <Sequence key={p.id} from={from} durationInFrames={duraciones[i]} name={p.id}>
            <PlanoView p={p} />
            {T[p.id] ? <Audio src={staticFile(T[p.id].audio)} /> : null}
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
