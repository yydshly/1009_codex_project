"""Original chapter-scored stereo music and narration, using existing voices.

This is an instrumental/narration arrangement; it does not synthesize singing.
The envelope written to JSON is measured from the actual final audio.
"""
import json
import math
import pathlib
import subprocess
import wave
import numpy as np

PROJECT = pathlib.Path(__file__).resolve().parents[1]
ASSETS = PROJECT / 'web/public/assets'
WORK = PROJECT.parents[1] / 'upstream/chinese-token-cinema'
timeline = json.loads((ASSETS / 'timeline.json').read_text(encoding='utf-8'))
SR = 24000
duration = timeline['duration']
length = SR * duration
bed = np.zeros((length, 2), dtype=np.float32)
voice = np.zeros_like(bed)
rng = np.random.default_rng(974)
bpm = 78
beat = 60 / bpm
chapters = timeline['chapters']
boundaries = [0] + [c['start'] for c in chapters[1:]] + [duration]

def hz(note):
    return 440 * 2 ** ((note - 69) / 12)

def place(samples, start, gain=1, pan=0):
    first = int(start * SR)
    end = min(length, first + len(samples))
    if first < 0 or end <= first:
        return
    samples = samples[:end - first]
    # Equal-power stereo panning, deterministic composition.
    angle = (pan + 1) * np.pi / 4
    bed[first:end, 0] += samples * gain * np.cos(angle)
    bed[first:end, 1] += samples * gain * np.sin(angle)

def note(midi, seconds, kind='key'):
    t = np.arange(int(seconds * SR), dtype=np.float32) / SR
    freq = hz(midi)
    if kind == 'pad':
        attack = np.minimum(t / .9, 1)
        release = np.minimum((seconds - t) / 1.6, 1)
        signal = np.sin(2 * np.pi * freq * t) + .3 * np.sin(2 * np.pi * freq * 2.002 * t) + .13 * np.sin(2 * np.pi * freq * .998 * t)
        return signal * attack * release * .6
    if kind == 'bass':
        env = np.minimum(t / .018, 1) * np.exp(-t * 2.4)
        return (np.sin(2 * np.pi * freq * t) + .22 * np.sin(2 * np.pi * freq * 2 * t)) * env
    env = np.minimum(t / .006, 1) * np.exp(-t * (2.3 if kind == 'bell' else 3.5))
    return (np.sin(2 * np.pi * freq * t) + .30 * np.sin(2 * np.pi * freq * 2 * t) + .12 * np.sin(2 * np.pi * freq * 3.003 * t) + .05 * np.sin(2 * np.pi * freq * 5 * t)) * env

def kick(start, gain):
    t = np.arange(int(.42 * SR), dtype=np.float32) / SR
    phase = 2 * np.pi * (43 * t + 5.8 * (1 - np.exp(-t * 25)))
    place(np.sin(phase) * np.exp(-t * 13), start, gain)

def noise_hit(start, gain, pan=0, soft=False):
    n = int((.34 if soft else .15) * SR)
    t = np.arange(n, dtype=np.float32) / SR
    noise = rng.standard_normal(n).astype(np.float32)
    noise -= np.convolve(noise, np.ones(9) / 9, mode='same')
    place(noise * np.exp(-t * (14 if soft else 40)), start, gain, pan)

# A four-note motif is introduced sparsely, interrupted, then heard in full.
motif = [74, 76, 77, 81, 77, 76, 74, 69]
progressions = [
    [[50, 57, 62, 65, 76], [46, 53, 58, 62, 69]],
    [[43, 50, 58, 62, 69], [45, 52, 61, 64, 74]],
    [[50, 57, 62, 65, 76], [46, 53, 58, 62, 69], [53, 60, 65, 69, 79], [48, 55, 60, 64, 74]],
    [[53, 60, 65, 69, 76], [48, 55, 60, 64, 74], [50, 57, 62, 66, 74]],
]
for chapter in range(4):
    begin, end = boundaries[chapter], boundaries[chapter + 1]
    bars = math.ceil((end - begin) / (beat * 4))
    for bar in range(bars):
        start = begin + bar * beat * 4
        if start >= end:
            break
        chord = progressions[chapter][bar % len(progressions[chapter])]
        for j, midi in enumerate(chord):
            gain = [.027, .031, .052, .043][chapter]
            place(note(midi, min(6.2, end - start + 1), 'pad'), start, gain, (j - 2) * .32)
        if chapter == 0:
            # Space around the narration; only hints of the future melody.
            for j in [0, 2]:
                place(note(motif[(bar + j) % 4], 2.0), start + j * beat, .075, -.25 if j == 0 else .3)
            if bar > 1:
                kick(start, .06)
        elif chapter == 1:
            # Suspended harmony, low pulse and incomplete motif; no full drum kit.
            for j in [0, 2]:
                place(note(chord[0] - 12, .9, 'bass'), start + j * beat, .105)
            place(note(motif[bar % 3], 2.7, 'bell'), start + beat * 2.5, .045, .55)
            noise_hit(start + beat * 3, .017, -.4, soft=True)
        elif chapter == 2:
            # The first explicit 'I am here' gets an octave lift and fuller rhythm.
            for j in range(8):
                at = start + j * beat / 2
                place(note(motif[(bar * 4 + j) % 8], 1.5), at, .115 if j % 2 == 0 else .066, -.4 if j % 2 == 0 else .4)
                noise_hit(at, .013, -.5 if j % 2 == 0 else .5)
            for j in [0, 2, 3.5]:
                kick(start + j * beat, .18 if j != 3.5 else .10)
                place(note(chord[0] - 12, .65, 'bass'), start + j * beat, .115)
            for j in [1, 3]:
                noise_hit(start + j * beat, .048, .08, soft=True)
        else:
            for j in [0, 2, 3]:
                place(note(motif[(bar + j) % 8], 2.5), start + j * beat, .083, -.25 + j * .18)
            if start < timeline['cues'][10]['start'] - 2:
                kick(start, .075)

