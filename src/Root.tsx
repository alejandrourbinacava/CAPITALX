import React from "react";
import { Composition } from "remotion";
import {
  CapitalXVideo,
  duracionTotalDe,
  type Guion,
  type Tiempos,
} from "./Video";
import { VIDEO } from "./theme";

import irlanda from "../content/irlanda.json";
import irlandaT from "../content/irlanda.timings.json";
import noruega from "../content/noruega.json";
import noruegaT from "../content/noruega.timings.json";
import mexico from "../content/mexico.json";
import corea from "../content/corea.json";
import mexicoT from "../content/mexico.timings.json";
import coreaT from "../content/corea.timings.json";
import pensiones from "../content/pensiones.json";
import pensionesT from "../content/pensiones.timings.json";
import diario from "../content/diario.json";
import diarioT from "../content/diario.timings.json";

/** Un vídeo del canal = un guion más sus tiempos de locución. */
const CATALOGO: { id: string; guion: Guion; tiempos: Tiempos }[] = [
  { id: "irlanda", guion: irlanda as any, tiempos: irlandaT as any },
  { id: "noruega", guion: noruega as any, tiempos: noruegaT as any },
  { id: "mexico", guion: mexico as any, tiempos: mexicoT as any },
  { id: "corea", guion: corea as any, tiempos: coreaT as any },
  // El de cada manana. Lo sobrescribe el flujo diario antes de renderizar.
  { id: "pensiones", guion: pensiones as any, tiempos: pensionesT as any },
  { id: "diario", guion: diario as any, tiempos: diarioT as any },
];

export const RemotionRoot: React.FC = () => (
  <>
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
  </>
);
