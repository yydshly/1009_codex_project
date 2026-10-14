"""Render the local stage retrospective as a readable static document."""
from pathlib import Path
import html
import re

PUBLIC = Path(__file__).resolve().parents[1] / 'web/public'
SOURCE = PUBLIC / 'assets/records/stage-retrospective.md'


def inline(text):
    text = html.escape(text)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)',
                  lambda m: '<a href="' + html.escape(
                      'assets/records/' + m[2], quote=True) + '">' + m[1] + '</a>', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    return re.sub(r'`([^`]+)`', r'<code>\1</code>', text)


def render(lines):
    parts = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        heading = re.match(r'^(#{1,3}) (.+)$', line)
        if heading:
            level = len(heading[1])
            anchors = {title: spec[0] for title, spec in SECTIONS.items()}
            anchor = ' id="' + anchors[heading[2]] + '"' if heading[2] in anchors else ''
            parts.append(f'<h{level}{anchor}>{inline(heading[2])}</h{level}>')
            i += 1
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                cells = [cell.strip() for cell in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', cell) for cell in cells):
                    rows.append(cells)
                i += 1
            parts.append('<div class="document-table"><table><thead><tr>' +
                         ''.join('<th scope="col">' + inline(c) + '</th>' for c in rows[0]) +
                         '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(
                             '<td>' + inline(c) + '</td>' for c in row) + '</tr>'
                             for row in rows[1:]) + '</tbody></table></div>')
        elif re.match(r'^(?:- |\d+\. )', line):
            ordered = bool(re.match(r'^\d+\. ', line))
            tag = 'ol' if ordered else 'ul'
            items = []
            pattern = r'^\d+\. ' if ordered else r'^- '
            while i < len(lines) and re.match(pattern, lines[i].strip()):
                items.append('<li>' + inline(re.sub(pattern, '', lines[i].strip())) + '</li>')
                i += 1
            parts.append(f'<{tag}>' + ''.join(items) + f'</{tag}>')
        else:
            paragraph = [line]
            i += 1
            while i < len(lines) and lines[i].strip():
                paragraph.append(lines[i].strip())
                i += 1
            parts.append('<p>' + inline(' '.join(paragraph)) + '</p>')
    return '\n'.join(parts)


SECTIONS = {
    '如何指导 AI 开发同类项目': ('ai-development', '下一步做什么'),
    '一条样板应该怎样走': ('sample-route', '逐屏看样板'),
    '开发应按什么顺序交付': ('build-order', '拆成开发任务'),
    '给 AI 的下一轮任务书': ('next-brief', '直接用任务书'),
    '样板之后怎样补全内容': ('topic-expansion', '扩充主题'),
    '底层怎样支持持续扩展': ('shared-structure', '复用结构'),
    '如何扩展到其他地域': ('regional-expansion', '换一个地域'),
    '完成时照着这张清单操作': ('acceptance', '怎样验收'),
}


def split_sections(lines, marker):
    starts = [i for i, line in enumerate(lines) if line.startswith(marker)]
    return [lines[start:end] for start, end in zip(starts, starts[1:] + [len(lines)])]


def guide_section(section):
    title = section[0][3:]
    identity, label = SECTIONS[title]
    sub_start = next((i for i, line in enumerate(section) if line.startswith('### ')), len(section))
    out = f'<section class="guide-section" aria-labelledby="{identity}">'
    out += render(section[:sub_start])
    if sub_start < len(section):
        out += '<p class="open-hint">点开一项，查看画面、资料和完成条件。</p>'
    for i, block in enumerate(split_sections(section[sub_start:], '### ')):
        # Native disclosure works with keyboard, without adding a runtime dependency.
        opened = ' open' if i == 0 and identity == 'sample-route' else ''
        out += (f'<details class="step-card" name="{identity}"{opened}>'
                f'<summary>{inline(block[0][4:])}</summary>'
                '<div class="step-body">' + render(block[1:]) + '</div></details>')
    out += '<a class="back-top" href="#plan-start">回到开发路线 ↑</a></section>'
    return out


