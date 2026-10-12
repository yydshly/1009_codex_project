import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '../../..');
const catalog = JSON.parse(await fs.readFile(path.join(repoRoot, 'projects.json'), 'utf8'));
const project = catalog.projects.find(p => p.id === '011' && p.slug === 'shipvideo');
if (!project?.summarySections?.length) throw new Error('011 项目的完整摘要不存在');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const filename = path.join(webRoot, 'public/index.html');
const original = await fs.readFile(filename, 'utf8');
const start = '<!-- UNDERSTANDING_SUMMARY:START -->';
const end = '<!-- UNDERSTANDING_SUMMARY:END -->';
if (!original.includes(start) || !original.includes(end)) throw new Error('缺少摘要生成区块');
const content = '<dl class="understanding-summary">\n' + project.summarySections.map(s => `        <div><dt>${escape(s.label)}</dt><dd>${escape(s.text)}</dd></div>`).join('\n') + '\n      </dl>';
const updated = original.slice(0, original.indexOf(start)+start.length) + '\n      '+content+'\n      ' + original.slice(original.indexOf(end));
await fs.writeFile(filename, updated, 'utf8');
console.log(`已从 projects.json 同步 ${project.summarySections.length} 项 ShipVideo 理解摘要，原始引导图保持不变。`);
