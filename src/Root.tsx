import React from "react";
import { Composition } from "remotion";
import { CapitalXVideo, duracionTotal } from "./Video";
import { VIDEO } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="irlanda"
      component={CapitalXVideo}
      durationInFrames={duracionTotal}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  </>
);
