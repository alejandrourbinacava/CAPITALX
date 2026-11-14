import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import GUION from "../../content/financiacion-primera-guerra.json";
import TIEMPOS from "../../content/financiacion-primera-guerra.timings.json";
import {
  Cab,
  Calle,
  Capa,
  Cielo,
  Farola,
  FilaFondo,
  LugarFecha,
  Lienzo,
  MuroBanco,
  Oficinas,
  Omnibus,
  P,
  Peaton,
  Sello,
  Templo,
  r,
  suave,
} from "./Piezas";
import {
  Banqueros,
  BarrasTipos,
  ContadorGrande,
  DiezDias,
  HojaCalendario,
  LibraDisparada,
  MapaLondres,
  MapaMonedas,
  Periodico,
  PilasTriple,
  TextoGolpe,
  golpe,
} from "./Graficos";

/**
 * Piloto de montaje ilustrado: los tres primeros planos del capitulo I de la
 * Primera Guerra Mundial (agosto de 1914) contados solo con dibujo plano y
 * motion graphics hechos en codigo, sin laminas ni metraje. Un corte cada
 * tres o cuatro segundos, siempre sobre la frase de la voz que lo pide.
 * Sirve para decidir si el canal cambia de montaje; no es parte de la cadena.
 */

const FPS = 30;
/** Fotogramas que se solapan dos planos durante la transicion. */
const SOLAPE = 10;
const PLANOS = ["b1-01", "b1-02", "b1-03"] as const;

type Tiempos = Record<string, { audio: string; duration: number }>;
const T = TIEMPOS as unknown as Tiempos;
const VO: Record<string, string> = Object.fromEntries(
  (GUION as any).bloques.flatMap((b: any) => b.planos.map((p: any) => [p.id, p.vo]))
);

const duracion = (pid: string) => Math.round(T[pid].duration * FPS);

/** Fotograma, dentro del plano, en que la locucion llega a `frag` (por proporcion de caracteres). */
const momento = (pid: string, frag: string) => {
  const vo = VO[pid];
  const i = vo.indexOf(frag);
  if (i < 0) throw new Error(`"${frag}" no esta en ${pid}`);
  return Math.round((i / vo.length) * duracion(pid));
};

export const DURACION_PILOTO = PLANOS.reduce((n, p) => n + duracion(p), 0) + FPS;

/* ------------------------------------------------------------------ */
/* Escenas ilustradas                                                  */
/* ------------------------------------------------------------------ */

