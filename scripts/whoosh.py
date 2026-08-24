"""
Whoosh de calidad para Capital X.

El primer intento era ruido blanco con un filtro de un polo (6 dB/oct): eso no
esculpe nada, solo apaga agudos, y suena a siseo de feria. Este esta construido
como se construyen de verdad:

  - ruido marron (no blanco) como cuerpo: mas grave, menos siseo
  - filtro de variable de estado resonante (12 dB/oct, con Q) barriendo
  - tres capas: cuerpo grave, aire medio y brillo agudo, desfasadas
  - una capa de tono con efecto Doppler por debajo, que es lo que da la
    sensacion de que algo pasa de largo
  - movimiento estereo real: barrido de izquierda a derecha con retardo
  - cola de reverberacion por peine, para que no termine en seco

Uso:  python scripts/whoosh.py
"""

import math
import os
import wave

import numpy as np

SR = 48000
OUT = "public/sfx"


def brown(n, seed):
    """Ruido marron: ruido blanco integrado. Cuerpo grave, nada de siseo."""
    w = np.random.default_rng(seed).normal(0, 1, n)
    b = np.cumsum(w)
    b -= np.linspace(b[0], b[-1], n)
    return b / (np.max(np.abs(b)) + 1e-9)


def pink(n, seed):
    """Ruido rosa por suma de octavas. Mas natural que el blanco."""
    rng = np.random.default_rng(seed)
    out = np.zeros(n)
    amp = 1.0
    for octv in range(7):
        step = 2**octv
        vals = rng.normal(0, 1, n // step + 2)
        out += np.repeat(vals, step)[:n] * amp
        amp *= 0.72
    return out / (np.max(np.abs(out)) + 1e-9)


def svf_bandpass(x, fc, q=1.6, sr=SR):
    """
    Filtro de variable de estado, salida de paso banda.
    12 dB/oct y resonancia real, que es lo que le faltaba al anterior.
    """
    n = x.size
    band = np.empty(n)
    low = 0.0
    bp = 0.0
    dq = 1.0 / q
    for i in range(n):
        f = 2.0 * math.sin(math.pi * min(fc[i], sr * 0.45) / sr)
        high = x[i] - low - dq * bp
        bp += f * high
        low += f * bp
        band[i] = bp
    return band / (np.max(np.abs(band)) + 1e-9)


def curva(n, a, pico, b, sesgo=0.55):
    """Barrido que sube hasta `pico` y vuelve a bajar, con el pico desplazado."""
    k = np.linspace(0, 1, n)
    subida = np.clip(k / sesgo, 0, 1) ** 0.75
    bajada = np.clip((k - sesgo) / (1 - sesgo), 0, 1) ** 1.5
    return a + (pico - a) * subida - (pico - b) * bajada


def cola(x, sr=SR, mezcla=0.22):
    """Cola por banco de peines. Evita el final en seco."""
    y = x.copy()
    for d_ms, g in ((23, 0.34), (31, 0.28), (41, 0.22), (53, 0.17)):
        d = int(d_ms * sr / 1000)
        eco = np.zeros_like(x)
        eco[d:] = x[:-d] * g
        y += eco * mezcla
    return y


def env(n, attack, decay, sr=SR, curva_dec=1.6):
    t = np.arange(n) / sr
    a = np.clip(t / attack, 0, 1) ** 1.4
    d = np.exp(-np.maximum(t - attack, 0) / decay) ** curva_dec
    return a * d


def construir(dur=0.72, seed=101, brillo=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR

    # 1. CUERPO — ruido marron barriendo grave
    fc_body = curva(n, 110, 1150, 170)
    body = svf_bandpass(brown(n, seed), fc_body, q=1.3) * 1.65

    # 2. AIRE — la capa que hace el "shhhh", ruido rosa a media altura
    fc_air = curva(n, 420, 2600, 780, sesgo=0.5)
    air = svf_bandpass(pink(n, seed + 7), fc_air, q=2.1) * 0.52

    # 3. BRILLO — agudo, corto y algo retrasado, da el filo
    fc_top = curva(n, 1900, 6200, 2500, sesgo=0.46)
    top = svf_bandpass(pink(n, seed + 13), fc_top, q=2.8)
    top *= np.clip((t - 0.05) / 0.12, 0, 1) * np.exp(-np.maximum(t - 0.17, 0) / 0.11)
    top *= 0.14 * brillo

    # 4. DOPPLER — un tono que pasa de largo: sube y baja de frecuencia
    f_dop = curva(n, 210, 640, 150, sesgo=0.52)
    dop = np.sin(2 * np.pi * np.cumsum(f_dop) / SR) * 0.26

    mono = (body + air + top + dop) * env(n, 0.055, 0.20)
    mono = cola(mono)

    # 5. ESTEREO — barrido de izquierda a derecha mas retardo entre canales
    pan = np.linspace(-0.85, 0.85, n)
    gl = np.sqrt((1 - pan) / 2)
    gr = np.sqrt((1 + pan) / 2)
    d = int(0.007 * SR)
    izq = mono * gl
    der = np.concatenate([np.zeros(d), mono[:-d]]) * gr

    st = np.stack([izq, der], axis=1)
    pico = np.max(np.abs(st))
    if pico > 0:
        st = st / pico * 0.82
    fin = int(0.012 * SR)
    st[-fin:] *= np.linspace(1, 0, fin)[:, None]
    return st


def write(name, st):
    os.makedirs(OUT, exist_ok=True)
    pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"  {name}  {st.shape[0] / SR:.2f}s")


if __name__ == "__main__":
    print("generando whooshes:")
    write("whoosh.wav", construir(0.72, 101, 1.0))
    write("whoosh-corto.wav", construir(0.44, 211, 0.85))
    write("whoosh-largo.wav", construir(1.05, 307, 1.15))
    print(f"en {OUT}/")
