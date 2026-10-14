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
            anchors = {'如何指导 AI 开发同类项目': 'ai-development',
                       '如何扩展到其他地域': 'regional-expansion'}
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


body = render(SOURCE.read_text(encoding='utf-8').splitlines())
page = '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>新疆三维知识平台阶段总结与后续设计</title><link rel="stylesheet" href="./overview.css">
<style>.stage-document{max-width:980px;margin:auto;padding:45px 24px 70px;font-size:14px;line-height:1.9}.stage-document h1{font-size:32px;margin:0 0 24px}.stage-document h2{font-size:24px;margin:45px 0 18px}.stage-document h3{font-size:18px;margin:28px 0 12px}.stage-document p{margin:15px 0}.stage-document a{text-decoration:underline;text-underline-offset:3px}.document-table{overflow-x:auto;margin:22px 0}.stage-document table{width:100%;border-collapse:collapse;min-width:620px;font-size:13px}.stage-document th,.stage-document td{padding:12px;border:1px solid #cbd2c5;text-align:left;vertical-align:top}.stage-document th{background:#e5eadf}.stage-document li{margin:10px 0}.stage-document code{font-size:12px}.stage-document .document-actions{display:flex;flex-wrap:wrap;gap:20px;border-bottom:1px solid #cbd2c5;padding-bottom:22px;margin-bottom:30px}@media(max-width:740px){.stage-document{padding:30px 20px}.stage-document h1{font-size:27px}.stage-document h2{font-size:22px}}</style></head>
<body><header class="site-header"><a class="wordmark" href="./overview.html#stage-review">◈ 新疆3D沙盘 <small>阶段探索归档</small></a><a class="header-action" href="./?learn=world">打开现有3D平台 ↗</a></header>
<main class="stage-document"><nav class="document-actions" aria-label="归档阅读"><a href="./overview.html#stage-review">返回阶段摘要</a><a href="./assets/records/stage-retrospective.md" download>下载设计说明</a><a href="./overview.html#archive">查看过程记录</a></nav>
''' + body + '</main></body></html>\n'
(PUBLIC / 'stage-review.html').write_text(page, encoding='utf-8')
print('Rendered stage-review.html from the single retrospective source.')
