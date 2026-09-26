import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { ACENTO, APAGADO, PAPEL, REALCE, TINTA } from "../theme";
import { familiaDe, useFrame, usePlantilla } from "../estilo";

/**
 * Ilustraciones en movimiento.
 *
 * Los `objeto` del canal son siluetas quietas: entran con su sombra y ahi se
 * quedan los cinco segundos. Sirven para senalar una cosa -una casa, una
 * grua, una balanza- pero no cuentan nada, y son el doce por ciento de las
 * escenas de cada video.
 *
 * Esto es otra cosa. Cada ilustracion tiene varias piezas que se mueven
 * durante toda la escena y juntas explican un mecanismo: una ciudad que se
 * construye y deja huecos sin construir, un caudal que alguien corta, una
 * fabrica que se para. No es un dibujo con una animacion de entrada; es el
 * dato, dibujado.
 *
 * Van escalonadas a proposito: son dibujo, no fotografia, y el dibujo es
 * justo lo que en este montaje tiene que pisar.
 */

export type EspecIlustracion = {
  nombre: string;
  /** Cuantas piezas hay en total. */
  total?: number;
  /** Cuantas se completan. El resto se queda en linea de puntos. */
  hechas?: number;
  /** El caudal se corta a mitad de escena. */
  cortado?: boolean;
  /** La maquina se para a mitad de escena. */
  parado?: boolean;
  /** Etiquetas de los dos extremos del caudal. */
  de?: string;
  a?: string;
};

const VB = "0 0 1920 1080";
const lienzo: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

/** Ruido determinista: mismo indice, mismo valor, en cualquier maquina. */
const r = (i: number, k = 1) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/* ================================================================== */
/* ciudad: se construye sola, y deja a la vista lo que no se construye */
/* ================================================================== */
const Ciudad: React.FC<{ spec: EspecIlustracion }> = ({ spec }) => {
  const frame = useFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const total = spec.total ?? 9;
  const hechas = spec.hechas ?? Math.ceil(total * 0.6);

  // El suelo va alto: por debajo de 800 empieza el sitio del rotulo.
  const SUELO = 790;
  const ancho = 150;
  const hueco = 22;
  const x0 = (1920 - (total * ancho + (total - 1) * hueco)) / 2;

  const edificios = Array.from({ length: total }, (_, i) => {
    const alto = 160 + Math.round(r(i, 3) * 380);
    const x = x0 + i * (ancho + hueco);
    const construido = i < hechas;
    // Suben escalonados, de izquierda a derecha.
    const k = spring({
      frame: frame - 8 - i * 6,
      fps,
      config: { damping: 200, mass: 0.7 },
    });
    return { i, x, alto, construido, k };
  });

  return (
    <svg style={lienzo} viewBox={VB}>
      {/* suelo */}
      <line x1="120" y1={SUELO} x2="1800" y2={SUELO} stroke={TINTA} strokeWidth="5" />

      {edificios.map(({ i, x, alto, construido, k }) => {
        const h = alto * (construido ? k : 1);
        const y = SUELO - h;
        if (!construido) {
          // Lo que falta no se dibuja lleno: se dibuja como hueco, que es de
          // lo que va el dato. La linea de puntos se traza en vez de aparecer.
          const perim = (ancho + alto) * 2;
          const t = interpolate(frame, [14 + i * 6, 14 + i * 6 + 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={ancho}
              height={alto}
              fill="none"
              stroke={ACENTO}
              strokeWidth="4"
              strokeDasharray={`18 14`}
              strokeDashoffset={perim * (1 - t)}
              opacity={0.85}
            />
          );
        }
        // Ventanas que se van encendiendo durante toda la escena.
        const cols = 3;
        const filas = Math.max(2, Math.floor(alto / 90));
        return (
          <g key={i}>
            <rect x={x} y={y} width={ancho} height={h} fill={TINTA} />
            {k > 0.96
              ? Array.from({ length: cols * filas }, (_, j) => {
                  const cx = x + 22 + (j % cols) * 42;
                  const cy = y + 30 + Math.floor(j / cols) * 70;
                  if (cy > SUELO - 44) return null;
                  const cuando = 30 + r(i * 31 + j, 7) * (durationInFrames - 50);
                  const on = frame > cuando;
                  return (
                    <rect
                      key={j}
                      x={cx}
                      y={cy}
                      width={28}
                      height={40}
                      fill={on ? REALCE : PAPEL}
                      opacity={on ? 1 : 0.22}
                    />
                  );
                })
              : null}
          </g>
        );
      })}

      {/* La grua se planta justo en la frontera: a su izquierda lo que se
          construyo, a su derecha lo que no. Ademas de mantener viva la escena
          cuando ya han subido todos los edificios, senala el dato. */}
      <Grua
        frame={frame}
        suelo={SUELO}
        x={Math.min(1760, x0 + hechas * (ancho + hueco) + ancho * 0.2)}
      />
    </svg>
  );
};

const Grua: React.FC<{ frame: number; suelo: number; x: number }> = ({ frame, suelo, x }) => {
  const mastilX = x;
  const mastilY = suelo - 560;
  const giro = Math.sin(frame / 42) * 9;
  const carro = 120 + (Math.sin(frame / 31) * 0.5 + 0.5) * 240;
  const gancho = 90 + (Math.sin(frame / 23) * 0.5 + 0.5) * 150;

  return (
    <g stroke={TINTA} strokeWidth="6" fill="none" strokeLinecap="square">
      <line x1={mastilX} y1={suelo} x2={mastilX} y2={mastilY} />
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={mastilX - 18}
          y1={suelo - 60 - i * 140}
          x2={mastilX + 18}
          y2={suelo - 130 - i * 140}
        />
      ))}
      <g transform={`rotate(${giro} ${mastilX} ${mastilY})`}>
        <line x1={mastilX - 380} y1={mastilY} x2={mastilX + 150} y2={mastilY} />
        <line x1={mastilX} y1={mastilY - 90} x2={mastilX - 380} y2={mastilY} />
        <line x1={mastilX} y1={mastilY - 90} x2={mastilX + 150} y2={mastilY} />
        <line x1={mastilX} y1={mastilY} x2={mastilX} y2={mastilY - 90} />
        {/* carro y gancho */}
        <line
          x1={mastilX - carro}
          y1={mastilY}
          x2={mastilX - carro}
          y2={mastilY + gancho}
          strokeWidth="3"
        />
        <rect
          x={mastilX - carro - 26}
          y={mastilY + gancho}
          width="52"
          height="38"
          fill={ACENTO}
          stroke="none"
        />
      </g>
    </g>
  );
};

