import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import GUION from "../../content/financiacion-primera-guerra.json";
import TIEMPOS from "../../content/financiacion-primera-guerra.timings.json";
import { LugarFecha, suave } from "./Piezas";
import { Persona, rasgosDe } from "./Personajes";
import {
  BolsaNuevaYork,
  CruceBanco,
  Despacho,
  Escribiente,
  Hansom,
  OmnibusB,
  PuertaBolsa,
  Portero,
  SalaBanco,
  SalaJuntas,
  Vendedor,
} from "./Decorados";

/**
 * Piloto ilustrado v3: los mismos tres planos del capitulo I, contados con
 * escenas dibujadas (decorados de 1914 y personajes con cara) y casi sin
 * graficos: las cifras estan dentro de la escena (la tiza de la pizarra, el
 * tablero del cambio) y un rotulo discreto abajo. Cada decorado da varias
 * tomas moviendo la camara: general, medio y primer plano.
 */

const FPS = 30;
const SOLAPE = 8;
const PLANOS = ["b1-01", "b1-02", "b1-03"] as const;

type Tiempos = Record<string, { audio: string; duration: number }>;
const T = TIEMPOS as unknown as Tiempos;
const VO: Record<string, string> = Object.fromEntries(
  (GUION as any).bloques.flatMap((b: any) => b.planos.map((p: any) => [p.id, p.vo]))
);
const duracion = (pid: string) => Math.round(T[pid].duration * FPS);
const momento = (pid: string, frag: string) => {
  const vo = VO[pid];
  const i = vo.indexOf(frag);
  if (i < 0) throw new Error(`"${frag}" no esta en ${pid}`);
  return Math.round((i / vo.length) * duracion(pid));
};

export const DURACION_PILOTO3 = PLANOS.reduce((n, p) => n + duracion(p), 0) + FPS;

/* ------------------------------------------------------------------ */
/* Camara, primer plano y rotulo                                       */
/* ------------------------------------------------------------------ */

type Enc = { x: number; y: number; z: number };

/** Mueve la camara del encuadre `de` al encuadre `a` a lo largo de la toma. */
const Camara: React.FC<{ de: Enc; a: Enc; dur: number; children: React.ReactNode; desenfoque?: number }> = ({ de, a, dur, children, desenfoque }) => {
  const f = useCurrentFrame();
  const t = suave(f / Math.max(1, dur));
  const x = de.x + (a.x - de.x) * t;
  const y = de.y + (a.y - de.y) * t;
  const z = de.z + (a.z - de.z) * t;
  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, filter: desenfoque ? `blur(${desenfoque}px) brightness(0.8)` : undefined }}
    >
      <g transform={`translate(960 540) scale(${z}) translate(${-x} ${-y})`}>{children}</g>
    </svg>
  );
};

/** Rotulo discreto abajo a la izquierda: kicker y una linea. */
const Rotulo: React.FC<{ kicker?: string; texto: string; desde?: number }> = ({ kicker, texto, desde = 10 }) => {
  const f = useCurrentFrame();
  const t = suave((f - desde) / 12);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        bottom: 70,
        opacity: t,
        transform: `translateX(${(1 - t) * -30}px)`,
        background: "rgba(20,24,26,0.86)",
        padding: "18px 28px 20px",
        borderLeft: "6px solid #C8402C",
        maxWidth: 1100,
      }}
    >
      {kicker ? (
        <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 22, letterSpacing: 4, color: "#E8B33C", marginBottom: 6 }}>{kicker.toUpperCase()}</div>
      ) : null}
      <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 40, color: "#F2EFE6", lineHeight: 1.15 }}>{texto}</div>
    </div>
  );
};

/** El rotulo de lugar y fecha de las Piezas, metido en su propio svg. */
const Lugar: React.FC<{ lugar: string; fecha: string }> = ({ lugar, fecha }) => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <LugarFecha lugar={lugar} fecha={fecha} desde={6} />
  </svg>
);

