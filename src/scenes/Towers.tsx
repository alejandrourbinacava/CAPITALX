import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

/**
 * Torres de oficinas con la flecha del PIB subiendo por encima.
 *
 * Es el contraplano del coche: la misma ciudad vista desde el dinero. Las
 * torres se levantan escalonadas y la flecha se traza despues, para que la
 * lectura sea "primero la riqueza, luego la cifra".
 */
export const Towers: React.FC<{ etiqueta?: string }> = ({ etiqueta }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const towers = [
    { x: 210, w: 168, h: 372, s: "t1" },
    { x: 398, w: 138, h: 484, s: "t2" },
    { x: 556, w: 186, h: 302, s: "t3" },
    { x: 762, w: 152, h: 553, s: "t4" },
    { x: 934, w: 176, h: 406, s: "t5" },
    { x: 1130, w: 144, h: 622, s: "t6" },
    { x: 1294, w: 190, h: 466, s: "t7" },
    { x: 1504, w: 160, h: 536, s: "t8" },
  ];
  const base = 792;

  const arrow = interpolate(frame, [0.9 * fps, Math.min(durationInFrames - 6, 2.6 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });

  const ax0 = 250;
  const ay0 = 744;
  const ax1 = 1620;
  const ay1 = 210;
  const cx = ax0 + (ax1 - ax0) * arrow;
  const cy = ay0 + (ay1 - ay0) * Math.pow(arrow, 1.85);

  return (
    <>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
        {/* suelo */}
        <line x1="0" y1={base} x2="1920" y2={base} stroke={C.ink} strokeWidth="4" />

        {towers.map((t, i) => {
          const rise = interpolate(frame, [i * 3, i * 3 + 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: (x) => 1 - Math.pow(1 - x, 3),
          });
          const h = t.h * rise;
          const rows = Math.floor(t.h / 46);
          const cols = Math.max(2, Math.floor(t.w / 40));
          return (
            <g key={t.s}>
              <rect x={t.x + 14} y={base - h + 14} width={t.w} height={h} fill={C.carmin} opacity={0.16} />
              <rect x={t.x} y={base - h} width={t.w} height={h} fill={C.ink} />
              {Array.from({ length: rows * cols }).map((_, k) => {
                const c = k % cols;
                const r = Math.floor(k / cols);
                const wy = base - t.h + 24 + r * 46;
                if (wy < base - h + 10) return null;
                if (random(`${t.s}w${k}`) > 0.62) return null;
                return (
                  <rect
                    key={k}
                    x={t.x + 12 + c * (t.w / cols)}
                    y={wy}
                    width={(t.w / cols) * 0.5}
                    height={22}
                    fill={C.ocre}
                    opacity={0.85}
                  />
                );
              })}
            </g>
          );
        })}

        {/* flecha del PIB */}
        <path
          d={`M${ax0} ${ay0} Q${(ax0 + cx) / 2} ${ay0 - (ay0 - cy) * 0.28} ${cx} ${cy}`}
          fill="none"
          stroke={C.carmin}
          strokeWidth="12"
          strokeLinecap="round"
        />
        {arrow > 0.08 ? (
          <g transform={`translate(${cx} ${cy}) rotate(-36)`}>
            <path d="M0 0 L-40 -20 L-30 0 L-40 20 Z" fill={C.carmin} transform="rotate(180)" />
          </g>
        ) : null}
      </svg>

      {etiqueta ? (
        <div
          style={{
            position: "absolute",
            left: 128,
            top: 96,
            fontFamily: FONT.mono,
            fontSize: 26,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          {etiqueta}
        </div>
      ) : null}
    </>
  );
};