const TarjetaCapitulo: React.FC = () => {
  const f = useCurrentFrame();
  const a = suave(f / 12);
  const b = suave((f - 6) / 12);
  return (
    <AbsoluteFill style={{ background: "#1C2A2C", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 18 }).map((_, i) => {
          const y = ((r(i, 3) * 1200 + f * (6 + r(i, 4) * 8)) % 1300) - 120;
          const x = 120 + r(i, 5) * 1680;
          return (
            <g key={i} transform={`translate(${x} ${y})`} opacity={0.25}>
              <ellipse rx={26} ry={26 * Math.abs(Math.cos(f * 0.12 + i))} fill={P.ocre} />
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: "center", color: "#F2EFE6" }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 30, letterSpacing: 10, color: P.ocre, opacity: a }}>
          CAPÍTULO I
        </div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 112,
            lineHeight: 1.02,
            marginTop: 26,
            opacity: b,
            transform: `scale(${golpe(f, 6)})`,
          }}
        >
          AGOSTO DE 1914
        </div>
        <div style={{ fontFamily: FONT.serif, fontSize: 54, marginTop: 18, opacity: b, color: "#D9D2BF" }}>
          el pánico y el fin del oro
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** La City. Con `enfoque`, la camara se acerca al Banco de Inglaterra. */
const EscenaCity: React.FC<{ dur: number; enfoque?: boolean }> = ({ dur, enfoque }) => {
  const f = useCurrentFrame();
  const z = enfoque ? interpolate(f, [0, dur], [1.55, 1.85]) : interpolate(f, [0, dur], [1.0, 1.08]);
  const cx = enfoque ? 970 : 960;
  const cy = enfoque ? 560 : 540;
  return (
    <Lienzo>
      <g transform={`translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`}>
        <Cielo nubes={5} />
        <Capa recorrido={enfoque ? 20 : 60} dur={dur}>
          <FilaFondo y={760} color={"#CDBFA4"} semilla={2} />
        </Capa>
        <Capa recorrido={enfoque ? 60 : 160} dur={dur}>
          <Oficinas x={-300} y={800} w={520} h={560} semilla={1} />
          <Oficinas x={1720} y={800} w={600} h={600} tono={P.ladrilloOscuro} semilla={2} />
          <MuroBanco x={260} y={800} w={1420} h={430} />
          <text x={970} y={430} textAnchor="middle" fontFamily={FONT.serif} fontSize={34} letterSpacing={8} fill={P.piedraOscura}>
            BANK OF ENGLAND
          </text>
        </Capa>
        <Capa recorrido={enfoque ? 120 : 300} dur={dur}>
          <Calle y={800} />
          {[120, 700, 1300, 1900].map((x) => (
            <Farola key={x} x={x} y={856} />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <Peaton
              key={i}
              x={-200 + r(i, 11) * 2300}
              y={850}
              v={(r(i, 12) > 0.5 ? 1 : -1) * (1.6 + r(i, 13) * 1.2)}
              semilla={i + 3}
              escala={0.95 + r(i, 14) * 0.15}
              periodico={i % 3 === 0}
            />
          ))}
          {enfoque ? null : <Omnibus x={-500} y={1010} v={11} escala={1.05} />}
          {enfoque ? null : <Cab x={2200} y={1000} v={-8} escala={0.95} />}
        </Capa>
      </g>
      {enfoque ? null : <LugarFecha lugar="Londres" fecha="Finales de julio de 1914" desde={4} />}
    </Lienzo>
  );
};

/** La pizarra del tipo de descuento: 3 y luego 4. */
const EscenaPizarra: React.FC<{ dur: number; cambios: number[] }> = ({ dur, cambios }) => {
  const f = useCurrentFrame();
  const vals = [3, 4];
  const dias = ["29 JUL 1914", "30 JUL 1914"];
  let k = 0;
  cambios.forEach((c, i) => {
    if (f >= c) k = i;
  });
  const z = interpolate(f, [0, dur], [1, 1.12]);
  return (
    <Lienzo fondo={P.madera}>
      <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={40 + i * 320} y={60} width={280} height={960} rx={6} fill={P.maderaLuz} opacity={0.35} />
        ))}
        <rect x={460} y={120} width={1000} height={800} rx={16} fill={"#2A3431"} stroke={"#3C2B1F"} strokeWidth={26} />
        <text x={960} y={230} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={38} letterSpacing={6} fill={"#D8D3C2"}>
          BANCO DE INGLATERRA
        </text>
        <text x={960} y={282} textAnchor="middle" fontFamily={FONT.sans} fontSize={30} letterSpacing={4} fill={"#9FB0A8"}>
          TIPO DE DESCUENTO · EL PRECIO DEL DINERO
        </text>
        <g transform={`translate(960 640) scale(${golpe(f, cambios[k])})`}>
          <text textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={360} fill={"#F2EFE6"}>
            {vals[k]} %
          </text>
        </g>
        <text x={960} y={820} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={50} letterSpacing={6} fill={P.ocre}>
          {dias[k]}
        </text>
      </g>
    </Lienzo>
  );
};

