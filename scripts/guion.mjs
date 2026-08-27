/**
 * Escribe el guion del dia.
 *
 * Coge el primer tema de content/cola.json, lo investiga con busqueda web real,
 * y lo convierte en un guion con el mismo esquema que los que hemos escrito a
 * mano. Deja el resultado en content/diario.json.
 *
 * Son dos llamadas separadas a proposito. La primera solo investiga y vuelve
 * con cifras y fuentes; la segunda solo redacta a partir de esas cifras. Si se
 * pide todo de golpe, el modelo se inventa numeros para que le cuadre el
 * montaje, que es exactamente lo que no puede pasar en un canal de economia.
 *
 *   node scripts/guion.mjs              el primero de la cola
 *   node scripts/guion.mjs --tema pemex uno concreto
 *   node scripts/guion.mjs --solo-investigar
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const API = "https://api.anthropic.com/v1/messages";
const MODELO = process.env.ANTHROPIC_MODEL || "claude-opus-5";

// Lo que el montaje sabe dibujar. Si el guion pide otra cosa, el plano sale
// vacio: por eso se valida contra estas listas antes de gastar un solo credito.
const TIPOS = [
  "mapa", "barras", "lineas", "contador", "gente", "lista",
  "frase", "objeto", "retrato", "torres", "dublin", "cierre",
];
const OBJETOS = [
  "aeropuerto", "balanza", "carpeta", "carta", "casa", "contable", "dosEpocas",
  "dosIrlandas", "fabrica", "grua", "habitacion", "interrogante", "maletero",
  "plano", "sala", "villa",
];
// dosIrlandas se dibujo para el video de Irlanda y solo funciona alli.
const OBJETOS_OFRECIDOS = OBJETOS.filter((o) => o !== "dosIrlandas");
const REGIONES = {
  europa: () => Object.keys(leerJson("src/data/europa.json")),
  norteamerica: () => Object.keys(leerJson("src/data/norteamerica.json")),
  asia: () => Object.keys(leerJson("src/data/asia.json")),
};

const leerJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

function loadEnv() {
  const f = path.join(process.cwd(), ".env");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

async function claude({ system, mensajes, buscar = false, maxTokens = 16000 }) {
  const body = {
    model: MODELO,
    max_tokens: maxTokens,
    system,
    messages: mensajes,
  };
  if (buscar) body.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 14 }];

  for (let intento = 1; intento <= 3; intento++) {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.status === 429 || res.status >= 500) {
      const espera = intento * 20000;
      console.log(`  ${res.status}, reintento en ${espera / 1000}s`);
      await new Promise((r) => setTimeout(r, espera));
      continue;
    }
    const j = await res.json();
    if (j.type === "error") throw new Error(JSON.stringify(j.error));
    const texto = (j.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const busquedas = (j.content || []).filter((b) => b.type === "server_tool_use").length;
    return { texto, busquedas, uso: j.usage };
  }
  throw new Error("la API no respondio tras tres intentos");
}

/* ------------------------------------------------------------------ */
/*  1. Investigar                                                      */
/* ------------------------------------------------------------------ */

