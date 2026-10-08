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
import { spawnSync } from "node:child_process";

const DESTINO = "public/clips";
const DESTINO_PNG = "public/recortes-auto";
const DESTINO_LAMINAS = "public/laminas";

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

/**
 * Fotos, para los recortes de revista.
 *
 * Se pide vertical o cuadrada: lo que se busca es un sujeto que se pueda
 * recortar del fondo, no un paisaje. Un panoramico deja un recorte diminuto
 * en medio del cuadro.
 */
async function buscarFotoPexels(q) {
  const url =
    "https://api.pexels.com/v1/search?" +
    new URLSearchParams({ query: q, per_page: "10", orientation: "portrait" });
  const r = await fetch(url, { headers: { Authorization: process.env.PEXELS_API_KEY } });
  if (!r.ok) throw new Error(`pexels fotos ${r.status}`);
  const d = await r.json();
  return (d.photos ?? []).map((f) => ({
    fuente: "pexels",
    id: String(f.id),
    url: f.src?.large2x || f.src?.large,
    autor: f.photographer,
    pagina: f.url,
  }));
}

async function buscarFotoPixabay(q) {
  const url =
    "https://pixabay.com/api/?" +
    new URLSearchParams({
      key: process.env.PIXABAY_API_KEY,
      q,
      per_page: "10",
      image_type: "photo",
      orientation: "vertical",
    });
  const r = await fetch(url);
  if (!r.ok) throw new Error(`pixabay fotos ${r.status}`);
  const d = await r.json();
  return (d.hits ?? []).map((f) => ({
    fuente: "pixabay",
    id: String(f.id),
    url: f.largeImageURL,
    autor: f.user,
    pagina: f.pageURL,
  }));
}

/**
 * Baja la foto y la pasa por el mismo tratamiento que las personas reales:
 * recortada del fondo, en tinta, con el borde grueso de color y la sombra
 * desplazada. Si el recorte sale sin sujeto claro, se descarta y se prueba
 * con la siguiente: un recorte malo canta mas que no ponerlo.
 */
async function recortar(foto, tono) {
  fs.mkdirSync(DESTINO_PNG, { recursive: true });
  const bruto = path.join(DESTINO_PNG, `.${foto.fuente}-${foto.id}.src`);
  const png = path.join(DESTINO_PNG, `${foto.fuente}-${foto.id}.png`);
  if (fs.existsSync(png)) return png;

  const r = await fetch(foto.url);
  if (!r.ok) throw new Error(`descarga ${r.status}`);
  fs.writeFileSync(bruto, Buffer.from(await r.arrayBuffer()));

  const py = spawnSync(
    process.env.PYTHON || "python",
    [
      "scripts/recortes.py",
      "--entrada", bruto,
      "--salida", png,
      "--tono", tono ?? "ocre",
      "--ajustar",
    ],
    { encoding: "utf8" }
  );
  fs.rmSync(bruto, { force: true });

  if (py.status !== 0) {
    fs.rmSync(png, { force: true });
    throw new Error(`recorte descartado (${(py.stdout || py.stderr || "").trim().slice(0, 80)})`);
  }
  return png;
}


/**
 * Laminas de archivo, de Wikimedia Commons.
 *
 * Para los videos de historia no hay metraje de stock que sirva: nadie filmo
 * el puerto de Londres en 1780. Lo que si hay son miles de cuadros, grabados y
 * mapas de epoca, y los de dominio publico se pueden usar sin pedir permiso ni
 * poner atribucion. Se filtra por licencia a proposito: "Public domain" o CC0
 * y nada mas. Una CC BY-SA obliga a citar y a compartir igual, y un video
 * automatico no es sitio para andar comprobando eso.
 *
 * La API pide un User-Agent con contacto; sin el, rechaza.
 */