/* ================================================================== */
/* flujo: un caudal entre dos puntos, y alguien que lo corta           */
/* ================================================================== */
const Flujo: React.FC<{ spec: EspecIlustracion }> = ({ spec }) => {
  const frame = useFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const corte = durationInFrames * 0.52;
  const cortado = !!spec.cortado;
  // Cuando se corta, el caudal no se para de golpe: frena en medio segundo.
  const caudal = cortado
    ? interpolate(frame, [corte, corte + 14], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const Y = 470;
  const tubo = `M 470 ${Y} L 1450 ${Y}`;
  // El tubo se parte en dos para poder vaciar solo el tramo de despues de la
  // valvula: cortado el paso, lo que ya habia pasado sigue su camino y deja
  // el tramo vacio. Con un solo trazo las marcas se congelaban a la derecha y
  // parecia que seguia corriendo.
  const antes = `M 470 ${Y} L 900 ${Y}`;
  const despues = `M 1020 ${Y} L 1450 ${Y}`;
  const vaciado = cortado
    ? interpolate(frame, [corte + 4, corte + 26], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const entra = spring({ frame: frame - 4, fps, config: { damping: 200, mass: 0.7 } });

  // El desplazamiento se acumula: al frenar el caudal, las marcas se paran
  // donde esten en vez de saltar al origen.
  const avance = React.useMemo(() => {
    let a = 0;
    for (let f = 0; f <= frame; f++) {
      const c = cortado
        ? Math.max(0, Math.min(1, 1 - (f - corte) / 14))
        : 1;
      a += 7 * c;
    }
    return a;
  }, [frame, cortado, corte]);

  const valvula = cortado
    ? interpolate(frame, [corte, corte + 10], [0, 90], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: (x) => 1 - Math.pow(1 - x, 3),
      })
    : 0;

  return (
    <svg style={lienzo} viewBox={VB}>
      {/* los dos extremos */}
      <Nodo x={330} y={Y} etiqueta={spec.de} k={entra} />
      <Nodo x={1590} y={Y} etiqueta={spec.a} k={entra} apagado={cortado && caudal < 0.05} />

      {/* el tubo */}
      <path
        d={tubo}
        stroke={TINTA}
        strokeWidth="46"
        fill="none"
        strokeLinecap="butt"
        opacity={0.14}
        strokeDasharray={980}
        strokeDashoffset={980 * (1 - entra)}
      />
      {/* el caudal: marcas que corren por dentro */}
      <path
        d={antes}
        stroke={ACENTO}
        strokeWidth="26"
        fill="none"
        strokeLinecap="butt"
        strokeDasharray="46 38"
        strokeDashoffset={-avance}
        opacity={entra}
      />
      <path
        d={despues}
        stroke={ACENTO}
        strokeWidth="26"
        fill="none"
        strokeLinecap="butt"
        strokeDasharray="46 38"
        strokeDashoffset={-(cortado ? avance + (1 - vaciado) * 460 : avance)}
        opacity={entra * vaciado}
      />

      {/* la valvula, en medio */}
      <g transform={`translate(960 ${Y})`} opacity={entra}>
        <circle r="62" fill={PAPEL} stroke={TINTA} strokeWidth="6" />
        <g transform={`rotate(${valvula})`}>
          <rect x="-54" y="-9" width="108" height="18" fill={TINTA} />
        </g>
        <circle r="10" fill={ACENTO} />
      </g>

      {/* lo que se acumula detras cuando el caudal se corta */}
      {cortado ? (
        <g opacity={interpolate(frame, [corte + 6, corte + 26], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}>
          {/* lo que no pasa se amontona pegado a la valvula */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={846 - Math.floor(i / 2) * 50}
              y={Y - 66 - (i % 2) * 50}
              width={44}
              height={44}
              fill={ACENTO}
              opacity={1 - Math.floor(i / 2) * 0.16}
            />
          ))}
        </g>
      ) : null}
    </svg>
  );
};

