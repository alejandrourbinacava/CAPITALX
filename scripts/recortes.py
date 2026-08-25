"""
Recorta a una persona del fondo y la deja en blanco y negro con borde de color.

Es el mecanismo Vox aplicado a personas: sujeto recortado, tratado en tinta, y
una copia plana desplazada por detrás en carmín u ocre. El borde no se dibuja
con un trazo fino, que a este tamaño desaparece, sino dilatando la silueta:
así queda un contorno grueso y limpio como el de un recorte de revista.

    python scripts/recortes.py                 todas las fotos de la carpeta
    python scripts/recortes.py --tono ocre     cambia el color del borde

Entrada:  assets/retratos-fuente/<nombre>.jpg
Salida:   public/recortes/<nombre>.png   (con transparencia)
"""

import argparse
import os

import numpy as np
from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

FUENTE = "assets/retratos-fuente"
DESTINO = "public/recortes"
ANCHO = 1000

TONOS = {"carmin": (200, 64, 44), "ocre": (232, 179, 60)}
TINTA = (20, 24, 26)


def quitar_fondo(im):
    """rembg devuelve la imagen con canal alfa; el modelo ligero basta."""
    from rembg import remove, new_session

    if not hasattr(quitar_fondo, "_ses"):
        quitar_fondo._ses = new_session("u2netp")
    return remove(im, session=quitar_fondo._ses)


def limpiar_alfa(alfa, umbral=140):
    """
    El alfa de rembg viene con un halo semitransparente, sobre todo en el pelo.
    Se endurece con un umbral y se suaviza un punto para que no quede aserrado.
    """
    a = np.array(alfa, dtype=np.uint8)
    a = np.where(a > umbral, 255, 0).astype(np.uint8)
    m = Image.fromarray(a, "L")
    m = m.filter(ImageFilter.MedianFilter(5))      # quita motas sueltas
    m = m.filter(ImageFilter.GaussianBlur(0.8))    # borde suave, no dentado
    return m


def a_tinta(rgb, alfa):
    """Blanco y negro contrastado, en la tinta del canal."""
    gris = ImageOps.grayscale(rgb)
    gris = ImageOps.autocontrast(gris, cutoff=2)
    gris = gris.point(lambda v: int(255 * (v / 255) ** 0.85))
    gris = ImageEnhance.Contrast(gris).enhance(1.3)
    gris = ImageOps.posterize(gris, 4)
    # trama fina, para que no parezca una foto desaturada
    w, h = gris.size
    trama = Image.new("L", (w, h), 255)
    px = trama.load()
    for y in range(0, h, 3):
        for x in range(w):
            px[x, y] = 232
    gris = ImageChops.multiply(gris, trama)
    tintada = ImageOps.colorize(gris, black=TINTA, white=(245, 242, 233))
    tintada.putalpha(alfa)
    return tintada


def borde(alfa, grosor):
    """Dilata la silueta para obtener un contorno grueso."""
    m = alfa
    for _ in range(grosor):
        m = m.filter(ImageFilter.MaxFilter(3))
    return m


def procesar(entrada, salida, tono="carmin", grosor=9, desplazamiento=26):
    im = Image.open(entrada).convert("RGB")
    f = ANCHO / im.size[0]
    im = im.resize((ANCHO, int(im.size[1] * f)), Image.LANCZOS)

    recortada = quitar_fondo(im)
    alfa = limpiar_alfa(recortada.split()[-1])
    cobertura = np.array(alfa).mean() / 255
    sujeto = a_tinta(im, alfa)

    # lienzo con margen para que quepan borde y sombra
    m = grosor + desplazamiento + 12
    W, H = im.size[0] + m * 2, im.size[1] + m * 2
    lienzo = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    color = TONOS[tono]
    contorno = borde(alfa, grosor)

    # 1. sombra plana desplazada
    sombra = Image.new("RGBA", contorno.size, color + (255,))
    sombra.putalpha(contorno)
    lienzo.alpha_composite(sombra, (m + desplazamiento, m + desplazamiento))

    # 2. el mismo contorno sin desplazar: hace de borde
    borde_img = Image.new("RGBA", contorno.size, color + (255,))
    borde_img.putalpha(contorno)
    lienzo.alpha_composite(borde_img, (m, m))

    # 3. el sujeto encima
    lienzo.alpha_composite(sujeto, (m, m))

    os.makedirs(os.path.dirname(salida), exist_ok=True)
    lienzo.save(salida, "PNG", optimize=True)
    return lienzo.size, cobertura


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--tono", default="carmin", choices=list(TONOS))
    ap.add_argument("--solo", help="procesa solo este nombre")
    a = ap.parse_args()

    for f in sorted(os.listdir(FUENTE)):
        if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            continue
        nombre = os.path.splitext(f)[0]
        if a.solo and nombre != a.solo:
            continue
        tam, cob = procesar(
            os.path.join(FUENTE, f), os.path.join(DESTINO, nombre + ".png"), a.tono
        )
        aviso = "  ← revisa el recorte" if cob < 0.12 or cob > 0.85 else ""
        print(f"  {nombre}.png  {tam[0]}x{tam[1]}  sujeto {cob*100:.0f}% del cuadro{aviso}")
    print(f"en {DESTINO}/")
