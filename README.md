# Capital X

Sistema de producción de vídeo para el canal. Un guion entra como JSON y sale
un MP4 montado, locutado, sonorizado y masterizado.

## Cómo se hace un vídeo

```bash
npm install                                  # una sola vez
npm run music                                # lecho musical (una sola vez)
npm run importar-sfx                         # efectos de sonido (una sola vez)

node scripts/tts.mjs content/irlanda.json    # locución con la voz clonada
npm run render -- irlanda out/irlanda.mp4    # montaje
npm run master                               # sonoridad a -14 LUFS
```

`npm run studio` abre el editor de Remotion para ver los planos uno a uno.

## Cómo está montado

**El guion manda.** `content/<slug>.json` describe cada plano: qué se ve, qué
se dice y a qué velocidad. Nada más hay que tocar para un vídeo nuevo.

**La voz decide los tiempos.** `scripts/tts.mjs` sintetiza cada línea, guarda
el mp3 y anota su duración real en `<slug>.timings.json`. El montaje lee esas
duraciones: los gráficos se ajustan a la voz, nunca al revés. Si un plano
todavía no tiene audio, se estima a 145 palabras por minuto para poder
previsualizar.

**Todo lo visual es código.** No hay vídeo generativo ni clips de archivo.
Ilustraciones, mapas, gráficos y texturas se dibujan en cada fotograma, así
que son deterministas y se pueden corregir cambiando un número.

## Dirección de arte

Papel crema, tinta negro azulado, ocre para resaltar y carmín como único color
saturado. Cuadrícula, orla, grano animado y trepidación de registro sobre todo
el encuadre: es lo que hace que un mapa, una ilustración y un gráfico parezcan
la misma cosa.

El **rótulo** inferior izquierdo es la constante del canal. Sustituye al
subtítulo: antetítulo en mono, frase en negrita y la palabra clave resaltada en
ocre. En el JSON se marca con asteriscos: `"*17.308* sin casa"`.

## Tipos de plano

| tipo | para qué |
|---|---|
| `dublin` | ilustración nocturna con parallax por capas, encuadre amplio o corto |
| `torres` | contraplano del dinero, con la flecha del PIB |
| `objeto` | doce siluetas recortadas: contable, grúa, carta, balanza, aeropuerto… |
| `mapa` | Europa real, con países destacados, puntos y flechas de salida |
| `barras` | comparaciones, con franja de referencia y corchete de diferencia |
| `lineas` | series de dos extremos |
| `contador` | una cifra que va de A a B entre dos fechas |
| `gente` | rejilla de figuras, con un subconjunto en carmín |
| `lista` | enumeraciones, con un punto activo opcional |
| `frase` | tarjeta de remate, palabra a palabra |
| `cierre` | siguiente vídeo y llamada a suscribirse |

## Sonido

Cuatro efectos del canal (`whoosh`, `papel`, `pixel`, `buzz`) más dos acentos
pequeños. El reparto es automático: whoosh en cada corte, papel al entrar en un
plano sobre papel, pixel cuando aparece una cifra, buzz cuando cae un dato.
`scripts/importar-sfx.py` recorta cualquier descarga nueva a su golpe útil.

La música es síntesis propia (`scripts/music.py`), un bucle de 32 segundos sin
costura. No hay material de terceros en el proyecto, así que no hay reclamos de
copyright posibles.

## Datos

Solo se dibujan cifras que aparecen en el guion y tienen fuente. Cuando de una
serie solo se conocen dos extremos, se usa un `contador` entre esas dos fechas
en vez de inventar los años intermedios.

Los contornos de `src/data/europa.json` salen de Natural Earth (dominio
público), proyectados con Mercator a coordenadas del lienzo.

## Claves

`AI33_API_KEY` va en `.env`, que está en `.gitignore`. Nunca se sube. Si una
clave llega a aparecer en un commit, hay que rotarla: borrarla después no sirve,
queda en el historial.

## De cero a YouTube, todo en GitHub

Escribes el slug en `lanzar.json`, haces commit y push, y GitHub hace el resto:

    lanzar.json  ──►  voz  ──►  preparar  ──►  tramos (N a la vez)  ──►  entrega
                                    └────►  miniatura (OpenAI)  ───────────┘

