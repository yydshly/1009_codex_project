"""Package already downloaded media for the research page; never generate new media."""
from pathlib import Path
import hashlib
import json
import shutil

import cv2

PROJECT = Path(__file__).resolve().parent.parent
ASSETS = PROJECT / 'web/public/assets'
RESEARCH = ASSETS / 'research'
EXPERIMENTS = ASSETS / 'experiments'
INPUTS = PROJECT.parent.parent / 'upstream/chinese-token-cinema/scene-performance'


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', 'utf-8')


def main():
    RESEARCH.mkdir(exist_ok=True)
    EXPERIMENTS.mkdir(exist_ok=True)
    reference = ASSETS / 'reference/dj-sho-slopcore.mp4'
    info = json.loads((ASSETS / 'reference/dj-sho-slopcore.info.json').read_text('utf-8'))
    write_json(RESEARCH / 'reference-source.json', {
        'author': 'DJ SHO', 'handle': 'DJ_SHO974', 'title': 'Somewhere in the weights',
        'source': 'https://x.com/DJ_SHO974/status/2108569544151146742',
        'downloadedAt': '2026-10-10', 'duration': 276.053333,
        'width': 1920, 'height': 1080, 'fps': 30,
        'localMedia': './assets/reference/dj-sho-slopcore.mp4', 'publicMedia': info['url'],
        'bytes': reference.stat().st_size, 'sha256': sha256(reference),
        'license': 'No public open-source license found; author retains rights. Local research reference copy; not original project material.',
        'archivePolicy': 'MP4 and raw extractor metadata are ignored by Git. Page falls back to the author public media URL if local copy is absent.',
        'pipelineClaim': 'Tool and GPT-2-weight statements are author claims, not independently verified source code.',
        'watchMarkers': [
            {'time': 3, 'label': '权重式画面'}, {'time': 28, 'label': '词块与回指'},
            {'time': 48, 'label': '预测面板'}, {'time': 116, 'label': '全身与遮蔽'},
            {'time': 180, 'label': '人群与大字'}, {'time': 228, 'label': '海岸与回应'},
        ],
    })
    configs = [
        ('chatart-opening', 'chatart-opening-rejected', 'Art MV 8 · 第一轮', '13:38', 100,
         '演唱 / Performance', .9995763964856342, True,
         ['原音保留，但约 4 秒、8 秒出现非预期切镜。',
          '人物由右侧移到居中，脸部观感、服装与构图改变；演唱情绪偏弱。'],
         4.2, '看人物与服装切换', 'chatart-opening-contact.jpg'),
        ('seedance-single-shot', 'seedance-single-shot-rejected', 'Seedance 2.0 · 单镜头', '14:36', 120,
         '图片＋原唱 WAV 参考', .1052483113902299, False,
         ['人物、服装和机房构图稳定，连续性改善。',
          '输出音轨未通过原唱保留检查，不能确认原歌时间尺度；低相关性下的偏移不能用于口型校正。',
          '实际输出为 864×496（任务显示 480p），只作样片复核。'],
         4, '看连续性与嘴形', 'seedance-single-shot-mouth-sequence.jpg'),
        ('chatart-lipsync-repair', 'chatart-lipsync-repair-rejected', 'Art MV 8 · 口型修复', '15:31', 100,
         '演唱 / 固定机位', .9995763964856342, True,
         ['原音保留，单镜头与人物连续性改善。',
          '第二句约 7.54 秒结束后，8.5、9.0、9.75 秒抽帧仍有嘴形开合；无人声间隔没有自然停下。',
          '演唱动作小且泛化，中文嘴形和情绪仍未通过。'],
         8.5, '看无人声处嘴形', 'chatart-lipsync-repair-mouth-sequence.jpg'),
    ]
    tests = []
    for key, file, title, time, cost, mode, corr, passed, findings, watch, label, evidence in configs:
        review = json.loads((PROJECT / 'assets' / (key + '-quality-review.json')).read_text('utf-8'))
        target = EXPERIMENTS / (file + '.mp4')
        shutil.copy2(INPUTS / target.name, target)
        assert sha256(target) == review['sha256']
        cap = cv2.VideoCapture(str(target))
        cap.set(cv2.CAP_PROP_POS_MSEC, 1200)
        ok, frame = cap.read()
        cap.release()
        assert ok
        cv2.imwrite(str(EXPERIMENTS / (file + '.jpg')), frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
        for name in [evidence, key + '-quality-review.json', key + '-audio-verification.json']:
            shutil.copy2(PROJECT / 'assets' / name, RESEARCH / name)
        tests.append({
            'id': key, 'title': title, 'submittedAt': time, 'date': '2026-10-10',
            'costDiamonds': cost, 'mode': mode, 'duration': review['videoDuration'],
            'width': review['width'], 'height': review['height'], 'sha256': review['sha256'],
            'localMedia': './assets/experiments/' + file + '.mp4',
            'poster': './assets/experiments/' + file + '.jpg', 'publicMedia': review['media'],
            'waveformCorrelation': corr, 'audioRetentionPassed': passed,
            'approvedForMV': False, 'includedInPlayer': False, 'findings': findings,
            'watchTime': watch, 'watchLabel': label, 'frameEvidence': './assets/research/' + evidence,
            'review': './assets/research/' + key + '-quality-review.json',
            'audioVerification': './assets/research/' + key + '-audio-verification.json',
        })
    original = EXPERIMENTS / 'opening-original.mp3'
    shutil.copy2(INPUTS / 'opening-10s.mp3', original)
    write_json(RESEARCH / 'experiment-log.json', {
        'date': '2026-10-10', 'status': 'three_pilots_completed_none_approved',
        'originalSongRange': [0, 10.3],
        'originalSongSha256': '580d151da7dac601330b0ce75347c19c947f9cf589a49ddf926a2795a83d57b2',
        'originalInputSha256': sha256(original), 'totalCostDiamonds': 320, 'newAccepted': 0,
        'fullMultisceneGenerationStarted': False,
        'measurementLimit': 'Waveform correlation verifies recording retention, not phoneme-to-mouth accuracy. ASR lyric boundaries are approximate.',
        'tests': tests,
    })
    print('原片与三轮实际样片已接入，文件哈希核对完成。')


if __name__ == '__main__':
    main()
