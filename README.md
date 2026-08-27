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

## Renderizar en la nube

No hace falta tu ordenador. En GitHub, pestaña **Actions**:

- **Renderizar vídeo** — eliges el slug (`irlanda`, `noruega`, `mexico`…), le das
  a *Run workflow* y al terminar descargas el MP4 desde *Artifacts*. Tarda entre
  45 y 90 minutos, porque las máquinas de GitHub son más lentas que un portátil.
- **Generar locución** — locuta solo los planos que aún no tienen audio y los
  guarda en el repositorio, para que los renders siguientes no gasten créditos.
  Marca *solo_contar* si únicamente quieres saber cuánto costaría.

El repositorio es privado a propósito: contiene los audios de la voz clonada y
las fotos originales de los retratos. Con 2.000 minutos al mes de Actions dan
para unos 25 vídeos, más que de sobra para el ritmo de publicación.

Para que la locución funcione en la nube hay que crear el secreto
`AI33_API_KEY` en *Settings > Secrets and variables > Actions*.

---

## El vídeo de cada mañana

`.github/workflows/diario.yml` se despierta solo a las 05:12 de Madrid y a las
ocho tienes el vídeo en YouTube Studio, en privado, esperando a que lo revises.

La cadena entera dura unas dos horas y media:

| | | |
|---|---|---|
| 1 | Coge el primer tema de `content/cola.json` | |
| 2 | Lo investiga con búsqueda web y guarda la ficha en `content/fichas/` | ~3 min |
| 3 | Escribe el guion y lo valida contra lo que el montaje sabe dibujar | ~4 min |
| 4 | Lo locuta con la voz clonada | ~25 min |
| 5 | Lo renderiza y lo masteriza a −14 LUFS | ~50 min |
| 6 | Lo sube al canal **en privado** | ~3 min |
| 7 | Archiva el guion y avanza la cola | |

Nada se publica solo. El vídeo queda privado: solo lo ves tú, y se hace público
con un clic cuando lo has visto entero.

### Secretos que necesita

En *Settings > Secrets and variables > Actions*:

| Secreto | Para qué |
|---|---|
| `ANTHROPIC_API_KEY` | investigar y escribir el guion |
| `AI33_API_KEY` | locutar con la voz clonada |
| `YT_CLIENT_ID` `YT_CLIENT_SECRET` `YT_REFRESH_TOKEN` | subir al canal |

Los tres de YouTube salen de un solo comando, una sola vez:

```bash
node scripts/youtube-token.mjs
```

La cabecera de `scripts/youtube-token.mjs` explica los cuatro clics previos en
Google Cloud. **Publica la aplicación**: si la dejas en modo prueba, Google
caduca el permiso a los siete días y esto se para solo.

### La cola

`content/cola.json` manda. El flujo coge `cola[0]`, y al terminar lo mueve a
`hechos` con la fecha. Reordena el fichero cuando quieras: mañana sale el que
hayas puesto primero. Cuando la cola se vacía, el flujo falla avisando.

### Probar sin esperar a mañana

Desde *Actions > Vídeo diario > Run workflow*. Puedes forzar un tema con su
slug, y desmarcar *subir* para que solo deje el MP4 en los artefactos.

Para ver si un guion es montable antes de gastar créditos:

```bash
npm run probar-guion
```

### Lo que conviene vigilar

**Minutos de Actions.** Un vídeo diario gasta unos 80 minutos de máquina. El
plan gratuito da 2.000 al mes para repositorios privados, así que la cuenta
sale justa: alrededor del día 25 se agota. Si pasa, o se pagan los minutos de
más, o se baja a días alternos cambiando el `cron`.

**Créditos de ai33.** Unos 18.000 por vídeo. Es el gasto grande de todo esto.

**Peso del repositorio.** Los mp3 de cada vídeo se guardan para poder
re-renderizar sin volver a pagar la locución. Son unos 5 MB por vídeo, 150 MB
al mes. Cuando estorbe, se borran los de los vídeos ya publicados.
