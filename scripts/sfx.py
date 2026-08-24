"""
Libreria de sonidos para Capital X.

Todo sintetizado desde cero, igual que la musica: ni un solo sample de
terceros, asi que no hay licencias que vigilar. Se generan una vez y se
reutilizan en los treinta videos.

Uso:  python scripts/sfx.py
"""

import math
import os
import wave

import numpy as np

SR = 48000
OUT = "public/sfx"


def env_ad(n, attack, decay, sr=SR):
    """Envolvente ataque-decaimiento exponencial."""
    t = np.arange(n) / sr
    a = np.clip(t / max(attack, 1e-5), 0, 1)
    d = np.exp(-np.maximum(t - attack, 0) / max(decay, 1e-5))
    return a * d


def lowpass_tv(x, cutoff, sr=SR):
    """Paso bajo de un polo con frecuencia de corte variable en el tiempo."""
    y = np.empty_like(x)
    acc = 0.0
    dt = 1.0 / sr
    for i in range(x.size):
        rc = 1.0 / (2 * math.pi * max(cutoff[i], 20.0))
        a = dt / (rc + dt)
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff, sr=SR):
    return x - lowpass_tv(x, np.full(x.size, cutoff), sr)


def noise(n, seed):
    return np.random.default_rng(seed).normal(0, 1, n)


def whoosh(dur=0.46, seed=11):
    """Barrido de aire. Para los cortes entre planos."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = t / dur
    cut = 400 + 5200 * np.sin(np.pi * k) ** 1.4
    x = lowpass_tv(noise(n, seed), cut)
    x = highpass(x, 260)
    return x * env_ad(n, 0.10, 0.16) * 0.9


def tick(dur=0.14, freq=2050, seed=3):
    """Clic corto. Cada vez que entra una etiqueta."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.02 * t)
    click = highpass(noise(n, seed), 3000) * np.exp(-t / 0.004)
    return (body * env_ad(n, 0.0012, 0.032) + click * 0.5) * 0.55


def slab(dur=0.26, seed=5):
    """Barrido corto y seco. Acompana al resalte ocre cuando se despliega."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = t / dur
    cut = 900 + 6500 * k
    x = lowpass_tv(noise(n, seed), cut)
    x = highpass(x, 700)
    tone = np.sin(2 * np.pi * (320 + 480 * k) * t) * 0.22
    return (x + tone) * env_ad(n, 0.006, 0.075) * 0.75


def thud(dur=0.62, seed=7):
    """Golpe grave. Para las cifras grandes y los cortes a tarjeta."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 120 * np.exp(-t * 16.0) + 44
    body = np.sin(2 * np.pi * np.cumsum(f) / SR)
    snap = highpass(noise(n, seed), 1800) * np.exp(-t / 0.010) * 0.25
    return (body * env_ad(n, 0.002, 0.14) + snap) * 0.95


def riser(dur=0.9, seed=13):
    """Tension ascendente. Se pone justo antes de una frase de remate."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = t / dur
    f = 180 * (2 ** (k * 2.4))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    air = lowpass_tv(noise(n, seed), 600 + 7000 * k**2) * 0.5
    return (tone + air) * (k**1.7) * 0.8


def pop(dur=0.18, seed=17):
    """Burbuja breve. Para elementos pequenos que aparecen en serie."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 780 * np.exp(-t * 22) + 240
    body = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return body * env_ad(n, 0.0018, 0.038) * 0.6


def write(name, mono):
    os.makedirs(OUT, exist_ok=True)
    peak = np.max(np.abs(mono))
    if peak > 0:
        mono = mono / peak * 0.82
    # rampa final para que ningun sonido corte de golpe
    tail = min(int(0.01 * SR), mono.size)
    mono[-tail:] *= np.linspace(1, 0, tail)
    st = np.stack([mono, mono], axis=1)
    pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
    path = os.path.join(OUT, name)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"  {name}  {mono.size / SR:.2f}s")


if __name__ == "__main__":
    print("generando efectos:")
    write("whoosh.wav", whoosh())
    write("tick.wav", tick())
    write("slab.wav", slab())
    write("thud.wav", thud())
    write("riser.wav", riser())
    write("pop.wav", pop())
    print(f"en {OUT}/")
