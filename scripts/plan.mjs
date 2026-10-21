/**
 * Reparte el render de un video en tramos para que GitHub los haga en paralelo.
 *
 *   node scripts/plan.mjs revolucion-francesa [--tramo=5000]
 *
 * Un video de 33 minutos son ~60.000 fotogramas. En un runner de 4 nucleos eso
 * son horas seguidas y el limite de un job es de 6. Repartido en tramos de unos
 * 5.000 fotogramas, cada job dura 20-40 minutos y los hace a la vez.
 *
 * El total de fotogramas se lo pregunta a Remotion (`compositions`), no se
 * calcula aparte: asi nunca puede discrepar de lo que luego se renderiza.
 *
 * Escribe en GITHUB_OUTPUT:  frames, n, matriz (JSON para `strategy.matrix`).
 * GitHub admite 20 jobs simultaneos en el plan gratuito: si el video es muy
 * largo el tramo crece para no pasar de 20.
 */

import fs from "node:fs";
import { spawnSync } from "node:child_process";

const slug = process.argv[2];
if (!slug) throw new Error("uso: node scripts/plan.mjs <slug> [--tramo=5000]");
const arg = process.argv.find((a) => a.startsWith("--tramo="));
const MAX_JOBS = 20;
let tramo = Math.max(300, parseInt(arg?.split("=")[1] ?? "5000", 10) || 5000);

const r = spawnSync("npx", ["remotion", "compositions", "src/index.ts"], { encoding: "utf8", shell: true, maxBuffer: 64 * 1024 * 1024 });
const texto = ((r.stdout ?? "") + (r.stderr ?? "")).replace(/\x1b\[[0-9;]*m/g, "").replace(/\r/g, "\n");
const linea = texto.split("\n").find((l) => l.trim().split(/\s+/)[0] === slug);
const m = linea?.match(/\s(\d+)\s+(\d+)x(\d+)\s+(\d+)\s/);
if (!m) {
  console.error(texto.split("\n").filter((l) => !/Bundling|Copying/.test(l)).slice(-25).join("\n"));
  throw new Error(`Remotion no conoce la composicion "${slug}". ¿Se ha regenerado el catalogo (node scripts/catalogo.mjs)?`);
}
const frames = parseInt(m[4], 10);
tramo = Math.max(tramo, Math.ceil(frames / MAX_JOBS));

const matriz = [];
for (let ini = 0, i = 0; ini < frames; ini += tramo, i++) {
  matriz.push({ i: String(i).padStart(2, "0"), ini, fin: Math.min(ini + tramo, frames) - 1 });
}
// Un ultimo tramo de unos pocos fotogramas desperdicia un job entero: se pega al anterior
if (matriz.length > 1) {
  const ult = matriz[matriz.length - 1];
  if (ult.fin - ult.ini + 1 < tramo * 0.25) {
    matriz.pop();
    matriz[matriz.length - 1].fin = frames - 1;
  }
}

console.log(`${slug}: ${frames} fotogramas (${(frames / 30 / 60).toFixed(1)} min) en ${matriz.length} tramos de ~${tramo}`);
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `frames=${frames}\nn=${matriz.length}\nmatriz=${JSON.stringify(matriz)}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Render en **${matriz.length} tramos** (${frames} fotogramas).\n`);
} else {
  console.log(JSON.stringify(matriz));
}
