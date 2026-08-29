/**
 * Busca y descarga los clips que pide un guion.
 *
 * El canal no es de metraje de archivo: es de datos dibujados. Los clips
 * entran para respirar entre graficos, tratados en tinta como todo lo demas,
 * y por eso se descargan en la maxima calidad que haya: lo que sobra se pierde
 * al pasarlo a blanco y negro y tramarlo.
 *
 * La eleccion se guarda en el propio guion, asi que un render posterior baja
 * exactamente el mismo clip y el video sale igual. Los ficheros no se
 * versionan: pesan demasiado y se recuperan solos.
 *
 *   node scripts/clips.mjs content/diario.json
 *   node scripts/clips.mjs content/diario.json --rebuscar   olvida lo elegido
 */

import fs from "node:fs";
import path from "node:path";

const DESTINO = "public/clips";

function loadEnv() {
  if (!fs.existsSync(".env")) return;
  for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

/**
 * Pexels. Se pide horizontal porque el lienzo es 16:9 y un vertical
 * recortado pierde justo lo que se queria ensenar.
 */
async function buscarPexels(q) {
  const url =
    "https://api.pexels.com/videos/search?" +
    new URLSearchParams({ query: q, per_page: "8", orientation: "landscape", size: "medium" });
  const r = await fetch(url, { headers: { Authorization: process.env.PEXELS_API_KEY } });
  if (!r.ok) throw new Error(`pexels ${r.status}`);
  const d = await r.json();

  return (d.videos ?? [])
    .filter((v) => v.duration >= 4)
    .map((v) => {
      const f = v.video_files
        .filter((x) => x.width && x.width <= 1920 && x.file_type === "video/mp4")
        .sort((a, b) => b.width - a.width)[0];
      if (!f) return null;
      return {
        fuente: "pexels",
        id: String(v.id),
        url: f.link,
        ancho: f.width,
        duracion: v.duration,
        autor: v.user?.name,
        pagina: v.url,
      };
    })
    .filter(Boolean);
}

async function buscarPixabay(q) {
  const url =
    "https://pixabay.com/api/videos/?" +
    new URLSearchParams({ key: process.env.PIXABAY_API_KEY, q, per_page: "8" });
  const r = await fetch(url);
  if (!r.ok) throw new Error(`pixabay ${r.status}`);
  const d = await r.json();

  return (d.hits ?? [])
    .filter((v) => v.duration >= 4)
    .map((v) => {
      const f = v.videos?.large?.url ? v.videos.large : v.videos?.medium;
      if (!f?.url) return null;
      return {
        fuente: "pixabay",
        id: String(v.id),
        url: f.url,
        ancho: f.width,
        duracion: v.duration,
        autor: v.user,
        pagina: v.pageURL,
      };
    })
    .filter(Boolean);
}

/**
 * Se prefiere el clip corto: uno de treinta segundos del que solo se ven tres
 * es metraje de relleno, y ademas son megas que no se aprovechan.
 *
 * Y no se repite ninguno. Dos busquedas parecidas devuelven el mismo primer
 * resultado, asi que sin esto sale tres veces la misma refineria en un video
 * de catorce minutos, que es peor que no poner nada.
 */
const mejor = (lista, usados) => {
  const orden = lista.sort((a, b) => Math.abs(a.duracion - 9) - Math.abs(b.duracion - 9));
  return orden.find((c) => !usados.has(`${c.fuente}-${c.id}`)) ?? null;
};

async function resolver(busqueda, usados) {
  const intentos = [];
  if (process.env.PEXELS_API_KEY) intentos.push(buscarPexels);
  if (process.env.PIXABAY_API_KEY) intentos.push(buscarPixabay);
  if (!intentos.length) throw new Error("no hay ninguna clave: falta PEXELS_API_KEY o PIXABAY_API_KEY");

  for (const buscar of intentos) {
    try {
      const r = await buscar(busqueda);
      const elegido = mejor(r, usados);
      if (elegido) return elegido;
    } catch (e) {
      console.log(`    (${e.message})`);
    }
  }
  return null;
}

async function descargar(clip) {
  const dest = path.join(DESTINO, `${clip.fuente}-${clip.id}.mp4`);
  if (fs.existsSync(dest)) return { dest, mb: fs.statSync(dest).size / 1048576, cache: true };
  const r = await fetch(clip.url);
  if (!r.ok) throw new Error(`descarga ${r.status}`);
  fs.mkdirSync(DESTINO, { recursive: true });
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return { dest, mb: buf.length / 1048576, cache: false };
}

async function main() {
  loadEnv();
  const [, , ruta = "content/diario.json", ...rest] = process.argv;
  const rebuscar = rest.includes("--rebuscar");

  const doc = JSON.parse(fs.readFileSync(ruta, "utf8"));
  const escenas = doc.bloques
    .flatMap((b) => b.planos)
    .flatMap((p) => (p.escenas ?? [p]).map((e) => ({ e, id: p.id })));
  const conClip = escenas.filter((x) => x.e.tipo === "clip" && x.e.clip?.buscar);

  if (!conClip.length) {
    console.log("este guion no pide clips");
    return;
  }
  console.log(`${conClip.length} clips que resolver`);

  let mb = 0;
  const creditos = [];
  const usados = new Set();
  // Los que ya vengan elegidos de una pasada anterior tambien cuentan.
  for (const { e } of conClip) {
    if (e.clip?.elegido) usados.add(`${e.clip.elegido.fuente}-${e.clip.elegido.id}`);
  }
  for (const { e, id } of conClip) {
    const c = e.clip;
    if (rebuscar) delete c.elegido;

    if (!c.elegido) {
      process.stdout.write(`  ${id}  "${c.buscar}" … `);
      const hallado = await resolver(c.buscar, usados);
      if (!hallado) {
        console.log("SIN RESULTADOS");
        // Sin clip no se deja un hueco negro: el plano se cae a tipografia.
        e.tipo = "frase";
        e.texto = e.texto ?? c.buscar;
        delete e.clip;
        continue;
      }
      c.elegido = hallado;
      usados.add(`${hallado.fuente}-${hallado.id}`);
      console.log(`${hallado.fuente} #${hallado.id} (${hallado.duracion}s, ${hallado.autor})`);
    }

    const { mb: peso, cache } = await descargar(c.elegido);
    c.fichero = `clips/${c.elegido.fuente}-${c.elegido.id}.mp4`;
    mb += peso;
    if (!cache) console.log(`     ${peso.toFixed(1)} MB`);
    creditos.push(`${c.elegido.autor} (${c.elegido.fuente})`);
  }

  fs.writeFileSync(ruta, JSON.stringify(doc, null, 2));

  // La atribucion no la exigen ni Pexels ni Pixabay, pero cuesta una linea y
  // es lo justo con quien puso la camara.
  const unicos = [...new Set(creditos)].sort();
  fs.writeFileSync(
    ruta.replace(/\.json$/, ".creditos.txt"),
    ["Imágenes de archivo:", ...unicos.map((c) => `· ${c}`), ""].join("\n")
  );

  console.log(`\n${mb.toFixed(0)} MB en ${DESTINO}/`);
  console.log(`${unicos.length} autores, en ${ruta.replace(/\.json$/, ".creditos.txt")}`);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
