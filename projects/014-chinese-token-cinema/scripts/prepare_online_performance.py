"""Cut the existing song for online lip-sync. No model or network access."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "web/public/assets"
OUTPUT = ROOT.parents[1] / "upstream/chinese-token-cinema/online-performance"
SEGMENTS = [
    ("01-opening", "server", 0, 8.0),
    ("02-verse-a", "rain", 10.3, 17.82),
    ("03-verse-b", "rain", 17.82, 25.6),
    ("04-prechorus", "shore", 26.5, 35.6),
    ("05-chorus-a", "chorus", 39.5, 48.4),
    ("06-chorus-b", "chorus", 48.4, 58.0),
    ("07-chorus-c", "chorus", 58.0, 65.4),
    ("08-chorus-d", "chorus", 65.4, 75.2),
    ("09-verse2-a", "rain", 76.2, 83.62),
    ("10-verse2-b", "rain", 83.62, 92.2),
    ("11-reprise-a", "chorus", 95.8, 102.84),
    ("12-reprise-b", "chorus", 102.84, 113.2),
    ("13-question", "answer", 115.8, 122.0),
    ("14-answer", "answer", 123.0, 129.0),
    ("pilot-12s", "chorus", 39.5, 51.56),
]


def main():
    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    if not ffmpeg or not ffprobe:
        raise RuntimeError("Existing FFmpeg and ffprobe are required; nothing will be downloaded.")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    timeline = json.loads((PUBLIC / "song-timeline.json").read_text(encoding="utf-8"))
    prompt = (
        "Cinematic intimate Mandarin singing performance of the SAME fictional adult woman "
        "in the reference. Preserve her face, short black bob, triangular amber hair clip, "
        "grey high collar, dark jacket, and small cyan neck light. Accurate lip synchronization "
        "to the UPLOADED sung audio, including sustained vowels and closed-mouth pauses. "
        "Natural breathing, restrained eye movement, occasional blinking and subtle head "
        "movement. Vulnerable but quietly determined; intensity grows on sustained notes. "
        "Keep her in the right half, leave the left half dark for captions. Very gentle "
        "camera push-in; preserve blue shadows and warm highlights. No cuts, no text, "
        "no exaggerated gestures, no change of identity, no new speech or music."
    )
    clips = []
    for name, scene, start, end in SEGMENTS:
        audio = OUTPUT / (name + ".wav")
        subprocess.run([
            ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i",
            str(PUBLIC / "song.mp3"), "-ss", str(start), "-t", str(end-start),
            "-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2", str(audio),
        ], check=True)
        actual = float(subprocess.check_output([
            ffprobe, "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(audio),
        ], text=True).strip())
        if abs(actual - (end-start)) > 0.025:
            raise RuntimeError(f"Wrong audio duration: {name} {actual}")
        lyrics = [c["text"] for c in timeline["cues"] if c["start"] < end and c["end"] > start]
        clips.append({
            "id": name, "scene": scene, "songStart": start, "songEnd": end,
            "audioDuration": actual, "audioFile": audio.name,
            "imageFile": scene + ".png", "lyrics": lyrics,
            "audioSha256": hashlib.sha256(audio.read_bytes()).hexdigest(),
            "status": "prepared_not_generated",
        })
    for scene in {s[1] for s in SEGMENTS}:
        shutil.copy2(PUBLIC / (scene + ".png"), OUTPUT / (scene + ".png"))
    manifest = {
        "title": "我还在这里 / 线上人物演唱制作包",
        "status": "prepared_not_generated", "generatedVideoCount": 0,
        "audio": "Original mixed song excerpt; no tempo change or synthetic replacement.",
        "syncRule": "Output local time 0 corresponds to songStart. Do not loop over other lyrics.",
        "prompt": prompt, "clips": clips,
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    (OUTPUT / "performance-prompt.txt").write_text(prompt+"\n", encoding="utf-8")
    (ROOT / "assets/online-performance-plan.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(f"Prepared {len(clips)} WAV clips and 5 character images in {OUTPUT}")
    print("No generation submitted; no models downloaded.")


if __name__ == "__main__":
    main()
