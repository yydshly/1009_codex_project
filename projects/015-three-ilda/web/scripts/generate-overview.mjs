import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';

// One self-contained vector poster. Embedded photographs remain the original bytes.
// Stock Node generates SVG; an optional local sharp module exports the matching PNG.
const assets = new URL('../../assets/', import.meta.url);
const W = 1920, H = 3780;
const c = { bg: '#081411', panel: '#10241b', line: '#315144', ink: '#e6efe8', muted: '#a9bfb2', green: '#c3f4b2', cyan: '#8adbc7', gold: '#edca90' };
const directions = [
  ['舞台工具', ['方案对比评审', '云端保存交付', '多人共同搭建', '设备与构件插件']],
  ['节目创作与管理', ['ILDA 素材库', '文字 / Logo 成光', '图形与动画编辑', '节奏与时间线编排']],
  ['音乐演出', ['原创虚拟歌手', 'AI 演唱会', '互动听歌空间', '授权音乐纪念展']],
  ['戏剧与传统表演', ['二人转', '皮影戏', '戏曲与话剧', '诗歌与故事演绎']],
  ['品牌与活动', ['产品发布会', '品牌快闪', '展会展台', '活动方案预览']],
  ['产品与电商', ['三维产品展厅', '部件拆解讲解', '产品选配展示', '导购与答疑']],
  ['教育与培训', ['讲义与课堂', '设备结构教学', '科学原理演示', '企业培训']],
  ['工业与设备', ['设备三维讲解', '操作流程训练', '流程与产线展示', '设备数据接入']],
  ['文化与博物馆', ['数字博物馆', '非遗主题展', '历史故事空间', '作品生涯展']],
  ['互动与游戏', ['节奏互动', '剧情探索', '观众投票', '应援与互动装置']],
  ['直播与线上活动', ['直播视觉舞美', '远程发布直播', '多人线上活动', '虚拟会展']],
  ['创意视觉与数据', ['音乐可视化', '生成艺术', '数据光效', '网页品牌视觉']],
  ['AI 内容与助手', ['舞台与分镜建议', '讲解脚本生成', '素材检索与编排', '角色对话与答疑']],
  ['XR 与空间媒介', ['VR 展览', 'AR 产品讲解', 'WebXR 观演', '空间装置互动']],
  ['硬件与工程', ['真实激光适配', '灯光控制联动', '现场效果预演', '传感器触发']],
  ['资产与服务生态', ['模板与节目市场', '模型与角色插件', '定制方案服务', '项目交付与协作']],
];
const xml = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const out = [];
function rect(x, y, w, h, fill = c.panel, stroke = c.line, rx = 0) { out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`); }
function text(x, y, value, size = 28, fill = c.ink, weight = 400, extra = '') { out.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${extra}>${xml(value)}</text>`); }
function line(x1, y1, x2, y2, stroke = c.line, width = 2) { out.push(`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}"/>`); }
function arrow(x, y, width = 34, color = c.green) { out.push(`<path d="M${x} ${y}h${width}m-11 -8l11 8-11 8" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>`); }
async function photo(name, x, y, width, height) {
  const bytes = await readFile(new URL(name, assets));
  out.push(`<image x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" href="data:image/jpeg;base64,${bytes.toString('base64')}"/>`);
  rect(x, y, width, height, 'none', c.line);
}

rect(0, 0, W, H, c.bg, c.bg);
text(80, 87, '015 / THREE-ILDA · 一图回顾', 24, c.cyan, 600);
rect(1554, 54, 286, 54, c.panel, c.green, 3);
text(1697, 91, '阶段研究完成 · 按需启用', 22, c.green, 500, 'text-anchor="middle"');
text(80, 173, '从激光效果，到可扩展舞台', 65, c.ink, 600);
text(80, 233, '库把坐标变成光；我们把光放进舞台；内容业务决定舞台讲什么。', 31, c.muted);
text(80, 293, '22 节目（18 上游 + 4 原创）  /  5 套模板  /  3 种业务  /  002 模型复用', 26, c.green);
line(80, 323, 1840, 323);

