import{readFile,stat}from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../web');
const files=['index.html','demo.html','lab/styles/style-explorer.html','lab/layouts/style-explorer.html','lab/layouts/queue.html','lab/layouts/grid.html','lab/layouts/reading.html'];
let checked=0;for(const name of files){const file=path.join(root,name),text=await readFile(file,'utf8');for(const m of text.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/g)){const ref=m[1];if(/^(?:#|https?:|data:|javascript:)/.test(ref))continue;const target=path.resolve(path.dirname(file),ref.split(/[?#]/)[0]);if(!target.startsWith(root+path.sep))throw Error('越界资源 '+ref);if(!(await stat(target)).isFile())throw Error('缺少资源 '+ref);checked++;}}
const snapshot=JSON.parse(await readFile(path.join(root,'assets/projects-snapshot.json'),'utf8'));if(!snapshot.projects.some(p=>p.slug==='oil-ui'&&p.sourceRef))throw Error('真实项目快照缺少研究版本');
const index=await readFile(path.join(root,'index.html'),'utf8');
const pages=[...index.matchAll(/\bdata-page="([^"]+)"/g)].map(m=>m[1]);
if(pages.length!==new Set(pages).size)throw Error('重复研究章节');
const nav=index.match(/<nav id="nav"[\s\S]*?<\/nav>/)?.[0]||'';
for(const name of pages)if(!nav.includes(`href="#${name}"`))throw Error('章节缺少导航 '+name);
for(const m of nav.matchAll(/href="#([^"]+)"/g))if(!pages.includes(m[1]))throw Error('导航目标不存在 '+m[1]);
const publication=JSON.parse(await readFile(path.join(root,'assets/publication.json'),'utf8'));if(!Array.isArray(publication.checks)||!publication.sourceRef)throw Error('发布记录缺少依据');
if(!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.snapshotDate))throw Error('快照日期格式错误');
console.log(`静态入口与本地资源校验通过：${files.length} 个 HTML，${checked} 个资源引用，${snapshot.projects.length} 个真实项目。`);
console.log(`研究导航一致：${pages.length} 个章节；发布依据与快照日期有效。`);
