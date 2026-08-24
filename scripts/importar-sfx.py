"""
Importa efectos de sonido externos al proyecto.

Los archivos que uno se descarga vienen con silencio delante, cola larga y
niveles dispares. Este script los deja listos para montaje:

  1. convierte a 48 kHz estereo
  2. recorta al tramo con energia de verdad (la ventana mas fuerte)
  3. aplica entrada y salida suaves para que no chasquee
  4. normaliza al mismo pico, para que el volumen lo decida el montaje
     y no el archivo

Uso:  python scripts/importar-sfx.py
"""

import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 48000
OUT = "public/sfx"
DESCARGAS = os.path.expanduser("~/Downloads")

# origen -> (nombre final, duracion objetivo en segundos, cola extra)
FUENTES = [
    ("Woosh.mp3", "whoosh.wav", 1.30, 0.0),
    ("Pixel-Crush-Pop.wav", "pixel.wav", 0.70, 0.25),
    ("Digital-Buzz-Malfunction.mp3", "buzz.wav", 1.10, 0.20),
    ("Sound EFFECT paper clumping, kertas kusut.mp3", "papel.wav", 0.85, 0.15),
]


def a_wav(src):
    """Descodifica a 48 kHz estereo. -vn descarta la caratula incrustada."""
    tmp = tempfile.mktemp(suffix=".wav")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", src, "-vn",
         "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", tmp],
        check=True,
    )
    with wave.open(tmp, "rb") as w:
        d = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2")
    os.unlink(tmp)
    return d.reshape(-1, 2).astype(np.float64) / 32768.0


def ventana_fuerte(mono, dur):
    """Devuelve el inicio de la ventana de `dur` segundos con mas energia."""
    n = int(dur * SR)
    if mono.size <= n:
        return 0
    energia = np.cumsum(np.concatenate([[0.0], mono**2]))
    sumas = energia[n:] - energia[:-n]
    return int(np.argmax(sumas))


def arranque(mono, inicio, umbral=0.02):
    """Retrocede hasta justo antes del ataque, para no cortarle la entrada."""
    i = inicio
    limite = max(0, inicio - int(0.12 * SR))
    while i > limite and abs(mono[i]) > umbral:
        i -= 1
    while i > limite and abs(mono[i]) <= umbral:
        i -= 1
    return max(0, i - int(0.004 * SR))


def procesar(st, dur, cola):
    mono = st.mean(axis=1)
    ini = arranque(mono, ventana_fuerte(mono, dur))
    fin = min(st.shape[0], ini + int((dur + cola) * SR))
    corte = st[ini:fin].copy()

    ent = int(0.004 * SR)
    sal = int(min(0.09, (fin - ini) / SR * 0.35) * SR)
    corte[:ent] *= np.linspace(0, 1, ent)[:, None]
    if sal > 0:
        corte[-sal:] *= np.linspace(1, 0, sal)[:, None] ** 1.4

    pico = np.max(np.abs(corte))
    if pico > 0:
        corte = corte / pico * 0.89
    return corte


def escribir(path, st):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    print("importando efectos:")
    for origen, destino, dur, cola in FUENTES:
        src = os.path.join(DESCARGAS, origen)
        if not os.path.exists(src):
            print(f"  FALTA  {origen}")
            continue
        st = a_wav(src)
        antes = st.shape[0] / SR
        proc = procesar(st, dur, cola)
        escribir(os.path.join(OUT, destino), proc)
        escribir(os.path.join("assets/sfx", destino), proc)
        print(f"  {destino:14s} {antes:5.2f}s -> {proc.shape[0]/SR:.2f}s   ({origen})")
    print(f"en {OUT}/")