const Nodo: React.FC<{
  x: number;
  y: number;
  etiqueta?: string;
  k: number;
  apagado?: boolean;
}> = ({ x, y, etiqueta, k, apagado }) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <circle r={118 * k} fill={apagado ? PAPEL : REALCE} stroke={TINTA} strokeWidth="6" />
    <circle r={52 * k} fill={apagado ? APAGADO : TINTA} />
    {etiqueta ? (
      <text
        y={196}
        textAnchor="middle"
        fill={TINTA}
        fontFamily="inherit"
        fontSize="38"
        fontWeight="700"
      >
        {etiqueta}
      </text>
    ) : null}
  </g>
);

/* ================================================================== */
/* fabrica: cinta, humo y engranajes. Y se puede parar.                */
/* ================================================================== */
const Fabrica: React.FC<{ spec: EspecIlustracion }> = ({ spec }) => {
  const frame = useFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const parada = !!spec.parado;
  const corte = durationInFrames * 0.55;
  const marcha = parada
    ? interpolate(frame, [corte, corte + 22], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: (x) => x * x,
      })
    : 1;

  // Igual que el caudal: la cinta frena, no se teletransporta.
  const avance = React.useMemo(() => {
    let a = 0;
    for (let f = 0; f <= frame; f++) {
      const m = parada ? Math.max(0, Math.min(1, 1 - ((f - corte) / 22) ** 1)) : 1;
      a += 6 * (parada ? m * m : m);
    }
    return a;
  }, [frame, parada, corte]);

  const entra = spring({ frame: frame - 3, fps, config: { damping: 200, mass: 0.7 } });
  const SUELO = 780;

  return (
    <svg style={lienzo} viewBox={VB}>
      {/* nave con diente de sierra */}
      <g opacity={entra} transform={`translate(0 ${(1 - entra) * 40})`}>
        <path
          d={`M520 ${SUELO} L520 430 L610 350 L610 430 L700 350 L700 430 L790 350 L790 430 L880 350 L880 430 L970 350 L970 ${SUELO} Z`}
          fill={TINTA}
        />
        <rect x="1010" y="250" width="96" height={SUELO - 250} fill={TINTA} />
        {/* ventanas */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={556 + i * 92} y={520} width={56} height={70} fill={REALCE} />
        ))}
      </g>

      {/* humo: bocanadas que suben y se abren, en bucle */}
      {Array.from({ length: 6 }, (_, i) => {
        const periodo = 46;
        const t = ((frame * (0.5 + marcha * 0.5) + i * (periodo / 6)) % periodo) / periodo;
        const y = 250 - t * 210;
        const rad = 22 + t * 58;
        return (
          <circle
            key={i}
            cx={1058 + Math.sin(t * 3 + i) * 34}
            cy={y}
            r={rad}
            fill={APAGADO}
            opacity={(1 - t) * 0.5 * entra * (0.35 + marcha * 0.65)}
          />
        );
      })}

      {/* engranajes */}
      <Engranaje cx={1310} cy={500} r={92} dientes={12} giro={avance * 0.5} />
      <Engranaje cx={1450} cy={588} r={62} dientes={9} giro={-avance * 0.74} />

      {/* cinta */}
      <g opacity={entra}>
        <line x1="240" y1={SUELO} x2="1800" y2={SUELO} stroke={TINTA} strokeWidth="10" />
        <line
          x1="240"
          y1={SUELO + 34}
          x2="1800"
          y2={SUELO + 34}
          stroke={TINTA}
          strokeWidth="4"
          strokeDasharray="26 22"
          strokeDashoffset={-avance}
        />
        {Array.from({ length: 7 }, (_, i) => {
          const x = ((avance + i * 240) % 1700) + 200;
          return (
            <rect
              key={i}
              x={x}
              y={SUELO - 62}
              width={62}
              height={62}
              fill={i % 3 === 0 ? ACENTO : TINTA}
            />
          );
        })}
      </g>

      {/* cuando se para, el cartel */}
      {parada && marcha < 0.06 ? (
        <g
          opacity={interpolate(frame, [corte + 20, corte + 32], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        >
          <rect x="250" y="190" width="400" height="104" fill={ACENTO} />
          <text
            x="450"
            y="260"
            textAnchor="middle"
            fill={PAPEL}
            fontFamily="inherit"
            fontSize="56"
            fontWeight="700"
            letterSpacing="4"
          >
            PARADA
          </text>
        </g>
      ) : null}
    </svg>
  );
};