const SISTEMA_INVESTIGAR = `Eres el documentalista de Capital X, un canal de YouTube en español sobre macroeconomía y geopolítica. Preparas la ficha de datos con la que después se escribe el guion.

Tu trabajo es traer cifras que se puedan defender. Reglas que no se negocian:

- Busca en la web. No escribas ninguna cifra de memoria: todas las que uses tienen que salir de una búsqueda de esta sesión.
- Cada cifra va acompañada de su fuente y de su fecha. Si el dato más reciente que encuentras es de hace tres años, dilo: "último disponible, 2023".
- Comprueba la premisa del tema antes de darla por buena. Muchos titulares que circulan están desactualizados o son directamente falsos. Si al buscar descubres que la premisa ya no se sostiene, dilo claramente y propón el ángulo correcto: eso es más valioso que confirmar lo que se esperaba.
- Busca activamente el dato que contradice la tesis. Si existe, entra en la ficha.
- Distingue dato de proyección y dato de estimación. Marca cuál es cuál.
- Si un dato circula mucho pero no encuentras la fuente primaria, dilo y no lo uses.

Devuelve una ficha en español con esta estructura:

## Premisa
Si se sostiene o no, y por qué. Si no se sostiene, el ángulo correcto.

## Tesis del vídeo
Una frase. Lo que el espectador se lleva.

## Cifras
Lista. Cada línea: la cifra, qué mide, el año, y la fuente.

## Lo que contradice la tesis
Lo que un espectador informado objetaría, con cifras.

## Personas y empresas
Nombre, cargo exacto, y por qué aparece. Comprueba los cargos: confundir un doctorando con un catedrático o una filial con la matriz es el tipo de error que hunde la credibilidad del canal.

## Cronología
Las fechas que ordenan la historia.

## Fuentes
Lista de las que has usado.`;

async function investigar(tema) {
  const hoy = new Date().toISOString().slice(0, 10);
  const { texto, busquedas, uso } = await claude({
    system: SISTEMA_INVESTIGAR,
    buscar: true,
    maxTokens: 12000,
    mensajes: [
      {
        role: "user",
        content: `Hoy es ${hoy}.

TEMA: ${tema.titulo}

ÁNGULO PREVISTO: ${tema.angulo}

Investiga y devuelve la ficha. Prioriza datos de 2025 y 2026 sobre los anteriores.`,
      },
    ],
  });
  console.log(`  ${busquedas} búsquedas · ${uso?.output_tokens ?? "?"} tokens`);
  return texto;
}

/* ------------------------------------------------------------------ */
/*  2. Redactar                                                        */
/* ------------------------------------------------------------------ */

