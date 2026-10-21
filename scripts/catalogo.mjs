/**
 * Escribe src/catalogo.generated.ts: la lista de videos que Remotion conoce.
 *
 * Antes cada video nuevo obligaba a tocar src/Root.tsx a mano (dos imports y
 * una linea). Eso es justo lo que impide automatizar la cadena: un guion que
 * aparece en content/ no se puede renderizar hasta que alguien edite codigo.
 * Ahora Root.tsx lee este fichero, y este script lo regenera a partir de lo
 * que haya en content/: un video es un `<slug>.json` con su `<slug>.timings.json`.
 *
 *   node scripts/catalogo.mjs            escribe el fichero
 *   node scripts/catalogo.mjs --comprobar  falla si el fichero esta desfasado
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CONTENT = "content";
const SALIDA = "src/catalogo.generated.ts";

function videos() {
  const nombres = fs.readdirSync(CONTENT).filter((f) => f.endsWith(".json") && !f.endsWith(".timings.json"));
  const lista = [];
  for (const f of nombres.sort()) {
    const slug = f.replace(/\.json$/, "");
    if (!fs.existsSync(path.join(CONTENT, `${slug}.timings.json`))) continue;
    let doc;
    try {
      doc = JSON.parse(fs.readFileSync(path.join(CONTENT, f), "utf8"));
    } catch {
      continue;
    }
    if (!Array.isArray(doc.bloques)) continue;
    lista.push(slug);
  }
  return lista;
}

export function generar() {
  const slugs = videos();
  const l = [
    "// GENERADO por scripts/catalogo.mjs. No editar a mano: se pisa.",
    "// Un video = content/<slug>.json + content/<slug>.timings.json.",
    "",
    'import type { Guion, Tiempos } from "./Video";',
    "",
  ];
  slugs.forEach((s, i) => {
    l.push(`import g${i} from "../content/${s}.json";`);
    l.push(`import t${i} from "../content/${s}.timings.json";`);
  });
  l.push("", "export const CATALOGO: { id: string; guion: Guion; tiempos: Tiempos }[] = [");
  slugs.forEach((s, i) => l.push(`  { id: ${JSON.stringify(s)}, guion: g${i} as any, tiempos: t${i} as any },`));
  l.push("];", "");
  return l.join("\n");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const nuevo = generar();
  if (process.argv.includes("--comprobar")) {
    const actual = fs.existsSync(SALIDA) ? fs.readFileSync(SALIDA, "utf8") : "";
    if (actual !== nuevo) {
      console.error(`${SALIDA} esta desfasado. Ejecuta: node scripts/catalogo.mjs`);
      process.exit(1);
    }
    console.log("catalogo al dia");
  } else {
    fs.writeFileSync(SALIDA, nuevo);
    console.log(`${SALIDA}: ${nuevo.split("\n").filter((x) => x.includes("{ id:")).length} videos`);
  }
}
