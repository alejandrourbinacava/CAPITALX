"""
Lecho musical de misterio para Capital X.

Genera un loop original de 32 s (8 compases a 60 bpm) que se puede repetir sin
costura. Todo es sintesis propia: no hay muestras de terceros, asi que no hay
ningun derecho de autor implicado.

Uso:  python scripts/music.py [--seconds 32] [--out assets/music/mystery.wav]
"""

import argparse
import math
import os
import wave

import numpy as np

SR = 48000
ROOT = "D"  # re menor natural

# Frecuencias base (re menor)
NOTES = {
    "D1": 36.71, "A1": 55.00, "D2": 73.42, "F2": 87.31, "A2": 110.00,
    "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.00, "A3": 220.00,
    "Bb3": 233.08, "C4": 261.63, "D4": 293.66, "F4": 349.23, "A4": 440.00,
}


# Ambientes. Todos los videos sonaban igual porque solo existia un lecho:
# mystery.wav, el mismo bucle de 32 s en re menor, en los once guiones. La
# musica es sintesis propia, asi que variarla no cuesta nada y no toca ningun
# derecho de autor: basta con transponer, cambiar el pulso y reescribir el
# motivo.
#
# "mystery" se deja exactamente como estaba: los videos ya renderizados usan
# ese fichero y no queremos que cambie bajo sus pies.
MOTIVO_BASE = [
    (0.5, "D4", 0.085), (3.2, "F4", 0.070), (6.8, "C4", 0.060),
    (9.4, "Bb3", 0.075), (13.1, "A3", 0.065), (16.4, "D4", 0.080),
    (19.0, "E3", 0.055), (22.6, "F4", 0.062), (26.2, "A3", 0.058),
    (29.0, "Bb3", 0.050),
]

AMBIENTES = {
    # El de siempre. Para temas de intriga: algo se rompio y no sabemos cuando.
    "mystery": dict(semis=0, pulso=2.0, latido=0.11, aire=0.020,
                    decay=3.1, brillo=0.8, motivo=MOTIVO_BASE),
    # Analitico y seco. Menos latido, mas aire: para desmontar un mito con datos.
    "frio": dict(semis=3, pulso=3.4, latido=0.05, aire=0.034,
                 decay=4.2, brillo=0.5, motivo=[
                     (1.2, "A3", 0.070), (7.5, "C4", 0.055), (14.0, "F3", 0.060),
                     (21.2, "A3", 0.050), (27.8, "D3", 0.045),
                 ]),
    # Urgente. El pulso aprieta: para lo que esta pasando ahora mismo.
    "pulso": dict(semis=-2, pulso=1.35, latido=0.16, aire=0.016,
                  decay=2.2, brillo=1.0, motivo=[
                      (0.4, "D4", 0.080), (2.1, "F4", 0.072), (4.0, "D4", 0.060),
                      (6.2, "Bb3", 0.078), (8.0, "C4", 0.058), (10.4, "F4", 0.070),
                      (12.6, "A3", 0.062), (15.0, "D4", 0.082), (17.4, "E3", 0.056),
                      (19.6, "Bb3", 0.070), (22.0, "F4", 0.066), (24.8, "C4", 0.058),
                      (27.2, "A3", 0.062), (29.6, "D4", 0.074),
                  ]),
    # Sin latido. Solo drones largos: para la decadencia de cien anos.
    "elegia": dict(semis=5, pulso=None, latido=0.0, aire=0.040,
                   decay=5.0, brillo=0.45, motivo=[
                       (2.0, "D3", 0.065), (11.5, "F3", 0.055), (20.0, "A3", 0.050),
                       (28.4, "D3", 0.042),
                   ]),
    # Grave y a disgusto. Para cuando el desenlace todavia no ha llegado.
    "tenso": dict(semis=-4, pulso=2.6, latido=0.14, aire=0.024,
                  decay=2.8, brillo=0.9, motivo=[
                      (0.8, "Bb3", 0.082), (4.6, "E3", 0.074), (8.2, "A3", 0.058),
                      (11.0, "Bb3", 0.068), (15.6, "E3", 0.078), (18.8, "C4", 0.052),
                      (23.4, "A3", 0.064), (26.0, "Bb3", 0.070), (30.2, "E3", 0.048),
                  ]),
}


def lowpass(x, cutoff_hz, sr=SR):
    """Filtro paso bajo de un polo. Sin scipy."""
    dt = 1.0 / sr
    rc = 1.0 / (2 * math.pi * cutoff_hz)
    a = dt / (rc + dt)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(x.size):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def drone(t, freq, amp, detune=0.6, harmonics=(1.0, 0.34, 0.14)):
    """Zumbido grave con capas ligeramente desafinadas: crea batido lento."""
    out = np.zeros_like(t)
    for k, h in enumerate(harmonics, start=1):
        for d in (-detune, 0.0, detune):
            f = freq * k + d
            out += h * np.sin(2 * np.pi * f * t + k * 0.7)
    return out * (amp / (len(harmonics) * 3))


def breathe(t, period, depth=0.35, phase=0.0):
    """Envolvente de respiracion muy lenta."""
    return 1.0 - depth + depth * (0.5 + 0.5 * np.sin(2 * np.pi * t / period + phase))