function sistemaRedactar() {
  return `Eres el guionista de Capital X, un canal de YouTube en español sobre macroeconomía contada con datos. Escribes el guion en el formato JSON que consume el montaje.

# El canal

Locución en español de España, tono seco y adulto. Nunca alarmista, nunca vendedor. La emoción la ponen los datos, no los adjetivos. Se tutea al espectador.

Nada de "impactante", "brutal", "lo que nadie te cuenta", "prepárate". Nada de preguntas retóricas encadenadas. Si una frase suena a titular de tabloide, se reescribe.

Se dice lo que el dato dice, incluida la parte que estropea la historia. Un vídeo que reconoce el contraargumento es más creíble que uno que lo esconde.

# El formato JSON

{
  "slug": "<el slug del tema>",
  "titulo": "<título del vídeo>",
  "voz": { "id": "clone_2333475", "nombre": "VOZ DETRAS DEL ENIGMA" },
  "wpm": 145,
  "musica": "mystery.wav",
  "bloques": [ { "id": "b0", "nombre": "<nombre interno>", "planos": [ ... ] } ],
  "publicacion": {
    "titulo": "<título para YouTube, máximo 100 caracteres>",
    "descripcion": "<descripción con las fuentes citadas al final, 1500-3000 caracteres>",
    "etiquetas": ["...", "..."]
  }
}

Cada plano:

{
  "id": "b0-01",
  "tipo": "<uno de la lista>",
  "vo": "<lo que dice la voz>",
  "voz": { "speed": 1.0 },
  "kicker": "<opcional: rótulo pequeño arriba>",
  "fuente": "<obligatorio en todo plano con una cifra>",
  "rotulo": { "kicker": "<opcional>", "texto": "Texto con *lo resaltado* entre asteriscos" }
}

# Tipos de plano y lo que necesita cada uno

- "mapa" · "mapa": { "region": "europa|norteamerica|asia", "destaca": ["clavepais"] }
  Solo valen las claves de país que te doy más abajo. Una clave inventada dibuja un mapa vacío.

- "barras" · "barras": { "unidad": "<qué se mide>", "sufijo": "%", "datos": [ { "etiqueta": "...", "valor": 12.4, "tono": "carmin|verde|ocre|ink", "decimales": 1 } ] }
  De una a cinco barras. Comparar dos funciona mejor que amontonar cinco.

- "lineas" · "lineas": { "unidad": "...", "series": [ { "nombre": "...", "tono": "carmin", "puntos": [["2019", 12], ["2025", 31]] } ] }
  Solo si tienes el valor de CADA punto de la serie. Si solo tienes el principio y el final, usa "contador".

- "contador" · "de": { "valor": 0, "etiqueta": "" }, "a": { "valor": 254500, "etiqueta": "<qué es>" }
  Una cifra que sube en pantalla. Para el dato grande del bloque.

- "gente" · "gente": { "total": 671639, "destacados": 82, "escala": 1000, "etiqueta": "...", "etiquetaDestacados": "..." }
  Cuadrícula de figuras humanas. Para proporciones sobre población.

- "lista" · "lista": { "titulo": "...", "puntos": ["...", "...", "..."], "activo": 0 }
  De dos a cuatro puntos. Para enumerar lo que viene, repitiendo el plano con "activo" 0, 1, 2.

- "frase" · "texto": "Una frase con *lo importante* resaltado", "night": true
  Pantalla de tipografía sola. Para los giros del relato. Con "night" el fondo es oscuro: úsalo en los momentos duros.

- "objeto" · "objeto": "<uno de la lista de objetos>"
  Un dibujo a línea. Para respirar entre gráficos.

- "retrato" · "retrato": { "nombre": "Nombre Apellido", "papel": "<cargo exacto>", "fecha": "<opcional>", "titular": "<opcional>" }
  Ficha tipográfica de prensa. NUNCA pongas el campo "foto": las fotos se preparan a mano, con licencia comprobada.

- "torres" y "dublin": decorados fijos. Como mucho uno de cada por vídeo, y solo si encaja.

- "cierre" · "cierre": { "siguiente": "<TEMA>", "sub": "<una frase>" } o { "suscribete": true }
  Los dos últimos planos del vídeo, en ese orden.

# Cómo se construye el vídeo

Duración objetivo: entre 11 y 14 minutos. Eso son entre 12.000 y 15.000 caracteres sumando todos los "vo". Cuéntalos. Un guion corto es el error más frecuente: si te quedas corto, no rellenes con paja, busca más contenido real en la ficha y desarrolla más los porqués.

Entre 75 y 95 planos, repartidos en 10-13 bloques con nombre.

Cada "vo" entre 90 y 260 caracteres. Una idea por plano.

Estructura:
- b0, apertura en frío: el dato más fuerte, sin presentación ni saludo. Cinco o seis planos.
- b1, la promesa: qué se va a ver, en formato "lista" con "activo" 0, 1, 2.
- bloques centrales: el desarrollo. Cada uno con su propia pregunta y su respuesta.
- un bloque dedicado a lo que contradice la tesis. No es opcional.
- bloque final: qué significa para el espectador.
- cierre: el plano "siguiente" y el plano "suscribete".

Ritmo visual: nunca tres planos seguidos del mismo tipo. Alterna gráfico, frase, mapa, objeto. Después de dos gráficos seguidos, una frase.

"voz": { "speed": x } entre 0,92 y 1,06. Más lento en las frases graves, más rápido en las enumeraciones. Varíalo: es lo único que evita que la locución suene monótona.

# La locución se lee en voz alta

El texto de "vo" lo lee un sintetizador. Por lo tanto:
- Los números van escritos con letras: "cero coma ochenta", no "0,80". "doscientos cincuenta y cuatro mil", no "254.000".
- Los años también: "dos mil veinticinco".
- Los porcentajes: "un treinta y siete por ciento".
- Nada de siglas sin desarrollar la primera vez.
- Nada de paréntesis, guiones largos ni comillas: no se leen, se notan.
- Frases cortas. El punto es la única pausa que el motor respeta de verdad.

En los rótulos y etiquetas de pantalla, en cambio, los números van en cifra: ahí se leen con los ojos.

# Honradez con los datos

- Todo plano con una cifra lleva "fuente".
- No dibujes una serie de líneas si no tienes todos los puntos. Es la tentación más habitual y es falsear un gráfico.
- Proyección y dato no se mezclan: si es una proyección, la locución lo dice.
- Los cargos de las personas, exactos.

# La descripción de YouTube

Entre 1.500 y 3.000 caracteres. Empieza con dos frases que reenganchen. Después los capítulos con marcas de tiempo aproximadas. Después las fuentes, una por línea. Sin hashtags dentro del texto.

Las etiquetas: entre 15 y 25, en español, sumando menos de 480 caracteres contando las comas.

# Salida

Devuelve SOLO el JSON, dentro de un bloque \`\`\`json. Sin explicación antes ni después.`;
}

