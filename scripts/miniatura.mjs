/**
 * Hace la miniatura de un video.
 *
 *   node scripts/miniatura.mjs revolucion-francesa
 *
 * Tres pasos:
 *   1. El encargo. Sale de `publicacion.miniatura` en el guion
 *      ({ texto, resalte, escena }). Si no esta, lo propone Claude a partir del
 *      titulo y la descripcion, y se escribe en el guion: asi repetir la
 *      ejecucion da la misma miniatura y no se paga otra imagen.
 *   2. El fondo. OpenAI dibuja la escena SIN texto (public/miniaturas/<slug>.png).
 *   3. El titular. Remotion lo pone encima con la tipografia del canal
 *      (src/scenes/Miniatura.tsx) y deja out/<slug>-miniatura.jpg, que YouTube
 *      acepta hasta 2 MB.
 *
 * Con --solo-encargo se queda en el paso 1 (sin gastar imagen ni abrir Remotion):
 * lo usa la cadena para dejar el encargo escrito en el guion antes de repartir el trabajo.
 * Deja out/<slug>-miniatura.estado.txt con "ia" (fondo de OpenAI) o "reserva":
 * con "reserva" la cadena no publica en abierto, porque una miniatura pobre
 * desperdicia justo lo que mas pesa en este canal.
 *
 * Variables: OPENAI_API_KEY (imagen), ANTHROPIC_API_KEY (solo si falta el encargo).
 * Opcionales: OPENAI_IMAGE_MODEL (por defecto gpt-image-1).
 *
 * Si no hay clave de OpenAI o la imagen falla, la miniatura sale igualmente con
 * un fondo liso o con una lamina del propio video: el texto ya vende, y una
 * miniatura mala es mejor que un video sin subir. El aviso queda en el resumen.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function loadEnv() {
  if (!fs.existsSync(".env")) return;
  for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const aviso = (t) => {
  console.log("AVISO: " + t);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `- Miniatura: ${t}\n`);
};

/* ---------------------------- 1. El encargo ---------------------------- */

const ESTILO =
  "Cinematic historical documentary thumbnail background, 16:9. " +
  "Painterly photorealism, dramatic chiaroscuro lighting, deep warm black and brown palette with golden highlights, " +
  "very high contrast, shallow depth of field, subtle film grain. " +
  "Composition: the main subject sits on the RIGHT half of the frame and is large and instantly readable; " +
  "the left 40% of the frame is darker and simple, empty space reserved for a headline. " +
  "Absolutely no text, no letters, no numbers, no captions, no logos, no watermarks, no borders, no frames.";

function recortarTexto(texto) {
  const lineas = String(texto ?? "")
    .toUpperCase()
    .split(/\n|\\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3);
  return lineas.join("\n");
}

function encargoDeEmergencia(doc) {
  const titulo = (doc.publicacion?.titulo || doc.titulo || "").replace(/\(.*\)/g, "").split(/[:?¿!¡—-]/)[0];
  const palabras = titulo.split(/\s+/).filter((p) => p.length > 2).slice(0, 4);
  const texto = palabras.length ? [palabras.slice(0, 2).join(" "), palabras.slice(2).join(" ")].filter(Boolean).join("\n") : "CAPITAL X";
  return { texto: recortarTexto(texto), resalte: "", escena: "an antique ledger and gold coins on a dark wooden table, candle light" };
}

async function pedirEncargo(doc) {
  const titulo = doc.publicacion?.titulo || doc.titulo;
  const descripcion = (doc.publicacion?.descripcion || "").slice(0, 1800);
  const sistema = [
    "Eres el director de miniaturas de Capital X, un canal de YouTube en español de documentales de historia económica para hombres de 45 años o más de toda Latinoamérica y España.",
    "Casi todas las visitas entran por la miniatura. Una buena miniatura despierta una pregunta que solo se contesta viendo el vídeo, se lee en un móvil y no repite el título.",
    "Devuelves SOLO un JSON con tres campos:",
    '  "texto": el titular de la miniatura, de 2 a 4 palabras en MAYÚSCULAS con acentos correctos, en hasta 3 líneas separadas por \\n, máximo 14 letras por línea. Nada de cifras largas. Que intrigue (una paradoja, una acusación, una pregunta implícita).',
    '  "resalte": la palabra del titular que va en amarillo (una sola, copiada exacta).',
    '  "escena": descripción EN INGLÉS de una sola imagen pictórica y cinematográfica que ilustre el tema con UN protagonista claro (una persona, un objeto o un lugar), sin texto ni letras ni cifras en la imagen, sin mencionar nombres de personas vivas. Máximo 60 palabras.',
  ].join("\n");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL_ESCENAS || "claude-sonnet-5-5",
      max_tokens: 600,
      system: sistema,
      messages: [{ role: "user", content: `Título del vídeo: ${titulo}\n\nDescripción:\n${descripcion}` }],
    }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const txt = j.content?.map((c) => c.text ?? "").join("") ?? "";
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("la respuesta no trae JSON");
  const e = JSON.parse(m[0]);
  const texto = recortarTexto(e.texto);
  if (!texto || !e.escena) throw new Error("encargo incompleto");
  return { texto, resalte: String(e.resalte ?? "").toUpperCase(), escena: String(e.escena) };
}

/* ------------------------------ 2. El fondo ----------------------------- */