def pluck(total, sr, start_s, freq, amp, decay=2.6, bright=1.0):
    """Nota pulsada con decaimiento exponencial y algo de inarmonicidad."""
    n0 = int(start_s * sr)
    length = min(int(decay * 3.2 * sr), total - n0)
    if n0 < 0 or length <= 0:
        return None, 0
    tt = np.arange(length) / sr
    env = np.exp(-tt / decay)
    attack = np.clip(tt / 0.006, 0, 1)
    sig = (
        np.sin(2 * np.pi * freq * tt)
        + 0.42 * bright * np.sin(2 * np.pi * freq * 2.01 * tt)
        + 0.18 * bright * np.sin(2 * np.pi * freq * 3.02 * tt)
        + 0.07 * bright * np.sin(2 * np.pi * freq * 4.98 * tt)
    )
    return sig * env * attack * amp, n0


def heartbeat(total, sr, period, amp):
    """Golpe grave filtrado cada `period` segundos. El pulso del documental."""
    out = np.zeros(total)
    n = 0
    while n * period < total / sr:
        for off, gain in ((0.0, 1.0), (0.30, 0.55)):
            s = int((n * period + off) * sr)
            length = min(int(0.5 * sr), total - s)
            if s < 0 or length <= 0:
                continue
            tt = np.arange(length) / sr
            env = np.exp(-tt / 0.11)
            f = 58.0 * np.exp(-tt * 12.0) + 30.0
            out[s:s + length] += np.sin(2 * np.pi * f * tt) * env * amp * gain
        n += 1
    return out


def air(total, sr, amp, seed):
    """Capa de aire: ruido filtrado con oleaje lento."""
    rng = np.random.default_rng(seed)
    noise = rng.normal(0, 1, total)
    filt = lowpass(noise, 900.0, sr)
    filt = filt - lowpass(filt, 160.0, sr)
    t = np.arange(total) / sr
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * t / 11.0 - 1.1)
    return filt * swell * amp


def build(seconds, seed=7, ambiente="mystery"):
    a = AMBIENTES[ambiente]
    # Transponer entero es la forma barata de cambiar de tonalidad sin tener
    # que escribir una tabla de frecuencias por cada ambiente.
    tono = 2.0 ** (a["semis"] / 12.0)
    f = lambda name: NOTES[name] * tono

    total = int(seconds * SR)
    t = np.arange(total) / SR
    mix = np.zeros(total)

    # 1. Fundamento: quinta de la tonica, muy grave
    mix += drone(t, f("D1"), 0.30) * breathe(t, 17.0, 0.30)
    mix += drone(t, f("A1"), 0.16) * breathe(t, 23.0, 0.36, phase=1.9)

    # 2. Colchon medio: menor con septima
    for name, amp, per, ph in (
        ("D3", 0.075, 13.0, 0.0),
        ("F3", 0.058, 19.0, 2.2),
        ("A3", 0.046, 15.5, 4.1),
        ("C4", 0.030, 21.0, 5.6),
    ):
        mix += drone(t, f(name), amp, detune=0.35, harmonics=(1.0, 0.2)) * breathe(t, per, 0.55, ph)

    # 3. Motivo: notas sueltas, irregulares, tension sin resolver
    for start, note, amp in a["motivo"]:
        if start >= seconds:
            continue
        sig, n0 = pluck(total, SR, start, f(note), amp, decay=a["decay"], bright=a["brillo"])
        if sig is not None:
            mix[n0:n0 + sig.size] += sig

    # 4. Pulso. "elegia" no lleva: solo drones, sin nada que marque el tiempo.
    if a["pulso"] is not None and a["latido"] > 0:
        mix += heartbeat(total, SR, a["pulso"], a["latido"])

    # 5. Aire
    mix += air(total, SR, a["aire"], seed)

    # Costura de bucle: mezcla la cola con la cabeza
    xf = int(1.6 * SR)
    if total > 2 * xf:
        fade = np.linspace(0, 1, xf)
        head = mix[:xf].copy()
        mix[-xf:] = mix[-xf:] * (1 - fade) + head * fade
        mix = mix[:-0] if xf == 0 else mix

    # Suavizado general y normalizacion con margen
    mix = lowpass(mix, 7200.0)
    peak = np.max(np.abs(mix))
    if peak > 0:
        mix = mix / peak * 0.72

    # Entrada suave al principio absoluto
    ramp = int(0.9 * SR)
    mix[:ramp] *= np.linspace(0, 1, ramp)

    # Estereo: ensanchado leve por retardo
    delay = int(0.011 * SR)
    left = mix
    right = np.concatenate([np.zeros(delay), mix[:-delay]]) * 0.94 + mix * 0.06
    return np.stack([left, right], axis=1)


def write_wav(path, stereo):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    data = np.clip(stereo, -1.0, 1.0)
    pcm = (data * 32767.0).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--seconds", type=float, default=32.0)
    ap.add_argument("--ambiente", default="mystery", choices=sorted(AMBIENTES))
    ap.add_argument("--out", default=None)
    ap.add_argument("--todos", action="store_true", help="genera los cinco ambientes")
    a = ap.parse_args()

    pedidos = sorted(AMBIENTES) if a.todos else [a.ambiente]
    for nombre in pedidos:
        destino = a.out if (a.out and not a.todos) else f"assets/music/{nombre}.wav"
        write_wav(destino, build(a.seconds, ambiente=nombre))
        print(f"escrito {destino}  {a.seconds:.1f}s  {SR} Hz estereo  [{nombre}]")
