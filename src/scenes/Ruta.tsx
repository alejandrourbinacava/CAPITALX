import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { FONT, TINTA } from "../theme";
import { useFrameFluido } from "../estilo";
import MUNDO from "../data/mundo.json";

/**
 * Mapa con rutas que se dibujan solas.
 *
 * Es el movimiento de los videos de historia: donde no existe metraje (nadie
 * filmo la flota de Indias), el recorrido se cuenta con un mapa. Las costas son
 * de Natural Earth, ya proyectadas en src/data/mundo.json (scripts/mapamundi.mjs),
 * y cada ruta es una curva que crece de un puerto al siguiente con un barco
 * en la punta.
 *
 * Los colores salen de los tokens de la plantilla, asi que el mismo mapa vale
 * en papel y en el fondo oscuro del documental.
 */
export type EtapaRuta = {
  de: string;
  a: string;
  /** Puertos intermedios, en orden. */
  via?: string[];
  tono?: "plata" | "deuda" | "otro";
};

export type EspecRuta = {
  vista: "mundo" | "atlantico" | "caribe" | "europa" | "pacifico" | "andes" | "atlantico_norte" | "suez" | "francia";
  etapas: EtapaRuta[];
  titulo?: string;
  kicker?: string;
  /** Lugares que se marcan aunque no los toque ninguna ruta. */
  marcar?: string[];
};

type Pt = { x: number; y: number };
type Vista = { d: string; red: string | null; lugares: Record<string, Pt> };

const VISTAS = MUNDO as unknown as Record<string, Vista>;

export const lugaresDeVista = (v: string) => Object.keys(VISTAS[v]?.lugares ?? {});

const suave = (t: number) => t * t * (3 - 2 * t);

/** Curva cuadratica de a a b, combada hacia arriba para que parezca un arco. */
const control = (a: Pt, b: Pt, comba: number): Pt => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const largo = Math.hypot(dx, dy) || 1;
  // perpendicular, la que apunta hacia arriba (y menor)
  let nx = -dy / largo;
  let ny = dx / largo;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  return { x: mx + nx * largo * comba, y: my + ny * largo * comba };
};

const punto = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});

/** Trozo de la curva entre 0 y t, como otra cuadratica (de Casteljau). */
const trozo = (a: Pt, c: Pt, b: Pt, t: number) => {
  const c1 = { x: a.x + t * (c.x - a.x), y: a.y + t * (c.y - a.y) };
  const fin = punto(a, c, b, t);
  return `M ${a.x} ${a.y} Q ${c1.x} ${c1.y} ${fin.x} ${fin.y}`;
};

/**
 * Colores propios, no los de la plantilla: la ruta tiene que destacar sobre
 * la costa oscura del documental y los tokens de acento quedan apagados ahi.
 */
const colorDe = (tono?: string) => (tono === "deuda" ? "#F0604A" : tono === "otro" ? "#EDE6D6" : "#F2C14E");

