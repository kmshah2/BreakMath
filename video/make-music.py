"""Synthesizes the backing track for the BreakMath videos: an original
124 BPM loop (drums, 808 bass, plucked arpeggio, pad). No samples, no outside
audio, so there is nothing to license.

    python3 make-music.py        writes public/audio/music.wav
"""
import wave

import numpy as np

SR = 44100
BPM = 124
STEP = 60 / BPM / 4            # one sixteenth note, in seconds
BARS = 16
N = int(BARS * 16 * STEP * SR) + SR
rng = np.random.default_rng(7)

drums = np.zeros(N)
music_l = np.zeros(N)          # everything that ducks under the kick
music_r = np.zeros(N)
duck = np.ones(N)


def place(buf, start, sound, gain=1.0):
    i = int(start * SR)
    j = min(N, i + len(sound))
    buf[i:j] += sound[: j - i] * gain


def t_of(seconds):
    return np.arange(int(seconds * SR)) / SR


def kick():
    t = t_of(0.32)
    freq = 46 + 110 * np.exp(-t * 38)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 9)
    click = rng.standard_normal(len(t)) * np.exp(-t * 400) * 0.25
    return body + click


def clap():
    t = t_of(0.2)
    noise = np.diff(rng.standard_normal(len(t) + 1))
    env = np.exp(-t * 26) + 0.6 * np.exp(-np.abs(t - 0.012) * 300) + 0.5 * np.exp(-np.abs(t - 0.024) * 300)
    return noise * env * 0.5


def hat(length=0.04, decay=120):
    t = t_of(length)
    noise = np.diff(np.diff(rng.standard_normal(len(t) + 2)))
    return noise * np.exp(-t * decay) * 0.22


def bass(freq, length):
    t = t_of(length)
    glide = freq * (1 + 0.5 * np.exp(-t * 60))
    wave_ = np.sin(2 * np.pi * np.cumsum(glide) / SR)
    env = np.minimum(1, t * 400) * np.exp(-t * 3.2)
    return np.tanh(wave_ * 2.2) * env


def pluck(freq, length=0.28):
    t = t_of(length)
    tone = sum(np.sin(2 * np.pi * freq * h * t) / h * np.exp(-t * (7 + 5 * h)) for h in range(1, 7))
    return tone * np.minimum(1, t * 900)


def pad(freqs, length):
    t = t_of(length)
    tone = sum(np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.005 * t) for f in freqs)
    env = np.minimum(1, t * 3) * np.minimum(1, (length - t) * 6)
    return tone * env / len(freqs)


# A minor: Am, F, C, G. One chord per bar.
CHORDS = [
    (55.00, [220.00, 261.63, 329.63]),
    (43.65, [174.61, 220.00, 261.63]),
    (65.41, [261.63, 329.63, 392.00]),
    (49.00, [196.00, 246.94, 293.66]),
]
ARP = [0, 1, 2, 1, 0, 2, 1, 2, 0, 1, 2, 1, 2, 0, 2, 1]
BASS_STEPS = [0, 3, 6, 8, 11, 14]

for bar in range(BARS):
    root, chord = CHORDS[bar % 4]
    bar_start = bar * 16 * STEP
    last_of_phrase = bar % 4 == 3
    final_bar = bar == BARS - 1

    for step in range(16):
        now = bar_start + step * STEP
        # Kick on every beat, plus a push before the turnaround.
        if step % 4 == 0 or (last_of_phrase and step == 14):
            place(drums, now, kick(), 1.0)
            t = t_of(0.22)
            i = int(now * SR)
            j = min(N, i + len(t))
            duck[i:j] = np.minimum(duck[i:j], (0.25 + 0.75 * (t / 0.22) ** 1.5)[: j - i])
        if step in (4, 12):
            place(drums, now, clap(), 0.9)
        if step % 2 == 0:
            place(drums, now, hat(), 0.9 if step % 4 == 2 else 0.6)
        elif last_of_phrase and step >= 9:
            place(drums, now, hat(0.03, 160), 0.5)          # sixteenth-note roll
        if step == 14 and not last_of_phrase:
            place(drums, now, hat(0.18, 22), 0.5)           # open hat

        if step in BASS_STEPS:
            b = bass(root, STEP * 2.6)
            place(music_l, now, b, 0.55)
            place(music_r, now, b, 0.55)

        if not final_bar or step < 8:
            octave = 2 if (step % 8) >= 4 else 1
            p = pluck(chord[ARP[step]] * octave)
            pan = 0.3 + 0.4 * (step % 2)
            place(music_l, now, p, 0.16 * (1 - pan) * 2)
            place(music_r, now, p, 0.16 * pan * 2)
            echo = now + STEP * 3                           # dotted-eighth echo on the other side
            place(music_l, echo, p, 0.06 * pan * 2)
            place(music_r, echo, p, 0.06 * (1 - pan) * 2)

    chord_pad = pad(chord, 16 * STEP)
    place(music_l, bar_start, chord_pad, 0.09)
    place(music_r, bar_start, chord_pad, 0.09)

left = drums * 0.8 + music_l * duck
right = drums * 0.8 + music_r * duck
mix = np.stack([left, right], axis=1)

# Fade the tail and soft-limit.
fade = int(1.2 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.3)
mix = mix / np.max(np.abs(mix)) * 0.89

with wave.open("public/audio/music.wav", "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((mix * 32767).astype("<i2").tobytes())

print(f"Wrote public/audio/music.wav ({len(mix) / SR:.1f}s)")