text(80, 380, '01  库的核心价值：实现可控制、可嵌入的激光效果', 37, c.green, 600);
text(1840, 377, '上游能力 · 已验证', 23, c.cyan, 500, 'text-anchor="end"');
await photo('preview.jpg', 80, 410, 704, 439);
text(80, 882, '实际光之花 / 初版 WebGL 2 实验台', 23, c.muted);
text(844, 465, 'three-ilda = 激光效果组件', 47, c.ink, 600);
text(844, 517, '复用解析、扫描、轨迹与光效，嵌入 Three.js 场景。', 27, c.muted);
const pipeline = [
  ['ILDA 文件', '坐标 / 颜色 / 关光'],
  ['扫描模拟', '按点率推进轨迹'],
  ['实时光效', '残影 / 辉光 / 光束'],
];
pipeline.forEach(([title, subtitle], i) => {
  const x = 844 + i * 338;
  rect(x, 553, 306, 128);
  text(x + 18, 601, title, 31, c.green, 500);
  text(x + 18, 643, subtitle, 23, c.muted);
  if (i < 2) arrow(x + 312, 617, 19, c.cyan);
});
text(844, 738, '文件提供图案，代码实时生成画面。', 31, c.ink, 500);
text(844, 788, '可调：点率、跟随、残影、亮度、光束与节目。', 27, c.muted);
text(844, 835, '歌曲、演员、故事与整场演出由内容业务准备。', 27, c.muted);
line(80, 914, 1840, 914);

text(80, 971, '02  我们的方向：搭建可复用舞台，再接入内容业务', 37, c.green, 600);
const layers = [
  ['上游组件', '激光能力', ['ILDA 解析与扫描', '轨迹、辉光、空气光束', '嵌入场景、参数可控'], c.cyan],
  ['本地扩展', '舞台资产', ['台面、屏幕、设备、插槽', '模板 / 独立项目 / 版本', 'JSON 保存与效果绑定'], c.green],
  ['下游业务', '内容与编排', ['模型、角色、音频、讲义', '动作 / 镜头 / 屏幕文案', '独立时间线与交互脚本'], c.gold],
];
layers.forEach(([tag, title, points, accent], i) => {
  const x = 80 + i * 604;
  rect(x, 1012, 552, 248);
  line(x, 1013, x + 552, 1013, accent, 4);
  text(x + 24, 1053, tag, 23, accent, 500);
  text(x + 24, 1101, title, 36, c.ink, 600);
  points.forEach((point, n) => text(x + 24, 1152 + n * 38, point, 27, c.muted));
  if (i < 2) arrow(x + 562, 1133, 30, c.cyan);
});
text(80, 1310, '复用的价值：换内容时保留空间、设备和效果投入，也能接入以前研究过的三维内容。', 29, c.green, 500);
await photo('stage-entry-exhibit.jpg', 80, 1352, 1072, 670);
text(80, 2058, '实际三岛展台 / v4 配置 + 002 模型 + DOLPHIN、PLASMA2 激光', 23, c.muted);
text(1216, 1398, '同一份舞台，', 44, c.ink, 600);
text(1216, 1458, '三种业务实际运行。', 44, c.ink, 600);
text(1216, 1515, '三岛展台 · 海豚与流光 · v4', 28, c.green);
text(1216, 1561, '2 台激光 / 3 面屏幕 / 内容插槽', 27, c.muted);
const examples = [
  ['音乐演出 / 90 秒', '原创节奏、五段编排与镜头'],
  ['产品发布会 / 60 秒', '产品揭幕、结构展示与屏幕文案'],
  ['002 泵讲解 / 108 秒', '六部件、旋转展开、点选、屏幕同步'],
];
examples.forEach(([title, description], i) => {
  const y = 1625 + i * 128;
  line(1216, y, 1840, y);
  text(1216, y + 49, title, 32, c.cyan, 500);
  text(1216, y + 91, description, 25, c.muted);
});
rect(80, 2090, 1760, 74);
text(960, 2139, '空间与激光可复用；业务决定舞台讲什么。', 32, c.green, 500, 'text-anchor="middle"');

