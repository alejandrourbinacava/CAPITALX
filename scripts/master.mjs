/**
 * Masterizado de sonido.
 *
 * YouTube normaliza todo lo que sube a -14 LUFS. Si entregas mas bajo, te lo
 * deja tal cual y suena flojo al lado de los demas; si entregas mas alto, te
 * lo baja y pierdes pegada. Asi que se entrega justo en -14.
 *
 * Dos pasadas: la primera mide, la segunda corrige con esa medida.
 *
 * Uso:  node scripts/master.mjs out/irlanda-b0.mp4 out/irlanda-b0-master.mp4
 */

import { spawnSync } from "node:child_process";

const TARGET = { I: -14, TP: -1.5, LRA: 11 };

/** ffmpeg escribe el informe de loudnorm por stderr, no por stdout. */
function run(args) {
  const r = spawnSync("ffmpeg", ["-hide_banner", ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return { code: r.status, out: (r.stdout ?? "") + (r.stderr ?? "") };
}

function medir(input) {
  const { out } = run([
    "-i", input, "-af",
    `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}:print_format=json`,
    "-f", "null", "-",
  ]);
  const m = out.match(/\{[\s\S]*?\}/g);
  if (!m) throw new Error("no se pudo medir la sonoridad:\n" + out.slice(-500));
  return JSON.parse(m[m.length - 1]);
}

const [, , input, output] = process.argv;
if (!input || !output) throw new Error("uso: node scripts/master.mjs entrada.mp4 salida.mp4");

const d = medir(input);
console.log(
  `medido   I=${d.input_i} LUFS · TP=${d.input_tp} dBTP · LRA=${d.input_lra}`
);

const filtro =
  `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}` +
  `:measured_I=${d.input_i}:measured_TP=${d.input_tp}` +
  `:measured_LRA=${d.input_lra}:measured_thresh=${d.input_thresh}` +
  `:offset=${d.target_offset}:linear=true`;

const r = run(["-y", "-i", input, "-map", "0", "-c:v", "copy", "-af", filtro,
  "-c:a", "aac", "-b:a", "256k", "-ar", "48000", output]);
if (r.code !== 0) throw new Error(r.out.split("\n").slice(-8).join("\n"));

const f = medir(output);
console.log(`entregado I=${f.input_i} LUFS · TP=${f.input_tp} dBTP`);
console.log(`escrito ${output}`);
