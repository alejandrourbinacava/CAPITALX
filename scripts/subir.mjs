/**
 * Sube el video al canal, le pone la miniatura y lo publica (o lo programa).
 *
 *   node scripts/subir.mjs out/x-master.mp4 content/x.json out/x-miniatura.jpg
 *   node scripts/subir.mjs out/x-master.mp4 content/x.json out/x-miniatura.jpg --privacidad=private
 *   node scripts/subir.mjs out/x-master.mp4 content/x.json out/x-miniatura.jpg --programar=2026-10-25T18:00:00+02:00
 *
 * Por defecto lo deja PUBLICO. Para revisarlo antes: --privacidad=private.
 * Con --programar sube en privado y YouTube lo publica solo a esa hora.
 *
 * Dos avisos que conviene saber:
 *
 *  1. YouTube deja como PRIVADOS los videos subidos por un proyecto de API que
 *     no haya pasado su auditoria, pida lo que pida este script. Si pasa, el
 *     script lo detecta y lo dice en el resumen; el video queda subido, con su
 *     miniatura, y hay que publicarlo a mano o pasar la auditoria. Ver la
 *     cabecera de scripts/youtube-token.mjs.
 *
 *  2. Nunca sube dos veces el mismo video: al terminar escribe
 *     content/<slug>.publicado.json, y si existe se niega a repetir.
 *     Para forzarlo: --forzar.
 *
 * Necesita tres secretos, que se sacan una sola vez con scripts/youtube-token.mjs:
 *   YT_CLIENT_ID  YT_CLIENT_SECRET  YT_REFRESH_TOKEN
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { descripcionFinal, etiquetasFinal, tituloFinal, capitulos, capitulosValidos } from "./lib/publicacion.mjs";

const TOKEN_URL = process.env.YT_TOKEN_URL || "https://oauth2.googleapis.com/token";
const API = process.env.YT_API_BASE || "https://www.googleapis.com";
const SUBIDA = `${API}/upload/youtube/v3/videos`;
const PORTADA = `${API}/upload/youtube/v3/thumbnails/set`;

// 27 = Educacion: es donde vive un documental de historia economica.
const CATEGORIA_POR_DEFECTO = "27";

// Multiplo de 256 KiB, que es lo que exige la subida reanudable de Google.
const TROZO = 64 * 1024 * 1024;

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function loadEnv() {
  if (!fs.existsSync(".env")) return;
  for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

/**
 * El refresh token no caduca; el de acceso dura una hora. Se canjea uno nuevo
 * al empezar y otro si la subida se alarga.
 */
export async function acceso() {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YT_CLIENT_ID,
      client_secret: process.env.YT_CLIENT_SECRET,
      refresh_token: process.env.YT_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const j = await res.json();
  if (!j.access_token) {
    throw new Error(
      [
        "Google no ha dado el token de acceso: " + JSON.stringify(j),
        "",
        "Si dice invalid_grant, el permiso se ha revocado o ha caducado.",
        "Vuelve a sacarlo con:  node scripts/youtube-token.mjs",
      ].join("\n")
    );
  }
  return j.access_token;
}

/**
 * Sube el fichero en trozos de 64 MiB y, si se corta, pregunta a Google hasta
 * donde llego y sigue desde ahi. No lee el fichero entero: un video largo pasa
 * de los 2 GiB que caben en un Buffer.
 */