/** Primer plano: un personaje grande delante de un decorado desenfocado. */
const PrimerPlano: React.FC<{ fondo: React.ReactNode; enc: Enc; dur: number; persona: React.ReactNode; lado?: number }> = ({ fondo, enc, dur, persona, lado = 1 }) => {
  const f = useCurrentFrame();
  const empuje = interpolate(f, [0, dur], [1, 1.06]);
  return (
    <AbsoluteFill>
      <Camara de={enc} a={{ ...enc, z: enc.z * 1.04 }} dur={dur} desenfoque={7}>
        {fondo}
      </Camara>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${960 + lado * 260} 1180) scale(${2.5 * empuje}) translate(0 0)`}>{persona}</g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Tomas                                                               */
/* ------------------------------------------------------------------ */

const Tarjeta: React.FC = () => {
  const f = useCurrentFrame();
  const a = suave(f / 14);
  return (
    <AbsoluteFill style={{ background: "#1C2A2C", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#F2EFE6", opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 30, letterSpacing: 10, color: "#E8B33C" }}>CAPÍTULO I</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 110, marginTop: 22 }}>AGOSTO DE 1914</div>
        <div style={{ fontFamily: FONT.serif, fontSize: 54, marginTop: 14, color: "#D9D2BF" }}>el pánico y el fin del oro</div>
      </div>
    </AbsoluteFill>
  );
};

type Toma = { en: number; sfx?: { at: number; src: string; vol?: number }[]; el: (dur: number) => React.ReactNode };

const tomasDe = (pid: string): Toma[] => {
  const m = (frag: string) => momento(pid, frag);
  if (pid === "b1-01") {
    const tSala = m("El veintinueve de julio");
    const tCerca = m("en el tres") + 18;
    const t4 = m("El treinta, en el cuatro") - tCerca;
    return [
      { en: 0, el: () => <Tarjeta /> },
      {
        en: m("Londres es el centro"),
        sfx: [{ at: 0, src: "whoosh", vol: 0.25 }],
        el: (d) => (
          <AbsoluteFill>
            <Camara de={{ x: 760, y: 560, z: 1.02 }} a={{ x: 1060, y: 540, z: 1.08 }} dur={d}>
              <CruceBanco />
              <OmnibusB x0={-700} y={1012} v={6} />
              <Hansom x0={2300} y={1004} v={-4.5} />
            </Camara>
            <Lugar lugar="Londres" fecha="Finales de julio de 1914" />
          </AbsoluteFill>
        ),
      },
      {
        en: m("y buena parte del mundo"),
        el: (d) => (
          <AbsoluteFill>
            <Camara de={{ x: 1320, y: 760, z: 1.7 }} a={{ x: 1360, y: 780, z: 1.85 }} dur={d}>
              <CruceBanco />
              <Vendedor x={1300} y={1062} cartel="EUROPE LATEST" />
              <Persona x={1580} y={1070} semilla={140} pose="lee" gesto="inquieto" />
              <Persona x={1080} y={1080} semilla={141} pose="quieto" mirada={0.8} />
            </Camara>
            <Rotulo kicker="Londres, 1914" texto="El centro del crédito mundial" />
          </AbsoluteFill>
        ),
      },
      {
        en: tSala,
        sfx: [{ at: 0, src: "whoosh", vol: 0.2 }],
        el: (d) => {
          const escrito = (f: number) => suave((f - (m("en el tres") - tSala) + 10) / 16);
          return (
            <AbsoluteFill>
              <EscenaPizarra d={d} enc={[{ x: 960, y: 560, z: 1 }, { x: 980, y: 460, z: 1.12 }]} cifra="3 %" fecha="29 JULY 1914" escrito={escrito} escribiente />
              <Rotulo kicker="Banco de Inglaterra" texto="El tipo de descuento: el precio del dinero" desde={14} />
            </AbsoluteFill>
          );
        },
      },
      {
        en: tCerca,
        sfx: [{ at: t4, src: "tick", vol: 0.3 }],
        el: (d) => (
          <EscenaPizarra
            d={d}
            enc={[{ x: 920, y: 380, z: 1.6 }, { x: 920, y: 380, z: 1.75 }]}
            cifra={(f) => (f >= t4 ? "4 %" : "3 %")}
            fecha={(f) => (f >= t4 ? "30 JULY 1914" : "29 JULY 1914")}
            escrito={(f) => (f >= t4 ? suave((f - t4) / 14) : 1)}
          />
        ),
      },
      {
        en: m("El treinta y uno"),
        el: (d) => (
          <PrimerPlano
            dur={d}
            enc={{ x: 920, y: 400, z: 1.4 }}
            fondo={<SalaBanco titulo="BANK RATE" sub="BANK OF ENGLAND" cifra="8 %" escrito={1} fecha="31 JULY 1914" />}
            persona={<Persona x={0} y={0} semilla={210} pose="telegrama" gesto="inquieto" cuerpo="busto" mirada={-0.6} rasgos={rasgosDe(210, { sombrero: "ninguno", edad: "mayor", bigote: "manillar" })} />}
          />
        ),
      },
      {
        en: m("El uno de agosto"),
        sfx: [{ at: 4, src: "slab", vol: 0.35 }],
        el: (d) => (
          <EscenaPizarra d={d} enc={[{ x: 920, y: 380, z: 1.8 }, { x: 920, y: 390, z: 1.6 }]} cifra="10 %" fecha="1 AUGUST 1914" escrito={(f) => suave(f / 14)} />
        ),
      },
      {
        en: m("En cuatro días"),
        el: (d) => (
          <AbsoluteFill>
            <Camara de={{ x: 960, y: 700, z: 1.05 }} a={{ x: 960, y: 640, z: 1.12 }} dur={d}>
              <SalaBanco titulo="BANK RATE" sub="BANK OF ENGLAND" cifra="10 %" escrito={1} fecha="1 AUGUST 1914" publico={6} />
            </Camara>
            <Rotulo texto="Del 3 al 10 % en cuatro días" desde={6} />
          </AbsoluteFill>
        ),
      },
    ];
  }
  if (pid === "b1-02") {
    const tAviso = m("cierra por primera");
    const tNy = m("Nueva York cierra");
    const tCal = m("Londres no reabrirá");
    const tCalNy = m("Nueva York lo hará");
    return [
      {
        en: 0,
        sfx: [{ at: 0, src: "whoosh", vol: 0.25 }],
        el: (d) => (
          <AbsoluteFill>
            <Camara de={{ x: 960, y: 560, z: 1.0 }} a={{ x: 960, y: 600, z: 1.1 }} dur={d}>
              <PuertaCierra d={d} aviso={() => 0} />
            </Camara>
            <Lugar lugar="Londres" fecha="Viernes 31 de julio de 1914" />
          </AbsoluteFill>
        ),
      },
      {
        en: tAviso,
        sfx: [{ at: 18, src: "papel", vol: 0.5 }],
        el: (d) => (
          <AbsoluteFill>
            <Camara de={{ x: 1000, y: 640, z: 1.65 }} a={{ x: 1000, y: 620, z: 1.8 }} dur={d}>
              <PuertaCierra d={d} cerrada aviso={(f) => suave((f - 16) / 10)} />
            </Camara>
            <Rotulo kicker="La Bolsa de Londres" texto="Cierra por primera vez en 117 años" desde={30} />
          </AbsoluteFill>
        ),
      },
      {
        en: tNy,
        sfx: [{ at: 0, src: "whoosh", vol: 0.25 }],
        el: (d) => (
          <AbsoluteFill>
            <Camara de={{ x: 960, y: 300, z: 0.72 }} a={{ x: 960, y: 330, z: 0.78 }} dur={d}>
              <NyCierra d={d} />
            </Camara>
            <Lugar lugar="Nueva York" fecha="El mismo 31 de julio" />
          </AbsoluteFill>
        ),
      },
      {
        en: m("solo lo había hecho"),
        el: (d) => (
          <AbsoluteFill>
            <PrimerPlano
              dur={d}
              lado={-1}
              enc={{ x: 960, y: 420, z: 0.9 }}
              fondo={<BolsaNuevaYork cierre={1} />}
              persona={<Persona x={0} y={0} semilla={402} pose="lee" gesto="sorpresa" cuerpo="busto" mirada={0.3} rasgos={rasgosDe(402, { sombrero: "canotier" })} />}
            />
            <Rotulo kicker="Nueva York" texto="Antes solo había cerrado en 1873: diez días" desde={8} />
          </AbsoluteFill>
        ),
      },
      {
        en: tCal,
        sfx: [{ at: 0, src: "whoosh", vol: 0.2 }],
        el: (d) => (
          <AbsoluteFill>
            <Camara de={{ x: 700, y: 520, z: 1.35 }} a={{ x: 720, y: 540, z: 1.5 }} dur={d}>
              <Calendario d={d} hasta={5} anio="1915" />
              <Persona x={820} y={1010} escala={1.35} semilla={505} pose="brazos" gesto="serio" cuerpo="busto" mirada={-0.7} />
              <MesaDelante />
            </Camara>
            <Rotulo kicker="Londres" texto="No reabrirá hasta el 4 de enero de 1915" desde={10} />
          </AbsoluteFill>
        ),
      },
      {
        en: tCalNy,
        el: (d) => (
          <AbsoluteFill>
            <Camara de={{ x: 760, y: 560, z: 1.3 }} a={{ x: 780, y: 560, z: 1.4 }} dur={d}>
              <Despacho mes={3} hoja={0} anio="1914" />
              <Persona x={980} y={1010} escala={1.3} semilla={506} pose="habla" cuerpo="busto" mirada={-0.8} rasgos={rasgosDe(506, { sombrero: "ninguno" })} />
              <Persona x={560} y={1030} escala={1.3} semilla={507} pose="quieto" cuerpo="busto" mirada={0.7} gesto="inquieto" />
              <MesaDelante />
            </Camara>
            <Rotulo kicker="Nueva York" texto="Reabre a trozos, entre noviembre y diciembre" desde={8} />
          </AbsoluteFill>
        ),
      },
    ];
  }
  const tCable = m("Estados Unidos debía");
  const tTablero = m("Según Bogart");
  const t7 = m("llegó a cotizar") - tTablero;
  return [
    {
      en: 0,
      sfx: [{ at: 0, src: "whoosh", vol: 0.25 }],
      el: (d) => (
        <AbsoluteFill>
          <Camara de={{ x: 960, y: 760, z: 1.25 }} a={{ x: 960, y: 740, z: 1.35 }} dur={d}>
            <SalaBanco titulo="STERLING" sub="CABLE TRANSFERS · NEW YORK" cifra="" escrito={0} tono="nuevayork" publico={6} />
          </Camara>
        </AbsoluteFill>
      ),
    },
    {
      en: tCable,
      el: (d) => (
        <AbsoluteFill>
          <Camara de={{ x: 420, y: 560, z: 1.4 }} a={{ x: 480, y: 580, z: 1.55 }} dur={d}>
            <Despacho mes={0} hoja={0} mapa cable />
            <Persona x={560} y={1020} escala={1.35} semilla={610} pose="telegrama" gesto="inquieto" cuerpo="busto" mirada={0.4} rasgos={rasgosDe(610, { sombrero: "ninguno", gafas: true })} />
            <MesaDelante />
          </Camara>
          <Rotulo kicker="Nueva York debía a Londres" texto="Unos 580 millones de dólares a corto plazo" desde={10} />
        </AbsoluteFill>
      ),
    },
    {
      en: tTablero,
      sfx: [{ at: t7 + 2, src: "slab", vol: 0.35 }],
      el: (d) => (
        <AbsoluteFill>
          <Camara de={{ x: 920, y: 420, z: 1.45 }} a={{ x: 960, y: 720, z: 1.2 }} dur={d}>
            <TableroLibra t7={t7} />
          </Camara>
          <Rotulo kicker="Según Bogart (1920)" texto="La libra: de 4,87 a 7 dólares el 1 de agosto" desde={t7 + 6} />
        </AbsoluteFill>
      ),
    },
    {
      en: m("Los bancos de Nueva York"),
      sfx: [{ at: 26, src: "tick", vol: 0.3 }],
      el: (d) => (
        <AbsoluteFill>
          <Camara de={{ x: 940, y: 500, z: 0.98 }} a={{ x: 980, y: 520, z: 1.06 }} dur={d}>
            <JuntaCambia />
          </Camara>
          <Rotulo kicker="Los bancos de Nueva York" texto="Un precio político: 5 dólares" desde={30} />
        </AbsoluteFill>
      ),
    },
  ];
};

/* Escenas con estado animado ---------------------------------------- */

/** El tablero de la mesa de despacho, delante de quien esta sentado detras. */
const MesaDelante: React.FC = () => (
  <g>
    <rect x={-400} y={760} width={2800} height={40} fill={"#87603F"} />
    <rect x={-400} y={800} width={2800} height={600} fill={"#5C3E2C"} />
    <rect x={-400} y={800} width={2800} height={8} fill={"#4A3020"} />
  </g>
);

const EscenaPizarra: React.FC<{
  d: number;
  enc: [Enc, Enc];
  cifra: string | ((f: number) => string);
  fecha: string | ((f: number) => string);
  escrito: (f: number) => number;
  escribiente?: boolean;
}> = ({ d, enc, cifra, fecha, escrito, escribiente }) => {
  const f = useCurrentFrame();
  const c = typeof cifra === "function" ? cifra(f) : cifra;
  const fe = typeof fecha === "function" ? fecha(f) : fecha;
  return (
    <AbsoluteFill>
      <Camara de={enc[0]} a={enc[1]} dur={d}>
        <SalaBanco titulo="BANK RATE" sub="BANK OF ENGLAND" cifra={c} escrito={escrito(f)} fecha={fe} />
        {escribiente ? <Escribiente x={1520} y={1080} /> : null}
        {escribiente ? (
          <g>
            <Persona x={200} y={1140} semilla={220} escala={1.1} cuerpo="busto" pose="escribe" mirada={0.4} rasgos={rasgosDe(220, { sombrero: "ninguno" })} />
            <Persona x={560} y={1150} semilla={221} escala={1.1} cuerpo="busto" pose="escribe" mirada={-0.3} rasgos={rasgosDe(221, { sombrero: "ninguno", gafas: true })} />
            <rect x={-200} y={1000} width={1100} height={60} fill={"#87603F"} />
            <rect x={-200} y={1060} width={1100} height={200} fill={"#5C3E2C"} />
            <rect x={60} y={980} width={150} height={24} fill={"#F2EDE0"} />
            <rect x={420} y={984} width={170} height={22} fill={"#2F4A3F"} />
          </g>
        ) : null}
      </Camara>
    </AbsoluteFill>
  );
};

const PuertaCierra: React.FC<{ d: number; cerrada?: boolean; aviso: (f: number) => number }> = ({ cerrada, aviso }) => {
  const f = useCurrentFrame();
  const cierre = cerrada ? 1 : suave((f - 10) / 60);
  return (
    <g>
      <PuertaBolsa cierre={cierre} aviso={aviso(f)} />
      <Portero x={1180} y={1000} pose={cerrada ? "senala" : "quieto"} />
    </g>
  );
};

const NyCierra: React.FC<{ d: number }> = () => {
  const f = useCurrentFrame();
  return <BolsaNuevaYork cierre={suave((f - 6) / 50)} />;
};

/** El despacho con el calendario pasando hojas hasta `hasta`. */
const Calendario: React.FC<{ d: number; hasta: number; anio: string }> = ({ d, hasta }) => {
  const f = useCurrentFrame();
  const paso = Math.max(10, Math.floor((d - 20) / hasta));
  const n = Math.min(hasta, Math.floor(f / paso));
  const hoja = n < hasta ? (f % paso) / paso : 0;
  return <Despacho mes={n} hoja={hoja < 0.5 ? 0 : (hoja - 0.5) * 2} anio={n === 5 ? "1915" : "1914"} />;
};

const TableroLibra: React.FC<{ t7: number }> = ({ t7 }) => {
  const f = useCurrentFrame();
  const a7 = f >= t7;
  return (
    <SalaBanco
      titulo="STERLING"
      sub="£1 IN DOLLARS · NEW YORK"
      cifra={a7 ? "7.00" : "4.87"}
      escrito={a7 ? suave((f - t7) / 14) : suave(f / 16)}
      tono="nuevayork"
      publico={6}
      fecha={a7 ? "AUGUST 1, 1914" : "JULY 1914"}
    />
  );
};

const JuntaCambia: React.FC = () => {
  const f = useCurrentFrame();
  const cambio = 24;
  const g = f >= cambio && f < cambio + 10 ? (f - cambio) / 10 : 0;
  return <SalaJuntas cifra={f >= cambio + 5 ? "5.00" : "7.00"} giro={g} hablando />;
};

/* ------------------------------------------------------------------ */

const Fundido: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, SOLAPE], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};

export const Piloto3: React.FC = () => {
  let inicio = 0;
  const capas: React.ReactNode[] = [];
  PLANOS.forEach((pid, ip) => {
    const D = duracion(pid);
    capas.push(
      <Sequence key={pid + "-voz"} from={inicio} durationInFrames={D}>
        <Audio src={staticFile(T[pid].audio)} />
      </Sequence>
    );
    const tomas = tomasDe(pid);
    tomas.forEach((tm, i) => {
      const fin = i + 1 < tomas.length ? tomas[i + 1].en : D;
      const ultimo = ip === PLANOS.length - 1 && i === tomas.length - 1;
      const dur = fin - tm.en + (ultimo ? FPS : SOLAPE);
      capas.push(
        <Sequence key={`${pid}-${i}`} from={inicio + tm.en} durationInFrames={dur}>
          <Fundido>{tm.el(dur)}</Fundido>
          {(tm.sfx ?? []).map((s, k) =>
            s.at >= 0 && s.at < dur ? (
              <Sequence key={k} from={s.at}>
                <Audio src={staticFile(`sfx/${s.src}.wav`)} volume={s.vol ?? 0.3} />
              </Sequence>
            ) : null
          )}
        </Sequence>
      );
    });
    inicio += D;
  });
  return (
    <AbsoluteFill style={{ background: "#14181A" }}>
      {capas}
      <Audio src={staticFile("music/elegia.wav")} volume={0.08} />
    </AbsoluteFill>
  );
};
