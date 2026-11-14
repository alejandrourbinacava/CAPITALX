import React from "react";
import { Composition, Still } from "remotion";
import { CapitalXVideo, duracionTotalDe } from "./Video";
import { VIDEO } from "./theme";
import { DEMOS } from "./demo";

import { CATALOGO } from "./catalogo.generated";
import { Miniatura, MINIATURA } from "./scenes/Miniatura";
import { Piloto, DURACION_PILOTO } from "./piloto/Piloto";
import { PruebaPersonajes, PruebaDecorado } from "./piloto/Prueba";
import { Piloto3, DURACION_PILOTO3 } from "./piloto/Piloto3";
import { PruebaEscena, HojaEscenas } from "./ilustrado/Prueba";

export const RemotionRoot: React.FC = () => (
  <>
    {/* El muestrario de plantillas: el mismo material pasado por cada estilo
        de montaje. No es un video del canal, es la carta de colores. */}
    {DEMOS.map(({ id, guion }) => (
      <Composition
        key={id}
        id={id}
        component={CapitalXVideo as any}
        defaultProps={{ guion, tiempos: {} }}
        durationInFrames={duracionTotalDe(guion, {})}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    ))}
    {CATALOGO.map(({ id, guion, tiempos }) => (
      <Composition
        key={id}
        id={id}
        component={CapitalXVideo as any}
        defaultProps={{ guion, tiempos }}
        durationInFrames={duracionTotalDe(guion, tiempos)}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    ))}
    {/* Piloto de montaje ilustrado (solo dibujo en codigo): no es parte de la cadena. */}
    <Composition
      id="piloto-ilustrado"
      component={Piloto}
      durationInFrames={DURACION_PILOTO}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition id="piloto-ilustrado-3" component={Piloto3} durationInFrames={DURACION_PILOTO3} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Still id="prueba-decorado" component={PruebaDecorado as any} width={VIDEO.width} height={VIDEO.height} defaultProps={{ cual: "cruce" }} />
    <Still id="prueba-personajes" component={PruebaPersonajes} width={VIDEO.width} height={VIDEO.height} />
    {/* Motor ilustrado: una escena suelta y la hoja de todas las tomas de un video. */}
    <Composition id="escena-prueba" component={PruebaEscena as any} durationInFrames={300} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} defaultProps={{ spec: { decorado: "wei/calle" } }} />
    <Composition id="escena-hoja" component={HojaEscenas as any} durationInFrames={300} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} defaultProps={{ codigo: "wei" }} />
    {/* La miniatura de YouTube: la imagen de fondo la hace OpenAI y el texto
        se pone aqui, para que el castellano salga siempre bien escrito. */}
    <Still
      id="miniatura"
      component={Miniatura as any}
      width={MINIATURA.width}
      height={MINIATURA.height}
      defaultProps={{ fondo: "", texto: "CAPITAL X", resalte: "" }}
    />
  </>
);