export async function subirVideo(token, fichero, meta) {
  const total = fs.statSync(fichero).size;

  const abrir = await fetch(`${SUBIDA}?uploadType=resumable&part=snippet,status`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Upload-Content-Length": String(total),
      "X-Upload-Content-Type": "video/mp4",
    },
    body: JSON.stringify(meta),
  });
  if (!abrir.ok) throw new Error(`no se pudo abrir la subida: ${abrir.status} ${await abrir.text()}`);
  const destino = abrir.headers.get("location");
  if (!destino) throw new Error("Google no devolvió la URL de subida");

  const hasta = (res) => {
    const r = res.headers.get("range");
    return r ? parseInt(r.split("-")[1], 10) + 1 : 0;
  };

  const fd = fs.openSync(fichero, "r");
  try {
    let desde = 0;
    let ultimoMensaje = 0;
    while (desde < total) {
      const fin = Math.min(desde + TROZO, total) - 1;
      const trozo = Buffer.alloc(fin - desde + 1);
      fs.readSync(fd, trozo, 0, trozo.length, desde);

      let avanzo = false;
      for (let intento = 1; intento <= 6 && !avanzo; intento++) {
        let res = null;
        try {
          res = await fetch(destino, {
            method: "PUT",
            headers: { "Content-Range": `bytes ${desde}-${fin}/${total}` },
            body: trozo,
          });
        } catch (e) {
          console.log(`  corte de red (${e.cause?.code ?? e.message}), intento ${intento} de 6`);
        }

        if (res && (res.status === 200 || res.status === 201)) return res.json();
        if (res && res.status === 308) {
          desde = hasta(res);
          avanzo = true;
          break;
        }
        if (res && res.status < 500 && res.status !== 408 && res.status !== 429) {
          throw new Error(`subida rechazada: ${res.status} ${(await res.text()).slice(0, 400)}`);
        }
        if (res) console.log(`  ${res.status}, intento ${intento} de 6`);

        // preguntar cuanto ha recibido antes de reenviar
        await espera(intento * 10000);
        try {
          const donde = await fetch(destino, { method: "PUT", headers: { "Content-Range": `bytes */${total}` } });
          if (donde.status === 200 || donde.status === 201) return donde.json();
          if (donde.status === 308) {
            desde = hasta(donde);
            avanzo = true;
          }
        } catch {
          /* sigue el bucle */
        }
      }
      if (!avanzo) throw new Error("no se pudo completar la subida");

      if (Date.now() - ultimoMensaje > 30000) {
        console.log(`  ${((desde / total) * 100).toFixed(0)} % · ${(desde / 1048576).toFixed(0)} de ${(total / 1048576).toFixed(0)} MB`);
        ultimoMensaje = Date.now();
      }
    }
  } finally {
    fs.closeSync(fd);
  }
  // Se mando todo y Google no dio el recurso en el ultimo trozo: pedirlo.
  const fin = await fetch(destino, { method: "PUT", headers: { "Content-Range": `bytes */${total}` } });
  if (fin.status === 200 || fin.status === 201) return fin.json();
  throw new Error(`la subida termino sin respuesta de Google (${fin.status})`);
}

