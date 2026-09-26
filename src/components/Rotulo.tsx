import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { ACENTO, APAGADO, C, FONT, REALCE, T, TINTA } from "../theme";
import { familiaDe, pesoDe, usePlantilla, useFrame, type Plantilla } from "../estilo";
import { useEntrada } from "./Entrada";

export { familiaDe };

/**
 * La palabra resaltada.
 *
 * Cuatro maneras de marcar lo mismo, y no es un capricho: la mancha ocre
 * detras de la palabra es un recurso de television, el subrayado es de
 * periodico, la caja es de sello de archivo y la palabra en color es suiza.
 * Cambiarla cambia de que clase de documento parece salido el video.
 */
const Resalte: React.FC<{
  palabra: string;
  k: number;
  p: Plantilla;
  night?: boolean;
}> = ({ palabra, k, p, night }) => {
  if (p.resalte === "color") {
    return <span style={{ color: ACENTO, opacity: k > 0.05 ? 1 : 0 }}>{palabra}</span>;
  }

  if (p.resalte === "subrayado") {
    return (
      <span style={{ position: "relative", display: "inline-block" }}>
        <span style={{ position: "relative" }}>{palabra}</span>
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "0.02em",
            height: "0.09em",
            background: ACENTO,
            transform: `scaleX(${k})`,
            transformOrigin: "left center",
          }}
        />
      </span>
    );
  }

  if (p.resalte === "caja") {
    return (
      <span
        style={{
          position: "relative",
          display: "inline-block",
          padding: "0 0.14em",
          // El sello nunca cae recto. Es lo que hace que parezca estampado.
          transform: `rotate(-1.1deg) scale(${interpolate(k, [0, 1], [1.06, 1])})`,
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: "0.04em 0 0.06em 0",
            border: `4px solid ${ACENTO}`,
            opacity: k,
          }}
        />
        <span style={{ position: "relative", color: ACENTO }}>{palabra}</span>
      </span>
    );
  }

  // slab: la mancha de siempre
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          left: "-0.17em",
          right: "-0.17em",
          top: "0.1em",
          bottom: "0.07em",
          background: REALCE,
          transform: `scaleX(${k})`,
          transformOrigin: "left center",
        }}
      />
      <span style={{ position: "relative", color: night ? C.ink : TINTA }}>{palabra}</span>
    </span>
  );
};

