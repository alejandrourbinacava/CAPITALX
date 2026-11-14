// Catalogo del motor ilustrado y comprobacion de un guion.
//
//   node scripts/escenas.mjs wei                      lista los decorados "wei/..." con sus tomas
//   node scripts/escenas.mjs --guion content/x.json   comprueba que cada escena pide un decorado y una toma que existen
//
// Empaqueta src/ilustrado/registro.ts con esbuild para leer el registro real,
// no una copia a mano que se desfase.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const salida = path.join(os.tmpdir(), `registro-escenas-${process.pid}.mjs`);
await build({
  entryPoints: [path.join(raiz, "src/ilustrado/registro.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  outfile: salida,
  external: ["react", "react/jsx-runtime", "remotion"],
  logLevel: "error",
  nodePaths: [path.join(raiz, "node_modules")],
});
// react y remotion se resuelven desde el proyecto
const enlace = path.join(raiz, "node_modules", ".registro-escenas.mjs");
fs.copyFileSync(salida, enlace);
const { DECORADOS } = await import(pathToFileURL(enlace).href);
fs.rmSync(enlace);
fs.rmSync(salida);

const args = process.argv.slice(2);
if (args[0] === "--guion") {
  const doc = JSON.parse(fs.readFileSync(args[1], "utf8"));
  const fallos = [];
  let n = 0;
  for (const b of doc.bloques ?? [])
    for (const p of b.planos ?? [])
      (p.escenas ?? []).forEach((e, i) => {
        if (e.tipo !== "escena") return;
        n++;
        const d = DECORADOS[e.escena?.decorado];
        if (!d) fallos.push(`${p.id}#${i}: no existe el decorado "${e.escena?.decorado}"`);
        else if (e.escena.toma && !d.tomas[e.escena.toma])
          fallos.push(`${p.id}#${i}: "${e.escena.decorado}" no tiene la toma "${e.escena.toma}" (tiene: ${Object.keys(d.tomas).join(", ")})`);
      });
  console.log(`${n} escenas ilustradas, ${fallos.length} fallos`);
  for (const f of fallos) console.log("   · " + f);
  process.exit(fallos.length ? 1 : 0);
} else {
  const pref = args[0] ? args[0] + "/" : "";
  for (const [clave, d] of Object.entries(DECORADOS)) {
    if (!clave.startsWith(pref)) continue;
    console.log(`\n${clave}${d.ancho ? ` (ancho ${d.ancho})` : ""}: ${d.desc}`);
    if (d.admite) console.log(`  admite: ${d.admite}`);
    for (const [t, v] of Object.entries(d.tomas)) console.log(`  - ${t}${v.desc ? `: ${v.desc}` : ""}`);
  }
}
