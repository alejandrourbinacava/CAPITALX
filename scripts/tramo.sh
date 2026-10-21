#!/bin/bash
# Renderiza un tramo de un video: scripts/tramo.sh <slug> <ini> <fin> <salida.mp4> [calidad]
#
# Los renders largos mueren por cosas ajenas (Chrome que no arranca a tiempo,
# un corte de red al bajar una fuente). Por eso cada tramo se reintenta tres
# veces antes de darlo por perdido. Es lo mismo que se hacia a mano en local.
set -u
SLUG="$1"; INI="$2"; FIN="$3"; SALIDA="$4"; CALIDAD="${5:-80}"
CONC="${CONCURRENCIA:-4}"

mkdir -p "$(dirname "$SALIDA")"
for intento in 1 2 3; do
  echo "tramo $INI-$FIN (intento $intento)"
  rm -rf "${TMPDIR:-/tmp}"/remotion-* 2>/dev/null
  rm -f "$SALIDA"
  if npx remotion render "$SLUG" "$SALIDA" \
      --frames="$INI-$FIN" --crf=24 --jpeg-quality="$CALIDAD" \
      --concurrency="$CONC" --timeout=180000 --log=info; then
    if [ -s "$SALIDA" ]; then echo "tramo hecho"; exit 0; fi
  fi
  echo "fallo del tramo; espero 30 s"
  sleep 30
done
echo "el tramo $INI-$FIN no se pudo renderizar"
exit 1