export const Ruta: React.FC<{ spec: EspecRuta }> = ({ spec }) => {
  const frame = useFrameFluido();
  const { durationInFrames, fps } = useVideoConfig();
  const vista = VISTAS[spec.vista] ?? VISTAS.atlantico;

  const etapas = spec.etapas ?? [];
  const n = Math.max(1, etapas.length);
  const cola = Math.round(fps * 0.8);
  const util = Math.max(fps, durationInFrames - cola);
  const tramo = util / n;

  const entrada = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Si hay un lugar rotulado en la esquina superior izquierda, el titulo baja para no taparlo.
  const nombresUsados = new Set<string>([...(spec.marcar ?? [])]);
  for (const e of spec.etapas ?? []) for (const nm of [e.de, ...(e.via ?? []), e.a]) nombresUsados.add(nm);
  const tituloAbajo = [...nombresUsados].some((nm) => {
    const q = vista.lugares[nm];
    return !!q && q.y < 330 && q.x < 1350;
  });

  // Cada etapa: lista de tramos curvos entre puertos consecutivos.
  const dibujos = etapas.map((e, i) => {
    const nombres = [e.de, ...(e.via ?? []), e.a];
    const pts = nombres.map((nm) => vista.lugares[nm]);
    const ok = pts.every(Boolean);
    const inicio = i * tramo;
    const p = interpolate(frame, [inicio, inicio + tramo * 0.82], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { e, nombres, pts, ok, p: suave(p), color: colorDe(e.tono) };
  });

  // Que lugares se rotulan y desde cuando.
  const alcance = new Map<string, number>();
  dibujos.forEach((d, i) => {
    if (!d.ok) return;
    d.nombres.forEach((nm, k) => {
      const frac = d.nombres.length === 1 ? 0 : k / (d.nombres.length - 1);
      const llegada = i * tramo + tramo * 0.82 * frac;
      alcance.set(nm, Math.min(alcance.get(nm) ?? Infinity, llegada));
    });
  });
  for (const nm of spec.marcar ?? []) if (!alcance.has(nm)) alcance.set(nm, 0);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: entrada }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {vista.red ? (
          <path d={vista.red} fill="none" stroke={TINTA} strokeOpacity={0.1} strokeWidth={1} />
        ) : null}
        <path d={vista.d} fill={TINTA} fillOpacity={0.2} stroke={TINTA} strokeOpacity={0.75} strokeWidth={1.8} />

        {dibujos.map((d, i) => {
          if (!d.ok || d.p <= 0) return null;
          // reparto del progreso entre los tramos de la etapa, por longitud
          const largos = d.pts.slice(1).map((b, k) => Math.hypot(b.x - d.pts[k].x, b.y - d.pts[k].y));
          const total = largos.reduce((s, x) => s + x, 0) || 1;
          let hecho = d.p * total;
          const piezas: React.ReactNode[] = [];
          let barco: Pt | null = null;
          d.pts.slice(1).forEach((b, k) => {
            const a = d.pts[k];
            const l = largos[k];
            const c = control(a, b, 0.16);
            const t = Math.min(1, Math.max(0, hecho / (l || 1)));
            hecho -= l;
            if (t <= 0) return;
            piezas.push(
              <path
                key={k}
                d={trozo(a, c, b, t)}
                fill="none"
stroke={d.color}
                strokeWidth={16}
                strokeLinecap="round"
                opacity={0.22}
              />,
              <path key={`s${k}`} d={trozo(a, c, b, t)} fill="none" stroke={d.color} strokeWidth={8} strokeLinecap="round" />
            );
            if (t < 1 || k === d.pts.length - 2) barco = punto(a, c, b, t);
          });
          const llego = d.p >= 0.999;
          return (
            <g key={i}>
              {piezas}
              {barco ? (
                <g transform={`translate(${(barco as Pt).x} ${(barco as Pt).y})`}>
                  <circle r={llego ? 26 : 34} fill={d.color} fillOpacity={0.3} />
                  <circle r={15} fill={d.color} stroke="#fff" strokeWidth={3.5} />
                </g>
              ) : null}
            </g>
          );
        })}

        {[...alcance.entries()].map(([nm, desde], idx, todos) => {
          const p = vista.lugares[nm];
          if (!p) return null;
          // si otro lugar ya rotulado esta a menos de 70 px, esta etiqueta baja
          const choca = todos.slice(0, idx).some(([otro]) => {
            const q = vista.lugares[otro];
            return q && Math.hypot(q.x - p.x, q.y - p.y) < 70;
          });
          const dy = choca ? 46 : 0;
          const k = interpolate(frame, [desde, desde + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (k <= 0) return null;
          const derecha = p.x < 1500;
          return (
            <g key={nm} opacity={k}>
              <circle cx={p.x} cy={p.y} r={9} fill={TINTA} />
              <circle cx={p.x} cy={p.y} r={16} fill="none" stroke={TINTA} strokeWidth={2} opacity={0.7} />
              <text
                x={derecha ? p.x + 26 : p.x - 26}
                y={p.y + 11 + dy}
                textAnchor={derecha ? "start" : "end"}
                fontFamily={FONT.sans}
                fontWeight={700}
                fontSize={36}
                fill={TINTA}
                stroke="#000"
                strokeOpacity={0.55}
                strokeWidth={7}
                paintOrder="stroke"
                letterSpacing="-0.01em"
              >
                {nm}
              </text>
            </g>
          );
        })}
      </svg>

      {spec.titulo ? (
        <div style={{ position: "absolute", left: 96, maxWidth: 1100, ...(tituloAbajo ? { bottom: 130 } : { top: 120 }) }}>
          {spec.kicker ? (
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 26,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: TINTA,
                opacity: 0.7,
                marginBottom: 12,
              }}
            >
              {spec.kicker}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: FONT.sans,
              fontWeight: 700,
              fontSize: 58,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: TINTA,
              textShadow: "0 2px 14px rgba(0,0,0,0.5)",
            }}
          >
            {spec.titulo}
          </div>
        </div>
      ) : null}
    </div>
  );
};
