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
// Redondear los segundos sueltos daba "6:60", que YouTube no admite como capitulo.
const mmss = (s) => {
  const t = Math.floor(s);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};
const dur = mmss(seg);
const mb = fs.existsSync(video) ? (fs.statSync(video).size / 1048576).toFixed(0) : "?";
const pub = doc.publicacion ?? {};
const cerca = "```";

/**
 * Los capitulos, sacados de la duracion real de la locucion.
 *
 * Antes los escribia el guionista a ojo y salian inventados: en el video de
 * la burbuja llegaban hasta 19:40 cuando el video dura 15:26, y asi YouTube
 * ni los acepta. Aqui se miden.
 */


/**
 * Quita de la descripcion los capitulos y el anuncio del proximo video.
 *
 * Los guiones viejos los traen escritos dentro: los capitulos inventados a
 * ojo, y una promesa del video siguiente que deja de cumplirse en cuanto
 * cambia el orden de la cola. Los capitulos buenos se calculan abajo.
 */
function limpiar(texto) {
  const salto = String.fromCharCode(10);
  const corta = new RegExp(salto + "(?=(?:⏱️|▶️|🔔|CAPÍTULOS|FUENTES))");
  return String(texto ?? "")
    .split(corta)
    .filter((t) => !/^(⏱️|▶️|🔔|CAPÍTULOS)/.test(t.trim()))
    .join(salto)
    .trim();
}
const capitulos = [];
{
  let t = 0;
  for (const b of doc.bloques) {
    capitulos.push(`${mmss(t)}  ${b.nombre}`);
    for (const p of b.planos) t += (tiempos[p.id]?.duration ?? 0) + 0.34;
  }
  // YouTube exige que el primero sea 0:00
  if (capitulos.length) capitulos[0] = capitulos[0].replace(/^\d+:\d+/, "0:00");
}

const salida = [
  `## ${pub.titulo ?? doc.titulo}`,
  ``,
  `El vídeo está publicado: mira el enlace en el paso "Publicar el vídeo".`,
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
  limpiar(pub.descripcion),
  ``,
  `⏱️ CAPÍTULOS`,
  ...capitulos,
  ``,
  `🔔 Suscríbete si quieres entender cómo se rompen los países ricos antes de que le toque al tuyo.`,
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
