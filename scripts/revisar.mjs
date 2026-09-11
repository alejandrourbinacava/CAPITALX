/**
 * Revisa un guion escrito a mano antes de gastar creditos de voz.
 *
 * Desde que los guiones los escribo yo aqui en vez de pedirselos a la API,
 * esta es la unica comprobacion que queda entre el guion y los veinte mil
 * creditos de la locucion. Usa el mismo validador y el mismo reparador que
 * usaba el flujo automatico, asi que las reglas son las de siempre.
 *
 *   node scripts/revisar.mjs content/holanda.json
 *   node scripts/revisar.mjs content/holanda.json --arreglar
 */
import fs from "node:fs";

const [, , ruta, ...rest] = process.argv;
if (!ruta) {
  console.error("uso: node scripts/revisar.mjs content/<tema>.json [--arreglar]");
  process.exit(1);
}

const src = fs.readFileSync("scripts/guion.mjs", "utf8");
const trozo = (re) => src.match(re)[0];
const leerJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const TIPOS = eval(trozo(/const TIPOS = \[[\s\S]*?\];/).replace("const TIPOS =", ""));
const OBJETOS = eval(trozo(/const OBJETOS = \[[\s\S]*?\];/).replace("const OBJETOS =", ""));
const REGIONES = {
  europa: () => Object.keys(leerJson("src/data/europa.json")),
  norteamerica: () => Object.keys(leerJson("src/data/norteamerica.json")),
  asia: () => Object.keys(leerJson("src/data/asia.json")),
};
const ctx = [TIPOS, OBJETOS, REGIONES, leerJson];
const hacer = (re) => new Function("TIPOS", "OBJETOS", "REGIONES", "leerJson", "return " + trozo(re))(...ctx);

const revisarVisual = hacer(/function revisarVisual\(p, di\)[\s\S]*?\n}/);
const reparar = hacer(/function reparar\(doc\)[\s\S]*?\n}/);
// El suelo por tipo vive en guion.mjs y lo usa el chequeo de ritmo.
const MINIMO = new Function("return " + trozo(/const MINIMO = \{[\s\S]*?\};/).replace("const MINIMO =", "").replace(/;\s*$/, ""))();

const validar = new Function(
  "TIPOS", "OBJETOS", "REGIONES", "leerJson", "revisarVisual", "MINIMO",
  "return " + trozo(/function validar\(doc, tema\)[\s\S]*?\n}/)
)(...ctx, revisarVisual, MINIMO);

const doc = leerJson(ruta);
const planos = doc.bloques.flatMap((b) => b.planos);
const chars = planos.reduce((n, p) => n + (p.vo?.length ?? 0), 0);

if (rest.includes("--arreglar")) {
  const hechos = reparar(doc);
  if (hechos.length) {
    fs.writeFileSync(ruta, JSON.stringify(doc, null, 2));
    console.log(`${hechos.length} arreglos aplicados:`);
    for (const h of hechos) console.log("  · " + h);
    console.log("");
  }
}

const fallos = validar(doc, { slug: doc.slug });

/**
 * El recorte separa UN SUJETO del fondo. Si la busqueda describe una escena
 * -un aula vacia, una fachada, una multitud- no hay nada que recortar, falla,
 * y el plano se cae a tipografia.
 *
 * En China fallaron seis por esto: "school classroom empty desks",
 * "city hall building facade", "crowd of people walking city china".
 */
const SUJETO = new Set(["man","men","woman","women","person","people","portrait",
  "worker","workers","boy","girl","hand","hands","face","couple","family","child",
  "children","doctor","nurse","teacher","builder","engineer","shopkeeper","farmer",
  "executive","official","politician","student","customer","passenger","elderly",
  "businessman","businesswoman","accountant","researcher","analyst","editor",
  "journalist","clerk","manager","driver","retiree","pensioner","adult","crowd"]);
const tieneSujeto = (q) => q.toLowerCase().split(/[^a-z]+/).some((w) => SUJETO.has(w));
for (const p of planos) {
  for (const e of p.escenas ?? [p]) {
    const q = e.recorte?.buscar;
    if (q && !tieneSujeto(q)) {
      fallos.push(`${p.id}: el recorte busca "${q}", que es una escena y no un sujeto. Nombra a alguien o algo recortable.`);
    }
  }
}
console.log(doc.titulo);
console.log(`${planos.length} planos · ${chars.toLocaleString("es")} caracteres · unos ${(chars / 1000).toFixed(1)} min`);
console.log(`locución: unos ${Math.round(chars * 1.46).toLocaleString("es")} créditos`);

const es = planos.flatMap((p) => p.escenas ?? [p]);
const c = {};
for (const e of es) c[e.tipo] = (c[e.tipo] ?? 0) + 1;
const pc = (n) => Math.round((n / es.length) * 100);
const img = (c.clip ?? 0) + (c.recorte ?? 0) + (c.objeto ?? 0) + (c.retrato ?? 0);
console.log(`${es.length} escenas · imagen ${pc(img)} % · texto y gráficos ${pc((c.frase ?? 0) + (c.barras ?? 0) + (c.contador ?? 0) + (c.lista ?? 0))} %`);
console.log("  " + Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · "));

if (!fallos.length) {
  console.log("\nsin avisos: listo para locutar");
} else {
  console.log(`\n${fallos.length} avisos:`);
  for (const f of fallos) console.log("  · " + f);
}
