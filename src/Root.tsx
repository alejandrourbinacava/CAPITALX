import React from "react";
import { Composition, Still } from "remotion";
import { CapitalXVideo, duracionTotalDe } from "./Video";
import { VIDEO } from "./theme";
import { DEMOS } from "./demo";

import { CATALOGO } from "./catalogo.generated";
import { Miniatura, MINIATURA } from "./scenes/Miniatura";

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
