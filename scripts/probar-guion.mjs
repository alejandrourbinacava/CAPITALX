import fs from "node:fs";
const { validar } = await import("./guion.mjs");
for (const slug of ["corea", "mexico", "irlanda", "noruega"]) {
  const doc = JSON.parse(fs.readFileSync(`content/${slug}.json`, "utf8"));
  const f = validar(doc, { slug, region: null }).filter(
    (x) => !x.includes("publicacion") && !x.includes("descripción") && !x.includes("etiquetas")
  );
  console.log(`\n${slug}: ${f.length} avisos`);
  for (const x of f.slice(0, 10)) console.log("   · " + x);
}
