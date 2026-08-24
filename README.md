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
