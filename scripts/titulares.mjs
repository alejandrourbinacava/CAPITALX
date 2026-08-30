/**
 * Le pone titular a los recortes que no lo tienen.
 *
 * Un recorte sin texto al lado se ve pobre por muy bien tratado que este, y
 * los guiones escritos antes de que existiera el campo salen asi. Rehacer las
 * escenas por esto seria absurdo: son diecinueve tandas para rellenar una
 * etiqueta. Esto es UNA llamada, con un prompt de veinte lineas, y el resto
 * del guion no se toca.
 *
 *   node scripts/titulares.mjs content/diario.json
 */

import fs from "node:fs";

const API = "https://api.anthropic.com/v1/messages";
const MODELO = process.env.ANTHROPIC_MODEL_ESCENAS || "claude-sonnet-5";

function loadEnv() {
  if (!fs.existsSync(".env")) return;
  for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const SISTEMA = `Pones el texto que acompaña a un recorte de revista en un vídeo de economía en español.

Cada recorte es una figura recortada a un lado del cuadro. Al otro lado va un bloque de texto con tres partes, y tú las escribes a partir de lo que dice la voz en ese momento:

  "cifra"    opcional. Solo si en esa frase hay un número que se pueda poner grande y solo. "77.500 M$", "37,84 %", "140.000". Nunca inventes una cifra que no esté en la frase.
  "titular"  obligatorio. De dos a cinco palabras. Lo que ese recorte significa, no lo que se ve en la foto.
  "apoyo"    opcional. Una línea corta que amplíe, máximo unas quince palabras.

El titular no describe la imagen. Si la foto es un jubilado contando monedas y la voz habla del pasivo laboral, el titular es "El pasivo que no se refinancia", no "Un jubilado".

Español de España, seco, sin adjetivos de más. Las cifras en el texto van en número, que ahí se leen con los ojos.`;

async function main() {
  loadEnv();
  const ruta = process.argv[2] || "content/diario.json";
  const doc = JSON.parse(fs.readFileSync(ruta, "utf8"));

  const faltan = [];
  for (const b of doc.bloques) {
    for (const p of b.planos) {
      for (const [i, e] of (p.escenas ?? []).entries()) {
        if (e.tipo === "recorte" && e.recorte && !e.recorte.titular) {
          faltan.push({ clave: `${p.id}.${i}`, buscar: e.recorte.buscar, dice: p.vo, ref: e.recorte });
        }
      }
    }
  }

  if (!faltan.length) {
    console.log("todos los recortes tienen titular");
    return;
  }
  console.log(`${faltan.length} recortes sin titular`);

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 8000,
      system: SISTEMA,
      messages: [
        {
          role: "user",
          content: [
            "Para cada recorte, la foto que se ve y lo que dice la voz encima:",
            "",
            ...faltan.map((f) => `${f.clave}\n  foto: ${f.buscar}\n  voz: ${f.dice}`),
            "",
            'Devuelve SOLO un JSON: { "clave": { "cifra": "...", "titular": "...", "apoyo": "..." } }',
            '"cifra" y "apoyo" se omiten si no aportan.',
          ].join("\n"),
        },
      ],
    }),
  });

  const j = await res.json();
  if (j.type === "error") throw new Error(JSON.stringify(j.error));
  const texto = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const m = texto.match(/```json\s*([\s\S]*?)```/) || texto.match(/(\{[\s\S]*\})/);
  if (!m) throw new Error("no ha devuelto JSON:\n" + texto.slice(0, 400));
  const puestos = JSON.parse(m[1]);

  let n = 0;
  for (const f of faltan) {
    const t = puestos[f.clave];
    if (!t?.titular) continue;
    f.ref.titular = t.titular;
    if (t.cifra) f.ref.cifra = t.cifra;
    if (t.apoyo) f.ref.apoyo = t.apoyo;
    // Alternando el lado, dos recortes seguidos no se ven iguales.
    f.ref.lado = n % 2 ? "izq" : "der";
    n++;
  }

  fs.writeFileSync(ruta, JSON.stringify(doc, null, 2));
  const u = j.usage || {};
  console.log(`${n} titulares puestos · ${u.input_tokens ?? "?"} tokens de entrada, ${u.output_tokens ?? "?"} de salida`);
  console.log(`en ${ruta}`);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
