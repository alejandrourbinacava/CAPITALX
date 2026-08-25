"""
Convierte una fotografía en un retrato de prensa.

Blanco y negro, contraste de periódico y trama de grabado: el resultado no
parece una foto en escala de grises, parece impreso. El tratamiento va aquí,
en código, no en el origen: así los treinta vídeos salen iguales aunque las
fotos vengan de sitios distintos.

Cómo se usa:

  1. Deja las fotos originales en  assets/retratos-fuente/  con el nombre de
     la persona:  rokke.jpg,  krugman.jpg,  soros.png…
  2. Ejecuta:  python scripts/retratos.py
  3. Aparecen tratadas en  public/retratos/  listas para el guion:

        "retrato": { "nombre": "…", "foto": "retratos/rokke.png" }

Opcional: pasa una URL para descargar antes de tratar.

    python scripts/retratos.py --url https://…/foto.jpg --nombre krugman
"""

import argparse
import math
import os
import subprocess

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

FUENTE = "assets/retratos-fuente"
DESTINO = "public/retratos"
ANCHO = 900


def descargar(url, destino):
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    subprocess.run(
        ["curl", "-s", "-L", "--max-time", "90", "-A", "CapitalX/0.1", url, "-o", destino],
        check=True,
    )
    return destino


def recorte_vertical(im, prop=1.15):
    """Encuadra a proporción de retrato, centrado arriba (donde está la cara)."""
    w, h = im.size
    objetivo_h = int(w * prop)
    if objetivo_h <= h:
        arriba = int((h - objetivo_h) * 0.10)
        return im.crop((0, arriba, w, arriba + objetivo_h))
    objetivo_w = int(h / prop)
    izq = (w - objetivo_w) // 2
    return im.crop((izq, 0, izq + objetivo_w, h))


def trama_grabado(gris, paso=5, amplitud=1.45):
    """
    Rayado horizontal cuyo grosor sigue el tono: es como se graban los
    retratos en prensa desde el siglo XIX. Devuelve una máscara.
    """
    w, h = gris.size
    trama = Image.new("L", (w, h), 255)
    px_g = gris.load()
    px_t = trama.load()
    for y in range(h):
        fase = y % paso
        for x in range(w):
            tono = px_g[x, y] / 255.0
            # cuanto más oscuro el tono, más gruesa la línea
            grosor = (1.0 - tono) * amplitud
            # ondulación leve para que la línea no sea perfectamente recta
            desvio = math.sin(x * 0.035 + y * 0.11) * 0.6
            px_t[x, y] = 0 if abs(fase - paso / 2 + desvio) < grosor else 255
    return trama


def tratar(ruta_entrada, ruta_salida):
    im = Image.open(ruta_entrada).convert("RGB")
    im = recorte_vertical(im)
    im = im.resize((ANCHO, int(ANCHO * im.size[1] / im.size[0])), Image.LANCZOS)

    gris = ImageOps.grayscale(im)
    gris = gris.filter(ImageFilter.MedianFilter(3))          # quita ruido de compresión
    gris = ImageOps.autocontrast(gris, cutoff=2)
    # gamma: levanta las sombras para que el fondo no se cierre en negro
    gris = gris.point(lambda v: int(255 * (v / 255) ** 0.72))
    gris = ImageEnhance.Contrast(gris).enhance(1.22)

    # los bordes dan la sensación de dibujado, no de foto
    bordes = gris.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(3))
    bordes = ImageOps.invert(ImageOps.autocontrast(bordes, cutoff=6))

    # menos tonos: la prensa no imprime degradados
    plano = ImageOps.posterize(gris, 3)

    trama = trama_grabado(plano)

    # rayado y bordes, ambos multiplicados sobre el papel
    salida = ImageChops.multiply(trama, bordes)
    # un punto de tono de fondo para que las zonas claras no queden vacías
    salida = ImageChops.multiply(salida, ImageOps.autocontrast(plano, cutoff=8).point(lambda v: 186 + v * 0.27))

    rgb = ImageOps.colorize(salida, black="#14181A", white="#EFEADC")
    os.makedirs(os.path.dirname(ruta_salida), exist_ok=True)
    rgb.save(ruta_salida, "PNG", optimize=True)
    return rgb.size


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--url")
    ap.add_argument("--nombre")
    a = ap.parse_args()

    if a.url:
        if not a.nombre:
            raise SystemExit("con --url hace falta --nombre")
        ext = os.path.splitext(a.url.split("?")[0])[1] or ".jpg"
        src = descargar(a.url, os.path.join(FUENTE, a.nombre + ext))
        w, h = tratar(src, os.path.join(DESTINO, a.nombre + ".png"))
        print(f"  {a.nombre}.png  {w}x{h}")
    else:
        if not os.path.isdir(FUENTE):
            os.makedirs(FUENTE, exist_ok=True)
            raise SystemExit(f"deja las fotos en {FUENTE}/ y vuelve a ejecutar")
        hechos = 0
        for f in sorted(os.listdir(FUENTE)):
            if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue
            nombre = os.path.splitext(f)[0]
            w, h = tratar(os.path.join(FUENTE, f), os.path.join(DESTINO, nombre + ".png"))
            print(f"  {nombre}.png  {w}x{h}")
            hechos += 1
        print(f"{hechos} retratos en {DESTINO}/")
