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
import { C, FONT, framesForWords, T } from "./theme";
import { Kicker, Source, Surface } from "./components/Surface";
import { BigNumber, Rotulo, Statement } from "./components/Rotulo";
import { DublinNight } from "./scenes/DublinNight";
import contenido from "../content/irlanda.json";

export type Plano = {
  id: string;
  tipo: string;
  night?: boolean;
  kicker?: string;
  fuente?: string;
  vo: string;
  texto?: string;
  estatico?: boolean;
  numero?: { valor: number; desde?: number };
  de?: { valor: number; etiqueta: string };
  a?: { valor: number; etiqueta: string };
  rotulo?: { kicker?: string; texto: string };
};

export const planos: Plano[] = contenido.bloques.flatMap((b: any) => b.planos);

export const duraciones = planos.map((p) => framesForWords(p.vo, contenido.wpm));
export const duracionTotal = duraciones.reduce((a, b) => a + b, 0);

/** Contador de un valor a otro, con las dos fechas ancladas. */
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
  const from = p.de!.valor;
  const to = p.a!.valor;
  const shown = Math.round(from + (to - from) * t);

  return (
    <>
      {/* barra de progreso temporal entre las dos fechas */}
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
          top: 300,
          textAlign: "center",
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 320,
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
  const night = p.tipo === "contador" ? false : p.night;

  return (
    <Surface night={night} grid={p.tipo !== "dublin"} frame>
      {p.tipo === "dublin" ? <DublinNight /> : null}

      {/* Velo inferior: garantiza que el rotulo se lea sobre cualquier
          ilustracion, sin tocar la parte alta del encuadre. */}
      {p.tipo === "dublin" && p.rotulo ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "46%",
            background: `linear-gradient(to top, ${C.night} 6%, rgba(10,18,16,0.88) 34%, rgba(10,18,16,0) 100%)`,
            zIndex: 20,
          }}
        />
      ) : null}
      {p.tipo === "contador" ? <Contador p={p} /> : null}
      {p.tipo === "frase" ? <Statement text={p.texto ?? ""} night={p.night} /> : null}

      {p.numero ? (
        <BigNumber
          value={p.numero.valor}
          countFrom={p.numero.desde}
          countFrames={34}
          left={128}
          top={300}
          size={T.mega}
        />
      ) : null}

      {p.kicker ? <Kicker night={night}>{p.kicker}</Kicker> : null}
      {p.fuente ? <Source night={night}>{p.fuente}</Source> : null}
      {p.rotulo ? (
        <Rotulo kicker={p.rotulo.kicker} text={p.rotulo.texto} night={night} />
      ) : null}
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
          </Sequence>
        );
      })}

      {/* Lecho musical: el loop de 32 s repetido, muy por debajo de la voz */}
      {Array.from({ length: musicLoops }).map((_, i) => (
        <Sequence key={`m${i}`} from={i * 32 * fps} durationInFrames={32 * fps} name={`musica-${i}`}>
          <Audio src={staticFile("music/mystery.wav")} volume={0.13} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
