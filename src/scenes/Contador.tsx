import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { ACENTO, APAGADO, FONT, PAPEL, REALCE, TINTA } from "../theme";
import { familiaDe, pesoDe, useFrame, usePlantilla } from "../estilo";

export type ContadorSpec = {
  de?: { valor: number; etiqueta?: string };
  a?: {
    valor: number;
    etiqueta?: string;
    decimales?: number;
    sufijo?: string;
    prefijo?: string;
  };
  estatico?: boolean;
};

/**
 * El contador, en cuatro formas.
 *
 * Era siempre la misma: una cifra enorme centrada y un rail de progreso
 * debajo con las dos etiquetas en los extremos. Sale tres o cuatro veces por
 * video.
 *
 * De paso arregla un fallo de verdad: la cifra se redondeaba a entero. Un
 * plano que decia "la poblacion crecio un cero coma cero cinco por ciento"
 * salia en pantalla como un cero pelado, y el vidoe de Holanda se publico
 * asi. Ahora respeta decimales, prefijo y sufijo.
 */
const formatear = (v: number, a: ContadorSpec["a"]) => {
  const d = a?.decimales ?? 0;
  const txt = v.toLocaleString("es-ES", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
  return `${a?.prefijo ?? ""}${txt}${a?.sufijo ?? ""}`;
};

/** El avance de 0 a 1 a lo largo de la escena. */
const useAvance = (estatico?: boolean) => {
  const frame = useFrame();
  const { durationInFrames } = useVideoConfig();
  if (estatico) return 1;
  return interpolate(frame, [10, Math.min(durationInFrames - 8, 74)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
};

/* ---------- carril: la cifra y un rail de progreso. La de siempre. ---- */
const Carril: React.FC<{ spec: ContadorSpec; valor: number; t: number }> = ({
  spec,
  valor,
  t,
}) => {
  const p = usePlantilla();
  return (
    <>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 1920 1080"
      >
        <line x1="300" y1="780" x2="1620" y2="780" stroke={APAGADO} strokeWidth="3" opacity="0.45" />
        <line x1="300" y1="780" x2={300 + 1320 * t} y2="780" stroke={ACENTO} strokeWidth="9" />
        <circle cx={300 + 1320 * t} cy="780" r="15" fill={ACENTO} />
        <text x="300" y="836" fill={APAGADO} fontFamily={FONT.mono} fontSize="26" letterSpacing="3">
          {spec.de?.etiqueta}
        </text>
        <text
          x="1620"
          y="836"
          textAnchor="end"
          fill={APAGADO}
          fontFamily={FONT.mono}
          fontSize="26"
          letterSpacing="3"
        >
          {spec.a?.etiqueta}
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 290,
          textAlign: "center",
          fontFamily: familiaDe(p),
          fontWeight: pesoDe(p),
          fontSize: 300,
          lineHeight: 0.9,
          letterSpacing: "-0.05em",
          color: TINTA,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatear(valor, spec.a)}
      </div>
    </>
  );
};

/* ---------- arco: un anillo que se llena, la cifra dentro ------------- */
const Arco: React.FC<{ spec: ContadorSpec; valor: number; t: number }> = ({ spec, valor, t }) => {
  const p = usePlantilla();
  const R = 286;
  const CX = 960;
  const CY = 520;
  const vuelta = 2 * Math.PI * R;
  // La cifra tiene que caber dentro del anillo: "410.000" a ciento setenta y
  // seis pixeles se salia por los dos lados. El cuerpo se calcula del largo.
  const texto = formatear(valor, spec.a);
  const cuerpo = Math.min(176, (R * 1.72) / Math.max(1, texto.length * 0.54));

  return (
    <>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 1920 1080"
      >
        <g transform={`rotate(-90 ${CX} ${CY})`}>
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={APAGADO}
            strokeWidth="26"
            opacity="0.24"
          />
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={ACENTO}
            strokeWidth="26"
            strokeLinecap="butt"
            strokeDasharray={vuelta}
            strokeDashoffset={vuelta * (1 - t)}
          />
        </g>
        {/* la marca del extremo, que es lo que se sigue con la vista */}
        <circle
          cx={CX + R * Math.cos(2 * Math.PI * t - Math.PI / 2)}
          cy={CY + R * Math.sin(2 * Math.PI * t - Math.PI / 2)}
          r="21"
          fill={ACENTO}
        />
        <text
          x={CX}
          y={CY + R + 96}
          textAnchor="middle"
          fill={APAGADO}
          fontFamily={FONT.mono}
          fontSize="28"
          letterSpacing="3"
        >
          {spec.a?.etiqueta}
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: CX - R,
          width: R * 2,
          top: CY - cuerpo * 0.52,
          textAlign: "center",
          fontFamily: familiaDe(p),
          fontWeight: pesoDe(p),
          fontSize: cuerpo,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: TINTA,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {texto}
      </div>
    </>
  );
};

/* ---------- rodillo: contador mecanico, digito a digito --------------- */
const Rodillo: React.FC<{ spec: ContadorSpec; valor: number }> = ({ spec, valor }) => {
  const p = usePlantilla();
  const dec = spec.a?.decimales ?? 0;
  const factor = Math.pow(10, dec);
  const objetivo = formatear(spec.a?.valor ?? 0, spec.a);
  const escalado = valor * factor;

  // Cuantos digitos hay a la derecha de cada posicion: con eso se saca el
  // valor continuo de cada rueda, que es lo que hace que la de las unidades
  // gire sin parar y la de los miles apenas se mueva.
  const digitos = objetivo.split("").filter((c) => /\d/.test(c)).length;
  let vistos = 0;

  const ALTO = 190;
  const cifras = "0123456789".split("");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 34,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {objetivo.split("").map((c, i) => {
          if (!/\d/.test(c)) {
            return (
              <span
                key={i}
                style={{
                  fontFamily: familiaDe(p),
                  fontWeight: pesoDe(p),
                  fontSize: 150,
                  color: c === "%" || c === "€" ? ACENTO : TINTA,
                  padding: c === "." || c === "," ? "0 4px" : "0 10px",
                }}
              >
                {c}
              </span>
            );
          }
          const peso = Math.pow(10, digitos - 1 - vistos);
          vistos++;
          // Un contador mecanico de verdad: la rueda se queda en su cifra y
          // solo rueda en el ultimo decimo, arrastrada por la de abajo. Con
          // el valor continuo a secas, 410.000 dejaba el 4 a media vuelta.
          const bruto = escalado / peso;
          const entero = Math.floor(bruto) % 10;
          const sobra = bruto - Math.floor(bruto);
          const continuo = entero + (sobra > 0.9 ? (sobra - 0.9) * 10 : 0);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                height: ALTO,
                overflow: "hidden",
                width: 104,
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  transform: `translateY(${-((continuo % 10) * ALTO)}px)`,
                }}
              >
                {cifras.concat(cifras.slice(0, 2)).map((n, j) => (
                  <span
                    key={j}
                    style={{
                      display: "block",
                      height: ALTO,
                      lineHeight: `${ALTO}px`,
                      textAlign: "center",
                      fontFamily: familiaDe(p),
                      fontWeight: pesoDe(p),
                      fontSize: 150,
                      color: TINTA,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {n}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </div>
      {spec.a?.etiqueta ? (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 28,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: APAGADO,
          }}
        >
          {spec.a.etiqueta}
        </div>
      ) : null}
    </div>
  );
};

/* ---------- bloques: cien cuadros que se llenan ----------------------- */
const Bloques: React.FC<{ spec: ContadorSpec; valor: number; t: number }> = ({
  spec,
  valor,
  t,
}) => {
  const p = usePlantilla();
  const COLS = 10;
  const FILAS = 10;
  const lado = 52;
  const hueco = 14;
  const ancho = COLS * lado + (COLS - 1) * hueco;
  const x0 = 232;
  const y0 = 300;
  const llenos = t * COLS * FILAS;

  return (
    <>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 1920 1080"
      >
        {Array.from({ length: COLS * FILAS }, (_, i) => {
          // Se llena por filas de abajo arriba: se lee como algo que sube.
          const fila = FILAS - 1 - Math.floor(i / COLS);
          const col = i % COLS;
          const lleno = i < llenos;
          return (
            <rect
              key={i}
              x={x0 + col * (lado + hueco)}
              y={y0 + fila * (lado + hueco)}
              width={lado}
              height={lado}
              fill={lleno ? ACENTO : REALCE}
              opacity={lleno ? 1 : 0.4}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: x0 + ancho + 130,
          top: 400,
          maxWidth: 760,
        }}
      >
        <div
          style={{
            fontFamily: familiaDe(p),
            fontWeight: pesoDe(p),
            fontSize: 200,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            color: TINTA,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatear(valor, spec.a)}
        </div>
        {spec.a?.etiqueta ? (
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 30,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: APAGADO,
              marginTop: 28,
            }}
          >
            {spec.a.etiqueta}
          </div>
        ) : null}
      </div>
    </>
  );
};

export const Contador: React.FC<{ spec: ContadorSpec }> = ({ spec }) => {
  const p = usePlantilla();
  const t = useAvance(spec.estatico);
  const desde = spec.de?.valor ?? 0;
  const hasta = spec.a?.valor ?? 0;
  const valor = desde + (hasta - desde) * t;

  if (p.contador === "arco") return <Arco spec={spec} valor={valor} t={t} />;
  if (p.contador === "rodillo") return <Rodillo spec={spec} valor={valor} />;
  if (p.contador === "bloques") return <Bloques spec={spec} valor={valor} t={t} />;
  return <Carril spec={spec} valor={valor} t={t} />;
};
