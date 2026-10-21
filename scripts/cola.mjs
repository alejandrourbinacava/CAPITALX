/**
 * Pasa un tema de la cola a "hechos" cuando su video ya esta en YouTube.
 *
 *   node scripts/cola.mjs <slug> [videoId]
 *
 * Si el slug no esta en la cola (un video hecho a mano) no hace nada.
 */

import fs from "node:fs";

const [, , slug, videoId] = process.argv;
if (!slug) throw new Error("uso: node scripts/cola.mjs <slug> [videoId]");

const ruta = "content/cola.json";
const cola = JSON.parse(fs.readFileSync(ruta, "utf8"));
const i = cola.cola.findIndex((t) => t.slug === slug);
if (i < 0) {
  console.log(`"${slug}" no estaba en la cola`);
  process.exit(0);
}
const [t] = cola.cola.splice(i, 1);
const doc = JSON.parse(fs.readFileSync(`content/${slug}.json`, "utf8"));
cola.hechos.push({
  slug: t.slug,
  titulo: doc.publicacion?.titulo || doc.titulo || t.titulo,
  fecha: new Date().toISOString().slice(0, 10),
  video: videoId || null,
});
fs.writeFileSync(ruta, JSON.stringify(cola, null, 2) + "\n");
console.log(`quedan ${cola.cola.length} temas en la cola`);