/** Una Bolsa cierra sus puertas y cae el sello. */
const EscenaBolsa: React.FC<{
  dur: number;
  lugar: string;
  fecha: string;
  rotulo: string;
  frontis: boolean;
  sub: string;
  sello: number;
}> = ({ dur, lugar, fecha, rotulo, frontis, sub, sello }) => {
  const f = useCurrentFrame();
  const cierre = suave((f - 4) / Math.max(10, sello - 8));
  const z = interpolate(f, [0, dur], [1, 1.1]);
  return (
    <Lienzo>
      <g transform={`translate(960 600) scale(${z}) translate(-960 -600)`}>
        <Cielo nubes={3} alto={"#D9D2C2"} bajo={"#EDE6D6"} />
        <Capa recorrido={50} dur={dur}>
          <FilaFondo y={780} color={"#C7BBA2"} semilla={frontis ? 5 : 7} />
        </Capa>
        <Capa recorrido={120} dur={dur}>
          <Oficinas x={-260} y={810} w={460} h={640} semilla={4} tono={P.ladrilloOscuro} />
          <Oficinas x={1700} y={810} w={560} h={620} semilla={6} />
          <Templo x={330} y={810} w={1260} h={600} columnas={frontis ? 6 : 8} frontis={frontis} cierre={cierre} rotulo={rotulo} />
        </Capa>
        <Capa recorrido={200} dur={dur}>
          <Calle y={810} />
          {Array.from({ length: 14 }).map((_, i) => (
            <Peaton
              key={i}
              x={260 + r(i, 21) * 1400}
              y={866 + r(i, 22) * 24}
              v={i % 4 === 0 ? (r(i, 23) > 0.5 ? 1 : -1) * 1.6 : 0}
              semilla={i + 20}
              escala={1 + r(i, 24) * 0.12}
              periodico={i % 2 === 0}
            />
          ))}
        </Capa>
      </g>
      <Sello texto="CERRADA" sub={sub} x={960} y={330} desde={sello} />
      <LugarFecha lugar={lugar} fecha={fecha} desde={2} />
    </Lienzo>
  );
};

/** Cuanto tiempo estuvieron cerradas. La fila de Nueva York entra en `ny`. */
const EscenaCalendario: React.FC<{ ny: number }> = ({ ny }) => {
  const f = useCurrentFrame();
  const meses = ["AGO", "SEP", "OCT", "NOV", "DIC", "ENE"];
  const x0 = 380;
  const anchoMes = 230;
  const xDe = (dias: number) => x0 + (dias / 30.5) * anchoMes;
  const filas = [
    { nombre: "LONDRES", y: 420, fin: 157, parcial: null as number | null, nota: "reabre el 4 de enero de 1915", en: 0 },
    { nombre: "NUEVA YORK", y: 620, fin: 134, parcial: 120 as number | null, nota: "reabre a trozos: noviembre y diciembre", en: ny },
  ];
  return (
    <Lienzo fondo={P.cieloBajo}>
      <text x={960} y={190} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={64} fill={P.tinta}>
        Cerradas por la guerra
      </text>
      {meses.map((m, i) => (
        <g key={m}>
          <rect x={x0 + i * anchoMes} y={330} width={anchoMes - 6} height={480} fill={i % 2 ? "#EAE2D0" : "#E3D9C3"} />
          <text x={x0 + i * anchoMes + anchoMes / 2} y={310} textAnchor="middle" fontFamily={FONT.sans} fontWeight={600} fontSize={30} letterSpacing={3} fill={P.piedraOscura}>
            {m}
          </text>
        </g>
      ))}
      <text x={x0 - 20} y={860} textAnchor="end" fontFamily={FONT.mono} fontSize={22} fill={P.piedraOscura}>
        1914
      </text>
      <text x={x0 + 5 * anchoMes + 10} y={860} fontFamily={FONT.mono} fontSize={22} fill={P.piedraOscura}>
        1915
      </text>
      {filas.map((fl) => {
        const t = suave((f - fl.en) / 40);
        const finX = xDe(fl.fin);
        const w = (finX - x0) * t;
        return (
          <g key={fl.nombre} opacity={f >= fl.en ? 1 : 0}>
            <text x={x0 - 30} y={fl.y + 52} textAnchor="end" fontFamily={FONT.sans} fontWeight={700} fontSize={38} fill={P.tinta}>
              {fl.nombre}
            </text>
            <rect x={x0} y={fl.y} width={w} height={80} fill={P.carmin} />
            {fl.parcial !== null && t > 0.9 ? (
              <rect x={xDe(fl.parcial)} y={fl.y} width={finX - xDe(fl.parcial)} height={80} fill={P.ocre} opacity={suave((f - fl.en - 40) / 12)} />
            ) : null}
            <text x={x0 + 20} y={fl.y + 52} fontFamily={FONT.sans} fontWeight={600} fontSize={30} fill={"#F2EFE6"} opacity={t}>
              CERRADA
            </text>
            <text x={x0} y={fl.y + 122} fontFamily={FONT.sans} fontWeight={600} fontSize={30} fill={P.tinta} opacity={suave((f - fl.en - 36) / 12)}>
              {fl.nota}
            </text>
          </g>
        );
      })}
      <text x={1810} y={1040} textAnchor="end" fontFamily={FONT.mono} fontSize={20} fill={P.piedraOscura}>
        Fuente: Grady (1927); Ellison, Sargent y Scott (2019)
      </text>
    </Lienzo>
  );
};

