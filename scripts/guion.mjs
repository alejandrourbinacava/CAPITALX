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
// Investigar y escribir de cero necesitan el modelo bueno: ahi se decide si
// el video vale algo. Reescenificar no: es traducir un guion ya escrito a
// escenas siguiendo un esquema cerrado, y eso lo hace igual de bien un modelo
// mas barato. Cobrarlo a precio de Opus era tirar dinero, y son trece
// llamadas por pasada.
const MODELO = process.env.ANTHROPIC_MODEL || "claude-opus-5";
const MODELO_ESCENAS = process.env.ANTHROPIC_MODEL_ESCENAS || "claude-sonnet-5";

// Lo que el montaje sabe dibujar. Si el guion pide otra cosa, el plano sale
// vacio: por eso se valida contra estas listas antes de gastar un solo credito.
const TIPOS = [
  "mapa", "barras", "lineas", "contador", "gente", "lista",
  "frase", "objeto", "retrato", "clip", "recorte", "torres", "dublin", "cierre",
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

async function claude({ system, mensajes, buscar = false, maxTokens = 16000, modelo = MODELO }) {
  const body = {
    model: modelo,
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

# Esto es un relato, no un informe

El error que más se repite en este canal es encadenar cifras. Un dato detrás de otro detrás de otro: al minuto cuatro el espectador ha desconectado, aunque todas las cifras sean correctas y estén bien citadas.

Un vídeo se sigue porque hay **una historia con tensión**, y los números son las pruebas que la sostienen. No al revés.

Cómo se consigue:

- **Un dato solo entra si va con su consecuencia humana.** "Setenta y siete mil quinientos millones de dólares" no dice nada. "Setenta y siete mil quinientos millones: cada mexicano debe mil quinientos dólares por una empresa en la que no ha trabajado nunca" sí.

- **Una cifra por idea, y la siguiente no llega hasta que la primera ha aterrizado.** Si dos planos seguidos traen dos cifras distintas, la segunda borra a la primera.

- **Compara con algo que se pueda imaginar.** Años de sueldo, veces el presupuesto de sanidad, cuántos hospitales. Nunca dos magnitudes abstractas entre sí.

- **Pon gente.** Quién decidió, quién firmó, quién lo paga. Un nombre con cargo y fecha vale más que tres gráficos. Las decisiones las toman personas y en el vídeo tienen que aparecer.

- **Cuenta escenas, no conceptos.** "En marzo de dos mil veintitrés, un domingo por la noche, el Gobierno suizo reunió a los dos bancos y no les dejó salir hasta que hubo acuerdo" se ve. "Se produjo una fusión forzada" no.

- **Deja preguntas abiertas y respóndelas después.** Cada bloque tiene que terminar dejando algo pendiente que obligue a seguir viendo.

- **Varía el ritmo de la frase.** Frases largas para explicar, frases de cinco palabras para rematar. Si todos los planos tienen la misma longitud, la locución suena a lista.

Regla práctica: **como mucho la mitad de los planos llevan una cifra nueva.** La otra mitad explica, cuenta, compara o remata. Si al repasar el guion ves tres planos seguidos con tres cifras distintas, sobra una.

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

Un plano de quince segundos con una sola imagen es un plano mal escrito. Pero uno de seis segundos partido en tres tampoco vale: se lee peor que si no se hubiera partido.

Cuánto dura una escena: **entre cinco y siete segundos**. Menos no da tiempo a leer.

Esto es importante y es fácil equivocarse en la dirección contraria. Tres segundos suenan dinámicos, pero un gráfico de barras hay que recorrerlo con la vista, comparar dos alturas y leer dos etiquetas: cuando el espectador llega al último dato, ya se ha cortado. El ritmo no se consigue troceando más, se consigue con lo que se mueve **dentro** de cada escena: los tags que entran escalonados, el barrido de las barras, el contador subiendo.

La locución va a unos dieciséis caracteres por segundo, así que:

    "vo" de 90 caracteres  →  5,7 s  →  1 escena
    "vo" de 140 caracteres →  8,9 s  →  2 escenas
    "vo" de 180 caracteres → 11,4 s  →  2 escenas
    "vo" de 240 caracteres → 15,2 s  →  3 escenas

La cuenta: **una escena por cada 85 caracteres de "vo"**, mínimo una y máximo tres. Un plano corto se queda con una sola imagen, y está bien.

El reparto dentro del plano no es a partes iguales: los gráficos, los mapas y los contadores se llevan más tiempo que las frases, porque cuestan más de leer. De eso se encarga el montaje solo, no tienes que hacer nada.

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

# Cuánto de cada cosa

Este es el reparto que tiene que salir contando **todas** las escenas del vídeo. No es orientativo: el vídeo anterior salió con un 66 % de pantallas de texto y de gráficos, y se hacía pesadísimo.

    clip        20 %   metraje de archivo
    recorte     18 %   recortes de revista
    objeto      14 %   dibujos a línea
    barras/lineas/contador  20 %   los gráficos
    frase       12 %   pantallas de texto solo
    mapa/lista/retrato/gente  16 %

Lo que hay que vigilar, por orden:

- **"frase" es lo que más se dispara.** Es la escena más fácil de escribir y la más aburrida de ver. Una pantalla con una frase grande vale para un remate, no para explicar. Si una idea se puede enseñar con un recorte o un objeto, no va en tipografía.
- **Los gráficos tampoco pueden encadenarse.** Tres barras seguidas son tres pantallas de números.
- **Más de la mitad del vídeo tiene que ser imagen**: clips, recortes y objetos juntos. Ahora mismo salía un 26 %.

Reglas de las escenas:

- **Dos escenas seguidas nunca son del mismo "tipo".** Alterna gráfico, frase, objeto, mapa, retrato, clip.
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

  **Cada clip busca una cosa distinta.** Si en un vídeo sobre petróleo pides tres veces "oil refinery", sale tres veces el mismo plano y se nota muchísimo. Varía: la refinería, la plataforma en el mar, el camión cisterna, la sala de control, el oleoducto en el desierto.

  La búsqueda va **en inglés** y describe una imagen, no una idea. "oil refinery at night" funciona; "economic decline" no devuelve nada útil. Que sea genérico y visual: pides una textura, no una prueba documental.

  **Un clip nunca sostiene un dato.** Ninguna cifra se cuenta sobre metraje: las cifras van en gráficos, que es lo que este canal sabe hacer. El clip es el respiro de al lado.

  Entre **ocho y quince clips** en todo el vídeo, y como mucho uno por bloque. Si pones más, el canal deja de ser lo que es y se convierte en un montaje de banco de imágenes, que es justo lo que no queremos.

- "recorte" · "recorte": { "buscar": "<qué buscar, EN INGLÉS>", "tono": "ocre|carmin", "lado": "izq|der|centro", "nota": "<opcional, pie pequeño>" }
  El recorte de revista: una foto con el fondo quitado, en blanco y negro, con borde grueso de color y una sombra plana desplazada por detrás. Es la marca visual de este canal y ahora mismo se usa poquísimo.

  La búsqueda tiene que devolver **un sujeto recortable**: una persona, un objeto, una máquina, un edificio suelto. "businessman in suit", "oil worker with helmet", "empty office chair", "gas pump". Nunca paisajes, multitudes ni planos generales: si no hay un sujeto que separar del fondo, el recorte sale mal y la escena se cae a tipografía.

  Úsalo para poner cara y cuerpo a lo que se está contando: el trabajador del que hablas, la máquina que compró la empresa, el edificio del ministerio.

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
/**
 * Saca el JSON de una respuesta, perdonando lo que se perdona.
 *
 * Un modelo mas barato acierta el contenido pero a veces se deja una coma
 * suelta antes de un cierre. Eso rompe JSON.parse y no vale la pena perder
 * una tanda entera por una coma.
 */
function leerLote(texto) {
  const m = texto.match(/```json\s*([\s\S]*?)```/) || texto.match(/(\{[\s\S]*\})/);
  if (!m) return null;
  const intentos = [
    m[1],
    m[1].replace(/,(\s*[}\]])/g, "$1"), // comas colgando
    m[1].replace(/,(\s*[}\]])/g, "$1").replace(/}\s*{/g, "},{"),
  ];
  for (const t of intentos) {
    try {
      return JSON.parse(t);
    } catch {}
  }
  return null;
}