async function dibujar(escena, destino) {
  const clave = process.env.OPENAI_API_KEY;
  if (!clave) throw new Error("falta OPENAI_API_KEY");
  const prompt = `${escena}\n\n${ESTILO}`;
  const modelos = [...new Set([process.env.OPENAI_IMAGE_MODEL, "gpt-image-1", "dall-e-3"].filter(Boolean))];
  let ultimo = "";

  for (const modelo of modelos) {
    const cuerpo =
      modelo === "dall-e-3"
        ? { model: modelo, prompt, size: "1792x1024", quality: "hd", n: 1, response_format: "b64_json" }
        : { model: modelo, prompt, size: "1536x1024", quality: "high", n: 1 };

    for (let intento = 1; intento <= 3; intento++) {
      const r = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      if (r.ok) {
        const j = await r.json();
        const d = j.data?.[0];
        let bytes;
        if (d?.b64_json) bytes = Buffer.from(d.b64_json, "base64");
        else if (d?.url) bytes = Buffer.from(await (await fetch(d.url)).arrayBuffer());
        if (!bytes?.length) throw new Error("OpenAI no devolvio imagen");
        fs.mkdirSync(path.dirname(destino), { recursive: true });
        fs.writeFileSync(destino, bytes);
        console.log(`fondo hecho con ${modelo} (${(bytes.length / 1024).toFixed(0)} KB)`);
        return modelo;
      }
      const txt = (await r.text()).slice(0, 400);
      ultimo = `${modelo} ${r.status}: ${txt}`;
      console.log("  " + ultimo);
      // 429 y 5xx se reintentan; el resto (verificacion de organizacion, filtro) pasa al siguiente modelo
      if (r.status === 429 || r.status >= 500) {
        await new Promise((ok) => setTimeout(ok, intento * 8000));
        continue;
      }
      if (/moderation|safety/i.test(txt) && modelo === "gpt-image-1" && cuerpo.moderation !== "low") {
        cuerpo.moderation = "low";
        continue;
      }
      break;
    }
  }
  throw new Error(ultimo || "no se pudo dibujar el fondo");
}

/** Sin OpenAI, una lamina del propio video hace de fondo. */
function fondoDeReserva(doc) {
  const dir = "public/laminas";
  if (!fs.existsSync(dir)) return "";
  const usadas = new Set();
  for (const b of doc.bloques) for (const p of b.planos) for (const e of p.escenas ?? []) if (e.tipo === "lamina" && e.lamina?.fichero) usadas.add(path.basename(e.lamina.fichero));
  for (const f of usadas) if (fs.existsSync(path.join(dir, f))) return `laminas/${f}`;
  return "";
}

/* ----------------------------- 3. El titular ---------------------------- */

function componer(slug, props, salida) {
  const propsPath = `out/miniatura-${slug}-props.json`;
  fs.mkdirSync("out", { recursive: true });
  fs.writeFileSync(propsPath, JSON.stringify(props));
  for (const calidad of [92, 82, 70, 55]) {
    const r = spawnSync(
      "npx",
      ["remotion", "still", "miniatura", salida, `--props=${propsPath}`, "--image-format=jpeg", `--jpeg-quality=${calidad}`, "--log=error"],
      { stdio: "inherit", shell: true }
    );
    if (r.status !== 0) throw new Error("Remotion no pudo componer la miniatura");
    const kb = fs.statSync(salida).size / 1024;
    console.log(`miniatura ${salida} · ${kb.toFixed(0)} KB (calidad ${calidad})`);
    if (kb < 1900) return;
  }
  throw new Error("la miniatura pesa mas de 2 MB incluso comprimida");
}

async function main() {
  loadEnv();
  const slug = process.argv[2];
  if (!slug) throw new Error("uso: node scripts/miniatura.mjs <slug>");
  const ruta = `content/${slug}.json`;
  const doc = JSON.parse(fs.readFileSync(ruta, "utf8"));
  doc.publicacion ??= {};

  // 1. el encargo
  let enc = doc.publicacion.miniatura;
  if (!enc?.texto || !enc?.escena) {
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        enc = await pedirEncargo(doc);
        console.log(`encargo propuesto: ${JSON.stringify(enc.texto)}`);
      } catch (e) {
        aviso(`no se pudo proponer el encargo con Claude (${e.message}); se usa uno de emergencia`);
      }
    }
    enc ??= encargoDeEmergencia(doc);
    doc.publicacion.miniatura = { ...enc, ...(doc.publicacion.miniatura ?? {}) };
    enc = doc.publicacion.miniatura;
    fs.writeFileSync(ruta, JSON.stringify(doc, null, 2) + "\n");
  }

  if (process.argv.includes("--solo-encargo")) {
    console.log(`encargo listo: ${JSON.stringify(enc.texto)}`);
    return;
  }

  // 2. el fondo
  const fondoRel = `miniaturas/${slug}.png`;
  const fondoAbs = `public/${fondoRel}`;
  let fondo = fondoRel;
  let estado = "ia";
  if (fs.existsSync(fondoAbs) && !process.argv.includes("--rehacer")) {
    console.log(`el fondo ya existe (${fondoAbs}); para otro, --rehacer`);
  } else {
    try {
      await dibujar(enc.escena, fondoAbs);
    } catch (e) {
      aviso(`no se pudo dibujar el fondo con OpenAI (${e.message.slice(0, 160)}). Va con un fondo de reserva`);
      fondo = fondoDeReserva(doc);
      estado = "reserva";
    }
  }

  // 3. el titular
  const salida = `out/${slug}-miniatura.jpg`;
  componer(slug, { fondo, texto: enc.texto, resalte: enc.resalte ?? "" }, salida);
  fs.writeFileSync(`out/${slug}-miniatura.estado.txt`, estado);

  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `miniatura=${salida}\n`);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
