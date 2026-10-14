import { cp, lstat, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogFile = path.join(root, 'projects.json');
const readmeFile = path.join(root, 'README.md');
const start = '<!-- PROJECT_INDEX:START -->';
const end = '<!-- PROJECT_INDEX:END -->';
const statuses = {
  queued: '待研究', researching: '研究中', prototyping: '复现中', done: '已完成', archived: '已归档',
};
const repository = 'https://github.com/yydshly/1009_codex_project';
const pagesBase = 'https://yydshly.github.io/1009_codex_project';
const folder = (project) => `${project.id}-${project.slug}`;
const sourceLabel = (project) => project.sourceType === 'demonstration' ? '原始演示' : '原仓库';
const html = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const md = (value) => String(value).replace(/[\\`*_{}\[\]<>()#!|]/g, '\\$&');
const indexSummary = (project) => project.summarySections
  ? project.summarySections.map(({ label, text }) => `**${md(label)}：** ${md(text)}`).join('<br>')
  : md(project.summary);
const describedProjects = (projects) => projects.filter((project) => project.entryOverview);
const overviewReading = '每项按“能力 → 我们的研究 → 借鉴意义”阅读，点击名称继续了解项目；具体实验与未验证范围见各项目记录。';

function readmeOverview(projects) {
  const entries = describedProjects(projects);
  if (!entries.length) return [];
  return [
    `### ${entries.length}个项目研究概览`, '', overviewReading, '',
    ...entries.map((project) => {
      const { shortName, capability, research, value } = project.entryOverview;
      return `- **${project.id} · [${md(shortName)}](projects/${folder(project)}/)**：**能力：** ${md(capability)}；**研究：** ${md(research)}；**意义：** ${md(value)}。`;
    }), '', '### 详细索引', '',
  ];
}

function webOverview(projects) {
  const entries = describedProjects(projects);
  if (!entries.length) return '';
  return `<section class="research-overview" aria-labelledby="research-overview-title"><h2 id="research-overview-title">${entries.length}个项目研究概览</h2><p>${html(overviewReading)}</p><ol class="overview-list">${entries.map((project) => {
    const { shortName, capability, research, value } = project.entryOverview;
    return `<li><a href="#project-${project.id}"><strong>${project.id} · ${html(shortName)}</strong></a><p><b>能力：</b> ${html(capability)}；<b>研究：</b> ${html(research)}；<b>意义：</b> ${html(value)}。</p></li>`;
  }).join('')}</ol><a href="#detailed-projects">继续看研究文档与演示 ↓</a></section>`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function inside(parent, relative) {
  assert(typeof relative === 'string' && /^[a-zA-Z0-9_./-]+$/.test(relative), `无效相对路径：${relative}`);
  assert(!relative.split('/').some((segment) => segment === '..' || segment === '.git'), `禁止路径：${relative}`);
  const target = path.resolve(parent, relative);
  const offset = path.relative(parent, target);
  assert(offset && !offset.startsWith('..') && !path.isAbsolute(offset), `路径必须位于项目内：${relative}`);
  return target;
}

function textField(value, label, allowEmpty = false) {
  assert(typeof value === 'string' && !/[\r\n]/.test(value) && (allowEmpty || value.trim()), `${label} 必须是单行文本`);
}

function urlField(value, label, allowEmpty = false) {
  textField(value, label, allowEmpty);
  if (allowEmpty && value === '') return;
  const url = new URL(value);
  assert(url.protocol === 'https:' && !url.username && !url.password, `${label} 必须是 HTTPS 地址`);
}

function sourceField(value, type, label) {
  assert(['repository', 'demonstration'].includes(type), `${label} 的来源类型无效`);
  urlField(value, label);
  if (type === 'repository') assert(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(value), `${label} 必须是 GitHub 仓库地址`);
}

async function catalog() {
  const data = JSON.parse(await readFile(catalogFile, 'utf8'));
  assert(data.schemaVersion === 1 && Array.isArray(data.projects), 'projects.json 格式或 schemaVersion 不正确');
  const ids = new Set();
  for (const project of data.projects) {
    assert(project && typeof project.id === 'string' && /^\d{3}$/.test(project.id) && Number(project.id) > 0, '编号必须为 001–999');
    assert(!ids.has(project.id), `编号重复：${project.id}`);
    ids.add(project.id);
    assert(typeof project.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug), `无效 slug：${project.slug}`);
    for (const key of ['title', 'summary', 'previewCaption']) textField(project[key], `${project.id}.${key}`);
    if (project.entryOverview !== undefined) {
      assert(project.entryOverview && typeof project.entryOverview === 'object' && !Array.isArray(project.entryOverview), `${project.id}.entryOverview 必须包含简称、能力、研究与意义`);
      for (const key of ['shortName', 'capability', 'research', 'value']) textField(project.entryOverview[key], `${project.id}.entryOverview.${key}`);
    }
    if (project.summarySections !== undefined) {
      assert(Array.isArray(project.summarySections) && project.summarySections.length > 0, `${project.id}.summarySections 必须是非空数组`);
      for (const section of project.summarySections) {
        assert(section && typeof section === 'object', `${project.id}.summarySections 必须包含标签与说明`);
        textField(section.label, `${project.id}.summarySections.label`);
        textField(section.text, `${project.id}.summarySections.text`);
      }
    }
    textField(project.sourceRef, `${project.id}.sourceRef`, true);
    sourceField(project.source, project.sourceType ?? 'repository', `${project.id}.source`);
    urlField(project.demoUrl, `${project.id}.demoUrl`, true);
    assert(Object.hasOwn(statuses, project.status), `无效状态：${project.status}`);
    assert(Array.isArray(project.tags), `${project.id}.tags 必须是数组`);
    for (const tag of project.tags) textField(tag, `${project.id}.tags`);
    assert(typeof project.addedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(project.addedAt), `${project.id}.addedAt 必须是 YYYY-MM-DD`);
    const projectRoot = path.join(root, 'projects', folder(project));
    inside(projectRoot, project.preview);
    assert(/\.(svg|png|jpe?g|webp|gif)$/i.test(project.preview), `${project.id}.preview 必须是图片路径`);
    assert(project.pagesDir === null || typeof project.pagesDir === 'string', `${project.id}.pagesDir 必须是路径或 null`);
    if (project.pagesDir !== null) inside(projectRoot, project.pagesDir);
  }
  return { ...data, projects: data.projects.sort((a, b) => Number(a.id) - Number(b.id)) };
}

function indexBlock(projects) {
  if (!projects.length) return '暂未收录子项目。使用下方命令创建第一个研究项目，编号将从 `001` 开始。';
  const counts = Object.entries(statuses).map(([key, label]) => `${label} ${projects.filter((p) => p.status === key).length}`).join(' · ');
  const rows = projects.map((p) => {
    const local = `projects/${folder(p)}`;
    const demoUrl = p.demoUrl || (p.pagesDir !== null ? `${pagesBase}/${folder(p)}/` : '');
    const demo = demoUrl ? `[演示](${demoUrl})` : '—';
    return `| ${p.id} | [${md(p.title)}](${local}/) | ${indexSummary(p)} | ${statuses[p.status]} | ${p.tags.map(md).join(' / ') || '—'} | [${sourceLabel(p)}](${p.source}) | ${demo} |`;
  });
  const cards = projects.map((p) => {
    const local = `projects/${folder(p)}`;
    return `### ${p.id} · ${md(p.title)}\n\n${md(p.summary)}\n\n[研究文档](${local}/README.md) · [研究记录](${local}/research.md) · [${sourceLabel(p)}](${p.source})\n\n![${md(`${p.title}：${p.previewCaption}`)}](${local}/${p.preview})\n\n*${md(p.previewCaption)}*`;
  });
  return [`共收录 **${projects.length}** 个项目 · ${counts}`, '', ...readmeOverview(projects), '| 编号 | 子项目 | 研究摘要 | 状态 | 标签 | 来源 | Web |', '| --- | --- | --- | --- | --- | --- | --- |', ...rows, '', cards.join('\n\n')].join('\n');
}

async function renderedReadme(projects) {
  const content = await readFile(readmeFile, 'utf8');
  const first = content.indexOf(start);
  const last = content.indexOf(end);
  assert(first >= 0 && last > first && content.indexOf(start, first + start.length) < 0 && content.indexOf(end, last + end.length) < 0, 'README 索引标记缺失或重复');
  return `${content.slice(0, first + start.length)}\n${indexBlock(projects)}\n${content.slice(last)}`;
}

async function sync(data) {
  await writeFile(readmeFile, await renderedReadme(data.projects));
  console.log(`已同步 ${data.projects.length} 个项目的有序索引与预览图。`);
}

async function requireFile(file) {
  assert((await stat(file)).isFile(), `缺少文件：${path.relative(root, file)}`);
}

async function noSymlinks(directory) {
  assert(!(await lstat(directory)).isSymbolicLink(), `静态目录不允许符号链接：${directory}`);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), `静态目录不允许符号链接：${entry.name}`);
    if (entry.isDirectory()) await noSymlinks(path.join(directory, entry.name));
  }
}

