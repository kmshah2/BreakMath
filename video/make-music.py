"""Synthesizes the backing tracks for the BreakMath videos: one original loop
per ad, each with its own tempo, key, drum pattern and lead sound. No samples,
no outside audio, so there is nothing to license.

    python3 make-music.py        writes public/audio/music-<ad>.wav for every ad
"""
import wave

import numpy as np

SR = 44100
BARS = 16

# One entry per ad. Riffs are sixteen steps of semitones above the key (None is
# a rest); riff B plays on every fourth bar.
VARIANTS = {
    # Launch reel: phonk. Cowbell riff, bouncing kick, fast hats.
    "reel": dict(bpm=132, key=369.99, lead="cowbell", kick=[0, 6, 10], hats=1, roots=[0, 0, -2, -4],
                 a=[0, None, 0, 3, None, 0, None, 5, 3, None, 0, None, 7, None, 5, 3],
                 b=[0, None, 0, 3, None, 0, None, 5, 8, None, 7, None, 5, None, 3, 2]),
    # Receipt ad: four-on-the-floor bounce with a plucked arpeggio.
    "fees": dict(bpm=124, key=440.00, lead="pluck", kick=[0, 4, 8, 12], hats=2, roots=[0, -4, 3, -2],
                 a=[0, 3, 7, 3, 12, 7, 3, 7, 0, 3, 7, 3, 12, 7, 15, 7],
                 b=[0, 3, 7, 3, 12, 7, 3, 7, 14, 12, 10, 7, 5, 3, 2, 0]),
    # Podium ad: fast half-time trap with a bell lead.
    "tiers": dict(bpm=146, key=293.66, lead="bell", kick=[0, 7, 10], hats=1, roots=[0, 0, 3, -2],
                  a=[12, None, None, 7, None, None, 10, None, 12, None, 15, None, 14, None, 10, None],
                  b=[12, None, None, 7, None, None, 10, None, 19, None, 17, None, 15, 14, 12, 10]),
    # Gauge ad: slower and tense, ticking hats and a square-wave lead.
    "whatif": dict(bpm=116, key=329.63, lead="pulse", kick=[0, 8, 11], hats=1, roots=[0, 0, -1, -1],
                   a=[0, 0, None, 0, 1, None, 0, None, 0, 0, None, 0, 3, None, 1, None],
                   b=[0, 0, None, 0, 1, None, 0, None, 7, None, 6, None, 3, None, 1, 0]),
}

rng = np.random.default_rng(11)
N = 0
STEP = 0.0


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


def pluck(freq, length=0.3):
    t = t_of(length)
    tone = sum(np.sin(2 * np.pi * freq * h * t) / h * np.exp(-t * (7 + 5 * h)) for h in range(1, 7))
    return tone * np.minimum(1, t * 900) * 0.8


def bell(freq, length=0.6):
    t = t_of(length)
    mod = np.sin(2 * np.pi * freq * 3.5 * t) * 2.2 * np.exp(-t * 9)
    return np.sin(2 * np.pi * freq * t + mod) * np.exp(-t * 6) * np.minimum(1, t * 1500) * 1.1


def pulse(freq, length=0.2):
    t = t_of(length)
    tone = np.where((freq * t) % 1 < 0.25, 1.0, -1.0)
    return smooth(tone, 7) * np.exp(-t * 11) * np.minimum(1, t * 2000) * 0.7


LEADS = {"cowbell": cowbell, "pluck": pluck, "bell": bell, "pulse": pulse}


def riser(length):
    t = t_of(length)
    noise = np.diff(rng.standard_normal(len(t) + 1))
    return smooth(noise, 3) * (t / length) ** 2.5 * 0.3


def render(name, v):
    global N, STEP
    STEP = 60 / v["bpm"] / 4                    # one sixteenth note, in seconds
    N = int(BARS * 16 * STEP * SR) + SR
    drums = np.zeros(N)
    music_l = np.zeros(N)                       # everything that ducks under the kick
    music_r = np.zeros(N)
    duck = np.ones(N)
    lead = LEADS[v["lead"]]
    bass_steps = [0, 3, 6, 10, 12, 14]

    for bar in range(BARS):
        bar_start = bar * 16 * STEP
        turnaround = bar % 4 == 3
        riff = v["b"] if turnaround else v["a"]
        root = semis(v["key"] / 8, v["roots"][bar % 4])
        previous = None

        for step in range(16):
            now = bar_start + step * STEP

            if step in v["kick"] or (turnaround and step == 14):
                place(drums, now, kick(), 1.0)
                t = t_of(0.2)
                i = int(now * SR)
                j = min(N, i + len(t))
                duck[i:j] = np.minimum(duck[i:j], (0.2 + 0.8 * (t / 0.2) ** 1.5)[: j - i])
            if step in (4, 12):
                place(drums, now, clap(), 0.9)

            if step % v["hats"] == 0:
                place(drums, now, hat(), 0.85 if step % 2 == 0 else 0.45)
            if turnaround and step >= 12:           # thirty-second-note roll
                place(drums, now + STEP / 2, hat(0.025, 180), 0.5)
            if step == 14 and not turnaround:
                place(drums, now, hat(0.2, 20), 0.45)   # open hat

            if step in bass_steps:
                b = bass808(root, STEP * 3.2, slide_from=previous)
                place(music_l, now, b, 0.5)
                place(music_r, now, b, 0.5)
                previous = root * (1.26 if step == 10 else 1.0)

            note = riff[step]
            if note is not None:
                c = lead(semis(v["key"], note))
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

    mix = np.stack([drums * 0.75 + music_l * duck, drums * 0.75 + music_r * duck], axis=1)
    fade = int(1.2 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    mix = np.tanh(mix * 1.25)
    mix = mix / np.max(np.abs(mix)) * 0.89

    path = f"public/audio/music-{name}.wav"
    with wave.open(path, "wb") as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((mix * 32767).astype("<i2").tobytes())
    rms = float(np.sqrt(np.mean(mix ** 2)))
    print(f"Wrote {path} ({len(mix) / SR:.1f}s, {v['bpm']} BPM, {v['lead']} lead, rms {rms:.3f})")


for track, settings in VARIANTS.items():
    render(track, settings)
