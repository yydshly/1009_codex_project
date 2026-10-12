import { createHash } from 'node:crypto';

export const reference = '42ec7142a3da1dcce1846de8a3fc0b4891b4c8ae';
const repository = 'MartinDelophy/awesome-gpt-6-astra';
export const categories = [
  { id: 'action', name: '动作与街机', short: '动作街机' },
  { id: 'puzzle', name: '解谜与益智', short: '解谜益智' },
  { id: 'strategy', name: '策略与模拟', short: '策略模拟' },
  { id: 'rpg', name: 'RPG 与冒险', short: '角色冒险' },
  { id: 'racing', name: '平台跳跃与竞速', short: '跳跃竞速' },
  { id: 'experiment', name: '实验玩法与多人游戏', short: '实验与多人' },
];
const sourceBase = `https://github.com/${repository}/blob/${reference}/`;
const rawBase = `https://raw.githubusercontent.com/${repository}/${reference}/`;
function url(value, image = false) {
  try {
    const resolved = new URL(value, image ? rawBase : sourceBase);
    return ['https:', 'http:'].includes(resolved.protocol) && !resolved.username && !resolved.password ? resolved.href : null;
  } catch { return null; }
}
function text(markdown) {
  return markdown.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*\*|`|<br\s*\/?>/g, '').trim();
}
function links(markdown) {
  return [...markdown.matchAll(/(?<!!)\[([^\]]+)\]\(([^)\s]+)\)/g)].map(match => ({ label: text(match[1]), url: url(match[2]) })).filter(item => item.url);
}
export function parseCatalog(markdown) {
  const works = [];
  let category = null;
  let work = null;
  const lineNumbers = markdown.split(/\r?\n/);
  for (const [index, line] of lineNumbers.entries()) {
    if (line.startsWith('### ')) { category = categories.find(item => item.name === line.slice(4).trim()) || null; work = null; }
    else if (line.startsWith('## ')) { category = null; work = null; }
    const entry = line.match(/^- \*\*\[(.+?)\]\(([^)]+)\)\*\*\s*[—–-]\s*(.*)$/);
    if (entry && category) {
      const demoUrl = url(entry[2]);
      if (!demoUrl) throw new Error(`Invalid demo URL at line ${index + 1}`);
      work = { id: createHash('sha256').update(entry[1] + '\0' + demoUrl).digest('hex').slice(0, 12), order: works.length, name: text(entry[1]), description: text(entry[3]), category: category.id, categoryName: category.name, author: '', authorUrl: null, platform: '', model: '', modelLinks: [], resources: [], sourceLinks: [], imageUrl: null, imageAlt: '', entryUrl: `${sourceBase}README.zh-CN.md#L${index + 1}` };
      work.demoUrl = demoUrl;
      works.push(work);
      continue;
    }
    if (!work) continue;
    const metadata = line.match(/^\s+-\s+([^:：]+)[:：]\s*(.*)$/);
    if (!metadata) continue;
    const [, label, value] = metadata;
    if (/作者|创作者/.test(label)) { work.author = links(value)[0]?.label || text(value); work.authorNote = text(value); work.authorUrl = links(value)[0]?.url || null; }
    else if (/平台/.test(label)) work.platform = text(value);
    else if (/GPT.*Astra|模型参与/.test(label)) { work.model = text(value); work.modelLinks = links(value); }
    else if (/开发资料|资源/.test(label)) {
      work.resources = links(value);
      work.resourceText = text(value);
      work.sourceLinks = work.resources.filter(item => /源码|源代码|GitHub|source|单文件|HTML|运行说明/i.test(item.label));
    } else if (/预览|截图/.test(label)) {
      const image = value.match(/!\[([^\]]*)\]\(([^)\s]+)\)/);
      if (image) { work.imageUrl = url(image[2], true); work.imageAlt = text(image[1]); }
    }
  }
  const expected = Number(markdown.match(/目前收录\s*\*\*(\d+)/)?.[1]);
  if (!expected || works.length !== expected) throw new Error(`Catalogue incomplete: expected ${expected}, parsed ${works.length}`);
  if (new Set(works.map(work => work.id)).size !== works.length) throw new Error('Duplicate catalogue entries');
  for (const item of categories) if (!works.some(work => work.category === item.id)) throw new Error(`Missing category: ${item.name}`);
  for (const work of works) if (!work.author || !work.platform || !work.model) throw new Error(`Incomplete metadata: ${work.name}`);
  return { repository, reference, readmeUrl: `${sourceBase}README.zh-CN.md`, maintainedAt: markdown.match(/目录更新：\*\*(\d{4}-\d{2}-\d{2})/)?.[1], capturedAt: '2026-10-09', sourceSha256: createHash('sha256').update(markdown).digest('hex'), categories, works };
}