async function check(data) {
  const known = new Set(data.projects.map(folder));
  for (const project of data.projects) {
    const projectRoot = path.join(root, 'projects', folder(project));
    for (const relative of ['README.md', 'research.md', 'web/README.md', project.preview]) await requireFile(inside(projectRoot, relative));
    if (project.pagesDir !== null) {
      const directory = inside(projectRoot, project.pagesDir);
      await requireFile(path.join(directory, 'index.html'));
      await noSymlinks(directory);
    }
  }
  for (const entry of await readdir(path.join(root, 'projects'), { withFileTypes: true })) {
    if (entry.isDirectory()) assert(known.has(entry.name), `未登记的子项目目录：projects/${entry.name}`);
  }
  assert((await readFile(readmeFile, 'utf8')) === await renderedReadme(data.projects), 'README 索引已过期，请执行 npm run index:sync');
  console.log(`校验通过：${data.projects.length} 个项目，编号、目录、预览图与索引一致。`);
}

async function copyTemplate(source, destination, replacements) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const input = path.join(source, entry.name);
    const output = path.join(destination, entry.name);
    if (entry.isDirectory()) await copyTemplate(input, output, replacements);
    else {
      const content = await readFile(input, 'utf8');
      await writeFile(output, content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        assert(Object.hasOwn(replacements, key), `未知模板字段：${key}`);
        return replacements[key];
      }));
    }
  }
}