lines = SOURCE.read_text(encoding='utf-8').splitlines()
guide_start = lines.index('## 如何指导 AI 开发同类项目')
archive_start = lines.index('## 阶段保存与继续开发')
guides = split_sections(lines[guide_start:archive_start], '## ')
brief = next(section for section in guides if section[0] == '## 给 AI 的下一轮任务书')
(PUBLIC / 'assets/records/next-development-task.md').write_text(
    '# 新疆伊犁区域样板下一轮任务书\n\n' + '\n'.join(brief[1:]).strip() +
    '\n\n详细逐屏说明与验收：[开发指南](../../stage-review.html#sample-route)。\n', encoding='utf-8')

body = '''<header class="plan-hero" id="plan-start">
<p class="eyebrow">阶段反思 / 后续实施指南</p>
<h1>下一步，补两层细地图<br>让场景有清楚的来路</h1>
<p class="reading-intro">从已有新疆平台继续：以伊犁与察布查尔为样板，把区域地理、真实事件和地点场景接起来，再把这套方法用于其他地域。</p>
<p class="plan-status">以下是后续开发方案 · 当前3D版本仍按原归档保留</p>
<div class="status-grid">
<div><span>已有，继续使用</span><strong>地球、全域、场景与导演</strong><p>先检查现有能力，沿用操作和素材。</p></div>
<div><span>下一轮重点补</span><strong>区域细图与逐层返回</strong><p>每深入一层，都增加真实可读的地理细节。</p></div>
<div><span>有依据再展开</span><strong>历史聚落与具体活动</strong><p>先确认时间和位置，再决定模型细节。</p></div>
</div>
</header>'''
body += '<nav class="guide-links" aria-label="开发指南目录">' + ''.join(
    f'<a href="#{identity}">{label}</a>' for identity, label in SECTIONS.values()) + '</nav>'
body += '''<div class="product-structure" aria-label="产品结构示意">
<div><span>地图层级</span><p>地球 → 全域 → 区域 → 地点 → 活动</p></div>
<div><span>可选专题</span><p>位置与五带 / 自然条件 / 历史与文化</p></div>
<div><span>探索方式</span><p>自己操作 ↔ 自动导览 · 随时逐层返回</p></div>
</div>'''
body += ''.join(guide_section(section) for section in guides)
body += '<details class="retained-notes"><summary>查看阶段成果、早期反思与归档依据</summary>'
body += '<p>下列内容保留探索背景与既有成果；后续实施范围以本页上方的样板、任务和验收为准。</p>'
body += render(lines[2:guide_start] + lines[archive_start:]) + '</details>'