1. **voz** — locuta solo los planos que faltan (no repite lo ya pagado).
2. **preparar** — baja los clips y láminas una sola vez, los empaqueta y reparte
   el render en tramos de ~5.000 fotogramas (`scripts/plan.mjs`).
3. **tramos** — hasta 20 jobs a la vez, cada uno renderiza un trozo
   (`scripts/tramo.sh`, con 3 reintentos). Un vídeo de 33 minutos son unos 12.
4. **miniatura** — OpenAI dibuja el fondo **sin texto** y Remotion pone el
   titular con la tipografía del canal (`scripts/miniatura.mjs`,
   `src/scenes/Miniatura.tsx`). El encargo (titular, palabra en amarillo y
   escena) vive en `publicacion.miniatura` del guion; si falta, lo propone Claude.
5. **entrega** — une los tramos, masteriza a -14 LUFS, comprueba que la duración
   cuadra con la locución, guarda el vídeo en una *release* y lo sube a YouTube
   con miniatura, capítulos reales y etiquetas (`scripts/subir.mjs`).

También se puede lanzar con el botón **Actions > Vídeo completo > Run workflow**.

### `lanzar.json`

| Campo | Qué hace |
|---|---|
| `video` | slug de un guion de `content/` (el caso normal) |
| `tema` | alternativa: un slug de `content/cola.json`; la cadena investiga y escribe el guion (≈1,84 $ de API) |
| `publicar` | `public` (por defecto), `unlisted` o `private` |
| `programar` | fecha ISO: sube en privado y YouTube lo publica solo a esa hora |
| `solo_render` | `true` si ya está locutado: cero créditos de voz |
| `tramo` | fotogramas por tramo (menos = más jobs a la vez) |

Un guion nuevo ya **no** hay que registrarlo a mano en `src/Root.tsx`:
`scripts/catalogo.mjs` genera `src/catalogo.generated.ts` desde `content/`.

### Secretos (Settings > Secrets and variables > Actions)

| Secreto | Para qué |
|---|---|
| `GENAIPRO_API_KEY` (o `AI33_API_KEY`) | la voz |
| `PEXELS_API_KEY`, `PIXABAY_API_KEY` | clips de stock |
| `OPENAI_API_KEY` | la miniatura (modelo `gpt-image-1`; OpenAI pide verificar la organización) |
| `ANTHROPIC_API_KEY` | solo con `tema`, o si el guion no trae encargo de miniatura |
| `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN` | subir al canal (`node scripts/youtube-token.mjs`, una vez) |

Al empezar, la ejecución escribe en su resumen qué secretos faltan y qué pasará
sin ellos, antes de gastar nada.

### Lo que protege la cadena

- **No sube dos veces**: al terminar escribe `content/<slug>.publicado.json`.
- **Miniatura de reserva = privado**: si OpenAI falla, el vídeo no sale en abierto.
- **Un tramo perdido se nota**: la duración final se compara con la locución.
- **Si algo falla tarde** (p. ej. la subida) los tramos siguen guardados y basta con
  *Re-run failed jobs*, sin volver a renderizar.

### Límite de YouTube que no se puede saltar desde aquí

YouTube deja como **privados** los vídeos subidos por API desde un proyecto de
Google que no haya pasado su auditoría (*YouTube API Services – Audit and Quota
Extension*). El script lo detecta y lo dice en el resumen: el vídeo queda subido,
con título, descripción, capítulos y miniatura, pero hay que publicarlo a mano o
pasar la auditoría.

### Render de un solo job (antiguo)

**Renderizar vídeo** (`render.yml`) sigue ahí para vídeos cortos: un único
runner, el MP4 va a una *release*. **Generar locución** (`voz.yml`) locuta sin
renderizar; marca *solo_contar* para saber cuánto costaría.

---

## Cómo se hace un vídeo

El guion —investigar y escribir— se hace **en la conversación, no con la API**.
Ahí es donde se iba el dinero: veinte guiones investigados y escritos que se
tiraron por fallos de la cadena. Ahora solo se paga la voz.

    1. Se elige el tema y se investiga con búsqueda web
    2. Se escribe content/<tema>.json a mano, con el esquema de siempre
    3. npm run revisar content/<tema>.json          comprueba sin gastar nada
    4. Actions > Generar locución    (video: <tema>)  ~20.000 créditos
    5. Actions > Renderizar vídeo    (video: <tema>)  gratis

