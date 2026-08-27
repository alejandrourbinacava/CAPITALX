/**
 * Sube el video al canal en PRIVADO.
 *
 * Privado, no publico: el video aparece en tu YouTube Studio como si fuera un
 * borrador, solo lo ves tu, y se publica con un clic cuando lo has revisado.
 * Nada de lo que hace este script llega al publico por si solo.
 *
 * Necesita tres secretos, que se sacan una sola vez con scripts/youtube-token.mjs:
 *   YT_CLIENT_ID  YT_CLIENT_SECRET  YT_REFRESH_TOKEN
 *
 *   node scripts/subir.mjs out/diario-master.mp4 content/diario.json
 */

import fs from "node:fs";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SUBIDA = "https://www.googleapis.com/upload/youtube/v3/videos";
const PORTADA = "https://www.googleapis.com/upload/youtube/v3/thumbnails/set";

// 25 = Noticias y política. Es donde vive este tipo de vídeo.
const CATEGORIA = "25";

function loadEnv() {
  if (!fs.existsSync(".env")) return;
  for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

/**
 * El refresh token no caduca; el de acceso dura una hora. Se canjea uno nuevo
 * en cada ejecucion.
 */
async function acceso() {
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

/** Sube el fichero en trozos, y si se corta reanuda por donde iba. */
async function subirVideo(token, fichero, meta) {
  const bytes = fs.readFileSync(fichero);
  const total = bytes.length;

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

  let desde = 0;
  for (let intento = 1; intento <= 5; intento++) {
    const res = await fetch(destino, {
      method: "PUT",
      headers: {
        "Content-Length": String(total - desde),
        "Content-Range": `bytes ${desde}-${total - 1}/${total}`,
      },
      body: bytes.subarray(desde),
    });

    if (res.status === 200 || res.status === 201) return res.json();

    // 308 = va bien pero falta; el header dice hasta donde ha llegado
    if (res.status === 308) {
      const rango = res.headers.get("range");
      desde = rango ? parseInt(rango.split("-")[1], 10) + 1 : desde;
      console.log(`  reanudando desde ${(desde / 1048576).toFixed(0)} MB`);
      continue;
    }

    const cuerpo = await res.text();
    if (res.status < 500) throw new Error(`subida rechazada: ${res.status} ${cuerpo}`);
    console.log(`  ${res.status}, reintento ${intento} de 5`);
    await new Promise((r) => setTimeout(r, intento * 15000));

    // preguntar cuanto ha recibido antes de reenviar
    const donde = await fetch(destino, {
      method: "PUT",
      headers: { "Content-Length": "0", "Content-Range": `bytes */${total}` },
    });
    if (donde.status === 200 || donde.status === 201) return donde.json();
    const rango = donde.headers.get("range");
    desde = rango ? parseInt(rango.split("-")[1], 10) + 1 : 0;
  }
  throw new Error("no se pudo completar la subida");
}

/** La portada es opcional: si el canal no está verificado, Google la rechaza. */
async function subirPortada(token, videoId, fichero) {
  const res = await fetch(`${PORTADA}?videoId=${videoId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/png" },
    body: fs.readFileSync(fichero),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
}

async function main() {
  loadEnv();
  const [, , fichero, guionPath, portadaPath] = process.argv;
  if (!fichero || !guionPath) throw new Error("uso: node scripts/subir.mjs <video.mp4> <guion.json> [portada.png]");

  for (const k of ["YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"]) {
    if (!process.env[k]) throw new Error(`falta ${k}. Sácalo con: node scripts/youtube-token.mjs`);
  }
  if (!fs.existsSync(fichero)) throw new Error(`no existe ${fichero}`);

  const doc = JSON.parse(fs.readFileSync(guionPath, "utf8"));
  const pub = doc.publicacion ?? {};
  const mb = (fs.statSync(fichero).size / 1048576).toFixed(0);

  const meta = {
    snippet: {
      title: (pub.titulo || doc.titulo).slice(0, 100),
      description: pub.descripcion || "",
      tags: pub.etiquetas || [],
      categoryId: CATEGORIA,
      defaultLanguage: "es",
      defaultAudioLanguage: "es",
    },
    status: {
      privacyStatus: "private",
      selfDeclaredMadeForKids: false,
      embeddable: true,
      license: "youtube",
    },
  };

  console.log(`subiendo ${mb} MB · ${meta.snippet.title}`);
  const token = await acceso();
  const video = await subirVideo(token, fichero, meta);

  console.log(`\nsubido en privado`);
  console.log(`https://studio.youtube.com/video/${video.id}/edit`);

  if (portadaPath && fs.existsSync(portadaPath)) {
    try {
      await subirPortada(token, video.id, portadaPath);
      console.log("portada puesta");
    } catch (e) {
      // Requiere canal verificado por teléfono. No es motivo para tumbar el flujo.
      console.log(`portada no aceptada (${e.message}). La pones tú desde Studio.`);
    }
  }

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `video_id=${video.id}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      [
        `### ${meta.snippet.title}`,
        ``,
        `Subido **en privado**, ${mb} MB.`,
        ``,
        `[Abrir en YouTube Studio](https://studio.youtube.com/video/${video.id}/edit)`,
        ``,
      ].join("\n")
    );
  }
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