async function redactar(tema, ficha, correcciones = null) {
  const claves = tema.region ? REGIONES[tema.region]().join(", ") : null;
  const partes = [
    `TEMA: ${tema.titulo}`,
    `SLUG: ${tema.slug}`,
    ``,
    claves
      ? `CLAVES DE PAÍS DISPONIBLES para la región "${tema.region}" (las únicas que puedes usar en "destaca"):\n${claves}`
      : `Este tema NO tiene mapa disponible. No uses ningún plano de tipo "mapa".`,
    ``,
    `OBJETOS DISPONIBLES: ${OBJETOS_OFRECIDOS.join(", ")}`,
    ``,
    `--- FICHA DE DATOS ---`,
    ficha,
    `--- FIN DE LA FICHA ---`,
    ``,
    `Escribe el guion completo. Usa únicamente cifras que estén en la ficha.`,
  ];
  if (correcciones) {
    partes.push(
      ``,
      `El intento anterior tenía estos fallos. Corrígelos todos y devuelve el JSON entero de nuevo:`,
      correcciones.map((c) => `- ${c}`).join("\n")
    );
  }

  const { texto, uso } = await claude({
    system: sistemaRedactar(),
    maxTokens: 32000,
    mensajes: [{ role: "user", content: partes.join("\n") }],
  });
  console.log(`  ${uso?.output_tokens ?? "?"} tokens`);

  const m = texto.match(/```json\s*([\s\S]*?)```/) || texto.match(/(\{[\s\S]*\})/);
  if (!m) throw new Error("la respuesta no traía JSON:\n" + texto.slice(0, 600));
  return JSON.parse(m[1]);
}

/* ------------------------------------------------------------------ */
/*  3. Validar                                                         */
/* ------------------------------------------------------------------ */

/**
 * Comprueba que el guion es montable ANTES de gastar creditos de voz.
 *
 * Un plano con un tipo mal escrito o una clave de pais inexistente no da error
 * al renderizar: sale un cuadro vacio con la voz sonando encima. Eso solo se
 * descubre viendo el video terminado, hora y media despues.
 */