/** La miniatura necesita un canal verificado por telefono. Se reintenta y, si no, se avisa. */
export async function subirPortada(token, videoId, fichero) {
  const tipo = /\.png$/i.test(fichero) ? "image/png" : "image/jpeg";
  let ultimo = "";
  for (let intento = 1; intento <= 3; intento++) {
    const res = await fetch(`${PORTADA}?videoId=${videoId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": tipo },
      body: fs.readFileSync(fichero),
    });
    if (res.ok) return;
    ultimo = `${res.status} ${(await res.text()).slice(0, 300)}`;
    if (res.status < 500 && res.status !== 429) break;
    await espera(intento * 8000);
  }
  throw new Error(ultimo);
}

function opcion(args, nombre) {
  const a = args.find((x) => x.startsWith(`--${nombre}=`));
  return a ? a.slice(nombre.length + 3) : undefined;
}

function resumen(texto) {
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, texto + "\n");
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const [fichero, guionPath, portadaArg] = args.filter((a) => !a.startsWith("--"));
  if (!fichero || !guionPath) throw new Error("uso: node scripts/subir.mjs <video.mp4> <guion.json> [miniatura.jpg] [--privacidad=public|unlisted|private] [--programar=ISO]");

  for (const k of ["YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"]) {
    if (!process.env[k]) throw new Error(`falta ${k}. Sácalo con: node scripts/youtube-token.mjs`);
  }
  if (!fs.existsSync(fichero)) throw new Error(`no existe ${fichero}`);

  const slug = path.basename(guionPath, ".json");
  const marca = path.join(path.dirname(guionPath), `${slug}.publicado.json`);
  if (fs.existsSync(marca) && !args.includes("--forzar")) {
    const previo = JSON.parse(fs.readFileSync(marca, "utf8"));
    console.log(`${slug} ya se subió: ${previo.url}. Para repetirlo: --forzar`);
    resumen(`### ${slug}\n\nYa estaba subido: ${previo.url}`);
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `video_id=${previo.videoId}\n`);
    return;
  }

  const doc = JSON.parse(fs.readFileSync(guionPath, "utf8"));
  const tiempos = JSON.parse(fs.readFileSync(guionPath.replace(/\.json$/, ".timings.json"), "utf8"));
  const pub = doc.publicacion ?? {};
  const mb = (fs.statSync(fichero).size / 1048576).toFixed(0);

  const programar = opcion(args, "programar") ?? "";
  let privacidad = opcion(args, "privacidad") ?? "public";
  if (!["public", "unlisted", "private"].includes(privacidad)) throw new Error(`--privacidad=${privacidad} no vale: public, unlisted o private`);
  if (programar) {
    if (Number.isNaN(Date.parse(programar))) throw new Error(`--programar=${programar} no es una fecha ISO`);
    if (Date.parse(programar) < Date.now() + 5 * 60000) throw new Error("--programar tiene que estar al menos 5 minutos en el futuro");
    privacidad = "private";
  }

  const lista = capitulos(doc, tiempos);
  if (!capitulosValidos(lista)) console.log("AVISO: los capítulos no cumplen las reglas de YouTube (mínimo 3, de 10 s o más): se sube sin ellos");

  const meta = {
    snippet: {
      title: tituloFinal(doc),
      description: descripcionFinal(doc, tiempos),
      tags: etiquetasFinal(doc),
      categoryId: String(pub.categoria || CATEGORIA_POR_DEFECTO),
      defaultLanguage: "es",
      defaultAudioLanguage: "es",
    },
    status: {
      privacyStatus: privacidad,
      selfDeclaredMadeForKids: false,
      embeddable: true,
      license: "youtube",
      ...(programar ? { publishAt: new Date(programar).toISOString() } : {}),
      // Solo si el guion lo declara: etiqueta el video como contenido alterado o sintetico
      ...(pub.contenidoSintetico ? { containsSyntheticMedia: true } : {}),
    },
  };

  console.log(`subiendo ${mb} MB · ${meta.snippet.title}`);
  console.log(`  ${privacidad}${programar ? ` (se publica ${programar})` : ""} · ${meta.snippet.tags.length} etiquetas · descripción ${meta.snippet.description.length} car.`);
  let token = await acceso();
  const video = await subirVideo(token, fichero, meta);
  const real = video.status?.privacyStatus ?? "?";
  const url = `https://www.youtube.com/watch?v=${video.id}`;
  const estudio = `https://studio.youtube.com/video/${video.id}/edit`;
  console.log(`\nsubido: ${url}  (estado: ${real})`);

  // La miniatura. El token de la subida puede haber caducado si fue larga.
  let portada = "sin miniatura";
  const portadaPath = portadaArg && fs.existsSync(portadaArg) ? portadaArg : null;
  if (portadaPath) {
    try {
      token = await acceso();
      await subirPortada(token, video.id, portadaPath);
      portada = "puesta";
      console.log("miniatura puesta");
    } catch (e) {
      portada = `RECHAZADA (${e.message})`;
      console.log(`miniatura no aceptada: ${e.message}`);
    }
  }

  const bloqueado = !programar && privacidad !== "private" && real === "private";
  fs.writeFileSync(
    marca,
    JSON.stringify({ videoId: video.id, url, estudio, privacidadPedida: privacidad, privacidadReal: real, programado: programar || null, fecha: new Date().toISOString() }, null, 2) + "\n"
  );

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `video_id=${video.id}\nurl=${url}\nprivacidad_real=${real}\n`);
  }
  resumen(
    [
      `### ${meta.snippet.title}`,
      ``,
      `| | |`,
      `|---|---|`,
      `| Enlace | ${url} |`,
      `| Estudio | [abrir](${estudio}) |`,
      `| Estado | **${real}**${programar ? ` · se publica ${programar}` : ""} |`,
      `| Miniatura | ${portada} |`,
      `| Tamaño | ${mb} MB |`,
      ``,
      bloqueado
        ? [
            `> **YouTube lo ha dejado en PRIVADO** aunque se pidió ${privacidad}. Es lo que hace con los vídeos subidos por un`,
            `> proyecto de API sin auditar. El vídeo está subido y con su miniatura, pero no se puede publicar desde aquí:`,
            `> hay que pasar la auditoría de YouTube API Services (ver cabecera de \`scripts/youtube-token.mjs\`).`,
          ].join("\n")
        : "",
    ].join("\n")
  );
  if (bloqueado) console.log("\nAVISO: YouTube lo ha dejado en privado (proyecto de API sin auditar).");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error("ERROR:", e.message);
    process.exit(1);
  });
}
