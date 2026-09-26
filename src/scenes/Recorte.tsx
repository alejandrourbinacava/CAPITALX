import React from "react";
import { Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { Icono, type NombreIcono } from "../components/Icono";
import { Entrada, TextoEntra, useEntrada, useSostener, type Dir } from "../components/Entrada";
import { ACENTO, APAGADO, FONT, PAPEL, REALCE, TINTA } from "../theme";
import { familiaDe, pesoDe, usePlantilla, useFrame } from "../estilo";

type Spec = {
  fichero?: string;
  lado?: "izq" | "der" | "centro";
  escala?: number;
  nota?: string;
  titular?: string;
  apoyo?: string;
  cifra?: string;
  icono?: string;
};

/**
 * El recorte de revista: el mecanismo Vox aplicado a una foto cualquiera.
 *
 * Sujeto recortado del fondo, tratado en tinta, con una copia plana desplazada
 * por detras en carmin u ocre. Eso ya viene hecho en el PNG.
 *
 * Lo que se hace aqui es maquetarlo, y es la escena que mas sale en un video
 * del canal: veinte o veinticinco de las ochenta. Que las veinticinco
 * estuvieran maquetadas igual -figura a un lado, texto al otro, cifra arriba-
 * era el motivo principal de que dos videos distintos parecieran el mismo. La
 * plantilla elige entre cinco repartos del cuadro que no se parecen en nada.
 */
export const Recorte: React.FC<{ spec: Spec }> = ({ spec }) => {
  const p = usePlantilla();
  if (!spec?.fichero) return null;

  if (p.maqueta === "banda") return <Banda spec={spec} />;
  if (p.maqueta === "sangre") return <Sangre spec={spec} />;
  if (p.maqueta === "tarjeta") return <Tarjeta spec={spec} />;
  if (p.maqueta === "esquina") return <Esquina spec={spec} />;
  return <Lateral spec={spec} />;
};

/** La figura recortada, con el tratamiento de la plantilla. */
const Figura: React.FC<{
  spec: Spec;
  style: React.CSSProperties;
  i?: number;
  dir?: Dir;
}> = ({ spec, style, i = 0, dir = "abajo" }) => {
  const p = usePlantilla();
  const entrada = useEntrada(i, 2, dir);
  const sostener = useSostener();

  return (
    <div
      style={{
        position: "absolute",
        ...style,
        ...entrada,
        transform: [style.transform, entrada.transform, sostener.figura]
          .filter((x) => x && x !== "none")
          .join(" "),
      }}
    >
      <Img
        src={staticFile(spec.fichero!)}
        style={{
          height: "100%",
          width: "auto",
          // La orla: contorno de papel pegado al recorte y una sombra corta
          // debajo. Es el truco del montaje de documental para que una figura
          // recortada se lea como pegada encima y no como incrustada.
          filter:
            p.recorte === "orla"
              ? `drop-shadow(0 0 5px ${PAPEL}) drop-shadow(0 0 5px ${PAPEL}) drop-shadow(0 0 5px ${PAPEL}) drop-shadow(14px 18px 16px rgba(0,0,0,0.3))`
              : undefined,
        }}
      />
    </div>
  );
};

/** El filete que se traza bajo el titular durante toda la escena. */
const Filete: React.FC<{ ancho?: number | string; alto?: number; derecha?: boolean }> = ({
  ancho = "100%",
  alto = 7,
  derecha,
}) => {
  const frame = useFrame();
  const { durationInFrames } = useVideoConfig();
  const k = interpolate(frame, [16, durationInFrames * 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        height: alto,
        width: typeof ancho === "number" ? ancho * k : `${k * 100}%`,
        marginLeft: derecha ? `${(1 - k) * 100}%` : 0,
        background: ACENTO,
        marginTop: 22,
      }}
    />
  );
};

const Nota: React.FC<{ texto?: string }> = ({ texto }) => {
  const e = useEntrada(4, 14);
  if (!texto) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 96,
        textAlign: "center",
        fontFamily: FONT.mono,
        fontSize: 24,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: APAGADO,
        ...e,
      }}
    >
      {texto}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* lateral: figura a un lado, texto al otro. La maqueta de siempre.    */