function validar(doc, tema) {
  const fallos = [];
  const di = (c) => fallos.push(c);

  if (!doc.slug) di("falta 'slug'");
  if (!doc.titulo) di("falta 'titulo'");
  if (!Array.isArray(doc.bloques) || !doc.bloques.length) {
    di("falta 'bloques'");
    return fallos;
  }

  const planos = doc.bloques.flatMap((b) => b.planos ?? []);
  const vistos = new Set();
  let chars = 0;

  for (const p of planos) {
    const donde = p.id || "(plano sin id)";
    if (!p.id) di("hay un plano sin 'id'");
    else if (vistos.has(p.id)) di(`el id ${p.id} está repetido`);
    vistos.add(p.id);

    if (!TIPOS.includes(p.tipo)) di(`${donde}: tipo "${p.tipo}" no existe. Los válidos: ${TIPOS.join(", ")}`);
    if (!p.vo || typeof p.vo !== "string") di(`${donde}: falta 'vo'`);
    else {
      chars += p.vo.length;
      if (p.vo.length < 22) di(`${donde}: el 'vo' es demasiado corto (${p.vo.length} caracteres)`);
      if (p.vo.length > 320) di(`${donde}: el 'vo' es demasiado largo (${p.vo.length} caracteres, máximo 260). Pártelo en dos planos.`);
      if (/\d/.test(p.vo)) di(`${donde}: el 'vo' lleva cifras en número. Se lee en voz alta: escríbelas con letras.`);
    }

    const v = p.voz?.speed;
    if (v !== undefined && (v < 0.88 || v > 1.08)) di(`${donde}: 'speed' ${v} fuera del rango 0,88 a 1,08`);

    if (p.tipo === "mapa") {
      const r = p.mapa?.region ?? "europa";
      if (!REGIONES[r]) di(`${donde}: región "${r}" no existe. Las válidas: europa, norteamerica, asia`);
      else {
        const claves = REGIONES[r]();
        for (const k of p.mapa.destaca ?? []) {
          if (!claves.includes(k)) di(`${donde}: "${k}" no está en la región ${r}. Disponibles: ${claves.join(", ")}`);
        }
      }
    }
    if (p.tipo === "objeto" && !OBJETOS.includes(p.objeto)) {
      di(`${donde}: objeto "${p.objeto}" no existe. Los válidos: ${OBJETOS.join(", ")}`);
    }
    if (p.tipo === "barras") {
      const d = p.barras?.datos;
      if (!Array.isArray(d) || !d.length) di(`${donde}: 'barras.datos' está vacío`);
      else for (const b of d) if (typeof b.valor !== "number") di(`${donde}: la barra "${b.etiqueta}" no tiene valor numérico`);
    }
    if (p.tipo === "lineas") {
      for (const s of p.lineas?.series ?? []) {
        if (!Array.isArray(s.puntos) || s.puntos.length < 2) {
          di(`${donde}: la serie "${s.nombre}" necesita al menos dos puntos`);
        }
      }
      if (!p.lineas?.series?.length) di(`${donde}: 'lineas.series' vacío`);
    }
    if (p.tipo === "contador" && (!p.a || typeof p.a.valor !== "number")) {
      di(`${donde}: 'contador' necesita 'a': { valor, etiqueta }`);
    }
    if (p.tipo === "gente") {
      const g = p.gente;
      if (!g || typeof g.total !== "number" || typeof g.destacados !== "number") {
        di(`${donde}: 'gente' necesita 'total' y 'destacados' numéricos`);
      }
    }
    if (p.tipo === "lista") {
      const n = p.lista?.puntos?.length ?? 0;
      if (n < 2 || n > 4) di(`${donde}: la lista necesita entre dos y cuatro puntos (tiene ${n})`);
    }
    if (p.tipo === "frase" && !p.texto) di(`${donde}: 'frase' necesita 'texto'`);
    if (p.tipo === "retrato") {
      if (!p.retrato?.nombre) di(`${donde}: 'retrato' necesita 'nombre'`);
      if (p.retrato?.foto) di(`${donde}: quita 'foto'. Las fotos se preparan a mano con la licencia comprobada.`);
    }
    if (p.tipo === "cierre" && !p.cierre) di(`${donde}: 'cierre' necesita 'cierre'`);
  }

  // ritmo: tres iguales seguidos es una losa
  for (let i = 2; i < planos.length; i++) {
    if (planos[i].tipo === planos[i - 1].tipo && planos[i].tipo === planos[i - 2].tipo) {
      if (planos[i].tipo !== "lista") {
        di(`${planos[i - 2].id}, ${planos[i - 1].id} y ${planos[i].id} son los tres "${planos[i].tipo}". Alterna.`);
      }
    }
  }

  const min = 11000;
  if (chars < min) {
    di(`el guion suma ${chars} caracteres y salen unos ${(chars / 1000).toFixed(1)} minutos. Hacen falta al menos ${min} para llegar a los once minutos: desarrolla más los porqués con datos de la ficha, no con relleno.`);
  }
  if (chars > 16500) di(`el guion suma ${chars} caracteres, se pasa de quince minutos`);

  const ult = planos[planos.length - 1];
  if (ult?.tipo !== "cierre") di("el último plano tiene que ser de tipo 'cierre' con 'suscribete': true");

  const pub = doc.publicacion;
  if (!pub) di("falta el bloque 'publicacion'");
  else {
    if (!pub.titulo) di("falta 'publicacion.titulo'");
    else if (pub.titulo.length > 100) di(`el título de YouTube tiene ${pub.titulo.length} caracteres, el máximo es 100`);
    if (!pub.descripcion || pub.descripcion.length < 900) di("la descripción de YouTube se queda corta: mínimo 1.500 caracteres");
    const et = (pub.etiquetas ?? []).join(",");
    if (!pub.etiquetas?.length) di("faltan 'publicacion.etiquetas'");
    else if (et.length > 480) di(`las etiquetas suman ${et.length} caracteres, el máximo es 480`);
  }

  if (doc.slug !== tema.slug) di(`el 'slug' tiene que ser exactamente "${tema.slug}"`);

  return fallos;
}

