import React, { useMemo } from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";

/**
 * Calle de Dublin de noche. Tres planos de profundidad que se mueven a
 * velocidades distintas: el parallax lo hace el codigo, no un modelo de video.
 * Oficinas encendidas al fondo, un coche con alguien dentro en primer plano.
 */

const Windows: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
  seed: string;
  lit: string;
  frame: number;
}> = ({ x, y, w, h, cols, rows, seed, lit, frame }) => {
  const cells = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; on: boolean; flick: number }[] = [];
    const gw = w / cols;
    const gh = h / rows;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const on = random(`${seed}-${c}-${r}`) > 0.34;
        out.push({
          x: x + c * gw + gw * 0.22,
          y: y + r * gh + gh * 0.24,
          w: gw * 0.56,
          h: gh * 0.5,
          on,
          flick: random(`${seed}f${c}${r}`),
        });
      }
    }
    return out;
  }, [x, y, w, h, cols, rows, seed]);

  return (
    <g>
      {cells.map((c, i) =>
        c.on ? (
          <rect
            key={i}
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            fill={lit}
            opacity={
              0.5 +
              0.42 * (0.5 + 0.5 * Math.sin(frame * 0.045 + c.flick * 40))
            }
          />
        ) : null
      )}
    </g>
  );
};

export const DublinNight: React.FC<{ dawn?: boolean; encuadre?: "amplio" | "corto" }> = ({
  dawn = false,
  encuadre = "amplio",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / Math.max(durationInFrames, 1);

  // Empuje lento: cada capa a su velocidad
  const far = interpolate(p, [0, 1], [1.0, 1.03]);
  const mid = interpolate(p, [0, 1], [1.0, 1.055]);
  const near = interpolate(p, [0, 1], [1.0, 1.09]);
  const drift = interpolate(p, [0, 1], [0, -22]);

  const sky = dawn ? "#1C2A2E" : C.night;
  const litColor = dawn ? "#E8B33C" : "#E8B33C";
  const stroke = dawn ? "#7FA79B" : C.pale;
  const fill = dawn ? "#0E1A1C" : "#080F0E";

  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox={encuadre === "corto" ? "420 600 1000 563" : "0 0 1920 1080"}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect x="-200" y="-200" width="2400" height="1600" fill={sky} />

      {/* halo de la ciudad */}
      <ellipse cx="960" cy="760" rx="1100" ry="330" fill={dawn ? "#2A3C3A" : "#101C1A"} opacity="0.9" />

      {/* CAPA LEJANA — torres de oficinas */}
      <g transform={`translate(${drift * 0.25} 0) scale(${far}) translate(${(1 - far) * 960} ${(1 - far) * 540})`}>
        {[
          { x: 120, y: 300, w: 190, h: 500, c: 5, r: 12, s: "a" },
          { x: 330, y: 380, w: 150, h: 420, c: 4, r: 10, s: "b" },
          { x: 500, y: 250, w: 210, h: 550, c: 6, r: 13, s: "c" },
          { x: 1250, y: 330, w: 170, h: 470, c: 5, r: 11, s: "d" },
          { x: 1440, y: 260, w: 220, h: 540, c: 6, r: 13, s: "e" },
          { x: 1680, y: 360, w: 160, h: 440, c: 4, r: 10, s: "f" },
        ].map((b) => (
          <g key={b.s}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={fill} stroke={stroke} strokeWidth="2" opacity="0.85" />
            <Windows x={b.x} y={b.y} w={b.w} h={b.h} cols={b.c} rows={b.r} seed={b.s} lit={litColor} frame={frame} />
          </g>
        ))}
      </g>

      {/* CAPA MEDIA — bloque bajo y farola */}
      <g transform={`translate(${drift * 0.6} 0) scale(${mid}) translate(${(1 - mid) * 960} ${(1 - mid) * 540})`}>
        <rect x="740" y="430" width="440" height="370" fill={fill} stroke={stroke} strokeWidth="2.4" />
        <Windows x={740} y={430} w={440} h={370} cols={7} rows={7} seed="mid" lit={litColor} frame={frame} />
        <rect x="0" y="800" width="1920" height="8" fill={stroke} opacity="0.5" />

        {/* farola con cono de luz */}
        <g>
          <rect x="1560" y="470" width="7" height="340" fill={stroke} opacity="0.85" />
          <ellipse cx="1563" cy="466" rx="26" ry="11" fill={C.ocre} opacity="0.9" />
          <path d="M1537 470 L1589 470 L1690 810 L1436 810 Z" fill={C.ocre} opacity="0.07" />
        </g>
      </g>

      {/* CAPA CERCANA — calzada y coche */}
      <g transform={`translate(${drift} 0) scale(${near}) translate(${(1 - near) * 960} ${(1 - near) * 540})`}>
        <rect x="0" y="808" width="1920" height="272" fill={dawn ? "#121E20" : "#060C0B"} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={90 + i * 330} y={950} width={150} height="6" fill={stroke} opacity="0.32" />
        ))}

        {/* coche de perfil */}
        <g transform="translate(430 690) scale(1.32)">
          <path
            d="M20 150 L38 92 C46 72 66 60 92 58 L268 50 C300 48 326 58 348 78 L392 118 L430 128 C450 134 458 146 458 160 L458 186 C458 194 452 200 442 200 L34 200 C24 200 18 194 18 186 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3"
          />
          {/* ventanillas */}
          <path d="M108 74 L108 128 L58 128 L76 88 C82 78 92 74 108 74 Z" fill={dawn ? "#24393C" : "#12201F"} stroke={stroke} strokeWidth="2" />
          <path d="M128 72 L262 66 C288 64 306 72 322 86 L356 122 L128 128 Z" fill={dawn ? "#24393C" : "#12201F"} stroke={stroke} strokeWidth="2" />
          {/* figura durmiendo dentro: cabeza apoyada en la ventanilla */}
          <g opacity="0.95">
            <circle cx="196" cy="104" r="21" fill={C.pale} opacity="0.5" />
            <path d="M164 128 C168 112 180 104 196 104 C212 104 224 112 228 128 Z" fill={C.pale} opacity="0.38" />
          </g>
          {/* ruedas */}
          <circle cx="118" cy="200" r="34" fill={dawn ? "#0C1618" : "#050A09"} stroke={stroke} strokeWidth="3" />
          <circle cx="118" cy="200" r="13" fill="none" stroke={stroke} strokeWidth="2" opacity="0.7" />
          <circle cx="378" cy="200" r="34" fill={dawn ? "#0C1618" : "#050A09"} stroke={stroke} strokeWidth="3" />
          <circle cx="378" cy="200" r="13" fill="none" stroke={stroke} strokeWidth="2" opacity="0.7" />
          {/* vaho en el cristal */}
          <ellipse cx="196" cy="112" rx="46" ry="30" fill={C.pale} opacity="0.07" />
        </g>
      </g>
    </svg>
  );
};