page = '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>新疆下一阶段开发与地域扩展指南</title>
<style>
:root{color-scheme:light;--ink:#213a34;--muted:#58685f;--line:#ccd6cc;--paper:#f6f5ee;--accent:#24634f}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:system-ui,"Microsoft YaHei",sans-serif;line-height:1.8}
a{color:var(--accent);text-underline-offset:4px}a:focus-visible,summary:focus-visible{outline:3px solid #ab6d22;outline-offset:5px}
.site-header{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;align-items:center;padding:16px max(22px,calc((100vw - 1100px)/2));background:#183d32;color:#f2f5ea}
.site-header a{color:inherit;text-decoration:none}.wordmark{font-weight:700}.site-header .header-action{font-size:14px}
.stage-document{max-width:1100px;margin:auto;padding:26px 28px 70px;font-size:17px}
.document-actions{display:flex;gap:12px 24px;flex-wrap:wrap;font-size:14px}.plan-hero{padding:34px 0 25px}
.eyebrow{color:var(--muted);font-size:13px;letter-spacing:1px}h1{font-size:42px;line-height:1.3;letter-spacing:-1px;margin:12px 0 24px}h2{font-size:26px;line-height:1.45;margin:0 0 22px;scroll-margin-top:24px}h3{font-size:20px}
p{margin:14px 0 20px}.reading-intro{font-size:19px;max-width:820px}.plan-status{font-size:13px;color:var(--muted)}
.status-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:24px}.status-grid>div{border:1px solid var(--line);border-radius:8px;padding:18px;background:#fffdf7}.status-grid span{display:block;font-size:12px;color:var(--muted);margin-bottom:8px}.status-grid strong{font-size:17px}.status-grid p{font-size:14px;line-height:1.65;margin-bottom:0}
.guide-links{display:flex;flex-wrap:wrap;gap:8px;padding:20px 0;border-block:1px solid var(--line)}.guide-links a{padding:6px 13px;background:#e5ecdf;border-radius:5px;text-decoration:none;font-size:14px}
.product-structure{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:26px 0;border-bottom:1px solid var(--line)}.product-structure span{font-size:13px;font-weight:700}.product-structure p{font-size:15px;margin:5px 0}
.guide-section{padding:40px 0 22px;border-bottom:1px solid var(--line)}.guide-section>p,.step-body>p{max-width:900px}.open-hint,.back-top{font-size:13px;color:var(--muted)}.back-top{display:inline-block;margin-top:15px}
.step-card{margin:10px 0;border:1px solid var(--line);border-radius:7px;background:#fffdf7;overflow:hidden}.step-card summary{padding:17px 20px;cursor:pointer;font-size:18px;font-weight:650;line-height:1.6}.step-card[open] summary{background:#e6eddf;border-bottom:1px solid var(--line)}.step-body{padding:6px 22px 14px}.step-body strong{color:#1f5d49}
li{margin:12px 0}ul,ol{padding-left:25px}code{font-size:.85em;overflow-wrap:anywhere}.document-table{overflow:auto;margin:22px 0}table{width:100%;border-collapse:collapse;min-width:560px;font-size:15px}th,td{border:1px solid var(--line);padding:13px;text-align:left;vertical-align:top}th{background:#e6eddf}
.retained-notes{margin-top:35px;font-size:14px}.retained-notes>summary{cursor:pointer;font-size:17px}.retained-notes h2{font-size:22px;margin-top:32px}.retained-notes h3{font-size:18px}.retained-notes table{font-size:13px}
@media(max-width:760px){.stage-document{padding:23px 20px 50px;font-size:16px}h1{font-size:31px}h2{font-size:23px}.status-grid{grid-template-columns:1fr;gap:10px}.status-grid>div{padding:13px 16px}.status-grid span{display:inline;margin-right:12px}.status-grid p{margin:6px 0 0}.product-structure{grid-template-columns:1fr;gap:12px;padding:20px 0}.product-structure p{margin:0}.reading-intro{font-size:17px}.step-card summary{font-size:17px;padding:15px}.step-body{padding:4px 16px 12px}.plan-hero{padding-top:22px}.guide-section{padding-top:32px}}
@media print{details:not([open])>.step-body{display:block}.document-actions,.guide-links,.back-top{display:none}.step-card{break-inside:avoid}body{background:white}}
</style></head><body>
<header class="site-header"><a class="wordmark" href="./stage-summary.html">◈ 新疆3D沙盘 · 阶段总结</a><a class="header-action" href="./?learn=world">打开现有3D平台 ↗</a></header>
<main class="stage-document"><nav class="document-actions" aria-label="指南资料"><a href="./stage-summary.html">阶段理解总图</a><a href="./assets/records/next-development-task.md" download>下载下一轮任务书</a><a href="./assets/records/stage-retrospective.md" download>下载完整指南</a><a href="./overview.html#archive">查看过程记录</a></nav>
''' + body + '</main></body></html>\n'
(PUBLIC / 'stage-review.html').write_text(page, encoding='utf-8')
print('Rendered implementation guide and task brief from the retrospective source.')