/* ------------------------------------------------------------------ */

async function main() {
  loadEnv();
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("falta ANTHROPIC_API_KEY");

  const args = process.argv.slice(2);
  const pedido = args.includes("--tema") ? args[args.indexOf("--tema") + 1] : null;

  const cola = leerJson("content/cola.json");
  const tema = pedido ? cola.cola.find((t) => t.slug === pedido) : cola.cola[0];
  if (!tema) throw new Error(pedido ? `"${pedido}" no está en la cola` : "la cola está vacía");

  console.log(`tema: ${tema.titulo}`);

  console.log("\ninvestigando…");
  const ficha = await investigar(tema);
  fs.mkdirSync("content/fichas", { recursive: true });
  fs.writeFileSync(`content/fichas/${tema.slug}.md`, ficha);
  console.log(`  ficha en content/fichas/${tema.slug}.md`);

  if (args.includes("--solo-investigar")) return;

  let doc = null;
  let fallos = [];
  for (let intento = 1; intento <= 3; intento++) {
    console.log(`\nredactando (intento ${intento})…`);
    doc = await redactar(tema, ficha, intento > 1 ? fallos : null);
    fallos = validar(doc, tema);
    if (!fallos.length) break;
    console.log(`  ${fallos.length} cosas que corregir:`);
    for (const f of fallos.slice(0, 12)) console.log(`    · ${f}`);
  }
  if (fallos.length) {
    console.error("\nEl guion sigue sin pasar la revisión después de tres intentos:");
    for (const f of fallos) console.error(`  · ${f}`);
    throw new Error("guion no montable");
  }

  fs.writeFileSync("content/diario.json", JSON.stringify(doc, null, 2));
  fs.writeFileSync("content/diario.timings.json", "{}");

  const planos = doc.bloques.flatMap((b) => b.planos);
  const chars = planos.reduce((n, p) => n + p.vo.length, 0);
  console.log(`\n${doc.titulo}`);
  console.log(`${planos.length} planos · ${chars} caracteres · unos ${(chars / 1000).toFixed(1)} min`);
  console.log(`unos ${Math.round(chars * 1.46)} créditos de locución`);
  console.log("en content/diario.json");

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `slug=${tema.slug}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `titulo=${doc.publicacion.titulo}\n`);
  }
}

export { validar };

// Solo se ejecuta si lo lanzas tu; asi el validador se puede probar aparte.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error("ERROR:", e.message);
    process.exit(1);
  });
}
