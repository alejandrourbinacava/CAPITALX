/**
 * Metraje de archivo de archive.org (noticiarios, peliculas oficiales, Prelinger).
 *
 * Los clips de Pexels y Pixabay son stock moderno: sirven para un video de
 * economia de hoy, pero en uno de historia ponen una refineria de 2020 donde
 * deberia haber una fabrica de 1900. Archive.org tiene la imagen real.
 *
 * Solo se acepta lo que lleva licencia de dominio publico o CC0 en el campo
 * `licenseurl`. Muchas peliculas no lo traen y se descartan: es preferible
 * perder un candidato a publicar algo con derechos.
 *
 * No se descargan las peliculas: son de cientos de megas. ffmpeg lee el mp4
 * remoto con peticiones por rango y se trae solo el tramo que se va a usar.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const UA = "CapitalX/1.0 (https://github.com/alejandrourbinacava/CAPITALX)";
const LIBRE = /publicdomain|\/zero\//i;
const TRAMO = 12;

async function json(url, intentos = 5) {
  let r;
  for (let i = 0; i < intentos; i++) {
    r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status !== 429 && r.status < 500) break;
    await new Promise((ok) => setTimeout(ok, 2000 * 2 ** i));
  }
  if (!r.ok) throw new Error(`archive.org ${r.status}`);
  return r.json();
}

/** "1h02m03s", "12:03" o segundos -> segundos. */
const segundos = (v) => {
  if (v == null) return 0;
  const s = String(v);
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  return s.split(":").reduce((a, x) => a * 60 + Number(x), 0);
};

export async function buscarArchive(q, { max = 8 } = {}) {
  const consulta = `(${q}) AND mediatype:movies AND (licenseurl:*publicdomain* OR licenseurl:*zero*)`;
  const url =
    "https://archive.org/advancedsearch.php?" +
    new URLSearchParams({ q: consulta, rows: String(max), output: "json", sort: "downloads desc" }) +
    ["identifier", "title", "licenseurl", "year", "creator"].map((f) => `&fl[]=${f}`).join("");
  const d = await json(url);
  const salida = [];
  for (const it of d.response?.docs ?? []) {
    if (!LIBRE.test(it.licenseurl ?? "")) continue;
    let meta;
    try {
      meta = await json(`https://archive.org/metadata/${it.identifier}`);
    } catch {
      continue;
    }
    const mp4 = (meta.files ?? [])
      .filter((f) => /\.mp4$/i.test(f.name) && !/_ia\.mp4$|thumb/i.test(f.name))
      .sort((a, b) => Number(b.size ?? 0) - Number(a.size ?? 0));
    // El mas pesado es el original; basta el derivado h.264 de tamano medio.
    const f = mp4.find((x) => /h\.?264|mpeg4/i.test(x.format ?? "")) ?? mp4[0];
    if (!f) continue;
    const duracion = segundos(f.length ?? meta.metadata?.runtime);
    if (duracion < TRAMO + 2) continue;
    salida.push({
      fuente: "archive",
      id: it.identifier,
      url: `https://archive.org/download/${it.identifier}/${encodeURIComponent(f.name)}`,
      archivo: f.name,
      duracion,
      ancho: Number(f.width ?? 0),
      titulo: it.title,
      autor: Array.isArray(it.creator) ? it.creator[0] : it.creator,
      anio: it.year,
      licencia: it.licenseurl,
      pagina: `https://archive.org/details/${it.identifier}`,
    });
  }
  return salida;
}

/**
 * Corta un tramo del mp4 remoto y lo guarda ya listo para el video:
 * hasta 1280 de ancho (sin ampliar), sin audio (lleva la locucion), h264.
 * `inicio` en segundos; por defecto el 30 % del metraje, que suele saltarse
 * los titulos y cartones del principio.
 */
export function descargarArchive(clip, destino, inicio) {
  if (fs.existsSync(destino)) return { dest: destino, mb: fs.statSync(destino).size / 1048576, cache: true };
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const ss = inicio ?? Math.max(0, Math.min(clip.duracion * 0.3, clip.duracion - TRAMO - 1));
  const r = spawnSync(
    "ffmpeg",
    [
      "-y", "-v", "error", "-ss", String(ss), "-i", clip.url, "-t", String(TRAMO),
      "-an", "-vf", "scale=min(1280,iw):-2", "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      destino,
    ],
    { encoding: "utf8", timeout: 240000 }
  );
  if (r.status !== 0 || !fs.existsSync(destino)) throw new Error(`ffmpeg: ${(r.stderr ?? "").slice(0, 200)}`);
  return { dest: destino, mb: fs.statSync(destino).size / 1048576, cache: false };
}