async function newProject(data) {
  const { values } = parseArgs({ args: process.argv.slice(3), options: {
    slug: { type: 'string' }, title: { type: 'string' }, source: { type: 'string' },
    'source-type': { type: 'string', default: 'repository' },
    summary: { type: 'string' }, tags: { type: 'string', default: '' },
  } });
  for (const key of ['slug', 'title', 'source', 'summary']) textField(values[key], `--${key}`);
  textField(values.tags, '--tags', true);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug), '--slug 使用小写英文、数字和短横线');
  sourceField(values.source, values['source-type'], '--source');
  const number = Math.max(0, ...data.projects.map((p) => Number(p.id))) + 1;
  assert(number <= 999, '当前三位编号已用完，请扩展编号规则');
  const project = {
    id: String(number).padStart(3, '0'), slug: values.slug, title: values.title,
    summary: values.summary, source: values.source, sourceRef: '', status: 'queued',
    tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    addedAt: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date()),
    preview: 'assets/preview.svg', previewCaption: '预览占位图，研究完成后替换为实际截图。',
    demoUrl: '', pagesDir: null,
  };
  if (values['source-type'] !== 'repository') project.sourceType = values['source-type'];
  const destination = path.join(root, 'projects', folder(project));
  await mkdir(destination); // Refuse to overwrite any existing project.
  await copyTemplate(path.join(root, 'templates', 'project'), destination, {
    ...project, title: md(project.title), summary: md(project.summary),
  });
  data.projects.push(project);
  await writeFile(catalogFile, `${JSON.stringify(data, null, 2)}\n`);
  await sync(data);
  console.log(`已创建 projects/${folder(project)}，请填写研究记录并替换预览图。`);
}