/**
 * fetch con paciencia. Commons y su servidor de miniaturas devuelven 429 cuando
 * se les pide mucho seguido, y 503 cuando estan saturados; en los dos casos
 * basta con esperar. Sin esto, una imagen buena se perdia por una racha de
 * peticiones y el plano acababa en una pantalla de texto.
 */
async function pedir(url, opciones = {}, intentos = 7) {
  let r;
  for (let i = 0; i < intentos; i++) {
    r = await fetch(url, opciones);
    if (r.status !== 429 && r.status < 500) return r;
    const aviso = Number(r.headers.get("retry-after"));
    const espera = Number.isFinite(aviso) && aviso > 0 ? aviso * 1000 : Math.min(60000, 2000 * 2 ** i);
    await new Promise((ok) => setTimeout(ok, espera));
  }
  return r;
}

const UA = "CapitalX/1.0 (https://github.com/alejandrourbinacava/CAPITALX; contacto en el repositorio)";
const LICENCIA_LIBRE = /public domain|^pd\b|^pd-|cc0|cc zero|no restrictions/i;
const sinHtml = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Palabras que describen el soporte o la epoca, no el asunto: no cuentan para
// decidir si una imagen habla de lo que se busca.
const SOPORTE =
  /^(painting|paintings|engraving|engravings|print|prints|lithograph|lithographs|drawing|illustration|map|maps|portrait|photograph|photo|poster|cartoon|caricature|print|century|early|late|the|of|and|in|a|at|on|to|from|with|by|for|1[0-9]{3}s?|20[0-9]{2}s?|[0-9]+(st|nd|rd|th))$/i;
const raiz = (w) => w.toLowerCase().slice(0, 5);

function terminos(q) {
  return q.split(/\s+/).filter((w) => w && !SOPORTE.test(w));
}

/**
 * Una imagen sirve si habla de lo que se busca y es de otra epoca.
 *
 * Commons busca "aproximado": "bank of england threadneedle street painting"
 * devuelve una fachada fotografiada en 2012, y "parliament 1833 engraving" una
 * foto de un poeta australiano. Se exige que la mitad de los terminos del
 * asunto aparezcan en el titulo, la descripcion o las categorias, y que la
 * imagen tenga pinta de antigua: un anio anterior a 1976 o una palabra de
 * soporte (pintura, grabado, mapa...).
 */
function puntuar(q, pg, m) {
  const pajar = [
    pg.title,
    sinHtml(m.ImageDescription?.value),
    sinHtml(m.ObjectName?.value),
    sinHtml(m.Categories?.value).replace(/\|/g, " "),
  ]
    .join(" ")
    .toLowerCase();
  const ts = terminos(q);
  if (!ts.length) return { ok: false, score: 0 };
  const hits = ts.filter((t) => pajar.includes(raiz(t))).length;
  const score = hits / ts.length;

  const fecha = `${sinHtml(m.DateTimeOriginal?.value)} ${pg.title} ${sinHtml(m.ImageDescription?.value)}`;
  const anios = [...fecha.matchAll(/\b(1[4-9]\d\d)\b/g)].map((x) => +x[1]);
  const antigua =
    anios.some((a) => a <= 1975) ||
    /painting|engraving|lithograph|print|drawing|illustration|map of|portrait|caricature|oil on|watercolou?r|woodcut|etching/i.test(
      pajar
    );
  // Si se pide un anio ("hambruna 1770"), lo que salga no puede ser de otro
  // siglo: una foto de la hambruna de 1943 tiene los mismos terminos y esta
  // mal. Con un anio de por medio y ninguno cercano, se descarta.
  const pedido = [...q.matchAll(/\b(1[4-9]\d\d)\b/g)].map((x) => +x[1]);
  const coincide = !pedido.length || !anios.length || anios.some((a) => pedido.some((y) => Math.abs(a - y) <= 45));
  return { ok: antigua && coincide && score >= 0.6, score };
}

