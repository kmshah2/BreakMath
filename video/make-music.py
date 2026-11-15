"""Synthesizes the backing track for the BreakMath videos: an original
phonk-style loop at 132 BPM (cowbell riff, distorted 808, hard kick, fast
hats). No samples, no outside audio, so there is nothing to license.

    python3 make-music.py        writes public/audio/music.wav
"""
import wave

import numpy as np

SR = 44100
BPM = 132
STEP = 60 / BPM / 4            # one sixteenth note, in seconds
BARS = 16
N = int(BARS * 16 * STEP * SR) + SR
rng = np.random.default_rng(11)

drums = np.zeros(N)
music_l = np.zeros(N)          # everything that ducks under the kick
music_r = np.zeros(N)
duck = np.ones(N)


def place(buf, start, sound, gain=1.0):
    i = int(start * SR)
    j = min(N, i + len(sound))
    if j > i:
        buf[i:j] += sound[: j - i] * gain


def t_of(seconds):
    return np.arange(int(seconds * SR)) / SR


def smooth(x, width):
    return np.convolve(x, np.ones(width) / width, mode="same")


def semis(base, n):
    return base * 2 ** (n / 12)


def kick():
    t = t_of(0.3)
    freq = 44 + 150 * np.exp(-t * 45)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 8)
    click = rng.standard_normal(len(t)) * np.exp(-t * 500) * 0.3
    return np.tanh((body + click) * 2.4)


def clap():
    t = t_of(0.22)
    noise = np.diff(rng.standard_normal(len(t) + 1))
    env = np.exp(-t * 22) + sum(0.6 * np.exp(-np.abs(t - d) * 320) for d in (0.01, 0.021, 0.033))
    return noise * env * 0.45


def hat(length=0.035, decay=140):
    t = t_of(length)
    noise = np.diff(np.diff(rng.standard_normal(len(t) + 2)))
    return noise * np.exp(-t * decay) * 0.2


def bass808(freq, length, slide_from=None):
    t = t_of(length)
    start = slide_from or freq * 1.5
    glide = freq + (start - freq) * np.exp(-t * (18 if slide_from else 70))
    tone = np.sin(2 * np.pi * np.cumsum(glide) / SR)
    env = np.minimum(1, t * 500) * np.exp(-t * 2.4)
    return np.tanh(tone * 4.5) * env


def cowbell(freq, length=0.24):
    t = t_of(length)
    square = lambda f: np.sign(np.sin(2 * np.pi * f * t))
    tone = square(freq) + 0.75 * square(freq * 1.504)
    tone = smooth(tone, 5)                                  # take the harsh edge off
    return tone * np.exp(-t * 15) * np.minimum(1, t * 2000)


def riser(length):
    t = t_of(length)
    noise = np.diff(rng.standard_normal(len(t) + 1))
    return smooth(noise, 3) * (t / length) ** 2.5 * 0.3


KEY = 369.99                      # F sharp
RIFF_A = [0, None, 0, 3, None, 0, None, 5, 3, None, 0, None, 7, None, 5, 3]
RIFF_B = [0, None, 0, 3, None, 0, None, 5, 8, None, 7, None, 5, None, 3, 2]
BASS_ROOTS = [0, 0, -2, -4]       # per bar, in semitones
BASS_STEPS = [0, 3, 6, 10, 12, 14]
KICK_STEPS = [0, 6, 10]

for bar in range(BARS):
    bar_start = bar * 16 * STEP
    turnaround = bar % 4 == 3
    riff = RIFF_B if turnaround else RIFF_A
    root = semis(KEY / 8, BASS_ROOTS[bar % 4])
    previous = None

    for step in range(16):
        now = bar_start + step * STEP

        if step in KICK_STEPS or (turnaround and step == 14):
            place(drums, now, kick(), 1.0)
            t = t_of(0.2)
            i = int(now * SR)
            j = min(N, i + len(t))
            duck[i:j] = np.minimum(duck[i:j], (0.2 + 0.8 * (t / 0.2) ** 1.5)[: j - i])
        if step in (4, 12):
            place(drums, now, clap(), 0.9)

        place(drums, now, hat(), 0.85 if step % 2 == 0 else 0.45)
        if turnaround and step >= 12:                       # thirty-second-note roll
            place(drums, now + STEP / 2, hat(0.025, 180), 0.5)
        if step == 14 and not turnaround:
            place(drums, now, hat(0.2, 20), 0.45)           # open hat

        if step in BASS_STEPS:
            b = bass808(root, STEP * 3.2, slide_from=previous)
            place(music_l, now, b, 0.5)
            place(music_r, now, b, 0.5)
            previous = root * (1.26 if step == 10 else 1.0)

        note = riff[step]
        if note is not None:
            c = cowbell(semis(KEY, note))
            pan = 0.42 + 0.16 * (step % 2)
            place(music_l, now, c, 0.2 * (1 - pan) * 2)
            place(music_r, now, c, 0.2 * pan * 2)
            echo = now + STEP * 3
            place(music_l, echo, c, 0.05 * pan * 2)
            place(music_r, echo, c, 0.05 * (1 - pan) * 2)

    if turnaround and bar < BARS - 1:
        r = riser(4 * STEP)
        place(music_l, bar_start + 12 * STEP, r, 0.6)
        place(music_r, bar_start + 12 * STEP, r, 0.6)

left = drums * 0.75 + music_l * duck
right = drums * 0.75 + music_r * duck
mix = np.stack([left, right], axis=1)

fade = int(1.2 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.25)
mix = mix / np.max(np.abs(mix)) * 0.89

with wave.open("public/audio/music.wav", "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((mix * 32767).astype("<i2").tobytes())

rms = float(np.sqrt(np.mean(mix ** 2)))
print(f"Wrote public/audio/music.wav ({len(mix) / SR:.1f}s, peak {np.max(np.abs(mix)):.2f}, rms {rms:.3f})")
