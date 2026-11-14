import React from "react";
import { AbsoluteFill } from "remotion";
import { Persona, Transeunte, rasgosDe } from "./Personajes";

/** Ficha de personajes para revisar el dibujo. No es parte de ningun video. */
export const PruebaPersonajes: React.FC = () => (
  <AbsoluteFill style={{ background: "#E9E1CF" }}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <Persona x={160} y={560} semilla={1} pose="quieto" />
      <Persona x={400} y={560} semilla={2} pose="habla" />
      <Persona x={640} y={560} semilla={3} pose="lee" />
      <Persona x={880} y={560} semilla={4} pose="senala" gesto="inquieto" />
      <Persona x={1120} y={560} semilla={5} pose="telegrama" gesto="sorpresa" />
      <Persona x={1360} y={560} semilla={6} pose="brazos" gesto="serio" rasgos={rasgosDe(6, { librea: true, sombrero: "chistera" })} />
      <g transform="translate(1660 640) scale(2.6)">
        <Persona x={0} y={130} semilla={7} pose="habla" gesto="inquieto" cuerpo="busto" />
      </g>
      {Array.from({ length: 7 }).map((_, i) => (
        <Transeunte key={i} x0={120 + i * 200} y={1040} v={0} semilla={20 + i} escala={1} periodico={i === 2} baston={i === 4} />
      ))}
    </svg>
  </AbsoluteFill>
);

import { BolsaNuevaYork, CruceBanco, Despacho, Escribiente, PuertaBolsa, Portero, SalaBanco, SalaJuntas, OmnibusB, Hansom, Vendedor } from "./Decorados";

/** Un decorado suelto para revisarlo. */
export const PruebaDecorado: React.FC<{ cual: string }> = ({ cual }) => (
  <AbsoluteFill style={{ background: "#14181A" }}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      {cual === "cruce" ? (
        <g>
          <CruceBanco />
          <OmnibusB x0={-200} y={1010} v={0} s={1} />
          <Hansom x0={1500} y={1000} v={-0.001} s={1} />
          <Vendedor x={1300} y={1060} cartel="EUROPE LATEST" />
        </g>
      ) : cual === "sala" ? (
        <g>
          <SalaBanco titulo="BANK RATE" sub="BANK OF ENGLAND" cifra="3 %" escrito={1} fecha="29 JULY 1914" publico={0} />
          <Escribiente x={1500} y={1080} />
        </g>
      ) : cual === "salany" ? (
        <SalaBanco titulo="STERLING" sub="CABLE TRANSFERS · NEW YORK" cifra="7.00" escrito={1} tono="nuevayork" publico={6} />
      ) : cual === "puerta" ? (
        <g>
          <PuertaBolsa cierre={0.95} aviso={1} />
          <Portero x={1180} y={1000} />
        </g>
      ) : cual === "ny" ? (
        <BolsaNuevaYork cierre={0.5} />
      ) : cual === "despacho" ? (
        <g>
          <Despacho mes={2} hoja={0} mapa cable />
        </g>
      ) : (
        <SalaJuntas cifra="5.00" giro={0} />
      )}
    </svg>
  </AbsoluteFill>
);