async function buildPages(data) {
  await check(data);
  const output = path.resolve(root, '_site');
  // Validate the absolute deletion target before replacing generated output.
  assert(path.dirname(output) === root && path.basename(output) === '_site', '无效站点输出目录');
  try { assert(!(await lstat(output)).isSymbolicLink(), '_site 不允许是符号链接'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await rm(output, { recursive: true, force: true });
  await mkdir(output);
  const cards = [];
  for (const p of data.projects) {
    const local = folder(p);
    const projectRoot = path.join(root, 'projects', local);
    if (p.pagesDir !== null) await cp(inside(projectRoot, p.pagesDir), path.join(output, local), { recursive: true });
    const image = `${local}${path.extname(p.preview)}`;
    await mkdir(path.join(output, 'previews'), { recursive: true });
    await cp(inside(projectRoot, p.preview), path.join(output, 'previews', image));
    const demo = p.demoUrl || (p.pagesDir !== null ? `./${local}/` : '');
    cards.push(`<article id="project-${p.id}"><img src="./previews/${html(image)}" alt="${html(p.previewCaption)}"><div><p class="meta">${p.id} · ${statuses[p.status]}${p.tags.length ? ` · ${html(p.tags.join(' / '))}` : ''}</p><h2>${html(p.title)}</h2><p>${html(p.summary)}</p><nav><a href="${repository}/tree/main/projects/${local}">研究文档</a><a href="${html(p.source)}">${sourceLabel(p)}</a>${demo ? `<a href="${html(demo)}">打开演示 →</a>` : ''}</nav></div></article>`);
  }
  await writeFile(path.join(output, '.nojekyll'), '');
  await writeFile(path.join(output, 'index.html'), `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>GitHub 项目研究索引</title>
<style>body{margin:0;background:#f5f7fb;color:#172b4d;font:16px/1.7 system-ui,sans-serif}main{max-width:1000px;margin:auto;padding:56px 24px}h1{font-size:clamp(28px,5vw,44px);line-height:1.3}h2{margin:0;font-size:24px}a{color:#245bd6}header{margin-bottom:40px}.meta{color:#596c85;font-size:14px}.research-overview{background:white;border:1px solid #dce3ed;border-radius:16px;padding:28px;margin-bottom:40px}.overview-list{list-style:none;padding:0;margin:24px 0}.overview-list li{padding:16px 0;border-top:1px solid #e4e9f1}.overview-list p{margin:6px 0 0;font-size:15px}.overview-list b{color:#314c70}article{background:white;border:1px solid #dce3ed;border-radius:16px;overflow:hidden;margin:24px 0;display:grid;grid-template-columns:38% 1fr;scroll-margin-top:20px}article img{width:100%;height:100%;object-fit:contain;background:#edf2f8}article div{padding:24px}nav{display:flex;gap:20px;flex-wrap:wrap}a:focus-visible{outline:3px solid #245bd6;outline-offset:4px}@media(max-width:640px){article{grid-template-columns:1fr}article img{max-height:240px}main{padding:32px 18px}.research-overview{padding:20px}}</style></head>
<body><main><header><p class="meta">GITHUB RESEARCH · ${data.projects.length} 个项目</p><h1>GitHub 项目研究索引</h1><p>从代码库与参考演示研究视频制作、3D网页、设计方法和Agent协作。先看能力与研究概览，再进入具体项目。</p><a href="${repository}">查看总仓库 →</a></header>${webOverview(data.projects)}<section id="detailed-projects" aria-labelledby="detailed-projects-title"><h2 id="detailed-projects-title">研究文档与演示</h2>${cards.join('\n') || '<p>暂未收录项目，研究记录与演示将在这里按编号展示。</p>'}</section></main></body></html>\n`);
  console.log(`站点已汇总到 _site/：${data.projects.filter((p) => p.pagesDir !== null).length} 个本地 Web 演示。`);
}

try {
  const command = process.argv[2];
  const data = await catalog();
  if (command === 'new') { await check(data); await newProject(data); }
  else if (command === 'sync') await sync(data);
  else if (command === 'check') await check(data);
  else if (command === 'pages') await buildPages(data);
  else throw new Error('用法：node scripts/repo.mjs <new|sync|check|pages>');
} catch (error) {
  console.error(`错误：${error.message}`);
  process.exitCode = 1;
}
