import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";

const PLOT = { x: 300, y: 250, w: 1420, h: 520 };

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Serie temporal que se dibuja de izquierda a derecha con relleno tramado.
 * El punto final se marca en carmin.
 */
export const LineSeries: React.FC<{
  points: { label: string; v: number }[];
  yMax?: number;
  yLabel?: string;
  night?: boolean;
  color?: string;
}> = ({ points, yMax, yLabel, night, color = C.carmin }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const grow = ease(
    interpolate(frame, [8, Math.min(durationInFrames - 6, 70)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const max = yMax ?? Math.max(...points.map((p) => p.v)) * 1.12;
  const sx = (i: number) => PLOT.x + (i / (points.length - 1)) * PLOT.w;
  const sy = (v: number) => PLOT.y + PLOT.h - (v / max) * PLOT.h;

  const shown = 1 + grow * (points.length - 1);
  const visible: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    if (i <= shown) visible.push([sx(i), sy(points[i].v)]);
  }
  if (visible.length >= 1 && shown < points.length - 1) {
    const i0 = Math.floor(shown);
    const f = shown - i0;
    if (i0 + 1 < points.length) {
      visible.push([
        sx(i0) + (sx(i0 + 1) - sx(i0)) * f,
        sy(points[i0].v) + (sy(points[i0 + 1].v) - sy(points[i0].v)) * f,
      ]);
    }
  }

  const line = visible.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = visible.length
    ? `${line} L${visible[visible.length - 1][0].toFixed(1)} ${PLOT.y + PLOT.h} L${PLOT.x} ${PLOT.y + PLOT.h} Z`
    : "";
  const tip = visible[visible.length - 1];
  const axis = night ? C.paleDim : "#B4BBB2";
  const text = night ? C.mutedNight : C.muted;

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
      <defs>
        <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(48)">
          <line x1="0" y1="0" x2="0" y2="10" stroke={color} strokeWidth="2.4" opacity="0.35" />
        </pattern>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line
            x1={PLOT.x}
            y1={PLOT.y + PLOT.h - g * PLOT.h}
            x2={PLOT.x + PLOT.w}
            y2={PLOT.y + PLOT.h - g * PLOT.h}
            stroke={axis}
            strokeWidth="1.4"
            opacity="0.55"
          />
          <text
            x={PLOT.x - 24}
            y={PLOT.y + PLOT.h - g * PLOT.h + 9}
            textAnchor="end"
            fill={text}
            fontFamily={FONT.mono}
            fontSize="24"
          >
            {Math.round((g * max) / 1000) >= 1
              ? `${Math.round((g * max) / 1000)}k`
              : Math.round(g * max)}
          </text>
        </g>
      ))}

      {area ? <path d={area} fill="url(#hatch)" /> : null}
      {line ? <path d={line} fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" /> : null}
      {tip ? <circle cx={tip[0]} cy={tip[1]} r="12" fill={color} /> : null}

      <line x1={PLOT.x} y1={PLOT.y + PLOT.h} x2={PLOT.x + PLOT.w} y2={PLOT.y + PLOT.h} stroke={night ? C.pale : C.ink} strokeWidth="3" />

      {points.map((p, i) =>
        i % Math.ceil(points.length / 7) === 0 || i === points.length - 1 ? (
          <text
            key={i}
            x={sx(i)}
            y={PLOT.y + PLOT.h + 46}
            textAnchor="middle"
            fill={text}
            fontFamily={FONT.mono}
            fontSize="24"
          >
            {p.label}
          </text>
        ) : null
      )}

      {yLabel ? (
        <text x={PLOT.x} y={PLOT.y - 34} fill={text} fontFamily={FONT.mono} fontSize="26" letterSpacing="4">
          {yLabel}
        </text>
      ) : null}
    </svg>
  );
};

/** Dos barras enfrentadas: el truco visual del PIB contra la economia real. */
export const CompareBars: React.FC<{
  a: { label: string; v: number; note?: string };
  b: { label: string; v: number; note?: string };
  unit?: string;
}> = ({ a, b, unit = "" }) => {
  const frame = useCurrentFrame();
  const grow = ease(
    interpolate(frame, [6, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  const max = Math.max(a.v, b.v);
  const H = 470;
  const base = 800;
  const ha = (a.v / max) * H * grow;
  const hb = (b.v / max) * H * grow;

  const Bar = ({
    x,
    h,
    d,
    color,
    label,
    value,
    note,
  }: {
    x: number;
    h: number;
    d: number;
    color: string;
    label: string;
    value: number;
    note?: string;
  }) => (
    <g>
      <rect x={x + 16} y={base - h + 16} width="300" height={h} fill={C.carmin} opacity={0.9 * grow} />
      <rect x={x} y={base - h} width="300" height={h} fill={color} />
      <text x={x + 150} y={base - h - 34} textAnchor="middle" fill={C.ink} fontFamily={FONT.sans} fontWeight="700" fontSize="72">
        {Math.round(value * grow).toLocaleString("es-ES")}
      </text>
      <text x={x + 150} y={base + 52} textAnchor="middle" fill={C.muted} fontFamily={FONT.mono} fontSize="26" letterSpacing="3">
        {label}
      </text>
      {note ? (
        <text x={x + 150} y={base + 92} textAnchor="middle" fill={C.muted} fontFamily={FONT.mono} fontSize="22">
          {note}
        </text>
      ) : null}
    </g>
  );

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 1920 1080">
      <line x1="560" y1={base} x2="1500" y2={base} stroke={C.ink} strokeWidth="3" />
      <Bar x={640} h={ha} d={0} color={C.ink} label={a.label} value={a.v} note={a.note} />
      <Bar x={1060} h={hb} d={6} color={C.verde} label={b.label} value={b.v} note={b.note} />
      {unit ? (
        <text x={640} y={216} fill={C.muted} fontFamily={FONT.mono} fontSize="26" letterSpacing="4">
          {unit}
        </text>
      ) : null}
      {/* la diferencia, marcada */}
      <g opacity={grow}>
        <line x1="1420" y1={base - ha} x2="1420" y2={base - hb} stroke={C.carmin} strokeWidth="4" />
        <line x1="1400" y1={base - ha} x2="1440" y2={base - ha} stroke={C.carmin} strokeWidth="4" />
        <line x1="1400" y1={base - hb} x2="1440" y2={base - hb} stroke={C.carmin} strokeWidth="4" />
        <text x={1460} y={base - (ha + hb) / 2} fill={C.carmin} fontFamily={FONT.sans} fontWeight="700" fontSize="44">
          219.100
        </text>
      </g>
    </svg>
  );
};
