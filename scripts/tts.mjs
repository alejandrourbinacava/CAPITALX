/**
 * Locucion para Capital X.
 *
 * Manda cada linea del guion a ai33.pro con la voz clonada, espera a que el
 * trabajo termine, descarga el mp3 y anota la duracion real de cada plano.
 * Esa duracion es la que manda despues en el montaje: los graficos se ajustan
 * a la voz, no al reves.
 *
 * Uso:  node scripts/tts.mjs content/irlanda.json [--bloque b0] [--dry]
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const BASE = process.env.AI33_BASE_URL || "https://api.ai33.pro";

function loadEnv() {
  const f = path.join(process.cwd(), ".env");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(pathname, init = {}) {
  const res = await fetch(BASE + pathname, {
    ...init,
    headers: { "xi-api-key": process.env.AI33_API_KEY, ...(init.headers || {}) },
  });
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    throw new Error(`${pathname} -> ${res.status} ${txt.slice(0, 200)}`);
  }
}

async function synth(text, voiceId) {
  const start = await api("/v3/text-to-speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      provider: "clone",
      with_transcript: true, // tiempos palabra a palabra para sincronizar
      with_loudnorm: true, // nivel homogeneo entre planos
    }),
  });
  if (!start.success) throw new Error(JSON.stringify(start));

  for (let i = 0; i < 120; i++) {
    await sleep(2500);
    const t = await api(`/v3/task/${start.task_id}`);
    const d = t.data || {};
    if (d.status === "done") return { ...d.metadata, credit_cost: d.credit_cost };
    if (d.status === "failed" || d.status === "error") throw new Error(JSON.stringify(d));
  }
  throw new Error("tiempo de espera agotado");
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "xi-api-key": process.env.AI33_API_KEY } });
  if (!res.ok) throw new Error(`descarga ${res.status}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

const durationOf = (file) =>
  parseFloat(
    execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=nw=1:nk=1", file,
    ]).toString().trim()
  );

async function main() {
  loadEnv();
  const [, , contentPath, ...rest] = process.argv;
  if (!contentPath) throw new Error("falta la ruta del guion");
  if (!process.env.AI33_API_KEY) throw new Error("falta AI33_API_KEY en .env");

  const onlyBloque = rest.includes("--bloque") ? rest[rest.indexOf("--bloque") + 1] : null;
  const dry = rest.includes("--dry");

  const doc = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  const voiceId = process.env.AI33_VOICE_ID || "clone_2333475";

  const timingsPath = contentPath.replace(/\.json$/, ".timings.json");
  const timings = fs.existsSync(timingsPath)
    ? JSON.parse(fs.readFileSync(timingsPath, "utf8"))
    : {};

  const planos = doc.bloques
    .filter((b) => !onlyBloque || b.id === onlyBloque)
    .flatMap((b) => b.planos);

  const chars = planos.reduce((n, p) => n + p.vo.length, 0);
  console.log(`${planos.length} planos · ${chars} caracteres · voz ${voiceId}`);
  if (dry) return;

  let credits = 0;
  for (const p of planos) {
    if (timings[p.id]?.audio && fs.existsSync(path.join("public", timings[p.id].audio))) {
      console.log(`= ${p.id} ya existe, se salta`);
      continue;
    }
    process.stdout.write(`· ${p.id} ... `);
    const meta = await synth(p.vo, voiceId);
    const rel = `voice/${doc.slug}-${p.id}.mp3`;
    await download(meta.audio_url, path.join("public", rel));
    fs.copyFileSync(path.join("public", rel), path.join("assets", rel));
    const dur = durationOf(path.join("public", rel));
    timings[p.id] = {
      audio: rel,
      duration: dur,
      transcript: meta.transcript ?? null,
      credit_cost: meta.credit_cost ?? null,
    };
    credits += meta.credit_cost || 0;
    console.log(`${dur.toFixed(2)} s`);
    fs.writeFileSync(timingsPath, JSON.stringify(timings, null, 2));
  }

  const total = Object.values(timings).reduce((n, t) => n + t.duration, 0);
  console.log(`\nlocucion total ${total.toFixed(1)} s · ${credits} creditos gastados`);
  console.log(`tiempos en ${timingsPath}`);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
