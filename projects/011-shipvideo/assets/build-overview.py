"""Create the original ShipVideo overview as SVG + PNG; Pillow is needed for export."""
from pathlib import Path
from html import escape
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
W, H = 2160, 3552
PAPER, INK, GREEN, MUTED = '#f6f5f0', '#233b2e', '#194d3c', '#667765'
LINE, PALE, LIME, WHITE = '#d6ded0', '#edf2e8', '#daf28c', '#ffffff'
FONT = Path('C:/Windows/Fonts/msyh.ttc')
BOLD = Path('C:/Windows/Fonts/msyhbd.ttc')
if not FONT.exists():
    raise SystemExit('Set FONT to an installed Simplified Chinese font before exporting.')
canvas = Image.new('RGB', (W, H), PAPER)
draw = ImageDraw.Draw(canvas)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
       '<title>ShipVideo：能力、原理、效果、输入输出、价值边界与流程借鉴</title>',
       '<desc>原创中文研究说明图，依据固定提交 53d7c6f。关键帧是绘制示意；未实测上游生成或业务收益。对我们当前仅借鉴读取信息、编排内容、写动画代码、稳定渲染的流程。</desc>',
       f'<rect width="{W}" height="{H}" fill="{PAPER}"/>']
fonts = {}

def font(size, bold=False):
    key = (size, bold)
    if key not in fonts:
        fonts[key] = ImageFont.truetype(str(BOLD if bold and BOLD.exists() else FONT), size)
    return fonts[key]