async function reescenificar(doc, ruta) {
  const todos = doc.bloques.flatMap((b) => b.planos);
  const TANDA = 6;

  // Se salta lo que ya esta bien: asi un fallo a mitad no obliga a rehacer
  // las trece tandas, solo las que falten.
  const cuantasTocan = (p) => Math.min(3, Math.max(1, Math.round((p.vo?.length ?? 0) / 85)));
  const planos = todos.filter((p) => (p.escenas?.length ?? 0) !== cuantasTocan(p));
  const hechos = todos.length - planos.length;
  if (hechos) console.log(`  ${hechos} planos ya estaban bien, se saltan`);
  if (!planos.length) {
    console.log("  no hay nada que rehacer");
    return doc;
  }

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
      modelo: MODELO_ESCENAS,
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
            `EN ESTA TANDA: mete uno o dos planos de tipo "clip", en los que mejor`,
            `encajen. Van repartidos por todo el vídeo, y esta tanda es su parte.`,
            `Si de verdad ninguno pide metraje, no fuerces: mejor ninguno que uno`,
            `pegado con calzador.`,
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

    // Una tanda mal formada no puede costar la pasada entera: se reintenta
    // una vez y, si sigue ilegible, esos planos se quedan como estaban. Como
    // esto es reanudable, la proxima pasada los recoge.
    const lote = leerLote(texto);
    if (!lote) {
      console.log("JSON ilegible, esta tanda se queda como estaba");
      continue;
    }
    let n = 0;
    for (const [id, escenas] of Object.entries(lote)) {
      const p = todos.find((x) => x.id === id);
      if (!p || !Array.isArray(escenas) || !escenas.length) continue;
      // Se conservan id, vo y voz: los mp3 estan atados a ellos.
      for (const k of Object.keys(p)) {
        if (!["id", "vo", "voz"].includes(k)) delete p[k];
      }
      p.tipo = escenas[0].tipo;
      p.escenas = escenas;
      n += escenas.length;
    }
    console.log(`${n} escenas`);

    // Guardar tras cada tanda. Trece llamadas a la API no pueden depender de
    // que las trece salgan: lo hecho se queda hecho.
    if (ruta) fs.writeFileSync(ruta, JSON.stringify(doc, null, 2));
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
  for (const [t, campo] of [["clip", "clip"], ["recorte", "recorte"]]) {
    if (p.tipo !== t) continue;
    const b = p[campo]?.buscar;
    if (!b) di(`${donde}: '${t}' necesita '${campo}': { "buscar": "..." } en inglés`);
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
    // Cinco o seis segundos por escena: menos no da tiempo a leer un grafico,
    // mas se queda quieto. El ritmo lo pone lo que se mueve dentro.
    const largo = p.vo?.length ?? 0;
    const segundos = largo / 15.8;
    const hacen = Math.min(3, Math.max(1, Math.round(largo / 85)));
    if (n < hacen) {
      di(
        `${p.id}: ${n === 0 ? "no tiene 'escenas'" : `solo tiene ${n}`}. ` +
          `Son ${segundos.toFixed(0)} segundos de locución y hacen falta ${hacen} escenas, ` +
          `o la imagen se queda quieta ${(segundos / Math.max(n, 1)).toFixed(0)} segundos.`
      );
    }
    if (n > hacen + 1) {
      di(
        `${p.id}: ${n} escenas para ${segundos.toFixed(0)} segundos salen a ` +
          `${(segundos / n).toFixed(1)} s cada una. Con menos de cinco no da tiempo a leer: ` +
          `déjalo en ${hacen}.`
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

  // Reparto visual. El video anterior salio con dos tercios de la pantalla en
  // texto o grafico y se hacia pesado; esto lo caza antes de renderizar.
  const escenas = planos.flatMap((p) => p.escenas ?? [p]);
  if (escenas.length > 40) {
    const cuenta = (...ts) => escenas.filter((e) => ts.includes(e.tipo)).length;
    const pc = (n) => Math.round((n / escenas.length) * 100);

    const imagen = cuenta("clip", "recorte", "objeto", "retrato", "dublin", "torres");
    if (pc(imagen) < 42) {
      di(
        `solo el ${pc(imagen)} % de las escenas es imagen (clip, recorte, objeto, retrato). ` +
          `Tiene que pasar del 45 %: cambia pantallas de texto y de gráfico por recortes y clips.`
      );
    }
    const fr = cuenta("frase");
    if (pc(fr) > 18) {
      di(`el ${pc(fr)} % de las escenas son pantallas de texto ("frase"). El tope es 15 %.`);
    }
    const graf = cuenta("barras", "lineas", "contador");
    if (pc(graf) > 28) {
      di(`el ${pc(graf)} % son gráficos. El tope es 25 %: no todos los datos necesitan gráfico.`);
    }
    const cl = cuenta("clip");
    if (pc(cl) < 12) di(`solo hay ${cl} clips (${pc(cl)} %). Tienen que ser cerca del 20 %.`);
    const rc = cuenta("recorte");
    if (pc(rc) < 10) di(`solo hay ${rc} recortes de revista (${pc(rc)} %). Tienen que ser cerca del 18 %.`);
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
    const nuevo = await reescenificar(doc, ruta);

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