/* ------------------------------------------------------------------ */
const Lateral: React.FC<{ spec: Spec }> = ({ spec }) => {
  const p = usePlantilla();
  const sostener = useSostener();
  const hayTexto = !!(spec.titular || spec.apoyo || spec.cifra);
  const lado = spec.lado ?? (hayTexto ? "der" : "centro");
  const x = lado === "izq" ? "27%" : lado === "der" ? "70%" : "50%";
  const k = useEntrada(0, 2);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {p.recorte === "mancha" ? (
        <div
          style={{
            position: "absolute",
            left: x,
            top: "56%",
            width: 940,
            height: 940,
            marginLeft: -470,
            marginTop: -470,
            borderRadius: "50%",
            background: REALCE,
            opacity: 0.16,
            ...k,
          }}
        />
      ) : null}
      {p.recorte === "bloque" ? (
        <div
          style={{
            position: "absolute",
            left: x,
            top: "58%",
            width: 660,
            height: 720,
            marginLeft: -330,
            marginTop: -360,
            background: ACENTO,
            opacity: 0.2,
            ...k,
          }}
        />
      ) : null}

      <Figura
        spec={spec}
        i={0}
        dir={lado === "der" ? "der" : "izq"}
        style={{
          left: x,
          top: "54%",
          marginLeft: "-0px",
          height: hayTexto ? "76%" : "82%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {hayTexto ? (
        <div
          style={{
            position: "absolute",
            left: lado === "der" ? 128 : "auto",
            right: lado === "der" ? "auto" : 128,
            top: "26%",
            width: 700,
            textAlign: lado === "der" ? "left" : "right",
            transform: sostener.texto,
          }}
        >
          {spec.cifra ? (
            <Entrada
              i={1}
              desde={9}
              dir="izq"
              style={{
                fontFamily: familiaDe(p),
                fontWeight: 700,
                fontSize: 128,
                lineHeight: 0.95,
                letterSpacing: "-0.05em",
                color: ACENTO,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {spec.cifra}
            </Entrada>
          ) : null}

          {spec.icono ? (
            <div
              style={{
                display: "flex",
                justifyContent: lado === "der" ? "flex-start" : "flex-end",
                marginBottom: 14,
              }}
            >
              <Icono nombre={spec.icono as NombreIcono} tamano={84} desde={5} dura={17} />
            </div>
          ) : null}

          {spec.titular ? (
            <TextoEntra
              texto={spec.titular}
              desde={spec.cifra ? 13 : 9}
              style={{
                fontFamily: familiaDe(p),
                fontWeight: pesoDe(p),
                fontSize: 74,
                lineHeight: 1.06,
                letterSpacing: "-0.035em",
                textTransform: p.caja === "alta" ? "uppercase" : "none",
                color: TINTA,
                marginTop: spec.cifra ? 18 : 0,
              }}
            />
          ) : null}

          <Filete derecha={lado !== "der"} />

          {spec.apoyo ? (
            <Entrada
              i={3}
              desde={18}
              style={{
                fontFamily: familiaDe(p),
                fontWeight: 500,
                fontSize: 38,
                lineHeight: 1.3,
                color: APAGADO,
                marginTop: 26,
              }}
            >
              {spec.apoyo}
            </Entrada>
          ) : null}
        </div>
      ) : null}

      <Nota texto={spec.nota} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* banda: figura a sangre por la derecha, texto en bloque alto a la    */
/* izquierda. El cuadro se parte en dos verticales, no en dos mitades. */
/* ------------------------------------------------------------------ */
const Banda: React.FC<{ spec: Spec }> = ({ spec }) => {
  const p = usePlantilla();
  const sostener = useSostener();

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Figura
        spec={spec}
        i={0}
        dir="der"
        style={{ left: "72%", top: "50%", height: "98%", transform: "translate(-50%, -50%)" }}
      />

      <div
        style={{
          position: "absolute",
          left: 128,
          top: "50%",
          width: 820,
          transform: `translateY(-50%) ${sostener.texto}`,
        }}
      >
        {spec.icono ? (
          <div style={{ marginBottom: 26 }}>
            <Icono nombre={spec.icono as NombreIcono} tamano={76} desde={3} dura={15} />
          </div>
        ) : null}

        {spec.cifra ? (
          <Entrada
            i={1}
            desde={5}
            dir="izq"
            style={{
              fontFamily: familiaDe(p),
              fontWeight: pesoDe(p),
              fontSize: 212,
              lineHeight: 0.86,
              letterSpacing: "-0.06em",
              color: ACENTO,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {spec.cifra}
          </Entrada>
        ) : null}

        {/* El filete no va debajo del titular: separa la cifra del texto, que
            es como se maqueta una portada. */}
        <Filete alto={5} />

        {spec.titular ? (
          <TextoEntra
            texto={spec.titular}
            desde={11}
            style={{
              fontFamily: familiaDe(p),
              fontWeight: pesoDe(p),
              fontSize: 62,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              textTransform: p.caja === "alta" ? "uppercase" : "none",
              color: TINTA,
              marginTop: 28,
            }}
          />
        ) : null}

        {spec.apoyo ? (
          <Entrada
            i={3}
            desde={17}
            style={{
              fontFamily: familiaDe(p),
              fontWeight: 500,
              fontSize: 34,
              lineHeight: 1.34,
              color: APAGADO,
              marginTop: 22,
            }}
          >
            {spec.apoyo}
          </Entrada>
        ) : null}
      </div>

      <Nota texto={spec.nota} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* sangre: la figura ocupa el cuadro entero y el texto va encima.      */
/* ------------------------------------------------------------------ */
const Sangre: React.FC<{ spec: Spec }> = ({ spec }) => {
  const p = usePlantilla();
  const sostener = useSostener();

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Figura
        spec={spec}
        i={0}
        dir="abajo"
        style={{ left: "50%", top: "52%", height: "112%", transform: "translate(-50%, -50%)" }}
      />

      {/* La cifra se va a la esquina de arriba, enorme y detras de nada. */}
      {spec.cifra ? (
        <Entrada
          i={1}
          desde={6}
          dir="arriba"
          style={{
            position: "absolute",
            right: 128,
            top: 120,
            fontFamily: familiaDe(p),
            fontWeight: pesoDe(p),
            fontSize: 250,
            lineHeight: 0.84,
            letterSpacing: "-0.06em",
            color: ACENTO,
            fontVariantNumeric: "tabular-nums",
            textAlign: "right",
          }}
        >
          {spec.cifra}
        </Entrada>
      ) : null}

      {/* Velo para que el texto se lea sobre la figura. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "52%",
          background: `linear-gradient(to top, ${PAPEL} 14%, color-mix(in srgb, ${PAPEL} 82%, transparent) 46%, transparent 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 128,
          right: 128,
          bottom: 140,
          transform: sostener.texto,
        }}
      >
        {spec.icono ? (
          <div style={{ marginBottom: 16 }}>
            <Icono nombre={spec.icono as NombreIcono} tamano={72} desde={4} dura={15} />
          </div>
        ) : null}

        {spec.titular ? (
          <TextoEntra
            texto={spec.titular}
            desde={10}
            style={{
              fontFamily: familiaDe(p),
              fontWeight: pesoDe(p),
              fontSize: 96,
              lineHeight: 1.02,
              letterSpacing: "-0.045em",
              textTransform: p.caja === "alta" ? "uppercase" : "none",
              color: TINTA,
              maxWidth: 1400,
            }}
          />
        ) : null}

        {spec.apoyo ? (
          <Entrada
            i={3}
            desde={18}
            style={{
              fontFamily: familiaDe(p),
              fontWeight: 500,
              fontSize: 36,
              lineHeight: 1.3,
              color: APAGADO,
              marginTop: 20,
              maxWidth: 1100,
            }}
          >
            {spec.apoyo}
          </Entrada>
        ) : null}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* tarjeta: dos fichas con borde, una con la figura y otra con el      */
/* texto. Es un tablero, no una pagina.                                */
/* ------------------------------------------------------------------ */
const Tarjeta: React.FC<{ spec: Spec }> = ({ spec }) => {
  const p = usePlantilla();
  const sostener = useSostener();
  const caja = useEntrada(0, 2, "izq");
  const caja2 = useEntrada(1, 2, "der");

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* ficha del texto */}
      <div
        style={{
          position: "absolute",
          left: 118,
          top: 150,
          width: 820,
          height: 780,
          border: `2px solid ${ACENTO}`,
          padding: "46px 44px",
          boxSizing: "border-box",
          ...caja,
          transform: [caja.transform, sostener.texto].filter((x) => x && x !== "none").join(" "),
        }}
      >
        {spec.icono ? (
          <div style={{ marginBottom: 22 }}>
            <Icono nombre={spec.icono as NombreIcono} tamano={70} desde={4} dura={14} />
          </div>
        ) : null}

        {spec.cifra ? (
          <TextoEntra
            texto={spec.cifra}
            desde={6}
            style={{
              fontFamily: familiaDe(p),
              fontWeight: pesoDe(p),
              fontSize: 132,
              lineHeight: 0.98,
              letterSpacing: "-0.02em",
              color: ACENTO,
              fontVariantNumeric: "tabular-nums",
            }}
          />
        ) : null}

        <Filete alto={4} />

        {spec.titular ? (
          <TextoEntra
            texto={spec.titular}
            desde={14}
            style={{
              fontFamily: familiaDe(p),
              fontWeight: pesoDe(p),
              fontSize: 48,
              lineHeight: 1.22,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              color: TINTA,
              marginTop: 26,
            }}
          />
        ) : null}

        {spec.apoyo ? (
          <TextoEntra
            texto={spec.apoyo}
            desde={30}
            style={{
              fontFamily: familiaDe(p),
              fontSize: 30,
              lineHeight: 1.36,
              color: APAGADO,
              marginTop: 24,
            }}
          />
        ) : null}
      </div>

      {/* ficha de la figura */}
      <div
        style={{
          position: "absolute",
          left: 982,
          top: 150,
          width: 820,
          height: 780,
          border: `2px solid ${APAGADO}`,
          overflow: "hidden",
          ...caja2,
        }}
      >
        <Figura
          spec={spec}
          i={2}
          dir="der"
          style={{ left: "50%", bottom: 0, height: "96%", transform: "translateX(-50%)" }}
        />
      </div>

      <Nota texto={spec.nota} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* esquina: la cifra se come el cuadro y la figura se va abajo a la    */
/* derecha, pequena. Le da todo el peso al dato.                       */
/* ------------------------------------------------------------------ */
const Esquina: React.FC<{ spec: Spec }> = ({ spec }) => {
  const p = usePlantilla();
  const sostener = useSostener();

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Figura
        spec={spec}
        i={3}
        dir="abajo"
        style={{ left: "78%", bottom: -20, height: "62%", transform: "translateX(-50%)" }}
      />

      <div
        style={{
          position: "absolute",
          left: 148,
          top: 200,
          width: 1180,
          transform: sostener.texto,
        }}
      >
        {spec.cifra ? (
          <Entrada
            i={0}
            desde={4}
            dir="izq"
            style={{
              fontFamily: familiaDe(p),
              fontWeight: pesoDe(p),
              fontSize: 300,
              lineHeight: 0.82,
              letterSpacing: "-0.07em",
              color: ACENTO,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {spec.cifra}
          </Entrada>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 62 }}>
          {spec.icono ? (
            <Icono nombre={spec.icono as NombreIcono} tamano={64} desde={6} dura={14} />
          ) : null}
          {spec.titular ? (
            <TextoEntra
              texto={spec.titular}
              desde={10}
              style={{
                fontFamily: familiaDe(p),
                fontWeight: pesoDe(p),
                fontSize: 58,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                textTransform: p.caja === "alta" ? "uppercase" : "none",
                color: TINTA,
              }}
            />
          ) : null}
        </div>

        {spec.apoyo ? (
          <Entrada
            i={2}
            desde={16}
            style={{
              fontFamily: familiaDe(p),
              fontWeight: 500,
              fontSize: 34,
              lineHeight: 1.32,
              color: APAGADO,
              marginTop: 24,
              maxWidth: 900,
            }}
          >
            {spec.apoyo}
          </Entrada>
        ) : null}
      </div>

      <Nota texto={spec.nota} />
    </div>
  );
};
