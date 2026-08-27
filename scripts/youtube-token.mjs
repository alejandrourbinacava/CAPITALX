/**
 * Consigue el permiso permanente para subir videos al canal. Se hace UNA VEZ.
 *
 * Este es el unico paso de todo el sistema que no puede correr en la nube:
 * Google exige que inicies sesion tu, en tu navegador, con tu cuenta. Ni yo ni
 * GitHub podemos hacerlo por ti, y es bueno que sea asi. Tarda dos minutos.
 *
 * ANTES, en https://console.cloud.google.com :
 *
 *   1. Crea un proyecto (el nombre da igual, "Capital X" vale).
 *   2. APIs y servicios > Biblioteca > busca "YouTube Data API v3" > Habilitar.
 *   3. APIs y servicios > Pantalla de consentimiento:
 *        tipo Externo, pon un nombre y tu correo, y guarda.
 *
 *      IMPORTANTE: en "Estado de publicacion", dale a PUBLICAR APLICACION.
 *      Si la dejas en "Prueba", Google caduca el permiso a los SIETE DIAS y
 *      la automatizacion se para sola el lunes siguiente sin avisar. Al
 *      publicarla saldra un aviso de "aplicacion no verificada" cuando
 *      autorices: es normal, la app es tuya y solo la usas tu. Continuas y ya.
 *
 *   4. Credenciales > Crear credenciales > ID de cliente de OAuth
 *        Tipo: Aplicacion de escritorio
 *      Copia el ID y el secreto.
 *
 * UN AVISO MAS, este no tiene arreglo desde aqui:
 *
 *   YouTube bloquea como privados los videos subidos por un proyecto de API
 *   que no haya pasado su auditoria de cumplimiento. Podras verlos y
 *   revisarlos, pero no podras hacerlos publicos hasta que la pases. Se pide
 *   con el formulario "YouTube API Services - Audit and Quota Extension".
 *
 *   Mientras tanto tienes la otra via: cada ejecucion deja el MP4 en los
 *   artefactos de GitHub. Lo descargas y lo subes desde YouTube Studio a mano,
 *   que no tiene esa limitacion. El trabajo pesado ya esta hecho igual.
 *
 * DESPUES, aqui:
 *
 *   YT_CLIENT_ID=xxx YT_CLIENT_SECRET=yyy node scripts/youtube-token.mjs
 *
 * Se abre el navegador, autorizas, y la consola imprime el refresh token.
 * Ese token no caduca mientras no lo revoques.
 */

import http from "node:http";
import { exec } from "node:child_process";

const PUERTO = 8719;
const REDIR = `http://localhost:${PUERTO}`;
const ALCANCE = "https://www.googleapis.com/auth/youtube.upload";

const id = process.env.YT_CLIENT_ID;
const secreto = process.env.YT_CLIENT_SECRET;

if (!id || !secreto) {
  console.error(
    [
      "Faltan las credenciales. Lanza asi:",
      "",
      "  YT_CLIENT_ID=xxx YT_CLIENT_SECRET=yyy node scripts/youtube-token.mjs",
      "",
      "Y si estás en PowerShell:",
      "",
      '  $env:YT_CLIENT_ID="xxx"; $env:YT_CLIENT_SECRET="yyy"; node scripts/youtube-token.mjs',
      "",
      "Las dos salen de console.cloud.google.com > Credenciales > ID de cliente",
      "de OAuth, tipo Aplicación de escritorio. La cabecera de este fichero lo",
      "explica paso a paso.",
    ].join("\n")
  );
  process.exit(1);
}

const autorizar =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: id,
    redirect_uri: REDIR,
    response_type: "code",
    scope: ALCANCE,
    access_type: "offline", // sin esto no dan refresh token
    prompt: "consent", // fuerza que lo den aunque ya hubiera uno
  });

const pagina = (titulo, cuerpo) =>
  `<!doctype html><meta charset="utf-8"><title>${titulo}</title>` +
  `<body style="font:16px/1.6 system-ui;max-width:34em;margin:16vh auto;padding:0 1.5em">` +
  `<h1 style="font-size:1.4em">${titulo}</h1>${cuerpo}</body>`;

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIR);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.end(pagina("Permiso denegado", `<p>Google dice: <code>${error}</code></p>`));
    console.error("\nHas denegado el permiso, o Google lo ha rechazado:", error);
    servidor.close();
    process.exit(1);
  }
  if (!code) return res.end(pagina("Esperando…", "<p>Vuelve a la consola.</p>"));

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: id,
      client_secret: secreto,
      redirect_uri: REDIR,
      grant_type: "authorization_code",
    }),
  });
  const j = await r.json();

  if (!j.refresh_token) {
    res.end(pagina("No ha llegado el token", `<pre>${JSON.stringify(j, null, 2)}</pre>`));
    console.error("\nGoogle no ha dado refresh token:", JSON.stringify(j, null, 2));
    console.error("\nSuele ser porque ya habías autorizado antes. Quita el acceso en");
    console.error("https://myaccount.google.com/permissions y vuelve a lanzarlo.");
    servidor.close();
    process.exit(1);
  }

  res.end(
    pagina(
      "Listo",
      "<p>Ya puedes cerrar esta pestaña. El token está en la consola.</p>"
    )
  );

  console.log("\n" + "=".repeat(64));
  console.log("Guarda estos tres en GitHub:");
  console.log("Settings > Secrets and variables > Actions > New repository secret");
  console.log("=".repeat(64));
  console.log(`\nYT_CLIENT_ID\n${id}`);
  console.log(`\nYT_CLIENT_SECRET\n${secreto}`);
  console.log(`\nYT_REFRESH_TOKEN\n${j.refresh_token}`);
  console.log("\n" + "=".repeat(64));
  console.log("El refresh token no caduca. No lo pegues en ningún chat ni lo");
  console.log("subas al repositorio: con él se puede subir vídeo a tu canal.");

  servidor.close();
  process.exit(0);
});

servidor.listen(PUERTO, () => {
  console.log("Abriendo el navegador para que autorices…");
  console.log("Si no se abre solo, entra aquí:\n");
  console.log(autorizar + "\n");
  const abrir =
    process.platform === "win32" ? "start ''" : process.platform === "darwin" ? "open" : "xdg-open";
  exec(`${abrir} "${autorizar}"`);
});