def rect(x, y, width, height, fill=WHITE, stroke=LINE, radius=20):
    draw.rounded_rectangle((x, y, x+width, y+height), radius, fill=fill, outline=stroke, width=2)
    svg.append(f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')

def line(x1, y1, x2, y2, color=LINE, width=2):
    draw.line((x1, y1, x2, y2), fill=color, width=width)
    svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"/>')

def label(x, y, value, size=28, color=INK, bold=False):
    if draw.textlength(value, font=font(size, bold)) > W-x-70:
        raise ValueError('Text exceeds canvas: '+value)
    draw.text((x, y), value, font=font(size, bold), fill=color, anchor='lt')
    svg.append(f'<text x="{x}" y="{y+size*.87:.2f}" fill="{color}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}">{escape(value)}</text>')

def paragraph(x, y, value, width, size=28, color=MUTED, bold=False, spacing=13):
    rendered = []
    for explicit in value.split('\n'):
        current = ''
        for char in explicit:
            if current and draw.textlength(current+char, font=font(size, bold)) > width:
                rendered.append(current)
                current = char
            else:
                current += char
        rendered.append(current)
    for i, value_line in enumerate(rendered):
        label(x, y+i*(size+spacing), value_line, size, color, bold)
    return y+len(rendered)*(size+spacing)

def section(x, y, number, title):
    rect(x, y, 52, 48, GREEN, GREEN, 10)
    label(x+10, y+10, number, 25, LIME, True)
    label(x+72, y+4, title, 37, GREEN, True)

def bullet(x, y, value, width, size=28):
    draw.ellipse((x, y+12, x+8, y+20), fill=GREEN)
    svg.append(f'<circle cx="{x+4}" cy="{y+16}" r="4" fill="{GREEN}"/>')
    return paragraph(x+24, y, value, width-24, size)

def arrow(x, y, color=GREEN):
    line(x-16, y, x+15, y, color, 3)
    points = [(x+15, y), (x+4, y-8), (x+4, y+8)]
    draw.polygon(points, fill=color)
    svg.append(f'<polygon points="{x+15},{y} {x+4},{y-8} {x+4},{y+8}" fill="{color}"/>')

# Title and explicit adoption scope.
label(96, 78, '011  /  GITHUB 项目研究  /  自动制片流程', 25, MUTED, True)
label(96, 133, 'ShipVideo｜网页信息 → 代码短片', 76, GREEN, True)
label(98, 240, 'diggerhq/shipvideo · 产品名 LaunchVideo · 研究基线 53d7c6f', 28, MUTED)
rect(96, 302, 1968, 232, GREEN, GREEN, 24)
label(136, 332, '对我们的意义', 26, LIME, True)
label(136, 377, '仅借鉴自动制片流程', 53, WHITE, True)
label(136, 461, '读取信息 → 编排内容 → 写动画代码 → 稳定渲染', 37, LIME, True)

# 01 Inputs.
section(96, 582, '01', '输入｜网址或文字简报')
label(850, 595, '定位：自动制作解释素材的技术组件', 27, MUTED)
rect(96, 648, 960, 334)
rect(1104, 648, 960, 334)
label(132, 681, '公开网页 URL', 39, GREEN, True)
paragraph(132, 746, '页面文字、标题、描述、标题层级\n颜色与字体线索', 880, 30)
line(132, 849, 1016, 849)
paragraph(132, 877, '不执行页面 JS；不登录\n不自动录制真实操作', 880, 28)
label(1140, 681, '文字提示词 ≤ 2000 字符', 39, GREEN, True)
paragraph(1140, 746, '受众、已核实能力、实际流程\n语言、时长、限制与行动目标', 880, 30)
line(1140, 849, 2024, 849)
paragraph(1140, 877, '当前表单不上传图片、视频或文档', 880, 28)

# 02 Four-stage engine, with narrower technical boxes.
section(96, 1034, '02', '原理｜AI 写代码，浏览器逐帧成片')
steps = [
    ('1 读取信息', 'web_fetch 获取\nHTML 文字与元数据'),
    ('2 编排内容', '导演 Agent（Opus）\n组织叙事与节奏\n目标 6–10 个段落'),
    ('3 写动画代码', '单份 HTML + CSS\nSVG / Canvas\n按时间定义画面'),
    ('4 稳定渲染', '虚拟时钟\nPlaywright / Chromium 截图\nFFmpeg 编码'),
]
for i, (title, body) in enumerate(steps):
    x = 96+i*504
    rect(x, 1100, 456, 265, PALE, LINE)
    label(x+27, 1132, title, 34, GREEN, True)
    paragraph(x+27, 1193, body, 402, 27, spacing=13)
    if i < 3:
        arrow(x+480, 1230)
rect(96, 1390, 1968, 128, '#e6ebdb', '#d5dec8', 14)
label(126, 1417, 'check_scene：错误与可见文字检查；不等于事实核验或完整视觉评审。', 29, GREEN)
label(126, 1470, '可控的是同一份代码的时间状态；模型重新创作仍有变化。', 27, MUTED)
label(98, 1552, 'OpenComputer 会话提供 Agent 与运行环境；前端负责提交、状态和下载。', 27, MUTED)

# 03 capabilities and 04 schematic output frames.
rect(96, 1625, 960, 372)
rect(1104, 1625, 960, 372)
section(130, 1654, '03', '能力｜从资料到交付')
for i, value in enumerate(['提取页面信息', '组织短片叙事', '绘制文字、流程、图表与界面示意', '检查技术问题并修改', '编码 MP4 并提供签名下载']):
    bullet(137, 1737+i*46, value, 864, 29)
section(1138, 1654, '04', '效果｜文字与图形驱动')
for i, title in enumerate(['动态文字', '流程与数据', '界面示意']):
    x = 1140+i*296
    rect(x, 1734, 264, 144, GREEN, GREEN, 10)
    label(x+15, 1750, f'0{i+1} / 关键帧示意', 18, '#b8d3b0')
    if i == 0:
        label(x+25, 1791, '信息 → 解释', 27, LIME, True)
        label(x+26, 1836, '按节奏出现', 19, WHITE)
    elif i == 1:
        for j in range(3):
            rect(x+22+j*77, 1798, 57, 37, LIME if j == 1 else '#3a6b52', '#94b782', 7)
            if j < 2:
                arrow(x+88+j*77, 1816, LIME)
    else:
        rect(x+24, 1786, 216, 69, '#f1f5e5', '#f1f5e5', 6)
        line(x+45, 1804, x+215, 1804, '#bacaaa', 3)
        line(x+45, 1823, x+134, 1823, '#bacaaa', 3)
        rect(x+157, 1816, 65, 20, '#c9df97', '#c9df97', 4)
    label(x+46, 1894, title, 25, GREEN, True)
label(1140, 1940, '代码绘制示意 · 非上游实际成片', 26, MUTED)

# 05 Deliverables and 06 boundaries.
rect(96, 2037, 960, 440)
rect(1104, 2037, 960, 440)
section(130, 2066, '05', '输出｜横屏静音 MP4')
label(136, 2149, 'H.264 · 1920×1080 · 默认 30 fps · 静音', 29, GREEN, True)
paragraph(136, 2206, '导演目标 20–40 秒\n工具支持 3–90 秒、24 / 30 fps', 870, 28)
paragraph(136, 2310, '会话工作区 videos/<job>.mp4 → 签名下载', 870, 27)
paragraph(136, 2384, 'HTML 动画为中间产物\n当前交付 API 不返回可编辑项目', 870, 27)
section(1138, 2066, '06', '当前边界｜采用前要知道')
boundaries = ['静态抓取不能完整理解产品', '事实与质量仍需人工核实', '当前未接入配音、音乐和竖屏', '当前不接收真实录屏或外部媒体素材', '完整生成依赖后端与运行服务']
for i, value in enumerate(boundaries):
    bullet(1144, 2149+i*45, value, 870, 27)
line(1140, 2391, 2024, 2391)
label(1140, 2417, '当前未使用 Remotion 或 HeyGen。', 29, GREEN, True)

# 07 conditional value; indicators are hypotheses, not achieved results.
rect(96, 2517, 1968, 420, PALE, LINE)
section(130, 2546, '07', '价值｜特定内容任务才可能成立')
label(136, 2627, '制作价值', 31, GREEN, True)
paragraph(136, 2678, '重复讲解、持续更新、批量制作解释素材\n指标：每条可用成片的总工时与总成本', 890, 28)
label(1140, 2627, '潜在业务用途（应用推导）', 31, GREEN, True)
paragraph(1140, 2678, '产品发布、销售解释、新功能通知、技术讲解\n指标：有效试用、预约、功能使用', 890, 28)
line(136, 2776, 2024, 2776)
paragraph(136, 2805, '没有明确受众、分发渠道和行动入口，新增 MP4 的业务价值通常有限。', 1888, 30, GREEN, True)
label(136, 2875, '总成本含模型、运行、审核、返工和渠道适配；播放量只是过程指标。', 27, MUTED)

# 08 Adoption conclusion, deliberately dominant and repeated.
rect(96, 2977, 1968, 352, GREEN, GREEN, 24)
label(136, 3011, '08 / 我们当前只借鉴这条流程', 33, LIME, True)
chain = [('读取信息', '已核实资料'), ('编排内容', '结构化叙事'), ('写动画代码', '可控画面'), ('稳定渲染', '按帧导出')]
for i, (title, note) in enumerate(chain):
    x = 136+i*485
    label(x, 3075, title, 40, WHITE, True)
    label(x, 3137, note, 28, '#c8dfba')
    if i < 3:
        arrow(x+413, 3095, LIME)
label(136, 3195, '用于理解和复用自动制片方法；当前不作为已验证的业务方案。', 30, LIME, True)
paragraph(136, 3250, '后续若需要：中文模板、视觉评审、成本记录、音频、竖屏、真实素材与批量队列，均需另行开发。', 1888, 25, '#c8dfba', spacing=10)

# Provenance and verification scope.
label(98, 3371, '源码基线：53d7c6f · 说明图制作：2026-10-10 · 原创代码绘制', 27, MUTED)
label(98, 3420, '源码静态研究；未运行上游生成，未实测质量、费用、速度或业务收益。', 27, MUTED)
label(98, 3470, '依据：agent.ts / web.ts / scene.ts / renderer.ts / jobs API', 26, MUTED)

svg.append('</svg>')
(OUT / 'overview-infographic.svg').write_text('\n'.join(svg), encoding='utf-8')
canvas.save(OUT / 'overview-infographic.png', optimize=True)
print(f'Created overview-infographic.svg + overview-infographic.png ({W}x{H})')