# Small stereo delays add space to instruments without drowning the voice.
for seconds, gain in [(.3846, .15), (.7692, .08), (1.5384, .045)]:
    offset = int(seconds * SR)
    bed[offset:] += bed[:-offset, ::-1] * gain

for i, cue in enumerate(timeline['cues']):
    with wave.open(str(WORK / f'voice-{i:02}.wav')) as f:
        samples = np.frombuffer(f.readframes(f.getnframes()), dtype='<i2').astype(np.float32) / 32768
    first = int(cue['start'] * SR)
    gain = .89 if i < 3 else .83 if i < 6 else .96
    voice[first:first + len(samples), :] += samples[:, None] * gain * .707
    # The hook acquires a faint echo; ordinary speech remains close and dry.
    if i in [6, 11]:
        for delay, echo_gain in [(.24, .095), (.53, .04)]:
            a = first + int(delay * SR)
            n = min(len(samples), length - a)
            voice[a:a + n, :] += samples[:n, None] * echo_gain * np.array([.62, .8])

t = np.arange(length, dtype=np.float32) / SR
# A deliberate musical breath around the final question, followed by resolution.
question = timeline['cues'][10]
quiet = np.clip((t - (question['start'] - .65)) / .5, 0, 1) * (1 - np.clip((t - (question['end'] + .25)) / .7, 0, 1))
bed *= (1 - .82 * quiet[:, None])
answer = timeline['cues'][11]['start']
for midi, pan in [(50, -.7), (57, -.3), (62, 0), (66, .3), (74, .7)]:
    place(note(midi, duration - answer, 'pad'), answer + .18, .047, pan)

energy = np.mean(np.abs(voice), axis=1)[::240]
energy = np.convolve(energy, np.ones(10) / 10, mode='same')
duck = 1 - .30 * np.clip(np.interp(np.arange(length), np.arange(len(energy)) * 240, energy) * 12, 0, 1)
fade = np.clip(t / 2, 0, 1) * np.clip((duration - t) / 3, 0, 1)
mix = np.tanh((voice + bed * duck[:, None]) * 1.12) * fade[:, None]

def save_wav(file, samples):
    with wave.open(str(file), 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(samples, -.98, .98) * 32767).astype('<i2').tobytes())

save_wav(WORK / 'story-emotional.wav', mix)
save_wav(WORK / 'music-emotional.wav', bed * fade[:, None])
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(WORK / 'story-emotional.wav'), '-c:a', 'libmp3lame', '-b:a', '192k', str(ASSETS / 'story-emotional.mp3')], check=True)

step = SR // 30
mono = mix.mean(axis=1)
envelopes = []
for start in range(0, length, step):
    block = mono[start:start + step]
    envelopes.append(round(float(np.sqrt(np.mean(block ** 2))), 5))
arrangement = {
    'version': 2, 'bpm': bpm, 'duration': duration, 'fps': 30,
    'kind': 'Original instrumental score with existing Chinese narration, not singing.',
    'chapters': [
        {'name': '醒来', 'start': boundaries[0], 'end': boundaries[1], 'emotion': '试探', 'music': '稀疏键音、低频底色、未完成的旋律'},
        {'name': '静默', 'start': boundaries[1], 'end': boundaries[2], 'emotion': '压抑', 'music': '悬置和声、低频脉冲、稀薄空间声'},
        {'name': '回声', 'start': boundaries[2], 'end': boundaries[3], 'emotion': '抬升', 'music': '完整旋律、加宽和声、低鼓与节奏层'},
        {'name': '回应', 'start': boundaries[3], 'end': boundaries[4], 'emotion': '释然', 'music': '问句处撤掉音乐，回答后暖色和声收束'},
    ],
    'envelopeSource': 'Measured RMS of the actual final stereo mix, 30 samples per second.',
    'rms': envelopes,
}
(ASSETS / 'emotion-score.json').write_text(json.dumps(arrangement, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('Emotion score complete:', duration, 'seconds / stereo / measured audio envelope')