`scripts/guion.mjs` sigue ahí y funciona, pero ya no se usa en el día a día:
son unos 1,84 dólares por vídeo y lo mismo se hace aquí sin coste de API.

## El vídeo de cada mañana

`.github/workflows/diario.yml` se despierta solo a las 05:12 de Madrid. Sobre
las siete y media el vídeo está listo para descargar en la pestaña *Actions*,
dentro de la ejecución de ese día, en **Artifacts**.

La cadena entera dura unas dos horas y cuarto:

| | | |
|---|---|---|
| 1 | Coge el primer tema de `content/cola.json` | |
| 2 | Lo investiga con búsqueda web y guarda la ficha en `content/fichas/` | ~3 min |
| 3 | Escribe el guion y lo valida contra lo que el montaje sabe dibujar | ~4 min |
| 4 | Lo locuta con la voz clonada | ~25 min |
| 5 | Lo renderiza y lo masteriza a −14 LUFS | ~50 min |
| 6 | Archiva el guion y avanza la cola | |

En el resumen de la ejecución tienes, además del MP4, el título, la
descripción y las etiquetas listos para copiar y pegar en YouTube Studio.

### Secretos que necesita

En *Settings > Secrets and variables > Actions*:

| Secreto | Para qué |
|---|---|
| `ANTHROPIC_API_KEY` | investigar y escribir el guion |
| `AI33_API_KEY` | locutar con la voz clonada |

### La cola

`content/cola.json` manda. El flujo coge `cola[0]`, y al terminar lo mueve a
`hechos` con la fecha. Reordena el fichero cuando quieras: mañana sale el que
hayas puesto primero. Cuando la cola se vacía, el flujo falla avisando.

Si un día algo se rompe, la cola **no** avanza: al día siguiente se reintenta
el mismo tema.

### Probar sin esperar a mañana

Desde *Actions > Vídeo diario > Run workflow*. Puedes forzar un tema con su
slug.

Para ver si un guion es montable antes de gastar créditos:

```bash
npm run probar-guion
```

### Cuánto da de sí el mes

Un vídeo gasta unos **75 minutos** de máquina. El plan gratuito da 2.000 al
mes en repositorios privados, así que salen **unos 26 vídeos**: los últimos
días de cada mes se para solo y vuelve el día 1. Si quieres los treinta, hay
que pagar los minutos de más.

En créditos de ai33 son unos **18.000 por vídeo**. Ese es el gasto de verdad.

Los mp3 de cada vídeo se guardan para poder re-renderizar sin volver a pagar
la locución: unos 5 MB por vídeo, 150 MB al mes. Cuando estorbe, se borran los
de los vídeos ya publicados.

### Si algún día quieres que suba solo

Está hecho y se salta solo mientras no existan los secretos. `scripts/subir.mjs`
sube el vídeo al canal **en privado**, y los tres secretos que necesita salen
de `node scripts/youtube-token.mjs`. Un aviso antes de meterte: YouTube deja
bloqueados como privados los vídeos subidos por una API sin auditar, así que
hasta pasar su auditoría no podrías publicarlos. Por eso hoy los descargas.

### Correcciones: qué cuesta y qué no

La mayoría de las correcciones **no necesitan ni una llamada a la API**. Antes
de relanzar nada, mirar en qué capa está el problema:

| Lo que se ve mal | Dónde se arregla | Coste |
|---|---|---|
| Un recorte cortado, un clip mal tratado | `scripts/recortes.py`, `Clip.tsx` | 0 |
| Escenas largas o cortas, gráficos sin ritmo | `Video.tsx`, `Barras.tsx`, `Rotulo.tsx` | 0 |
| Colores, tipografía, posiciones | `theme.ts` y componentes | 0 |
| Un clip que no viene a cuento | cambiar `buscar` a mano en el JSON | 0 |
| Falta variedad de escenas, reparto desequilibrado | reescenificar | 19 llamadas |
| El texto está mal escrito o falta un dato | reescribir el guion | voz otra vez |

Reescenificar **no rehace lo que ya está bien**. Solo con `--rehacer todo` se
tiran las escenas buenas, y eso solo tiene sentido cuando cambia el reparto
entero. Para retocar una parte, `--rehacer b3,b7`.

Y el guion escrito no se toca nunca por una corrección visual: los mp3 están
atados a su texto, así que reescribirlo son veinte mil créditos de voz.
