"""Export the retained understanding map and derive its complete reading notes.

The fragment in stage-summary-source.html is the single authoring source.
Requires Node.js 22+ and the bundled Visualize exporter (or --renderer).
"""
import argparse
import html
import json
import re
import subprocess
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
PUBLIC = PROJECT / 'web/public'
SOURCE = Path(__file__).with_name('stage-summary-source.html')
BRIEF = Path(__file__).with_name('learning-value-summary.json')
DEFAULT_RENDERER = Path('D:/codex/home/plugins/cache/openai-bundled/visualize/1.0.49/skills/visualize/scripts/render.py')


def escaped(value):
    return html.escape(str(value), quote=True)


def reading_sections(views, brief):
    sections = []
    notes = ['# 新疆3D平台阶段总结与后续指导', '',
             '已有能力、当前问题与待实施方案分别阅读；原视频与现有演示继续保留。', '',
             '## 最值得复用的价值：' + brief['title'], '', brief['intro'], '']
    notes.extend('- **' + step['title'] + '**：' + step['content'] + ' ' + step['question'] for step in brief['steps'])
    notes.extend([''] + ['- **' + item['label'] + '**：' + item['text'] for item in brief['sections']] +
                 ['', brief['limits'], ''])
    for identity, view in views.items():
        sections.append('<section class="summary-branch" id="summary-' + identity + '"><h2>' +
                        escaped(view['title']) + '</h2><p>' + escaped(view['intro']) + '</p>' +
                        '<div class="summary-table"><table><thead><tr>' + ''.join(
                            '<th scope="col">' + escaped(value) + '</th>' for value in view['headers']) +
                        '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(
                            ('<th scope="row">' + escaped(value) + '</th>') if i == 0 else
                            ('<td>' + escaped(value) + '</td>') for i, value in enumerate(row)) +
                            '</tr>' for row in view['rows']) + '</tbody></table></div><ul>' +
                        ''.join('<li>' + escaped(point) + '</li>' for point in view['points']) +
                        '</ul></section>')
        notes.extend(['## ' + view['title'], '', view['intro'], '',
                      '| ' + ' | '.join(view['headers']) + ' |', '| --- | --- | --- |'])
        notes.extend('| ' + ' | '.join(row) + ' |' for row in view['rows'])
        notes.extend([''] + ['- ' + point for point in view['points']] + [''])
    notes.extend(['## 依据与继续阅读', '',
                  '- [原片留档抽帧比较](./r23-comparison-audit.md)：历史画面审阅，不当作当前全场景验收。',
                  '- [R90运行基线](./round-90.md)：已有能力与阶段检查范围。',
                  '- [R97总图整理](./round-97.md)：总图依据和表示范围。',
                  '- [后续开发指南](../../stage-review.html)：逐屏样板、任务书与验收。',
                  '- [原视频与成片](../../overview.html#watch)。',
                  '- [阶段总结网页](../../stage-summary.html)。', ''])
    return '\n'.join(sections), '\n'.join(notes)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--renderer', type=Path, default=DEFAULT_RENDERER)
    parser.add_argument('--node', default='node')
    args = parser.parse_args()
    if not args.renderer.is_file():
        parser.error('Visualize exporter unavailable; pass its render.py path with --renderer.')
    fragment = SOURCE.read_text('utf-8')
    match = re.search(r'const views=(\{.*?\n    \});\n    const escape', fragment, re.S)
    if not match:
        raise ValueError('Cannot locate the retained branch data.')
    result = subprocess.run([args.node, '--input-type=module'],
                            input='process.stdout.write(JSON.stringify(' + match[1] + '));',
                            text=True, encoding='utf-8', capture_output=True, check=True)
    views = json.loads(result.stdout)
    brief = json.loads(BRIEF.read_text('utf-8'))
    if len(views) != 10:
        raise ValueError('Expected all ten retained branches.')
    destination = PUBLIC / 'stage-summary.html'
    subprocess.run([sys.executable, '-X', 'utf8', str(args.renderer), str(SOURCE),
                    str(destination), '--force', '--title', '新疆3D平台阶段总结'], check=True)
    full_notes, markdown = reading_sections(views, brief)
    value_html = ('<section class="summary-value" id="core-value" aria-labelledby="core-value-title">' +
                  '<p class="summary-eyebrow">这次研究最值得带走的方法</p><h2 id="core-value-title">' +
                  escaped(brief['title']) + '</h2><p class="value-intro">' + escaped(brief['intro']) + '</p>' +
                  '<div class="value-steps">' + ''.join('<article><h3>' + str(i + 1) + ' / ' +
                  escaped(step['title']) + '</h3><p>' + escaped(step['content']) + '</p><p class="value-question">' +
                  escaped(step['question']) + '</p></article>' for i, step in enumerate(brief['steps'])) +
                  '</div><dl class="value-brief">' + ''.join('<div><dt>' + escaped(item['label']) +
                  '</dt><dd>' + escaped(item['text']) + '</dd></div>' for item in brief['sections']) +
                  '</dl><p class="value-limits">' + escaped(brief['limits']) + '</p></section>')
    page = destination.read_text('utf-8').replace('<html lang="en"', '<html lang="zh-CN"')
    page = page.replace('lang=&quot;en&quot;', 'lang=&quot;zh-CN&quot;')
    # The exporter keeps state persistence and the full diagram in its sandbox.
    # Project navigation and the complete printable notes belong to the outer page.
    navigation = '''
<a class="summary-skip" href="#summary-map">跳到理解总图</a>
<header class="summary-header" id="summary-start">
<div><p>新疆3D知识平台 · 阶段研究与开发方法</p><h1>全球认识 → 自然条件 → 人文联系</h1></div>
<nav aria-label="阶段总结导航"><a href="./?learn=world">3D演示首页 ↗</a><a href="./overview.html">项目总览</a><a href="./overview.html#watch">原视频与成片</a><a href="./?edition=r90&amp;director=glacier">四主题自动导演 ↗</a><a href="./stage-review.html">后续开发指南</a><a href="./overview.html#archive">过程记录</a></nav>
</header>
<main class="summary-main">
<section class="summary-state" aria-label="成果与方案范围">
<div><strong>已有能力</strong><p>地球与全域定位、四主题导演、自由操作、讲解字幕和观察记录。</p></div>
<div><strong>当前问题</strong><p>认识路径与内容深度不均衡，中间细地图、故事过程与画面联系仍需补足。</p></div>
<div><strong>后续指导</strong><p>全球认识 → 自然条件 → 人文联系；资料、地图、模型与操作共同解释问题。</p></div>
</section>
<div class="summary-reading" id="summary-map"><p>点选总图中的分支，查看具体对照与要求；也可展开下方全部说明。扩展方案属于待实施设计。</p><a href="#all-branches">阅读全部分支 ↓</a><a href="./assets/records/stage-summary-notes.md" download>下载完整总结</a><a href="../previews/013-xinjiang-knowledge-sandbox.png" target="_blank" rel="noopener">打开全量总结长图 ↗</a></div>
'''
    after = '''
<details class="summary-all" id="all-branches"><summary>阅读全部十个分支的详细说明</summary>
''' + full_notes + '''</details>
<section class="summary-evidence"><h2>依据与继续使用</h2><p>参考演示依据留档画面与用户观察；原产品的源码、完整交互与数据精度未确认。现有3D运行基线为R90；总图依据R97整理及当时的入口观察，后续方案尚未实现。</p><div><a href="./assets/records/r23-comparison-audit.md">原片留档画面比较</a><a href="./assets/records/round-90.md">运行基线与检查范围</a><a href="./assets/records/stage-retrospective.md">完整反思与资料边界</a><a href="./stage-review.html#next-brief">下一轮任务书</a></div></section>
</main>
<script>
// Opaque sandbox frames lose their transferred channel during history caching.
// A fresh shell restores the persisted branch and initializes the frame again.
window.addEventListener('pageshow', event => {
  if (event.persisted) window.location.reload();
});
</script>
'''
    css = '''<style>
body{padding:0!important;font-family:system-ui,"Microsoft YaHei",sans-serif}
.summary-header,.summary-main{max-width:1200px;margin:auto;padding:24px}
.summary-header{border-bottom:1px solid light-dark(#ced8ce,#445349)}
.summary-header p{margin:0 0 8px;font-size:14px;color:light-dark(#506258,#bdd0c2)}
.summary-header h1{margin:0 0 18px;font-size:28px;line-height:1.45}
.summary-header nav,.summary-reading,.summary-evidence>div{display:flex;gap:12px 22px;flex-wrap:wrap;align-items:center}
.summary-header a,.summary-main a{color:light-dark(#245e49,#a8d7bc);text-underline-offset:4px;font-size:15px}
.summary-value{padding:0 0 28px;margin-bottom:26px;border-bottom:1px solid light-dark(#ced8ce,#445349)}
.summary-eyebrow{color:light-dark(#245e49,#a8d7bc);font-size:14px;font-weight:600;margin:0 0 10px}
.summary-value h2{font-size:29px;line-height:1.5;margin:0 0 14px}.value-intro{font-size:17px;line-height:1.9;margin:0 0 22px}
.value-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:20px 0}
.value-steps article{padding:16px 18px;border:1px solid light-dark(#c7d6c9,#445349);border-top:4px solid light-dark(#3b785b,#9bcaac);border-radius:5px;background:light-dark(#eef3ec,#17271f)}
.value-steps article:nth-child(2){border-top-color:light-dark(#56849d,#9bc8db)}.value-steps article:nth-child(3){border-top-color:light-dark(#a8803c,#d4bb81)}
.value-steps h3{font-size:18px;margin:0 0 10px}.value-steps p{font-size:15px;line-height:1.8;margin:8px 0}.value-question{color:light-dark(#53685a,#b4c9bd)}
.value-brief{margin:24px 0}.value-brief>div{display:grid;grid-template-columns:100px 1fr;gap:18px;border-bottom:1px solid light-dark(#d4dfd3,#3d4e42);padding:12px 0;font-size:15px;line-height:1.9}
.value-brief dt{font-weight:600}.value-brief dd{margin:0}.value-limits{font-size:14px;line-height:1.8;color:light-dark(#67766d,#b4c9bd)}
.summary-state{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-bottom:20px}
.summary-state strong{font-size:17px}.summary-state p{font-size:15px;line-height:1.8;margin:8px 0}
.summary-reading{padding:16px 0;border-block:1px solid light-dark(#ced8ce,#445349);margin-bottom:20px}
.summary-reading p{flex-basis:100%;margin:0;font-size:15px;line-height:1.8}
#codex-visualization{max-width:100%;min-height:650px;scroll-margin-top:20px}
.summary-all{margin-top:26px;padding-top:20px;border-top:1px solid light-dark(#ced8ce,#445349)}
.summary-all>summary{cursor:pointer;font-size:18px;line-height:1.8}
.summary-branch{padding:26px 0;border-bottom:1px solid light-dark(#ced8ce,#445349);font-size:16px;line-height:1.9}
.summary-branch h2,.summary-evidence h2{font-size:22px;margin:10px 0}
.summary-table{overflow-x:auto}table{border-collapse:collapse;width:100%}th,td{padding:12px 10px;text-align:left;vertical-align:top;border-bottom:1px solid light-dark(#ced8ce,#445349)}
.summary-evidence{padding:28px 0;font-size:15px;line-height:1.8}
.summary-skip{position:absolute;left:12px;top:-80px}.summary-skip:focus{top:12px}
@media(max-width:640px){.summary-header,.summary-main{padding:20px}.summary-header h1{font-size:23px}.summary-state{grid-template-columns:1fr;gap:12px}.summary-state p{margin:4px 0}.summary-header nav{gap:10px 18px}.summary-branch{font-size:15px}th,td{padding:10px 7px}}
@media(max-width:640px){.summary-value h2{font-size:24px}.value-steps{grid-template-columns:1fr;gap:12px}.value-brief>div{grid-template-columns:1fr;gap:4px}.value-intro{font-size:16px}}
@media print{#codex-visualization,.summary-reading,.summary-header nav{display:none}.summary-all>section{display:block}.summary-state{grid-template-columns:repeat(3,1fr)}}
</style>'''
    page = page.replace('</head>', css + '\n</head>', 1)
    navigation = navigation.replace('<main class="summary-main">', '<main class="summary-main">' + value_html)
    page = page.replace('<body>', '<body>' + navigation, 1)
    # Only the outer closing body is literal; frame markup is escaped in data-srcdoc.
    at = page.rfind('</body>')
    page = page[:at] + after + page[at:]
    destination.write_text(page, encoding='utf-8', newline='\n')
    (PUBLIC / 'assets/records/stage-summary-notes.md').write_text(markdown, encoding='utf-8', newline='\n')
    print('Exported ten-branch summary and complete reading notes.')


if __name__ == '__main__':
    main()