/** Parte el texto en trozos y marca los que van entre asteriscos. */
const Texto: React.FC<{ text: string; k: number; p: Plantilla; night?: boolean }> = ({
  text,
  k,
  p,
  night,
}) => (
  <>
    {text.split("*").map((trozo, i) => {
      if (i % 2 === 0) return <span key={i}>{trozo}</span>;
      // Palabra a palabra: un solo rectangulo para toda la frase se quedaba en
      // la primera linea cuando el texto partia.
      const palabras = trozo.split(" ");
      return (
        <React.Fragment key={i}>
          {palabras.map((w, j) => (
            <React.Fragment key={j}>
              <Resalte palabra={w} k={k} p={p} night={night} />
              {j < palabras.length - 1 ? " " : ""}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    })}
  </>
);

/**
 * Rotulo inferior. Era la constante visual del canal -misma posicion, misma
 * tipografia, mismo resalte ocre en los dieciseis videos- y por eso todos
 * parecian el mismo video. Ahora la maqueta la decide la plantilla.
 */
export const Rotulo: React.FC<{
  kicker?: string;
  /** El texto puede llevar *asteriscos* alrededor de lo que va resaltado. */
  text: string;
  night?: boolean;
  delay?: number;
}> = ({ kicker, text, night, delay = 6 }) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const p = usePlantilla();

  // El rotulo entra como entra todo lo demas en esta plantilla. Antes subia
  // veintiseis pixeles con un desvanecido en los siete estilos, que es
  // exactamente lo que hacia que los siete parecieran el mismo montaje.
  const enter = useEntrada(0, delay, p.rotulo === "barra" ? "abajo" : "izq");
  const slab = spring({ frame: frame - delay - 5, fps, config: { damping: 200, mass: 0.5 } });
  const visible = enter.opacity === undefined ? 1 : (enter.opacity as number);

  const color = night ? C.paper : TINTA;
  const familia = familiaDe(p);
  const cuerpo: React.CSSProperties = {
    fontFamily: familia,
    fontWeight: pesoDe(p),
    fontSize: p.titular === "mono" ? T.rotulo * 0.78 : T.rotulo,
    lineHeight: p.titular === "mono" ? 1.2 : 1.08,
    letterSpacing: p.apriete,
    textTransform: p.caja === "alta" ? "uppercase" : "none",
    color,
  };
  const rotulillo: React.CSSProperties = {
    fontFamily: FONT.mono,
    fontSize: T.rotuloKicker,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: night ? C.mutedNight : APAGADO,
    marginBottom: 16,
  };

  // ---- barra: franja de ancho completo, como un rotulo de informativo ----
  if (p.rotulo === "barra") {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 84,
          zIndex: 40,
          ...enter,
        }}
      >
        <div style={{ height: 3, background: ACENTO, transformOrigin: "left center", transform: `scaleX(${visible})` }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 28, padding: "26px 128px 0" }}>
          <div style={{ width: 14, height: 68, background: ACENTO, flex: "0 0 auto" }} />
          <div>
            {kicker ? <div style={{ ...rotulillo, marginBottom: 10 }}>{kicker}</div> : null}
            <div style={cuerpo}>
              <Texto text={text} k={slab} p={p} night={night} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- tarjeta: ficha con borde, apoyada abajo a la izquierda ----
  if (p.rotulo === "tarjeta") {
    return (
      <div
        style={{
          position: "absolute",
          left: 128,
          bottom: 96,
          maxWidth: 1180,
          zIndex: 40,
          ...enter,
          border: `2px solid ${ACENTO}`,
          padding: "26px 34px 30px",
          background: night ? "rgba(10,18,16,0.72)" : "rgba(0,0,0,0.06)",
        }}
      >
        {kicker ? <div style={rotulillo}>{kicker}</div> : null}
        <div style={cuerpo}>
          <Texto text={text} k={slab} p={p} night={night} />
        </div>
      </div>
    );
  }

  // ---- rail: barra vertical de acento y el texto colgando de ella ----
  if (p.rotulo === "rail") {
    return (
      <div
        style={{
          position: "absolute",
          left: 128,
          bottom: 92,
          maxWidth: 1120,
          zIndex: 40,
          display: "flex",
          gap: 30,
          ...enter,
        }}
      >
        <div
          style={{
            width: 8,
            background: ACENTO,
            flex: "0 0 auto",
            transformOrigin: "bottom center",
            transform: `scaleY(${visible})`,
          }}
        />
        <div>
          {kicker ? <div style={rotulillo}>{kicker}</div> : null}
          <div style={cuerpo}>
            <Texto text={text} k={slab} p={p} night={night} />
          </div>
        </div>
      </div>
    );
  }

  // ---- sello: bloque estampado, girado, con el rotulillo dentro del borde ----
  if (p.rotulo === "sello") {
    return (
      <div
        style={{
          position: "absolute",
          left: 136,
          bottom: 96,
          maxWidth: 1160,
          zIndex: 40,
          ...enter,
          transform: `rotate(-0.7deg) ${enter.transform ?? ""}`,
        }}
      >
        {kicker ? (
          <div
            style={{
              ...rotulillo,
              display: "inline-block",
              border: `2px solid ${APAGADO}`,
              padding: "6px 14px",
              marginBottom: 18,
            }}
          >
            {kicker}
          </div>
        ) : null}
        <div style={cuerpo}>
          <Texto text={text} k={slab} p={p} night={night} />
        </div>
      </div>
    );
  }

  // ---- bloque: la maqueta de siempre ----
  return (
    <div
      style={{
        position: "absolute",
        left: p.marco === "rail" ? 148 : 128,
        bottom: 88,
        maxWidth: 1080,
        zIndex: 40,
        ...enter,
      }}
    >
      {kicker ? <div style={rotulillo}>{kicker}</div> : null}
      <div style={cuerpo}>
        <Texto text={text} k={slab} p={p} night={night} />
      </div>
    </div>
  );
};

/** Cifra grande con resalte y conteo ascendente opcional. */
export const BigNumber: React.FC<{
  value: number;
  suffix?: string;
  countFrom?: number;
  countFrames?: number;
  left?: number;
  top?: number;
  size?: number;
  format?: (n: number) => string;
}> = ({
  value,
  suffix,
  countFrom,
  countFrames = 40,
  left = 128,
  top = 300,
  size = T.mega,
  format,
}) => {
  const frame = useFrame();
  const { fps } = useVideoConfig();
  const p = usePlantilla();
  const slab = spring({ frame: frame - 4, fps, config: { damping: 200, mass: 0.5 } });

  const shown =
    countFrom === undefined
      ? value
      : Math.round(
          interpolate(frame, [6, 6 + countFrames], [countFrom, value], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: (t) => 1 - Math.pow(1 - t, 3),
          })
        );

  const label = format ? format(shown) : shown.toLocaleString("es-ES");
  const conMancha = p.resalte === "slab";

  return (
    <div style={{ position: "absolute", left, top }}>
      {/* El hueco lo fija el valor final: asi el resalte no cambia de ancho
          mientras la cifra sube. */}
      <span style={{ position: "relative", display: "inline-block" }}>
        <span
          aria-hidden
          style={{
            visibility: "hidden",
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 0.88,
            letterSpacing: "-0.05em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {format ? format(value) : value.toLocaleString("es-ES")}
          {suffix ? <span style={{ fontSize: "0.42em" }}>{suffix}</span> : null}
        </span>
        {conMancha ? (
          <span
            style={{
              position: "absolute",
              left: "-0.06em",
              right: "-0.06em",
              top: "0.16em",
              bottom: "0.12em",
              background: REALCE,
              transform: `scaleX(${slab})`,
              transformOrigin: "left center",
            }}
          />
        ) : null}
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 0.88,
            letterSpacing: "-0.05em",
            color: conMancha ? TINTA : ACENTO,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {label}
          {suffix ? <span style={{ fontSize: "0.42em" }}>{suffix}</span> : null}
        </span>
      </span>
    </div>
  );
};

/**
 * Tarjeta de frase.
 *
 * Era la escena mas repetida del canal despues del recorte y siempre salia
 * igual: texto centrado, palabra a palabra subiendo, empuje de camara y un
 * filete debajo. Ahora la coloca la maqueta de la plantilla y las palabras
 * llegan con la mecanica de entrada, que es lo que de verdad la cambia.
 *
 * El fondo lo decide Surface con `!!p.night`, asi que aqui el valor por
 * defecto tiene que ser el mismo. Cuando era `true`, un plano que no declaraba
 * `night` salia con letra blanca sobre papel: invisible.
 */
export const Statement: React.FC<{ text: string; night?: boolean }> = ({ text, night = false }) => {
  const frame = useFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = usePlantilla();

  // Empuje continuo, salvo que la plantilla pida quedarse quieta. Quieta es
  // una decision de montaje, no una falta de movimiento: en el estilo
  // tipografico internacional la pagina no se mueve.
  const amplitud = p.camara === "quieta" ? 0 : p.camara === "lenta" ? 0.06 : 0.11;
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1 + amplitud], {
    extrapolateRight: "clamp",
  });
  const deriva = interpolate(frame, [0, durationInFrames], [14, -14], { extrapolateRight: "clamp" });

  /**
   * El resalte llega tarde, a proposito: la frase entra primero y el golpe cae
   * en el tercio de la escena, cuando la voz llega a la palabra marcada.
   */
  const golpe = Math.max(10, durationInFrames * 0.3);
  const filete = interpolate(frame, [golpe, durationInFrames * 0.92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 2),
  });

  /** Como llega cada palabra, segun la mecanica de la plantilla. */
  const palabraEntra = (idx: number): React.CSSProperties => {
    const t0 = 3 + idx * (p.entrada === "golpe" ? 0 : p.entrada === "maquina" ? 1.4 : 2.6);
    const f = frame - t0;
    if (p.entrada === "golpe") return { opacity: frame >= 3 ? 1 : 0 };
    if (p.entrada === "mascara") {
      const k = interpolate(f, [0, 9], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: (x) => 1 - Math.pow(1 - x, 3),
      });
      return { clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` };
    }
    if (p.entrada === "escala") {
      const k = spring({ frame: f, fps, config: { damping: 12, mass: 0.6, stiffness: 150 } });
      return {
        opacity: interpolate(f, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `scale(${interpolate(k, [0, 1], [0.6, 1])})`,
      };
    }
    if (p.entrada === "desmonta") {
      const lados = [[-1, 0], [0, -1], [1, 0], [0, 1]][idx % 4];
      const k = spring({ frame: f, fps, config: { damping: 200, mass: 0.8 } });
      return {
        opacity: interpolate(f, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `translate(${lados[0] * (1 - k) * 90}px, ${lados[1] * (1 - k) * 90}px)`,
      };
    }
    if (p.entrada === "maquina") {
      return { opacity: f >= 0 ? 1 : 0 };
    }
    const k = spring({ frame: f, fps, config: { damping: 200, mass: 0.55 } });
    return { opacity: k, transform: `translateY(${interpolate(k, [0, 1], [30, 0])}px)` };
  };

  // ---- donde va la frase ----
  const M = p.maqueta;
  const centrada = M === "lateral" || M === "sangre";
  const caja: React.CSSProperties =
    M === "banda"
      ? { alignItems: "center", justifyContent: "flex-start", padding: "0 128px" }
      : M === "esquina"
        ? { alignItems: "flex-end", justifyContent: "flex-start", padding: "0 148px 160px" }
        : { alignItems: "center", justifyContent: "center", padding: "0 200px" };

  const cuerpo: React.CSSProperties = {
    position: "relative",
    fontFamily: familiaDe(p),
    fontWeight: pesoDe(p),
    fontSize:
      (M === "sangre" ? T.headline * 1.22 : M === "banda" ? T.headline * 1.1 : T.headline) *
      (p.titular === "mono" ? 0.72 : 1),
    lineHeight: 1.1,
    letterSpacing: p.apriete,
    textAlign: centrada ? "center" : "left",
    textTransform: p.caja === "alta" ? "uppercase" : "none",
    color: night ? C.paper : TINTA,
    maxWidth: M === "banda" ? 1300 : M === "esquina" ? 1250 : undefined,
    border: M === "tarjeta" ? `3px solid ${ACENTO}` : undefined,
    padding: M === "tarjeta" ? "56px 64px" : undefined,
  };

  const parts = text.split("*");
  let wordIndex = 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        ...caja,
        transform: `scale(${zoom}) translateX(${p.camara === "quieta" ? 0 : deriva}px)`,
      }}
    >
      <div style={cuerpo}>
        {parts.map((part, i) => {
          const resaltado = i % 2 === 1;
          const palabras = part.split(" ");

          return (
            <React.Fragment key={i}>
              {palabras.map((w, j) => {
                if (w === "") return null;
                const idx = wordIndex++;
                const kSlab = spring({
                  frame: frame - golpe - idx * 1.8,
                  fps,
                  config: { damping: 20, mass: 0.6, stiffness: 130 },
                });
                return (
                  <React.Fragment key={j}>
                    <span style={{ display: "inline-block", ...palabraEntra(idx) }}>
                      {resaltado ? (
                        <Resalte palabra={w} k={kSlab} p={p} night={night} />
                      ) : (
                        <span>{w}</span>
                      )}
                    </span>
                    {j < palabras.length - 1 ? " " : ""}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}

        {/* el filete se traza durante toda la escena: es lo que sigue pasando
            cuando ya ha entrado todo el texto */}
        {M !== "tarjeta" ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: "-0.45em",
              height: 7,
              width: `${filete * 100}%`,
              background: ACENTO,
              opacity: 0.9,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