/**
 * Una imagen concreta, por su nombre en Commons ("File:Nombre.jpg").
 *
 * La busqueda acierta dos de cada tres veces. Para el resto se mira la hoja de
 * contactos, se encuentra a mano la imagen buena y se fija aqui, para que el
 * render siempre saque la misma.
 */
async function cargarCommons(titulo) {
  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      titles: titulo,
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: "1920",
    });
  const r = await pedir(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`commons ${r.status}`);
  const d = await r.json();
  const pg = Object.values(d.query?.pages ?? {})[0];
  const ii = pg?.imageinfo?.[0];
  if (!ii) return [];
  const m = ii.extmetadata ?? {};
  if (!LICENCIA_LIBRE.test(sinHtml(m.LicenseShortName?.value))) {
    console.log(`(${titulo}: licencia "${sinHtml(m.LicenseShortName?.value)}", no es libre)`);
    return [];
  }
  return [
    {
      fuente: "commons",
      id: String(pg.pageid),
      url: ii.thumburl || ii.url,
      ancho: ii.thumbwidth ?? ii.width,
      alto: ii.thumbheight ?? ii.height,
      autor: sinHtml(m.Artist?.value).slice(0, 60) || "desconocido",
      titulo: pg.title.replace(/^File:/, ""),
      pagina: ii.descriptionurl,
    },
  ];
}

async function buscarCommons(q) {
  if (/^File:/i.test(q)) return cargarCommons(q);
  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      generator: "search",
      gsrsearch: `${terminos(q).join(" ")} filetype:bitmap haslicense:unrestricted`,
      gsrnamespace: "6",
      gsrlimit: "30",
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: "1920",
    });
  const r = await pedir(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`commons ${r.status}`);
  const d = await r.json();

  return Object.values(d.query?.pages ?? {})
    .map((pg) => {
      const ii = pg.imageinfo?.[0];
      if (!ii || !/^image\/(jpeg|png)$/.test(ii.mime ?? "")) return null;
      if (ii.width < 1100) return null;
      const m = ii.extmetadata ?? {};
      if (!LICENCIA_LIBRE.test(sinHtml(m.LicenseShortName?.value))) return null;
      // Derechos de la personalidad, marcas y similares: se salta.
      if (sinHtml(m.Restrictions?.value)) return null;
      const { ok, score } = puntuar(q, pg, m);
      if (!ok) return null;
      const ancho = ii.thumbwidth ?? ii.width;
      const alto = ii.thumbheight ?? ii.height;
      return {
        fuente: "commons",
        id: String(pg.pageid),
        url: ii.thumburl || ii.url,
        ancho,
        alto,
        autor: sinHtml(m.Artist?.value).slice(0, 60) || "desconocido",
        titulo: pg.title.replace(/^File:/, ""),
        pagina: ii.descriptionurl,
        orden: pg.index ?? 99,
        score,
      };
    })
    .filter(Boolean)
    // Primero lo que mas se parece a lo pedido. A igualdad, la relevancia de
    // Commons; y un retrato vertical dentro de un 16:9 es un cuadro pequeno
    // entre dos franjas desenfocadas: baja seis puestos.
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.orden + (a.ancho / a.alto < 1.3 ? 6 : 0) - (b.orden + (b.ancho / b.alto < 1.3 ? 6 : 0))
    );
}

