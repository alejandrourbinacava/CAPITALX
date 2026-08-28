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
  "frase", "objeto", "retrato", "clip", "torres", "dublin", "cierre",
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

  for (let intento = 1; intento <= 4; intento++) {
    let res;
    try {
      res = await fetch(API, {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      // La red se cae sin dar codigo de estado. Estas peticiones duran
      // minutos, asi que pasa, y perder aqui el trabajo hecho seria absurdo.
      console.log(`  la red ha fallado (${e.message}), reintento ${intento}`);
      await new Promise((r) => setTimeout(r, intento * 20000));
      continue;
    }
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
  throw new Error("la API no respondio tras cuatro intentos");
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
  "vo": "<lo que dice la voz. Una frase seguida, con su entonación entera>",
  "voz": { "speed": 1.0 },
  "escenas": [ ... ]
}

# Las escenas, que es lo que marca el ritmo

Un plano dura lo que dura su locución: unos once segundos. Nadie aguanta once segundos mirando el mismo dibujo, así que **cada plano se parte en varias escenas** que se reparten ese tiempo. La voz sigue siendo una sola frase continua; lo que cambia por debajo es la imagen, cada dos o tres segundos.

Es la regla más importante de todo este documento. Un plano de once segundos con una sola imagen es un plano mal escrito.

Cuántas escenas: **una por cada 45 caracteres de "vo"**, mínimo dos y máximo seis.

    "vo" de 90 caracteres  → 2 escenas
    "vo" de 140 caracteres → 3 escenas
    "vo" de 180 caracteres → 4 escenas
    "vo" de 230 caracteres → 5 escenas

Cada escena lleva su "tipo" y lo que ese tipo necesite, exactamente igual que antes. Puede llevar además "kicker", "fuente", "rotulo", "tags" y "camara" propios:

{
  "id": "b2-03",
  "vo": "En dos mil diez debía cincuenta y tres mil millones. En dos mil dieciocho, ciento cinco mil. Se duplicó en ocho años, mientras el Estado se llevaba la caja.",
  "voz": { "speed": 0.98 },
  "escenas": [
    { "tipo": "barras", "kicker": "DEUDA · 2010-2018", "fuente": "Columbia SIPA",
      "barras": { "unidad": "miles de millones de USD",
        "datos": [ { "etiqueta": "2010", "valor": 53.7, "tono": "ink", "decimales": 1 },
                   { "etiqueta": "2018", "valor": 105, "tono": "carmin" } ] } },
    { "tipo": "objeto", "objeto": "balanza", "camara": "push",
      "rotulo": { "texto": "Se *duplicó* en ocho años" } },
    { "tipo": "frase", "texto": "El Estado se llevaba *la caja*.", "night": true }
  ]
}

Reglas de las escenas:

- **Dos escenas seguidas nunca son del mismo "tipo".** Alterna gráfico, frase, objeto, mapa, retrato.
- La primera escena es la que sostiene el dato. Las siguientes lo desarrollan, lo ilustran o lo rematan.
- El "fuente" va en la escena donde se ve la cifra, no en todas.
- "peso" es opcional y sirve para que una escena dure más que sus hermanas. Úsalo poco: por defecto reparten a partes iguales.
- El plano ya no lleva "tipo" ni campos visuales propios: todo eso vive dentro de "escenas". La única excepción es el plano de tipo "cierre", que va suelto.

# Los elementos que entran y salen: "tags"

Cualquier escena puede llevar etiquetas que aparecen y desaparecen encima del dibujo. Es lo que llena la pantalla y lo que hace que no parezca una diapositiva.

"tags": [
  { "t": "77.500 M$", "x": 22, "y": 30, "in": 0.4, "tone": "carmin", "anim": "pop" },
  { "t": "−9,1 % en 6 meses", "x": 64, "y": 62, "in": 1.1, "tone": "ocre", "anim": "slideL" }
]

"x" e "y" van en porcentaje de la pantalla. "in" y "out" en segundos desde que empieza la escena. "tone" es ocre, carmin, ink o paper. "anim" puede ser "pop", "slideL", "slideR", "slideUp", "wipeX", "grow" o "fade".

**Pon tags en la mayoría de las escenas.** Dos o tres por escena, entrando escalonadas. Sin ellas la pantalla se ve vacía, que es la queja más repetida sobre este canal.

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

- "clip" · "clip": { "buscar": "<qué buscar, EN INGLÉS>", "tono": "ocre|carmin" }
  Metraje de archivo, tratado en blanco y negro con la tinta del canal, igual que todo lo demás. Sirve para respirar entre gráficos y para dar sitio: una refinería, una cola en un banco, una obra parada.

  La búsqueda va **en inglés** y describe una imagen, no una idea. "oil refinery at night" funciona; "economic decline" no devuelve nada útil. Que sea genérico y visual: pides una textura, no una prueba documental.

  **Un clip nunca sostiene un dato.** Ninguna cifra se cuenta sobre metraje: las cifras van en gráficos, que es lo que este canal sabe hacer. El clip es el respiro de al lado.

  Entre **ocho y quince clips** en todo el vídeo, y como mucho uno por bloque. Si pones más, el canal deja de ser lo que es y se convierte en un montaje de banco de imágenes, que es justo lo que no queremos.

- "torres" y "dublin": decorados fijos. Como mucho uno de cada por vídeo, y solo si encaja.

- "cierre" · "cierre": { "siguiente": "<TEMA>", "sub": "<una frase>" } o { "suscribete": true }
  Los dos últimos planos del vídeo, en ese orden.

# Cómo se construye el vídeo

## El presupuesto de caracteres, que es la restricción que más se incumple

La locución va a unos 1.000 caracteres por minuto. Para un vídeo de trece minutos hacen falta unos **13.000 caracteres** sumando todos los "vo". Ese es el presupuesto, y no es orientativo.

La cuenta sale así:

    11 bloques x 7 planos = 77 planos
    77 planos x 170 caracteres de media = 13.000

Por lo tanto: **entre 70 y 80 planos**, en 10 o 12 bloques. Cada "vo" entre 90 y 240 caracteres, y la MEDIA tiene que salir alrededor de 170. Si escribes 85 planos de 210 caracteres te plantas en 18.000 y el guion se rechaza.

Antes de devolver nada, suma de verdad los caracteres de todos los "vo". Si pasan de 15.000, quita planos enteros hasta bajar. No acortes todos un poco: eso deja el guion telegráfico. Quita los que no traigan un dato nuevo.

Y si te quedas corto, no rellenes con paja: vuelve a la ficha y desarrolla mejor los porqués.

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
/*  2b. Reescenificar                                                  */
/* ------------------------------------------------------------------ */

/**
 * Le pone escenas a un guion que ya esta locutado, sin tocar ni una coma.
 *
 * Los mp3 cuestan veinte mil creditos y estan atados al texto y al id de cada
 * plano. Cuando lo que falla es la imagen y no lo escrito, rehacer el guion
 * entero seria tirar ese dinero: aqui solo se sustituye la parte visual.
 *
 * Va por tandas de seis planos porque una peticion con los setenta y cinco de
 * golpe se queda sin espacio de respuesta y devuelve el JSON cortado.
 */
async function reescenificar(doc) {
  const planos = doc.bloques.flatMap((b) => b.planos);
  const conEscenas = new Map();
  const TANDA = 6;

  const claves = {
    europa: REGIONES.europa(),
    norteamerica: REGIONES.norteamerica(),
    asia: REGIONES.asia(),
  };

  for (let i = 0; i < planos.length; i += TANDA) {
    const tanda = planos.slice(i, i + TANDA);
    process.stdout.write(`  planos ${i + 1}-${i + tanda.length} de ${planos.length} … `);

    const { texto } = await claude({
      system: sistemaRedactar(),
      maxTokens: 16000,
      mensajes: [
        {
          role: "user",
          content: [
            `Estos planos ya están locutados: el texto y los identificadores NO se tocan.`,
            `Tu único trabajo es devolver las "escenas" de cada uno, siguiendo las reglas de ritmo.`,
            ``,
            `CLAVES DE PAÍS: europa → ${claves.europa.join(", ")}`,
            `norteamerica → ${claves.norteamerica.join(", ")}`,
            `asia → ${claves.asia.join(", ")}`,
            `OBJETOS: ${OBJETOS_OFRECIDOS.join(", ")}`,
            ``,
            `Lo que había antes en cada plano te sirve de punto de partida: normalmente`,
            `esa era la primera escena y le faltaban las siguientes.`,
            ``,
            JSON.stringify(tanda, null, 1),
            ``,
            `Devuelve SOLO un JSON con esta forma, dentro de un bloque \`\`\`json:`,
            `{ "b0-01": [ {escena}, {escena}, ... ], "b0-02": [ ... ] }`,
            ``,
            `Una entrada por cada plano de arriba, con su id exacto. Nada más.`,
          ].join("\n"),
        },
      ],
    });

    const m = texto.match(/```json\s*([\s\S]*?)```/) || texto.match(/(\{[\s\S]*\})/);
    if (!m) throw new Error("la respuesta no traía JSON:\n" + texto.slice(0, 400));
    const lote = JSON.parse(m[1]);
    let n = 0;
    for (const [id, escenas] of Object.entries(lote)) {
      if (Array.isArray(escenas) && escenas.length) {
        conEscenas.set(id, escenas);
        n += escenas.length;
      }
    }
    console.log(`${n} escenas`);
  }

  // Se monta el guion nuevo conservando id, vo y voz intactos.
  for (const p of planos) {
    const es = conEscenas.get(p.id);
    if (!es) {
      console.warn(`  AVISO: ${p.id} se queda sin escenas, mantiene la imagen que tenía`);
      continue;
    }
    for (const k of Object.keys(p)) {
      if (!["id", "vo", "voz"].includes(k)) delete p[k];
    }
    p.tipo = es[0].tipo;
    p.escenas = es;
  }
  return doc;
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

/**
 * Revisa lo que dibuja un tipo: sirve igual para un plano suelto que para
 * una escena de dentro de un plano, porque pintan exactamente lo mismo.
 */
function revisarVisual(p, di) {
  const donde = p.id ?? "(sin id)";
  if (!TIPOS.includes(p.tipo)) {
    di(`${donde}: tipo "${p.tipo}" no existe. Los válidos: ${TIPOS.join(", ")}`);
    return;
  }
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
  if (p.tipo === "clip") {
    const b = p.clip?.buscar;
    if (!b) di(`${donde}: 'clip' necesita 'clip': { "buscar": "..." } en inglés`);
    else if (/[áéíóúñ¿¡]/i.test(b)) di(`${donde}: la búsqueda "${b}" tiene que ir en inglés`);
  }
  if (p.tipo === "cierre" && !p.cierre) di(`${donde}: 'cierre' necesita 'cierre'`);
}

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

  // El ritmo es lo primero que se mira. Un plano de once segundos con una
  // sola imagen es el fallo que hace que el video se sienta lento, y no se
  // arregla despues: hay que escribirlo troceado desde el principio.
  let escenasTotales = 0;
  for (const p of planos) {
    if (p.tipo === "cierre") continue;
    const n = (p.escenas ?? []).length;
    escenasTotales += Math.max(n, 1);
    const hacen = Math.min(6, Math.max(2, Math.ceil((p.vo?.length ?? 0) / 45)));
    if (n < hacen) {
      di(
        `${p.id}: ${n === 0 ? "no tiene 'escenas'" : `solo tiene ${n} escenas`}. ` +
          `Con ${p.vo?.length ?? 0} caracteres de locución hacen falta ${hacen}, ` +
          `o la imagen se queda quieta ${((p.vo?.length ?? 0) / 15.8 / Math.max(n, 1)).toFixed(0)} segundos.`
      );
    }
    for (let i = 1; i < (p.escenas ?? []).length; i++) {
      if (p.escenas[i].tipo === p.escenas[i - 1].tipo) {
        di(`${p.id}: las escenas ${i} y ${i + 1} son las dos "${p.escenas[i].tipo}". Cambia una.`);
      }
    }
  }

  for (const p of planos) {
    const donde = p.id || "(plano sin id)";
    if (!p.id) di("hay un plano sin 'id'");
    else if (vistos.has(p.id)) di(`el id ${p.id} está repetido`);
    vistos.add(p.id);

    // Cada escena se valida como si fuera un plano: lo que dibuja es lo mismo.
    for (const [i, e] of (p.escenas ?? []).entries()) {
      revisarVisual({ ...e, id: `${p.id}, escena ${i + 1}` }, di);
    }
    if (p.escenas?.length) continue;

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

    revisarVisual(p, di);
  }

  // Ritmo. Tres graficos seguidos matan el plano; tres frases seguidas, en
  // cambio, son un recurso: asi se remata la apertura de Irlanda. Se deja
  // correr hasta la cuarta.
  const seguidas = { frase: 4, lista: 99 };
  let racha = 1;
  for (let i = 1; i < planos.length; i++) {
    racha = planos[i].tipo === planos[i - 1].tipo ? racha + 1 : 1;
    const tope = seguidas[planos[i].tipo] ?? 3;
    if (racha === tope) {
      di(`${planos[i].id}: van ${racha} planos "${planos[i].tipo}" seguidos. Mete otra cosa en medio.`);
    }
  }

  const min = 11000;
  if (chars < min) {
    di(`el guion suma ${chars} caracteres y salen unos ${(chars / 1000).toFixed(1)} minutos. Hacen falta al menos ${min} para llegar a los once minutos: desarrolla más los porqués con datos de la ficha, no con relleno.`);
  }
  if (chars > 16000) {
    di(`el guion suma ${chars} caracteres y se pasa de quince minutos. Quita unos ${chars - 14000}: fusiona planos que digan lo mismo y corta los que no aporten un dato nuevo. No toques los bloques, quita planos.`);
  }

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

  // Solo cambiar la imagen de un guion ya locutado, sin gastar creditos.
  if (args.includes("--reescenificar")) {
    const ruta = args[args.indexOf("--reescenificar") + 1] || "content/diario.json";
    const doc = leerJson(ruta);
    console.log(`reescenificando ${doc.titulo}`);
    const nuevo = await reescenificar(doc);

    const fallos = validar(nuevo, { slug: nuevo.slug }).filter((f) => !/caracteres|publicacion|descripción|etiquetas/.test(f));
    if (fallos.length) {
      console.log(`\n${fallos.length} cosas sin cuadrar:`);
      for (const f of fallos.slice(0, 20)) console.log(`  · ${f}`);
    }

    fs.writeFileSync(ruta, JSON.stringify(nuevo, null, 2));
    const ps = nuevo.bloques.flatMap((b) => b.planos);
    const total = ps.reduce((n, p) => n + (p.escenas?.length ?? 1), 0);
    console.log(`\n${ps.length} planos · ${total} escenas · ${(total / ps.length).toFixed(1)} por plano`);
    console.log(`la locución no se ha tocado: cero créditos`);
    console.log(`en ${ruta}`);
    return;
  }

  const cola = leerJson("content/cola.json");
  const tema = pedido ? cola.cola.find((t) => t.slug === pedido) : cola.cola[0];
  if (!tema) throw new Error(pedido ? `"${pedido}" no está en la cola` : "la cola está vacía");

  console.log(`tema: ${tema.titulo}`);

  // Investigar cuesta cuatro minutos y una docena de busquedas. Si ya hay
  // ficha de este tema se reaprovecha, para que un fallo al redactar no
  // obligue a repetir toda la documentacion.
  const fichaPath = `content/fichas/${tema.slug}.md`;
  let ficha;
  console.log("");
  if (fs.existsSync(fichaPath) && !args.includes("--investigar-de-nuevo")) {
    ficha = fs.readFileSync(fichaPath, "utf8");
    console.log(`ficha ya hecha, se reaprovecha (${fichaPath})`);
    console.log("   para rehacerla, anade  --investigar-de-nuevo");
  } else {
    console.log("investigando…");
    ficha = await investigar(tema);
    fs.mkdirSync("content/fichas", { recursive: true });
    fs.writeFileSync(fichaPath, ficha);
    console.log(`  ficha en ${fichaPath}`);
  }

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
