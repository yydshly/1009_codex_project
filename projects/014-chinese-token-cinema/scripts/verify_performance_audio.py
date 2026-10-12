"""Check that an online result retained the uploaded song and its time scale."""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np
from scipy.signal import correlate, correlation_lags


def decode(path):
    data = subprocess.check_output([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path),
        "-vn", "-ar", "8000", "-ac", "1", "-f", "f32le", "pipe:1",
    ])
    return np.frombuffer(data, dtype=np.float32)


def measure(video, input_audio):
    actual, reference = decode(video), decode(input_audio)
    correlation = correlate(actual, reference, method="fft")
    lags = correlation_lags(len(actual), len(reference))
    allowed = np.abs(lags) <= 8000
    lag = int(lags[allowed][np.argmax(correlation[allowed])])
    if lag >= 0:
        length = min(len(actual) - lag, len(reference))
        a, b = actual[lag:lag+length], reference[:length]
    else:
        length = min(len(actual), len(reference) + lag)
        a, b = actual[:length], reference[-lag:-lag+length]
    coefficient = float(np.corrcoef(a, b)[0, 1])
    result = {
        "method": "8000 Hz mono waveform cross-correlation, +/- 1 second search",
        "inputDuration": len(reference)/8000, "resultAudioDuration": len(actual)/8000,
        "resultAudioLagSeconds": lag/8000, "waveformCorrelation": coefficient,
        "note": "Checks retained song and timing; does not measure phoneme-to-mouth accuracy.",
    }
    result['passesRetainedSongGate'] = coefficient >= .9 and abs(lag)/8000 <= .15
    return result


def verify(video, input_audio):
    result = measure(video, input_audio)
    if not result['passesRetainedSongGate']:
        raise RuntimeError("Online output changed or displaced the uploaded song; inspect before composing.")
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("video", type=Path)
    parser.add_argument("input_audio", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = measure(args.video, args.input_audio)
    args.output.write_text(json.dumps(result, indent=2)+"\n", encoding="utf-8")
    print(json.dumps(result))
    if not result['passesRetainedSongGate']:
        raise SystemExit('Audio gate failed; diagnostic saved. Do not compose this result.')


if __name__ == "__main__":
    main()