/* ------------------------------------------------------------------ */
/* Montaje                                                             */
/* ------------------------------------------------------------------ */

type Entrada = "corte" | "barrido" | "zoom" | "cortina";
type Sfx = { at: number; src: "whoosh" | "slab" | "papel" | "tick" | "pixel"; vol?: number };
type Toma = { en: number; entrada: Entrada; sfx?: Sfx[]; el: (dur: number) => React.ReactNode };

/** Las tomas de cada plano: `en` es el fotograma del plano en que entran. */
const tomasDe = (pid: string): Toma[] => {
  const m = (frag: string) => momento(pid, frag);
  if (pid === "b1-01") {
    const tPizarra = m("en el tres") - 12;
    const tBarras = m("El treinta y uno");
    return [
      { en: 0, entrada: "corte", sfx: [{ at: 6, src: "slab", vol: 0.5 }], el: () => <TarjetaCapitulo /> },
      { en: m("Londres es el centro"), entrada: "cortina", sfx: [{ at: 0, src: "whoosh" }], el: (d) => <EscenaCity dur={d} /> },
      { en: m("y buena parte del mundo"), entrada: "zoom", sfx: [{ at: 0, src: "whoosh", vol: 0.25 }], el: (d) => <MapaLondres dur={d} /> },
      {
        en: m("El veintinueve de julio"),
        entrada: "barrido",
        sfx: [{ at: 0, src: "whoosh" }, { at: 14, src: "slab", vol: 0.4 }],
        el: (d) => (
          <AbsoluteFill>
            <EscenaCity dur={d} enfoque />
            <TextoGolpe velo lineas={[{ texto: "EL PRECIO", en: 12, tam: 150 }, { texto: "DEL DINERO", en: 18, tam: 150, color: P.ocre }]} />
          </AbsoluteFill>
        ),
      },
      {
        en: tPizarra,
        entrada: "zoom",
        sfx: [{ at: 12, src: "slab", vol: 0.45 }, { at: m("El treinta, en el cuatro") - tPizarra, src: "slab", vol: 0.45 }],
        el: (d) => <EscenaPizarra dur={d} cambios={[12, m("El treinta, en el cuatro") - tPizarra]} />,
      },
      {
        en: tBarras,
        entrada: "barrido",
        sfx: [{ at: 0, src: "whoosh" }, { at: 8, src: "slab", vol: 0.6 }, { at: m("El uno de agosto") - tBarras + 3, src: "slab", vol: 0.7 }],
        el: () => <BarrasTipos caen={[-30, -20, 4, m("El uno de agosto") - tBarras]} />,
      },
      {
        en: m("En cuatro días"),
        entrada: "cortina",
        sfx: [{ at: 0, src: "whoosh", vol: 0.25 }, { at: 3, src: "tick", vol: 0.3 }, { at: 32, src: "slab", vol: 0.55 }],
        el: (d) => <PilasTriple dur={d} />,
      },
    ];
  }
  if (pid === "b1-02") {
    const tLon = m("la Bolsa de Londres");
    const tNy = m("Nueva York cierra");
    return [
      { en: 0, entrada: "zoom", sfx: [{ at: 0, src: "whoosh", vol: 0.25 }, { at: 12, src: "papel", vol: 0.6 }], el: () => <HojaCalendario /> },
      {
        en: tLon,
        entrada: "barrido",
        sfx: [{ at: 0, src: "whoosh" }, { at: m("cierra por primera") - tLon, src: "slab", vol: 0.7 }],
        el: (d) => (
          <EscenaBolsa dur={d} lugar="Londres" fecha="Viernes 31 de julio de 1914" rotulo="STOCK EXCHANGE" frontis={false} sub="la Bolsa de Londres" sello={m("cierra por primera") - tLon} />
        ),
      },
      {
        en: m("ciento diecisiete"),
        entrada: "corte",
        sfx: [{ at: 28, src: "slab", vol: 0.6 }],
        el: () => <ContadorGrande hasta={117} sufijo="AÑOS" leyenda="sin cerrar nunca, según Grady y Ellison" />,
      },
      {
        en: tNy,
        entrada: "barrido",
        sfx: [{ at: 0, src: "whoosh" }, { at: 30, src: "slab", vol: 0.7 }],
        el: (d) => (
          <EscenaBolsa dur={d} lugar="Nueva York" fecha="El mismo 31 de julio" rotulo="NEW YORK STOCK EXCHANGE" frontis sub="la Bolsa de Nueva York" sello={30} />
        ),
      },
      {
        en: m("solo lo había hecho"),
        entrada: "zoom",
        sfx: [{ at: 0, src: "whoosh", vol: 0.25 }, ...Array.from({ length: 10 }).map((_, i) => ({ at: 10 + i * 4, src: "tick" as const, vol: 0.25 })), { at: 56, src: "slab", vol: 0.55 }],
        el: () => <DiezDias />,
      },
      {
        en: m("Londres no reabrirá"),
        entrada: "cortina",
        sfx: [{ at: 0, src: "whoosh", vol: 0.3 }],
        el: () => <EscenaCalendario ny={m("Nueva York lo hará") - m("Londres no reabrirá")} />,
      },
    ];
  }
  const tLibra = m("Según Bogart");
  return [
    { en: 0, entrada: "corte", sfx: [{ at: 0, src: "papel", vol: 0.6 }, { at: 24, src: "slab", vol: 0.6 }], el: () => <Periodico /> },
    { en: m("Estados Unidos debía"), entrada: "barrido", sfx: [{ at: 0, src: "whoosh" }, { at: 8, src: "slab", vol: 0.4 }], el: (d) => <MapaMonedas dur={d} /> },
    {
      en: tLibra,
      entrada: "zoom",
      sfx: [{ at: 0, src: "whoosh", vol: 0.25 }, { at: m("llegó a cotizar") - tLibra, src: "slab", vol: 0.7 }],
      el: () => <LibraDisparada a7={m("llegó a cotizar") - tLibra} />,
    },
    {
      en: m("Los bancos de Nueva York"),
      entrada: "cortina",
      sfx: [{ at: 0, src: "whoosh", vol: 0.3 }, { at: 24, src: "slab", vol: 0.5 }],
      el: () => <Banqueros />,
    },
  ];
};

