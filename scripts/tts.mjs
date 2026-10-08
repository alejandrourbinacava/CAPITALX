/**
 * Locucion para Capital X.
 *
 * Manda cada linea del guion al proveedor de voz que declare, espera a que el
 * trabajo termine, descarga el mp3 y anota la duracion real de cada plano.
 * Esa duracion es la que manda despues en el montaje: los graficos se ajustan
 * a la voz, no al reves.
 *
 * Proveedores (campo `voz.proveedor` del guion):
 *   ai33      el de siempre: voz clonada, token en AI33_API_KEY (por defecto)
 *   genaipro  Labs de GenAIPro: modelos de ElevenLabs con voces de biblioteca,
 *             token en GENAIPRO_API_KEY
 *
 * Uso:  node scripts/tts.mjs content/irlanda.json [--bloque b0] [--dry]
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const BASE_AI33 = process.env.AI33_BASE_URL || "https://api.ai33.pro";
const BASE_GENAI = "https://genaipro.io/api";

function loadEnv() {
  const f = path.join(process.cwd(), ".env");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

async function download(url, dest, headers = {}) {
  const res = await fetch(url, { headers });
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

/* ------------------------------------------------------------------ */
/* ai33                                                                */
/* ------------------------------------------------------------------ */

async function apiAi33(pathname, init = {}) {
  const res = await fetch(BASE_AI33 + pathname, {
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

const ai33 = {
  nombre: "ai33",
  clave: "AI33_API_KEY",
  // Lo que se cobra por caracter, con margen: lo usa la comprobacion de saldo.
  creditosPorCaracter: 1.46,

  /**
   * ai33 solo deja pasar `speed` al motor: `emotion`, `pitch` y `vol` los
   * descarta. Asi que la variedad de entonacion se consigue con dos cosas:
   * la velocidad por plano y la puntuacion del propio texto.
   */
  async sintetizar(texto, voz, speed) {
    const start = await apiAi33("/v3/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: texto,
        voice_id: voz.id,
        provider: "clone",
        speed,
        with_transcript: true, // tiempos palabra a palabra para sincronizar
        with_loudnorm: true, // nivel homogeneo entre planos
      }),
    });
    if (!start.success) throw new Error(JSON.stringify(start));

    for (let i = 0; i < 120; i++) {
      await sleep(2500);
      const t = await apiAi33(`/v3/task/${start.task_id}`);
      const d = t.data || {};
      if (d.status === "done")
        return { url: d.metadata.audio_url, transcript: d.metadata.transcript ?? null, coste: d.credit_cost };
      if (d.status === "failed" || d.status === "error") throw new Error(JSON.stringify(d));
    }
    throw new Error("tiempo de espera agotado");
  },

  descargar: (url, dest) => download(url, dest, { "xi-api-key": process.env.AI33_API_KEY }),

  async creditos() {
    const r = await apiAi33("/v3/credits");
    return typeof r.credits === "number" ? r.credits : null;
  },

  /**
   * Comprueba que la voz existe en la cuenta antes de sintetizar nada.
   *
   * Sin esto, un identificador equivocado se descubre despues de haber gastado
   * miles de creditos con la voz que no era.
   */
  async comprobarVoz(voz) {
    const r = await apiAi33("/v3/voices?provider=clone");
    if (!r.success) throw new Error("no se pudo consultar la lista de voces: " + JSON.stringify(r));
    const v = (r.data || []).find((x) => x.voice_id === voz.id);
    if (!v) {
      const otras = (r.data || []).map((x) => `  ${x.voice_id}  ${x.name}`);
      throw new Error([`La voz ${voz.id} no esta en la cuenta.`, "Voces disponibles:", ...otras].join("\n"));
    }
    return { id: v.voice_id, name: v.name, language: v.language };
  },
};

/* ------------------------------------------------------------------ */
/* GenAIPro (Labs)                                                     */
/* ------------------------------------------------------------------ */

