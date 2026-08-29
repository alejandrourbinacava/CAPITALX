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
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

FUENTE = "assets/retratos-fuente"
DESTINO = "public/recortes"
ANCHO = 1000

TONOS = {"carmin": (200, 64, 44), "ocre": (232, 179, 60)}
TINTA = (20, 24, 26)


def desencuadrar_circulo(im, tol=18):
    """
    Las fotos de perfil vienen recortadas en circulo sobre blanco. Si se le
    pasan asi, el modelo toma el circulo entero por sujeto y se queda con el
    fondo dentro. Se detectan las esquinas planas y se recorta al cuadrado
    interior antes de segmentar.
    """
    a = np.asarray(im.convert("RGB"), dtype=int)
    h, w = a.shape[:2]
    c = min(h, w) // 12
    esquinas = [a[:c, :c], a[:c, -c:], a[-c:, :c], a[-c:, -c:]]
    planas = sum(1 for e in esquinas if e.std() < tol)
    if planas < 3:
        return im
    lado = int(min(h, w) / 1.42)          # cuadrado inscrito en el circulo
    x = (w - lado) // 2
    y = (h - lado) // 2
    return im.crop((x, y, x + lado, y + lado))


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
    m = rellenar_huecos(m)                         # camisas y fondos claros
    m = solidificar_base(m)                        # hombros cortados por el encuadre
    m = m.filter(ImageFilter.GaussianBlur(0.8))    # borde suave, no dentado
    return m


def solidificar_base(mascara, banda=0.10):
    """
    Cuando la foto corta al sujeto por los hombros, la mascara se deshilacha
    en las ultimas filas y el borde de color asoma a trozos. Se toma el ancho
    del sujeto justo encima de esa franja y se rellena solido hacia abajo.
    """
    a = np.array(mascara)
    h, w = a.shape
    if (a[-1] > 8).mean() < 0.05:
        return mascara                              # no toca el borde: nada que hacer
    corte = int(h * (1 - banda))
    fila = a[corte]
    xs = np.where(fila > 128)[0]
    if xs.size < 2:
        return mascara
    a[corte:, xs.min():xs.max() + 1] = 255
    return Image.fromarray(a, "L")


def rellenar_huecos(mascara):
    """
    El modelo se come zonas claras dentro del sujeto (una camisa blanca, un
    reflejo) y por esos agujeros asoma el borde de color. Se inunda el fondo
    desde los cuatro lados: lo que queda vacio sin tocar el marco es un hueco
    interior y se rellena.
    """
    w, h = mascara.size
    fuera = ImageOps.invert(mascara)               # fondo = 255
    lienzo = Image.new("L", (w + 2, h + 2), 255)   # marco de 1 px para inundar
    lienzo.paste(fuera, (1, 1))
    ImageDraw.floodfill(lienzo, (0, 0), 0, thresh=100)
    huecos = lienzo.crop((1, 1, w + 1, h + 1)).point(lambda v: 255 if v > 128 else 0)
    return ImageChops.lighter(mascara, huecos)


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


def solo_el_sujeto(alfa, minimo=0.04):
    """
    Se queda con la mancha mas grande y tira las demas.

    rembg suele dejar trozos sueltos: una sombra en una esquina, un objeto del
    fondo que confunde con el sujeto. En pantalla son manchas con borde de
    color flotando en el vacio, y ademas ensanchan la caja de recorte, asi que
    el sujeto acaba pequeno y descentrado.

    Se conservan las manchas que llegan a un cuatro por ciento de la mayor:
    asi no se pierde un brazo separado o un objeto que el sujeto sostiene.
    """
    try:
        from scipy import ndimage
    except ImportError:
        return alfa

    a = np.array(alfa) > 128
    etiquetas, n = ndimage.label(a)
    if n <= 1:
        return alfa

    areas = ndimage.sum(a, etiquetas, range(1, n + 1))
    mayor = areas.max()
    vivas = [i + 1 for i, x in enumerate(areas) if x >= mayor * minimo]
    limpio = np.isin(etiquetas, vivas)
    return Image.fromarray((np.array(alfa) * limpio).astype(np.uint8), "L")


def ajustar_al_sujeto(im, alfa, margen=0.04):
    """
    Recorta la imagen a lo que ocupa el sujeto.

    Una foto de archivo casi nunca lo trae centrado: sale a un lado, con medio
    cuadro de fondo que al quitarlo deja un hueco enorme. En el montaje eso se
    ve como una figura pegada a un borde. Se busca la caja del sujeto y se
    recorta a ella con un respiro alrededor.
    """
    a = np.array(alfa)
    filas = np.where(a.max(axis=1) > 8)[0]
    cols = np.where(a.max(axis=0) > 8)[0]
    if filas.size < 2 or cols.size < 2:
        return im, alfa

    h, w = a.shape
    m = int(min(h, w) * margen)
    y0, y1 = max(0, filas.min() - m), min(h, filas.max() + 1 + m)
    x0, x1 = max(0, cols.min() - m), min(w, cols.max() + 1 + m)
    caja = (x0, y0, x1, y1)
    return im.crop(caja), alfa.crop(caja)


def procesar(entrada, salida, tono="carmin", grosor=9, desplazamiento=26, ajustar=False):
    im = Image.open(entrada).convert("RGB")
    im = desencuadrar_circulo(im)
    f = ANCHO / im.size[0]
    im = im.resize((ANCHO, int(im.size[1] * f)), Image.LANCZOS)

    recortada = quitar_fondo(im)
    alfa = limpiar_alfa(recortada.split()[-1])
    if ajustar:
        alfa = solo_el_sujeto(alfa)
        im, alfa = ajustar_al_sujeto(im, alfa)
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

    # Si el sujeto llega al borde inferior (foto cortada por los hombros), el
    # contorno dibuja ahi el filo de la imagen y queda deshilachado. Se corta
    # a ras para que la figura se salga limpia por abajo, como un recorte.
    ultima = np.array(alfa)[-1]
    if (ultima > 8).mean() > 0.15:
        lienzo = lienzo.crop((0, 0, W, m + im.size[1]))

    os.makedirs(os.path.dirname(salida), exist_ok=True)
    lienzo.save(salida, "PNG", optimize=True)
    return lienzo.size, cobertura


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--tono", default="carmin", choices=list(TONOS))
    ap.add_argument("--solo", help="procesa solo este nombre")
    ap.add_argument("--entrada", help="una foto suelta, en vez de la carpeta")
    ap.add_argument("--salida", help="donde dejarla")
    ap.add_argument("--ajustar", action="store_true",
                    help="recorta al sujeto; para fotos de archivo, que vienen descentradas")
    a = ap.parse_args()

    # Una sola foto. Lo usa el flujo automatico: baja una imagen de archivo,
    # la recorta y la trata aqui, y el resultado entra en el montaje como un
    # PNG mas. Es el mismo tratamiento que se le da a las personas reales.
    if a.entrada:
        tam, cob = procesar(a.entrada, a.salida, a.tono, ajustar=a.ajustar)
        print(f"{tam[0]}x{tam[1]}  sujeto {cob*100:.0f}% del cuadro")
        if cob < 0.06 or cob > 0.92:
            # Sin sujeto claro el recorte no dice nada: mejor avisar y que
            # quien llama decida caerse a otra cosa.
            raise SystemExit(3)
        raise SystemExit(0)

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
