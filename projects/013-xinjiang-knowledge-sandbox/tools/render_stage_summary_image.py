"""Render all ten retained summary branches as a standalone README PNG.

Uses Pillow and a CJK font. Content comes from stage-summary-source.html;
no browser, remote API, current selected branch or local preview is required.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PROJECT = Path(__file__).resolve().parents[1]
SOURCE = Path(__file__).with_name('stage-summary-source.html')
WIDTH, MARGIN = 2800, 90
CONTENT_WIDTH = WIDTH - MARGIN * 2
BG, INK, MUTED = '#f5f5ef', '#18392e', '#52675e'
GREEN, BLUE, AMBER = '#267957', '#386b96', '#a06824'
GROUPS = {
    'compare': ('对照参考与阶段成果', GREEN),
    'world': ('推荐认识主线：全球 → 自然 → 人文', BLUE),
    'structure': ('从认识路线变成可操作的平台', GREEN),
    'improve': ('从当前问题到下一次开发', AMBER),
}


class Poster:
    def __init__(self, font, bold):
        self.font_path, self.bold_path = font, bold
        self.fonts, self.ops, self.sections, self.boxes = {}, [], [], []
        self.measure = ImageDraw.Draw(Image.new('RGB', (1, 1)))
        self.y = 80

    def font(self, size, bold=False):
        key = (size, bold)
        if key not in self.fonts:
            self.fonts[key] = ImageFont.truetype(str(self.bold_path if bold else self.font_path), size)
        return self.fonts[key]

    def lines(self, text, width, size=32, bold=False):
        lines = []
        font = self.font(size, bold)
        # Microsoft YaHei lacks U+2194; two supported arrows keep the meaning.
        for paragraph in str(text).replace('↔', '←→').split('\n'):
            line = ''
            for char in paragraph:
                trial = line + char
                if line and self.measure.textlength(trial, font=font) > width:
                    # Keep closing punctuation attached to the preceding phrase.
                    if char in '，。；：、！？）》】」』':
                        prefix, tail = line[:-1], line[-1] + char
                        if prefix:
                            lines.append(prefix)
                        line = tail
                    else:
                        lines.append(line)
                        line = char
                else:
                    line = trial
            lines.append(line)
        return lines

    def rect(self, x, y, width, height, fill, radius=0, outline=None):
        self.ops.append(('rect', (x, y, x + width, y + height), fill, radius, outline))

    def rule(self, x1, y1, x2, y2, color='#d0dbd0', width=2):
        self.ops.append(('line', (x1, y1, x2, y2), color, width))

    def text(self, text, x, y, width, size=32, color=INK, bold=False, leading=None):
        leading = leading or round(size * 1.5)
        lines = self.lines(text, width, size, bold)
        for index, line in enumerate(lines):
            line_width = self.measure.textlength(line, font=self.font(size, bold))
            if line_width > width + 0.1:
                raise ValueError(f'Text exceeds its box: {line!r}')
            self.ops.append(('text', (x, y + index * leading), line, size, color, bold))
        height = len(lines) * leading
        self.boxes.append({'x': x, 'y': y, 'width': width, 'height': height})
        return height

    def paragraph(self, text, size=32, color=MUTED, bold=False):
        self.y += self.text(text, MARGIN, self.y, CONTENT_WIDTH, size, color, bold) + 18

    def group(self, label, color):
        self.y += 34
        self.rect(MARGIN, self.y, CONTENT_WIDTH, 76, color, 12)
        self.text(label, MARGIN + 26, self.y + 12, CONTENT_WIDTH - 52, 35, '#ffffff', True)
        self.y += 104

    def table(self, headers, rows):
        widths = [round(CONTENT_WIDTH * .20), round(CONTENT_WIDTH * .40)]
        widths.append(CONTENT_WIDTH - sum(widths))
        padding, x = 24, MARGIN
        header_height = max(len(self.lines(cell, w - padding * 2, 30, True))
                            for cell, w in zip(headers, widths)) * 45 + 40
        self.rect(MARGIN, self.y, CONTENT_WIDTH, header_height, '#dce8dd', 0)
        for cell, w in zip(headers, widths):
            self.text(cell, x + padding, self.y + 18, w - padding * 2, 30, INK, True)
            x += w
        self.y += header_height
        for index, row in enumerate(rows):
            row_height = max(len(self.lines(cell, w - padding * 2, 32, c == 0))
                             for c, (cell, w) in enumerate(zip(row, widths))) * 48 + 42
            self.rect(MARGIN, self.y, CONTENT_WIDTH, row_height,
                      '#ffffff' if index % 2 == 0 else '#eef2eb')
            x = MARGIN
            for c, (cell, w) in enumerate(zip(row, widths)):
                self.text(cell, x + padding, self.y + 21, w - padding * 2, 32,
                          INK if c == 0 else MUTED, c == 0)
                x += w
            self.y += row_height
            self.rule(MARGIN, self.y, MARGIN + CONTENT_WIDTH, self.y)
        self.y += 18

    def branch(self, number, identity, view):
        start = self.y
        self.text(f'{number:02d}', MARGIN, self.y + 3, 110, 42, GREEN, True)
        height = self.text(view['title'], MARGIN + 115, self.y, CONTENT_WIDTH - 115, 44, INK, True)
        self.y += height + 12
        self.paragraph(view['intro'], 32)
        self.table(view['headers'], view['rows'])
        for point in view['points']:
            self.text('•', MARGIN + 6, self.y, 32, 32, GREEN, True)
            self.y += self.text(point, MARGIN + 47, self.y, CONTENT_WIDTH - 47, 30, MUTED) + 14
        self.y += 32
        self.sections.append({'id': identity, 'title': view['title'], 'top': start, 'bottom': self.y,
                              'rows': len(view['rows']), 'notes': len(view['points'])})

    def cover(self):
        self.paragraph('013 / 新疆互动沙盘 · 阶段探索全量总结', 34, GREEN, True)
        self.paragraph('认识一个地方，先建立位置，再理解差异与联系', 60, INK, True)
        self.paragraph('供外部 README 独立阅读：参考呈现、已有能力、研究信息、问题、优化、AI任务与地域扩展。十个分支全部展开，无需点击。', 32)
        self.paragraph('运行基线 R90  ｜  总结与入口整理 R97–R99  ｜  整理日期 2026-10-14', 29)
        columns = [
            ('已有并阶段验证', '地球与全域定位、4主题52幕导演、15场景、自由操作、语音字幕、观察保存恢复。', GREEN),
            ('当前不足', '中间细地图、自然专题、真实故事过程、地点与场景联系、近景年代细节和统一表现。', AMBER),
            ('后续待实施', '全球—自然—人文内容组织；区域与聚落细图、共用事件节点、按需资源和地域注册。', BLUE),
        ]
        gap, w = 28, (CONTENT_WIDTH - 56) // 3
        h = 238
        for i, (title, text, color) in enumerate(columns):
            x = MARGIN + i * (w + gap)
            self.rect(x, self.y, w, h, '#ffffff', 12, '#d0dbd0')
            self.rect(x, self.y, 8, h, color, 0)
            self.text(title, x + 25, self.y + 20, w - 50, 34, color, True)
            self.text(text, x + 25, self.y + 83, w - 50, 30, MUTED)
        self.y += h + 35
        self.paragraph('价值主线：建立位置  →  看见差异  →  理解联系  →  自主观察', 37, GREEN, True)
        self.paragraph('空间层级：地球  ↔  全域  ↔  区域／河谷  ↔  县域／历史聚落  ↔  地点／活动', 33, INK, True)
        self.paragraph('区域与聚落独立细图是主要缺口。模型必须回答一个问题，并交代它位于哪里、属于何时、依据什么、如何返回。', 30)
        self.rule(MARGIN, self.y, MARGIN + CONTENT_WIDTH, self.y, GREEN, 4)

    def evidence(self):
        self.group('保留的演示能力：入口与范围先读清楚', BLUE)
        self.table(['能力范围', '保留的入口与内容', '可以怎样观察或操作'], [
            ['四主题自动导演', '张骞15幕、西域都护14幕、锡伯西迁14幕、一号冰川9幕，共52幕；讲解、地图、路线、模型与字幕按节点推进。',
             '暂停、缩放、自由接管、续播、返回地图；保存观察并恢复主题与参数。其他场景不因此都有独立导演或完整知识覆盖。'],
            ['地理底座 · 3场景', '地球、新疆立体地图、生态地点；地球国界与标签、邻近关系、历史方向、全域山盆格局与地点定位。',
             '旋转缩放、选地点、专题切换、视角与返回；生态光圈表示定位，不是保护区边界。区域与聚落细图仍待补。'],
            ['自然与原理 · 4场景', '天山天池、天山冰谷、雅丹演变、坎儿井剖面；真实局部影像高程与程序解释模型并存。',
             '切换真实地表与教学层；观察流向、冰体收支、风蚀演变、地下井渠水流；运行、暂停、参数试验与比较。'],
            ['历史与生活 · 7场景', '绿洲廊道、西迁方向、绿洲用水、集市交换、家庭与聚落、庭院传习、关口协作。',
             '控制路线进度、年代与过程；选择对象或方案，观察搬运、用水、安置、传习和协作回应。原创情境须与历史事实分开。'],
            ['独立动画实验 · 1场景', '荒漠行走、风沙与取水，保留此前美术和动画探索。与以上14场景合计15个工作场景。',
             '可以独立观察和操作；没有张骞对应路段的证据，不纳入默认历史导演，不当作真实行程或汉代环境复原。'],
        ])
        self.group('研究信息与证据边界：真实地表、历史资料、原创示意各自说明', GREEN)
        self.table(['研究对象', '已研究或采用的依据', '如何理解当前成果'], [
            ['参考演示', 'X / readyfor2025 原视频与留档画面、用户对五带、西风、气候、宗教等主题的观察。',
             '只对可见效果作分析；原产品GitHub源码、内部技术、许可证、数据精度尚未确认。不可当作已验证的开源库。'],
            ['地球与全域地表', 'NASA Blue Marble；AWS Terrain Tiles / Mapzen Terrarium高程，致谢USGS GMTED2010 / SRTM；本地Three.js实现。',
             '全域高程展示采样约2.5–3 km；固定范围数据用于空间认识。高度夸张、放大镜头不会增加原数据精度。'],
            ['天池与一号冰川', '局部高程展示采样约30–46 m；Sentinel-2 10 m真彩影像；冰川影像日期2023-08-31；影像与高程范围匹配。',
             '真实纹理已加载；教学流线未标定速度，冰体收支与缩退试验不是实测年度变化或未来预测。采样间距不是数据精度。'],
            ['张骞出使', '《史记·大宛列传》与中国国家博物馆介绍：出陇西、被扣留、大宛、康居、大月氏、大夏、返汉。',
             '未考定道路不画成准确行程；喀什集市属于跨时期交流情境；荒漠动画已移出默认历史导演，不能当作张骞真实路段。'],
            ['西域都护', '历史事件与节点资料，现代地理位置用于定位参照；原型保留机构、补给与联系的解释模型。',
             '现代轮台定位不等于乌垒城实测遗址；建筑、人物与机构流程不是已完成的汉代复原。'],
            ['锡伯西迁与水利', '国家民委与地方政府资料：1764–1766迁移安置、初期支流灌溉、19世纪初组织开渠、1808年初放水；传统服饰建筑形制。',
             '分期变化有依据；匿名人物、房屋布局、田块与渠线仍为解释性设计，不是同一家人42年传记或清代村落实测复原。'],
            ['声音、素材与留档', 'MiniMax生成普通话讲解、字幕及动作环境声；每轮源码、候选、截图、影片、声音与校验按SHA-256共享增量保存。',
             '原视频未复制为我们的旁白。凭据不留档；异机完整恢复需共享对象库。幕数、录音和材料积累不能代替知识与学习验收。'],
        ])
        self.paragraph('阅读顺序：README总图 → research.md研究记录 → 原视频与现有演示 → stage-summary.html详细总结 → stage-review.html下一轮任务与验收。', 32, INK, True)
        self.paragraph('来源入口：项目README、web/public/assets/data-sources.json、ATTRIBUTION.md、历史专题来源、R90运行记录与R97总图依据。原帖：x.com/readyfor2025/status/2108409664018977249', 28)
        self.paragraph('本图是研究总结与开发指导，不是界面截图，也不是原产品的官方架构。当前成果是可控探索原型；完整知识平台与跨地域通用引擎仍需开发和验证。', 31, AMBER, True)

    def image(self, top=0, bottom=None):
        bottom = bottom or self.y + 50
        image = Image.new('RGB', (WIDTH, int(bottom - top)), BG)
        draw = ImageDraw.Draw(image)
        for op in self.ops:
            if op[0] == 'text':
                _, (x, y), value, size, color, bold = op
                if y + size * 2 < top or y > bottom:
                    continue
                draw.text((x, y - top), value, font=self.font(size, bold), fill=color, anchor='lt')
            elif op[0] == 'rect':
                _, (x1, y1, x2, y2), fill, radius, outline = op
                if y2 < top or y1 > bottom:
                    continue
                draw.rounded_rectangle((x1, y1 - top, x2, y2 - top), radius=radius, fill=fill, outline=outline, width=2)
            elif op[0] == 'line':
                _, (x1, y1, x2, y2), color, width = op
                draw.line((x1, y1 - top, x2, y2 - top), fill=color, width=width)
        return image


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node', default='node')
    parser.add_argument('--font', type=Path, default=Path('C:/Windows/Fonts/msyh.ttc'))
    parser.add_argument('--bold-font', type=Path, default=Path('C:/Windows/Fonts/msyhbd.ttc'))
    parser.add_argument('--output', type=Path, default=PROJECT / 'assets/stage-summary-full.png')
    parser.add_argument('--report', type=Path)
    parser.add_argument('--qa-dir', type=Path)
    args = parser.parse_args()
    match = re.search(r'const views=(\{.*?\n    \});\n    const escape', SOURCE.read_text('utf-8'), re.S)
    if not match:
        raise ValueError('Cannot locate the retained ten-branch content')
    raw = subprocess.run([args.node, '--input-type=module'],
                         input='process.stdout.write(JSON.stringify(' + match[1] + '));',
                         text=True, encoding='utf-8', capture_output=True, check=True)
    views = json.loads(raw.stdout)
    if len(views) != 10:
        raise ValueError('All ten branches are required')
    poster = Poster(args.font, args.bold_font)
    poster.cover()
    for n, (identity, view) in enumerate(views.items(), 1):
        if identity in GROUPS:
            poster.group(*GROUPS[identity])
        poster.branch(n, identity, view)
    poster.evidence()
    final = poster.image()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    final.save(args.output, optimize=True)
    report = {
        'kind': 'complete-static-summary', 'source': 'tools/stage-summary-source.html',
        'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        'output': args.output.relative_to(PROJECT).as_posix(), 'size': final.size,
        'bytes': args.output.stat().st_size,
        'sha256': hashlib.sha256(args.output.read_bytes()).hexdigest(),
        'branches': poster.sections, 'totalRows': sum(len(v['rows']) for v in views.values()),
        'totalNotes': sum(len(v['points']) for v in views.values()),
        'contentMode': 'all branch titles, introductions, cells and notes; no selected-branch filtering',
        'extraEvidenceRows': 7, 'runtimeInventoryRows': 5, 'textBoxCount': len(poster.boxes),
        'minimumBodyFontPixels': 28,
        'textBoundsWithinCanvas': all(b['x'] >= 0 and b['x'] + b['width'] <= WIDTH and
                                     b['y'] >= 0 and b['y'] + b['height'] <= final.height
                                     for b in poster.boxes),
    }
    if not report['textBoundsWithinCanvas']:
        raise ValueError('Text exceeds the final canvas')
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if args.qa_dir:
        args.qa_dir.mkdir(parents=True, exist_ok=True)
        poster.image(0, poster.sections[0]['top']).save(args.qa_dir / 'cover.png')
        for section in poster.sections:
            poster.image(section['top'], section['bottom']).save(args.qa_dir / (section['id'] + '.png'))
        poster.image(poster.sections[-1]['bottom'], final.height).save(args.qa_dir / 'evidence.png')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