async function apiGenai(pathname, init = {}) {
  // Las consultas (GET) se repiten si el servidor tropieza con un 5xx o la red
  // se cae: un 502 a mitad de la locucion mato cuarenta minutos de trabajo.
  // Crear una tarea (POST) NO se repite aqui, porque podria cobrarse dos veces:
  // eso lo decide el bucle de `sintetizar`.
  const esConsulta = (init.method ?? "GET") === "GET";
  let res;
  for (let intento = 0; ; intento++) {
    try {
      res = await fetch(BASE_GENAI + pathname, {
        ...init,
        headers: {
          Authorization: `Bearer ${process.env.GENAIPRO_API_KEY}`,
          "Content-Type": "application/json",
          ...(init.headers || {}),
        },
      });
      if (!esConsulta || res.status < 500 || intento >= 7) break;
    } catch (e) {
      if (!esConsulta || intento >= 7) throw e;
    }
    await sleep(Math.min(30000, 2000 * (intento + 1)));
  }
  const txt = await res.text();
  let j;
  try {
    j = JSON.parse(txt);
  } catch {
    throw new Error(`${pathname} -> ${res.status} ${txt.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(`${pathname} -> ${res.status} ${txt.slice(0, 200)}`);
  return j;
}

/** Pasa un mp3 por loudnorm para que todos los planos suenen al mismo nivel. */
function normalizar(file) {
  const tmp = file.replace(/\.mp3$/, ".norm.mp3");
  try {
    execFileSync(
      "ffmpeg",
      ["-y", "-v", "error", "-i", file, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "192k", tmp],
      { stdio: "pipe" }
    );
    fs.renameSync(tmp, file);
  } catch (e) {
    fs.rmSync(tmp, { force: true });
    console.warn(`(sin normalizar: ${String(e.message).split("\n")[0]})`);
  }
}

const genaipro = {
  nombre: "GenAIPro",
  clave: "GENAIPRO_API_KEY",
  // Labs cobra un credito por caracter.
  creditosPorCaracter: 1,

  /**
   * La velocidad del plano se multiplica por la velocidad base de la voz
   * (`voz.velocidad`): el guion varia entre 0,92 y 1,06 para que la locucion
   * no suene monotona y la voz fija su ritmo general. Labs admite 0,7 a 1,2.
   */
  async sintetizar(texto, voz, speed) {
    // Alguna tarea se queda en "processing" para siempre en el servidor (paso
    // en el plano 6 de 142). Esperar mas no sirve: se pide una nueva. Las que
    // fallan se reembolsan solas; una atascada puede costar un plano.
    let ultimo = "";
    for (let intento = 0; intento < 3; intento++) {
      const { task_id } = await apiGenai("/v1/labs/task", {
        method: "POST",
        body: JSON.stringify({
          input: texto,
          voice_id: voz.id,
          model_id: voz.modelo ?? "eleven_multilingual_v2",
          stability: voz.estabilidad ?? 0.5,
          similarity: voz.similitud ?? 0.75,
          style: voz.estilo ?? 0,
          speed: clamp(speed * (voz.velocidad ?? 1), 0.7, 1.2),
          use_speaker_boost: voz.speakerBoost ?? true,
        }),
      });

      for (let i = 0; i < 72; i++) {
        await sleep(2500);
        const t = await apiGenai(`/v1/labs/task/${task_id}`);
        if (t.status === "completed" && t.result) return { url: t.result, transcript: null, coste: texto.length };
        if (t.status === "failed" || t.status === "error") {
          ultimo = JSON.stringify(t).slice(0, 300);
          break;
        }
        ultimo = "tiempo de espera agotado";
      }
      process.stdout.write(`(reintento ${intento + 1}: ${ultimo}) `);
    }
    throw new Error(ultimo || "no se pudo sintetizar");
  },

  async descargar(url, dest) {
    await download(url, dest);
    normalizar(dest);
  },

  /** Suma de los lotes de creditos que no han caducado. */
  async creditos() {
    const r = await apiGenai("/v1/labs/credits");
    if (!Array.isArray(r)) return null;
    const ahora = Date.now();
    return r.filter((x) => new Date(x.expire_at).getTime() > ahora).reduce((n, x) => n + (x.amount || 0), 0);
  },

  async comprobarVoz(voz) {
    const lista = await apiGenai(`/v1/labs/voices?search=${encodeURIComponent(voz.id)}&page_size=10`);
    const v = (Array.isArray(lista) ? lista : []).find((x) => x.voice_id === voz.id);
    if (!v) throw new Error(`La voz ${voz.id} no esta en el catalogo de GenAIPro Labs.`);
    return { id: v.voice_id, name: v.name, language: v.language };
  },
};

const PROVEEDORES = { ai33, genaipro };

async function main() {
  loadEnv();
  const [, , contentPath, ...rest] = process.argv;
  if (!contentPath) throw new Error("falta la ruta del guion");

  const onlyBloque = rest.includes("--bloque") ? rest[rest.indexOf("--bloque") + 1] : null;
  const dry = rest.includes("--dry");

  const doc = JSON.parse(fs.readFileSync(contentPath, "utf8"));

  const prov = PROVEEDORES[doc.voz?.proveedor ?? "ai33"];
  if (!prov) throw new Error(`proveedor de voz desconocido: ${doc.voz?.proveedor}`);
  if (!process.env[prov.clave]) throw new Error(`falta ${prov.clave} (en .env o como secreto)`);

  // La voz la declara el guion. La variable de entorno solo sirve para
  // probar otra de ai33 sin tocar el fichero.
  const voiceId = (prov === ai33 && process.env.AI33_VOICE_ID) || doc.voz?.id;
  if (!voiceId) {
    throw new Error(
      [
        `${contentPath} no declara la voz.`,
        `Anade:  "voz": { "proveedor": "genaipro", "id": "XXXXXXXX", "nombre": "..." }`,
      ].join("\n")
    );
  }
  const voz = { ...doc.voz, id: voiceId };
  const real = await prov.comprobarVoz(voz);

  // Si el guion anota el nombre, se avisa cuando no cuadra: puede ser que la
  // voz se haya renombrado, o que se haya copiado el identificador de otra.
  if (doc.voz?.nombre && real.name.toUpperCase() !== doc.voz.nombre.toUpperCase()) {
    console.warn(`AVISO: el guion esperaba "${doc.voz.nombre}" y la cuenta dice "${real.name}"`);
  }

  const timingsPath = contentPath.replace(/\.json$/, ".timings.json");
  const timings = fs.existsSync(timingsPath)
    ? JSON.parse(fs.readFileSync(timingsPath, "utf8"))
    : {};

  const planos = doc.bloques
    .filter((b) => !onlyBloque || b.id === onlyBloque)
    .flatMap((b) => b.planos);

  const chars = planos.reduce((n, p) => n + p.vo.length, 0);
  console.log(`${planos.length} planos · ${chars} caracteres`);
  console.log(`voz: ${real.name} (${real.id}) · ${real.language ?? "?"} · ${prov.nombre}`);

  // Lo que falta por locutar, no el guion entero: si ya hay audio de la mitad
  // de los planos, solo se paga el resto.
  const faltan = planos.filter(
    (p) => !(timings[p.id]?.audio && fs.existsSync(path.join("public", timings[p.id].audio)))
  );
  const necesita = Math.round(faltan.reduce((n, p) => n + p.vo.length, 0) * prov.creditosPorCaracter);

  // Sin esto, quedarse sin saldo a mitad de locucion mata el trabajo despues de
  // haber pagado media: paso con el Miercoles Negro, que murio en el plano que
  // cruzo el cero. Consultarlo antes es gratis.
  const saldo = await prov.creditos();
  console.log(
    `quedan ${faltan.length} planos por locutar · hacen falta unos ${necesita} creditos` +
      (saldo === null ? "" : ` · en la cuenta hay ${saldo}`)
  );
  if (saldo !== null && necesita > saldo) {
    throw new Error(
      [
        `Saldo insuficiente en ${prov.nombre}.`,
        `  hacen falta:  ${necesita} creditos`,
        `  disponibles:  ${saldo}`,
        `  faltan:       ${necesita - saldo}`,
        ``,
        `No se ha sintetizado nada. Recarga la cuenta y vuelve a lanzar:`,
        `el script salta los planos que ya tengan audio, asi que no se paga`,
        `dos veces por lo mismo.`,
      ].join("\n")
    );
  }
  if (dry) return;

  let credits = 0;
  for (const p of planos) {
    if (timings[p.id]?.audio && fs.existsSync(path.join("public", timings[p.id].audio))) {
      console.log(`= ${p.id} ya existe, se salta`);
      continue;
    }
    const speed = p.voz?.speed ?? 1;
    process.stdout.write(`· ${p.id} (x${speed}) ... `);
    const meta = await prov.sintetizar(p.vo, voz, speed);
    const rel = `voice/${doc.slug}-${p.id}.mp3`;
    await prov.descargar(meta.url, path.join("public", rel));
    fs.copyFileSync(path.join("public", rel), path.join("assets", rel));
    const dur = durationOf(path.join("public", rel));
    timings[p.id] = {
      audio: rel,
      duration: dur,
      transcript: meta.transcript ?? null,
      credit_cost: meta.coste ?? null,
    };
    credits += meta.coste || 0;
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