async function descargarLamina(l) {
  const dest = path.join(DESTINO_LAMINAS, `${l.fuente}-${l.id}.jpg`);
  if (fs.existsSync(dest)) return { dest, mb: fs.statSync(dest).size / 1048576, cache: true };
  const r = await pedir(l.url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`descarga ${r.status}`);
  fs.mkdirSync(DESTINO_LAMINAS, { recursive: true });
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return { dest, mb: buf.length / 1048576, cache: false };
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

/**
 * Texto de repuesto cuando no hay imagen que pintar.
 *
 * Antes se caia a `c.buscar`, y el termino de busqueda en ingles acababa
 * escrito a pantalla completa: en el video de China salio "school classroom
 * empty desks". Aqui se coge lo que ya estaba redactado en castellano para
 * ese plano, y si no hay nada se devuelve null: la escena se queda sin
 * pintar y `repartir` reparte su tiempo entre las demas.
 */
const textoDeRepuesto = (e) => {
  const r = e.recorte ?? {};
  return e.texto ?? e.rotulo?.texto ?? r.titular ?? r.apoyo ?? null;
};

async function main() {
  loadEnv();
  const [, , ruta = "content/diario.json", ...rest] = process.argv;
  const rebuscar = rest.includes("--rebuscar");

  const doc = JSON.parse(fs.readFileSync(ruta, "utf8"));
  const escenas = doc.bloques
    .flatMap((b) => b.planos)
    .flatMap((p) => (p.escenas ?? [p]).map((e) => ({ e, id: p.id })));
  const conClip = escenas.filter((x) => x.e.tipo === "clip" && x.e.clip?.buscar);
  const conRecorte = escenas.filter((x) => x.e.tipo === "recorte" && x.e.recorte?.buscar);
  const conLamina = escenas.filter((x) => x.e.tipo === "lamina" && x.e.lamina?.buscar);

  if (!conClip.length && !conRecorte.length && !conLamina.length) {
    console.log("este guion no pide ni clips ni recortes ni laminas");
    return;
  }
  console.log(
    `${conClip.length} clips, ${conRecorte.length} recortes y ${conLamina.length} laminas que resolver`
  );

  let mb = 0;
  const creditos = [];
  const usados = new Set();
  // Los que ya vengan elegidos de una pasada anterior tambien cuentan.
  for (const { e } of [...conClip, ...conRecorte, ...conLamina]) {
    const el = e.clip?.elegido ?? e.recorte?.elegido ?? e.lamina?.elegido;
    if (el) usados.add(`${el.fuente}-${el.id}`);
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
        e.texto = textoDeRepuesto(e);
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

  // ---- recortes de revista ----
  for (const { e, id } of conRecorte) {
    const c = e.recorte;
    if (rebuscar) delete c.elegido;

    if (c.elegido && c.fichero && fs.existsSync(path.join("public", c.fichero))) continue;

    process.stdout.write(`  ${id}  recorte "${c.buscar}" … `);
    let candidatos = [];
    for (const buscar of [buscarFotoPexels, buscarFotoPixabay]) {
      try {
        candidatos = candidatos.concat(await buscar(c.buscar));
      } catch (err) {
        console.log(`(${err.message})`);
      }
    }
    candidatos = candidatos.filter((f) => f.url && !usados.has(`${f.fuente}-${f.id}`));

    let hecho = null;
    // Se prueban hasta cuatro: el recorte falla a menudo, porque no toda foto
    // tiene un sujeto que se pueda separar del fondo.
    for (const f of candidatos.slice(0, 7)) {
      try {
        const png = await recortar(f, c.tono);
        hecho = { foto: f, png };
        break;
      } catch (err) {
        process.stdout.write(".");
      }
    }

    if (!hecho) {
      console.log(" ninguno recortable, se queda en tipografía");
      e.tipo = "frase";
      e.texto = textoDeRepuesto(e);
      delete e.recorte;
      continue;
    }

    c.elegido = hecho.foto;
    c.fichero = path.relative("public", hecho.png).split(path.sep).join("/");
    usados.add(`${hecho.foto.fuente}-${hecho.foto.id}`);
    creditos.push(`${hecho.foto.autor} (${hecho.foto.fuente})`);
    mb += fs.statSync(hecho.png).size / 1048576;
    console.log(` ${hecho.foto.fuente} #${hecho.foto.id} (${hecho.foto.autor})`);
  }


  // ---- laminas de archivo ----
  for (const { e, id } of conLamina) {
    const c = e.lamina;
    if (rebuscar) delete c.elegido;

    if (c.elegido && c.fichero && fs.existsSync(path.join("public", c.fichero))) continue;

    if (!c.elegido) {
      process.stdout.write(`  ${id}  lamina "${c.buscar}" … `);
      let hallado = null;
      // Si la busqueda entera no da nada, se prueba con sus tres primeras
      // palabras: "dutch east india company ships amsterdam harbour painting"
      // es demasiado fina, "dutch east india company" casi nunca falla.
      const ts = terminos(c.buscar);
      const fija = /^File:/i.test(c.buscar);
      const consultas = fija
        ? [c.buscar]
        : [c.buscar, ts.slice(0, 4).join(" "), ts.slice(0, 3).join(" "), ts.slice(0, 2).join(" ")];
      for (const q of [...new Set(consultas)]) {
        try {
          const r = await buscarCommons(q);
          hallado = r.find((x) => fija || !usados.has(`${x.fuente}-${x.id}`)) ?? null;
        } catch (err) {
          console.log(`(${err.message})`);
        }
        if (hallado) break;
        await new Promise((ok) => setTimeout(ok, 400));
      }
      if (!hallado) {
        console.log("SIN RESULTADOS");
        e.tipo = "frase";
        e.texto = e.texto ?? e.rotulo?.texto ?? c.pie ?? null;
        delete e.lamina;
        continue;
      }
      c.elegido = hallado;
      usados.add(`${hallado.fuente}-${hallado.id}`);
      console.log(`${hallado.titulo.slice(0, 60)} (${hallado.ancho}x${hallado.alto})`);
    }

    try {
      const { mb: peso, cache } = await descargarLamina(c.elegido);
      c.fichero = `laminas/${c.elegido.fuente}-${c.elegido.id}.jpg`;
      mb += peso;
      if (!cache) console.log(`     ${peso.toFixed(1)} MB`);
      creditos.push(`${c.elegido.titulo.slice(0, 70)} (Wikimedia Commons, dominio publico)`);
    } catch (err) {
      console.log(`     (${err.message}), se queda en tipografia`);
      e.tipo = "frase";
      e.texto = e.texto ?? e.rotulo?.texto ?? c.pie ?? null;
      delete e.lamina;
    }
    await new Promise((ok) => setTimeout(ok, 250));
  }

  // Ultima pasada: ningun plano puede quedarse sin nada que pintar.
  //
  // El montaje ya descarta las escenas que no tienen con que dibujarse y les
  // reparte el hueco a sus hermanas, pero si NINGUNA se puede pintar el plano
  // entero sale en blanco con la voz sonando encima. Se le pone un dibujo
  // neutro: es pobre, pero se ve, y es honesto con que ahi no habia material.
  const pintable = (e) => {
    if (e.tipo === "clip") return !!e.clip?.fichero;
    if (e.tipo === "recorte") return !!e.recorte?.fichero;
    if (e.tipo === "lamina") return !!e.lamina?.fichero;
    if (e.tipo === "contador") return typeof e.a?.valor === "number";
    if (e.tipo === "frase") return !!e.texto;
    if (e.tipo === "barras") return !!e.barras?.datos?.length;
    if (e.tipo === "objeto") return !!e.objeto;
    if (e.tipo === "mapa") return !!e.mapa;
    return true;
  };
  const NEUTROS = ["carpeta", "balanza", "contable", "plano", "interrogante"];
  let rescatados = 0;
  for (const b of doc.bloques) {
    for (const p of b.planos) {
      const es = p.escenas ?? [];
      if (!es.length || es.some(pintable)) continue;
      const e = es[0];
      for (const k of Object.keys(e)) if (k !== "peso") delete e[k];
      e.tipo = "objeto";
      e.objeto = NEUTROS[rescatados % NEUTROS.length];
      p.tipo = "objeto";
      rescatados++;
      console.log(`  ${p.id}: sin nada que pintar, se le pone un dibujo neutro`);
    }
  }
  if (rescatados) console.log(`${rescatados} planos rescatados de salir en blanco`);

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