const Engranaje: React.FC<{
  cx: number;
  cy: number;
  r: number;
  dientes: number;
  giro: number;
}> = ({ cx, cy, r, dientes, giro }) => {
  const paso = 360 / dientes;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${giro})`}>
      <circle r={r} fill={TINTA} />
      <circle r={r * 0.32} fill={PAPEL} />
      {Array.from({ length: dientes }, (_, i) => (
        <rect
          key={i}
          x={-r * 0.16}
          y={-r - r * 0.24}
          width={r * 0.32}
          height={r * 0.28}
          fill={TINTA}
          transform={`rotate(${i * paso})`}
        />
      ))}
    </g>
  );
};

/* ================================================================== */

export const NOMBRES_ILUSTRACION = ["ciudad", "flujo", "fabrica"] as const;

export const Ilustracion: React.FC<{ spec: EspecIlustracion }> = ({ spec }) => {
  const p = usePlantilla();
  if (!spec?.nombre) return null;
  // Las pocas etiquetas que van dentro del dibujo heredan la tipografia de la
  // plantilla, como cualquier otro texto del video.
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: familiaDe(p) }}>
      {spec.nombre === "ciudad" ? <Ciudad spec={spec} /> : null}
      {spec.nombre === "flujo" ? <Flujo spec={spec} /> : null}
      {spec.nombre === "fabrica" ? <Fabrica spec={spec} /> : null}
    </div>
  );
};
