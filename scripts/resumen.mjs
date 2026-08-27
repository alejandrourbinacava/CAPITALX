/**
 * Escribe el resumen que ves en la pagina de la ejecucion de GitHub.
 *
 * Como el video se descarga a mano, esta es la pagina donde recoges todo lo
 * del dia: cuanto dura, cuanto pesa, y el titulo, la descripcion y las
 * etiquetas listos para copiar y pegar en YouTube Studio.
 *
 *   node scripts/resumen.mjs out/diario-master.mp4 content/diario.json
 */

import fs from "node:fs";

const [, , video, guionPath] = process.argv;
const doc = JSON.parse(fs.readFileSync(guionPath, "utf8"));
const tiempos = JSON.parse(fs.readFileSync(guionPath.replace(/\.json$/, ".timings.json"), "utf8"));
const cola = JSON.parse(fs.readFileSync("content/cola.json", "utf8"));

const planos = doc.bloques.flatMap((b) => b.planos);
const seg = planos.reduce((a, p) => a + (tiempos[p.id] ? tiempos[p.id].duration + 0.34 : 0), 0);
const dur = `${Math.floor(seg / 60)}:${String(Math.round(seg % 60)).padStart(2, "0")}`;
const mb = fs.existsSync(video) ? (fs.statSync(video).size / 1048576).toFixed(0) : "?";
const pub = doc.publicacion ?? {};
const cerca = "```";

const salida = [
  `## ${pub.titulo ?? doc.titulo}`,
  ``,
  `El vídeo está abajo del todo, en **Artifacts**.`,
  ``,
  `| | |`,
  `|---|---|`,
  `| Duración | ${dur} |`,
  `| Peso | ${mb} MB |`,
  `| Planos | ${planos.length} |`,
  `| Temas que quedan en la cola | ${cola.cola.length} |`,
  ``,
  `### Para pegar en YouTube`,
  ``,
  `**Título**`,
  ``,
  cerca,
  pub.titulo ?? doc.titulo,
  cerca,
  ``,
  `<details><summary>Descripción</summary>`,
  ``,
  cerca,
  pub.descripcion ?? "",
  cerca,
  ``,
  `</details>`,
  ``,
  `<details><summary>Etiquetas</summary>`,
  ``,
  cerca,
  (pub.etiquetas ?? []).join(", "),
  cerca,
  ``,
  `</details>`,
  ``,
].join("\n");

if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, salida);
else console.log(salida);