/** Entrada animada de una toma sobre la anterior. */
const ConEntrada: React.FC<{ tipo: Entrada; children: React.ReactNode }> = ({ tipo, children }) => {
  const f = useCurrentFrame();
  const t = suave(f / SOLAPE);
  if (tipo === "corte") return <AbsoluteFill>{children}</AbsoluteFill>;
  if (tipo === "barrido") {
    return <AbsoluteFill style={{ transform: `translateX(${(1 - t) * 100}%)`, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined }}>{children}</AbsoluteFill>;
  }
  if (tipo === "zoom") {
    return <AbsoluteFill style={{ transform: `scale(${1.25 - 0.25 * t})`, opacity: t }}>{children}</AbsoluteFill>;
  }
  // cortina: una franja carmin barre la pantalla y descubre la toma
  const borde = (1 - t) * 100;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${borde}%)` }}>{children}</AbsoluteFill>
      {t < 1 ? <div style={{ position: "absolute", top: 0, bottom: 0, left: `${borde - 4}%`, width: "4%", background: P.carmin }} /> : null}
    </AbsoluteFill>
  );
};

export const Piloto: React.FC = () => {
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
          <ConEntrada tipo={tm.entrada}>{tm.el(dur)}</ConEntrada>
          {(tm.sfx ?? []).map((s, k) =>
            s.at >= 0 && s.at < dur ? (
              <Sequence key={k} from={s.at}>
                <Audio src={staticFile(`sfx/${s.src}.wav`)} volume={s.vol ?? 0.35} />
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