text(80, 2226, '03  其他产品方向：16 类探索，64 个场景或功能设想', 37, c.gold, 600);
text(80, 2273, '已有三个接入示例；下列方向是延伸设想，尚未完成产品与商业验证。', 27, c.muted);
directions.forEach(([title, items], i) => {
  const x = 80 + (i % 4) * 446, y = 2310 + Math.floor(i / 4) * 237;
  out.push(`<g data-direction="${xml(title)}">`);
  rect(x, y, 422, 217);
  text(x + 21, y + 44, `${String(i + 1).padStart(2, '0')}  ${title}`, 29, c.gold, 500);
  items.forEach((item, j) => text(x + 22, y + 88 + j * 35, `· ${item}`, 26, c.muted));
  out.push('</g>');
});
text(80, 3310, '04  有具体场景，再按需搭建和使用', 36, c.green, 600);
['明确场景', '搭台绑光', '另存 JSON', '接入业务', '预览验收'].forEach((title, i) => {
  const x = 80 + i * 356;
  rect(x, 3342, 336, 109);
  text(x + 19, 3378, `0${i + 1}`, 22, c.cyan);
  text(x + 168, 3425, title, 31, c.ink, 500, 'text-anchor="middle"');
  if (i < 4) arrow(x + 340, 3396, 12, c.green);
});
text(80, 3512, '商业路径（待验证）：工具订阅 · 模板 / 素材 · 定制方案 · 内容合作 · 接入服务', 27, c.gold);
text(80, 3573, '素材与内容：新节目、模型、音频、角色和剧本另行准备；真实人物相关内容需核实授权与合成标识。', 25, c.muted);
text(80, 3616, '技术边界：扫描为二维平面，光束与遮挡是视觉近似；真实输出、工程光学与现场控制需另接。', 25, c.muted);
text(80, 3659, '后续能力：AI、人物、云端协作、多人同步、XR 与硬件尚未实现；目标设备体验与商业需求按项目验证。', 25, c.muted);
line(80, 3700, 1840, 3700);
text(80, 3745, '015 / THREE-ILDA · 2026-10-10 · 上游 6044b91（MIT）· 效果图片为原始运行截图', 22, c.muted);
const desc = '库的价值是 ILDA 解析、扫描与实时激光效果。我们的方向是五套模板、独立项目、设备和内容插槽组成的可复用舞台。三种已接入业务为音乐、发布会和 002 泵结构讲解。探索方向：' + directions.map(([title, items]) => `${title}：${items.join('、')}`).join('；') + '。探索方向尚未完成产品与商业验证。';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc"><title id="title">Three ILDA：激光效果、舞台复用与产品探索一图总览</title><desc id="desc">${xml(desc)}</desc><g font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif">${out.join('\n')}</g></svg>\n`;
await writeFile(new URL('research-overview.svg', assets), svg);
console.log(`SVG 已生成：${fileURLToPath(new URL('research-overview.svg', assets))} · ${W}×${H} · ${directions.length} 类 / ${directions.flatMap(entry => entry[1]).length} 个设想`);
const sharpIndex = process.argv.indexOf('--sharp-module');
if (sharpIndex >= 0) {
  const { default: sharp } = await import(pathToFileURL(process.argv[sharpIndex + 1]).href);
  const fontIndex = process.argv.indexOf('--font-file');
  if (fontIndex >= 0) await sharp({ text: { text: '激光效果', font: 'Microsoft YaHei 20', fontfile: process.argv[fontIndex + 1] } }).png().toBuffer();
  const png = new URL('research-overview.png', assets);
  const info = await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(png));
  console.log(`PNG 已生成：${fileURLToPath(png)} · ${info.width}×${info.height}`);
}
